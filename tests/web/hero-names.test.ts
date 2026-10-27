import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { ANCESTRIES, DEFAULT_LOOK, encodeLook } from '@trmnl-games/wardenwatch/art/look'
import { HERO_NAME_RULE, validateName } from '@trmnl-games/platform'
import { suggestName } from '../../apps/web/src/lib/heroNames'
import { LookCreator } from '../../apps/web/src/lib/lookCreator'
import { lookMessages } from '../../apps/web/src/i18n/look'

describe('suggestName', () => {
  it('is deterministic per ancestry and seed', () => {
    for (const ancestry of ANCESTRIES) for (const seed of [0, 1, 7, 42]) expect(suggestName(ancestry, seed)).toBe(suggestName(ancestry, seed))
  })

  it('always passes the hero-name rule, for every people and the first hundred presses', () => {
    for (const ancestry of ANCESTRIES) {
      for (let seed = 0; seed < 100; seed++) {
        const name = suggestName(ancestry, seed)
        expect(validateName(name, HERO_NAME_RULE), `${ancestry} #${seed}: ${name}`).toEqual({ ok: true, value: name })
        expect(name).toMatch(/^[A-Z]/)
      }
    }
  })

  it('moves on with each press and differs between peoples', () => {
    for (const ancestry of ANCESTRIES) {
      const names = new Set(Array.from({ length: 20 }, (_, seed) => suggestName(ancestry, seed)))
      expect(names.size, ancestry).toBeGreaterThan(10)
    }
    const firsts = new Set(ANCESTRIES.map((ancestry) => suggestName(ancestry, 0)))
    expect(firsts.size).toBe(ANCESTRIES.length)
  })

  it('accepts the ancestry index the look carries, falling back to the first people', () => {
    expect(suggestName(2, 3)).toBe(suggestName(ANCESTRIES[2]!, 3))
    expect(suggestName(99, 3)).toBe(suggestName(ANCESTRIES[0], 3))
  })
})

describe('LookCreator suggest a name', () => {
  const en = lookMessages.en
  it('offers the key only beside a naming form', () => {
    const plain = renderToStaticMarkup(createElement(LookCreator, { value: encodeLook(DEFAULT_LOOK), onChange: () => {} }))
    expect(plain).not.toContain(en.suggestName)
    const naming = renderToStaticMarkup(createElement(LookCreator, { value: encodeLook(DEFAULT_LOOK), onChange: () => {}, onSuggestName: () => {} }))
    expect(naming).toContain(en.suggestName)
    expect(naming).toContain(en.shuffle)
  })

  it('names the key in every language', () => {
    for (const [locale, messages] of Object.entries(lookMessages)) expect((messages as { suggestName: string }).suggestName, locale).toMatch(/\S/)
  })
})
