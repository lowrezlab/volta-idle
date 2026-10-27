import { LYING_POSES, registryOf, type PartRegistry } from './layered'
import { lookParts, type Look, type LookField } from './look'
import { PARTS } from './parts/generated'
import type { Part, PartPose, Slot } from './parts/types'

/*
 * What the creator can show of a look (GDD §3.7): every option is pickable before its art is drawn, because the
 * renderer falls back (route.ts), so the creator says which rows the preview cannot draw yet instead of hiding them.
 */

/** The imported parts, indexed once; tests pass their own. */
const REGISTRY: PartRegistry = registryOf(PARTS)

/** The creator rows that choose each drawn slot: the body is the ancestry and build together; the tabard dresses the outfit. */
export const SLOT_FIELDS: Readonly<Record<Exclude<Slot, 'held'>, readonly LookField[]>> = {
  body: ['ancestry', 'build'],
  head: ['head'],
  hair: ['hair'],
  back: ['back'],
  accessory: ['accessory'],
  outfit: ['tabard'],
}

const hasFrame = (parts: readonly Part[] | undefined, tier: Part['tier'], pose: PartPose): boolean =>
  parts !== undefined && parts.some((part) => (part.tier === tier || part.tier === undefined) && part.frames[pose] !== undefined)

/**
 * The slots of a look the registry cannot draw in a pose, so the preview shows a stand-in for them. Without a body
 * the whole hero falls back to the whole-sprite art, so every chosen slot is reported. A back part hidden by a lying
 * pose is not missing. Option 0 of hair, back, accessory and tabard draws nothing and is never reported.
 */
export function undrawnSlots(look: Look, pose: PartPose, registry: PartRegistry = REGISTRY): ReadonlyArray<Exclude<Slot, 'held'>> {
  const parts = lookParts(look)
  const body = registry.get(parts.body)?.[0]
  const chosen = (Object.keys(SLOT_FIELDS) as Array<Exclude<Slot, 'held'>>).filter((slot) => parts[slot] !== undefined)
  if (body === undefined || body.frames[pose] === undefined) return chosen
  return chosen.filter((slot) => {
    if (slot === 'body') return false
    if (slot === 'back' && LYING_POSES.has(pose)) return false
    return !hasFrame(registry.get(parts[slot]!), body.tier, pose)
  })
}

/** The creator rows whose choice the preview cannot draw in a pose. */
export const undrawnFields = (look: Look, pose: PartPose, registry: PartRegistry = REGISTRY): ReadonlySet<LookField> =>
  new Set(undrawnSlots(look, pose, registry).flatMap((slot) => SLOT_FIELDS[slot]))
