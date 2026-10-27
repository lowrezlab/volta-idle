import { describe, expect, it } from 'vitest'
import { sprite } from '@trmnl-games/wardenwatch/art/canvas'
import { composeLayeredHero, HERO_SIZE, layeredHeroFor, LYING_POSES, registryOf, type HeroParts, type LayeredHero } from '@trmnl-games/wardenwatch/art/layered'
import { ACCESSORIES, ANCESTRIES, BACKS, BUILDS, decodeLook, DEFAULT_LOOK, encodeLook, HAIR, HEADS, isLookCode, LOOK_FIELDS, LOOK_VERSION, lookParts, lookTier, normaliseLook, optionCount, SQUIRE_OUTFIT, TABARDS, type Look } from '@trmnl-games/wardenwatch/art/look'
import { BASE_POSES, SLOT_ANCHOR, SLOTS, type Part, type PartFrame, type PartPose, type Point } from '@trmnl-games/wardenwatch/art/parts/types'
import { PARTS } from '@trmnl-games/wardenwatch/art/parts/generated/index'
import { dressingFor, OCCASION_ARTS } from '@trmnl-games/wardenwatch/art/occasions'
import { parseScenePath, renderScenePng, sceneHero, type ParsedScenePath } from '@trmnl-games/wardenwatch/art/route'
import { composeScene, scenePlacements } from '@trmnl-games/wardenwatch/art/scene'
import { layeredScenePath, scenePath } from '@trmnl-games/wardenwatch/art/sceneKey'
import { LAYERED_SCENE_VERSION, sceneUrlAt } from '@trmnl-games/wardenwatch/art/sceneTime'

/*
 * Fixture parts: a body that marks its anchors, a head with a crown, hair, a back part without lying poses and an
 * accessory on the neck. Each draws a distinct glyph so the composition can be read back cell by cell.
 */
const BODY_ANCHORS: Record<PartPose, { head: Point; neck: Point; hand: Point; back: Point }> = {
  idle: { head: { x: 12, y: 2 }, neck: { x: 12, y: 8 }, hand: { x: 18, y: 12 }, back: { x: 12, y: 9 } },
  fight: { head: { x: 13, y: 2 }, neck: { x: 13, y: 8 }, hand: { x: 20, y: 10 }, back: { x: 13, y: 9 } },
  walk: { head: { x: 12, y: 3 }, neck: { x: 12, y: 9 }, hand: { x: 18, y: 13 }, back: { x: 12, y: 10 } },
  rest: { head: { x: 12, y: 7 }, neck: { x: 12, y: 13 }, hand: { x: 18, y: 17 }, back: { x: 12, y: 14 } },
  sleep: { head: { x: 4, y: 12 }, neck: { x: 4, y: 16 }, hand: { x: 14, y: 20 }, back: { x: 4, y: 14 } },
  knocked_out: { head: { x: 4, y: 10 }, neck: { x: 4, y: 14 }, hand: { x: 14, y: 20 }, back: { x: 4, y: 12 } },
}

/** A 24x24 body: a `#` spine down from the head anchor (the back anchor sits on it), `w` at the neck, feet on row 23. */
function bodyFrame(pose: PartPose): PartFrame {
  const rows = Array.from({ length: HERO_SIZE }, () => new Array<string>(HERO_SIZE).fill(' '))
  const a = BODY_ANCHORS[pose]
  for (let y = a.head.y; y < HERO_SIZE; y += 1) rows[y]![a.head.x] = '#'
  rows[a.neck.y]![a.neck.x] = 'w'
  rows[HERO_SIZE - 1]![a.head.x - 1] = '#'
  rows[HERO_SIZE - 1]![a.head.x + 1] = '#'
  return { sprite: { width: HERO_SIZE, height: HERO_SIZE, rows: rows.map((r) => r.join('')) }, origin: { x: 0, y: 0 }, anchors: a }
}

const frames = (make: (pose: PartPose) => PartFrame, poses: readonly PartPose[] = BASE_POSES): Part['frames'] => Object.fromEntries(poses.map((pose) => [pose, make(pose)]))

const HEAD = sprite(`
 :::
:::::
:::::
 :::
`)
const HAIR_TUFT = sprite(`
==
==
`)
const WINGS = sprite(`
....
....
....
`)
const CHARM = sprite(`
#
`)

const body: Part = { slot: 'body', id: 'test.slight', tier: 'medium', frames: frames(bodyFrame) }
/** The head's origin is its top-centre; its crown is the cell above that, so hair sits on top of the skull. */
const head: Part = { slot: 'head', id: 'head.test', frames: frames(() => ({ sprite: HEAD, origin: { x: 2, y: 0 }, anchors: { crown: { x: 2, y: -1 } } })) }
/** The tuft's origin is its top-left, so on the crown it covers the row above the skull and the skull's top row. */
const hair: Part = { slot: 'hair', id: 'hair.tuft', frames: frames(() => ({ sprite: HAIR_TUFT, origin: { x: 0, y: 0 }, anchors: {} })) }
const back: Part = { slot: 'back', id: 'back.wings', frames: frames(() => ({ sprite: WINGS, origin: { x: 3, y: 1 }, anchors: {} }), ['idle', 'fight', 'walk']) }
const charm: Part = { slot: 'accessory', id: 'accessory.charm', frames: frames(() => ({ sprite: CHARM, origin: { x: 0, y: 0 }, anchors: {} })) }
/** The same outfit id drawn once per tier: the composition must pick the body's tier. */
const outfitMedium: Part = { slot: 'outfit', id: 'outfit.test', tier: 'medium', frames: frames(() => ({ sprite: sprite('M'), origin: { x: -1, y: -20 }, anchors: {} })) }
const outfitTall: Part = { slot: 'outfit', id: 'outfit.test', tier: 'tall', frames: frames(() => ({ sprite: sprite('T'), origin: { x: -1, y: -20 }, anchors: {} })) }

const registry = registryOf([body, head, hair, back, charm, outfitTall, outfitMedium])
const full: HeroParts = { body: 'test.slight', head: 'head.test', hair: 'hair.tuft', back: 'back.wings', accessory: 'accessory.charm', outfit: 'outfit.test' }
const cell = (hero: LayeredHero, x: number, y: number) => hero.sprite.rows[y]![x]

describe('layered hero composition', () => {
  it('places the body at 0,0 and every other part with its origin on its anchor, in slot order', () => {
    for (const pose of BASE_POSES) {
      const hero = composeLayeredHero(full, pose, registry)
      const a = BODY_ANCHORS[pose]
      expect([hero.sprite.width, hero.sprite.height]).toEqual([HERO_SIZE, HERO_SIZE])
      expect(hero.head).toEqual(a.head)
      // The body's feet stay on row 23.
      expect(cell(hero, a.head.x - 1, HERO_SIZE - 1)).toBe('#')
      // The head's origin (its top-centre) lands on the head anchor: its top row's other cells and its second row are `:`.
      expect(cell(hero, a.head.x - 1, a.head.y)).toBe(':')
      expect(cell(hero, a.head.x - 2, a.head.y + 1)).toBe(':')
      expect(cell(hero, a.head.x - 3, a.head.y + 1)).toBe(' ')
      // Hair hangs from the crown, the row above the skull, where only the tuft draws.
      expect(cell(hero, a.head.x, a.head.y - 1)).toBe('=')
      expect(cell(hero, a.head.x + 1, a.head.y - 1)).toBe('=')
      // Hair is drawn after the head, so where they overlap the hair's glyph wins over the head's `:`.
      expect(cell(hero, a.head.x, a.head.y)).toBe('=')
      expect(cell(hero, a.head.x + 1, a.head.y)).toBe('=')
      // The charm sits on the neck, over the body's `w`.
      expect(cell(hero, a.neck.x, a.neck.y)).toBe('#')
      // The outfit for the body's tier (medium), not the tall one.
      expect(cell(hero, 1, 20)).toBe('M')
      // A cell no part touches stays transparent.
      expect(cell(hero, 0, 0)).toBe(' ')
    }
  })

  it('draws the back slot behind the body in standing poses and hides it lying down', () => {
    for (const pose of BASE_POSES) {
      const hero = composeLayeredHero(full, pose, registry)
      const a = BODY_ANCHORS[pose]
      const wingCells = hero.sprite.rows.flatMap((row) => [...row]).filter((ch) => ch === '.').length
      if (LYING_POSES.has(pose)) {
        expect(wingCells).toBe(0)
        continue
      }
      // Wings: 4x3 with their origin (3,1) on the back anchor; the body's spine is drawn over their last column.
      expect(cell(hero, a.back.x - 3, a.back.y - 1)).toBe('.')
      expect(cell(hero, a.back.x, a.back.y)).toBe('#')
      expect(wingCells).toBe(4 * 3 - 3)
    }
    expect(LYING_POSES).toEqual(new Set(['rest', 'sleep', 'knocked_out']))
  })

  it('draws nothing for a missing optional part, and nothing past the frame', () => {
    const bare = composeLayeredHero({ body: 'test.slight' }, 'idle', registry)
    expect(bare.sprite.rows).toEqual(body.frames.idle!.sprite.rows)
    const unknown = composeLayeredHero({ body: 'test.slight', hair: 'hair.nobody_drew_this', head: 'head.test' }, 'idle', registry)
    const headOnly = composeLayeredHero({ body: 'test.slight', head: 'head.test' }, 'idle', registry)
    expect(unknown.sprite.rows).toEqual(headOnly.sprite.rows)
    // Hair with no head to hang from draws nothing: there is no crown.
    expect(composeLayeredHero({ body: 'test.slight', hair: 'hair.tuft' }, 'idle', registry).sprite.rows).toEqual(bare.sprite.rows)
    // A part placed off the edge is clipped, never thrown.
    const edge = registryOf([body, { slot: 'accessory', id: 'accessory.edge', frames: frames(() => ({ sprite: sprite('ww'), origin: { x: -23, y: 0 }, anchors: {} })) }])
    const clipped = composeLayeredHero({ body: 'test.slight', accessory: 'accessory.edge' }, 'idle', edge)
    expect(clipped.sprite.rows.every((row) => row.length === HERO_SIZE)).toBe(true)
  })

  it('throws on a missing body, which layeredHeroFor reports as null for the fallback', () => {
    expect(() => composeLayeredHero({ body: 'nobody' }, 'idle', registry)).toThrow(/body/)
    expect(layeredHeroFor({ body: 'nobody' }, 'idle', registry)).toBeNull()
    expect(layeredHeroFor(full, 'idle', registry)).not.toBeNull()
    // A body drawn for standing poses only cannot stand in for the lying ones.
    const standing = registryOf([{ ...body, frames: frames(bodyFrame, ['idle', 'fight', 'walk']) }])
    expect(layeredHeroFor({ body: 'test.slight' }, 'idle', standing)).not.toBeNull()
    expect(layeredHeroFor({ body: 'test.slight' }, 'sleep', standing)).toBeNull()
    expect(() => composeLayeredHero({ body: 'test.slight' }, 'sleep', standing)).toThrow(/sleep/)
  })

  it('follows the parts contract: slot order back to front and one anchor per slot', () => {
    expect(SLOTS).toEqual(['back', 'body', 'outfit', 'head', 'hair', 'accessory', 'held'])
    expect(SLOT_ANCHOR).toEqual({ back: 'back', body: null, outfit: null, head: 'head', hair: 'crown', accessory: 'neck', held: 'hand' })
    // The generated registry is a stub until the first import; every entry it gets must be a part for a known slot.
    for (const part of PARTS) expect(SLOTS).toContain(part.slot)
  })
})

describe('look code', () => {
  const alphabet = '0123456789abcdefghijklmnopqrstuv'
  const every = (): Look[] => {
    const looks: Look[] = []
    for (let ancestry = 0; ancestry < ANCESTRIES.length; ancestry += 1) {
      for (let build = 0; build < optionCount('build', { ancestry }); build += 1) {
        for (let head = 0; head < optionCount('head', { ancestry }); head += 1) {
          for (let hair = 0; hair < HAIR.length; hair += 1) {
            for (let back = 0; back < BACKS.length; back += 1) {
              for (let accessory = 0; accessory < ACCESSORIES.length; accessory += 1) for (let tabard = 0; tabard < TABARDS.length; tabard += 1) looks.push({ ancestry, build, head, hair, back, accessory, tabard })
            }
          }
        }
      }
    }
    return looks
  }

  it('round-trips every look through a v1 code of one base-32 character per field', () => {
    const codes = new Set<string>()
    for (const look of every()) {
      const code = encodeLook(look)
      expect(code).toMatch(/^v1\.[0-9a-v]{7}$/)
      expect(isLookCode(code)).toBe(true)
      expect(decodeLook(code)).toEqual(look)
      expect(normaliseLook(look)).toEqual(look)
      codes.add(code)
    }
    expect(codes.size).toBe(every().length)
    expect(encodeLook(DEFAULT_LOOK)).toBe(`${LOOK_VERSION}.0000000`)
    expect(LOOK_FIELDS).toEqual(['ancestry', 'build', 'head', 'hair', 'back', 'accessory', 'tabard'])
    expect(encodeLook({ ancestry: 6, build: 1, head: 0, hair: 3, back: 4, accessory: 5, tabard: 2 })).toBe('v1.6103452')
  })

  it('reads an unknown or garbage field as option 0 and never throws on user input', () => {
    expect(decodeLook('')).toEqual(DEFAULT_LOOK)
    expect(decodeLook('v1.')).toEqual(DEFAULT_LOOK)
    expect(decodeLook('v2.0000000')).toEqual(DEFAULT_LOOK)
    expect(decodeLook('v1.00000000')).toEqual(DEFAULT_LOOK)
    expect(decodeLook('../../etc')).toEqual(DEFAULT_LOOK)
    // A retired or not-yet-drawn option (past the table's end, or a letter outside the alphabet) is option 0 for that field alone.
    expect(decodeLook('v1.6v00000')).toEqual({ ...DEFAULT_LOOK, ancestry: 6 })
    expect(decodeLook('v1.6z00000')).toEqual({ ...DEFAULT_LOOK, ancestry: 6 })
    expect(decodeLook('v1.00z1000')).toEqual({ ...DEFAULT_LOOK, hair: 1 })
    // A build the ancestry lacks: Eldrith has two builds, Obsidianids three.
    expect(decodeLook('v1.6200000').build).toBe(0)
    expect(decodeLook('v1.7200000').build).toBe(2)
    // An ancestry past the table falls back on its own; the other fields keep what the fallback ancestry can draw.
    expect(decodeLook('v1.v100000')).toEqual({ ...DEFAULT_LOOK, build: 1 })
    expect(decodeLook('v1.v200000')).toEqual(DEFAULT_LOOK)
    expect(encodeLook({ ancestry: -1, build: 99, head: NaN, hair: 2.5, back: Infinity, accessory: 1, tabard: 1 })).toBe('v1.0000011')
  })

  it('fuzz: any string decodes to a look whose code decodes back to the same look', () => {
    let seed = 20261027
    const random = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff
    const pool = `${alphabet}wxyz./-_V 1Ü%`
    for (let i = 0; i < 2000; i += 1) {
      const prefix = random() < 0.7 ? 'v1.' : random() < 0.5 ? '' : 'v9.'
      const length = Math.floor(random() * 12)
      const code = prefix + Array.from({ length }, () => pool[Math.floor(random() * pool.length)]).join('')
      const look = decodeLook(code)
      for (const field of LOOK_FIELDS) {
        expect(Number.isInteger(look[field])).toBe(true)
        expect(look[field]).toBeGreaterThanOrEqual(0)
        expect(look[field]).toBeLessThan(optionCount(field, look))
      }
      expect(decodeLook(encodeLook(look))).toEqual(look)
      expect(lookParts(look).body).toMatch(/^[a-z]+\.[a-z]+$/)
    }
  })

  it('names parts by the contract: body <ancestry>.<build>, the rest <slot>.<option>, nothing for option 0 of an optional slot', () => {
    expect(ANCESTRIES).toEqual(['aquanid', 'lunaris', 'dragu', 'seraphra', 'aeronid', 'umbreth', 'eldrith', 'obsidianid', 'crystalkin', 'florean', 'beasthral'])
    expect(lookParts(DEFAULT_LOOK)).toEqual({ body: 'aquanid.slight', head: 'head.aquanid', outfit: SQUIRE_OUTFIT })
    expect(lookTier(DEFAULT_LOOK)).toBe('small')
    const eldrith = decodeLook('v1.6103452')
    expect(lookParts(eldrith)).toEqual({ body: 'eldrith.sturdy', head: 'head.eldrith', hair: 'hair.braid', back: 'back.cloak', accessory: 'accessory.eyepatch', outfit: 'tabard.expedition' })
    expect(lookTier(eldrith)).toBe('tall')
    // The variable ancestries pick a tier by build (GDD §3.3).
    expect(BUILDS.florean.map((b) => `${b.id}:${b.tier}`)).toEqual(['sprout:small', 'bloom:medium', 'briar:tall'])
    expect(BUILDS.beasthral.map((b) => `${b.id}:${b.tier}`)).toEqual(['pup:small', 'stalker:medium', 'brute:tall'])
    expect(BUILDS.obsidianid.map((b) => b.id)).toEqual(['slight', 'sturdy', 'heavy'])
    expect(BUILDS.crystalkin.every((b) => b.tier === 'very_tall')).toBe(true)
    for (const ancestry of ANCESTRIES) {
      expect(HEADS[ancestry][0]).toBe(`head.${ancestry}`)
      expect(BUILDS[ancestry].length).toBeGreaterThanOrEqual(2)
    }
    // Option 0 of every optional slot draws nothing, so the fallback never needs art.
    expect([HAIR[0], BACKS[0], ACCESSORIES[0], TABARDS[0]]).toEqual(['hair.none', 'back.none', 'accessory.none', 'tabard.none'])
  })
})

describe('scene v6', () => {
  const look = 'v1.6103452'
  const v6 = layeredScenePath('office_cubicles', look, 'idle', { kind: 'none' }, 5)
  const v5 = scenePath('office_cubicles', 'idle', { kind: 'none' }, 5)

  it('builds and parses a v6 path with the look between the occasion and the pose, leaving v5 as it was', () => {
    expect(LAYERED_SCENE_VERSION).toBe(6)
    expect(v6).toBe('/art/scene/v6/office_cubicles/day/plain/v1.6103452/idle/none/5.png')
    expect(v5).toBe('/art/scene/v5/office_cubicles/day/plain/idle/none/5.png')
    const parsed = parseScenePath(v6)
    expect(parsed).toEqual({ ...parseScenePath(v5), look })
    expect(parseScenePath(v5)?.look).toBeUndefined()
    const fight = layeredScenePath('server_room', look, 'rogue_fight', { kind: 'monster', id: 'cable_serpent', elite: true }, 3, 'night', 'halloween')
    expect(fight).toBe('/art/scene/v6/server_room/night/halloween/v1.6103452/rogue_fight/elite-cable_serpent/3.png')
    expect(parseScenePath(fight)).toMatchObject({ biome: 'server_room', time: 'night', occasion: 'halloween', pose: 'rogue_fight', scale: 3, look })
    expect(parseScenePath(fight.replace('.png', '-bwry.png'))).toMatchObject({ bwry: true, look })
    for (const bad of [
      v6.replace('v6', 'v5'),
      v6.replace('v6', 'v7'),
      v6.replace(look, 'v2.6103452'),
      v6.replace(look, 'v1.610345'),
      v6.replace(look, 'v1.61034522'),
      v6.replace(look, 'v1.6103452.'),
      v6.replace(look, 'V1.6103452'),
      v6.replace(`/${look}/`, '/'),
      v6.replace('/plain/', '/'),
      v6.replace('/day/', '/'),
      v6.replace('/plain/', '/birthday/'),
      v6.replace('/idle/', '/jump/'),
      v6.replace('/5.png', '/9.png'),
      v6.replace('office_cubicles', 'moon_base'),
    ]) {
      expect(parseScenePath(bad)).toBeNull()
    }
    // A code with retired options is still a valid URL: the fields fall back when the look is drawn.
    expect(parseScenePath(v6.replace(look, 'v1.zzzzzzz'))).toMatchObject({ look: 'v1.zzzzzzz' })
    // The local clock turns the sky on v6 URLs as on v5 ones.
    expect(sceneUrlAt(`https://example.test${v6}`, 'night')).toBe(`https://example.test${v6.replace('/day/', '/night/')}`)
    expect(sceneUrlAt(v6.replace('/day/', '/night/'), 'day')).toBe(v6)
  })

  it('falls back to the whole-sprite hero while the registry cannot draw the look, so v6 always renders', () => {
    // The generated registry is empty until the first import: every v6 image is its v5 twin.
    expect(PARTS).toEqual([])
    expect(sceneHero(parseScenePath(v6)!)).toBeUndefined()
    expect(sceneHero({ pose: 'idle' })).toBeUndefined()
    expect(renderScenePng(v6)).toEqual(renderScenePng(v5))
    expect(renderScenePng(v6.replace('.png', '-bwry.png'))).toEqual(renderScenePng(v5.replace('.png', '-bwry.png')))
    for (const pose of ['female_rogue_sleep', 'rest', 'rogue_knocked_out'] as const) {
      const path = layeredScenePath('archive', look, pose, { kind: 'prop', id: 'campfire' }, 2, 'night', 'halloween')
      expect(renderScenePng(path)).toEqual(renderScenePng(path.replace('v6', 'v5').replace(`/${look}/`, '/')))
    }
    // A fixture registry that lacks the look's body falls back the same way.
    expect(sceneHero(parseScenePath(v6)!, registry)).toBeUndefined()
  })

  it('draws the layered hero where the whole sprite stands, with the hat on its head anchor, once the registry can', () => {
    const drawn = registryOf([{ ...body, id: 'eldrith.sturdy' }, { ...head, id: 'head.eldrith' }, { ...hair, id: 'hair.braid' }, { ...back, id: 'back.cloak' }, { ...charm, id: 'accessory.eyepatch' }])
    const parsed: ParsedScenePath = parseScenePath(v6)!
    const hero = sceneHero(parsed, drawn)!
    expect(hero).toBeDefined()
    expect(hero.head).toEqual(BODY_ANCHORS.idle.head)
    const placements = scenePlacements('idle', { kind: 'none' }, undefined, hero)
    expect(placements.map((p) => p.role)).toEqual(['hero'])
    const whole = scenePlacements('idle', { kind: 'none' }).find((p) => p.role === 'hero')!
    const placed = placements[0]!
    // Feet on the ground line: the 24-row frame's last row is where the whole sprite's is.
    expect(placed.left).toBe(whole.left)
    expect(placed.top + HERO_SIZE).toBe(whole.top + whole.sprite.height)
    expect(placed.sprite).toBe(hero.sprite)
    // The v6 image differs from its v5 twin only inside the hero's column band (the cloak's five columns included).
    const a = composeScene('office_cubicles', 'idle', { kind: 'none' }, 'day', undefined, undefined, hero)
    const b = composeScene('office_cubicles', 'idle', { kind: 'none' }, 'day')
    expect(a.ink).not.toEqual(b.ink)
    for (let y = 0; y < a.height; y += 1) for (let x = 0; x < a.width; x += 1) if (x < whole.left - 6 || x > whole.left + whole.sprite.width) expect(a.ink[y * a.width + x]).toBe(b.ink[y * a.width + x])
    // The hat: centred on the head anchor, its bottom row one below the skull's top, as the HAT_ANCHOR hats sit.
    const occasion = OCCASION_ARTS.find((id) => dressingFor(id)?.heroHat !== undefined)!
    const hat = dressingFor(occasion)!.heroHat!
    const hatPlacement = scenePlacements('idle', { kind: 'none' }, occasion, hero).find((p) => p.role === 'decor' && p.id === `${occasion}:hat`)!
    expect(hatPlacement.left).toBe(placed.left + hero.head!.x - Math.floor(hat.width / 2))
    expect(hatPlacement.top).toBe(placed.top + hero.head!.y + 1 - hat.height + 1)
    // The lying poses hide the back part and keep the hat on the pillow-side head anchor.
    const sleeping = sceneHero({ pose: 'female_sleep', look }, drawn)!
    expect(sleeping.sprite.rows.join('')).not.toContain('.')
    expect(sleeping.head).toEqual(BODY_ANCHORS.sleep.head)
    // A body without a head anchor wears no hat rather than one in the wrong place.
    const hatless = registryOf([{ ...body, id: 'eldrith.sturdy', frames: frames((pose) => ({ ...bodyFrame(pose), anchors: {} })) }])
    const bare = sceneHero(parsed, hatless)!
    expect(bare.head).toBeUndefined()
    expect(scenePlacements('idle', { kind: 'none' }, occasion, bare).some((p) => p.role === 'decor' && p.id === `${occasion}:hat`)).toBe(false)
  })
})
