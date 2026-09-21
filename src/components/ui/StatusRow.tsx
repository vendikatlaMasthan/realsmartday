import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

export interface StatusPill {
  label: string;
  color: string;
  bgColor: string;
}

export interface StatusRowProps {
  iconName: keyof typeof Ionicons.glyphMap;
  iconBgColor?: string;
  iconColor?: string;
  title: string;
  subtitle?: string;
  pill?: StatusPill;
  onPress?: () => void;
  leftElement?: React.ReactNode;
  style?: ViewStyle;
  showBorder?: boolean;
}

export const StatusRow: React.FC<StatusRowProps> = ({
  iconName,
  iconBgColor,
  iconColor,
  title,
  subtitle,
  pill,
  onPress,
  leftElement,
  style,
  showBorder = false,
}) => {
  const { theme } = useTheme();
  const { colors, typography, spacing, borderRadius } = theme;

  const resolvedIconBg = iconBgColor ?? colors.primarySurface;
  const resolvedIconColor = iconColor ?? colors.primaryLight;

  const Inner = (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderBottomWidth: showBorder ? StyleSheet.hairlineWidth : 0,
          borderRadius: showBorder ? 0 : borderRadius.xl,
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.base,
          marginBottom: showBorder ? 0 : spacing.sm,
          borderWidth: showBorder ? 0 : 1,
        },
        !showBorder && theme.shadows.sm,
        style,
      ]}
    >
      {leftElement ? (
        leftElement
      ) : (
        <View
          style={[
            styles.iconCircle,
            {
              backgroundColor: resolvedIconBg,
              borderRadius: borderRadius.full,
              marginRight: spacing.md,
            },
          ]}
        >
          <Ionicons name={iconName} size={20} color={resolvedIconColor} />
        </View>
      )}

      <View style={styles.textCol}>
        <Text
          numberOfLines={1}
          style={[
            styles.title,
            {
              fontSize: typography.sizes.base,
              fontWeight: typography.weights.semibold,
              color: colors.textPrimary,
              letterSpacing: -0.2,
            },
          ]}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            numberOfLines={1}
            style={[
              styles.subtitle,
              {
                fontSize: typography.sizes.xs + 1,
                color: colors.textSecondary,
                marginTop: 2,
              },
            ]}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>

      {pill ? (
        <View
          style={[
            styles.pill,
            {
              backgroundColor: pill.bgColor,
              borderRadius: borderRadius.full,
              paddingHorizontal: spacing.sm + 2,
              paddingVertical: 4,
              marginLeft: spacing.sm,
            },
          ]}
        >
          <Text
            style={[
              styles.pillText,
              {
                fontSize: typography.sizes.xs,
                fontWeight: typography.weights.bold,
                color: pill.color,
                letterSpacing: 0.2,
              },
            ]}
          >
            {pill.label}
          </Text>
        </View>
      ) : null}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.75}>
        {Inner}
      </TouchableOpacity>
    );
  }

  return Inner;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: {
    flex: 1,
  },
  title: {},
  subtitle: {},
  pill: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillText: {},
});
