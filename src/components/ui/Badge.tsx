import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

export interface BadgeProps {
  label: string;
  variant?: 'high' | 'medium' | 'low' | 'ai' | 'neutral' | 'success' | 'info';
  icon?: keyof typeof Ionicons.glyphMap;
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'neutral',
  icon,
  size = 'md',
  style,
}) => {
  const { theme } = useTheme();
  const { colors, typography, borderRadius, spacing } = theme;

  let bg = colors.surfaceSecondary;
  let text = colors.textSecondary;
  let borderColor = 'transparent';

  switch (variant) {
    case 'high':
      bg = colors.priorityHighBg;
      text = colors.priorityHigh;
      break;
    case 'medium':
      bg = colors.priorityMedBg;
      text = colors.priorityMed;
      break;
    case 'low':
      bg = colors.priorityLowBg;
      text = colors.priorityLow;
      break;
    case 'ai':
      bg = colors.primarySurface;
      text = colors.primaryLight;
      borderColor = colors.aiAccent;
      break;
    case 'success':
      bg = colors.successSurface;
      text = colors.success;
      break;
    case 'info':
      bg = colors.infoSurface;
      text = colors.info;
      break;
    case 'neutral':
    default:
      bg = colors.surfaceSecondary;
      text = colors.textSecondary;
      break;
  }

  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: bg,
          borderColor: borderColor !== 'transparent' ? borderColor : 'transparent',
          borderWidth: borderColor !== 'transparent' ? 1 : 0,
          paddingHorizontal: isSmall ? spacing.xs + 2 : spacing.sm + 2,
          paddingVertical: isSmall ? 2 : 4,
          borderRadius: borderRadius.full,
        },
        style,
      ]}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={isSmall ? 10 : 12}
          color={text}
          style={{ marginRight: 4 }}
        />
      )}
      <Text
        style={[
          styles.text,
          {
            fontSize: isSmall ? typography.sizes.xs - 1 : typography.sizes.xs,
            fontWeight: typography.weights.semibold,
            color: text,
            letterSpacing: 0.2,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  text: {
    textTransform: 'uppercase',
  },
});
