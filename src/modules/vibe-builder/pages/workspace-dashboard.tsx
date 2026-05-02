import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRightIcon,
  Component1Icon,
  DotsHorizontalIcon,
  ExternalLinkIcon,
  FilePlusIcon,
  GlobeIcon,
  QuestionMarkCircledIcon,
  TrashIcon,
  UpdateIcon,
} from '@radix-ui/react-icons';
import { Button } from '@/components/ui-kit/button';
import { Card, CardContent } from '@/components/ui-kit/card';
import { Input } from '@/components/ui-kit/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui-kit/dropdown-menu';
import { useAuthStore } from '@/state/store/auth';
import { useDocumentTitle } from '@/hooks/use-document-title';
import {
  useCreateWebsite,
  useDeleteWebsite,
  useWebsitePages,
  useWebsites,
} from '../hooks/use-vibe-builder';
import { Website } from '../types';
import { starterTemplates } from '../templates';
import { OnboardingGuideDialog } from '../components/onboarding-guide-dialog';

const WORKSPACE_HERO = '/vibe-assets/workspace-hero.webp';
const GUIDE_SEEN_KEY = 'vibe-onboarding-guide-seen-v1';
const TEMPLATE_PREVIEWS: Record<string, string> = {
  blank: '/vibe-assets/template-blank.svg',
  landing: '/vibe-assets/template-landing.svg',
  portfolio: '/vibe-assets/template-portfolio.svg',
  pricing: '/vibe-assets/template-pricing.svg',
  local: '/vibe-assets/template-local.svg',
  event: '/vibe-assets/template-event.svg',
};

const useOwnerId = () => {
  const { user, selectedOrgId } = useAuthStore();
  return user?.itemId || user?.email || selectedOrgId || 'local-demo-user';
};

const SiteThumbnail = ({ website }: { website: Website }) => {
  const seed = website.id.slice(-6);
  const theme = website.theme;
  return (
    <div
      className="relative h-28 w-full overflow-hidden rounded-md border border-[rgba(247,244,234,0.12)] bg-muted"
      style={{
        background: `linear-gradient(135deg, ${theme?.backgroundColor ?? '#070A12'}, ${theme?.primaryColor ?? '#19D3B5'} 120%)`,
      }}
    >
      <img
        src={WORKSPACE_HERO}
        alt=""
        aria-hidden
        className="absolute inset-0 size-full object-cover opacity-35 mix-blend-screen"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.18),transparent_28%),linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:100%_100%,22px_22px,22px_22px]" />
      <div className="absolute inset-0 flex flex-col gap-2 p-3 opacity-95">
        <div className="h-2.5 w-1/2 rounded-full bg-[rgba(247,244,234,0.85)]" />
        <div className="h-2 w-3/4 rounded-full bg-[rgba(247,244,234,0.6)]" />
        <div className="h-2 w-2/5 rounded-full bg-[rgba(247,244,234,0.45)]" />
        <div className="mt-auto flex gap-1.5">
          <div className="h-7 w-12 rounded bg-[rgba(247,244,234,0.9)]" />
          <div className="h-7 w-12 rounded bg-[rgba(247,244,234,0.35)]" />
        </div>
      </div>
      <div
        className="absolute -bottom-6 -right-6 h-20 w-20 rounded-full"
        style={{ backgroundColor: theme?.accentColor ?? '#F97362', opacity: 0.42 }}
      />
      <span className="sr-only">Preview for site {seed}</span>
    </div>
  );
};

const TemplateTile = ({
  template,
  onClick,
}: {
  template: (typeof starterTemplates)[number];
  onClick: () => void;
}) => (
  <button
    type="button"
    className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-background text-left transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-pop"
    onClick={onClick}
  >
    <div className="relative aspect-[16/9] w-full overflow-hidden border-b border-border bg-muted">
      <img
        src={TEMPLATE_PREVIEWS[template.id] ?? TEMPLATE_PREVIEWS.blank}
        alt=""
        aria-hidden
        className="size-full object-cover transition duration-500 group-hover:scale-[1.035]"
        loading="lazy"
      />
      <span className="absolute left-3 top-3 inline-flex size-7 items-center justify-center rounded-md border border-[rgba(247,244,234,0.12)] bg-[#070A12]/90 text-primary">
        <FilePlusIcon className="size-3.5" />
      </span>
    </div>
    <div className="grid gap-1.5 p-4">
      <p className="font-medium text-foreground">{template.name}</p>
      <p className="text-xs leading-5 text-muted-foreground">
        {template.description}
      </p>
    </div>
  </button>
);

const StatusPill = ({ status }: { status: Website['status'] }) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${
      status === 'published'
        ? 'bg-success-background text-success-high-emphasis ring-success/30'
        : 'bg-muted text-muted-foreground ring-border'
    }`}
  >
    <span
      className={`size-1.5 rounded-full ${status === 'published' ? 'bg-success' : 'bg-muted-foreground/60'}`}
    />
    {status === 'published' ? 'Live' : 'Draft'}
  </span>
);

const WebsiteCard = ({
  website,
  ownerId,
}: {
  website: Website;
  ownerId: string;
}) => {
  const { data: pages = [] } = useWebsitePages(website.id);
  const firstPage = pages[0];
  const deleteWebsite = useDeleteWebsite(ownerId);

  const updated = new Date(website.updatedAt);
  const updatedLabel = updated.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });

  return (
    <Card className="group flex flex-col gap-4 overflow-hidden rounded-xl border-border bg-card p-4 transition hover:border-primary/40">
      <SiteThumbnail website={website} />
      <CardContent className="flex flex-col gap-4 p-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate font-display text-base font-semibold text-foreground">
              {website.name}
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              /{website.slug} · {pages.length} {pages.length === 1 ? 'page' : 'pages'} · {updatedLabel}
            </p>
          </div>
          <div className="flex flex-none items-center gap-2">
            <StatusPill status={website.status} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="More actions"
                  className="opacity-60 group-hover:opacity-100"
                >
                  <DotsHorizontalIcon className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link to={firstPage ? `/app/sites/${website.id}/pages/${firstPage.id}` : '/app'}>
                    Open editor
                  </Link>
                </DropdownMenuItem>
                {website.status === 'published' && (
                  <DropdownMenuItem asChild>
                    <Link to={`/site/${website.slug}`} target="_blank" rel="noreferrer">
                      <ExternalLinkIcon className="size-4" />
                      View live
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-error focus:text-error"
                  onClick={() => {
                    if (confirm(`Delete "${website.name}"? This cannot be undone.`)) {
                      deleteWebsite.mutate(website.id);
                    }
                  }}
                >
                  <TrashIcon className="size-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild className="flex-1" disabled={!firstPage}>
            <Link to={firstPage ? `/app/sites/${website.id}/pages/${firstPage.id}` : '/app'}>
              Open editor
              <ArrowRightIcon className="size-4" />
            </Link>
          </Button>
          {website.status === 'published' && firstPage && (
            <Button asChild variant="outline">
              <Link to={`/site/${website.slug}`} target="_blank" rel="noreferrer">
                <ExternalLinkIcon className="size-4" />
                Live
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const WorkspaceDashboard = () => {
  useDocumentTitle('Workspace');
  const ownerId = useOwnerId();
  const navigate = useNavigate();
  const [siteName, setSiteName] = useState('My new site');
  const [guideOpen, setGuideOpen] = useState(false);
  const { data: websites = [], isLoading } = useWebsites(ownerId);
  const createWebsite = useCreateWebsite(ownerId);

  useEffect(() => {
    try {
      if (!window.localStorage.getItem(GUIDE_SEEN_KEY)) {
        const timeout = window.setTimeout(() => setGuideOpen(true), 450);
        return () => window.clearTimeout(timeout);
      }
    } catch {
      /* ignore */
    }
    return undefined;
  }, []);

  const handleGuideOpenChange = (open: boolean) => {
    setGuideOpen(open);
    if (!open) {
      try {
        window.localStorage.setItem(GUIDE_SEEN_KEY, 'true');
      } catch {
        /* ignore */
      }
    }
  };

  const startFromTemplates = () => {
    handleGuideOpenChange(false);
    window.setTimeout(() => {
      document.getElementById('vibe-template-gallery')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 80);
  };

  const stats = useMemo(
    () => [
      { label: 'Sites', value: websites.length, icon: GlobeIcon },
      {
        label: 'Published',
        value: websites.filter((site) => site.status === 'published').length,
        icon: Component1Icon,
      },
    ],
    [websites]
  );

  const handleCreate = async (event: FormEvent<HTMLFormElement>, templateId?: string) => {
    event.preventDefault();
    const name = siteName.trim();
    if (!name) {
      return;
    }

    const template = templateId ? starterTemplates.find((t) => t.id === templateId) : undefined;
    const result = await createWebsite.mutateAsync({
      name,
      templateLayout: template?.build(),
    });
    navigate(`/app/sites/${result.website.id}/pages/${result.page.id}`);
  };

  const handleStarter = async (templateId: string) => {
    const template = starterTemplates.find((t) => t.id === templateId);
    if (!template) return;
    const fallbackName = template.id === 'blank' ? 'Untitled site' : `${template.name} site`;
    const name = siteName.trim() || fallbackName;
    const result = await createWebsite.mutateAsync({
      name,
      templateLayout: template.build(),
    });
    navigate(`/app/sites/${result.website.id}/pages/${result.page.id}`);
  };

  return (
    <div className="mx-auto w-full max-w-6xl">
      <section className="relative overflow-hidden rounded-2xl border border-[rgba(247,244,234,0.1)] bg-[#070A12] p-6 shadow-pop sm:p-10">
        <img
          src={WORKSPACE_HERO}
          alt=""
          aria-hidden
          className="absolute inset-0 size-full object-cover opacity-82"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,10,18,0.96)_0%,rgba(7,10,18,0.82)_42%,rgba(7,10,18,0.28)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(25,211,181,0.18),transparent_32%),radial-gradient(circle_at_82%_72%,rgba(249,115,98,0.16),transparent_28%)]" />
        <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_360px] lg:items-end">
          <div className="text-[#f7f4ea]">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[rgba(247,244,234,0.78)]">
              Vibe Workspace
            </p>
            <h1 className="mt-3 max-w-3xl font-display text-3xl font-semibold leading-tight tracking-tight text-[#f7f4ea] sm:text-5xl">
              Build your site, fast.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[rgba(247,244,234,0.82)]">
              Spin up a new site, drop in beautifully styled blocks, and publish a clean live
              route at <code className="font-mono text-[#f7f4ea]">/site/your-name</code>.
            </p>
          </div>
          <form
            className="rounded-xl border border-[rgba(247,244,234,0.12)] bg-[#0D1018] p-4 text-card-foreground shadow-[0_18px_50px_-30px_rgba(0,0,0,0.9)]"
            onSubmit={(e) => handleCreate(e)}
          >
            <label className="text-sm font-medium text-foreground" htmlFor="site-name">
              New site name
            </label>
            <div className="mt-2 flex gap-2">
              <Input
                id="site-name"
                value={siteName}
                onChange={(event) => setSiteName(event.target.value)}
              />
              <Button loading={createWebsite.isPending} type="submit">
                <FilePlusIcon className="size-4" />
                Create
              </Button>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Or start from a template below.
            </p>
          </form>
        </div>
        <button
          type="button"
          className="relative z-10 mt-5 inline-flex items-center gap-2 rounded-full border border-[rgba(247,244,234,0.12)] bg-[#070A12]/75 px-3 py-1.5 text-xs font-semibold text-[rgba(247,244,234,0.84)] transition hover:border-primary/40 hover:text-[#f7f4ea]"
          onClick={() => setGuideOpen(true)}
        >
          <QuestionMarkCircledIcon className="size-3.5 text-primary" />
          Guide me through Vibe
        </button>
      </section>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {stats.map((metric) => (
          <div
            key={metric.label}
            className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-pop"
          >
            <div className="flex size-11 items-center justify-center rounded-lg bg-primary-50 text-primary">
              <metric.icon className="size-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                {metric.label}
              </p>
              <p className="mt-1 font-display text-3xl font-semibold text-foreground">
                {metric.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      <section className="mt-8">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-semibold text-foreground">Your sites</h2>
            <p className="text-sm text-muted-foreground">
              Continue editing or open the live URL.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex h-48 items-center justify-center rounded-xl border border-border bg-card">
            <UpdateIcon className="size-6 animate-spin text-primary" />
          </div>
        ) : websites.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center sm:p-12">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary-50 text-primary">
              <Component1Icon className="size-6" />
            </div>
            <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
              Pick a starting point
            </h3>
            <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
              Either create a blank site or seed one from a template — you can edit anything.
            </p>
            <div
              id="vibe-template-gallery"
              className="mx-auto mt-6 grid max-w-5xl scroll-mt-24 gap-3 sm:grid-cols-2 lg:grid-cols-3"
            >
              {starterTemplates.map((template) => (
                <TemplateTile
                  key={template.id}
                  template={template}
                  onClick={() => handleStarter(template.id)}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {websites.map((website) => (
              <WebsiteCard key={website.id} website={website} ownerId={ownerId} />
            ))}
          </div>
        )}
      </section>

      {websites.length > 0 && (
        <section
          id="vibe-template-gallery"
          className="mt-10 scroll-mt-24 rounded-2xl border border-dashed border-border bg-card p-6 sm:p-8"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-display text-lg font-semibold text-foreground">
                Start another from a template
              </h3>
              <p className="text-sm text-muted-foreground">
                Each template is just JSON — you can rearrange every block.
              </p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={() => setGuideOpen(true)}>
              <QuestionMarkCircledIcon className="size-4" />
              Launch guide
            </Button>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {starterTemplates.map((template) => (
              <TemplateTile
                key={template.id}
                template={template}
                onClick={() => handleStarter(template.id)}
              />
            ))}
          </div>
        </section>
      )}

      <OnboardingGuideDialog
        open={guideOpen}
        onOpenChange={handleGuideOpenChange}
        onStart={startFromTemplates}
      />
    </div>
  );
};
