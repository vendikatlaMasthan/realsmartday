import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string | number;
  actionText?: string;
  onActionPress?: () => void;
  style?: object;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  badge,
  actionText,
  onActionPress,
  style,
}) => {
  const { theme } = useTheme();
  const { colors, typography, spacing, borderRadius } = theme;

  return (
    <View style={[styles.container, { marginBottom: spacing.md }, style]}>
      <View style={styles.leftColumn}>
        <View style={styles.titleRow}>
          <Text
            style={[
              styles.title,
              {
                fontSize: typography.sizes.lg,
                fontWeight: typography.weights.bold,
                color: colors.textPrimary,
                letterSpacing: -0.3,
              },
            ]}
          >
            {title}
          </Text>

          {badge !== undefined && (
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: colors.surfaceSecondary,
                  borderRadius: borderRadius.full,
                  paddingHorizontal: spacing.sm,
                  paddingVertical: 2,
                  marginLeft: spacing.xs + 2,
                },
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  {
                    fontSize: typography.sizes.xs,
                    fontWeight: typography.weights.semibold,
                    color: colors.textSecondary,
                  },
                ]}
              >
                {badge}
              </Text>
            </View>
          )}
        </View>

        {subtitle ? (
          <Text
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

      {actionText && onActionPress && (
        <TouchableOpacity
          onPress={onActionPress}
          activeOpacity={0.7}
          style={styles.actionBtn}
        >
          <Text
            style={[
              styles.actionText,
              {
                fontSize: typography.sizes.sm,
                fontWeight: typography.weights.semibold,
                color: colors.primaryLight,
              },
            ]}
          >
            {actionText}
          </Text>
          <Ionicons
            name="chevron-forward"
            size={14}
            color={colors.primaryLight}
            style={{ marginLeft: 2 }}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftColumn: {
    flex: 1,
    marginRight: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {},
  subtitle: {},
  badge: {},
  badgeText: {},
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {},
});
