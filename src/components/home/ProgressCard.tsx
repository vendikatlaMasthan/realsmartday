import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { DailyMetrics } from '../../data/mockHome';

export interface ProgressCardProps {
  metrics: DailyMetrics;
}

export const ProgressCard: React.FC<ProgressCardProps> = ({ metrics }) => {
  const { theme } = useTheme();
  const { colors, typography, spacing, borderRadius } = theme;

  const taskPct = Math.round(
    (metrics.tasksCompleted / (metrics.tasksTotal || 1)) * 100
  );

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: borderRadius.xl,
          padding: spacing.base,
          marginBottom: spacing.xl,
        },
        theme.shadows.sm,
      ]}
    >
      {/* Top row */}
      <View style={styles.headerRow}>
        <View>
          <Text
            style={{
              fontSize: typography.sizes.base,
              fontWeight: typography.weights.bold,
              color: colors.textPrimary,
            }}
          >
            Today's Momentum
          </Text>
          <Text
            style={{
              fontSize: typography.sizes.xs + 1,
              color: colors.textSecondary,
              marginTop: 2,
            }}
          >
            {metrics.tasksCompleted} of {metrics.tasksTotal} key goals resolved
          </Text>
        </View>

        <View
          style={[
            styles.streakBadge,
            {
              backgroundColor: colors.primarySurface,
              borderRadius: borderRadius.full,
              paddingHorizontal: spacing.sm + 2,
              paddingVertical: 5,
            },
          ]}
        >
          <Ionicons name="flame" size={14} color="#F59E0B" style={{ marginRight: 4 }} />
          <Text
            style={{
              fontSize: typography.sizes.xs,
              fontWeight: typography.weights.bold,
              color: colors.primaryLight,
            }}
          >
            {metrics.streakDays} day streak
          </Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={{ marginTop: spacing.md, marginBottom: spacing.sm }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 6,
          }}
        >
          <Text
            style={{
              fontSize: typography.sizes.xs,
              color: colors.textSecondary,
              fontWeight: typography.weights.medium,
            }}
          >
            Daily Velocity
          </Text>
          <Text
            style={{
              fontSize: typography.sizes.xs,
              color: colors.primaryLight,
              fontWeight: typography.weights.bold,
            }}
          >
            {taskPct}%
          </Text>
        </View>
        <View
          style={{
            height: 8,
            width: '100%',
            backgroundColor: colors.surfaceSecondary,
            borderRadius: borderRadius.full,
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              height: '100%',
              width: `${taskPct}%`,
              backgroundColor: colors.primaryLight,
              borderRadius: borderRadius.full,
            }}
          />
        </View>
      </View>

      {/* 3 Metric mini-cards */}
      <View style={styles.metricsGrid}>
        {[
          {
            icon: 'checkbox' as keyof typeof Ionicons.glyphMap,
            iconColor: colors.primaryLight,
            label: 'Tasks',
            value: `${metrics.tasksCompleted}/${metrics.tasksTotal}`,
          },
          {
            icon: 'flame' as keyof typeof Ionicons.glyphMap,
            iconColor: '#F59E0B',
            label: 'Habits',
            value: `${metrics.habitsCompleted}/${metrics.habitsTotal}`,
          },
          {
            icon: 'pulse' as keyof typeof Ionicons.glyphMap,
            iconColor: colors.success,
            label: 'Focus',
            value: `${metrics.focusScore}%`,
          },
        ].map((m, idx) => (
          <View
            key={idx}
            style={{
              flex: 1,
              backgroundColor: colors.surfaceSecondary,
              borderRadius: borderRadius.lg,
              padding: spacing.sm + 2,
              alignItems: 'center',
            }}
          >
            <Ionicons name={m.icon} size={16} color={m.iconColor} />
            <Text
              style={{
                fontSize: typography.sizes.xs,
                color: colors.textSecondary,
                marginTop: 4,
              }}
            >
              {m.label}
            </Text>
            <Text
              style={{
                fontSize: typography.sizes.md + 2,
                fontWeight: typography.weights.extrabold,
                color: colors.textPrimary,
                marginTop: 2,
                letterSpacing: -0.5,
              }}
            >
              {m.value}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {},
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 8,
  },
});
