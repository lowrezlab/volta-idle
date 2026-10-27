/**
 * The Volta calendar (GDD §6.1, Lou's model of 2026-10-27): the sky as the hero's clock.
 *
 * Pure date math over one input, a UTC instant in epoch milliseconds, the same `tickAt` the sim already carries
 * (`SimulationInput.tickAt`, the tick's wall slot). The sim's `tick` is a per-hero counter that starts at 0 when the
 * hero is made, so it cannot name a calendar day on its own; the instant can, and the screen has it too. Nothing in
 * here reads the wall clock: callers pass the instant, so the same instant always gives the same sky.
 *
 * Units: a day is 24 h (one passage of Myrkos, the Watcher); 9 days make an Axis, 4 Axes a Cardinal Cycle of 36 days,
 * 10 Cycles a year of 360 days. The Gyre is a 12-year round, one Warden a year. Each Warden has a moon whose phase runs
 * 0..1 from the epoch; the small drift between a moon's period and its calendar unit makes conjunctions wander.
 */

export const DAY_MS = 24 * 60 * 60 * 1000
export const DAYS_PER_AXIS = 9
export const AXES_PER_CYCLE = 4
export const DAYS_PER_CYCLE = DAYS_PER_AXIS * AXES_PER_CYCLE
export const CYCLES_PER_YEAR = 10
export const DAYS_PER_YEAR = DAYS_PER_CYCLE * CYCLES_PER_YEAR
export const GYRE_YEARS = 12

/**
 * The launch epoch: this real instant is day 0, "Rime Ascendant 1, 1203". Lou may move it before launch; nothing else
 * in the model depends on its value. Instants before it compute to earlier days and years, so a moved epoch only
 * shifts the sky.
 */
export const VOLTA_EPOCH_MS = Date.UTC(2026, 10, 1, 0, 0, 0) // 2026-11-01T00:00:00Z
export const EPOCH_YEAR = 1203

export const CYCLES = ['Rime', 'Echo', 'Gloam', 'Grave', 'Melt', 'Verd', 'Tan', 'Shade', 'Molt', 'Tanhaus'] as const
export const AXES = ['Ascendant', 'Skybottom', 'Descendant', 'Midheaven'] as const
export type CycleName = (typeof CYCLES)[number]
export type AxisName = (typeof AXES)[number]

export type WardenId =
  | 'chained-maiden'
  | 'leviathan'
  | 'wyrm'
  | 'magnus'
  | 'blooming-horror'
  | 'veil-hound'
  | 'betrayer'
  | 'conjoined'
  | 'eldritch-beast'
  | 'titan'
  | 'eclipse'
  | 'watcher'

export interface Warden {
  readonly id: WardenId
  /** The lore name as it reads after "Gyre of": with its article where the name takes one. */
  readonly name: string
  /** The moon's orbital period in days (from the iOS wheel). */
  readonly period: number
}

/** The Wardens in Gyre order; the index is the Gyre position and the tie-break rank for the daily aria. */
export const GYRE_ORDER: readonly Warden[] = [
  { id: 'chained-maiden', name: 'the Chained Maiden', period: 361.03 },
  { id: 'leviathan', name: 'the Leviathan', period: 181.17 },
  { id: 'wyrm', name: 'the Wyrm', period: 91.31 },
  { id: 'magnus', name: 'Magnus', period: 36.73 },
  { id: 'blooming-horror', name: 'the Blooming Horror', period: 18.61 },
  { id: 'veil-hound', name: 'the Veil-Hound', period: 9.47 },
  { id: 'betrayer', name: 'the Betrayer', period: 6.23 },
  { id: 'conjoined', name: 'the Conjoined', period: 4.67 },
  { id: 'eldritch-beast', name: 'the Eldritch Beast', period: 3.19 },
  { id: 'titan', name: 'the Titan', period: 2.11 },
  { id: 'eclipse', name: 'the Eclipse', period: 1.53 },
  { id: 'watcher', name: 'the Watcher', period: 1 },
]

/** The Gyre anchor [canon example]: 2525 is the year of the Eclipse. Every other year's Warden follows from it. */
export const GYRE_ANCHOR_YEAR = 2525
export const GYRE_ANCHOR_WARDEN: WardenId = 'eclipse'

/**
 * A moon counts as full while its phase lies within this distance of 0.5, so a tenth of each orbit is "full". Wide
 * enough that the fast moons (Eclipse, Titan) are full on a day now and then when sampled once a day at the midpoint.
 */
export const FULL_PHASE_HALF_WIDTH = 0.05

/** The Chained Maiden's moon is a dead husk: it keeps a phase, is never full and gives no aria. */
export const DEAD_MOON: WardenId = 'chained-maiden'

/**
 * Moons that can carry the daily aria or join a conjunction: all but the dead Maiden and the Watcher. The Watcher is
 * Myrkos itself, whose one-day period puts it at phase 0.5 at every day's midpoint; counted, it would be the aria
 * every day and turn every other full moon into a conjunction. Lou may fold it back in by removing it from this list.
 */
export const SKY_EXCLUDED: ReadonlySet<WardenId> = new Set<WardenId>([DEAD_MOON, 'watcher'])

export interface VoltaDate {
  /** Whole days since the epoch; negative before it. */
  readonly day: number
  readonly year: number
  /** 0-based day within the year, 0..359. */
  readonly dayOfYear: number
  readonly cycle: CycleName
  readonly cycleIndex: number
  readonly axis: AxisName
  readonly axisIndex: number
  /** 1-based day within the axis, 1..9. */
  readonly dayOfAxis: number
  readonly gyreWarden: Warden
}

export interface MoonPhase {
  readonly warden: Warden
  /** 0..1 from the epoch: 0 is new, 0.5 is full. */
  readonly phase: number
  /** 0..1, how close to full: 1 at phase 0.5, 0 at phase 0. */
  readonly fullness: number
  /** Within the full window and not the dead moon. */
  readonly full: boolean
}

/** Floor modulo: the result has the sign of `n`, so negative days still land on a name. */
const mod = (a: number, n: number): number => ((a % n) + n) % n

/** The fractional part in [0, 1), guarded against the rounding that can land `x - floor(x)` on exactly 1. */
function frac(x: number): number {
  const f = x - Math.floor(x)
  return f >= 1 ? 0 : f
}

const ANCHOR_INDEX = GYRE_ORDER.findIndex((w) => w.id === GYRE_ANCHOR_WARDEN)

/** Whole days since the epoch at a UTC instant; negative before it. */
export const voltaDay = (at: number): number => Math.floor((at - VOLTA_EPOCH_MS) / DAY_MS)

/** The Warden of a Volta year, counted from the 2525 = Eclipse anchor. */
export function gyreWarden(year: number): Warden {
  return GYRE_ORDER[mod(year - GYRE_ANCHOR_YEAR + ANCHOR_INDEX, GYRE_YEARS)]!
}

/** The Volta date of a whole day index (see `voltaDay`). */
export function voltaDateOfDay(day: number): VoltaDate {
  const year = EPOCH_YEAR + Math.floor(day / DAYS_PER_YEAR)
  const dayOfYear = mod(day, DAYS_PER_YEAR)
  const cycleIndex = Math.floor(dayOfYear / DAYS_PER_CYCLE)
  const axisIndex = Math.floor((dayOfYear % DAYS_PER_CYCLE) / DAYS_PER_AXIS)
  return {
    day,
    year,
    dayOfYear,
    cycle: CYCLES[cycleIndex]!,
    cycleIndex,
    axis: AXES[axisIndex]!,
    axisIndex,
    dayOfAxis: (dayOfYear % DAYS_PER_AXIS) + 1,
    gyreWarden: gyreWarden(year),
  }
}

/** The Volta date at a UTC instant in epoch milliseconds. */
export const voltaDate = (at: number): VoltaDate => voltaDateOfDay(voltaDay(at))

/** Every Warden's moon at a UTC instant, in Gyre order. */
export function moonPhases(at: number): readonly MoonPhase[] {
  const days = (at - VOLTA_EPOCH_MS) / DAY_MS
  return GYRE_ORDER.map((warden) => {
    const phase = frac(days / warden.period)
    const fullness = 1 - 2 * Math.abs(phase - 0.5)
    const full = warden.id !== DEAD_MOON && Math.abs(phase - 0.5) <= FULL_PHASE_HALF_WIDTH
    return { warden, phase, fullness, full }
  })
}

/** The UTC instant at the middle of a day index: where the day's sky is read. */
export const dayMidpoint = (day: number): number => VOLTA_EPOCH_MS + (day + 0.5) * DAY_MS

/** The sky moons (not excluded) at a day's midpoint. */
const skyAtMidpoint = (day: number): readonly MoonPhase[] => moonPhases(dayMidpoint(day)).filter((m) => !SKY_EXCLUDED.has(m.warden.id))

/** The Warden whose moon is fullest at the day's midpoint; ties fall to the earlier Gyre position. */
export function dailyAria(day: number): Warden {
  let best: MoonPhase | undefined
  for (const moon of skyAtMidpoint(day)) if (best === undefined || moon.fullness > best.fullness) best = moon
  return best!.warden
}

/** The Wardens whose moons are full together at the day's midpoint, in Gyre order; two or more make a conjunction. */
export function conjunction(day: number): readonly Warden[] {
  const full = skyAtMidpoint(day).filter((m) => m.full).map((m) => m.warden)
  return full.length >= 2 ? full : []
}

/** "Rime Ascendant 4 · Gyre of the Wyrm 1203". */
export const formatVoltaDate = (date: VoltaDate): string => `${date.cycle} ${date.axis} ${date.dayOfAxis} · Gyre of ${date.gyreWarden.name} ${date.year}`
