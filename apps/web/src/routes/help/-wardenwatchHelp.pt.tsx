import { contentTranslator } from '@trmnl-games/wardenwatch/i18n/lazy'
import { WARDENWATCH_INSTALL_URL, SUPPORT_EMAIL } from '../../lib/prose'
import { affixName, HELP_FACTS as F, nextTableDate, occasionName, signed, type Cost, type Modifiers, type Occasion } from './-wardenwatchFacts'
import type { HelpPage } from './-wardenwatchHelp'
import { WARDENWATCH_HELP_HEAD } from './-helpHeads'

const t = contentTranslator('pt')
const n = (value: number) => t.number(value)
const auro = (value: number) => `${n(value)} Auro`
const e = (parts: readonly string[], last = 'e') => (parts.length <= 1 ? parts.join('') : `${parts.slice(0, -1).join(', ')} ${last} ${parts.at(-1)}`)
const name = (english: string) => t.name(english)
const zone = (english: string) => t.nameWith(english, 'o')
const rungs = (list: readonly { name: string; size: number; price: number }[]) => e(list.map((rung) => `${t.nameWith(rung.name, 'um')} (${rung.size}) por ${auro(rung.price)}`))
const price = (c: Cost) => `${e(c.materials.map((m) => `${m.n} de ${name(m.name).toLowerCase()}`))} mais ${auro(c.gold)}`
const boonLine = (m: Modifiers) => [m.attackPct ? `${signed(m.attackPct)}% de ataque` : '', m.defensePct ? `${signed(m.defensePct)}% de defesa` : '', m.xpPct ? `${signed(m.xpPct)}% de XP por vitória` : '', m.goldPct ? `${signed(m.goldPct)}% de Auro` : '', m.trapDamagePct ? `armadilhas causam ${m.trapDamagePct}% menos dano` : ''].filter(Boolean).join(', ')
const ZONES_LINE = e(F.zones.filter((b) => b.level > 1).map((b) => `${zone(b.name)} no nível ${b.level}`))
const arrives = (feature: 'todo' | 'stances' | 'choices' | 'merchant' | 'raids') => (F.unlocks === undefined ? '' : ` Chega no nível ${F.unlocks[feature]}.`)
const SAFE = name(F.zones[0]?.name ?? 'Castellum Frigo')
const ILL_OMEN = t.text(occasionName('friday_13th', 'Dia de mau agouro'))
const GIFT_DAY = t.text(occasionName('christmas', 'Festa do meio do inverno'))
const rarityPt: Record<string, string> = { common: 'comum', uncommon: 'incomum', rare: 'raro', epic: 'épico' }

const MONTHS = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']
const WEEKDAYS = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado']
// Weekdays other than domingo and sábado are feminine: "a primeira segunda-feira", "o primeiro domingo".
const NTH_M = ['primeiro', 'segundo', 'terceiro', 'quarto', 'quinto']
const NTH_F = ['primeira', 'segunda', 'terceira', 'quarta', 'quinta']
const masculine = (weekday: number) => weekday === 0 || weekday === 6
function occasionDate(rule: Occasion): string {
  const date = rule.date
  const span = rule.days > 1 ? `, por ${rule.days} dias` : ''
  switch (date.kind) {
    case 'fixed':
      return `${date.day === 1 ? '1º' : date.day} de ${MONTHS[date.month - 1]}${span}`
    case 'nth_weekday': {
      const m = masculine(date.weekday)
      const base = `${m ? 'o' : 'a'} ${(m ? NTH_M : NTH_F)[date.nth - 1]} ${WEEKDAYS[date.weekday]} de ${MONTHS[date.month - 1]}`
      const offset = date.offsetDays ?? 0
      const after = (date.weekday + offset) % 7
      return `${offset === 0 ? base : `${masculine(after) ? 'o' : 'a'} ${WEEKDAYS[after]} depois d${base}`}${span}`
    }
    case 'friday_13th':
      return 'toda sexta-feira 13'
    case 'easter':
      return date.offsetDays === -2 ? 'da Sexta-feira Santa à segunda-feira de Páscoa' : `${Math.abs(date.offsetDays)} dias ${date.offsetDays < 0 ? 'antes' : 'depois'} do Domingo de Páscoa${span}`
    case 'table': {
      const next = nextTableDate(date.dates)
      return next === null ? 'uma data que muda a cada ano' : `uma data que muda a cada ano (a próxima: ${next.getUTCDate()} de ${MONTHS[next.getUTCMonth()]} de ${next.getUTCFullYear()})`
    }
  }
}

export const pt: HelpPage = {
  seoTitle: WARDENWATCH_HELP_HEAD.pt.seoTitle,
  description: WARDENWATCH_HELP_HEAD.pt.description,
  title: 'Wardenwatch no TRMNL',
  contents: {
    'getting-started': 'Primeiros passos', 'if-the-qr-sends-you-back-to-setup': 'Se o QR leva de volta à instalação', 'how-time-works': 'Como o tempo passa', zones: 'Zonas', seals: 'Selos', commissions: 'Comissões', 'heroes-and-classes': 'Heróis e classes', stances: 'Posturas', 'camp-raids': 'Incursões ao acampamento', musters: 'Chamadas', strays: 'Objetos extraviados', 'garrison-orders': 'Ordens da guarnição', draughts: 'Elixires', 'the-serpentos-moneychanger': 'O cambista Serpentos', decisions: 'Decisões', effects: 'Efeitos', 'sky-calendar': 'O céu e o calendário', 'rare-and-epic-gear': 'Equipamento raro e épico', 'when-your-pack-fills-up': 'Quando a mochila enche', 'bigger-packs': 'Mochilas maiores', 'salvage-and-the-forge': 'Desmontar e a Forja', 'getting-knocked-out': 'Ser nocauteado', recaps: 'Resumos', 'understanding-rankings': 'Como funcionam os rankings', 'sharing-your-hero': 'Compartilhar seu herói', 'following': 'Seguir', names: 'Nomes', looks: 'Aparência', alerts: 'Alertas', troubleshooting: 'Solução de problemas', 'disconnecting-and-removing': 'Desconectar e remover', help: 'Ajuda',
  },
  Body: () => (
    <>
      <h2 id="getting-started">Primeiros passos</h2>
      <ul>
        <li>Abra o <a href={WARDENWATCH_INSTALL_URL}>Wardenwatch na loja do TRMNL</a> e escolha Instalar.</li>
        <li>Entre no Wardenwatch, escolha um nome público, dê nome e aparência ao seu Escudeiro, e conecte a instalação.</li>
        <li>De volta ao TRMNL, clique em Salvar. A primeira aventura do seu herói começa em até 15 minutos.</li>
        <li>Adicione o plugin a uma playlist, ou a um mashup se quiser seu herói ao lado de outros plugins. Os quatro tamanhos de layout são aceitos.</li>
      </ul>
      <h2 id="if-the-qr-sends-you-back-to-setup">Se o QR leva de volta à instalação</h2>
      <p>O QR abre o app da conta em que você entrou. Ele não começa uma instalação nova. Confira o e-mail da conta mostrado na página de instalação e use Trocar de conta se você conectou originalmente com outra conta.</p>
      <p>Se a instalação diz “Reconectar o Wardenwatch”, sua conexão com o TRMNL existe, mas o herói está faltando. Isso pode acontecer depois de uma reinicialização do jogo. Instale uma cópia nova do <a href={WARDENWATCH_INSTALL_URL}>Wardenwatch pelo TRMNL</a>, entre com a mesma conta, escolha um nome de herói novo, conecte e clique em Salvar no TRMNL. Quando a cópia nova funcionar, tire a antiga da sua playlist.</p>
      <p>Se a instalação diz “Salve no TRMNL para começar”, seu herói já está pronto. Volte a essa instalação no TRMNL e clique em Salvar.</p>
      <h2 id="how-time-works">Como o tempo passa</h2>
      <p>
        O mundo do jogo avança a cada 15 minutos, com a tela ligada ou não. Seu TRMNL mostra um retrato do momento e se atualiza no próprio ritmo.
        Modo de suspensão, atualização mais lenta e outros itens da playlist nunca reduzem o progresso do seu herói. Os horários das aventuras no app usam o fuso horário do seu navegador.
      </p>
      <p>
        A barra de título do seu TRMNL traz a data de Volta, como “Rime Ascendant 4 · Giro do Wyrm 1203”. Um dia de Volta é uma passagem de Myrkos, o Vigia, pelo céu e dura um dia real. Nove dias formam um eixo (Ascendant, Skybottom, Descendant, Midheaven), quatro eixos um Ciclo cardeal (Rime, Echo, Gloam, Grave, Melt, Verd, Tan, Shade, Molt, Tanhaus) e dez ciclos um ano de 360 dias, cada ano regido por um dos doze Guardiões, por turno. A contagem começou em 1 de Rime Ascendant de 1203, o ano em que Castellum Frigo foi fundado. A data é só contagem: a simulação segue o tempo real.
      </p>
      <h2 id="zones">Zonas</h2>
      <p>O mapa de Ur-Turul tem {F.zones.length} zonas, e seu herói começa em {SAFE}, o forte meio construído da Expedição na margem leste das Terras primordiais. Cada uma abre num nível, quer você visite ou não: {ZONES_LINE}. Seu TRMNL marca o terreno novo no mapa quando isso acontece; ir para lá é decisão sua, pelo mapa na página Herói. Zonas mais longe do forte têm criaturas mais duras, mais Auro, elixires mais fortes e ordens da guarnição mais bem pagas. {SAFE} não consegue nocautear um herói; todas as outras zonas conseguem.</p>
      <ul>
        {F.zones.map((z) => <li key={z.id}><strong>{name(z.name)}</strong>{z.level > 1 ? ` (nível ${z.level})` : ' (desde o início)'}: {z.monsters.map(name).join(', ')}.</li>)}
      </ul>
      {F.lore ? <p>A página Notas de campo, em Mais, guarda o que o levantamento de Ur-Turul anotou sobre cada zona e cada criatura. A nota de uma zona abre na primeira vez que seu herói pisa nela, a de uma criatura na primeira vitória contra ela. As notas não afetam o jogo.</p> : null}
      <h2 id="seals">Selos</h2>
      <p>Mantenha o Wardenwatch na sua playlist e procure o código do selo, seis dígitos como 482 917, na barra de título da tela (mashups estreitos em retrato encurtam o rótulo). Digite esse código nas Configurações do app para gravar um selo de cera permanente na sua coleção. A tela inteira e os mashups mostram o código; a prévia do app o esconde. Enquanto um selo espera, o QR da tela também o coleta: escaneie com o celular e o app o coloca na sua prateleira, mesmo com a barra de título desligada. Quando há espaço, o código aparece ao lado.</p>
      <p>Você pode coletar um selo por semana, com um código novo toda segunda-feira às 00:00 UTC. O código da semana anterior também funciona se sua tela atualiza devagar. Se perder uma semana, você ganha o mesmo selo na semana seguinte. Depois de completar a coleção, você pode coletar mais de cada um. Selos não mudam XP, equipamento nem rankings, e mais dispositivos ou atualização mais rápida não rendem extras.</p>
      {F.career !== undefined ? (
        <>
          <h2 id="commissions">Comissões</h2>
          <p>Seu herói sempre tem um objetivo do comandante do forte, mostrado no topo da página Herói: “Vença seu primeiro combate”, “Equipe uma peça de equipamento que você achou”, “Chegue aos Fiordes de Moonbight”, “Compre a Mochila de peregrino”. Alguns se alcançam em aventura; o resto você faz aqui, na página Mochila ou Herói. Alcançar um objetivo é anunciado no seu TRMNL e separa um pouco de Auro ({n(F.career.gold)} na escada inteira); aperte Resgatar na página Herói para pegar. Os objetivos não dão XP nem expiram, e o próximo começa quer você tenha resgatado ou não.</p>
          <ul>
            <li>A página Comissões, em Mais, lista os {F.career.goals} objetivos em ordem, com a data em que você alcançou cada um. Um objetivo que você já tinha feito quando a escada chegou conta como alcançado. As patentes pelo caminho são Escudeiro, Jurado, Banerete e Jurado dos Guardiões.</li>
            {F.unlocks !== undefined ? <li>Os recursos chegam por nível, quer você visite ou não: as ordens da guarnição no nível {F.unlocks.todo}, as posturas no nível {F.unlocks.stances}, as decisões na estrada no nível {F.unlocks.choices}, {F.meetings?.level !== undefined ? `as chamadas com camaradas no nível ${F.meetings.level}, ` : ''}{F.workbench?.level !== undefined ? `desmontar e a Forja no nível ${F.workbench.level}, ` : ''}o cambista Serpentos no nível {F.unlocks.merchant} e as incursões ao acampamento no nível {F.unlocks.raids}. Seu TRMNL anuncia cada um. As zonas também abrem por nível: {ZONES_LINE}.</li> : null}
            <li>Quando as posturas abrem, seu herói não tem nenhuma escolhida e joga Firme. Um objetivo pede que você escolha uma; qualquer uma das três vale, e você pode mudar depois.</li>
            <li>Alguns objetivos do começo têm hora garantida: o primeiro combate em poucas aventuras, um equipamento na primeira dúzia, e uma primeira decisão, cambista e elite em mais ou menos um dia depois do nível deles. Todo o resto depende da sorte.</li>
          </ul>
        </>
      ) : null}
      {F.classes !== undefined ? (
        <>
          <h2 id="heroes-and-classes">Heróis e classes</h2>
          <p>Todo mundo começa como Cavaleiro. Quando seu Cavaleiro chega ao nível {F.rosterLevel}, seu TRMNL anuncia um segundo herói, e você pode recrutar um Assassino na página Heróis, em Mais. O Assassino começa no nível 1 com nome, aparência, equipamento, Auro, elixires e objetivos próprios.</p>
          <ul>
            <li>Um herói se aventura por vez, e é ele que seu TRMNL mostra e que aparece nos rankings. O outro fica onde você o deixou. Ele não se aventura nem recupera depois, e um cambista que o visitar vai embora.</li>
            <li>Você pode trocar uma vez por dia. Voltar atrás em até dez minutos não conta. Um herói nocauteado ou na estrada precisa se recuperar ou chegar primeiro.</li>
            <li>Você pode ter um herói de cada classe. As entradas do levantamento são suas, seja qual for o herói que as ganhe; algumas são só do Assassino.</li>
            <li><strong>Cavaleiro</strong>: {t.text(F.classes.warriorBlurb)}</li>
            <li><strong>Assassino</strong>: {t.text(F.classes.rogueBlurb)} {F.classes.rogue.hpPct}% de saúde, ataque {signed(F.classes.rogue.attackPct)}%, defesa {signed(F.classes.rogue.defensePct)}%, {signed(F.classes.rogue.goldPct)}% de Auro em todo combate e achado, e {F.classes.rogue.raidEdgePct} pontos a seu favor em toda incursão ao acampamento. Ele sobe de nível no ritmo do Cavaleiro, mas é nocauteado um pouco mais.</li>
          </ul>
        </>
      ) : null}
      <h2 id="stances">Posturas</h2>
      <p>Escolha até onde seu herói avança antes de descansar, na página Herói.{arrives('stances')} A postura vale a partir da próxima aventura, e você pode mudá-la quando quiser. Seu TRMNL a mostra ao lado da contagem da mochila, sob um medidor com o ponteiro baixo para Em guarda, no meio para Firme e alto para Temerário.</p>
      <ul>
        <li><strong>Em guarda</strong> bebe um elixir abaixo de 65% dos PV, descansa abaixo de 50% e sai de novo com 90%. Ganha 90% do XP normal por vitória.</li>
        <li><strong>Firme</strong>, a regra da guarnição e o padrão, bebe abaixo de 50%, descansa abaixo de 35% e sai de novo com 75%, com o XP normal.</li>
        <li><strong>Temerário</strong> bebe abaixo de 35%, descansa abaixo de 20% e sai de novo com 60%. Ganha 115% de XP por vitória, mas é nocauteado com mais frequência.</li>
      </ul>
      <p>{SAFE} não consegue nocautear um herói, então dentro das muralhas o Temerário não corre risco de nocaute. Em qualquer outra zona um nocaute custa Auro e manda seu herói de volta a {SAFE}, e o Temerário é o mais nocauteado.</p>
      <h2 id="camp-raids">Incursões ao acampamento</h2>
      <p>Em patrulha, os Escudeiros às vezes vasculham o equipamento uns dos outros. Todo herói ativo{F.unlocks === undefined ? '' : ` a partir do nível ${F.unlocks.raids}`} faz incursões e é invadido automaticamente. Você não pode começar uma incursão nem escolher o alvo.{F.unlocks === undefined ? '' : ` Abaixo do nível ${F.unlocks.raids} um herói não invade nem é invadido.`} A incursão aparece no diário de aventuras dos dois heróis com o nome público do outro jogador, e a página Herói guarda o histórico das incursões do seu herói.</p>
      <ul>
        <li>Quem vence é um cara ou coroa, mexido só pela postura. Nível, equipamento e efeitos nunca contam. Em guarda soma 10 pontos ao seu lado, Firme não soma nada e Temerário tira 5, tanto atacando quanto defendendo.</li>
        <li>A frequência das incursões também depende da postura: Em guarda mais ou menos a cada dois dias de patrulha, Firme cerca de uma vez por dia, Temerário cerca de duas vezes por dia.</li>
        <li>Quem perde entrega 5% do Auro a quem vence, então o Auro só muda de mãos. Os dois perdem saúde: quem perde 30% dos PV máximos, quem vence 10%. Equipamento {name(affixName('thrifty'))} tira seus pontos da perda de Auro.</li>
        <li>Uma incursão pode nocautear um herói, igual a um combate; em {SAFE} seu herói é resgatado. As incursões só encontram heróis que estão explorando ou descansando, e um herói invadido fica em paz por cerca de seis horas.</li>
        <li>Se você prefere perder menos incursões, escolha Em guarda, que invade menos e vence mais.</li>
      </ul>
      {F.meetings !== undefined ? (
        <>
          <h2 id="musters">Chamadas</h2>
          <p>De vez em quando, em vez de um combate, seu herói esbarra no herói de outro jogador na mesma zona{F.meetings.level === undefined ? '' : `, a partir do nível ${F.meetings.level}`}. Eles ficam na fila da sopa, trocam histórias de vigília ou dividem as rações, e os dois heróis ganham o mesmo pequeno bônus por {F.meetings.boonAdventures} aventuras. Os dois diários contam a história com o nome público do outro jogador, e a aba Diário lista as cinco últimas chamadas do seu herói.</p>
          <ul>
            {F.meetings.kinds.map((kind) => <li key={kind.id}><strong>{t.text(kind.name)}</strong>: {t.text(kind.effect)}, {boonLine(kind.modifiers)}.</li>)}
            <li>Nada muda de mãos. Uma chamada ocupa o lugar de uma aventura, e o bônus mais ou menos compensa.</li>
            <li>Acontece na mesma frequência, seja qual for sua postura ou classe, cerca de a cada dois dias para um herói em patrulha. Os heróis só se encontram explorando ou descansando, e um herói que acabou de ter uma chamada fica em paz por cerca de doze horas.</li>
          </ul>
        </>
      ) : null}
      {F.lostProperty ? (
        <>
          <h2 id="strays">Objetos extraviados</h2>
          <p>Quando seu herói é nocauteado fora das muralhas, ele deixa cair na estrada daquela zona um reserva da arma ou armadura, com seu nome público gravado nele. Seu herói fica com tudo o que estava usando. Depois, o herói de outro jogador patrulhando aquela zona pode achar o objeto extraviado no lugar de um achado comum, e seu TRMNL diz quem achou.</p>
          <ul>
            <li>Seu herói pode achar objetos extraviados de outros jogadores do mesmo jeito. É equipamento comum: equipe, venda, desmonte ou leve à Forja. Ele vem com os atributos básicos do tipo e da raridade, sem as melhorias do primeiro dono.</li>
            <li>O nome continua nele. A página Mochila e o cartão Objetos extraviados na aba Diário mostram de quem era, e sua página de herói também, enquanto você o tiver.</li>
            <li>Um objeto extraviado só substitui um achado que seu herói ia fazer de qualquer jeito, então ninguém ganha equipamento extra. Recompensas de comissão e presentes da {GIFT_DAY} são sempre equipamento novo.</li>
            <li>Só um objeto extraviado seu fica largado por vez. Se seu herói for nocauteado de novo antes de alguém achá-lo, o novo substitui o antigo.</li>
          </ul>
        </>
      ) : null}
      {F.todo !== undefined ? (
        <>
          <h2 id="garrison-orders">Ordens da guarnição</h2>
          <p>O quadro do forte afixa três ordens pequenas para seu herói, como “Derrote 4 Ratos de geada da adega”, “Ache 2 peças de equipamento” ou “Patrulhe os Fiordes de Moonbight por 16 aventuras”.{arrives('todo')} Ele cumpre as ordens enquanto patrulha, e a página Herói mostra o progresso de cada uma. Quando uma ordem está cumprida, sua tela diz e seu herói ganha um pouco de Auro: {e(F.todo.pay.map(String), 'ou')} conforme a zona. Ordens não dão XP, então não afetam os rankings.</p>
          <ul>
            <li>Toda manhã às {F.todo.muster}, horário local do seu TRMNL, a chamada da manhã afixa ordens novas no lugar das cumpridas. Sua tela as lista.</li>
            <li>As ordens nunca expiram. Uma ordem travada é trocada sozinha depois de duas chamadas.</li>
            <li>Pelo menos duas das três ordens podem ser cumpridas onde seu herói está. No máximo uma pede uma viagem para outra zona, se você quiser mandar seu herói para lá.</li>
            <li>Uma vez entre chamadas você pode trocar uma ordem não cumprida por outra na página Herói.</li>
          </ul>
        </>
      ) : null}
      <h2 id="draughts">Elixires</h2>
      {F.potions === undefined
        ? <p>Um elixir de cobre devolve 40% dos PV máximos do seu herói, arredondado para cima. Seu herói bebe um automaticamente quando os PV caem abaixo do limite de elixir da postura enquanto patrulha, e o diário registra isso. Sem elixires, seu herói descansa abaixo do limite de descanso e sai de novo quando se recupera. Você também pode beber um pela página Herói quando seu herói está explorando ou descansando sem estar com a saúde cheia. Os elixires são achados em patrulha e nunca ocupam espaço na mochila.</p>
        : <>
          <p>Os elixires de cobre vêm em {F.potions.strengths.length} forças: {e(F.potions.strengths.map((s) => `${name(s.name).toLowerCase()} (${s.healPct}%)`))}, e cada um devolve essa parte dos PV máximos do seu herói, arredondada para cima. Os achados dependem de onde seu herói está: {F.potions.drops.map((d) => `${zone(d.zone)} dá ${d.rest.length === 0 ? 'só' : 'principalmente'} ${name(`${d.top.toLowerCase()}s`)}${d.rest.length === 0 ? '' : `, com alguns ${d.rest.map((r) => name(`${r.toLowerCase()}s`)).join(' e ')}`}`).join('; ')}. Um herói novo começa com elixires, e o cambista e as decisões na estrada também distribuem elixires. Todas as forças dividem um estojo e nunca ocupam espaço na mochila.</p>
          <p>Seu herói bebe automaticamente quando os PV caem abaixo do limite de elixir da postura enquanto patrulha: o elixir mais fraco que o põe de volta acima desse limite, ou o mais forte que tiver quando nenhum mais fraco resolve. O diário diz o que ele bebeu. Sem elixires, seu herói descansa abaixo do limite de descanso e sai de novo quando se recupera. Você também pode beber um pela página Herói quando seu herói está explorando, descansando ou viajando sem estar com a saúde cheia; com mais de uma força no estojo, a página Herói pergunta qual.</p>
          <p><strong>Combinar.</strong> Na página Mochila, {F.potions.combine.count} {name(`${F.potions.combine.from.toLowerCase()}s`)} e {F.potions.combine.materials.map((m) => `${m.n} de ${name(m.name).toLowerCase()}`).join(', ')} viram um {name(F.potions.combine.to.toLowerCase())}. Combinar nunca deixa você com mais elixires do que antes, então o estojo não transborda. Só acontece quando você escolhe.</p>
        </>}
      <p>Os elixires ficam num estojo. Um herói novo carrega {t.nameWith(F.firstPouch.name, 'um')} que guarda {F.firstPouch.size}. Estojos maiores são comprados com Auro na página Mochila, um de cada vez: {rungs(F.shopPouches)}. Quando o estojo está cheio, um elixir achado vira Auro.</p>
      <h2 id="the-serpentos-moneychanger">O cambista Serpentos</h2>
      <p>De vez em quando um feitor Serpentos, um dos cambistas Dragu que viajam com os navios de suprimento, para junto do seu herói em patrulha. Sua tela diz, e a página Mochila mostra até três ofertas: alguns elixires e o próximo estojo ou mochila{F.merchantOff > 0 ? ` com ${F.merchantOff}% de desconto sobre o preço da página Mochila` : ''}. Cada oferta é vendida uma vez. O feitor segue viagem depois de quatro aventuras ou da sua última compra.</p>
      <h2 id="decisions">Decisões</h2>
      <p>Às vezes a estrada pergunta algo pequeno ao seu herói, como contribuir para o ensopado do cozinheiro ou fazer uma vigília noturna na paliçada. Sua tela diz que uma decisão espera, e a página Herói mostra as duas opções com exatamente o que cada uma muda. Se você não responder em cerca de um dia, a opção marcada como padrão é escolhida por você.</p>
      <h2 id="effects">Efeitos</h2>
      <p>Alguns momentos deixam seu herói com um efeito curto, listado na página Herói com as aventuras que faltam. Vencer um elite deixa seu herói {t.text('Fired up')} (+10% de ataque por oito aventuras). Contribuir para o ensopado deixa seu herói {t.text('Well fed')} (+10% de XP por oito aventuras). Uma armadilha deixa seu herói {t.text('Bruised')} (−15% de defesa por quatro aventuras). Seu herói tem no máximo três efeitos. Qualquer descanso tira os efeitos ruins, e um nocaute limpa todos.</p>
      {F.standoff !== undefined ? (
        <>
          <h2 id="dug-in-elites">Elites entrincheirados</h2>
          <p>A partir do nível {F.standoff.minLevel}, {t.nameWith(F.standoff.zone, 'no')} e nas zonas além, um elite às vezes se entrincheira em vez de cair num combate só. Seu TRMNL o mostra com a barra de saúde, e seu herói volta a enfrentá-lo a cada aventura até ele cair.</p>
          <ul>
            <li>A cada aventura seu herói luta com ele por até seis rodadas, e a saúde dele se mantém. Ele bate muito mais forte que um elite comum, e seu herói continua lutando abaixo da linha de descanso da postura antes de recuar, então um confronto pode terminar em nocaute. Recuar não custa Auro.</li>
            <li>Quando cai, rende {F.standoff.xp} vezes o XP da criatura e {F.standoff.gold} vezes o Auro dela, mais um achado raro ou épico daquela zona.</li>
            <li>Ele vai embora depois de {F.standoff.hours} horas, ou antes se seu herói for nocauteado ou viajar. A pausa não para o relógio.</li>
            <li>A página Herói mostra a saúde dele e quando vai embora. Dá para deixá-lo para trás por lá, e a viagem pergunta antes de deixá-lo.</li>
          </ul>
        </>
      ) : null}
      <h2 id="sky-calendar">O céu e o calendário</h2>
      <p>Doze luas acorrentadas pairam sobre Volta, uma para cada Guardião astral, e a faixa no alto da cena do seu herói as mostra na ordem do Giro: Donzela acorrentada, Leviatã, Wyrm, Magnus, Horror em flor, Cão do véu, Traidor, Conjugados, Besta eldritch, Titã, Eclipse e Vigia. A face iluminada de cada lua segue o próprio período, do dia único do Vigia ao ano da Donzela, e a lua mais cheia do dia leva um halo. A lua da Donzela é uma casca morta e é sempre desenhada rachada. O céu, como a data da barra de título, é calculado só pelo relógio e não muda nada no jogo.</p>
      {F.occasions !== undefined ? (
        <>
          <p>Certos dias do ano são eventos do céu que enfeitam a cena do seu herói: decorações no alto, algo no chão, às vezes um chapéu, e em {SAFE} uma vista diferente além da paliçada. Eles seguem a data local do seu TRMNL. Na primeira vez que seu herói vê um, o diário dá o nome dele, e a maioria traz um pequeno bônus enquanto dura. A página Herói mostra o evento de hoje e o próximo.</p>
          <ul>
            {F.occasions.map((rule) => <li key={rule.id}><strong>{t.text(rule.name)}</strong>, {occasionDate(rule)}: {rule.id === 'friday_13th' ? 'toda incursão ao acampamento dá errado (veja abaixo).' : rule.effectLabel ? `${t.text(rule.effectLabel)}.` : 'só decoração.'}</li>)}
          </ul>
          <p><strong>{ILL_OMEN}.</strong> As incursões ao acampamento começam duas vezes mais, e todas dão errado: ninguém vence, e os dois heróis perdem 20% dos PV máximos e 5% do Auro, que não fica com ninguém. O histórico de incursões do seu herói conta isso como contratempo.</p>
          <p><strong>{GIFT_DAY}.</strong> Seu herói acha um presente embrulhado: um equipamento da zona em que está, na primeira aventura dos três dias.</p>
        </>
      ) : null}
      <h2 id="rare-and-epic-gear">Equipamento raro e épico</h2>
      <p>O equipamento pode ser comum, incomum, raro ou épico. O épico é o mais raro, cerca de um achado em cem, e o mais forte. Equipamentos raros e épicos também têm um traço de Forja estelar, mostrado no nome do item e explicado na página Mochila. Cada um segue a metalurgia obsidiânida: um metal trabalhado na peça lhe empresta uma propriedade.</p>
      <ul>
        <li><strong>{name(affixName('vampiric'))}</strong> cura 5% dos PV máximos depois de cada vitória, porque o cobre cura.</li>
        <li><strong>{name(affixName('lucky'))}</strong> soma 20% de Auro em vitórias e achados.</li>
        <li><strong>{name(affixName('sturdy'))}</strong> recebe 40% menos dano de armadilhas.</li>
        <li><strong>{name(affixName('thrifty'))}</strong> perde 5 pontos a menos de Auro quando algo dá errado: um recuo não perde Auro em vez de 5%, e um nocaute perde 5% em vez de 10%.</li>
      </ul>
      <h2 id="when-your-pack-fills-up">Quando a mochila enche</h2>
      <p>Um herói novo começa com um alforje que guarda 6 peças de equipamento. Equipamento em uso e elixires não ocupam espaço. Quando a mochila está cheia, seu herói guarda para você a próxima peça que acha e continua a aventura. Enquanto essa peça espera, os achados seguintes ficam para trás até você liberar espaço.</p>
      <h2 id="bigger-packs">Mochilas maiores</h2>
      <p>Sua mochila cresce com Auro. {F.tote ? `Seu herói recebe ${t.nameWith(F.tote.name, 'um')} (${F.tote.size}) nas primeiras duas horas, mais ou menos. ` : ''}Depois disso, mochilas maiores são compradas na página Mochila, uma de cada vez: {rungs(F.shopBags)}, até {F.topBag} espaços. Não há exigência de nível, e mochilas nunca caem como saque.</p>
      <ol className="[&_li]:list-decimal">
        <li>Abra Mochila no app. Equipe as melhorias e venda o equipamento sobrando para liberar espaço.</li>
        <li>Se há um achado guardado, escolha Resgatar o achado. Deixe pelo menos um espaço livre depois de resgatá-lo para as aventuras poderem voltar.</li>
        <li>Quando há um espaço livre e nada esperando, as aventuras voltam sozinhas em até 15 minutos. Antes disso você ainda pode escolher outra zona aberta na página Mochila.</li>
      </ol>
      <p>Equipar não libera espaço. Vender ou desmontar equipamento, ou comprar uma mochila maior, libera, e o achado guardado entra na mochila na hora. A página Mochila também pode vender seu reserva mais fraco e ficar com o achado num toque. O modo de suspensão do seu TRMNL também nunca para o jogo.</p>
      {F.workbench !== undefined ? <>
        <h2 id="salvage-and-the-forge">Desmontar e a Forja</h2>
        <p>{F.workbench.level !== undefined ? `A partir do nível ${F.workbench.level}, o` : 'O'} equipamento sobrando tem duas saídas da mochila: vender por Auro ou desmontar em lascas de stellazia na página Mochila. Desmontar rende conforme o nível em que a peça foi achada, em unidades da lasca da raridade dela: {F.workbench.materials.map((m) => `${name(m.name).toLowerCase()} do equipamento ${m.rarities.map((r) => rarityPt[r] ?? r).join(' e ')}`).join(', ')}. Equipamento épico rende {F.workbench.epicMultiplier} vezes mais. Lascas não ocupam espaço na mochila e nunca são vendidas. O equipamento só é desmontado quando você escolhe.{F.workbench.level !== undefined ? ` Antes do nível ${F.workbench.level}, venda os reservas: a primeira melhoria pede o nível ${F.workbench.level} de qualquer jeito.` : ''}</p>
        <p>A Forja é a Forja estelar na escala do forte: gasta lascas e Auro no equipamento que seu herói usa, sem tirá-lo. A peça mantém nome e traço, e só os números mudam. Cada peça tem um único próximo passo. {F.workbench.tiers.map((s, i) => `${i === 0 ? 'Subir uma peça de nível 1 para Mk II' : 'Passar de Mk II para Mk III'} custa ${price(s)}`).join('; ')}; uma peça só sobe para um nível que o nível do seu herói poderia equipar. Quando uma peça é Mk III (ou foi achada assim), o reforço soma um ponto por passo: {F.workbench.reinforce.map((s) => `+${s.to} por ${price(s)}`).join(', ')}. {F.workbench.reinforce.length > 0 ? `Depois de +${F.workbench.reinforce.at(-1)!.to} a peça está pronta.` : ''} Equipamento raro e épico também pode receber o traço que você escolher por {price(F.workbench.affix)}, no lugar do que ele tem.</p>
        <p>As melhorias sempre dão certo. Desmontar uma peça melhorada não devolve o que você gastou nela, então só melhore o equipamento que pretende continuar usando.</p>
      </> : null}
      <h2 id="getting-knocked-out">Ser nocauteado</h2>
      <p>Seu herói se recupera sozinho depois de cerca de duas horas e volta a {SAFE}. Você mantém o XP e o equipamento, mas perde 10% do Auro que tem.</p>
      <h2 id="recaps">Resumos</h2>
      <p>Sua tela traz um resumo curto da última noite ou do último dia completos, no horário local do seu TRMNL. Às 07:00 o resumo da noite cobre das 19:00 às 07:00 e fica o dia todo. Às 19:00 o resumo do dia cobre das 07:00 às 19:00 e fica a noite toda. A cena mostra dia e noite nos mesmos horários. As histórias acima dele são sempre as mais recentes.</p>
      <h2 id="understanding-rankings">Como funcionam os rankings</h2>
      <p>A tela mostra o Top 5 de XP desta semana do seu grupo de nível, com a sua linha marcada, ou acrescentada abaixo da lista quando você está mais embaixo. O app também oferece o placar de hoje e um placar geral. O dia começa às 00:00 UTC e a semana na segunda-feira às 00:00 UTC, como os selos. Os rankings saem de hora em hora, então uma aventura ou um nível recente pode aparecer antes de sua posição atualizar.</p>
      <p>Heróis pausados ou parados mantêm o progresso. Um herói sem XP nesta semana sai do placar semanal até ganhar XP de novo. O progresso total continua registrado.</p>
      <h2 id="sharing-your-hero">Compartilhar seu herói</h2>
      <p>Seu herói tem uma página pública com nível, posição, zona atual, totais e entradas do levantamento. Auro e diário de aventuras nunca aparecem, e equipamento só quando é o objeto extraviado de outro jogador que seu herói está guardando. Seu nome leva à página pelos rankings e pelas incursões e chamadas de outros jogadores, e é lá que os outros seguem você. As Configurações têm os botões Compartilhar e Copiar link, e um link compartilhado mostra um cartão com a imagem do seu herói, nome, nível e posição. Para ocultá-la, escolha Ocultar minha página de herói nas Configurações. Ela some na hora, e enquanto está oculta ninguém pode seguir você.</p>
      <h2 id="following">Seguir</h2>
      <p>Depois de entrar, você pode seguir outro jogador pela página pública de herói dele, até 20 jogadores. Todos que você segue aparecem em Rankings, com nível, posição e local do herói, e links para as páginas. Seguir não muda nada no jogo, e ninguém é avisado quando você segue. As incursões ao acampamento escolhem os alvos ao acaso entre todos, então seguir alguém nunca manda seu herói atrás dele. Se um jogador oculta a página, você vê só o nome dele até ele mostrá-la de novo. Se ele troca o nome público, sai da sua lista.</p>
      <h2 id="names">Nomes</h2>
      <p>Você tem dois nomes. O nome do seu herói aparece no seu TRMNL, nos rankings e na página do herói; para trocá-lo, peça ao escrivão do forte que corrija o rol da chamada pela aba Mais, por 200 Auro. O escrivão aceita uma correção por dia. Seu nome público é você, em todos os jogos TRMNL: aparece ao lado do seu herói nos rankings, nas incursões e chamadas de outros jogadores e no link da sua página. Você pode trocá-lo de graça uma vez a cada 7 dias em Conta. Os links para sua página antiga param de funcionar, e ninguém mais pode usar seu nome antigo por 7 dias.</p>
      <h2 id="looks">Aparência</h2>
      <p>Você monta a aparência do seu herói ao criá-lo: linhagem, porte, cabeça, cabelo, costas, acessório e tabardo. Onze povos de Volta podem fazer o juramento de Escudeiro, dos pequenos Aquânidas, Lunaris e Dragu aos enormes Crystalkin. Só muda a aparência dele no seu TRMNL, na página do herói e nas chamadas de outros jogadores. Todas as aparências jogam igual. O nome também é escolha sua: o criador pode sugerir um na língua da linhagem que você escolher. Para mudar a aparência depois, visite o espelho do acampamento pela página do herói ou pela aba Mais. É grátis, quando quiser.</p>
      <h2 id="alerts">Alertas</h2>
      <p>Seu TRMNL é o jeito principal de acompanhar seu herói, mas as Configurações também podem mandar uma notificação para o celular em dois casos, cada um desligado até você ligar:</p>
      <ul>
        <li><strong>Mochila cheia:</strong> a mochila está cheia e seu herói está guardando um achado para você. Chega meia hora depois de a mochila encher, então não chega nada se você já está arrumando, e uma vez cada vez que ela enche.</li>
        <li><strong>Oferta do cambista:</strong> um feitor Serpentos está vendendo a próxima mochila ou estojo{F.merchantOff > 0 ? ` com ${F.merchantOff}% de desconto` : ''} e seu herói tem o Auro. No máximo uma vez por dia. Um feitor só com elixires nunca manda alerta.</li>
      </ul>
      <p>Você recebe no máximo dois alertas por dia. O horário de silêncio vai das 21:00 às 08:00, a menos que você mude: um alerta de mochila cheia espera ele acabar, e uma oferta que aparecer nesse horário é pulada. Antes de enviar, o jogo confere se o alerta ainda vale, então você nunca fica sabendo de uma mochila que já arrumou ou de uma oferta que já foi. Decisões, incursões, nocautes, subidas de nível e selos nunca mandam alertas.</p>
      <p>Escolha Permitir neste dispositivo nas Configurações e aceite o aviso do navegador. No iPhone e no iPad, primeiro adicione o app à Tela de Início (Compartilhar, depois Adicionar à Tela de Início) e abra por lá. Cada dispositivo que você permite aparece nas Configurações com um botão Remover; remover o último desliga os alertas.</p>
      <h2 id="troubleshooting">Solução de problemas</h2>
      <h3 id="not-on-your-screen">Seu herói não aparece na tela</h3>
      <ul>
        <li>Clicar em Salvar coloca o Wardenwatch na playlist do seu TRMNL. Seu dispositivo mostra a playlist um plugin por vez, na taxa de atualização dele, então o Wardenwatch aparece quando chega a vez dele. Com vários plugins e atualização lenta, isso pode demorar.</li>
        <li>Abra a playlist no TRMNL e confira se o Wardenwatch está lá, no dispositivo que você está olhando se tiver mais de um, e se nenhuma programação o esconde nesse horário.</li>
        <li>O modo de suspensão para a atualização da tela durante a noite. Seu herói continua se aventurando, e a tela se atualiza quando o dispositivo acorda.</li>
        <li>Uma tela que diz “A primeira aventura começa em até 15 minutos” está funcionando. A primeira história chega no próximo quarto de hora.</li>
        <li>A página Herói do app sempre mostra o que seu herói está fazendo, seja o que for que a tela mostre.</li>
      </ul>
      <h3 id="if-the-screen-looks-old">A tela parece antiga</h3>
      <ul>
        <li>“As atualizações estão atrasadas” quer dizer que o serviço do jogo está atrasado. O progresso do seu herói fica guardado, e a tela se atualiza quando o serviço alcançar.</li>
        <li>Se o site do app está em dia, mas a tela não, confira no TRMNL a taxa de atualização do plugin e a posição dele na playlist.</li>
        <li>As aventuras rodam a cada quarto de hora, na hora cheia e aos :15, :30 e :45 no fuso do seu TRMNL. A tela não mostra contagem regressiva; a hora ao lado de cada história é quando ela aconteceu, e o app mostra a próxima aventura.</li>
        <li>Se você desconectou ou desinstalou, instale de novo pelo TRMNL. Seu herói mantém todo o progresso.</li>
      </ul>
      <h2 id="disconnecting-and-removing">Desconectar e remover</h2>
      <p>
        Desconectar para as telas novas daquela instalação. O TRMNL pode continuar mostrando a última imagem até você tirar o plugin da playlist; não
        conseguimos apagar uma imagem que já está no seu dispositivo.
      </p>
      <h2 id="help">Ajuda</h2>
      <p>
        Escreva para <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> para ajuda com a conta ou a conexão. Tentamos responder em até dois dias úteis.
      </p>
    </>
  ),
}
