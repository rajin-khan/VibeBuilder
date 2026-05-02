import { memo, useDeferredValue, useEffect, useMemo, useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { ChevronDownIcon, DragHandleDots2Icon, MagnifyingGlassIcon } from '@radix-ui/react-icons';
import {
  categoryOrder,
  componentCategoryMeta,
  componentRegistry,
} from './component-registry';
import { ComponentCategory, VibeBlockType } from '../types';
import { BlockThumbnail } from './block-thumbnail';
import { Button } from '@/components/ui-kit/button';

const STORAGE_KEY = 'vibe-builder-palette-categories-v1';

const PaletteItem = memo(({
  type,
  onAdd,
}: {
  type: VibeBlockType;
  onAdd: (type: VibeBlockType) => void;
}) => {
  const definition = componentRegistry[type];
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `palette-${type}`,
    data: { source: 'palette', type },
  });

  return (
    <div
      ref={setNodeRef}
      data-testid={`palette-item-${type}`}
      className={`group relative cursor-grab overflow-hidden rounded-lg border border-border/90 bg-card shadow-sm ring-1 ring-border/50 transition duration-150 active:cursor-grabbing ${
        isDragging
          ? 'opacity-50'
          : 'hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md hover:shadow-black/20 hover:ring-primary/20'
      }`}
      style={{
        transform: transform
          ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
          : undefined,
      }}
      {...listeners}
      {...attributes}
      onDoubleClick={() => onAdd(type)}
    >
      <div className="relative p-1.5 pb-0">
        <BlockThumbnail type={type} />
      </div>
      <div className="flex items-start justify-between gap-2 border-t border-border/80 bg-card px-3 py-2">
        <div className="min-w-0">
          <p className="truncate text-[11px] font-semibold leading-tight text-foreground">
            {definition.name}
          </p>
          <p className="mt-1 line-clamp-2 text-[10px] leading-snug text-muted-foreground">
            {definition.preview}
          </p>
        </div>
        <DragHandleDots2Icon className="size-3.5 flex-none text-muted-foreground/50 transition group-hover:text-muted-foreground" />
      </div>
      <Button
        aria-label={`Add ${definition.name}`}
        className="absolute inset-x-3 bottom-2 hidden h-7 px-2 text-[11px] group-hover:flex"
        size="sm"
        type="button"
        variant="default"
        onClick={(event) => {
          event.stopPropagation();
          onAdd(type);
        }}
        onPointerDown={(event) => event.stopPropagation()}
      >
        Add to canvas
      </Button>
    </div>
  );
});
PaletteItem.displayName = 'PaletteItem';

const CategorySection = memo(({
  category,
  onAdd,
  query,
  open,
  onToggle,
}: {
  category: ComponentCategory;
  onAdd: (type: VibeBlockType) => void;
  query: string;
  open: boolean;
  onToggle: (next: boolean) => void;
}) => {
  const meta = componentCategoryMeta[category];
  const types = useMemo(
    () =>
      (Object.keys(componentRegistry) as VibeBlockType[]).filter((type) => {
        const def = componentRegistry[type];
        if (def.category !== category) return false;
        if (!query) return true;
        const haystack = `${def.name} ${def.description} ${def.preview} ${type}`.toLowerCase();
        return haystack.includes(query.toLowerCase());
      }),
    [category, query]
  );

  if (types.length === 0) return null;

  const isOpen = open || Boolean(query);

  return (
    <section className="space-y-2">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-2 px-1 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground transition hover:text-foreground"
        onClick={() => onToggle(!open)}
      >
        <span className="flex items-center gap-2">
          {meta.label}
          <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] font-bold text-muted-foreground">
            {types.length}
          </span>
        </span>
        <ChevronDownIcon
          className={`size-3 transition ${isOpen ? '' : '-rotate-90'}`}
        />
      </button>
      {isOpen && (
        <div className="grid grid-cols-1 gap-2 content-visibility-auto">
          {types.map((type) => (
            <PaletteItem key={type} type={type} onAdd={onAdd} />
          ))}
        </div>
      )}
    </section>
  );
});
CategorySection.displayName = 'CategorySection';

const useCategoryState = () => {
  const initial = useMemo(() => {
    if (typeof window === 'undefined') {
      return {} as Record<ComponentCategory, boolean>;
    }
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as Record<ComponentCategory, boolean>;
    } catch {
      /* ignore */
    }
    return categoryOrder.reduce(
      (acc, key, index) => ({ ...acc, [key]: index < 4 }),
      {} as Record<ComponentCategory, boolean>
    );
  }, []);

  const [state, setState] = useState<Record<ComponentCategory, boolean>>(initial);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state]);

  return [state, setState] as const;
};

export const BuilderPalette = ({
  onAdd,
  onOpenCommandPalette,
}: {
  onAdd: (type: VibeBlockType) => void;
  onOpenCommandPalette?: () => void;
}) => {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const [openMap, setOpenMap] = useCategoryState();

  return (
    <aside
      className="flex h-full min-h-0 w-full flex-col bg-card p-2 md:min-h-0 md:flex-1"
      data-testid="builder-palette"
    >
      <div className="mb-2 shrink-0">
        <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-primary">
          Components
        </p>
        <h2 className="mt-0.5 font-display text-sm font-semibold text-foreground">
          Drag onto the canvas
        </h2>
      </div>

      <label className="relative mb-2 block shrink-0">
        <MagnifyingGlassIcon className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          aria-label="Search components"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search…"
          className="h-7 w-full rounded-md border border-border bg-background pl-8 pr-14 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <button
          type="button"
          onClick={onOpenCommandPalette}
          aria-label="Open command palette"
          className="absolute right-1.5 top-1/2 inline-flex -translate-y-1/2 items-center gap-0.5 rounded border border-border bg-background px-1 py-0.5 text-[9px] font-semibold text-muted-foreground hover:text-foreground"
        >
          <kbd className="font-mono">⌘K</kbd>
        </button>
      </label>

      <div className="min-h-0 flex-1 space-y-2.5 overflow-auto overscroll-contain pb-1 pr-0.5">
        {categoryOrder.map((category) => (
          <CategorySection
            key={category}
            category={category}
            onAdd={onAdd}
            query={deferredQuery}
            open={openMap[category] ?? false}
            onToggle={(next) =>
              setOpenMap((prev) => ({ ...prev, [category]: next }))
            }
          />
        ))}
      </div>
    </aside>
  );
};
