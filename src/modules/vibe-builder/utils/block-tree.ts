import { arrayMove } from '@dnd-kit/sortable';
import { componentRegistry } from '../components/component-registry';
import type { VibeBlock, VibeBlockType, VibePageLayout } from '../types';
import { createId } from './slug';

export const CONTAINER_BLOCK_TYPES: ReadonlySet<VibeBlockType> = new Set([
  'section',
  'container',
  'stack',
]);

export const isContainerBlock = (type: VibeBlockType): boolean => CONTAINER_BLOCK_TYPES.has(type);

export const migrateLayoutToV2 = (layout: VibePageLayout): VibePageLayout => {
  const normalizeBlock = (b: VibeBlock): VibeBlock => {
    const children = b.children?.length
      ? b.children.map(normalizeBlock)
      : undefined;
    return {
      ...b,
      children,
    };
  };
  if (layout.version === 2) {
    return { version: 2, blocks: layout.blocks.map(normalizeBlock) };
  }
  return {
    version: 2,
    blocks: layout.blocks.map((b) => normalizeBlock({ ...b, children: undefined })),
  };
};

export const deepCloneBlockProps = (props: Record<string, unknown>): Record<string, unknown> =>
  typeof structuredClone === 'function'
    ? structuredClone(props)
    : JSON.parse(JSON.stringify(props));

export const deepCloneBlockShallow = (block: VibeBlock): VibeBlock => ({
  ...block,
  props: deepCloneBlockProps(block.props),
  children: block.children?.map(deepCloneBlockShallow),
});

export const deepCloneLayout = (layout: VibePageLayout): VibePageLayout => {
  const v2 = migrateLayoutToV2(layout);
  return { version: 2, blocks: v2.blocks.map(deepCloneBlockShallow) };
};

/** Depth-first flatten (unique ids). */
export const flattenBlocks = (blocks: VibeBlock[]): VibeBlock[] => {
  const out: VibeBlock[] = [];
  const walk = (list: VibeBlock[]) => {
    for (const b of list) {
      out.push(b);
      if (b.children?.length) walk(b.children);
    }
  };
  walk(blocks);
  return out;
};

export const findBlockById = (blocks: VibeBlock[], id: string): VibeBlock | null => {
  for (const b of blocks) {
    if (b.id === id) return b;
    if (b.children?.length) {
      const found = findBlockById(b.children, id);
      if (found) return found;
    }
  }
  return null;
};

type ParentRef =
  | { kind: 'root' }
  | { kind: 'node'; block: VibeBlock };

export const findBlockParent = (
  blocks: VibeBlock[],
  id: string,
  parent: ParentRef = { kind: 'root' }
): { parent: ParentRef; list: VibeBlock[]; index: number } | null => {
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    if (b.id === id) {
      return { parent, list: blocks, index: i };
    }
    if (b.children?.length) {
      const nested = findBlockParent(b.children, id, { kind: 'node', block: b });
      if (nested) return nested;
    }
  }
  return null;
};

export const remapBlockIds = (block: VibeBlock): VibeBlock => ({
  ...block,
  id: createId(block.type),
  props: deepCloneBlockProps(block.props),
  children: block.children?.map(remapBlockIds),
});

export const updateBlockPropsInTree = (
  blocks: VibeBlock[],
  id: string,
  patch: Record<string, unknown>
): VibeBlock[] =>
  blocks.map((b) => {
    if (b.id === id) {
      return { ...b, props: { ...b.props, ...patch } };
    }
    if (b.children?.length) {
      return { ...b, children: updateBlockPropsInTree(b.children, id, patch) };
    }
    return b;
  });

export const removeBlockFromTree = (blocks: VibeBlock[], id: string): VibeBlock[] =>
  blocks
    .filter((b) => b.id !== id)
    .map((b) =>
      b.children?.length
        ? { ...b, children: removeBlockFromTree(b.children, id) }
        : b
    );

/** Insert at root level. */
export const insertBlockAtRoot = (
  blocks: VibeBlock[],
  block: VibeBlock,
  index: number
): VibeBlock[] => {
  const next = [...blocks];
  const at = Math.max(0, Math.min(index, next.length));
  next.splice(at, 0, block);
  return next;
};

/** Insert as child of parentId (container). Fails silently if parent not a container. */
export const insertChildBlock = (
  blocks: VibeBlock[],
  parentId: string,
  block: VibeBlock,
  index: number
): VibeBlock[] =>
  blocks.map((b) => {
    if (b.id === parentId && isContainerBlock(b.type)) {
      const ch = [...(b.children ?? [])];
      const at = Math.max(0, Math.min(index, ch.length));
      ch.splice(at, 0, block);
      return { ...b, children: ch.length ? ch : undefined };
    }
    if (b.children?.length) {
      return { ...b, children: insertChildBlock(b.children, parentId, block, index) };
    }
    return b;
  });

const parentKey = (p: ParentRef): string => (p.kind === 'root' ? 'root' : p.block.id);

/** True if `maybeDesc` is nested inside the subtree rooted at `ancestorId`. */
export const blockContainsDescendant = (
  blocks: VibeBlock[],
  ancestorId: string,
  maybeDesc: string
): boolean => {
  const root = findBlockById(blocks, ancestorId);
  if (!root?.children?.length) return false;
  return Boolean(findBlockById(root.children, maybeDesc));
};

export const reorderSiblingsInTree = (
  blocks: VibeBlock[],
  activeId: string,
  overId: string
): VibeBlock[] | null => {
  const a = findBlockParent(blocks, activeId);
  const o = findBlockParent(blocks, overId);
  if (!a || !o) return null;
  const sameParent = parentKey(a.parent) === parentKey(o.parent);
  if (!sameParent) return null;
  if (a.index === o.index) return blocks;
  const reordered = arrayMove([...a.list], a.index, o.index);
  return replaceChildList(blocks, a.parent, reordered);
};

/** Move `movingId` to sit before `beforeId` in the combined tree (any parents). */
export const moveBlockBeforeInTree = (
  blocks: VibeBlock[],
  movingId: string,
  beforeId: string
): VibeBlock[] | null => {
  if (movingId === beforeId) return null;
  if (blockContainsDescendant(blocks, movingId, beforeId)) return null;
  const a = findBlockParent(blocks, movingId);
  const b = findBlockParent(blocks, beforeId);
  if (!a || !b) return null;
  if (parentKey(a.parent) === parentKey(b.parent)) {
    return reorderSiblingsInTree(blocks, movingId, beforeId);
  }
  const hit = a.list[a.index];
  const tree = removeBlockFromTree(blocks, movingId);
  const b2 = findBlockParent(tree, beforeId);
  if (!b2) return null;
  const targetParentId = b2.parent.kind === 'root' ? 'root' : b2.parent.block.id;
  return moveBlockToParent(tree, hit.id, targetParentId, b2.index);
};

function replaceChildList(
  blocks: VibeBlock[],
  parent: ParentRef,
  newList: VibeBlock[]
): VibeBlock[] {
  if (parent.kind === 'root') {
    return newList;
  }
  const pid = parent.block.id;
  return blocks.map((b) => {
    if (b.id === pid) {
      return { ...b, children: newList.length ? newList : undefined };
    }
    if (b.children?.length) {
      return { ...b, children: replaceChildList(b.children, parent, newList) };
    }
    return b;
  });
}

/** Move block from any position into parent's child list at index (for cross-container). */
export const moveBlockToParent = (
  blocks: VibeBlock[],
  blockId: string,
  targetParentId: 'root' | string,
  index: number
): VibeBlock[] => {
  const hit = findBlockById(blocks, blockId);
  if (!hit) return blocks;
  const without = removeBlockFromTree(blocks, blockId);
  if (targetParentId === 'root') {
    return insertBlockAtRoot(without, hit, index);
  }
  return insertChildBlock(without, targetParentId, hit, index);
};

export const moveBlockByDeltaInTree = (
  blocks: VibeBlock[],
  blockId: string,
  delta: number
): VibeBlock[] | null => {
  const info = findBlockParent(blocks, blockId);
  if (!info) return null;
  const { list, index } = info;
  const target = index + delta;
  if (target < 0 || target >= list.length) return null;
  const reordered = arrayMove([...list], index, target);
  return replaceChildList(blocks, info.parent, reordered);
};

export const duplicateBlockInTree = (
  blocks: VibeBlock[],
  blockId: string
): { tree: VibeBlock[]; duplicateId: string } | null => {
  const info = findBlockParent(blocks, blockId);
  if (!info) return null;
  const original = info.list[info.index];
  const copy = remapBlockIds(original);
  const list = [...info.list];
  list.splice(info.index + 1, 0, copy);
  const tree = replaceChildList(blocks, info.parent, list);
  return { tree, duplicateId: copy.id };
};

/** Normalize layout for shallow compare (layoutsMatch). */
export function layoutsDeepEqual(a: VibePageLayout, b: VibePageLayout): boolean {
  const norm = migrateLayoutToV2(a);
  const normB = migrateLayoutToV2(b);
  return JSON.stringify(norm) === JSON.stringify(normB);
}

export function newBlockFromType(type: VibeBlockType): VibeBlock {
  const definition = componentRegistry[type];
  return {
    id: createId(type),
    type,
    props: { ...definition.defaultProps },
  };
}
