import type { Locale } from '@trmnl-games/platform'

/**
 * What the help routes' `head` functions read, apart from the pages themselves: a route's head stays in the main bundle,
 * so with the titles here the eight languages' pages only load with the page. Each language's page reads its own back.
 */
export interface HelpHead {
  readonly seoTitle: string
  readonly description: string
}

/** Desk Crawler help, by language. */
export const DESK_CRAWLER_HELP_HEAD: Readonly<Record<Locale, HelpHead>> = {
  en: { seoTitle: 'Desk Crawler help and setup', description: 'How to set up Desk Crawler on TRMNL and how each part of the game works, with fixes for a screen that looks out of date.' },
  fr: { seoTitle: 'Aide et installation de Desk Crawler', description: 'Comment installer Desk Crawler sur TRMNL et comment fonctionne chaque partie du jeu, avec des solutions quand l’écran semble en retard.' },
  de: { seoTitle: 'Desk Crawler: Hilfe und Einrichtung', description: 'Wie du Desk Crawler auf TRMNL einrichtest und wie jeder Teil des Spiels funktioniert, mit Lösungen, wenn der Bildschirm veraltet aussieht.' },
  es: { seoTitle: 'Ayuda e instalación de Desk Crawler', description: 'Cómo instalar Desk Crawler en TRMNL y cómo funciona cada parte del juego, con soluciones para cuando la pantalla parece desfasada.' },
  it: { seoTitle: 'Aiuto e installazione di Desk Crawler', description: 'Come installare Desk Crawler su TRMNL e come funziona ogni parte del gioco, con le soluzioni quando lo schermo sembra indietro.' },
  pt: { seoTitle: 'Ajuda e instalação do Desk Crawler', description: 'Como instalar o Desk Crawler no TRMNL e como funciona cada parte do jogo, com soluções para quando a tela parece desatualizada.' },
  pl: { seoTitle: 'Desk Crawler: pomoc i instalacja', description: 'Jak zainstalować Desk Crawler na TRMNL i jak działa każda część gry, z rozwiązaniami na wypadek, gdy ekran wydaje się nieaktualny.' },
  nl: { seoTitle: 'Desk Crawler: hulp en installatie', description: 'Hoe je Desk Crawler op TRMNL installeert en hoe elk onderdeel van het spel werkt, met oplossingen als het scherm achterloopt.' },
}

