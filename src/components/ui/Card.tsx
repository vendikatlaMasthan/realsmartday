import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export interface CardProps {
  children: React.ReactNode;
  variant?: 'elevated' | 'outlined' | 'flat' | 'ai';
  onPress?: () => void;
  style?: ViewStyle;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'elevated',
  onPress,
  style,
  padding = 'md',
}) => {
  const { theme } = useTheme();
  const { colors, borderRadius, spacing } = theme;

  const paddingVal = {
    none: 0,
    sm: spacing.sm,
    md: spacing.base,
    lg: spacing.xl,
  }[padding];

  let cardBg = colors.surface;
  let borderColor = colors.border;
  let borderWidth = 0;
  let shadowStyle = theme.shadows.none;

  if (variant === 'elevated') {
    cardBg = colors.surface;
    borderColor = colors.border;
    borderWidth = 1;
    shadowStyle = theme.shadows.sm;
  } else if (variant === 'outlined') {
    cardBg = colors.surface;
    borderColor = colors.border;
    borderWidth = 1;
    shadowStyle = theme.shadows.none;
  } else if (variant === 'flat') {
    cardBg = colors.surfaceSecondary;
    borderColor = 'transparent';
    borderWidth = 0;
    shadowStyle = theme.shadows.none;
  } else if (variant === 'ai') {
    cardBg = colors.surface;
    borderColor = colors.aiBorderGlow;
    borderWidth = 1;
    shadowStyle = theme.shadows.glow;
  }

  const containerStyles = [
    styles.card,
    {
      backgroundColor: cardBg,
      borderColor,
      borderWidth,
      borderRadius: borderRadius.xl,
      padding: paddingVal,
    },
    shadowStyle,
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        style={containerStyles}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={containerStyles}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
});
