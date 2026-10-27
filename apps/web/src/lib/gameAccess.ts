import { useAuth } from '@clerk/tanstack-react-start'
import { convexQuery } from '@convex-dev/react-query'
import { useQuery } from '@tanstack/react-query'
import { api } from '@trmnl-games/backend/api'
import { useConvexAuth } from 'convex/react'
import { useEffect, useRef, useState, type ReactNode } from 'react'

/** The games this viewer can see, with each one's lifecycle status (idle-angler.md "Architecture"). */
export const gamesQuery = convexQuery(api.platform.list, {})

/**
 * The games listing for rendering. After a page load the Convex socket runs queries signed out until Clerk hands it a
 * token, so an admin's listing would drop hidden games and then bring them back. This holds the first answer (the
 * server render's, signed in) until the socket's sign-in is confirmed, or Clerk has loaded and says signed out.
 */
export function useGames() {
  const { isAuthenticated } = useConvexAuth()
  const { isLoaded, isSignedIn } = useAuth()
  const { data } = useQuery(gamesQuery)
  const first = useRef(data)
  first.current ??= data
  return isAuthenticated || (isLoaded && !isSignedIn) ? data : first.current
}

/**
 * Renders a public page's game-listing section in the browser only. Asking for the listing during the server render
 * holds the page's first byte for a Convex round trip (about a second from the Worker), for sections that only a
 * listed game shows and nearly everyone never sees while it is hidden.
 */
export function AfterListing({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  return mounted ? children : null
}
