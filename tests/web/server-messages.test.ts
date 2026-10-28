import { expect, it } from 'vitest'
import { serverMessage } from '../../apps/web/src/i18n/serverMessages'

// The backend's shop refusals, as inventory.ts words them; each must find its row, or readers get the English.
const SHOP_REFUSALS = [
  'The Draught Case costs 40 Auro.',
  'A new name on the roll costs 200 Auro.',
  'That costs 15 Auro.',
  'Your case holds 10 draughts; 2 more would fit.',
]

it('translates the shop refusals the backend sends', () => {
  for (const english of SHOP_REFUSALS) {
    for (const locale of ['fr', 'de', 'es', 'it', 'pt', 'pl', 'nl'] as const) {
      const translated = serverMessage(english, locale)
      expect(translated, `${locale}: ${english}`).not.toBe(english)
      expect(translated, `${locale}: ${english}`).toMatch(/\d/)
    }
  }
})
