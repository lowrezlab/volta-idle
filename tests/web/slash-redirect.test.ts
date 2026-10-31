import { describe, expect, it } from 'vitest'
import { permanentSlashRedirect } from '../../apps/web/src/server/slashRedirect'

const redirect = (location: string, status = 307) => new Response(null, { status, headers: { Location: location } })

describe('trailing-slash redirects', () => {
  it.each([
    ['/help/wardenwatch/', '/help/wardenwatch'],
    ['/games/wardenwatch/', 'https://wardens.watch/games/wardenwatch'],
    ['/privacy/?ref=x', '/privacy?ref=x'],
  ])('makes the slash-stripping redirect from %s permanent', (path, location) => {
    const response = permanentSlashRedirect(new Request('https://wardens.watch' + path), redirect(location))
    expect(response.status).toBe(308)
    expect(response.headers.get('Location')).toBe(location)
  })
  it('leaves every other redirect and response alone', () => {
    const cases: Array<[string, Response]> = [
      ['/help/wardenwatch/', redirect('/support')],
      ['/connect/trmnl/wardenwatch/install/?code=secret', redirect('/connect/trmnl/wardenwatch/install')],
      ['/app/', redirect('/app', 302)],
      ['/help/wardenwatch', redirect('/help/wardenwatch')],
      ['/', redirect('/')],
      ['/help/wardenwatch/', redirect('https://evil.example/help/wardenwatch')],
      ['/help/wardenwatch/', new Response('page')],
    ]
    for (const [path, original] of cases) expect(permanentSlashRedirect(new Request('https://wardens.watch' + path), original)).toBe(original)
  })
})
