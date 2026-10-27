import { describe, expect, it } from 'vitest'
import { SKY_V28 } from '@trmnl-games/wardenwatch/content/sky'
import { validateCatalog } from '@trmnl-games/wardenwatch/content/validate'
import { contentV27 } from '@trmnl-games/wardenwatch/content/v27'
import { contentV28 } from '@trmnl-games/wardenwatch/content/v28'
import { de } from '@trmnl-games/wardenwatch/i18n/de'
import { es } from '@trmnl-games/wardenwatch/i18n/es'
import { fr } from '@trmnl-games/wardenwatch/i18n/fr'
import { it as italian } from '@trmnl-games/wardenwatch/i18n/it'
import { nl } from '@trmnl-games/wardenwatch/i18n/nl'
import { pl } from '@trmnl-games/wardenwatch/i18n/pl'
import { pt } from '@trmnl-games/wardenwatch/i18n/pt'
import { conjunction, dailyAria, dayMidpoint, DAYS_PER_CYCLE, DAYS_PER_YEAR, gyreWarden, SKY_EXCLUDED, voltaDateOfDay } from '@trmnl-games/wardenwatch/sim/core/calendar'
import { scaled } from '@trmnl-games/wardenwatch/sim/core/modifiers'
import { shardMultiplier, skyFeaturedOffer, skyForTick, skyModifiers, skyPrice, skyProblems, skyStance } from '@trmnl-games/wardenwatch/sim/core/sky'
import { simulateHero, SIMULATION_VERSION } from '@trmnl-games/wardenwatch/sim/core/simulate'
import { heroMaxHp } from '@trmnl-games/wardenwatch/sim/core/stats'
import { starterHero, starterKit } from '@trmnl-games/wardenwatch/sim/core/starter'
import type { ContentCatalog, HeroState, ItemSnapshot, SimulationResult, StreamSeeds } from '@trmnl-games/wardenwatch/sim/core/types'
import { salvageYield } from '@trmnl-games/wardenwatch/sim/core/workbench'
import { seeds, withId } from './helpers'

/**
 * 2B.2: the Volta sky in the sim. v27 has no sky and plays as it always has (volta-content.test.ts replays v28 without
 * its table against v27 byte for byte); under v28 each hook fires on the days the calendar names, from the tick's wall
 * slot alone, and the same input always gives the same tick.
 */

/** v28 with its sky table taken out: the control for every hook. */
const { sky: _sky, ...unlit } = contentV28
const unlitV28: ContentCatalog = unlit
const withSky = (patch: Partial<typeof SKY_V28>): ContentCatalog => ({ ...contentV28, sky: { ...SKY_V28, ...patch } })

function setup(content: ContentCatalog, overrides: Partial<HeroState> = {}): { hero: HeroState; inventory: ItemSnapshot[] } {
  const kit = starterKit(content)
  const inventory = [withId(kit.weapon, 'i000'), withId(kit.armor, 'i001'), withId({ ...kit.potions, quantity: 3 }, 'i999')]
  const base: HeroState = { ...starterHero('hero1', content, 0), weaponId: 'i000', armorId: 'i001', level: 12, biomeId: 'server_room', gold: 400, bagCapacity: 13, potionCap: 20, ...overrides }
  return { hero: { ...base, hp: overrides.hp ?? heroMaxHp(content, base) }, inventory }
}

/** Every stream a v28 tick draws from. */
const streams = (seed: number): StreamSeeds => ({ ...seeds(seed), quest: (seed * 1597334677 + 11) >>> 0, raid: (seed * 2971215073 + 5) >>> 0, meeting: (seed * 433494437 + 7) >>> 0, graveyard: (seed * 1836311903 + 9) >>> 0 })

const tick = (content: ContentCatalog, hero: HeroState, inventory: ItemSnapshot[], seed: number, tickAt: number | undefined): SimulationResult =>
  simulateHero({ hero, inventory, tick: 500, content, simulationVersion: SIMULATION_VERSION, streams: streams(seed), ...(tickAt === undefined ? {} : { tickAt }) })

/** The first seed whose tick under `content` satisfies the predicate. */
function findSeed(content: ContentCatalog, hero: HeroState, inventory: ItemSnapshot[], tickAt: number, predicate: (result: SimulationResult) => boolean): number {
  for (let seed = 0; seed < 5000; seed += 1) if (predicate(tick(content, hero, inventory, seed, tickAt))) return seed
  throw new Error('no seed satisfied the predicate')
}

/** A day index in the range whose aria passive carries no XP share, so the Gyre's XP favour can be read on its own. */
function dayWithoutXpAria(from: number, to: number): number {
  for (let day = from; day <= to; day += 1) if (SKY_V28.aria[dailyAria(day).id]?.modifiers.xpPct === undefined) return day
  throw new Error('every day in the range carries an XP aria')
}

describe('the sky table (2B.2)', () => {
  it('is carried by v28 alone, validates, and is read only from a wall slot', () => {
    expect(validateCatalog(contentV28)).toEqual([])
    expect(skyProblems(contentV28)).toEqual([])
    expect(contentV27.sky).toBeUndefined()
    expect(skyForTick(contentV27, dayMidpoint(10))).toBeUndefined()
    expect(skyForTick(contentV28, undefined)).toBeUndefined()
    const live = skyForTick(contentV28, dayMidpoint(10))!
    expect(live.date.day).toBe(10)
    expect(live.aria.id).toBe(dailyAria(10).id)
  })

  it('keeps every number a nudge and every reference resolving', () => {
    expect(skyProblems(withSky({ gyre: { ...SKY_V28.gyre, xpPct: 6 } }))).toContain('sky gyre.xpPct must be a whole share from 0 to 5')
    expect(skyProblems(withSky({ gyre: { ...SKY_V28.gyre, favoured: { ...SKY_V28.gyre.favoured, wyrm: 'the_moon' } } }))).toContain('sky gyre favours an unknown zone the_moon for wyrm')
    expect(skyProblems(withSky({ cycle: { discountPct: 5, rotation: [] } }))).toContain('sky cycle rotation must list merchant offers')
    expect(skyProblems(withSky({ axis: { Ascendant: { stance: 'bold', restBelowPct: -25 } } }))).toContain('sky axis Ascendant shifts a threshold by more than 5')
    expect(skyProblems(withSky({ axis: { Skybottom: { stance: 'cautious', restBelowPct: 5 } } }))).toContain('sky axis Skybottom would rest a revived cautious hero at once')
    const { wyrm: _wyrm, ...aria } = SKY_V28.aria
    expect(skyProblems(withSky({ aria }))).toContain('sky aria has no passive for wyrm')
    expect(skyProblems(withSky({ aria: { ...SKY_V28.aria, 'chained-maiden': SKY_V28.aria.wyrm! } }))).toContain('sky aria names chained-maiden, which never carries the aria')
    expect(skyProblems(withSky({ conjunction: { shardMultiplier: 4 } }))).toContain('sky conjunction shard multiplier must be a whole number from 1 to 3')
    // Every sky Warden has a passive, no excluded one does, and the names are all different.
    for (const id of Object.keys(SKY_V28.aria)) expect(SKY_EXCLUDED.has(id as never)).toBe(false)
    expect(new Set(Object.values(SKY_V28.aria).map((a) => a.name)).size).toBe(Object.keys(SKY_V28.aria).length)
  })

  it('names and blurbs every aria passive in all seven dictionaries', () => {
    for (const [locale, dictionary] of [['fr', fr], ['de', de], ['es', es], ['it', italian], ['pt', pt], ['pl', pl], ['nl', nl]] as const) {
      for (const passive of Object.values(SKY_V28.aria)) {
        expect(dictionary.text[passive.name], `${locale}: ${passive.name}`).toBeTruthy()
        expect(dictionary.text[passive.blurb], `${locale}: ${passive.blurb}`).toBeTruthy()
      }
    }
  })
})

describe('the Gyre year (2B.2)', () => {
  it('favours one zone with the year’s Warden, and the zone changes with the year', () => {
    const lastDay = DAYS_PER_YEAR - 1
    const oldWarden = voltaDateOfDay(lastDay).gyreWarden
    const newWarden = voltaDateOfDay(DAYS_PER_YEAR).gyreWarden
    expect(newWarden.id).not.toBe(oldWarden.id)
    expect(gyreWarden(1204).id).toBe(newWarden.id)
    const before = skyForTick(contentV28, dayMidpoint(lastDay))
    const after = skyForTick(contentV28, dayMidpoint(DAYS_PER_YEAR))
    const zone = SKY_V28.gyre.favoured[oldWarden.id]
    expect(skyModifiers(before, zone)?.xpPct ?? 0).toBeGreaterThanOrEqual(5)
    expect(skyModifiers(after, zone)?.xpPct ?? 0).toBeLessThan(5 + (SKY_V28.aria[after!.aria.id]?.modifiers.xpPct ?? 0))
    expect(skyModifiers(after, SKY_V28.gyre.favoured[newWarden.id])?.xpPct ?? 0).toBeGreaterThanOrEqual(5)
  })

  it('pays 5% more victory XP in the favoured zone, rolled exactly as without it', () => {
    const day = dayWithoutXpAria(300, DAYS_PER_YEAR - 1)
    const zone = SKY_V28.gyre.favoured[voltaDateOfDay(day).gyreWarden.id]
    const { hero, inventory } = setup(contentV28, { biomeId: zone })
    const at = dayMidpoint(day)
    const noGyre = withSky({ gyre: { ...SKY_V28.gyre, xpPct: 0 } })
    const seed = findSeed(contentV28, hero, inventory, at, (result) => result.metrics.victories === 1 && (result.event?.deltas.xpEarned ?? 0) > 0)
    const lit = tick(contentV28, hero, inventory, seed, at)
    const control = tick(noGyre, hero, inventory, seed, at)
    expect(control.metrics.victories).toBe(1)
    expect(lit.event!.deltas.xpEarned).toBe(scaled(control.event!.deltas.xpEarned, 5))
    // Across the zone line the favour is gone: the same tick elsewhere pays the control's XP.
    const elsewhere = { ...hero, biomeId: contentV28.biomes.find((b) => b.id !== zone && !b.safe)!.id }
    expect(tick(contentV28, elsewhere, inventory, seed, at).event!.deltas.xpEarned).toBe(tick(noGyre, elsewhere, inventory, seed, at).event!.deltas.xpEarned)
  })
})

describe('the Cardinal Cycle (2B.2)', () => {
  it('rotates the featured offer at the Cycle boundary, 5% off', () => {
    const lastOfRime = skyForTick(contentV28, dayMidpoint(DAYS_PER_CYCLE - 1))
    const firstOfEcho = skyForTick(contentV28, dayMidpoint(DAYS_PER_CYCLE))
    expect(lastOfRime!.date.cycle).toBe('Rime')
    expect(firstOfEcho!.date.cycle).toBe('Echo')
    expect(skyFeaturedOffer(lastOfRime)).toBe('potions')
    expect(skyFeaturedOffer(firstOfEcho)).toBe('pouch')
    expect(skyPrice(lastOfRime, 'potions', 100)).toBe(95)
    expect(skyPrice(lastOfRime, 'pouch', 100)).toBe(100)
    expect(skyPrice(firstOfEcho, 'potions', 100)).toBe(100)
    expect(skyPrice(firstOfEcho, 'pouch', 100)).toBe(95)
    expect(skyPrice(lastOfRime, 'potions', 1)).toBe(1)
    expect(skyFeaturedOffer(undefined)).toBeUndefined()
  })

  it('prices a merchant visit by the Cycle: the same visit, one offer cheaper on each side of the boundary', () => {
    const { hero, inventory } = setup(contentV28)
    const before = dayMidpoint(DAYS_PER_CYCLE - 1)
    const after = dayMidpoint(DAYS_PER_CYCLE)
    const seed = findSeed(contentV28, hero, inventory, before, (result) => result.nextHero.merchant !== undefined)
    const visitBefore = tick(contentV28, hero, inventory, seed, before).nextHero.merchant!
    const visitAfter = tick(contentV28, hero, inventory, seed, after).nextHero.merchant!
    const control = tick(unlitV28, hero, inventory, seed, before).nextHero.merchant!
    expect(visitBefore.offers.map((o) => o.id)).toEqual(control.offers.map((o) => o.id))
    for (const [i, offer] of control.offers.entries()) {
      const expectedBefore = offer.id === 'potions' ? Math.max(1, Math.floor((offer.price * 95) / 100)) : offer.price
      const expectedAfter = offer.id === 'pouch' ? Math.max(1, Math.floor((offer.price * 95) / 100)) : offer.price
      expect(visitBefore.offers[i]!.price).toBe(expectedBefore)
      expect(visitAfter.offers[i]!.price).toBe(expectedAfter)
    }
    expect(visitBefore.offers[0]!.price).toBeLessThan(control.offers[0]!.price)
  })
})

describe('the Axis (2B.2)', () => {
  it('nudges only the favoured stance’s thresholds, by five, and Midheaven favours no one', () => {
    const stances = contentV28.stances!
    const ascendant = skyForTick(contentV28, dayMidpoint(0))
    const skybottom = skyForTick(contentV28, dayMidpoint(9))
    const descendant = skyForTick(contentV28, dayMidpoint(18))
    const midheaven = skyForTick(contentV28, dayMidpoint(27))
    expect([ascendant, skybottom, descendant, midheaven].map((s) => s!.date.axis)).toEqual(['Ascendant', 'Skybottom', 'Descendant', 'Midheaven'])
    expect(skyStance(ascendant, 'bold', stances.bold)).toEqual({ ...stances.bold, autoPotionBelowPct: stances.bold.autoPotionBelowPct - 5, restBelowPct: stances.bold.restBelowPct - 5 })
    expect(skyStance(ascendant, 'cautious', stances.cautious)).toBe(stances.cautious)
    expect(skyStance(skybottom, 'cautious', stances.cautious)).toEqual({ ...stances.cautious, autoPotionBelowPct: stances.cautious.autoPotionBelowPct + 5 })
    expect(skyStance(descendant, 'balanced', stances.balanced)).toEqual({ ...stances.balanced, resumeExploringAtPct: stances.balanced.resumeExploringAtPct - 5 })
    for (const id of ['cautious', 'balanced', 'bold'] as const) expect(skyStance(midheaven, id, stances[id])).toBe(stances[id])
    expect(skyStance(undefined, 'bold', stances.bold)).toBe(stances.bold)
  })

  it('makes a Guarded hero drink five points earlier at Skybottom, and a Reckless one five points later at Ascendant', () => {
    const cautious = setup(contentV28, { stance: 'cautious' })
    const max = heroMaxHp(contentV28, cautious.hero)
    // 67%: above Guarded's drinking line (65) and below the nudged one (70).
    const guarded = { ...cautious.hero, hp: Math.ceil((max * 67) / 100) }
    expect(tick(contentV28, guarded, cautious.inventory, 1, dayMidpoint(9)).metrics.potionsUsed).toBe(1)
    expect(tick(unlitV28, guarded, cautious.inventory, 1, dayMidpoint(9)).metrics.potionsUsed).toBe(0)
    // The same hero on an Ascendant day is not favoured and drinks as always.
    expect(tick(contentV28, guarded, cautious.inventory, 1, dayMidpoint(2)).metrics.potionsUsed).toBe(0)
    const bold = setup(contentV28, { stance: 'bold' })
    // 32%: below Reckless's drinking line (35) and above the nudged one (30).
    const reckless = { ...bold.hero, hp: Math.ceil((max * 32) / 100) }
    expect(tick(unlitV28, reckless, bold.inventory, 1, dayMidpoint(2)).metrics.potionsUsed).toBe(1)
    expect(tick(contentV28, reckless, bold.inventory, 1, dayMidpoint(2)).metrics.potionsUsed).toBe(0)
  })
})

describe('the daily aria (2B.2)', () => {
  it('grants the day’s passive and nothing on a day without one', () => {
    for (let day = 0; day < 60; day += 1) {
      const sky = skyForTick(contentV28, dayMidpoint(day))!
      const passive = SKY_V28.aria[sky.aria.id]!
      const mods = skyModifiers(sky, 'office_cubicles')!
      for (const [key, value] of Object.entries(passive.modifiers)) expect(mods[key as keyof typeof mods]).toBeGreaterThanOrEqual(value)
    }
    const sky = skyForTick(contentV28, dayMidpoint(5))!
    expect(skyModifiers({ ...sky, rule: { ...SKY_V28, aria: {}, gyre: { ...SKY_V28.gyre, favoured: Object.fromEntries(Object.keys(SKY_V28.gyre.favoured).map((id) => [id, 'nowhere'])) as never } } }, 'server_room')).toBeUndefined()
    expect(skyModifiers(undefined, 'server_room')).toBeUndefined()
  })

  it('scales a victory’s reward by the aria, rolled exactly as without it', () => {
    let day = 0
    while (SKY_V28.aria[dailyAria(day).id]?.modifiers.goldPct === undefined) day += 1
    const share = SKY_V28.aria[dailyAria(day).id]!.modifiers.goldPct!
    const { hero, inventory } = setup(contentV28, { biomeId: 'office_cubicles' })
    const at = dayMidpoint(day)
    const seed = findSeed(contentV28, hero, inventory, at, (result) => result.metrics.victories === 1 && (result.event?.deltas.gold ?? 0) > 0)
    const lit = tick(contentV28, hero, inventory, seed, at)
    const control = tick(unlitV28, hero, inventory, seed, at)
    expect(control.metrics.victories).toBe(1)
    expect(lit.event!.deltas.gold).toBe(scaled(control.event!.deltas.gold, share))
  })
})

describe('conjunctions (2B.2)', () => {
  it('doubles salvage on a conjunction day and on no other', () => {
    let day = 1
    while (!(conjunction(day).length >= 2 && conjunction(day - 1).length < 2)) day += 1
    expect(shardMultiplier(skyForTick(contentV28, dayMidpoint(day)))).toBe(2)
    expect(shardMultiplier(skyForTick(contentV28, dayMidpoint(day - 1)))).toBe(1)
    expect(shardMultiplier(skyForTick(contentV27, dayMidpoint(day)))).toBe(1)
    expect(shardMultiplier(undefined)).toBe(1)
    const kit = starterKit(contentV28)
    const plain = salvageYield(contentV28, kit.weapon)
    const doubled = salvageYield(contentV28, kit.weapon, shardMultiplier(skyForTick(contentV28, dayMidpoint(day))))
    expect(Object.keys(plain)).toHaveLength(1)
    for (const [id, count] of Object.entries(plain)) expect(doubled[id]).toBe(count * 2)
    expect(salvageYield(contentV28, kit.weapon, 1)).toEqual(plain)
  })
})

describe('determinism (2B.2)', () => {
  it('gives the same tick for the same input, the same sky through the day, and no sky without a wall slot', () => {
    const { hero, inventory } = setup(contentV28)
    const noon = dayMidpoint(40)
    const first = tick(contentV28, hero, inventory, 7, noon)
    expect(tick(contentV28, hero, inventory, 7, noon)).toEqual(first)
    // Three hours later is the same Volta day, so the same sky and the same tick.
    expect(tick(contentV28, hero, inventory, 7, noon + 3 * 60 * 60 * 1000)).toEqual(first)
    expect(skyForTick(contentV28, noon)!.date.day).toBe(40)
    // Without a wall slot v28 has no sky: the tick is v27's with v28's words.
    const dark = tick(contentV28, hero, inventory, 7, undefined)
    const plain = tick(unlitV28, hero, inventory, 7, undefined)
    expect(dark.nextHero).toEqual(plain.nextHero)
    expect(dark.metrics).toEqual(plain.metrics)
  })
})
