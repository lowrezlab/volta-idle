/**
 * Seals: cosmetic wax-seal souvenirs collected by a weekly code (the keepsakes of D65/D73, renamed for Volta). Order is
 * permanent: append new entries, never reorder earned ones. Ids and the 8×8 designs are the Desk Crawler ones until the
 * art pass replaces the pixels; only the copy moved.
 */
export const DESK_KEEPSAKES = [
  { id: 'stapler', name: 'Seal of the Palisade', description: 'Pressed in red wax at the gate.', pixels: ['........', '.#####..', '.#...##.', '..#####.', '......#.', '.######.', '.######.', '........'] },
  { id: 'mug', name: 'Seal of the Cookhouse', description: 'Stained brown inside and still in use.', pixels: ['........', '.#####..', '.#...###', '.#...#.#', '.#...###', '.#...#..', '..###...', '........'] },
  { id: 'disk', name: 'Seal of the Old Ledger', description: 'Holds one tally from 1180.', pixels: ['.######.', '.#..#.#.', '.#..#.#.', '.######.', '.#....#.', '.#.##.#.', '.######.', '........'] },
  { id: 'plant', name: 'Seal of the Unkillable Fern', description: 'Nobody waters it, and it keeps growing.', pixels: ['...#....', '.#.#.#..', '..###...', '.#.##.#.', '..###...', '..###...', '..#.#...', '...#....'] },
  { id: 'key', name: 'Seal of the Strongroom Key', description: 'Nobody remembers which door it opens.', pixels: ['..###...', '.#...#..', '.#.#.#..', '..###...', '...#....', '...###..', '...#....', '...##...'] },
  { id: 'duck', name: 'Seal of the Garrison Goose', description: 'Explain the problem to it and you will spot the fix.', pixels: ['....##..', '...####.', '...#.###', '.#####..', '#######.', '#######.', '.#####..', '........'] },
  { id: 'clock', name: 'Seal of the Watcher', description: 'Stuck at the moment Myrkos crosses.', pixels: ['..####..', '.#....#.', '#..#...#', '#..#...#', '#..###.#', '#......#', '.#....#.', '..####..'] },
  { id: 'badge', name: 'Seal of the Commission', description: 'Access granted to the biscuit crate.', pixels: ['..#..#..', '..#..#..', '..####..', '.######.', '.#....#.', '.#.##.#.', '.#....#.', '.######.'] },
  { id: 'lamp', name: 'Seal of the Night Watch', description: 'For the evenings the dispatch runs late.', pixels: ['..####..', '.######.', '########', '...#....', '...#....', '...#....', '..####..', '.######.'] },
  { id: 'tape', name: 'Seal of the Pitch Pot', description: 'Holding up three things that should be nailed down.', pixels: ['..####..', '.######.', '###..###', '###..###', '.######.', '..#####.', '......#.', '.....##.'] },
  { id: 'pager', name: 'Seal of the Muster Horn', description: 'It has not sounded since the last ship.', pixels: ['........', '.######.', '.#....#.', '.#.##.#.', '.#....#.', '.######.', '..#..#..', '........'] },
  { id: 'trophy', name: 'Seal of the Survey', description: 'Your name, spelt slightly wrong.', pixels: ['.######.', '##....##', '#.#..#.#', '.######.', '..####..', '...##...', '..####..', '.######.'] },
] as const

/**
 * The seal code on the public sample screen and in previews; never a weekly code (D137). Entered in the companion, it
 * finds the hidden Wyrm Egg seal (D140) unless it happens to be the player's own code that week, which collects.
 */
export const SAMPLE_KEEPSAKE_CODE = '482 917'
/** The hidden seal for entering the sample code (D140): once per account, outside the weekly set and its counts. */
export const EASTER_EGG_KEEPSAKE = { id: 'easter_egg', name: 'Seal of the Wyrm Egg', description: 'Hatched from a code that was never meant to work.', pixels: ['...##...', '..####..', '.######.', '.#.##.#.', '#.#..#.#', '########', '.######.', '..####..'] } as const
export const KEEPSAKE_WEEK_MS = 7 * 24 * 60 * 60 * 1000
/** Monday 00:00 UTC; the client never chooses the award period. */
const MONDAY_EPOCH = Date.UTC(1970, 0, 5)
/** Last moment a pre-D73 letter code still collects, so screens rendered before the six-digit switch keep their grace week. */
export const LETTER_CODES_UNTIL = Date.UTC(2026, 9, 19)
export const keepsakeWeek = (now: number) => Math.floor((now - MONDAY_EPOCH) / KEEPSAKE_WEEK_MS)
export const keepsakeWeekStartsAt = (week: number) => MONDAY_EPOCH + week * KEEPSAKE_WEEK_MS
/**
 * D148: weekly seals open on the Monday after the public-launch reset, so the first code is an unlock of its own.
 * Before it no code is shown or accepted; the Wyrm Egg still hatches from the sample code.
 */
export const KEEPSAKES_OPEN_AT = Date.UTC(2026, 9, 19)
export const keepsakesOpen = (now: number) => now >= KEEPSAKES_OPEN_AT

/** A fixed-size shelf derived from one lifetime count: no growing document or history scan. */
export const keepsakeShelf = (totalCollected: number) => DESK_KEEPSAKES.map((item, index) => ({
  ...item,
  count: Math.max(0, Math.floor((totalCollected + DESK_KEEPSAKES.length - 1 - index) / DESK_KEEPSAKES.length)),
}))
