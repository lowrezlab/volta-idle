import { heroPoses, poseParts, type HeroPose } from './hero'
import { monsterArt } from './monsters'
import { encodePng1Bit, encodePngPalette } from './png'
import { propArt, type PropId } from './props'
import { composeScene, FULL_SCALE, LARGE_SCALE, MEDIUM_SCALE, SCENE_VERSION, scenePlacements, SMALL_SCALE, STAGE_HEIGHT, STAGE_WIDTH, type BiomeArt, type Subject } from './scene'
import { Canvas } from './canvas'
import { isOccasionArt, type OccasionArt } from './occasions'
import { BWRY_PALETTE, bwryInk, BwryInk, sceneColours } from './sceneColour'
import { LAYERED_SCENE_VERSION, type SceneTime } from './sceneTime'
import { layeredHeroFor, registryOf, type LayeredHero, type PartRegistry } from './layered'
import { decodeLook, isLookCode, lookParts } from './look'
import { PARTS } from './parts/generated'

const BIOMES = new Set<BiomeArt>(['office_cubicles', 'server_room', 'cafeteria_depths', 'archive', 'parking_garage'])
const SCALES = new Set([FULL_SCALE, SMALL_SCALE, LARGE_SCALE, MEDIUM_SCALE])

/** The imported parts (parts/generated), indexed once. */
const REGISTRY: PartRegistry = registryOf(PARTS)

export interface ParsedScenePath {
  readonly biome: BiomeArt
  readonly pose: HeroPose
  readonly subject: Subject
  readonly scale: number
  readonly time: SceneTime
  readonly bwry: boolean
  readonly occasion?: OccasionArt
  /** Scene v6: the hero's look code (look.ts). */
  readonly look?: string
}

/**
 * Strict v6 paths with a look code (GDD §3.6), strict v5 paths with an occasion segment (D139), frozen v4 day/night
 * paths and frozen v3 night paths, for cached screens and rolling releases. A `-bwry` scale suffix (v4 on) asks for
 * the four-ink image (D94).
 */
export function parseScenePath(path: string): ParsedScenePath | null {
  const layered = /^\/art\/scene\/v(\d+)\/([a-z_]+)\/(day|night)\/([a-z0-9_]+)\/([a-z0-9.]+)\/([a-z_]+)\/([a-z_-]+)\/(\d)(-bwry)?\.png$/.exec(path)
  if (layered) {
    const [, versionText, biome, timeText, occasionText, look, pose, segment, scaleText, bwrySuffix] = layered
    if (Number(versionText) !== LAYERED_SCENE_VERSION || !isLookCode(look!)) return null
    const parsed = parseSceneParts(biome!, timeText, occasionText, pose!, segment!, scaleText!, bwrySuffix)
    return parsed === null ? null : { ...parsed, look: look! }
  }
  const match = /^\/art\/scene\/v(\d+)\/([a-z_]+)\/(?:(day|night)\/)?(?:([a-z0-9_]+)\/(?=[a-z_]+\/[a-z_-]+\/\d))?([a-z_]+)\/([a-z_-]+)\/(\d)(-bwry)?\.png$/.exec(path)
  if (!match) return null
  const [, versionText, biome, timeText, occasionText, pose, segment, scaleText, bwrySuffix] = match
  if (!biome || !pose || !segment || !scaleText) return null
  const version = Number(versionText)
  const valid = (version === SCENE_VERSION && timeText && occasionText) || (version === 4 && timeText && !occasionText) || (version === 3 && !timeText && !occasionText && !bwrySuffix)
  if (!valid) return null
  return parseSceneParts(biome, timeText, occasionText, pose, segment, scaleText, bwrySuffix)
}

/** The segments every version shares, checked against the art that exists. */
function parseSceneParts(biome: string, timeText: string | undefined, occasionText: string | undefined, pose: string, segment: string, scaleText: string, bwrySuffix: string | undefined): ParsedScenePath | null {
  if (occasionText !== undefined && occasionText !== 'plain' && !isOccasionArt(occasionText)) return null
  const scale = Number(scaleText)
  if (!BIOMES.has(biome as BiomeArt) || !(pose in heroPoses) || !SCALES.has(scale)) return null
  let subject: Subject
  if (segment === 'none') subject = { kind: 'none' }
  else if (segment.startsWith('monster-') || segment.startsWith('elite-')) {
    const id = segment.slice(segment.indexOf('-') + 1)
    if (!(id in monsterArt)) return null
    subject = { kind: 'monster', id: id as keyof typeof monsterArt, elite: segment.startsWith('elite-') }
  } else if (segment.startsWith('coworker-')) {
    // D141: `coworker-<class>` or `coworker-<class>-<prop>`; D149: the class is `female_<class>` for the female look.
    const [who = '', ...rest] = segment.slice(9).split('-')
    const female = who.startsWith('female_')
    const heroClass = female ? who.slice(7) : who
    const prop = rest.join('-')
    if ((heroClass !== 'warrior' && heroClass !== 'rogue') || (prop !== '' && !(prop in propArt))) return null
    subject = { kind: 'coworker', heroClass, ...(female ? { gender: 'female' as const } : {}), ...(prop === '' ? {} : { prop: prop as PropId }) }
  } else if (segment.startsWith('prop-')) {
    const id = segment.slice(5)
    if (!(id in propArt)) return null
    subject = { kind: 'prop', id: id as PropId }
  } else return null
  const occasion = occasionText !== undefined && occasionText !== 'plain' ? (occasionText as OccasionArt) : undefined
  return { biome: biome as BiomeArt, pose: pose as HeroPose, subject, scale, time: (timeText ?? 'night') as SceneTime, bwry: bwrySuffix !== undefined, ...(occasion === undefined ? {} : { occasion }) }
}

/**
 * The layered hero a parsed path draws, when it carries a look and the registry can draw that look's body in the
 * pose; otherwise undefined, and the scene draws the pose's whole sprite, so a v6 URL always renders.
 */
export function sceneHero(parsed: Pick<ParsedScenePath, 'pose' | 'look'>, registry: PartRegistry = REGISTRY): LayeredHero | undefined {
  if (parsed.look === undefined) return undefined
  return layeredHeroFor(lookParts(decodeLook(parsed.look)), poseParts(parsed.pose).base, registry) ?? undefined
}

export function renderScenePng(path: string): Uint8Array | null {
  const parsed = parseScenePath(path)
  if (!parsed) return null
  const layered = sceneHero(parsed)
  const { width, height, ink } = composeScene(parsed.biome, parsed.pose, parsed.subject, parsed.time, new Canvas(STAGE_WIDTH, STAGE_HEIGHT), parsed.occasion, layered).scaled(parsed.scale)
  if (!parsed.bwry) return encodePng1Bit(width, height, ink)
  // Ink stays ink; paper inside a sprite takes the companion's fill reduced to the panel's inks, and the rest is clear.
  const fills = sceneColours(parsed.pose, scenePlacements(parsed.pose, parsed.subject, parsed.occasion, layered))
  const index = new Uint8Array(width * height)
  for (let y = 0; y < height; y += 1) {
    const row = fills[Math.floor(y / parsed.scale)]!
    for (let x = 0; x < width; x += 1) {
      const fill = row[Math.floor(x / parsed.scale)]
      index[y * width + x] = ink[y * width + x] ? BwryInk.Black : fill ? bwryInk(fill) : BwryInk.White
    }
  }
  return encodePngPalette(width, height, index, BWRY_PALETTE, BwryInk.White)
}
