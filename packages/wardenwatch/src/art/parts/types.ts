import type { Sprite } from '../canvas'

/*
 * The layered hero's part contract (GDD §3, §7). The Aseprite import tool writes parts in this shape and the
 * layered renderer reads them; neither side changes it without the other.
 *
 * Every frame is a 24x24 grid facing right in the engine glyphs. A part's `origin` is the pixel of its own grid
 * that lands on the anchor it hangs from; the body hangs from the canvas (its origin is placed at 0,0) and
 * exports the anchors the other slots hang from. A head exports `crown` for hair.
 */

/** Slots back to front: the draw order of the layered hero. */
export const SLOTS = ['back', 'body', 'outfit', 'head', 'hair', 'accessory', 'held'] as const
export type Slot = (typeof SLOTS)[number]

export const BASE_POSES = ['idle', 'fight', 'walk', 'rest', 'sleep', 'knocked_out'] as const
export type PartPose = (typeof BASE_POSES)[number]

export type AnchorName = 'head' | 'neck' | 'hand' | 'back' | 'crown'
export interface Point { readonly x: number; readonly y: number }

/** Which anchor each slot hangs from. Outfit sits on the body's own grid. */
export const SLOT_ANCHOR: Record<Slot, AnchorName | null> = {
  back: 'back', body: null, outfit: null, head: 'head', hair: 'crown', accessory: 'neck', held: 'hand',
}

export interface PartFrame {
  readonly sprite: Sprite
  /** The pixel of this frame that sits on its slot's anchor; 0,0 for body and outfit. */
  readonly origin: Point
  /** Anchors this frame exports, in its own grid's coordinates. */
  readonly anchors: Readonly<Partial<Record<AnchorName, Point>>>
}

export interface Part {
  readonly slot: Slot
  /** Stable option id, e.g. `eldrith.slight`, `hair.braid`. Never reused for a different drawing. */
  readonly id: string
  /** Body tier the part is drawn for; absent means it fits every tier. */
  readonly tier?: 'small' | 'medium' | 'tall' | 'very_tall'
  /** Standing poses are required; a back part may leave out the lying poses (`rest`, `sleep`, `knocked_out`). */
  readonly frames: Readonly<Partial<Record<PartPose, PartFrame>>>
}
