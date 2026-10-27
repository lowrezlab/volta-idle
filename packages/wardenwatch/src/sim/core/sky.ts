import { AXES, conjunction, dailyAria, GYRE_ORDER, SKY_EXCLUDED, voltaDate, type VoltaDate, type Warden } from './calendar'
import type { ContentCatalog, MerchantOffer, Modifiers, SkyRule, StanceId, StanceRule } from './types'

/**
 * The Volta sky in the sim (2B.2, GDD §6.2). Pure: everything here follows from the catalog's `sky` table and the
 * tick's wall slot (`SimulationInput.tickAt`), the same instant the screen reads for its date line and moon strip, so
 * a tick and its screen always agree. Without a `sky` table, or without a wall slot, there is no sky and nothing moves:
 * v27 and every earlier catalog play exactly as before, and the balance harness only sees the sky under v28.
 *
 * The sky's day is the UTC day (`voltaDay`), not the owner's local day the office occasions use: Volta's sky is one
 * sky for every hero, and the device's sky strip already reads it that way.
 */

export interface LiveSky {
  readonly rule: SkyRule
  readonly date: VoltaDate
  /** The Warden whose moon is fullest at the day's midpoint. */
  readonly aria: Warden
  /** Two or more full moons together; empty on an ordinary day. */
  readonly conjunction: readonly Warden[]
}

/** The sky at a tick's wall slot under a catalog with a sky table; undefined without either. */
export function skyForTick(content: Pick<ContentCatalog, 'sky'>, tickAt: number | undefined): LiveSky | undefined {
  const rule = content.sky
  if (rule === undefined || tickAt === undefined || !Number.isFinite(tickAt)) return undefined
  const date = voltaDate(tickAt)
  return { rule, date, aria: dailyAria(date.day), conjunction: conjunction(date.day) }
}

const sum = (a: Modifiers, b: Modifiers): Modifiers => {
  const out: Record<string, number> = {}
  for (const part of [a, b]) for (const [key, value] of Object.entries(part)) if (value !== undefined) out[key] = (out[key] ?? 0) + value
  return out
}

/**
 * The day's aria passive, plus the Gyre Warden's XP favour when the hero stands in the favoured zone; undefined when
 * the sky grants nothing here today. Summed into `activeModifiers` beside the class, affixes, effects and occasion.
 */
export function skyModifiers(sky: LiveSky | undefined, biomeId: string): Modifiers | undefined {
  if (sky === undefined) return undefined
  const aria = sky.rule.aria[sky.aria.id]?.modifiers ?? {}
  const gyre: Modifiers = sky.rule.gyre.favoured[sky.date.gyreWarden.id] === biomeId ? { xpPct: sky.rule.gyre.xpPct } : {}
  const total = sum(aria, gyre)
  return Object.keys(total).length === 0 ? undefined : total
}

/** The stance's thresholds with the Axis's nudge applied when the Axis favours this stance; the rule itself otherwise. */
export function skyStance(sky: LiveSky | undefined, stance: StanceId, rule: StanceRule): StanceRule {
  const nudge = sky?.rule.axis[sky.date.axis]
  if (nudge === undefined || nudge.stance !== stance) return rule
  return {
    ...rule,
    autoPotionBelowPct: rule.autoPotionBelowPct + (nudge.autoPotionBelowPct ?? 0),
    restBelowPct: rule.restBelowPct + (nudge.restBelowPct ?? 0),
    resumeExploringAtPct: rule.resumeExploringAtPct + (nudge.resumeExploringAtPct ?? 0),
  }
}

/** The moneychanger's featured offer this Cycle, or undefined without a sky or a rotation. */
export function skyFeaturedOffer(sky: LiveSky | undefined): MerchantOffer['id'] | undefined {
  const rotation = sky?.rule.cycle.rotation
  return rotation === undefined || rotation.length === 0 ? undefined : rotation[sky!.date.cycleIndex % rotation.length]
}

/** A merchant price with the Cycle's discount when the offer is the featured one; never below one coin. */
export function skyPrice(sky: LiveSky | undefined, offer: MerchantOffer['id'], price: number): number {
  return sky !== undefined && skyFeaturedOffer(sky) === offer ? Math.max(1, Math.floor((price * (100 - sky.rule.cycle.discountPct)) / 100)) : price
}

/** How many times over salvage pays today: the conjunction multiplier on a conjunction day, else one. */
export const shardMultiplier = (sky: LiveSky | undefined): number => (sky !== undefined && sky.conjunction.length >= 2 ? sky.rule.conjunction.shardMultiplier : 1)

/** The largest share any sky effect may move a number by: the sky is a nudge, never a season. */
export const SKY_MAX_PCT = 5

/** Catalog checks for the sky table: every reference resolves, every number stays a nudge, and no nudge breaks a stance. */
export function skyProblems(content: ContentCatalog): string[] {
  const sky = content.sky
  if (sky === undefined) return []
  const problems: string[] = []
  const share = (name: string, value: number, max: number) => {
    if (!Number.isSafeInteger(value) || value < 0 || value > max) problems.push(`sky ${name} must be a whole share from 0 to ${max}`)
  }
  share('gyre.xpPct', sky.gyre.xpPct, SKY_MAX_PCT)
  for (const warden of GYRE_ORDER) {
    const biome = sky.gyre.favoured[warden.id]
    if (!content.biomes.some((b) => b.id === biome)) problems.push(`sky gyre favours an unknown zone ${biome} for ${warden.id}`)
    const aria = sky.aria[warden.id]
    if (aria === undefined) {
      if (!SKY_EXCLUDED.has(warden.id)) problems.push(`sky aria has no passive for ${warden.id}`)
      continue
    }
    if (SKY_EXCLUDED.has(warden.id)) problems.push(`sky aria names ${warden.id}, which never carries the aria`)
    if (aria.name.trim() === '' || aria.blurb.trim() === '') problems.push(`sky aria ${warden.id} needs a name and a blurb`)
    if (Object.keys(aria.modifiers).length === 0) problems.push(`sky aria ${warden.id} grants nothing`)
    for (const [name, value] of Object.entries(aria.modifiers)) share(`aria ${warden.id} ${name}`, value, SKY_MAX_PCT)
  }
  const names = Object.values(sky.aria).map((aria) => aria.name)
  if (new Set(names).size !== names.length) problems.push('sky aria passives must have distinct names')
  share('cycle.discountPct', sky.cycle.discountPct, SKY_MAX_PCT)
  const offers: readonly string[] = ['potions', 'pouch', 'bag']
  if (sky.cycle.rotation.length === 0 || sky.cycle.rotation.some((id) => !offers.includes(id))) problems.push('sky cycle rotation must list merchant offers')
  if (sky.cycle.rotation.length > 0 && content.merchant === undefined) problems.push('sky cycle rotation needs a merchant')
  for (const [axis, nudge] of Object.entries(sky.axis)) {
    if (!(AXES as readonly string[]).includes(axis)) problems.push(`sky axis ${axis} is not an Axis`)
    const base = content.stances?.[nudge.stance]
    if (base === undefined) {
      problems.push(`sky axis ${axis} favours an unknown stance ${nudge.stance}`)
      continue
    }
    for (const value of [nudge.autoPotionBelowPct, nudge.restBelowPct, nudge.resumeExploringAtPct]) if (value !== undefined && (!Number.isSafeInteger(value) || Math.abs(value) > SKY_MAX_PCT)) problems.push(`sky axis ${axis} shifts a threshold by more than ${SKY_MAX_PCT}`)
    if (nudge.autoPotionBelowPct === undefined && nudge.restBelowPct === undefined && nudge.resumeExploringAtPct === undefined) problems.push(`sky axis ${axis} shifts nothing`)
    const nudged = skyStance({ rule: sky, date: { ...voltaDate(0), axis: axis as VoltaDate['axis'] }, aria: GYRE_ORDER[0]!, conjunction: [] }, nudge.stance, base)
    const ordered = nudged.restBelowPct < nudged.autoPotionBelowPct && nudged.autoPotionBelowPct < nudged.resumeExploringAtPct
    const inRange = [nudged.restBelowPct, nudged.autoPotionBelowPct, nudged.resumeExploringAtPct].every((value) => value >= 0 && value <= 100)
    if (!ordered || !inRange) problems.push(`sky axis ${axis} breaks the ${nudge.stance} thresholds`)
    if (nudged.restBelowPct > content.constants.reviveHpPct) problems.push(`sky axis ${axis} would rest a revived ${nudge.stance} hero at once`)
  }
  if (!Number.isSafeInteger(sky.conjunction.shardMultiplier) || sky.conjunction.shardMultiplier < 1 || sky.conjunction.shardMultiplier > 3) problems.push('sky conjunction shard multiplier must be a whole number from 1 to 3')
  return problems
}
