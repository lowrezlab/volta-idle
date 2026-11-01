import type { AuthConfig } from 'convex/server'

/**
 * Clerk issues Convex tokens from its "convex" JWT template (aud: convex).
 * Issuer: CLERK_FRONTEND_API_URL, or the older CLERK_JWT_ISSUER_DOMAIN (same
 * rule as lib/clerkIssuer.ts, kept inline because this file is read at deploy).
 */
export default {
  providers: [
    {
      domain: (process.env.CLERK_FRONTEND_API_URL || process.env.CLERK_JWT_ISSUER_DOMAIN)!,
      applicationID: 'convex',
    },
  ],
} satisfies AuthConfig
