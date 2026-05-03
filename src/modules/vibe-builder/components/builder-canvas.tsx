import {
  CSSProperties,
  MouseEvent,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useDroppable } from '@dnd-kit/core';
import {
  useSortable,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ClipboardCopyIcon,
  Component1Icon,
  DragHandleDots2Icon,
  MagicWandIcon,
  TrashIcon,
} from '@radix-ui/react-icons';
import { VibeBlockRenderer, componentRegistry } from './component-registry';
import { BlockThumbnail } from './block-thumbnail';
import { BuilderChildProvider } from './builder-child-context';
import { VibeBlock, VibeBlockType } from '../types';
import { isContainerBlock } from '../utils/block-tree';
import { blockVisibilityClass, PreviewMode } from '../utils/style';

const CornerHandles = () => (
  <>
    {[
      'top-0 left-0',
      'top-0 right-0',
      'bottom-0 left-0',
      'bottom-0 right-0',
    ].map((position) => (
      <span
        key={position}
        className={`pointer-events-none absolute ${position} z-30 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary bg-background ${
          position.includes('right') ? 'translate-x-1/2' : ''
        } ${position.includes('bottom') ? 'translate-y-1/2' : ''}`}
      />
    ))}
  </>
);

const CanvasSortableNodeInner = ({
  block,
  parentId,
  selected,
  onSelect,
  onRemove,
  onDuplicate,
  onMove,
  onContextMenu,
  index,
  siblingsCount,
  previewMode,
  registerBlockEl,
  selectedBlockId,
}: {
  block: VibeBlock;
  parentId: 'root' | string;
  selected: boolean;
  selectedBlockId: string | null;
  onSelect: (blockId: string) => void;
  onRemove: (blockId: string) => void;
  onDuplicate: (blockId: string) => void;
  onMove: (blockId: string, delta: number) => void;
  onContextMenu: (event: MouseEvent, block: VibeBlock) => void;
  index: number;
  siblingsCount: number;
  previewMode: PreviewMode;
  registerBlockEl: (id: string, el: HTMLElement | null) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging, isOver } =
    useSortable({
      id: block.id,
      data: { source: 'canvas', parentId },
    });

  const definition = componentRegistry[block.type];
  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition ?? 'transform 220ms cubic-bezier(0.2, 0, 0, 1)',
  };

  const mergedRef = useCallback(
    (node: HTMLElement | null) => {
      setNodeRef(node);
      registerBlockEl(block.id, node);
    },
    [setNodeRef, registerBlockEl, block.id]
  );

  const container = isContainerBlock(block.type);
  const childIds = block.children?.map((c) => c.id) ?? [];

  const blockBody = container ? (
    <SortableContext items={childIds} strategy={verticalListSortingStrategy}>
      {/* overflow-visible so nested blocks' -top-3 editor chrome is not clipped */}
      <div className="min-w-0 overflow-visible rounded-xl">
        <BuilderChildProvider
          value={(child, childIndex, total) => (
            <CanvasSortableNode
              key={child.id}
              block={child}
              parentId={block.id}
              selectedBlockId={selectedBlockId}
              onSelect={onSelect}
              onRemove={onRemove}
              onDuplicate={onDuplicate}
              onMove={onMove}
              onContextMenu={onContextMenu}
              index={childIndex}
              siblingsCount={total}
              previewMode={previewMode}
              registerBlockEl={registerBlockEl}
            />
          )}
        >
          <VibeBlockRenderer block={block} />
        </BuilderChildProvider>
      </div>
    </SortableContext>
  ) : (
    <div className="overflow-hidden rounded-xl">
      <VibeBlockRenderer block={block} />
    </div>
  );

  return (
    <div className={`relative ${blockVisibilityClass(block, previewMode)}`}>
      {isOver && !isDragging && (
        <div className="pointer-events-none absolute -top-1 left-0 right-0 z-30 h-0.5 rounded-full bg-primary shadow-ring" />
      )}
      <div
        ref={mergedRef}
        aria-label={`${definition?.name ?? block.type} block`}
        className={`group relative scroll-mt-8 rounded-xl border bg-card transition-[border,opacity] duration-200 ease-out will-change-transform ${
          selected ? 'border-primary ring-2 ring-primary/30' : 'border-border'
        } ${isDragging ? 'z-20 opacity-85' : 'hover:border-primary/50'}`}
        data-testid={`vibe-block-${block.type}`}
        data-selected={selected || undefined}
        style={style}
        onClick={(event) => {
          event.stopPropagation();
          onSelect(block.id);
        }}
        onPointerDown={() => onSelect(block.id)}
        onContextMenu={(event) => onContextMenu(event, block)}
      >
        {selected && <CornerHandles />}

        <div
          className={`pointer-events-none absolute -top-3 left-3 z-20 flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.16em] transition ${
            selected
              ? 'border-primary bg-primary text-primary-foreground opacity-100'
              : 'border-border bg-card text-foreground opacity-0 group-hover:opacity-100'
          }`}
        >
          <MagicWandIcon className="size-3" />
          {definition?.name ?? block.type}
        </div>

        <div
          className={`absolute -top-3 right-3 z-20 flex gap-0.5 rounded-full border bg-card p-0.5 transition ${
            selected ? 'border-primary/30 opacity-100' : 'border-border opacity-0 group-hover:opacity-100'
          }`}
        >
          <button
            type="button"
            aria-label="Drag block"
            className="grid size-6 place-items-center rounded-full text-muted-foreground hover:bg-muted"
            {...attributes}
            {...listeners}
            onPointerDown={(event) => event.stopPropagation()}
          >
            <DragHandleDots2Icon className="size-3.5" />
          </button>
          <button
            type="button"
            aria-label="Move up"
            disabled={index === 0}
            onClick={(event) => {
              event.stopPropagation();
              onMove(block.id, -1);
            }}
            className="grid size-6 place-items-center rounded-full text-muted-foreground hover:bg-muted disabled:opacity-40"
          >
            <ArrowUpIcon className="size-3.5" />
          </button>
          <button
            type="button"
            aria-label="Move down"
            disabled={index === siblingsCount - 1}
            onClick={(event) => {
              event.stopPropagation();
              onMove(block.id, 1);
            }}
            className="grid size-6 place-items-center rounded-full text-muted-foreground hover:bg-muted disabled:opacity-40"
          >
            <ArrowDownIcon className="size-3.5" />
          </button>
          <button
            type="button"
            aria-label="Duplicate"
            onClick={(event) => {
              event.stopPropagation();
              onDuplicate(block.id);
            }}
            className="grid size-6 place-items-center rounded-full text-muted-foreground hover:bg-muted"
          >
            <ClipboardCopyIcon className="size-3.5" />
          </button>
          <button
            type="button"
            aria-label="Remove block"
            onClick={(event) => {
              event.stopPropagation();
              onRemove(block.id);
            }}
            className="grid size-6 place-items-center rounded-full text-error hover:bg-error/10"
          >
            <TrashIcon className="size-3.5" />
          </button>
        </div>

        {blockBody}
      </div>
    </div>
  );
};

const CanvasSortableNode = memo(function CanvasSortableNode(props: {
  block: VibeBlock;
  parentId: 'root' | string;
  selectedBlockId: string | null;
  onSelect: (blockId: string) => void;
  onRemove: (blockId: string) => void;
  onDuplicate: (blockId: string) => void;
  onMove: (blockId: string, delta: number) => void;
  onContextMenu: (event: MouseEvent, block: VibeBlock) => void;
  index: number;
  siblingsCount: number;
  previewMode: PreviewMode;
  registerBlockEl: (id: string, el: HTMLElement | null) => void;
}) {
  const effectiveSelectedId = props.selectedBlockId;
  const selected = props.block.id === effectiveSelectedId;
  return (
    <CanvasSortableNodeInner
      block={props.block}
      parentId={props.parentId}
      selected={selected}
      selectedBlockId={props.selectedBlockId}
      onSelect={props.onSelect}
      onRemove={props.onRemove}
      onDuplicate={props.onDuplicate}
      onMove={props.onMove}
      onContextMenu={props.onContextMenu}
      index={props.index}
      siblingsCount={props.siblingsCount}
      previewMode={props.previewMode}
      registerBlockEl={props.registerBlockEl}
    />
  );
});

const QuickAdd = ({
  type,
  onAdd,
}: {
  type: VibeBlockType;
  onAdd: (type: VibeBlockType) => void;
}) => {
  const definition = componentRegistry[type];
  return (
    <button
      type="button"
      onClick={() => onAdd(type)}
      className="group flex flex-col gap-2 overflow-hidden rounded-lg border border-border bg-card p-2 text-left transition hover:border-primary/50"
    >
      <BlockThumbnail type={type} />
      <span className="px-1 text-sm font-medium text-foreground">{definition.name}</span>
    </button>
  );
};

export const BuilderCanvas = ({
  blocks,
  selectedBlockId,
  previewMode,
  zoom = 1,
  onSelect,
  onRemove,
  onDuplicate,
  onMove,
  onAdd,
  onCopyStyle,
  onPasteStyle,
  onResetStyle,
  canPasteStyle = false,
  onOpenNavigator,
}: {
  blocks: VibeBlock[];
  selectedBlockId: string | null;
  previewMode: PreviewMode;
  zoom?: number;
  onSelect: (blockId: string | null) => void;
  onRemove: (blockId: string) => void;
  onDuplicate: (blockId: string) => void;
  onMove: (blockId: string, delta: number) => void;
  onAdd?: (type: VibeBlockType) => void;
  onCopyStyle?: (blockId: string) => void;
  onPasteStyle?: (blockId: string) => void;
  onResetStyle?: (blockId: string) => void;
  canPasteStyle?: boolean;
  onOpenNavigator?: () => void;
}) => {
  const blockElementsRef = useRef<Map<string, HTMLElement>>(new Map());

  const registerBlockEl = useCallback(
    (id: string, el: HTMLElement | null) => {
      if (el) blockElementsRef.current.set(id, el);
      else blockElementsRef.current.delete(id);
    },
    []
  );

  useEffect(() => {
    if (!selectedBlockId) return;
    const el = blockElementsRef.current.get(selectedBlockId);
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [selectedBlockId]);

  const { setNodeRef, isOver } = useDroppable({ id: 'builder-canvas' });
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    block: VibeBlock;
  } | null>(null);

  useEffect(() => {
    if (!contextMenu) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setContextMenu(null);
      }
    };
    const onScroll = () => setContextMenu(null);
    window.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onScroll, true);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onScroll, true);
    };
  }, [contextMenu]);

  const contextMenuPosition = useMemo(() => {
    if (!contextMenu) return { left: 0, top: 0 };
    const menuW = 230;
    const menuH = 320;
    const x = Math.min(contextMenu.x, window.innerWidth - menuW - 8);
    const y = Math.min(contextMenu.y, window.innerHeight - menuH - 8);
    return { left: Math.max(8, x), top: Math.max(8, y) };
  }, [contextMenu]);
  const previewMaxWidth =
    previewMode === 'mobile' ? 430 : previewMode === 'tablet' ? 820 : 1180;
  const previewTypography =
    previewMode === 'mobile'
      ? '[&_.vibe-hero-title]:!text-4xl [&_.vibe-hero-title]:!leading-tight'
      : '';

  const rootIds = blocks.map((b) => b.id);

  return (
    <main
      className="relative min-h-[36rem] flex-1 overflow-auto bg-[radial-gradient(circle_at_1px_1px,hsl(var(--border))_1px,transparent_0)] [background-size:22px_22px] md:min-h-0"
      onClick={() => {
        setContextMenu(null);
        onSelect(null);
      }}
      data-testid="builder-canvas"
    >
      <div className={`mx-auto px-4 py-8 ${previewTypography}`} style={{ maxWidth: previewMaxWidth + 80 }}>
        <div
          className="mx-auto origin-top transition-[max-width] duration-300"
          style={{
            maxWidth: previewMaxWidth,
            transform: `scale(${zoom})`,
            transformOrigin: 'top center',
          }}
        >
          <div
            ref={setNodeRef}
            data-testid="builder-canvas-dropzone"
            className={`min-h-[calc(100dvh-220px)] rounded-2xl border-2 border-dashed p-3 transition-[background,border,box-shadow] duration-200 ${
              isOver
                ? 'border-primary bg-primary-50/70 shadow-inner'
                : 'border-border bg-background/65'
            }`}
            onClick={(event) => event.stopPropagation()}
          >
            {blocks.length === 0 ? (
              <div className="flex min-h-[460px] flex-col items-center justify-center gap-6 rounded-2xl bg-card p-8 text-center">
                <div className="grid size-14 place-items-center rounded-full bg-primary-50 text-primary ring-1 ring-primary/20">
                  <Component1Icon className="size-6" />
                </div>
                <div className="max-w-md">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
                    Empty canvas
                  </p>
                  <h2 className="mt-2 font-display text-2xl font-semibold text-foreground">
                    Drop a Blockloom component here
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Pick a quick start below, drag from the palette, or press{' '}
                    <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[11px]">
                      ⌘K
                    </kbd>{' '}
                    to insert any block.
                  </p>
                </div>
                {onAdd && (
                  <div className="grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
                    <QuickAdd type="hero" onAdd={onAdd} />
                    <QuickAdd type="features" onAdd={onAdd} />
                    <QuickAdd type="footer" onAdd={onAdd} />
                  </div>
                )}
              </div>
            ) : (
              <SortableContext items={rootIds} strategy={verticalListSortingStrategy}>
                <div className="grid gap-4 pb-8 pt-10">
                  {blocks.map((block, index) => (
                    <CanvasSortableNode
                      key={block.id}
                      block={block}
                      parentId="root"
                      selectedBlockId={selectedBlockId}
                      onSelect={onSelect}
                      onRemove={onRemove}
                      onDuplicate={onDuplicate}
                      onMove={onMove}
                      onContextMenu={(event, item) => {
                        event.preventDefault();
                        event.stopPropagation();
                        onSelect(item.id);
                        setContextMenu({ x: event.clientX, y: event.clientY, block: item });
                      }}
                      index={index}
                      siblingsCount={blocks.length}
                      previewMode={previewMode}
                      registerBlockEl={registerBlockEl}
                    />
                  ))}
                </div>
              </SortableContext>
            )}
          </div>
        </div>
      </div>
      {contextMenu && (
        <div
          className="fixed z-[110] w-56 overflow-hidden rounded-xl border border-border bg-card p-1 shadow-[0_18px_60px_-28px_rgba(0,0,0,0.85)]"
          style={{ left: contextMenuPosition.left, top: contextMenuPosition.top }}
          onClick={(event) => event.stopPropagation()}
        >
          {[
            { label: 'Duplicate', action: () => onDuplicate(contextMenu.block.id) },
            { label: 'Move up', action: () => onMove(contextMenu.block.id, -1) },
            { label: 'Move down', action: () => onMove(contextMenu.block.id, 1) },
            { label: 'Copy style', action: () => onCopyStyle?.(contextMenu.block.id) },
            {
              label: 'Paste style',
              disabled: !canPasteStyle,
              action: () => onPasteStyle?.(contextMenu.block.id),
            },
            { label: 'Reset style', action: () => onResetStyle?.(contextMenu.block.id) },
            { label: 'Open navigator', action: () => onOpenNavigator?.() },
            { label: 'Delete', danger: true, action: () => onRemove(contextMenu.block.id) },
          ].map((item) => (
            <button
              key={item.label}
              type="button"
              disabled={item.disabled}
              className={`flex h-8 w-full items-center rounded-lg px-3 text-left text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
                item.danger ? 'text-error hover:bg-error/10' : 'text-foreground hover:bg-muted'
              }`}
              onClick={() => {
                item.action();
                setContextMenu(null);
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </main>
  );
};
