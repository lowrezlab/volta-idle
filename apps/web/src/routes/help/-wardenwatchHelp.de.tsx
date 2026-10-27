import { contentTranslator } from '@trmnl-games/wardenwatch/i18n/lazy'
import { WARDENWATCH_INSTALL_URL, SUPPORT_EMAIL } from '../../lib/prose'
import { affixName, HELP_FACTS as F, nextTableDate, occasionName, signed, type Cost, type Modifiers, type Occasion } from './-wardenwatchFacts'
import type { HelpPage } from './-wardenwatchHelp'
import { WARDENWATCH_HELP_HEAD } from './-helpHeads'

const t = contentTranslator('de')
const n = (value: number) => t.number(value)
const auro = (value: number) => `${n(value)} Auro`
const und = (parts: readonly string[], last = 'und') => (parts.length <= 1 ? parts.join('') : `${parts.slice(0, -1).join(', ')} ${last} ${parts.at(-1)}`)
const name = (english: string) => t.name(english)
const rungs = (list: readonly { name: string; size: number; price: number }[]) => und(list.map((rung) => `${name(rung.name)} (${rung.size}) für ${auro(rung.price)}`))
const price = (c: Cost) => `${und(c.materials.map((m) => `${m.n} ${name(m.name)}`))} plus ${auro(c.gold)}`
const boonLine = (m: Modifiers) => [m.attackPct ? `${signed(m.attackPct)} % Angriff` : '', m.defensePct ? `${signed(m.defensePct)} % Verteidigung` : '', m.xpPct ? `${signed(m.xpPct)} % XP aus Siegen` : '', m.goldPct ? `${signed(m.goldPct)} % Auro` : '', m.trapDamagePct ? `Fallen tun ${m.trapDamagePct} % weniger weh` : ''].filter(Boolean).join(', ')
const ZONES_LINE = und(F.zones.filter((b) => b.level > 1).map((b) => `${t.nameWith(b.name, 'der')} auf Stufe ${b.level}`))
const arrives = (feature: 'todo' | 'stances' | 'choices' | 'merchant' | 'raids') => (F.unlocks === undefined ? '' : ` Verfügbar ab Stufe ${F.unlocks[feature]}.`)
const SAFE = name(F.zones[0]?.name ?? 'Castellum Frigo')
const ILL_OMEN = t.text(occasionName('friday_13th', 'Tag des bösen Omens'))
const GIFT_DAY = t.text(occasionName('christmas', 'Mittwinterfest'))
const rarityDe: Record<string, string> = { common: 'gewöhnlicher', uncommon: 'ungewöhnlicher', rare: 'seltener', epic: 'epischer' }

const MONTHS = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember']
const WEEKDAYS = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag']
const NTH = ['erste', 'zweite', 'dritte', 'vierte', 'fünfte']
function occasionDate(rule: Occasion): string {
  const date = rule.date
  const span = rule.days > 1 ? `, ${rule.days} Tage lang` : ''
  switch (date.kind) {
    case 'fixed':
      return `${date.day}. ${MONTHS[date.month - 1]}${span}`
    case 'nth_weekday': {
      const base = `der ${NTH[date.nth - 1]} ${WEEKDAYS[date.weekday]} im ${MONTHS[date.month - 1]}`
      const offset = date.offsetDays ?? 0
      return `${offset === 0 ? base : `der ${WEEKDAYS[(date.weekday + offset) % 7]} nach dem ${NTH[date.nth - 1]}n ${WEEKDAYS[date.weekday]} im ${MONTHS[date.month - 1]}`}${span}`
    }
    case 'friday_13th':
      return 'jeder Freitag, der 13.'
    case 'easter':
      return date.offsetDays === -2 ? 'Karfreitag bis Ostermontag' : `${Math.abs(date.offsetDays)} Tage ${date.offsetDays < 0 ? 'vor' : 'nach'} Ostersonntag${span}`
    case 'table': {
      const next = nextTableDate(date.dates)
      return next === null ? 'ein Datum, das sich jedes Jahr ändert' : `ein Datum, das sich jedes Jahr ändert (nächstes Mal ${next.getUTCDate()}. ${MONTHS[next.getUTCMonth()]} ${next.getUTCFullYear()})`
    }
  }
}

export const de: HelpPage = {
  seoTitle: WARDENWATCH_HELP_HEAD.de.seoTitle,
  description: WARDENWATCH_HELP_HEAD.de.description,
  title: 'Wardenwatch auf TRMNL',
  contents: {
    'getting-started': 'Erste Schritte', 'if-the-qr-sends-you-back-to-setup': 'Wenn der QR-Code zur Einrichtung führt', 'how-time-works': 'Wie die Zeit vergeht', zones: 'Gebiete', seals: 'Siegel', commissions: 'Aufträge', 'heroes-and-classes': 'Helden und Klassen', stances: 'Haltungen', 'camp-raids': 'Lagerüberfälle', musters: 'Appelle', strays: 'Verlorenes Gut', 'garrison-orders': 'Garnisonsbefehle', draughts: 'Tränke', 'the-serpentos-moneychanger': 'Der Serpentos-Wechsler', decisions: 'Entscheidungen', effects: 'Effekte', 'sky-calendar': 'Himmel und Kalender', 'rare-and-epic-gear': 'Seltene und epische Ausrüstung', 'when-your-pack-fills-up': 'Wenn das Gepäck voll ist', 'bigger-packs': 'Größeres Gepäck', 'salvage-and-the-forge': 'Zerlegen und die Schmiede', 'getting-knocked-out': 'K. o. gehen', recaps: 'Rückblicke', 'understanding-rankings': 'Ranglisten verstehen', 'sharing-your-hero': 'Deinen Helden teilen', 'following': 'Folgen', names: 'Namen', looks: 'Aussehen', alerts: 'Benachrichtigungen', troubleshooting: 'Fehlerbehebung', 'disconnecting-and-removing': 'Trennen und entfernen', help: 'Hilfe',
  },
  Body: () => (
    <>
      <h2 id="getting-started">Erste Schritte</h2>
      <ul>
        <li>Öffne <a href={WARDENWATCH_INSTALL_URL}>Wardenwatch im TRMNL-Marktplatz</a> und wähle Installieren.</li>
        <li>Melde dich bei Wardenwatch an, wähle einen öffentlichen Namen, gib deinem Knappen einen Namen und ein Aussehen und verbinde die Installation.</li>
        <li>Klicke zurück in TRMNL auf Speichern. Das erste Abenteuer deines Helden beginnt innerhalb von 15 Minuten.</li>
        <li>Füge das Plugin einer Playlist hinzu, oder einem Mashup, wenn dein Held neben anderen Plugins stehen soll. Alle vier Layoutgrößen werden unterstützt.</li>
      </ul>
      <h2 id="if-the-qr-sends-you-back-to-setup">Wenn der QR-Code zur Einrichtung führt</h2>
      <p>Der QR-Code öffnet die Begleit-App für das Konto, mit dem du angemeldet bist. Er startet keine neue Installation. Prüfe die angemeldete E-Mail-Adresse auf der Einrichtungsseite und nutze Konto wechseln, wenn du ursprünglich mit einem anderen Konto verbunden hast.</p>
      <p>Steht bei der Einrichtung „Wardenwatch neu verbinden“, gibt es deine TRMNL-Verbindung, aber der Held fehlt. Das kann nach einem Spiel-Reset passieren. Installiere eine frische Kopie von <a href={WARDENWATCH_INSTALL_URL}>Wardenwatch aus TRMNL</a>, melde dich mit demselben Konto an, wähle einen neuen Heldennamen, verbinde und klicke dann in TRMNL auf Speichern. Sobald die neue Kopie läuft, entferne die alte aus deiner Playlist.</p>
      <p>Steht bei der Einrichtung „In TRMNL speichern, um zu starten“, ist dein Held schon bereit. Geh in TRMNL zu dieser Installation zurück und klicke auf Speichern.</p>
      <h2 id="how-time-works">Wie die Zeit vergeht</h2>
      <p>
        Die Spielwelt läuft alle 15 Minuten weiter, egal ob dein Bildschirm an ist. Dein TRMNL zeigt eine Momentaufnahme und aktualisiert sich nach eigenem Zeitplan.
        Schlafmodus, langsamere Aktualisierung und andere Playlist-Einträge verringern nie den Fortschritt deines Helden. Abenteuerzeiten in der Begleit-App folgen der Zeitzone deines Browsers.
      </p>
      <p>
        Die Titelleiste deines TRMNL trägt das Volta-Datum, etwa „Rime Ascendant 4 · Gyre des Wyrms 1203“. Ein Volta-Tag ist ein Durchgang von Myrkos dem Wächter über den Himmel und dauert einen echten Tag. Neun Tage bilden eine Achse (Ascendant, Skybottom, Descendant, Midheaven), vier Achsen einen Kardinalzyklus (Rime, Echo, Gloam, Grave, Melt, Verd, Tan, Shade, Molt, Tanhaus) und zehn Zyklen ein Jahr von 360 Tagen, jedes Jahr der Reihe nach unter einem der zwölf Wächter. Die Zählung begann am 1. Rime Ascendant 1203, im Gründungsjahr von Castellum Frigo. Das Datum ist nur Zählung: Die Simulation läuft in echter Zeit.
      </p>
      <h2 id="zones">Gebiete</h2>
      <p>Ur-Turuls Karte hat {F.zones.length} Gebiete, und dein Held beginnt in {SAFE}, dem halbfertigen Fort der Expedition am Ostufer der Urwildnis. Jedes öffnet auf einer bestimmten Stufe, ob du es besuchst oder nicht: {ZONES_LINE}. Dein TRMNL vermerkt dann neues Land auf der Karte; ob du hinreist, entscheidest du über die Karte auf der Helden-Seite. Gebiete weiter vom Fort haben zähere Kreaturen, mehr Auro, stärkere Tränke und besser bezahlte Garnisonsbefehle. {SAFE} kann keinen Helden k. o. schlagen; jedes andere Gebiet schon.</p>
      <ul>
        {F.zones.map((z) => <li key={z.id}><strong>{name(z.name)}</strong>{z.level > 1 ? ` (Stufe ${z.level})` : ' (von Anfang an)'}: {z.monsters.map(name).join(', ')}.</li>)}
      </ul>
      {F.lore ? <p>Die Seite Feldnotizen unter Mehr bewahrt auf, was Ur-Turuls Erhebung über jedes Gebiet und jede Kreatur festgehalten hat. Die Notiz zu einem Gebiet öffnet sich, wenn dein Held es zum ersten Mal betritt, die zu einer Kreatur mit dem ersten Sieg darüber. Notizen haben keinen Einfluss aufs Spiel.</p> : null}
      <h2 id="seals">Siegel</h2>
      <p>Lass Wardenwatch in deiner Playlist und achte in der Titelleiste des Bildschirms auf den Siegelcode, sechs Ziffern wie 482 917 (schmale Hochformat-Mashups kürzen seine Beschriftung). Gib den Code in den Einstellungen der Begleit-App ein, um ein dauerhaftes Wachssiegel in deine Sammlung zu drücken. Vollbild und Mashups zeigen ihn beide; die Vorschau in der Begleit-App blendet ihn aus. Solange ein Siegel wartet, holt es auch der QR-Code auf dem Bildschirm ab: Scanne ihn mit dem Handy, und die Begleit-App stellt es in dein Regal, auch bei ausgeblendeter Titelleiste. Wo Platz ist, steht der Code daneben.</p>
      <p>Du kannst jede Woche ein Siegel sammeln, mit einem neuen Code ab Montag 00:00 UTC. Der Code der Vorwoche funktioniert auch, wenn dein Bildschirm sich langsam aktualisiert. Verpasst du eine Woche, bekommst du dasselbe Siegel in der Woche danach. Nach dem kompletten Satz kannst du weitere Exemplare jedes Siegels sammeln. Siegel ändern weder XP noch Ausrüstung noch Ranglisten, und mehrere Geräte oder schnellere Aktualisierung bringen nichts extra.</p>
      {F.career !== undefined ? (
        <>
          <h2 id="commissions">Aufträge</h2>
          <p>Dein Held hat immer ein Ziel vom Kommandanten des Forts, oben auf der Helden-Seite: „Gewinne deinen ersten Kampf“, „Rüste ein gefundenes Ausrüstungsteil aus“, „Reise zu den Moonbight-Fjorden“, „Kaufe das Pilgergepäck“. Manche erreicht er auf Abenteuern; den Rest erledigst du hier, auf der Gepäck- oder Helden-Seite. Ein erreichtes Ziel wird auf deinem TRMNL angekündigt und legt etwas Auro zurück ({n(F.career.gold)} über die ganze Leiter); drück auf der Helden-Seite auf Abholen, um es einzusammeln. Ziele geben keine XP und laufen nie ab, und das nächste beginnt, ob du abgeholt hast oder nicht.</p>
          <ul>
            <li>Die Seite Aufträge unter Mehr listet die {F.career.goals} Ziele der Reihe nach, mit dem Datum, an dem du jedes erreicht hast. Ein Ziel, das du schon erfüllt hattest, als die Leiter kam, zählt als erreicht. Die Ränge auf dem Weg sind Knappe, Geschworener, Bannerträger und Wächter-Geschworener.</li>
            {F.unlocks !== undefined ? <li>Funktionen kommen mit der Stufe, ob du vorbeischaust oder nicht: Garnisonsbefehle auf Stufe {F.unlocks.todo}, Haltungen auf Stufe {F.unlocks.stances}, Entscheidungen unterwegs auf Stufe {F.unlocks.choices}, {F.meetings?.level !== undefined ? `Appelle mit Kameraden auf Stufe ${F.meetings.level}, ` : ''}{F.workbench?.level !== undefined ? `Zerlegen und die Schmiede auf Stufe ${F.workbench.level}, ` : ''}der Serpentos-Wechsler auf Stufe {F.unlocks.merchant} und Lagerüberfälle auf Stufe {F.unlocks.raids}. Dein TRMNL kündigt jede an. Auch die Gebiete öffnen nach Stufe: {ZONES_LINE}.</li> : null}
            <li>Wenn die Haltungen freigeschaltet werden, hat dein Held noch keine und spielt Standhaft. Ein Ziel bittet dich, eine zu wählen; jede der drei zählt, und du kannst sie später ändern.</li>
            <li>Ein paar frühe Ziele kommen garantiert rechtzeitig: der erste Kampf nach wenigen Abenteuern, ein Ausrüstungsteil im ersten Dutzend und eine erste Entscheidung, ein erster Wechsler und eine erste Elite etwa einen Tag nach ihrer Stufe. Alles andere ist Glückssache.</li>
          </ul>
        </>
      ) : null}
      {F.classes !== undefined ? (
        <>
          <h2 id="heroes-and-classes">Helden und Klassen</h2>
          <p>Alle beginnen als Ritter. Erreicht dein Ritter Stufe {F.rosterLevel}, kündigt dein TRMNL einen zweiten Helden an, und du kannst auf der Seite Helden unter Mehr einen Assassinen anwerben. Der Assassine beginnt auf Stufe 1 mit eigenem Namen, Aussehen, eigener Ausrüstung, eigenem Auro, eigenen Tränken und Zielen.</p>
          <ul>
            <li>Es geht immer nur ein Held auf Abenteuer, und den zeigt dein TRMNL und die Ranglisten. Der andere bleibt, wo du ihn gelassen hast. Er geht nicht auf Abenteuer und holt nichts nach, und ein Wechsler, der ihn besucht, zieht weiter.</li>
            <li>Du kannst einmal am Tag wechseln. Direkt innerhalb von zehn Minuten zurückzuwechseln zählt nicht. Ein Held, der k. o. oder unterwegs ist, muss sich erst erholen oder ankommen.</li>
            <li>Du kannst einen Helden jeder Klasse haben. Einträge in der Erhebung gehören dir, egal welcher Held sie holt; ein paar gehören nur dem Assassinen.</li>
            <li><strong>Ritter</strong>: {t.text(F.classes.warriorBlurb)}</li>
            <li><strong>Assassine</strong>: {t.text(F.classes.rogueBlurb)} {F.classes.rogue.hpPct} % LP, Angriff {signed(F.classes.rogue.attackPct)} %, Verteidigung {signed(F.classes.rogue.defensePct)} %, {signed(F.classes.rogue.goldPct)} % Auro aus jedem Kampf und Fund und {F.classes.rogue.raidEdgePct} Punkte auf seiner Seite bei jedem Lagerüberfall. Er steigt im Tempo des Ritters auf, wird aber etwas öfter k. o. geschlagen.</li>
          </ul>
        </>
      ) : null}
      <h2 id="stances">Haltungen</h2>
      <p>Wähle auf der Helden-Seite, wie weit dein Held geht, bevor er rastet.{arrives('stances')} Die Haltung gilt ab dem nächsten Abenteuer, und du kannst sie jederzeit ändern. Dein TRMNL zeigt sie neben der Gepäckzahl, unter einer Anzeige, deren Nadel bei Wachsam unten, bei Standhaft in der Mitte und bei Tollkühn oben steht.</p>
      <ul>
        <li><strong>Wachsam</strong> trinkt einen Trank unter 65 % LP, ruht unter 50 % und zieht bei 90 % wieder los. Bekommt 90 % der üblichen XP aus Siegen.</li>
        <li><strong>Standhaft</strong>, die Garnisonsregel und Standardeinstellung, trinkt unter 50 %, ruht unter 35 % und zieht bei 75 % wieder los, mit den üblichen XP.</li>
        <li><strong>Tollkühn</strong> trinkt unter 35 %, ruht unter 20 % und zieht bei 60 % wieder los. Bekommt 115 % XP aus Siegen, wird aber öfter k. o. geschlagen.</li>
      </ul>
      <p>{SAFE} kann keinen Helden k. o. schlagen, also hat Tollkühn innerhalb der Mauern kein Risiko. In jedem anderen Gebiet kostet ein K. o. Auro und schickt deinen Helden nach {SAFE} zurück, und Tollkühn erwischt es am häufigsten.</p>
      <h2 id="camp-raids">Lagerüberfälle</h2>
      <p>Auf Patrouille gehen Knappen manchmal gegenseitig durch ihre Ausrüstung. Jeder aktive Held{F.unlocks === undefined ? '' : ` ab Stufe ${F.unlocks.raids}`} überfällt und wird automatisch überfallen. Du kannst keinen Überfall starten und kein Ziel wählen.{F.unlocks === undefined ? '' : ` Unter Stufe ${F.unlocks.raids} überfällt ein Held niemanden und wird nicht überfallen.`} Der Überfall erscheint im Abenteuerlog beider Helden mit dem öffentlichen Namen des anderen Spielers, und die Helden-Seite führt eine Liste der Überfälle deines Helden.</p>
      <ul>
        <li>Wer gewinnt, ist ein Münzwurf, den nur die Haltung verschiebt. Stufe, Ausrüstung und Effekte zählen nie. Wachsam legt 10 Punkte auf seine Seite, Standhaft nichts, und Tollkühn nimmt 5 weg, beim Angriff wie in der Verteidigung.</li>
        <li>Wie oft dein Held überfällt, hängt auch von der Haltung ab: Wachsam etwa jeden zweiten Patrouillentag, Standhaft etwa einmal am Tag, Tollkühn etwa zweimal am Tag.</li>
        <li>Der Verlierer gibt dem Gewinner 5 % seines Auro, Auro wechselt also nur den Besitzer. Beide verlieren LP: der Verlierer 30 % seiner max. LP, der Gewinner 10 %. Ausrüstung mit {name(affixName('thrifty'))} zieht ihre Punkte vom Auro-Verlust ab.</li>
        <li>Ein Überfall kann einen Helden k. o. schlagen, genau wie ein Kampf; in {SAFE} wird dein Held stattdessen gerettet. Überfälle treffen nur Helden, die erkunden oder ruhen, und ein überfallener Held hat danach etwa sechs Stunden Ruhe.</li>
        <li>Wenn du lieber weniger Überfälle verlierst, wähle Wachsam: Es überfällt am seltensten und gewinnt am häufigsten.</li>
      </ul>
      {F.meetings !== undefined ? (
        <>
          <h2 id="musters">Appelle</h2>
          <p>Ab und zu trifft dein Held statt eines Kampfes den Helden eines anderen Spielers im selben Gebiet{F.meetings.level === undefined ? '' : `, ab Stufe ${F.meetings.level}`}. Sie stehen in der Suppenschlange, tauschen Seemannsgarn aus oder teilen ihre Rationen, und beide Helden bekommen denselben kleinen Bonus für {F.meetings.boonAdventures} Abenteuer. Beide Abenteuerlogs erzählen die Geschichte mit dem öffentlichen Namen des anderen Spielers, und der Tab Log listet die letzten fünf Appelle deines Helden.</p>
          <ul>
            {F.meetings.kinds.map((kind) => <li key={kind.id}><strong>{t.text(kind.name)}</strong>: {t.text(kind.effect)}, {boonLine(kind.modifiers)}.</li>)}
            <li>Nichts wechselt den Besitzer. Ein Appell ersetzt ein Abenteuer, und der Bonus gleicht das ungefähr aus.</li>
            <li>Er kommt unabhängig von Haltung und Klasse gleich oft vor, etwa jeden zweiten Tag für einen Helden auf Patrouille. Helden begegnen sich nur beim Erkunden oder Ruhen, und wer gerade einen Appell hatte, hat danach etwa zwölf Stunden Ruhe.</li>
          </ul>
        </>
      ) : null}
      {F.lostProperty ? (
        <>
          <h2 id="strays">Verlorenes Gut</h2>
          <p>Wird dein Held außerhalb der Mauern k. o. geschlagen, lässt er auf der Straße in diesem Gebiet ein Ersatzstück seiner Waffe oder Rüstung fallen, mit deinem öffentlichen Namen eingeritzt. Dein Held behält alles, was er trug. Später kann der Held eines anderen Spielers, der dort patrouilliert, das Stück statt eines gewöhnlichen Fundes finden, und dein TRMNL sagt dir, wer es gefunden hat.</p>
          <ul>
            <li>Dein Held kann das verlorene Gut anderer Spieler genauso finden. Es ist gewöhnliche Ausrüstung: anlegen, verkaufen, zerlegen oder in die Schmiede bringen. Es hat die Grundwerte seiner Art und Seltenheit, ohne die Verbesserungen des ersten Besitzers.</li>
            <li>Der Name bleibt drauf. Die Gepäck-Seite und die Karte Verlorenes Gut im Tab Log zeigen, wem es gehörte, und deine Heldenseite auch, solange du es hast.</li>
            <li>Verlorenes Gut ersetzt nur einen Fund, den dein Held ohnehin gemacht hätte, also bekommt niemand zusätzliche Ausrüstung. Auftragsbelohnungen und Geschenke zum {GIFT_DAY} sind immer neue Ausrüstung.</li>
            <li>Es liegt immer nur ein Stück von dir herum. Wird dein Held wieder k. o. geschlagen, bevor jemand es findet, ersetzt das neue das alte.</li>
          </ul>
        </>
      ) : null}
      {F.todo !== undefined ? (
        <>
          <h2 id="garrison-orders">Garnisonsbefehle</h2>
          <p>Das Brett des Forts hängt drei kleine Befehle für deinen Helden aus, etwa „Besiege 4 Keller-Reifratten“, „Finde 2 Ausrüstungsteile“ oder „Patrouilliere 16 Abenteuer lang in den Moonbight-Fjorden“.{arrives('todo')} Er arbeitet sie auf Patrouille ab, und die Helden-Seite zeigt den Fortschritt jedes Befehls. Ist ein Befehl erledigt, sagt es dein Bildschirm, und dein Held bekommt etwas Auro: {und(F.todo.pay.map(String), 'oder')}, je nach Gebiet. Befehle geben keine XP und beeinflussen also die Ranglisten nicht.</p>
          <ul>
            <li>Jeden Morgen um {F.todo.muster} Ortszeit deines TRMNL hängt der Morgenappell neue Befehle für die erledigten aus. Dein Bildschirm listet sie auf.</li>
            <li>Befehle laufen nie ab. Ein festgefahrener Befehl wird nach zwei Appellen automatisch getauscht.</li>
            <li>Mindestens zwei der drei Befehle lassen sich dort erledigen, wo dein Held gerade ist. Höchstens einer verlangt eine Reise in ein anderes Gebiet, falls du ihn hinschicken willst.</li>
            <li>Einmal zwischen zwei Appellen kannst du auf der Helden-Seite einen unerledigten Befehl gegen einen anderen tauschen.</li>
          </ul>
        </>
      ) : null}
      <h2 id="draughts">Tränke</h2>
      {F.potions === undefined
        ? <p>Ein Kupfertrank stellt 40 % der max. LP deines Helden wieder her, aufgerundet. Dein Held trinkt automatisch einen, wenn seine LP auf Patrouille unter die Trank-Schwelle seiner Haltung fallen, und das Abenteuerlog vermerkt es. Ohne Tränke ruht dein Held unter der Ruhe-Schwelle und zieht wieder los, sobald er sich erholt hat. Du kannst auch selbst auf der Helden-Seite einen trinken, wenn dein Held erkundet oder ruht und nicht volle LP hat. Tränke findet man auf Patrouille, und sie nehmen nie Platz im Gepäck ein.</p>
        : <>
          <p>Kupfertränke gibt es in {F.potions.strengths.length} Stärken: {und(F.potions.strengths.map((s) => `${name(s.name)} (${s.healPct} %)`))}, die jeweils diesen Anteil der max. LP deines Helden wiederherstellen, aufgerundet. Was man findet, hängt vom Ort ab: {F.potions.drops.map((d) => `${t.nameWith(d.zone, 'der')} gibt ${d.rest.length === 0 ? 'nur' : 'vor allem'} ${name(`${d.top.toLowerCase()}s`)}${d.rest.length === 0 ? '' : `, dazu einige ${d.rest.map((r) => name(`${r.toLowerCase()}s`)).join(' und ')}`}`).join('; ')}. Ein neuer Held beginnt mit Tränken, und auch der Wechsler und Entscheidungen unterwegs verteilen Tränke. Alle Stärken teilen sich eine Kiste und nehmen nie Platz im Gepäck ein.</p>
          <p>Dein Held trinkt automatisch, wenn seine LP auf Patrouille unter die Trank-Schwelle seiner Haltung fallen: den schwächsten Trank, der ihn wieder über die Schwelle bringt, oder den stärksten, den er hat, wenn kein schwächerer reicht. Das Abenteuerlog nennt, was er getrunken hat. Ohne Tränke ruht dein Held unter der Ruhe-Schwelle und zieht wieder los, sobald er sich erholt hat. Du kannst auch selbst auf der Helden-Seite einen trinken, wenn dein Held erkundet, ruht oder reist und nicht volle LP hat; bei mehreren Stärken in der Kiste fragt die Helden-Seite, welchen.</p>
          <p><strong>Kombinieren.</strong> Auf der Gepäck-Seite werden {F.potions.combine.count} {name(`${F.potions.combine.from.toLowerCase()}s`)} und {F.potions.combine.materials.map((m) => `${m.n} ${name(m.name)}`).join(', ')} zu einem {name(F.potions.combine.to)}. Kombinieren lässt dir nie mehr Tränke als vorher, die Kiste kann also nicht überlaufen. Es passiert nur, wenn du es wählst.</p>
        </>}
      <p>Tränke kommen in eine Kiste. Ein neuer Held trägt {t.nameWith(F.firstPouch.name, 'einen')} für {F.firstPouch.size} Tränke. Größere Kisten kaufst du mit Auro auf der Gepäck-Seite, eine nach der anderen: {rungs(F.shopPouches)}. Ist die Kiste voll, wird ein gefundener Trank stattdessen zu Auro.</p>
      <h2 id="the-serpentos-moneychanger">Der Serpentos-Wechsler</h2>
      <p>Ab und zu macht ein Serpentos-Faktor, einer der Dragu-Wechsler, die mit den Versorgungsschiffen reisen, bei deinem Helden auf Patrouille Halt. Dein Bildschirm sagt es, und die Gepäck-Seite zeigt bis zu drei Angebote: ein paar Tränke und die nächste Kiste oder das nächste Gepäck{F.merchantOff > 0 ? `, ${F.merchantOff} % günstiger als auf der Gepäck-Seite` : ''}. Jedes Angebot gibt es nur einmal. Der Faktor zieht nach vier Abenteuern oder nach deinem letzten Kauf weiter.</p>
      <h2 id="decisions">Entscheidungen</h2>
      <p>Manchmal fragt die Straße deinen Helden etwas Kleines, etwa ob er zum Eintopf des Kochs beisteuert oder eine Nachtwache auf der Palisade übernimmt. Dein Bildschirm sagt, dass eine Entscheidung wartet, und die Helden-Seite zeigt beide Optionen mit genau dem, was sie ändern. Antwortest du nicht innerhalb etwa eines Tages, wird die als Standard markierte Option für dich gewählt.</p>
      <h2 id="effects">Effekte</h2>
      <p>Manche Momente hinterlassen bei deinem Helden einen kurzen Effekt, der auf der Helden-Seite mit den verbleibenden Abenteuern steht. Ein Sieg über eine Elite macht deinen Helden Angefeuert (+10 % Angriff für acht Abenteuer). Zum Eintopf beizusteuern macht ihn Gut gesättigt (+10 % XP für acht Abenteuer). Eine Falle hinterlässt ihn Geprellt (−15 % Verteidigung für vier Abenteuer). Dein Held hat höchstens drei Effekte. Jede Pause schüttelt schlechte Effekte ab, und ein K. o. löscht alle.</p>
      {F.standoff !== undefined ? (
        <>
          <h2 id="dug-in-elites">Eingegrabene Eliten</h2>
          <p>Ab Stufe {F.standoff.minLevel}, {t.nameWith(F.standoff.zone, 'im')} und in den Gebieten dahinter, gräbt sich manchmal eine Elite ein, statt in einem Kampf zu fallen. Dein TRMNL zeigt sie mit ihrer LP-Leiste, und dein Held kommt jedes Abenteuer wieder, bis sie fällt.</p>
          <ul>
            <li>Jedes Abenteuer kämpft dein Held bis zu sechs Runden gegen sie, und ihre LP bleiben erhalten. Sie schlägt viel härter zu als eine gewöhnliche Elite, und dein Held kämpft über die Ruhe-Schwelle seiner Haltung hinaus, bevor er zurückweicht, also kann ein Kräftemessen mit einem K. o. enden. Abbrechen kostet kein Auro.</li>
            <li>Wenn sie fällt, bringt sie das {F.standoff.xp}-Fache der XP der Kreatur und das {F.standoff.gold}-Fache ihres Auro, dazu einen seltenen oder epischen Fund aus diesem Gebiet.</li>
            <li>Sie geht nach {F.standoff.hours} Stunden, oder früher, wenn dein Held k. o. geht oder reist. Eine Pause hält die Uhr nicht an.</li>
            <li>Die Helden-Seite zeigt ihre LP und wann sie geht. Dort kannst du sie stehen lassen, und vor einer Reise wirst du gefragt, ob du sie zurücklassen willst.</li>
          </ul>
        </>
      ) : null}
      <h2 id="sky-calendar">Himmel und Kalender</h2>
      <p>Zwölf gekettete Monde hängen über Volta, einer für jeden Astralwächter, und der Streifen oben in der Szene deines Helden zeigt sie in der Reihenfolge des Gyre: Gekettete Jungfrau, Leviathan, Wyrm, Magnus, Blühendes Grauen, Schleierhund, Verräter, Verbundene, Eldritch-Bestie, Titan, Finsternis und Wächter. Die beleuchtete Seite jedes Mondes folgt seiner eigenen Periode, vom einzelnen Tag des Wächters bis zum Jahr der Jungfrau, und der vollste Mond des Tages trägt einen Hof. Der Mond der Jungfrau ist eine tote Hülle und wird immer gesprungen gezeichnet. Der Himmel wird, wie das Datum in der Titelleiste, allein aus der Uhr berechnet und ändert nichts am Spiel.</p>
      {F.occasions !== undefined ? (
        <>
          <p>Bestimmte Tage im Jahr sind Himmelsereignisse, die die Szene deines Helden schmücken: Dekoration oben, etwas auf dem Boden, manchmal ein Hut, und in {SAFE} ein anderer Blick über die Palisade. Sie folgen dem Ortsdatum deines TRMNL. Wenn dein Held eines zum ersten Mal sieht, nennt es das Abenteuerlog, und die meisten bringen für ihre Dauer einen kleinen Bonus. Die Helden-Seite zeigt das heutige Ereignis und das nächste.</p>
          <ul>
            {F.occasions.map((rule) => <li key={rule.id}><strong>{t.text(rule.name)}</strong>, {occasionDate(rule)}: {rule.id === 'friday_13th' ? 'jeder Lagerüberfall geht schief (siehe unten).' : rule.effectLabel ? `${t.text(rule.effectLabel)}.` : 'nur Dekoration.'}</li>)}
          </ul>
          <p><strong>{ILL_OMEN}.</strong> Lagerüberfälle starten doppelt so oft, und jeder geht schief: Niemand gewinnt, und beide Helden verlieren 20 % ihrer max. LP und 5 % ihres Auro, das niemand bekommt. Die Überfall-Liste deines Helden zählt es als Missgeschick.</p>
          <p><strong>{GIFT_DAY}.</strong> Dein Held findet ein verpacktes Geschenk: ein Ausrüstungsteil aus dem Gebiet, in dem er ist, bei seinem ersten Abenteuer der drei Tage.</p>
        </>
      ) : null}
      <h2 id="rare-and-epic-gear">Seltene und epische Ausrüstung</h2>
      <p>Ausrüstung ist gewöhnlich, ungewöhnlich, selten oder episch. Episch ist am seltensten, etwa einer von hundert Funden, und am stärksten. Seltene und epische Ausrüstung trägt außerdem eine Eigenschaft der Sternenschmiedekunst, die im Namen steht und auf der Gepäck-Seite erklärt wird. Jede folgt der Metallurgie der Obsidianiden: Ein ins Stück gearbeitetes Metall verleiht ihm eine Eigenschaft.</p>
      <ul>
        <li><strong>{name(affixName('vampiric'))}</strong> heilt nach jedem Sieg 5 % der max. LP, denn Kupfer heilt.</li>
        <li><strong>{name(affixName('lucky'))}</strong> bringt 20 % mehr Auro aus Siegen und Funden.</li>
        <li><strong>{name(affixName('sturdy'))}</strong> nimmt 40 % weniger Schaden durch Fallen.</li>
        <li><strong>{name(affixName('thrifty'))}</strong> verliert 5 Punkte weniger Auro, wenn etwas schiefgeht: Ein Rückzug kostet kein Auro statt 5 %, ein K. o. 5 % statt 10 %.</li>
      </ul>
      <h2 id="when-your-pack-fills-up">Wenn das Gepäck voll ist</h2>
      <p>Ein neuer Held beginnt mit einer Umhängetasche für 6 Ausrüstungsteile. Angelegte Ausrüstung und Tränke brauchen keinen Platz. Ist das Gepäck voll, legt dein Held das nächste gefundene Teil für dich zurück und zieht weiter. Solange es wartet, bleiben weitere Funde liegen, bis du Platz schaffst.</p>
      <h2 id="bigger-packs">Größeres Gepäck</h2>
      <p>Dein Gepäck wächst mit Auro. {F.tote ? `In den ersten paar Stunden bekommt dein Held ${t.nameWith(F.tote.name, 'einen')} (${F.tote.size}) ausgegeben. ` : ''}Danach kaufst du größeres Gepäck auf der Gepäck-Seite, eins nach dem anderen: {rungs(F.shopBags)}, bis zu {F.topBag} Plätze. Es gibt keine Stufenanforderungen, und Gepäck fällt nie als Beute.</p>
      <ol className="[&_li]:list-decimal">
        <li>Öffne Gepäck in der Begleit-App. Rüste Verbesserungen aus und verkaufe übrige Ausrüstung, um Platz zu schaffen.</li>
        <li>Liegt ein Fund zurück, wähle Fund abholen. Lass danach mindestens einen Platz frei, damit die Abenteuer weitergehen können.</li>
        <li>Sobald ein Platz frei ist und nichts mehr wartet, gehen die Abenteuer von allein innerhalb von 15 Minuten weiter. Vorher kannst du auf der Gepäck-Seite noch ein anderes offenes Gebiet wählen.</li>
      </ol>
      <p>Ausrüsten macht keinen Platz frei. Verkaufen, Zerlegen oder größeres Gepäck kaufen schon, und der zurückgelegte Fund kommt sofort ins Gepäck. Die Gepäck-Seite kann auch dein schwächstes Ersatzstück verkaufen und den Fund mit einem Tipp behalten. Auch der Schlafmodus deines TRMNL hält das Spiel nie an.</p>
      {F.workbench !== undefined ? <>
        <h2 id="salvage-and-the-forge">Zerlegen und die Schmiede</h2>
        <p>{F.workbench.level !== undefined ? `Ab Stufe ${F.workbench.level} hat übrige Ausrüstung` : 'Übrige Ausrüstung hat'} zwei Wege aus dem Gepäck: für Auro verkaufen oder auf der Gepäck-Seite in Stellazia-Splitter zerlegen. Zerlegen bringt so viel wie die Stufe, auf der das Teil gefunden wurde, in Einheiten des Splitters seiner Seltenheit: {F.workbench.materials.map((m) => `${name(m.name)} aus ${m.rarities.map((r) => rarityDe[r] ?? r).join(' und ')} Ausrüstung`).join(', ')}. Epische Ausrüstung bringt das {F.workbench.epicMultiplier}-Fache. Splitter brauchen keinen Gepäckplatz und werden nie verkauft. Ausrüstung wird nur zerlegt, wenn du es willst.{F.workbench.level !== undefined ? ` Vor Stufe ${F.workbench.level} verkaufst du Übriges besser: Die erste Verbesserung braucht ohnehin Stufe ${F.workbench.level}.` : ''}</p>
        <p>Die Schmiede ist Sternenschmiedekunst im Maßstab des Forts: Sie investiert Splitter und Auro in die Ausrüstung, die dein Held trägt, direkt am Teil. Es behält Namen und Eigenschaft, nur die Werte ändern sich. Jedes Teil hat genau einen nächsten Schritt. {F.workbench.tiers.map((s, i) => `${i === 0 ? 'Ein Teil der Stufe 1 auf Mk II zu bringen' : 'Mk II auf Mk III'} kostet ${price(s)}`).join('; ')}; ein Teil lässt sich nur auf eine Stufe bringen, die dein Held mit seiner Stufe anlegen könnte. Ist ein Teil auf Mk III (oder wurde so gefunden), bringt Verstärken einen Punkt pro Schritt: {F.workbench.reinforce.map((s) => `+${s.to} für ${price(s)}`).join(', ')}. {F.workbench.reinforce.length > 0 ? `Nach +${F.workbench.reinforce.at(-1)!.to} ist das Teil fertig.` : ''} Seltene und epische Ausrüstung kann außerdem für {price(F.workbench.affix)} eine Eigenschaft deiner Wahl bekommen, statt der vorhandenen.</p>
        <p>Verbesserungen klappen immer. Ein verbessertes Teil zu zerlegen gibt nicht zurück, was du hineingesteckt hast, also verbessere nur, was du weiter tragen willst.</p>
      </> : null}
      <h2 id="getting-knocked-out">K. o. gehen</h2>
      <p>Dein Held kommt nach etwa zwei Stunden automatisch wieder zu sich und kehrt nach {SAFE} zurück. Du behältst XP und Ausrüstung, verlierst aber 10 % deines aktuellen Auro.</p>
      <h2 id="recaps">Rückblicke</h2>
      <p>Dein Bildschirm zeigt einen kurzen Rückblick auf die letzte abgeschlossene Nacht oder den letzten Tag, in der Ortszeit deines TRMNL. Um 07:00 berichtet der Nacht-Rückblick über 19:00 bis 07:00 und bleibt den ganzen Tag stehen. Um 19:00 berichtet der Tages-Rückblick über 07:00 bis 19:00 und bleibt den Abend und die Nacht über stehen. Die Szene zeigt Tag und Nacht zu denselben Zeiten. Die Geschichten darüber sind immer die neuesten.</p>
      <h2 id="understanding-rankings">Ranglisten verstehen</h2>
      <p>Der Bildschirm zeigt die XP-Top-5 dieser Woche für deine Stufengruppe, mit deiner Zeile markiert oder unter der Liste angefügt, wenn du weiter unten stehst. Die Begleit-App bietet außerdem die Rangliste von heute und eine Gesamtrangliste. Der Tag beginnt um 00:00 UTC und die Woche am Montag um 00:00 UTC, wie bei den Siegeln. Ranglisten werden stündlich veröffentlicht, also kann ein neues Abenteuer oder ein Stufenaufstieg erscheinen, bevor sich dein Rang aktualisiert.</p>
      <p>Pausierte und schlafende Helden behalten ihren Fortschritt. Wer diese Woche keine XP hat, verlässt die Wochenrangliste, bis er wieder XP verdient. Der Gesamtfortschritt bleibt gespeichert.</p>
      <h2 id="sharing-your-hero">Deinen Helden teilen</h2>
      <p>Dein Held hat eine öffentliche Seite mit Stufe, Rang, aktuellem Gebiet, Gesamtzählern und Einträgen in der Erhebung. Auro und das Abenteuerlog werden nie gezeigt, Ausrüstung nur, wenn es das verlorene Gut eines anderen Spielers ist, das dein Held hat. Dein Name verlinkt auf die Seite, aus den Ranglisten und aus den Überfällen und Appellen anderer Spieler, und dort können andere dir folgen. In den Einstellungen gibt es die Knöpfe Teilen und Link kopieren, und ein geteilter Link zeigt eine Bildkarte deines Helden mit Name, Stufe und Rang. Zum Verbergen wähle in den Einstellungen Meine Heldenseite verbergen. Sie verschwindet sofort, und solange sie verborgen ist, kann dir niemand folgen.</p>
      <h2 id="following">Folgen</h2>
      <p>Angemeldet kannst du anderen Spielern über ihre öffentliche Heldenseite folgen, bis zu 20 Spielern. Alle, denen du folgst, stehen unter Ranglisten, mit Stufe, Rang und Aufenthaltsort ihres Helden und Links zu ihren Seiten. Folgen ändert nichts am Spiel, und niemand erfährt, dass du ihm folgst. Lagerüberfälle wählen ihre Ziele zufällig unter allen Spielern, also schickt Folgen deinen Helden nie zu jemandem. Verbirgt ein Spieler seine Seite, siehst du nur seinen Namen, bis er sie wieder zeigt. Ändert er seinen öffentlichen Namen, fällt er aus deiner Liste.</p>
      <h2 id="names">Namen</h2>
      <p>Du hast zwei Namen. Der Name deines Helden steht auf deinem TRMNL, in den Ranglisten und auf deiner Heldenseite; um ihn zu ändern, lässt du im Tab Mehr den Schreiber des Forts die Musterrolle berichtigen, für 200 Auro. Der Schreiber nimmt eine Berichtigung am Tag an. Dein öffentlicher Name bist du, in jedem TRMNL-Spiel: Er steht neben deinem Helden in den Ranglisten, in Überfällen und Appellen anderer Spieler und im Link deiner Seite. Du kannst ihn alle 7 Tage einmal kostenlos unter Konto ändern. Links zu deiner alten Seite funktionieren dann nicht mehr, und niemand sonst kann deinen alten Namen 7 Tage lang nehmen.</p>
      <h2 id="looks">Aussehen</h2>
      <p>Du gestaltest das Aussehen deines Helden, wenn du ihn erstellst: Abstammung, Statur, Kopf, Haare, Rücken, Accessoire und Wappenrock. Elf Völker Voltas können den Knappeneid ablegen, von den kleinen Aquaniden, Lunaris und Dragu bis zu den riesigen Crystalkin. Es ändert nur sein Aussehen auf deinem TRMNL, deiner Heldenseite und in den Appellen anderer Spieler. Jedes Aussehen spielt sich gleich. Auch der Name ist deine Sache: Der Editor kann dir einen in der Sprache der gewählten Abstammung vorschlagen. Ändern kannst du das Aussehen später jederzeit kostenlos am Lagerspiegel, über deine Heldenseite oder den Tab Mehr.</p>
      <h2 id="alerts">Benachrichtigungen</h2>
      <p>Dein TRMNL ist der wichtigste Weg, deinen Helden im Blick zu behalten, aber die Einstellungen können in zwei Fällen auch eine Benachrichtigung aufs Handy schicken, jede aus, bis du sie einschaltest:</p>
      <ul>
        <li><strong>Gepäck voll:</strong> Das Gepäck ist voll und dein Held hebt einen Fund für dich auf. Sie kommt eine halbe Stunde, nachdem das Gepäck voll wurde, damit nichts ankommt, wenn du es schon sortierst, und einmal, jedes Mal wenn es voll wird.</li>
        <li><strong>Angebot des Wechslers:</strong> Ein Serpentos-Faktor verkauft das nächste Gepäck oder die nächste Kiste{F.merchantOff > 0 ? ` mit ${F.merchantOff} % Rabatt` : ''}, und dein Held hat das Auro. Höchstens einmal am Tag. Ein Faktor, der nur Tränke hat, schickt nie eine.</li>
      </ul>
      <p>Du bekommst höchstens zwei Benachrichtigungen am Tag. Die Ruhezeiten gehen von 21:00 bis 08:00, außer du änderst sie: Eine Gepäck-voll-Benachrichtigung wartet bis zu ihrem Ende, und ein Angebot in dieser Zeit wird übersprungen. Vor dem Senden prüft das Spiel, ob die Benachrichtigung noch stimmt, damit du nie von einem schon sortierten Gepäck oder einem verschwundenen Angebot hörst. Entscheidungen, Überfälle, K. o.s, Stufenaufstiege und Siegel lösen nie Benachrichtigungen aus.</p>
      <p>Wähle in den Einstellungen Auf diesem Gerät erlauben und bestätige dann die Abfrage deines Browsers. Auf iPhone und iPad füge die Begleit-App zuerst zum Home-Bildschirm hinzu (Teilen, dann Zum Home-Bildschirm) und öffne sie von dort. Jedes erlaubte Gerät steht in den Einstellungen mit einem Knopf Entfernen; das letzte zu entfernen schaltet die Benachrichtigungen aus.</p>
      <h2 id="troubleshooting">Fehlerbehebung</h2>
      <h3 id="not-on-your-screen">Dein Held ist nicht auf dem Bildschirm</h3>
      <ul>
        <li>Mit Speichern kommt Wardenwatch in deine TRMNL-Playlist. Dein Gerät zeigt die Playlist ein Plugin nach dem anderen, in seinem Aktualisierungstakt, also erscheint Wardenwatch, wenn es an der Reihe ist. Bei mehreren Plugins und langsamer Aktualisierung kann das dauern.</li>
        <li>Öffne in TRMNL die Playlists und prüfe, ob Wardenwatch dort ist, auf dem Gerät, das du ansiehst, falls du mehrere hast, und dass kein Zeitplan es zu dieser Tageszeit ausblendet.</li>
        <li>Der Schlafmodus stoppt die Aktualisierung über Nacht. Dein Held macht weiter, und der Bildschirm holt auf, wenn das Gerät aufwacht.</li>
        <li>Ein Bildschirm mit „Das erste Abenteuer beginnt innerhalb von 15 Minuten“ funktioniert. Die erste Geschichte kommt zur nächsten Viertelstunde.</li>
        <li>Die Helden-Seite der Begleit-App zeigt immer, was dein Held gerade tut, egal was der Bildschirm zeigt.</li>
      </ul>
      <h3 id="if-the-screen-looks-old">Der Bildschirm sieht alt aus</h3>
      <ul>
        <li>„Aktualisierungen verzögert“ heißt, dass der Spieldienst hinterherhinkt. Der Fortschritt deines Helden bleibt erhalten, und der Bildschirm holt auf, sobald der Dienst es tut.</li>
        <li>Ist die Begleit-Website aktuell, der Bildschirm aber nicht, prüfe die Aktualisierungseinstellung des Plugins und seinen Platz in der TRMNL-Playlist.</li>
        <li>Abenteuer laufen jede Viertelstunde, zur vollen Stunde und um :15, :30 und :45 in der Zeitzone deines TRMNL. Der Bildschirm zeigt keinen Countdown; die Zeit neben jeder Geschichte ist, wann sie passiert ist, und die Begleit-App zeigt das nächste Abenteuer.</li>
        <li>Hast du getrennt oder deinstalliert, installiere neu aus TRMNL. Dein Held behält allen Fortschritt.</li>
      </ul>
      <h2 id="disconnecting-and-removing">Trennen und entfernen</h2>
      <p>
        Trennen stoppt neue Bildschirme für diese Installation. TRMNL zeigt das letzte Bild eventuell weiter, bis du das Plugin aus deiner Playlist entfernst;
        ein Bild, das schon auf deinem Gerät ist, können wir nicht löschen.
      </p>
      <h2 id="help">Hilfe</h2>
      <p>
        Schreib an <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>, wenn du Hilfe mit deinem Konto oder der Verbindung brauchst. Wir antworten in der Regel innerhalb von zwei Werktagen.
      </p>
    </>
  ),
}
