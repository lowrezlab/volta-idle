import { contentTranslator } from '@trmnl-games/wardenwatch/i18n/lazy'
import { WARDENWATCH_INSTALL_URL, SUPPORT_EMAIL } from '../../lib/prose'
import { affixName, HELP_FACTS as F, nextTableDate, occasionName, signed, type Cost, type Modifiers, type Occasion } from './-wardenwatchFacts'
import type { HelpPage } from './-wardenwatchHelp'
import { WARDENWATCH_HELP_HEAD } from './-helpHeads'

const t = contentTranslator('it')
const n = (value: number) => t.number(value)
const auro = (value: number) => `${n(value)} Auro`
const e = (parts: readonly string[], last = 'e') => (parts.length <= 1 ? parts.join('') : `${parts.slice(0, -1).join(', ')} ${last} ${parts.at(-1)}`)
const name = (english: string) => t.name(english)
const zone = (english: string) => t.nameWith(english, 'il')
const rungs = (list: readonly { name: string; size: number; price: number }[]) => e(list.map((rung) => `${t.nameWith(rung.name, 'un')} (${rung.size}) per ${auro(rung.price)}`))
const price = (c: Cost) => `${e(c.materials.map((m) => `${m.n} ${name(m.name).toLowerCase()}`))} più ${auro(c.gold)}`
const boonLine = (m: Modifiers) => [m.attackPct ? `${signed(m.attackPct)}% di attacco` : '', m.defensePct ? `${signed(m.defensePct)}% di difesa` : '', m.xpPct ? `${signed(m.xpPct)}% di XP dalle vittorie` : '', m.goldPct ? `${signed(m.goldPct)}% di Auro` : '', m.trapDamagePct ? `trappole il ${m.trapDamagePct}% meno dolorose` : ''].filter(Boolean).join(', ')
const ZONES_LINE = e(F.zones.filter((b) => b.level > 1).map((b) => `${zone(b.name)} al livello ${b.level}`))
const arrives = (feature: 'todo' | 'stances' | 'choices' | 'merchant' | 'raids') => (F.unlocks === undefined ? '' : ` Arriva al livello ${F.unlocks[feature]}.`)
const SAFE = name(F.zones[0]?.name ?? 'Castellum Frigo')
const ILL_OMEN = t.text(occasionName('friday_13th', 'Giorno di malaugurio'))
const GIFT_DAY = t.text(occasionName('christmas', 'Festa di mezzo inverno'))
const rarityIt: Record<string, string> = { common: 'comune', uncommon: 'non comune', rare: 'raro', epic: 'epico' }

const MONTHS = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre']
const WEEKDAYS = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato']
const NTH = ['primo', 'secondo', 'terzo', 'quarto', 'quinto']
// Domenica is feminine: "la prima domenica".
const nth = (index: number, weekday: number) => (weekday === 0 ? NTH[index]!.replace(/o$/, 'a') : NTH[index]!)
function occasionDate(rule: Occasion): string {
  const date = rule.date
  const span = rule.days > 1 ? `, per ${rule.days} giorni` : ''
  switch (date.kind) {
    case 'fixed':
      return `il ${date.day === 1 ? '1º' : date.day} ${MONTHS[date.month - 1]}${span}`
    case 'nth_weekday': {
      const base = `${date.weekday === 0 ? 'la' : 'il'} ${nth(date.nth - 1, date.weekday)} ${WEEKDAYS[date.weekday]} di ${MONTHS[date.month - 1]}`
      const offset = date.offsetDays ?? 0
      const after = (date.weekday + offset) % 7
      return `${offset === 0 ? base : `${after === 0 ? 'la' : 'il'} ${WEEKDAYS[after]} dopo ${base}`}${span}`
    }
    case 'friday_13th':
      return 'ogni venerdì 13'
    case 'easter':
      return date.offsetDays === -2 ? 'dal Venerdì Santo al Lunedì dell’Angelo' : `${Math.abs(date.offsetDays)} giorni ${date.offsetDays < 0 ? 'prima' : 'dopo'} la domenica di Pasqua${span}`
    case 'table': {
      const next = nextTableDate(date.dates)
      return next === null ? 'una data che cambia ogni anno' : `una data che cambia ogni anno (la prossima: ${next.getUTCDate()} ${MONTHS[next.getUTCMonth()]} ${next.getUTCFullYear()})`
    }
  }
}

export const it: HelpPage = {
  seoTitle: WARDENWATCH_HELP_HEAD.it.seoTitle,
  description: WARDENWATCH_HELP_HEAD.it.description,
  title: 'Wardenwatch su TRMNL',
  contents: {
    'getting-started': 'Per iniziare', 'if-the-qr-sends-you-back-to-setup': 'Se il QR ti riporta all’installazione', 'how-time-works': 'Come passa il tempo', zones: 'Zone', seals: 'Sigilli', commissions: 'Incarichi', 'heroes-and-classes': 'Eroi e classi', stances: 'Tattiche', 'camp-raids': 'Incursioni al campo', musters: 'Adunate', strays: 'Oggetti smarriti', 'garrison-orders': 'Ordini della guarnigione', draughts: 'Elisir', 'the-serpentos-moneychanger': 'Il cambiavalute Serpentos', decisions: 'Decisioni', effects: 'Effetti', 'sky-calendar': 'Il cielo e il calendario', 'rare-and-epic-gear': 'Equipaggiamento raro ed epico', 'when-your-pack-fills-up': 'Quando lo zaino si riempie', 'bigger-packs': 'Zaini più grandi', 'salvage-and-the-forge': 'Smontaggio e la Forgia', 'getting-knocked-out': 'Finire KO', recaps: 'Riepiloghi', 'understanding-rankings': 'Come funzionano le classifiche', 'sharing-your-hero': 'Condividere il tuo eroe', 'following': 'Seguiti', names: 'Nomi', looks: 'Aspetto', alerts: 'Avvisi', troubleshooting: 'Risoluzione dei problemi', 'disconnecting-and-removing': 'Scollegare e rimuovere', help: 'Aiuto',
  },
  Body: () => (
    <>
      <h2 id="getting-started">Per iniziare</h2>
      <ul>
        <li>Apri <a href={WARDENWATCH_INSTALL_URL}>Wardenwatch nel marketplace TRMNL</a> e scegli Installa.</li>
        <li>Accedi a Wardenwatch, scegli un nome pubblico, dai un nome e un aspetto al tuo Scudiero, e collega l’installazione.</li>
        <li>Torna in TRMNL e premi Salva. La prima avventura del tuo eroe parte entro 15 minuti.</li>
        <li>Aggiungi il plugin a una playlist, o a un mashup se vuoi il tuo eroe accanto ad altri plugin. Sono supportate tutte e quattro le dimensioni di layout.</li>
      </ul>
      <h2 id="if-the-qr-sends-you-back-to-setup">Se il QR ti riporta all’installazione</h2>
      <p>Il QR apre l’app dell’account con cui hai effettuato l’accesso. Non avvia una nuova installazione. Controlla l’e-mail dell’accesso mostrata nella pagina di installazione e usa Cambia account se all’inizio ti eri collegato con un altro account.</p>
      <p>Se l’installazione dice «Ricollega Wardenwatch», il collegamento a TRMNL esiste ma manca l’eroe. Può succedere dopo un azzeramento del gioco. Installa una nuova copia di <a href={WARDENWATCH_INSTALL_URL}>Wardenwatch da TRMNL</a>, accedi con lo stesso account, scegli un nuovo nome per l’eroe, collega e poi premi Salva in TRMNL. Quando la nuova copia funziona, togli quella vecchia dalla playlist.</p>
      <p>Se l’installazione dice «Salva in TRMNL per iniziare», il tuo eroe è già pronto. Torna a quell’installazione in TRMNL e premi Salva.</p>
      <h2 id="how-time-works">Come passa il tempo</h2>
      <p>
        Il mondo del gioco avanza ogni 15 minuti, che lo schermo sia acceso o no. Il tuo TRMNL mostra un’istantanea e si aggiorna con i suoi tempi.
        La modalità sospensione, un aggiornamento più lento e gli altri elementi della playlist non riducono mai i progressi del tuo eroe. Gli orari delle avventure nell’app usano il fuso orario del browser.
      </p>
      <p>
        La barra del titolo del tuo TRMNL porta la data di Volta, come «Rime Ascendant 4 · Giro del Wyrm 1203». Un giorno di Volta è un passaggio di Myrkos il Guardiano nel cielo e dura un giorno reale. Nove giorni fanno un asse (Ascendant, Skybottom, Descendant, Midheaven), quattro assi un Ciclo cardinale (Rime, Echo, Gloam, Grave, Melt, Verd, Tan, Shade, Molt, Tanhaus) e dieci cicli un anno di 360 giorni, ciascun anno retto a turno da uno dei dodici Custodi. Il conto è iniziato il 1º Rime Ascendant 1203, l’anno in cui fu fondato Castellum Frigo. La data è solo un computo: la simulazione segue il tempo reale.
      </p>
      <h2 id="zones">Zone</h2>
      <p>La mappa di Ur-Turul ha {F.zones.length} zone, e il tuo eroe parte da {SAFE}, il forte a metà costruito della Spedizione sulla riva est delle Terre primordiali. Ognuna si apre a un livello, che tu ci vada o no: {ZONES_LINE}. Il tuo TRMNL segna il nuovo terreno sulla mappa quando succede; andarci sta a te, dalla mappa nella pagina Eroe. Le zone più lontane dal forte hanno creature più dure, più Auro, elisir più forti e ordini della guarnigione pagati meglio. {SAFE} non può mandare KO un eroe; tutte le altre zone sì.</p>
      <ul>
        {F.zones.map((z) => <li key={z.id}><strong>{name(z.name)}</strong>{z.level > 1 ? ` (livello ${z.level})` : ' (fin dall’inizio)'}: {z.monsters.map(name).join(', ')}.</li>)}
      </ul>
      {F.lore ? <p>La pagina Appunti di campo, sotto Altro, conserva ciò che il rilievo di Ur-Turul ha annotato su ogni zona e ogni creatura. L’appunto di una zona si apre la prima volta che il tuo eroe ci mette piede, quello di una creatura alla prima vittoria. Gli appunti non cambiano il gioco.</p> : null}
      <h2 id="seals">Sigilli</h2>
      <p>Tieni Wardenwatch nella playlist e cerca il codice del sigillo, sei cifre come 482 917, nella barra del titolo dello schermo (i mashup stretti in verticale ne abbreviano l’etichetta). Inserisci quel codice nelle Impostazioni dell’app per imprimere un sigillo di cera permanente nella tua collezione. Lo mostrano sia lo schermo intero sia i mashup; l’anteprima dell’app lo nasconde. Mentre un sigillo aspetta, anche il QR dello schermo lo ritira: scansionalo col telefono e l’app lo aggiunge al tuo scaffale, anche con la barra del titolo spenta. Dove c’è posto, il codice è stampato accanto.</p>
      <p>Puoi ottenere un sigillo a settimana, con un nuovo codice ogni lunedì alle 00:00 UTC. Vale anche il codice della settimana prima se lo schermo si aggiorna lentamente. Se salti una settimana, ricevi lo stesso sigillo la settimana dopo. Completata la collezione, puoi ottenerne altri di ciascuno. I sigilli non cambiano XP, equipaggiamento o classifiche, e più dispositivi o un aggiornamento più rapido non danno extra.</p>
      {F.career !== undefined ? (
        <>
          <h2 id="commissions">Incarichi</h2>
          <p>Il tuo eroe ha sempre un obiettivo dal comandante del forte, in cima alla pagina Eroe: «Vinci il tuo primo combattimento», «Equipaggia un pezzo di equipaggiamento che hai trovato», «Raggiungi i Fiordi di Moonbight», «Compra lo Zaino del pellegrino». Alcuni si raggiungono andando all’avventura; gli altri li fai qui, nella pagina Zaino o Eroe. Raggiungere un obiettivo viene annunciato sul tuo TRMNL e mette da parte un po’ di Auro ({n(F.career.gold)} su tutta la scala); premi Ritira nella pagina Eroe per prenderlo. Gli obiettivi non danno XP e non scadono, e il successivo parte che tu abbia ritirato o no.</p>
          <ul>
            <li>La pagina Incarichi, sotto Altro, elenca i {F.career.goals} obiettivi in ordine, con la data in cui hai raggiunto ciascuno. Un obiettivo già fatto quando è arrivata la scala conta come raggiunto. I gradi lungo la strada sono Scudiero, Giurato, Banderese e Giurato dei Custodi.</li>
            {F.unlocks !== undefined ? <li>Le funzioni arrivano per livello, che tu passi o no: gli ordini della guarnigione al livello {F.unlocks.todo}, le tattiche al livello {F.unlocks.stances}, le decisioni in cammino al livello {F.unlocks.choices}, {F.meetings?.level !== undefined ? `le adunate con i compagni al livello ${F.meetings.level}, ` : ''}{F.workbench?.level !== undefined ? `lo smontaggio e la Forgia al livello ${F.workbench.level}, ` : ''}il cambiavalute Serpentos al livello {F.unlocks.merchant} e le incursioni al campo al livello {F.unlocks.raids}. Il tuo TRMNL annuncia ciascuna. Anche le zone si aprono per livello: {ZONES_LINE}.</li> : null}
            <li>Quando si aprono le tattiche, il tuo eroe non ne ha scelta nessuna e gioca Saldo. Un obiettivo ti chiede di sceglierne una; vale una qualsiasi delle tre, e puoi cambiarla dopo.</li>
            <li>Alcuni obiettivi iniziali sono garantiti in tempo: il primo combattimento entro poche avventure, un pezzo di equipaggiamento entro la prima dozzina, e una prima decisione, un cambiavalute e un’élite entro un giorno circa dal loro livello. Tutto il resto è affidato al caso.</li>
          </ul>
        </>
      ) : null}
      {F.classes !== undefined ? (
        <>
          <h2 id="heroes-and-classes">Eroi e classi</h2>
          <p>Tutti partono come Cavaliere. Quando il tuo Cavaliere raggiunge il livello {F.rosterLevel}, il tuo TRMNL annuncia un secondo eroe, e puoi reclutare un Assassino dalla pagina Eroi sotto Altro. L’Assassino parte dal livello 1 con nome, aspetto, equipaggiamento, Auro, elisir e obiettivi tutti suoi.</p>
          <ul>
            <li>Va all’avventura un eroe alla volta, ed è quello che mostra il tuo TRMNL e quello in classifica. L’altro resta dove l’hai lasciato. Non va all’avventura e non recupera dopo, e un cambiavalute in visita da lui se ne va.</li>
            <li>Puoi cambiare una volta al giorno. Tornare indietro entro dieci minuti non conta. Un eroe KO o in viaggio deve prima riprendersi o arrivare.</li>
            <li>Puoi avere un eroe per classe. Le voci del rilievo sono tue, qualunque eroe le ottenga; alcune sono solo dell’Assassino.</li>
            <li><strong>Cavaliere</strong>: {t.text(F.classes.warriorBlurb)}</li>
            <li><strong>Assassino</strong>: {t.text(F.classes.rogueBlurb)} {F.classes.rogue.hpPct}% di salute, attacco {signed(F.classes.rogue.attackPct)}%, difesa {signed(F.classes.rogue.defensePct)}%, {signed(F.classes.rogue.goldPct)}% di Auro da ogni combattimento e ritrovamento, e {F.classes.rogue.raidEdgePct} punti dalla sua parte in ogni incursione al campo. Sale di livello al ritmo del Cavaliere ma va KO un po’ più spesso.</li>
          </ul>
        </>
      ) : null}
      <h2 id="stances">Tattiche</h2>
      <p>Scegli fin dove si spinge il tuo eroe prima di riposare, nella pagina Eroe.{arrives('stances')} La tattica vale dalla prossima avventura, e puoi cambiarla quando vuoi. Il tuo TRMNL la mostra accanto al conteggio dello zaino, sotto un indicatore con la lancetta bassa per In guardia, al centro per Saldo e alta per Temerario.</p>
      <ul>
        <li><strong>In guardia</strong> beve un elisir sotto il 65% dei PS, riposa sotto il 50% e riparte al 90%. Prende il 90% dell’XP normale dalle vittorie.</li>
        <li><strong>Saldo</strong>, la regola della guarnigione e la tattica predefinita, beve sotto il 50%, riposa sotto il 35% e riparte al 75%, con l’XP normale.</li>
        <li><strong>Temerario</strong> beve sotto il 35%, riposa sotto il 20% e riparte al 60%. Prende il 115% di XP dalle vittorie ma va KO più spesso.</li>
      </ul>
      <p>{SAFE} non può mandare KO un eroe, quindi dentro le mura Temerario non rischia il KO. In ogni altra zona un KO costa Auro e rimanda il tuo eroe a {SAFE}, e Temerario è la tattica che va KO più spesso.</p>
      <h2 id="camp-raids">Incursioni al campo</h2>
      <p>In pattuglia, gli Scudieri a volte frugano nell’equipaggiamento altrui. Ogni eroe attivo{F.unlocks === undefined ? '' : ` dal livello ${F.unlocks.raids}`} fa incursioni e le subisce in automatico. Non puoi avviarne una né scegliere il bersaglio.{F.unlocks === undefined ? '' : ` Sotto il livello ${F.unlocks.raids} un eroe non fa incursioni e non le subisce.`} L’incursione compare nel diario di entrambi gli eroi con il nome pubblico dell’altro giocatore, e la pagina Eroe tiene il registro delle incursioni del tuo eroe.</p>
      <ul>
        <li>Chi vince lo decide un lancio di moneta, spostato solo dalla tattica. Livello, equipaggiamento ed effetti non contano mai. In guardia aggiunge 10 punti dalla sua parte, Saldo niente e Temerario ne toglie 5, sia in attacco sia in difesa.</li>
        <li>Anche la frequenza dipende dalla tattica: In guardia circa un giorno di pattuglia sì e uno no, Saldo circa una volta al giorno, Temerario circa due volte al giorno.</li>
        <li>Chi perde consegna il 5% del suo Auro a chi vince, quindi l’Auro cambia solo di mano. Entrambi perdono salute: chi perde il 30% dei PS massimi, chi vince il 10%. L’equipaggiamento {name(affixName('thrifty'))} toglie i suoi punti dalla perdita di Auro.</li>
        <li>Un’incursione può mandare KO un eroe, proprio come un combattimento; a {SAFE} il tuo eroe viene invece soccorso. Le incursioni trovano solo eroi che esplorano o riposano, e un eroe che ne ha subita una viene lasciato in pace per circa sei ore.</li>
        <li>Se preferisci perderne meno, scegli In guardia, che fa meno incursioni e ne vince di più.</li>
      </ul>
      {F.meetings !== undefined ? (
        <>
          <h2 id="musters">Adunate</h2>
          <p>Ogni tanto, invece di un combattimento, il tuo eroe incrocia l’eroe di un altro giocatore nella stessa zona{F.meetings.level === undefined ? '' : `, dal livello ${F.meetings.level}`}. Fanno la fila per la zuppa, si raccontano storie di guardia o si dividono le razioni, e tutti e due ricevono lo stesso piccolo vantaggio per {F.meetings.boonAdventures} avventure. Entrambi i diari raccontano la storia con il nome pubblico dell’altro giocatore, e la scheda Diario elenca le ultime cinque adunate del tuo eroe.</p>
          <ul>
            {F.meetings.kinds.map((kind) => <li key={kind.id}><strong>{t.text(kind.name)}</strong>: {t.text(kind.effect)}, {boonLine(kind.modifiers)}.</li>)}
            <li>Niente cambia di mano. Un’adunata prende il posto di un’avventura, e il vantaggio più o meno la compensa.</li>
            <li>Succede con la stessa frequenza qualunque sia la tua tattica o classe, circa un giorno sì e uno no per un eroe in pattuglia. Gli eroi si incontrano solo mentre esplorano o riposano, e un eroe che ha appena avuto un’adunata viene lasciato in pace per circa dodici ore.</li>
          </ul>
        </>
      ) : null}
      {F.lostProperty ? (
        <>
          <h2 id="strays">Oggetti smarriti</h2>
          <p>Quando il tuo eroe va KO fuori dalle mura, lascia cadere sulla strada di quella zona un doppione della sua arma o armatura con il tuo nome pubblico inciso sopra. Il tuo eroe tiene tutto ciò che indossava. Più avanti, l’eroe di un altro giocatore in pattuglia in quella zona può trovare l’oggetto smarrito al posto di un ritrovamento normale, e il tuo TRMNL ti dice chi l’ha trovato.</p>
          <ul>
            <li>Il tuo eroe può trovare gli oggetti smarriti degli altri giocatori nello stesso modo. Sono equipaggiamento normale: equipaggialo, vendilo, smontalo o portalo alla Forgia. Arriva con le statistiche base del suo tipo e della sua rarità, senza i miglioramenti del primo proprietario.</li>
            <li>Il nome resta. La pagina Zaino e la scheda Oggetti smarriti nel Diario mostrano di chi era, e così la tua pagina eroe finché lo tieni.</li>
            <li>Un oggetto smarrito sostituisce solo un ritrovamento che il tuo eroe avrebbe fatto comunque, quindi nessuno riceve equipaggiamento in più. Le ricompense degli incarichi e i regali della {GIFT_DAY} sono sempre equipaggiamento nuovo.</li>
            <li>In giro c’è un solo oggetto smarrito tuo alla volta. Se il tuo eroe va di nuovo KO prima che qualcuno lo trovi, il nuovo prende il posto del vecchio.</li>
          </ul>
        </>
      ) : null}
      {F.todo !== undefined ? (
        <>
          <h2 id="garrison-orders">Ordini della guarnigione</h2>
          <p>La bacheca del forte affigge tre piccoli ordini per il tuo eroe, come «Sconfiggi 4 Ratti del gelo di cantina», «Trova 2 pezzi di equipaggiamento» o «Pattuglia i Fiordi di Moonbight per 16 avventure».{arrives('todo')} Li sbriga mentre è in pattuglia, e la pagina Eroe mostra l’avanzamento di ciascuno. Quando un ordine è eseguito, lo schermo lo dice e il tuo eroe riceve un po’ di Auro: {e(F.todo.pay.map(String), 'o')} a seconda della zona. Gli ordini non danno XP, quindi non toccano le classifiche.</p>
          <ul>
            <li>Ogni mattina alle {F.todo.muster}, ora locale del tuo TRMNL, l’adunata del mattino affigge nuovi ordini al posto di quelli eseguiti. Lo schermo li elenca.</li>
            <li>Gli ordini non scadono mai. Uno bloccato viene cambiato da solo dopo due adunate.</li>
            <li>Almeno due dei tre ordini si possono eseguire dove si trova il tuo eroe. Al massimo uno chiede un viaggio in un’altra zona, se vuoi mandarci il tuo eroe.</li>
            <li>Una volta tra un’adunata e l’altra puoi cambiare un ordine non eseguito con un altro dalla pagina Eroe.</li>
          </ul>
        </>
      ) : null}
      <h2 id="draughts">Elisir</h2>
      {F.potions === undefined
        ? <p>Un elisir di rame ridà il 40% dei PS massimi del tuo eroe, arrotondato per eccesso. Il tuo eroe ne beve uno in automatico quando i PS scendono sotto la soglia di elisir della sua tattica in pattuglia, e il diario lo annota. Senza elisir, il tuo eroe riposa sotto la soglia di riposo e riparte quando si è ripreso. Puoi anche berne uno tu dalla pagina Eroe quando il tuo eroe esplora o riposa e non ha la salute al massimo. Gli elisir si trovano in pattuglia e non occupano mai spazio nello zaino.</p>
        : <>
          <p>Gli elisir di rame hanno {F.potions.strengths.length} potenze: {e(F.potions.strengths.map((s) => `${name(s.name).toLowerCase()} (${s.healPct}%)`))}, e ognuno ridà quella quota dei PS massimi del tuo eroe, arrotondata per eccesso. I ritrovamenti dipendono da dove si trova il tuo eroe: {F.potions.drops.map((d) => `${zone(d.zone)} dà ${d.rest.length === 0 ? 'solo' : 'soprattutto'} ${name(`${d.top.toLowerCase()}s`)}${d.rest.length === 0 ? '' : `, con qualche ${d.rest.map((r) => name(`${r.toLowerCase()}s`)).join(' e ')}`}`).join('; ')}. Un eroe nuovo parte con degli elisir, e anche il cambiavalute e le decisioni in cammino ne distribuiscono. Tutte le potenze stanno in un solo astuccio e non occupano mai spazio nello zaino.</p>
          <p>Il tuo eroe beve in automatico quando i PS scendono sotto la soglia di elisir della sua tattica in pattuglia: l’elisir più debole che lo riporta sopra quella soglia, o il più forte che ha se nessuno più debole basta. Il diario dice cosa ha bevuto. Senza elisir, il tuo eroe riposa sotto la soglia di riposo e riparte quando si è ripreso. Puoi anche berne uno tu dalla pagina Eroe quando il tuo eroe esplora, riposa o viaggia e non ha la salute al massimo; con più potenze nell’astuccio, la pagina Eroe ti chiede quale.</p>
          <p><strong>Combinare.</strong> Nella pagina Zaino, {F.potions.combine.count} {name(`${F.potions.combine.from.toLowerCase()}s`)} e {F.potions.combine.materials.map((m) => `${m.n} ${name(m.name).toLowerCase()}`).join(', ')} diventano un {name(F.potions.combine.to.toLowerCase())}. Combinare non ti lascia mai con più elisir di prima, quindi l’astuccio non può traboccare. Succede solo quando lo scegli tu.</p>
        </>}
      <p>Gli elisir stanno in un astuccio. Un eroe nuovo ha {t.nameWith(F.firstPouch.name, 'un')} che ne contiene {F.firstPouch.size}. Gli astucci più grandi si comprano con l’Auro nella pagina Zaino, uno alla volta: {rungs(F.shopPouches)}. Quando l’astuccio è pieno, un elisir trovato diventa Auro.</p>
      <h2 id="the-serpentos-moneychanger">Il cambiavalute Serpentos</h2>
      <p>Ogni tanto un fattore Serpentos, uno dei cambiavalute Dragu che viaggiano con le navi di rifornimento, si ferma dal tuo eroe in pattuglia. Lo schermo lo dice, e la pagina Zaino mostra fino a tre offerte: qualche elisir e il prossimo astuccio o il prossimo zaino{F.merchantOff > 0 ? ` con il ${F.merchantOff}% di sconto sul prezzo della pagina Zaino` : ''}. Ogni offerta si vende una volta. Il fattore riparte dopo quattro avventure o dopo il tuo ultimo acquisto.</p>
      <h2 id="decisions">Decisioni</h2>
      <p>A volte la strada chiede al tuo eroe qualcosa di piccolo, come contribuire allo stufato del cuoco o fare un turno di guardia notturna sulla palizzata. Lo schermo dice che una decisione aspetta, e la pagina Eroe mostra entrambe le opzioni con esattamente cosa cambia ciascuna. Se non rispondi entro circa un giorno, si sceglie per te l’opzione segnata come predefinita.</p>
      <h2 id="effects">Effetti</h2>
      <p>Alcuni momenti lasciano al tuo eroe un effetto breve, elencato nella pagina Eroe con le avventure che restano. Battere un’élite gli dà {t.text('Fired up')} (+10% di attacco per otto avventure). Contribuire allo stufato gli dà {t.text('Well fed')} (+10% di XP per otto avventure). Una trappola gli lascia un {t.text('Bruised')} (−15% di difesa per quattro avventure). Il tuo eroe tiene al massimo tre effetti. Qualsiasi riposo toglie quelli negativi, e un KO li cancella tutti.</p>
      {F.standoff !== undefined ? (
        <>
          <h2 id="dug-in-elites">Élite trincerate</h2>
          <p>Dal livello {F.standoff.minLevel}, {t.nameWith(F.standoff.zone, 'nel')} e nelle zone oltre, un nemico d’élite a volte si trincera invece di cadere in un solo combattimento. Il tuo TRMNL lo mostra con la sua barra della salute, e il tuo eroe torna ad affrontarlo a ogni avventura finché non cade.</p>
          <ul>
            <li>A ogni avventura il tuo eroe lo combatte per un massimo di sei round, e la sua salute resta com’è. Colpisce molto più forte di un’élite normale, e il tuo eroe continua a combattere oltre la soglia di riposo della sua tattica prima di ritirarsi, quindi uno scontro può finire in KO. Ritirarsi non costa Auro.</li>
            <li>Quando cade, dà {F.standoff.xp} volte l’XP della creatura e {F.standoff.gold} volte il suo Auro, più un ritrovamento raro o epico di quella zona.</li>
            <li>Se ne va dopo {F.standoff.hours} ore, o prima se il tuo eroe va KO o viaggia. La pausa non ferma l’orologio.</li>
            <li>La pagina Eroe mostra la sua salute e quando se ne va. Da lì puoi lasciar perdere, e il viaggio ti chiede conferma prima di lasciarlo indietro.</li>
          </ul>
        </>
      ) : null}
      <h2 id="sky-calendar">Il cielo e il calendario</h2>
      <p>Dodici lune incatenate pendono su Volta, una per ogni Custode astrale, e la fascia in cima alla scena del tuo eroe le mostra nell’ordine del Giro: Fanciulla incatenata, Leviatano, Wyrm, Magnus, Orrore in fiore, Segugio del velo, Traditore, Congiunti, Bestia eldritch, Titano, Eclissi e Guardiano. La faccia illuminata di ogni luna segue il suo periodo, dal singolo giorno del Guardiano all’anno della Fanciulla, e la luna più piena del giorno porta un alone. La luna della Fanciulla è un guscio morto ed è sempre disegnata incrinata. Il cielo, come la data nella barra del titolo, si calcola solo dall’orologio e non cambia nulla nel gioco.</p>
      {F.occasions !== undefined ? (
        <>
          <p>Certi giorni dell’anno sono eventi celesti che addobbano la scena del tuo eroe: decorazioni in alto, qualcosa a terra, a volte un cappello, e a {SAFE} una vista diversa oltre la palizzata. Seguono la data locale del tuo TRMNL. La prima volta che il tuo eroe ne vede uno, il diario lo nomina, e quasi tutti portano un piccolo bonus finché durano. La pagina Eroe mostra l’evento di oggi e il prossimo.</p>
          <ul>
            {F.occasions.map((rule) => <li key={rule.id}><strong>{t.text(rule.name)}</strong>, {occasionDate(rule)}: {rule.id === 'friday_13th' ? 'ogni incursione al campo va storta (vedi sotto).' : rule.effectLabel ? `${t.text(rule.effectLabel)}.` : 'solo decorazioni.'}</li>)}
          </ul>
          <p><strong>{ILL_OMEN}.</strong> Le incursioni al campo partono il doppio delle volte, e vanno tutte storte: nessuno vince, ed entrambi gli eroi perdono il 20% dei PS massimi e il 5% del loro Auro, che non va a nessuno. Il registro delle incursioni del tuo eroe lo conta come contrattempo.</p>
          <p><strong>{GIFT_DAY}.</strong> Il tuo eroe trova un regalo incartato: un pezzo di equipaggiamento della zona in cui si trova, alla sua prima avventura dei tre giorni.</p>
        </>
      ) : null}
      <h2 id="rare-and-epic-gear">Equipaggiamento raro ed epico</h2>
      <p>L’equipaggiamento può essere comune, non comune, raro o epico. L’epico è il più raro, circa un ritrovamento su cento, e il più forte. L’equipaggiamento raro ed epico porta anche un tratto di Forgia stellare, indicato nel nome dell’oggetto e spiegato nella pagina Zaino. Ciascuno segue la metallurgia degli Obsidianidi: un metallo lavorato nel pezzo gli presta una proprietà.</p>
      <ul>
        <li><strong>{name(affixName('vampiric'))}</strong> cura il 5% dei PS massimi dopo ogni vittoria, perché il rame guarisce.</li>
        <li><strong>{name(affixName('lucky'))}</strong> aggiunge il 20% di Auro da vittorie e ritrovamenti.</li>
        <li><strong>{name(affixName('sturdy'))}</strong> subisce il 40% di danni in meno dalle trappole.</li>
        <li><strong>{name(affixName('thrifty'))}</strong> perde 5 punti di Auro in meno quando qualcosa va storto: una ritirata non fa perdere Auro invece del 5%, e un KO fa perdere il 5% invece del 10%.</li>
      </ul>
      <h2 id="when-your-pack-fills-up">Quando lo zaino si riempie</h2>
      <p>Un eroe nuovo parte con una bisaccia che contiene 6 pezzi di equipaggiamento. L’equipaggiamento indossato e gli elisir non occupano spazio. Quando lo zaino è pieno, il tuo eroe ti tiene da parte il prossimo pezzo che trova e continua l’avventura. Mentre quel pezzo aspetta, i ritrovamenti successivi restano lì finché non fai posto.</p>
      <h2 id="bigger-packs">Zaini più grandi</h2>
      <p>Il tuo zaino cresce con l’Auro. {F.tote ? `Al tuo eroe viene consegnato ${t.nameWith(F.tote.name, 'un')} (${F.tote.size}) entro le prime due ore circa. ` : ''}Dopo, gli zaini più grandi si comprano nella pagina Zaino, uno alla volta: {rungs(F.shopBags)}, fino a {F.topBag} posti. Non ci sono requisiti di livello, e gli zaini non escono mai come bottino.</p>
      <ol className="[&_li]:list-decimal">
        <li>Apri Zaino nell’app. Equipaggia i miglioramenti e vendi l’equipaggiamento in più per liberare spazio.</li>
        <li>Se c’è un ritrovamento messo da parte, scegli Ritira il ritrovamento. Lascia almeno un posto libero dopo averlo ritirato, così le avventure possono riprendere.</li>
        <li>Quando c’è un posto libero e niente in attesa, le avventure riprendono da sole entro 15 minuti. Prima di allora puoi ancora scegliere un’altra zona aperta dalla pagina Zaino.</li>
      </ol>
      <p>Equipaggiare non libera un posto. Vendere o smontare equipaggiamento, o comprare uno zaino più grande, sì, e il ritrovamento messo da parte entra subito nello zaino. La pagina Zaino può anche vendere il tuo doppione più debole e tenere il ritrovamento con un tocco. Anche la modalità sospensione del tuo TRMNL non ferma mai il gioco.</p>
      {F.workbench !== undefined ? <>
        <h2 id="salvage-and-the-forge">Smontaggio e la Forgia</h2>
        <p>{F.workbench.level !== undefined ? `Dal livello ${F.workbench.level}, l’` : 'L’'}equipaggiamento in più ha due modi per uscire dallo zaino: venderlo per Auro, o smontarlo in schegge di stellazia nella pagina Zaino. Lo smontaggio rende in base al grado in cui il pezzo è stato trovato, in unità della scheggia della sua rarità: {F.workbench.materials.map((m) => `${name(m.name).toLowerCase()} dall’equipaggiamento ${m.rarities.map((r) => rarityIt[r] ?? r).join(' e ')}`).join(', ')}. L’equipaggiamento epico rende {F.workbench.epicMultiplier} volte tanto. Le schegge non occupano spazio nello zaino e non si vendono mai. L’equipaggiamento viene smontato solo quando lo scegli tu.{F.workbench.level !== undefined ? ` Prima del livello ${F.workbench.level}, vendi i doppioni: il primo miglioramento richiede comunque il livello ${F.workbench.level}.` : ''}</p>
        <p>La Forgia è la Forgia stellare su scala del forte: spende schegge e Auro sull’equipaggiamento che il tuo eroe indossa, senza toglierlo. Il pezzo mantiene nome e tratto, e cambiano solo i numeri. Ogni pezzo ha un solo passo successivo. {F.workbench.tiers.map((s, i) => `${i === 0 ? 'Portare un pezzo di grado 1 a Mk II' : 'Passare da Mk II a Mk III'} costa ${price(s)}`).join('; ')}; un pezzo può salire solo a un grado che il livello del tuo eroe potrebbe equipaggiare. Quando un pezzo è Mk III (o è stato trovato così), il rinforzo aggiunge un punto a passo: {F.workbench.reinforce.map((s) => `+${s.to} per ${price(s)}`).join(', ')}. {F.workbench.reinforce.length > 0 ? `Dopo +${F.workbench.reinforce.at(-1)!.to} il pezzo è finito.` : ''} All’equipaggiamento raro ed epico si può anche montare il tratto che preferisci per {price(F.workbench.affix)}, al posto di quello che ha.</p>
        <p>I miglioramenti riescono sempre. Smontare un pezzo migliorato non restituisce quanto hai speso per migliorarlo, quindi migliora solo l’equipaggiamento che pensi di continuare a indossare.</p>
      </> : null}
      <h2 id="getting-knocked-out">Finire KO</h2>
      <p>Il tuo eroe si rimette in piedi da solo dopo circa due ore e torna a {SAFE}. Tieni XP ed equipaggiamento ma perdi il 10% dell’Auro che hai.</p>
      <h2 id="recaps">Riepiloghi</h2>
      <p>Lo schermo porta un breve riepilogo dell’ultima notte o dell’ultimo giorno conclusi, nell’ora locale del tuo TRMNL. Alle 07:00 il riepilogo della notte copre dalle 19:00 alle 07:00 e resta tutto il giorno. Alle 19:00 il riepilogo del giorno copre dalle 07:00 alle 19:00 e resta per la sera e la notte. La scena mostra giorno e notte con gli stessi orari. Le storie sopra sono sempre le più recenti.</p>
      <h2 id="understanding-rankings">Come funzionano le classifiche</h2>
      <p>Lo schermo mostra la Top 5 di XP di questa settimana per la tua fascia di livello, con la tua riga segnata, o aggiunta sotto l’elenco se sei più in basso. L’app offre anche la classifica di oggi e una classifica di sempre. Il giorno inizia alle 00:00 UTC e la settimana il lunedì alle 00:00 UTC, come per i sigilli. Le classifiche escono ogni ora, quindi un’avventura o un passaggio di livello recenti possono comparire prima che la tua posizione si aggiorni.</p>
      <p>Gli eroi in pausa o fermi mantengono i progressi. Uno senza XP questa settimana esce dalla classifica settimanale finché non ne guadagna di nuovo. I progressi totali restano registrati.</p>
      <h2 id="sharing-your-hero">Condividere il tuo eroe</h2>
      <p>Il tuo eroe ha una pagina pubblica con livello, posizione, zona attuale, totali e voci del rilievo. Auro e diario delle avventure non si vedono mai, e l’equipaggiamento solo quando è l’oggetto smarrito di un altro giocatore che il tuo eroe tiene. Il tuo nome porta alla pagina dalle classifiche e dalle incursioni e adunate degli altri giocatori, ed è lì che gli altri ti seguono. Le Impostazioni hanno i pulsanti Condividi e Copia link, e un link condiviso mostra una scheda con l’immagine del tuo eroe, nome, livello e posizione. Per nasconderla, scegli Nascondi la mia pagina eroe nelle Impostazioni. Sparisce subito, e mentre è nascosta nessuno può seguirti.</p>
      <h2 id="following">Seguiti</h2>
      <p>Con l’accesso effettuato, puoi seguire un altro giocatore dalla sua pagina eroe pubblica, fino a 20 giocatori. Tutti quelli che segui compaiono in Classifiche, con livello, posizione e luogo del loro eroe, e i link alle loro pagine. Seguire non cambia nulla nel gioco, e nessuno viene avvisato quando lo segui. Le incursioni al campo scelgono i bersagli a caso fra tutti, quindi seguire qualcuno non manda mai il tuo eroe da lui. Se un giocatore nasconde la sua pagina, vedi solo il suo nome finché non la mostra di nuovo. Se cambia il nome pubblico, esce dalla tua lista.</p>
      <h2 id="names">Nomi</h2>
      <p>Hai due nomi. Il nome del tuo eroe compare sul tuo TRMNL, nelle classifiche e sulla tua pagina eroe; per cambiarlo, fai correggere il ruolo dell’adunata dallo scrivano del forte dalla scheda Altro, per 200 Auro. Lo scrivano accetta una correzione al giorno. Il tuo nome pubblico sei tu, in ogni gioco TRMNL: compare accanto al tuo eroe in classifica, nelle incursioni e nelle adunate degli altri giocatori, e nel link della tua pagina. Puoi cambiarlo gratis una volta ogni 7 giorni da Account. I link alla tua vecchia pagina smettono di funzionare, e nessun altro può prendere il tuo vecchio nome per 7 giorni.</p>
      <h2 id="looks">Aspetto</h2>
      <p>Componi l’aspetto del tuo eroe quando lo crei: stirpe, corporatura, testa, capelli, schiena, accessorio e tabarro. Undici popoli di Volta possono prestare il giuramento dello Scudiero, dai piccoli Aquanidi, Lunaris e Dragu ai giganteschi Crystalkin. Cambia solo il suo aspetto sul tuo TRMNL, sulla tua pagina eroe e nelle adunate degli altri giocatori. Ogni aspetto gioca allo stesso modo. Anche il nome è una tua scelta: l’editor può suggerirtene uno nella lingua della stirpe scelta. Per cambiare l’aspetto in seguito, passa allo specchio del campo dalla pagina eroe o dalla scheda Altro. È gratis, quando vuoi.</p>
      <h2 id="alerts">Avvisi</h2>
      <p>Il tuo TRMNL è il modo principale per seguire il tuo eroe, ma le Impostazioni possono anche mandarti una notifica sul telefono in due casi, ciascuno spento finché non lo attivi:</p>
      <ul>
        <li><strong>Zaino pieno:</strong> lo zaino è pieno e il tuo eroe ti tiene da parte un ritrovamento. Arriva mezz’ora dopo che lo zaino si è riempito, quindi non arriva niente se lo stai già sistemando, e una volta ogni volta che si riempie.</li>
        <li><strong>Affare del cambiavalute:</strong> un fattore Serpentos vende il prossimo zaino o il prossimo astuccio{F.merchantOff > 0 ? ` con il ${F.merchantOff}% di sconto` : ''} e il tuo eroe ha l’Auro. Al massimo una volta al giorno. Un fattore con soli elisir non ne manda mai.</li>
      </ul>
      <p>Ricevi al massimo due avvisi al giorno. Le ore di silenzio vanno dalle 21:00 alle 08:00 se non le cambi: un avviso di zaino pieno aspetta che finiscano, e un affare che arriva in quelle ore viene saltato. Prima di inviare, il gioco controlla che l’avviso valga ancora, quindi non ti avvisa mai di uno zaino che hai già sistemato o di un’offerta che non c’è più. Decisioni, incursioni, KO, passaggi di livello e sigilli non mandano mai avvisi.</p>
      <p>Scegli Consenti su questo dispositivo nelle Impostazioni, poi accetta la richiesta del browser. Su iPhone e iPad, prima aggiungi l’app alla schermata Home (Condividi, poi Aggiungi alla schermata Home) e aprila da lì. Ogni dispositivo che consenti compare nelle Impostazioni con un pulsante Rimuovi; rimuovere l’ultimo spegne gli avvisi.</p>
      <h2 id="troubleshooting">Risoluzione dei problemi</h2>
      <h3 id="not-on-your-screen">Il tuo eroe non è sullo schermo</h3>
      <ul>
        <li>Premere Salva aggiunge Wardenwatch alla playlist del tuo TRMNL. Il dispositivo mostra la playlist un plugin alla volta, alla sua frequenza di aggiornamento, quindi Wardenwatch compare quando arriva il suo turno. Con diversi plugin e un aggiornamento lento può volerci un po’.</li>
        <li>Apri la playlist in TRMNL e controlla che Wardenwatch ci sia, sul dispositivo che stai guardando se ne hai più di uno, e che nessuna programmazione lo nasconda a quest’ora del giorno.</li>
        <li>La modalità sospensione ferma l’aggiornamento dello schermo di notte. Il tuo eroe continua l’avventura, e lo schermo si rimette in pari quando il dispositivo si risveglia.</li>
        <li>Uno schermo che dice «La prima avventura inizia entro 15 minuti» funziona. La prima storia arriva al quarto d’ora successivo.</li>
        <li>La pagina Eroe dell’app mostra sempre cosa sta facendo il tuo eroe, qualunque cosa mostri lo schermo.</li>
      </ul>
      <h3 id="if-the-screen-looks-old">Lo schermo sembra vecchio</h3>
      <ul>
        <li>«Gli aggiornamenti sono in ritardo» vuol dire che il servizio di gioco è indietro. I progressi del tuo eroe restano, e lo schermo si rimette in pari quando il servizio recupera.</li>
        <li>Se il sito dell’app è aggiornato ma lo schermo no, controlla in TRMNL la frequenza di aggiornamento del plugin e la sua posizione nella playlist.</li>
        <li>Le avventure girano ogni quarto d’ora, allo scoccare dell’ora e ai minuti :15, :30 e :45 nel fuso del tuo TRMNL. Lo schermo non mostra un conto alla rovescia; l’ora accanto a ogni storia è quando è successa, e l’app mostra la prossima avventura.</li>
        <li>Se hai scollegato o disinstallato, installa di nuovo da TRMNL. Il tuo eroe mantiene tutti i progressi.</li>
      </ul>
      <h2 id="disconnecting-and-removing">Scollegare e rimuovere</h2>
      <p>
        Scollegare ferma le schermate nuove per quell’installazione. TRMNL può continuare a mostrare l’ultima immagine finché non togli il plugin dalla playlist; non
        possiamo cancellare un’immagine già presente sul tuo dispositivo.
      </p>
      <h2 id="help">Aiuto</h2>
      <p>
        Scrivi a <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> per aiuto con l’account o il collegamento. Cerchiamo di rispondere entro due giorni lavorativi.
      </p>
    </>
  ),
}
