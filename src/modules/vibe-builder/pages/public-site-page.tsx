import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { UpdateIcon } from '@radix-ui/react-icons';
import { Button } from '@/components/ui-kit/button';
import { useDocumentTitle } from '@/hooks/use-document-title';
import { useHeadTags } from '@/hooks/use-head-tags';
import { VibeMark } from '@/components/core/vibe-brand/vibe-brand';
import { VibeBlockRenderer } from '../components/component-registry';
import { usePublicPage } from '../hooks/use-vibe-builder';
import { themeToStyle } from '../utils/theme-injection';

export const PublicSitePage = () => {
  const { siteSlug = '', pageSlug } = useParams();
  const { data, isLoading } = usePublicPage(siteSlug, pageSlug ?? '');

  const website = data?.website;
  const pages = data?.pages ?? [];
  const page = data?.page;

  const titleParts = [
    page?.name,
    website?.seo?.title || website?.name,
  ].filter(Boolean) as string[];

  useDocumentTitle(titleParts.length ? titleParts.join(' — ') : null);

  useHeadTags({
    title: titleParts.join(' — '),
    description: website?.seo?.description,
    ogTitle: titleParts.join(' — '),
    ogDescription: website?.seo?.description,
    ogImage: website?.seo?.ogImage,
    ogUrl:
      typeof window !== 'undefined'
        ? `${window.location.origin}/site/${siteSlug}${pageSlug ? `/${pageSlug}` : ''}`
        : undefined,
    twitterCard: 'summary_large_image',
    twitterImage: website?.seo?.ogImage,
    faviconUrl: website?.seo?.faviconUrl,
    canonicalUrl:
      typeof window !== 'undefined'
        ? `${window.location.origin}/site/${siteSlug}${pageSlug ? `/${pageSlug}` : ''}`
        : undefined,
  });

  const themeStyle = useMemo(() => themeToStyle(website?.theme), [website?.theme]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <UpdateIcon className="size-7 animate-spin text-primary" />
      </div>
    );
  }

  if (!website || !page || !page.publishedLayout) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-muted px-6 text-center">
        <h1 className="font-display text-3xl font-semibold text-foreground">
          This page is not published yet.
        </h1>
        <p className="mt-3 max-w-md text-muted-foreground">
          Publish from the editor to make the live website available at this route.
        </p>
        <Button asChild className="mt-6">
          <Link to="/app">Back to Vibe</Link>
        </Button>
      </div>
    );
  }

  const navPages = pages.filter((item) => item.publishedLayout);
  const showVibeFooter = website.seo?.showVibeFooter !== false;

  return (
    <div
      className="min-h-screen"
      style={themeStyle}
      data-vibe-public-site={website.slug}
    >
      <header
        className="sticky top-0 z-30 border-b border-black/5"
        style={{ backgroundColor: 'color-mix(in srgb, var(--vibe-bg) 94%, transparent)' }}
      >
        <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-3">
          <Link
            className="flex items-center gap-2 font-semibold tracking-tight"
            style={{
              fontFamily: 'var(--vibe-heading)',
              color: 'var(--vibe-fg)',
            }}
            to={`/site/${website.slug}`}
          >
            <span
              className="grid size-8 place-items-center rounded-md font-bold text-[#f7f4ea]"
              style={{ backgroundColor: 'var(--vibe-primary)' }}
            >
              {website.name.charAt(0).toUpperCase()}
            </span>
            {website.name}
          </Link>
          <div className="flex flex-wrap items-center gap-1">
            {navPages.map((item) => {
              const active = item.id === page.id;
              return (
                <Link
                  key={item.id}
                  className="rounded-md px-3 py-1.5 text-sm font-medium transition"
                  style={{
                    color: active ? 'var(--vibe-bg)' : 'var(--vibe-fg)',
                    backgroundColor: active ? 'var(--vibe-primary)' : 'transparent',
                    opacity: active ? 1 : 0.85,
                  }}
                  to={`/site/${website.slug}/${item.slug}`}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>
      </header>

      <main>
        {page.publishedLayout.blocks.map((block) => (
          <VibeBlockRenderer key={block.id} block={block} />
        ))}
      </main>

      {showVibeFooter && (
        <footer
          className="mx-auto max-w-6xl border-t border-black/5 px-6 py-6 text-xs"
          style={{ color: 'color-mix(in srgb, var(--vibe-fg) 65%, transparent)' }}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span>
              © {new Date().getFullYear()} {website.name}
            </span>
            <a
              href="/"
              className="inline-flex items-center gap-1.5 font-semibold transition hover:opacity-100"
              style={{ opacity: 0.85 }}
            >
              <span>Made with</span>
              <VibeMark className="size-4" />
              <span>Vibe</span>
            </a>
          </div>
        </footer>
      )}
    </div>
  );
};
