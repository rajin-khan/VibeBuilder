import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArchiveIcon,
  ChevronDownIcon,
  Component1Icon,
  CounterClockwiseClockIcon,
  DesktopIcon,
  ExternalLinkIcon,
  FilePlusIcon,
  FileTextIcon,
  GearIcon,
  GlobeIcon,
  LayersIcon,
  MinusIcon,
  MobileIcon,
  PaperPlaneIcon,
  Pencil2Icon,
  PlusIcon,
  ReaderIcon,
  TrashIcon,
  UpdateIcon,
} from '@radix-ui/react-icons';
import { Button } from '@/components/ui-kit/button';
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
import { useToast } from '@/hooks/use-toast';
import { BuilderCanvas } from '../components/builder-canvas';
import { BuilderDragPreview } from '../components/builder-drag-preview';
import { BuilderPalette } from '../components/builder-palette';
import { PropertiesInspector } from '../components/properties-inspector';
import { CommandPalette } from '../components/command-palette';
import { SiteSettingsSheet } from '../components/site-settings-sheet';
import { AssetPicker } from '../components/asset-picker';
import { LayersPanel } from '../components/layers-panel';
import { componentRegistry } from '../components/component-registry';
import { VibeMark } from '@/components/core/vibe-brand/vibe-brand';
import { ProfileMenu } from '@/components/core';
import {
  useCreatePage,
  useDeletePage,
  usePublishPage,
  useRenamePage,
  useSaveDraftLayout,
  useUploadAsset,
  useWebsitePages,
  useWebsites,
} from '../hooks/use-vibe-builder';
import { useBuilderStore } from '../store/use-builder-store';
import { VibeBlockType } from '../types';
import {
  findBlockById,
  findBlockParent,
  isContainerBlock,
  layoutsDeepEqual,
} from '../utils/block-tree';

const useOwnerId = () => {
  const { user, selectedOrgId } = useAuthStore();
  return user?.itemId || user?.email || selectedOrgId || 'local-demo-user';
};

type PreviewMode = 'desktop' | 'tablet' | 'mobile';
type CommandMode = 'all' | 'insert-only';
type StudioTab = 'insert' | 'edit' | 'page' | 'site';

const STYLE_COPY_KEYS = [
  'background',
  'backgroundImage',
  'backgroundOverlay',
  'backgroundOverlayOpacity',
  'accent',
  'align',
  'paddingTop',
  'paddingBottom',
  'paddingX',
  'maxWidth',
  'borderRadius',
  'shadow',
  'animation',
  'marginTop',
  'marginBottom',
  'heroLayout',
  'layout',
  'style',
  'cardStyle',
  'iconStyle',
] as const;

const PUBLISH_DOT: Record<'draft' | 'changes' | 'live', string> = {
  draft: 'bg-muted-foreground/40',
  changes: 'bg-warning',
  live: 'bg-success',
};

const layoutsMatch = layoutsDeepEqual;

const STUDIO_WIDTH_LS = 'vibe-studio-width-v1';
const LAYERS_POS_LS = 'vibe-layers-panel-position-v2';
const LAYERS_POS_LEGACY = 'vibe-layers-panel-position-v1';
const STUDIO_W_MIN = 240;
const STUDIO_W_MAX = 420;
const STUDIO_W_DEFAULT = 284;

const clampStudioW = (n: number) =>
  Math.min(STUDIO_W_MAX, Math.max(STUDIO_W_MIN, Math.round(n)));

const readStudioW = () => {
  if (typeof window === 'undefined') return STUDIO_W_DEFAULT;
  try {
    const v = Number(localStorage.getItem(STUDIO_WIDTH_LS));
    if (!Number.isNaN(v) && v > 0) return clampStudioW(v);
  } catch {
    /* ignore */
  }
  return STUDIO_W_DEFAULT;
};

const getDefaultLayersPosition = () => {
  const pad = 8;
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1024;
  const estW = Math.min(368, vw - pad * 2);
  return clampLayersToViewport(vw - estW - pad, pad);
};

const nearLegacyLayersAnchor = (left: number, top: number) =>
  left >= STUDIO_W_DEFAULT + 4 &&
  left <= STUDIO_W_DEFAULT + 160 &&
  top >= 44 &&
  top <= 96;

const readLayersPos = () => {
  if (typeof window === 'undefined') return { left: 0, top: 0 };
  try {
    const v2 = localStorage.getItem(LAYERS_POS_LS);
    if (v2) {
      const p = JSON.parse(v2) as { left?: unknown; top?: unknown };
      const def = getDefaultLayersPosition();
      return clampLayersToViewport(
        typeof p.left === 'number' ? p.left : def.left,
        typeof p.top === 'number' ? p.top : def.top
      );
    }
    const legacy = localStorage.getItem(LAYERS_POS_LEGACY);
    if (legacy) {
      const p = JSON.parse(legacy) as { left?: unknown; top?: unknown };
      const left = typeof p.left === 'number' ? p.left : 0;
      const top = typeof p.top === 'number' ? p.top : 0;
      if (nearLegacyLayersAnchor(left, top)) {
        const next = getDefaultLayersPosition();
        try {
          localStorage.setItem(LAYERS_POS_LS, JSON.stringify(next));
        } catch {
          /* ignore */
        }
        return next;
      }
      const next = clampLayersToViewport(left, top);
      try {
        localStorage.setItem(LAYERS_POS_LS, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    }
  } catch {
    /* ignore */
  }
  return getDefaultLayersPosition();
};

const clampLayersToViewport = (left: number, top: number) => {
  const pad = 8;
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1024;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 768;
  const estW = Math.min(368, vw - pad * 2);
  const estH = Math.min(420, vh - pad * 2);
  return {
    left: Math.min(Math.max(pad, left), Math.max(pad, vw - estW - pad)),
    top: Math.min(Math.max(pad, top), Math.max(pad, vh - estH - pad)),
  };
};

export const EditorPage = () => {
  const { siteId = '', pageId = '' } = useParams();
  const ownerId = useOwnerId();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [newPageName, setNewPageName] = useState('Services');
  const [pageName, setPageName] = useState('');
  const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop');
  const [zoom, setZoom] = useState(1);
  const [commandOpen, setCommandOpen] = useState(false);
  const [commandMode, setCommandMode] = useState<CommandMode>('all');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [assetPicker, setAssetPicker] = useState<
    | null
    | { kind: 'field'; propKey: string }
    | { kind: 'listBulk'; listKey: string; imageKey: string; seed: Record<string, unknown> }
  >(null);
  const [layersOpen, setLayersOpen] = useState(true);
  const [studioTab, setStudioTab] = useState<StudioTab>('insert');
  const [copiedStyle, setCopiedStyle] = useState<Record<string, unknown> | null>(null);
  const [studioWidth, setStudioWidth] = useState(readStudioW);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [layersPosition, setLayersPosition] = useState(() => readLayersPos());

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const { data: websites = [], isLoading: loadingWebsites } = useWebsites(ownerId);
  const website = websites.find((item) => item.id === siteId);
  const { data: pages = [], isLoading: loadingPages } = useWebsitePages(siteId);
  const page = pages.find((item) => item.id === pageId);

  const createPage = useCreatePage(website);
  const deletePage = useDeletePage(siteId);
  const renamePage = useRenamePage();
  const saveDraft = useSaveDraftLayout();
  const publishPage = usePublishPage();
  const uploadAsset = useUploadAsset();

  const {
    layout,
    selectedBlockId,
    dirty,
    past,
    future,
    setLayout,
    addBlock,
    duplicateBlock,
    selectBlock,
    updateBlockProps,
    removeBlock,
    reorderBlocks,
    moveBlock,
    undo,
    redo,
    markClean,
  } = useBuilderStore();

  const selectedBlock = useMemo(
    () => (selectedBlockId ? findBlockById(layout.blocks, selectedBlockId) : null),
    [layout.blocks, selectedBlockId]
  );
  const publishedMatchesDraft = useMemo(
    () => Boolean(page?.publishedLayout && layoutsMatch(page.publishedLayout, layout)),
    [layout, page?.publishedLayout]
  );

  useEffect(() => {
    if (selectedBlockId) {
      setStudioTab('edit');
    }
  }, [selectedBlockId]);

  const titleParts = [page?.name, website?.name].filter(Boolean) as string[];
  useDocumentTitle(titleParts.length ? titleParts.join(' — ') : 'Editor');

  const loadedPageIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (page && loadedPageIdRef.current !== page.id) {
      loadedPageIdRef.current = page.id;
      setLayout(page.draftLayout);
      setPageName(page.name);
    }
  }, [page, setLayout]);

  useEffect(() => {
    if (!dirty || !page) {
      return undefined;
    }

    const timeout = window.setTimeout(async () => {
      await saveDraft.mutateAsync({ page, layout });
      markClean();
    }, 900);

    return () => window.clearTimeout(timeout);
  }, [dirty, layout, markClean, page, saveDraft]);

  const resetLayersFloat = useCallback(() => {
    setLayersPosition(getDefaultLayersPosition());
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STUDIO_WIDTH_LS, String(studioWidth));
    } catch {
      /* ignore */
    }
  }, [studioWidth]);

  useEffect(() => {
    if (!layersOpen) {
      return;
    }
    try {
      localStorage.setItem(LAYERS_POS_LS, JSON.stringify(layersPosition));
    } catch {
      /* ignore */
    }
  }, [layersOpen, layersPosition]);

  useEffect(() => {
    const onResize = () =>
      setLayersPosition((p) => clampLayersToViewport(p.left, p.top));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const openCommand = useCallback((mode: CommandMode = 'all') => {
    setCommandMode(mode);
    setCommandOpen(true);
  }, []);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      const editable = tag === 'input' || tag === 'textarea' || target?.isContentEditable;

      const isMod = event.metaKey || event.ctrlKey;

      if (isMod && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        openCommand('all');
        return;
      }

      if (event.key === '/' && !editable) {
        event.preventDefault();
        openCommand('insert-only');
        return;
      }

      if (isMod && event.key.toLowerCase() === 'z') {
        if (editable) return;
        event.preventDefault();
        if (event.shiftKey) {
          redo();
        } else {
          undo();
        }
        return;
      }

      if (isMod && event.key.toLowerCase() === 'y' && !event.shiftKey) {
        if (editable) return;
        event.preventDefault();
        redo();
        return;
      }

      if (isMod && event.key.toLowerCase() === 'd') {
        if (editable || !selectedBlockId) return;
        event.preventDefault();
        duplicateBlock(selectedBlockId);
        return;
      }

      if ((event.key === 'Delete' || event.key === 'Backspace') && selectedBlockId && !editable) {
        event.preventDefault();
        removeBlock(selectedBlockId);
        return;
      }

      if (event.key === 'Escape') {
        selectBlock(null);
        setLayersOpen(false);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [duplicateBlock, openCommand, redo, removeBlock, selectBlock, selectedBlockId, undo]);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over) return;

      const stripLayers = (id: string) => (id.startsWith('layers:') ? id.slice(7) : id);

      if (active.data.current?.source === 'palette') {
        const type = active.data.current.type as VibeBlockType;
        const overRaw = String(over.id);
        const overId = stripLayers(overRaw);

        if (overRaw === 'builder-canvas') {
          addBlock(type, { parentId: 'root' });
          return;
        }

        const overBlock = findBlockById(layout.blocks, overId);
        if (overBlock && isContainerBlock(overBlock.type)) {
          addBlock(type, {
            parentId: overBlock.id,
            index: overBlock.children?.length ?? 0,
          });
          return;
        }

        const info = findBlockParent(layout.blocks, overId);
        if (info) {
          const parentId = info.parent.kind === 'root' ? 'root' : info.parent.block.id;
          addBlock(type, { parentId, index: info.index });
          return;
        }

        addBlock(type, { parentId: 'root' });
        return;
      }

      const rawActive = String(active.id);
      const rawOver = String(over.id);
      const activeId = stripLayers(rawActive);
      const overId = stripLayers(rawOver);

      if (
        active.data.current?.source === 'canvas' ||
        active.data.current?.source === 'navigator'
      ) {
        if (activeId !== overId) {
          reorderBlocks(activeId, overId);
        }
      }
    },
    [layout.blocks, addBlock, reorderBlocks]
  );

  const handleCreatePage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = newPageName.trim();
    if (!website || !name) {
      return;
    }
    const createdPage = await createPage.mutateAsync(name);
    navigate(`/app/sites/${website.id}/pages/${createdPage.id}`);
  };

  const handleRenamePage = async () => {
    const name = pageName.trim();
    if (!page || !name || name === page.name) return;
    await renamePage.mutateAsync({ page, name });
  };

  const handleDeletePage = async () => {
    if (!page || pages.length <= 1) return;
    await deletePage.mutateAsync(page.id);
    const nextPage = pages.find((item) => item.id !== page.id);
    if (nextPage) {
      navigate(`/app/sites/${siteId}/pages/${nextPage.id}`);
    }
  };

  const handlePublish = async () => {
    if (!website || !page) return;
    if (dirty) {
      await saveDraft.mutateAsync({ page, layout });
      markClean();
    }
    await publishPage.mutateAsync({ website, page: { ...page, draftLayout: layout } });
    toast({
      title: 'Published',
      description: `${page.name} is now live at /site/${website.slug}/${page.slug}`,
    });
  };

  const handleCopyStyle = useCallback(
    (blockId: string) => {
      const source = findBlockById(layout.blocks, blockId);
      if (!source) return;
      const style = STYLE_COPY_KEYS.reduce<Record<string, unknown>>((acc, key) => {
        if (source.props[key] !== undefined) {
          acc[key] = source.props[key];
        }
        return acc;
      }, {});
      setCopiedStyle(style);
      toast({ title: 'Style copied' });
    },
    [layout.blocks, toast]
  );

  const handlePasteStyle = useCallback(
    (blockId: string) => {
      if (!copiedStyle) return;
      updateBlockProps(blockId, copiedStyle);
      toast({ title: 'Style pasted' });
    },
    [copiedStyle, toast, updateBlockProps]
  );

  const handleResetStyle = useCallback(
    (blockId: string) => {
      const block = findBlockById(layout.blocks, blockId);
      if (!block) return;
      const defaults = componentRegistry[block.type]?.defaultProps ?? {};
      const reset = STYLE_COPY_KEYS.reduce<Record<string, unknown>>((acc, key) => {
        if (defaults[key] !== undefined) {
          acc[key] = defaults[key];
        }
        return acc;
      }, {});
      updateBlockProps(blockId, reset);
      toast({ title: 'Style reset' });
    },
    [layout.blocks, toast, updateBlockProps]
  );

  const handleToggleHidden = useCallback(
    (blockId: string, hidden: boolean) => {
      updateBlockProps(blockId, {
        hideOnDesktop: hidden,
        hideOnTablet: hidden,
        hideOnMobile: hidden,
      });
    },
    [updateBlockProps]
  );

  const applyDeepProp = (blockId: string, propKey: string, value: string) => {
    if (!selectedBlock || selectedBlock.id !== blockId) return;
    const segments = propKey.split('.');
    if (segments.length === 1) {
      updateBlockProps(blockId, { [propKey]: value });
      return;
    }
    const [rootKey, indexRaw, subKey] = segments;
    const index = Number(indexRaw);
    const list = Array.isArray(selectedBlock.props[rootKey])
      ? (selectedBlock.props[rootKey] as Record<string, unknown>[])
      : [];
    const next = list.map((item, i) => (i === index ? { ...item, [subKey]: value } : item));
    updateBlockProps(blockId, { [rootKey]: next });
  };

  const handleUploadImage = async (file: File, propKey: string) => {
    if (!selectedBlock || !website) return;

    try {
      const asset = await uploadAsset.mutateAsync({ file, websiteId: website.id, ownerId });
      applyDeepProp(selectedBlock.id, propKey, asset.url);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Image upload failed.';
      toast({ variant: 'destructive', title: 'Upload failed', description: message });
      if (import.meta.env.DEV) {
        try {
          applyDeepProp(selectedBlock.id, propKey, URL.createObjectURL(file));
        } catch {
          /* ignore */
        }
      }
    }
  };

  if (loadingWebsites || loadingPages) {
    return (
      <div className="flex h-[70dvh] w-full items-center justify-center">
        <UpdateIcon className="size-7 animate-spin text-primary" />
      </div>
    );
  }

  if (!website || !page) {
    return (
      <div className="flex h-[70dvh] w-full flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card text-center">
        <h1 className="font-display text-2xl font-semibold text-foreground">
          Website or page not found
        </h1>
        <Button asChild className="mt-4">
          <Link to="/app">Back to workspace</Link>
        </Button>
      </div>
    );
  }

  const publishState: 'draft' | 'changes' | 'live' =
    website.status !== 'published'
      ? 'draft'
      : publishedMatchesDraft
        ? 'live'
        : 'changes';

  const publishLabel: Record<typeof publishState, string> = {
    draft: 'Publish',
    changes: 'Publish changes',
    live: 'Live',
  };

  return (
    <div className="flex min-h-screen w-full flex-col overflow-auto bg-muted/30 md:overflow-hidden lg:h-screen">
      <header className="flex min-h-16 flex-wrap items-center justify-between gap-3 border-b border-border bg-card px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-3">
          <VibeMark className="size-7 flex-none" />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
              <Link className="hover:text-foreground" to="/app">
                Workspace
              </Link>
              <span>/</span>
              <span className="truncate">{website.name}</span>
              <span>/</span>
              <span className="truncate text-foreground">{page.name}</span>
            </div>
            <Input
              aria-label="Page name"
              className="mt-0.5 h-7 max-w-xs border-transparent bg-transparent px-1 font-display text-base font-semibold text-foreground shadow-none hover:bg-muted/40 focus:bg-card"
              value={pageName}
              onBlur={handleRenamePage}
              onChange={(event) => setPageName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.currentTarget.blur();
                }
              }}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${
              dirty || saveDraft.isPending
                ? 'bg-warning-background text-warning-high-emphasis ring-warning/30'
                : 'bg-success-background text-success-high-emphasis ring-success/30'
            }`}
          >
            <span
              className={`size-1.5 rounded-full ${
                dirty || saveDraft.isPending ? 'bg-warning' : 'bg-success'
              }`}
            />
            {dirty || saveDraft.isPending ? 'Saving…' : 'Saved'}
          </span>

          <div className="h-6 w-px bg-border" />

          <div className="flex items-center gap-0.5">
            <Button
              aria-label="Undo"
              size="icon-sm"
              type="button"
              variant="ghost"
              onClick={undo}
              disabled={past.length === 0}
              className="size-7"
              title="Undo (⌘Z)"
            >
              <CounterClockwiseClockIcon className="size-3.5" />
            </Button>
            <Button
              aria-label="Redo"
              size="icon-sm"
              type="button"
              variant="ghost"
              onClick={redo}
              disabled={future.length === 0}
              className="size-7"
              title="Redo (⌘⇧Z)"
            >
              <UpdateIcon className="size-3.5" />
            </Button>
          </div>

          <div className="h-6 w-px bg-border" />

          <div className="flex items-center rounded-md border border-border bg-muted/40 p-0.5">
            <Button
              aria-label="Desktop preview"
              size="icon-sm"
              type="button"
              variant={previewMode === 'desktop' ? 'default' : 'ghost'}
              onClick={() => setPreviewMode('desktop')}
              className="size-7"
            >
              <DesktopIcon className="size-3.5" />
            </Button>
            <Button
              aria-label="Tablet preview"
              size="icon-sm"
              type="button"
              variant={previewMode === 'tablet' ? 'default' : 'ghost'}
              onClick={() => setPreviewMode('tablet')}
              className="size-7"
            >
              <ReaderIcon className="size-3.5" />
            </Button>
            <Button
              aria-label="Mobile preview"
              size="icon-sm"
              type="button"
              variant={previewMode === 'mobile' ? 'default' : 'ghost'}
              onClick={() => setPreviewMode('mobile')}
              className="size-7"
            >
              <MobileIcon className="size-3.5" />
            </Button>
          </div>

          <div className="hidden items-center rounded-md border border-border bg-muted/40 p-0.5 md:flex">
            <Button
              aria-label="Zoom out"
              size="icon-sm"
              type="button"
              variant="ghost"
              className="size-7"
              onClick={() =>
                setZoom((z) => Math.max(0.5, Math.round((z - 0.1) * 10) / 10))
              }
            >
              <MinusIcon className="size-3.5" />
            </Button>
            <button
              type="button"
              className="px-2 font-mono text-[11px] font-semibold text-foreground"
              onClick={() => setZoom(1)}
            >
              {Math.round(zoom * 100)}%
            </button>
            <Button
              aria-label="Zoom in"
              size="icon-sm"
              type="button"
              variant="ghost"
              className="size-7"
              onClick={() =>
                setZoom((z) => Math.min(1.4, Math.round((z + 0.1) * 10) / 10))
              }
            >
              <PlusIcon className="size-3.5" />
            </Button>
          </div>

          <div className="h-6 w-px bg-border" />

          <Button
            aria-label="Site settings"
            size="icon-sm"
            type="button"
            variant="outline"
            className="size-8"
            title="Site settings"
            onClick={() => setSettingsOpen(true)}
          >
            <GearIcon className="size-3.5" />
          </Button>

          <Button
            aria-label="Toggle navigator"
            size="icon-sm"
            type="button"
            variant={layersOpen ? 'default' : 'outline'}
            className="size-8"
            title="Navigator"
            onClick={() => setLayersOpen((value) => !value)}
          >
            <LayersIcon className="size-3.5" />
          </Button>

          <Button
            loading={saveDraft.isPending}
            type="button"
            variant="outline"
            onClick={() => saveDraft.mutate({ page, layout })}
          >
            <ArchiveIcon className="size-4" />
            Save
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                loading={publishPage.isPending}
                type="button"
                className="gap-1"
              >
                <span className={`size-2 rounded-full ${PUBLISH_DOT[publishState]}`} />
                {publishLabel[publishState]}
                <ChevronDownIcon className="size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={handlePublish}>
                <PaperPlaneIcon className="size-4" />
                Publish &amp; view live
              </DropdownMenuItem>
              {website.status === 'published' && (
                <>
                  <DropdownMenuItem
                    onClick={() => {
                      const url = `${window.location.origin}/site/${website.slug}/${page.slug}`;
                      navigator.clipboard?.writeText(url).then(() => {
                        toast({ title: 'Public URL copied' });
                      });
                    }}
                  >
                    <ExternalLinkIcon className="size-4" />
                    Copy public URL
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      window.open(`/site/${website.slug}/${page.slug}`, '_blank', 'noreferrer')
                    }
                  >
                    <ExternalLinkIcon className="size-4" />
                    Open live site
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSettingsOpen(true)}>
                <GearIcon className="size-4" />
                Site settings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <ProfileMenu
            side="bottom"
            align="end"
            sideOffset={8}
            triggerClassName="ml-1 rounded-full border border-border bg-muted/40 p-0.5 transition hover:border-primary/40 hover:bg-muted"
          />
        </div>
      </header>

      {/*
        Z-index: canvas block chrome ~20–30, context menu 110, navigator portal 60,
        DragOverlay ~1200, Radix dialogs above.
      */}
      <div
        className="relative grid min-h-0 flex-1 grid-cols-1 grid-rows-[minmax(0,min(42vh,380px))_minmax(0,1fr)] md:grid-cols-[var(--studio-w)_5px_minmax(0,1fr)] md:grid-rows-1"
        style={{ ['--studio-w' as string]: `${studioWidth}px` } as React.CSSProperties}
      >
        <DndContext
          collisionDetection={closestCenter}
          sensors={sensors}
          onDragStart={(event) => setActiveDragId(String(event.active.id))}
          onDragEnd={(event) => {
            setActiveDragId(null);
            handleDragEnd(event);
          }}
          onDragCancel={() => setActiveDragId(null)}
        >
          <div className="flex min-h-0 flex-col overflow-hidden border-b border-border bg-card md:h-full md:border-b-0 md:border-r">
            <div className="grid shrink-0 grid-cols-4 gap-0.5 border-b border-border bg-background p-1">
              {(
                [
                  { id: 'insert', label: 'Insert', icon: Component1Icon },
                  { id: 'edit', label: 'Edit', icon: Pencil2Icon },
                  { id: 'page', label: 'Page', icon: FileTextIcon },
                  { id: 'site', label: 'Site', icon: GlobeIcon },
                ] as { id: StudioTab; label: string; icon: typeof Component1Icon }[]
              ).map((tab) => {
                const Icon = tab.icon;
                const active = studioTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    className={`grid min-h-10 place-items-center rounded-md px-0.5 py-0.5 text-[9px] font-semibold leading-tight transition ${
                      active
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                    onClick={() => setStudioTab(tab.id)}
                  >
                    <Icon className="mb-0.5 size-3" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              {studioTab === 'insert' && (
                <BuilderPalette
                  onAdd={addBlock}
                  onOpenCommandPalette={() => openCommand('insert-only')}
                />
              )}

              {studioTab === 'edit' && (
                <PropertiesInspector
                  block={selectedBlock ?? undefined}
                  uploading={uploadAsset.isPending}
                  onChange={(props) => selectedBlock && updateBlockProps(selectedBlock.id, props)}
                  onUploadImage={handleUploadImage}
                  onPickAsset={(propKey) => setAssetPicker({ kind: 'field', propKey })}
                  onPickManyForList={({ listKey, imageKey, seed }) =>
                    setAssetPicker({ kind: 'listBulk', listKey, imageKey, seed })
                  }
                />
              )}

              {studioTab === 'page' && (
                <aside className="flex h-full min-h-0 flex-col" data-testid="page-panel">
                  <div className="min-h-0 flex-1 space-y-2.5 overflow-auto overflow-x-hidden p-2.5">
                    <div>
                      <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-primary">
                        Pages
                      </p>
                      <h2 className="mt-0.5 font-display text-sm font-semibold text-foreground">
                        Structure
                      </h2>
                    </div>
                    <label className="grid gap-1">
                      <span className="text-[10px] font-semibold text-foreground">Current page</span>
                      <Input
                        aria-label="Page name"
                        className="h-7 bg-background text-xs"
                        value={pageName}
                        onBlur={handleRenamePage}
                        onChange={(event) => setPageName(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') event.currentTarget.blur();
                        }}
                      />
                    </label>
                    <div className="grid gap-1">
                      {pages.map((item) => (
                        <Button
                          key={item.id}
                          asChild={item.id !== page.id}
                          size="sm"
                          variant={item.id === page.id ? 'default' : 'outline'}
                          className="h-7 justify-start text-xs"
                        >
                          {item.id === page.id ? (
                            <span>{item.name}</span>
                          ) : (
                            <Link to={`/app/sites/${siteId}/pages/${item.id}`}>{item.name}</Link>
                          )}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <form className="shrink-0 border-t border-border p-2.5" onSubmit={handleCreatePage}>
                    <Input
                      aria-label="New page name"
                      className="mb-2 h-7 bg-background text-xs"
                      value={newPageName}
                      onChange={(event) => setNewPageName(event.target.value)}
                    />
                    <div className="flex gap-2">
                      <Button
                        loading={createPage.isPending}
                        size="sm"
                        type="submit"
                        variant="outline"
                        className="h-7 flex-1 text-xs"
                      >
                        <FilePlusIcon className="size-3" />
                        Add page
                      </Button>
                      <Button
                        disabled={pages.length <= 1}
                        loading={deletePage.isPending}
                        size="icon-sm"
                        type="button"
                        variant="outline"
                        className="size-7"
                        onClick={handleDeletePage}
                      >
                        <TrashIcon className="size-3 text-error" />
                      </Button>
                    </div>
                  </form>
                </aside>
              )}

              {studioTab === 'site' && (
                <aside
                  className="flex h-full min-h-0 flex-col overflow-auto overscroll-contain p-2.5"
                  data-testid="site-panel"
                >
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-primary">
                      Site
                    </p>
                    <h2 className="mt-0.5 font-display text-sm font-semibold text-foreground">
                      Publish tools
                    </h2>
                  </div>
                  <div className="mt-2 rounded-lg border border-border bg-background p-2.5">
                    <p className="text-xs font-semibold text-foreground">{website.name}</p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">/{website.slug}</p>
                    <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">
                      Draft edits stay private until you publish this page.
                    </p>
                  </div>
                  <Button
                    className="mt-2 h-7 justify-start text-xs"
                    variant="outline"
                    onClick={() => setSettingsOpen(true)}
                  >
                    <GearIcon className="size-3" />
                    Site settings
                  </Button>
                  <Button
                    className="h-7 justify-start text-xs"
                    variant="outline"
                    onClick={() => setLayersOpen((value) => !value)}
                  >
                    <LayersIcon className="size-3" />
                    {layersOpen ? 'Hide navigator' : 'Show navigator'}
                  </Button>
                  <Button
                    className="h-7 justify-start text-xs"
                    variant="outline"
                    onClick={() => saveDraft.mutate({ page, layout })}
                  >
                    <ArchiveIcon className="size-3" />
                    Save draft
                  </Button>
                  <Button
                    className="h-7 justify-start text-xs"
                    onClick={handlePublish}
                    loading={publishPage.isPending}
                  >
                    <PaperPlaneIcon className="size-3" />
                    {publishLabel[publishState]}
                  </Button>
                  {website.status === 'published' && (
                    <Button
                      className="h-7 justify-start text-xs"
                      variant="outline"
                      onClick={() =>
                        window.open(`/site/${website.slug}/${page.slug}`, '_blank', 'noreferrer')
                      }
                    >
                      <ExternalLinkIcon className="size-3" />
                      Open live site
                    </Button>
                  )}
                </aside>
              )}
            </div>
          </div>

          <button
            type="button"
            aria-label="Resize studio panel width"
            className="z-10 hidden w-[5px] min-w-[5px] cursor-col-resize touch-none border-x border-transparent bg-border/70 hover:bg-primary/40 active:bg-primary/55 md:block"
            onMouseDown={(event) => {
              event.preventDefault();
              const startX = event.clientX;
              const startW = studioWidth;
              const onMove = (moveEvent: MouseEvent) => {
                setStudioWidth(clampStudioW(startW + (moveEvent.clientX - startX)));
              };
              const onUp = () => {
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onUp);
              };
              document.addEventListener('mousemove', onMove);
              document.addEventListener('mouseup', onUp);
            }}
          />

          <BuilderCanvas
            blocks={layout.blocks}
            selectedBlockId={selectedBlockId}
            previewMode={previewMode}
            zoom={zoom}
            onSelect={selectBlock}
            onRemove={removeBlock}
            onDuplicate={duplicateBlock}
            onMove={moveBlock}
            onAdd={addBlock}
            onCopyStyle={handleCopyStyle}
            onPasteStyle={handlePasteStyle}
            onResetStyle={handleResetStyle}
            canPasteStyle={Boolean(copiedStyle)}
            onOpenNavigator={() => setLayersOpen(true)}
          />

          <DragOverlay dropAnimation={{ duration: 0 }} style={{ zIndex: 1200 }}>
            <BuilderDragPreview activeId={activeDragId} blocks={layout.blocks} />
          </DragOverlay>

          {layersOpen && (
            <LayersPanel
              floating
              blocks={layout.blocks}
              selectedBlockId={selectedBlockId}
              onSelect={selectBlock}
              onMove={moveBlock}
              onDuplicate={duplicateBlock}
              onRemove={removeBlock}
              onToggleHidden={handleToggleHidden}
              onClose={() => setLayersOpen(false)}
              floatPosition={layersPosition}
              onFloatPositionChange={setLayersPosition}
              onFloatPositionReset={resetLayersFloat}
              portalZIndex={60}
            />
          )}
        </DndContext>
      </div>

      <CommandPalette
        open={commandOpen}
        onOpenChange={setCommandOpen}
        pages={pages}
        currentPageId={page.id}
        insertMode={commandMode === 'insert-only' ? 'insert-only' : undefined}
        onInsertBlock={(type) => {
          addBlock(type);
        }}
        onJumpPage={(targetPageId) =>
          navigate(`/app/sites/${siteId}/pages/${targetPageId}`)
        }
        onOpenSettings={() => setSettingsOpen(true)}
        onPublish={handlePublish}
        onOpenLive={() =>
          window.open(`/site/${website.slug}/${page.slug}`, '_blank', 'noreferrer')
        }
        canOpenLive={website.status === 'published'}
      />

      <SiteSettingsSheet
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        website={website}
        pages={pages}
        ownerId={ownerId}
      />

      {assetPicker && (
        <AssetPicker
          open
          onOpenChange={(value) => !value && setAssetPicker(null)}
          websiteId={website.id}
          ownerId={ownerId}
          multiple={assetPicker.kind === 'listBulk'}
          onSelect={(url) => {
            if (selectedBlock && assetPicker.kind === 'field') {
              applyDeepProp(selectedBlock.id, assetPicker.propKey, url);
            }
            setAssetPicker(null);
          }}
          onSelectMany={
            assetPicker.kind === 'listBulk'
              ? (urls) => {
                  if (!selectedBlock) {
                    setAssetPicker(null);
                    return;
                  }
                  const { listKey, imageKey, seed } = assetPicker;
                  const prev = Array.isArray(selectedBlock.props[listKey])
                    ? [...(selectedBlock.props[listKey] as Record<string, unknown>[])]
                    : [];
                  const appended = urls.map((url) => ({ ...seed, [imageKey]: url }));
                  updateBlockProps(selectedBlock.id, { [listKey]: [...prev, ...appended] });
                  setAssetPicker(null);
                }
              : undefined
          }
        />
      )}
    </div>
  );
};
