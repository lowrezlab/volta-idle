/**
 * The Aseprite part import, as a library: tools/art/aseprite-import.ts is its command line and the tests call
 * these functions on fixture PNGs. It reads the export layout export.sh writes,
 *
 *   <export-dir>/<slot>/<option>/<pose>.png            the drawing, 24x24, palette colours only
 *   <export-dir>/<slot>/<option>/<pose>.anchors.png    one pixel per anchor in the anchor colours
 *
 * turns colours into engine glyphs, reads the anchors, validates each part against the contract in
 * packages/wardenwatch/src/art/parts/types.ts and renders the generated TypeScript and a contact sheet.
 * `<slot>` is the folder the .aseprite file lives in and `<option>` is its layer name: the part id, with the body
 * tier after an `@` for body and outfit parts (`eldrith.slight@medium`, `head.eldrith`, `hair.braid`,
 * `outfit.squire@medium`). These ids are what the layered renderer looks up.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { Canvas } from '@trmnl-games/wardenwatch/art/canvas'
import { drawText, FONT_HEIGHT, textWidth } from '@trmnl-games/wardenwatch/art/font'
import { PART_SIZE } from '@trmnl-games/wardenwatch/art/parts/generated/grid'
import { encodePng1Bit } from '@trmnl-games/wardenwatch/art/png'
import { type AnchorName, BASE_POSES, type Part, type PartPose, type Point, type Slot, SLOT_ANCHOR, SLOTS } from '@trmnl-games/wardenwatch/art/parts/types'
import { ANCHOR_COLOURS, type AnchorColourName, GLYPH_COLOURS, hex, type Rgb } from './palette'
import { decodePng, type RgbaImage } from './png'

export type Tier = NonNullable<Part['tier']>
export const TIERS: readonly Tier[] = ['small', 'medium', 'tall', 'very_tall']
const STANDING: readonly PartPose[] = ['idle', 'fight', 'walk']
const BODY_ANCHORS: readonly AnchorName[] = ['head', 'neck', 'hand', 'back']
const ANCHOR_ORDER: readonly AnchorName[] = ['head', 'neck', 'hand', 'back', 'crown']

export interface FrameSource {
  /** 24 rows of 24 glyphs. */
  readonly rows: readonly string[]
  readonly origin?: Point
  readonly anchors: Readonly<Partial<Record<AnchorName, Point>>>
  /** Whether a `<pose>.anchors.png` was read. */
  readonly hasAnchorFile: boolean
}

export interface PartSource {
  readonly slot: Slot
  readonly id: string
  readonly tier?: Tier
  /** What followed the `@` when it was not a tier. */
  readonly badTier?: string
  /** `<slot>/<option>`, for messages. */
  readonly name: string
  readonly frames: Readonly<Partial<Record<PartPose, FrameSource>>>
}

export class ImportError extends Error {
  constructor(readonly problems: readonly string[]) {
    super(`${problems.length} problem${problems.length === 1 ? '' : 's'}:\n${problems.map((p) => `  ${p}`).join('\n')}`)
  }
}

const colourKey = (data: Uint8Array, at: number): string => hex([data[at]!, data[at + 1]!, data[at + 2]!])
const GLYPH_BY_COLOUR = new Map(GLYPH_COLOURS.map(([glyph, rgb]) => [hex(rgb), glyph]))
const ANCHOR_BY_COLOUR = new Map(ANCHOR_COLOURS.map(([name, rgb]) => [hex(rgb), name]))
const ANCHOR_HEX = new Map(ANCHOR_COLOURS.map(([name, rgb]) => [name, hex(rgb)]))

function checkSize(image: RgbaImage, file: string): void {
  if (image.width !== PART_SIZE || image.height !== PART_SIZE) throw new Error(`${file}: is ${image.width}x${image.height}, parts are ${PART_SIZE}x${PART_SIZE}`)
}

/** The drawing PNG as glyph rows. Fails on any colour outside the drawing swatches, naming the pixel. */
export function glyphRows(image: RgbaImage, file: string): string[] {
  checkSize(image, file)
  const rows: string[] = []
  for (let y = 0; y < image.height; y += 1) {
    let row = ''
    for (let x = 0; x < image.width; x += 1) {
      const at = (y * image.width + x) * 4
      const alpha = image.data[at + 3]!
      if (alpha === 0) {
        row += ' '
        continue
      }
      if (alpha !== 255) throw new Error(`${file}: half-transparent pixel at ${x},${y}; parts are fully opaque or clear`)
      const key = colourKey(image.data, at)
      const glyph = GLYPH_BY_COLOUR.get(key)
      if (glyph === undefined) {
        const anchor = ANCHOR_BY_COLOUR.get(key)
        throw new Error(anchor ? `${file}: anchor colour ${key} (${anchor}) at ${x},${y}; anchors belong on the _anchors layer` : `${file}: colour ${key} at ${x},${y} is not in volta-1bit.gpl`)
      }
      row += glyph
    }
    rows.push(row)
  }
  return rows
}

export interface AnchorPixels {
  readonly origin?: Point
  readonly anchors: Partial<Record<AnchorName, Point>>
}

/** The anchor PNG's pixels: one per anchor colour, nothing else. */
export function readAnchors(image: RgbaImage, file: string): AnchorPixels {
  checkSize(image, file)
  const found = new Map<AnchorColourName, Point>()
  for (let y = 0; y < image.height; y += 1) {
    for (let x = 0; x < image.width; x += 1) {
      const at = (y * image.width + x) * 4
      if (image.data[at + 3] === 0) continue
      const key = colourKey(image.data, at)
      const name = ANCHOR_BY_COLOUR.get(key)
      if (name === undefined) throw new Error(`${file}: colour ${key} at ${x},${y} is not an anchor colour; the _anchors layer holds only anchor pixels`)
      const earlier = found.get(name)
      if (earlier) throw new Error(`${file}: anchor ${name} (${key}) twice, at ${earlier.x},${earlier.y} and ${x},${y}`)
      found.set(name, { x, y })
    }
  }
  const anchors: Partial<Record<AnchorName, Point>> = {}
  for (const name of ANCHOR_ORDER) {
    const point = found.get(name)
    if (point) anchors[name] = point
  }
  const origin = found.get('origin')
  return origin ? { origin, anchors } : { anchors }
}

/** `eldrith.slight@medium` -> id `eldrith.slight`, tier `medium`. The tier is read for every slot; validation says where it belongs. */
export function parseOption(option: string): { id: string; tier?: Tier; badTier?: string } {
  const at = option.indexOf('@')
  if (at === -1) return { id: option }
  const id = option.slice(0, at)
  const tierText = option.slice(at + 1)
  const tier = TIERS.find((t) => t === tierText)
  return tier ? { id, tier } : { id, badTier: tierText }
}

const ID_PATTERN = /^[a-z0-9_]+(\.[a-z0-9_]+)*$/
/** The id shapes the layered renderer looks up per slot; a body is `<ancestry>.<build>`, the rest carry a prefix. */
const ID_SHAPE: Partial<Record<Slot, { readonly pattern: RegExp; readonly hint: string }>> = {
  body: { pattern: /^[a-z0-9_]+\.[a-z0-9_]+$/, hint: '<ancestry>.<build>, e.g. eldrith.slight' },
  head: { pattern: /^head\./, hint: 'head.<ancestry>, e.g. head.eldrith' },
  hair: { pattern: /^hair\./, hint: 'hair.<option>, e.g. hair.braid' },
  back: { pattern: /^back\./, hint: 'back.<option>, e.g. back.cloak' },
  accessory: { pattern: /^accessory\./, hint: 'accessory.<option>, e.g. accessory.halo' },
  outfit: { pattern: /^(outfit|tabard)\./, hint: 'outfit.<option> or tabard.<faction>, e.g. outfit.squire' },
}

const isEmpty = (rows: readonly string[]): boolean => rows.every((row) => row.trim() === '')

/** Read one option directory. Throws on a bad file; validation of the whole part is `validatePart`. */
export function readPartDir(dir: string, slot: Slot, option: string): PartSource {
  const name = `${slot}/${option}`
  const files = readdirSync(dir).filter((f) => !f.startsWith('.')).sort()
  const frames: Partial<Record<PartPose, FrameSource>> = {}
  for (const file of files) {
    const match = /^([a-z_]+)(\.anchors)?\.png$/.exec(file)
    const pose = match ? BASE_POSES.find((p) => p === match[1]) : undefined
    if (!match || !pose) throw new Error(`${name}/${file}: not <pose>.png or <pose>.anchors.png with pose one of ${BASE_POSES.join(' ')}`)
    if (match[2]) continue
    const path = join(dir, file)
    const rows = glyphRows(decodePng(readFileSync(path), `${name}/${file}`), `${name}/${file}`)
    if (isEmpty(rows)) {
      if (slot === 'back') continue // A back part leaves out the lying poses; Aseprite may still export the empty frame.
      throw new Error(`${name}/${file}: the frame is empty`)
    }
    const anchorFile = `${pose}.anchors.png`
    const anchorPath = join(dir, anchorFile)
    const pixels = existsSync(anchorPath) ? readAnchors(decodePng(readFileSync(anchorPath), `${name}/${anchorFile}`), `${name}/${anchorFile}`) : undefined
    frames[pose] = { rows, ...(pixels?.origin ? { origin: pixels.origin } : {}), anchors: pixels?.anchors ?? {}, hasAnchorFile: pixels !== undefined }
  }
  const { id, tier, badTier } = parseOption(option)
  return { slot, id, ...(tier ? { tier } : {}), ...(badTier !== undefined ? { badTier } : {}), name, frames }
}

/** Everything the contract asks of one part, as messages; empty when the part is good. */
export function validatePart(part: PartSource): string[] {
  const problems: string[] = []
  const poses = BASE_POSES.filter((p) => part.frames[p])
  if (part.badTier !== undefined) problems.push(`${part.name}: '${part.badTier}' after @ is not a tier (${TIERS.join(' | ')})`)
  else if (part.slot === 'body' && !part.tier) problems.push(`${part.name}: a body names its tier after @, e.g. eldrith.slight@medium (${TIERS.join(' | ')})`)
  if (part.tier && part.slot !== 'body' && part.slot !== 'outfit') problems.push(`${part.name}: only body and outfit parts carry a tier`)
  const shape = ID_SHAPE[part.slot]
  if (!ID_PATTERN.test(part.id)) problems.push(`${part.name}: the id '${part.id}' is not lowercase words, digits and dots`)
  else if (shape && !shape.pattern.test(part.id)) problems.push(`${part.name}: ${/^[aeiou]/.test(part.slot) ? 'an' : 'a'} ${part.slot} id is ${shape.hint}`)
  const required = part.slot === 'back' ? STANDING : BASE_POSES
  for (const pose of required) if (!part.frames[pose]) problems.push(`${part.name}: missing pose ${pose} (${pose}.png)`)
  const needsOrigin = SLOT_ANCHOR[part.slot] !== null
  for (const pose of poses) {
    const frame = part.frames[pose]!
    const label = `${part.name}/${pose}`
    if (!frame.hasAnchorFile && (needsOrigin || part.slot === 'body' || part.slot === 'head')) {
      problems.push(`${label}: no ${pose}.anchors.png (export the hidden _anchors layer)`)
      continue
    }
    if (needsOrigin && !frame.origin) problems.push(`${label}: no origin pixel (${ANCHOR_HEX.get('origin')}) on the _anchors layer; a ${part.slot} part hangs from the body's ${SLOT_ANCHOR[part.slot]} anchor by its origin`)
    if (part.slot === 'body') for (const anchor of BODY_ANCHORS) if (!frame.anchors[anchor]) problems.push(`${label}: a body exports the ${anchor} anchor (${ANCHOR_HEX.get(anchor)})`)
    if (part.slot === 'head' && !frame.anchors.crown) problems.push(`${label}: a head exports the crown anchor (${ANCHOR_HEX.get('crown')}) for hair`)
  }
  return problems
}

/** Read every part under an export directory. Throws an ImportError listing every problem found. */
export function readExportDir(exportDir: string): PartSource[] {
  const problems: string[] = []
  const parts: PartSource[] = []
  const slotDirs = readdirSync(exportDir, { withFileTypes: true }).filter((e) => e.isDirectory() && !e.name.startsWith('.')).map((e) => e.name).sort()
  for (const slotDir of slotDirs) {
    const slot = SLOTS.find((s) => s === slotDir)
    if (!slot) {
      problems.push(`${slotDir}/: not a slot (${SLOTS.join(' ')})`)
      continue
    }
    const options = readdirSync(join(exportDir, slotDir), { withFileTypes: true }).filter((e) => e.isDirectory() && !e.name.startsWith('.')).map((e) => e.name).sort()
    for (const option of options) {
      try {
        const part = readPartDir(join(exportDir, slotDir, option), slot, option)
        problems.push(...validatePart(part))
        parts.push(part)
      } catch (error) {
        problems.push(error instanceof Error ? error.message : String(error))
      }
    }
  }
  const seen = new Map<string, string>()
  for (const part of parts) {
    const key = `${part.slot}:${part.id}:${part.tier ?? ''}`
    const other = seen.get(key)
    if (other) problems.push(`${part.name} and ${other} are the same part (${part.slot} ${part.id}${part.tier ? ` ${part.tier}` : ''})`)
    seen.set(key, part.name)
  }
  if (problems.length) throw new ImportError(problems)
  return sortParts(parts)
}

/** Back to front by slot, then tier, then id: the order PARTS lists them in. */
export function sortParts<T extends { slot: Slot; id: string; tier?: Tier }>(parts: readonly T[]): T[] {
  const slotRank = (slot: Slot) => SLOTS.indexOf(slot)
  const tierRank = (tier: Tier | undefined) => (tier ? TIERS.indexOf(tier) : -1)
  return [...parts].sort((a, b) => slotRank(a.slot) - slotRank(b.slot) || tierRank(a.tier) - tierRank(b.tier) || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
}

export const HEADER = '/* Do not edit: generated by tools/art/aseprite-import.ts from the Aseprite export. Redraw in Aseprite and import again. */'

const point = (p: Point) => `{ x: ${p.x}, y: ${p.y} }`

export const fileStem = (part: { id: string; tier?: Tier }): string => (part.tier ? `${part.id}.${part.tier}` : part.id)
/** A module-level name for the part: `body_eldrith_slight_medium`, `head_eldrith` (the slot prefix is not doubled). */
const identifier = (part: PartSource): string => (part.id.startsWith(`${part.slot}.`) ? fileStem(part) : `${part.slot}_${fileStem(part)}`).replace(/[^A-Za-z0-9_]/g, '_')

/** The TypeScript module for one part. */
export function renderPartModule(part: PartSource): string {
  const lines = [HEADER, `import type { Part } from '../../types'`, `import { grid24 } from '../grid'`, '', 'export const part: Part = {', `  slot: '${part.slot}',`, `  id: '${part.id}',`]
  if (part.tier) lines.push(`  tier: '${part.tier}',`)
  lines.push('  frames: {')
  for (const pose of BASE_POSES) {
    const frame = part.frames[pose]
    if (!frame) continue
    const origin = frame.origin && SLOT_ANCHOR[part.slot] !== null ? frame.origin : { x: 0, y: 0 }
    const anchors = ANCHOR_ORDER.filter((a) => frame.anchors[a]).map((a) => `${a}: ${point(frame.anchors[a]!)}`)
    lines.push(`    ${pose}: {`, '      sprite: grid24(`', ...frame.rows.map((row) => row.trimEnd()), '`),', `      origin: ${point(origin)},`, `      anchors: {${anchors.length ? ` ${anchors.join(', ')} ` : ''}},`, '    },')
  }
  lines.push('  },', '}', '')
  return lines.join('\n')
}

/** The generated index: every part, in order. */
export function renderIndex(parts: readonly PartSource[]): string {
  const sorted = sortParts(parts)
  const lines = [HEADER, `import type { Part } from '../types'`]
  for (const part of sorted) lines.push(`import { part as ${identifier(part)} } from './${part.slot}/${fileStem(part)}'`)
  lines.push('', '/** Every imported hero part, back to front by slot, then by tier and id. */')
  lines.push(sorted.length ? `export const PARTS: readonly Part[] = [${sorted.map(identifier).join(', ')}]` : 'export const PARTS: readonly Part[] = []', '')
  return lines.join('\n')
}

/** Path (relative to the generated directory) to file content, for every file the import writes. */
export function generatedFiles(parts: readonly PartSource[]): Map<string, string> {
  const files = new Map<string, string>()
  for (const part of sortParts(parts)) files.set(`${part.slot}/${fileStem(part)}.ts`, renderPartModule(part))
  files.set('index.ts', renderIndex(parts))
  return files
}

/** Replace the generated part modules under `generatedDir`: every slot directory and index.ts; grid.ts stays. */
export function writeGenerated(generatedDir: string, files: ReadonlyMap<string, string>): void {
  for (const slot of SLOTS) rmSync(join(generatedDir, slot), { recursive: true, force: true })
  for (const [path, content] of files) {
    mkdirSync(join(generatedDir, path, '..'), { recursive: true })
    writeFileSync(join(generatedDir, path), content)
  }
}

const SHEET_SCALE = 4
const CELL = PART_SIZE + 8
const POSE_LABELS: Record<PartPose, string> = { idle: 'IDLE', fight: 'FIGHT', walk: 'WALK', rest: 'REST', sleep: 'SLEEP', knocked_out: 'KO' }
const partLabel = (part: PartSource) => `${part.slot} ${fileStem(part)}`.toUpperCase()

/** A 1-bit contact sheet, one row per part and one column per pose, for review in an image viewer. */
export function contactSheet(parts: readonly PartSource[]): Uint8Array {
  const sorted = sortParts(parts)
  const top = FONT_HEIGHT + 4
  const labelWidth = Math.max(0, ...sorted.map((part) => textWidth(partLabel(part)))) + 6
  const canvas = new Canvas(labelWidth + BASE_POSES.length * CELL + 2, top + Math.max(1, sorted.length) * CELL + 2)
  const plot = (x: number, y: number) => canvas.set(x, y, true)
  BASE_POSES.forEach((pose, column) => {
    const label = POSE_LABELS[pose]
    drawText(label, labelWidth + column * CELL + Math.floor((CELL - textWidth(label)) / 2), 2, 1, plot)
  })
  sorted.forEach((part, row) => {
    const y = top + row * CELL
    drawText(partLabel(part), 2, y + Math.floor((CELL - FONT_HEIGHT) / 2), 1, plot)
    BASE_POSES.forEach((pose, column) => {
      const x = labelWidth + column * CELL
      const frame = part.frames[pose]
      canvas.hline(x, x + CELL - 1, y, ':')
      canvas.hline(x, x + CELL - 1, y + CELL - 1, ':')
      canvas.vline(x, y, y + CELL - 1, ':')
      canvas.vline(x + CELL - 1, y, y + CELL - 1, ':')
      if (!frame) {
        canvas.rect(x + 4, y + 4, PART_SIZE, PART_SIZE, '.')
        return
      }
      canvas.draw({ width: PART_SIZE, height: PART_SIZE, rows: frame.rows }, x + 4, y + 4)
    })
  })
  const { width, height, ink } = canvas.scaled(SHEET_SCALE)
  return encodePng1Bit(width, height, ink)
}

export interface ImportResult {
  readonly parts: readonly PartSource[]
  readonly files: ReadonlyMap<string, string>
}

/** Read, validate, write the generated modules and the contact sheet. */
export function importExport(exportDir: string, generatedDir: string, sheetPath: string): ImportResult {
  const parts = readExportDir(exportDir)
  const files = generatedFiles(parts)
  writeGenerated(generatedDir, files)
  mkdirSync(join(sheetPath, '..'), { recursive: true })
  writeFileSync(sheetPath, contactSheet(parts))
  return { parts, files }
}
