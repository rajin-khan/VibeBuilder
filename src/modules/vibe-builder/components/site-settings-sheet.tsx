import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GearIcon,
  GlobeIcon,
  ImageIcon,
  LayersIcon,
  MagnifyingGlassIcon,
  TokensIcon,
  TrashIcon,
} from '@radix-ui/react-icons';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui-kit/sheet';
import { Input } from '@/components/ui-kit/input';
import { Textarea } from '@/components/ui-kit/textarea';
import { Button } from '@/components/ui-kit/button';
import { ColorPopover } from './color-popover';
import { AssetPicker } from './asset-picker';
import { defaultWebsiteTheme, Website, WebsitePage, WebsiteTheme } from '../types';
import {
  useCreatePage,
  useDeletePage,
  useRenamePage,
  useUpdateWebsite,
} from '../hooks/use-vibe-builder';

type SettingsTab = 'general' | 'theme' | 'seo' | 'pages';

const tabMeta: { id: SettingsTab; label: string; icon: typeof GearIcon }[] = [
  { id: 'general', label: 'General', icon: GearIcon },
  { id: 'theme', label: 'Theme', icon: TokensIcon },
  { id: 'seo', label: 'SEO', icon: MagnifyingGlassIcon },
  { id: 'pages', label: 'Pages', icon: LayersIcon },
];

const FONT_OPTIONS = [
  { value: 'Inter', label: 'Inter (default body)' },
  { value: 'Geist', label: 'Geist (display)' },
  { value: 'Geist Mono', label: 'Geist Mono' },
  { value: 'system-ui', label: 'System UI' },
];

const RADIUS_OPTIONS: { value: WebsiteTheme['baseRadius']; label: string }[] = [
  { value: 'none', label: 'Sharp' },
  { value: 'sm', label: 'Small' },
  { value: 'md', label: 'Medium' },
  { value: 'lg', label: 'Large' },
  { value: 'xl', label: 'XL' },
  { value: 'pill', label: 'Pill' },
];

const BUTTON_OPTIONS: { value: WebsiteTheme['buttonStyle']; label: string }[] = [
  { value: 'sharp', label: 'Sharp' },
  { value: 'soft', label: 'Soft' },
  { value: 'pill', label: 'Pill' },
];

interface SiteSettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  website: Website;
  pages: WebsitePage[];
  ownerId: string;
}

const Section = ({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) => (
  <section className="space-y-3">
    <div>
      <h3 className="font-display text-sm font-semibold text-foreground">{title}</h3>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </div>
    {children}
  </section>
);

const Field = ({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) => (
  <label className="block space-y-1.5">
    <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
      {label}
    </span>
    {children}
    {hint && <span className="block text-[11px] text-muted-foreground">{hint}</span>}
  </label>
);

export const SiteSettingsSheet = ({
  open,
  onOpenChange,
  website,
  pages,
  ownerId,
}: SiteSettingsSheetProps) => {
  const navigate = useNavigate();
  const updateWebsite = useUpdateWebsite(ownerId);
  const renamePage = useRenamePage();
  const deletePage = useDeletePage(website.id);
  const createPage = useCreatePage(website);

  const [draft, setDraft] = useState<Website>(website);
  const [newPageName, setNewPageName] = useState('');
  const [tab, setTab] = useState<SettingsTab>('general');
  const [showAssetPicker, setShowAssetPicker] = useState<null | 'favicon' | 'og'>(null);

  useEffect(() => {
    setDraft(website);
  }, [website, open]);

  const theme = useMemo<WebsiteTheme>(
    () => ({ ...defaultWebsiteTheme, ...(draft.theme ?? {}) }),
    [draft.theme]
  );

  const updateDraft = (patch: Partial<Website>) =>
    setDraft((prev) => ({ ...prev, ...patch }));
  const updateTheme = (patch: Partial<WebsiteTheme>) =>
    updateDraft({ theme: { ...theme, ...patch } });
  const updateSeo = (patch: Partial<NonNullable<Website['seo']>>) =>
    updateDraft({ seo: { ...(draft.seo ?? {}), ...patch } });

  const handleSave = async () => {
    await updateWebsite.mutateAsync(draft);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full max-w-md p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border px-6 pb-4 pt-6">
          <SheetTitle className="font-display text-lg">Site settings</SheetTitle>
          <SheetDescription>
            Configure how <span className="font-medium text-foreground">{website.name}</span> looks
            and behaves on its public site.
          </SheetDescription>
        </SheetHeader>

        <div className="grid grid-cols-4 gap-1 border-b border-border bg-muted/30 px-3 py-2">
          {tabMeta.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`flex flex-col items-center gap-1 rounded-md px-2 py-2 text-[10px] font-semibold transition ${
                tab === id
                  ? 'bg-card text-primary shadow-pop ring-1 ring-primary/20'
                  : 'text-muted-foreground hover:bg-card/60 hover:text-foreground'
              }`}
            >
              <Icon className="size-3.5" />
              {label}
            </button>
          ))}
        </div>

        <div className="grid gap-5 overflow-auto p-6">
          {tab === 'general' && (
            <Section title="Site identity">
              <Field label="Site name">
                <Input
                  value={draft.name}
                  onChange={(event) => updateDraft({ name: event.target.value })}
                />
              </Field>
              <Field label="Slug" hint={`Public URL: /site/${draft.slug}`}>
                <Input
                  value={draft.slug}
                  onChange={(event) => updateDraft({ slug: event.target.value })}
                />
              </Field>
              <Field
                label="Home page"
                hint="Visited when someone hits /site/{slug} without a page."
              >
                <select
                  className="h-9 w-full rounded-lg border border-input bg-background px-2 text-sm shadow-sm"
                  value={draft.seo?.homePageId ?? pages[0]?.id ?? ''}
                  onChange={(event) =>
                    updateSeo({ homePageId: event.target.value || undefined })
                  }
                >
                  {pages.map((page) => (
                    <option key={page.id} value={page.id}>
                      {page.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Favicon">
                <div className="flex items-center gap-2">
                  {draft.seo?.faviconUrl && (
                    <img
                      src={draft.seo.faviconUrl}
                      alt="favicon"
                      className="size-8 rounded border border-border"
                    />
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAssetPicker('favicon')}
                  >
                    <ImageIcon className="size-4" />
                    {draft.seo?.faviconUrl ? 'Replace' : 'Upload'} favicon
                  </Button>
                  {draft.seo?.faviconUrl && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => updateSeo({ faviconUrl: undefined })}
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </Field>
            </Section>
          )}

          {tab === 'theme' && (
            <>
              <Section
                title="Brand"
                description="Per-site theme. Public pages render with these tokens."
              >
                <Field label="Primary color">
                  <ColorPopover
                    value={theme.primaryColor}
                    onChange={(value) => updateTheme({ primaryColor: value })}
                    onReset={() =>
                      updateTheme({ primaryColor: defaultWebsiteTheme.primaryColor })
                    }
                  />
                </Field>
                <Field label="Accent color">
                  <ColorPopover
                    value={theme.accentColor}
                    onChange={(value) => updateTheme({ accentColor: value })}
                    onReset={() =>
                      updateTheme({ accentColor: defaultWebsiteTheme.accentColor })
                    }
                  />
                </Field>
                <Field label="Background color">
                  <ColorPopover
                    value={theme.backgroundColor}
                    onChange={(value) => updateTheme({ backgroundColor: value })}
                    onReset={() =>
                      updateTheme({
                        backgroundColor: defaultWebsiteTheme.backgroundColor,
                      })
                    }
                  />
                </Field>
                <Field label="Text color">
                  <ColorPopover
                    value={theme.textColor}
                    onChange={(value) => updateTheme({ textColor: value })}
                    onReset={() =>
                      updateTheme({ textColor: defaultWebsiteTheme.textColor })
                    }
                  />
                </Field>
              </Section>

              <Section title="Typography">
                <Field label="Heading font">
                  <select
                    className="h-9 w-full rounded-lg border border-input bg-background px-2 text-sm shadow-sm"
                    value={theme.headingFont}
                    onChange={(event) => updateTheme({ headingFont: event.target.value })}
                  >
                    {FONT_OPTIONS.map((font) => (
                      <option key={font.value} value={font.value}>
                        {font.label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Body font">
                  <select
                    className="h-9 w-full rounded-lg border border-input bg-background px-2 text-sm shadow-sm"
                    value={theme.bodyFont}
                    onChange={(event) => updateTheme({ bodyFont: event.target.value })}
                  >
                    {FONT_OPTIONS.map((font) => (
                      <option key={font.value} value={font.value}>
                        {font.label}
                      </option>
                    ))}
                  </select>
                </Field>
              </Section>

              <Section title="Shape">
                <Field label="Base radius">
                  <div className="flex flex-wrap gap-1 rounded-lg border border-border bg-muted/40 p-0.5">
                    {RADIUS_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => updateTheme({ baseRadius: option.value })}
                        className={`flex-1 rounded-md px-2 py-1 text-[11px] font-semibold transition ${
                          theme.baseRadius === option.value
                            ? 'bg-card text-primary shadow-pop ring-1 ring-primary/20'
                            : 'text-muted-foreground hover:bg-card/60 hover:text-foreground'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </Field>
                <Field label="Button style">
                  <div className="flex flex-wrap gap-1 rounded-lg border border-border bg-muted/40 p-0.5">
                    {BUTTON_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => updateTheme({ buttonStyle: option.value })}
                        className={`flex-1 rounded-md px-2 py-1 text-[11px] font-semibold transition ${
                          theme.buttonStyle === option.value
                            ? 'bg-card text-primary shadow-pop ring-1 ring-primary/20'
                            : 'text-muted-foreground hover:bg-card/60 hover:text-foreground'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </Field>
              </Section>
            </>
          )}

          {tab === 'seo' && (
            <Section
              title="SEO & Social"
              description="What people see when they share or search this site."
            >
              <Field label="Title">
                <Input
                  value={draft.seo?.title ?? ''}
                  placeholder={draft.name}
                  onChange={(event) => updateSeo({ title: event.target.value })}
                />
              </Field>
              <Field label="Description">
                <Textarea
                  value={draft.seo?.description ?? ''}
                  placeholder="Describe what visitors will find here…"
                  onChange={(event) => updateSeo({ description: event.target.value })}
                />
              </Field>
              <Field label="OG image">
                <div className="flex items-center gap-2">
                  {draft.seo?.ogImage && (
                    <img
                      src={draft.seo.ogImage}
                      alt="OG"
                      className="h-12 w-20 rounded border border-border object-cover"
                    />
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAssetPicker('og')}
                  >
                    <ImageIcon className="size-4" />
                    {draft.seo?.ogImage ? 'Replace' : 'Upload'} image
                  </Button>
                  {draft.seo?.ogImage && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => updateSeo({ ogImage: undefined })}
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </Field>
              <Field
                label="Made with Vibe footer"
                hint="A small attribution link on published pages."
              >
                <div className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2">
                  <span className="text-sm text-foreground">
                    {draft.seo?.showVibeFooter === false ? 'Hidden' : 'Shown'}
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={draft.seo?.showVibeFooter !== false}
                    onClick={() =>
                      updateSeo({
                        showVibeFooter: draft.seo?.showVibeFooter === false ? true : false,
                      })
                    }
                    className={`relative h-6 w-11 rounded-full transition ${
                      draft.seo?.showVibeFooter !== false ? 'bg-primary' : 'bg-muted'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 size-5 rounded-full bg-background shadow transition ${
                        draft.seo?.showVibeFooter !== false ? 'left-5' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>
              </Field>
            </Section>
          )}

          {tab === 'pages' && (
            <Section
              title="Pages"
              description="Each page renders independently at /site/{slug}/{page-slug}. You can also add pages from the editor’s Page tab."
            >
              <Field label="Add page" hint="Creates a blank page and opens it in the editor.">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <Input
                    value={newPageName}
                    onChange={(event) => setNewPageName(event.target.value)}
                    placeholder="e.g. Pricing, About, Contact"
                    className="h-9 sm:flex-1"
                    onKeyDown={async (event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        const name = newPageName.trim();
                        if (!name || createPage.isPending) return;
                        try {
                          const page = await createPage.mutateAsync(name);
                          setNewPageName('');
                          onOpenChange(false);
                          navigate(`/app/sites/${website.id}/pages/${page.id}`);
                        } catch {
                          /* mutation surfaces via React Query */
                        }
                      }
                    }}
                  />
                  <Button
                    type="button"
                    size="sm"
                    className="shrink-0"
                    loading={createPage.isPending}
                    disabled={!newPageName.trim()}
                    onClick={async () => {
                      const name = newPageName.trim();
                      if (!name) return;
                      try {
                        const page = await createPage.mutateAsync(name);
                        setNewPageName('');
                        onOpenChange(false);
                        navigate(`/app/sites/${website.id}/pages/${page.id}`);
                      } catch {
                        /* mutation surfaces via React Query */
                      }
                    }}
                  >
                    Add & edit
                  </Button>
                </div>
              </Field>
              <ul className="grid gap-2">
                {pages.map((page) => (
                  <li
                    key={page.id}
                    className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2"
                  >
                    <GlobeIcon className="size-4 text-muted-foreground" />
                    <Input
                      defaultValue={page.name}
                      onBlur={(event) => {
                        const value = event.target.value.trim();
                        if (value && value !== page.name) {
                          renamePage.mutate({ page, name: value });
                        }
                      }}
                      className="h-8"
                    />
                    <Link
                      to={`/app/sites/${website.id}/pages/${page.id}`}
                      className="text-xs font-medium text-primary hover:underline"
                      onClick={() => {
                        onOpenChange(false);
                        navigate(`/app/sites/${website.id}/pages/${page.id}`);
                      }}
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      aria-label={`Delete ${page.name}`}
                      disabled={pages.length <= 1}
                      className="grid size-7 place-items-center rounded text-error hover:bg-error/10 disabled:opacity-30"
                      onClick={() => {
                        if (pages.length > 1 && confirm(`Delete "${page.name}"?`)) {
                          deletePage.mutate(page.id);
                        }
                      }}
                    >
                      <TrashIcon className="size-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            </Section>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border px-6 py-4">
          <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            loading={updateWebsite.isPending}
            onClick={handleSave}
          >
            Save changes
          </Button>
        </div>

        {showAssetPicker && (
          <AssetPicker
            open
            onOpenChange={(value) => !value && setShowAssetPicker(null)}
            websiteId={website.id}
            ownerId={ownerId}
            onSelect={(url) => {
              if (showAssetPicker === 'favicon') updateSeo({ faviconUrl: url });
              if (showAssetPicker === 'og') updateSeo({ ogImage: url });
              setShowAssetPicker(null);
            }}
          />
        )}
      </SheetContent>
    </Sheet>
  );
};
