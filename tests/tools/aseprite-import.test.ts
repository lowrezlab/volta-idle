import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { afterAll, describe, expect, it } from 'vitest'
import { encodePngIndexed } from '@trmnl-games/wardenwatch/art/png'
import { grid24 } from '@trmnl-games/wardenwatch/art/parts/generated/grid'
import { PARTS } from '@trmnl-games/wardenwatch/art/parts/generated/index'
import { type AnchorName, BASE_POSES, type PartPose, type Point, type Slot, SLOT_ANCHOR, SLOTS } from '@trmnl-games/wardenwatch/art/parts/types'
import { generatedFiles, glyphRows, ImportError, importExport, parseOption, readAnchors, readExportDir, readPartDir, validatePart } from '../../tools/art/aseprite/importer'
import { type AnchorColourName, GLYPH_COLOURS, rgbOf, rgbOfGlyph } from '../../tools/art/aseprite/palette'
import { PLACEHOLDERS, writePlaceholders } from '../../tools/art/aseprite/placeholder'
import { decodePng, encodePngRaw, encodePngRgba, paeth, type RgbaImage } from '../../tools/art/aseprite/png'

const SIZE = 24
const GENERATED_DIR = resolve(import.meta.dirname, '../../packages/wardenwatch/src/art/parts/generated')
const GLYPHS = new Set([' ', ...GLYPH_COLOURS.map(([g]) => g)])

const root = mkdtempSync(join(tmpdir(), 'aseprite-import-'))
afterAll(() => rmSync(root, { recursive: true, force: true }))
let n = 0
const fresh = (): string => {
  const dir = join(root, String((n += 1)))
  mkdirSync(dir)
  return dir
}

/** An RGBA image from glyph rows; `extra` paints raw RGBA over named pixels. */
function image(rows: readonly string[], extra: ReadonlyArray<readonly [x: number, y: number, rgba: readonly number[]]> = []): RgbaImage {
  const data = new Uint8Array(SIZE * SIZE * 4)
  rows.forEach((row, y) =>
    [...row].forEach((ch, x) => {
      if (ch === ' ') return
      const [r, g, b] = rgbOfGlyph(ch)
      data.set([r, g, b, 255], (y * SIZE + x) * 4)
    }),
  )
  for (const [x, y, rgba] of extra) data.set(rgba, (y * SIZE + x) * 4)
  return { width: SIZE, height: SIZE, data }
}

const blank = (): string[] => Array<string>(SIZE).fill(' '.repeat(SIZE))
/** A dot of every drawing glyph on row 1 and a frame, so the frame is never empty. */
function doodle(): string[] {
  const rows = blank()
  rows[1] = ' #w:.=' + ' '.repeat(SIZE - 6)
  rows[23] = '#'.repeat(SIZE)
  return rows
}

function anchorImage(points: Readonly<Partial<Record<AnchorColourName, Point>>>): RgbaImage {
  const data = new Uint8Array(SIZE * SIZE * 4)
  for (const [name, p] of Object.entries(points) as [AnchorColourName, Point][]) data.set([...rgbOf(name), 255], (p.y * SIZE + p.x) * 4)
  return { width: SIZE, height: SIZE, data }
}

const BODY_ANCHORS: Readonly<Record<AnchorName, Point>> = { head: { x: 12, y: 5 }, neck: { x: 12, y: 12 }, hand: { x: 16, y: 17 }, back: { x: 8, y: 14 }, crown: { x: 12, y: 4 } }
const bodyAnchors = (omit?: AnchorName) => Object.fromEntries(Object.entries(BODY_ANCHORS).filter(([k]) => k !== 'crown' && k !== omit)) as Partial<Record<AnchorColourName, Point>>

interface PartSpec {
  readonly poses?: readonly PartPose[]
  readonly anchors?: Readonly<Partial<Record<AnchorColourName, Point>>> | null
  readonly rows?: readonly string[]
}

/** Write `<export-dir>/<slot>/<option>/` with the poses given (all six by default) and the anchors given. */
function writePart(exportDir: string, slot: Slot, option: string, spec: PartSpec = {}): string {
  const dir = join(exportDir, slot, option)
  mkdirSync(dir, { recursive: true })
  const anchors = spec.anchors === undefined ? (slot === 'body' ? bodyAnchors() : slot === 'head' ? { origin: { x: 12, y: 5 }, crown: { x: 12, y: 4 } } : slot === 'outfit' ? null : { origin: { x: 12, y: 5 } }) : spec.anchors
  for (const pose of spec.poses ?? BASE_POSES) {
    writeFileSync(join(dir, `${pose}.png`), encodePngRgba(image(spec.rows ?? doodle())))
    if (anchors) writeFileSync(join(dir, `${pose}.anchors.png`), encodePngRgba(anchorImage(anchors)))
  }
  return dir
}

describe('PNG decoding', () => {
  it('reads RGBA, filtered rows and sub-byte indexed images alike', () => {
    const rows = doodle()
    rows[5] = '  ##::..ww==#  ' + ' '.repeat(SIZE - 15)
    const rgba = image(rows)
    expect(decodePng(encodePngRgba(rgba), 'rgba').data).toEqual(rgba.data)

    // The same pixels with every scanline filter type, as libpng would pick them.
    const stride = SIZE * 4
    const scanlines = new Uint8Array((stride + 1) * SIZE)
    for (let y = 0; y < SIZE; y += 1) {
      const filter = y % 5
      scanlines[y * (stride + 1)] = filter
      for (let i = 0; i < stride; i += 1) {
        const x = rgba.data[y * stride + i]!
        const a = i >= 4 ? rgba.data[y * stride + i - 4]! : 0
        const b = y > 0 ? rgba.data[(y - 1) * stride + i]! : 0
        const c = y > 0 && i >= 4 ? rgba.data[(y - 1) * stride + i - 4]! : 0
        const predictor = filter === 0 ? 0 : filter === 1 ? a : filter === 2 ? b : filter === 3 ? (a + b) >> 1 : paeth(a, b, c)
        scanlines[y * (stride + 1) + 1 + i] = (x - predictor) & 255
      }
    }
    expect(decodePng(encodePngRaw({ width: SIZE, height: SIZE, bitDepth: 8, colourType: 6, scanlines }), 'filtered').data).toEqual(rgba.data)

    // 4-bit indexed with the palette and index 0 transparent, as Aseprite writes a 12-colour indexed sprite.
    const palette = Uint8Array.from([0, 0, 0, ...GLYPH_COLOURS.flatMap(([, rgb]) => rgb)])
    const rowBytes = SIZE / 2
    const indexed = new Uint8Array((rowBytes + 1) * SIZE)
    rows.forEach((row, y) =>
      [...row].forEach((ch, x) => {
        const index = ch === ' ' ? 0 : GLYPH_COLOURS.findIndex(([g]) => g === ch) + 1
        indexed[y * (rowBytes + 1) + 1 + (x >> 1)]! |= index << (x & 1 ? 0 : 4)
      }),
    )
    const png = encodePngRaw({ width: SIZE, height: SIZE, bitDepth: 4, colourType: 3, scanlines: indexed, palette, trns: Uint8Array.from([0]) })
    expect(glyphRows(decodePng(png, 'indexed4'), 'indexed4')).toEqual(rows)

    // 8-bit indexed through the engine's own encoder.
    const index8 = new Uint8Array(SIZE * SIZE)
    rows.forEach((row, y) => [...row].forEach((ch, x) => (index8[y * SIZE + x] = ch === ' ' ? 0 : GLYPH_COLOURS.findIndex(([g]) => g === ch) + 1)))
    const png8 = encodePngIndexed(SIZE, SIZE, index8, [[0, 0, 0], ...GLYPH_COLOURS.map(([, rgb]) => rgb)], 0)
    expect(glyphRows(decodePng(png8, 'indexed8'), 'indexed8')).toEqual(rows)
  })

  it('refuses what it cannot read, by name', () => {
    expect(() => decodePng(Uint8Array.from([1, 2, 3]), 'junk.png')).toThrow('junk.png: not a PNG')
    const scanlines = new Uint8Array((SIZE * 8 + 1) * SIZE)
    expect(() => decodePng(encodePngRaw({ width: SIZE, height: SIZE, bitDepth: 16, colourType: 6, scanlines }), 'deep.png')).toThrow('16-bit')
  })
})

describe('colour mapping', () => {
  it('maps the palette to glyphs and transparency to space', () => {
    const rows = doodle()
    expect(glyphRows(image(rows), 'x')).toEqual(rows)
  })

  it('fails on a stray colour, naming the file and pixel', () => {
    expect(() => glyphRows(image(doodle(), [[7, 9, [0x12, 0x34, 0x56, 255]]]), 'hair/hair.braid/idle.png')).toThrow('hair/hair.braid/idle.png: colour #123456 at 7,9 is not in volta-1bit.gpl')
  })

  it('fails on a half-transparent pixel and on an anchor colour in a drawing', () => {
    expect(() => glyphRows(image(doodle(), [[3, 4, [0, 0, 0, 128]]]), 'f.png')).toThrow('f.png: half-transparent pixel at 3,4')
    expect(() => glyphRows(image(doodle(), [[2, 2, [255, 0, 0, 255]]]), 'f.png')).toThrow('f.png: anchor colour #FF0000 (head) at 2,2; anchors belong on the _anchors layer')
  })

  it('fails on the wrong canvas size', () => {
    expect(() => glyphRows({ width: 16, height: 24, data: new Uint8Array(16 * 24 * 4) }, 's.png')).toThrow('s.png: is 16x24, parts are 24x24')
  })
})

describe('anchors', () => {
  it('reads anchors and the origin by colour', () => {
    const read = readAnchors(anchorImage({ ...bodyAnchors(), origin: { x: 1, y: 2 }, crown: { x: 12, y: 4 } }), 'a.png')
    expect(read.origin).toEqual({ x: 1, y: 2 })
    expect(read.anchors).toEqual(BODY_ANCHORS)
    expect(Object.keys(read.anchors)).toEqual(['head', 'neck', 'hand', 'back', 'crown'])
    expect(readAnchors(anchorImage({}), 'empty.png')).toEqual({ anchors: {} })
  })

  it('rejects a repeated anchor and a drawing colour', () => {
    const twice = image(blank(), [[1, 1, [255, 0, 0, 255]], [5, 6, [255, 0, 0, 255]]])
    expect(() => readAnchors(twice, 'a.png')).toThrow('a.png: anchor head (#FF0000) twice, at 1,1 and 5,6')
    expect(() => readAnchors(image(blank(), [[2, 3, [0, 0, 0, 255]]]), 'a.png')).toThrow('a.png: colour #000000 at 2,3 is not an anchor colour')
  })
})

describe('reading an export', () => {
  it('reads a part directory into frames with its tier', () => {
    const dir = writePart(fresh(), 'body', 'eldrith.slight@medium')
    const part = readPartDir(dir, 'body', 'eldrith.slight@medium')
    expect(part).toMatchObject({ slot: 'body', id: 'eldrith.slight', tier: 'medium', name: 'body/eldrith.slight@medium' })
    expect(Object.keys(part.frames).sort()).toEqual([...BASE_POSES].sort())
    expect(part.frames.idle?.anchors).toEqual(bodyAnchors())
    expect(part.frames.idle?.origin).toBeUndefined()
    expect(validatePart(part)).toEqual([])
    expect(readPartDir(writePart(fresh(), 'outfit', 'tabard.wardens@tall'), 'outfit', 'tabard.wardens@tall')).toMatchObject({ id: 'tabard.wardens', tier: 'tall' })
  })

  it('rejects a file that is not a pose', () => {
    const dir = writePart(fresh(), 'hair', 'hair.braid')
    writeFileSync(join(dir, 'jump.png'), encodePngRgba(image(doodle())))
    expect(() => readPartDir(dir, 'hair', 'hair.braid')).toThrow('hair/hair.braid/jump.png: not <pose>.png or <pose>.anchors.png')
  })

  it('drops an empty lying frame of a back part and rejects an empty frame elsewhere', () => {
    const back = writePart(fresh(), 'back', 'back.cloak', { poses: ['idle', 'fight', 'walk'] })
    writeFileSync(join(back, 'rest.png'), encodePngRgba(image(blank())))
    const part = readPartDir(back, 'back', 'back.cloak')
    expect(Object.keys(part.frames).sort()).toEqual(['fight', 'idle', 'walk'])
    expect(validatePart(part)).toEqual([])
    const hair = writePart(fresh(), 'hair', 'hair.bald', { rows: blank() })
    expect(() => readPartDir(hair, 'hair', 'hair.bald')).toThrow('hair/hair.bald/fight.png: the frame is empty')
  })
})

describe('validation', () => {
  const problems = (slot: Slot, option: string, spec?: PartSpec) => validatePart(readPartDir(writePart(fresh(), slot, option, spec), slot, option))

  it('requires the standing poses everywhere and the lying poses off the back slot', () => {
    expect(problems('hair', 'hair.braid', { poses: ['idle', 'fight', 'rest', 'sleep', 'knocked_out'] })).toEqual(['hair/hair.braid: missing pose walk (walk.png)'])
    expect(problems('back', 'back.wings', { poses: ['idle', 'walk'] })).toEqual(['back/back.wings: missing pose fight (fight.png)'])
    expect(problems('body', 'dragu.slight@small', { poses: ['idle', 'fight', 'walk'] })).toEqual(['body/dragu.slight@small: missing pose rest (rest.png)', 'body/dragu.slight@small: missing pose sleep (sleep.png)', 'body/dragu.slight@small: missing pose knocked_out (knocked_out.png)'])
  })

  it('requires the body anchors, the head crown and an origin on hanging slots', () => {
    expect(problems('body', 'dragu.slight@small', { anchors: bodyAnchors('hand') })).toEqual(BASE_POSES.map((p) => `body/dragu.slight@small/${p}: a body exports the hand anchor (#00FF00)`))
    expect(problems('head', 'head.dragu', { anchors: { origin: { x: 12, y: 5 } } })).toEqual(BASE_POSES.map((p) => `head/head.dragu/${p}: a head exports the crown anchor (#FF00FF) for hair`))
    expect(problems('head', 'head.dragu', { anchors: { crown: { x: 12, y: 4 } } })).toEqual(BASE_POSES.map((p) => `head/head.dragu/${p}: no origin pixel (#00FFFF) on the _anchors layer; a head part hangs from the body's head anchor by its origin`))
    expect(problems('held', 'held.sword', { anchors: null })).toEqual(BASE_POSES.map((p) => `held/held.sword/${p}: no ${p}.anchors.png (export the hidden _anchors layer)`))
    expect(problems('outfit', 'outfit.squire@medium', { anchors: null })).toEqual([])
  })

  it('requires the renderer ids: a tier on bodies and outfits only, and the slot prefixes', () => {
    expect(problems('body', 'dragu.slight')).toEqual(['body/dragu.slight: a body names its tier after @, e.g. eldrith.slight@medium (small | medium | tall | very_tall)'])
    expect(problems('body', 'dragu.slight@huge')).toEqual(["body/dragu.slight@huge: 'huge' after @ is not a tier (small | medium | tall | very_tall)"])
    expect(problems('body', 'dragu@small')).toEqual(['body/dragu@small: a body id is <ancestry>.<build>, e.g. eldrith.slight'])
    expect(problems('hair', 'hair.braid@medium')).toEqual(['hair/hair.braid@medium: only body and outfit parts carry a tier'])
    expect(problems('head', 'eldrith')).toEqual(['head/eldrith: a head id is head.<ancestry>, e.g. head.eldrith'])
    expect(problems('outfit', 'knight.0@medium')).toEqual(['outfit/knight.0@medium: an outfit id is outfit.<option> or tabard.<faction>, e.g. outfit.squire'])
    expect(problems('hair', 'hair.Braid')).toEqual(["hair/hair.Braid: the id 'hair.Braid' is not lowercase words, digits and dots"])
    expect(problems('held', 'shortsword')).toEqual([])
  })

  it('reports every problem of an export at once and writes nothing', () => {
    const exportDir = fresh()
    writePart(exportDir, 'hair', 'hair.braid', { poses: ['idle', 'fight'] })
    writePart(exportDir, 'head', 'head.dragu', { anchors: { origin: { x: 1, y: 1 } }, poses: ['idle'] })
    mkdirSync(join(exportDir, 'hat'))
    const stray = writePart(exportDir, 'held', 'held.axe')
    writeFileSync(join(stray, 'walk.png'), encodePngRgba(image(doodle(), [[0, 0, [9, 9, 9, 255]]])))
    const generated = fresh()
    let error: unknown
    try {
      importExport(exportDir, generated, join(exportDir, 'sheet.png'))
    } catch (e) {
      error = e
    }
    expect(error).toBeInstanceOf(ImportError)
    expect((error as ImportError).problems).toEqual([
      'hair/hair.braid: missing pose walk (walk.png)',
      'hair/hair.braid: missing pose rest (rest.png)',
      'hair/hair.braid: missing pose sleep (sleep.png)',
      'hair/hair.braid: missing pose knocked_out (knocked_out.png)',
      'hat/: not a slot (back body outfit head hair accessory held)',
      'head/head.dragu: missing pose fight (fight.png)',
      'head/head.dragu: missing pose walk (walk.png)',
      'head/head.dragu: missing pose rest (rest.png)',
      'head/head.dragu: missing pose sleep (sleep.png)',
      'head/head.dragu: missing pose knocked_out (knocked_out.png)',
      'head/head.dragu/idle: a head exports the crown anchor (#FF00FF) for hair',
      'held/held.axe/walk.png: colour #090909 at 0,0 is not in volta-1bit.gpl',
    ])
    expect(readdirSync(generated)).toEqual([])
  })

})

describe('generated output', () => {
  it('is deterministic and reads like a hand-made sprite', () => {
    const exportDir = fresh()
    writePlaceholders(exportDir)
    const a = generatedFiles(readExportDir(exportDir))
    const b = generatedFiles(readExportDir(exportDir))
    expect([...a]).toEqual([...b])
    const body = a.get('body/eldrith.slight.medium.ts')!
    expect(body.startsWith('/* Do not edit: generated by tools/art/aseprite-import.ts')).toBe(true)
    expect(body).toContain("slot: 'body',\n  id: 'eldrith.slight',\n  tier: 'medium',")
    expect(body).toContain('sprite: grid24(`\n')
    expect(body).toContain('anchors: { head: { x: 12, y: 5 }, neck: { x: 12, y: 12 }, hand: { x: 16, y: 17 }, back: { x: 8, y: 14 } }')
    expect(a.get('index.ts')).toContain('export const PARTS: readonly Part[] = [body_eldrith_slight_medium, outfit_squire_medium, head_eldrith, hair_crop]')

    // Writing twice to the same directory leaves identical files, and stale slot files go away.
    const generated = fresh()
    mkdirSync(join(generated, 'hair'))
    writeFileSync(join(generated, 'hair', 'stale.ts'), 'export {}')
    const sheet = join(exportDir, 'contact-sheet.png')
    importExport(exportDir, generated, sheet)
    const first = Object.fromEntries([...a.keys()].map((k) => [k, readFileSync(join(generated, k), 'utf8')]))
    const sheetBytes = readFileSync(sheet)
    importExport(exportDir, generated, sheet)
    for (const [k, v] of Object.entries(first)) expect(readFileSync(join(generated, k), 'utf8')).toBe(v)
    expect(readFileSync(sheet)).toEqual(sheetBytes)
    expect(readdirSync(join(generated, 'hair'))).toEqual(['hair.crop.ts'])
    expect(decodePng(sheetBytes, 'sheet').width).toBeGreaterThan(SIZE * BASE_POSES.length)
  })

  it('grid24 keeps blank rows and columns that sprite() would trim', () => {
    const s = grid24('\n  #\n\n')
    expect(s.width).toBe(24)
    expect(s.height).toBe(24)
    expect(s.rows[0]).toBe('  #' + ' '.repeat(21))
    expect(s.rows.every((r) => r.length === 24)).toBe(true)
  })
})

describe('committed parts', () => {
  it('match what the importer makes of the placeholder export, while the placeholders are the art', () => {
    // Once Lou's parts replace the placeholders this comparison no longer applies and the test skips itself.
    const committedIds = PARTS.map((p) => `${p.slot}/${p.id}/${p.tier ?? ''}`).sort()
    const placeholderIds = PLACEHOLDERS.map((p) => {
      const { id, tier } = parseOption(p.option)
      return `${p.slot}/${id}/${tier ?? ''}`
    }).sort()
    if (committedIds.join() !== placeholderIds.join()) return
    const exportDir = fresh()
    writePlaceholders(exportDir)
    for (const [path, content] of generatedFiles(readExportDir(exportDir))) expect(readFileSync(join(GENERATED_DIR, path), 'utf8'), path).toBe(content)
  })

  it('load and satisfy the parts contract', () => {
    expect(PARTS.length).toBeGreaterThan(0)
    const seen = new Set<string>()
    for (const part of PARTS) {
      const label = `${part.slot} ${part.id}`
      expect(SLOTS, label).toContain(part.slot)
      expect(part.id, label).toMatch(/^[a-z0-9_]+(\.[a-z0-9_]+)*$/)
      const key = `${part.slot}:${part.id}:${part.tier ?? ''}`
      expect(seen.has(key), `${label} twice`).toBe(false)
      seen.add(key)
      if (part.slot === 'body') expect(part.tier, label).toBeDefined()
      const required = part.slot === 'back' ? ['idle', 'fight', 'walk'] : BASE_POSES
      for (const pose of required) expect(part.frames[pose as PartPose], `${label} ${pose}`).toBeDefined()
      for (const [pose, frame] of Object.entries(part.frames)) {
        const where = `${label} ${pose}`
        expect(BASE_POSES, where).toContain(pose)
        expect(frame.sprite.width, where).toBe(24)
        expect(frame.sprite.height, where).toBe(24)
        expect(frame.sprite.rows.length, where).toBe(24)
        for (const row of frame.sprite.rows) {
          expect(row.length, where).toBe(24)
          for (const ch of row) expect(GLYPHS.has(ch), `${where}: glyph ${JSON.stringify(ch)}`).toBe(true)
        }
        expect(frame.sprite.rows.some((r) => r.trim() !== ''), `${where} is empty`).toBe(true)
        const inside = (p: Point) => p.x >= 0 && p.x < 24 && p.y >= 0 && p.y < 24
        expect(inside(frame.origin), `${where} origin`).toBe(true)
        if (SLOT_ANCHOR[part.slot] === null) expect(frame.origin, `${where} origin`).toEqual({ x: 0, y: 0 })
        for (const [name, point] of Object.entries(frame.anchors)) expect(inside(point), `${where} anchor ${name}`).toBe(true)
        if (part.slot === 'body') for (const anchor of ['head', 'neck', 'hand', 'back'] as const) expect(frame.anchors[anchor], `${where} ${anchor}`).toBeDefined()
        if (part.slot === 'head') expect(frame.anchors.crown, `${where} crown`).toBeDefined()
      }
    }
  })
})
