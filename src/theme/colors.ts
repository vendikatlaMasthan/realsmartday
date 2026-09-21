// SmartDay Design System Color Tokens
// Teal (#0D9488) primary, Purple (#7C3AED) today/accent, Gold (#D97706) streak freeze, Red (#DC2626) overdue, Green (#16A34A) done

export const lightColors = {
  // Backgrounds
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceSecondary: '#F1F5F9',
  surfaceElevated: '#FFFFFF',
  surfaceHighlight: '#E6FBF2',

  // Borders
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  borderFocus: '#006951',
  glassBorder: 'rgba(15, 23, 42, 0.06)',
  aiBorderGlow: 'rgba(5, 150, 105, 0.25)',

  // Primary: Academic Emerald
  primary: '#006951',
  primaryDeep: '#004D40',
  primaryLight: '#059669',
  primaryDark: '#00382E',
  primarySurface: '#E6FBF2',
  primaryTextOn: '#FFFFFF',

  // Purple (Today / Accent)
  purple: '#7C3AED',
  purpleLight: '#8B5CF6',
  purpleSurface: '#F5F3FF',
  secondaryLight: '#8B5CF6',

  // AI Glow & Accent
  aiAccent: '#059669',
  aiGradientStart: '#059669',
  aiGradientEnd: '#004D40',

  // Gold (Streak Freeze / Skip)
  gold: '#D97706',
  goldLight: '#F59E0B',
  goldSurface: '#FEF3C7',

  // Overdue / Danger
  red: '#DC2626',
  danger: '#DC2626',
  dangerSurface: '#FEF2F2',

  // Done / Success
  green: '#16A34A',
  success: '#16A34A',
  successSurface: '#DCFCE7',

  // Warning & Info
  warning: '#D97706',
  warningSurface: '#FEF3C7',
  info: '#0284C7',
  infoSurface: '#E0F2FE',

  // Priority Colors
  priorityHigh: '#DC2626',
  priorityHighBg: '#FEF2F2',
  priorityMed: '#D97706',
  priorityMedBg: '#FEF3C7',
  priorityLow: '#16A34A',
  priorityLowBg: '#DCFCE7',

  // Typography
  textPrimary: '#0F1720', // Ink
  textSecondary: '#6B7280', // Muted
  textTertiary: '#9CA3AF',
  textInverse: '#FFFFFF',

  // Hero Gradients: teal-500 -> teal-700 -> deep navy
  heroGradient: ['#14B8A6', '#0F766E', '#091522'],

  // Tab bar
  tabBarBg: '#FFFFFF',
  tabBarBorder: '#E5E7EB',
  tabBarActive: '#0D9488',
  tabBarInactive: '#6B7280',
  tabBarIndicator: '#CCFBF1',

  // Overlays
  shadowColor: '#0F1720',
  overlay: 'rgba(15, 23, 32, 0.5)',
};

export const darkColors = {
  // Backgrounds
  background: '#0B0D10',
  surface: '#16181C',
  surfaceSecondary: '#1E2126',
  surfaceElevated: '#24282F',
  surfaceHighlight: '#1A292C',

  // Borders
  border: '#272B33',
  borderLight: '#1F2228',
  borderFocus: '#14B8A6',
  glassBorder: 'rgba(255, 255, 255, 0.08)',
  aiBorderGlow: 'rgba(20, 184, 166, 0.3)',

  // Primary: SmartDay Teal
  primary: '#14B8A6',
  primaryDeep: '#0D9488',
  primaryLight: '#2DD4BF',
  primaryDark: '#0F766E',
  primarySurface: 'rgba(13, 148, 136, 0.16)',
  primaryTextOn: '#FFFFFF',

  // Purple (Today / Accent)
  purple: '#A78BFA',
  purpleLight: '#C4B5FD',
  purpleSurface: 'rgba(124, 58, 237, 0.16)',
  secondaryLight: '#C4B5FD',

  // AI Glow & Accent
  aiAccent: '#2DD4BF',
  aiGradientStart: '#0F766E',
  aiGradientEnd: '#0D9488',

  // Gold (Streak Freeze / Skip)
  gold: '#FBBF24',
  goldLight: '#FCD34D',
  goldSurface: 'rgba(217, 119, 6, 0.18)',

  // Overdue / Danger
  red: '#F87171',
  danger: '#EF4444',
  dangerSurface: 'rgba(220, 38, 38, 0.18)',

  // Done / Success
  green: '#4ADE80',
  success: '#22C55E',
  successSurface: 'rgba(22, 163, 74, 0.18)',

  // Warning & Info
  warning: '#FBBF24',
  warningSurface: 'rgba(217, 119, 6, 0.18)',
  info: '#38BDF8',
  infoSurface: 'rgba(2, 132, 199, 0.18)',

  // Priority Colors
  priorityHigh: '#F87171',
  priorityHighBg: 'rgba(220, 38, 38, 0.18)',
  priorityMed: '#FBBF24',
  priorityMedBg: 'rgba(217, 119, 6, 0.18)',
  priorityLow: '#4ADE80',
  priorityLowBg: 'rgba(22, 163, 74, 0.18)',

  // Typography
  textPrimary: '#F5F7FA', // Ink Dark
  textSecondary: '#9CA3AF', // Muted Dark
  textTertiary: '#6B7280',
  textInverse: '#0B0D10',

  // Hero Gradients
  heroGradient: ['#0F766E', '#115E59', '#060B12'],

  // Tab bar
  tabBarBg: '#16181C',
  tabBarBorder: '#272B33',
  tabBarActive: '#2DD4BF',
  tabBarInactive: '#6B7280',
  tabBarIndicator: 'rgba(13, 148, 136, 0.25)',

  // Overlays
  shadowColor: '#000000',
  overlay: 'rgba(0, 0, 0, 0.75)',
};

export type ThemeColors = typeof lightColors;
