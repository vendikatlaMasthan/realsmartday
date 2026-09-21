import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export interface SegmentOption<T extends string> {
  key: T;
  label: string;
  badge?: number;
}

export interface SegmentControlProps<T extends string> {
  options: SegmentOption<T>[];
  selectedKey: T;
  onSelect: (key: T) => void;
  style?: object;
}

export function SegmentControl<T extends string>({
  options,
  selectedKey,
  onSelect,
  style,
}: SegmentControlProps<T>) {
  const { theme } = useTheme();
  const { colors, typography, spacing, borderRadius } = theme;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surfaceSecondary,
          borderRadius: borderRadius.xl,
          padding: spacing.xxs + 2,
        },
        style,
      ]}
    >
      {options.map((option) => {
        const isSelected = option.key === selectedKey;
        return (
          <TouchableOpacity
            key={option.key}
            onPress={() => onSelect(option.key)}
            activeOpacity={0.8}
            style={[
              styles.segment,
              {
                borderRadius: borderRadius.lg,
                backgroundColor: isSelected ? colors.surface : 'transparent',
              },
              isSelected ? theme.shadows.sm : undefined,
            ]}
          >
            <Text
              style={[
                styles.label,
                {
                  fontSize: typography.sizes.sm,
                  fontWeight: isSelected
                    ? typography.weights.semibold
                    : typography.weights.medium,
                  color: isSelected ? colors.textPrimary : colors.textSecondary,
                },
              ]}
            >
              {option.label}
            </Text>

            {option.badge !== undefined && (
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: isSelected
                      ? colors.primarySurface
                      : colors.borderLight,
                    borderRadius: borderRadius.full,
                    marginLeft: spacing.xs,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    {
                      fontSize: typography.sizes.xs - 1,
                      fontWeight: typography.weights.bold,
                      color: isSelected ? colors.primary : colors.textTertiary,
                    },
                  ]}
                >
                  {option.badge}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  segment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  label: {},
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  badgeText: {},
});
