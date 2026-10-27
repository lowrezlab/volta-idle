import type { Sprite } from './canvas'
import { SLOT_ANCHOR, SLOTS, type Part, type PartFrame, type PartPose, type Point, type Slot } from './parts/types'

/*
 * The layered hero (GDD §3): one 24x24 frame per pose, stacked from the parts a look chose, each part's `origin` on
 * the anchor it hangs from. The result is a plain `Sprite`, so the scene draws it where the whole-sprite hero goes
 * today and the shade patterns still align to the stage.
 */

export const HERO_SIZE = 24

/** The part chosen for each slot, by id; only the body is required. */
export type HeroParts = { readonly body: string } & Readonly<Partial<Record<Exclude<Slot, 'body'>, string>>>

/** Parts by id. An id may hold one drawing per body tier, or a single tier-less one that fits every tier. */
export type PartRegistry = ReadonlyMap<string, readonly Part[]>

export function registryOf(parts: readonly Part[]): PartRegistry {
  const registry = new Map<string, Part[]>()
  for (const part of parts) {
    const held = registry.get(part.id)
    if (held === undefined) registry.set(part.id, [part])
    else held.push(part)
  }
  return registry
}

/** The part for an id drawn for a tier: the tier's own drawing first, else the one that fits every tier. */
function findPart(registry: PartRegistry, id: string, tier: Part['tier']): Part | undefined {
  const candidates = registry.get(id)
  if (candidates === undefined) return undefined
  return candidates.find((part) => part.tier === tier) ?? candidates.find((part) => part.tier === undefined)
}

/** Lying poses: the back slot (wings, cloak, tail) is hidden, as the whole-sprite cloak is today (`CLOAKED_POSES`). */
export const LYING_POSES: ReadonlySet<PartPose> = new Set<PartPose>(['rest', 'sleep', 'knocked_out'])

export interface LayeredHero {
  /** The composed frame, 24x24, feet on row 23. */
  readonly sprite: Sprite
  /** The body's `head` anchor in the frame, for occasion hats; absent when the body frame exports none. */
  readonly head?: Point
}

/** The frame a part draws for a pose, or nothing when it leaves that pose out (a back part lying down). */
const frameOf = (part: Part | undefined, pose: PartPose): PartFrame | undefined => part?.frames[pose]

/** Stamp a frame's grid onto `rows` with its origin at (x, y); only inked cells land, so lower layers show through. */
function stamp(rows: string[][], frame: PartFrame, x: number, y: number): void {
  frame.sprite.rows.forEach((row, dy) => {
    const ty = y - frame.origin.y + dy
    if (ty < 0 || ty >= HERO_SIZE) return
    ;[...row].forEach((ch, dx) => {
      const tx = x - frame.origin.x + dx
      if (ch !== ' ' && tx >= 0 && tx < HERO_SIZE) rows[ty]![tx] = ch
    })
  })
}

/**
 * The hero frame for a pose: the body at 0,0, then every other chosen part with its origin on its anchor, in `SLOTS`
 * order. Hair hangs from the head's `crown`, which is read in the head's placed position. A missing optional part
 * draws nothing; a missing body is a programming error.
 */
export function composeLayeredHero(parts: HeroParts, pose: PartPose, registry: PartRegistry): LayeredHero {
  // A body id is one drawing (its tier is its own); the other slots are looked up for that tier.
  const body = registry.get(parts.body)?.[0]
  const bodyFrame = frameOf(body, pose)
  if (body === undefined || bodyFrame === undefined) throw new Error(`layered hero: no body part ${parts.body} for ${pose}`)
  const rows = Array.from({ length: HERO_SIZE }, () => new Array<string>(HERO_SIZE).fill(' '))
  // Anchors in frame coordinates: the body's as drawn, the head's crown once the head is placed.
  const anchors: Partial<Record<'head' | 'neck' | 'hand' | 'back' | 'crown', Point>> = { ...bodyFrame.anchors }
  for (const slot of SLOTS) {
    if (slot === 'body') {
      stamp(rows, bodyFrame, 0, 0)
      continue
    }
    if (slot === 'back' && LYING_POSES.has(pose)) continue
    const id = parts[slot]
    if (id === undefined) continue
    const frame = frameOf(findPart(registry, id, body.tier), pose)
    if (frame === undefined) continue
    const anchorName = SLOT_ANCHOR[slot]
    const anchor = anchorName === null ? { x: 0, y: 0 } : anchors[anchorName]
    if (anchor === undefined) continue
    stamp(rows, frame, anchor.x, anchor.y)
    if (slot === 'head' && frame.anchors.crown !== undefined) {
      anchors.crown = { x: anchor.x - frame.origin.x + frame.anchors.crown.x, y: anchor.y - frame.origin.y + frame.anchors.crown.y }
    }
  }
  const sprite: Sprite = { width: HERO_SIZE, height: HERO_SIZE, rows: rows.map((row) => row.join('')) }
  return anchors.head === undefined ? { sprite } : { sprite, head: anchors.head }
}

/** The layered hero when the registry can draw its body for the pose, else null so the scene falls back to the whole sprites. */
export function layeredHeroFor(parts: HeroParts, pose: PartPose, registry: PartRegistry): LayeredHero | null {
  const body = registry.get(parts.body)?.[0]
  return body?.frames[pose] === undefined ? null : composeLayeredHero(parts, pose, registry)
}
