import { describe, expect, it } from 'vitest'
import { catalogs } from '@trmnl-games/wardenwatch/content'
import { contentV27 } from '@trmnl-games/wardenwatch/content/v27'
import { contentV28 } from '@trmnl-games/wardenwatch/content/v28'
import { validateCatalog } from '@trmnl-games/wardenwatch/content/validate'
import { fill } from '@trmnl-games/wardenwatch/sim/core/narrative'
import type { ContentCatalog, HeroState, SimulationResult } from '@trmnl-games/wardenwatch/sim/core/types'
import { POLICIES, simulateCohort } from '../../tools/balance/run'

/**
 * Content v28 re-themes Desk Crawler's office to Volta (Wardenwatch) and changes nothing a player cannot read. Every
 * number is v27's: this file proves it field by field and by replaying seeded cohorts under both catalogs.
 */

/** A value with every string replaced by a marker, so two catalogs that differ only in what they say compare equal. */
const shape = (value: unknown): unknown =>
  typeof value === 'string' ? '<text>' : Array.isArray(value) ? value.map(shape) : value && typeof value === 'object' ? Object.fromEntries(Object.entries(value).map(([key, inner]) => [key, shape(inner)])) : value

/** Everything of the catalog except the keys whose record keys or values are authored text. */
const rules = ({ contentVersion: _version, narrative: _narrative, lore: _lore, ...rest }: ContentCatalog) => rest

const OLD = ['office', 'cubicle', 'printer', 'desk', 'stapler', 'roomba', 'cafeteria', 'server', 'microwave', 'coffee', 'keyboard', 'spreadsheet', 'photocopier', 'HR ', 'parking', 'garage', 'archive']

describe('content v28 (Wardenwatch, a volta game)', () => {
  it('is a valid catalog registered after v27', () => {
    expect(validateCatalog(contentV28)).toEqual([])
    expect(contentV28.contentVersion).toBe('v28')
    expect(Object.keys(catalogs).at(-1)).toBe('v28')
    expect(catalogs.v28).toBe(contentV28)
  })

  it('keeps every biome number and id, position by position', () => {
    expect(contentV28.biomes.map((b) => b.name)).toEqual(['Castellum Frigo', 'Moonbight Fjords', 'Krine Snow Fens', 'Aeon Skerry', 'Exclave Seta Ruins'])
    contentV28.biomes.forEach((biome, i) => {
      const { name: _new, ...numbers } = biome
      const { name: _old, ...before } = contentV27.biomes[i]!
      expect(numbers).toEqual(before)
    })
    expect(contentV28.safeBiomeId).toBe(contentV27.safeBiomeId)
  })

  it('keeps every monster stat line and id, position by position, four per zone', () => {
    expect(contentV28.monsters).toHaveLength(contentV27.monsters.length)
    contentV28.monsters.forEach((monster, i) => {
      const { name: _new, ...numbers } = monster
      const { name: _old, ...before } = contentV27.monsters[i]!
      expect(numbers).toEqual(before)
      expect(monster.name).not.toBe(contentV27.monsters[i]!.name)
    })
    expect(contentV28.biomes.map((b) => b.monsterIds.map((id) => contentV28.monsters.find((m) => m.id === id)!.name))).toEqual([
      ['Cellar Rime-Rat', 'Frost Wisp', 'Lantern Owl', 'Pine Marten Thief'],
      ['Moonbight Shadepup', 'Feral Pack-Runner', 'Glacier Stag', 'Fjord Crab'],
      ['Grokdeep Goblin', 'Snow Fens Fiend', 'Mrl Mnø Sahuagin', 'Fen Lantern-Eel'],
      ['Skerry Slaver', 'Patchwork Corsair', 'Rime Troll', 'Glacier Wyrmling'],
      ['Vorrak Remnant', 'Dead-Knot Vine', 'Nullborn Sentinel', 'Dream-Road Wraith'],
    ])
  })

  it('keeps every gear template, its tier, slot and stat offset, and every gear tier and rarity', () => {
    contentV28.gearTemplates.forEach((template, i) => {
      const { name: _new, ...numbers } = template
      const { name: _old, ...before } = contentV27.gearTemplates[i]!
      expect(numbers).toEqual(before)
    })
    expect(contentV28.gearTemplates.map((t) => t.name)).toEqual([
      'Garrison Shortsword', 'Alraaei Crook-Blade', 'Padded Gambeson', 'Frigo Greatcoat',
      'Iron-Shod Pike', 'Copper-Bound Axe', 'Fenwalker Leathers', 'Ironvein Mail',
      'Silvered Glaive', 'Lodestone Maul', 'Lead-Veiled Brigandine', 'Stellar-Forged Plate',
    ])
    expect(contentV28.gearTiers).toEqual(contentV27.gearTiers)
    expect(contentV28.rarities).toEqual(contentV27.rarities)
    expect(contentV28.affixRarities).toEqual(contentV27.affixRarities)
  })

  it('keeps every pack and draught-case capacity, milestone and price, position by position', () => {
    expect(contentV28.bagLadder.findPermille).toBe(contentV27.bagLadder.findPermille)
    contentV28.bagLadder.tiers.forEach((tier, i) => {
      const { name: _new, ...numbers } = tier
      const { name: _old, ...before } = contentV27.bagLadder.tiers[i]!
      expect(numbers).toEqual(before)
    })
    expect(contentV28.bagLadder.tiers.slice(0, 5).map((t) => t.name)).toEqual(['Satchel', "Shepherd's Scrip", 'Pilgrim Pack', "Cartographer's Case", 'Expedition Strongbox'])
    expect(contentV28.potionPouch!.findPermille).toBe(contentV27.potionPouch!.findPermille)
    contentV28.potionPouch!.tiers.forEach((tier, i) => {
      const { name: _new, ...numbers } = tier
      const { name: _old, ...before } = contentV27.potionPouch!.tiers[i]!
      expect(numbers).toEqual(before)
    })
  })

  it('keeps every draught strength, drop weight and recipe, and the starter draught', () => {
    contentV28.potions!.strengths.forEach((strength, i) => {
      const { name: _new, ...numbers } = strength
      const { name: _old, ...before } = contentV27.potions!.strengths[i]!
      expect(numbers).toEqual(before)
    })
    expect(contentV28.potions!.strengths.map((s) => s.name)).toEqual(['Small Draught', 'Draught', 'Strong Draught'])
    expect(contentV28.potions!.dropWeightsByTier).toEqual(contentV27.potions!.dropWeightsByTier)
    expect(contentV28.potions!.combine).toEqual(contentV27.potions!.combine)
    expect(contentV28.potion.templateId).toBe(contentV27.potion.templateId)
    expect(contentV28.constants).toEqual(contentV27.constants)
  })

  it('keeps every other rule the same once the words are taken out', () => {
    expect(shape(rules(contentV28))).toEqual(shape(rules(contentV27)))
    // The authored-text records keep v27's keys: the same zones, monsters and floors have lines and notes.
    expect(Object.keys(contentV28.narrative.biomes)).toEqual(Object.keys(contentV27.narrative.biomes))
    expect(Object.keys(contentV28.narrative.monsters).sort()).toEqual(Object.keys(contentV27.narrative.monsters).sort())
    expect(Object.keys(contentV28.narrative.shared)).toEqual(Object.keys(contentV27.narrative.shared))
    expect(Object.keys(contentV28.lore!.biomes)).toEqual(Object.keys(contentV27.lore!.biomes))
    expect(Object.keys(contentV28.lore!.monsters)).toEqual(Object.keys(contentV27.lore!.monsters))
    // The calendar is untouched until the Volta sky events replace it.
    expect(contentV28.occasions).toBe(contentV27.occasions)
  })

  it('names the Volta sets: stances, classes, shards, commissions, orders and the moneychanger', () => {
    expect(Object.values(contentV28.stances!).map((s) => s.name)).toEqual(['Guarded', 'Steady', 'Reckless'])
    expect(Object.values(contentV28.classes!).map((c) => c.name)).toEqual(['Knight', 'Assassin'])
    expect(contentV28.workbench!.materials.map((m) => m.name)).toEqual(['Stellazia Grit', 'Stellazia Flake', 'Stellazia Facet'])
    expect(contentV28.career!.rungs.map((r) => r.id)).toEqual(contentV27.career!.rungs.map((r) => r.id))
    expect(contentV28.career!.rungs.find((r) => r.id === 'level_4')!.title).toMatch(/sworn/)
    expect(contentV28.career!.rungs.find((r) => r.id === 'level_8')!.title).toMatch(/Banneret/)
    expect(contentV28.career!.rungs.find((r) => r.id === 'level_16')!.title).toMatch(/Warden-sworn/)
    expect(contentV28.todo!.templates.map((t) => t.kind)).toEqual(contentV27.todo!.templates.map((t) => t.kind))
    for (const line of contentV28.narrative.shared.merchant) expect(line).toContain('[[Serpentos Factor]]')
  })

  it('leaves no office word in anything a player reads', () => {
    const strings = (value: unknown): string[] => typeof value === 'string' ? [value] : value && typeof value === 'object' ? Object.values(value).flatMap(strings) : []
    const { occasions: _calendar, ...rest } = contentV28
    // Ids (snake case, no spaces) stay as they were: the art, the starter kit and the floor pictures key by them.
    const prose = strings(rest).filter((text) => !/^[a-z0-9_]+$/.test(text))
    const offenders = prose.filter((text) => OLD.some((word) => text.toLowerCase().includes(word.toLowerCase())))
    expect(offenders).toEqual([])
  })

  it('writes every line in a form the log presenter and the device already handle', () => {
    const vars = { gold: 5, xp: 14, damage: 12, heal: 20, monster: 'Fjord Crab', item: 'Lodestone Maul', destination: 'Aeon Skerry', ticks: 8, capacity: 16, potion: 'strong draught', rival: 'Ana' }
    const strings = (value: unknown): string[] => typeof value === 'string' ? [value] : value && typeof value === 'object' ? Object.values(value).flatMap(strings) : []
    const pools = [contentV28.narrative, contentV28.raids!.narrative, contentV28.lostProperty!.narrative, contentV28.standoff!.narrative, contentV28.meetings!.kinds.map((k) => [k.starter, k.partner, k.compact])]
    for (const template of pools.flatMap(strings)) {
      const line = fill(template, vars)
      expect(line, template).not.toMatch(/\{\w+\}/)
      expect([...line].length, template).toBeLessThanOrEqual(contentV28.constants.summaryMaxCodePoints)
    }
  })

  it('replays seeded cohorts exactly as v27: same state, same metrics, only the words differ', { timeout: 60_000 }, () => {
    // A merchant visit stores the offers' names on the hero, the one place authored text reaches hero state.
    const wordless = (hero: HeroState): HeroState => (hero.merchant ? { ...hero, merchant: { ...hero.merchant, offers: hero.merchant.offers.map(({ name: _name, ...offer }) => ({ ...offer, name: '<text>' })) } } : hero)
    const replay = (content: ContentCatalog) => {
      const trace: { hero: HeroState; metrics: SimulationResult['metrics']; kinds: string[]; items: number }[] = []
      simulateCohort(POLICIES[1]!, 4, 20, content, undefined, undefined, 'warrior', (_hero, _tick, _before, result) => {
        trace.push({ hero: wordless(result.nextHero), metrics: result.metrics, kinds: [result.event?.kind ?? 'none', ...(result.extraEvents ?? []).map((e) => e.kind)], items: result.itemChanges.length })
      })
      return trace
    }
    const before = replay(contentV27)
    const after = replay(contentV28)
    expect(after.length).toBe(before.length)
    expect(after.length).toBeGreaterThan(1000)
    expect(after).toEqual(before)
  })
})
