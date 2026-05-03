import { useLocation } from 'react-router-dom';
import { DynamicWaveCanvas } from '@/components/ui/dynamic-wave-canvas-background';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import { cn } from '@/lib/utils';

/** Pathnames that use AuthLayout — keep in sync with `auth.route.tsx`. */
const AUTH_EXACT = new Set([
  '/login',
  '/signup',
  '/oidc',
  '/sso-signup',
  '/sent-email',
  '/activate',
  '/resetpassword',
  '/success',
  '/activate-failed',
  '/forgot-password',
  '/verify-mfa',
]);

function isAuthPathname(pathname: string): boolean {
  if (AUTH_EXACT.has(pathname)) return true;
  if (pathname.startsWith('/sso/') && pathname.endsWith('/callback')) return true;
  return false;
}

export type StudioAtmosphereMode = 'auth' | 'studio' | 'off';

export function resolveStudioAtmosphereMode(pathname: string): StudioAtmosphereMode {
  if (isAuthPathname(pathname)) return 'auth';
  if (pathname === '/dashboard' || pathname === '/app') return 'studio';
  return 'off';
}

const AUTH_SHOWCASE_IMAGE = '/vibe-assets/auth-showcase-clean.webp';

/** Same gradient stack behind the wave for auth + workspace (/app, /dashboard). */
function AtmosphereGradientField({ className }: { className?: string }) {
  return (
    <div className={cn('absolute inset-0', className)}>
      <div
        className={cn(
          'absolute inset-0',
          'bg-[radial-gradient(ellipse_120%_80%_at_20%_-10%,rgba(124,58,237,0.38),transparent_55%)]'
        )}
      />
      <div
        className={cn(
          'absolute inset-0',
          'bg-[radial-gradient(ellipse_80%_60%_at_100%_100%,rgba(45,212,191,0.16),transparent_45%)]'
        )}
      />
      <div
        className={cn(
          'absolute inset-0',
          'bg-[linear-gradient(90deg,rgba(7,10,18,0.22)_0%,rgba(7,10,18,0.38)_48%,rgba(7,10,18,0.58)_100%)]'
        )}
      />
      <div
        className={cn(
          'absolute inset-0',
          'bg-[linear-gradient(180deg,rgba(7,10,18,0.28)_0%,rgba(7,10,18,0.06)_42%,rgba(7,10,18,0.65)_100%)]'
        )}
      />
    </div>
  );
}

/**
 * Fixed viewport atmosphere. Auth and workspace share the same wave + gradients; auth adds the
 * showcase image on top.
 */
export function GlobalStudioAtmosphere() {
  const { pathname } = useLocation();
  const prefersReducedMotion = usePrefersReducedMotion();
  const mode = resolveStudioAtmosphereMode(pathname);

  if (mode === 'off') {
    return null;
  }

  const isAuth = mode === 'auth';

  return (
    <div
      className={cn('pointer-events-none fixed inset-0 z-0 select-none', 'bg-[#070A12]')}
      aria-hidden
      data-atmosphere-mode={mode}
    >
      {!prefersReducedMotion && (
        <DynamicWaveCanvas
          intensity={0.95}
          resolutionScale={2}
          waveIterations={4}
          className={cn('opacity-[0.7]', 'saturate-110')}
        />
      )}
      {isAuth && (
        <img
          src={AUTH_SHOWCASE_IMAGE}
          alt=""
          aria-hidden
          className="absolute inset-0 size-full object-cover mix-blend-screen opacity-[0.62]"
          fetchPriority="low"
        />
      )}
      <AtmosphereGradientField />
    </div>
  );
}
