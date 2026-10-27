import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { ANCESTRIES, BUILDS, DEFAULT_LOOK, encodeLook, LOOK_FIELDS, optionCount } from '@trmnl-games/wardenwatch/art/look'
import { LookCreator, shuffledLook, stepLook } from '../../apps/web/src/lib/lookCreator'
import { lookMessages } from '../../apps/web/src/i18n/look'

const en = lookMessages.en

describe('stepLook', () => {
  it('wraps round each field in both directions', () => {
    expect(stepLook(DEFAULT_LOOK, 'hair', -1).hair).toBe(optionCount('hair', DEFAULT_LOOK) - 1)
    expect(stepLook({ ...DEFAULT_LOOK, hair: optionCount('hair', DEFAULT_LOOK) - 1 }, 'hair', 1).hair).toBe(0)
    expect(stepLook(DEFAULT_LOOK, 'tabard', 1)).toEqual({ ...DEFAULT_LOOK, tabard: 1 })
  })

  it('starts the build and head over when the ancestry changes, so they stay inside the new tables', () => {
    const ancestry = ANCESTRIES.findIndex((a) => BUILDS[a].length > 1)
    const look = stepLook({ ...DEFAULT_LOOK, ancestry, build: 1, head: 0, hair: 2 }, 'ancestry', 1)
    expect(look.ancestry).toBe((ancestry + 1) % ANCESTRIES.length)
    expect(look.build).toBe(0)
    expect(look.head).toBe(0)
    expect(look.hair).toBe(2)
  })
})

describe('shuffledLook', () => {
  it('draws every field inside its table for the ancestry drawn', () => {
    for (const seed of [0, 0.37, 0.5, 0.999]) {
      const look = shuffledLook(() => seed)
      for (const field of LOOK_FIELDS) expect(look[field], field).toBeLessThan(optionCount(field, look))
    }
  })
})

describe('LookCreator', () => {
  const markup = renderToStaticMarkup(createElement(LookCreator, { value: encodeLook(DEFAULT_LOOK), onChange: () => {}, name: 'heroLook', note: en.firstLook }))

  it('shows the preview and a chip for every pose', () => {
    expect(markup).toContain(`alt="${en.previewAlt}"`)
    for (const pose of Object.values(en.poses)) expect(markup).toContain(`>${pose}</button>`)
    expect(markup.match(/aria-pressed="true"/g)).toHaveLength(1)
  })

  it('labels every stepper row and its keys for a screen reader', () => {
    for (const field of LOOK_FIELDS) {
      expect(markup).toContain(`aria-label="${en.previous(en.fields[field])}"`)
      expect(markup).toContain(`aria-label="${en.next(en.fields[field])}"`)
    }
    expect(markup.match(/role="group" aria-labelledby=/g)).toHaveLength(LOOK_FIELDS.length)
  })

  it('carries the code in a hidden input for a plain form, and shows the note', () => {
    expect(markup).toContain('<input type="hidden" name="heroLook" value="v1.0000000"/>')
    expect(markup).toContain(en.firstLook)
  })

  it('marks the rows the renderer cannot draw yet instead of hiding them', () => {
    expect(markup).toContain(en.artComing)
    expect(markup).toContain(en.standIn)
  })

  it('leaves the hidden input out without a name', () => {
    expect(renderToStaticMarkup(createElement(LookCreator, { value: 'v1.0000000', onChange: () => {} }))).not.toContain('type="hidden"')
  })
})
