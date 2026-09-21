import { Platform, ViewStyle } from 'react-native';

// Soft, subtle shadows for elevated cards and floating bars
export const createShadows = (isDark: boolean) => ({
  none: {} as ViewStyle,
  sm: Platform.select<ViewStyle>({
    ios: {
      shadowColor: isDark ? '#000000' : '#0F172A',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.35 : 0.05,
      shadowRadius: 6,
    },
    android: {
      elevation: 2,
    },
    default: {},
  }) as ViewStyle,
  md: Platform.select<ViewStyle>({
    ios: {
      shadowColor: isDark ? '#000000' : '#0F172A',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: isDark ? 0.45 : 0.08,
      shadowRadius: 16,
    },
    android: {
      elevation: 5,
    },
    default: {},
  }) as ViewStyle,
  lg: Platform.select<ViewStyle>({
    ios: {
      shadowColor: isDark ? '#000000' : '#0F172A',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: isDark ? 0.55 : 0.12,
      shadowRadius: 24,
    },
    android: {
      elevation: 8,
    },
    default: {},
  }) as ViewStyle,
  tabBar: Platform.select<ViewStyle>({
    ios: {
      shadowColor: isDark ? '#000000' : '#0F172A',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: isDark ? 0.6 : 0.1,
      shadowRadius: 20,
    },
    android: {
      elevation: 12,
    },
    default: {},
  }) as ViewStyle,
  glow: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#6366F1',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: isDark ? 0.5 : 0.35,
      shadowRadius: 16,
    },
    android: {
      elevation: 6,
    },
    default: {},
  }) as ViewStyle,
});
