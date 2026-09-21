import { lightColors, darkColors, ThemeColors } from './colors';
import { typography } from './typography';
import { spacing, layout } from './spacing';
import { borderRadius } from './borderRadius';
import { createShadows } from './shadows';

export interface Theme {
  isDark: boolean;
  colors: ThemeColors;
  typography: typeof typography;
  spacing: typeof spacing;
  layout: typeof layout;
  borderRadius: typeof borderRadius;
  shadows: ReturnType<typeof createShadows>;
}

export const createTheme = (isDark: boolean): Theme => ({
  isDark,
  colors: isDark ? darkColors : lightColors,
  typography,
  spacing,
  layout,
  borderRadius,
  shadows: createShadows(isDark),
});

export * from './colors';
export * from './typography';
export * from './spacing';
export * from './borderRadius';
export * from './shadows';
