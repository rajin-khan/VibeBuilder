import { CSSProperties } from 'react';
import { WebsiteTheme, defaultWebsiteTheme } from '../types';

const RADIUS_MAP: Record<WebsiteTheme['baseRadius'], string> = {
  none: '0px',
  sm: '6px',
  md: '12px',
  lg: '18px',
  xl: '28px',
  pill: '999px',
};

const hexToHsl = (hex: string): string => {
  const value = hex.trim().replace('#', '');
  const expanded =
    value.length === 3
      ? value
          .split('')
          .map((c) => c + c)
          .join('')
      : value;
  if (expanded.length !== 6) return '0 0% 0%';
  const r = parseInt(expanded.slice(0, 2), 16) / 255;
  const g = parseInt(expanded.slice(2, 4), 16) / 255;
  const b = parseInt(expanded.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
};

export const themeToStyle = (
  theme: WebsiteTheme | undefined
): CSSProperties => {
  const merged: WebsiteTheme = { ...defaultWebsiteTheme, ...(theme ?? {}) };
  return {
    ['--vibe-primary' as never]: merged.primaryColor,
    ['--vibe-accent' as never]: merged.accentColor,
    ['--vibe-bg' as never]: merged.backgroundColor,
    ['--vibe-fg' as never]: merged.textColor,
    ['--vibe-radius' as never]: RADIUS_MAP[merged.baseRadius],
    ['--vibe-heading' as never]: `'${merged.headingFont}', ui-sans-serif, system-ui`,
    ['--vibe-body' as never]: `'${merged.bodyFont}', ui-sans-serif, system-ui`,
    ['--primary' as never]: hexToHsl(merged.primaryColor),
    ['--accent' as never]: hexToHsl(merged.accentColor),
    ['--background' as never]: hexToHsl(merged.backgroundColor),
    ['--foreground' as never]: hexToHsl(merged.textColor),
    color: merged.textColor,
    backgroundColor: merged.backgroundColor,
    fontFamily: `var(--vibe-body)`,
  };
};

export const radiusToValue = (radius: WebsiteTheme['baseRadius']): string =>
  RADIUS_MAP[radius];
