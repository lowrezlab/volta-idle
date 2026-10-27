/**
 * The pictures the public pages still borrow from the fork: the sample screen and the zone scenes are rendered from
 * Desk Crawler's catalog until the device content (ACTIVE_CONTENT v28) is re-rendered by tools/landing and
 * tools/trmnl/preview. This file is allowlisted in tools/lint/reserved-names.ts so the paths live in one place; the
 * files themselves are listed there too. Both come off the allowlist with the re-render.
 */
export const SCREEN_SAMPLE = {
  wardenwatch: { src: '/games/wardenwatch/screen-sample.png', srcSet: '/games/wardenwatch/screen-sample-800.png 800w, /games/wardenwatch/screen-sample.png 1200w' },
} as const

/** A zone's painted fight scene, keyed by the zone id the generated facts carry. */
export const zoneSceneSrc = (id: string) => `/games/wardenwatch/floors/${id}.png`
