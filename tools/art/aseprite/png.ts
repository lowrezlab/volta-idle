/**
 * PNG reading for the Aseprite import (and a small RGBA writer for fixtures). Node only: it uses zlib.
 * It decodes what Aseprite writes for a 24x24 part: 8-bit RGB/RGBA, grayscale and 1-8 bit indexed PNGs,
 * non-interlaced, any scanline filter. Everything comes back as straight RGBA bytes.
 */
import { deflateSync, inflateSync } from 'node:zlib'

export interface RgbaImage {
  readonly width: number
  readonly height: number
  /** `width * height * 4` bytes, row-major, R G B A. */
  readonly data: Uint8Array
}

const SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10]

const CRC_TABLE = (() => {
  const table = new Uint32Array(256)
  for (let n = 0; n < 256; n += 1) {
    let c = n
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[n] = c >>> 0
  }
  return table
})()

function crc32(bytes: Uint8Array): number {
  let c = 0xffffffff
  for (const b of bytes) c = CRC_TABLE[(c ^ b) & 0xff]! ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

const u32 = (n: number) => [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255]
const readU32 = (bytes: Uint8Array, at: number) => ((bytes[at]! << 24) | (bytes[at + 1]! << 16) | (bytes[at + 2]! << 8) | bytes[at + 3]!) >>> 0

function chunk(type: string, data: Uint8Array): Uint8Array {
  const typed = new Uint8Array(4 + data.length)
  typed.set([...type].map((ch) => ch.charCodeAt(0)), 0)
  typed.set(data, 4)
  const out = new Uint8Array(12 + data.length)
  out.set(u32(data.length), 0)
  out.set(typed, 4)
  out.set(u32(crc32(typed)), 8 + data.length)
  return out
}

export interface RawPng {
  readonly width: number
  readonly height: number
  readonly bitDepth: number
  /** 0 grayscale, 2 RGB, 3 indexed, 4 grayscale+alpha, 6 RGBA. */
  readonly colourType: number
  /** Every scanline with its filter byte first, already filtered. */
  readonly scanlines: Uint8Array
  readonly palette?: Uint8Array
  readonly trns?: Uint8Array
}

/** A PNG from prepared scanlines (the fixtures build filtered and sub-byte images with it). */
export function encodePngRaw(png: RawPng): Uint8Array {
  const parts = [
    Uint8Array.from(SIGNATURE),
    chunk('IHDR', new Uint8Array([...u32(png.width), ...u32(png.height), png.bitDepth, png.colourType, 0, 0, 0])),
    ...(png.palette ? [chunk('PLTE', png.palette)] : []),
    ...(png.trns ? [chunk('tRNS', png.trns)] : []),
    chunk('IDAT', new Uint8Array(deflateSync(png.scanlines))),
    chunk('IEND', new Uint8Array()),
  ]
  const out = new Uint8Array(parts.reduce((sum, p) => sum + p.length, 0))
  let at = 0
  for (const part of parts) {
    out.set(part, at)
    at += part.length
  }
  return out
}

/** The image as an unfiltered 8-bit RGBA PNG (fixtures and placeholders; the engine's own encoders stay 1-bit/indexed). */
export function encodePngRgba(image: RgbaImage): Uint8Array {
  const { width, height, data } = image
  const scanlines = new Uint8Array((width * 4 + 1) * height)
  for (let y = 0; y < height; y += 1) scanlines.set(data.subarray(y * width * 4, (y + 1) * width * 4), y * (width * 4 + 1) + 1)
  return encodePngRaw({ width, height, bitDepth: 8, colourType: 6, scanlines })
}

/** PNG's Paeth predictor, shared with the fixture builder. */
export const paeth = (a: number, b: number, c: number): number => {
  const p = a + b - c
  const pa = Math.abs(p - a)
  const pb = Math.abs(p - b)
  const pc = Math.abs(p - c)
  return pa <= pb && pa <= pc ? a : pb <= pc ? b : c
}

/** Decode a PNG into straight RGBA. `name` labels errors. */
export function decodePng(bytes: Uint8Array, name = 'png'): RgbaImage {
  if (bytes.length < 8 || SIGNATURE.some((b, i) => bytes[i] !== b)) throw new Error(`${name}: not a PNG`)
  let width = 0
  let height = 0
  let bitDepth = 0
  let colourType = 0
  let interlace = 0
  let palette: Uint8Array | undefined
  let trns: Uint8Array | undefined
  const idat: Uint8Array[] = []
  for (let at = 8; at + 8 <= bytes.length; ) {
    const length = readU32(bytes, at)
    const type = String.fromCharCode(bytes[at + 4]!, bytes[at + 5]!, bytes[at + 6]!, bytes[at + 7]!)
    const data = bytes.subarray(at + 8, at + 8 + length)
    if (type === 'IHDR') {
      width = readU32(data, 0)
      height = readU32(data, 4)
      bitDepth = data[8]!
      colourType = data[9]!
      interlace = data[12]!
    } else if (type === 'PLTE') palette = data
    else if (type === 'tRNS') trns = data
    else if (type === 'IDAT') idat.push(data)
    else if (type === 'IEND') break
    at += 12 + length
  }
  if (width === 0 || height === 0) throw new Error(`${name}: missing IHDR`)
  if (interlace !== 0) throw new Error(`${name}: interlaced PNGs are not supported; export without interlacing`)
  if (bitDepth === 16) throw new Error(`${name}: 16-bit PNGs are not supported; export 8-bit`)
  const channels = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[colourType]
  if (channels === undefined) throw new Error(`${name}: unknown PNG colour type ${colourType}`)
  if (colourType === 3 && !palette) throw new Error(`${name}: indexed PNG without a palette`)

  const total = idat.reduce((sum, d) => sum + d.length, 0)
  const compressed = new Uint8Array(total)
  let offset = 0
  for (const d of idat) {
    compressed.set(d, offset)
    offset += d.length
  }
  const raw = new Uint8Array(inflateSync(compressed))

  const bitsPerPixel = channels * bitDepth
  const rowBytes = Math.ceil((width * bitsPerPixel) / 8)
  const bpp = Math.max(1, Math.ceil(bitsPerPixel / 8))
  if (raw.length < (rowBytes + 1) * height) throw new Error(`${name}: truncated image data`)
  const scan = new Uint8Array(rowBytes * height)
  for (let y = 0; y < height; y += 1) {
    const filter = raw[y * (rowBytes + 1)]!
    const src = y * (rowBytes + 1) + 1
    const dst = y * rowBytes
    for (let i = 0; i < rowBytes; i += 1) {
      const x = raw[src + i]!
      const a = i >= bpp ? scan[dst + i - bpp]! : 0
      const b = y > 0 ? scan[dst - rowBytes + i]! : 0
      const c = y > 0 && i >= bpp ? scan[dst - rowBytes + i - bpp]! : 0
      let value: number
      switch (filter) {
        case 0: value = x; break
        case 1: value = x + a; break
        case 2: value = x + b; break
        case 3: value = x + ((a + b) >> 1); break
        case 4: value = x + paeth(a, b, c); break
        default: throw new Error(`${name}: bad scanline filter ${filter} on row ${y}`)
      }
      scan[dst + i] = value & 255
    }
  }

  const data = new Uint8Array(width * height * 4)
  const sample = (row: number, index: number): number => {
    // The `index`th sample of a row at bitDepth bits, scaled to 0..255 for sub-byte depths.
    if (bitDepth === 8) return scan[row * rowBytes + index]!
    const bit = index * bitDepth
    const byte = scan[row * rowBytes + (bit >> 3)]!
    const value = (byte >> (8 - bitDepth - (bit & 7))) & ((1 << bitDepth) - 1)
    return colourType === 3 ? value : Math.round((value * 255) / ((1 << bitDepth) - 1))
  }
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const out = (y * width + x) * 4
      switch (colourType) {
        case 0: {
          const g = sample(y, x)
          const transparent = trns !== undefined && trns.length >= 2 && ((trns[0]! << 8) | trns[1]!) === g
          data.set([g, g, g, transparent ? 0 : 255], out)
          break
        }
        case 2: {
          const r = sample(y, x * 3)
          const g = sample(y, x * 3 + 1)
          const b = sample(y, x * 3 + 2)
          const transparent = trns !== undefined && trns.length >= 6 && trns[1] === r && trns[3] === g && trns[5] === b
          data.set([r, g, b, transparent ? 0 : 255], out)
          break
        }
        case 3: {
          const i = sample(y, x)
          if (i * 3 + 2 >= palette!.length) throw new Error(`${name}: palette index ${i} out of range at ${x},${y}`)
          data.set([palette![i * 3]!, palette![i * 3 + 1]!, palette![i * 3 + 2]!, trns !== undefined && i < trns.length ? trns[i]! : 255], out)
          break
        }
        case 4: {
          const g = sample(y, x * 2)
          data.set([g, g, g, sample(y, x * 2 + 1)], out)
          break
        }
        default:
          data.set([sample(y, x * 4), sample(y, x * 4 + 1), sample(y, x * 4 + 2), sample(y, x * 4 + 3)], out)
      }
    }
  }
  return { width, height, data }
}
