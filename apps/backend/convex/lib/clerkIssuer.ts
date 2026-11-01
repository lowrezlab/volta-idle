/**
 * Clerk Frontend API URL, which is the issuer of the "convex" JWT template.
 * Clerk's Convex integration names it CLERK_FRONTEND_API_URL; older deployments
 * set CLERK_JWT_ISSUER_DOMAIN. Either works, the new name wins.
 */
export function clerkIssuer(): string | undefined {
  return process.env.CLERK_FRONTEND_API_URL || process.env.CLERK_JWT_ISSUER_DOMAIN || undefined
}
