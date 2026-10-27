import type { HeroParts } from './layered'

/*
 * The hero's look (GDD §3.6): a compact, versioned, URL-safe code that names one option per creator slot, and the
 * option tables it indexes. Numbering is stable: a new option goes on the end of its table, and a retired one keeps
 * its index with its id, so old codes keep their meaning. An unknown or garbage field decodes to option 0, so a code
 * from user input never throws and always draws.
 *
 * Part ids follow the parts contract (parts/types.ts): a body is `<ancestry>.<build>`, every other slot
 * `<slot>.<option>`, with `head.<ancestry>` for an ancestry's head.
 */

export const LOOK_VERSION = 'v1'
/** One base-32 character per field, in this order. */
export const LOOK_FIELDS = ['ancestry', 'build', 'head', 'hair', 'back', 'accessory', 'tabard'] as const
export type LookField = (typeof LOOK_FIELDS)[number]
export type Look = Readonly<Record<LookField, number>>

/** Base 32, lowercase: digits then a..v, so a code reads the same in a URL and on a hero page. */
const ALPHABET = '0123456789abcdefghijklmnopqrstuv'
const LOOK_RE = /^v1\.[0-9a-z]{7}$/

/** GDD §3.3, in its tier table's order: small, medium, tall, very tall, then the variable ancestries. */
export const ANCESTRIES = ['aquanid', 'lunaris', 'dragu', 'seraphra', 'aeronid', 'umbreth', 'eldrith', 'obsidianid', 'crystalkin', 'florean', 'beasthral'] as const
export type Ancestry = (typeof ANCESTRIES)[number]

export type BodyTier = 'small' | 'medium' | 'tall' | 'very_tall'

/** A build is drawn at one tier; a variable ancestry's builds each pick their own (GDD §3.3). */
export const BUILDS: Record<Ancestry, ReadonlyArray<{ readonly id: string; readonly tier: BodyTier }>> = {
  aquanid: [{ id: 'slight', tier: 'small' }, { id: 'sturdy', tier: 'small' }],
  lunaris: [{ id: 'slight', tier: 'small' }, { id: 'sturdy', tier: 'small' }],
  dragu: [{ id: 'slight', tier: 'small' }, { id: 'sturdy', tier: 'small' }],
  seraphra: [{ id: 'slight', tier: 'medium' }, { id: 'sturdy', tier: 'medium' }],
  aeronid: [{ id: 'slight', tier: 'medium' }, { id: 'sturdy', tier: 'medium' }],
  umbreth: [{ id: 'slight', tier: 'medium' }, { id: 'sturdy', tier: 'medium' }],
  eldrith: [{ id: 'slight', tier: 'tall' }, { id: 'sturdy', tier: 'tall' }],
  obsidianid: [{ id: 'slight', tier: 'tall' }, { id: 'sturdy', tier: 'tall' }, { id: 'heavy', tier: 'tall' }],
  crystalkin: [{ id: 'slight', tier: 'very_tall' }, { id: 'sturdy', tier: 'very_tall' }],
  florean: [{ id: 'sprout', tier: 'small' }, { id: 'bloom', tier: 'medium' }, { id: 'briar', tier: 'tall' }],
  beasthral: [{ id: 'pup', tier: 'small' }, { id: 'stalker', tier: 'medium' }, { id: 'brute', tier: 'tall' }],
}

/** Heads per ancestry (GDD §3.3's signature cues); option 0 is the ancestry's plain head. */
export const HEADS: Record<Ancestry, readonly string[]> = {
  aquanid: ['head.aquanid'],
  lunaris: ['head.lunaris'],
  dragu: ['head.dragu'],
  seraphra: ['head.seraphra'],
  aeronid: ['head.aeronid'],
  umbreth: ['head.umbreth'],
  eldrith: ['head.eldrith'],
  obsidianid: ['head.obsidianid'],
  crystalkin: ['head.crystalkin'],
  florean: ['head.florean'],
  beasthral: ['head.beasthral'],
}

/**
 * The shared slot tables. Option 0 of hair, back, accessory and tabard is `none`, which draws nothing, so the fallback
 * for an unknown option never needs art. Names past 0 are provisional until the first import names the layers.
 */
export const HAIR = ['hair.none', 'hair.crop', 'hair.long', 'hair.braid', 'hair.bun', 'hair.wild', 'hair.bloom', 'hair.mushroom', 'hair.petal'] as const
export const BACKS = ['back.none', 'back.wings_black', 'back.pinu', 'back.tail', 'back.cloak', 'back.tattered_cloak', 'back.quiver', 'back.growths', 'back.vines'] as const
export const ACCESSORIES = ['accessory.none', 'accessory.halo', 'accessory.chains', 'accessory.shard_charm', 'accessory.sigil', 'accessory.eyepatch'] as const
/** Option 0 wears the career outfit; the rest are faction tabards over it, named when the factions are (GDD §4). */
export const TABARDS = ['tabard.none', 'tabard.castellum', 'tabard.expedition', 'tabard.supremacy'] as const

/** The outfit every Squire starts in (GDD §3.5, §7.4: tier 0 is shared by both classes). */
export const SQUIRE_OUTFIT = 'outfit.squire'

export const DEFAULT_LOOK: Look = { ancestry: 0, build: 0, head: 0, hair: 0, back: 0, accessory: 0, tabard: 0 }

/** How many options a field has for a look: builds and heads follow the chosen ancestry. */
export function optionCount(field: LookField, look: Pick<Look, 'ancestry'>): number {
  const ancestry = ANCESTRIES[look.ancestry] ?? ANCESTRIES[0]
  switch (field) {
    case 'ancestry':
      return ANCESTRIES.length
    case 'build':
      return BUILDS[ancestry].length
    case 'head':
      return HEADS[ancestry].length
    case 'hair':
      return HAIR.length
    case 'back':
      return BACKS.length
    case 'accessory':
      return ACCESSORIES.length
    case 'tabard':
      return TABARDS.length
  }
}

/** Every field inside its table, so a look always names real options (the fallback for anything else is option 0). */
export function normaliseLook(look: Look): Look {
  const ancestry = Number.isInteger(look.ancestry) && look.ancestry >= 0 && look.ancestry < ANCESTRIES.length ? look.ancestry : 0
  const clamp = (field: LookField, value: number) => (Number.isInteger(value) && value >= 0 && value < optionCount(field, { ancestry }) ? value : 0)
  return { ancestry, build: clamp('build', look.build), head: clamp('head', look.head), hair: clamp('hair', look.hair), back: clamp('back', look.back), accessory: clamp('accessory', look.accessory), tabard: clamp('tabard', look.tabard) }
}

/** `v1.` and one base-32 character per field, e.g. `v1.3a1452k0`. Fields outside their tables encode as 0. */
export function encodeLook(look: Look): string {
  const safe = normaliseLook(look)
  return `${LOOK_VERSION}.${LOOK_FIELDS.map((field) => ALPHABET[safe[field]]).join('')}`
}

/** The look a code names. Anything but a `v1.` code of seven characters, and any unknown field, reads as option 0. */
export function decodeLook(code: string): Look {
  if (!LOOK_RE.test(code)) return DEFAULT_LOOK
  const raw = Object.fromEntries(LOOK_FIELDS.map((field, i) => [field, ALPHABET.indexOf(code[LOOK_VERSION.length + 1 + i]!)])) as Record<LookField, number>
  return normaliseLook(raw)
}

export const isLookCode = (code: string): boolean => LOOK_RE.test(code)

/** The part ids a look chooses, one per slot (GDD §3.2); `held` comes from the equipped gear, not the look. */
export function lookParts(look: Look): HeroParts {
  const safe = normaliseLook(look)
  const ancestry = ANCESTRIES[safe.ancestry]!
  const build = BUILDS[ancestry][safe.build]!
  const parts: { -readonly [K in keyof HeroParts]: HeroParts[K] } = { body: `${ancestry}.${build.id}`, head: HEADS[ancestry][safe.head]!, outfit: safe.tabard === 0 ? SQUIRE_OUTFIT : TABARDS[safe.tabard]! }
  if (safe.hair !== 0) parts.hair = HAIR[safe.hair]!
  if (safe.back !== 0) parts.back = BACKS[safe.back]!
  if (safe.accessory !== 0) parts.accessory = ACCESSORIES[safe.accessory]!
  return parts
}

/** The body tier a look is drawn at. */
export const lookTier = (look: Look): BodyTier => {
  const safe = normaliseLook(look)
  return BUILDS[ANCESTRIES[safe.ancestry]!][safe.build]!.tier
}
