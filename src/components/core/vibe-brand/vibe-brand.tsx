import { CSSProperties } from 'react';

interface BaseProps {
  className?: string;
  style?: CSSProperties;
  title?: string;
}

/**
 * VibeMark — compact geometric sans “V” mark used across app chrome.
 */
export const VibeMark = ({ className, style, title = 'Vibe' }: BaseProps) => (
  <svg
    viewBox="0 0 96 96"
    role="img"
    aria-label={title}
    className={'inline-block select-none rounded-[9px] ' + (className ?? '')}
    style={style}
  >
    <rect x="7" y="7" width="82" height="82" rx="21" fill="#080B12" />
    <rect x="7.75" y="7.75" width="80.5" height="80.5" rx="20.25" fill="none" stroke="#F7F4EA" strokeOpacity="0.22" strokeWidth="1.5" />
    <path d="M23.5 24H37.2L48 56.2 58.8 24h13.7L54.4 70.5H41.6L23.5 24Z" fill="#F7F4EA" />
    <path d="M48 56.2 58.8 24h13.7L54.4 70.5H48V56.2Z" fill="#27D7C3" />
    <path d="M65.2 24h7.3L54.4 70.5H47.9L65.2 24Z" fill="#B8F15A" fillOpacity="0.9" />
    <circle cx="74" cy="74" r="4.5" fill="#F97362" />
  </svg>
);

/**
 * VibeWordmark — mark + “Vibe” in Geist/display. Tagline uses uppercase sans tracking.
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
        Vibe
      </span>
      {tagline ? (
        <span className="mt-1 text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          {tagline}
        </span>
      ) : null}
    </span>
  </span>
);
