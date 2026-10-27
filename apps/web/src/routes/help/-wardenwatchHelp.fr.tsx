import { contentTranslator } from '@trmnl-games/wardenwatch/i18n/lazy'
import { WARDENWATCH_INSTALL_URL, SUPPORT_EMAIL } from '../../lib/prose'
import { affixName, HELP_FACTS as F, nextTableDate, occasionName, signed, type Cost, type Modifiers, type Occasion } from './-wardenwatchFacts'
import type { HelpPage } from './-wardenwatchHelp'
import { WARDENWATCH_HELP_HEAD } from './-helpHeads'

const t = contentTranslator('fr')
const n = (value: number) => t.number(value)
const auro = (value: number) => `${n(value)} Auro`
const et = (parts: readonly string[], last = 'et') => (parts.length <= 1 ? parts.join('') : `${parts.slice(0, -1).join(', ')} ${last} ${parts.at(-1)}`)
const name = (english: string) => t.name(english)
const zone = (english: string) => t.nameWith(english, 'le')
const rungs = (list: readonly { name: string; size: number; price: number }[]) => et(list.map((rung) => `${t.nameWith(rung.name, 'un')} (${rung.size}) pour ${auro(rung.price)}`))
const price = (c: Cost) => `${et(c.materials.map((m) => `${m.n} ${name(m.name).toLowerCase()}`))} plus ${auro(c.gold)}`
const boonLine = (m: Modifiers) => [m.attackPct ? `${signed(m.attackPct)} % d’attaque` : '', m.defensePct ? `${signed(m.defensePct)} % de défense` : '', m.xpPct ? `${signed(m.xpPct)} % d’XP des victoires` : '', m.goldPct ? `${signed(m.goldPct)} % d’Auro` : '', m.trapDamagePct ? `pièges ${m.trapDamagePct} % moins douloureux` : ''].filter(Boolean).join(', ')
const ZONES_LINE = et(F.zones.filter((b) => b.level > 1).map((b) => `${zone(b.name)} au niveau ${b.level}`))
const arrives = (feature: 'todo' | 'stances' | 'choices' | 'merchant' | 'raids') => (F.unlocks === undefined ? '' : ` Disponible au niveau ${F.unlocks[feature]}.`)
const SAFE = name(F.zones[0]?.name ?? 'Castellum Frigo')
const ILL_OMEN = t.text(occasionName('friday_13th', 'Jour de mauvais augure'))
const GIFT_DAY = t.text(occasionName('christmas', 'Fête de la mi-hiver'))
const rarityFr: Record<string, string> = { common: 'commun', uncommon: 'peu commun', rare: 'rare', epic: 'épique' }

const MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']
const WEEKDAYS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']
const NTH = ['premier', 'deuxième', 'troisième', 'quatrième', 'cinquième']
function occasionDate(rule: Occasion): string {
  const date = rule.date
  const span = rule.days > 1 ? `, pendant ${rule.days} jours` : ''
  switch (date.kind) {
    case 'fixed':
      return `le ${date.day === 1 ? '1er' : date.day} ${MONTHS[date.month - 1]}${span}`
    case 'nth_weekday': {
      const base = `le ${NTH[date.nth - 1]} ${WEEKDAYS[date.weekday]} de ${MONTHS[date.month - 1]}`
      const offset = date.offsetDays ?? 0
      return `${offset === 0 ? base : `le ${WEEKDAYS[(date.weekday + offset) % 7]} qui suit ${base}`}${span}`
    }
    case 'friday_13th':
      return 'chaque vendredi 13'
    case 'easter':
      return date.offsetDays === -2 ? 'du Vendredi saint au lundi de Pâques' : `${Math.abs(date.offsetDays)} jours ${date.offsetDays < 0 ? 'avant' : 'après'} le dimanche de Pâques${span}`
    case 'table': {
      const next = nextTableDate(date.dates)
      return next === null ? 'une date qui change chaque année' : `une date qui change chaque année (prochaine : ${next.getUTCDate()} ${MONTHS[next.getUTCMonth()]} ${next.getUTCFullYear()})`
    }
  }
}

export const fr: HelpPage = {
  seoTitle: WARDENWATCH_HELP_HEAD.fr.seoTitle,
  description: WARDENWATCH_HELP_HEAD.fr.description,
  title: 'Wardenwatch sur TRMNL',
  contents: {
    'getting-started': 'Premiers pas', 'if-the-qr-sends-you-back-to-setup': 'Si le QR vous renvoie à l’installation', 'how-time-works': 'Comment le temps passe', zones: 'Zones', seals: 'Sceaux', commissions: 'Commissions', 'heroes-and-classes': 'Héros et classes', stances: 'Postures', 'camp-raids': 'Raids de camp', musters: 'Rassemblements', strays: 'Objets égarés', 'garrison-orders': 'Ordres de garnison', draughts: 'Élixirs', 'the-serpentos-moneychanger': 'Le changeur Serpentos', decisions: 'Décisions', effects: 'Effets', 'sky-calendar': 'Le ciel et le calendrier', 'rare-and-epic-gear': 'Équipement rare et épique', 'when-your-pack-fills-up': 'Quand le paquetage est plein', 'bigger-packs': 'Paquetages plus grands', 'salvage-and-the-forge': 'Récupération et Forge', 'getting-knocked-out': 'Être mis K.-O.', recaps: 'Récaps', 'understanding-rankings': 'Comprendre les classements', 'sharing-your-hero': 'Partager votre héros', 'following': 'Suivis', names: 'Noms', looks: 'Apparence', alerts: 'Alertes', troubleshooting: 'Dépannage', 'disconnecting-and-removing': 'Déconnecter et retirer', help: 'Aide',
  },
  Body: () => (
    <>
      <h2 id="getting-started">Premiers pas</h2>
      <ul>
        <li>Ouvrez <a href={WARDENWATCH_INSTALL_URL}>Wardenwatch dans la boutique TRMNL</a> et choisissez Installer.</li>
        <li>Connectez-vous à Wardenwatch, choisissez un nom public, nommez votre Écuyer et composez son apparence, puis reliez l’installation.</li>
        <li>De retour dans TRMNL, cliquez sur Enregistrer. La première aventure de votre héros commence en moins de 15 minutes.</li>
        <li>Ajoutez le plugin à une playlist, ou à un mashup si vous voulez votre héros à côté d’autres plugins. Les quatre tailles de mise en page sont prises en charge.</li>
      </ul>
      <h2 id="if-the-qr-sends-you-back-to-setup">Si le QR vous renvoie à l’installation</h2>
      <p>Le QR ouvre le compagnon du compte avec lequel vous êtes connecté. Il ne lance pas de nouvelle installation. Vérifiez l’adresse e-mail affichée sur la page d’installation et utilisez Changer de compte si vous aviez relié l’installation avec un autre compte.</p>
      <p>Si l’installation indique « Reconnecter Wardenwatch », votre connexion TRMNL existe mais le héros manque. Cela peut arriver après une réinitialisation du jeu. Installez une nouvelle copie de <a href={WARDENWATCH_INSTALL_URL}>Wardenwatch depuis TRMNL</a>, connectez-vous avec le même compte, choisissez un nouveau nom de héros, reliez, puis cliquez sur Enregistrer dans TRMNL. Une fois la nouvelle copie en marche, retirez l’ancienne de votre playlist.</p>
      <p>Si l’installation indique « Enregistrez dans TRMNL pour commencer », votre héros est déjà prêt. Retournez à cette installation dans TRMNL et cliquez sur Enregistrer.</p>
      <h2 id="how-time-works">Comment le temps passe</h2>
      <p>
        Le monde du jeu avance toutes les 15 minutes, que votre écran soit allumé ou non. Votre TRMNL affiche un instantané et s’actualise selon son propre rythme.
        Le mode veille, une actualisation plus lente et les autres éléments de la playlist ne réduisent jamais la progression de votre héros. Les heures des aventures dans le compagnon suivent le fuseau horaire de votre navigateur.
      </p>
      <p>
        La barre de titre de votre TRMNL porte la date de Volta, par exemple « Rime Ascendant 4 · Gyre du Wyrm 1203 ». Un jour de Volta est un passage de Myrkos le Veilleur dans le ciel et dure un jour réel. Neuf jours font un axe (Ascendant, Skybottom, Descendant, Midheaven), quatre axes un Cycle cardinal (Rime, Echo, Gloam, Grave, Melt, Verd, Tan, Shade, Molt, Tanhaus), et dix cycles une année de 360 jours, chaque année placée sous l’un des douze Gardiens tour à tour. Le compte a commencé le 1 Rime Ascendant 1203, l’année de la fondation de Castellum Frigo. La date n’est qu’un décompte : la simulation suit le temps réel.
      </p>
      <h2 id="zones">Zones</h2>
      <p>La carte d’Ur-Turul compte {F.zones.length} zones, et votre héros commence à {SAFE}, le fort à moitié bâti de l’Expédition sur la rive est des Terres primordiales. Chaque zone s’ouvre à un niveau, que vous y alliez ou non : {ZONES_LINE}. Votre TRMNL signale la nouvelle zone sur la carte quand c’est le cas ; à vous de décider d’y aller, depuis la carte de la page Héros. Les zones éloignées du fort ont des créatures plus coriaces, plus d’Auro, des élixirs plus forts et des ordres de garnison mieux payés. {SAFE} ne peut pas mettre un héros K.-O. ; toutes les autres zones le peuvent.</p>
      <ul>
        {F.zones.map((z) => <li key={z.id}><strong>{name(z.name)}</strong>{z.level > 1 ? ` (niveau ${z.level})` : ' (dès le départ)'} : {z.monsters.map(name).join(', ')}.</li>)}
      </ul>
      {F.lore ? <p>La page Notes de terrain, sous Plus, garde ce que le relevé d’Ur-Turul a consigné sur chaque zone et chaque créature. La note d’une zone s’ouvre la première fois que votre héros y met les pieds, celle d’une créature à la première victoire contre elle. Les notes n’influent pas sur le jeu.</p> : null}
      <h2 id="seals">Sceaux</h2>
      <p>Gardez Wardenwatch dans votre playlist et cherchez le code de sceau, six chiffres comme 482 917, dans la barre de titre de l’écran (les mashups étroits en portrait abrègent son étiquette). Saisissez ce code dans les Réglages du compagnon pour apposer un sceau de cire permanent sur votre collection. Le plein écran et les mashups l’affichent tous les deux ; l’aperçu du compagnon le masque. Tant qu’un sceau attend, le QR code de l’écran le récupère aussi : scannez-le avec votre téléphone et le compagnon l’ajoute à votre étagère, même si la barre de titre est masquée. Quand il y a la place, le code est imprimé à côté.</p>
      <p>Vous pouvez récupérer un sceau par semaine, avec un nouveau code chaque lundi à 00:00 UTC. Le code de la semaine précédente marche aussi si votre écran s’actualise lentement. Si vous manquez une semaine, vous obtenez le même sceau la semaine suivante. Une fois la collection complète, vous pouvez récupérer d’autres exemplaires de chacun. Les sceaux ne changent ni l’XP, ni l’équipement, ni les classements, et plusieurs appareils ou une actualisation plus rapide ne rapportent rien de plus.</p>
      {F.career !== undefined ? (
        <>
          <h2 id="commissions">Commissions</h2>
          <p>Votre héros a toujours un objectif du commandant du fort, affiché en haut de la page Héros : « Gagnez votre premier combat », « Équipez une pièce d’équipement trouvée », « Rendez-vous dans les Fjords de Moonbight », « Achetez le Sac de pèlerin ». Certains s’atteignent en aventure ; les autres se font ici, sur la page Paquetage ou Héros. Atteindre un objectif est annoncé sur votre TRMNL et met un peu d’Auro de côté ({n(F.career.gold)} sur toute l’échelle) ; appuyez sur Récupérer sur la page Héros pour l’encaisser. Les objectifs ne donnent pas d’XP et n’expirent jamais, et le suivant commence que vous ayez récupéré l’Auro ou non.</p>
          <ul>
            <li>La page Commissions, sous Plus, liste les {F.career.goals} objectifs dans l’ordre, avec la date à laquelle vous avez atteint chacun. Un objectif déjà rempli quand l’échelle est arrivée compte comme atteint. Les rangs en chemin sont Écuyer, Juré, Banneret et Juré des Gardiens.</li>
            {F.unlocks !== undefined ? <li>Les fonctions arrivent par niveau, que vous passiez ou non : les ordres de garnison au niveau {F.unlocks.todo}, les postures au niveau {F.unlocks.stances}, les décisions en chemin au niveau {F.unlocks.choices}, {F.meetings?.level !== undefined ? `les rassemblements entre camarades au niveau ${F.meetings.level}, ` : ''}{F.workbench?.level !== undefined ? `la récupération et la Forge au niveau ${F.workbench.level}, ` : ''}le changeur Serpentos au niveau {F.unlocks.merchant} et les raids de camp au niveau {F.unlocks.raids}. Votre TRMNL annonce chacune. Les zones s’ouvrent aussi par niveau : {ZONES_LINE}.</li> : null}
            <li>Quand les postures s’ouvrent, votre héros n’en a aucune et joue Ferme. Un objectif vous demande d’en choisir une ; n’importe laquelle des trois compte, et vous pourrez en changer ensuite.</li>
            <li>Quelques premiers objectifs arrivent à coup sûr à temps : le premier combat en quelques aventures, une pièce d’équipement dans la première douzaine, et une première décision, un premier changeur et une première élite dans la journée qui suit leur niveau. Tout le reste dépend du hasard.</li>
          </ul>
        </>
      ) : null}
      {F.classes !== undefined ? (
        <>
          <h2 id="heroes-and-classes">Héros et classes</h2>
          <p>Tout le monde commence en Chevalier. Quand votre Chevalier atteint le niveau {F.rosterLevel}, votre TRMNL annonce un second héros, et vous pouvez recruter un Assassin depuis la page Héros, sous Plus. L’Assassin commence au niveau 1 avec son propre nom, son apparence, son équipement, son Auro, ses élixirs et ses objectifs.</p>
          <ul>
            <li>Un seul héros part à l’aventure à la fois : c’est lui que montre votre TRMNL et lui qui figure dans les classements. L’autre reste là où vous l’avez laissé. Il ne part pas à l’aventure et ne rattrape rien plus tard, et un changeur qui lui rend visite repart.</li>
            <li>Vous pouvez changer une fois par jour. Revenir en arrière dans les dix minutes ne compte pas. Un héros K.-O. ou en route doit d’abord récupérer ou arriver.</li>
            <li>Vous pouvez avoir un héros de chaque classe. Les entrées du relevé vous appartiennent quel que soit le héros qui les obtient ; quelques-unes sont réservées à l’Assassin.</li>
            <li><strong>Chevalier</strong> : {t.text(F.classes.warriorBlurb)}</li>
            <li><strong>Assassin</strong> : {t.text(F.classes.rogueBlurb)} {F.classes.rogue.hpPct} % de santé, attaque {signed(F.classes.rogue.attackPct)} %, défense {signed(F.classes.rogue.defensePct)} %, {signed(F.classes.rogue.goldPct)} % d’Auro à chaque combat et trouvaille, et {F.classes.rogue.raidEdgePct} points de son côté dans chaque raid de camp. Il progresse au même rythme que le Chevalier mais se fait mettre K.-O. un peu plus souvent.</li>
          </ul>
        </>
      ) : null}
      <h2 id="stances">Postures</h2>
      <p>Choisissez jusqu’où votre héros pousse avant de se reposer, sur la page Héros.{arrives('stances')} La posture s’applique dès l’aventure suivante, et vous pouvez la changer à tout moment. Votre TRMNL l’affiche à côté du nombre de places du paquetage, sous une jauge dont l’aiguille est basse pour Sur ses gardes, au milieu pour Ferme et haute pour Téméraire.</p>
      <ul>
        <li><strong>Sur ses gardes</strong> boit un élixir sous 65 % de PV, se repose sous 50 % et repart à 90 %. Il gagne 90 % de l’XP habituelle des victoires.</li>
        <li><strong>Ferme</strong>, la règle de la garnison et le réglage par défaut, boit sous 50 %, se repose sous 35 % et repart à 75 %, avec l’XP habituelle.</li>
        <li><strong>Téméraire</strong> boit sous 35 %, se repose sous 20 % et repart à 60 %. Il gagne 115 % d’XP des victoires mais se fait mettre K.-O. plus souvent.</li>
      </ul>
      <p>{SAFE} ne peut pas mettre un héros K.-O., donc Téméraire ne risque rien entre les murs. Dans toute autre zone, un K.-O. coûte de l’Auro et renvoie votre héros à {SAFE}, et Téméraire est celui qui tombe le plus souvent.</p>
      <h2 id="camp-raids">Raids de camp</h2>
      <p>En patrouille, les Écuyers fouillent parfois le paquetage des autres. Chaque héros actif{F.unlocks === undefined ? '' : ` à partir du niveau ${F.unlocks.raids}`} pille et se fait piller automatiquement. Vous ne pouvez ni lancer un raid ni choisir sa cible.{F.unlocks === undefined ? '' : ` Sous le niveau ${F.unlocks.raids}, un héros ne pille pas et n’est pas pillé.`} Le raid apparaît dans le journal d’aventure des deux héros avec le nom public de l’autre joueur, et la page Héros garde l’historique des raids de votre héros.</p>
      <ul>
        <li>Le vainqueur se décide à pile ou face, influencé seulement par la posture. Le niveau, l’équipement et les effets ne comptent jamais. Sur ses gardes ajoute 10 points de son côté, Ferme rien, et Téméraire en retire 5, en attaque comme en défense.</li>
        <li>La fréquence des raids dépend aussi de la posture : Sur ses gardes environ un jour de patrouille sur deux, Ferme environ une fois par jour, Téméraire environ deux fois par jour.</li>
        <li>Le perdant donne 5 % de son Auro au gagnant : l’Auro ne fait que changer de mains. Les deux perdent des PV : le perdant 30 % de ses PV max, le gagnant 10 %. Un équipement {name(affixName('thrifty'))} réduit la perte d’Auro de ses points.</li>
        <li>Un raid peut mettre un héros K.-O., exactement comme un combat ; à {SAFE}, votre héros est secouru à la place. Les raids ne trouvent que les héros qui explorent ou se reposent, et un héros pillé est laissé tranquille pendant environ six heures.</li>
        <li>Si vous préférez perdre moins de raids, choisissez Sur ses gardes : c’est la posture qui pille le moins et gagne le plus.</li>
      </ul>
      {F.meetings !== undefined ? (
        <>
          <h2 id="musters">Rassemblements</h2>
          <p>De temps en temps, au lieu d’un combat, votre héros croise le héros d’un autre joueur dans la même zone{F.meetings.level === undefined ? '' : `, à partir du niveau ${F.meetings.level}`}. Ils font la queue à la soupe, échangent des histoires de veille ou partagent leurs rations, et les deux héros reçoivent le même petit bonus pendant {F.meetings.boonAdventures} aventures. Les deux journaux racontent la rencontre avec le nom public de l’autre joueur, et l’onglet Journal liste les cinq derniers rassemblements de votre héros.</p>
          <ul>
            {F.meetings.kinds.map((kind) => <li key={kind.id}><strong>{t.text(kind.name)}</strong> : {t.text(kind.effect)}, {boonLine(kind.modifiers)}.</li>)}
            <li>Rien ne change de mains. Un rassemblement remplace une aventure, et le bonus compense à peu près.</li>
            <li>Il arrive au même rythme quelles que soient la posture et la classe, environ un jour sur deux pour un héros en patrouille. Les héros ne se croisent qu’en exploration ou au repos, et un héros qui vient d’en avoir un est laissé tranquille pendant environ douze heures.</li>
          </ul>
        </>
      ) : null}
      {F.lostProperty ? (
        <>
          <h2 id="strays">Objets égarés</h2>
          <p>Quand votre héros est mis K.-O. hors des murs, il laisse tomber un double de son arme ou de son armure sur la route de cette zone, avec votre nom public gravé dessus. Votre héros garde tout ce qu’il portait. Plus tard, le héros d’un autre joueur qui patrouille cette zone peut trouver l’objet égaré au lieu d’une trouvaille ordinaire, et votre TRMNL vous dit qui l’a trouvé.</p>
          <ul>
            <li>Votre héros peut trouver les objets égarés des autres joueurs de la même façon. C’est un équipement ordinaire : équipez-le, vendez-le, récupérez-le ou apportez-le à la Forge. Il a les caractéristiques de base de son type et de sa rareté, sans les améliorations de son premier propriétaire.</li>
            <li>Le nom reste dessus. La page Paquetage et la carte Objets égarés de l’onglet Journal indiquent à qui il appartenait, tout comme votre page de héros tant que vous le gardez.</li>
            <li>Un objet égaré ne fait que remplacer une trouvaille que votre héros allait faire de toute façon : personne ne reçoit d’équipement en plus. Les récompenses de commission et les cadeaux de la {GIFT_DAY} sont toujours de l’équipement neuf.</li>
            <li>Un seul objet égaré à vous traîne à la fois. Si votre héros est de nouveau mis K.-O. avant que quelqu’un le trouve, le nouveau remplace l’ancien.</li>
          </ul>
        </>
      ) : null}
      {F.todo !== undefined ? (
        <>
          <h2 id="garrison-orders">Ordres de garnison</h2>
          <p>Le tableau du fort affiche trois petits ordres pour votre héros, comme « Vaincre 4 Rats de givre des celliers », « Trouver 2 pièces d’équipement » ou « Patrouiller les Fjords de Moonbight pendant 16 aventures ».{arrives('todo')} Il s’en occupe en patrouille, et la page Héros montre l’avancement de chaque ordre. Quand un ordre est rempli, votre écran le dit et votre héros reçoit un peu d’Auro : {et(F.todo.pay.map(String), 'ou')} selon la zone. Les ordres ne donnent pas d’XP et n’influent donc pas sur les classements.</p>
          <ul>
            <li>Chaque matin à {F.todo.muster}, heure locale de votre TRMNL, le rassemblement du matin affiche de nouveaux ordres à la place des ordres remplis. Votre écran les liste.</li>
            <li>Les ordres n’expirent jamais. Un ordre bloqué est échangé automatiquement après deux rassemblements.</li>
            <li>Au moins deux des trois ordres peuvent se faire là où se trouve votre héros. Un seul au plus demande un voyage dans une autre zone, si vous voulez l’y envoyer.</li>
            <li>Une fois entre deux rassemblements, vous pouvez échanger un ordre non rempli contre un autre sur la page Héros.</li>
          </ul>
        </>
      ) : null}
      <h2 id="draughts">Élixirs</h2>
      {F.potions === undefined
        ? <p>Un élixir de cuivre rend 40 % des PV max de votre héros, arrondis au supérieur. Votre héros en boit un automatiquement quand ses PV passent sous le seuil d’élixir de sa posture en patrouille, et le journal le note. Sans élixir, votre héros se repose sous le seuil de repos et repart une fois rétabli. Vous pouvez aussi en boire un vous-même depuis la page Héros quand votre héros explore ou se repose sans être à pleine santé. Les élixirs se trouvent en patrouille et ne prennent jamais de place dans le paquetage.</p>
        : <>
          <p>Les élixirs de cuivre existent en {F.potions.strengths.length} forces : {et(F.potions.strengths.map((s) => `${name(s.name).toLowerCase()} (${s.healPct} %)`))}, chacune rendant cette part des PV max de votre héros, arrondie au supérieur. Les trouvailles dépendent de l’endroit : {F.potions.drops.map((d) => `${zone(d.zone)} donne ${d.rest.length === 0 ? 'uniquement' : 'surtout'} des ${name(`${d.top.toLowerCase()}s`)}${d.rest.length === 0 ? '' : `, avec quelques ${d.rest.map((r) => name(`${r.toLowerCase()}s`)).join(' et ')}`}`).join(' ; ')}. Un nouveau héros commence avec des élixirs, et le changeur comme les décisions en chemin en distribuent aussi. Toutes les forces partagent un même coffret et ne prennent jamais de place dans le paquetage.</p>
          <p>Votre héros boit automatiquement quand ses PV passent sous le seuil d’élixir de sa posture en patrouille : l’élixir le plus faible qui le remet au-dessus du seuil, ou le plus fort qu’il a si aucun plus faible ne suffit. Le journal indique ce qu’il a bu. Sans élixir, votre héros se repose sous le seuil de repos et repart une fois rétabli. Vous pouvez aussi en boire un vous-même depuis la page Héros quand votre héros explore, se repose ou voyage sans être à pleine santé ; avec plusieurs forces dans le coffret, la page Héros demande laquelle.</p>
          <p><strong>Combiner.</strong> Sur la page Paquetage, {F.potions.combine.count} {name(`${F.potions.combine.from.toLowerCase()}s`)} et {F.potions.combine.materials.map((m) => `${m.n} ${name(m.name).toLowerCase()}`).join(', ')} donnent un {name(F.potions.combine.to.toLowerCase())}. Combiner ne vous laisse jamais plus d’élixirs qu’avant, donc le coffret ne peut pas déborder. Cela n’arrive que si vous le choisissez.</p>
        </>}
      <p>Les élixirs sont rangés dans un coffret. Un nouveau héros porte {t.nameWith(F.firstPouch.name, 'un')} qui en contient {F.firstPouch.size}. Les coffrets plus grands s’achètent avec de l’Auro sur la page Paquetage, un à la fois : {rungs(F.shopPouches)}. Quand le coffret est plein, un élixir trouvé devient de l’Auro.</p>
      <h2 id="the-serpentos-moneychanger">Le changeur Serpentos</h2>
      <p>De temps en temps, un facteur Serpentos, l’un des changeurs Dragu qui voyagent avec les navires de ravitaillement, s’arrête auprès de votre héros en patrouille. Votre écran le dit, et la page Paquetage affiche jusqu’à trois offres : quelques élixirs, et le prochain coffret ou le prochain paquetage{F.merchantOff > 0 ? ` à −${F.merchantOff} % du prix de la page Paquetage` : ''}. Chaque offre ne se vend qu’une fois. Le facteur repart après quatre aventures ou après votre dernier achat.</p>
      <h2 id="decisions">Décisions</h2>
      <p>Parfois, la route demande quelque chose de simple à votre héros, comme participer au ragoût du cuisinier ou prendre un tour de veille sur la palissade. Votre écran indique qu’une décision attend, et la page Héros montre les deux options avec exactement ce que chacune change. Si vous ne répondez pas en un jour environ, l’option marquée par défaut est choisie pour vous.</p>
      <h2 id="effects">Effets</h2>
      <p>Certains moments laissent à votre héros un effet de courte durée, affiché sur la page Héros avec les aventures restantes. Battre une élite donne Rage de vaincre (+10 % d’attaque pendant huit aventures). Participer au ragoût donne Ventre plein (+10 % d’XP pendant huit aventures). Un piège laisse une Contusion (−15 % de défense pendant quatre aventures). Votre héros garde au plus trois effets. Tout repos efface les mauvais effets, et un K.-O. les efface tous.</p>
      {F.standoff !== undefined ? (
        <>
          <h2 id="dug-in-elites">Élites retranchées</h2>
          <p>À partir du niveau {F.standoff.minLevel}, dans {zone(F.standoff.zone)} et les zones au-delà, une élite se retranche parfois au lieu de tomber en un combat. Votre TRMNL l’affiche avec sa barre de santé, et votre héros revient l’affronter à chaque aventure jusqu’à ce qu’elle tombe.</p>
          <ul>
            <li>À chaque aventure, votre héros l’affronte pendant six rounds au plus, et sa santé est conservée. Elle frappe bien plus fort qu’une élite ordinaire, et votre héros continue au-delà du seuil de repos de sa posture avant de reculer : un face-à-face peut donc finir en K.-O. Rompre le combat ne coûte pas d’Auro.</li>
            <li>Quand elle tombe, elle rapporte {F.standoff.xp} fois l’XP de la créature et {F.standoff.gold} fois son Auro, plus une trouvaille rare ou épique de cette zone.</li>
            <li>Elle part au bout de {F.standoff.hours} heures, ou plus tôt si votre héros est mis K.-O. ou voyage. Une pause n’arrête pas le compteur.</li>
            <li>La page Héros montre sa santé et l’heure de son départ. Vous pouvez y laisser tomber l’élite, et un voyage demande confirmation avant de l’abandonner.</li>
          </ul>
        </>
      ) : null}
      <h2 id="sky-calendar">Le ciel et le calendrier</h2>
      <p>Douze lunes enchaînées veillent sur Volta, une par Gardien astral, et la bande en haut de la scène de votre héros les montre dans l’ordre du Gyre : Vierge enchaînée, Léviathan, Wyrm, Magnus, Horreur en fleur, Chien du voile, Traître, Conjoints, Bête eldritch, Titan, Éclipse et Veilleur. La face éclairée de chaque lune suit sa propre période, du jour unique du Veilleur à l’année de la Vierge, et la lune la plus pleine du jour porte un halo. La lune de la Vierge est une coque morte et se dessine toujours fendue. Le ciel, comme la date de la barre de titre, se calcule d’après l’horloge seule et ne change rien au jeu.</p>
      {F.occasions !== undefined ? (
        <>
          <p>Certains jours de l’année sont des événements célestes qui décorent la scène de votre héros : des ornements en haut, quelque chose par terre, parfois un chapeau, et à {SAFE} une autre vue au-delà de la palissade. Ils suivent la date locale de votre TRMNL. La première fois que votre héros en voit un, le journal le nomme, et la plupart apportent un petit bonus le temps qu’ils durent. La page Héros affiche l’événement du jour et le suivant.</p>
          <ul>
            {F.occasions.map((rule) => <li key={rule.id}><strong>{t.text(rule.name)}</strong>, {occasionDate(rule)} : {rule.id === 'friday_13th' ? 'chaque raid de camp tourne mal (voir ci-dessous).' : rule.effectLabel ? `${t.text(rule.effectLabel)}.` : 'décorations seulement.'}</li>)}
          </ul>
          <p><strong>{ILL_OMEN}.</strong> Les raids de camp partent deux fois plus souvent, et tous tournent mal : personne ne gagne, et les deux héros perdent 20 % de leurs PV max et 5 % de leur Auro, que personne ne récupère. L’historique des raids de votre héros le compte comme un incident.</p>
          <p><strong>{GIFT_DAY}.</strong> Votre héros trouve un cadeau emballé : une pièce d’équipement de la zone où il se trouve, lors de sa première aventure des trois jours.</p>
        </>
      ) : null}
      <h2 id="rare-and-epic-gear">Équipement rare et épique</h2>
      <p>L’équipement peut être commun, peu commun, rare ou épique. L’épique est le plus rare, environ une trouvaille sur cent, et le plus puissant. L’équipement rare et épique porte aussi un trait de Forge stellaire, indiqué dans le nom de l’objet et expliqué sur la page Paquetage. Chacun suit la métallurgie des Obsidianides : un métal travaillé dans la pièce lui prête une propriété.</p>
      <ul>
        <li><strong>{name(affixName('vampiric'))}</strong> rend 5 % des PV max après chaque victoire, parce que le cuivre soigne.</li>
        <li><strong>{name(affixName('lucky'))}</strong> ajoute 20 % d’Auro aux victoires et aux trouvailles.</li>
        <li><strong>{name(affixName('sturdy'))}</strong> subit 40 % de dégâts en moins des pièges.</li>
        <li><strong>{name(affixName('thrifty'))}</strong> perd 5 points d’Auro en moins quand ça tourne mal : une retraite ne coûte plus d’Auro au lieu de 5 %, et un K.-O. coûte 5 % au lieu de 10 %.</li>
      </ul>
      <h2 id="when-your-pack-fills-up">Quand le paquetage est plein</h2>
      <p>Un nouveau héros commence avec une besace de 6 places. L’équipement porté et les élixirs ne prennent pas de place. Quand le paquetage est plein, votre héros met de côté pour vous la prochaine pièce trouvée et continue l’aventure. Tant qu’elle attend, les trouvailles suivantes restent sur place jusqu’à ce que vous fassiez de la place.</p>
      <h2 id="bigger-packs">Paquetages plus grands</h2>
      <p>Votre paquetage grandit avec l’Auro. {F.tote ? `Votre héros reçoit ${t.nameWith(F.tote.name, 'un')} (${F.tote.size}) dans les deux premières heures environ. ` : ''}Ensuite, les paquetages plus grands s’achètent sur la page Paquetage, un à la fois : {rungs(F.shopBags)}, jusqu’à {F.topBag} places. Il n’y a pas de niveau requis, et les paquetages ne tombent jamais en butin.</p>
      <ol className="[&_li]:list-decimal">
        <li>Ouvrez Paquetage dans le compagnon. Équipez les améliorations et vendez l’équipement en trop pour faire de la place.</li>
        <li>Si une trouvaille est mise de côté, choisissez Récupérer la trouvaille. Laissez au moins une place libre après l’avoir récupérée pour que les aventures reprennent.</li>
        <li>Une fois une place libre et plus rien en attente, les aventures reprennent toutes seules en moins de 15 minutes. Vous pouvez encore choisir une autre zone ouverte sur la page Paquetage avant cela.</li>
      </ol>
      <p>Équiper un objet ne libère pas de place. Vendre ou récupérer de l’équipement, ou acheter un plus grand paquetage, le fait, et la trouvaille mise de côté passe aussitôt dans le paquetage. La page Paquetage peut aussi vendre votre objet le plus faible en trop et garder la trouvaille en une touche. Le mode veille de votre TRMNL n’arrête jamais le jeu non plus.</p>
      {F.workbench !== undefined ? <>
        <h2 id="salvage-and-the-forge">Récupération et Forge</h2>
        <p>{F.workbench.level !== undefined ? `À partir du niveau ${F.workbench.level}, l’` : 'L’'}équipement en trop a deux façons de quitter le paquetage : le vendre contre de l’Auro, ou le récupérer en éclats de stellazia sur la page Paquetage. La récupération rapporte selon le palier où la pièce a été trouvée, en unités de l’éclat de sa rareté : {F.workbench.materials.map((m) => `${name(m.name).toLowerCase()} pour l’équipement ${m.rarities.map((r) => rarityFr[r] ?? r).join(' et ')}`).join(', ')}. L’équipement épique rapporte {F.workbench.epicMultiplier} fois plus. Les éclats ne prennent pas de place dans le paquetage et ne se vendent jamais. L’équipement n’est récupéré que si vous le choisissez.{F.workbench.level !== undefined ? ` Avant le niveau ${F.workbench.level}, vendez le surplus : la première amélioration demande de toute façon le niveau ${F.workbench.level}.` : ''}</p>
        <p>La Forge, c’est la Forge stellaire à l’échelle du fort : elle dépense des éclats et de l’Auro pour l’équipement que porte votre héros, sur place. La pièce garde son nom et son trait, seuls ses chiffres changent. Chaque pièce a une seule étape suivante. {F.workbench.tiers.map((s, i) => `${i === 0 ? 'Passer une pièce de palier 1 en Mk II' : 'Passer de Mk II à Mk III'} coûte ${price(s)}`).join(' ; ')} ; une pièce ne peut monter qu’à un palier que le niveau de votre héros pourrait équiper. Une fois en Mk III (ou trouvée ainsi), le renforcement ajoute un point par étape : {F.workbench.reinforce.map((s) => `+${s.to} pour ${price(s)}`).join(', ')}. {F.workbench.reinforce.length > 0 ? `Après +${F.workbench.reinforce.at(-1)!.to}, la pièce est terminée.` : ''} L’équipement rare et épique peut aussi recevoir le trait de votre choix pour {price(F.workbench.affix)}, à la place de celui qu’il a.</p>
        <p>Les améliorations réussissent toujours. Récupérer une pièce améliorée ne rend pas ce que vous avez dépensé pour elle, alors n’améliorez que l’équipement que vous comptez garder.</p>
      </> : null}
      <h2 id="getting-knocked-out">Être mis K.-O.</h2>
      <p>Votre héros se relève automatiquement au bout de deux heures environ et retourne à {SAFE}. Vous gardez votre XP et votre équipement mais perdez 10 % de votre Auro actuel.</p>
      <h2 id="recaps">Récaps</h2>
      <p>Votre écran affiche un court récap de la dernière nuit ou journée terminée, à l’heure locale de votre TRMNL. À 07:00, le récap de la nuit couvre 19:00 à 07:00 et reste affiché toute la journée. À 19:00, le récap de la journée couvre 07:00 à 19:00 et reste affiché toute la soirée et la nuit. La scène passe du jour à la nuit aux mêmes heures. Les histoires au-dessus sont toujours les plus récentes.</p>
      <h2 id="understanding-rankings">Comprendre les classements</h2>
      <p>L’écran affiche le Top 5 XP de la semaine de votre groupe de niveau, avec votre ligne marquée, ou ajoutée sous la liste si vous êtes plus bas. Le compagnon propose aussi le classement du jour et un classement à vie. La journée commence à 00:00 UTC et la semaine le lundi à 00:00 UTC, comme pour les sceaux. Les classements sont publiés toutes les heures : une aventure ou une montée de niveau récente peut donc apparaître avant la mise à jour de votre rang.</p>
      <p>Les héros en pause ou endormis gardent leur progression. Un héros sans XP cette semaine quitte le classement de la semaine jusqu’à en regagner. La progression à vie reste enregistrée.</p>
      <h2 id="sharing-your-hero">Partager votre héros</h2>
      <p>Votre héros a une page publique avec son niveau, son rang, sa zone actuelle, ses compteurs à vie et ses entrées du relevé. L’Auro et le journal d’aventure n’y apparaissent jamais, et l’équipement seulement quand c’est l’objet égaré d’un autre joueur que votre héros garde. Votre nom renvoie vers cette page depuis les classements et depuis les raids et rassemblements des autres joueurs, et c’est là qu’on peut vous suivre. Les Réglages ont des boutons Partager et Copier le lien, et un lien partagé affiche une carte illustrée de votre héros avec son nom, son niveau et son rang. Pour la masquer, choisissez Masquer ma page de héros dans les Réglages. Elle disparaît aussitôt, et tant qu’elle est masquée, personne ne peut vous suivre.</p>
      <h2 id="following">Suivis</h2>
      <p>Une fois connecté, vous pouvez suivre un autre joueur depuis sa page publique de héros, jusqu’à 20 joueurs. Tous ceux que vous suivez sont listés sous Classements, avec le niveau, le rang et la position de leur héros, et des liens vers leurs pages. Suivre quelqu’un ne change rien au jeu, et personne n’est prévenu quand vous le suivez. Les raids de camp choisissent leurs cibles au hasard parmi tout le monde : suivre un joueur n’envoie jamais votre héros chez lui. Si un joueur masque sa page, vous ne voyez plus que son nom jusqu’à ce qu’il la réaffiche. S’il change de nom public, il disparaît de votre liste.</p>
      <h2 id="names">Noms</h2>
      <p>Vous avez deux noms. Le nom de votre héros figure sur votre TRMNL, dans les classements et sur votre page de héros ; pour le changer, faites corriger le rôle de garnison par le greffier du fort depuis l’onglet Plus, pour 200 Auro. Le greffier accepte une correction par jour. Votre nom public, c’est vous, dans tous les jeux TRMNL : il apparaît à côté de votre héros dans les classements, dans les raids et rassemblements des autres joueurs, et dans le lien de votre page. Vous pouvez le changer gratuitement une fois tous les 7 jours depuis Compte. Les liens vers votre ancienne page cessent de fonctionner, et personne d’autre ne peut prendre votre ancien nom pendant 7 jours.</p>
      <h2 id="looks">Apparence</h2>
      <p>Vous composez l’apparence de votre héros à sa création : lignée, carrure, tête, cheveux, dos, accessoire et tabard. Onze peuples de Volta peuvent prêter le serment d’Écuyer, des petits Aquanides, Lunaris et Dragu aux immenses Crystalkin. Cela change seulement son apparence sur votre TRMNL, sur votre page de héros et dans les rassemblements des autres joueurs. Toutes les apparences jouent de la même façon. Le nom aussi vous appartient : le créateur peut vous en suggérer un dans la langue de la lignée choisie. Pour changer l’apparence plus tard, passez au miroir du camp depuis votre page de héros ou l’onglet Plus. C’est gratuit, à tout moment.</p>
      <h2 id="alerts">Alertes</h2>
      <p>Votre TRMNL est le moyen principal de suivre votre héros, mais les Réglages peuvent aussi envoyer une notification sur votre téléphone dans deux cas, chacun désactivé tant que vous ne l’activez pas :</p>
      <ul>
        <li><strong>Paquetage plein :</strong> le paquetage est plein et votre héros vous garde une trouvaille. L’alerte arrive une demi-heure après que le paquetage s’est rempli, pour ne rien envoyer si vous le triez déjà, et une seule fois chaque fois qu’il se remplit.</li>
        <li><strong>Bonne affaire chez le changeur :</strong> un facteur Serpentos vend le prochain paquetage ou le prochain coffret{F.merchantOff > 0 ? ` à −${F.merchantOff} %` : ''} et votre héros a l’Auro. Au plus une fois par jour. Un facteur qui ne vend que des élixirs n’en envoie jamais.</li>
      </ul>
      <p>Vous recevez au plus deux alertes par jour. Les heures calmes vont de 21:00 à 08:00 sauf si vous les changez : une alerte de paquetage plein attend leur fin, et une bonne affaire qui arrive pendant ces heures est ignorée. Avant l’envoi, le jeu vérifie que l’alerte tient toujours, pour ne jamais vous parler d’un paquetage déjà trié ou d’une offre disparue. Les décisions, raids, K.-O., montées de niveau et sceaux n’envoient jamais d’alerte.</p>
      <p>Choisissez Autoriser sur cet appareil dans les Réglages, puis acceptez la demande de votre navigateur. Sur iPhone et iPad, ajoutez d’abord le compagnon à votre écran d’accueil (Partager, puis Sur l’écran d’accueil) et ouvrez-le depuis là. Chaque appareil autorisé est listé dans les Réglages avec un bouton Retirer ; retirer le dernier désactive les alertes.</p>
      <h2 id="troubleshooting">Dépannage</h2>
      <h3 id="not-on-your-screen">Votre héros n’apparaît pas à l’écran</h3>
      <ul>
        <li>Cliquer sur Enregistrer ajoute Wardenwatch à votre playlist TRMNL. Votre appareil affiche la playlist un plugin à la fois, à sa fréquence d’actualisation : Wardenwatch apparaît quand vient son tour. Avec plusieurs plugins et une actualisation lente, cela peut prendre un moment.</li>
        <li>Ouvrez Playlists dans TRMNL et vérifiez que Wardenwatch y figure, sur l’appareil que vous regardez si vous en avez plusieurs, et qu’aucun planning ne le masque à cette heure-ci.</li>
        <li>Le mode veille arrête l’actualisation de l’écran la nuit. Votre héros continue l’aventure, et l’écran rattrape son retard au réveil de l’appareil.</li>
        <li>Un écran qui indique « La première aventure commence d’ici 15 minutes » fonctionne. La première histoire arrive au quart d’heure suivant.</li>
        <li>La page Héros du compagnon montre toujours ce que fait votre héros, quoi que l’écran affiche.</li>
      </ul>
      <h3 id="if-the-screen-looks-old">L’écran semble en retard</h3>
      <ul>
        <li>« Mises à jour retardées » signifie que le service du jeu prend du retard. La progression de votre héros est conservée, et l’écran rattrape quand le service repart.</li>
        <li>Si le site compagnon est à jour mais pas l’écran, vérifiez le réglage d’actualisation du plugin et sa place dans la playlist TRMNL.</li>
        <li>Les aventures ont lieu tous les quarts d’heure, à l’heure pile, à :15, :30 et :45 dans le fuseau de votre TRMNL. L’écran n’affiche pas de compte à rebours ; l’heure à côté de chaque histoire est celle où elle s’est passée, et le compagnon indique la prochaine aventure.</li>
        <li>Si vous avez déconnecté ou désinstallé, réinstallez depuis TRMNL. Votre héros garde toute sa progression.</li>
      </ul>
      <h2 id="disconnecting-and-removing">Déconnecter et retirer</h2>
      <p>
        Déconnecter arrête les nouveaux écrans pour cette installation. TRMNL peut continuer d’afficher la dernière image jusqu’à ce que vous retiriez le plugin de votre playlist ;
        nous ne pouvons pas effacer une image déjà sur votre appareil.
      </p>
      <h2 id="help">Aide</h2>
      <p>
        Écrivez à <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> pour toute aide sur votre compte ou la connexion. Nous visons une réponse sous deux jours ouvrés.
      </p>
    </>
  ),
}
