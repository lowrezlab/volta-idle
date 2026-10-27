import { useEffect, useMemo, useRef, useState } from 'react'
import { paintedSceneUri } from '@trmnl-games/wardenwatch/art/sceneColour'
import { api } from '@trmnl-games/backend/api'
import { HERO_NAME_RULE } from '@trmnl-games/platform'
import { useIntent } from '../../../lib/intent'
import { useHoldReload } from '../../../lib/deployWatch'
import { NameField, nameProblem } from '../../../lib/nameField'
import { LookCreator } from '../../../lib/lookCreator'
import { DEFAULT_LOOK, encodeLook } from '@trmnl-games/wardenwatch/art/look'
import { Button } from '../../../lib/ui'
import { Glyph, SectionTitle } from '../../../lib/glyphs'
import { artUrl } from '../../../lib/artUrl'
import { localSceneUrl, useMinute } from '../../../lib/localClock'
import { BIOME_BANDS } from '../../../lib/palette'
import { Hearts } from './-gameScreen'
import { wwScreenMessages } from '../../../i18n/wwScreen'
import { ConfirmSheet, Consequences } from './-confirm'
import { formatNumber, formatTime, useLocale, useT } from '../../../lib/i18n'
import { useContent } from '../../../lib/useContent'

/** GDD §3.5: the classes' names on screen (Knight, Assassin), apart from the catalog's ids. */
const useClassName = () => {
  const names = useT(commonMessages).classNames
  return (id: string) => names[id as keyof typeof names] ?? id
}
import { wwPagesMessages } from '../../../i18n/wwPages'
import { lookMessages } from '../../../i18n/look'
import { commonMessages } from '../../../i18n/common'
import { INTL_TAG, type Locale } from '@trmnl-games/platform'

/** What `roster.mine` returns (P37). */
export type RosterView = {
  available: boolean
  open: boolean
  unlockLevel: number | null
  warriorLevel: number | null
  heroes: Array<{ id: string; name: string; class: string; className: string; level: number; status: string; hp: number; maxHp: number; gold: number; biome: string; biomeId: string; scenePath: string; current: boolean; parkedFor: number | null }>
  classes: Array<{ id: 'warrior' | 'rogue'; name: string; blurb: string; passive: { name: string; blurb: string }; hpPct: number; modifiers: { attackPct?: number; defensePct?: number; goldPct?: number }; raidEdgePct: number; recruited: boolean }>
  canPark: boolean
  nextAt: number | null
  undoHeroId: string | null
  undoUntil: number | null
}

type Notify = (feedback: { error: string | null; message: string | null }) => void

/** "Health 85% · Attack +10% · Defense −15% · Gold +20% · Raids +5 points", the class's numbers in one line. */
const numbersOf = (rule: RosterView['classes'][number]) => ({ hpPct: rule.hpPct, ...rule.modifiers, raidEdgePct: rule.raidEdgePct })

const clock = (locale: Locale, at: number) => new Date(at).toLocaleString(INTL_TAG[locale], { weekday: 'short', hour: '2-digit', minute: '2-digit' })

/** How the roster works, in three lines: folded under the heroes. */
function RosterRules() {
  const t = useT(wwPagesMessages)
  return <Consequences>{t.rules.map((rule) => <li key={rule}>{rule}</li>)}</Consequences>
}

/** A class's name, blurb, passive and numbers, as the recruit card and the classes list show it. */
function ClassBody({ rule }: { rule: RosterView['classes'][number] }) {
  const t = useT(wwPagesMessages)
  const c = useContent()
  const className = useClassName()
  return <>
    <p className="font-semibold">{className(rule.id)}</p>
    <p className="text-sm">{c.text(rule.blurb)}</p>
    <p className="mt-1 text-sm"><strong>{c.text(rule.passive.name)}{t.colon}</strong> {c.text(rule.passive.blurb)}</p>
    <p className="mt-1 text-sm text-muted">{t.classNumbers(numbersOf(rule))}</p>
  </>
}

type Hero = RosterView['heroes'][number]
type ClassRule = RosterView['classes'][number]

/**
 * The roster as a character select (D188): a card per hero with their own scene, the one adventuring outlined in gold,
 * then a dashed slot per class still to recruit, which opens its naming form in place. The rules fold away below.
 */
export function Roster({ roster, notify }: { roster: RosterView; notify: Notify }) {
  const current = roster.heroes.find((hero) => hero.current)
  const parked = roster.heroes.filter((hero) => !hero.current)
  const open = roster.classes.filter((rule) => !rule.recruited)
  const ruleOf = (hero: Hero) => roster.classes.find((rule) => rule.id === hero.class)
  const t = useT(wwPagesMessages)
  return (
    <div className="flex flex-col gap-5">
      <SectionTitle id="heroes-title" glyph="hero" as="h1">{t.yourHeroes}</SectionTitle>
      <ul aria-labelledby="heroes-title" className="grid gap-3 min-[560px]:grid-cols-2">
        {current ? <HeroCard hero={current} rule={ruleOf(current)} /> : null}
        {parked.map((hero) => <ParkedHero key={hero.id} hero={hero} rule={ruleOf(hero)} current={current} roster={roster} notify={notify} />)}
        {open.map((rule) => <RecruitSlot key={rule.id} rule={rule} current={current} roster={roster} notify={notify} />)}
      </ul>
      {!roster.open ? <p className="text-sm text-muted">{t.warriorLevel(roster.warriorLevel ?? 1)}</p> : null}
      <details className="window px-3 min-[375px]:px-4 sm:px-5">
        <summary className="min-h-11 cursor-pointer font-semibold">{t.howHeroesWork}</summary>
        <div className="pb-4"><RosterRules /></div>
      </details>
    </div>
  )
}

/** The hero's own scene over its biome's bands, as the game screen paints it, cropped around the hero. */
function HeroStage({ hero }: { hero: Hero }) {
  const now = useMinute()
  const bands = BIOME_BANDS[hero.biomeId] ?? BIOME_BANDS.office_cubicles!
  const url = localSceneUrl(hero.scenePath, now)
  const painted = useMemo(() => paintedSceneUri(url), [url])
  return (
    <div aria-hidden="true" className="relative h-32 overflow-hidden border-b-[3px] border-night bg-night">
      <div className="absolute inset-0 grid grid-rows-[18%_14%_40%_28%]">
        <div style={{ background: bands[0] }} />
        <div style={{ background: bands[1] }} />
        <div style={{ background: bands[2] }} />
        <div className="border-t-[6px] border-night/25" style={{ background: bands[3] }} />
      </div>
      <img src={painted ?? artUrl(url)} alt="" width={760} height={200} className={`relative h-full w-full object-cover object-[41%_50%] [image-rendering:pixelated] ${painted ? '' : 'mix-blend-multiply'}`} />
    </div>
  )
}

function CoinMark() {
  return <svg viewBox="0 0 8 8" width={12} height={12} aria-hidden="true" shapeRendering="crispEdges" className="shrink-0"><path className="fill-gold" d="M2 0h4v1H2zM1 1h6v6H1zM0 2h8v4H0zM2 7h4v1H2z" /><path className="fill-gold-lo" d="M3 2h2v4H3z" /></svg>
}

/** One hero's card: scene with its Adventuring or Waiting tab, name and level in the HUD voice, hearts, coins and the class's passive. */
function HeroCard({ hero, rule, children }: { hero: Hero; rule: ClassRule | undefined; children?: React.ReactNode }) {
  const t = useT(wwPagesMessages)
  const s = useT(wwScreenMessages)
  const c = useContent()
  const className = useClassName()
  const locale = useLocale()
  return (
    <li className={`flex min-w-0 flex-col border-[3px] ${hero.current ? 'border-gold' : 'border-night'} bg-panel`}>
      <div className="relative">
        <HeroStage hero={hero} />
        <span className={`hud absolute top-2 left-2 flex items-center gap-1.5 border-2 border-night px-1.5 py-1 text-hud-sm ${hero.current ? 'bg-gold text-night' : 'bg-night text-muted'}`}>
          <Glyph name={hero.current ? 'play' : 'pause'} size={8} />{hero.current ? t.adventuring : t.waitingTag}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 px-3 pt-3 pb-4 min-[375px]:px-4">
        <h2 className="hud text-sm leading-snug [overflow-wrap:anywhere]">{hero.name} <span className="text-gold-ink">{s.levelShort}{hero.level}</span></h2>
        <p className="text-sm text-muted">{className(hero.class)} · {hero.current ? t.inBiome(hero.biome) : t.waiting(hero.parkedFor ?? 0, hero.biome)}</p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <Hearts hp={hero.hp} maxHp={hero.maxHp} />
          <span className="flex items-center gap-1.5 label-px text-gold-ink">
            <CoinMark />{formatNumber(locale, hero.gold)}<span className="sr-only">{s.gold}</span>
          </span>
        </div>
        {rule ? <p className="text-sm"><strong>{c.text(rule.passive.name)}{t.colon}</strong> {c.text(rule.passive.blurb)}</p> : null}
        {children ? <div className="mt-auto flex flex-col gap-1 pt-1">{children}</div> : null}
      </div>
    </li>
  )
}

function ParkedHero({ hero, rule, current, roster, notify }: { hero: Hero; rule: ClassRule | undefined; current: Hero | undefined; roster: RosterView; notify: Notify }) {
  const [asking, setAsking] = useState(false)
  const switchHero = useIntent(api.roster.switchHero, { onFeedback: notify })
  const t = useT(wwPagesMessages)
  const locale = useLocale()
  const undo = roster.undoHeroId === hero.id
  const blocked = !undo && roster.nextAt !== null
  return (
    <HeroCard hero={hero} rule={rule}>
      <Button variant="secondary" disabled={blocked || !roster.canPark} onClick={() => setAsking(true)}>{undo ? t.switchBack(hero.name) : t.switchTo(hero.name)}</Button>
      {blocked ? <p className="text-sm text-muted">{t.oneSwitch(clock(locale, roster.nextAt!))}</p> : null}
      {undo && roster.undoUntil !== null ? <p className="text-sm text-muted">{t.freeUntil(formatTime(locale, roster.undoUntil))}</p> : null}
      {!blocked && !roster.canPark && current ? <p className="text-sm text-muted">{t.canSwitchOut(current.name)}</p> : null}
      <ConfirmSheet open={asking} title={t.switchTitle(hero.name)} confirmLabel={t.switchTo(hero.name)} busyLabel={t.switching} cancelLabel={t.keep(current?.name ?? null)} pending={switchHero.pending} onClose={() => setAsking(false)} onConfirm={() => { setAsking(false); void switchHero.run({ heroId: hero.id as never }, t.takesDesk(hero.name)) }}>
        <Consequences>
          <li>{t.stopsWaits(current?.name ?? null)}</li>
          <li>{t.picksUp(hero.name)}</li>
          {undo ? <li>{t.switchBackFree}</li> : <li>{t.daysSwitch}</li>}
        </Consequences>
      </ConfirmSheet>
    </HeroCard>
  )
}

/** A class still to recruit: an empty dashed slot, locked until the roster opens, then a Recruit key that opens the form in place. */
function RecruitSlot({ rule, current, roster, notify }: { rule: ClassRule; current: Hero | undefined; roster: RosterView; notify: Notify }) {
  const [opened, setOpened] = useState(false)
  const slot = useRef<HTMLLIElement>(null)
  const closed = useRef(false)
  const t = useT(wwPagesMessages)
  const c = useContent()
  const className = useClassName()
  // Not yet hands focus back to the Recruit key it came from, not the top of the page.
  useEffect(() => { if (!opened && closed.current) slot.current?.querySelector('button')?.focus() }, [opened])
  if (roster.open && opened) return <RecruitCard rule={rule} current={current} roster={roster} notify={notify} onCancel={() => { closed.current = true; setOpened(false) }} />
  return (
    <li ref={slot} className={`flex min-h-56 min-w-0 flex-col items-center justify-center gap-3 border-[3px] border-dashed border-faint px-4 py-6 text-center ${roster.open ? '' : 'text-muted'}`}>
      <span aria-hidden="true" className="hud grid size-14 place-items-center border-2 border-dashed border-faint text-xl text-muted">?</span>
      <h2 className="font-display text-xl font-bold">{className(rule.id)}</h2>
      <p className="max-w-[36ch] text-sm text-muted">{c.text(rule.blurb)}</p>
      {roster.open ? <Button onClick={() => setOpened(true)}>{t.recruitA(className(rule.id))}</Button> : <p className="flex items-center gap-2 text-sm font-semibold"><Glyph name="hero" size={14} />{t.secondOpens(roster.unlockLevel)}</p>}
    </li>
  )
}

function RecruitCard({ rule, current, roster, notify, onCancel }: { rule: ClassRule; current: Hero | undefined; roster: RosterView; notify: Notify; onCancel: () => void }) {
  const [name, setName] = useState('')
  // GDD §3.7: a recruit passes through the creator with its naming.
  const [look, setLook] = useState(() => encodeLook(DEFAULT_LOOK))
  const [asking, setAsking] = useState(false)
  const recruit = useIntent(api.roster.recruit, { onFeedback: notify })
  useHoldReload(name.trim() !== '' || asking || recruit.pending)
  const valid = nameProblem(name, HERO_NAME_RULE, 'hero name') === null
  const blocked = roster.nextAt !== null || !roster.canPark
  const card = useRef<HTMLLIElement>(null)
  // The key that opened the form is gone; the name is the next thing to do.
  useEffect(() => { card.current?.querySelector('input')?.focus() }, [])
  const t = useT(wwPagesMessages)
  const l = useT(lookMessages)
  const className = useClassName()
  const locale = useLocale()
  const shown = className(rule.id)
  return (
    <li ref={card} className="flex min-w-0 flex-col border-[3px] border-gold bg-panel px-3 pt-3 pb-4 min-[375px]:px-4 sm:px-5">
      <ClassBody rule={rule} />
      <form className="mt-3 flex flex-col gap-3" onSubmit={(event) => { event.preventDefault(); if (valid && !blocked) setAsking(true) }}>
        <NameField label={t.nameYour(shown)} small rule={HERO_NAME_RULE} noun="hero name" value={name} onChange={setName} disabled={recruit.pending} />
        <LookCreator small value={look} onChange={setLook} heroClass={rule.id} note={l.firstLook} disabled={recruit.pending} onSuggestName={setName} />
        <Button type="submit" disabled={!valid || blocked}>{t.recruitA(shown)}</Button>
        {roster.nextAt !== null ? <p className="text-sm text-muted">{t.recruitCounts(clock(locale, roster.nextAt))}</p> : null}
        {roster.nextAt === null && !roster.canPark && current ? <p className="text-sm text-muted">{t.canHandOver(current.name)}</p> : null}
        <Button variant="quiet" className="-ml-3 self-start min-[375px]:-ml-4" disabled={recruit.pending} onClick={onCancel}>{t.notYet}</Button>
      </form>
      <ConfirmSheet open={asking} title={t.recruitTitle(name.trim(), shown)} confirmLabel={t.recruitName(name.trim())} busyLabel={t.recruiting} cancelLabel={t.notYet} pending={recruit.pending} onClose={() => setAsking(false)} onConfirm={() => { setAsking(false); void recruit.run({ heroClass: rule.id, name: name.trim(), look }, t.recruited(name.trim(), shown)).then((done) => { if (done) setName('') }) }}>
        <Consequences>
          <li>{t.startsAt(name.trim())}</li>
          <li>{t.waitsExactly(current?.name ?? null)}</li>
          <li>{t.daysSwitchBack}</li>
        </Consequences>
      </ConfirmSheet>
    </li>
  )
}
