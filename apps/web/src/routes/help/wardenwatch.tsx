import { createFileRoute } from '@tanstack/react-router'
import { ProsePage } from '../../lib/prose'
import { WARDENWATCH_OG, seo } from '../../lib/seo'
import { useLocale } from '../../lib/i18n'
import { contentsOf, wardenwatchHelp } from './-wardenwatchHelp'
import { WARDENWATCH_HELP_HEAD } from './-helpHeads'

/** D169: the guide is written out in each language; the catalog's numbers come from -wardenwatchFacts. D215: one language loads. */
export const Route = createFileRoute('/help/wardenwatch')({
  head: ({ match: { context: { locale } } }) => seo({ title: WARDENWATCH_HELP_HEAD[locale].seoTitle, path: '/help/wardenwatch', description: WARDENWATCH_HELP_HEAD[locale].description, image: WARDENWATCH_OG, locale }),
  // Imported on demand: the loader ships in the main bundle, and the guide loader carries the section list and facts (D212).
  loader: ({ context }) => import('./-wardenwatchHelp').then((m) => m.loadWardenwatchHelp(context.locale)),
  component: HelpRoute,
})

function HelpRoute() {
  const page = wardenwatchHelp(useLocale())
  if (!page) return null
  return (
    <ProsePage title={page.title} contents={contentsOf(page)}>
      <page.Body />
    </ProsePage>
  )
}
