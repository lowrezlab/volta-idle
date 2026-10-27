import { contentTranslator } from '@trmnl-games/wardenwatch/i18n/lazy'
import { WARDENWATCH_INSTALL_URL, SUPPORT_EMAIL } from '../../lib/prose'
import { affixName, HELP_FACTS as F, nextTableDate, occasionName, signed, type Cost, type Modifiers, type Occasion } from './-wardenwatchFacts'
import type { HelpPage } from './-wardenwatchHelp'
import { WARDENWATCH_HELP_HEAD } from './-helpHeads'

const t = contentTranslator('nl')
const n = (value: number) => t.number(value)
const auro = (value: number) => `${n(value)} Auro`
const en = (parts: readonly string[], last = 'en') => (parts.length <= 1 ? parts.join('') : `${parts.slice(0, -1).join(', ')} ${last} ${parts.at(-1)}`)
const name = (english: string) => t.name(english)
const zone = (english: string) => t.nameWith(english, 'de')
const rungs = (list: readonly { name: string; size: number; price: number }[]) => en(list.map((rung) => `${t.nameWith(rung.name, 'een')} (${rung.size}) voor ${auro(rung.price)}`))
const price = (c: Cost) => `${en(c.materials.map((m) => `${m.n} ${name(m.name).toLowerCase()}`))} plus ${auro(c.gold)}`
const boonLine = (m: Modifiers) => [m.attackPct ? `${signed(m.attackPct)}% aanval` : '', m.defensePct ? `${signed(m.defensePct)}% verdediging` : '', m.xpPct ? `${signed(m.xpPct)}% XP uit overwinningen` : '', m.goldPct ? `${signed(m.goldPct)}% Auro` : '', m.trapDamagePct ? `vallen doen ${m.trapDamagePct}% minder pijn` : ''].filter(Boolean).join(', ')
const ZONES_LINE = en(F.zones.filter((b) => b.level > 1).map((b) => `${zone(b.name)} op niveau ${b.level}`))
const arrives = (feature: 'todo' | 'stances' | 'choices' | 'merchant' | 'raids') => (F.unlocks === undefined ? '' : ` Dit komt op niveau ${F.unlocks[feature]}.`)
const SAFE = name(F.zones[0]?.name ?? 'Castellum Frigo')
const ILL_OMEN = t.text(occasionName('friday_13th', 'Dag van het slechte voorteken'))
const GIFT_DAY = t.text(occasionName('christmas', 'Midwinterfeest'))
const rarityNl: Record<string, string> = { common: 'gewone', uncommon: 'ongewone', rare: 'zeldzame', epic: 'epische' }

const MONTHS = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december']
const WEEKDAYS = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag']
const NTH = ['eerste', 'tweede', 'derde', 'vierde', 'vijfde']
function occasionDate(rule: Occasion): string {
  const date = rule.date
  const span = rule.days > 1 ? `, ${rule.days} dagen lang` : ''
  switch (date.kind) {
    case 'fixed':
      return `${date.day} ${MONTHS[date.month - 1]}${span}`
    case 'nth_weekday': {
      const base = `de ${NTH[date.nth - 1]} ${WEEKDAYS[date.weekday]} van ${MONTHS[date.month - 1]}`
      const offset = date.offsetDays ?? 0
      return `${offset === 0 ? base : `de ${WEEKDAYS[(date.weekday + offset) % 7]} na ${base}`}${span}`
    }
    case 'friday_13th':
      return 'elke vrijdag de 13e'
    case 'easter':
      return date.offsetDays === -2 ? 'Goede Vrijdag tot en met tweede paasdag' : `${Math.abs(date.offsetDays)} dagen ${date.offsetDays < 0 ? 'voor' : 'na'} Eerste Paasdag${span}`
    case 'table': {
      const next = nextTableDate(date.dates)
      return next === null ? 'een datum die elk jaar verschuift' : `een datum die elk jaar verschuift (de volgende: ${next.getUTCDate()} ${MONTHS[next.getUTCMonth()]} ${next.getUTCFullYear()})`
    }
  }
}

export const nl: HelpPage = {
  seoTitle: WARDENWATCH_HELP_HEAD.nl.seoTitle,
  description: WARDENWATCH_HELP_HEAD.nl.description,
  title: 'Wardenwatch op TRMNL',
  contents: {
    'getting-started': 'Aan de slag', 'if-the-qr-sends-you-back-to-setup': 'Als de QR je terugstuurt naar de installatie', 'how-time-works': 'Hoe de tijd verloopt', zones: 'Gebieden', seals: 'Zegels', commissions: 'Opdrachten', 'heroes-and-classes': 'Helden en klassen', stances: 'Houdingen', 'camp-raids': 'Kampraids', musters: 'Appels', strays: 'Verloren goed', 'garrison-orders': 'Garnizoensorders', draughts: 'Drankjes', 'the-serpentos-moneychanger': 'De Serpentos-wisselaar', decisions: 'Beslissingen', effects: 'Effecten', 'sky-calendar': 'De hemel en de kalender', 'rare-and-epic-gear': 'Zeldzame en epische uitrusting', 'when-your-pack-fills-up': 'Als je ransel vol raakt', 'bigger-packs': 'Grotere ransels', 'salvage-and-the-forge': 'Demonteren en de Smidse', 'getting-knocked-out': 'Knock-out gaan', recaps: 'Samenvattingen', 'understanding-rankings': 'Hoe de ranglijsten werken', 'sharing-your-hero': 'Je held delen', 'following': 'Volgen', names: 'Namen', looks: 'Uiterlijk', alerts: 'Meldingen', troubleshooting: 'Problemen oplossen', 'disconnecting-and-removing': 'Ontkoppelen en verwijderen', help: 'Hulp',
  },
  Body: () => (
    <>
      <h2 id="getting-started">Aan de slag</h2>
      <ul>
        <li>Open <a href={WARDENWATCH_INSTALL_URL}>Wardenwatch in de TRMNL-marketplace</a> en kies Installeren.</li>
        <li>Log in bij Wardenwatch, kies een openbare naam, geef je Schildknaap een naam en een uiterlijk, en koppel de installatie.</li>
        <li>Klik terug in TRMNL op Opslaan. Het eerste avontuur van je held begint binnen 15 minuten.</li>
        <li>Zet de plugin in een afspeellijst, of in een mashup als je je held naast andere plugins wilt. Alle vier de indelingsformaten worden ondersteund.</li>
      </ul>
      <h2 id="if-the-qr-sends-you-back-to-setup">Als de QR je terugstuurt naar de installatie</h2>
      <p>De QR opent de app van het account waarmee je bent ingelogd. Hij start geen nieuwe installatie. Controleer het e-mailadres van de login op de installatiepagina en gebruik Ander account als je oorspronkelijk met een ander account hebt gekoppeld.</p>
      <p>Staat er bij de installatie ‘Wardenwatch opnieuw koppelen’, dan bestaat je TRMNL-koppeling wel, maar ontbreekt de held. Dat kan gebeuren na een reset van het spel. Installeer een nieuwe kopie van <a href={WARDENWATCH_INSTALL_URL}>Wardenwatch vanuit TRMNL</a>, log in met hetzelfde account, kies een nieuwe heldennaam, koppel en klik dan in TRMNL op Opslaan. Werkt de nieuwe kopie, haal dan de oude uit je afspeellijst.</p>
      <p>Staat er ‘Sla op in TRMNL om te beginnen’, dan staat je held al klaar. Ga terug naar die installatie in TRMNL en klik op Opslaan.</p>
      <h2 id="how-time-works">Hoe de tijd verloopt</h2>
      <p>
        De spelwereld gaat elk kwartier verder, of je scherm nu aanstaat of niet. Je TRMNL toont een momentopname en ververst in zijn eigen tempo.
        Slaapstand, trager verversen en andere afspeellijstitems kosten je held nooit voortgang. Avonturentijden in de app gebruiken de tijdzone van je browser.
      </p>
      <p>
        De titelbalk van je TRMNL draagt de Volta-datum, zoals ‘Rime Ascendant 4 · Gyre van de Wyrm 1203’. Een Volta-dag is één doorgang van Myrkos de Wachter langs de hemel en duurt één echte dag. Negen dagen vormen een as (Ascendant, Skybottom, Descendant, Midheaven), vier assen een Kardinale Cyclus (Rime, Echo, Gloam, Grave, Melt, Verd, Tan, Shade, Molt, Tanhaus) en tien cycli een jaar van 360 dagen, elk jaar om de beurt onder een van de twaalf Wardens. De telling begon op 1 Rime Ascendant 1203, het jaar waarin Castellum Frigo werd gesticht. De datum is alleen een telling: de simulatie houdt de echte tijd aan.
      </p>
      <h2 id="zones">Gebieden</h2>
      <p>De kaart van Ur-Turul heeft {F.zones.length} gebieden, en je held begint in {SAFE}, het half gebouwde fort van de Expeditie aan de oostoever van de Oerwildernis. Elk gebied gaat open op een niveau, of je er nu komt of niet: {ZONES_LINE}. Je TRMNL zet dan nieuw terrein op de kaart; of je erheen reist, bepaal je zelf, via de kaart op de pagina Held. Gebieden verder van het fort hebben taaiere wezens, meer Auro, sterkere drankjes en beter betaalde garnizoensorders. In {SAFE} kan een held niet knock-out gaan; in elk ander gebied wel.</p>
      <ul>
        {F.zones.map((z) => <li key={z.id}><strong>{name(z.name)}</strong>{z.level > 1 ? ` (niveau ${z.level})` : ' (vanaf het begin)'}: {z.monsters.map(name).join(', ')}.</li>)}
      </ul>
      {F.lore ? <p>De pagina Veldnotities onder Meer bewaart wat de opmeting van Ur-Turul over elk gebied en elk wezen heeft opgeschreven. De notitie van een gebied gaat open zodra je held er voor het eerst staat, die van een wezen bij de eerste overwinning erop. Notities hebben geen invloed op het spel.</p> : null}
      <h2 id="seals">Zegels</h2>
      <p>Houd Wardenwatch in je afspeellijst en zoek in de titelbalk van het scherm naar de zegelcode, zes cijfers zoals 482 917 (smalle staande mashups korten het label in). Vul die code in bij Instellingen in de app om een blijvend waszegel in je verzameling te drukken. Zowel volledig scherm als mashups tonen hem; het voorbeeld in de app verbergt hem. Terwijl er een zegel wacht, verzamelt de QR-code op het scherm het ook: scan hem met je telefoon en de app zet het op je plank, ook met de titelbalk uit. Waar ruimte is, staat de code ernaast.</p>
      <p>Je kunt één zegel per week verzamelen, met elke maandag om 00:00 UTC een nieuwe code. De code van vorige week werkt ook als je scherm traag ververst. Mis je een week, dan krijg je de week erna hetzelfde zegel. Heb je de hele set, dan kun je van elk meer verzamelen. Zegels veranderen niets aan XP, uitrusting of ranglijsten, en extra apparaten of sneller verversen leveren niets extra’s op.</p>
      {F.career !== undefined ? (
        <>
          <h2 id="commissions">Opdrachten</h2>
          <p>Je held heeft altijd één doel van de commandant van het fort, bovenaan de pagina Held: ‘Win je eerste gevecht’, ‘Rust een gevonden uitrustingsstuk uit’, ‘Reis naar de Moonbight-fjorden’, ‘Koop de Pelgrimsransel’. Sommige haal je al avonturend; de rest doe je hier, op de pagina Ransel of Held. Een doel halen wordt op je TRMNL aangekondigd en zet wat Auro opzij ({n(F.career.gold)} over de hele ladder); druk op Ophalen op de pagina Held om het binnen te halen. Doelen geven geen XP en verlopen nooit, en het volgende doel begint of je nu hebt opgehaald of niet.</p>
          <ul>
            <li>De pagina Opdrachten onder Meer toont de {F.career.goals} doelen op volgorde, met de datum waarop je elk doel haalde. Een doel dat je al had gedaan toen de ladder kwam, telt als bereikt. De rangen onderweg zijn Schildknaap, Gezworene, Baanderheer en Warden-gezworene.</li>
            {F.unlocks !== undefined ? <li>Functies komen per niveau, of je nu langskomt of niet: garnizoensorders op niveau {F.unlocks.todo}, houdingen op niveau {F.unlocks.stances}, beslissingen onderweg op niveau {F.unlocks.choices}, {F.meetings?.level !== undefined ? `appels met kameraden op niveau ${F.meetings.level}, ` : ''}{F.workbench?.level !== undefined ? `demonteren en de Smidse op niveau ${F.workbench.level}, ` : ''}de Serpentos-wisselaar op niveau {F.unlocks.merchant} en kampraids op niveau {F.unlocks.raids}. Je TRMNL kondigt ze elk aan. Ook de gebieden gaan per niveau open: {ZONES_LINE}.</li> : null}
            <li>Als de houdingen opengaan, heeft je held er nog geen gekozen en speelt hij Standvastig. Eén doel vraagt je er een te kiezen; elk van de drie telt, en je kunt hem later wijzigen.</li>
            <li>Een paar vroege doelen komen gegarandeerd op tijd: het eerste gevecht binnen een handvol avonturen, een stuk uitrusting binnen het eerste dozijn, en een eerste beslissing, wisselaar en elite binnen ongeveer een dag na hun niveau. De rest hangt van het toeval af.</li>
          </ul>
        </>
      ) : null}
      {F.classes !== undefined ? (
        <>
          <h2 id="heroes-and-classes">Helden en klassen</h2>
          <p>Iedereen begint als Ridder. Bereikt je Ridder niveau {F.rosterLevel}, dan kondigt je TRMNL een tweede held aan, en kun je een Sluipmoordenaar aanwerven via de pagina Helden onder Meer. De Sluipmoordenaar begint op niveau 1 met een eigen naam, uiterlijk, uitrusting, Auro, drankjes en doelen.</p>
          <ul>
            <li>Er gaat één held tegelijk op avontuur, en dat is de held die je TRMNL toont en die in de ranglijsten staat. De ander blijft waar je hem liet. Hij gaat niet op avontuur en haalt later niets in, en een wisselaar die hem bezoekt, vertrekt.</li>
            <li>Je kunt eens per dag wisselen. Binnen tien minuten terugwisselen telt niet. Een held die knock-out of onderweg is, moet eerst herstellen of aankomen.</li>
            <li>Je kunt één held per klasse hebben. Opmetingsvermeldingen zijn van jou, welke held ze ook haalt; een paar horen alleen bij de Sluipmoordenaar.</li>
            <li><strong>Ridder</strong>: {t.text(F.classes.warriorBlurb)}</li>
            <li><strong>Sluipmoordenaar</strong>: {t.text(F.classes.rogueBlurb)} {F.classes.rogue.hpPct}% gezondheid, aanval {signed(F.classes.rogue.attackPct)}%, verdediging {signed(F.classes.rogue.defensePct)}%, {signed(F.classes.rogue.goldPct)}% Auro uit elk gevecht en elke vondst, en {F.classes.rogue.raidEdgePct} punten aan zijn kant bij elke kampraid. Hij stijgt in hetzelfde tempo als de Ridder, maar gaat iets vaker knock-out.</li>
          </ul>
        </>
      ) : null}
      <h2 id="stances">Houdingen</h2>
      <p>Kies op de pagina Held hoe ver je held doorgaat voordat hij rust.{arrives('stances')} De houding geldt vanaf het volgende avontuur, en je kunt hem altijd wijzigen. Je TRMNL toont hem naast de ranselteller, onder een meter met de naald laag voor Op je hoede, in het midden voor Standvastig en hoog voor Roekeloos.</p>
      <ul>
        <li><strong>Op je hoede</strong> drinkt een drankje onder 65% HP, rust onder 50% en gaat weer op pad bij 90%. Krijgt 90% van de gewone XP uit overwinningen.</li>
        <li><strong>Standvastig</strong>, de garnizoensregel en de standaard, drinkt onder 50%, rust onder 35% en gaat weer op pad bij 75%, met de gewone XP.</li>
        <li><strong>Roekeloos</strong> drinkt onder 35%, rust onder 20% en gaat weer op pad bij 60%. Krijgt 115% XP uit overwinningen, maar gaat vaker knock-out.</li>
      </ul>
      <p>In {SAFE} kan een held niet knock-out gaan, dus binnen de muren loopt Roekeloos geen risico. In elk ander gebied kost een knock-out Auro en gaat je held terug naar {SAFE}, en Roekeloos gaat het vaakst knock-out.</p>
      <h2 id="camp-raids">Kampraids</h2>
      <p>Op patrouille gaan Schildknapen soms door elkaars spullen. Elke actieve held{F.unlocks === undefined ? '' : ` vanaf niveau ${F.unlocks.raids}`} doet automatisch raids en wordt automatisch overvallen. Je kunt geen raid starten en geen doelwit kiezen.{F.unlocks === undefined ? '' : ` Onder niveau ${F.unlocks.raids} doet een held geen raids en wordt hij niet overvallen.`} De raid staat in het avonturenlogboek van beide helden met de openbare naam van de andere speler, en de pagina Held houdt de raids van je held bij.</p>
      <ul>
        <li>Wie wint is een muntworp, die alleen de houding verschuift. Niveau, uitrusting en effecten tellen nooit. Op je hoede telt 10 punten bij aan zijn kant, Standvastig niets en Roekeloos haalt er 5 af, bij aanvallen en verdedigen.</li>
        <li>Hoe vaak je held een raid doet, hangt ook van de houding af: Op je hoede ongeveer om de patrouilledag, Standvastig ongeveer één keer per dag, Roekeloos ongeveer twee keer per dag.</li>
        <li>De verliezer geeft 5% van zijn Auro aan de winnaar, dus Auro wisselt alleen van eigenaar. Beide verliezen gezondheid: de verliezer 30% van zijn maximale HP, de winnaar 10%. Uitrusting met {name(affixName('thrifty'))} haalt zijn punten van het Auro-verlies af.</li>
        <li>Een raid kan een held knock-out slaan, net als een gevecht; in {SAFE} wordt je held dan gered. Raids vinden alleen helden die verkennen of rusten, en een overvallen held wordt zo’n zes uur met rust gelaten.</li>
        <li>Wil je minder raids verliezen, kies dan Op je hoede, dat de minste raids doet en het vaakst wint.</li>
      </ul>
      {F.meetings !== undefined ? (
        <>
          <h2 id="musters">Appels</h2>
          <p>Af en toe loopt je held in plaats van een gevecht de held van een andere speler tegen het lijf in hetzelfde gebied{F.meetings.level === undefined ? '' : `, vanaf niveau ${F.meetings.level}`}. Ze staan in de rij voor de soep, wisselen sterke verhalen uit of delen hun rantsoen, en beide helden krijgen hetzelfde kleine voordeel voor {F.meetings.boonAdventures} avonturen. Beide logboeken vertellen het verhaal met de openbare naam van de andere speler, en het tabblad Logboek toont de laatste vijf appels van je held.</p>
          <ul>
            {F.meetings.kinds.map((kind) => <li key={kind.id}><strong>{t.text(kind.name)}</strong>: {t.text(kind.effect)}, {boonLine(kind.modifiers)}.</li>)}
            <li>Niets wisselt van eigenaar. Een appel neemt de plaats van één avontuur in, en het voordeel maakt dat ongeveer goed.</li>
            <li>Het gebeurt even vaak, welke houding of klasse je ook hebt, ongeveer om de dag voor een held op patrouille. Helden ontmoeten elkaar alleen tijdens verkennen of rusten, en een held die net een appel had, wordt zo’n twaalf uur met rust gelaten.</li>
          </ul>
        </>
      ) : null}
      {F.lostProperty ? (
        <>
          <h2 id="strays">Verloren goed</h2>
          <p>Gaat je held buiten de muren knock-out, dan laat hij op de weg in dat gebied een reserve van zijn wapen of harnas vallen, met je openbare naam erin gekrast. Je held houdt alles wat hij droeg. Later kan de held van een andere speler die daar patrouilleert, het verloren stuk vinden in plaats van een gewone vondst, en je TRMNL vertelt je wie het vond.</p>
          <ul>
            <li>Je held kan op dezelfde manier verloren goed van andere spelers vinden. Het is gewone uitrusting: draag het, verkoop het, demonteer het of breng het naar de Smidse. Het komt met de basiswaarden van zijn soort en zeldzaamheid, zonder de verbeteringen van de eerste eigenaar.</li>
            <li>De naam blijft erop staan. De pagina Ransel en de kaart Verloren goed in het Logboek tonen van wie het was, net als je heldenpagina zolang je het hebt.</li>
            <li>Verloren goed vervangt alleen een vondst die je held toch al zou doen, dus niemand krijgt extra uitrusting. Opdrachtbeloningen en geschenken van het {GIFT_DAY} zijn altijd nieuwe uitrusting.</li>
            <li>Er ligt steeds maar één stuk van jou rond. Gaat je held opnieuw knock-out voordat iemand het vindt, dan vervangt het nieuwe stuk het oude.</li>
          </ul>
        </>
      ) : null}
      {F.todo !== undefined ? (
        <>
          <h2 id="garrison-orders">Garnizoensorders</h2>
          <p>Het bord van het fort hangt drie kleine orders voor je held op, zoals ‘Versla 4 Kelderrijpratten’, ‘Vind 2 stuks uitrusting’ of ‘Patrouilleer 16 avonturen lang in de Moonbight-fjorden’.{arrives('todo')} Hij werkt ze af op patrouille, en de pagina Held toont de voortgang van elke order. Is een order klaar, dan zegt je scherm dat en krijgt je held wat Auro: {en(F.todo.pay.map(String), 'of')}, afhankelijk van het gebied. Orders geven geen XP, dus ze hebben geen invloed op de ranglijsten.</p>
          <ul>
            <li>Elke ochtend om {F.todo.muster}, lokale tijd van je TRMNL, hangt het ochtendappel nieuwe orders op voor de afgeronde. Je scherm somt ze op.</li>
            <li>Orders verlopen nooit. Een vastgelopen order wordt na twee appels vanzelf geruild.</li>
            <li>Minstens twee van de drie orders kunnen worden gedaan waar je held is. Hooguit één vraagt een reis naar een ander gebied, als je je held daarheen wilt sturen.</li>
            <li>Eén keer tussen twee appels kun je op de pagina Held een onafgemaakte order ruilen voor een andere.</li>
          </ul>
        </>
      ) : null}
      <h2 id="draughts">Drankjes</h2>
      {F.potions === undefined
        ? <p>Een koperdrankje geeft 40% van de maximale HP van je held terug, naar boven afgerond. Je held drinkt er automatisch een als zijn HP op patrouille onder de drankjesgrens van zijn houding zakt, en het logboek noteert het. Zonder drankjes rust je held onder de rustgrens en gaat hij weer op pad als hij hersteld is. Je kunt er ook zelf een drinken via de pagina Held als je held verkent of rust en niet volledig gezond is. Drankjes vind je op patrouille en ze nemen nooit ruimte in de ransel in.</p>
        : <>
          <p>Koperdrankjes zijn er in {F.potions.strengths.length} sterktes: {en(F.potions.strengths.map((s) => `${name(s.name).toLowerCase()} (${s.healPct}%)`))}, en elk geeft dat deel van de maximale HP van je held terug, naar boven afgerond. Wat je vindt hangt af van waar je held is: {F.potions.drops.map((d) => `${zone(d.zone)} geeft ${d.rest.length === 0 ? 'alleen' : 'vooral'} ${name(`${d.top.toLowerCase()}s`)}${d.rest.length === 0 ? '' : `, met wat ${d.rest.map((r) => name(`${r.toLowerCase()}s`)).join(' en ')}`}`).join('; ')}. Een nieuwe held begint met drankjes, en de wisselaar en beslissingen onderweg delen ook drankjes uit. Alle sterktes delen één kist en nemen nooit ruimte in de ransel in.</p>
          <p>Je held drinkt automatisch als zijn HP op patrouille onder de drankjesgrens van zijn houding zakt: het zwakste drankje dat hem weer boven die grens brengt, of het sterkste dat hij heeft als geen zwakker drankje volstaat. Het logboek noemt wat hij dronk. Zonder drankjes rust je held onder de rustgrens en gaat hij weer op pad als hij hersteld is. Je kunt er ook zelf een drinken via de pagina Held als je held verkent, rust of reist en niet volledig gezond is; met meer dan één sterkte in de kist vraagt de pagina Held welke.</p>
          <p><strong>Combineren.</strong> Op de pagina Ransel worden {F.potions.combine.count} {name(`${F.potions.combine.from.toLowerCase()}s`)} en {F.potions.combine.materials.map((m) => `${m.n} ${name(m.name).toLowerCase()}`).join(', ')} één {name(F.potions.combine.to.toLowerCase())}. Combineren laat je nooit met meer drankjes achter dan ervoor, dus de kist kan niet overlopen. Het gebeurt alleen als jij ervoor kiest.</p>
        </>}
      <p>Drankjes zitten in een kist. Een nieuwe held heeft {t.nameWith(F.firstPouch.name, 'een')} waar er {F.firstPouch.size} in passen. Grotere kisten koop je met Auro op de pagina Ransel, één tegelijk: {rungs(F.shopPouches)}. Is de kist vol, dan wordt een gevonden drankje Auro.</p>
      <h2 id="the-serpentos-moneychanger">De Serpentos-wisselaar</h2>
      <p>Af en toe houdt een Serpentos-factor, een van de Dragu-wisselaars die met de bevoorradingsschepen meereizen, halt bij je held op patrouille. Je scherm zegt het, en de pagina Ransel toont tot drie aanbiedingen: een paar drankjes en de volgende kist of ransel{F.merchantOff > 0 ? ` met ${F.merchantOff}% korting op de prijs van de pagina Ransel` : ''}. Elke aanbieding verkoopt één keer. De factor trekt verder na vier avonturen of na je laatste aankoop.</p>
      <h2 id="decisions">Beslissingen</h2>
      <p>Soms vraagt de weg je held iets kleins, zoals bijdragen aan de stoofpot van de kok of een nachtwacht lopen op de palissade. Je scherm zegt dat er een beslissing wacht, en de pagina Held toont beide opties met precies wat elke optie verandert. Antwoord je niet binnen ongeveer een dag, dan wordt de optie die als standaard gemarkeerd is voor je gekozen.</p>
      <h2 id="effects">Effecten</h2>
      <p>Sommige momenten geven je held een kort effect, dat op de pagina Held staat met de avonturen die nog resten. Een elite verslaan maakt je held {t.text('Fired up')} (+10% aanval voor acht avonturen). Bijdragen aan de stoofpot geeft {t.text('Well fed')} (+10% XP voor acht avonturen). Een val laat je held {t.text('Bruised')} achter (−15% verdediging voor vier avonturen). Je held heeft hooguit drie effecten. Elke rust haalt slechte effecten weg, en een knock-out wist ze allemaal.</p>
      {F.standoff !== undefined ? (
        <>
          <h2 id="dug-in-elites">Ingegraven elites</h2>
          <p>Vanaf niveau {F.standoff.minLevel}, in {zone(F.standoff.zone)} en de gebieden daarachter, graaft een elite zich soms in in plaats van in één gevecht te vallen. Je TRMNL toont hem met zijn gezondheidsbalk, en je held gaat elk avontuur terug tot hij valt.</p>
          <ul>
            <li>Elk avontuur vecht je held tot zes rondes tegen hem, en zijn gezondheid blijft staan. Hij slaat veel harder dan een gewone elite, en je held vecht door voorbij de rustgrens van zijn houding voordat hij terugtrekt, dus een confrontatie kan in een knock-out eindigen. Afbreken kost geen Auro.</li>
            <li>Valt hij, dan levert hij {F.standoff.xp} keer de XP van het wezen en {F.standoff.gold} keer zijn Auro op, plus een zeldzame of epische vondst uit dat gebied.</li>
            <li>Hij vertrekt na {F.standoff.hours} uur, of eerder als je held knock-out gaat of reist. Een pauze houdt de klok niet tegen.</li>
            <li>De pagina Held toont zijn gezondheid en wanneer hij vertrekt. Daar kun je weglopen, en reizen vraagt het eerst voordat je hem achterlaat.</li>
          </ul>
        </>
      ) : null}
      <h2 id="sky-calendar">De hemel en de kalender</h2>
      <p>Twaalf geketende manen hangen boven Volta, één voor elke Astrale Warden, en de strook bovenaan de scène van je held toont ze in Gyre-volgorde: Geketende Maagd, Leviathan, Wyrm, Magnus, Bloeiende Gruwel, Sluierhond, Verrader, Verbondenen, Eldritch Beest, Titaan, Eclips en Wachter. De verlichte kant van elke maan volgt zijn eigen periode, van de ene dag van de Wachter tot het jaar van de Maagd, en de volste maan van de dag draagt een halo. De maan van de Maagd is een dode schil en wordt altijd gebarsten getekend. De hemel wordt, net als de datum in de titelbalk, alleen uit de klok berekend en verandert niets aan het spel.</p>
      {F.occasions !== undefined ? (
        <>
          <p>Bepaalde dagen van het jaar zijn hemelgebeurtenissen die de scène van je held versieren: versiering bovenaan, iets op de grond, soms een hoed, en in {SAFE} een ander uitzicht voorbij de palissade. Ze volgen de lokale datum van je TRMNL. De eerste keer dat je held er een ziet, noemt het logboek hem, en de meeste geven zolang ze duren een kleine bonus. De pagina Held toont de gebeurtenis van vandaag en de volgende.</p>
          <ul>
            {F.occasions.map((rule) => <li key={rule.id}><strong>{t.text(rule.name)}</strong>, {occasionDate(rule)}: {rule.id === 'friday_13th' ? 'elke kampraid loopt mis (zie hieronder).' : rule.effectLabel ? `${t.text(rule.effectLabel)}.` : 'alleen versiering.'}</li>)}
          </ul>
          <p><strong>{ILL_OMEN}.</strong> Kampraids beginnen twee keer zo vaak, en ze lopen allemaal mis: niemand wint, en beide helden verliezen 20% van hun maximale HP en 5% van hun Auro, dat niemand krijgt. Het raidoverzicht van je held telt het als ongelukje.</p>
          <p><strong>{GIFT_DAY}.</strong> Je held vindt één ingepakt geschenk: een stuk uitrusting uit het gebied waar hij is, bij zijn eerste avontuur van de drie dagen.</p>
        </>
      ) : null}
      <h2 id="rare-and-epic-gear">Zeldzame en epische uitrusting</h2>
      <p>Uitrusting is gewoon, ongewoon, zeldzaam of episch. Episch is het zeldzaamst, ongeveer één vondst op honderd, en het sterkst. Zeldzame en epische uitrusting draagt ook een eigenschap van het Sterrensmeden, die in de naam staat en op de pagina Ransel wordt uitgelegd. Elke eigenschap volgt de metaalkunde van de Obsidianiden: een metaal dat in het stuk is verwerkt, leent het één eigenschap.</p>
      <ul>
        <li><strong>{name(affixName('vampiric'))}</strong> geneest na elke overwinning 5% van de maximale HP, want koper geneest.</li>
        <li><strong>{name(affixName('lucky'))}</strong> geeft 20% meer Auro uit overwinningen en vondsten.</li>
        <li><strong>{name(affixName('sturdy'))}</strong> krijgt 40% minder schade van vallen.</li>
        <li><strong>{name(affixName('thrifty'))}</strong> verliest 5 punten minder Auro als het misgaat: een terugtocht kost geen Auro in plaats van 5%, en een knock-out kost 5% in plaats van 10%.</li>
      </ul>
      <h2 id="when-your-pack-fills-up">Als je ransel vol raakt</h2>
      <p>Een nieuwe held begint met een schoudertas waar 6 stuks uitrusting in passen. Gedragen uitrusting en drankjes nemen geen ruimte in. Is de ransel vol, dan houdt je held het volgende stuk dat hij vindt voor je vast en gaat hij door met avonturen. Zolang dat stuk wacht, blijven verdere vondsten liggen tot je ruimte maakt.</p>
      <h2 id="bigger-packs">Grotere ransels</h2>
      <p>Je ransel groeit met Auro. {F.tote ? `Je held krijgt binnen de eerste paar uur ${t.nameWith(F.tote.name, 'een')} (${F.tote.size}) uitgereikt. ` : ''}Daarna koop je grotere ransels op de pagina Ransel, één tegelijk: {rungs(F.shopBags)}, tot {F.topBag} plekken. Er zijn geen niveau-eisen, en ransels vallen nooit als buit.</p>
      <ol className="[&_li]:list-decimal">
        <li>Open Ransel in de app. Draag eventuele verbeteringen en verkoop overbodige uitrusting om ruimte te maken.</li>
        <li>Wordt er een vondst bewaard, kies dan Vondst ophalen. Laat daarna minstens één plek vrij, zodat de avonturen verder kunnen.</li>
        <li>Is er een plek vrij en wacht er niets, dan gaan de avonturen binnen 15 minuten vanzelf verder. Tot die tijd kun je op de pagina Ransel nog een ander open gebied kiezen.</li>
      </ol>
      <p>Uitrusting dragen maakt geen plek vrij. Uitrusting verkopen of demonteren, of een grotere ransel kopen, wel, en de bewaarde vondst gaat meteen de ransel in. De pagina Ransel kan ook met één tik je zwakste reserve verkopen en de vondst houden. Ook de slaapstand van je TRMNL houdt het spel nooit tegen.</p>
      {F.workbench !== undefined ? <>
        <h2 id="salvage-and-the-forge">Demonteren en de Smidse</h2>
        <p>{F.workbench.level !== undefined ? `Vanaf niveau ${F.workbench.level} heeft o` : 'O'}verbodige uitrusting {F.workbench.level !== undefined ? '' : 'heeft '}twee uitwegen uit de ransel: verkopen voor Auro, of demonteren tot stellazia-scherven op de pagina Ransel. Demonteren levert op naar de trede waarop het stuk is gevonden, in eenheden van de scherf van zijn zeldzaamheid: {F.workbench.materials.map((m) => `${name(m.name).toLowerCase()} uit ${m.rarities.map((r) => rarityNl[r] ?? r).join(' en ')} uitrusting`).join(', ')}. Epische uitrusting levert {F.workbench.epicMultiplier} keer zoveel op. Scherven nemen geen ruimte in de ransel in en worden nooit verkocht. Uitrusting wordt alleen gedemonteerd als jij dat kiest.{F.workbench.level !== undefined ? ` Verkoop vóór niveau ${F.workbench.level} je reserves: de eerste opwaardering vraagt toch niveau ${F.workbench.level}.` : ''}</p>
        <p>De Smidse is Sterrensmeden op de schaal van het fort: ze besteedt scherven en Auro aan de uitrusting die je held draagt, terwijl hij die aanhoudt. Het stuk houdt zijn naam en eigenschap, alleen de getallen veranderen. Elk stuk heeft één volgende stap. {F.workbench.tiers.map((s, k) => `${k === 0 ? 'Een stuk van trede 1 naar Mk II brengen' : 'Van Mk II naar Mk III'} kost ${price(s)}`).join('; ')}; een stuk kan alleen naar een trede die je held op zijn niveau zou kunnen dragen. Is een stuk Mk III (of zo gevonden), dan voegt versterken per stap één punt toe: {F.workbench.reinforce.map((s) => `+${s.to} voor ${price(s)}`).join(', ')}. {F.workbench.reinforce.length > 0 ? `Na +${F.workbench.reinforce.at(-1)!.to} is het stuk af.` : ''} Zeldzame en epische uitrusting kan ook een eigenschap naar keuze krijgen voor {price(F.workbench.affix)}, in plaats van de huidige.</p>
        <p>Opwaarderen lukt altijd. Een opgewaardeerd stuk demonteren geeft niet terug wat je eraan uitgaf, dus waardeer alleen uitrusting op die je wilt blijven dragen.</p>
      </> : null}
      <h2 id="getting-knocked-out">Knock-out gaan</h2>
      <p>Je held komt na ongeveer twee uur vanzelf weer bij en keert terug naar {SAFE}. Je houdt je XP en uitrusting, maar verliest 10% van je huidige Auro.</p>
      <h2 id="recaps">Samenvattingen</h2>
      <p>Je scherm toont een korte samenvatting van de laatste afgeronde nacht of dag, in de lokale tijd van je TRMNL. Om 07:00 beslaat de nachtsamenvatting 19:00 tot 07:00 en blijft die de hele dag staan. Om 19:00 beslaat de dagsamenvatting 07:00 tot 19:00 en blijft die de hele avond en nacht staan. De scène toont dag en nacht op dezelfde tijden. De verhalen erboven zijn altijd de nieuwste.</p>
      <h2 id="understanding-rankings">Hoe de ranglijsten werken</h2>
      <p>Het scherm toont de Top 5 XP van deze week voor je niveaugroep, met je eigen regel gemarkeerd, of onder de lijst toegevoegd als je lager staat. De app biedt ook de lijst van vandaag en een lijst aller tijden. De dag begint om 00:00 UTC en de week op maandag om 00:00 UTC, net als bij de zegels. De ranglijsten verschijnen elk uur, dus een recent avontuur of een nieuw niveau kan al te zien zijn voordat je plek wordt bijgewerkt.</p>
      <p>Gepauzeerde en gestopte helden houden hun voortgang. Een held zonder XP deze week verdwijnt van de weeklijst tot hij weer XP verdient. De voortgang van aller tijden blijft bewaard.</p>
      <h2 id="sharing-your-hero">Je held delen</h2>
      <p>Je held heeft een openbare pagina met zijn niveau, plek, huidige gebied, totalen en opmetingsvermeldingen. Auro en het avonturenlogboek worden nooit getoond, en uitrusting alleen als het verloren goed van een andere speler is dat je held vasthoudt. Je naam linkt naar de pagina vanuit de ranglijsten en vanuit raids en appels van andere spelers, en daar volgen andere spelers je. In Instellingen staan de knoppen Delen en Link kopiëren, en een gedeelde link toont een kaart met een afbeelding van je held, zijn naam, niveau en plek. Wil je hem verbergen, kies dan Mijn heldenpagina verbergen in Instellingen. Hij is meteen weg, en zolang hij verborgen is, kan niemand je volgen.</p>
      <h2 id="following">Volgen</h2>
      <p>Als je bent ingelogd, kun je een andere speler volgen via zijn openbare heldenpagina, tot 20 spelers. Iedereen die je volgt staat onder Ranglijsten, met het niveau van hun held, hun plek en waar ze zijn, en links naar hun pagina’s. Volgen verandert niets aan het spel, en niemand krijgt te horen dat je hem volgt. Kampraids kiezen hun doelen willekeurig uit iedereen, dus iemand volgen stuurt je held nooit op hem af. Verbergt een speler zijn pagina, dan zie je alleen zijn naam tot hij hem weer toont. Wijzigt hij zijn openbare naam, dan valt hij van je lijst.</p>
      <h2 id="names">Namen</h2>
      <p>Je hebt twee namen. De naam van je held staat op je TRMNL, in de ranglijsten en op je heldenpagina; wil je die wijzigen, laat dan via het tabblad Meer de klerk van het fort de monsterrol aanpassen, voor 200 Auro. De klerk neemt één aanpassing per dag aan. Je openbare naam ben jij, in elk TRMNL-spel: hij staat naast je held in de ranglijsten, in raids en appels van andere spelers en in de link naar je pagina. Je kunt hem eens per 7 dagen gratis wijzigen via Account. Links naar je oude pagina werken dan niet meer, en niemand anders kan je oude naam 7 dagen lang nemen.</p>
      <h2 id="looks">Uiterlijk</h2>
      <p>Je stelt het uiterlijk van je held samen als je hem aanmaakt: afkomst, bouw, hoofd, haar, rug, accessoire en wapenrok. Elf volkeren van Volta kunnen de eed van de Schildknaap afleggen, van de kleine Aquaniden, Lunaris en Dragu tot de torenhoge Crystalkin. Het verandert alleen hoe je held eruitziet op je TRMNL, je heldenpagina en in appels van andere spelers. Elk uiterlijk speelt hetzelfde. Ook de naam is aan jou: de maker kan een naam voorstellen in de taal van de afkomst die je kiest. Wil je het uiterlijk later wijzigen, ga dan naar de kampspiegel via je heldenpagina of het tabblad Meer. Gratis, wanneer je wilt.</p>
      <h2 id="alerts">Meldingen</h2>
      <p>Je TRMNL is de belangrijkste manier om je held te volgen, maar Instellingen kan je in twee gevallen ook een melding op je telefoon sturen, elk uit tot je het aanzet:</p>
      <ul>
        <li><strong>Ransel vol:</strong> de ransel is vol en je held houdt een vondst voor je vast. Komt een halfuur nadat de ransel volraakte, dus er komt niets als je hem al aan het opruimen bent, en één keer per keer dat hij volraakt.</li>
        <li><strong>Koopje van de wisselaar:</strong> een Serpentos-factor verkoopt de volgende ransel of kist{F.merchantOff > 0 ? ` met ${F.merchantOff}% korting` : ''} en je held heeft het Auro. Hooguit één keer per dag. Een factor met alleen drankjes stuurt er nooit een.</li>
      </ul>
      <p>Je krijgt hooguit twee meldingen per dag. Stille uren lopen van 21:00 tot 08:00, tenzij je ze wijzigt: een melding over een volle ransel wacht tot ze voorbij zijn, en een koopje dat dan opduikt, wordt overgeslagen. Voor het versturen controleert het spel of de melding nog klopt, dus je hoort nooit over een ransel die je al hebt opgeruimd of een aanbieding die al weg is. Beslissingen, raids, knock-outs, nieuwe niveaus en zegels sturen nooit meldingen.</p>
      <p>Kies Toestaan op dit apparaat in Instellingen en accepteer daarna de vraag van je browser. Zet op iPhone en iPad eerst de app op je beginscherm (Deel, dan Zet op beginscherm) en open hem vanaf daar. Elk apparaat dat je toestaat, staat in Instellingen met een knop Verwijderen; het laatste verwijderen zet de meldingen uit.</p>
      <h2 id="troubleshooting">Problemen oplossen</h2>
      <h3 id="not-on-your-screen">Je held staat niet op je scherm</h3>
      <ul>
        <li>Op Opslaan klikken zet Wardenwatch in je TRMNL-afspeellijst. Je apparaat toont de afspeellijst één plugin tegelijk, in zijn verversingstempo, dus Wardenwatch verschijnt als hij aan de beurt is. Met meerdere plugins en traag verversen kan dat even duren.</li>
        <li>Open de afspeellijst in TRMNL en controleer of Wardenwatch erin staat, op het apparaat waar je naar kijkt als je er meer hebt, en of geen planning hem op dit tijdstip verbergt.</li>
        <li>Slaapstand stopt het verversen van het scherm ’s nachts. Je held gaat door met avonturen, en het scherm haalt bij als het apparaat wakker wordt.</li>
        <li>Een scherm met ‘Het eerste avontuur begint binnen 15 minuten’ werkt. Het eerste verhaal komt bij het volgende kwartier.</li>
        <li>De pagina Held in de app toont altijd wat je held doet, wat het scherm ook laat zien.</li>
      </ul>
      <h3 id="if-the-screen-looks-old">Het scherm lijkt oud</h3>
      <ul>
        <li>‘Updates lopen vertraging op’ betekent dat de spelservice achterloopt. De voortgang van je held blijft bewaard, en het scherm haalt bij zodra de service dat doet.</li>
        <li>Is de website van de app actueel maar het scherm niet, controleer dan in TRMNL de verversingsinstelling van de plugin en zijn plek in de afspeellijst.</li>
        <li>Avonturen draaien elk kwartier, op het hele uur en om :15, :30 en :45 in de tijdzone van je TRMNL. Het scherm toont geen aftelling; de tijd naast elk verhaal is wanneer het gebeurde, en de app toont het volgende avontuur.</li>
        <li>Heb je ontkoppeld of verwijderd, installeer dan opnieuw vanuit TRMNL. Je held houdt al zijn voortgang.</li>
      </ul>
      <h2 id="disconnecting-and-removing">Ontkoppelen en verwijderen</h2>
      <p>
        Ontkoppelen stopt nieuwe schermen voor die installatie. TRMNL kan de laatste afbeelding blijven tonen tot je de plugin uit je afspeellijst haalt; we
        kunnen geen afbeelding wissen die al op je apparaat staat.
      </p>
      <h2 id="help">Hulp</h2>
      <p>
        Mail <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> voor hulp met je account of koppeling. We proberen binnen twee werkdagen te antwoorden.
      </p>
    </>
  ),
}
