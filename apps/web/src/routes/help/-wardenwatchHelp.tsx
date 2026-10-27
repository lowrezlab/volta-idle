import type { ComponentType } from 'react'
import type { Locale } from '@trmnl-games/platform'
import { HELP_FACTS as F } from './-wardenwatchFacts'
import { preloadContent } from '../../lib/content'

/** D169: one language's Wardenwatch help page: its head, title, section names and body. */
export interface HelpPage {
  readonly seoTitle: string
  readonly description: string
  readonly title: string
  readonly contents: Readonly<Record<SectionId, string>>
  readonly Body: ComponentType
}

type SectionId = (typeof SECTIONS)[number]

/** P5.2: the Volta section ids. The Hero page links `sky-calendar`; the rest are reached from the jump list. */
const SECTIONS = ['getting-started', 'if-the-qr-sends-you-back-to-setup', 'how-time-works', 'zones', 'seals', 'commissions', 'heroes-and-classes', 'stances', 'camp-raids', 'musters', 'strays', 'garrison-orders', 'draughts', 'the-serpentos-moneychanger', 'decisions', 'effects', 'sky-calendar', 'rare-and-epic-gear', 'when-your-pack-fills-up', 'bigger-packs', 'salvage-and-the-forge', 'getting-knocked-out', 'recaps', 'understanding-rankings', 'sharing-your-hero', 'following', 'names', 'looks', 'alerts', 'troubleshooting', 'disconnecting-and-removing', 'help'] as const

/** Sections the active catalog has no rule for are left out of the page and its jump list. */
const PRESENT: Partial<Record<SectionId, boolean>> = {
  commissions: F.career !== undefined,
  'heroes-and-classes': F.classes !== undefined,
  musters: F.meetings !== undefined,
  strays: F.lostProperty,
  'garrison-orders': F.todo !== undefined,
  'salvage-and-the-forge': F.workbench !== undefined,
}

/** The jump list at the top: on a phone the page runs to about twenty screens. */
export const contentsOf = (page: HelpPage): ReadonlyArray<readonly [string, string]> =>
  SECTIONS.filter((id) => PRESENT[id] !== false).map((id) => [id, page.contents[id]] as const)

/**
 * D215: one language's guide at a time. Each guide writes its game names out at module scope through the lazy content
 * translator, so its dictionary must be here before its module is evaluated: `loadWardenwatchHelp` awaits the one, then
 * imports the other. The route's loader calls it, and so does the client entry before hydration (lib/content), so the
 * server render and the first client render agree. The eight guides and seven dictionaries (380 KB gzipped) used to
 * come as one chunk for every reader.
 */
const GUIDES: Readonly<Record<Locale, () => Promise<HelpPage>>> = {
  en: () => import('./-wardenwatchHelp.en').then((m) => m.en),
  fr: () => import('./-wardenwatchHelp.fr').then((m) => m.fr),
  de: () => import('./-wardenwatchHelp.de').then((m) => m.de),
  es: () => import('./-wardenwatchHelp.es').then((m) => m.es),
  it: () => import('./-wardenwatchHelp.it').then((m) => m.it),
  pt: () => import('./-wardenwatchHelp.pt').then((m) => m.pt),
  pl: () => import('./-wardenwatchHelp.pl').then((m) => m.pl),
  nl: () => import('./-wardenwatchHelp.nl').then((m) => m.nl),
}
const guides = new Map<Locale, HelpPage>()

export async function loadWardenwatchHelp(locale: Locale): Promise<void> {
  if (guides.has(locale)) return
  await preloadContent(locale)
  guides.set(locale, await GUIDES[locale]())
}

/** The guide `loadWardenwatchHelp` fetched for the locale; undefined only if the loader did not run. */
export const wardenwatchHelp = (locale: Locale): HelpPage | undefined => guides.get(locale)
