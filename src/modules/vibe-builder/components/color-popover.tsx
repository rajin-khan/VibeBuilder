import { useEffect, useState } from 'react';
import { ColorWheelIcon } from '@radix-ui/react-icons';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui-kit/popover';
import { Input } from '@/components/ui-kit/input';
import { ensureHex } from '../utils/color';

const PRESET_SWATCHES = [
  '#0B0B12',
  '#1F2937',
  '#475569',
  '#94A3B8',
  '#E2E8F0',
  '#FFFFFF',
  '#4F46E5',
  '#6366F1',
  '#A855F7',
  '#EC4899',
  '#FB7185',
  '#F97316',
  '#F59E0B',
  '#10B981',
  '#06B6D4',
  '#0EA5E9',
];

const RECENT_KEY = 'vibe-builder-recent-colors-v1';

const loadRecent = (): string[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
};

const saveRecent = (next: string[]) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(next.slice(0, 12)));
  } catch {
    /* ignore */
  }
};

interface EyeDropperConstructor {
  new (): { open: () => Promise<{ sRGBHex: string }> };
}

export interface ColorPopoverProps {
  value: string;
  onChange: (next: string) => void;
  onReset?: () => void;
  testId?: string;
  ariaLabel?: string;
}

export const ColorPopover = ({
  value,
  onChange,
  onReset,
  testId,
  ariaLabel,
}: ColorPopoverProps) => {
  const hex = ensureHex(value, '#0B0B12');
  const [recent, setRecent] = useState<string[]>(() => loadRecent());
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!value) return;
    const upper = value.toUpperCase();
    setRecent((prev) => {
      const next = [upper, ...prev.filter((c) => c.toUpperCase() !== upper)].slice(0, 12);
      saveRecent(next);
      return next;
    });
  }, [value]);

  const eyedropperAvailable =
    typeof window !== 'undefined' && typeof (window as unknown as { EyeDropper?: EyeDropperConstructor }).EyeDropper === 'function';

  const handleEyedropper = async () => {
    if (!eyedropperAvailable) return;
    try {
      const Constructor = (window as unknown as { EyeDropper: EyeDropperConstructor }).EyeDropper;
      const picker = new Constructor();
      const result = await picker.open();
      onChange(result.sRGBHex);
      setOpen(false);
    } catch {
      /* user cancelled */
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label={ariaLabel ?? 'Pick color'}
            data-testid={testId ? `${testId}-trigger` : undefined}
            className="relative inline-block h-9 w-12 cursor-pointer overflow-hidden rounded-lg border border-border shadow-pop"
            style={{ background: hex }}
          />
        </PopoverTrigger>
        <PopoverContent align="start" className="w-72 p-3">
          <div className="grid grid-cols-8 gap-1.5">
            {PRESET_SWATCHES.map((swatch) => (
              <button
                key={swatch}
                type="button"
                aria-label={`Color ${swatch}`}
                onClick={() => {
                  onChange(swatch);
                  setOpen(false);
                }}
                className="size-7 rounded-md border border-border shadow-pop transition hover:scale-110"
                style={{ background: swatch }}
              />
            ))}
          </div>
          {recent.length > 0 && (
            <>
              <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Recent
              </p>
              <div className="mt-1.5 grid grid-cols-8 gap-1.5">
                {recent.map((swatch) => (
                  <button
                    key={swatch}
                    type="button"
                    aria-label={`Recent color ${swatch}`}
                    onClick={() => {
                      onChange(swatch);
                      setOpen(false);
                    }}
                    className="size-7 rounded-md border border-border shadow-pop transition hover:scale-110"
                    style={{ background: swatch }}
                  />
                ))}
              </div>
            </>
          )}
          <div className="mt-3 flex items-center gap-2">
            <input
              type="color"
              aria-label="Native color picker"
              value={hex}
              onChange={(event) => onChange(event.target.value)}
              className="size-9 cursor-pointer rounded-md border border-border bg-transparent p-0"
              data-testid={testId ? `${testId}-native` : undefined}
            />
            <Input
              data-testid={testId}
              value={value}
              placeholder="#000000"
              onChange={(event) => onChange(event.target.value)}
              className="font-mono text-xs"
            />
            {eyedropperAvailable && (
              <button
                type="button"
                aria-label="Pick from screen"
                onClick={handleEyedropper}
                className="grid size-9 place-items-center rounded-md border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <ColorWheelIcon className="size-4" />
              </button>
            )}
          </div>
        </PopoverContent>
      </Popover>
      <Input
        data-testid={testId ? `${testId}-inline` : undefined}
        value={value}
        placeholder="#000000"
        onChange={(event) => onChange(event.target.value)}
        className="font-mono text-xs"
      />
      {value && onReset && (
        <button
          type="button"
          className="flex-none text-[11px] font-semibold text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          onClick={onReset}
        >
          Reset
        </button>
      )}
    </div>
  );
};
