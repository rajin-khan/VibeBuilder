import { create } from 'zustand';
import { VibeBlockType, VibePageLayout } from '../types';
import {
  deepCloneLayout,
  duplicateBlockInTree,
  findBlockById,
  flattenBlocks,
  insertBlockAtRoot,
  insertChildBlock,
  isContainerBlock,
  migrateLayoutToV2,
  moveBlockBeforeInTree,
  moveBlockByDeltaInTree,
  newBlockFromType,
  removeBlockFromTree,
  updateBlockPropsInTree,
} from '../utils/block-tree';

const HISTORY_LIMIT = 60;

const samePatch = (
  current: Record<string, unknown>,
  patch: Record<string, unknown>
) =>
  Object.entries(patch).every(([key, value]) => {
    if (Object.is(current[key], value)) {
      return true;
    }
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(current[key]) === JSON.stringify(value);
    }
    return false;
  });

export type AddBlockOptions = {
  index?: number;
  parentId?: 'root' | string;
};

type BuilderState = {
  layout: VibePageLayout;
  selectedBlockId: string | null;
  dirty: boolean;
  past: VibePageLayout[];
  future: VibePageLayout[];
  setLayout: (layout: VibePageLayout) => void;
  addBlock: (type: VibeBlockType, options?: AddBlockOptions) => void;
  duplicateBlock: (blockId: string) => void;
  selectBlock: (blockId: string | null) => void;
  updateBlockProps: (blockId: string, props: Record<string, unknown>) => void;
  removeBlock: (blockId: string) => void;
  reorderBlocks: (activeId: string, overId: string) => void;
  moveBlock: (blockId: string, delta: number) => void;
  undo: () => void;
  redo: () => void;
  markClean: () => void;
};

export const useBuilderStore = create<BuilderState>((set) => {
  const pushPast = (state: BuilderState): VibePageLayout[] => [
    ...state.past.slice(-HISTORY_LIMIT + 1),
    deepCloneLayout(state.layout),
  ];

  const empty = migrateLayoutToV2({ version: 1, blocks: [] });

  return {
    layout: empty,
    selectedBlockId: null,
    dirty: false,
    past: [],
    future: [],
    setLayout: (layout) =>
      set(() => {
        const normalized = migrateLayoutToV2(layout);
        const next = deepCloneLayout(normalized);
        return {
          layout: next,
          selectedBlockId: flattenBlocks(next.blocks)[0]?.id ?? null,
          dirty: false,
          past: [],
          future: [],
        };
      }),
    addBlock: (type, options) =>
      set((state) => {
        const block = newBlockFromType(type);
        const parentId = options?.parentId ?? 'root';
        const index = options?.index;
        const root = state.layout.blocks;
        let nextBlocks: VibeBlock[];

        if (parentId === 'root') {
          const at = typeof index === 'number' ? Math.max(0, Math.min(index, root.length)) : root.length;
          nextBlocks = insertBlockAtRoot(root, block, at);
        } else {
          const parent = findBlockById(root, parentId);
          if (!parent || !isContainerBlock(parent.type)) {
            nextBlocks = insertBlockAtRoot(root, block, root.length);
          } else {
            const len = parent.children?.length ?? 0;
            const at = typeof index === 'number' ? Math.max(0, Math.min(index, len)) : len;
            nextBlocks = insertChildBlock(root, parentId, block, at);
          }
        }

        return {
          past: pushPast(state),
          future: [],
          layout: { version: 2, blocks: nextBlocks },
          selectedBlockId: block.id,
          dirty: true,
        };
      }),
    duplicateBlock: (blockId) =>
      set((state) => {
        const result = duplicateBlockInTree(state.layout.blocks, blockId);
        if (!result) return state;

        return {
          past: pushPast(state),
          future: [],
          layout: { version: 2, blocks: result.tree },
          selectedBlockId: result.duplicateId,
          dirty: true,
        };
      }),
    selectBlock: (blockId) => set({ selectedBlockId: blockId }),
    updateBlockProps: (blockId, props) =>
      set((state) => {
        const target = findBlockById(state.layout.blocks, blockId);
        if (!target || samePatch(target.props, props)) {
          return state;
        }
        const nextBlocks = updateBlockPropsInTree(state.layout.blocks, blockId, props);
        const nextLayout = { version: 2 as const, blocks: nextBlocks };
        return {
          past: pushPast(state),
          future: [],
          layout: nextLayout,
          dirty: true,
        };
      }),
    removeBlock: (blockId) =>
      set((state) => {
        if (!findBlockById(state.layout.blocks, blockId)) return state;
        const nextBlocks = removeBlockFromTree(state.layout.blocks, blockId);
        const flat = flattenBlocks(nextBlocks);
        return {
          past: pushPast(state),
          future: [],
          layout: { version: 2, blocks: nextBlocks },
          selectedBlockId:
            state.selectedBlockId === blockId ? flat[0]?.id ?? null : state.selectedBlockId,
          dirty: true,
        };
      }),
    reorderBlocks: (activeId, overId) =>
      set((state) => {
        if (activeId === overId) return state;
        const next = moveBlockBeforeInTree(state.layout.blocks, activeId, overId);
        if (!next) return state;
        return {
          past: pushPast(state),
          future: [],
          layout: { version: 2, blocks: next },
          dirty: true,
        };
      }),
    moveBlock: (blockId, delta) =>
      set((state) => {
        const next = moveBlockByDeltaInTree(state.layout.blocks, blockId, delta);
        if (!next) return state;
        return {
          past: pushPast(state),
          future: [],
          layout: { version: 2, blocks: next },
          dirty: true,
        };
      }),
    undo: () =>
      set((state) => {
        const previous = state.past[state.past.length - 1];
        if (!previous) return state;
        return {
          past: state.past.slice(0, -1),
          future: [deepCloneLayout(state.layout), ...state.future],
          layout: previous,
          dirty: true,
        };
      }),
    redo: () =>
      set((state) => {
        const [next, ...rest] = state.future;
        if (!next) return state;
        return {
          past: [...state.past, deepCloneLayout(state.layout)],
          future: rest,
          layout: next,
          dirty: true,
        };
      }),
    markClean: () => set({ dirty: false }),
  };
});
