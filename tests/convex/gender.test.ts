// @vitest-environment edge-runtime
import { convexTest } from 'convex-test'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { api } from '@trmnl-games/backend/api'
import schema from '../../apps/backend/convex/schema'
import { seedHero, seedWorld, type T } from './helpers'

const modules = import.meta.glob('../../apps/backend/convex/**/*.ts')
const SLOT = Date.UTC(2026, 9, 13, 10, 0, 2)
const as = (t: T, alias: string) => t.withIdentity({ issuer: 'issuer', subject: alias })

describe('hero gender (D149): a stored look still draws, though it is no longer a choice', () => {
  let t: T
  beforeEach(async () => {
    vi.useFakeTimers()
    vi.setSystemTime(SLOT)
    t = convexTest(schema, modules)
    await seedWorld(t, { activeContentVersion: 'v1', lastPublishedAt: SLOT - 30 * 60_000 })
  })
  afterEach(() => vi.useRealTimers())

  it('shows the hero in its look on the public page, on its own page and on the roster', async () => {
    await seedHero(t, { gender: 'female' }, 'Bo')
    expect((await t.query(api.profiles.view, { alias: 'Bo' }))!.scenePath).toContain('/female_idle/')
    const bo = as(t, 'Bo')
    expect((await bo.query(api.heroes.mine, {}))!.scenePath).toContain('/female_idle/')
    // The whole-sprite look stays on the v6 URL's pose, beside the creator's look code.
    expect((await bo.query(api.heroes.mine, {}))!.scenePath).toMatch(/\/v6\/office_cubicles\/day\/plain\/v1\.0000000\/female_idle\//)
  })

  it('draws the other hero of a meeting in its current look', async () => {
    const heroId = await seedHero(t, {}, 'Cy')
    const rivalId = await seedHero(t, { class: 'rogue', gender: 'female', name: 'Vex' }, 'Di')
    await t.run(async (ctx) => {
      await ctx.db.insert('tickLogs', {
        heroId,
        source: 'tick',
        sequence: 2,
        at: SLOT - 1000,
        kind: 'meeting',
        summary: '[[Vex]] gave you a pep talk at the whiteboard.',
        detail: { v: 1, simulationVersion: 1, contentVersion: 'v20', disposition: 'advanced', potionsUsed: 0, levelsGained: 0, goldPenalty: 0, heldFind: false, outcome: { variant: 'meeting', role: 'starter', rivalHeroId: rivalId, rivalName: 'Vex', rivalClass: 'rogue', kindId: 'pep_talk', meetingTick: 1 } },
        deltas: { xpEarned: 0, gold: 0, hp: 0 },
      })
    })
    const cy = as(t, 'Cy')
    expect((await cy.query(api.heroes.mine, {}))!.scenePath).toContain('/idle/coworker-female_rogue-whiteboard/')
    await t.run(async (ctx) => await ctx.db.patch(rivalId, { gender: undefined }))
    expect((await cy.query(api.heroes.mine, {}))!.scenePath).toContain('/idle/coworker-rogue-whiteboard/')
  })
})
