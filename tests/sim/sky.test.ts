import { inflateSync } from 'node:zlib'
import { describe, expect, it } from 'vitest'
import { Liquid } from 'liquidjs'
import { Canvas } from '@trmnl-games/wardenwatch/art/canvas'
import { heroPoses } from '@trmnl-games/wardenwatch/art/hero'
import { monsterArt } from '@trmnl-games/wardenwatch/art/monsters'
import { OCCASION_ARTS } from '@trmnl-games/wardenwatch/art/occasions'
import { propArt } from '@trmnl-games/wardenwatch/art/props'
import { parseScenePath, renderScenePng } from '@trmnl-games/wardenwatch/art/route'
import { composeScene, scenePlacements, STAGE_HEIGHT, STAGE_WIDTH, type Subject } from '@trmnl-games/wardenwatch/art/scene'
import { BwryInk, paintedScene } from '@trmnl-games/wardenwatch/art/sceneColour'
import { layeredScenePath, scenePath } from '@trmnl-games/wardenwatch/art/sceneKey'
import { parseSkyDayToken, sceneUrlAt, sceneUrlsAt, shortVoltaDate, skyDayToken, voltaDateLine } from '@trmnl-games/wardenwatch/art/sceneTime'
import { drawSky, SKY_CLEARANCE, SKY_LEFT, SKY_PITCH, SKY_ROWS, skyMoons } from '@trmnl-games/wardenwatch/art/sky'
import { conjunction, dailyAria, DAY_MS, DAYS_PER_YEAR, GYRE_ORDER, GYRE_YEARS, moonPhases, dayMidpoint, VOLTA_EPOCH_MS, voltaDateOfDay } from '@trmnl-games/wardenwatch/sim/core/calendar'
import { screenMarkup } from '@trmnl-games/wardenwatch/templates/screen'

const EPOCH_LINE = 'Rime Ascendant 1 · Gyre of the Eldritch Beast 1203'
const EPOCH_SHORT = 'Rime Asc. 1 · 1203'

/** A quiet screen: every string the templates read, with the date line as the backend sends it. */
const vars = (extra: Record<string, unknown> = {}) => ({
  status: 'exploring', hero_name: 'Baz', level: 5, hp: 10, max_hp: 12, log: [], board_rows: [], todo_tasks: [], labels: {},
  scene_url: '', scene_url_small: '', scene_url_medium: '', scene_url_large: '', qr_base: '', companion_qr_base: '', home_qr_base: '', corner_qr_base: '', keepsake_qr_base: '', keepsake_corner_qr_base: '',
  ...voltaDateLine(VOLTA_EPOCH_MS),
  ...extra,
})
const render = (layout: keyof typeof screenMarkup, extra?: Record<string, unknown>) => new Liquid({ timezoneOffset: 0 }).parseAndRender(screenMarkup[layout], vars(extra))
/** The title bars of a rendered layout: the landscape one first, then the portrait one. */
const bars = (html: string) => [...html.matchAll(/<div class="title_bar[^"]*">[\s\S]*?<\/div>/g)].map((m) => m[0])
const instanceText = (bar: string) => (/<span class="instance">([\s\S]*?)<\/span>\s*<\/div>$/.exec(bar)?.[1] ?? '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()

describe('the Volta date line (P4.1)', () => {
  it('names the epoch as Lou wrote it, long and short', () => {
    expect(voltaDateLine(VOLTA_EPOCH_MS)).toEqual({ volta_date: EPOCH_LINE, volta_date_short: EPOCH_SHORT })
    expect(voltaDateLine(VOLTA_EPOCH_MS + 10 * DAY_MS)).toEqual({ volta_date: 'Rime Skybottom 2 · Gyre of the Eldritch Beast 1203', volta_date_short: 'Rime Sky. 2 · 1203' })
    expect(voltaDateLine(VOLTA_EPOCH_MS - 1).volta_date).toBe('Tanhaus Midheaven 9 · Gyre of the Conjoined 1202')
  })

  it('keeps the long line within 56 characters and the short one within 22 over a whole Gyre', () => {
    let longest = ''
    let shortest = ''
    for (let day = 0; day < DAYS_PER_YEAR * GYRE_YEARS; day += 1) {
      const date = voltaDateOfDay(day)
      const line = voltaDateLine(VOLTA_EPOCH_MS + day * DAY_MS)
      expect(line.volta_date_short).toBe(shortVoltaDate(date))
      expect(line.volta_date.length).toBeLessThanOrEqual(56)
      expect(line.volta_date_short.length).toBeLessThanOrEqual(22)
      if (line.volta_date.length > longest.length) longest = line.volta_date
      if (line.volta_date_short.length > shortest.length) shortest = line.volta_date_short
    }
    expect(longest).toMatch(/^Tanhaus Descendant \d · Gyre of the Blooming Horror \d{4}$/)
    expect(longest).toHaveLength(55)
    expect(shortest).toMatch(/^Tanhaus Desc\. \d · \d{4}$/)
    expect(shortest).toHaveLength(22)
  })

  it('reads the whole line on the full landscape bar and the short one on every other bar', async () => {
    const full = bars(await render('markup'))
    expect(full).toHaveLength(2)
    expect(instanceText(full[0]!)).toBe(EPOCH_LINE)
    expect(instanceText(full[1]!)).toBe(EPOCH_SHORT)
    for (const layout of ['markup_half_horizontal', 'markup_half_vertical', 'markup_quadrant'] as const) {
      const layoutBars = bars(await render(layout))
      expect(layoutBars).toHaveLength(2)
      for (const bar of layoutBars) expect(instanceText(bar)).toBe(EPOCH_SHORT)
    }
  })

  it('follows a keepsake code, so a truncating bar cuts the date and never the code, and the fitter drops the date whole', async () => {
    for (const layout of Object.keys(screenMarkup) as Array<keyof typeof screenMarkup>) {
      const html = await render(layout, { desk_keepsake_code: '482 917' })
      for (const bar of bars(html)) {
        // The narrow portrait bars drop the word "code" as before.
        expect(instanceText(bar)).toMatch(/^Keepsake (code )?482 917 · (Rime Ascendant 1 · Gyre of the Eldritch Beast 1203|Rime Asc\. 1 · 1203)$/)
        expect(bar).toContain('<span data-volta-date="true"> · ')
      }
      expect(html).toContain("instance.querySelector('[data-volta-date]')")
    }
  })

  it('shows a code alone on an envelope from before the line, and no instance at all without either', async () => {
    for (const layout of Object.keys(screenMarkup) as Array<keyof typeof screenMarkup>) {
      const stale = await render(layout, { volta_date: undefined, volta_date_short: undefined, desk_keepsake_code: '482 917' })
      for (const bar of bars(stale)) expect(instanceText(bar)).toMatch(/^Keepsake (code )?482 917$/)
      expect(stale.replace(/<script>[\s\S]*?<\/script>/g, '')).not.toContain('data-volta-date')
      const bare = await render(layout, { volta_date: undefined, volta_date_short: undefined })
      for (const bar of bars(bare)) expect(bar).not.toContain('class="instance"')
    }
  })

  it('gives the date the title\'s place in the narrow portrait bars, as a keepsake code takes it', async () => {
    for (const layout of ['markup_half_vertical', 'markup_quadrant'] as const) {
      const [landscape, portrait] = bars(await render(layout))
      expect(landscape).toContain('<span class="title">Wardenwatch</span>')
      expect(portrait).toContain('<span class="title hidden lg:inline-block">Wardenwatch</span>')
      const [, stalePortrait] = bars(await render(layout, { volta_date: undefined, volta_date_short: undefined }))
      expect(stalePortrait).toContain('<span class="title">Wardenwatch</span>')
    }
    const [, fullPortrait] = bars(await render('markup'))
    expect(fullPortrait).toContain('<span class="title">Wardenwatch</span>')
  })
})

describe('the sky day in the scene path (P4.2)', () => {
  const look = 'v1.6103452'
  const v6 = layeredScenePath('office_cubicles', look, 'idle', { kind: 'none' }, 5)
  const v5 = scenePath('office_cubicles', 'idle', { kind: 'none' }, 5)
  const urls = { scene_url: `https://art.test${v6}`, scene_url_small: `https://art.test${v5}`, scene_url_large: `https://art.test${v6.replace('/5.png', '/6.png')}`, scene_url_medium: `https://art.test${v5.replace('/5.png', '/3.png')}` }

  it('writes negative days as n-days and reads them back', () => {
    expect(skyDayToken(123)).toBe('123')
    expect(skyDayToken(0)).toBe('0')
    expect(skyDayToken(-5)).toBe('n5')
    for (const day of [0, 7, -5, 4319]) expect(parseSkyDayToken(skyDayToken(day))).toBe(day)
  })

  it('builds a v6 path with the day on the time segment, parses it, and rejects a malformed day', () => {
    const dated = layeredScenePath('office_cubicles', look, 'idle', { kind: 'none' }, 5, 'day', undefined, 9)
    expect(dated).toBe('/art/scene/v6/office_cubicles/day-9/plain/v1.6103452/idle/none/5.png')
    expect(parseScenePath(dated)).toEqual({ ...parseScenePath(v6), skyDay: 9 })
    expect(parseScenePath(dated.replace('day-9', 'night-n5'))).toMatchObject({ time: 'night', skyDay: -5 })
    expect(parseScenePath(v6)?.skyDay).toBeUndefined()
    for (const bad of ['day--5', 'day-x', 'day-', 'day-5n', 'day-12345678', 'dusk-5']) expect(parseScenePath(dated.replace('day-9', bad))).toBeNull()
    // v5 never carries a day.
    expect(parseScenePath(v5.replace('/day/', '/day-9/'))).toBeNull()
  })

  it('sets the day with the local time on v6 URLs and leaves v5 URLs and legacy ones alone', () => {
    expect(sceneUrlAt(urls.scene_url, 'night', 9)).toBe(`https://art.test${v6.replace('/day/', '/night-9/')}`)
    expect(sceneUrlAt(urls.scene_url, 'night', -5)).toBe(`https://art.test${v6.replace('/day/', '/night-n5/')}`)
    // A day already there is replaced, or kept when the caller sets only the time (the companion's local clock).
    expect(sceneUrlAt(v6.replace('/day/', '/night-9/'), 'day', 10)).toBe(v6.replace('/day/', '/day-10/'))
    expect(sceneUrlAt(v6.replace('/day/', '/night-9/'), 'day')).toBe(v6.replace('/day/', '/day-9/'))
    expect(sceneUrlAt(v6, 'night')).toBe(v6.replace('/day/', '/night/'))
    expect(sceneUrlAt(urls.scene_url_small, 'night', 9)).toBe(`https://art.test${v5.replace('/day/', '/night/')}`)
    expect(sceneUrlAt('/art/scene/v4/office_cubicles/day/idle/none/5.png', 'night', 9)).toBe('/art/scene/v4/office_cubicles/day/idle/none/5.png')
    expect(sceneUrlAt('', 'night', 9)).toBe('')
  })

  it('keys every scene URL by the render instant\'s Volta day and adds the date line, without touching the payload', () => {
    const payload = { ...urls, other: 'kept' }
    const at = VOLTA_EPOCH_MS + 9 * DAY_MS + 15 * 3600 * 1000
    const out = sceneUrlsAt(payload, at, 7200)
    expect(out.scene_url).toBe(`https://art.test${v6.replace('/day/', '/day-9/')}`)
    expect(out.scene_url_large).toBe(`https://art.test${v6.replace('/day/', '/day-9/').replace('/5.png', '/6.png')}`)
    expect(out.scene_url_small).toBe(`https://art.test${v5}`)
    expect(out.other).toBe('kept')
    expect(out.volta_date).toBe('Rime Skybottom 1 · Gyre of the Eldritch Beast 1203')
    expect(out.volta_date_short).toBe('Rime Sky. 1 · 1203')
    expect(payload.scene_url).toBe(urls.scene_url)
    // The day turns at midnight UTC whatever the owner's offset: the sky is one world's.
    expect(sceneUrlsAt(payload, VOLTA_EPOCH_MS - 1, 7200).scene_url).toContain('/night-n1/')
    expect(sceneUrlsAt(payload, VOLTA_EPOCH_MS, -7200).scene_url).toContain('/night-0/')
  })
})

/** The strip alone, on a blank stage, as rows of '#' and '.'. */
const skyRows = (day: number) => {
  const c = new Canvas(STAGE_WIDTH, STAGE_HEIGHT)
  drawSky(c, day)
  return Array.from({ length: STAGE_HEIGHT }, (_, y) => Array.from({ length: STAGE_WIDTH }, (_, x) => (c.ink[y * STAGE_WIDTH + x] ? '#' : '.')).join(''))
}
const glyphAt = (rows: string[], centre: number, reach = 3) => rows.slice(0, SKY_ROWS).map((row) => row.slice(centre - reach, centre + reach + 1))
const FIRST_CONJUNCTION = (() => {
  for (let day = 0; day < 10_000; day += 1) if (conjunction(day).length > 0) return day
  throw new Error('no conjunction')
})()

describe('the sky strip (P4.2)', () => {
  it('draws the twelve moons in Gyre order, twelve columns apart, five pixels for the slow moons and three for the fast', () => {
    const moons = skyMoons(0)
    expect(moons.map((m) => m.warden.id)).toEqual(GYRE_ORDER.map((w) => w.id))
    expect(moons.map((m) => m.centre)).toEqual(GYRE_ORDER.map((_, i) => SKY_LEFT + i * SKY_PITCH))
    expect(moons.map((m) => m.size)).toEqual([5, 5, 5, 5, 5, 5, 3, 3, 3, 3, 3, 3])
    // Phases are the day's midpoint reading, where the aria and conjunctions are read.
    expect(moons.map((m) => m.phase)).toEqual(moonPhases(dayMidpoint(0)))
    for (const moon of moons) for (const [x, y] of [...moon.ink, ...moon.lit]) {
      expect(y).toBeGreaterThanOrEqual(0)
      expect(y).toBeLessThan(SKY_ROWS)
      expect(Math.abs(x - moon.centre)).toBeLessThanOrEqual(3)
    }
  })

  it('at the epoch: every slow moon new as an outline, the Maiden cracked, the Eclipse the aria with its sparkles and the Watcher full', () => {
    const rows = skyRows(0)
    expect(rows.slice(SKY_ROWS).every((row) => !row.includes('#'))).toBe(true)
    // The Maiden: a 5-pixel ring with the crack across its dark face.
    expect(glyphAt(rows, SKY_LEFT)).toEqual(['..###..', '.##..#.', '.#.#.#.', '.#..##.', '..###..'])
    // The Leviathan, Wyrm, Magnus, Horror and Hound: plain new rings.
    for (const i of [1, 2, 3, 4, 5]) expect(glyphAt(rows, SKY_LEFT + i * SKY_PITCH)).toEqual(['..###..', '.#...#.', '.#...#.', '.#...#.', '..###..'])
    // The Eclipse (phase 0.65) is the day's aria: a lit 3-pixel moon with a sparkle at each corner of the strip.
    expect(dailyAria(0).id).toBe('eclipse')
    expect(skyMoons(0).filter((m) => m.aria).map((m) => m.warden.id)).toEqual(['eclipse'])
    expect(glyphAt(rows, SKY_LEFT + 10 * SKY_PITCH)).toEqual(['#.....#', '..###..', '..###..', '..###..', '#.....#'])
    // The Watcher (period one day) is full at every midpoint; the Titan (0.47) is still dark.
    expect(glyphAt(rows, SKY_LEFT + 11 * SKY_PITCH)).toEqual(['.......', '..###..', '..###..', '..###..', '.......'])
    expect(glyphAt(rows, SKY_LEFT + 9 * SKY_PITCH)).toEqual(['.......', '..###..', '..#.#..', '..###..', '.......'])
  })

  it('on the first conjunction day fills every moon that is full together, and lights a face column by column between', () => {
    expect(FIRST_CONJUNCTION).toBe(9)
    expect(conjunction(9).map((w) => w.id)).toEqual(['blooming-horror', 'betrayer', 'titan'])
    const rows = skyRows(9)
    const moons = skyMoons(9)
    for (const moon of moons.filter((m) => m.phase.full)) {
      const reach = Math.floor(moon.size / 2)
      const box = glyphAt(rows, moon.centre, reach).slice(2 - reach, 3 + reach)
      // A full moon is solid but for the 5-pixel ring's empty corners.
      expect(box.map((row) => row.replace(/\./g, '')).join('').length).toBe(moon.size === 5 ? 21 : 9)
    }
    // The Wyrm at a fifth lights one column of its face on the waxing (right) side; Magnus past half lights two.
    expect(glyphAt(rows, SKY_LEFT + 2 * SKY_PITCH)).toEqual(['..###..', '.#..##.', '.#..##.', '.#..##.', '..###..'])
    expect(glyphAt(rows, SKY_LEFT + 3 * SKY_PITCH)).toEqual(['..###..', '.#.###.', '.#.###.', '.#.###.', '..###..'])
    // The aria (the Titan) wears the sparkles; the Maiden stays cracked.
    expect(moons.filter((m) => m.aria).map((m) => m.warden.id)).toEqual(['titan'])
    expect(glyphAt(rows, SKY_LEFT + 9 * SKY_PITCH)).toEqual(['#.....#', '..###..', '..###..', '..###..', '#.....#'])
    expect(glyphAt(rows, SKY_LEFT)).toEqual(['..###..', '.##..#.', '.#.#.#.', '.#..##.', '..###..'])
  })

  it('is always cracked for the Maiden, whatever its phase, and never gives it the sparkles', () => {
    for (let day = 0; day < 400; day += 7) {
      const maiden = skyMoons(day)[0]!
      expect(maiden.warden.id).toBe('chained-maiden')
      expect(maiden.aria).toBe(false)
      const plain = glyphAt(skyRows(day), SKY_LEFT)
      // The ring's face never reads as the plain phase glyph: at least one of the crack's cells differs from its neighbours' column fill.
      const face = plain.slice(1, 4).map((row) => row.slice(2, 5))
      const diagonal = [face[0]![0], face[1]![1], face[2]![2]]
      const beside = [face[1]![0], face[2]![1], face[0]![1]]
      expect(diagonal.join('')).not.toBe(beside.join(''))
    }
  })

  it('leaves every placement of every scene below the strip, and keeps every moon pixel in the composed stage', () => {
    const subjects: Subject[] = [{ kind: 'none' }]
    for (const id of Object.keys(monsterArt) as Array<keyof typeof monsterArt>) subjects.push({ kind: 'monster', id, elite: false }, { kind: 'monster', id, elite: true })
    for (const id of Object.keys(propArt) as Array<keyof typeof propArt>) subjects.push({ kind: 'prop', id })
    for (const heroClass of ['warrior', 'rogue'] as const) for (const gender of ['male', 'female'] as const) subjects.push({ kind: 'coworker', heroClass, gender }, { kind: 'coworker', heroClass, gender, prop: 'printer' })
    let highest = STAGE_HEIGHT
    for (const pose of Object.keys(heroPoses) as Array<keyof typeof heroPoses>) for (const subject of subjects) for (const occasion of [undefined, ...OCCASION_ARTS]) {
      for (const placement of scenePlacements(pose, subject, occasion)) {
        const firstInk = placement.sprite.rows.findIndex((row) => row.trim() !== '')
        highest = Math.min(highest, placement.top + firstInk)
      }
    }
    // The elite crown on the tallest foe inks row 6, its halo row 5, where it meets the strip's halo and never its ink.
    expect(highest).toBe(SKY_CLEARANCE)
    expect(SKY_CLEARANCE).toBe(SKY_ROWS + 1)
    for (const day of [0, FIRST_CONJUNCTION, -5]) {
      const sky = skyRows(day)
      for (const biome of ['office_cubicles', 'server_room', 'cafeteria_depths', 'archive', 'parking_garage'] as const) for (const pose of ['idle', 'fight', 'rogue_fight', 'sleep'] as const) {
        const stage = composeScene(biome, pose, { kind: 'monster', id: 'auditor', elite: true }, 'day', undefined, undefined, undefined, day)
        for (let y = 0; y < SKY_ROWS; y += 1) for (let x = 0; x < STAGE_WIDTH; x += 1) if (sky[y]![x] === '#') expect(stage.ink[y * STAGE_WIDTH + x]).toBe(1)
      }
    }
  })

  it('changes the stage only above the clearance row, and only on a path that carries a day', () => {
    const plain = composeScene('server_room', 'fight', { kind: 'monster', id: 'cable_serpent', elite: true }, 'day')
    const dated = composeScene('server_room', 'fight', { kind: 'monster', id: 'cable_serpent', elite: true }, 'day', undefined, undefined, undefined, 0)
    expect(dated.ink).not.toEqual(plain.ink)
    for (let y = SKY_CLEARANCE; y < STAGE_HEIGHT; y += 1) for (let x = 0; x < STAGE_WIDTH; x += 1) expect(dated.ink[y * STAGE_WIDTH + x]).toBe(plain.ink[y * STAGE_WIDTH + x])
    const look = 'v1.6103452'
    const undated = layeredScenePath('server_room', look, 'fight', { kind: 'monster', id: 'cable_serpent', elite: true }, 2)
    const withDay = layeredScenePath('server_room', look, 'fight', { kind: 'monster', id: 'cable_serpent', elite: true }, 2, 'day', undefined, 0)
    expect(renderScenePng(undated)).toEqual(renderScenePng(scenePath('server_room', 'fight', { kind: 'monster', id: 'cable_serpent', elite: true }, 2)))
    expect(renderScenePng(withDay)).not.toEqual(renderScenePng(undated))
    expect(renderScenePng(withDay.replace('day-0', 'day-9'))).not.toEqual(renderScenePng(withDay))
  })

  it('prints the lit faces yellow on the four-ink panel and keeps the rings black', () => {
    const look = 'v1.6103452'
    const path = layeredScenePath('archive', look, 'idle', { kind: 'none' }, 2, 'day', undefined, 9).replace('.png', '-bwry.png')
    const png = renderScenePng(path)!
    const view = new DataView(png.buffer, png.byteOffset)
    const [width, depth] = [view.getUint32(16), png[24]!]
    let idat = new Uint8Array(0)
    for (let at = 8; at < png.length; ) {
      const length = view.getUint32(at)
      if (String.fromCharCode(...png.slice(at + 4, at + 8)) === 'IDAT') idat = png.slice(at + 8, at + 8 + length)
      at += 12 + length
    }
    const raw = inflateSync(idat)
    const rowBytes = Math.ceil((width * depth) / 8)
    const pixel = (x: number, y: number) => (raw[y * (rowBytes + 1) + 1 + Math.floor((x * depth) / 8)]! >> (8 - depth - ((x * depth) % 8))) & ((1 << depth) - 1)
    const moons = skyMoons(9)
    expect(moons.some((m) => m.lit.length > 0)).toBe(true)
    for (const moon of moons) {
      for (const [x, y] of moon.lit) expect(pixel(x * 2, y * 2)).toBe(BwryInk.Yellow)
      for (const [x, y] of moon.ink) expect(pixel(x * 2 + 1, y * 2 + 1)).toBe(BwryInk.Black)
    }
  })

  it('paints the rings in dusk violet and the lit faces cream on the companion', () => {
    const grid = paintedScene('office_cubicles', 'idle', { kind: 'none' }, 'day', undefined, undefined, 9)
    const moons = skyMoons(9)
    const horror = moons[4]!
    expect(horror.phase.full).toBe(true)
    for (const [x, y] of horror.ink) expect(grid[y]![x]).toBe('#4a3f6b')
    for (const [x, y] of horror.lit) expect(grid[y]![x]).toBe('#ffe08f')
    expect(paintedScene('office_cubicles', 'idle', { kind: 'none' }, 'day')[2]![SKY_LEFT + 4 * SKY_PITCH]).not.toBe('#4a3f6b')
  })
})
