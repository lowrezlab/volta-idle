import { describe, expect, it } from 'vitest'
import { ANCESTRIES, decodeLook, DEFAULT_LOOK, encodeLook, lookParts } from '@trmnl-games/wardenwatch/art/look'
import { SLOT_FIELDS, undrawnFields, undrawnSlots } from '@trmnl-games/wardenwatch/art/lookArt'
import { LYING_POSES, registryOf } from '@trmnl-games/wardenwatch/art/layered'
import { PARTS } from '@trmnl-games/wardenwatch/art/parts/generated/index'
import { BASE_POSES } from '@trmnl-games/wardenwatch/art/parts/types'

/*
 * The creator (GDD §3.7) lets every option be picked before its art exists; these tests pin what it says it cannot
 * draw yet against the parts the pipeline has imported so far (art/parts/generated).
 */
const registry = registryOf(PARTS)
const drawnBodies = ANCESTRIES.flatMap((ancestry, index) => (registry.has(lookParts({ ...DEFAULT_LOOK, ancestry: index }).body) ? [ancestry] : []))

describe('undrawnSlots', () => {
  it('reports every chosen slot when the body itself has no part, as the whole hero then falls back', () => {
    const look = decodeLook('v1.0000000')
    const parts = lookParts(look)
    if (registry.has(parts.body)) return
    expect(undrawnSlots(look, 'idle')).toEqual(['body', 'head', 'outfit'])
    expect([...undrawnFields(look, 'idle')]).toEqual(['ancestry', 'build', 'head', 'tabard'])
  })

  it('never reports a slot whose option 0 draws nothing', () => {
    for (const pose of BASE_POSES) expect(undrawnSlots(DEFAULT_LOOK, pose)).not.toContain('hair')
  })

  it('does not report the body once the registry draws it, and reports only the parts it lacks', () => {
    if (drawnBodies.length === 0) return
    const look = { ...DEFAULT_LOOK, ancestry: ANCESTRIES.indexOf(drawnBodies[0]!), accessory: 1 }
    const slots = undrawnSlots(look, 'idle')
    expect(slots).not.toContain('body')
    expect(slots).toContain('accessory')
    expect(undrawnFields(look, 'idle').has('ancestry')).toBe(false)
  })

  it('lets a lying pose hide the back rather than call it undrawn', () => {
    if (drawnBodies.length === 0) return
    const look = { ...DEFAULT_LOOK, ancestry: ANCESTRIES.indexOf(drawnBodies[0]!), back: 1 }
    for (const pose of BASE_POSES) expect(undrawnSlots(look, pose).includes('back'), pose).toBe(!LYING_POSES.has(pose))
  })

  it('takes a registry of its own, so a fuller set of parts clears the rows', () => {
    const look = decodeLook('v1.0000000')
    expect(undrawnSlots(look, 'idle', registryOf([]))).toEqual(['body', 'head', 'outfit'])
  })

  it('maps every drawn slot to the creator rows that choose it', () => {
    expect(Object.values(SLOT_FIELDS).flat().sort()).toEqual(['accessory', 'ancestry', 'back', 'build', 'hair', 'head', 'tabard'])
    expect(encodeLook(DEFAULT_LOOK)).toBe('v1.0000000')
  })
})
