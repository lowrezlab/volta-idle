// @vitest-environment edge-runtime
import { convexTest } from 'convex-test'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { api, internal } from '@trmnl-games/backend/api'
import schema from '../../apps/backend/convex/schema'
import type { T } from './helpers'

const modules = import.meta.glob('../../apps/backend/convex/**/*.ts')

describe('game lifecycle status (D115)', () => {
  let t: T
  beforeEach(() => {
    vi.stubEnv('ADMIN_TOKEN_IDENTIFIERS', 'issuer|Admin')
    t = convexTest(schema, modules)
  })
  afterEach(() => vi.unstubAllEnvs())

  const player = () => t.withIdentity({ issuer: 'issuer', subject: 'Player' })
  const admin = () => t.withIdentity({ issuer: 'issuer', subject: 'Admin' })

  it('keeps a hidden game out of every non-admin listing, signed in or not', async () => {
    const expected = { admin: false, games: [{ slug: 'wardenwatch', status: 'live', canOpen: true }] }
    expect(await t.query(api.platform.list, {})).toEqual(expected)
    expect(await player().query(api.platform.list, {})).toEqual(expected)
  })

  it('lists a preview game for everyone but opens it only for admins', async () => {
    await admin().mutation(api.platform.setGameStatus, { slug: 'wardenwatch', status: 'preview', reasonCode: 'art_ready' })
    expect((await player().query(api.platform.list, {})).games).toContainEqual({ slug: 'wardenwatch', status: 'preview', canOpen: false })
    expect((await admin().query(api.platform.list, {})).games).toContainEqual({ slug: 'wardenwatch', status: 'preview', canOpen: true })
    await t.mutation(internal.platform.setGameStatusInternal, { slug: 'wardenwatch', status: 'live' })
    expect((await player().query(api.platform.list, {})).games).toContainEqual({ slug: 'wardenwatch', status: 'live', canOpen: true })
  })

  it('keeps a hidden game out of non-admin listings but open to admins', async () => {
    await t.mutation(internal.platform.setGameStatusInternal, { slug: 'wardenwatch', status: 'hidden' })
    expect(await player().query(api.platform.list, {})).toEqual({ admin: false, games: [] })
    expect(await admin().query(api.platform.list, {})).toEqual({ admin: true, games: [{ slug: 'wardenwatch', status: 'hidden', canOpen: true }] })
  })

  it('refuses the switch to non-admins and audits it for admins', async () => {
    await expect(player().mutation(api.platform.setGameStatus, { slug: 'wardenwatch', status: 'hidden', reasonCode: 'nope' })).rejects.toThrow()
    expect(await admin().mutation(api.platform.setGameStatus, { slug: 'wardenwatch', status: 'preview', reasonCode: 'art_ready' })).toEqual({ from: 'live', to: 'preview' })
    const events = await t.run(async (ctx) => await ctx.db.query('adminAuditEvents').collect())
    expect(events).toMatchObject([{ action: 'platform.setGameStatus', targetRef: 'wardenwatch', reasonCode: 'art_ready', outcome: 'live -> preview' }])
  })
})
