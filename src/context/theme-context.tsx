
"use client";

import { createContext } from 'react';

export type Theme = 'pink' | 'blue';

export type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
  isThemeLoaded: boolean;
};

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
