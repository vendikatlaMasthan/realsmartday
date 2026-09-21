// SmartDay Presentation Skin Definitions & Types
// Four Complete Distinct Visual Languages: Ember | Halo | Grove | Noir

export type SkinType = 'ember' | 'halo' | 'grove' | 'noir';
export type SkinId = SkinType;

export interface SkinColors {
  primary: string;
  accent: string;
  background: string;
  surface: string;
  surfaceSecondary: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  primarySurface: string;
  gold: string;
  green: string;
  purple: string;
}

export interface SkinBorderRadius {
  card: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
}

export interface SkinPalette {
  id: SkinType;
  name: string;
  tagline: string;
  primary: string;
  accent: string;
  background: string;
  surface: string;
  surfaceSubtle: string;
  cardRadius: number; // 20–32
  ink: string;
  inkMuted: string;
  inkLight: string;
  border: string;
  tabBarBg: string;
  tabBarActive: string;
  tabBarInactive: string;
  colors: SkinColors;
  borderRadius: SkinBorderRadius;
  heroGradient?: string[];
  calendarGradient?: string[];
  timerGradient?: string[];
  badgeColors: {
    urgent: string;
    medium: string;
    normal: string;
  };
}

export const SKINS: Record<SkinType, SkinPalette> = {
  // 1) SKIN A — EMBER / EMERALD STUDENT OS
  // Cohesive Emerald Forest Academic theme
  ember: {
    id: 'ember',
    name: 'Emerald Student OS',
    tagline: 'Deep Forest Academic & Focus Tracking',
    primary: '#006951', // Deep Academic Emerald
    accent: '#059669',  // Mint Emerald
    background: '#F8FAFC', // Clean Slate Canvas
    surface: '#FFFFFF', // Crisp White Card
    surfaceSubtle: '#F1F5F9',
    cardRadius: 24,
    ink: '#0F172A',
    inkMuted: '#64748B',
    inkLight: '#94A3B8',
    border: 'rgba(0, 0, 0, 0.06)',
    tabBarBg: '#FFFFFF',
    tabBarActive: '#059669',
    tabBarInactive: '#64748B',
    colors: {
      primary: '#006951',
      accent: '#059669',
      background: '#F8FAFC',
      surface: '#FFFFFF',
      surfaceSecondary: '#F1F5F9',
      border: 'rgba(0, 0, 0, 0.06)',
      textPrimary: '#0F172A',
      textSecondary: '#64748B',
      textTertiary: '#94A3B8',
      primarySurface: '#E6FBF2',
      gold: '#F59E0B',
      green: '#10B981',
      purple: '#8B5CF6',
    },
    borderRadius: {
      card: 24,
      sm: 8,
      md: 14,
      lg: 20,
      xl: 24,
    },
    heroGradient: ['#004D40', '#075E4D', '#0B5646'],
    calendarGradient: ['#004D40', '#075E4D', '#0B5646'],
    timerGradient: ['#004D40', '#075E4D', '#0B5646'],
    badgeColors: {
      urgent: '#EF4444',
      medium: '#F59E0B',
      normal: '#64748B',
    },
  },

  // 2) SKIN B — HALO (Shot 2)
  // Off-white canvas, white cards 28-32 radius, diffuse shadow only.
  // Black selected pills. Gradient bars pink -> peach -> lime.
  // Floating dark tab bar with RAISED CENTER TAB in a white circle.
  halo: {
    id: 'halo',
    name: 'Halo',
    tagline: 'Team Productivity & Soft Diffuse Cards',
    primary: '#111827', // Black selected pills
    accent: '#0284C7',  // Sky Blue
    background: '#F8FAFC', // Off-white canvas
    surface: '#FFFFFF',    // Crisp white cards
    surfaceSubtle: '#F1F5F9',
    cardRadius: 30,
    ink: '#0F172A',
    inkMuted: '#64748B',
    inkLight: '#94A3B8',
    border: 'rgba(0, 0, 0, 0.06)',
    tabBarBg: '#111827',
    tabBarActive: '#FFFFFF',
    tabBarInactive: '#9CA3AF',
    colors: {
      primary: '#111827',
      accent: '#0284C7',
      background: '#F8FAFC',
      surface: '#FFFFFF',
      surfaceSecondary: '#F1F5F9',
      border: 'rgba(0, 0, 0, 0.07)',
      textPrimary: '#0F172A',
      textSecondary: '#64748B',
      textTertiary: '#94A3B8',
      primarySurface: 'rgba(17, 24, 39, 0.06)',
      gold: '#EAB308',
      green: '#22C55E',
      purple: '#8B5CF6',
    },
    borderRadius: {
      card: 30,
      sm: 10,
      md: 16,
      lg: 24,
      xl: 30,
    },
    badgeColors: {
      urgent: '#EF4444',
      medium: '#F59E0B',
      normal: '#64748B',
    },
  },

  // 3) SKIN C — GROVE (Shot 3)
  // Olive topographic contour map FULL background. Never a white canvas.
  // Weather row: 23° · 70% rain + avatar.
  // Week chips: selected white rounded square, dark translucent others.
  // Horizontal snap task cards (~72% width with peek next).
  grove: {
    id: 'grove',
    name: 'Grove',
    tagline: 'Smart Farming & Organic Topography',
    primary: '#FFFFFF', // High-contrast White for selected week chip & text
    accent: '#84CC16',  // Lime sprout
    background: '#454E3D', // Olive canvas
    surface: '#2F3528',    // Dark olive card
    surfaceSubtle: 'rgba(255, 255, 255, 0.1)',
    cardRadius: 26,
    ink: '#FFFFFF',
    inkMuted: 'rgba(255, 255, 255, 0.72)',
    inkLight: 'rgba(255, 255, 255, 0.48)',
    border: 'rgba(255, 255, 255, 0.12)',
    tabBarBg: 'rgba(30, 36, 26, 0.94)',
    tabBarActive: '#FFFFFF',
    tabBarInactive: 'rgba(255, 255, 255, 0.5)',
    colors: {
      primary: '#84CC16',
      accent: '#FFFFFF',
      background: '#454E3D',
      surface: '#2F3528',
      surfaceSecondary: 'rgba(255, 255, 255, 0.1)',
      border: 'rgba(255, 255, 255, 0.14)',
      textPrimary: '#FFFFFF',
      textSecondary: 'rgba(255, 255, 255, 0.72)',
      textTertiary: 'rgba(255, 255, 255, 0.48)',
      primarySurface: 'rgba(132, 204, 22, 0.2)',
      gold: '#F59E0B',
      green: '#84CC16',
      purple: '#A855F7',
    },
    borderRadius: {
      card: 26,
      sm: 8,
      md: 14,
      lg: 20,
      xl: 26,
    },
    badgeColors: {
      urgent: '#EA580C', // Orange Urgent
      medium: '#D97706', // Gold Medium
      normal: '#525C47', // Dark Olive Normal
    },
  },

  // 4) SKIN D — NOIR (Section 0.8 Spec)
  // Canvas #0B0D10, surface #16181C, ink #F5F7FA, accent teal #0D9488, gold for streaks.
  // Rings-first Home (Apple Health energy).
  noir: {
    id: 'noir',
    name: 'Noir',
    tagline: 'Minimalist Engineering & Pure OLED',
    primary: '#0D9488', // Deep Teal
    accent: '#14B8A6',  // Vibrant Teal
    background: '#0B0D10', // Deepest OLED black
    surface: '#16181C',    // Dark slate card
    surfaceSubtle: '#22252B',
    cardRadius: 22,
    ink: '#F5F7FA',
    inkMuted: '#94A3B8',
    inkLight: '#64748B',
    border: 'rgba(255, 255, 255, 0.08)',
    tabBarBg: '#121418',
    tabBarActive: '#0D9488',
    tabBarInactive: '#64748B',
    colors: {
      primary: '#0D9488',
      accent: '#14B8A6',
      background: '#0B0D10',
      surface: '#16181C',
      surfaceSecondary: '#22252B',
      border: 'rgba(255, 255, 255, 0.09)',
      textPrimary: '#F5F7FA',
      textSecondary: '#94A3B8',
      textTertiary: '#64748B',
      primarySurface: 'rgba(13, 148, 136, 0.16)',
      gold: '#F59E0B',
      green: '#10B981',
      purple: '#6366F1',
    },
    borderRadius: {
      card: 22,
      sm: 6,
      md: 12,
      lg: 18,
      xl: 22,
    },
    badgeColors: {
      urgent: '#EF4444',
      medium: '#F59E0B',
      normal: '#334155',
    },
  },
};
