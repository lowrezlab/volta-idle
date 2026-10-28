import { describe, expect, it } from 'vitest'
import { contentV28 } from '@trmnl-games/wardenwatch/content/v28'
import { DAY_MS, VOLTA_EPOCH_MS } from '@trmnl-games/wardenwatch/sim/core/calendar'
import { eldritchPool, eldritchSlot, isEldritchTick, TICK_MS, TICKS_PER_DAY } from '@trmnl-games/wardenwatch/sim/core/narrative'
import { simulateHero, SIMULATION_VERSION } from '@trmnl-games/wardenwatch/sim/core/simulate'
import { heroMaxHp } from '@trmnl-games/wardenwatch/sim/core/stats'
import { starterHero, starterKit } from '@trmnl-games/wardenwatch/sim/core/starter'
import type { ContentCatalog, HeroState, ItemSnapshot, StreamSeeds } from '@trmnl-games/wardenwatch/sim/core/types'
import { seeds, withId } from './helpers'

/**
 * GDD §8, P4.3: Ur-Turul's log is a dry survey, and the horror under it shows through in at most one line a day. The
 * catalog marks the lines with the sky's weight (`narrative.eldritch`); the simulator tells them only on the day's
 * eldritch slot, a quarter hour drawn from the Volta day alone, and there it prefers them.
 */

const ELDRITCH = contentV28.narrative.eldritch!

/** A template as a matcher for the summaries it fills: every `{var}` is anything, marks and consequences included. */
const matcher = (template: string) => new RegExp(`^${template.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\\\{\w+\\\}/g, '.+?')}`)
const MATCHERS = ELDRITCH.map(matcher)
const isEldritchSummary = (summary: string) => MATCHERS.some((re) => re.test(summary))

/** Every stream a v28 tick draws from. */
const streams = (seed: number): StreamSeeds => ({ ...seeds(seed), quest: (seed * 1597334677 + 11) >>> 0, raid: (seed * 2971215073 + 5) >>> 0, meeting: (seed * 433494437 + 7) >>> 0, graveyard: (seed * 1836311903 + 9) >>> 0 })

function setup(content: ContentCatalog): { hero: HeroState; inventory: ItemSnapshot[] } {
  const kit = starterKit(content)
  const inventory = [withId(kit.weapon, 'i000'), withId(kit.armor, 'i001'), withId({ ...kit.potions, quantity: 3 }, 'i999')]
  const base: HeroState = { ...starterHero('hero1', content, 0), weaponId: 'i000', armorId: 'i001', level: 20, biomeId: 'parking_garage', gold: 400, bagCapacity: 13, potionCap: 20 }
  return { hero: { ...base, hp: heroMaxHp(content, base) }, inventory }
}

describe('the eldritch slot (GDD §8)', () => {
  it('marks eleven lines in v28, each one in a pool it belongs to', () => {
    expect(ELDRITCH.length).toBe(11)
    const pools = new Set<string>()
    for (const biome of Object.values(contentV28.narrative.biomes)) for (const list of Object.values(biome)) if (Array.isArray(list)) for (const line of list) if (typeof line === 'string') pools.add(line)
    for (const line of ELDRITCH) expect(pools.has(line), line).toBe(true)
  })

  it('falls on exactly one tick of every Volta day, from the day alone, and wanders', () => {
    const slots = new Set<number>()
    for (let day = 0; day < 400; day += 1) {
      const slot = eldritchSlot(day)
      expect(slot).toBe(eldritchSlot(day))
      expect(slot).toBeGreaterThanOrEqual(0)
      expect(slot).toBeLessThan(TICKS_PER_DAY)
      slots.add(slot)
      const start = VOLTA_EPOCH_MS + day * DAY_MS
      const hits = Array.from({ length: TICKS_PER_DAY }, (_, index) => isEldritchTick(start + index * TICK_MS)).filter(Boolean).length
      expect(hits).toBe(1)
      expect(isEldritchTick(start + slot * TICK_MS)).toBe(true)
      // The slot holds for the whole quarter hour, not only on its first instant.
      expect(isEldritchTick(start + slot * TICK_MS + TICK_MS - 1)).toBe(true)
    }
    expect(slots.size).toBeGreaterThan(50)
  })

  it('keeps the eldritch lines out of the pool off the slot, and prefers them on it', () => {
    const pool = ['A plain note.', 'Another plain note.', 'The nothing listened back.']
    const eldritch = ['The nothing listened back.']
    expect(eldritchPool(pool, eldritch, false)).toEqual(['A plain note.', 'Another plain note.'])
    expect(eldritchPool(pool, eldritch, true)).toEqual(['The nothing listened back.'])
    // A pool with no eldritch line is itself on the slot; a pool of nothing but eldritch lines is itself off it.
    expect(eldritchPool(['A plain note.'], eldritch, true)).toEqual(['A plain note.'])
    expect(eldritchPool(eldritch, eldritch, false)).toEqual(eldritch)
    // Catalogs before v28 mark nothing, and every line is told as drawn.
    expect(eldritchPool(pool, undefined, false)).toBe(pool)
    expect(eldritchPool(pool, [], true)).toBe(pool)
  })

  it('tells a hero at most one eldritch line a day, and only on the slot, across sixty days in the ruins', { timeout: 60_000 }, () => {
    const { hero, inventory } = setup(contentV28)
    const days = 60
    const perDay = new Map<number, number>()
    let eldritchSummaries = 0
    let offSlotSummaries = 0
    for (let day = 0; day < days; day += 1) {
      for (let slot = 0; slot < TICKS_PER_DAY; slot += 1) {
        const tickAt = VOLTA_EPOCH_MS + day * DAY_MS + slot * TICK_MS
        const tick = day * TICKS_PER_DAY + slot + 1
        const result = simulateHero({ hero, inventory, tick, content: contentV28, simulationVersion: SIMULATION_VERSION, streams: streams(tick), tickAt })
        const summaries = [result.event?.summary, ...(result.extraEvents ?? []).map((event) => event.summary)].filter((summary): summary is string => summary !== undefined)
        for (const summary of summaries) {
          if (!isEldritchSummary(summary)) continue
          eldritchSummaries += 1
          perDay.set(day, (perDay.get(day) ?? 0) + 1)
          if (slot !== eldritchSlot(day)) offSlotSummaries += 1
        }
      }
    }
    expect(offSlotSummaries).toBe(0)
    for (const [day, count] of perDay) expect(count, `day ${day}`).toBeLessThanOrEqual(1)
    // The slot lands on a fight or a rest often enough that the horror does show through.
    expect(eldritchSummaries).toBeGreaterThan(5)
  })

  it('tells the same tick the same line whether the slot is found from tickAt or from the tick count', () => {
    const { hero, inventory } = setup(contentV28)
    const day = 3
    const slot = eldritchSlot(day)
    const tick = Math.floor((VOLTA_EPOCH_MS + day * DAY_MS) / TICK_MS) + slot
    const byInstant = simulateHero({ hero, inventory, tick, content: contentV28, simulationVersion: SIMULATION_VERSION, streams: streams(7), tickAt: tick * TICK_MS })
    const byCount = simulateHero({ hero, inventory, tick, content: contentV28, simulationVersion: SIMULATION_VERSION, streams: streams(7) })
    expect(byCount.event?.summary).toBe(byInstant.event?.summary)
    expect(isEldritchTick(tick * TICK_MS)).toBe(true)
  })
})
