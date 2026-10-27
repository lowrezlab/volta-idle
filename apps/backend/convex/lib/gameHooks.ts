import type { GameSlug } from '@trmnl-games/platform'
import type { Doc, Id } from '../_generated/dataModel'
import type { MutationCtx, QueryCtx } from '../_generated/server'
import { currentHero, gameProfile } from './gameProfile'

/**
 * Per-game hooks for the shared TRMNL lifecycle (trmnl.ts): which profile can be deleting, the player
 * character an installation activates, and how one is prepared and activated. D115 generalized the
 * lifecycle from Wardenwatch's.
 */
export interface GameHooks {
  readonly slug: GameSlug
  readonly label: string
  deleting(ctx: QueryCtx, userId: Id<'users'>): Promise<boolean>
  current(ctx: QueryCtx, user: Doc<'users'> | null): Promise<{ _id: string; activationState: 'pending_trmnl' | 'active' } | null>
  /** Whether preparing needs a character name (Wardenwatch's hero name). */
  readonly needsName: boolean
  activate(ctx: MutationCtx, userId: Id<'users'>, now: number): Promise<void>
}

/** Only omitted pre-migration credentials inherit the original game's scope. */
export function isGame(row: { gameSlug?: string }, slug: GameSlug): boolean {
  return row.gameSlug === slug || (row.gameSlug === undefined && slug === 'wardenwatch')
}

type OtherGameHooks = GameHooks & { prepare: (ctx: MutationCtx, user: Doc<'users'>, now: number) => Promise<unknown> }

/** The hooks of a game other than Wardenwatch. This fork registers only Wardenwatch, so no other game reaches here. */
export function otherGameHooks(slug: never): OtherGameHooks {
  throw new Error(`No hooks for game ${String(slug)}`)
}

/** A game's current player character for this user: the hero. */
export async function currentCharacterOf(ctx: QueryCtx, slug: GameSlug, user: Doc<'users'> | null): Promise<{ _id: string; activationState: 'pending_trmnl' | 'active' } | null> {
  return slug === 'wardenwatch' ? await currentHero(ctx, user) : await otherGameHooks(slug).current(ctx, user)
}

/** Whether this game's progress is being deleted for the user. */
export async function gameDeletingFor(ctx: QueryCtx, slug: GameSlug, userId: Id<'users'>): Promise<boolean> {
  return slug === 'wardenwatch' ? await deskCrawlerDeleting(ctx, userId) : await otherGameHooks(slug).deleting(ctx, userId)
}

export const deskCrawlerDeleting = async (ctx: QueryCtx, userId: Id<'users'>) => (await gameProfile(ctx, userId))?.state === 'deleting'
export { currentHero }
