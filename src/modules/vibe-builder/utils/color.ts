/**
 * Lightweight color helpers: parse hex/rgb/hsl, compute relative luminance, and
 * pick legible foreground colors for any background. The renderer leans on
 * these so user-chosen background colors never clash with hardcoded slate text.
 */

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export type Rgb = { r: number; g: number; b: number; a: number };

const cssNamedColors: Record<string, string> = {
  white: '#ffffff',
  black: '#000000',
  transparent: 'rgba(0,0,0,0)',
};

const parseHex = (hex: string): Rgb | null => {
  const value = hex.replace('#', '').trim();
  if (![3, 4, 6, 8].includes(value.length)) {
    return null;
  }

  const expand = (segment: string) => (segment.length === 1 ? `${segment}${segment}` : segment);

  if (value.length === 3 || value.length === 4) {
    const r = parseInt(expand(value[0]), 16);
    const g = parseInt(expand(value[1]), 16);
    const b = parseInt(expand(value[2]), 16);
    const a = value.length === 4 ? parseInt(expand(value[3]), 16) / 255 : 1;
    if ([r, g, b].some((segment) => Number.isNaN(segment))) {
      return null;
    }
    return { r, g, b, a };
  }

  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  const a = value.length === 8 ? parseInt(value.slice(6, 8), 16) / 255 : 1;
  if ([r, g, b].some((segment) => Number.isNaN(segment))) {
    return null;
  }
  return { r, g, b, a };
};

const parseRgb = (input: string): Rgb | null => {
  const match = input.match(/rgba?\(([^)]+)\)/i);
  if (!match) {
    return null;
  }
  const parts = match[1]
    .split(/[\s,/]+/)
    .map((segment) => segment.trim())
    .filter(Boolean);
  if (parts.length < 3) {
    return null;
  }
  const [r, g, b, a = '1'] = parts;
  return {
    r: clamp(Number(r), 0, 255),
    g: clamp(Number(g), 0, 255),
    b: clamp(Number(b), 0, 255),
    a: a.includes('%') ? clamp(Number(a.replace('%', '')) / 100, 0, 1) : clamp(Number(a), 0, 1),
  };
};

const hslToRgb = (h: number, s: number, l: number): { r: number; g: number; b: number } => {
  const C = (1 - Math.abs(2 * l - 1)) * s;
  const hh = (h / 60) % 6;
  const X = C * (1 - Math.abs((hh % 2) - 1));
  let r = 0;
  let g = 0;
  let b = 0;

  if (hh >= 0 && hh < 1) [r, g, b] = [C, X, 0];
  else if (hh < 2) [r, g, b] = [X, C, 0];
  else if (hh < 3) [r, g, b] = [0, C, X];
  else if (hh < 4) [r, g, b] = [0, X, C];
  else if (hh < 5) [r, g, b] = [X, 0, C];
  else [r, g, b] = [C, 0, X];

  const m = l - C / 2;
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
};

const parseHsl = (input: string): Rgb | null => {
  const match = input.match(/hsla?\(([^)]+)\)/i);
  if (!match) {
    return null;
  }
  const parts = match[1]
    .split(/[\s,/]+/)
    .map((segment) => segment.trim())
    .filter(Boolean);
  if (parts.length < 3) {
    return null;
  }
  const [hRaw, sRaw, lRaw, aRaw = '1'] = parts;
  const h = Number(hRaw.replace('deg', '')) || 0;
  const s = clamp(Number(sRaw.replace('%', '')) / 100, 0, 1);
  const l = clamp(Number(lRaw.replace('%', '')) / 100, 0, 1);
  const a = aRaw.includes('%')
    ? clamp(Number(aRaw.replace('%', '')) / 100, 0, 1)
    : clamp(Number(aRaw), 0, 1);

  return { ...hslToRgb(h, s, l), a };
};

export const parseColor = (value: string | undefined | null): Rgb | null => {
  if (!value) {
    return null;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  const named = cssNamedColors[trimmed.toLowerCase()];
  if (named) {
    return parseColor(named);
  }

  if (trimmed.startsWith('#')) {
    return parseHex(trimmed);
  }
  if (trimmed.toLowerCase().startsWith('rgb')) {
    return parseRgb(trimmed);
  }
  if (trimmed.toLowerCase().startsWith('hsl')) {
    return parseHsl(trimmed);
  }
  if (/^[0-9a-fA-F]{3,8}$/.test(trimmed)) {
    return parseHex(`#${trimmed}`);
  }
  return null;
};

export const toRgba = (color: Rgb) => `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;

const linearize = (channel: number) => {
  const c = channel / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};

export const relativeLuminance = (color: Rgb) =>
  0.2126 * linearize(color.r) + 0.7152 * linearize(color.g) + 0.0722 * linearize(color.b);

export const isDarkColor = (input: string | Rgb | null | undefined) => {
  const color = typeof input === 'string' || input === null || input === undefined ? parseColor(input ?? '') : input;
  if (!color) {
    return false;
  }
  return relativeLuminance(color) < 0.42;
};

export type ContrastTokens = {
  isDark: boolean;
  /** Strong, near-foreground color (primary text). */
  strong: string;
  /** Body color (secondary text, ~70% emphasis). */
  body: string;
  /** Muted color (~55% emphasis). */
  muted: string;
  /** Faint divider/hairline color. */
  divider: string;
  /** Surface that contrasts with the parent (cards). */
  surface: string;
  /** A border that pairs well with the surface. */
  surfaceBorder: string;
};

export const contrastTokens = (background: string | undefined | null): ContrastTokens => {
  const dark = isDarkColor(background ?? '#ffffff');

  if (dark) {
    return {
      isDark: true,
      strong: 'rgba(255,255,255,0.96)',
      body: 'rgba(255,255,255,0.78)',
      muted: 'rgba(255,255,255,0.6)',
      divider: 'rgba(255,255,255,0.18)',
      surface: 'rgba(255,255,255,0.08)',
      surfaceBorder: 'rgba(255,255,255,0.16)',
    };
  }

  return {
    isDark: false,
    strong: 'rgba(15, 23, 42, 0.96)',
    body: 'rgba(15, 23, 42, 0.7)',
    muted: 'rgba(15, 23, 42, 0.55)',
    divider: 'rgba(15, 23, 42, 0.1)',
    surface: 'rgba(255, 255, 255, 0.85)',
    surfaceBorder: 'rgba(15, 23, 42, 0.08)',
  };
};

const HEX_HASH = /^#?([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/;

export const isHexColor = (value: string | undefined | null) =>
  typeof value === 'string' && HEX_HASH.test(value.trim());

export const ensureHex = (value: string | undefined | null, fallback = '#000000') => {
  if (!value) {
    return fallback;
  }
  if (isHexColor(value)) {
    return value.startsWith('#') ? value : `#${value}`;
  }
  const parsed = parseColor(value);
  if (!parsed) {
    return fallback;
  }
  const toPair = (channel: number) => clamp(Math.round(channel), 0, 255).toString(16).padStart(2, '0');
  return `#${toPair(parsed.r)}${toPair(parsed.g)}${toPair(parsed.b)}`;
};

export const withAlpha = (color: string | undefined | null, alpha: number) => {
  const parsed = parseColor(color ?? '#000000');
  if (!parsed) {
    return `rgba(0, 0, 0, ${alpha})`;
  }
  return `rgba(${parsed.r}, ${parsed.g}, ${parsed.b}, ${clamp(alpha, 0, 1)})`;
};

export const mix = (base: string | undefined | null, overlay: string, ratio: number) => {
  const a = parseColor(base ?? '#ffffff');
  const b = parseColor(overlay);
  if (!a || !b) {
    return base ?? overlay;
  }
  const r = Math.round(a.r * (1 - ratio) + b.r * ratio);
  const g = Math.round(a.g * (1 - ratio) + b.g * ratio);
  const blue = Math.round(a.b * (1 - ratio) + b.b * ratio);
  return `rgb(${r}, ${g}, ${blue})`;
};

export const accentForBackground = (accent: string | undefined | null, background: string | undefined | null) => {
  if (!accent) {
    return undefined;
  }
  const accentColor = parseColor(accent);
  const backgroundColor = parseColor(background ?? '');
  if (!accentColor || !backgroundColor) {
    return accent;
  }

  const accentLum = relativeLuminance(accentColor);
  const bgLum = relativeLuminance(backgroundColor);
  const contrast = (Math.max(accentLum, bgLum) + 0.05) / (Math.min(accentLum, bgLum) + 0.05);

  if (contrast >= 2.5) {
    return accent;
  }

  return bgLum < 0.42
    ? mix(accent, '#ffffff', 0.45)
    : mix(accent, '#0f172a', 0.35);
};
