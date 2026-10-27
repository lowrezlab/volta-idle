import { DEFAULT_LOOK, decodeLook, encodeLook, isLookCode } from '@trmnl-games/wardenwatch/art/look'
import { appError } from './errors'

/**
 * The hero's look (GDD §3.6): a `v1.` code the creator writes and every scene URL carries. A hero made before the
 * creator has none and draws the default look, so nothing is backfilled.
 */
export const DEFAULT_LOOK_CODE = encodeLook(DEFAULT_LOOK)

/** The look code a hero's scenes are drawn with. */
export const heroLook = (hero: { readonly look?: string }): string => hero.look ?? DEFAULT_LOOK_CODE

/**
 * A client's look code, checked and normalised before it is stored: anything but a well-formed code is refused, and a
 * field outside its table reads as option 0, so the stored code always names real options.
 */
export function normalisedLook(code: string): string {
  if (!isLookCode(code)) throw appError('INVALID_INPUT', 'That look code is not valid.')
  return encodeLook(decodeLook(code))
}
