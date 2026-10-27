import { WARDENWATCH_INSTALL_URL, SUPPORT_EMAIL } from '../../lib/prose'
import { affixName, HELP_FACTS as F, nextTableDate, occasionName, signed, type Cost, type Modifiers, type Occasion } from './-wardenwatchFacts'
import type { HelpPage } from './-wardenwatchHelp'
import { WARDENWATCH_HELP_HEAD } from './-helpHeads'

const auro = (n: number) => `${n.toLocaleString('en-US')} Auro`
const and = (parts: readonly string[], last = 'and') => (parts.length <= 1 ? parts.join('') : `${parts.slice(0, -1).join(', ')} ${last} ${parts.at(-1)}`)
const rungs = (list: readonly { name: string; size: number; price: number }[]) => and(list.map((rung) => `a ${rung.name} (${rung.size}) for ${auro(rung.price)}`))
const price = (c: Cost) => `${and(c.materials.map((m) => `${m.n} ${m.name}`))} plus ${auro(c.gold)}`
const boonLine = (m: Modifiers) => [m.attackPct ? `${signed(m.attackPct)}% attack` : '', m.defensePct ? `${signed(m.defensePct)}% defense` : '', m.xpPct ? `${signed(m.xpPct)}% XP from wins` : '', m.goldPct ? `${signed(m.goldPct)}% Auro` : '', m.trapDamagePct ? `snares hurt ${m.trapDamagePct}% less` : ''].filter(Boolean).join(', ')
const ZONES_LINE = and(F.zones.filter((b) => b.level > 1).map((b) => `the ${b.name} at level ${b.level}`))
const arrives = (feature: 'todo' | 'stances' | 'choices' | 'merchant' | 'raids') => (F.unlocks === undefined ? '' : ` It arrives at level ${F.unlocks[feature]}.`)
const SAFE = F.zones[0]?.name ?? 'Castellum Frigo'
const ILL_OMEN = occasionName('friday_13th', 'the day of ill omen')
const GIFT_DAY = occasionName('christmas', 'the midwinter feast')

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const NTH = ['first', 'second', 'third', 'fourth', 'fifth']
function occasionDate(rule: Occasion): string {
  const date = rule.date
  const span = rule.days > 1 ? `, for ${rule.days} days` : ''
  switch (date.kind) {
    case 'fixed':
      return `${date.day} ${MONTHS[date.month - 1]}${span}`
    case 'nth_weekday': {
      const base = `the ${NTH[date.nth - 1]} ${WEEKDAYS[date.weekday]} of ${MONTHS[date.month - 1]}`
      const offset = date.offsetDays ?? 0
      return `${offset === 0 ? base : `the ${WEEKDAYS[(date.weekday + offset) % 7]} after ${base}`}${span}`
    }
    case 'friday_13th':
      return 'any Friday the 13th'
    case 'easter':
      return date.offsetDays === -2 ? 'Good Friday to Easter Monday' : `${Math.abs(date.offsetDays)} days ${date.offsetDays < 0 ? 'before' : 'after'} Easter Sunday${span}`
    case 'table': {
      // Some sky events move each year; name the next one.
      const next = nextTableDate(date.dates)
      return next === null ? 'a date that moves each year' : `a date that moves each year (next ${next.getUTCDate()} ${MONTHS[next.getUTCMonth()]} ${next.getUTCFullYear()})`
    }
  }
}

export const en: HelpPage = {
  seoTitle: WARDENWATCH_HELP_HEAD.en.seoTitle,
  description: WARDENWATCH_HELP_HEAD.en.description,
  title: 'Wardenwatch on TRMNL',
  contents: {
    'getting-started': 'Getting started', 'if-the-qr-sends-you-back-to-setup': 'If the QR sends you back to setup', 'how-time-works': 'How time works', zones: 'Zones', seals: 'Seals', commissions: 'Commissions', 'heroes-and-classes': 'Heroes and classes', stances: 'Stances', 'camp-raids': 'Camp raids', musters: 'Musters', strays: 'Strays', 'garrison-orders': 'Garrison orders', draughts: 'Draughts', 'the-serpentos-moneychanger': 'The Serpentos moneychanger', decisions: 'Decisions', effects: 'Effects', 'sky-calendar': 'The sky and the calendar', 'rare-and-epic-gear': 'Rare and epic gear', 'when-your-pack-fills-up': 'When your pack fills up', 'bigger-packs': 'Bigger packs', 'salvage-and-the-forge': 'Salvage and the Forge', 'getting-knocked-out': 'Getting knocked out', recaps: 'Recaps', 'understanding-rankings': 'Understanding rankings', 'sharing-your-hero': 'Sharing your hero', 'following': 'Following', names: 'Names', looks: 'Looks', alerts: 'Alerts', troubleshooting: 'Troubleshooting', 'disconnecting-and-removing': 'Disconnecting and removing', help: 'Help',
  },
  Body: () => (
    <>
      <h2 id="getting-started">Getting started</h2>
      <ul>
        <li>Open <a href={WARDENWATCH_INSTALL_URL}>Wardenwatch in the TRMNL marketplace</a> and choose Install.</li>
        <li>Sign in to Wardenwatch, pick a public name, name your Squire and choose how they look, and connect the installation.</li>
        <li>Back in TRMNL, click Save. Your hero's first adventure starts within 15 minutes.</li>
        <li>Add the plugin to a playlist, or to a mashup if you want your hero beside other plugins. All four layout sizes are supported.</li>
      </ul>
      <h2 id="if-the-qr-sends-you-back-to-setup">If the QR sends you back to setup</h2>
      <p>The QR opens the companion for the account you are signed in with. It does not start a new installation. Check the signed-in email shown on the setup page and use Switch account if you originally connected with a different account.</p>
      <p>If setup says “Reconnect Wardenwatch”, your TRMNL connection exists but the hero is missing. This can happen after a game reset. Install a fresh copy of <a href={WARDENWATCH_INSTALL_URL}>Wardenwatch from TRMNL</a>, sign in with the same account, choose a new hero name, connect, then click Save back in TRMNL. Once the new copy works, remove the old copy from your playlist.</p>
      <p>If setup says “Save in TRMNL to start”, your hero is already prepared. Return to that installation in TRMNL and click Save.</p>
      <h2 id="how-time-works">How time works</h2>
      <p>
        The game world advances every 15 minutes whether or not your screen is on. Your TRMNL shows a snapshot and refreshes on its own schedule.
        Sleep Mode, slower refresh and other playlist items never reduce your hero's progress. Adventure times in the companion use your browser's local timezone.
      </p>
      <p>
        The title bar on your TRMNL carries the Volta date, such as “Rime Ascendant 4 · Gyre of the Wyrm 1203”. A Volta day is one passage of Myrkos the Watcher across the sky and lasts one real day. Nine days make an axis (Ascendant, Skybottom, Descendant, Midheaven), four axes a Cardinal Cycle (Rime, Echo, Gloam, Grave, Melt, Verd, Tan, Shade, Molt, Tanhaus), and ten cycles a year of 360 days, each year ruled by one of the twelve Wardens in turn. The count began on 1 Rime Ascendant 1203, the year Castellum Frigo was founded. The date is reckoning only: the sim keeps real time.
      </p>
      <h2 id="zones">Zones</h2>
      <p>Ur-Turul's map has {F.zones.length} zones, and your hero starts inside {SAFE}, the Expedition's half-built fort on the east shore of the Primordial Wilds. Each zone opens at a level, whether or not you visit: {ZONES_LINE}. Your TRMNL notes new ground on the map when one does; travelling there is up to you, from the map on the Hero page. Zones further from the fort have tougher creatures, more Auro, stronger draughts and bigger pay for garrison orders. {SAFE} can't knock a hero out; every other zone can.</p>
      <ul>
        {F.zones.map((zone) => <li key={zone.id}><strong>{zone.name}</strong>{zone.level > 1 ? ` (level ${zone.level})` : ' (from the start)'}: {zone.monsters.join(', ')}.</li>)}
      </ul>
      {F.lore ? <p>The Field notes page under More keeps what Ur-Turul's survey has written down about each zone and creature. A zone's note opens the first time your hero stands in it, a creature's with the first win over it. Notes don't affect play.</p> : null}
      <h2 id="seals">Seals</h2>
      <p>Keep Wardenwatch in your playlist and look for the seal code, six digits like 482 917, in the screen’s title bar (narrow portrait mashups shorten its label). Enter that code in the companion’s Settings to press a permanent wax seal onto your collection. Full-screen and mashup layouts both show it; the companion preview hides it. While a seal waits, the screen’s QR code collects it too: scan it with your phone and the companion adds it to your shelf, even with the title bar turned off. Where there is room, the code is printed beside it.</p>
      <p>You can collect one seal each week, with a new code from Monday at 00:00 UTC. Last week’s code works too if your screen refreshes slowly. If you miss a week, you get the same seal the week after. After collecting the full set, you can collect more of each. Seals do not change XP, gear or rankings, and extra devices or faster refresh earn no extras.</p>
      {F.career !== undefined ? (
        <>
          <h2 id="commissions">Commissions</h2>
          <p>Your hero always has one goal from the fort's commander, shown at the top of the Hero page: “Win your first fight”, “Equip a piece of gear you found”, “Travel to the Moonbight Fjords”, “Buy the Pilgrim Pack”. Some are reached by adventuring; the rest are things you do here, on the Pack or Hero page. Reaching a goal is announced on your TRMNL and sets a little Auro aside ({F.career.gold.toLocaleString('en-US')} across the whole ladder); press Claim on the Hero page to collect it. Goals give no XP and never expire, and the next goal starts whether or not you have claimed.</p>
          <ul>
            <li>The Commissions page under More lists the {F.career.goals} goals in order, with the date you reached each. A goal you had already done when the ladder arrived counts as reached. The ranks along the way are Squire, Sworn, Banneret and Warden-sworn.</li>
            {F.unlocks !== undefined ? <li>Features arrive by level, whether or not you visit: garrison orders at level {F.unlocks.todo}, stances at level {F.unlocks.stances}, decisions on the road at level {F.unlocks.choices}, {F.meetings?.level !== undefined ? `musters with comrades at level ${F.meetings.level}, ` : ''}{F.workbench?.level !== undefined ? `salvage and the Forge at level ${F.workbench.level}, ` : ''}the Serpentos moneychanger at level {F.unlocks.merchant} and camp raids at level {F.unlocks.raids}. Your TRMNL announces each one. The zones open by level too: {ZONES_LINE}.</li> : null}
            <li>When stances open, your hero has none chosen and plays Steady. One goal asks you to choose one; any of the three counts, and you can change it later.</li>
            <li>A few early goals are guaranteed to come up in time: the first fight within a handful of adventures, a piece of gear within the first dozen, and a first decision, moneychanger and elite within a day or so of their level. Everything else is down to chance.</li>
          </ul>
        </>
      ) : null}
      {F.classes !== undefined ? (
        <>
          <h2 id="heroes-and-classes">Heroes and classes</h2>
          <p>Everyone starts as a Knight. When your Knight reaches level {F.rosterLevel}, your TRMNL announces a second hero, and you can recruit an Assassin from the Heroes page under More. The Assassin starts at level 1 with its own name, look, gear, Auro, draughts and goals.</p>
          <ul>
            <li>One hero adventures at a time, and that is the one your TRMNL shows and the one on the leaderboards. The other stays where you left it. It doesn't adventure or catch up later, and a moneychanger visiting it moves on.</li>
            <li>You can switch once a day. Switching straight back within ten minutes does not count. A hero that is knocked out or on the road has to recover or arrive first.</li>
            <li>You can have one hero of each class. Survey entries belong to you whichever hero earns them; a few belong to the Assassin alone.</li>
            <li><strong>Knight</strong>: {F.classes.warriorBlurb}</li>
            <li><strong>Assassin</strong>: {F.classes.rogueBlurb} {F.classes.rogue.hpPct}% health, attack {signed(F.classes.rogue.attackPct)}%, defense {signed(F.classes.rogue.defensePct)}%, {signed(F.classes.rogue.goldPct)}% Auro from every fight and find, and {F.classes.rogue.raidEdgePct} points on its side of every camp raid. It levels at the Knight's pace but gets knocked out a little more often.</li>
          </ul>
        </>
      ) : null}
      <h2 id="stances">Stances</h2>
      <p>Choose how far your hero pushes before it rests, on the Hero page.{arrives('stances')} The stance applies from the next adventure, and you can change it at any time. Your TRMNL shows it beside the pack count, under a gauge whose needle sits low for Guarded, in the middle for Steady and high for Reckless.</p>
      <ul>
        <li><strong>Guarded</strong> drinks a draught below 65% HP, rests below 50% and sets off again at 90%. It earns 90% of the usual XP from wins.</li>
        <li><strong>Steady</strong>, the garrison standard and the default, drinks below 50%, rests below 35% and sets off again at 75%, with the usual XP.</li>
        <li><strong>Reckless</strong> drinks below 35%, rests below 20% and sets off again at 60%. It earns 115% XP from wins but gets knocked out more often.</li>
      </ul>
      <p>{SAFE} can't knock a hero out, so Reckless has no knockout risk inside the walls. In every other zone a knockout costs Auro and sends your hero back to {SAFE}, and Reckless is knocked out most often.</p>
      <h2 id="camp-raids">Camp raids</h2>
      <p>While out on patrol, Squires sometimes go through each other's kit. Every active hero{F.unlocks === undefined ? '' : ` from level ${F.unlocks.raids}`} raids and gets raided automatically. You can't start a raid or pick its target.{F.unlocks === undefined ? '' : ` Below level ${F.unlocks.raids} a hero neither raids nor gets raided.`} The raid shows up in both heroes' adventure logs with the other player's public name, and the Hero page keeps a record of your hero's raids.</p>
      <ul>
        <li>Who wins is a coin toss, moved only by stance. Level, gear and effects never count. Guarded adds 10 points to its side of the toss, Steady adds nothing and Reckless takes 5 away, whether raiding or defending.</li>
        <li>How often your hero raids depends on stance too: Guarded about every other day of patrol, Steady about once a day, Reckless about twice a day.</li>
        <li>The loser hands over 5% of its Auro to the winner, so Auro only changes hands. Both lose health: the loser 30% of its maximum HP, the winner 10%. {affixName('thrifty')} gear takes its points off the Auro loss.</li>
        <li>A raid can knock a hero out, exactly like a fight; inside {SAFE} your hero is rescued instead. Raids only find heroes who are exploring or resting, and a hero raided once is left alone for about six hours.</li>
        <li>If you'd rather lose fewer raids, pick Guarded, which raids least and wins most.</li>
      </ul>
      {F.meetings !== undefined ? (
        <>
          <h2 id="musters">Musters</h2>
          <p>Now and then, instead of a fight, your hero runs into another player's hero in the same zone{F.meetings.level === undefined ? '' : `, from level ${F.meetings.level}`}. They stand in the soup line, swap tall tales or split their rations, and both heroes get the same small boon for {F.meetings.boonAdventures} adventures. Both adventure logs tell the story with the other player's public name, and the Log tab lists your hero's last five musters.</p>
          <ul>
            {F.meetings.kinds.map((kind) => <li key={kind.id}><strong>{kind.name}</strong>: {kind.effect}, {boonLine(kind.modifiers)}.</li>)}
            <li>Nothing changes hands. A muster takes the place of one adventure, and the boon roughly makes up for it.</li>
            <li>It happens at the same rate whatever your stance or class, about every other day for a hero who is out on patrol. Heroes only meet while exploring or resting, and a hero who has just had a muster is left alone for about twelve hours.</li>
          </ul>
        </>
      ) : null}
      {F.lostProperty ? (
        <>
          <h2 id="strays">Strays</h2>
          <p>When your hero is knocked out beyond the walls, it drops a spare of its weapon or armour on the road in that zone, with your public name scratched into it. Your hero keeps everything it was wearing. Later, another player's hero patrolling that zone may find the stray instead of an ordinary find, and your TRMNL tells you who found it.</p>
          <ul>
            <li>Your hero can find other players' strays the same way. A stray is ordinary gear: equip it, sell it, salvage it or take it to the Forge. It comes at the plain stats for its kind and rarity, without the first owner's upgrades.</li>
            <li>The name stays on it. The Pack page and the Log tab's Strays card show whose it was, and so does your hero page while you hold it.</li>
            <li>A stray only replaces a find your hero was about to make anyway, so nobody gets extra gear. Commission rewards and {GIFT_DAY} gifts are always new gear.</li>
            <li>Only one stray of yours lies about at a time. If your hero is knocked out again before anyone finds it, the new stray replaces the old one.</li>
          </ul>
        </>
      ) : null}
      {F.todo !== undefined ? (
        <>
          <h2 id="garrison-orders">Garrison orders</h2>
          <p>The fort's board posts three small orders for your hero, such as “Defeat 4 Cellar Rime-Rats”, “Find 2 pieces of gear” or “Patrol the Moonbight Fjords for 16 adventures”.{arrives('todo')} It works through them while on patrol, and the Hero page shows each order's progress. When an order is done, your screen says so and your hero gets a little Auro: {and(F.todo.pay.map(String), 'or')} depending on the zone. Orders give no XP, so they don't affect rankings.</p>
          <ul>
            <li>Every morning at {F.todo.muster} your TRMNL's local time, the morning muster posts new orders for the ones that are done. Your screen lists them.</li>
            <li>Orders never expire. A stuck order is swapped automatically after two musters.</li>
            <li>At least two of the three orders can be done where your hero is. At most one asks for a trip to another zone, if you want to send your hero there.</li>
            <li>Once between musters you can swap one unfinished order for a different one on the Hero page.</li>
          </ul>
        </>
      ) : null}
      <h2 id="draughts">Draughts</h2>
      {F.potions === undefined
        ? <p>A copper draught restores 40% of your hero's maximum HP, rounded up. Your hero drinks one automatically when HP falls below the stance's draught level while on patrol, and the adventure log notes it. With no draughts left, your hero rests below the stance's rest level and sets off again once recovered. You can also drink one yourself from the Hero page whenever your hero is exploring or resting and not at full HP. Draughts are found on patrol and never take up pack space.</p>
        : <>
          <p>Copper draughts come in {F.potions.strengths.length} strengths: {and(F.potions.strengths.map((s) => `${s.name.toLowerCase()} (${s.healPct}%)`))}, each restoring that share of your hero's maximum HP, rounded up. Finds depend on where your hero is: {F.potions.drops.map((d) => `${d.zone} drops${d.rest.length === 0 ? ' only' : ' mostly'} ${d.top.toLowerCase()}s${d.rest.length === 0 ? '' : `, with some ${d.rest.map((r) => `${r.toLowerCase()}s`).join(' and ')}`}`).join('; ')}. A new hero starts with draughts, and the moneychanger and decisions on the road hand out draughts too. All strengths share one case and never take up pack space.</p>
          <p>Your hero drinks automatically when HP falls below the stance's draught level while on patrol: the weakest draught that puts it back above the stance's draught level, or the strongest it has when nothing weaker would do. The adventure log names what it drank. With no draughts left, your hero rests below the rest level and sets off again once recovered. You can also drink one yourself from the Hero page whenever your hero is exploring, resting or travelling and not at full HP; with more than one strength in the case, the Hero page asks which.</p>
          <p><strong>Combining.</strong> On the Pack page, {F.potions.combine.count} {F.potions.combine.from.toLowerCase()}s and {F.potions.combine.materials.map((m) => `${m.n} ${m.name}`).join(', ')} become one {F.potions.combine.to.toLowerCase()}. Combining never leaves you with more draughts than before, so the case can't overflow. It only happens when you choose it.</p>
        </>}
      <p>Draughts are kept in a case. A new hero carries a {F.firstPouch.name} that holds {F.firstPouch.size}. Bigger cases are bought with Auro on the Pack page, one at a time: {rungs(F.shopPouches)}. When the case is full, a draught find becomes Auro instead.</p>
      <h2 id="the-serpentos-moneychanger">The Serpentos moneychanger</h2>
      <p>Now and then a Serpentos factor, one of the Dragu moneychangers who travel with the supply ships, stops by your hero on patrol. Your screen says so, and the Pack page shows up to three offers: a few draughts, and the next case or pack{F.merchantOff > 0 ? ` at ${F.merchantOff}% off the Pack page price` : ''}. Each offer sells once. The factor moves on after four adventures or after your last purchase.</p>
      <h2 id="decisions">Decisions</h2>
      <p>Sometimes the road asks your hero something small, like chipping in for the cook's stew or standing a night watch on the palisade. Your screen says a decision is waiting, and the Hero page shows both options with exactly what each one changes. If you don't answer within about a day, the option marked as the default is chosen for you.</p>
      <h2 id="effects">Effects</h2>
      <p>Some moments leave your hero with a short effect, listed on the Hero page with the adventures it has left. Beating an elite makes your hero Fired up (+10% attack for eight adventures). Chipping in for the stew makes your hero Well fed (+10% XP for eight adventures). A snare leaves your hero Bruised (−15% defense for four adventures). Your hero holds at most three effects. Any rest shakes off bad effects, and a knockout clears them all.</p>
      {F.standoff !== undefined ? (
        <>
          <h2 id="dug-in-elites">Dug-in elites</h2>
          <p>From level {F.standoff.minLevel}, in the {F.standoff.zone} and the zones beyond, an elite sometimes digs in instead of falling in one fight. Your TRMNL shows it with its health bar, and your hero comes back to it every adventure until it falls.</p>
          <ul>
            <li>Each adventure your hero fights it for up to six rounds, and its health carries over. It hits much harder than an ordinary elite, and your hero fights on past its stance's rest line before stepping back, so a standoff can end in a knockout. No Auro is lost for breaking off.</li>
            <li>When it falls, it pays {F.standoff.xp} times the creature's XP and {F.standoff.gold} times its Auro, plus a rare or epic find from that zone.</li>
            <li>It leaves after {F.standoff.hours} hours, or sooner if your hero is knocked out or travels. A pause doesn't stop the clock.</li>
            <li>The Hero page shows its health and when it leaves. You can walk away from it there, and travel asks before leaving it behind.</li>
          </ul>
        </>
      ) : null}
      <h2 id="sky-calendar">The sky and the calendar</h2>
      <p>Twelve chained moons hang over Volta, one for each Astral Warden, and the strip across the top of your hero's scene shows them in Gyre order: Chained Maiden, Leviathan, Wyrm, Magnus, Blooming Horror, Veil-Hound, Betrayer, Conjoined, Eldritch Beast, Titan, Eclipse and Watcher. Each moon's lit face follows its own period, from the Watcher's single day to the Maiden's year, and the fullest moon of the day wears a halo. The Maiden's moon is a dead husk and is always drawn cracked. The sky, like the date in the title bar, is reckoned from the clock alone and changes nothing in play.</p>
      {F.occasions !== undefined ? (
        <>
          <p>Certain days of the year are sky events that dress your hero's scene: decorations along the top, something on the ground, sometimes a hat, and inside {SAFE} a different view beyond the palisade. They follow your TRMNL's local date. The first time your hero sees one, the adventure log names it, and most bring one small bonus while they last. The Hero page shows today's event and the next one.</p>
          <ul>
            {F.occasions.map((rule) => <li key={rule.id}><strong>{rule.name}</strong>, {occasionDate(rule)}: {rule.id === 'friday_13th' ? 'every camp raid goes wrong (below).' : rule.effectLabel ? `${rule.effectLabel}.` : 'decorations only.'}</li>)}
          </ul>
          <p><strong>{ILL_OMEN}.</strong> Camp raids start twice as often, and every one of them goes wrong: nobody wins, and both heroes lose 20% of their maximum HP and 5% of their Auro, which nobody gets. Your hero's raid record counts it as a mishap.</p>
          <p><strong>{GIFT_DAY}.</strong> Your hero finds one wrapped gift: a piece of gear from the zone it's in, on its first adventure of the three days.</p>
        </>
      ) : null}
      <h2 id="rare-and-epic-gear">Rare and epic gear</h2>
      <p>Gear comes as common, uncommon, rare or epic. Epic gear is the rarest, about one find in a hundred, and the strongest. Rare and epic gear also carry one trait of Stellar Forging, shown in the item's name and explained on the Pack page. Each follows the Obsidianid metallurgy: a metal worked into the piece lends it one property.</p>
      <ul>
        <li><strong>{affixName('vampiric')}</strong> heals 5% of maximum HP after every win, because copper heals.</li>
        <li><strong>{affixName('lucky')}</strong> adds 20% Auro from wins and finds.</li>
        <li><strong>{affixName('sturdy')}</strong> takes 40% less damage from snares.</li>
        <li><strong>{affixName('thrifty')}</strong> loses 5 points less Auro when things go wrong: a retreat loses no Auro instead of 5%, and a knockout loses 5% instead of 10%.</li>
      </ul>
      <h2 id="when-your-pack-fills-up">When your pack fills up</h2>
      <p>A new hero starts with a {F.zones.length > 0 ? 'satchel' : 'small pack'} that holds 6 pieces of gear. Equipped gear and draughts don’t take up space. When the pack is full, your hero holds the next piece it finds for you and keeps adventuring. While that piece waits, further finds stay behind until you make room.</p>
      <h2 id="bigger-packs">Bigger packs</h2>
      <p>Your pack grows with Auro. {F.tote ? `Your hero is issued a ${F.tote.name} (${F.tote.size}) within the first couple of hours. ` : ''}After that, bigger packs are bought on the Pack page, one at a time: {rungs(F.shopBags)}, up to {F.topBag} slots. There are no level requirements, and packs never drop as loot.</p>
      <ol className="[&_li]:list-decimal">
        <li>Open Pack in the companion. Equip any upgrades and sell spare gear to free space.</li>
        <li>If a find is being held, choose Claim find. Leave at least one free slot after claiming it so adventures can resume.</li>
        <li>Once a slot is free and nothing is waiting, adventures resume on their own within 15 minutes. You can still pick another open zone from the Pack page before then.</li>
      </ol>
      <p>Equipping gear does not free a slot. Selling or salvaging gear, or buying a bigger pack, does, and the held find moves into the pack at once. The Pack page can also sell your weakest spare and keep the find in one tap. Your TRMNL’s Sleep Mode never stops the game either.</p>
      {F.workbench !== undefined ? <>
        <h2 id="salvage-and-the-forge">Salvage and the Forge</h2>
        <p>{F.workbench.level !== undefined ? `From level ${F.workbench.level}, s` : 'S'}pare gear has two ways out of the pack: sell it for Auro, or salvage it for stellazia shards on the Pack page. Salvage pays the tier the piece was found at, in units of its rarity’s shard: {F.workbench.materials.map((m) => `${m.name} from ${m.rarities.join(' and ')} gear`).join(', ')}. Epic gear pays {F.workbench.epicMultiplier} times as much. Shards take no pack space and are never sold. Gear is only salvaged when you choose to.{F.workbench.level !== undefined ? ` Before level ${F.workbench.level}, sell your spares: the first upgrade needs level ${F.workbench.level} anyway.` : ''}</p>
        <p>The Forge is Stellar Forging at the fort's scale: it spends shards and Auro on the gear your hero wears, in place. The piece keeps its name and trait, and only its numbers change. Each piece has one next step. {F.workbench.tiers.map((s, i) => `${i === 0 ? 'Raising a tier-1 piece to Mk II' : 'Mk II to Mk III'} costs ${price(s)}`).join('; ')}; a piece can only be raised to a tier your hero’s level could equip. Once a piece is Mk III (or was found there), reinforcement adds one point a step: {F.workbench.reinforce.map((s) => `+${s.to} for ${price(s)}`).join(', ')}. {F.workbench.reinforce.length > 0 ? `After +${F.workbench.reinforce.at(-1)!.to} the piece is finished.` : ''} Rare and epic gear can also have a trait of your choosing fitted for {price(F.workbench.affix)}, replacing the one it has.</p>
        <p>Upgrades always succeed. Salvaging an upgraded piece doesn't return what you spent upgrading it, so only upgrade gear you plan to keep wearing.</p>
      </> : null}
      <h2 id="getting-knocked-out">Getting knocked out</h2>
      <p>Your hero revives automatically after about two hours and returns to {SAFE}. You keep your XP and equipment but lose 10% of your current Auro.</p>
      <h2 id="recaps">Recaps</h2>
      <p>Your screen carries a short recap of the last finished night or day, in your TRMNL's local time. At 07:00 the night recap reports 19:00 to 07:00 and stays up all day. At 19:00 the day recap reports 07:00 to 19:00 and stays up all evening and overnight. The scene shows day and night on the same hours. The stories above it are always the latest.</p>
      <h2 id="understanding-rankings">Understanding rankings</h2>
      <p>The screen shows this week’s XP Top 5 for your level group, with your own row marked, or added below the list when you sit lower. The companion also offers today’s board and a lifetime board. Today starts at 00:00 UTC and the week on Monday at 00:00 UTC, as seals do. Rankings publish hourly, so a recent adventure or level-up can appear before your rank updates.</p>
      <p>Paused and sleeping heroes keep their progress. One with no XP this week leaves the weekly board until it earns XP again. Lifetime progress stays recorded.</p>
      <h2 id="sharing-your-hero">Sharing your hero</h2>
      <p>Your hero has a public page with its level, rank, current zone, lifetime counts and survey entries. Auro and the adventure log are never shown, and gear only when it's another player's stray your hero is holding. Your name links to the page from the rankings and from other players' raids and musters, and that's where other players follow you. Settings has Share and Copy link buttons, and a shared link shows a picture card of your hero with its name, level and rank. To hide it, choose Hide my hero page in Settings. It goes straight away, and while it's hidden nobody can follow you.</p>
      <h2 id="following">Following</h2>
      <p>Signed in, you can follow another player from their public hero page, up to 20 players. Everyone you follow is listed under Rankings, with their hero's level, rank and where they are, and links to their pages. Following changes nothing in play, and nobody is told when you follow them. Camp raids pick their targets by chance from everyone, so following someone never sends your hero after them. If a player hides their page, you see only their name until they show it again. If they change their public name, they drop off your list.</p>
      <h2 id="names">Names</h2>
      <p>You have two names. Your hero's name is on your TRMNL, the rankings and your hero page; to change it, have the fort's clerk amend the muster roll from the More tab, for 200 Auro. The clerk takes one amendment a day. Your public name is you, across every TRMNL game: it shows beside your hero in the rankings, in other players' raids and musters, and in your page's link. You can change it for free once every 7 days from Account. Links to your old page stop working, and nobody else can take your old name for 7 days.</p>
      <h2 id="looks">Looks</h2>
      <p>You build your hero's look when you create it: ancestry, build, head, hair, back, accessory and tabard. Eleven of Volta's peoples can take the Squire's oath, from the small Aquanids, Lunaris and Dragu to the towering Crystalkin. It only changes how your hero looks on your TRMNL, your hero page and in other players' musters. Every look plays the same. Naming is yours too: the creator can suggest a name in the tongue of the ancestry you pick. To change the look later, visit the camp mirror from your hero page or the More tab. It's free, any time.</p>
      <h2 id="alerts">Alerts</h2>
      <p>Your TRMNL is the main way to keep up with your hero, but Settings can also send a phone notification in two cases, each off until you turn it on:</p>
      <ul>
        <li><strong>Pack full:</strong> the pack is full and your hero is holding a find for you. It comes half an hour after the pack fills, so nothing arrives if you are already sorting it out, and once each time it fills.</li>
        <li><strong>Moneychanger's deal:</strong> a Serpentos factor is selling the next pack or case{F.merchantOff > 0 ? ` at ${F.merchantOff}% off` : ''} and your hero has the Auro. At most once a day. A factor with only draughts never sends one.</li>
      </ul>
      <p>You get at most two alerts a day. Quiet hours run from 21:00 to 08:00 unless you change them: a pack-full alert waits until they end, and a deal that turns up then is skipped. Before sending, the game checks that the alert still holds, so you never hear about a pack you have already sorted or an offer that has gone. Decisions, raids, knockouts, level-ups and seals never send alerts.</p>
      <p>Choose Allow on this device in Settings, then accept your browser’s prompt. On iPhone and iPad, first add the companion to your Home Screen (Share, then Add to Home Screen) and open it from there. Each device you allow is listed in Settings with a Remove button; removing the last one turns alerts off.</p>
      <h2 id="troubleshooting">Troubleshooting</h2>
      <h3 id="not-on-your-screen">Your hero isn't on your screen</h3>
      <ul>
        <li>Clicking Save adds Wardenwatch to your TRMNL playlist. Your device shows the playlist one plugin at a time, at its refresh rate, so Wardenwatch appears when its turn comes round. With several plugins and a slow refresh rate that can take a while.</li>
        <li>Open Playlists in TRMNL and check that Wardenwatch is there, on the device you're looking at if you have more than one, and that no schedule hides it at this time of day.</li>
        <li>Sleep Mode stops the screen refreshing overnight. Your hero keeps adventuring, and the screen catches up when the device wakes.</li>
        <li>A screen that says "The first adventure starts within 15 minutes" is working. The first story arrives on the next quarter hour.</li>
        <li>The companion's Hero page always shows what your hero is doing, whatever the screen shows.</li>
      </ul>
      <h3 id="if-the-screen-looks-old">The screen looks old</h3>
      <ul>
        <li>"Updates delayed" means the game service is running late. Your hero's progress is kept, and the screen catches up once the service does.</li>
        <li>If the companion website is current but the screen is not, check the plugin's refresh setting and playlist position in TRMNL.</li>
        <li>Adventures run every quarter hour, on the hour and at :15, :30 and :45 in your TRMNL timezone. The screen shows no countdown; the time beside each story is when it happened, and the companion shows the next adventure.</li>
        <li>If you disconnected or uninstalled, install again from TRMNL. Your hero keeps all progress.</li>
      </ul>
      <h2 id="disconnecting-and-removing">Disconnecting and removing</h2>
      <p>
        Disconnecting stops new screens for that installation. TRMNL may keep showing the last image until you remove the plugin from your playlist; we
        cannot erase an image already on your device.
      </p>
      <h2 id="help">Help</h2>
      <p>
        Email <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> for account or connection help. We aim to reply within two business days.
      </p>
    </>
  ),
}
