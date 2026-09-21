import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

export interface QuickActionItem {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  accentColor?: string;
}

export interface QuickActionProps {
  items: QuickActionItem[];
}

export const QuickAction: React.FC<QuickActionProps> = ({ items }) => {
  const { theme } = useTheme();
  const { colors, typography, spacing, borderRadius } = theme;

  // Split into rows of 3
  const rows: QuickActionItem[][] = [];
  for (let i = 0; i < items.length; i += 3) {
    rows.push(items.slice(i, i + 3));
  }

  return (
    <View style={[styles.container, { marginBottom: spacing.xl }]}>
      {rows.map((row, rowIdx) => (
        <View key={rowIdx} style={[styles.row, rowIdx > 0 && { marginTop: spacing.sm + 2 }]}>
          {row.map((item) => {
            const iconColor = item.accentColor || colors.primaryLight;
            const iconBg = item.accentColor
              ? `${item.accentColor}20`
              : colors.primarySurface;

            return (
              <TouchableOpacity
                key={item.id}
                onPress={item.onPress}
                activeOpacity={0.78}
                style={[
                  styles.actionItem,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    borderWidth: 1,
                    borderRadius: borderRadius.xl,
                    paddingVertical: spacing.base,
                    paddingHorizontal: spacing.sm,
                  },
                  theme.shadows.sm,
                ]}
              >
                <View
                  style={[
                    styles.iconBox,
                    {
                      backgroundColor: iconBg,
                      borderRadius: borderRadius.lg,
                      marginBottom: spacing.sm,
                    },
                  ]}
                >
                  <Ionicons name={item.icon} size={22} color={iconColor} />
                </View>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.label,
                    {
                      fontSize: typography.sizes.xs + 1,
                      fontWeight: typography.weights.semibold,
                      color: colors.textPrimary,
                      textAlign: 'center',
                    },
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
          {/* Fill empty slots in partial rows */}
          {row.length < 3 &&
            Array.from({ length: 3 - row.length }).map((_, i) => (
              <View key={`empty-${i}`} style={styles.actionItem} />
            ))}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  actionItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBox: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {},
});
