import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { useGetLoginOptions } from '@/modules/auth/hooks/use-auth';
import { useAuthState } from '@/state/client-middleware';
import { ExtensionBanner, VibeWordmark } from '@/components/core';

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

  const wordmark = (
    <VibeWordmark
      tagline="Build your site, fast."
      className="text-[#f7f4ea] [&_*]:text-[#f7f4ea]"
    />
  );

  const heroCopy = (
    <section className="relative z-[1] max-w-xl">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2bd6c4]">
        Website builder
      </p>
      <h1 className="mt-2 text-4xl font-semibold leading-[1.05] tracking-tight text-[#f7f4ea] sm:text-5xl">
        Design it. Shape it. Publish it.
      </h1>
      <p className="mt-3 max-w-md text-sm leading-6 text-[#d8d3c4]/78 sm:text-base sm:leading-7">
        A calm studio for turning polished site ideas into live pages, backed by SELISE Blocks.
      </p>
      <div className="mt-5 flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#d8d3c4]/76">
        <span className="rounded-full border border-white/12 bg-[rgba(255,255,255,0.08)] px-3 py-1.5">
          Drafts
        </span>
        <span className="rounded-full border border-white/12 bg-[rgba(255,255,255,0.08)] px-3 py-1.5">
          Media
        </span>
        <span className="rounded-full border border-white/12 bg-[rgba(255,255,255,0.08)] px-3 py-1.5">
          Publish
        </span>
      </div>
    </section>
  );

  const authCardCaption = (
    <p className="mt-4 text-center text-[11px] leading-5 text-[#d8d3c4]/55 lg:mt-0">
      Secure identity, structured content, media storage, and publishing in one workspace.
    </p>
  );

  return (
    <div className="flex min-h-screen min-w-full w-full flex-col overflow-x-hidden bg-transparent text-[#f7f4ea]">
      <ExtensionBanner />
      <div className="flex w-full flex-1 flex-col justify-center py-10 sm:py-12 lg:py-16">
        {/* Mobile / tablet: logo above content */}
        <header className="mx-auto w-full max-w-[92rem] px-10 pb-6 pt-8 sm:px-14 sm:pb-8 sm:pt-10 lg:hidden">
          {wordmark}
        </header>

        <div className="mx-auto w-full max-w-[92rem] px-10 pb-10 pt-2 sm:px-14 sm:pt-4 lg:px-28 lg:pb-12 lg:pt-8 xl:px-32">
          {/* lg: left column (logo top, copy bottom) matches card height; card-only in this row */}
          <div className="flex flex-col gap-8 lg:flex-row lg:items-stretch lg:gap-6">
            <div className="hidden min-h-0 min-w-0 flex-1 flex-col justify-between lg:flex">
              {wordmark}
              {heroCopy}
            </div>

            <div className="relative z-[1] mx-auto w-full max-w-[27rem] shrink-0 lg:mx-0">
              <div className="relative isolate overflow-hidden rounded-[1.35rem] border border-white/20 bg-[#0c0f17] p-5 shadow-[0_18px_48px_-28px_rgba(0,0,0,0.75)] sm:p-6">
                <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />
                <div className="pointer-events-none absolute -right-16 -top-16 z-0 size-48 rounded-full bg-violet-500/15 opacity-40" />
                <div className="relative z-[1]">{renderAuthContent()}</div>
              </div>
              {/* Caption under card on small screens only */}
              <div className="lg:hidden">{authCardCaption}</div>
            </div>
          </div>

          {/* Caption aligned under card column on lg (left flex spacer matches grid) */}
          <div className="mt-0 hidden w-full gap-6 lg:mt-4 lg:flex">
            <div className="min-w-0 flex-1" aria-hidden />
            <div className="w-full max-w-[27rem] shrink-0">{authCardCaption}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
