import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { useGetLoginOptions } from '@/modules/auth/hooks/use-auth';
import { useAuthState } from '@/state/client-middleware';
import { ExtensionBanner, LanguageSelector, VibeWordmark } from '@/components/core';

const AUTH_SHOWCASE_IMAGE = '/vibe-assets/auth-showcase-clean.webp';

export const AuthLayout = () => {
  const { isLoading, error: loginOptionsError } = useGetLoginOptions();
  const navigate = useNavigate();
  const location = useLocation();
  const { isMounted, isAuthenticated } = useAuthState();

  useEffect(() => {
    if (isAuthenticated && location.pathname === '/login') {
      navigate('/');
    }
  }, [isAuthenticated, location.pathname, navigate]);

  if (!isMounted) return null;

  const is404Error = (error: any) => {
    return (
      error?.message?.includes('HTTP 404') ||
      error?.message?.includes('HTTP 403') ||
      error?.message?.includes('HTTP 406') ||
      error?.message?.includes('HTTP 424') ||
      error?.response?.status === 404 ||
      error?.response?.status === 403 ||
      error?.response?.status === 406 ||
      error?.response?.status === 424 ||
      error?.status === 404 ||
      error?.status === 403 ||
      error?.status === 406 ||
      error?.status === 424
    );
  };

  const is500Error = (error: any) => {
    const status = error?.response?.status || error?.status;
    if (status && status >= 500 && status < 600) {
      return true;
    }

    if (error?.message) {
      const httpMatch = error.message.match(/HTTP (\d{3})/);
      if (httpMatch) {
        const statusFromMessage = parseInt(httpMatch[1], 10);
        return statusFromMessage >= 500 && statusFromMessage < 600;
      }
    }

    return false;
  };

  const renderAuthContent = () => {
    if (is404Error(loginOptionsError)) {
      return (
        <div className="w-full max-w-xl mx-auto">
          <div className="relative overflow-hidden rounded-xl border border-error/30 bg-error-background p-8 shadow-pop">
            <div className="relative z-10">
              <div className="mb-4 flex justify-center">
                <div className="rounded-full bg-error/10 p-3">
                  <ExclamationTriangleIcon className="h-8 w-8 text-error" />
                </div>
              </div>
              <div className="text-center space-y-4">
                <h2 className="text-2xl font-bold text-error-high-emphasis tracking-tight">
                  Incorrect Project Key
                </h2>
                <div className="space-y-3 text-error-high-emphasis/90">
                  <p className="text-base leading-relaxed">
                    It seems your project is not set up in the Blocks Cloud.
                  </p>
                  <p className="text-sm leading-relaxed">
                    Please create a project at{' '}
                    <a
                      href="https://cloud.seliseblocks.com"
                      className="font-semibold underline underline-offset-2"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      cloud.seliseblocks.com
                    </a>
                    , then update your{' '}
                    <code className="inline-flex items-center px-2 py-1 rounded-md bg-error/10 text-error-high-emphasis font-mono text-xs border border-error/30">
                      .env
                    </code>{' '}
                    configuration accordingly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (is500Error(loginOptionsError)) {
      return (
        <div className="w-full max-w-xl mx-auto">
          <div className="relative overflow-hidden rounded-xl border border-warning/30 bg-warning-background p-8 shadow-pop">
            <div className="relative z-10">
              <div className="mb-4 flex justify-center">
                <div className="rounded-full bg-warning/10 p-3">
                  <ExclamationTriangleIcon className="h-8 w-8 text-warning" />
                </div>
              </div>
              <div className="text-center space-y-4">
                <h2 className="text-2xl font-bold text-warning-high-emphasis tracking-tight">
                  Services Temporarily Unavailable
                </h2>
                <div className="space-y-3 text-warning-high-emphasis/90">
                  <p className="text-base leading-relaxed">
                    The services are temporarily unavailable.
                  </p>
                  <p className="text-base leading-relaxed font-semibold">
                    Everything will be back to normal soon.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return <Outlet />;
  };

  if (isLoading) return null;

  return (
    <div className="min-h-screen w-full min-w-full overflow-x-hidden bg-[#070A12] text-[#f7f4ea]">
      <ExtensionBanner />
      <div className="relative min-h-screen w-full overflow-hidden">
        <img
          src={AUTH_SHOWCASE_IMAGE}
          alt=""
          aria-hidden
          className="absolute inset-0 size-full object-cover opacity-72"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,10,18,0.45)_0%,rgba(7,10,18,0.62)_48%,rgba(7,10,18,0.96)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,10,18,0.46)_0%,rgba(7,10,18,0.1)_44%,rgba(7,10,18,0.9)_100%)]" />

        <header className="relative z-10 mx-auto flex w-full max-w-[92rem] items-center justify-between px-8 py-6 sm:px-12 lg:px-16 xl:px-20">
          <VibeWordmark
            tagline="Build your site, fast."
            className="text-[#f7f4ea] [&_*]:text-[#f7f4ea]"
          />
          <div className="rounded-full border border-white/10 bg-[#0C0F17]/80 px-3 py-1.5">
            <LanguageSelector />
          </div>
        </header>

        <main className="relative z-10 mx-auto grid min-h-[calc(100vh-6rem)] w-full max-w-[92rem] items-center gap-10 px-8 pb-10 sm:px-12 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,27rem)] lg:px-16 xl:px-20">
          <section className="hidden max-w-xl self-end pb-10 lg:block">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2bd6c4]">
              Website builder
            </p>
            <h1 className="mt-4 text-5xl font-semibold leading-[1.02] tracking-tight text-[#f7f4ea] xl:text-6xl">
              Design it. Shape it. Publish it.
            </h1>
            <p className="mt-5 max-w-md text-base leading-7 text-[#d8d3c4]/78">
              A calm studio for turning polished site ideas into live pages, backed by SELISE Blocks.
            </p>
            <div className="mt-8 flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#d8d3c4]/76">
              <span className="rounded-full border border-white/10 bg-white/[0.055] px-3 py-1.5">
                Drafts
              </span>
              <span className="rounded-full border border-white/10 bg-white/[0.055] px-3 py-1.5">
                Media
              </span>
              <span className="rounded-full border border-white/10 bg-white/[0.055] px-3 py-1.5">
                Publish
              </span>
            </div>
          </section>

          <div className="mx-auto w-full max-w-[27rem] lg:mx-0 lg:justify-self-end">
            <div className="relative overflow-hidden rounded-[1.35rem] border border-white/10 bg-[#10131B] p-5 shadow-[0_24px_80px_-42px_rgba(0,0,0,0.95)] sm:p-6">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/16" />
              {renderAuthContent()}
            </div>
            <p className="mt-4 text-center text-[11px] leading-5 text-[#d8d3c4]/55">
              Secure identity, structured content, media storage, and publishing in one workspace.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};
