import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'ai';
  size?: 'sm' | 'md' | 'lg';
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  style,
  textStyle,
}) => {
  const { theme } = useTheme();
  const { colors, typography, borderRadius, spacing } = theme;

  // Size specific styles
  const sizeStyles = {
    sm: {
      paddingVertical: spacing.xs + 2,
      paddingHorizontal: spacing.md,
      borderRadius: borderRadius.md,
      fontSize: typography.sizes.sm,
      iconSize: 14,
    },
    md: {
      paddingVertical: spacing.sm + 4,
      paddingHorizontal: spacing.base,
      borderRadius: borderRadius.lg,
      fontSize: typography.sizes.base,
      iconSize: 18,
    },
    lg: {
      paddingVertical: spacing.base,
      paddingHorizontal: spacing.xl,
      borderRadius: borderRadius.xl,
      fontSize: typography.sizes.md,
      iconSize: 20,
    },
  }[size];

  // Colors based on variant
  let containerBg = colors.primary;
  let textColor = colors.primaryTextOn;
  let borderColor = 'transparent';
  let borderWidth = 0;

  if (variant === 'secondary') {
    containerBg = colors.surfaceSecondary;
    textColor = colors.textPrimary;
  } else if (variant === 'outline') {
    containerBg = 'transparent';
    textColor = colors.primary;
    borderColor = colors.border;
    borderWidth = 1;
  } else if (variant === 'ghost') {
    containerBg = 'transparent';
    textColor = colors.textSecondary;
  }

  const content = (
    <View style={styles.innerRow}>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={textColor}
          style={{ marginRight: spacing.xs }}
        />
      ) : icon && iconPosition === 'left' ? (
        <Ionicons
          name={icon}
          size={sizeStyles.iconSize}
          color={textColor}
          style={{ marginRight: spacing.xs + 2 }}
        />
      ) : null}

      <Text
        style={[
          styles.text,
          {
            fontSize: sizeStyles.fontSize,
            fontWeight: typography.weights.semibold,
            color: textColor,
          },
          textStyle,
        ]}
      >
        {title}
      </Text>

      {!loading && icon && iconPosition === 'right' && (
        <Ionicons
          name={icon}
          size={sizeStyles.iconSize}
          color={textColor}
          style={{ marginLeft: spacing.xs + 2 }}
        />
      )}
    </View>
  );

  if (variant === 'ai') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.82}
        style={[
          {
            borderRadius: sizeStyles.borderRadius,
            opacity: disabled ? 0.5 : 1,
          },
          theme.shadows.glow,
          style,
        ]}
      >
        <LinearGradient
          colors={[colors.aiGradientStart, colors.aiGradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.base,
            {
              paddingVertical: sizeStyles.paddingVertical,
              paddingHorizontal: sizeStyles.paddingHorizontal,
              borderRadius: sizeStyles.borderRadius,
            },
          ]}
        >
          {content}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.78}
      style={[
        styles.base,
        {
          backgroundColor: containerBg,
          borderColor,
          borderWidth,
          paddingVertical: sizeStyles.paddingVertical,
          paddingHorizontal: sizeStyles.paddingHorizontal,
          borderRadius: sizeStyles.borderRadius,
          opacity: disabled ? 0.5 : 1,
        },
        variant === 'primary' ? theme.shadows.sm : undefined,
        style,
      ]}
    >
      {content}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
  },
});
