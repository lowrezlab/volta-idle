import { useId, useMemo, useState, type KeyboardEvent } from 'react'
import { ACCESSORIES, ANCESTRIES, BACKS, BUILDS, decodeLook, encodeLook, HAIR, HEADS, LOOK_FIELDS, optionCount, TABARDS, type Look, type LookField } from '@trmnl-games/wardenwatch/art/look'
import { undrawnFields } from '@trmnl-games/wardenwatch/art/lookArt'
import { classPose, type BasePose, type HeroGender } from '@trmnl-games/wardenwatch/art/hero'
import { BASE_POSES } from '@trmnl-games/wardenwatch/art/parts/types'
import { HERO_FRAME } from '@trmnl-games/wardenwatch/art/scene'
import { layeredScenePath } from '@trmnl-games/wardenwatch/art/sceneKey'
import { paintedSceneUri } from '@trmnl-games/wardenwatch/art/sceneColour'
import { artUrl } from './artUrl'
import { Button } from './ui'
import { useT } from './i18n'
import { lookMessages } from '../i18n/look'
import { suggestName } from './heroNames'

/**
 * GDD §3.7: the creator. A live 6x preview of the chosen look in `idle`, drawn by the same scene painter as the hero
 * page (so what it shows is what the TRMNL and the hero page draw), pose chips to check every pose, then one row per
 * slot with ← → steppers. The ancestry row comes first: it decides which builds and heads the next rows offer, and
 * changing it starts them over. Every option is pickable before its art exists; a row whose part the renderer cannot
 * draw yet says so, and the preview shows the stand-in the renderer falls back to.
 */

type Messages = (typeof lookMessages)['en']
type Pose = (typeof BASE_POSES)[number]

const SCALE = 6
/** The preview crops the stage to the hero's frame with a little air around it and the ground under its feet. */
const CROP = { left: HERO_FRAME.left - 4, top: HERO_FRAME.top - 2, width: HERO_FRAME.size + 8, height: HERO_FRAME.size + 4 } as const

/** The name of a field's chosen option, by its part id in art/look.ts; an id without a name yet reads as itself. */
function optionLabel(t: Messages, field: LookField, look: Look): string {
  const ancestry = ANCESTRIES[look.ancestry] ?? ANCESTRIES[0]
  const named = (id: string) => t.parts[id] ?? id
  switch (field) {
    case 'ancestry':
      return t.ancestries[ancestry]
    case 'build':
      return (t.builds as Record<string, string>)[BUILDS[ancestry][look.build]?.id ?? ''] ?? BUILDS[ancestry][look.build]?.id ?? ''
    case 'head':
      return named(HEADS[ancestry][look.head] ?? HEADS[ancestry][0]!)
    case 'hair':
      return named(HAIR[look.hair] ?? HAIR[0])
    case 'back':
      return named(BACKS[look.back] ?? BACKS[0])
    case 'accessory':
      return named(ACCESSORIES[look.accessory] ?? ACCESSORIES[0])
    case 'tabard':
      return named(TABARDS[look.tabard] ?? TABARDS[0])
  }
}

/** The look with one field stepped round its table; a new ancestry starts the build and head over (they are its own). */
export function stepLook(look: Look, field: LookField, delta: number): Look {
  const count = optionCount(field, look)
  const value = (((look[field] + delta) % count) + count) % count
  return field === 'ancestry' ? { ...look, ancestry: value, build: 0, head: 0 } : { ...look, [field]: value }
}

/** A look drawn at random, every field inside its table for the ancestry drawn first. */
export function shuffledLook(random: () => number = Math.random): Look {
  const ancestry = Math.floor(random() * ANCESTRIES.length)
  const pick = (field: LookField) => Math.floor(random() * optionCount(field, { ancestry }))
  return { ancestry, build: pick('build'), head: pick('head'), hair: pick('hair'), back: pick('back'), accessory: pick('accessory'), tabard: pick('tabard') }
}

export function LookCreator({ value, onChange, heroClass = 'warrior', gender = 'male', biomeId = 'office_cubicles', disabled = false, name, note, small = false, onSuggestName }: {
  /** The look code (art/look.ts); anything else reads as the default look. */
  value: string
  onChange: (code: string) => void
  /** The hero's class and whole-sprite look pick the stand-in the renderer falls back to. */
  heroClass?: 'warrior' | 'rogue'
  gender?: HeroGender
  biomeId?: string
  disabled?: boolean
  /** With `name`, a hidden input carries the code in a plain form's data. */
  name?: string
  note?: string
  small?: boolean
  /** With a naming form beside the creator, a Suggest a name key offers a name in the chosen ancestry's tongue (P3.2). */
  onSuggestName?: (name: string) => void
}) {
  const t = useT(lookMessages)
  const id = useId()
  const [pose, setPose] = useState<Pose>('idle')
  // Each press moves to the next suggestion for the ancestry; the sequence is deterministic per ancestry.
  const [suggestion, setSuggestion] = useState(0)
  const look = useMemo(() => decodeLook(value), [value])
  const path = layeredScenePath(biomeId, encodeLook(look), classPose(pose as BasePose, heroClass, gender), { kind: 'none' }, 1)
  const painted = useMemo(() => paintedSceneUri(path), [path])
  const undrawn = useMemo(() => undrawnFields(look, pose), [look, pose])
  const set = (next: Look) => onChange(encodeLook(next))
  return (
    <div className="flex min-w-0 flex-col gap-4">
      {note ? <p className="text-sm text-muted">{note}</p> : null}
      <div className="flex flex-col items-center gap-3">
        {/* The stage painted in colour, as the hero page paints it, cropped to the hero at exactly 6x. */}
        <div className="relative overflow-hidden border-[3px] border-night bg-night" style={{ width: CROP.width * SCALE, height: CROP.height * SCALE }}>
          <img src={painted ?? artUrl(path)} alt={t.previewAlt} width={152 * SCALE} height={40 * SCALE} className="absolute top-0 left-0 block max-w-none [image-rendering:pixelated]" style={{ transform: `translate(${-CROP.left * SCALE}px, ${-CROP.top * SCALE}px)` }} />
        </div>
        <div role="group" aria-label={t.pose} className="flex max-w-full flex-wrap justify-center gap-1">
          {BASE_POSES.map((option) => {
            const chosen = option === pose
            return (
              <button key={option} type="button" aria-pressed={chosen} disabled={disabled} onClick={() => setPose(option)} className={`menu-cursor flex min-h-9 items-center justify-center border-2 border-edge px-2 py-1 label-px uppercase tracking-wide not-aria-pressed:before:hidden ${chosen ? 'bg-navy text-gold' : 'text-muted hover:bg-rule hover:text-ink active:bg-rule active:text-ink disabled:text-muted'}`}>
                {t.poses[option]}
              </button>
            )
          })}
        </div>
        {undrawn.size > 0 ? <p className="max-w-[44ch] text-center text-sm text-muted" aria-live="polite">{t.standIn}</p> : null}
      </div>
      <div className="flex flex-col gap-2">
        {LOOK_FIELDS.map((field) => <SlotRow key={field} id={`${id}-${field}`} field={field} look={look} label={optionLabel(t, field, look)} count={optionCount(field, look)} undrawn={undrawn.has(field)} disabled={disabled} small={small} onStep={(delta) => set(stepLook(look, field, delta))} />)}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" icon="choice" disabled={disabled} onClick={() => set(shuffledLook())}>{t.shuffle}</Button>
        {onSuggestName ? <Button variant="secondary" icon="hero" disabled={disabled} onClick={() => { onSuggestName(suggestName(look.ancestry, suggestion)); setSuggestion(suggestion + 1) }}>{t.suggestName}</Button> : null}
      </div>
      {name ? <input type="hidden" name={name} value={encodeLook(look)} /> : null}
    </div>
  )
}

/** One slot: its name, ← and → keys, the chosen option (announced as it changes) and an "art coming" tag when it has no drawing yet. */
function SlotRow({ id, field, look, label, count, undrawn, disabled, small, onStep }: { id: string; field: LookField; look: Look; label: string; count: number; undrawn: boolean; disabled: boolean; small: boolean; onStep: (delta: number) => void }) {
  const t = useT(lookMessages)
  const fieldName = t.fields[field]
  // The arrow keys step too, wherever focus sits in the row, so a keyboard moves through a slot without re-finding the keys.
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (disabled || (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight')) return
    event.preventDefault()
    onStep(event.key === 'ArrowLeft' ? -1 : 1)
  }
  const key = 'menu-cursor flex size-11 shrink-0 items-center justify-center border-2 border-edge text-lg leading-none text-ink before:hidden hover:bg-rule active:bg-rule disabled:border-raised disabled:text-faint'
  return (
    <div role="group" aria-labelledby={`${id}-label`} onKeyDown={onKeyDown} className={`flex min-w-0 items-center gap-2 border-b-2 border-rule pb-2 ${small ? 'text-sm' : ''}`}>
      <span id={`${id}-label`} className={`w-24 shrink-0 font-semibold ${small ? 'w-20' : ''}`}>{fieldName}</span>
      <button type="button" aria-label={t.previous(fieldName)} disabled={disabled || count < 2} onClick={() => onStep(-1)} className={key}>←</button>
      <span className="flex min-w-0 flex-1 flex-col items-center text-center">
        <span aria-live="polite" className="[overflow-wrap:anywhere]">{label}</span>
        <span className="text-xs text-muted tabular-nums">{t.optionOf(look[field] + 1, count)}{undrawn ? <> · <span className="text-sky-ink">{t.artComing}</span></> : null}</span>
      </span>
      <button type="button" aria-label={t.next(fieldName)} disabled={disabled || count < 2} onClick={() => onStep(1)} className={key}>→</button>
    </div>
  )
}
