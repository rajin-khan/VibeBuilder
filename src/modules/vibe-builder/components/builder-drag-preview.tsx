import { BlockThumbnail } from './block-thumbnail';
import { componentRegistry } from './component-registry';
import { VibeBlock, VibeBlockType } from '../types';
import { findBlockById } from '../utils/block-tree';

const PALETTE_PREFIX = 'palette-';

export const BuilderDragPreview = ({
  activeId,
  blocks,
}: {
  activeId: string | null;
  blocks: VibeBlock[];
}) => {
  if (!activeId) return null;

  const id = String(activeId);

  if (id.startsWith(PALETTE_PREFIX)) {
    const type = id.slice(PALETTE_PREFIX.length) as VibeBlockType;
    const def = componentRegistry[type];
    if (!def) return null;

    return (
      <div className="pointer-events-none w-64 max-w-[85vw] cursor-grabbing overflow-hidden rounded-lg border border-border/90 bg-card shadow-lg ring-1 ring-primary/20">
        <div className="w-full">
          <BlockThumbnail type={type} className="rounded-b-none ring-0" />
          <div className="border-t border-border/80 bg-card/95 px-3 py-2">
            <p className="truncate text-[11px] font-semibold leading-tight text-foreground">{def.name}</p>
            <p className="mt-1 truncate text-[10px] text-muted-foreground">{def.preview}</p>
          </div>
        </div>
      </div>
    );
  }

  const rawId = id.startsWith('layers:') ? id.slice(7) : id;
  const block = findBlockById(blocks, rawId);
  if (!block) return null;

  const def = componentRegistry[block.type];
  return (
    <div className="pointer-events-none flex max-w-sm cursor-grabbing items-center gap-2.5 rounded-lg border border-border/90 bg-card px-2.5 py-2 shadow-lg ring-1 ring-primary/20">
      <div className="w-24 shrink-0 overflow-hidden rounded-md border border-border/80 bg-muted/20">
        <BlockThumbnail type={block.type} className="!aspect-[4/3] ring-0" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-[11px] font-semibold leading-tight text-foreground">{def?.name ?? block.type}</p>
        <p className="text-[10px] text-muted-foreground">Reorder block</p>
      </div>
    </div>
  );
};
