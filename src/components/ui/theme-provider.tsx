'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes/dist/types';

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

// Maritime Theme Context
export interface MaritimeTheme {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleTheme: () => void;
}

const MaritimeThemeContext = React.createContext<MaritimeTheme | undefined>(undefined);

export function MaritimeThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = React.useState<'light' | 'dark' | 'system'>('light');

  const toggleTheme = React.useCallback(() => {
    setTheme(current => {
      if (current === 'light') return 'dark';
      if (current === 'dark') return 'light';
      return 'system';
    });
  }, []);

  const value = React.useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme,
    }),
    [theme, toggleTheme]
  );

  return (
    <MaritimeThemeContext.Provider value={value}>
      {children}
    </MaritimeThemeContext.Provider>
  );
}

export function useMaritimeTheme() {
  const context = React.useContext(MaritimeThemeContext);
  if (context === undefined) {
    throw new Error('useMaritimeTheme must be used within a MaritimeThemeProvider');
  }
  return context;
}

// Maritime Color Palettes
export const MARITIME_COLORS = {
  light: {
    primary: 'hsl(215, 25%, 25%)', // Navy blue
    secondary: 'hsl(210, 40%, 95%)', // Light blue-gray
    accent: 'hsl(43, 96%, 85%)', // Light gold/amber
    muted: 'hsl(210, 16%, 93%)', // Very light blue-gray
    destructive: 'hsl(0, 84%, 60%)', // Maritime red
    success: 'hsl(142, 76%, 50%)', // Success green
    warning: 'hsl(43, 96%, 70%)', // Gold
    background: 'hsl(210, 40%, 98%)', // Light blue-gray background
    foreground: 'hsl(222, 84%, 20%)', // Deep navy for text
  },
  dark: {
    primary: 'hsl(43, 96%, 70%)', // Gold primary in dark mode
    secondary: 'hsl(215, 25%, 15%)', // Dark navy secondary
    accent: 'hsl(43, 96%, 75%)', // Slightly lighter gold
    muted: 'hsl(215, 25%, 12%)', // Very dark navy
    destructive: 'hsl(0, 84%, 65%)', // Slightly lighter red
    success: 'hsl(142, 76%, 50%)', // Success green
    warning: 'hsl(43, 96%, 75%)', // Gold
    background: 'hsl(222, 84%, 4%)', // Very dark navy background
    foreground: 'hsl(210, 40%, 98%)', // Light blue-gray text
  },
} as const;

// Maritime Typography Settings
export const MARITIME_TYPOGRAPHY = {
  fontFamily: {
    sans: 'var(--font-geist-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: 'var(--font-geist-mono), "JetBrains Mono", Consolas, monospace',
  },
  fontSize: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '1.875rem',  // 30px
    '4xl': '2.25rem',   // 36px
    '5xl': '3rem',      // 48px
  },
  lineHeight: {
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
} as const;

// Maritime Component Variants
export const MARITIME_VARIANTS = {
  button: {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    navy: 'bg-primary text-primary-foreground hover:bg-primary/90',
    ocean: 'bg-chart-2 text-white hover:bg-chart-2/90',
    gold: 'bg-chart-4 text-primary-foreground hover:bg-chart-4/90',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    success: 'bg-chart-5 text-white hover:bg-chart-5/90',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    link: 'text-primary underline-offset-4 hover:underline',
  },
  card: {
    default: 'bg-white border border-gray-200 shadow-sm',
    navy: 'bg-primary text-primary-foreground shadow-lg',
    ocean: 'bg-gradient-to-br from-chart-2/10 to-chart-3/10 border border-chart-2/20',
    gold: 'bg-gradient-to-br from-chart-4/10 to-chart-4/5 border border-chart-4/20',
  },
  badge: {
    default: 'bg-primary text-primary-foreground',
    navy: 'bg-primary text-primary-foreground',
    ocean: 'bg-chart-2 text-white',
    gold: 'bg-chart-4 text-primary-foreground',
    success: 'bg-chart-5 text-white',
    warning: 'bg-chart-4 text-primary-foreground',
    destructive: 'bg-destructive text-destructive-foreground',
  },
} as const;

// Utility function to get maritime color
export function getMaritimeColor(
  colorName: keyof typeof MARITIME_COLORS.light,
  theme: 'light' | 'dark' = 'light'
): string {
  return theme === 'dark' ? MARITIME_COLORS.dark[colorName] : MARITIME_COLORS.light[colorName];
}

// Utility function to get maritime size class
export function getMaritimeSize(size: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl'): string {
  return `text-${size}`;
}

// Maritime spacing utilities
export const MARITIME_SPACING = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '0.75rem',
  lg: '1rem',
  xl: '1.5rem',
  '2xl': '2rem',
  '3xl': '3rem',
  '4xl': '4rem',
  '5xl': '5rem',
} as const;

// Maritime shadow utilities
export const MARITIME_SHADOWS = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  default: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1%), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  maritime: '0 1px 3px 0 rgb(30 41 59 / 10%), 0 1px 2px 0 rgb(30 41 59 / 6%)',
  'maritime-lg': '0 10px 15px -3px rgb(30 41 59 / 10%), 0 4px 6px -2px rgb(30 41 59 / 5%)',
  'maritime-xl': '0 20px 25px -5px rgb(30 41 59 / 10%), 0 10px 10px -5px rgb(30 41 59 / 4%)',
} as const;
