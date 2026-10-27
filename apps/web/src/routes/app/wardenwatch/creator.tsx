import { convexQuery } from '@convex-dev/react-query'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { api } from '@trmnl-games/backend/api'
import { DEFAULT_LOOK, encodeLook } from '@trmnl-games/wardenwatch/art/look'
import { seo } from '../../../lib/seo'
import { messagesFor, useT } from '../../../lib/i18n'
import { headMessages } from '../../../i18n/heads'
import { lookMessages } from '../../../i18n/look'
import { preload } from '../../../lib/preload'
import { useIntent } from '../../../lib/intent'
import { LookCreator } from '../../../lib/lookCreator'
import { Button, LoadingState, NoticeBar, useNotice } from '../../../lib/ui'
import { SectionTitle } from '../../../lib/glyphs'

/** GDD §3.7: the camp mirror. The current hero's look, changed free, any time; open to a hero still waiting for its Save. */
export const Route = createFileRoute('/app/wardenwatch/creator')({
  head: ({ match: { context: { locale } } }) => seo({ title: messagesFor(headMessages, locale).wwCreator, index: false, locale }),
  loader: ({ context }) => preload(context, convexQuery(api.heroes.mine, {})),
  component: CreatorPage,
})

type CreatorHero = { name: string; look?: string; class: 'warrior' | 'rogue'; gender?: 'male' | 'female'; biomeId: string; simulationState: string }

function CreatorPage() {
  const { data: hero } = useQuery(convexQuery(api.heroes.mine, {}))
  const t = useT(lookMessages)
  if (!hero) return <LoadingState label={t.loading} />
  return <Creator hero={hero as CreatorHero} />
}

function Creator({ hero }: { hero: CreatorHero }) {
  const t = useT(lookMessages)
  const saved = hero.look ?? encodeLook(DEFAULT_LOOK)
  const [look, setLook] = useState(saved)
  const { notice, notify, dismiss } = useNotice()
  // The look is a stored preference: the page shows it saved on the tap, and rolls back if the save fails.
  const save = useIntent(api.heroes.setLook, {
    onFeedback: notify,
    optimisticUpdate: (store, args) => {
      const current = store.getQuery(api.heroes.mine, {})
      if (current) store.setQuery(api.heroes.mine, {}, { ...current, look: args.look })
    },
  })
  const changed = look !== saved
  return (
    <div className="flex min-w-0 flex-col gap-6">
      <SectionTitle id="creator-title" glyph="hero" as="h1">{t.title}</SectionTitle>
      <p>{t.intro}</p>
      <LookCreator value={look} onChange={setLook} heroClass={hero.class} gender={hero.gender} biomeId={hero.biomeId} disabled={save.pending || hero.simulationState === 'quarantined'} />
      {/* The Save waits for a different look, so it never offers to save the one the hero has (D156). */}
      {changed ? <Button pending={save.pending} busyLabel={t.saving} className="self-start" onClick={() => void save.run({ look }, t.saved(hero.name))}>{t.save}</Button> : <p className="text-sm text-muted">{t.unchanged}</p>}
      <NoticeBar notice={notice} onDismiss={dismiss} />
    </div>
  )
}
