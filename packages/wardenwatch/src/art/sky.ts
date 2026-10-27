import type { Canvas } from './canvas'
import { dailyAria, dayMidpoint, DEAD_MOON, GYRE_ORDER, moonPhases, type MoonPhase, type Warden } from '../sim/core/calendar'

/**
 * The sky strip (GDD §6.3, P4.2): the twelve Wardens' moons across the top of the 152x40 stage, in Gyre order, read
 * from the Volta calendar at the day's midpoint, where `dailyAria` and `conjunction` read it. Each moon is a small
 * 1-bit glyph whose lit face follows its phase (new is an outline, full is filled); the day's aria moon wears four
 * sparkles, and the Chained Maiden's dead moon is always cracked. The strip is the game's visual identity, so the
 * Volta day is part of the scene's immutable path (`sceneTime.ts`).
 *
 * Rows: the glyphs ink rows 0..4 only (`SKY_ROWS`) and their white halos reach row 5, so the elite crown on the
 * tallest foe, which inks row 6 with its own halo at row 5, never touches a moon; `SKY_CLEARANCE` names that first
 * free row, and the scene test holds every placement to it.
 */

/** The strip's ink rows: 0 to `SKY_ROWS - 1`. */
export const SKY_ROWS = 5
/** The first row a placement (hero, foe, hat, crown) may ink: its halo then meets the strip's at row 5. */
export const SKY_CLEARANCE = SKY_ROWS + 1
/** The first moon's centre column and the pitch between moons: 10, 22, ... 142 across the 152-wide stage. */
export const SKY_LEFT = 10
export const SKY_PITCH = 12
/** Moons with a period of an Axis (9 days) or longer draw at 5 pixels, the fast moons at 3. */
const LARGE_PERIOD = 9
/** Where the lit face cuts in: an outline below a fifth, a sliver, a half, and filled from four fifths up. */
const FACE_STEPS = [0.2, 0.5, 0.8] as const

export type Cell = readonly [x: number, y: number]

export interface SkyMoon {
  readonly warden: Warden
  readonly phase: MoonPhase
  readonly centre: number
  readonly size: 3 | 5
  /** The day's aria: the fullest sky moon, wearing the sparkles. */
  readonly aria: boolean
  /** The outline, the Maiden's crack and the sparkles: ink on every panel. */
  readonly ink: readonly Cell[]
  /** The lit face: ink on a 1-bit panel, yellow on a four-ink one (route.ts). */
  readonly lit: readonly Cell[]
}

const key = ([x, y]: Cell) => `${x},${y}`

/** The 5-pixel moon: a ring with a 3x3 face; the 3-pixel moon: a ring with one cell of face. Cells are relative to the centre. */
function glyph(size: 3 | 5): { outline: Cell[]; face: Cell[][] } {
  if (size === 3) return { outline: [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]], face: [[[0, 0]]] }
  const outline: Cell[] = [[-1, -2], [0, -2], [1, -2], [-2, -1], [2, -1], [-2, 0], [2, 0], [-2, 1], [2, 1], [-1, 2], [0, 2], [1, 2]]
  // The face by column, from the left edge: the lit side fills column by column from its edge inwards.
  const face: Cell[][] = [-1, 0, 1].map((x) => [-1, 0, 1].map((y) => [x, y] as Cell))
  return { outline, face }
}

/** The columns of the face that are lit, from the lit edge inwards; waxing (phase below half) lights the right. */
function litFace(phase: MoonPhase, face: Cell[][]): Cell[] {
  const columns = FACE_STEPS.filter((step) => phase.fullness >= step).length
  if (face.length === 1) return columns >= 2 ? face[0]! : []
  const ordered = phase.phase < 0.5 ? [...face].reverse() : face
  return ordered.slice(0, columns).flat()
}

/** The Maiden's crack: the face's diagonal, which inks an unlit face and clears a lit one. */
const CRACK: readonly Cell[] = [[-1, -1], [0, 0], [1, 1]]

/**
 * The aria's sparkles: four cells on the strip's top and bottom rows, three columns out from the centre, so a blank
 * cell separates each from the ring of either glyph size (the 5-pixel ring's corners are empty; the 3-pixel ring
 * ends two columns in).
 */
const SPARKLES: readonly Cell[] = [[-3, -2], [3, -2], [-3, 2], [3, 2]]

/** The strip for a Volta day, in Gyre order. */
export function skyMoons(day: number): readonly SkyMoon[] {
  const aria = dailyAria(day)
  return moonPhases(dayMidpoint(day)).map((phase, index) => {
    const warden = GYRE_ORDER[index]!
    const size: 3 | 5 = warden.period >= LARGE_PERIOD ? 5 : 3
    const centre = SKY_LEFT + index * SKY_PITCH
    const row = 2
    const { outline, face } = glyph(size)
    let lit = litFace(phase, face)
    const ink = [...outline]
    if (warden.id === DEAD_MOON) {
      const litKeys = new Set(lit.map(key))
      const crackKeys = new Set(CRACK.map(key))
      ink.push(...CRACK.filter((cell) => !litKeys.has(key(cell))))
      lit = lit.filter((cell) => !crackKeys.has(key(cell)))
    }
    const isAria = warden.id === aria.id
    if (isAria) ink.push(...SPARKLES)
    const place = (cells: Cell[]): Cell[] => cells.map(([x, y]) => [centre + x, row + y])
    return { warden, phase, centre, size, aria: isAria, ink: place(ink), lit: place(lit) }
  })
}

/** Draw the strip onto the stage: each moon with a one-pixel white halo, its face under its own region for the companion's colours. */
export function drawSky(c: Canvas, day: number): void {
  for (const moon of skyMoons(day)) {
    const cells = [...moon.ink, ...moon.lit]
    c.region = 'halo'
    for (const [x, y] of cells) for (let oy = -1; oy <= 1; oy += 1) for (let ox = -1; ox <= 1; ox += 1) c.paint(x + ox, y + oy, 'w')
    c.region = 'sky:moon'
    for (const [x, y] of moon.ink) c.paint(x, y, '#')
    c.region = 'sky:lit'
    for (const [x, y] of moon.lit) c.paint(x, y, '#')
  }
}
