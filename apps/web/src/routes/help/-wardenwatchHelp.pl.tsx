import { contentTranslator } from '@trmnl-games/wardenwatch/i18n/lazy'
import { WARDENWATCH_INSTALL_URL, SUPPORT_EMAIL } from '../../lib/prose'
import { affixName, HELP_FACTS as F, nextTableDate, occasionName, signed, type Cost, type Modifiers, type Occasion } from './-wardenwatchFacts'
import type { HelpPage } from './-wardenwatchHelp'
import { WARDENWATCH_HELP_HEAD } from './-helpHeads'

const t = contentTranslator('pl')
const n = (value: number) => t.number(value)
const auro = (value: number) => `${n(value)} Auro`
const i = (parts: readonly string[], last = 'i') => (parts.length <= 1 ? parts.join('') : `${parts.slice(0, -1).join(', ')} ${last} ${parts.at(-1)}`)
// Polish names stay in the nominative, so a sentence names a zone or item after a colon or in brackets.
const name = (english: string) => t.name(english)
const rungs = (list: readonly { name: string; size: number; price: number }[]) => i(list.map((rung) => `${name(rung.name)} (${rung.size}) za ${auro(rung.price)}`))
const price = (c: Cost) => `${i(c.materials.map((m) => `${name(m.name).toLowerCase()} ×${m.n}`))} oraz ${auro(c.gold)}`
const boonLine = (m: Modifiers) => [m.attackPct ? `atak ${signed(m.attackPct)}%` : '', m.defensePct ? `obrona ${signed(m.defensePct)}%` : '', m.xpPct ? `XP z wygranych ${signed(m.xpPct)}%` : '', m.goldPct ? `Auro ${signed(m.goldPct)}%` : '', m.trapDamagePct ? `pułapki ranią o ${m.trapDamagePct}% słabiej` : ''].filter(Boolean).join(', ')
const ZONES_LINE = i(F.zones.filter((b) => b.level > 1).map((b) => `${name(b.name)} na poziomie ${b.level}`))
const arrives = (feature: 'todo' | 'stances' | 'choices' | 'merchant' | 'raids') => (F.unlocks === undefined ? '' : ` Pojawia się na poziomie ${F.unlocks[feature]}.`)
const SAFE = name(F.zones[0]?.name ?? 'Castellum Frigo')
const ILL_OMEN = t.text(occasionName('friday_13th', 'Dzień złej wróżby'))
const GIFT_DAY = t.text(occasionName('christmas', 'Święto środka zimy'))
/** Rarities in the genitive, after "ze sprzętu". */
const rarityPl: Record<string, string> = { common: 'pospolitego', uncommon: 'niepospolitego', rare: 'rzadkiego', epic: 'epickiego' }

// Dates in the genitive ("12 października"), weekdays in the nominative after a colon-free "pierwszy poniedziałek".
const MONTHS = ['stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca', 'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia']
const WEEKDAYS = ['niedziela', 'poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota']
const FEMININE_DAYS = new Set([0, 3, 6])
const NTH_M = ['pierwszy', 'drugi', 'trzeci', 'czwarty', 'piąty']
const NTH_F = ['pierwsza', 'druga', 'trzecia', 'czwarta', 'piąta']
const nth = (index: number, weekday: number) => (FEMININE_DAYS.has(weekday) ? NTH_F : NTH_M)[index]!
function occasionDate(rule: Occasion): string {
  const date = rule.date
  const span = rule.days > 1 ? `, przez ${rule.days} dni` : ''
  switch (date.kind) {
    case 'fixed':
      return `${date.day} ${MONTHS[date.month - 1]}${span}`
    case 'nth_weekday': {
      const base = `${nth(date.nth - 1, date.weekday)} ${WEEKDAYS[date.weekday]} ${MONTHS[date.month - 1]}`
      const offset = date.offsetDays ?? 0
      return `${offset === 0 ? base : `${WEEKDAYS[(date.weekday + offset) % 7]} po dniu: ${base}`}${span}`
    }
    case 'friday_13th':
      return 'każdy piątek 13.'
    case 'easter':
      return date.offsetDays === -2 ? 'od Wielkiego Piątku do Poniedziałku Wielkanocnego' : `${Math.abs(date.offsetDays)} dni ${date.offsetDays < 0 ? 'przed' : 'po'} Niedzieli Wielkanocnej${span}`
    case 'table': {
      const next = nextTableDate(date.dates)
      return next === null ? 'data zmienia się co roku' : `data zmienia się co roku (najbliższa: ${next.getUTCDate()} ${MONTHS[next.getUTCMonth()]} ${next.getUTCFullYear()})`
    }
  }
}

export const pl: HelpPage = {
  seoTitle: WARDENWATCH_HELP_HEAD.pl.seoTitle,
  description: WARDENWATCH_HELP_HEAD.pl.description,
  title: 'Wardenwatch na TRMNL',
  contents: {
    'getting-started': 'Pierwsze kroki', 'if-the-qr-sends-you-back-to-setup': 'Gdy kod QR odsyła do instalacji', 'how-time-works': 'Jak płynie czas', zones: 'Strefy', seals: 'Pieczęcie', commissions: 'Zlecenia', 'heroes-and-classes': 'Bohaterowie i klasy', stances: 'Postawy', 'camp-raids': 'Rajdy na obóz', musters: 'Zbiórki', strays: 'Rzeczy zagubione', 'garrison-orders': 'Rozkazy garnizonu', draughts: 'Eliksiry', 'the-serpentos-moneychanger': 'Bankier Serpentos', decisions: 'Decyzje', effects: 'Efekty', 'sky-calendar': 'Niebo i kalendarz', 'rare-and-epic-gear': 'Rzadki i epicki sprzęt', 'when-your-pack-fills-up': 'Gdy plecak się zapełni', 'bigger-packs': 'Większe plecaki', 'salvage-and-the-forge': 'Rozbiórka i Kuźnia', 'getting-knocked-out': 'Nokaut', recaps: 'Podsumowania', 'understanding-rankings': 'Jak działają rankingi', 'sharing-your-hero': 'Udostępnianie bohatera', 'following': 'Obserwowani', names: 'Nazwy', looks: 'Wygląd', alerts: 'Alerty', troubleshooting: 'Rozwiązywanie problemów', 'disconnecting-and-removing': 'Odłączanie i usuwanie', help: 'Pomoc',
  },
  Body: () => (
    <>
      <h2 id="getting-started">Pierwsze kroki</h2>
      <ul>
        <li>Otwórz <a href={WARDENWATCH_INSTALL_URL}>Wardenwatch w sklepie TRMNL</a> i wybierz „Instaluj”.</li>
        <li>Zaloguj się do Wardenwatch, wybierz nazwę publiczną, nadaj Giermkowi imię i wygląd, a potem połącz instalację.</li>
        <li>Wróć do TRMNL i kliknij „Zapisz”. Pierwsza przygoda bohatera zacznie się w ciągu 15 minut.</li>
        <li>Dodaj plugin do playlisty albo do mashupu, jeśli chcesz mieć bohatera obok innych pluginów. Obsługiwane są wszystkie cztery rozmiary układu.</li>
      </ul>
      <h2 id="if-the-qr-sends-you-back-to-setup">Gdy kod QR odsyła do instalacji</h2>
      <p>Kod QR otwiera aplikację dla konta, na które jesteś zalogowany. Nie zaczyna nowej instalacji. Sprawdź adres e-mail zalogowanego konta na stronie instalacji i użyj opcji „Przełącz konto”, jeśli pierwotnie łączyłeś się z innego konta.</p>
      <p>Jeśli instalacja mówi „Połącz ponownie Wardenwatch”, połączenie z TRMNL istnieje, ale brakuje bohatera. Może się tak zdarzyć po resecie gry. Zainstaluj nową kopię <a href={WARDENWATCH_INSTALL_URL}>Wardenwatch z TRMNL</a>, zaloguj się na to samo konto, wybierz nowe imię bohatera, połącz i kliknij „Zapisz” w TRMNL. Gdy nowa kopia zadziała, usuń starą z playlisty.</p>
      <p>Jeśli instalacja mówi „Zapisz w TRMNL, aby zacząć”, bohater jest już gotowy. Wróć do tej instalacji w TRMNL i kliknij „Zapisz”.</p>
      <h2 id="how-time-works">Jak płynie czas</h2>
      <p>
        Świat gry posuwa się naprzód co 15 minut, niezależnie od tego, czy ekran jest włączony. TRMNL pokazuje migawkę i odświeża się we własnym rytmie.
        Tryb uśpienia, wolniejsze odświeżanie i inne elementy playlisty nigdy nie zmniejszają postępów bohatera. Godziny przygód w aplikacji są w strefie czasowej twojej przeglądarki.
      </p>
      <p>
        Pasek tytułu TRMNL pokazuje datę Volty, na przykład „Rime Ascendant 4 · Gyre Wyrma 1203”. Dzień Volty to jedno przejście Myrkosa Strażnika przez niebo i trwa jeden prawdziwy dzień. Dziewięć dni tworzy oś (Ascendant, Skybottom, Descendant, Midheaven), cztery osie Cykl kardynalny (Rime, Echo, Gloam, Grave, Melt, Verd, Tan, Shade, Molt, Tanhaus), a dziesięć cykli rok o 360 dniach; każdym rokiem rządzi po kolei jeden z dwunastu Wardenów. Rachuba zaczęła się 1 Rime Ascendant 1203, w roku założenia Castellum Frigo. Data to tylko rachuba: symulacja biegnie w czasie rzeczywistym.
      </p>
      <h2 id="zones">Strefy</h2>
      <p>Mapa Ur-Turula ma {F.zones.length} stref, a bohater zaczyna w forcie Ekspedycji, na wpół zbudowanym na wschodnim brzegu Pradawnych Dzikich Ziem: {SAFE}. Każda strefa otwiera się na jakimś poziomie, niezależnie od tego, czy tam zaglądasz: {ZONES_LINE}. TRMNL zaznacza wtedy nowy teren na mapie; czy tam pójść, decydujesz ty, z mapy na stronie Bohater. Strefy dalej od fortu mają twardsze stworzenia, więcej Auro, mocniejsze eliksiry i lepiej płatne rozkazy garnizonu. W forcie ({SAFE}) bohater nie może dostać nokautu; w każdej innej strefie może.</p>
      <ul>
        {F.zones.map((z) => <li key={z.id}><strong>{name(z.name)}</strong>{z.level > 1 ? ` (poziom ${z.level})` : ' (od początku)'}: {z.monsters.map(name).join(', ')}.</li>)}
      </ul>
      {F.lore ? <p>Strona Notatki terenowe w zakładce Więcej przechowuje to, co pomiar Ur-Turula zapisał o każdej strefie i stworzeniu. Notatka strefy otwiera się, gdy bohater pierwszy raz w niej stanie, notatka stworzenia przy pierwszej wygranej z nim. Notatki nie wpływają na grę.</p> : null}
      <h2 id="seals">Pieczęcie</h2>
      <p>Zostaw Wardenwatch na playliście i szukaj na pasku tytułu ekranu kodu pieczęci, sześciu cyfr, na przykład 482 917 (wąskie pionowe mashupy skracają jego etykietę). Wpisz ten kod w Ustawieniach aplikacji, aby odcisnąć w kolekcji stałą woskową pieczęć. Pokazuje go zarówno pełny ekran, jak i mashupy; podgląd w aplikacji go ukrywa. Gdy pieczęć czeka, kod QR na ekranie też ją zbiera: zeskanuj go telefonem, a aplikacja doda ją na półkę, nawet z wyłączonym paskiem tytułu. Gdzie jest miejsce, kod jest wydrukowany obok.</p>
      <p>Możesz zebrać jedną pieczęć na tydzień, z nowym kodem w każdy poniedziałek o 00:00 UTC. Kod z poprzedniego tygodnia też działa, jeśli ekran odświeża się powoli. Jeśli przegapisz tydzień, w następnym dostaniesz tę samą pieczęć. Po zebraniu całego kompletu możesz zbierać kolejne egzemplarze. Pieczęcie nie zmieniają XP, sprzętu ani rankingów, a dodatkowe urządzenia czy szybsze odświeżanie nie dają nic ekstra.</p>
      {F.career !== undefined ? (
        <>
          <h2 id="commissions">Zlecenia</h2>
          <p>Bohater zawsze ma jeden cel od komendanta fortu, pokazany u góry strony Bohater: „Wygraj pierwszą walkę”, „Załóż znaleziony element sprzętu”, „Dotrzyj do Fiordów Moonbight”, „Kup Plecak pielgrzyma”. Część osiąga się podczas przygód; resztę robisz tutaj, na stronie Plecak lub Bohater. Osiągnięcie celu jest ogłaszane na TRMNL i odkłada trochę Auro ({n(F.career.gold)} na całej drabinie); naciśnij „Odbierz” na stronie Bohater, aby je zgarnąć. Cele nie dają XP i nie wygasają, a następny zaczyna się niezależnie od tego, czy odebrałeś nagrodę.</p>
          <ul>
            <li>Strona Zlecenia w zakładce Więcej wymienia {F.career.goals} celów po kolei, z datą osiągnięcia każdego. Cel zrobiony już przed pojawieniem się drabiny liczy się jako osiągnięty. Stopnie po drodze to Giermek, Zaprzysiężony, Chorąży i Zaprzysiężony Wardenom.</li>
            {F.unlocks !== undefined ? <li>Funkcje przychodzą z poziomem, niezależnie od tego, czy tu zaglądasz: rozkazy garnizonu na poziomie {F.unlocks.todo}, postawy na poziomie {F.unlocks.stances}, decyzje w drodze na poziomie {F.unlocks.choices}, {F.meetings?.level !== undefined ? `zbiórki z towarzyszami na poziomie ${F.meetings.level}, ` : ''}{F.workbench?.level !== undefined ? `rozbiórka i Kuźnia na poziomie ${F.workbench.level}, ` : ''}bankier Serpentos na poziomie {F.unlocks.merchant} i rajdy na obóz na poziomie {F.unlocks.raids}. TRMNL ogłasza każdą z nich. Strefy też otwierają się z poziomem: {ZONES_LINE}.</li> : null}
            <li>Gdy otwierają się postawy, bohater nie ma wybranej żadnej i gra Niezłomną. Jeden cel prosi o wybór postawy; liczy się każda z trzech, a później możesz ją zmienić.</li>
            <li>Kilka wczesnych celów ma gwarantowany czas: pierwsza walka w ciągu kilku przygód, element sprzętu w pierwszym tuzinie, a pierwsza decyzja, bankier i elita w mniej więcej dobę od swojego poziomu. Cała reszta zależy od szczęścia.</li>
          </ul>
        </>
      ) : null}
      {F.classes !== undefined ? (
        <>
          <h2 id="heroes-and-classes">Bohaterowie i klasy</h2>
          <p>Każdy zaczyna jako Rycerz. Gdy Rycerz osiągnie poziom {F.rosterLevel}, TRMNL ogłasza drugiego bohatera i możesz zwerbować Zabójcę na stronie Bohaterowie w zakładce Więcej. Zabójca zaczyna na poziomie 1 z własnym imieniem, wyglądem, sprzętem, Auro, eliksirami i celami.</p>
          <ul>
            <li>Na przygody wyrusza jeden bohater naraz i to jego pokazuje TRMNL i rankingi. Drugi zostaje tam, gdzie go zostawiłeś. Nie przeżywa przygód i niczego potem nie nadrabia, a bankier, który go odwiedza, odjeżdża.</li>
            <li>Zmieniać możesz raz dziennie. Powrót w ciągu dziesięciu minut się nie liczy. Bohater po nokaucie albo w drodze musi najpierw dojść do siebie lub dotrzeć na miejsce.</li>
            <li>Możesz mieć po jednym bohaterze z każdej klasy. Wpisy w pomiarze należą do ciebie, niezależnie od tego, który bohater je zdobył; kilka należy tylko do Zabójcy.</li>
            <li><strong>Rycerz</strong>: {t.text(F.classes.warriorBlurb)}</li>
            <li><strong>Zabójca</strong>: {t.text(F.classes.rogueBlurb)} Zdrowie {F.classes.rogue.hpPct}%, atak {signed(F.classes.rogue.attackPct)}%, obrona {signed(F.classes.rogue.defensePct)}%, Auro z każdej walki i znaleziska {signed(F.classes.rogue.goldPct)}%, a w każdym rajdzie na obóz {F.classes.rogue.raidEdgePct} punktów po jego stronie. Awansuje w tempie Rycerza, ale trochę częściej dostaje nokaut.</li>
          </ul>
        </>
      ) : null}
      <h2 id="stances">Postawy</h2>
      <p>Na stronie Bohater wybierz, jak daleko bohater się zapuszcza, zanim odpocznie.{arrives('stances')} Postawa działa od następnej przygody i możesz ją zmienić w każdej chwili. TRMNL pokazuje ją obok licznika plecaka, pod wskaźnikiem, którego igła stoi nisko przy Czujnej, pośrodku przy Niezłomnej i wysoko przy Zuchwałej.</p>
      <ul>
        <li><strong>Czujna</strong> pije eliksir poniżej 65% PŻ, odpoczywa poniżej 50% i rusza znowu przy 90%. Daje 90% zwykłego XP za wygrane.</li>
        <li><strong>Niezłomna</strong>, reguła garnizonu i postawa domyślna, pije poniżej 50%, odpoczywa poniżej 35% i rusza znowu przy 75%, ze zwykłym XP.</li>
        <li><strong>Zuchwała</strong> pije poniżej 35%, odpoczywa poniżej 20% i rusza znowu przy 60%. Daje 115% XP za wygrane, ale częściej kończy się nokautem.</li>
      </ul>
      <p>W forcie ({SAFE}) bohater nie może dostać nokautu, więc Zuchwała nic nie ryzykuje w obrębie murów. W każdej innej strefie nokaut kosztuje Auro i odsyła bohatera z powrotem do fortu, a Zuchwała dostaje nokaut najczęściej.</p>
      <h2 id="camp-raids">Rajdy na obóz</h2>
      <p>Na patrolu Giermkowie czasem grzebią sobie nawzajem w ekwipunku. Każdy aktywny bohater{F.unlocks === undefined ? '' : ` od poziomu ${F.unlocks.raids}`} robi rajdy i jest ich celem automatycznie. Nie możesz zacząć rajdu ani wybrać celu.{F.unlocks === undefined ? '' : ` Poniżej poziomu ${F.unlocks.raids} bohater ani nie robi rajdów, ani nie jest ich celem.`} Rajd pojawia się w dziennikach przygód obu bohaterów z nazwą publiczną drugiego gracza, a strona Bohater prowadzi rejestr rajdów twojego bohatera.</p>
      <ul>
        <li>Kto wygra, rozstrzyga rzut monetą, który przesuwa tylko postawa. Poziom, sprzęt i efekty nigdy się nie liczą. Czujna dodaje 10 punktów po swojej stronie, Niezłomna nic, a Zuchwała odejmuje 5, zarówno w ataku, jak i w obronie.</li>
        <li>Częstotliwość rajdów też zależy od postawy: Czujna mniej więcej co drugi dzień patrolu, Niezłomna mniej więcej raz dziennie, Zuchwała mniej więcej dwa razy dziennie.</li>
        <li>Przegrany oddaje zwycięzcy 5% swojego Auro, więc Auro tylko zmienia właściciela. Obaj tracą zdrowie: przegrany 30% maksymalnych PŻ, zwycięzca 10%. Sprzęt z cechą {name(affixName('thrifty'))} odejmuje swoje punkty od straty Auro.</li>
        <li>Rajd może skończyć się nokautem, tak jak walka; w forcie bohater zostaje wtedy uratowany. Rajdy trafiają tylko na bohaterów, którzy eksplorują lub odpoczywają, a bohater po rajdzie ma spokój przez mniej więcej sześć godzin.</li>
        <li>Jeśli wolisz przegrywać mniej rajdów, wybierz Czujną, która rzadziej rusza i częściej wygrywa.</li>
      </ul>
      {F.meetings !== undefined ? (
        <>
          <h2 id="musters">Zbiórki</h2>
          <p>Od czasu do czasu, zamiast walki, bohater wpada na bohatera innego gracza w tej samej strefie{F.meetings.level === undefined ? '' : `, od poziomu ${F.meetings.level}`}. Stoją w kolejce po zupę, opowiadają sobie historie z warty albo dzielą się racjami, a obaj dostają ten sam mały bonus na {F.meetings.boonAdventures} przygód. Oba dzienniki opisują to z nazwą publiczną drugiego gracza, a zakładka Dziennik pokazuje pięć ostatnich zbiórek bohatera.</p>
          <ul>
            {F.meetings.kinds.map((kind) => <li key={kind.id}><strong>{t.text(kind.name)}</strong>: {t.text(kind.effect)}, {boonLine(kind.modifiers)}.</li>)}
            <li>Nic nie zmienia właściciela. Zbiórka zajmuje miejsce jednej przygody, a bonus mniej więcej to wyrównuje.</li>
            <li>Zdarza się tak samo często bez względu na postawę czy klasę, mniej więcej co drugi dzień u bohatera na patrolu. Bohaterowie spotykają się tylko podczas eksploracji lub odpoczynku, a bohater po zbiórce ma spokój przez mniej więcej dwanaście godzin.</li>
          </ul>
        </>
      ) : null}
      {F.lostProperty ? (
        <>
          <h2 id="strays">Rzeczy zagubione</h2>
          <p>Gdy bohater dostanie nokaut poza murami, gubi na drodze w tej strefie zapasową broń albo zbroję, z wydrapaną twoją nazwą publiczną. Bohater zachowuje wszystko, co miał na sobie. Później bohater innego gracza, patrolując tę strefę, może znaleźć zgubę zamiast zwykłego znaleziska, a twój TRMNL powie ci, kto ją znalazł.</p>
          <ul>
            <li>Twój bohater może w ten sam sposób znaleźć zguby innych graczy. Zguba to zwykły sprzęt: załóż go, sprzedaj, rozbierz albo zanieś do Kuźni. Ma podstawowe statystyki swojego rodzaju i rzadkości, bez ulepszeń pierwszego właściciela.</li>
            <li>Nazwa zostaje. Strona Plecak i karta Rzeczy zagubione w zakładce Dziennik pokazują, czyj to był sprzęt, podobnie jak twoja strona bohatera, dopóki go masz.</li>
            <li>Zguba zastępuje tylko znalezisko, które bohater i tak by zrobił, więc nikt nie dostaje dodatkowego sprzętu. Nagrody ze zleceń i podarunki z okazji święta ({GIFT_DAY}) to zawsze nowy sprzęt.</li>
            <li>Naraz leży gdzieś tylko jedna twoja zguba. Jeśli bohater znów dostanie nokaut, zanim ktoś ją znajdzie, nowa zguba zastąpi starą.</li>
          </ul>
        </>
      ) : null}
      {F.todo !== undefined ? (
        <>
          <h2 id="garrison-orders">Rozkazy garnizonu</h2>
          <p>Tablica fortu wywiesza trzy drobne rozkazy dla bohatera, takie jak „Pokonaj 4 Piwniczne szronoszczury”, „Znajdź 2 elementy sprzętu” czy „Patroluj Fiordy Moonbight przez 16 przygód”.{arrives('todo')} Wykonuje je na patrolu, a strona Bohater pokazuje postęp każdego. Gdy rozkaz jest wykonany, ekran to ogłasza, a bohater dostaje trochę Auro: {i(F.todo.pay.map(String), 'lub')}, zależnie od strefy. Rozkazy nie dają XP, więc nie wpływają na rankingi.</p>
          <ul>
            <li>Każdego ranka o {F.todo.muster} czasu lokalnego twojego TRMNL poranna zbiórka wywiesza nowe rozkazy w miejsce wykonanych. Ekran je wymienia.</li>
            <li>Rozkazy nigdy nie wygasają. Zablokowany rozkaz zostaje wymieniony sam po dwóch zbiórkach.</li>
            <li>Co najmniej dwa z trzech rozkazów da się wykonać tam, gdzie jest bohater. Najwyżej jeden wymaga podróży do innej strefy, jeśli chcesz go tam wysłać.</li>
            <li>Raz między zbiórkami możesz na stronie Bohater wymienić jeden niewykonany rozkaz na inny.</li>
          </ul>
        </>
      ) : null}
      <h2 id="draughts">Eliksiry</h2>
      {F.potions === undefined
        ? <p>Miedziany eliksir przywraca 40% maksymalnych PŻ bohatera, w zaokrągleniu w górę. Bohater pije go automatycznie, gdy PŻ spadną poniżej progu eliksiru jego postawy na patrolu, a dziennik to odnotowuje. Bez eliksirów bohater odpoczywa poniżej progu odpoczynku i rusza znowu, gdy dojdzie do siebie. Możesz też wypić eliksir sam na stronie Bohater, gdy bohater eksploruje lub odpoczywa i nie ma pełnego zdrowia. Eliksiry znajduje się na patrolu i nigdy nie zajmują miejsca w plecaku.</p>
        : <>
          <p>Miedziane eliksiry mają {F.potions.strengths.length} rodzaje mocy: {i(F.potions.strengths.map((s) => `${name(s.name).toLowerCase()} (${s.healPct}%)`))}; każdy przywraca taki odsetek maksymalnych PŻ bohatera, w zaokrągleniu w górę. Znaleziska zależą od miejsca: {F.potions.drops.map((d) => `${name(d.zone)}: ${d.rest.length === 0 ? 'tylko' : 'głównie'} ${name(`${d.top.toLowerCase()}s`)}${d.rest.length === 0 ? '' : `, czasem ${d.rest.map((r) => name(`${r.toLowerCase()}s`)).join(' i ')}`}`).join('; ')}. Nowy bohater zaczyna z eliksirami, a bankier i decyzje w drodze też je rozdają. Wszystkie rodzaje mieszczą się w jednej skrzynce i nigdy nie zajmują miejsca w plecaku.</p>
          <p>Bohater pije automatycznie, gdy PŻ spadną poniżej progu eliksiru jego postawy na patrolu: najsłabszy eliksir, który wyniesie go z powrotem nad ten próg, albo najmocniejszy, jaki ma, jeśli słabszy nie wystarczy. Dziennik podaje, co wypił. Bez eliksirów bohater odpoczywa poniżej progu odpoczynku i rusza znowu, gdy dojdzie do siebie. Możesz też wypić eliksir sam na stronie Bohater, gdy bohater eksploruje, odpoczywa albo podróżuje i nie ma pełnego zdrowia; gdy w skrzynce jest kilka rodzajów, strona Bohater pyta, który.</p>
          <p><strong>Łączenie.</strong> Na stronie Plecak {name(`${F.potions.combine.from.toLowerCase()}s`)} ×{F.potions.combine.count} oraz {F.potions.combine.materials.map((m) => `${name(m.name).toLowerCase()} ×${m.n}`).join(', ')} dają jeden eliksir: {name(F.potions.combine.to.toLowerCase())}. Łączenie nigdy nie zostawia cię z większą liczbą eliksirów niż przedtem, więc skrzynka nie może się przepełnić. Dzieje się tylko wtedy, gdy to wybierzesz.</p>
        </>}
      <p>Eliksiry trzyma się w skrzynce. Nowy bohater ma {name(F.firstPouch.name)} na {F.firstPouch.size} eliksirów. Większe skrzynki kupuje się za Auro na stronie Plecak, po jednej: {rungs(F.shopPouches)}. Gdy skrzynka jest pełna, znaleziony eliksir zamienia się w Auro.</p>
      <h2 id="the-serpentos-moneychanger">Bankier Serpentos</h2>
      <p>Od czasu do czasu faktor Serpentos, jeden z bankierów Dragu podróżujących ze statkami zaopatrzeniowymi, zatrzymuje się przy bohaterze na patrolu. Ekran to ogłasza, a strona Plecak pokazuje do trzech ofert: kilka eliksirów oraz następną skrzynkę lub plecak{F.merchantOff > 0 ? ` o ${F.merchantOff}% taniej niż na stronie Plecak` : ''}. Każda oferta sprzedaje się raz. Faktor rusza dalej po czterech przygodach albo po twoim ostatnim zakupie.</p>
      <h2 id="decisions">Decyzje</h2>
      <p>Czasem droga pyta bohatera o drobiazg, na przykład o dorzucenie się do gulaszu kucharza albo nocną wartę na palisadzie. Ekran ogłasza, że czeka decyzja, a strona Bohater pokazuje obie opcje i dokładnie to, co każda zmienia. Jeśli nie odpowiesz w ciągu mniej więcej doby, zostanie wybrana opcja oznaczona jako domyślna.</p>
      <h2 id="effects">Efekty</h2>
      <p>Niektóre chwile zostawiają bohaterowi krótki efekt, widoczny na stronie Bohater z liczbą pozostałych przygód. Pokonanie elity daje {t.text('Fired up')} (+10% ataku na osiem przygód). Dorzucenie się do gulaszu daje {t.text('Well fed')} (+10% XP na osiem przygód). Pułapka zostawia {t.text('Bruised')} (−15% obrony na cztery przygody). Bohater ma naraz najwyżej trzy efekty. Każdy odpoczynek zdejmuje złe efekty, a nokaut czyści wszystkie.</p>
      {F.standoff !== undefined ? (
        <>
          <h2 id="dug-in-elites">Okopane elity</h2>
          <p>Od poziomu {F.standoff.minLevel}, w strefie {name(F.standoff.zone)} i dalszych, elita czasem się okopuje, zamiast paść w jednej walce. TRMNL pokazuje ją z paskiem zdrowia, a bohater wraca do niej w każdej przygodzie, aż padnie.</p>
          <ul>
            <li>W każdej przygodzie bohater walczy z nią do sześciu rund, a jej zdrowie się nie odnawia. Bije znacznie mocniej niż zwykła elita, a bohater walczy poniżej progu odpoczynku swojej postawy, zanim się wycofa, więc starcie może skończyć się nokautem. Wycofanie się nie kosztuje Auro.</li>
            <li>Pokonana daje {F.standoff.xp} razy więcej XP i {F.standoff.gold} razy więcej Auro niż zwykle za to stworzenie, a do tego rzadkie lub epickie znalezisko z tej strefy.</li>
            <li>Odchodzi po {F.standoff.hours} godzinach albo wcześniej, jeśli bohater dostanie nokaut lub wyruszy w podróż. Pauza nie zatrzymuje zegara.</li>
            <li>Strona Bohater pokazuje jej zdrowie i czas odejścia. Możesz ją tam odpuścić, a podróż pyta, zanim ją zostawisz.</li>
          </ul>
        </>
      ) : null}
      <h2 id="sky-calendar">Niebo i kalendarz</h2>
      <p>Nad Voltą wiszą dwanaście skutych łańcuchami księżyców, po jednym na każdego Astralnego Wardena, a pas u góry sceny bohatera pokazuje je w kolejności Gyre: Skuta Dziewica, Lewiatan, Wyrm, Magnus, Kwitnąca Groza, Ogar Zasłony, Zdrajca, Zrośnięci, Bestia Eldritch, Tytan, Zaćmienie i Strażnik. Oświetlona strona każdego księżyca podąża za własnym okresem, od jednego dnia Strażnika po rok Dziewicy, a najpełniejszy księżyc dnia nosi aureolę. Księżyc Dziewicy to martwa skorupa i zawsze jest rysowany pęknięty. Niebo, tak jak data na pasku tytułu, liczone jest wyłącznie z zegara i niczego nie zmienia w grze.</p>
      {F.occasions !== undefined ? (
        <>
          <p>Niektóre dni roku to zjawiska na niebie, które dekorują scenę bohatera: ozdoby u góry, coś na ziemi, czasem kapelusz, a w forcie inny widok za palisadą. Kierują się lokalną datą twojego TRMNL. Gdy bohater zobaczy zjawisko pierwszy raz, dziennik je nazywa, a większość daje mały bonus, dopóki trwa. Strona Bohater pokazuje dzisiejsze zjawisko i następne.</p>
          <ul>
            {F.occasions.map((rule) => <li key={rule.id}><strong>{t.text(rule.name)}</strong>, {occasionDate(rule)}: {rule.id === 'friday_13th' ? 'każdy rajd na obóz kończy się wpadką (niżej).' : rule.effectLabel ? `${t.text(rule.effectLabel)}.` : 'tylko dekoracje.'}</li>)}
          </ul>
          <p><strong>{ILL_OMEN}.</strong> Rajdy na obóz zaczynają się dwa razy częściej i każdy kończy się wpadką: nikt nie wygrywa, a obaj bohaterowie tracą 20% maksymalnych PŻ i 5% Auro, którego nikt nie dostaje. Rejestr rajdów bohatera liczy to jako wpadkę.</p>
          <p><strong>{GIFT_DAY}.</strong> Bohater znajduje jeden zapakowany podarunek: element sprzętu ze strefy, w której jest, w pierwszej przygodzie z tych trzech dni.</p>
        </>
      ) : null}
      <h2 id="rare-and-epic-gear">Rzadki i epicki sprzęt</h2>
      <p>Sprzęt bywa pospolity, niepospolity, rzadki lub epicki. Epicki jest najrzadszy, mniej więcej jedno znalezisko na sto, i najmocniejszy. Rzadki i epicki sprzęt ma też jedną cechę Gwiezdnego Kowalstwa, widoczną w nazwie przedmiotu i opisaną na stronie Plecak. Każda wynika z metalurgii Obsydianidów: metal wkuty w element użycza mu jednej właściwości.</p>
      <ul>
        <li><strong>{name(affixName('vampiric'))}</strong> leczy 5% maksymalnych PŻ po każdej wygranej, bo miedź leczy.</li>
        <li><strong>{name(affixName('lucky'))}</strong> dodaje 20% Auro z wygranych i znalezisk.</li>
        <li><strong>{name(affixName('sturdy'))}</strong> przyjmuje o 40% mniej obrażeń od pułapek.</li>
        <li><strong>{name(affixName('thrifty'))}</strong> traci o 5 punktów mniej Auro, gdy coś pójdzie źle: odwrót nie kosztuje Auro zamiast 5%, a nokaut kosztuje 5% zamiast 10%.</li>
      </ul>
      <h2 id="when-your-pack-fills-up">Gdy plecak się zapełni</h2>
      <p>Nowy bohater zaczyna z sakwą na 6 elementów sprzętu. Założony sprzęt i eliksiry nie zajmują miejsca. Gdy plecak jest pełny, bohater odkłada dla ciebie następny znaleziony element i dalej przeżywa przygody. Dopóki ten element czeka, kolejne znaleziska zostają na miejscu, aż zrobisz miejsce.</p>
      <h2 id="bigger-packs">Większe plecaki</h2>
      <p>Plecak rośnie za Auro. {F.tote ? `W ciągu mniej więcej pierwszych dwóch godzin bohater dostaje przydział: ${name(F.tote.name)} (${F.tote.size}). ` : ''}Potem większe plecaki kupuje się na stronie Plecak, po jednym: {rungs(F.shopBags)}, aż do {F.topBag} miejsc. Nie ma wymagań poziomu, a plecaki nigdy nie wypadają jako łup.</p>
      <ol className="[&_li]:list-decimal">
        <li>Otwórz Plecak w aplikacji. Załóż ulepszenia i sprzedaj zbędny sprzęt, aby zrobić miejsce.</li>
        <li>Jeśli czeka odłożone znalezisko, wybierz „Odbierz znalezisko”. Po odebraniu zostaw co najmniej jedno wolne miejsce, aby przygody mogły ruszyć.</li>
        <li>Gdy jest wolne miejsce i nic nie czeka, przygody wznawiają się same w ciągu 15 minut. Do tego czasu możesz jeszcze wybrać inną otwartą strefę na stronie Plecak.</li>
      </ol>
      <p>Założenie sprzętu nie zwalnia miejsca. Sprzedaż lub rozbiórka sprzętu albo zakup większego plecaka zwalnia, a odłożone znalezisko od razu trafia do plecaka. Strona Plecak potrafi też jednym stuknięciem sprzedać najsłabszy zapas i zatrzymać znalezisko. Tryb uśpienia TRMNL też nigdy nie zatrzymuje gry.</p>
      {F.workbench !== undefined ? <>
        <h2 id="salvage-and-the-forge">Rozbiórka i Kuźnia</h2>
        <p>{F.workbench.level !== undefined ? `Od poziomu ${F.workbench.level} z` : 'Z'}będny sprzęt ma dwa wyjścia z plecaka: sprzedaż za Auro albo rozbiórkę na odłamki stellazii na stronie Plecak. Rozbiórka daje tyle, ile wart jest stopień, na którym element znaleziono, w jednostkach odłamka jego rzadkości: {F.workbench.materials.map((m) => `${name(m.name).toLowerCase()} ze sprzętu ${m.rarities.map((r) => rarityPl[r] ?? r).join(' i ')}`).join(', ')}. Epicki sprzęt daje {F.workbench.epicMultiplier} razy więcej. Odłamki nie zajmują miejsca w plecaku i nigdy nie są sprzedawane. Sprzęt jest rozbierany tylko wtedy, gdy to wybierzesz.{F.workbench.level !== undefined ? ` Przed poziomem ${F.workbench.level} sprzedawaj zapasy: pierwsze ulepszenie i tak wymaga poziomu ${F.workbench.level}.` : ''}</p>
        <p>Kuźnia to Gwiezdne Kowalstwo na miarę fortu: wydaje odłamki i Auro na sprzęt, który nosi bohater, bez zdejmowania go. Element zachowuje nazwę i cechę, zmieniają się tylko liczby. Każdy element ma jeden następny krok. {F.workbench.tiers.map((s, k) => `${k === 0 ? 'Podniesienie elementu stopnia 1 do Mk II' : 'Przejście z Mk II do Mk III'} kosztuje: ${price(s)}`).join('; ')}; element można podnieść tylko do stopnia, który bohater mógłby założyć na swoim poziomie. Gdy element ma Mk III (albo taki został znaleziony), wzmocnienie dodaje punkt na krok: {F.workbench.reinforce.map((s) => `+${s.to} za ${price(s)}`).join(', ')}. {F.workbench.reinforce.length > 0 ? `Po +${F.workbench.reinforce.at(-1)!.to} element jest ukończony.` : ''} Rzadkiemu i epickiemu sprzętowi można też dodać wybraną cechę za {price(F.workbench.affix)}, w miejsce obecnej.</p>
        <p>Ulepszenia zawsze się udają. Rozbiórka ulepszonego elementu nie zwraca tego, co na niego wydałeś, więc ulepszaj tylko sprzęt, który zamierzasz dalej nosić.</p>
      </> : null}
      <h2 id="getting-knocked-out">Nokaut</h2>
      <p>Bohater sam dochodzi do siebie po mniej więcej dwóch godzinach i wraca do fortu ({SAFE}). Zachowujesz XP i sprzęt, ale tracisz 10% obecnego Auro.</p>
      <h2 id="recaps">Podsumowania</h2>
      <p>Ekran pokazuje krótkie podsumowanie ostatniej zakończonej nocy lub dnia, w czasie lokalnym twojego TRMNL. O 07:00 podsumowanie nocy obejmuje 19:00–07:00 i zostaje przez cały dzień. O 19:00 podsumowanie dnia obejmuje 07:00–19:00 i zostaje przez wieczór i noc. Scena pokazuje dzień i noc w tych samych godzinach. Historie nad nim są zawsze najnowsze.</p>
      <h2 id="understanding-rankings">Jak działają rankingi</h2>
      <p>Ekran pokazuje Top 5 XP tego tygodnia w twojej grupie poziomów, z zaznaczonym twoim wierszem albo z wierszem dopisanym pod listą, gdy jesteś niżej. Aplikacja ma też tabelę dnia i tabelę od początku. Dzień zaczyna się o 00:00 UTC, a tydzień w poniedziałek o 00:00 UTC, tak jak pieczęcie. Rankingi publikują się co godzinę, więc niedawna przygoda lub awans mogą pojawić się, zanim zaktualizuje się twoje miejsce.</p>
      <p>Bohaterowie wstrzymani lub stojący zachowują postępy. Bohater bez XP w tym tygodniu wypada z tygodniowej tabeli, dopóki znów czegoś nie zdobędzie. Postępy od początku zostają zapisane.</p>
      <h2 id="sharing-your-hero">Udostępnianie bohatera</h2>
      <p>Bohater ma stronę publiczną z poziomem, miejscem w rankingu, obecną strefą, licznikami i wpisami w pomiarze. Auro i dziennik przygód nigdy nie są pokazywane, a sprzęt tylko wtedy, gdy to zguba innego gracza, którą trzyma twój bohater. Twoja nazwa prowadzi do tej strony z rankingów oraz z rajdów i zbiórek innych graczy, i to tam inni zaczynają cię obserwować. W Ustawieniach są przyciski „Udostępnij” i „Kopiuj link”, a udostępniony link pokazuje kartę z obrazkiem bohatera, imieniem, poziomem i miejscem. Aby ją ukryć, wybierz w Ustawieniach „Ukryj moją stronę bohatera”. Znika od razu, a dopóki jest ukryta, nikt nie może cię obserwować.</p>
      <h2 id="following">Obserwowani</h2>
      <p>Po zalogowaniu możesz obserwować innego gracza z jego publicznej strony bohatera, do 20 graczy. Wszyscy obserwowani są w Rankingach, z poziomem bohatera, miejscem i lokalizacją oraz linkami do ich stron. Obserwowanie nic nie zmienia w grze i nikt nie dostaje o tym powiadomienia. Rajdy na obóz wybierają cele losowo spośród wszystkich, więc obserwowanie kogoś nigdy nie wysyła twojego bohatera do niego. Jeśli gracz ukryje stronę, widzisz tylko jego nazwę, dopóki znów jej nie pokaże. Jeśli zmieni nazwę publiczną, znika z twojej listy.</p>
      <h2 id="names">Nazwy</h2>
      <p>Masz dwie nazwy. Imię bohatera widać na TRMNL, w rankingach i na stronie bohatera; aby je zmienić, każ pisarzowi fortu poprawić listę zbiórki w zakładce Więcej, za 200 Auro. Pisarz przyjmuje jedną poprawkę dziennie. Nazwa publiczna to ty, w każdej grze TRMNL: widać ją obok bohatera w rankingach, w rajdach i zbiórkach innych graczy i w linku do twojej strony. Możesz ją zmienić za darmo raz na 7 dni w zakładce Konto. Linki do starej strony przestają działać, a nikt inny nie może zająć twojej starej nazwy przez 7 dni.</p>
      <h2 id="looks">Wygląd</h2>
      <p>Wygląd bohatera tworzysz przy jego tworzeniu: pochodzenie, budowa, głowa, włosy, plecy, dodatek i tabard. Jedenaście ludów Volty może złożyć przysięgę Giermka, od drobnych Aquanidów, Lunaris i Dragu po olbrzymich Crystalkin. Zmienia tylko jego wygląd na TRMNL, na stronie bohatera i w zbiórkach innych graczy. Każdy wygląd gra tak samo. Imię też należy do ciebie: kreator może podpowiedzieć imię w mowie wybranego pochodzenia. Aby zmienić wygląd później, odwiedź lustro w obozie ze strony bohatera lub zakładki Więcej. Za darmo, w dowolnej chwili.</p>
      <h2 id="alerts">Alerty</h2>
      <p>TRMNL to główny sposób na śledzenie bohatera, ale Ustawienia mogą też wysłać powiadomienie na telefon w dwóch przypadkach; każdy jest wyłączony, dopóki go nie włączysz:</p>
      <ul>
        <li><strong>Pełny plecak:</strong> plecak jest pełny, a bohater trzyma dla ciebie znalezisko. Przychodzi pół godziny po zapełnieniu plecaka, więc nie dostaniesz go, jeśli już go porządkujesz, i tylko raz za każdym zapełnieniem.</li>
        <li><strong>Okazja u bankiera:</strong> faktor Serpentos sprzedaje następny plecak lub skrzynkę{F.merchantOff > 0 ? ` o ${F.merchantOff}% taniej` : ''}, a bohater ma na to Auro. Najwyżej raz dziennie. Faktor z samymi eliksirami nigdy go nie wysyła.</li>
      </ul>
      <p>Dostajesz najwyżej dwa alerty dziennie. Godziny ciszy trwają od 21:00 do 08:00, chyba że je zmienisz: alert o pełnym plecaku czeka, aż się skończą, a okazja, która trafi się w tym czasie, zostaje pominięta. Przed wysłaniem gra sprawdza, czy alert jest wciąż aktualny, więc nigdy nie usłyszysz o plecaku, który już uporządkowałeś, ani o ofercie, której już nie ma. Decyzje, rajdy, nokauty, awanse i pieczęcie nigdy nie wysyłają alertów.</p>
      <p>Wybierz w Ustawieniach „Zezwól na tym urządzeniu”, a potem zaakceptuj pytanie przeglądarki. Na iPhonie i iPadzie najpierw dodaj aplikację do ekranu początkowego (Udostępnij, a potem Do ekranu początk.) i otwieraj stamtąd. Każde urządzenie, na które zezwolisz, jest w Ustawieniach z przyciskiem „Usuń”; usunięcie ostatniego wyłącza alerty.</p>
      <h2 id="troubleshooting">Rozwiązywanie problemów</h2>
      <h3 id="not-on-your-screen">Bohatera nie ma na ekranie</h3>
      <ul>
        <li>Kliknięcie „Zapisz” dodaje Wardenwatch do playlisty TRMNL. Urządzenie pokazuje playlistę po jednym pluginie, w swoim rytmie odświeżania, więc Wardenwatch pojawia się, gdy przyjdzie jego kolej. Przy kilku pluginach i wolnym odświeżaniu może to trochę potrwać.</li>
        <li>Otwórz w TRMNL playlistę i sprawdź, czy Wardenwatch na niej jest, na urządzeniu, na które patrzysz, jeśli masz kilka, i czy żaden harmonogram nie ukrywa go o tej porze dnia.</li>
        <li>Tryb uśpienia zatrzymuje odświeżanie ekranu w nocy. Bohater dalej przeżywa przygody, a ekran nadrabia, gdy urządzenie się obudzi.</li>
        <li>Ekran z napisem „Pierwsza przygoda zacznie się w ciągu 15 minut” działa. Pierwsza historia pojawi się z najbliższym kwadransem.</li>
        <li>Strona Bohater w aplikacji zawsze pokazuje, co robi bohater, cokolwiek pokazuje ekran.</li>
      </ul>
      <h3 id="if-the-screen-looks-old">Ekran wygląda na stary</h3>
      <ul>
        <li>„Aktualizacje się opóźniają” oznacza, że usługa gry ma opóźnienie. Postępy bohatera są zachowane, a ekran nadrobi, gdy usługa nadrobi.</li>
        <li>Jeśli strona aplikacji jest aktualna, a ekran nie, sprawdź w TRMNL ustawienie odświeżania pluginu i jego miejsce na playliście.</li>
        <li>Przygody dzieją się co kwadrans, o pełnej godzinie oraz o :15, :30 i :45 w strefie czasowej TRMNL. Ekran nie pokazuje odliczania; godzina przy każdej historii to czas, kiedy się wydarzyła, a aplikacja pokazuje następną przygodę.</li>
        <li>Jeśli odłączyłeś lub odinstalowałeś plugin, zainstaluj go ponownie z TRMNL. Bohater zachowuje wszystkie postępy.</li>
      </ul>
      <h2 id="disconnecting-and-removing">Odłączanie i usuwanie</h2>
      <p>
        Odłączenie zatrzymuje nowe ekrany dla tej instalacji. TRMNL może dalej pokazywać ostatni obraz, dopóki nie usuniesz pluginu z playlisty; nie
        możemy skasować obrazu, który już jest na twoim urządzeniu.
      </p>
      <h2 id="help">Pomoc</h2>
      <p>
        W sprawie konta lub połączenia napisz na <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>. Staramy się odpowiadać w ciągu dwóch dni roboczych.
      </p>
    </>
  ),
}
