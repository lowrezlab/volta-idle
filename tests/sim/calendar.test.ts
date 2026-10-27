import { describe, expect, it } from 'vitest'
import {
  AXES,
  CYCLES,
  DAY_MS,
  DAYS_PER_AXIS,
  DAYS_PER_CYCLE,
  DAYS_PER_YEAR,
  DEAD_MOON,
  EPOCH_YEAR,
  FULL_PHASE_HALF_WIDTH,
  GYRE_ANCHOR_WARDEN,
  GYRE_ANCHOR_YEAR,
  GYRE_ORDER,
  GYRE_YEARS,
  SKY_EXCLUDED,
  VOLTA_EPOCH_MS,
  conjunction,
  dailyAria,
  dayMidpoint,
  formatVoltaDate,
  gyreWarden,
  moonPhases,
  voltaDate,
  voltaDateOfDay,
  voltaDay,
} from '@trmnl-games/wardenwatch/sim/core/calendar'

const atDay = (day: number, offsetMs = 0): number => VOLTA_EPOCH_MS + day * DAY_MS + offsetMs

describe('volta calendar: golden dates', () => {
  it('pins the epoch to 2026-11-01T00:00:00Z and to Rime Ascendant 1, 1203', () => {
    expect(new Date(VOLTA_EPOCH_MS).toISOString()).toBe('2026-11-01T00:00:00.000Z')
    const date = voltaDate(VOLTA_EPOCH_MS)
    expect(date).toMatchObject({ day: 0, year: EPOCH_YEAR, dayOfYear: 0, cycle: 'Rime', cycleIndex: 0, axis: 'Ascendant', axisIndex: 0, dayOfAxis: 1 })
    expect(date.gyreWarden.id).toBe('eldritch-beast')
    expect(formatVoltaDate(date)).toBe('Rime Ascendant 1 · Gyre of the Eldritch Beast 1203')
  })

  it('keeps the same date through the day and turns at midnight UTC', () => {
    expect(voltaDate(atDay(0, DAY_MS - 1))).toMatchObject({ day: 0, dayOfAxis: 1 })
    expect(voltaDate(atDay(1))).toMatchObject({ day: 1, dayOfAxis: 2 })
    expect(voltaDay(atDay(3, 12 * 60 * 60 * 1000))).toBe(3)
  })

  it('ends the first axis on day 9 and opens Skybottom on day 10', () => {
    expect(voltaDate(atDay(DAYS_PER_AXIS - 1))).toMatchObject({ cycle: 'Rime', axis: 'Ascendant', dayOfAxis: 9 })
    expect(voltaDate(atDay(DAYS_PER_AXIS))).toMatchObject({ cycle: 'Rime', axis: 'Skybottom', axisIndex: 1, dayOfAxis: 1 })
    expect(formatVoltaDate(voltaDate(atDay(3)))).toBe('Rime Ascendant 4 · Gyre of the Eldritch Beast 1203')
  })

  it('rolls the cycle after Midheaven 9', () => {
    expect(voltaDate(atDay(DAYS_PER_CYCLE - 1))).toMatchObject({ cycle: 'Rime', axis: 'Midheaven', axisIndex: 3, dayOfAxis: 9 })
    expect(voltaDate(atDay(DAYS_PER_CYCLE))).toMatchObject({ cycle: 'Echo', cycleIndex: 1, axis: 'Ascendant', dayOfAxis: 1 })
    expect(voltaDate(atDay(9 * DAYS_PER_CYCLE))).toMatchObject({ cycle: 'Tanhaus', cycleIndex: 9 })
  })

  it('rolls the year after Tanhaus Midheaven 9 and moves the Gyre one Warden on', () => {
    const last = voltaDate(atDay(DAYS_PER_YEAR - 1))
    expect(last).toMatchObject({ year: 1203, dayOfYear: 359, cycle: 'Tanhaus', axis: 'Midheaven', dayOfAxis: 9 })
    expect(formatVoltaDate(last)).toBe('Tanhaus Midheaven 9 · Gyre of the Eldritch Beast 1203')
    const first = voltaDate(atDay(DAYS_PER_YEAR))
    expect(first).toMatchObject({ year: 1204, dayOfYear: 0, cycle: 'Rime', axis: 'Ascendant', dayOfAxis: 1 })
    expect(first.gyreWarden.id).toBe('titan')
  })

  it('computes dates before the epoch with floor division', () => {
    const eve = voltaDate(VOLTA_EPOCH_MS - 1)
    expect(eve).toMatchObject({ day: -1, year: 1202, dayOfYear: 359, cycle: 'Tanhaus', axis: 'Midheaven', dayOfAxis: 9 })
    expect(eve.gyreWarden.id).toBe('conjoined')
    expect(formatVoltaDate(eve)).toBe('Tanhaus Midheaven 9 · Gyre of the Conjoined 1202')
    expect(voltaDate(atDay(-DAYS_PER_YEAR))).toMatchObject({ day: -360, year: 1202, dayOfYear: 0, cycle: 'Rime', axis: 'Ascendant', dayOfAxis: 1 })
    expect(voltaDate(atDay(-DAYS_PER_YEAR - 1))).toMatchObject({ year: 1201, dayOfYear: 359 })
    expect(voltaDate(atDay(-DAYS_PER_AXIS))).toMatchObject({ cycle: 'Tanhaus', axis: 'Midheaven', dayOfAxis: 1 })
  })

  it('anchors the Gyre so that 2525 is the year of the Eclipse', () => {
    expect(GYRE_ANCHOR_YEAR).toBe(2525)
    expect(gyreWarden(2525).id).toBe(GYRE_ANCHOR_WARDEN)
    expect(gyreWarden(2525).id).toBe('eclipse')
    expect(voltaDateOfDay((2525 - EPOCH_YEAR) * DAYS_PER_YEAR).gyreWarden.id).toBe('eclipse')
    expect(gyreWarden(2526).id).toBe('watcher')
    expect(gyreWarden(2527).id).toBe('chained-maiden')
    expect(gyreWarden(2525 - GYRE_YEARS).id).toBe('eclipse')
    expect(gyreWarden(1203).id).toBe('eldritch-beast')
    expect(formatVoltaDate(voltaDateOfDay((2525 - EPOCH_YEAR) * DAYS_PER_YEAR + 2 * DAYS_PER_CYCLE + 9 + 3))).toBe('Gloam Skybottom 4 · Gyre of the Eclipse 2525')
  })

  it('reads "Gyre of Magnus" without an article', () => {
    const year = Array.from({ length: GYRE_YEARS }, (_, i) => EPOCH_YEAR + i).find((y) => gyreWarden(y).id === 'magnus')!
    expect(formatVoltaDate(voltaDateOfDay((year - EPOCH_YEAR) * DAYS_PER_YEAR))).toBe(`Rime Ascendant 1 · Gyre of Magnus ${year}`)
  })
})

describe('volta calendar: properties', () => {
  it('covers each cycle 36 times and each axis 90 times over 360 consecutive days, from any start', () => {
    for (const start of [0, 17, -500, 12345]) {
      const cycles = new Map<string, number>()
      const axes = new Map<string, number>()
      const years = new Set<number>()
      for (let day = start; day < start + DAYS_PER_YEAR; day += 1) {
        const date = voltaDateOfDay(day)
        cycles.set(date.cycle, (cycles.get(date.cycle) ?? 0) + 1)
        axes.set(date.axis, (axes.get(date.axis) ?? 0) + 1)
        years.add(date.year)
        expect(date.dayOfAxis).toBeGreaterThanOrEqual(1)
        expect(date.dayOfAxis).toBeLessThanOrEqual(DAYS_PER_AXIS)
        expect(date.dayOfYear).toBe(date.cycleIndex * DAYS_PER_CYCLE + date.axisIndex * DAYS_PER_AXIS + date.dayOfAxis - 1)
      }
      expect([...cycles.keys()].sort()).toEqual([...CYCLES].sort())
      expect([...cycles.values()]).toEqual(Array(CYCLES.length).fill(DAYS_PER_CYCLE))
      expect([...axes.keys()].sort()).toEqual([...AXES].sort())
      expect([...axes.values()]).toEqual(Array(AXES.length).fill(DAYS_PER_YEAR / AXES.length))
      expect(years.size).toBeLessThanOrEqual(2)
    }
  })

  it('walks the Gyre in order, one Warden a year, and comes round every 12 years', () => {
    for (let year = 1100; year < 2600; year += 1) {
      const here = GYRE_ORDER.indexOf(gyreWarden(year))
      expect(GYRE_ORDER.indexOf(gyreWarden(year + 1))).toBe((here + 1) % GYRE_YEARS)
      expect(gyreWarden(year + GYRE_YEARS)).toBe(gyreWarden(year))
    }
  })

  it('keeps every phase in [0, 1) and never calls the Maiden full', () => {
    let fullSeen = 0
    for (let day = -400; day <= 800; day += 1) {
      for (const offset of [0, 0.5, 0.999]) {
        for (const moon of moonPhases(atDay(day, offset * DAY_MS))) {
          expect(moon.phase).toBeGreaterThanOrEqual(0)
          expect(moon.phase).toBeLessThan(1)
          expect(moon.fullness).toBeGreaterThanOrEqual(0)
          expect(moon.fullness).toBeLessThanOrEqual(1)
          if (moon.warden.id === DEAD_MOON) expect(moon.full).toBe(false)
          else expect(moon.full).toBe(Math.abs(moon.phase - 0.5) <= FULL_PHASE_HALF_WIDTH)
          if (moon.full) fullSeen += 1
        }
      }
    }
    expect(fullSeen).toBeGreaterThan(0)
  })

  it('starts every moon new at the epoch and lists them in Gyre order', () => {
    const phases = moonPhases(VOLTA_EPOCH_MS)
    expect(phases.map((m) => m.warden.id)).toEqual(GYRE_ORDER.map((w) => w.id))
    for (const moon of phases) expect(moon.phase).toBe(0)
    // Half a Watcher orbit later Myrkos is full; the Maiden has barely moved.
    const noon = moonPhases(dayMidpoint(0))
    expect(noon.find((m) => m.warden.id === 'watcher')!.phase).toBeCloseTo(0.5, 12)
    expect(noon.find((m) => m.warden.id === DEAD_MOON)!.phase).toBeCloseTo(0.5 / 361.03, 12)
  })

  it('gives each day one aria from the sky moons, never the Maiden or the Watcher', () => {
    const seen = new Set<string>()
    for (let day = -200; day < 1000; day += 1) {
      const aria = dailyAria(day)
      expect(SKY_EXCLUDED.has(aria.id)).toBe(false)
      seen.add(aria.id)
      // Fullest among the sky moons, with Gyre order breaking ties.
      const sky = moonPhases(dayMidpoint(day)).filter((m) => !SKY_EXCLUDED.has(m.warden.id))
      const best = Math.max(...sky.map((m) => m.fullness))
      expect(sky.find((m) => m.fullness === best)!.warden.id).toBe(aria.id)
    }
    expect(seen.size).toBeGreaterThan(5)
  })

  it('names a conjunction only when two or more sky moons are full together', () => {
    let conjunctions = 0
    for (let day = -200; day < 1000; day += 1) {
      const together = conjunction(day)
      const full = moonPhases(dayMidpoint(day)).filter((m) => m.full && !SKY_EXCLUDED.has(m.warden.id)).map((m) => m.warden)
      expect(together).toEqual(full.length >= 2 ? full : [])
      if (together.length > 0) {
        conjunctions += 1
        expect(together.length).toBeGreaterThanOrEqual(2)
        expect(together.map((w) => GYRE_ORDER.indexOf(w))).toEqual([...together.map((w) => GYRE_ORDER.indexOf(w))].sort((a, b) => a - b))
        for (const warden of together) expect(SKY_EXCLUDED.has(warden.id)).toBe(false)
      }
    }
    expect(conjunctions).toBeGreaterThan(0)
  })

  it('is deterministic: the same instant always gives the same sky', () => {
    for (const at of [VOLTA_EPOCH_MS, atDay(-77, 1234), atDay(10_000, 55_555), Date.UTC(2525, 0, 1)]) {
      expect(voltaDate(at)).toEqual(voltaDate(at))
      expect(moonPhases(at)).toEqual(moonPhases(at))
      const day = voltaDay(at)
      expect(dailyAria(day)).toBe(dailyAria(day))
      expect(conjunction(day)).toEqual(conjunction(day))
    }
  })
})
