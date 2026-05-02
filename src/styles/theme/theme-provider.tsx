import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getThemeColors, type HSLColor } from './utils/utils';

/**
 * Vibe uses a single dark chrome. Light/system modes and persistence are
 * intentionally disabled so marketing surfaces (gradient heroes, white text)
 * always match a dark token set.
 */
type Theme = 'dark' | 'light' | 'system';

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  colors: {
    primary: string;
    secondary: string;
  };
  setTheme: (theme: Theme) => void;
};

type ColorPalette = {
  [key: string]: HSLColor;
};

const initialState: ThemeProviderState = {
  theme: 'dark',
  colors: {
    primary: import.meta.env.VITE_PRIMARY_COLOR || '',
    secondary: import.meta.env.VITE_SECONDARY_COLOR || '',
  },
  setTheme: () => null,
};

const ThemeContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
}: Readonly<ThemeProviderProps>) {
  const [colors, setColors] = useState(() => {
    const themeColors = getThemeColors();
    const currentTheme = themeColors.dark;
    const defaultPrimary = import.meta.env.VITE_PRIMARY_COLOR || '#4F46E5';
    const defaultSecondary = import.meta.env.VITE_SECONDARY_COLOR || '#FB7185';

    const resolveColor = (
      color: string | HSLColor | ColorPalette | null | undefined,
      defaultValue: string
    ): string => {
      if (!color) return defaultValue;
      if (typeof color === 'string') return color;

      const hslColor = color as HSLColor;
      if (
        hslColor &&
        typeof hslColor === 'object' &&
        'h' in hslColor &&
        's' in hslColor &&
        'l' in hslColor
      ) {
        return `hsl(${hslColor.h}, ${hslColor.s}%, ${hslColor.l}%)`;
      }

      const colorPalette = color as ColorPalette;
      const firstColor = Object.values(colorPalette)[0];
      if (firstColor && 'h' in firstColor && 's' in firstColor && 'l' in firstColor) {
        return `hsl(${firstColor.h}, ${firstColor.s}%, ${firstColor.l}%)`;
      }

      return defaultValue;
    };

    const primaryColor = resolveColor(currentTheme.primary, defaultPrimary);
    const secondaryColor = resolveColor(currentTheme.secondary, defaultSecondary);

    return {
      primary: primaryColor,
      secondary: secondaryColor,
    };
  });

  useEffect(() => {
    const { dark } = getThemeColors();
    const style = document.documentElement.style;

    const setColorVariables = (prefix: string, palette: ColorPalette) => {
      Object.entries(palette).forEach(([key, value]) => {
        if (value) {
          style.setProperty(`--${prefix}-${key}`, `${value.h}, ${value.s}%, ${value.l}%`);
        }
      });
    };

    if (dark.primary) {
      setColorVariables('primary', dark.primary);
    }

    if (dark.secondary) {
      setColorVariables('secondary', dark.secondary);
    }

    setColors({
      primary: import.meta.env.VITE_PRIMARY_COLOR || '#4F46E5',
      secondary: import.meta.env.VITE_SECONDARY_COLOR || '#FB7185',
    });
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light');
    root.classList.add('dark');
  }, []);

  const value = useMemo(
    () => ({
      theme: 'dark' as Theme,
      colors,
      setTheme: () => {
        /* dark-only product shell */
      },
    }),
    [colors]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (context === undefined) throw new Error('useTheme must be used within a ThemeProvider');

  return context;
};
