export const publicRoutes = [
  '/login',
  '/signup',
  '/sso-signup',
  '/sent-email',
  '/activate',
  '/resetpassword',
  '/success',
  '/activate-failed',
  '/forgot-password',
  '/verify-mfa',
  '/sso/:provider/callback',
  '/oidc',
] as const;

/**
 * Paths that must be reachable without auth (marketing pages built in Vibe, auth screens, SSO).
 */
export function isPublicRoutePath(pathname: string): boolean {
  if (pathname.startsWith('/site/')) return true;
  if (pathname.startsWith('/sso/') && pathname.endsWith('/callback')) return true;
  for (const route of publicRoutes) {
    if (route.includes(':')) continue;
    if (pathname === route || pathname.startsWith(`${route}/`)) return true;
  }
  return false;
}
