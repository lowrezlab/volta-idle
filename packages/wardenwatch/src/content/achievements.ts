import type { HeroClass, NumericCounter } from '../sim/core/types'

/**
 * Survey entries (achievements.md, D65): the catalog of achievements, narrated
 * by Ur-Turul, cartographer-captain at Castellum Frigo, who keeps the survey.
 * Content, versioned like the monster catalog: ids are append-only and never
 * reused; renaming an entry is a copy change, changing a threshold is a new
 * id. Every predicate reads only bounded hero state (lifetime counters, level,
 * pack capacity, seal total), never logs, so a hero who did the deed before an
 * entry existed earns it on the first evaluation after release.
 *
 * Family and tier ids carry their Desk Crawler spellings (`slay_paper_imp`,
 * `office_raider`): they are stored on heroes and in logs, so only the copy
 * moved to Volta. Categories are shelf keys the companion lists by.
 */
export const ACHIEVEMENTS_VERSION = 13

export type AchievementPredicate =
  | { readonly kind: 'counter'; readonly counter: NumericCounter; readonly atLeast: number }
  | { readonly kind: 'monster'; readonly monsterId: string; readonly atLeast: number }
  | { readonly kind: 'level'; readonly atLeast: number }
  | { readonly kind: 'bag'; readonly atLeast: number }
  | { readonly kind: 'keepsakes'; readonly atLeast: number }
  /** Every monster in the pinned catalog defeated at least `atLeast` times. */
  | { readonly kind: 'everyMonster'; readonly atLeast: number }
  /** At least one monster of every biome defeated at least `atLeast` times. */
  | { readonly kind: 'everyBiome'; readonly atLeast: number }
  /** Every monster of one biome defeated at least `atLeast` times. */
  | { readonly kind: 'biomeMonsters'; readonly biomeId: string; readonly atLeast: number }
  /** P37: the hero being evaluated is of this class and at least this level. */
  | { readonly kind: 'classLevel'; readonly heroClass: HeroClass; readonly atLeast: number }
  /** P37: the hero being evaluated is of this class and its counter is at least this. */
  | { readonly kind: 'classCounter'; readonly heroClass: HeroClass; readonly counter: NumericCounter; readonly atLeast: number }

export interface AchievementFamily {
  readonly id: string
  readonly name: string
  /** Shown on an unearned family's "?" card instead of its name. */
  readonly category: string
}

export interface AchievementDef {
  readonly id: string
  readonly family: string
  /** 1-based rung within the family; set pieces are tier 1 of a one-tier family. */
  readonly tier: number
  readonly name: string
  readonly blurb: string
  readonly predicate: AchievementPredicate
}

/** Monster and elite families share one ladder (achievements.md "Catalog rules"). */
export const MONSTER_LADDER = [1, 5, 25, 100, 500] as const

type TierCopy = readonly (readonly [name: string, blurb: string])[]

const families: AchievementFamily[] = []
const defs: AchievementDef[] = []

function family(id: string, name: string, category: string, tiers: TierCopy, predicate: (tier: number) => AchievementPredicate): void {
  families.push({ id, name, category })
  tiers.forEach(([tierName, blurb], index) => {
    // A one-tier family (a set piece) is its own id; ladders number their rungs.
    defs.push({ id: tiers.length === 1 ? id : `${id}_${index + 1}`, family: id, tier: index + 1, name: tierName, blurb, predicate: predicate(index) })
  })
}

const monster = (monsterId: string, name: string, zone: string, tiers: TierCopy) =>
  family(`slay_${monsterId}`, name, `${zone} monster`, tiers, (i) => ({ kind: 'monster', monsterId, atLeast: MONSTER_LADDER[i]! }))

const counter = (id: string, name: string, category: string, key: NumericCounter, ladder: readonly number[], tiers: TierCopy) =>
  family(id, name, category, tiers, (i) => ({ kind: 'counter', counter: key, atLeast: ladder[i]! }))

// ---------------------------------------------------------------- monster families

monster('paper_imp', 'Cellar Rime-Rat', 'Castellum Frigo', [
  ['Grate Duty', 'Chased a rime-rat out of the grain, frost and all.'],
  ['Cellar Regular', 'Five rats put out through the grate.'],
  ['Rat-Catcher', 'The grain cellar is clear of rats.'],
  ['Dry Stores', 'The quartermaster wrote a note about it.'],
  ['Rat Legend', 'A notch on the cellar door for every one.'],
])
monster('rogue_roomba', 'Frost Wisp', 'Castellum Frigo', [
  ['Blown Out', 'Walked through one and it came apart.'],
  ['Cold Snap', 'Five wisps blown out.'],
  ['Wisp Walker', 'Twenty-five wisps walked through.'],
  ['Warm Tents', 'A hundred wisps. The tents stay warm.'],
  ['Lamplighter', 'The night watch sent a thank-you.'],
])
monster('stapler_mimic', 'Lantern Owl', 'Castellum Frigo', [
  ['Shuttered', 'Shuttered the lantern on one.'],
  ['Perch Cleared', 'Five owls off the gatepost.'],
  ['Owl Spotter', 'You check every gatepost twice.'],
  ['Watch Warden', 'You have seen every perch on the wall.'],
  ['The Owl Feather', 'The feather is yours to keep.'],
])
monster('dust_daemon', 'Pine Marten Thief', 'Castellum Frigo', [
  ['Spoon Returned', 'Got the spoon back from one.'],
  ['Pitch on the Sill', 'Sent five martens up their pines.'],
  ['Thief-Taker', 'The cook counts the spoons less often.'],
  ['Spring Clearing', 'Every sill pitched.'],
  ['Spotless Stores', 'You can see your face in the ladle.'],
])
monster('cable_serpent', 'Moonbight Shadepup', 'Moonbight Fjords', [
  ['Untangled', 'Freed one from the nets and sent it home.'],
  ['Net Mender', 'Five pups out of the drying nets.'],
  ['Shore Steward', 'Every net checked at both ends.'],
  ['Pack Friend', 'The pack lets you pass the tree line.'],
  ['Moonbight Fixture', 'Avgo Noctis has heard your name.'],
])
monster('overheated_rack', 'Feral Pack-Runner', 'Moonbight Fjords', [
  ['Walked Down', 'Talked one down to a walk.'],
  ['Out of Wind', 'Five runners run out of wind.'],
  ['Frontier Scout', 'The pack keeps its distance.'],
  ['Cold Trail', 'Coat required.'],
  ['Still Frontier', 'The tree line is quiet.'],
])
monster('firewall_gremlin', 'Glacier Stag', 'Moonbight Fjords', [
  ['Seaward Side', 'Got round one on the seaward side.'],
  ['Cliff Path Open', 'Five stags argued off the path.'],
  ['Right of Way', 'The stags give way now.'],
  ['Antler Count', 'A hundred stags logged.'],
  ['Path Warden', 'The cliff path marker has your name on it.'],
])
monster('legacy_mainframe', 'Fjord Crab', 'Moonbight Fjords', [
  ['Flipped', 'Finally flipped a fjord crab.'],
  ['Tide Line Lead', 'Levered one back into the water and left the hull plugged, just in case.'],
  ['Shell Native', 'Nobody remembers the crab days.'],
  ['End of the Tide', 'Extended patience declined.'],
  ['Last Crab Standing', 'Somebody still has to watch the tide line.'],
])
monster('coffee_slime', 'Grokdeep Goblin', 'Krine Snow Fens', [
  ['Down the Hole', 'Sent one back down to Grokdeep.'],
  ['Road Clear', 'With the rest of the raiding party.'],
  ['Toll Keeper', 'The supply road only stocks patience now.'],
  ['Grokdeep Mapped', 'A sketch of the hole, from a safe distance.'],
  ['Fen Road Master', 'Five hundred goblins off the road.'],
])
monster('crumb_golem', 'Snow Fens Fiend', 'Krine Snow Fens', [
  ['Into the Thaw', 'Walked one into the thaw.'],
  ['Fog Breaker', 'Not a wisp of fog left for the marsh birds.'],
  ['Fen Walker', 'Every pool in the fens.'],
  ['Thin Ice Rule', 'Fiends stay under the ice longer than you expect.'],
  ['Fen Legend', 'You earned the dry boots.'],
])
monster('microwave_wraith', 'Mrl Mnø Sahuagin', 'Krine Snow Fens', [
  ['Beached', 'Beached one on the far bank.'],
  ['Far Bank', 'Try sending it back and leaving it there.'],
  ['One More Hiss', 'It was still cold in the middle.'],
  ['Fish Day', 'You have smelled every sahuagin at the ford.'],
  ['Quiet Ford', 'The ford is finally quiet.'],
])
monster('leftovers_hydra', 'Fen Lantern-Eel', 'Krine Snow Fens', [
  ['Lamps Out', 'Every lantern snuffed.'],
  ['Ford Darkened', 'Put the ford dark for a whole night.'],
  ['Eel Wrangler', 'Returned to the deep water.'],
  ['Lantern Purge', 'A stern note was not needed.'],
  ['Dark Water Legend', 'The ford has been dark for a week.'],
])

// ---------------------------------------------------------------- set pieces

family('office_census', 'Survey Census', 'Set piece', [['Survey Census', 'Met every creature on the map at least once.']], () => ({ kind: 'everyMonster', atLeast: 1 }))
family('full_tour', 'Full Survey', 'Set piece', [['Full Survey', 'Won a fight in every zone.']], () => ({ kind: 'everyBiome', atLeast: 1 }))
family('floor_cleared_1', 'Castellum Cleared', 'Set piece', [['Castellum Cleared', 'Twenty-five of each inside Castellum Frigo.']], () => ({ kind: 'biomeMonsters', biomeId: 'office_cubicles', atLeast: 25 }))
family('floor_cleared_2', 'Fjords Cleared', 'Set piece', [['Fjords Cleared', 'Twenty-five of each in the Moonbight Fjords.']], () => ({ kind: 'biomeMonsters', biomeId: 'server_room', atLeast: 25 }))
family('floor_cleared_3', 'Fens Cleared', 'Set piece', [['Fens Cleared', 'Twenty-five of each in the Krine Snow Fens.']], () => ({ kind: 'biomeMonsters', biomeId: 'cafeteria_depths', atLeast: 25 }))

// ---------------------------------------------------------------- counter families

counter('elites', 'Elites', 'Lifetime', 'eliteWins', [1, 5, 25, 100], [
  ['The Yard Cheered', 'Took down your first elite.'],
  ['Old Ones', 'Five elites beaten.'],
  ['Senior Hunter', 'Title confirmed by the commander.'],
  ['Master of the Hunt', 'Elites are your department.'],
])
counter('jackpots', 'Windfalls', 'Lifetime', 'jackpots', [1, 5, 25], [
  ['Lucky Find', 'Ten times the Auro from one find.'],
  ['Bounty Approved', 'No tally required.'],
  ['Pay Chest', 'You know where it is kept.'],
])
counter('rare_finds', 'Rare finds', 'Lifetime', 'rareFinds', [1, 5, 25, 100], [
  ['Starlit', 'Found your first rare piece of gear.'],
  ['Collector', 'Five rare finds and counting.'],
  ['Curator', 'Twenty-five rare finds, all catalogued.'],
  ['The Strongroom', 'A hundred rare finds in one chest.'],
])
counter('adventures', 'Adventures', 'Lifetime', 'ticksExplored', [1, 100, 500, 2500, 10000], [
  ['First Day', 'Found the cookhouse and your cot.'],
  ['Oath Kept', 'A day and a bit on the road.'],
  ['Weekly Muster', 'Roughly a week on the watch.'],
  ['Monthly Dispatch', 'A full month of fifteen-minute marches.'],
  ['Long Service', 'A carriage clock would be appropriate. There are no clocks.'],
])
counter('finds', 'Finds', 'Lifetime', 'itemsFound', [10, 100, 1000, 5000], [
  ['Finders Keepers', 'Someone left it on their cot.'],
  ['Chest of Things', 'A hundred finds and a full chest.'],
  ['Supply Store', 'Comrades borrow from your thousand finds.'],
  ['Stray Pile', 'It all ends up with you.'],
])
counter('gold', 'Auro earned', 'Lifetime', 'goldEarned', [100, 1000, 10000, 100000], [
  ['Coins in the Straw', 'Lifetime Auro, not the current purse.'],
  ['Pay Chit', 'A thousand Auro earned, paid out after three reminders.'],
  ['Bounty Season', 'Ten thousand Auro earned, and the bounty is still discretionary.'],
  ['Golden Retirement', 'Enough Auro to retire on.'],
])
family('levels', 'Levels', 'Lifetime', [
  ['Sworn', 'The Moonbight Fjords are open.'],
  ['Banneret', 'The Krine Snow Fens are open.'],
  ['Skerry-Bound', 'Aeon Skerry is open.'],
  ['Warden-Sworn', 'The Exclave Seta ruins are open.'],
  ["Captain's Table", 'It has a window, and the shutter works.'],
], (i) => ({ kind: 'level', atLeast: [4, 8, 12, 16, 20][i]! }))
counter('knockouts', 'Knock-outs', 'Lifetime', 'deaths', [1, 5, 25, 100], [
  ['Out Cold', 'Back in two hours, a little poorer.'],
  ['Sick Note', 'Signed by the orderly.'],
  ['Regular at the Infirmary', 'They have a cot with your name on it.'],
  ['Nine Lives (Spent)', 'A hundred knockouts.'],
])
counter('rescues', 'Rescues', 'Lifetime', 'rescues', [1, 5, 25], [
  ['Muster Horn', 'The horn sounded mid-fight.'],
  ["Orderly's Friend", 'On first-name terms with the infirmary crate.'],
  ['Comrade of the Year', 'Awarded to whoever keeps rescuing you.'],
])
counter('retreats', 'Retreats', 'Lifetime', 'retreats', [1, 5, 25, 100], [
  ['Rain Check', 'Backed out of a fight to try again later.'],
  ["Night Watch's Problem", 'Left five fights for the night watch.'],
  ['Strategic Withdrawal', 'Put it in the dispatch.'],
  ['Diary Full', 'Could not possibly fit the fight in.'],
])
counter('potions', 'Draughts', 'Lifetime', 'potionsUsed', [1, 10, 100, 500], [
  ['First Draught', 'Tasted of copper.'],
  ['Crate Raider', 'The orderly put a lock on the infirmary crate.'],
  ['Apothecary', 'Draughts on request.'],
  ['Self-Medicated', 'Five hundred draughts drunk.'],
])
counter('traps', 'Snares avoided', 'Lifetime', 'trapsAvoided', [1, 25, 100, 500], [
  ['Watch Your Step', 'Spotted the snare in time.'],
  ['Thin Ice Sign', 'You put it there yourself.'],
  ['Safe Conduct', 'Completed the road-safety drill.'],
  ['Surveyed', 'Every path has a marker.'],
])
counter('breaks', 'Rests', 'Lifetime', 'restTicks', [10, 100, 1000], [
  ['By the Brazier', 'Marked down as off watch.'],
  ['Power Nap', 'Feet up in the straw.'],
  ['Off Watch', 'Back on the twelfth, roughly.'],
])
counter('trips', 'Trips', 'Lifetime', 'trips', [1, 10, 100], [
  ['Roadworthy', 'Took the road to another zone.'],
  ['No Fixed Cot', 'No fixed address.'],
  ['Frequent Marcher', 'A regular on the fjord road.'],
])
family('bags', 'Pack ladder', 'Lifetime', [
  ['Scrip Holder', 'The Satchel is retired with honours.'],
  ['Pilgrim', 'Padded straps and a map pocket.'],
  ['Cartographer', 'Worn across the body for maximum urgency.'],
  ['Strongbox', 'The pack with a lock.'],
], (i) => ({ kind: 'bag', atLeast: [10, 13, 16, 20][i]! }))
counter('sales', 'Sales', 'Lifetime', 'itemsSold', [1, 25, 250, 1000], [
  ['Camp Market', 'One careful owner.'],
  ['Declutter', 'Sold what you did not need.'],
  ['Quartermastery', 'A ledger is involved.'],
  ['Liquidation', 'Sold a thousand pieces of gear.'],
])
family('keepsakes', 'Seals', 'Lifetime', [
  ['First Seal', 'Your first seal, pressed by the cot.'],
  ['Half a Shelf', 'Half a shelf and counting.'],
  ['Full Set', 'Every seal, once.'],
  ['Second Shelf', 'The quartermaster has been informed.'],
], (i) => ({ kind: 'keepsakes', atLeast: [1, 6, 12, 24][i]! }))

// ---------------------------------------------------------------- v1.1 Decisions (catalog version 2; appended, never edited)

counter('purchases', 'Purchases', 'Decisions', 'purchases', [1, 5, 25], [
  ['Impulse Buy', 'Bought from the moneychanger.'],
  ['Known Customer', "Five marks on the factor's slate."],
  ['Preferred Customer', 'The factor waves from across the yard.'],
])
counter('merchants', 'Factors met', 'Decisions', 'merchantVisits', [1, 10, 50], [
  ['Trestle Table', 'A cart, a cloth and a price list.'],
  ['Market Day', 'Ten visits and counting.'],
  ['Trade Route', 'The factor stops by your tent first.'],
])
counter('stances', 'Stance changes', 'Decisions', 'stanceChanges', [1, 5, 25], [
  ['New Posture', 'Tried a different approach.'],
  ['Second Thoughts', 'Five changes of heart.'],
  ['Agile', 'Pivots weekly.'],
])
counter('choices', 'Decisions made', 'Decisions', 'choicesMade', [1, 5, 25, 100], [
  ['Decider', 'Answered your first decision.'],
  ['Sound Judgement', 'Five decisions, all on time.'],
  ['Council of War', 'Twenty-five decisions and a map.'],
  ['Magistrate of Decisions', 'A rank made up just for you.'],
])
counter('epics', 'Epic finds', 'Lifetime', 'epicFinds', [1, 5], [
  ['Legendary Kit', 'Found an epic piece, about one find in a hundred.'],
  ['The Good Chest', 'Five epics, under lock and key.'],
])

// ---------------------------------------------------------------- v1.2 Other people (catalog version 3, D110; appended, never edited)

counter('office_raider', 'Camp raider', 'Raids', 'raidsWon', [1, 10, 50], [
  ['Light Fingers', "Came back from someone else's tent with their purse."],
  ['Tent Burglar', 'Ten other tents are a little lighter.'],
  ['Night Burglar', 'Fifty raids won across the camp.'],
])
counter('desk_defender', 'Tent defender', 'Raids', 'raidsRepelled', [1, 10, 50], [
  ['Not Today', 'Caught a raider at the kit and showed them out.'],
  ['Camp Watch', 'Ten raiders sent packing.'],
  ['Strongbox Tent', 'Fifty raiders shown out.'],
])

// ---------------------------------------------------------------- v1.1 To-do list (catalog version 4, D112; appended, never edited)

counter('tasks_done', 'Orders done', 'Lifetime', 'tasksCompleted', [1, 10, 50, 250], [
  ['Ticked Off', 'Crossed the first order off the garrison board.'],
  ['Board Nearly Clear', 'Ten orders ticked off.'],
  ['Getting Things Done', 'Fifty orders ticked off without a single reminder.'],
  ['Squire of the Month', 'Two hundred and fifty orders ticked off.'],
])

// ---------------------------------------------------------------- v2.0 Salvage and the workbench (catalog version 5, D129; appended, never edited)

counter('salvaged', 'Salvaged', 'Lifetime', 'itemsSalvaged', [1, 25, 100], [
  ['Shard Pile', 'Broke a piece of gear down for shards instead of selling it.'],
  ['Shard Drawer', 'Broke down twenty-five pieces of gear for shards.'],
  ['Forge Foreman', 'Salvaged a hundred pieces of gear.'],
])
counter('workbench', 'The Forge', 'Lifetime', 'gearUpgraded', [1, 5, 15], [
  ['Tinkerer', 'Took a piece of gear to the Forge and made it better.'],
  ['Forge Hand', 'Finished five jobs at the Forge.'],
  ['Master of the Forge', 'Finished fifteen jobs at the Forge.'],
])

// ---------------------------------------------------------------- v2.0 Potion strengths (catalog version 6, D131; appended, never edited)

counter('mixing', 'Draught mixing', 'Lifetime', 'potionsCombined', [1, 10, 50], [
  ['Camp Chemist', 'Mixed three small draughts and some grit into a strong one.'],
  ['Mess Round', 'Mixed ten strong draughts.'],
  ['Head Apothecary', 'Mixed fifty strong draughts in the cookhouse sink.'],
])

// ---------------------------------------------------------------- v2.0 The Archive and the Parking Garage (catalog version 7, D133; appended, never edited)

monster('box_file_beetle', 'Skerry Slaver', 'Aeon Skerry', [
  ['Papers Shown', 'Produced papers and a slaver let go.'],
  ['Ledger Closed', 'Five slavers sent back to their ledgers.'],
  ['Chain Breaker', 'Twenty-five chains off, in date order.'],
  ['Free Port', 'A hundred slavers put off the skerry.'],
  ["Slaver's Bane", 'Five hundred slavers. The Chain is shorter.'],
])
monster('shelf_lurker', 'Patchwork Corsair', 'Aeon Skerry', [
  ['Cask Rolled', 'Rolled a cask over a corsair.'],
  ['Pier Monitor', 'Five corsairs cornered on the pier.'],
  ['Night Harbour', 'You know which pier it moved to.'],
  ['Quay Supervisor', 'A hundred corsairs cornered on the quay.'],
  ['Keeper of the Quay', 'Five hundred corsairs off the quay.'],
])
monster('microfilm_phantom', 'Rime Troll', 'Aeon Skerry', [
  ['Sunrise', 'Waited one out till sunrise.'],
  ['Floe Change', 'Five trolls lost the thread.'],
  ['Glacier Reader', 'Twenty-five stones and a very tired eye.'],
  ['Reading the Ice', 'A hundred trolls, all talked back into their caves.'],
  ['Thawed', 'Five hundred trolls lost the thread.'],
])
monster('auditor', 'Glacier Wyrmling', 'Aeon Skerry', [
  ['Tally Found', 'For once, you had the receipt.'],
  ['Cargo Counted', 'Five tallies with nothing to report.'],
  ['Clean Tally', 'Twenty-five wyrmlings counted out.'],
  ['Wyrm Committee', 'A hundred wyrmlings counted out.'],
  ['Scales Signed Off', 'Five hundred wyrmlings counted out.'],
])
monster('trolley_swarm', 'Vorrak Remnant', 'Exclave Seta Ruins', [
  ['Out of Thought', 'Walked one out of its own thought.'],
  ['Ramp Return', 'Five remnants back up the ramp.'],
  ['Terrace Attendant', 'Twenty-five remnants rested by the gate.'],
  ['Hive Quiet', 'A hundred remnants, rattling in rows.'],
  ['Last Thought', 'Five hundred remnants walked out.'],
])
monster('oil_slick', 'Dead-Knot Vine', 'Exclave Seta Ruins', [
  ['Cut Through', 'Took the shine off a dead-knot vine.'],
  ['Cistern Cleared', 'Five vines down the dry cistern.'],
  ['Vine Kit', 'Twenty-five vines down the cistern.'],
  ['Dry Terrace', 'A hundred vines down the cistern.'],
  ['Unclimbable', 'Five hundred vines down the cistern.'],
])
monster('barrier_golem', 'Nullborn Sentinel', 'Exclave Seta Ruins', [
  ['Stood Still', 'Standing very still does wonders.'],
  ['Wrong Password', 'Five sentinels confused.'],
  ['Gate Pass', 'Walked under twenty-five sentinels.'],
  ['Open Gate', 'Got past a hundred sentinels.'],
  ['Gateless', 'Got past five hundred sentinels.'],
])
monster('ghost_car', 'Dream-Road Wraith', 'Exclave Seta Ruins', [
  ['Woke Up', 'Woke up, and the wraith was back on its stretch by morning.'],
  ['Stepped Off', 'Five wraiths left on their road.'],
  ['Road Walker', 'Walked a wraith off the road twenty-five times.'],
  ['Road Closed', 'Walked a wraith off the road a hundred times.'],
  ['Dreamless', 'Walked a wraith off the road five hundred times.'],
])
family('floor_cleared_4', 'Skerry Cleared', 'Set piece', [['Skerry Cleared', 'Twenty-five of each in Aeon Skerry.']], () => ({ kind: 'biomeMonsters', biomeId: 'archive', atLeast: 25 }))
family('floor_cleared_5', 'Ruins Cleared', 'Set piece', [['Ruins Cleared', 'Twenty-five of each in the Exclave Seta ruins.']], () => ({ kind: 'biomeMonsters', biomeId: 'parking_garage', atLeast: 25 }))

// ---------------------------------------------------------------- P37 Classes and the roster (catalog version 8, D136; appended, never edited)

family('rogue', 'The Assassin', 'Roster', [
  ['New Recruit', 'Recruited an Assassin.'],
  ['Cutpurse', 'Your Assassin reached level 7, and the camp raids that come with it.'],
  ['Tree-Line Shadow', 'Your Assassin reached level 12.'],
  ['Master of Keys', 'Your Assassin reached level 16.'],
], (i) => ({ kind: 'classLevel', heroClass: 'rogue', atLeast: [1, 7, 12, 16][i]! }))
family('rogue_raids', 'Quiet Hands', 'Roster', [
  ['Pickpocket', 'Your Assassin won a camp raid.'],
  ['Tent-Flap Work', 'Ten raids won as an Assassin.'],
  ['The Heist', 'Fifty raids won as an Assassin.'],
], (i) => ({ kind: 'classCounter', heroClass: 'rogue', counter: 'raidsWon', atLeast: [1, 10, 50][i]! }))
family('rogue_gold', 'Deep Pockets', 'Roster', [
  ['Loose Change', 'Your Assassin has earned 1,000 Auro.'],
  ['Purse Strings', 'Your Assassin has earned 10,000 Auro.'],
  ['Slush Fund', 'Your Assassin has earned 50,000 Auro.'],
], (i) => ({ kind: 'classCounter', heroClass: 'rogue', counter: 'goldEarned', atLeast: [1000, 10000, 50000][i]! }))

// ---------------------------------------------------------------- D139 Office calendar (catalog version 9; appended, never edited)

counter('office_calendar', 'Sky calendar', 'Sky events', 'occasionsSeen', [1, 6, 12], [
  ['Signed the Roll', 'On watch for a sky event.'],
  ['Festival Committee', 'Six sky events at your post.'],
  ['Garrison Institution', 'At your post for twelve sky events.'],
])
family('thirteenth_floor', 'Thirteenth Moon', 'Raids', [['Thirteenth Moon', 'Caught in a raid that went wrong for everyone under a bad moon.']], () => ({ kind: 'counter', counter: 'raidMishaps', atLeast: 1 }))

// ---------------------------------------------------------------- D141 Meetings (catalog version 10; appended, never edited)

counter('networking', 'Musters', 'Comrades', 'meetings', [1, 10, 50], [
  ['Soup-Line Moment', 'Met another squire on the road.'],
  ['Familiar Face', 'Met other squires ten times.'],
  ['Garrison Fixture', 'Met other squires fifty times.'],
])

// ---------------------------------------------------------------- D145 Lost property (catalog version 11; appended, never edited)

counter('lost_and_found', 'Strays', 'Comrades', 'lostPropertyFound', [1, 10, 25], [
  ['Stray Found', "Found another squire's spare, mark and all."],
  ['Mark Reader', "Found ten other squires' spares."],
  ['Master of Strays', "Found twenty-five other squires' spares."],
])

// ---------------------------------------------------------------- D146 Bigger bags (catalog version 12; appended, never edited)

family('big_bags', 'Bigger packs', 'Lifetime', [
  ['Mule Panniers', 'A 24-slot pair that smells faintly of mule.'],
  ['Baggage Sledge', 'Covered in marks from places you have never been.'],
  ["Quartermaster's Store", 'A 32-slot store, and you have the only key.'],
], (i) => ({ kind: 'bag', atLeast: [24, 28, 32][i]! }))

// ---------------------------------------------------------------- D163 Dug-in elites (catalog version 13; appended, never edited)

counter('dug_in', 'Dug in', 'Lifetime', 'standoffsWon', [1, 10, 50], [
  ['Eviction Notice', 'Beat an elite that had dug in.'],
  ['Vermin Patrol', 'Beat ten elites that had dug in.'],
  ['Fort Management', 'Beat fifty elites that had dug in.'],
])

/** Families in display order. */
export const ACHIEVEMENT_FAMILIES: readonly AchievementFamily[] = families
/** Every achievement in catalog order: by family, then tier. */
export const ACHIEVEMENTS: readonly AchievementDef[] = defs
export const ACHIEVEMENT_BY_ID: ReadonlyMap<string, AchievementDef> = new Map(defs.map((def) => [def.id, def]))

export const ROMAN = ['I', 'II', 'III', 'IV', 'V'] as const
export const tierLabel = (tier: number): string => ROMAN[tier - 1] ?? String(tier)

/** Rarity bands over the share of ranked heroes holding an achievement (achievements.md "Player experience"). */
export type RarityBand = 'common' | 'uncommon' | 'rare' | 'legendary'
export function rarityBand(share: number): RarityBand {
  if (share >= 0.5) return 'common'
  if (share >= 0.1) return 'uncommon'
  if (share >= 0.01) return 'rare'
  return 'legendary'
}

/** Below this many ranked heroes the companion shows "3 of 11 heroes" instead of a percentage. */
export const RARITY_PERCENT_MIN_POPULATION = 20
