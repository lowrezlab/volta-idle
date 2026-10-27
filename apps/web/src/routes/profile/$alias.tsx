import { convexQuery } from '@convex-dev/react-query'
import { useQuery } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'
import { api } from '@trmnl-games/backend/api'
import { games } from '@trmnl-games/platform'
import { SiteShell } from '../../lib/prose'
import { seo } from '../../lib/seo'
import { Card } from '../../lib/ui'
import { formatDate, messagesFor, useLocale, useT } from '../../lib/i18n'
import { headMessages } from '../../i18n/heads'
import { publicPagesMessages } from '../../i18n/publicPages'
import { preloadContent } from '../../lib/content'

type Game = { slug: 'wardenwatch'; name: string; level: number; since: number; rank: { rank: number; totalPlayers: number } | null; achievements: number; page: string | null }
type Profile = { alias: string; games: Game[]; platform: Array<{ id: string; name: string; blurb: string; share: number | null }> } | null

const profileQuery = (alias: string) => convexQuery(api.platformProfile.view, { alias })

/** The shared public profile (D115): each game the player chose to show, and achievements across games. */
export const Route = createFileRoute('/profile/$alias')({
  loader: async ({ context, params }) => (await Promise.all([context.queryClient.ensureQueryData(profileQuery(params.alias)), preloadContent(context.locale)]))[0] as Profile,
  head: ({ loaderData, params, match: { context: { locale } } }) => {
    const t = messagesFor(headMessages, locale)
    return loaderData
      ? seo({ title: t.profileTitle(loaderData.alias), path: `/profile/${encodeURIComponent(loaderData.alias)}`, description: t.profileDescription(loaderData.alias, loaderData.games.map((g) => games[g.slug].name)), locale })
      : seo({ title: t.playerNotFound, path: `/profile/${encodeURIComponent(params.alias)}`, index: false, locale })
  },
  component: ProfilePage,
})


function ProfilePage() {
  const { alias } = Route.useParams()
  const { data } = useQuery(profileQuery(alias))
  const profile = data as Profile | undefined
  const t = useT(publicPagesMessages)
  const locale = useLocale()
  const since = (at: number) => formatDate(locale, at, { year: 'numeric', month: 'long', day: 'numeric' })
  return (
    <SiteShell>
      <main id="main" className="mx-auto w-full flex max-w-2xl flex-col gap-6 px-4 py-10">
        {profile === undefined ? null : profile === null ? (
          <>
            <h1 className="font-display text-3xl font-bold">{t.noProfile}</h1>
            <p>{t.noProfileBody}</p>
          </>
        ) : (
          <>
            <h1 className="font-display text-4xl font-bold">{profile.alias}</h1>
            {profile.games.map((game) => (
              <Card key={game.slug} title={games[game.slug].name}>
                <p className="text-lg">{t.heroLevel(game.name, game.level)}</p>
                <p className="text-sm text-muted">
                  {t.playingSince(since(game.since))}
                  {game.rank ? t.rankAllTime(game.rank.rank, game.rank.totalPlayers) : ''}{t.achievementCount(game.achievements)}
                </p>
                {game.page ? <Link to={game.page} className="mt-2 inline-flex min-h-11 items-center underline underline-offset-4">{t.heroPage}</Link> : null}
              </Card>
            ))}
            {profile.platform.length > 0 ? (
              <Card title={t.acrossGames}>
                <ul className="flex flex-col gap-2">
                  {profile.platform.map((a) => (
                    <li key={a.id}><strong>{(t.platform as Record<string, { name: string; blurb: string }>)[a.id]?.name ?? a.name}</strong> <span className="text-sm text-muted">· {(t.platform as Record<string, { name: string; blurb: string }>)[a.id]?.blurb ?? a.blurb}{a.share !== null ? t.ofPlayers(a.share) : ''}</span></li>
                  ))}
                </ul>
              </Card>
            ) : null}
          </>
        )}
      </main>
    </SiteShell>
  )
}
