import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronRightIcon,
  ClipboardCopyIcon,
  Cross2Icon,
  DragHandleDots2Icon,
  EyeClosedIcon,
  EyeOpenIcon,
  LayersIcon,
  TrashIcon,
} from '@radix-ui/react-icons';
import { componentRegistry } from './component-registry';
import { VibeBlock } from '../types';
import { flattenBlocks, isContainerBlock } from '../utils/block-tree';

const LAYER_PREFIX = 'layers:';

const titleForBlock = (block: VibeBlock) => {
  const props = block.props;
  const value =
    props.headline ??
    props.title ??
    props.heading ??
    props.brand ??
    props.label ??
    props.eyebrow ??
    props.name;

  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }

  return componentRegistry[block.type]?.name ?? block.type;
};

const isHiddenEverywhere = (block: VibeBlock) =>
  Boolean(block.props.hideOnDesktop && block.props.hideOnTablet && block.props.hideOnMobile);

const clampToViewport = (left: number, top: number, panelW: number, panelH: number) => {
  const pad = 8;
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
  const w = Math.min(panelW, vw - pad * 2);
  const h = Math.min(panelH, vh - pad * 2);
  return {
    left: Math.min(Math.max(pad, left), Math.max(pad, vw - w - pad)),
    top: Math.min(Math.max(pad, top), Math.max(pad, vh - h - pad)),
  };
};

const LayerSortableRow = memo(
  ({
    block,
    depth,
    index,
    total,
    selected,
    hasSubtree,
    expanded,
    onToggleExpand,
    onSelect,
    onMove,
    onDuplicate,
    onRemove,
    onToggleHidden,
    selectedBlockId,
  }: {
    block: VibeBlock;
    depth: number;
    index: number;
    total: number;
    selected: boolean;
    hasSubtree: boolean;
    expanded: boolean;
    onToggleExpand: () => void;
    onSelect: (blockId: string) => void;
    onMove: (blockId: string, delta: number) => void;
    onDuplicate: (blockId: string) => void;
    onRemove: (blockId: string) => void;
    onToggleHidden: (blockId: string, hidden: boolean) => void;
    selectedBlockId: string | null;
  }) => {
    const rowRef = useRef<HTMLDivElement>(null);
    const definition = componentRegistry[block.type];
    const hidden = isHiddenEverywhere(block);

    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
      id: `${LAYER_PREFIX}${block.id}`,
      data: { source: 'navigator', blockId: block.id },
    });

    const mergedRef = useCallback(
      (node: HTMLDivElement | null) => {
        setNodeRef(node);
        rowRef.current = node;
      },
      [setNodeRef]
    );

    useEffect(() => {
      if (selectedBlockId !== block.id || !rowRef.current) return;
      rowRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, [selectedBlockId, block.id]);

    const style = {
      transform: CSS.Transform.toString(transform),
      transition: transition ?? 'transform 200ms ease',
      marginLeft: depth * 12,
      opacity: isDragging ? 0.82 : 1,
    };

    return (
      <div style={style}>
        <div
          ref={mergedRef}
          data-testid={`layers-row-${block.type}`}
          data-layer-id={block.id}
          className={`group flex w-full items-center gap-1.5 rounded-md border px-1.5 py-1.5 transition ${
            selected
              ? 'border-primary/50 bg-primary/10 ring-1 ring-primary/20'
              : 'border-border bg-card/80 hover:border-primary/30 hover:bg-card'
          }`}
        >
          <button
            type="button"
            aria-label="Drag layer"
            className="grid size-5 flex-none place-items-center rounded text-muted-foreground hover:bg-muted"
            data-no-drag
            {...attributes}
            {...listeners}
            onClick={(e) => e.stopPropagation()}
          >
            <DragHandleDots2Icon className="size-3 text-muted-foreground/50" />
          </button>
          {hasSubtree ? (
            <button
              type="button"
              aria-label={expanded ? 'Collapse' : 'Expand'}
              className="grid size-5 flex-none place-items-center rounded text-muted-foreground hover:bg-muted"
              data-no-drag
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand();
              }}
            >
              <ChevronRightIcon
                className={`size-3 transition-transform ${expanded ? 'rotate-90' : ''}`}
              />
            </button>
          ) : (
            <span className="size-5 flex-none" />
          )}
          <span className="grid size-6 flex-none place-items-center rounded bg-muted text-[10px] font-semibold text-muted-foreground">
            {index + 1}
          </span>
          <button
            type="button"
            onClick={() => onSelect(block.id)}
            className="min-w-0 flex-1 text-left"
          >
            <span className="block truncate text-[11px] font-semibold text-foreground">
              {titleForBlock(block)}
            </span>
            <span className="block truncate text-[10px] text-muted-foreground">
              {definition?.name ?? block.type}
            </span>
          </button>
          <span className="flex flex-none items-center gap-0.5 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
            <button
              type="button"
              aria-label="Move layer up"
              disabled={index === 0}
              className="grid size-5 place-items-center rounded text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30"
              onClick={(event) => {
                event.stopPropagation();
                onMove(block.id, -1);
              }}
            >
              <ArrowUpIcon className="size-2.5" />
            </button>
            <button
              type="button"
              aria-label="Move layer down"
              disabled={index === total - 1}
              className="grid size-5 place-items-center rounded text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30"
              onClick={(event) => {
                event.stopPropagation();
                onMove(block.id, 1);
              }}
            >
              <ArrowDownIcon className="size-2.5" />
            </button>
            <button
              type="button"
              aria-label={hidden ? 'Show layer' : 'Hide layer'}
              className="grid size-5 place-items-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
              onClick={(event) => {
                event.stopPropagation();
                onToggleHidden(block.id, !hidden);
              }}
            >
              {hidden ? <EyeClosedIcon className="size-2.5" /> : <EyeOpenIcon className="size-2.5" />}
            </button>
            <button
              type="button"
              aria-label="Duplicate layer"
              className="grid size-5 place-items-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
              onClick={(event) => {
                event.stopPropagation();
                onDuplicate(block.id);
              }}
            >
              <ClipboardCopyIcon className="size-2.5" />
            </button>
            <button
              type="button"
              aria-label="Delete layer"
              className="grid size-5 place-items-center rounded text-error hover:bg-error/10"
              onClick={(event) => {
                event.stopPropagation();
                onRemove(block.id);
              }}
            >
              <TrashIcon className="size-2.5" />
            </button>
          </span>
        </div>
      </div>
    );
  }
);
LayerSortableRow.displayName = 'LayerSortableRow';

const LayersBranch = memo(
  ({
    blocks,
    depth,
    collapsed,
    toggleCollapsed,
    selectedBlockId,
    onSelect,
    onMove,
    onDuplicate,
    onRemove,
    onToggleHidden,
  }: {
    blocks: VibeBlock[];
    depth: number;
    collapsed: Set<string>;
    toggleCollapsed: (id: string) => void;
    selectedBlockId: string | null;
    onSelect: (blockId: string) => void;
    onMove: (blockId: string, delta: number) => void;
    onDuplicate: (blockId: string) => void;
    onRemove: (blockId: string) => void;
    onToggleHidden: (blockId: string, hidden: boolean) => void;
  }) => {
    const ids = useMemo(() => blocks.map((b) => `${LAYER_PREFIX}${b.id}`), [blocks]);

    return (
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <ul className={depth ? 'mt-0.5 space-y-1 border-l border-border/50 pl-2' : 'space-y-1'}>
          {blocks.map((block, index) => {
            const subs = block.children?.length && isContainerBlock(block.type);
            const isOpen = subs ? !collapsed.has(block.id) : false;

            return (
              <li key={block.id}>
                <LayerSortableRow
                  block={block}
                  depth={depth}
                  index={index}
                  total={blocks.length}
                  selected={block.id === selectedBlockId}
                  hasSubtree={Boolean(subs)}
                  expanded={isOpen}
                  onToggleExpand={() => toggleCollapsed(block.id)}
                  onSelect={onSelect}
                  onMove={onMove}
                  onDuplicate={onDuplicate}
                  onRemove={onRemove}
                  onToggleHidden={onToggleHidden}
                  selectedBlockId={selectedBlockId}
                />
                {subs && isOpen && (block.children ?? []).length > 0 && (
                  <LayersBranch
                    blocks={block.children ?? []}
                    depth={depth + 1}
                    collapsed={collapsed}
                    toggleCollapsed={toggleCollapsed}
                    selectedBlockId={selectedBlockId}
                    onSelect={onSelect}
                    onMove={onMove}
                    onDuplicate={onDuplicate}
                    onRemove={onRemove}
                    onToggleHidden={onToggleHidden}
                  />
                )}
              </li>
            );
          })}
        </ul>
      </SortableContext>
    );
  }
);
LayersBranch.displayName = 'LayersBranch';

const DraggableFloatingShell = ({
  children,
  position,
  onPositionChange,
  onResetPosition,
  zIndex = 50,
}: {
  children: React.ReactNode;
  position: { left: number; top: number };
  onPositionChange: (p: { left: number; top: number }) => void;
  onResetPosition?: () => void;
  zIndex?: number;
}) => {
  const shellRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef<{ pointerId: number; dx: number; dy: number } | null>(null);

  const onPointerDown = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      if (event.button !== 0) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest('button, a, input, [data-no-drag]')) return;

      draggingRef.current = {
        pointerId: event.pointerId,
        dx: event.clientX - position.left,
        dy: event.clientY - position.top,
      };
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [position.left, position.top]
  );

  const onPointerMove = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      const d = draggingRef.current;
      if (!d || event.pointerId !== d.pointerId) return;
      const shell = shellRef.current;
      const rect = shell?.getBoundingClientRect();
      const w = rect?.width ?? 320;
      const h = rect?.height ?? 240;
      const next = clampToViewport(event.clientX - d.dx, event.clientY - d.dy, w, h);
      onPositionChange(next);
    },
    [onPositionChange]
  );

  const endDrag = useCallback((event: React.PointerEvent<HTMLElement>) => {
    const d = draggingRef.current;
    if (d && event.pointerId === d.pointerId) {
      draggingRef.current = null;
      try {
        event.currentTarget.releasePointerCapture(event.pointerId);
      } catch {
        /* ignore */
      }
    }
  }, []);

  return (
    <div
      ref={shellRef}
      className="pointer-events-auto fixed flex max-h-[min(56dvh,560px)] max-w-[min(23rem,calc(100vw-1rem))] flex-col"
      style={{ left: position.left, top: position.top, zIndex }}
      role="dialog"
      aria-label="Navigator layers"
    >
      <div
        className="cursor-move select-none rounded-t-xl border border-b-0 border-border bg-muted/50 px-2 py-1.5"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onDoubleClick={() => onResetPosition?.()}
      >
        <p className="text-center text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Drag to move · double-click to reset
        </p>
      </div>
      {children}
    </div>
  );
};

const LayersPanelInner = memo(
  ({
    blocks,
    selectedBlockId,
    onSelect,
    onMove,
    onDuplicate,
    onRemove,
    onToggleHidden,
    floating = false,
    onClose,
  }: {
    blocks: VibeBlock[];
    selectedBlockId: string | null;
    onSelect: (blockId: string) => void;
    onMove: (blockId: string, delta: number) => void;
    onDuplicate: (blockId: string) => void;
    onRemove: (blockId: string) => void;
    onToggleHidden: (blockId: string, hidden: boolean) => void;
    floating?: boolean;
    onClose?: () => void;
  }) => {
    const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());
    const flatCount = useMemo(() => flattenBlocks(blocks).length, [blocks]);

    const toggleCollapsed = useCallback((id: string) => {
      setCollapsed((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    }, []);

    return (
      <aside
        className={`flex min-h-0 flex-col border border-border bg-card p-2.5 shadow-[0_18px_60px_-28px_rgba(0,0,0,0.85)] ${
          floating
            ? 'flex-1 rounded-b-xl rounded-t-none border-t-0'
            : 'min-h-[16rem] w-full rounded-xl md:max-h-[42dvh]'
        }`}
        data-testid="layers-panel"
      >
        <div className="mb-2 flex items-start justify-between gap-2">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-primary">
              Navigator
            </p>
            <h2 className="mt-0.5 font-display text-sm font-semibold text-foreground">Layers</h2>
          </div>
          <div className="flex items-center gap-1" data-no-drag>
            <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
              <LayersIcon className="size-2.5" />
              {flatCount}
            </span>
            {onClose && (
              <button
                type="button"
                aria-label="Close navigator"
                className="grid size-6 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={onClose}
              >
                <Cross2Icon className="size-3" />
              </button>
            )}
          </div>
        </div>

        {blocks.length === 0 ? (
          <div className="grid min-h-0 grow place-items-center rounded-lg border border-dashed border-border bg-muted/35 p-3 text-center text-[11px] leading-5 text-muted-foreground">
            Blocks you add to the canvas will appear here for quick selection and ordering.
          </div>
        ) : (
          <div className="grid min-h-0 flex-1 content-start gap-1 overflow-auto overscroll-contain pr-0.5">
            <LayersBranch
              blocks={blocks}
              depth={0}
              collapsed={collapsed}
              toggleCollapsed={toggleCollapsed}
              selectedBlockId={selectedBlockId}
              onSelect={onSelect}
              onMove={onMove}
              onDuplicate={onDuplicate}
              onRemove={onRemove}
              onToggleHidden={onToggleHidden}
            />
          </div>
        )}
      </aside>
    );
  }
);
LayersPanelInner.displayName = 'LayersPanelInner';

export const LayersPanel = memo(
  ({
    blocks,
    selectedBlockId,
    onSelect,
    onMove,
    onDuplicate,
    onRemove,
    onToggleHidden,
    floating = false,
    onClose,
    floatPosition,
    onFloatPositionChange,
    onFloatPositionReset,
    portalZIndex = 50,
  }: {
    blocks: VibeBlock[];
    selectedBlockId: string | null;
    onSelect: (blockId: string) => void;
    onMove: (blockId: string, delta: number) => void;
    onDuplicate: (blockId: string) => void;
    onRemove: (blockId: string) => void;
    onToggleHidden: (blockId: string, hidden: boolean) => void;
    floating?: boolean;
    onClose?: () => void;
    floatPosition?: { left: number; top: number } | null;
    onFloatPositionChange?: (p: { left: number; top: number }) => void;
    onFloatPositionReset?: () => void;
    portalZIndex?: number;
  }) => {
    const inner = (
      <LayersPanelInner
        blocks={blocks}
        selectedBlockId={selectedBlockId}
        onSelect={onSelect}
        onMove={onMove}
        onDuplicate={onDuplicate}
        onRemove={onRemove}
        onToggleHidden={onToggleHidden}
        floating={floating}
        onClose={onClose}
      />
    );

    if (floating && floatPosition && onFloatPositionChange && typeof document !== 'undefined') {
      return createPortal(
        <DraggableFloatingShell
          position={floatPosition}
          onPositionChange={onFloatPositionChange}
          onResetPosition={onFloatPositionReset}
          zIndex={portalZIndex}
        >
          {inner}
        </DraggableFloatingShell>,
        document.body
      );
    }

    return inner;
  }
);
LayersPanel.displayName = 'LayersPanel';
