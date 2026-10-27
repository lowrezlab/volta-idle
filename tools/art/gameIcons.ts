/**
 * The games' colour app icons (2026-10-10): 64x64 pixel art, drawn in the companion's palette with a one-pixel night
 * outline round every subject, plus a separate 16px drawing of each for browser tabs. Node-only (tools/art/web.ts).
 */
import { Image, type Rgb } from './colour'

const hex = (value: string): Rgb => [1, 3, 5].map((i) => parseInt(value.slice(i, i + 2), 16)) as unknown as Rgb

/** A layer of optional colours; empty cells let the layers below show. */
class Layer {
  readonly cells: Array<string | null>
  constructor(
    readonly width: number,
    readonly height: number,
  ) {
    this.cells = new Array<string | null>(width * height).fill(null)
  }

  get(x: number, y: number): string | null {
    return x < 0 || y < 0 || x >= this.width || y >= this.height ? null : this.cells[y * this.width + x]!
  }

  set(x: number, y: number, colour: string | null): void {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return
    this.cells[y * this.width + x] = colour
  }

  /** An ASCII drawing: each character names a colour in `key`; anything else is left empty. */
  draw(art: string, key: Record<string, string>, left: number, top: number): void {
    art.replace(/^\n/, '').split('\n').forEach((row, y) => [...row].forEach((ch, x) => key[ch] && this.set(left + x, top + y, key[ch])))
  }

  /** Give every empty cell beside a filled one (4-connected) the outline colour. */
  outline(colour: string): void {
    const edge: number[] = []
    for (let y = 0; y < this.height; y += 1) for (let x = 0; x < this.width; x += 1) {
      if (this.get(x, y) !== null) continue
      if (this.get(x - 1, y) || this.get(x + 1, y) || this.get(x, y - 1) || this.get(x, y + 1)) edge.push(y * this.width + x)
    }
    for (const i of edge) this.cells[i] = colour
  }
}

/** Layers composited bottom first. */
function flatten(width: number, height: number, layers: Layer[]): Image {
  const image = new Image(width, height)
  for (const layer of layers) for (let y = 0; y < height; y += 1) for (let x = 0; x < width; x += 1) {
    const colour = layer.get(x, y)
    if (colour) image.set(x, y, hex(colour))
  }
  return image
}

/** A tiny repeatable hash for scattering sparkles and spots. */
const hash = (x: number, y: number, seed = 0) => {
  let h = (x * 374761393 + y * 668265263 + seed * 2246822519) | 0
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296
}

/** Horizontal bands from `stops` ([firstRow, colour]), with a one-row checker blend at each change. */
function bands(layer: Layer, stops: Array<[number, string]>, bottom: number): void {
  for (let y = stops[0]![0]; y < bottom; y += 1) {
    let index = 0
    while (index + 1 < stops.length && stops[index + 1]![0] <= y) index += 1
    const next = stops[index + 1]
    for (let x = 0; x < layer.width; x += 1) {
      const blend = next !== undefined && y === next[0] - 1 && (x + y) % 2 === 0
      layer.set(x, y, blend ? next[1] : stops[index]![1])
    }
  }
}

// The companion's palette (apps/web/src/styles.css) and the painted scenes' colours (sceneColour.ts).
const NIGHT = '#0c0a1c'
const CREAM = '#f4f1ff'
const GOLD = '#ffd166'
const GOLD_HI = '#ffe08f'
const GOLD_LO = '#b07a00'

/* --------------------------------------------------------------- Wardenwatch */

/**
 * The Warrior from the companion's painted scenes, brought close: brown hair, red cardigan with lanyard badge, and the
 * letter-opener raised. Behind them a torch-gold burst on dungeon purple, with coins catching the light.
 */
export function wardenwatchIcon(): Image {
  const W = 64
  const back = new Layer(W, W)
  const cx = 30
  const cy = 31
  for (let y = 0; y < W; y += 1) for (let x = 0; x < W; x += 1) {
    const a = Math.atan2(y - cy, x - cx)
    const d = Math.hypot(x - cx, y - cy)
    const ray = Math.floor(((a + Math.PI) / (Math.PI * 2)) * 16) % 2 === 0
    back.set(x, y, d < 13 ? (d < 10 ? '#ffd98a' : '#ffc45e') : d < 22 ? (ray ? '#f0a03a' : '#e0803a') : d < 32 ? (ray ? '#8a4f9a' : '#6a3f8f') : ray ? '#3b2d6b' : '#2c2650')
    // A dither ring between each band so the light falls off softly.
    if ((Math.abs(d - 13) < 0.7 || Math.abs(d - 22) < 0.7 || Math.abs(d - 32) < 0.7) && (x + y) % 2 === 0) back.set(x, y, d < 20 ? '#ffc45e' : d < 30 ? '#c06a5a' : '#4a3a7a')
  }

  const hero = new Layer(W, W)
  /** How far the whole figure sits below the top of the frame. */
  const DROP = 5
  const key: Record<string, string> = {
    K: '#3a2416', H: '#6b4226', h: '#9a6338', S: '#f2c39b', s: '#d99a74', E: NIGHT, W: CREAM, P: '#ee9a8a', m: '#8a3a3a',
    R: '#e0604f', r: '#b8443a', d: '#8f2f2a', L: CREAM, B: '#5d8fd6', b: '#2f5f9e', T: '#fbe9c2', N: '#2c2650', n: '#1a1636',
  }
  hero.draw(`
.........KKKKKK.........
......KKKHHHHhhKKK......
....KKHHHhhhhHHHHHKK....
...KHHHHhhHHHHHHHHHHK...
..KHHHhhHHHHHHHHHHHHHK..
..KHHhHHHHHHHHHHHHHHHHK.
.KHHHHHHHHHHHHHSHHHHHHK.
.KHHHHHHHSSHHHSSSHHHHHHK
.KHHHHHSSSSSSSSSSSSHHHHK
.KHHHSSSSSSSSSSSSSSSHHHK
.KHHSSSKKKSSSSSSKKKSSHHK
.KHSSSSSSSSSSSSSSSSSSShK
KsSSSSSEEWSSSSSSEEWSSSsK
KsSSSSSEEESSSSSSEEESSSsK
KsSSSSSEEESSSSSSEEESSSsK
.KsSSSSSSSSSSSSSSSSSSsK.
.KsSPPSSSSSSSSSSSSPPSsK.
..KsSSSSSSSmmmmSSSSSsK..
...KsSSSSSSSSSSSSSSsK...
....KKsssSSSSSSsssKK....
......KKKsssssKKK.......
........KsSSSSsK........`, key, 20, DROP + 9)
  // The cardigan: collar and lanyard at the neck, shoulders flaring to the frame's foot, a placket with buttons.
  const BODY_TOP = DROP + 30
  for (let y = BODY_TOP; y < W; y += 1) {
    const row = y - BODY_TOP
    const half = row < 2 ? 6 : 6 + 12 * Math.sqrt(Math.min(1, (row - 1) / 7))
    for (let x = Math.ceil(31.5 - half); x <= Math.floor(31.5 + half); x += 1) {
      const fromEdge = Math.min(x - (31.5 - half), 31.5 + half - x)
      const collar = row < 3 && Math.abs(x - 31.5) < 6 - row
      let colour = collar ? key.T! : fromEdge < 1.5 && row > 3 ? key.r! : key.R!
      if (row >= 3 && Math.abs(x - 23.5) < 0.6) colour = key.r!
      if (row >= 3 && Math.abs(x - 39.5) < 0.6) colour = key.r!
      if (row >= 1 && row < 6 && Math.abs(x - 31.5) < (row < 3 ? 1.6 : 0.6)) colour = key.L!
      if (row >= 6 && row < 10 && Math.abs(x - 31.5) < 2.6) colour = row === 6 || row === 9 || Math.abs(x - 31.5) > 1.6 ? key.B! : row === 7 ? key.W! : key.b!
      if (row >= 10 && Math.abs(x - 31.5) < 0.6) colour = (row - 12) % 5 === 0 ? key.W! : key.d!
      hero.set(x, y, colour)
    }
  }
  // The sword arm: the right sleeve rising to a fist at shoulder height.
  hero.draw(`
.......SSSS
......SSSSSs
......SSSSss
.....RRssss.
....RRRRRR..
...RRRRRrR..
..RRRRRrRR..
.RRRRRrRR...
RRRRRrRR....
RRRRrRR.....
RRRrRR......`, key, 40, DROP + 22)
  hero.outline(NIGHT)
  // Hair and face lines drawn inside the outline.

  // The letter-opener: a long steel blade with a gold guard, held upright in the fist.
  const sword = new Layer(W, W)
  sword.draw(`
..#..
.#M#.
.#Mn.
.#Mn.
.#Mn.
.#Mn.
.#Mn.
.#Mn.
.#Mn.
.#Mn.
.#Mn.
.#Mn.
.#Mn.
.#Mn.
.#Mn.
YYYYY
yYYYy
..G..
..G..
..Y..`, { M: '#eef3fb', n: '#9aa6bb', '#': '#c9d3e0', Y: GOLD, y: GOLD_LO, G: '#6b4226' }, 47, 6)
  sword.outline(NIGHT)

  // Coins and glints in the light.
  const coins = new Layer(W, W)
  const coin = `
.YYY.
YYhYY
YhYYy
YYYyy
.yyy.`
  coins.draw(coin, { Y: GOLD, h: GOLD_HI, y: GOLD_LO }, 2, 57)
  coins.draw(coin, { Y: GOLD, h: GOLD_HI, y: GOLD_LO }, 6, 50)
  coins.draw(coin, { Y: GOLD, h: GOLD_HI, y: GOLD_LO }, 56, 57)
  coins.outline(NIGHT)
  const glints = new Layer(W, W)
  for (const [x, y] of [[8, 10], [14, 4], [57, 33], [5, 28]] as const) {
    glints.set(x, y, CREAM)
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) glints.set(x + dx, y + dy, GOLD_HI)
  }

  return flatten(W, W, [back, glints, hero, sword, coins])
}

/** The 16px tab icon: the Warrior's face and raised blade in torch light, drawn by hand at tab size. */
export function wardenwatchFavicon(): Image {
  const layer = new Layer(16, 16)
  for (let y = 0; y < 16; y += 1) for (let x = 0; x < 16; x += 1) layer.set(x, y, Math.hypot(x - 6.5, y - 6.5) < 8 ? '#f0a03a' : '#3b2d6b')
  layer.draw(`
....NNNNNN...N..
..NNHHHHhHNN.NMN
.NHHHHhHHHHN.NMN
.NHHHHHHHHHHNNMN
NHHHSSSSSSHHNNMN
NHHSSSSSSSSHNNMN
NHSSEESSEESSNNMN
NsSSEESSEESsNNMN
NsPSSSSSSSPsNNMN
.NsSSSmmSSsNNYYY
..NNsssssNNSNGN.
.NNRRTLTRRNSSN..
NRRRRRLRRRRNSN..
NRRRRBBRRRRRN...
NRRRRBBRRRRRN...
NRRRRRdRRRRRN...`, { N: NIGHT, H: '#6b4226', h: '#9a6338', S: '#f2c39b', s: '#d99a74', E: NIGHT, P: '#ee9a8a', m: '#8a3a3a', R: '#e0604f', d: '#8f2f2a', T: '#fbe9c2', L: CREAM, B: '#5d8fd6', M: '#eef3fb', Y: GOLD, G: '#6b4226' }, 0, 0)
  return flatten(16, 16, [layer])
}
