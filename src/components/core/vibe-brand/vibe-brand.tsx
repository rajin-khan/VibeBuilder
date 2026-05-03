import type { CSSProperties } from 'react';

interface BaseProps {
  className?: string;
  style?: CSSProperties;
  title?: string;
}

/**
 * Product mark — compact geometric “B” used across app chrome.
 */
export const VibeMark = ({ className, style, title = 'Blockloom' }: BaseProps) => (
  <img
    src="/vibe-assets/blockloom-icon.png"
    alt={title}
    draggable={false}
    className={'inline-block select-none rounded-[9px] object-contain ' + (className ?? '')}
    style={style}
  />
);

/**
 * Product wordmark. Tagline uses uppercase sans tracking.
 */
export const VibeWordmark = ({
  className,
  style,
  tagline,
}: BaseProps & { tagline?: string }) => (
  <span
    className={'inline-flex items-center gap-2.5 ' + (className ?? '')}
    style={style}
  >
    <VibeMark className="relative h-7 w-7" />
    <span className="flex flex-col leading-none">
      <span className="font-display text-[1.15rem] font-semibold tracking-[-0.03em] text-foreground">
        Blockloom
      </span>
      {tagline ? (
        <span className="mt-1 text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          {tagline}
        </span>
      ) : null}
    </span>
  </span>
);
