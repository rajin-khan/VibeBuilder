import { useMemo } from 'react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui-kit/command';
import {
  ChevronRightIcon,
  Component1Icon,
  ExternalLinkIcon,
  GearIcon,
  LayersIcon,
  PaperPlaneIcon,
} from '@radix-ui/react-icons';
import { categoryOrder, componentCategoryMeta, componentRegistry } from './component-registry';
import { VibeBlockType, WebsitePage } from '../types';

export interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pages: WebsitePage[];
  currentPageId?: string;
  insertMode?: 'insert-only';
  onInsertBlock: (type: VibeBlockType) => void;
  onJumpPage: (pageId: string) => void;
  onOpenSettings: () => void;
  onPublish: () => void;
  onOpenLive: () => void;
  canOpenLive: boolean;
}

export const CommandPalette = ({
  open,
  onOpenChange,
  pages,
  currentPageId,
  insertMode,
  onInsertBlock,
  onJumpPage,
  onOpenSettings,
  onPublish,
  onOpenLive,
  canOpenLive,
}: CommandPaletteProps) => {
  const grouped = useMemo(() => {
    return categoryOrder
      .map((category) => ({
        category,
        meta: componentCategoryMeta[category],
        types: (Object.keys(componentRegistry) as VibeBlockType[]).filter(
          (type) => componentRegistry[type].category === category
        ),
      }))
      .filter((entry) => entry.types.length > 0);
  }, []);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        aria-label={insertMode ? 'Search blocks to insert' : 'Search blocks, pages, and settings'}
        placeholder={insertMode ? 'Insert a block…' : 'Search blocks, pages, settings…'}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {!insertMode && (
          <>
            <CommandGroup heading="Pages">
              {pages.map((page) => (
                <CommandItem
                  key={page.id}
                  value={`page ${page.name}`}
                  onSelect={() => {
                    onJumpPage(page.id);
                    onOpenChange(false);
                  }}
                >
                  <LayersIcon />
                  <span className="truncate">{page.name}</span>
                  {page.id === currentPageId && (
                    <span className="ml-auto rounded-full bg-primary-50 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                      current
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Site">
              <CommandItem
                value="open site settings"
                onSelect={() => {
                  onOpenSettings();
                  onOpenChange(false);
                }}
              >
                <GearIcon />
                Site settings
                <CommandShortcut>theme · SEO · pages</CommandShortcut>
              </CommandItem>
              <CommandItem
                value="publish site"
                onSelect={() => {
                  onPublish();
                  onOpenChange(false);
                }}
              >
                <PaperPlaneIcon />
                Publish current page
              </CommandItem>
              {canOpenLive && (
                <CommandItem
                  value="view live"
                  onSelect={() => {
                    onOpenLive();
                    onOpenChange(false);
                  }}
                >
                  <ExternalLinkIcon />
                  View live site
                </CommandItem>
              )}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {grouped.map((entry) => (
          <CommandGroup key={entry.category} heading={`Insert · ${entry.meta.label}`}>
            {entry.types.map((type) => {
              const def = componentRegistry[type];
              return (
                <CommandItem
                  key={type}
                  value={`insert ${def.name} ${def.description}`}
                  onSelect={() => {
                    onInsertBlock(type);
                    onOpenChange(false);
                  }}
                >
                  <Component1Icon />
                  <span className="truncate">{def.name}</span>
                  <CommandShortcut>
                    <ChevronRightIcon className="size-3" />
                  </CommandShortcut>
                </CommandItem>
              );
            })}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
};
