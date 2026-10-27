/**
 * Placeholder part exports, so the pipeline runs end to end before Lou's art exists (GDD section 7.4's first
 * batch): a medium Eldrith slight body, an Eldrith head, one hair and the shared tier-0 Squire tabard (outfit.squire), in all
 * six poses, written in the exact layout export.sh produces.
 *
 *   pnpm tsx tools/art/aseprite/placeholder.ts [out-dir]      (default tools/art/aseprite/export, not committed)
 *
 * Then: pnpm tsx tools/art/aseprite-import.ts tools/art/aseprite/export
 *
 * Drawings are written as indexed PNGs with the palette and anchors as RGBA PNGs, so both decoder paths run.
 */
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { encodePngIndexed } from '@trmnl-games/wardenwatch/art/png'
import type { PartPose, Point, Slot } from '@trmnl-games/wardenwatch/art/parts/types'
import { type AnchorColourName, GLYPH_COLOURS, rgbOf } from './palette'
import { encodePngRgba } from './png'

interface Frame {
  readonly rows: readonly string[]
  readonly anchors?: Readonly<Partial<Record<AnchorColourName, Point>>>
}
interface Placeholder {
  readonly slot: Slot
  readonly option: string
  readonly frames: Readonly<Record<PartPose, Frame>>
}

const SIZE = 24
const PALETTE = [[0, 0, 0] as const, ...GLYPH_COLOURS.map(([, rgb]) => rgb)]

/** Indexed PNG in the palette, index 0 transparent: what Aseprite writes for an indexed sprite. */
function drawingPng(rows: readonly string[]): Uint8Array {
  const index = new Uint8Array(SIZE * SIZE)
  rows.forEach((row, y) => {
    if (row.length !== SIZE) throw new Error(`row ${y} is ${row.length} wide: ${JSON.stringify(row)}`)
    ;[...row].forEach((ch, x) => {
      if (ch === ' ') return
      const i = GLYPH_COLOURS.findIndex(([glyph]) => glyph === ch)
      if (i === -1) throw new Error(`unknown glyph ${JSON.stringify(ch)} at ${x},${y}`)
      index[y * SIZE + x] = i + 1
    })
  })
  return encodePngIndexed(SIZE, SIZE, index, PALETTE, 0)
}

/** RGBA PNG with one pixel per anchor. */
function anchorsPng(anchors: Readonly<Partial<Record<AnchorColourName, Point>>>): Uint8Array {
  const data = new Uint8Array(SIZE * SIZE * 4)
  for (const [name, point] of Object.entries(anchors) as [AnchorColourName, Point][]) {
    const [r, g, b] = rgbOf(name)
    data.set([r, g, b, 255], (point.y * SIZE + point.x) * 4)
  }
  return encodePngRgba({ width: SIZE, height: SIZE, data })
}

const standingBody = (legs: readonly string[], arms: readonly string[], hand: Point): Frame => ({
  rows: [
    '                        ',
    '                        ',
    '                        ',
    '                        ',
    '                        ',
    '                        ',
    '                        ',
    '                        ',
    '                        ',
    '                        ',
    '                        ',
    '                        ',
    '           #.#          ',
    '       ###.....###      ',
    ...arms,
    ...legs,
  ],
  anchors: { head: { x: 12, y: 5 }, neck: { x: 12, y: 12 }, hand, back: { x: 8, y: 14 } },
})

const ARMS_DOWN = [
  '       #.#.....#.#      ',
  '       #.#.....#.#      ',
  '       #.#.....#.#      ',
  '       ###.....###      ',
  '         #.....#        ',
]
const ARMS_FIGHT = [
  '       #.#.....#########',
  '       #.#.....#.......#',
  '       ###.....#########',
  '         #.....#        ',
  '         #.....#        ',
]
const LEGS_IDLE = ['         #######        ', '         #.# #.#        ', '         #.# #.#        ', '         #.# #.#        ', '        ##.# #.##       ']
const LEGS_WALK = ['         #######        ', '         #.# #.#        ', '        #.#   #.#       ', '       #.#     #.#      ', '      ###       ###     ']
const LEGS_FIGHT = ['         #######        ', '        #.#   #.#       ', '       #.#     #.#      ', '      #.#       #.#     ', '     ###         ###    ']
const LEGS_REST = ['         #######        ', '        #.......#       ', '       #.........#      ', '      #...........#     ', '      #############     ']

const lyingBody = (fill: string): Frame => ({
  rows: [
    ...Array<string>(17).fill('                        '),
    '          ##############',
    `         #${fill.repeat(13)}#`,
    `         #${fill.repeat(13)}#`,
    `         #${fill.repeat(13)}#`,
    `         #${fill.repeat(13)}#`,
    '          ##############',
    '                        ',
  ],
  anchors: { head: { x: 2, y: 19 }, neck: { x: 9, y: 19 }, hand: { x: 16, y: 17 }, back: { x: 16, y: 22 } },
})

const standingHead = (eyes: string): Frame => ({
  rows: [
    ...Array<string>(5).fill('                        '),
    '          #####         ',
    '   #     #.....#        ',
    '   ###  #.......#       ',
    `    ####.${eyes}.#        `,
    '        #......##       ',
    '         #....##        ',
    '          #####         ',
    ...Array<string>(12).fill('                        '),
  ],
  anchors: { origin: { x: 12, y: 5 }, crown: { x: 12, y: 4 } },
})

const lyingHead = (eyes: string): Frame => ({
  rows: [
    ...Array<string>(13).fill('                        '),
    '      #                 ',
    '      ##                ',
    '     ###                ',
    '    #####               ',
    '   #.....#              ',
    `   #${eyes}#              `,
    '  #......#              ',
    '   #.....#              ',
    '   #.....#              ',
    '    #####               ',
  ],
  anchors: { origin: { x: 2, y: 19 }, crown: { x: 1, y: 19 } },
})

const STANDING_HAIR: Frame = {
  rows: [
    ...Array<string>(3).fill('                        '),
    '         ##  #          ',
    '        ######.#        ',
    '       ###########      ',
    '       ##      ##       ',
    ...Array<string>(17).fill('                        '),
  ],
  anchors: { origin: { x: 12, y: 4 } },
}
const LYING_HAIR: Frame = {
  rows: [...Array<string>(17).fill('                        '), '  #                     ', ' ##                     ', '###                     ', ' ##                     ', '  #                     ', '                        ', '                        '],
  anchors: { origin: { x: 1, y: 19 } },
}

const STANDING_TABARD: Frame = {
  rows: [
    ...Array<string>(13).fill('                        '),
    '         wwwwwww        ',
    '         www#www        ',
    '         w#####w        ',
    '         www#www        ',
    '         wwwwwww        ',
    '         ww=w=ww        ',
    '         wwwwwww        ',
    ...Array<string>(4).fill('                        '),
  ],
}
const LYING_TABARD: Frame = {
  rows: [...Array<string>(18).fill('                        '), '           wwwwwww      ', '           www#www      ', '           w#####w      ', '           www#www      ', '                        ', '                        '],
}

export const PLACEHOLDERS: readonly Placeholder[] = [
  {
    slot: 'body',
    option: 'eldrith.slight@medium',
    frames: {
      idle: standingBody(LEGS_IDLE, ARMS_DOWN, { x: 16, y: 17 }),
      fight: standingBody(LEGS_FIGHT, ARMS_FIGHT, { x: 22, y: 15 }),
      walk: standingBody(LEGS_WALK, ARMS_DOWN, { x: 16, y: 17 }),
      rest: standingBody(LEGS_REST, ARMS_DOWN, { x: 16, y: 17 }),
      sleep: lyingBody('.'),
      knocked_out: lyingBody(':'),
    },
  },
  {
    slot: 'head',
    option: 'head.eldrith',
    frames: {
      idle: standingHead('#.#.#'),
      fight: standingHead('#.#.#'),
      walk: standingHead('#.#.#'),
      rest: standingHead('=.=.#'),
      sleep: lyingHead('.=.=.'),
      knocked_out: lyingHead('.#.#.'),
    },
  },
  {
    slot: 'hair',
    option: 'hair.crop',
    frames: { idle: STANDING_HAIR, fight: STANDING_HAIR, walk: STANDING_HAIR, rest: STANDING_HAIR, sleep: LYING_HAIR, knocked_out: LYING_HAIR },
  },
  {
    slot: 'outfit',
    option: 'outfit.squire@medium',
    frames: { idle: STANDING_TABARD, fight: STANDING_TABARD, walk: STANDING_TABARD, rest: STANDING_TABARD, sleep: LYING_TABARD, knocked_out: LYING_TABARD },
  },
]

/** Write the placeholder export under `outDir`, replacing what was there. */
export function writePlaceholders(outDir: string): string[] {
  const written: string[] = []
  rmSync(outDir, { recursive: true, force: true })
  for (const part of PLACEHOLDERS) {
    const dir = join(outDir, part.slot, part.option)
    mkdirSync(dir, { recursive: true })
    for (const [pose, frame] of Object.entries(part.frames)) {
      writeFileSync(join(dir, `${pose}.png`), drawingPng(frame.rows))
      written.push(`${part.slot}/${part.option}/${pose}.png`)
      if (frame.anchors) {
        writeFileSync(join(dir, `${pose}.anchors.png`), anchorsPng(frame.anchors))
        written.push(`${part.slot}/${part.option}/${pose}.anchors.png`)
      }
    }
  }
  return written
}

const isMain = process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isMain) {
  const outDir = resolve(process.argv[2] ?? resolve(fileURLToPath(import.meta.url), '../export'))
  const written = writePlaceholders(outDir)
  console.log(`${written.length} files -> ${outDir}`)
}
