// @vitest-environment edge-runtime
import { convexTest } from 'convex-test'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { api, internal } from '@trmnl-games/backend/api'
import schema from '../../apps/backend/convex/schema'
import { seedHero, seedWorld, type T } from './helpers'

const modules = import.meta.glob('../../apps/backend/convex/**/*.ts')

describe('shared public profile (D115, S5)', () => {
  let t: T
  beforeEach(async () => {
    vi.useFakeTimers()
    vi.setSystemTime(Date.UTC(2026, 10, 2, 6, 5, 3))
    t = convexTest(schema, modules)
    await seedWorld(t)
  })
  afterEach(() => vi.useRealTimers())

  it('reads the same not-found for hidden and missing names', async () => {
    await seedHero(t, { publicProfile: false }, 'Quiet')
    expect(await t.query(api.platformProfile.view, { alias: 'Quiet' })).toBeNull()
    expect(await t.query(api.platformProfile.view, { alias: 'Nobody' })).toBeNull()
  })

  it('lists the opted-in hero', async () => {
    await seedHero(t, { publicProfile: true }, 'Solo')
    const profile = await t.query(api.platformProfile.view, { alias: 'solo' })
    expect(profile).toMatchObject({ alias: 'Solo', games: [{ slug: 'desk-crawler', name: 'Baz' }] })
  })

  it('shows the hero whatever Desk Crawler\'s listing status, as upstream', async () => {
    await t.mutation(internal.platform.setGameStatusInternal, { slug: 'desk-crawler', status: 'hidden' })
    await seedHero(t, { publicProfile: true }, 'Solo')
    expect(await t.query(api.platformProfile.view, { alias: 'Solo' })).not.toBeNull()
  })

  it('tallies platform rarity daily over players with an active game', async () => {
    await seedHero(t, { publicProfile: true }, 'Both')
    await seedHero(t, {}, 'Solo')
    await t.mutation(internal.platformProfile.tally, {})
    await t.finishAllScheduledFunctions(vi.runAllTimers)
    const current = await t.run(async (ctx) => await ctx.db.query('platformStats').collect())
    expect(current).toMatchObject([{ key: 'current', totalPlayers: 2 }])
  })
})
