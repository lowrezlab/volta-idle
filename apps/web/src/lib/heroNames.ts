import { ANCESTRIES, type Ancestry } from '@trmnl-games/wardenwatch/art/look'
import { HERO_NAME_RULE, validateName } from '@trmnl-games/platform'

/**
 * P3.2: "suggest a name" in the creator. Each of Volta's eleven peoples names its children in its own tongue (lore
 * 02, the ancestry sheets), so a suggestion is built from that people's syllables: a beginning and an ending, now and
 * then a middle. The pools are small by design; they only have to sound right and pass the hero-name rule
 * (ASCII letters, 2-16 characters), and the player can always type over them.
 */
interface Namebase { readonly starts: readonly string[]; readonly middles?: readonly string[]; readonly ends: readonly string[]; readonly joiner?: string }

const NAMEBASES: Record<Ancestry, Namebase> = {
  // Eldrith: the old desert tongue, close to Hebrew with an Italianate ring.
  eldrith: { starts: ['Ash', 'Ela', 'Mir', 'Yar', 'Sal', 'Tam', 'Ori', 'Nav', 'Zev', 'Adi'], middles: ['ra', 'li', 'ne'], ends: ['iel', 'ael', 'ah', 'im', 'ira', 'eth', 'ona', 'ani', 'oam', 'ya'] },
  // Aquanids: short, open syllables, in the manner of Japanese.
  aquanid: { starts: ['Kai', 'Umi', 'Nami', 'Sora', 'Hiro', 'Mizu', 'Ren', 'Tsu', 'Hana', 'Yori'], ends: ['ko', 'ya', 'shi', 'to', 'mi', 'na', 'ru', 'ki', 'e', 'o'] },
  // Aeronids: the high wind-tongue, in the manner of Quechua.
  aeronid: { starts: ['Inti', 'Qori', 'Wayra', 'Killa', 'Tupa', 'Amaru', 'Sumaq', 'Chaska', 'Paqo', 'Illa'], ends: ['', 'q', 'y', 'pa', 'ri', 'cha', 'ku', 'ya'] },
  // Obsidianids: the stone-people's tongue, in the manner of Tamazight.
  obsidianid: { starts: ['Tam', 'Azr', 'Idir', 'Mass', 'Yuba', 'Tiz', 'Aksel', 'Dihya', 'Ghil', 'Tin'], ends: ['ar', 'ou', 'ina', 'ane', 'ir', 'is', 'ast', 'ez'] },
  // Floreans: soft and vowel-rich, in the manner of Hawaiian.
  florean: { starts: ['Kalo', 'Lani', 'Noa', 'Pua', 'Keo', 'Mala', 'Hoku', 'Lehua', 'Mele', 'Ahi'], ends: ['', 'ni', 'ku', 'lei', 'ala', 'iki', 'na', 'o'] },
  // Umbreth: the shadow-people's old Germanic and Dutch names.
  umbreth: { starts: ['Wolf', 'Hild', 'Sieg', 'Brun', 'Gund', 'Ald', 'Eber', 'Rad', 'Dirk', 'Swan'], ends: ['ric', 'run', 'mar', 'hard', 'wig', 'ulf', 'gard', 'bert', 'hild', 'o'] },
  // Lunaris: the moon-people's pre-Latin tongue.
  lunaris: { starts: ['Lun', 'Vel', 'Sor', 'Cae', 'Mar', 'Tul', 'Ner', 'Vib', 'Sen', 'Ocr'], ends: ['ia', 'ius', 'enna', 'ix', 'ona', 'ax', 'ilia', 'us', 'esia', 'ulus'] },
  // Seraphra: compound names in the angelic manner.
  seraphra: { starts: ['Sera', 'Uri', 'Cass', 'Azra', 'Rami', 'Zad', 'Ophan', 'Nuri', 'Hael', 'Tzaph'], ends: ['el', 'iel', 'phel', 'ael', 'ieth', 'on', 'kiel', 'im'] },
  // Dragu: the Serpent tongue of the Draguun, sibilant and hard.
  dragu: { starts: ['Ssar', 'Vazh', 'Drak', 'Isz', 'Korr', 'Nessh', 'Thal', 'Zir', 'Hask', 'Vyr'], ends: ['ak', 'ith', 'ess', 'ul', 'ax', 'oth', 'ira', 'un', 'esh', 'ad'] },
  // Beasthral: earned names in the Giant manner, two plain words.
  beasthral: { starts: ['Stone', 'Iron', 'Grey', 'Bramble', 'Frost', 'Ember', 'Moss', 'Tusk', 'River', 'Thorn'], ends: ['jaw', 'hide', 'fang', 'tread', 'maw', 'claw', 'back', 'heart', 'mane', 'paw'] },
  // Crystalkin: the forge-people's names, German and industrial.
  crystalkin: { starts: ['Glas', 'Stahl', 'Erz', 'Quarz', 'Kiesel', 'Funk', 'Schlack', 'Hart', 'Zinn', 'Flint'], ends: ['er', 'mann', 'in', 'hild', 'grat', 'werk', 'berg', 'ritt', 'a', 'o'] },
}

/** A small deterministic generator (mulberry32), so the same ancestry and seed always suggest the same name. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const hashOf = (text: string) => [...text].reduce((hash, character) => (Math.imul(hash, 31) + character.charCodeAt(0)) >>> 0, 7)

/**
 * The name the creator suggests for an ancestry at a given press. Deterministic per (ancestry, seed), always valid
 * under HERO_NAME_RULE, and consecutive seeds rarely repeat. An unknown ancestry index falls back to the first.
 */
export function suggestName(ancestry: Ancestry | number, seed: number): string {
  const key: Ancestry = typeof ancestry === 'number' ? ANCESTRIES[ancestry] ?? ANCESTRIES[0] : ancestry
  const base = NAMEBASES[key] ?? NAMEBASES[ANCESTRIES[0]]
  for (let attempt = 0; attempt < 8; attempt++) {
    const random = mulberry32(hashOf(key) ^ Math.imul(seed + attempt * 977, 2654435761))
    const pick = <T,>(options: readonly T[]) => options[Math.floor(random() * options.length)]!
    const middle = base.middles && random() < 0.35 ? pick(base.middles) : ''
    const name = `${pick(base.starts)}${middle}${pick(base.ends)}`
    const result = validateName(name, HERO_NAME_RULE)
    if (result.ok) return result.value
  }
  return key.charAt(0).toUpperCase() + key.slice(1)
}
