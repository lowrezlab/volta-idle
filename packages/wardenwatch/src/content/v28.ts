import type {
  AffixRule,
  BiomeNarrative,
  CareerRung,
  ChoiceOption,
  ContentCatalog,
  EffectRule,
  EventTemplate,
  LoreRule,
  LostPropertyRule,
  MeetingKind,
  MonsterNarrative,
  RaidNarrative,
  SharedNarrative,
  StandoffRule,
  TodoTemplate,
} from '../sim/core/types'
import { contentV27 } from './v27'
import { SKY_V28 } from './sky'

/*
 * Content catalog v28: Wardenwatch, a volta game.
 *
 * The office is gone. The hero is a newly sworn Squire of Castellum Frigo,
 * the Supremacy's first fort on the east shore of the Primordial Wilds, in
 * 1203 CE, the year of the Northern Expedition. The five floors become five
 * zones in the same tier order, the twenty monsters become the creatures of
 * those zones, the gear, packs, draughts, shards, stances, commissions,
 * garrison orders, musters, strays and camp raids are renamed, and every line
 * of narrative is rewritten in the voice of Ur-Turul, the fort's cartographer,
 * keeping dry survey notes. The few lines with the sky's weight are marked
 * `eldritch`, and the simulator tells at most one of them a day (GDD §8).
 *
 * Every number is v27's. Nothing here is a balance change: every stat,
 * weight, unlock level, price, capacity, drop rate, predicate and reward is
 * carried over by id from v27 (tests/sim/volta-content.test.ts proves it
 * field by field and by replaying seeded cohorts). Ids stay as they were,
 * because the scene art, the starter kit and the public floor pictures key
 * by them; only what a player reads changes.
 *
 * Gold keeps its name inside the stat fragments the log presenter strips
 * ("+{gold} gold", "{gold} gold"), because the chips carry those amounts and
 * the presenter recognises the word; the prose calls the coin Auro.
 *
 * Authored names and story text are reserved content (LICENSE exclusions), not MIT code.
 */

/** Looks a renamed entry up by id, so a missing or surplus name is a build error, never a silent gap. */
function byId<T extends { readonly id: string }, R>(what: string, entries: readonly T[], names: Readonly<Record<string, R>>, apply: (entry: T, name: R) => T): T[] {
  const seen = new Set<string>()
  const out = entries.map((entry) => {
    const name = names[entry.id]
    if (name === undefined) throw new Error(`v28 ${what} ${entry.id} has no Volta name`)
    seen.add(entry.id)
    return apply(entry, name)
  })
  for (const id of Object.keys(names)) if (!seen.has(id)) throw new Error(`v28 ${what} ${id} names an entry v27 does not have`)
  return out
}

// ---------------------------------------------------------------- zones and creatures

const ZONE_NAMES: Record<string, string> = {
  office_cubicles: 'Castellum Frigo',
  server_room: 'Moonbight Fjords',
  cafeteria_depths: 'Krine Snow Fens',
  archive: 'Aeon Skerry',
  parking_garage: 'Exclave Seta Ruins',
}

const MONSTER_NAMES: Record<string, string> = {
  paper_imp: 'Cellar Rime-Rat',
  rogue_roomba: 'Frost Wisp',
  stapler_mimic: 'Lantern Owl',
  dust_daemon: 'Pine Marten Thief',
  cable_serpent: 'Moonbight Shadepup',
  overheated_rack: 'Feral Pack-Runner',
  firewall_gremlin: 'Glacier Stag',
  legacy_mainframe: 'Fjord Crab',
  coffee_slime: 'Grokdeep Goblin',
  crumb_golem: 'Snow Fens Fiend',
  microwave_wraith: 'Mrl Mnø Sahuagin',
  leftovers_hydra: 'Fen Lantern-Eel',
  box_file_beetle: 'Skerry Slaver',
  shelf_lurker: 'Patchwork Corsair',
  microfilm_phantom: 'Rime Troll',
  auditor: 'Glacier Wyrmling',
  trolley_swarm: 'Vorrak Remnant',
  oil_slick: 'Dead-Knot Vine',
  barrier_golem: 'Nullborn Sentinel',
  ghost_car: 'Dream-Road Wraith',
}

const MONSTER_PLURALS: Record<string, string> = {
  paper_imp: 'Cellar Rime-Rats',
  rogue_roomba: 'Frost Wisps',
  stapler_mimic: 'Lantern Owls',
  dust_daemon: 'Pine Marten Thieves',
  cable_serpent: 'Moonbight Shadepups',
  overheated_rack: 'Feral Pack-Runners',
  firewall_gremlin: 'Glacier Stags',
  legacy_mainframe: 'Fjord Crabs',
  coffee_slime: 'Grokdeep Goblins',
  crumb_golem: 'Snow Fens Fiends',
  microwave_wraith: 'Mrl Mnø Sahuagin',
  leftovers_hydra: 'Fen Lantern-Eels',
  box_file_beetle: 'Skerry Slavers',
  shelf_lurker: 'Patchwork Corsairs',
  microfilm_phantom: 'Rime Trolls',
  auditor: 'Glacier Wyrmlings',
  trolley_swarm: 'Vorrak Remnants',
  oil_slick: 'Dead-Knot Vines',
  barrier_golem: 'Nullborn Sentinels',
  ghost_car: 'Dream-Road Wraiths',
}

// ---------------------------------------------------------------- gear, packs, draughts, shards

const GEAR_NAMES: Record<string, string> = {
  letter_opener: 'Garrison Shortsword',
  ruler_blade: 'Alraaei Crook-Blade',
  cardigan: 'Padded Gambeson',
  lanyard_mail: 'Frigo Greatcoat',
  cable_cutter: 'Iron-Shod Pike',
  keyboard_mace: 'Copper-Bound Axe',
  insulated_cardigan: 'Fenwalker Leathers',
  anti_static_vest: 'Ironvein Mail',
  ladle_of_ruin: 'Silvered Glaive',
  spork_halberd: 'Lodestone Maul',
  apron_of_warding: 'Lead-Veiled Brigandine',
  oven_mitt_plate: 'Stellar-Forged Plate',
}

const PACK_NAMES: Record<string, string> = {
  paper_bag: 'Satchel',
  tote_bag: "Shepherd's Scrip",
  laptop_backpack: 'Pilgrim Pack',
  messenger_bag: "Cartographer's Case",
  rolling_suitcase: 'Expedition Strongbox',
  gym_duffel: 'Mule Panniers',
  steamer_trunk: 'Baggage Sledge',
  stationery_cupboard: "Quartermaster's Store",
}

const CASE_NAMES: Record<string, string> = {
  thermos: 'Tin Flask',
  lunchbox: 'Draught Case',
  cooler_bag: 'Cellar Crate',
  vending_cart: 'Apothecary Chest',
}

const DRAUGHT_NAMES: Record<string, string> = {
  minor: 'Small Draught',
  healing: 'Draught',
  major: 'Strong Draught',
}

const SHARD_NAMES: Record<string, string> = {
  scrap: 'Stellazia Grit',
  parts: 'Stellazia Flake',
  components: 'Stellazia Facet',
}

const AFFIXES: Record<string, Pick<AffixRule, 'name' | 'blurb'>> = {
  vampiric: { name: 'Copper-Veined', blurb: 'Copper heals: a little health after every win.' },
  lucky: { name: 'Gilded', blurb: 'More Auro from wins and finds.' },
  sturdy: { name: 'Iron-Bound', blurb: 'Snares and falls hurt much less.' },
  thrifty: { name: 'Lead-Lined', blurb: 'Loses less Auro when things go wrong.' },
}

const EFFECTS: Record<string, Pick<EffectRule, 'name' | 'blurb'>> = {
  fired_up: { name: 'Fired up', blurb: 'Hits harder after beating an elite.' },
  bruised: { name: 'Bruised', blurb: 'A snare left a mark; defense is down until a rest.' },
  well_fed: { name: 'Well fed', blurb: 'Learns a little more from each win.' },
  caffeinated: { name: 'Warmed through', blurb: 'Hits a little harder after hot broth with a comrade.' },
  inspired: { name: 'Inspired', blurb: "Learns a little more from each win after a comrade's tall tale." },
  shown_the_ropes: { name: 'Shown the path', blurb: 'A comrade showed the way round the snares; they hurt less.' },
  backed_up: { name: 'Shield-mate', blurb: 'A word from a comrade in the drill yard; defense is up.' },
  in_the_loop: { name: 'Camp gossip', blurb: 'Heard where the loose Auro lies; a little more of it.' },
}

// ---------------------------------------------------------------- commissions, orders, decisions, musters

/** The Castellum commissions: Squire from the first day, Sworn at level 4, Banneret at level 8, Warden-sworn at level 16. */
const RUNGS: Record<string, Pick<CareerRung, 'title' | 'blurb'>> = {
  first_win: { title: 'Win your first fight', blurb: 'Squire: the palisade is half built and the rats know it. Beat whatever you meet inside the walls. Once will do.' },
  equip_find: { title: 'Equip a piece of gear you found', blurb: 'Found kit waits in your pack until you put it on. The Pack page does it. Nobody is sworn in wearing a sack.' },
  level_2: { title: 'Reach level 2', blurb: 'The first notch on the commission comes before the midday broth.' },
  three_tasks: { title: 'Finish three garrison orders', blurb: 'The morning muster posts small orders on the board. Your hero works through them on its own.' },
  first_sale: { title: 'Sell a piece of gear', blurb: 'Spare gear is Auro on the Pack page, and a full pack leaves new finds on the road.' },
  pick_stance: { title: 'Pick a stance', blurb: 'Guarded, Steady or Reckless: how far your hero pushes before it rests.' },
  level_4: { title: 'Reach level 4: sworn in', blurb: 'At level 4 the commander swears you in. The Moonbight Fjords open beyond the palisade, and so does the Forge.' },
  first_salvage: { title: 'Salvage a piece of gear', blurb: 'Spare gear can be broken down for stellazia shards on the Pack page instead of sold. The Forge runs on them.' },
  first_trip: { title: 'Travel to the Moonbight Fjords', blurb: 'The fights there are harder and pay more. Travel is on the Hero page. Take a coat.' },
  laptop_backpack: { title: 'Buy the Pilgrim Pack', blurb: 'Thirteen slots instead of ten, bought on the Pack page.' },
  level_5: { title: 'Reach level 5', blurb: 'Decisions on the road open at level 5.' },
  first_decision: { title: 'Answer a decision on the road', blurb: 'Now and then a decision turns up on the Hero page. Answer before time runs out and the default is taken.' },
  lunchbox: { title: 'Buy the Draught Case', blurb: 'Thirty draughts instead of twenty, from the Pack page.' },
  level_6: { title: 'Reach level 6', blurb: 'The Serpentos moneychanger starts calling at level 6.' },
  merchant_meet: { title: 'Meet the Serpentos moneychanger', blurb: 'A Serpentos factor stops for four adventures and sells the next pack or case at a discount. Alerts can tell you when.' },
  first_elite: { title: 'Beat an elite', blurb: 'About one fight in thirty is an elite, an Old one. Tougher, and worth four times the XP.' },
  level_7: { title: 'Reach level 7', blurb: 'Camp raids and stances open at level 7.' },
  go_bold: { title: 'Switch to Reckless', blurb: 'Reckless launches twice as many camp raids as Steady. Set it on the Hero page and switch back any time after.' },
  choose_stance: { title: 'Choose a stance', blurb: 'Guarded, Steady or Reckless: how hard your hero pushes before it rests. Pick one on the Hero page.' },
  first_raid: { title: 'Take part in a camp raid', blurb: "Squires go through each other's kit by chance, and your stance moves the odds. Raiding or being raided both count." },
  level_8: { title: 'Reach level 8: Banneret', blurb: 'At level 8 the commander hands you a banner. The Krine Snow Fens open, and the supply road home with them.' },
  cafeteria_win: { title: 'Win a fight in the Krine Snow Fens', blurb: 'Level 8 opens the Snow Fens. Travel there and beat something that lives in the ice.' },
  tasks_25: { title: 'Finish 25 garrison orders', blurb: 'About a fortnight of musters.' },
  rare_find: { title: 'Find a rare piece of gear', blurb: 'Four finds in a hundred are rare, so this one comes down to the sky.' },
  rolling_suitcase: { title: 'Buy the Expedition Strongbox', blurb: 'Twenty slots, from the Pack page.' },
  level_12: { title: 'Reach level 12', blurb: 'Aeon Skerry opens at level 12. Pirates, slavers and a glacier.' },
  archive_win: { title: 'Win a fight in Aeon Skerry', blurb: 'Level 12 opens Aeon Skerry across the water. Sail there and beat something that flies a flag.' },
  first_upgrade: { title: 'Upgrade a piece of gear', blurb: 'The Forge on the Pack page raises what your hero wears, for shards and Auro.' },
  reinforce_3: { title: 'Reinforce an item to +3', blurb: 'The last three steps at the Forge. Facets are the slow part.' },
  level_16: { title: 'Reach level 16: Warden-sworn', blurb: 'At level 16 the commander swears you to the Wardens. The Exclave Seta ruins open past Kethra-Ex.' },
  garage_win: { title: 'Win a fight in the Exclave Seta ruins', blurb: 'Level 16 opens the Exclave Seta ruins. Walk the dream roads and win once.' },
  gym_duffel: { title: 'Buy the Mule Panniers', blurb: 'Past the Strongbox, the Pack page sells bigger packs. The Mule Panniers hold 24.' },
  first_standoff: { title: 'Beat an elite that dug in', blurb: 'From level 12, in the Snow Fens or beyond, an elite sometimes digs in and takes a few adventures to beat.' },
}

const ORDERS: Record<string, Pick<TodoTemplate, 'label' | 'labelOne'>> = {
  defeat_monster: { label: 'Defeat {target} {monsters}', labelOne: 'Defeat a {monster}' },
  defeat_any: { label: 'Win {target} fights', labelOne: 'Win a fight' },
  explore_biome: { label: 'Patrol the {biome} for {target} adventures', labelOne: 'Patrol the {biome}' },
  find_gear: { label: 'Find {target} pieces of gear', labelOne: 'Find a piece of gear' },
  earn_gold: { label: 'Earn {target} Auro on the road', labelOne: 'Earn {target} Auro on the road' },
  avoid_traps: { label: 'Dodge {target} snares', labelOne: 'Dodge a snare' },
  elite: { label: 'Beat {target} elites', labelOne: 'Beat an elite' },
}

type EventCopy = Pick<EventTemplate, 'title' | 'prompt'> & { readonly options: Readonly<Record<string, Pick<ChoiceOption, 'label' | 'story'>>> }
const DECISIONS: Record<string, EventCopy> = {
  misfiled_expense: {
    title: 'A stray pay chit',
    prompt: "A conscript's pay chit turned up in the mud with no name on it.",
    options: {
      file: { label: 'Claim it as yours', story: 'Claimed the stray pay chit. The paymaster counted it out without a question.' },
      return: { label: 'Hand it to the paymaster', story: 'Handed the pay chit to the paymaster. Someone will be glad of it.' },
    },
  },
  break_room_cake: {
    title: 'A whip-round for the cook',
    prompt: 'The cook is collecting for a proper stew. The pot is already half full of Auro.',
    options: {
      chip_in: { label: 'Chip in 15 Auro', story: 'Chipped in for the stew. Had two bowls and felt much better.' },
      pass: { label: 'Keep walking', story: 'Walked past the stew collection without chipping in.' },
    },
  },
  first_aid_restock: {
    title: 'The infirmary is restocking',
    prompt: 'The infirmary crate is open. A draught sits on top and the orderly is looking away.',
    options: {
      take: { label: 'Take one, leave 8 Auro in the tin', story: 'Took a draught from the crate and left some Auro in the honesty tin.' },
      leave: { label: 'Leave it for whoever needs it', story: 'Left the infirmary crate alone.' },
    },
  },
  overtime_request: {
    title: 'A night watch',
    prompt: 'The sergeant will pay extra for a night on the palisade watch.',
    options: {
      stay: { label: 'Stand the watch', story: 'Stood the night watch, saw nothing but the Watcher, and got paid for it.' },
      clock_out: { label: 'Turn in on time', story: 'Turned in on time and left the watch to someone else.' },
    },
  },
  stuck_vending_machine: {
    title: 'A jammed store hatch',
    prompt: 'The supply hatch has jammed with a ration bag stuck behind the slats.',
    options: {
      kick: { label: 'Kick it', story: 'Kicked the hatch: two ration bags, some change and a sore toe.' },
      walk_on: { label: 'Walk on', story: 'Left the hatch alone.' },
    },
  },
  lost_wallet: {
    title: 'A lost purse',
    prompt: 'A purse is lying by the gate, heavy with Auro, with a lock of hair tucked inside.',
    options: {
      hand_in: { label: 'Hand it in at the gatehouse', story: 'Handed the purse in. The owner came by later with a draught by way of thanks.' },
      keep: { label: 'Keep the Auro', story: 'Kept the Auro and left the empty purse by the gate.' },
    },
  },
}

const MUSTERS: Record<string, Pick<MeetingKind, 'name' | 'starter' | 'partner' | 'compact'>> = {
  coffee_run: {
    name: 'Soup line',
    starter: ['Stood in the soup line with {rival}.', 'Shared a pot of hot broth with {rival} by the brazier.'],
    partner: ['{rival} dragged you to the soup line.', '{rival} brought a second bowl over.'],
    compact: 'Soup with {rival}.',
  },
  war_stories: {
    name: 'Tall tales',
    starter: ['Swapped tall tales with {rival} at the brazier.', '{rival} told the one about the Lantern Owl.'],
    partner: ['{rival} had a story about the Lantern Owl.', 'Traded tall tales with {rival} by the brazier.'],
    compact: 'Tall tales with {rival}.',
  },
  shared_lunch: {
    name: 'Shared rations',
    starter: ['Split a loaf with {rival} on the wall walk.', 'Ate rations with {rival} at the long table.'],
    partner: ['{rival} shared their rations.', '{rival} pulled up a stool at mess.'],
    compact: 'Rations with {rival}.',
  },
  shortcut: {
    name: 'Shortcut',
    starter: ['{rival} showed you a path round the snares.', '{rival} pointed out the thin ice.'],
    partner: ['Showed {rival} the path round the snares.', 'Warned {rival} about the thin ice.'],
    compact: 'A shortcut from {rival}.',
  },
  pep_talk: {
    name: 'Drill-yard talk',
    starter: ['{rival} squared your shield in the drill yard.', '{rival} drew a battle plan in the frost.'],
    partner: ["Squared {rival}'s shield in the drill yard.", 'Drew {rival} a battle plan in the frost.'],
    compact: 'Drill with {rival}.',
  },
  office_gossip: {
    name: 'Camp gossip',
    starter: ['Caught up on camp gossip with {rival}.', 'Heard the news off the supply ships from {rival}.'],
    partner: ['{rival} had gossip from the gatehouse.', 'Told {rival} the news off the supply ships.'],
    compact: 'Gossip with {rival}.',
  },
}

// ---------------------------------------------------------------- narrative

const win = ' +{xp} XP, +{gold} gold.'

/**
 * The lines with the sky's weight (GDD §8): the simulator tells at most one of these a day, on the day's eldritch
 * slot, so the horror under the cozy road stays rare. Everything else is a survey note.
 */
const ELDRITCH = new Set<string>()
const eldritch = (line: string): string => {
  ELDRITCH.add(line)
  return line
}

const castellum: BiomeNarrative = {
  victory: [
    `Defeated a {monster} by the palisade.${win}`,
    `A {monster} fell behind the supply cellar.${win}`,
    `Entered a {monster} in the survey as settled.${win}`,
    `Beat a {monster} by the well.${win}`,
    `Chased a {monster} out through the gap in the wall.${win}`,
    `Beat a {monster} in the drill yard.${win}`,
    `Beat a {monster} in the half-roofed hall.${win}`,
    `Sent a {monster} back into the trees.${win}`,
  ],
  lootGold: [
    'Found {gold} gold in an unpacked crate.',
    'Loose coin under the paymaster’s bench: {gold} gold.',
    'A forgotten muster purse held {gold} gold.',
    'Found {gold} gold behind the brazier.',
    'Found {gold} gold in the cook’s honesty bowl.',
    'An old wager finally paid out: {gold} gold.',
  ],
  trapHit: [
    'Tripped over a tent rope. -{damage} HP.',
    'A stack of palisade stakes came down. -{damage} HP.',
    'Slipped on the frozen well step. -{damage} HP.',
    'Caught a thumb in the gate bar. -{damage} HP.',
    'Splinter from a green plank. -{damage} HP.',
    'Walked into the half-hung door. -{damage} HP.',
    'The brazier spat an ember. -{damage} HP.',
    'Hit a knee on a supply crate. -{damage} HP.',
    'Stepped on a dropped nail. -{damage} HP.',
    'A cellar hatch opened at shin height. -{damage} HP.',
    'Hit by a swinging gate. -{damage} HP.',
    'Sat on a stool with a broken leg. -{damage} HP.',
  ],
  // A deliberate callback when this mishap happens twice in a row.
  trapHitCallbacks: { 'Tripped over a tent rope. -{damage} HP.': 'Tripped over another tent rope. -{damage} HP.' },
  rest: [
    'Took a quiet turn by the brazier. +{heal} HP.',
    'Napped in the straw of the supply cellar. +{heal} HP.',
    'A decent bowl of broth, for once. +{heal} HP.',
    eldritch('Lay on the wall walk under the Watcher. It did not blink once. +{heal} HP.'),
    'Hid in a tent nobody had claimed. +{heal} HP.',
    'Ate the last heel of bread in the cookhouse. +{heal} HP.',
  ],
  eliteVictory: [
    `An elite {monster} fell inside the palisade.${win}`,
    `Took down an elite {monster} in the drill yard.${win}`,
    `An elite {monster} was sent back into the trees.${win}`,
  ],
  jackpot: [
    'Windfall. A lost pay chest: {gold} gold.',
    'Windfall. An unclaimed bounty purse: {gold} gold.',
    'Windfall. The garrison dice pool came in: {gold} gold.',
  ],
  lootGear: ['Found a {item} in the armoury tent.', 'Picked up a {item} left on a cot.', 'Unpacked a {item} from a supply crate.'],
  arrive: ['Gate opened. Back in the {destination}.', 'Returned to the {destination}. The roof is still not on.'],
}

const fjords: BiomeNarrative = {
  victory: [
    `Put a {monster} down on the shingle.${win}`,
    `A {monster} went into the fjord.${win}`,
    `Unhooked a {monster} from the tide line.${win}`,
    `Defeated a {monster} under the pines.${win}`,
    `Drove a {monster} back onto the ice.${win}`,
    `Closed the matter with a {monster}.${win}`,
    `Left a {monster} for the gulls.${win}`,
    `Outlasted a {monster} on the cliff path.${win}`,
  ],
  lootGold: [
    'Pried {gold} gold from a wrecked longboat.',
    'Found {gold} gold in a driftwood tangle.',
    "A drowned sailor's purse: {gold} gold.",
    'Recovered {gold} gold from a tide-washed chest.',
    'Sold a pelt at the landing for {gold} gold.',
    'Found {gold} gold in a bird’s nest. No note on why.',
  ],
  trapHit: [
    'Thin ice gave way. -{damage} HP.',
    'A pine branch dropped its snow all at once. -{damage} HP.',
    'A cold gust off the water. -{damage} HP.',
    'Slipped on a wet rock. -{damage} HP.',
    'A rockfall on the cliff path. -{damage} HP.',
    'Backed into a frozen thorn bush. -{damage} HP.',
    'A dead tree came down in the wind. -{damage} HP.',
    'Walked into a low branch in the dark. -{damage} HP.',
    'Dropped a boot through the shingle. -{damage} HP.',
    'A wave caught an ankle. -{damage} HP.',
    'Knelt on a spar of driftwood. -{damage} HP.',
    'The tide came in faster than the map said. -{damage} HP.',
  ],
  rest: [
    'Sat out of the wind behind a boulder. +{heal} HP.',
    'Rested on a bed of pine needles. +{heal} HP.',
    'Drank meltwater from a cupped leaf. +{heal} HP.',
    eldritch('Listened to the fjord creak. Something under it creaked back. +{heal} HP.'),
    'Warmed up by a driftwood fire. +{heal} HP.',
    'Waited out a long snow shower. +{heal} HP.',
  ],
  eliteVictory: [
    `An elite {monster} went into the fjord for good.${win}`,
    `Took down an elite {monster} under the pines.${win}`,
    `An elite {monster} will not cross the shingle again.${win}`,
  ],
  jackpot: [
    'Windfall. A smuggler’s cache under a cairn: {gold} gold.',
    'Windfall. A trade-ship’s strongbox washed ashore: {gold} gold.',
    'Windfall. The silver out of a wrecked hull: {gold} gold.',
  ],
  lootGear: ['Pulled a {item} out of the driftwood.', 'Found a {item} in a cairn marked with a bad word.', 'Took a {item} from a wrecked longboat.'],
  arrive: ['Gate closed behind. Out in the cold {destination}.', 'Made it to the {destination}. The wind has opinions.'],
}

const fens: BiomeNarrative = {
  victory: [
    `Dragged a {monster} out of the mire.${win}`,
    `Cleared a {monster} from the reed beds.${win}`,
    `Defeated a {monster} on the Grokdeep road.${win}`,
    `Left a {monster} for the fen to keep.${win}`,
    `Sent a {monster} back under the ice.${win}`,
    `Beat a {monster} at the ford.${win}`,
    `Trapped a {monster} in a frozen pool.${win}`,
    `Put a {monster} down in the sedge.${win}`,
  ],
  lootGold: [
    'Found {gold} gold in a wayshrine bowl.',
    'Found {gold} gold under a sunken cart.',
    'A goblin’s dropped purse coughed up {gold} gold.',
    'Found {gold} gold in a milestone’s hollow.',
    'Found {gold} gold in a frozen saddlebag.',
    'Collected {gold} gold in tolls nobody came back to claim.',
  ],
  trapHit: [
    'Splashed by black fen water. -{damage} HP.',
    'Slipped on a frozen rut. -{damage} HP.',
    'Caught in a goblin snare. -{damage} HP.',
    'Scalded by a bog vent. -{damage} HP.',
    eldritch('Something under the ice lunged, and the ice did not break. -{damage} HP.'),
    'Tried the fen berries. -{damage} HP.',
    'Tripped over the road marker. -{damage} HP.',
    'A stack of cut reeds fell over. -{damage} HP.',
    'A will-o’-wisp led into a ditch. -{damage} HP.',
    'A frozen gate clipped an elbow. -{damage} HP.',
    'Stepped on a lost caltrop. -{damage} HP.',
    'Lost footing in a sucking pool. -{damage} HP.',
  ],
  rest: [
    'Ate a surprisingly good fen pudding. +{heal} HP.',
    'Rested in an empty wayshrine. +{heal} HP.',
    'Hot broth at the ford-keeper’s hut. +{heal} HP.',
    'Napped under a sedge roof. +{heal} HP.',
    'Finished someone’s abandoned rations. +{heal} HP.',
    'Lingered over a long, thin soup. +{heal} HP.',
  ],
  eliteVictory: [
    `Sent an elite {monster} back to Grokdeep.${win}`,
    `Took an elite {monster} off the road.${win}`,
    `Beat an elite {monster} at the ford.${win}`,
  ],
  jackpot: [
    'Windfall. A toll-keeper’s buried box: {gold} gold.',
    'Windfall. A wayshrine bowl overflowed: {gold} gold.',
    'Windfall. A forgotten supply-train purse: {gold} gold.',
  ],
  lootGear: ['Found a {item} behind the ford-keeper’s hut.', 'Fished a {item} out of the mire.', 'A {item} was in a sunken cart.'],
  arrive: ['Made it to the {destination}. Something smells of rot.', 'Arrived in the {destination}. Mind the thin ice.'],
}

const skerry: BiomeNarrative = {
  victory: [
    `Defeated a {monster} between the slave pens.${win}`,
    `A {monster} went back over the harbour chain.${win}`,
    `Beat a {monster} under the one lit lantern.${win}`,
    `Put a {monster} off the pier. The maul settled the argument.${win}`,
    `Left a {monster} flat under a sail.${win}`,
    `Sent a {monster} back to its ship.${win}`,
    `Beat a {monster} on the glacier lip.${win}`,
    `Struck a {monster} off the slaver’s ledger.${win}`,
  ],
  lootGold: [
    'Found {gold} gold in a cask marked 1180.',
    'A slaver’s ledger still had {gold} gold tucked in the back.',
    'Found {gold} gold in the harbour-master’s drawer.',
    "A retired corsair's sea chest held {gold} gold.",
    'Found {gold} gold pressed inside an old chart.',
    'An uncashed ransom note: {gold} gold.',
  ],
  trapHit: [
    'The harbour chain swung. -{damage} HP.',
    'A stack of casks came down. -{damage} HP.',
    'Breathed in forty years of fish. -{damage} HP.',
    'A pen gate snapped shut on a finger. -{damage} HP.',
    'A mast toppled across the quay. -{damage} HP.',
    'Tripped over a coil of frozen rope. -{damage} HP.',
    'A sheet of ice let go from a roof. -{damage} HP.',
    'A gangplank slid along its rail. -{damage} HP.',
    'A stack of crates fell like dominoes. -{damage} HP.',
    'Caught a sleeve on a rusted hook. -{damage} HP.',
    'Walked into a bollard in the dark. -{damage} HP.',
    eldritch('The one lit lantern went out mid-step, and something took the step with it. -{damage} HP.'),
  ],
  trapHitCallbacks: { 'The harbour chain swung. -{damage} HP.': 'The same harbour chain swung back. -{damage} HP.' },
  rest: [
    'Sat on a cask and read an old bill of sale. +{heal} HP.',
    'Napped on a stack of folded sails. +{heal} HP.',
    'Found a quiet pier nobody has moored at for years. +{heal} HP.',
    'A kettle of fish stew, left and still warm. +{heal} HP.',
    'Rested under the one lit lantern. +{heal} HP.',
    'Read the port rules twice. They allow everything. +{heal} HP.',
  ],
  eliteVictory: [
    `An elite {monster} was finally put off the skerry.${win}`,
    `Took down an elite {monster} on the dark quay.${win}`,
    `An elite {monster} will not raise a flag again.${win}`,
  ],
  jackpot: [
    'Windfall. A forgotten ransom chest: {gold} gold.',
    'Windfall. The pirates’ prize pool, never split: {gold} gold.',
    'Windfall. A cask of mint Supremacy coin: {gold} gold.',
  ],
  lootGear: ['Found a {item} in a crate marked SUNDRY.', 'Pulled a {item} from a chest of taken goods.', 'A {item} was racked with the taken goods, unlabelled.'],
  arrive: ['Took the ferry across to the {destination}. It smells of tar.', 'Made it to the {destination}. The lantern flickers twice and holds.'],
}

const seta: BiomeNarrative = {
  victory: [
    `Defeated a {monster} on the third terrace.${win}`,
    `A {monster} stalled between two pillars.${win}`,
    `Beat a {monster} at the broken gate.${win}`,
    `Pinned a {monster} under a fallen lintel.${win}`,
    `Left a {monster} in a dead Knot’s shadow.${win}`,
    `Beat a {monster} by the dry cistern.${win}`,
    `Walked a {monster} off its dream road.${win}`,
    eldritch(`Carried a {monster} out of the story it was dreaming.${win}`),
  ],
  lootGold: [
    'Found {gold} gold in a Vorrak offering bowl.',
    'Found {gold} gold down the back of a stone seat.',
    'A dropped purse, long empty of names, still held {gold} gold.',
    'Found {gold} gold in a cracked urn.',
    "The gatehouse niche had {gold} gold in it.",
    'Found {gold} gold under a root that was once a wall.',
  ],
  trapHit: [
    'The lintel came down. -{damage} HP.',
    'Slipped on a slick of dead vine. -{damage} HP.',
    eldritch('A chorus with no mouths started up right behind. -{damage} HP.'),
    'Walked into a pillar in the dark. -{damage} HP.',
    'A step out of nowhere. -{damage} HP.',
    'Bad air in the lower terrace. -{damage} HP.',
    eldritch('A door closed on an arm with nobody near it. -{damage} HP.'),
    'A loose vine hung from the arch. -{damage} HP.',
    'A stone rolled down the ramp. -{damage} HP.',
    'Stepped in a pool deeper than it looked. -{damage} HP.',
    eldritch('A tile dropped from a ceiling that was not there. -{damage} HP.'),
    eldritch('Tripped over a kerb on a road that was not there either. -{damage} HP.'),
  ],
  rest: [
    'Sat on a kerb and waited for the echo to fade. +{heal} HP.',
    'Rested in the gatehouse with a small fire. +{heal} HP.',
    'A nap in the lee of a dead Knot. +{heal} HP.',
    'Drank from a cistern that still runs. +{heal} HP.',
    'Found a dry corner on the second terrace. +{heal} HP.',
    eldritch('Sat on a stone seat and listened to nothing. The nothing listened back. +{heal} HP.'),
  ],
  eliteVictory: [
    `An elite {monster} was put under the vines for good.${win}`,
    `Took down an elite {monster} on the lowest terrace.${win}`,
    `An elite {monster} stalled for the last time.${win}`,
  ],
  jackpot: [
    'Windfall. A year of tithes in a sealed jar: {gold} gold.',
    "Windfall. The gatehouse's whole strongbox: {gold} gold.",
    'Windfall. A coffer of unmarked coin under a tarp of vines: {gold} gold.',
  ],
  lootGear: ['Found a {item} in a collapsed barrack.', 'A {item} was wedged behind the gate stone.', 'Pulled a {item} from a spoil heap by the ramp.'],
  arrive: [eldritch('Took the dream road down to the {destination}. Every sound came back twice.'), 'Made it to the {destination}. Mind the vines.'],
}

const signature = (...lines: string[]): MonsterNarrative => ({ victory: lines.map((line) => `${line}${win}`) })

const monsters: Record<string, MonsterNarrative> = {
  paper_imp: signature('Chased a {monster} out of the grain sacks.', 'Put a {monster} out through the cellar grate.'),
  rogue_roomba: signature('Blew out a {monster} like a candle.', "Walked through a {monster} and it did not reform."),
  stapler_mimic: signature('Talked a {monster} off the gatepost.', 'Shuttered a {monster}, permanently.'),
  dust_daemon: signature('Got the spoon back from a {monster}.', 'Chased a {monster} up its own pine.'),
  cable_serpent: signature('Untangled a {monster} from a net and sent it home.', 'Shooed a {monster} back to its pack.'),
  overheated_rack: signature('Talked a {monster} down to a walk.', 'Ran a {monster} out of wind.'),
  firewall_gremlin: signature('Stepped aside and a {monster} went past.', 'Got round a {monster} on the cliff path.'),
  legacy_mainframe: signature('Finally flipped a {monster}.', 'Levered a {monster} back into the water.'),
  coffee_slime: signature('Sent a {monster} back down its hole.', 'Took a {monster}’s loot and its sense of direction.'),
  crumb_golem: signature('Broke a {monster} back into fog.', 'Walked a {monster} into the thaw.'),
  microwave_wraith: signature('Sent a {monster} back to Mrl Mnø.', 'Beached a {monster} on the far bank.'),
  leftovers_hydra: signature('Put out a {monster}’s lamp.', 'Snuffed every lantern on a {monster}.'),
  box_file_beetle: signature('Produced papers and a {monster} let go.', 'Closed the ledger on a {monster}.'),
  shelf_lurker: signature('Cornered a {monster} at the end of the pier.', 'Rolled a cask over a {monster}.'),
  microfilm_phantom: signature('Waited for sunrise on a {monster}.', 'Talked a {monster} back into its cave.'),
  auditor: signature('Counted every scale on a {monster} and it left.', 'Outlasted a {monster}’s one breath of frost.'),
  trolley_swarm: signature('Walked a {monster} out of its own thought.', 'Pushed a {monster} back up the ramp.'),
  oil_slick: signature('Cut through a {monster}.', 'Pulled a {monster} down the dry cistern.'),
  barrier_golem: signature('Stood very still until a {monster} forgot.', 'Gave a {monster} the wrong watchword and it let go.'),
  ghost_car: signature('Woke up and a {monster} was gone.', 'Stepped off the road and a {monster} kept going.'),
}

const shared: SharedNarrative = {
  retreat: [
    'Retreated from a stubborn {monster}.',
    'Backed away from a {monster} to fight another day.',
    'Called it quits against a {monster}.',
    'Left a {monster} for the night watch.',
    'Left a {monster} for another day.',
  ],
  // The status line shows when the hero is back, in the owner's time.
  death: ['Knocked out by a {monster}.', 'Knocked out cold by a {monster}.', 'Flattened by a {monster}.'],
  rescue: [
    'A {monster} nearly won; a comrade came to the rescue.',
    'A {monster} nearly won; the orderly stepped in.',
    'Saved from a {monster} by the muster horn.',
  ],
  trapDeath: ['Knocked out by a nasty snare.', 'Knocked out cold by a fall.'],
  trapRescue: ['A snare nearly won; a comrade came to the rescue.', 'A fall nearly won; the orderly stepped in.'],
  restFull: [
    'Took a quiet turn at full health.',
    'Had a second bowl of broth anyway.',
    'Refilled the waterskin and carried on.',
    'Fed the garrison goat. Nothing needed healing.',
    'Stood through a muster that could have been a note on the board.',
    'Oiled the pack straps, just because.',
    'Found the good stool and kept it for ten minutes.',
    'Read the orders on the board twice.',
    'Reheated rations and ate them on the wall walk.',
    'Straightened the bedroll.',
  ],
  trapAvoided: [
    'Spotted a snare and stepped around it.',
    'Noticed a suspicious rope just in time.',
    'Stepped over a patch of thin ice.',
    'Saw the snare and stepped aside.',
  ],
  lootGear: ['Found a {item}.'],
  lootPotion: [
    'Found a {potion}.',
    'Picked up a {potion} left on a cot.',
    'Found a {potion} in the infirmary crate.',
    'A {potion} rolled out from under a bedroll.',
  ],
  potionFullGold: ['Draught case full; sold a spare for {gold} gold.', 'No room for another draught; sold it for {gold} gold.'],
  pouchFind: ['Found a {item}. The case now holds {capacity} draughts.', 'Someone left a {item} in the cookhouse. It holds {capacity} draughts.'],
  merchant: [
    'A [[Serpentos Factor]] set up a trestle table. Open for {ticks} adventures.',
    'Met a [[Serpentos Factor]] by the gate. Offers stand for {ticks} adventures.',
    'A [[Serpentos Factor]] wheeled a cart past. Trade in the companion within {ticks} adventures.',
  ],
  restingHeal: [
    'Resting to recover. +{heal} HP.',
    'Caught a nap by the brazier. +{heal} HP.',
    'Raided the infirmary crate. +{heal} HP.',
    'Put the feet up for a bit. +{heal} HP.',
    'Marked down as "off watch". +{heal} HP.',
  ],
  revive: [
    'Revived in the {destination} with {heal} HP.',
    'Back on their feet in the {destination}. {heal} HP.',
    'The orderly signed off on a return to duty. {heal} HP.',
  ],
  arrive: ['Arrived in the {destination}.', 'Made it to the {destination}.'],
  depart: [
    'Woke up and set off for the {destination}.',
    'Grabbed a bowl of broth and headed for the {destination}.',
    'Packed hard bread and set off for the {destination}.',
  ],
  unlock: ['The {destination} is now open.', 'New ground on the map: the {destination}.'],
  bagFind: [
    'Found a {item} among the strays! Pack now holds {capacity}.',
    'Someone left a {item} by the gate. Pack now holds {capacity}.',
    'A {item} turned up behind the armoury tent. Pack now holds {capacity}.',
    'Claimed an abandoned {item}. Pack now holds {capacity}.',
  ],
}

const raids: RaidNarrative = {
  // The amounts travel as change chips beside the story (D48), so the lines carry none.
  raidWon: [
    "Went through {rival}'s kit while they were on watch.",
    "Slipped into {rival}'s tent and helped itself to the purse.",
    "Emptied {rival}'s boot of loose Auro.",
  ],
  raidLost: [
    "Caught in {rival}'s tent and chased off.",
    "The raid on {rival}'s kit went badly. Dropped the take in the snow.",
    '{rival} was in their tent after all. Fled empty-handed.',
  ],
  raided: [
    '{rival} went through the kit while nobody was looking.',
    'Came back to find {rival} had been in the tent.',
    '{rival} made off with the purse.',
  ],
  repelled: [
    'Caught {rival} at the kit and sent them packing.',
    'Caught {rival} in the tent. They fled and dropped their take.',
    'Found {rival} under the cot and showed them the gate.',
  ],
  rescue: ['Got away and stopped to rest.', 'Got out of the scuffle and stopped to rest.'],
}

const strays: LostPropertyRule['narrative'] = {
  dropped: 'Dropped a spare {item} on the road.',
  found: ['Found a {item} with {rival} scratched into it.', 'Found a {item} in the snow. The mark says {rival}.', 'Pulled a {item} out of a stray bundle. Marked {rival}.'],
  foundCompact: "Found {rival}'s {item}.",
  returned: ['{rival} found your spare {item} in the {destination}.', '{rival} picked up your stray {item} in the {destination}.'],
  returnedCompact: '{rival} found your spare {item}.',
}

const standoff: StandoffRule['narrative'] = {
  dugIn: {
    cafeteria_depths: ['An elite {monster} has dug in under the fen ice.', 'An elite {monster} has dug in on the Grokdeep road.', 'An elite {monster} has dug in among the reed beds.'],
    archive: ['An elite {monster} has dug in behind the harbour chain.', 'An elite {monster} has dug in on the glacier lip.', 'An elite {monster} has dug in among the slave pens.'],
    parking_garage: ['An elite {monster} has dug in under a dead Knot.', 'An elite {monster} has dug in on a dream road.', 'An elite {monster} has dug in at the broken gate.'],
  },
  won: {
    cafeteria_depths: ['The elite {monster} is under the ice for good.', 'Dragged the elite {monster} out of the fen at last.', 'The elite {monster} will not trouble the road again.'],
    archive: ['The elite {monster} is off the skerry for good.', 'Sent the elite {monster} off the glacier at last.', 'The elite {monster} will fly no flag again.'],
    parking_garage: ['The elite {monster} is quiet under the vines for good.', 'Walked the elite {monster} off the dream road at last.', 'The elite {monster} has left the ruins for good.'],
  },
  fighting: ['Still at the elite {monster}.', 'Back at the elite {monster}.', 'Another round with the elite {monster}.'],
  slipped: ['The elite {monster} slipped away.', 'The elite {monster} packed up and left.', 'The elite {monster} gave up and left.'],
  dugInCompact: 'An elite {monster} dug in.',
  fightingCompact: 'Still at the elite {monster}.',
  wonCompact: 'Beat the elite {monster}.',
  slippedCompact: 'The elite {monster} left.',
  waiting: 'The elite {monster} is waiting.',
}

/*
 * Field notes in Ur-Turul's hand: one per zone, read once the hero has stood there, and one per creature, read once
 * the hero has beaten it. Each sits on one phone card, so they stay under LORE_NOTE_MAX.
 */
const lore: LoreRule = {
  biomes: {
    office_cubicles:
      'Castellum Frigo, founded this year on the east shore of the Wilds. Fifty soldiers, half a palisade and a roof that is coming on the next ship. Nothing inside the walls keeps a squire down for long, because the orderly is never far.',
    server_room:
      'The Moonbight fjords, north along the shore toward Avgo Noctis. Pine, shingle and water that creaks at night. The Beasthral packs hunt the tree line. I have asked for a second coat and been told to draw one.',
    cafeteria_depths:
      'The Snow Fens of Krine, on the supply road home toward Grokdeep. Frozen swamp under a thin crust, with the goblins raiding from the hills and worse coming up from Mrl Mnø. The ford-keeper serves soup, which is why the road stays open.',
    archive:
      'Aeon Skerry, the Slaver’s Chain, across the water to the north-west. Taiga, tundra and a glacier with a port chewed into it. Slavery is legal here and little else is forbidden. The pirates fly a flag stitched from other flags.',
    parking_garage:
      'The Exclave Seta ruins, past Kethra-Ex in Vorrak country. Terraces, dead Knots gone to vine, and roads that go somewhere only while you dream them. I map what I can from the gate. Nobody who walked the lowest terrace has written back.',
  },
  monsters: {
    paper_imp:
      'A rat the length of a forearm, with frost in its whiskers and a taste for sealed grain. It wants the cellar and goes to pieces when it is told no. The grate stops it. Let it out the gap in the wall and it is back by the next ration.',
    rogue_roomba:
      'A scrap of cold light that drifts between the tents after dark and takes the warmth out of whatever it touches, ankles included. Walk through it and it comes apart for a while. It is not a ghost. I have written that down twice now.',
    stapler_mimic:
      'An owl the size of a shield that sits on the gatepost and watches the Watcher. The old hands say it belongs to Myrkos and nobody argues. It takes a finger if a hand comes near the perch. Shutter the lantern and it loses interest.',
    dust_daemon:
      'A marten that has learned where the cook keeps the spoons. It carries off anything that shines and some things that do not. A can of pine pitch on the sill sends it up the nearest tree, where it waits for the next quiet month.',
    cable_serpent:
      'A Lunaris hound-pup, shadow-furred, with crescent pupils that catch the moons. It tangles itself in the drying nets and bites whatever untangles it. Sent back toward Avgo Noctis it goes, eventually, with a look I am still thinking about.',
    overheated_rack:
      'A Beasthral runner, horn and fang and bristle, the pack hazard the frontier scouts warned about. It runs hot and tires slow. Talk it down to a walk, or run it out of wind, and it goes quiet for a bit. The pack does not.',
    firewall_gremlin:
      'A stag the colour of the glacier, with antlers that log every attempt to pass. It blocks the cliff path on principle. It can be got round on the seaward side, which it finds humiliating.',
    legacy_mainframe:
      'A crab older than the fort by some accounts, with a shell like a longboat hull. It holds the tide line and will not be moved. Four squires have announced its removal, and it has outlasted all of them.',
    coffee_slime:
      'A goblin out of Grokdeep, raiding the supply road for anything in a sack. It moves in a hurry and smells of burnt porridge. A maul deals with it, though the raiding party is never the same afterwards, and neither is the maul.',
    crumb_golem:
      'The feral fiend of the fens: fog, teeth and a bad temper, grown out of everything the swamp did not finish. It is bigger every winter and the marsh birds fear it. Breaking it up takes patience; it is only ever fog, but a great deal of it.',
    microwave_wraith:
      'A sahuagin up the river from Mrl Mnø, scaled, webbed and furious about the cold. It haunts the ford with the smell of fish and a hiss that never quite finishes. Beached on the far bank it sulks for a week.',
    leftovers_hydra:
      'An eel the length of a cart, lit along its back with lanterns that are not lanterns. Follow one light and two more come up by the next dusk. It is beaten by snuffing every lamp at once, which is the only way the ford has ever gone dark.',
    box_file_beetle:
      'A slaver of the Rhithian line, with a ledger, a chain and the law on its side. It carries the bill of sale for a meeting nobody attended and defends it to the last link. Produce papers of your own and it lets go, for now.',
    shelf_lurker:
      'A corsair of the Patchwork Flag, which is stitched from the flags of everyone it has robbed. It moves when the tide moves and nobody has seen all of it under the one lit lantern. It does not like a cask rolled over its foot and will say so.',
    microfilm_phantom:
      'A troll of the glacier edge, blue with rime, that has been reading the same stone for forty years and has not found its own name. It flickers between the floes looking. Sunrise loses it the thread for a while.',
    auditor:
      'A wyrmling off the glacier, scaled in ice, that counts. It came down to check the cargo in a year nobody can agree on and never went back up. It still asks for a tally. The only known defence is a receipt for everything, which nobody has.',
    trolley_swarm:
      'What is left of a Vorrak hive-thought, walking. It moves as one and thinks as one, always downhill toward the gate. Walked out of its own thought it rests for a while, rattling against itself.',
    oil_slick:
      'A vine off a dead Knot, grown like a brain and spread for a century until it started to move. It waits for someone to step on it. A blade takes the shine off it, and the dry cistern takes the rest, slowly.',
    barrier_golem:
      'A sentinel of the Nullborn kind, left at the broken gate by whoever broke it. It wants a watchword and does not take coin. Standing very still confuses it long enough to walk under.',
    ghost_car:
      'A wraith of the dream roads, which are roads only while someone is dreaming them. It has no face and no dust on it. It has been walked off the road more than once, and it is always back on the same stretch by morning.',
  },
}

// ---------------------------------------------------------------- the catalog

const career = contentV27.career!
const todo = contentV27.todo!
const potions = contentV27.potions!
const workbench = contentV27.workbench!
const choices = contentV27.choices!
const meetings = contentV27.meetings!
const stances = contentV27.stances!
const classes = contentV27.classes!

export const contentV28: ContentCatalog = {
  ...contentV27,
  contentVersion: 'v28',
  biomes: byId('zone', contentV27.biomes, ZONE_NAMES, (biome, name) => ({ ...biome, name })),
  monsters: byId('monster', contentV27.monsters, MONSTER_NAMES, (monster, name) => ({ ...monster, name })),
  gearTemplates: byId('gear', contentV27.gearTemplates, GEAR_NAMES, (template, name) => ({ ...template, name })),
  potion: { templateId: contentV27.potion.templateId, name: DRAUGHT_NAMES.healing! },
  bagLadder: { ...contentV27.bagLadder, tiers: byId('pack', contentV27.bagLadder.tiers, PACK_NAMES, (tier, name) => ({ ...tier, name })) },
  potionPouch: { ...contentV27.potionPouch!, tiers: byId('draught case', contentV27.potionPouch!.tiers, CASE_NAMES, (tier, name) => ({ ...tier, name })) },
  stances: {
    cautious: { ...stances.cautious, name: 'Guarded', blurb: 'Drinks and rests early, and heals up before heading back out. Learns a little less from each win.' },
    balanced: { ...stances.balanced, name: 'Steady', blurb: 'The garrison standard.' },
    bold: { ...stances.bold, name: 'Reckless', blurb: 'Saves draughts and keeps going on low health, then heads back out as soon as it can stand. Learns more from each win.' },
  },
  classes: {
    warrior: { ...classes.warrior, name: 'Knight', blurb: 'Holds the line, with the most health and the steadiest fights.', passive: { name: 'Shield-wall', blurb: 'Full health and defense, with no special trick.' } },
    rogue: { ...classes.rogue, name: 'Assassin', blurb: 'Works the tree line. Hits a bit harder and pockets more, but takes hits worse.', passive: { name: 'Quiet hands', blurb: 'More Auro from every fight and find, and an edge in camp raids, raiding or defending.' } },
  },
  choices: {
    ...choices,
    events: byId('decision', choices.events, DECISIONS, (event, copy) => ({
      ...event,
      title: copy.title,
      prompt: copy.prompt,
      options: byId(`decision ${event.id} option`, event.options, copy.options, (option, text) => ({ ...option, label: text.label, story: text.story })),
    })),
  },
  affixes: byId('affix', contentV27.affixes!, AFFIXES, (affix, copy) => ({ ...affix, ...copy })),
  effects: byId('effect', contentV27.effects!, EFFECTS, (effect, copy) => ({ ...effect, ...copy })),
  raids: { ...contentV27.raids!, narrative: raids },
  meetings: { ...meetings, kinds: byId('muster', meetings.kinds, MUSTERS, (kind, copy) => ({ ...kind, ...copy })) },
  lostProperty: { ...contentV27.lostProperty!, narrative: strays },
  standoff: { ...contentV27.standoff!, narrative: standoff },
  todo: {
    ...todo,
    templates: todo.templates.map((template) => {
      const copy = ORDERS[template.kind]
      if (copy === undefined) throw new Error(`v28 garrison order ${template.kind} has no Volta label`)
      return { ...template, ...copy }
    }),
    monsterPlurals: Object.fromEntries(
      Object.keys(todo.monsterPlurals).map((id) => {
        const plural = MONSTER_PLURALS[id]
        if (plural === undefined) throw new Error(`v28 monster ${id} has no Volta plural`)
        return [id, plural]
      }),
    ),
  },
  career: { rungs: byId('commission', career.rungs, RUNGS, (rung, copy) => ({ ...rung, ...copy })) },
  workbench: { ...workbench, materials: byId('shard', workbench.materials, SHARD_NAMES, (material, name) => ({ ...material, name })) },
  potions: { ...potions, strengths: byId('draught', potions.strengths, DRAUGHT_NAMES, (strength, name) => ({ ...strength, name })) },
  // 2B.2: the Volta sky's hooks, the one rule v28 adds; its table is ./sky.ts.
  sky: SKY_V28,
  lore,
  narrative: {
    biomes: { office_cubicles: castellum, server_room: fjords, cafeteria_depths: fens, archive: skerry, parking_garage: seta },
    shared,
    monsters,
    eldritch: [...ELDRITCH],
  },
}
