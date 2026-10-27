/**
 * The volta-1bit.gpl swatches as the import tool sees them. Keep this table and the .gpl in step:
 * every drawing swatch maps to one engine glyph, every anchor swatch to one anchor name.
 */
import type { AnchorName } from '@trmnl-games/wardenwatch/art/parts/types'

export type Rgb = readonly [r: number, g: number, b: number]

export const GLYPH_COLOURS: ReadonlyArray<readonly [glyph: string, rgb: Rgb]> = [
  ['#', [0, 0, 0]],
  ['w', [255, 255, 255]],
  [':', [128, 128, 128]],
  ['.', [192, 192, 192]],
  ['=', [64, 96, 192]],
]

export type AnchorColourName = AnchorName | 'origin'

export const ANCHOR_COLOURS: ReadonlyArray<readonly [name: AnchorColourName, rgb: Rgb]> = [
  ['head', [255, 0, 0]],
  ['neck', [255, 128, 0]],
  ['hand', [0, 255, 0]],
  ['back', [0, 0, 255]],
  ['crown', [255, 0, 255]],
  ['origin', [0, 255, 255]],
]

export const hex = ([r, g, b]: Rgb): string => '#' + [r, g, b].map((n) => n.toString(16).padStart(2, '0')).join('').toUpperCase()

export const rgbOf = (name: AnchorColourName): Rgb => ANCHOR_COLOURS.find(([n]) => n === name)![1]
export const rgbOfGlyph = (glyph: string): Rgb => GLYPH_COLOURS.find(([g]) => g === glyph)![1]
