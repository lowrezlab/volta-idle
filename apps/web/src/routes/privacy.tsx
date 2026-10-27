import { createFileRoute } from '@tanstack/react-router'
import type { Locale } from '@trmnl-games/platform'
import { PRIVACY_UPDATED, ProsePage } from '../lib/prose'
import { seo } from '../lib/seo'
import { formatDate, useLocale } from '../lib/i18n'
import type { LegalPage } from './-legal'
import { PRIVACY_HEAD } from './-legalHeads'
import { privacyEn } from './-privacy.en'
import { privacyFr } from './-privacy.fr'
import { privacyDe } from './-privacy.de'
import { privacyEs } from './-privacy.es'
import { privacyIt } from './-privacy.it'
import { privacyPt } from './-privacy.pt'
import { privacyPl } from './-privacy.pl'
import { privacyNl } from './-privacy.nl'

/** D169: the policy in each language; the English text prevails. */
const PAGES: Readonly<Record<Locale, LegalPage>> = { en: privacyEn, fr: privacyFr, de: privacyDe, es: privacyEs, it: privacyIt, pt: privacyPt, pl: privacyPl, nl: privacyNl }

export const Route = createFileRoute('/privacy')({
  head: ({ match: { context: { locale } } }) => seo({ title: PRIVACY_HEAD[locale].title, path: '/privacy', description: PRIVACY_HEAD[locale].description, locale }),
  component: Privacy,
})

function Privacy() {
  const locale = useLocale()
  const page = PAGES[locale]
  return (
    <ProsePage title={page.title} updated={formatDate(locale, Date.parse(`${PRIVACY_UPDATED}T12:00:00Z`), { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })}>
      {page.translationNote ? <page.translationNote /> : null}
      <page.Body />
    </ProsePage>
  )
}
