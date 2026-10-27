import { INTL_TAG, PLATFORM_ORIGIN, PLATFORM_NAME, type Locale } from '@trmnl-games/platform'
import { messagesFor } from './i18n'
import { rootMessages } from '../i18n/root'

export const SITE_ORIGIN = PLATFORM_ORIGIN
export const SITE_NAME = PLATFORM_NAME
/** Bump when the social cards are re-rendered: Discord and other unfurlers cache images by URL. */
export const OG_VERSION = 3
/** Wardenwatch's own social card, for its public pages. */
export const WARDENWATCH_OG = { path: `/games/wardenwatch/og.png?v=${OG_VERSION}`, alt: 'Wardenwatch on a TRMNL X: a level 7 hero fighting a Moonbight Shadepup in the Moonbight Fjords, with the latest adventures, the day’s orders and weekly rankings' }
const SITE_DESCRIPTION = 'Games that play themselves on your TRMNL e-ink display: Wardenwatch, a frontier RPG, and Idle Angler, a fishing game.'

/** schema.org description of the site, for the home page's structured data. */
export const SITE_JSON_LD = { '@context': 'https://schema.org', '@type': 'WebSite', name: SITE_NAME, url: `${SITE_ORIGIN}/`, description: SITE_DESCRIPTION }

/** schema.org description of Wardenwatch, for its game page's structured data. */
export const WARDENWATCH_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: 'Wardenwatch',
  url: `${SITE_ORIGIN}/games/wardenwatch`,
  description: 'A frontier RPG that plays itself on your TRMNL e-ink display. Every fifteen minutes your hero fights, finds loot or gets knocked out, and the screen beside you shows what happened.',
  image: `${SITE_ORIGIN}${WARDENWATCH_OG.path}`,
  genre: ['Role-playing', 'Idle'],
  gamePlatform: 'TRMNL e-ink display',
  applicationCategory: 'Game',
  isAccessibleForFree: true,
  offers: { '@type': 'Offer', price: 0, priceCurrency: 'USD' },
  author: { '@type': 'Person', name: 'Barry Michael Doyle', url: 'https://barrymichaeldoyle.com' },
}

/**
 * Per-route head tags. Child meta with the same name/property replaces the
 * root defaults; private and handoff pages pass `index: false`.
 */
export function seo({ title, description, path, index = true, image, jsonLd, locale = 'en' }: { title?: string; description?: string; path?: string; index?: boolean; image?: { path: string; alt: string } | { url: string; alt: string; width: number; height: number }; jsonLd?: object; locale?: Locale }) {
  const site = messagesFor(rootMessages, locale)
  const fullTitle = title ? `${title} · ${SITE_NAME}` : site.siteTitle
  description ??= site.siteDescription
  return {
    meta: [
      { title: fullTitle },
      { name: 'description', content: description },
      { property: 'og:title', content: fullTitle },
      { property: 'og:description', content: description },
      { property: 'og:locale', content: INTL_TAG[locale].replace('-', '_') },
      ...(path ? [{ property: 'og:url', content: `${SITE_ORIGIN}${path}` }] : []),
      // A site image by path, or one served elsewhere (a hero's social card comes from the art route, D109) by absolute URL with its size.
      ...(image ? [{ property: 'og:image', content: 'url' in image ? image.url : `${SITE_ORIGIN}${image.path}` }, { property: 'og:image:alt', content: image.alt }, ...('url' in image ? [{ property: 'og:image:width', content: String(image.width) }, { property: 'og:image:height', content: String(image.height) }] : [])] : []),
      ...(index ? [] : [{ name: 'robots', content: 'noindex, nofollow' }]),
    ],
    links: path && index ? [{ rel: 'canonical', href: `${SITE_ORIGIN}${path}` }] : [],
    // `<` escaped so page text can never close the script element.
    scripts: jsonLd ? [{ type: 'application/ld+json', children: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }] : [],
  }
}
