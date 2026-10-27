import type { SkyRule } from '../sim/core/types'

/*
 * The Volta sky's hooks (2B.2, GDD §6.2): every number the sky moves in one table, so Lou tunes it here and nowhere
 * else. Magnitudes from the GDD where it gives them (Gyre XP +5%, Axis thresholds shift by 5, conjunction doubles
 * shards); the rest stay small nudges (≤5%, `SKY_MAX_PCT`). Only v28 carries this table: v27 has no sky.
 *
 * - Gyre: the year's Warden favours one zone (its "creature family"); victory XP there is up 5%.
 * - Cycle: the Serpentos moneychanger's featured offer rotates with the Cardinal Cycle, 5% off for the Cycle.
 * - Axis: Ascendant (rising) favours Reckless, which pushes 5 points further before drinking or resting; Skybottom
 *   favours Guarded, which drinks 5 points earlier; Descendant favours Steady, which is back out 5 points sooner.
 *   Midheaven, the still Axis, favours no one.
 * - Aria: the Warden whose moon is fullest grants a named passive for the day; the dead Maiden and the Watcher never
 *   carry the aria (`SKY_EXCLUDED`).
 * - Conjunction: two or more full moons double every salvage yield for the day.
 *
 * Passive names and blurbs are player-visible English, translated by key in ../i18n (D169); the Wardens' names stay.
 * Authored names are reserved content (LICENSE exclusions), not MIT code.
 */
export const SKY_V28: SkyRule = {
  gyre: {
    xpPct: 5,
    favoured: {
      'chained-maiden': 'office_cubicles',
      leviathan: 'server_room',
      wyrm: 'archive',
      magnus: 'parking_garage',
      'blooming-horror': 'parking_garage',
      'veil-hound': 'server_room',
      betrayer: 'archive',
      conjoined: 'cafeteria_depths',
      'eldritch-beast': 'cafeteria_depths',
      titan: 'archive',
      eclipse: 'parking_garage',
      watcher: 'office_cubicles',
    },
  },
  cycle: { discountPct: 5, rotation: ['potions', 'pouch', 'bag'] },
  axis: {
    Ascendant: { stance: 'bold', autoPotionBelowPct: -5, restBelowPct: -5 },
    Skybottom: { stance: 'cautious', autoPotionBelowPct: 5 },
    Descendant: { stance: 'balanced', resumeExploringAtPct: -5 },
  },
  aria: {
    leviathan: { name: 'Deep Hide', blurb: 'Defense up 5% today.', modifiers: { defensePct: 5 } },
    wyrm: { name: "Wyrm's Bite", blurb: 'Attack up 5% today.', modifiers: { attackPct: 5 } },
    magnus: { name: "Magnus' Lesson", blurb: 'XP up 5% today.', modifiers: { xpPct: 5 } },
    'blooming-horror': { name: 'Blooming Mend', blurb: 'Heals 5% after each win today.', modifiers: { healOnVictoryPct: 5 } },
    'veil-hound': { name: "Hound's Nose", blurb: 'Auro up 5% today.', modifiers: { goldPct: 5 } },
    betrayer: { name: "Betrayer's Purse", blurb: 'Keeps 5% more Auro on a retreat or a knockout today.', modifiers: { goldLossPct: 5 } },
    conjoined: { name: 'Twin Step', blurb: 'Traps hurt 5% less today.', modifiers: { trapDamagePct: 5 } },
    'eldritch-beast': { name: "Beast's Hide", blurb: 'Attack and defense up 3% today.', modifiers: { attackPct: 3, defensePct: 3 } },
    titan: { name: "Titan's Shoulder", blurb: 'Defense up 5% today.', modifiers: { defensePct: 5 } },
    eclipse: { name: 'Eclipse Sight', blurb: 'XP and Auro up 3% today.', modifiers: { xpPct: 3, goldPct: 3 } },
  },
  conjunction: { shardMultiplier: 2 },
}
