import { convexQuery } from '@convex-dev/react-query'
import { useQuery } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'
import { api } from '@trmnl-games/backend/api'
import { seo } from '../../lib/seo'
import { preload } from '../../lib/preload'
import { BUTTON_PRIMARY, LINK_BUTTON } from '../../lib/ui'
import { messagesFor, useT } from '../../lib/i18n'
import { libraryMessages } from '../../i18n/library'
import { shellMessages } from '../../i18n/shell'
import { commonMessages } from '../../i18n/common'
import { gamesQuery } from '../../lib/gameAccess'

export const Route = createFileRoute('/app/')({ head: ({ match: { context: { locale } } }) => seo({ title: messagesFor(libraryMessages, locale).title, index: false, locale }), loader: async ({ context }) => {
  await preload(context, convexQuery(api.users.me, {}), gamesQuery)
}, component: Library })

function Library() {
  const { data: me, isPending } = useQuery(convexQuery(api.users.me, {}))
  const t = useT(libraryMessages)
  const shell = useT(shellMessages)
  const common = useT(commonMessages)
  return (
    <main id="main" className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8">
      <h1 className="font-display text-3xl font-bold">{t.title}</h1>
      {isPending ? <p role="status">{t.loading}</p> : (
        <section className="window flex flex-col gap-4 p-5" aria-labelledby="library-dc">
          <div className="flex items-center gap-4">
            <img src="/games/wardenwatch/icon-192.png" alt="" width={64} height={64} className="h-16 w-16 [image-rendering:pixelated]" />
            <div>
              <h2 id="library-dc" className="font-display text-2xl font-bold text-gold-ink">Wardenwatch</h2>
              <p className="label-px text-muted">{common.voltaGame}</p>
              {me?.hero ? (
                <p className="mt-1 text-muted"><strong className="text-ink">{me.hero.name}</strong> <span className="label-px ml-1">{me.hero.activationState === 'active' ? (me.hero.waking ? shell.heroStatus.resuming : shell.heroStatus[me.hero.status] ?? shell.adventuring) : shell.waitingForSave}</span></p>
              ) : (
                <p className="mt-1 text-muted">{me?.gameState === 'deleting' ? t.removing : shell.games['wardenwatch']}</p>
              )}
            </div>
          </div>
          <Link to={me?.hero || me?.gameState === 'deleting' ? '/app/wardenwatch' : '/games/wardenwatch'} className={`self-start ${LINK_BUTTON} ${BUTTON_PRIMARY}`}>{me?.hero ? t.open('Wardenwatch') : t.about('Wardenwatch')}</Link>
        </section>
      )}
    </main>
  )
}
