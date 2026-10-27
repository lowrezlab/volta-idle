import { DAY_START_HOUR, NIGHT_START_HOUR } from '../lib/activityRecap'
import { formatVoltaDate, voltaDate, voltaDay, type AxisName, type VoltaDate } from '../sim/core/calendar'

/** Bump whenever scene art changes: each image URL is immutable. */
export const SCENE_VERSION = 5
/** The layered hero's scenes (GDD §3.6): v5 paths with a look code, served alongside v5 until the reskin retires it. */
export const LAYERED_SCENE_VERSION = 6
export type SceneTime = 'day' | 'night'

/**
 * Cosmetic clock only, on the recap's day/night hours (D84). Offset is seconds east of UTC; a missing or invalid offset
 * reads UTC, as `recapPeriod` does, so the sky and the recap still turn together (D106).
 */
export function sceneTimeAt(now: number, utcOffset: number | null): SceneTime {
  if (!Number.isFinite(now)) return 'day'
  const offset = utcOffset !== null && Number.isInteger(utcOffset) && Math.abs(utcOffset) <= 14 * 3600 ? utcOffset : 0
  const hour = new Date(now + offset * 1000).getUTCHours()
  return hour >= DAY_START_HOUR && hour < NIGHT_START_HOUR ? 'day' : 'night'
}

/**
 * The sky strip's day in a v6 time segment (P4.2): `day-123` is Volta day 123, `day-n5` the fifth day before the
 * epoch (a URL segment cannot carry a minus sign cleanly). The sky changes with the day, so the day is part of the
 * immutable path; a v6 segment without a day draws no strip, as the v6 URLs before the strip did.
 */
export const skyDayToken = (day: number): string => (day < 0 ? `n${-day}` : `${day}`)
export const parseSkyDayToken = (token: string): number => (token.startsWith('n') ? -Number(token.slice(1)) : Number(token))

/**
 * Select the sky without changing the encounter, scale or asset origin. Older URLs stay intact. On a v6 URL `skyDay`
 * sets the strip's day; without it the segment keeps the day it carried, if any. A v5 URL never carries a day.
 */
export function sceneUrlAt(url: string, time: SceneTime, skyDay?: number): string {
  return url.replace(new RegExp(`(/art/scene/v(${SCENE_VERSION}|${LAYERED_SCENE_VERSION})/[a-z_]+/)(day|night)(?:-(n?\\d+))?(/)`), (_match, prefix: string, version: string, _time: string, token: string | undefined, slash: string) => {
    const layered = Number(version) === LAYERED_SCENE_VERSION
    const day = !layered ? '' : skyDay !== undefined ? `-${skyDayToken(skyDay)}` : token === undefined ? '' : `-${token}`
    return `${prefix}${time}${day}${slash}`
  })
}

interface SceneUrls {
  readonly scene_url: string
  readonly scene_url_small: string
  readonly scene_url_large: string
  readonly scene_url_medium: string
}

/** The Volta date line (GDD §6.3, P4.1) as the screen's merge variables: the full line and the short one for narrow bars. */
export interface VoltaDateLine {
  /** "Rime Ascendant 1 · Gyre of the Eldritch Beast 1203". */
  readonly volta_date: string
  /** "Rime Asc. 1 · 1203". */
  readonly volta_date_short: string
}

const AXIS_SHORT: Record<AxisName, string> = { Ascendant: 'Asc.', Skybottom: 'Sky.', Descendant: 'Desc.', Midheaven: 'Mid.' }

/** "Rime Asc. 1 · 1203": the cycle, the axis cut to three or four letters, the day and the year, for the half and quarter bars. */
export const shortVoltaDate = (date: VoltaDate): string => `${date.cycle} ${AXIS_SHORT[date.axis]} ${date.dayOfAxis} · ${date.year}`

/**
 * The date line at the render instant. The Volta calendar reads UTC (calendar.ts): the sky is one world's, so it
 * turns at the same moment for every owner, unlike the office window's local day and night.
 */
export function voltaDateLine(now: number): VoltaDateLine {
  const date = voltaDate(Number.isFinite(now) ? now : 0)
  return { volta_date: formatVoltaDate(date), volta_date_short: shortVoltaDate(date) }
}

/**
 * What the render instant sets on the screen: the office window's local time on every scene URL, the sky strip's
 * Volta day on the v6 ones, and the date line.
 */
export function sceneUrlsAt<T extends SceneUrls>(payload: T, now: number, utcOffset: number | null): T & VoltaDateLine {
  const time = sceneTimeAt(now, utcOffset)
  const skyDay = Number.isFinite(now) ? voltaDay(now) : undefined
  return {
    ...payload,
    scene_url: sceneUrlAt(payload.scene_url, time, skyDay),
    scene_url_small: sceneUrlAt(payload.scene_url_small, time, skyDay),
    scene_url_large: sceneUrlAt(payload.scene_url_large, time, skyDay),
    scene_url_medium: sceneUrlAt(payload.scene_url_medium, time, skyDay),
    ...voltaDateLine(now),
  }
}
