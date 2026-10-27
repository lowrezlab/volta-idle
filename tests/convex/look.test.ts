// @vitest-environment edge-runtime
import { convexTest } from 'convex-test'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { api, internal } from '@trmnl-games/backend/api'
import { sha256Hex } from '../../apps/backend/convex/lib/hash'
import schema from '../../apps/backend/convex/schema'
import { DEFAULT_LOOK, encodeLook } from '@trmnl-games/wardenwatch/art/look'
import { seedHero, seedWorld, type T } from './helpers'

const modules = import.meta.glob('../../apps/backend/convex/**/*.ts')
const SLOT = Date.UTC(2026, 10, 2, 10, 0, 2)
let op = 0
const opId = () => `look-${String(++op).padStart(6, '0')}`
const as = (t: T, alias: string) => t.withIdentity({ issuer: 'issuer', subject: alias })
const DEFAULT_CODE = encodeLook(DEFAULT_LOOK)

async function errorCode(promise: Promise<unknown>): Promise<string | undefined> {
  try {
    const result = await promise
    if (typeof result === 'object' && result !== null && 'ok' in result && (result as { ok: unknown }).ok === false && 'code' in result) return String((result as { code: unknown }).code)
    return undefined
  } catch (error) {
    return (error as { data?: { code?: string } }).data?.code
  }
}

const heroNamed = (t: T, name: string) => t.run(async (ctx) => await ctx.db.query('heroes').filter((q) => q.eq(q.field('name'), name)).unique())
const openRoster = (t: T) => t.run(async (ctx) => { const world = (await ctx.db.query('worldState').first())!; await ctx.db.patch(world._id, { activeContentVersion: 'v18' }) })

describe('the hero look (GDD §3.6)', () => {
  let t: T
  beforeEach(async () => {
    vi.useFakeTimers()
    vi.setSystemTime(SLOT)
    t = convexTest(schema, modules)
    await seedWorld(t, { activeContentVersion: 'v1', lastPublishedAt: SLOT - 30 * 60_000 })
  })
  afterEach(() => vi.useRealTimers())

  it('draws a hero without a look in the default look, on a v6 scene URL', async () => {
    await seedHero(t, {}, 'Ana')
    const ana = as(t, 'Ana')
    const mine = (await ana.query(api.heroes.mine, {}))!
    expect(DEFAULT_CODE).toBe('v1.0000000')
    expect(mine.look).toBe(DEFAULT_CODE)
    expect(mine.scenePath).toBe('/art/scene/v6/office_cubicles/day/plain/v1.0000000/idle/none/5.png')
    expect((await t.query(api.profiles.view, { alias: 'Ana' }))!.scenePath).toContain('/plain/v1.0000000/idle/')
  })

  it('saves a look through the creator, normalised, and every scene follows it', async () => {
    const heroId = await seedHero(t, { gold: 50 }, 'Bo')
    const bo = as(t, 'Bo')
    expect(await bo.mutation(api.heroes.setLook, { operationId: opId(), look: 'v1.6103452' })).toMatchObject({ changed: true })
    expect((await t.run(async (ctx) => await ctx.db.get(heroId)))!.look).toBe('v1.6103452')
    expect((await bo.query(api.heroes.mine, {}))!.scenePath).toContain('/plain/v1.6103452/idle/')
    expect((await bo.query(api.heroes.mine, {}))!.look).toBe('v1.6103452')
    expect((await t.query(api.profiles.view, { alias: 'Bo' }))!.scenePath).toContain('/plain/v1.6103452/idle/')
    expect((await bo.query(api.roster.mine, { now: SLOT }))!.heroes[0]!.scenePath).toContain('/plain/v1.6103452/idle/')
    // Saving the same look again changes nothing; a field outside its table is stored as option 0.
    expect(await bo.mutation(api.heroes.setLook, { operationId: opId(), look: 'v1.6103452' })).toMatchObject({ changed: false })
    expect(await bo.mutation(api.heroes.setLook, { operationId: opId(), look: 'v1.6z0345z' })).toMatchObject({ changed: true })
    const after = (await t.run(async (ctx) => await ctx.db.get(heroId)))!
    expect(after.look).toBe('v1.6003450')
    // Only the look changed, and the change is free: no gold moved and no log line was written.
    expect(after).toMatchObject({ name: 'Baz', level: 1, gold: 50 })
    expect(await t.run(async (ctx) => await ctx.db.query('tickLogs').withIndex('by_heroId_and_at_and_sequence', (q) => q.eq('heroId', heroId)).collect())).toEqual([])
  })

  it('refuses anything but a well-formed look code, and never stores it', async () => {
    const heroId = await seedHero(t, {}, 'Cy')
    const cy = as(t, 'Cy')
    for (const bad of ['', 'v1.', 'v1.610345', 'v1.61034522', 'v2.6103452', 'V1.6103452', 'v1.6103452 ', '6103452', 'v1.610345!']) {
      expect(await errorCode(cy.mutation(api.heroes.setLook, { operationId: opId(), look: bad })), bad).toBe('INVALID_INPUT')
    }
    expect((await t.run(async (ctx) => await ctx.db.get(heroId)))!.look).toBeUndefined()
  })

  it('is open to a hero still waiting for its TRMNL save, so a new player can pass through the creator first', async () => {
    const heroId = await seedHero(t, { activationState: 'pending_trmnl', activatedAt: undefined }, 'Di')
    const di = as(t, 'Di')
    expect(await di.mutation(api.heroes.setLook, { operationId: opId(), look: 'v1.3a1452k' })).toMatchObject({ changed: true })
    // A build, head or tabard past its table reads as option 0 (GDD §3.6).
    expect((await t.run(async (ctx) => await ctx.db.get(heroId)))!.look).toBe('v1.3004520')
  })

  it('needs an identity and an account', async () => {
    expect(await errorCode(t.mutation(api.heroes.setLook, { operationId: opId(), look: DEFAULT_CODE }))).toBe('UNAUTHENTICATED')
    expect(await errorCode(as(t, 'Nobody').mutation(api.heroes.setLook, { operationId: opId(), look: DEFAULT_CODE }))).toBe('ACCOUNT_UNAVAILABLE')
  })

  it('creates the first hero in the look chosen on the setup form, and without one when none is given', async () => {
    const link = (alias: string, heroLook?: string) => t.mutation(internal.trmnl.linkInstall, { tokenIdentifier: `issuer|${alias}`, tokenHash: sha256Hex(`tok-${alias}`), publicAlias: alias, heroName: 'Steve', ...(heroLook === undefined ? {} : { heroLook }), timezone: 'UTC' })
    await link('Fi', 'v1.6103452')
    await link('Gus')
    await link('Hal', 'v1.zzzzzzz')
    const heroes = await t.run(async (ctx) => await ctx.db.query('heroes').collect())
    expect(heroes.map((hero) => hero.look)).toEqual(['v1.6103452', undefined, 'v1.0000000'])
    // Gender is no longer a choice on the setup form.
    expect(heroes.map((hero) => hero.gender)).toEqual([undefined, undefined, undefined])
    await expect(link('Ivy', 'not-a-look')).rejects.toThrow()
    expect(await t.run(async (ctx) => await ctx.db.query('users').filter((q) => q.eq(q.field('publicAlias'), 'Ivy')).unique())).toBeNull()
  })

  it('recruits a roster hero in the look chosen on its form', { timeout: 30_000 }, async () => {
    await openRoster(t)
    await seedHero(t, { level: 6 }, 'Ed')
    const ed = as(t, 'Ed')
    expect(await errorCode(ed.mutation(api.roster.recruit, { operationId: opId(), heroClass: 'rogue', name: 'Vex', look: 'nope' }))).toBe('INVALID_INPUT')
    expect(await heroNamed(t, 'Vex')).toBeNull()
    await ed.mutation(api.roster.recruit, { operationId: opId(), heroClass: 'rogue', name: 'Vex', look: 'v1.7201000' })
    expect(await heroNamed(t, 'Vex')).toMatchObject({ class: 'rogue', look: 'v1.7201000', isActive: true })
    expect((await ed.query(api.heroes.mine, {}))!.scenePath).toContain('/plain/v1.7201000/rogue_idle/')
  })

  it('names the classes Knight and Assassin in its refusals', { timeout: 30_000 }, async () => {
    await openRoster(t)
    await seedHero(t, { level: 1 }, 'Jo')
    const jo = as(t, 'Jo')
    const locked = await jo.mutation(api.roster.recruit, { operationId: opId(), heroClass: 'rogue', name: 'Vex' })
    expect(locked).toMatchObject({ ok: false, code: 'LOCKED' })
    expect((locked as { message: string }).message).toMatch(/your Knight reaches level/)
    await t.run(async (ctx) => { const hero = (await ctx.db.query('heroes').first())!; await ctx.db.patch(hero._id, { level: 6 }) })
    expect(await jo.mutation(api.roster.recruit, { operationId: opId(), heroClass: 'warrior', name: 'Vex' })).toMatchObject({ ok: false, code: 'INVALID_STATE', message: 'You already have a Knight.' })
  })
})
