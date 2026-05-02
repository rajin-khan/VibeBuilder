import { useMemo, useState } from 'react';
import { ImageIcon, MagnifyingGlassIcon, UpdateIcon, UploadIcon } from '@radix-ui/react-icons';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui-kit/dialog';
import { Input } from '@/components/ui-kit/input';
import { Button } from '@/components/ui-kit/button';
import { useAssets, useUploadAsset } from '../hooks/use-vibe-builder';
import type { Asset } from '../types';

export interface AssetPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  websiteId: string;
  ownerId: string;
  /** Single-select (default): one tap chooses and closes. */
  onSelect: (url: string) => void;
  /** When true, pick many from the grid or upload several files at once. */
  multiple?: boolean;
  onSelectMany?: (urls: string[]) => void;
}

type Tab = 'recent' | 'all' | 'upload';

const formatBytes = (bytes: number) => {
  if (!bytes) return '';
  if (bytes > 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
  if (bytes > 1_000) return `${(bytes / 1_000).toFixed(0)} KB`;
  return `${bytes} B`;
};

const AssetCard = ({
  asset,
  selected,
  selectionMode,
  onToggle,
  onSelectSingle,
}: {
  asset: Asset;
  selected: boolean;
  selectionMode: 'single' | 'multi';
  onToggle: () => void;
  onSelectSingle: (url: string) => void;
}) => (
  <button
    type="button"
    className={`group flex flex-col gap-1.5 overflow-hidden rounded-lg border bg-card text-left transition hover:-translate-y-0.5 hover:shadow-pop ${
      selected ? 'ring-2 ring-primary border-primary/50' : 'border-border hover:border-primary/40'
    }`}
    onClick={() => {
      if (selectionMode === 'multi') {
        onToggle();
      } else {
        onSelectSingle(asset.url);
      }
    }}
  >
    <div className="relative aspect-[4/3] w-full bg-muted">
      {selectionMode === 'multi' && (
        <span
          className={`absolute right-2 top-2 z-10 grid size-5 place-items-center rounded border text-[10px] font-bold ${
            selected ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background/90 text-muted-foreground'
          }`}
        >
          {selected ? '✓' : ''}
        </span>
      )}
      {asset.url ? (
        <img
          src={asset.url}
          alt={asset.fileName}
          className="size-full object-cover"
          loading="lazy"
        />
      ) : (
        <span className="flex size-full items-center justify-center text-muted-foreground">
          <ImageIcon className="size-5" />
        </span>
      )}
    </div>
    <div className="px-2 pb-2">
      <p className="truncate text-[12px] font-medium text-foreground">{asset.fileName}</p>
      <p className="text-[10.5px] text-muted-foreground">{formatBytes(asset.size)}</p>
    </div>
  </button>
);

export const AssetPicker = ({
  open,
  onOpenChange,
  websiteId,
  ownerId,
  onSelect,
  multiple = false,
  onSelectMany,
}: AssetPickerProps) => {
  const [tab, setTab] = useState<Tab>('all');
  const [query, setQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [selectedUrls, setSelectedUrls] = useState<Set<string>>(() => new Set());

  const selectionMode = multiple ? 'multi' : 'single';

  const { data: assets = [], isLoading } = useAssets(websiteId);
  const uploadAsset = useUploadAsset();

  const filtered = useMemo(() => {
    if (!query.trim()) return assets;
    const q = query.toLowerCase();
    return assets.filter((asset) => asset.fileName.toLowerCase().includes(q));
  }, [assets, query]);

  const recent = filtered.slice(0, 12);

  const toggleUrl = (url: string) => {
    setSelectedUrls((prev) => {
      const next = new Set(prev);
      if (next.has(url)) {
        next.delete(url);
      } else {
        next.add(url);
      }
      return next;
    });
  };

  const handleUploadSingle = async (file: File) => {
    setError(null);
    try {
      const asset = await uploadAsset.mutateAsync({
        file,
        websiteId,
        ownerId,
      });
      const url = asset.url || URL.createObjectURL(file);
      onSelect(url);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      onSelect(URL.createObjectURL(file));
      onOpenChange(false);
    }
  };

  const handleUploadMultiple = async (files: FileList | null) => {
    if (!files?.length) return;
    setError(null);
    const list = [...files];
    const urls: string[] = [];
    try {
      for (const file of list) {
        try {
          const asset = await uploadAsset.mutateAsync({
            file,
            websiteId,
            ownerId,
          });
          urls.push(asset.url || URL.createObjectURL(file));
        } catch {
          urls.push(URL.createObjectURL(file));
        }
      }
      if (multiple && onSelectMany) {
        onSelectMany(urls);
      } else if (urls[0]) {
        onSelect(urls[0]);
      }
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    }
  };

  const confirmMultiSelection = () => {
    if (!multiple || !onSelectMany || selectedUrls.size === 0) return;
    onSelectMany([...selectedUrls]);
    setSelectedUrls(new Set());
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) {
          setSelectedUrls(new Set());
        }
        onOpenChange(value);
      }}
    >
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="font-display text-lg font-semibold">
            {multiple ? 'Choose images' : 'Choose an image'}
          </DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 p-0.5">
          {(
            [
              { id: 'all', label: 'All site assets' },
              { id: 'recent', label: 'Recent uploads' },
              { id: 'upload', label: 'Upload new' },
            ] as { id: Tab; label: string }[]
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`flex-1 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                tab === t.id
                  ? 'bg-card text-primary shadow-pop ring-1 ring-primary/20'
                  : 'text-muted-foreground hover:bg-card/60 hover:text-foreground'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {multiple && tab !== 'upload' && (
          <p className="text-[11px] text-muted-foreground">
            Tap assets to select several, then confirm. Selected: {selectedUrls.size}
          </p>
        )}

        {tab !== 'upload' && (
          <label className="relative block">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Filter assets…"
              className="pl-9"
            />
          </label>
        )}

        {tab === 'upload' ? (
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/30 p-10 text-center transition hover:border-primary/40">
            <UploadIcon className="size-6 text-primary" />
            <p className="text-sm font-medium text-foreground">
              {uploadAsset.isPending ? 'Uploading…' : multiple ? 'Drop or click to upload (multiple)' : 'Drop or click to upload'}
            </p>
            <p className="text-xs text-muted-foreground">
              PNG, JPG, SVG, WebP. Stored in your project media library.
            </p>
            <input
              type="file"
              accept="image/*"
              multiple={multiple}
              className="sr-only"
              onChange={(event) => {
                const { files } = event.target;
                if (!files?.length) return;
                if (multiple) {
                  void handleUploadMultiple(files);
                } else {
                  handleUploadSingle(files[0]);
                }
                event.target.value = '';
              }}
            />
          </label>
        ) : isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <UpdateIcon className="size-6 animate-spin text-primary" />
          </div>
        ) : (tab === 'recent' ? recent : filtered).length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/30 p-10 text-center">
            <ImageIcon className="size-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No assets yet.</p>
            <Button size="sm" variant="outline" onClick={() => setTab('upload')}>
              Upload your first image
            </Button>
          </div>
        ) : (
          <div className="grid max-h-[60vh] grid-cols-2 gap-3 overflow-auto p-1 sm:grid-cols-3 lg:grid-cols-4">
            {(tab === 'recent' ? recent : filtered).map((asset) => (
              <AssetCard
                key={asset.id}
                asset={asset}
                selected={selectedUrls.has(asset.url)}
                selectionMode={selectionMode}
                onToggle={() => asset.url && toggleUrl(asset.url)}
                onSelectSingle={(url) => {
                  onSelect(url);
                  onOpenChange(false);
                }}
              />
            ))}
          </div>
        )}

        {error && (
          <p className="text-xs text-error" role="alert">
            {error}
          </p>
        )}

        {multiple && tab !== 'upload' && (
          <div className="flex justify-end gap-2 border-t border-border pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSelectedUrls(new Set())}
              disabled={selectedUrls.size === 0}
            >
              Clear selection
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={selectedUrls.size === 0 || !onSelectMany}
              onClick={confirmMultiSelection}
            >
              Add {selectedUrls.size || ''} image{selectedUrls.size === 1 ? '' : 's'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
