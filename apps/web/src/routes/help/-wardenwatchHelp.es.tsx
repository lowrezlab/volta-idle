import { contentTranslator } from '@trmnl-games/wardenwatch/i18n/lazy'
import { WARDENWATCH_INSTALL_URL, SUPPORT_EMAIL } from '../../lib/prose'
import { affixName, HELP_FACTS as F, nextTableDate, occasionName, signed, type Cost, type Modifiers, type Occasion } from './-wardenwatchFacts'
import type { HelpPage } from './-wardenwatchHelp'
import { WARDENWATCH_HELP_HEAD } from './-helpHeads'

const t = contentTranslator('es')
const n = (value: number) => t.number(value)
const auro = (value: number) => `${n(value)} Auro`
const y = (parts: readonly string[], last = 'y') => (parts.length <= 1 ? parts.join('') : `${parts.slice(0, -1).join(', ')} ${last} ${parts.at(-1)}`)
const name = (english: string) => t.name(english)
const zone = (english: string) => t.nameWith(english, 'el')
const rungs = (list: readonly { name: string; size: number; price: number }[]) => y(list.map((rung) => `${t.nameWith(rung.name, 'un')} (${rung.size}) por ${auro(rung.price)}`))
const price = (c: Cost) => `${y(c.materials.map((m) => `${m.n} de ${name(m.name).toLowerCase()}`))} más ${auro(c.gold)}`
const boonLine = (m: Modifiers) => [m.attackPct ? `${signed(m.attackPct)} % de ataque` : '', m.defensePct ? `${signed(m.defensePct)} % de defensa` : '', m.xpPct ? `${signed(m.xpPct)} % de XP por victoria` : '', m.goldPct ? `${signed(m.goldPct)} % de Auro` : '', m.trapDamagePct ? `las trampas hacen un ${m.trapDamagePct} % menos de daño` : ''].filter(Boolean).join(', ')
const ZONES_LINE = y(F.zones.filter((b) => b.level > 1).map((b) => `${zone(b.name)} en el nivel ${b.level}`))
const arrives = (feature: 'todo' | 'stances' | 'choices' | 'merchant' | 'raids') => (F.unlocks === undefined ? '' : ` Llega en el nivel ${F.unlocks[feature]}.`)
const SAFE = name(F.zones[0]?.name ?? 'Castellum Frigo')
const ILL_OMEN = t.text(occasionName('friday_13th', 'Día de mal agüero'))
const GIFT_DAY = t.text(occasionName('christmas', 'Fiesta de pleno invierno'))
const rarityEs: Record<string, string> = { common: 'común', uncommon: 'poco común', rare: 'raro', epic: 'épico' }

const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
const WEEKDAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
const NTH = ['primer', 'segundo', 'tercer', 'cuarto', 'quinto']
function occasionDate(rule: Occasion): string {
  const date = rule.date
  const span = rule.days > 1 ? `, durante ${rule.days} días` : ''
  switch (date.kind) {
    case 'fixed':
      return `el ${date.day} de ${MONTHS[date.month - 1]}${span}`
    case 'nth_weekday': {
      const base = `el ${NTH[date.nth - 1]} ${WEEKDAYS[date.weekday]} de ${MONTHS[date.month - 1]}`
      const offset = date.offsetDays ?? 0
      return `${offset === 0 ? base : `el ${WEEKDAYS[(date.weekday + offset) % 7]} siguiente al ${base.slice(3)}`}${span}`
    }
    case 'friday_13th':
      return 'cada viernes 13'
    case 'easter':
      return date.offsetDays === -2 ? 'del Viernes Santo al Lunes de Pascua' : `${Math.abs(date.offsetDays)} días ${date.offsetDays < 0 ? 'antes' : 'después'} del Domingo de Pascua${span}`
    case 'table': {
      const next = nextTableDate(date.dates)
      return next === null ? 'una fecha que cambia cada año' : `una fecha que cambia cada año (la próxima: ${next.getUTCDate()} de ${MONTHS[next.getUTCMonth()]} de ${next.getUTCFullYear()})`
    }
  }
}

export const es: HelpPage = {
  seoTitle: WARDENWATCH_HELP_HEAD.es.seoTitle,
  description: WARDENWATCH_HELP_HEAD.es.description,
  title: 'Wardenwatch en TRMNL',
  contents: {
    'getting-started': 'Primeros pasos', 'if-the-qr-sends-you-back-to-setup': 'Si el QR te devuelve a la instalación', 'how-time-works': 'Cómo pasa el tiempo', zones: 'Zonas', seals: 'Sellos', commissions: 'Comisiones', 'heroes-and-classes': 'Héroes y clases', stances: 'Posturas', 'camp-raids': 'Incursiones al campamento', musters: 'Revistas', strays: 'Objetos extraviados', 'garrison-orders': 'Órdenes de la guarnición', draughts: 'Elixires', 'the-serpentos-moneychanger': 'El cambista Serpentos', decisions: 'Decisiones', effects: 'Efectos', 'sky-calendar': 'El cielo y el calendario', 'rare-and-epic-gear': 'Equipo raro y épico', 'when-your-pack-fills-up': 'Cuando la mochila se llena', 'bigger-packs': 'Mochilas más grandes', 'salvage-and-the-forge': 'Desmontar y la Forja', 'getting-knocked-out': 'Caer K.O.', recaps: 'Resúmenes', 'understanding-rankings': 'Cómo funcionan las clasificaciones', 'sharing-your-hero': 'Compartir tu héroe', 'following': 'Seguir', names: 'Nombres', looks: 'Aspecto', alerts: 'Alertas', troubleshooting: 'Solución de problemas', 'disconnecting-and-removing': 'Desconectar y quitar', help: 'Ayuda',
  },
  Body: () => (
    <>
      <h2 id="getting-started">Primeros pasos</h2>
      <ul>
        <li>Abre <a href={WARDENWATCH_INSTALL_URL}>Wardenwatch en la tienda de TRMNL</a> y elige Instalar.</li>
        <li>Inicia sesión en Wardenwatch, elige un nombre público, ponle nombre y aspecto a tu Escudero, y conecta la instalación.</li>
        <li>De vuelta en TRMNL, pulsa Guardar. La primera aventura de tu héroe empieza en menos de 15 minutos.</li>
        <li>Añade el plugin a una lista de reproducción, o a un mashup si quieres a tu héroe junto a otros plugins. Se admiten los cuatro tamaños de diseño.</li>
      </ul>
      <h2 id="if-the-qr-sends-you-back-to-setup">Si el QR te devuelve a la instalación</h2>
      <p>El QR abre la app de la cuenta con la que has iniciado sesión. No empieza una instalación nueva. Comprueba el correo de la sesión que aparece en la página de instalación y usa Cambiar de cuenta si conectaste en su día con otra cuenta.</p>
      <p>Si la instalación dice «Reconectar Wardenwatch», tu conexión con TRMNL existe pero falta el héroe. Puede pasar tras un reinicio del juego. Instala una copia nueva de <a href={WARDENWATCH_INSTALL_URL}>Wardenwatch desde TRMNL</a>, inicia sesión con la misma cuenta, elige un nombre de héroe nuevo, conecta y pulsa Guardar en TRMNL. Cuando la copia nueva funcione, quita la antigua de tu lista de reproducción.</p>
      <p>Si la instalación dice «Guarda en TRMNL para empezar», tu héroe ya está preparado. Vuelve a esa instalación en TRMNL y pulsa Guardar.</p>
      <h2 id="how-time-works">Cómo pasa el tiempo</h2>
      <p>
        El mundo del juego avanza cada 15 minutos, esté o no encendida tu pantalla. Tu TRMNL muestra una instantánea y se actualiza a su propio ritmo.
        El modo reposo, una actualización más lenta y los demás elementos de la lista nunca reducen el progreso de tu héroe. Las horas de aventura en la app usan la zona horaria de tu navegador.
      </p>
      <p>
        La barra de título de tu TRMNL lleva la fecha de Volta, como «Rime Ascendant 4 · Giro del Wyrm 1203». Un día de Volta es un paso de Myrkos el Vigía por el cielo y dura un día real. Nueve días forman un eje (Ascendant, Skybottom, Descendant, Midheaven), cuatro ejes un Ciclo cardinal (Rime, Echo, Gloam, Grave, Melt, Verd, Tan, Shade, Molt, Tanhaus) y diez ciclos un año de 360 días, cada año regido por turno por uno de los doce Guardianes. La cuenta empezó el 1 de Rime Ascendant de 1203, el año en que se fundó Castellum Frigo. La fecha es solo cómputo: la simulación va en tiempo real.
      </p>
      <h2 id="zones">Zonas</h2>
      <p>El mapa de Ur-Turul tiene {F.zones.length} zonas, y tu héroe empieza en {SAFE}, el fuerte a medio construir de la Expedición en la orilla este de las Tierras primordiales. Cada una se abre en un nivel, la visites o no: {ZONES_LINE}. Tu TRMNL marca el terreno nuevo en el mapa cuando pasa; viajar allí es cosa tuya, desde el mapa de la página Héroe. Las zonas más lejanas del fuerte tienen criaturas más duras, más Auro, elixires más fuertes y órdenes de la guarnición mejor pagadas. {SAFE} no puede dejar K.O. a un héroe; todas las demás zonas sí.</p>
      <ul>
        {F.zones.map((z) => <li key={z.id}><strong>{name(z.name)}</strong>{z.level > 1 ? ` (nivel ${z.level})` : ' (desde el principio)'}: {z.monsters.map(name).join(', ')}.</li>)}
      </ul>
      {F.lore ? <p>La página Notas de campo, en Más, guarda lo que el registro de Ur-Turul ha apuntado sobre cada zona y cada criatura. La nota de una zona se abre la primera vez que tu héroe la pisa, la de una criatura con la primera victoria contra ella. Las notas no afectan al juego.</p> : null}
      <h2 id="seals">Sellos</h2>
      <p>Mantén Wardenwatch en tu lista de reproducción y busca el código de sello, seis cifras como 482 917, en la barra de título de la pantalla (los mashups estrechos en vertical acortan su etiqueta). Introduce ese código en los Ajustes de la app para estampar un sello de cera permanente en tu colección. Lo muestran tanto la pantalla completa como los mashups; la vista previa de la app lo oculta. Mientras espera un sello, el QR de la pantalla también lo consigue: escanéalo con el móvil y la app lo añade a tu estante, incluso con la barra de título desactivada. Donde hay sitio, el código aparece al lado.</p>
      <p>Puedes conseguir un sello por semana, con un código nuevo cada lunes a las 00:00 UTC. El código de la semana anterior también vale si tu pantalla se actualiza despacio. Si te saltas una semana, recibes el mismo sello la siguiente. Con la colección completa, puedes conseguir más de cada uno. Los sellos no cambian la XP, el equipo ni las clasificaciones, y más dispositivos o una actualización más rápida no dan extras.</p>
      {F.career !== undefined ? (
        <>
          <h2 id="commissions">Comisiones</h2>
          <p>Tu héroe siempre tiene un objetivo del comandante del fuerte, que aparece arriba en la página Héroe: «Gana tu primer combate», «Equipa una pieza de equipo que hayas encontrado», «Llega a los Fiordos de Moonbight», «Compra la Mochila de peregrino». Algunos se cumplen yendo de aventura; el resto los haces aquí, en la página Mochila o Héroe. Cumplir un objetivo se anuncia en tu TRMNL y aparta un poco de Auro ({n(F.career.gold)} en toda la escalera); pulsa Cobrar en la página Héroe para recogerlo. Los objetivos no dan XP ni caducan, y el siguiente empieza tanto si has cobrado como si no.</p>
          <ul>
            <li>La página Comisiones, en Más, lista los {F.career.goals} objetivos en orden, con la fecha en que cumpliste cada uno. Un objetivo que ya habías hecho cuando llegó la escalera cuenta como cumplido. Los rangos del camino son Escudero, Jurado, Banderizo y Jurado de los Guardianes.</li>
            {F.unlocks !== undefined ? <li>Las funciones llegan por nivel, entres o no: las órdenes de la guarnición en el nivel {F.unlocks.todo}, las posturas en el nivel {F.unlocks.stances}, las decisiones del camino en el nivel {F.unlocks.choices}, {F.meetings?.level !== undefined ? `las revistas con camaradas en el nivel ${F.meetings.level}, ` : ''}{F.workbench?.level !== undefined ? `desmontar y la Forja en el nivel ${F.workbench.level}, ` : ''}el cambista Serpentos en el nivel {F.unlocks.merchant} y las incursiones al campamento en el nivel {F.unlocks.raids}. Tu TRMNL anuncia cada una. Las zonas también se abren por nivel: {ZONES_LINE}.</li> : null}
            <li>Cuando se abren las posturas, tu héroe no tiene ninguna elegida y juega Firme. Un objetivo te pide elegir una; cualquiera de las tres cuenta, y puedes cambiarla después.</li>
            <li>Algunos objetivos tempranos están garantizados a tiempo: el primer combate en un puñado de aventuras, una pieza de equipo en la primera docena, y una primera decisión, cambista y élite en más o menos un día desde su nivel. Todo lo demás depende del azar.</li>
          </ul>
        </>
      ) : null}
      {F.classes !== undefined ? (
        <>
          <h2 id="heroes-and-classes">Héroes y clases</h2>
          <p>Todo el mundo empieza como Caballero. Cuando tu Caballero llega al nivel {F.rosterLevel}, tu TRMNL anuncia un segundo héroe, y puedes reclutar un Asesino desde la página Héroes, en Más. El Asesino empieza en el nivel 1 con su propio nombre, aspecto, equipo, Auro, elixires y objetivos.</p>
          <ul>
            <li>Sale de aventura un héroe cada vez, y es el que muestra tu TRMNL y el que aparece en las clasificaciones. El otro se queda donde lo dejaste. No va de aventura ni recupera después, y un cambista que lo visite se marcha.</li>
            <li>Puedes cambiar una vez al día. Volver atrás en diez minutos no cuenta. Un héroe K.O. o de viaje tiene que recuperarse o llegar primero.</li>
            <li>Puedes tener un héroe de cada clase. Las entradas del registro son tuyas, las consiga el héroe que sea; unas pocas son solo del Asesino.</li>
            <li><strong>Caballero</strong>: {t.text(F.classes.warriorBlurb)}</li>
            <li><strong>Asesino</strong>: {t.text(F.classes.rogueBlurb)} {F.classes.rogue.hpPct} % de salud, ataque {signed(F.classes.rogue.attackPct)} %, defensa {signed(F.classes.rogue.defensePct)} %, {signed(F.classes.rogue.goldPct)} % de Auro en cada combate y hallazgo, y {F.classes.rogue.raidEdgePct} puntos a su favor en cada incursión al campamento. Sube de nivel al ritmo del Caballero, pero cae K.O. un poco más a menudo.</li>
          </ul>
        </>
      ) : null}
      <h2 id="stances">Posturas</h2>
      <p>Elige hasta dónde se adentra tu héroe antes de descansar, en la página Héroe.{arrives('stances')} La postura se aplica desde la próxima aventura, y puedes cambiarla cuando quieras. Tu TRMNL la muestra junto al contador de la mochila, bajo un indicador cuya aguja está baja con En guardia, en medio con Firme y alta con Temerario.</p>
      <ul>
        <li><strong>En guardia</strong> bebe un elixir por debajo del 65 % de PS, descansa por debajo del 50 % y vuelve a salir al 90 %. Gana el 90 % de la XP habitual por victoria.</li>
        <li><strong>Firme</strong>, la norma de la guarnición y la opción por defecto, bebe por debajo del 50 %, descansa por debajo del 35 % y vuelve a salir al 75 %, con la XP habitual.</li>
        <li><strong>Temerario</strong> bebe por debajo del 35 %, descansa por debajo del 20 % y vuelve a salir al 60 %. Gana el 115 % de XP por victoria, pero cae K.O. más a menudo.</li>
      </ul>
      <p>{SAFE} no puede dejar K.O. a un héroe, así que Temerario no corre ese riesgo dentro de las murallas. En cualquier otra zona un K.O. cuesta Auro y devuelve a tu héroe a {SAFE}, y Temerario es la postura que más cae.</p>
      <h2 id="camp-raids">Incursiones al campamento</h2>
      <p>Durante la patrulla, los Escuderos a veces rebuscan en el equipo de los demás. Todo héroe activo{F.unlocks === undefined ? '' : ` desde el nivel ${F.unlocks.raids}`} asalta y es asaltado de forma automática. No puedes iniciar una incursión ni elegir el objetivo.{F.unlocks === undefined ? '' : ` Por debajo del nivel ${F.unlocks.raids} un héroe ni asalta ni es asaltado.`} La incursión aparece en el diario de aventuras de los dos héroes con el nombre público del otro jugador, y la página Héroe guarda un registro de las incursiones de tu héroe.</p>
      <ul>
        <li>Quién gana es lanzar una moneda, que solo mueve la postura. El nivel, el equipo y los efectos nunca cuentan. En guardia suma 10 puntos a su lado, Firme no suma nada y Temerario resta 5, tanto al asaltar como al defender.</li>
        <li>La frecuencia de las incursiones también depende de la postura: En guardia más o menos cada dos días de patrulla, Firme una vez al día y Temerario dos veces al día.</li>
        <li>Quien pierde entrega el 5 % de su Auro a quien gana, así que el Auro solo cambia de manos. Los dos pierden salud: quien pierde el 30 % de sus PS máximos, quien gana el 10 %. El equipo {name(affixName('thrifty'))} descuenta sus puntos de la pérdida de Auro.</li>
        <li>Una incursión puede dejar K.O. a un héroe, igual que un combate; en {SAFE} tu héroe es rescatado. Las incursiones solo encuentran héroes que exploran o descansan, y a un héroe asaltado se le deja en paz unas seis horas.</li>
        <li>Si prefieres perder menos incursiones, elige En guardia, que asalta menos y gana más.</li>
      </ul>
      {F.meetings !== undefined ? (
        <>
          <h2 id="musters">Revistas</h2>
          <p>De vez en cuando, en lugar de un combate, tu héroe se cruza con el héroe de otro jugador en la misma zona{F.meetings.level === undefined ? '' : `, desde el nivel ${F.meetings.level}`}. Hacen cola para la sopa, se cuentan batallitas o comparten las raciones, y los dos héroes reciben la misma pequeña ventaja durante {F.meetings.boonAdventures} aventuras. Los dos diarios cuentan la historia con el nombre público del otro jugador, y la pestaña Diario lista las cinco últimas revistas de tu héroe.</p>
          <ul>
            {F.meetings.kinds.map((kind) => <li key={kind.id}><strong>{t.text(kind.name)}</strong>: {t.text(kind.effect)}, {boonLine(kind.modifiers)}.</li>)}
            <li>Nada cambia de manos. Una revista ocupa el lugar de una aventura, y la ventaja lo compensa más o menos.</li>
            <li>Pasa con la misma frecuencia sea cual sea tu postura o clase, más o menos cada dos días para un héroe que está de patrulla. Los héroes solo se encuentran mientras exploran o descansan, y a un héroe que acaba de tener una revista se le deja en paz unas doce horas.</li>
          </ul>
        </>
      ) : null}
      {F.lostProperty ? (
        <>
          <h2 id="strays">Objetos extraviados</h2>
          <p>Cuando tu héroe cae K.O. fuera de las murallas, suelta en el camino de esa zona un repuesto de su arma o armadura con tu nombre público grabado. Tu héroe conserva todo lo que llevaba puesto. Más adelante, el héroe de otro jugador que patrulle esa zona puede encontrar el objeto extraviado en lugar de un hallazgo normal, y tu TRMNL te dice quién lo encontró.</p>
          <ul>
            <li>Tu héroe puede encontrar objetos extraviados de otros jugadores de la misma forma. Son equipo normal: equípalo, véndelo, desmóntalo o llévalo a la Forja. Llega con las estadísticas básicas de su tipo y rareza, sin las mejoras del primer dueño.</li>
            <li>El nombre se queda. La página Mochila y la tarjeta Objetos extraviados de la pestaña Diario muestran de quién era, y también tu página de héroe mientras lo tengas.</li>
            <li>Un objeto extraviado solo sustituye un hallazgo que tu héroe iba a hacer de todos modos, así que nadie recibe equipo extra. Las recompensas de comisión y los regalos de la {GIFT_DAY} son siempre equipo nuevo.</li>
            <li>Solo hay un objeto extraviado tuyo por ahí cada vez. Si tu héroe vuelve a caer K.O. antes de que alguien lo encuentre, el nuevo sustituye al anterior.</li>
          </ul>
        </>
      ) : null}
      {F.todo !== undefined ? (
        <>
          <h2 id="garrison-orders">Órdenes de la guarnición</h2>
          <p>El tablón del fuerte publica tres órdenes pequeñas para tu héroe, como «Vence a 4 Ratas de escarcha de bodega», «Encuentra 2 piezas de equipo» o «Patrulla los Fiordos de Moonbight durante 16 aventuras».{arrives('todo')} Las va cumpliendo mientras patrulla, y la página Héroe muestra el progreso de cada una. Cuando una orden está cumplida, tu pantalla lo dice y tu héroe recibe un poco de Auro: {y(F.todo.pay.map(String), 'o')} según la zona. Las órdenes no dan XP, así que no afectan a las clasificaciones.</p>
          <ul>
            <li>Cada mañana a las {F.todo.muster}, hora local de tu TRMNL, la revista de la mañana publica órdenes nuevas a cambio de las cumplidas. Tu pantalla las lista.</li>
            <li>Las órdenes nunca caducan. Una orden atascada se cambia sola tras dos revistas.</li>
            <li>Al menos dos de las tres órdenes se pueden cumplir donde está tu héroe. Como mucho una pide viajar a otra zona, si quieres mandar allí a tu héroe.</li>
            <li>Una vez entre revistas puedes cambiar una orden sin cumplir por otra distinta en la página Héroe.</li>
          </ul>
        </>
      ) : null}
      <h2 id="draughts">Elixires</h2>
      {F.potions === undefined
        ? <p>Un elixir de cobre devuelve el 40 % de los PS máximos de tu héroe, redondeado hacia arriba. Tu héroe bebe uno automáticamente cuando sus PS bajan del umbral de elixir de su postura mientras patrulla, y el diario lo anota. Sin elixires, tu héroe descansa por debajo del umbral de descanso y vuelve a salir cuando se recupera. También puedes beber uno tú desde la página Héroe cuando tu héroe explora o descansa sin tener la salud al máximo. Los elixires se encuentran de patrulla y nunca ocupan sitio en la mochila.</p>
        : <>
          <p>Los elixires de cobre vienen en {F.potions.strengths.length} potencias: {y(F.potions.strengths.map((s) => `${name(s.name).toLowerCase()} (${s.healPct} %)`))}, y cada uno devuelve esa parte de los PS máximos de tu héroe, redondeada hacia arriba. Lo que encuentras depende de dónde está tu héroe: {F.potions.drops.map((d) => `${zone(d.zone)} da ${d.rest.length === 0 ? 'solo' : 'sobre todo'} ${name(`${d.top.toLowerCase()}s`)}${d.rest.length === 0 ? '' : `, con algunos ${d.rest.map((r) => name(`${r.toLowerCase()}s`)).join(' y ')}`}`).join('; ')}. Un héroe nuevo empieza con elixires, y el cambista y las decisiones del camino también reparten elixires. Todas las potencias comparten un estuche y nunca ocupan sitio en la mochila.</p>
          <p>Tu héroe bebe automáticamente cuando sus PS bajan del umbral de elixir de su postura mientras patrulla: el elixir más débil que lo devuelve por encima de ese umbral, o el más fuerte que tenga si ninguno más débil basta. El diario dice qué bebió. Sin elixires, tu héroe descansa por debajo del umbral de descanso y vuelve a salir cuando se recupera. También puedes beber uno tú desde la página Héroe cuando tu héroe explora, descansa o viaja sin tener la salud al máximo; con más de una potencia en el estuche, la página Héroe te pregunta cuál.</p>
          <p><strong>Combinar.</strong> En la página Mochila, {F.potions.combine.count} {name(`${F.potions.combine.from.toLowerCase()}s`)} y {F.potions.combine.materials.map((m) => `${m.n} de ${name(m.name).toLowerCase()}`).join(', ')} se convierten en un {name(F.potions.combine.to.toLowerCase())}. Combinar nunca te deja con más elixires que antes, así que el estuche no puede desbordarse. Solo pasa cuando tú lo eliges.</p>
        </>}
      <p>Los elixires van en un estuche. Un héroe nuevo lleva {t.nameWith(F.firstPouch.name, 'un')} donde caben {F.firstPouch.size}. Los estuches más grandes se compran con Auro en la página Mochila, de uno en uno: {rungs(F.shopPouches)}. Cuando el estuche está lleno, un elixir encontrado se convierte en Auro.</p>
      <h2 id="the-serpentos-moneychanger">El cambista Serpentos</h2>
      <p>De vez en cuando un factor Serpentos, uno de los cambistas Dragu que viajan con los barcos de suministro, se detiene junto a tu héroe de patrulla. Tu pantalla lo dice, y la página Mochila muestra hasta tres ofertas: unos elixires y el siguiente estuche o mochila{F.merchantOff > 0 ? ` con un ${F.merchantOff} % de descuento sobre el precio de la página Mochila` : ''}. Cada oferta se vende una vez. El factor se va tras cuatro aventuras o después de tu última compra.</p>
      <h2 id="decisions">Decisiones</h2>
      <p>A veces el camino le pregunta algo pequeño a tu héroe, como poner algo para el guiso del cocinero o hacer una guardia nocturna en la empalizada. Tu pantalla dice que hay una decisión esperando, y la página Héroe muestra las dos opciones con lo que cambia exactamente cada una. Si no respondes en más o menos un día, se elige por ti la opción marcada por defecto.</p>
      <h2 id="effects">Efectos</h2>
      <p>Algunos momentos le dejan a tu héroe un efecto corto, listado en la página Héroe con las aventuras que le quedan. Vencer a un élite le da {t.text('Fired up')} (+10 % de ataque durante ocho aventuras). Poner algo para el guiso le da {t.text('Well fed')} (+10 % de XP durante ocho aventuras). Una trampa le deja {t.text('Bruised')} (−15 % de defensa durante cuatro aventuras). Tu héroe tiene como mucho tres efectos. Cualquier descanso quita los malos, y un K.O. los borra todos.</p>
      {F.standoff !== undefined ? (
        <>
          <h2 id="dug-in-elites">Élites atrincherados</h2>
          <p>Desde el nivel {F.standoff.minLevel}, en {zone(F.standoff.zone)} y las zonas de más allá, un élite a veces se atrinchera en lugar de caer en un combate. Tu TRMNL lo muestra con su barra de salud, y tu héroe vuelve a por él en cada aventura hasta que cae.</p>
          <ul>
            <li>En cada aventura tu héroe lo combate hasta seis asaltos, y su salud se mantiene. Pega mucho más fuerte que un élite normal, y tu héroe sigue luchando por debajo de la línea de descanso de su postura antes de retirarse, así que puede acabar en K.O. Retirarse no cuesta Auro.</li>
            <li>Cuando cae, da {F.standoff.xp} veces la XP de la criatura y {F.standoff.gold} veces su Auro, más un hallazgo raro o épico de esa zona.</li>
            <li>Se va tras {F.standoff.hours} horas, o antes si tu héroe cae K.O. o viaja. La pausa no para el reloj.</li>
            <li>La página Héroe muestra su salud y cuándo se va. Desde ahí puedes dejarlo, y al viajar se te pregunta antes de dejarlo atrás.</li>
          </ul>
        </>
      ) : null}
      <h2 id="sky-calendar">El cielo y el calendario</h2>
      <p>Doce lunas encadenadas cuelgan sobre Volta, una por cada Guardián astral, y la franja de arriba de la escena de tu héroe las muestra en el orden del Giro: Doncella encadenada, Leviatán, Wyrm, Magnus, Horror en flor, Sabueso del velo, Traidor, Conjuntos, Bestia eldritch, Titán, Eclipse y Vigía. La cara iluminada de cada luna sigue su propio periodo, desde el único día del Vigía hasta el año de la Doncella, y la luna más llena del día lleva un halo. La luna de la Doncella es una cáscara muerta y siempre se dibuja agrietada. El cielo, como la fecha de la barra de título, se calcula solo con el reloj y no cambia nada en el juego.</p>
      {F.occasions !== undefined ? (
        <>
          <p>Ciertos días del año son sucesos del cielo que decoran la escena de tu héroe: adornos arriba, algo en el suelo, a veces un sombrero, y en {SAFE} otra vista más allá de la empalizada. Siguen la fecha local de tu TRMNL. La primera vez que tu héroe ve uno, el diario lo nombra, y la mayoría trae una pequeña bonificación mientras dura. La página Héroe muestra el suceso de hoy y el siguiente.</p>
          <ul>
            {F.occasions.map((rule) => <li key={rule.id}><strong>{t.text(rule.name)}</strong>, {occasionDate(rule)}: {rule.id === 'friday_13th' ? 'todas las incursiones al campamento salen mal (ver abajo).' : rule.effectLabel ? `${t.text(rule.effectLabel)}.` : 'solo decoración.'}</li>)}
          </ul>
          <p><strong>{ILL_OMEN}.</strong> Las incursiones al campamento empiezan el doble de a menudo, y todas salen mal: nadie gana, y los dos héroes pierden el 20 % de sus PS máximos y el 5 % de su Auro, que no se queda nadie. El registro de incursiones de tu héroe lo cuenta como percance.</p>
          <p><strong>{GIFT_DAY}.</strong> Tu héroe encuentra un regalo envuelto: una pieza de equipo de la zona en la que está, en su primera aventura de esos tres días.</p>
        </>
      ) : null}
      <h2 id="rare-and-epic-gear">Equipo raro y épico</h2>
      <p>El equipo puede ser común, poco común, raro o épico. El épico es el más raro, más o menos un hallazgo de cada cien, y el más fuerte. El equipo raro y épico lleva además un rasgo de Forja estelar, que aparece en el nombre del objeto y se explica en la página Mochila. Cada uno sigue la metalurgia obsidiánida: un metal trabajado en la pieza le presta una propiedad.</p>
      <ul>
        <li><strong>{name(affixName('vampiric'))}</strong> cura el 5 % de los PS máximos tras cada victoria, porque el cobre sana.</li>
        <li><strong>{name(affixName('lucky'))}</strong> suma un 20 % de Auro en victorias y hallazgos.</li>
        <li><strong>{name(affixName('sturdy'))}</strong> recibe un 40 % menos de daño de las trampas.</li>
        <li><strong>{name(affixName('thrifty'))}</strong> pierde 5 puntos menos de Auro cuando algo sale mal: una retirada no pierde Auro en lugar del 5 %, y un K.O. pierde el 5 % en lugar del 10 %.</li>
      </ul>
      <h2 id="when-your-pack-fills-up">Cuando la mochila se llena</h2>
      <p>Un héroe nuevo empieza con un zurrón donde caben 6 piezas de equipo. El equipo puesto y los elixires no ocupan sitio. Cuando la mochila está llena, tu héroe te guarda la siguiente pieza que encuentra y sigue de aventura. Mientras esa pieza espera, los hallazgos siguientes se quedan atrás hasta que hagas sitio.</p>
      <h2 id="bigger-packs">Mochilas más grandes</h2>
      <p>Tu mochila crece con Auro. {F.tote ? `A tu héroe le entregan ${t.nameWith(F.tote.name, 'un')} (${F.tote.size}) en las primeras dos horas más o menos. ` : ''}Después, las mochilas más grandes se compran en la página Mochila, de una en una: {rungs(F.shopBags)}, hasta {F.topBag} huecos. No hay requisitos de nivel, y las mochilas nunca salen como botín.</p>
      <ol className="[&_li]:list-decimal">
        <li>Abre Mochila en la app. Equipa las mejoras y vende el equipo que sobra para liberar sitio.</li>
        <li>Si hay un hallazgo guardado, elige Recoger el hallazgo. Deja al menos un hueco libre después de recogerlo para que las aventuras puedan seguir.</li>
        <li>Cuando hay un hueco libre y nada esperando, las aventuras se reanudan solas en menos de 15 minutos. Antes de eso aún puedes elegir otra zona abierta desde la página Mochila.</li>
      </ol>
      <p>Equiparse algo no libera un hueco. Vender o desmontar equipo, o comprar una mochila más grande, sí, y el hallazgo guardado entra en la mochila al momento. La página Mochila también puede vender tu repuesto más flojo y quedarse el hallazgo con un toque. El modo reposo de tu TRMNL tampoco detiene nunca el juego.</p>
      {F.workbench !== undefined ? <>
        <h2 id="salvage-and-the-forge">Desmontar y la Forja</h2>
        <p>{F.workbench.level !== undefined ? `Desde el nivel ${F.workbench.level}, el` : 'El'} equipo que sobra tiene dos salidas de la mochila: venderlo por Auro, o desmontarlo en esquirlas de stellazia en la página Mochila. Desmontar paga según el nivel en que se encontró la pieza, en unidades de la esquirla de su rareza: {F.workbench.materials.map((m) => `${name(m.name).toLowerCase()} del equipo ${m.rarities.map((r) => rarityEs[r] ?? r).join(' y ')}`).join(', ')}. El equipo épico da {F.workbench.epicMultiplier} veces más. Las esquirlas no ocupan sitio en la mochila y nunca se venden. El equipo solo se desmonta cuando tú lo eliges.{F.workbench.level !== undefined ? ` Antes del nivel ${F.workbench.level}, vende lo que te sobre: la primera mejora pide el nivel ${F.workbench.level} de todos modos.` : ''}</p>
        <p>La Forja es la Forja estelar a escala del fuerte: gasta esquirlas y Auro en el equipo que lleva tu héroe, sin quitárselo. La pieza conserva su nombre y su rasgo, y solo cambian sus números. Cada pieza tiene un único paso siguiente. {F.workbench.tiers.map((s, i) => `${i === 0 ? 'Subir una pieza de nivel 1 a Mk II' : 'Pasar de Mk II a Mk III'} cuesta ${price(s)}`).join('; ')}; una pieza solo puede subir a un nivel que tu héroe podría equiparse. Cuando una pieza es Mk III (o se encontró así), el refuerzo suma un punto por paso: {F.workbench.reinforce.map((s) => `+${s.to} por ${price(s)}`).join(', ')}. {F.workbench.reinforce.length > 0 ? `Tras +${F.workbench.reinforce.at(-1)!.to} la pieza está terminada.` : ''} Al equipo raro y épico también se le puede colocar el rasgo que elijas por {price(F.workbench.affix)}, en lugar del que tiene.</p>
        <p>Las mejoras siempre salen bien. Desmontar una pieza mejorada no devuelve lo que gastaste en ella, así que mejora solo el equipo que piensas seguir llevando.</p>
      </> : null}
      <h2 id="getting-knocked-out">Caer K.O.</h2>
      <p>Tu héroe se recupera solo tras unas dos horas y vuelve a {SAFE}. Conservas tu XP y tu equipo, pero pierdes el 10 % del Auro que llevas.</p>
      <h2 id="recaps">Resúmenes</h2>
      <p>Tu pantalla lleva un resumen corto de la última noche o el último día terminados, en la hora local de tu TRMNL. A las 07:00 el resumen de la noche cuenta de 19:00 a 07:00 y se queda todo el día. A las 19:00 el resumen del día cuenta de 07:00 a 19:00 y se queda toda la tarde y la noche. La escena muestra el día y la noche con el mismo horario. Las historias de encima son siempre las más recientes.</p>
      <h2 id="understanding-rankings">Cómo funcionan las clasificaciones</h2>
      <p>La pantalla muestra el Top 5 de XP de esta semana de tu grupo de nivel, con tu fila marcada, o añadida bajo la lista si vas más abajo. La app ofrece además la tabla de hoy y una tabla total. El día empieza a las 00:00 UTC y la semana el lunes a las 00:00 UTC, como los sellos. Las clasificaciones se publican cada hora, así que una aventura o una subida de nivel recientes pueden aparecer antes de que se actualice tu puesto.</p>
      <p>Los héroes en pausa o parados conservan su progreso. Uno sin XP esta semana sale de la tabla semanal hasta que vuelva a ganarla. El progreso total queda registrado.</p>
      <h2 id="sharing-your-hero">Compartir tu héroe</h2>
      <p>Tu héroe tiene una página pública con su nivel, puesto, zona actual, totales y entradas del registro. El Auro y el diario de aventuras nunca se muestran, y el equipo solo cuando es un objeto extraviado de otro jugador que tu héroe guarda. Tu nombre enlaza a la página desde las clasificaciones y desde las incursiones y revistas de otros jugadores, y ahí es donde otros jugadores te siguen. Ajustes tiene los botones Compartir y Copiar enlace, y un enlace compartido muestra una tarjeta con la imagen de tu héroe, su nombre, nivel y puesto. Para ocultarla, elige Ocultar mi página de héroe en Ajustes. Se oculta al momento, y mientras está oculta nadie puede seguirte.</p>
      <h2 id="following">Seguir</h2>
      <p>Con la sesión iniciada, puedes seguir a otro jugador desde su página pública de héroe, hasta 20 jugadores. Todos los que sigues aparecen en Clasificaciones, con el nivel de su héroe, su puesto y dónde está, y enlaces a sus páginas. Seguir no cambia nada en el juego, y a nadie se le avisa de que lo sigues. Las incursiones al campamento eligen sus objetivos al azar entre todos, así que seguir a alguien nunca manda a tu héroe a por él. Si un jugador oculta su página, solo ves su nombre hasta que vuelva a mostrarla. Si cambia su nombre público, sale de tu lista.</p>
      <h2 id="names">Nombres</h2>
      <p>Tienes dos nombres. El nombre de tu héroe aparece en tu TRMNL, las clasificaciones y tu página de héroe; para cambiarlo, pide al escribano del fuerte que enmiende la lista de revista desde la pestaña Más, por 200 Auro. El escribano admite una enmienda al día. Tu nombre público eres tú, en todos los juegos de TRMNL: aparece junto a tu héroe en las clasificaciones, en las incursiones y revistas de otros jugadores, y en el enlace de tu página. Puedes cambiarlo gratis una vez cada 7 días desde Cuenta. Los enlaces a tu página antigua dejan de funcionar, y nadie más puede quedarse tu nombre antiguo durante 7 días.</p>
      <h2 id="looks">Aspecto</h2>
      <p>Creas el aspecto de tu héroe al crearlo: linaje, complexión, cabeza, pelo, espalda, accesorio y tabardo. Once pueblos de Volta pueden prestar el juramento del Escudero, desde los pequeños Aquánidos, Lunaris y Dragu hasta los enormes Crystalkin. Solo cambia su aspecto en tu TRMNL, en tu página de héroe y en las revistas de otros jugadores. Todos los aspectos juegan igual. El nombre también es cosa tuya: el creador puede sugerirte uno en la lengua del linaje que elijas. Para cambiar el aspecto más tarde, visita el espejo del campamento desde tu página de héroe o la pestaña Más. Es gratis, cuando quieras.</p>
      <h2 id="alerts">Alertas</h2>
      <p>Tu TRMNL es la forma principal de seguir a tu héroe, pero Ajustes también puede enviarte una notificación al móvil en dos casos, cada uno desactivado hasta que lo actives:</p>
      <ul>
        <li><strong>Mochila llena:</strong> la mochila está llena y tu héroe te guarda un hallazgo. Llega media hora después de que se llene la mochila, así que no llega nada si ya la estás ordenando, y una vez cada vez que se llena.</li>
        <li><strong>Oferta del cambista:</strong> un factor Serpentos vende la siguiente mochila o estuche{F.merchantOff > 0 ? ` con un ${F.merchantOff} % de descuento` : ''} y tu héroe tiene el Auro. Como mucho una vez al día. Un factor que solo trae elixires nunca envía una.</li>
      </ul>
      <p>Recibes como mucho dos alertas al día. Las horas de silencio van de 21:00 a 08:00 salvo que las cambies: una alerta de mochila llena espera a que terminen, y una oferta que aparezca entonces se omite. Antes de enviar, el juego comprueba que la alerta sigue siendo cierta, así que nunca te avisa de una mochila que ya ordenaste ni de una oferta que ya se fue. Las decisiones, incursiones, K.O., subidas de nivel y sellos nunca envían alertas.</p>
      <p>Elige Permitir en este dispositivo en Ajustes y acepta el aviso del navegador. En iPhone y iPad, primero añade la app a tu pantalla de inicio (Compartir y luego Añadir a pantalla de inicio) y ábrela desde ahí. Cada dispositivo que permites aparece en Ajustes con un botón Quitar; quitar el último desactiva las alertas.</p>
      <h2 id="troubleshooting">Solución de problemas</h2>
      <h3 id="not-on-your-screen">Tu héroe no aparece en la pantalla</h3>
      <ul>
        <li>Pulsar Guardar añade Wardenwatch a tu lista de reproducción de TRMNL. Tu dispositivo muestra la lista plugin a plugin, a su frecuencia de actualización, así que Wardenwatch aparece cuando le toca. Con varios plugins y una actualización lenta puede tardar un rato.</li>
        <li>Abre la lista de reproducción en TRMNL y comprueba que Wardenwatch está ahí, en el dispositivo que miras si tienes más de uno, y que ningún horario lo oculta a esta hora del día.</li>
        <li>El modo reposo detiene la actualización de la pantalla por la noche. Tu héroe sigue de aventura, y la pantalla se pone al día cuando el dispositivo despierta.</li>
        <li>Una pantalla que dice «La primera aventura empieza en menos de 15 minutos» funciona. La primera historia llega en el siguiente cuarto de hora.</li>
        <li>La página Héroe de la app siempre muestra lo que hace tu héroe, muestre lo que muestre la pantalla.</li>
      </ul>
      <h3 id="if-the-screen-looks-old">La pantalla parece antigua</h3>
      <ul>
        <li>«Las actualizaciones van con retraso» significa que el servicio del juego va tarde. El progreso de tu héroe se conserva, y la pantalla se pone al día cuando el servicio lo hace.</li>
        <li>Si la web de la app está al día pero la pantalla no, revisa en TRMNL la frecuencia de actualización del plugin y su posición en la lista de reproducción.</li>
        <li>Las aventuras se ejecutan cada cuarto de hora, en punto y a las y 15, y 30 y menos 15 en la zona horaria de tu TRMNL. La pantalla no muestra cuenta atrás; la hora junto a cada historia es cuándo pasó, y la app muestra la próxima aventura.</li>
        <li>Si desconectaste o desinstalaste, vuelve a instalar desde TRMNL. Tu héroe conserva todo su progreso.</li>
      </ul>
      <h2 id="disconnecting-and-removing">Desconectar y quitar</h2>
      <p>
        Desconectar detiene las pantallas nuevas de esa instalación. TRMNL puede seguir mostrando la última imagen hasta que quites el plugin de tu lista de reproducción; no
        podemos borrar una imagen que ya está en tu dispositivo.
      </p>
      <h2 id="help">Ayuda</h2>
      <p>
        Escribe a <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> si necesitas ayuda con la cuenta o la conexión. Intentamos responder en dos días laborables.
      </p>
    </>
  ),
}
