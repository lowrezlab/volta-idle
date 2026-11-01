import type { AuthConfig } from 'convex/server'
import { clerkIssuer } from './lib/clerkIssuer'

/** Clerk issues Convex tokens from its "convex" JWT template (aud: convex). */
export default {
  providers: [
    {
      domain: clerkIssuer()!,
      applicationID: 'convex',
    },
  ],
} satisfies AuthConfig
