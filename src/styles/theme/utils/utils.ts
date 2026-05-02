export type HSLColor = {
  h: number;
  s: number;
  l: number;
};

type ColorPalette = {
  [key: string]: HSLColor;
};

type ThemeColors = {
  primary: ColorPalette | null;
  secondary: ColorPalette | null;
};

import Color from 'color';

export const parseColor = (color: string): HSLColor | null => {
  try {
    const colorObj = new Color(color);
    const hslObj = colorObj.hsl().object();

    return {
      h: Math.round(hslObj.h || 0), // h can be undefined for grayscale colors
      s: Math.round(hslObj.s * 100 * 100) / 100,
      l: Math.round(hslObj.l * 100 * 100) / 100,
    };
  } catch (error) {
    console.error(`Failed to parse color: ${color}`, error);
    return null;
  }
};

export const generateColorPalette = (baseColor: string, isDark = false): ColorPalette | null => {
  const base = parseColor(baseColor);
  if (!base) return null;

  const { h, s: baseS } = base;
  const s = Math.min(100, baseS); // Ensure saturation doesn't exceed 100
  const isPrimary = baseColor === (import.meta.env.VITE_PRIMARY_COLOR || '');

  if (isDark) {
    if (isPrimary) {
      return {
        50: { h, s: Math.max(15, s * 0.3), l: 12 },
        100: { h, s: Math.max(20, s * 0.4), l: 17 },
        200: { h, s: Math.max(30, s * 0.5), l: 22 },
        300: { h, s: Math.max(40, s * 0.6), l: 28 },
        400: { h, s: Math.max(50, s * 0.7), l: 36 },
        500: { h, s: Math.max(60, s * 0.8), l: 42 },
        600: { h, s: Math.max(70, s * 0.9), l: 60 },
        700: { h, s: Math.max(80, s * 1.0), l: 72 },
        800: { h, s: Math.max(90, s * 1.0), l: 81 },
        900: { h, s: Math.max(95, s * 1.0), l: 94 },
      };
    }

    return {
      50: { h, s: Math.max(20, s * 0.3), l: 15 },
      100: { h, s: Math.max(25, s * 0.4), l: 22 },
      200: { h, s: Math.max(30, s * 0.5), l: 30 },
      300: { h, s: Math.max(40, s * 0.6), l: 40 },
      400: { h, s: Math.max(50, s * 0.7), l: 50 },
      500: { h, s: Math.max(60, s * 0.8), l: 60 },
      600: { h, s: Math.max(70, s * 0.9), l: 70 },
      700: { h, s: Math.max(80, s * 1.0), l: 80 },
      800: { h, s: Math.max(90, s * 1.0), l: 90 },
      900: { h, s: Math.max(95, s * 1.0), l: 95 },
    };
  }

  if (isPrimary) {
    return {
      50: { h, s: Math.max(15, s * 0.3), l: 88 },
      100: { h, s: Math.max(20, s * 0.4), l: 75 },
      200: { h, s: Math.max(15, s * 0.4), l: 64 },
      300: { h, s: Math.max(20, s * 0.5), l: 49 },
      400: { h, s: Math.max(30, s * 0.6), l: 38 },
      500: { h, s, l: 28 },
      600: { h, s, l: 26 },
      700: { h, s, l: 23 },
      800: { h, s, l: 21 },
      900: { h, s, l: 15 },
    };
  }

  return {
    50: { h, s: Math.max(10, s * 0.2), l: 97 },
    100: { h, s: Math.max(15, s * 0.3), l: 93 },
    200: { h, s: Math.max(20, s * 0.4), l: 85 },
    300: { h, s: Math.max(30, s * 0.5), l: 75 },
    400: { h, s: Math.max(40, s * 0.6), l: 65 },
    500: { h, s: Math.max(50, s * 0.7), l: 55 },
    600: { h, s: Math.max(60, s * 0.8), l: 45 },
    700: { h, s: Math.max(70, s * 0.9), l: 35 },
    800: { h, s: Math.max(80, s * 1.0), l: 25 },
    900: { h, s: Math.max(90, s * 1.0), l: 15 },
  };
};

// Iris (primary, deep indigo-violet) + Spark (accent, warm coral).
// These mirror the values in src/styles/globals.css so the runtime CSS-variable
// fallback (when no env-driven theme is present) matches the static stylesheet.
const defaultColors = {
  light: {
    primary: {
      50: { h: 226, s: 100, l: 97 },
      100: { h: 226, s: 100, l: 94 },
      200: { h: 228, s: 96, l: 89 },
      300: { h: 230, s: 94, l: 82 },
      400: { h: 234, s: 89, l: 74 },
      500: { h: 239, s: 84, l: 67 },
      600: { h: 244, s: 75, l: 58 },
      700: { h: 245, s: 58, l: 51 },
      800: { h: 244, s: 55, l: 41 },
      900: { h: 242, s: 47, l: 34 },
    },
    secondary: {
      50: { h: 356, s: 100, l: 97 },
      100: { h: 356, s: 100, l: 95 },
      200: { h: 353, s: 96, l: 90 },
      300: { h: 353, s: 96, l: 82 },
      400: { h: 351, s: 95, l: 72 },
      500: { h: 350, s: 89, l: 60 },
      600: { h: 347, s: 77, l: 50 },
      700: { h: 346, s: 84, l: 41 },
      800: { h: 343, s: 80, l: 35 },
      900: { h: 343, s: 75, l: 30 },
    },
  },
  dark: {
    primary: {
      50: { h: 244, s: 47, l: 18 },
      100: { h: 244, s: 49, l: 24 },
      200: { h: 244, s: 52, l: 30 },
      300: { h: 244, s: 55, l: 38 },
      400: { h: 245, s: 58, l: 48 },
      500: { h: 244, s: 75, l: 58 },
      600: { h: 239, s: 84, l: 67 },
      700: { h: 234, s: 89, l: 74 },
      800: { h: 230, s: 94, l: 82 },
      900: { h: 228, s: 96, l: 89 },
    },
    secondary: {
      50: { h: 343, s: 75, l: 22 },
      100: { h: 343, s: 78, l: 28 },
      200: { h: 346, s: 82, l: 34 },
      300: { h: 347, s: 78, l: 42 },
      400: { h: 350, s: 80, l: 52 },
      500: { h: 350, s: 89, l: 60 },
      600: { h: 351, s: 95, l: 72 },
      700: { h: 353, s: 96, l: 82 },
      800: { h: 353, s: 96, l: 90 },
      900: { h: 356, s: 100, l: 95 },
    },
  },
} as const;

export const getThemeColors = (): { light: ThemeColors; dark: ThemeColors } => {
  const primaryColor = import.meta.env.VITE_PRIMARY_COLOR || '';
  const secondaryColor = import.meta.env.VITE_SECONDARY_COLOR || '';

  // Only generate palettes if colors are provided in env
  const lightPrimary = primaryColor ? generateColorPalette(primaryColor, false) : null;
  const darkPrimary = primaryColor ? generateColorPalette(primaryColor, true) : null;
  const lightSecondary = secondaryColor ? generateColorPalette(secondaryColor, false) : null;
  const darkSecondary = secondaryColor ? generateColorPalette(secondaryColor, true) : null;

  return {
    light: {
      primary: lightPrimary || defaultColors.light.primary,
      secondary: lightSecondary || defaultColors.light.secondary,
    },
    dark: {
      primary: darkPrimary || defaultColors.dark.primary,
      secondary: darkSecondary || defaultColors.dark.secondary,
    },
  };
};
