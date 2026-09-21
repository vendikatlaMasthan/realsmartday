import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export interface DotGridDay {
  date: string; // e.g. "Sep 4"
  completed: boolean;
  isFuture?: boolean;
}

export interface DotGridCalendarProps {
  /** Flat array of days, ordered oldest → newest, should be a multiple of 7 */
  days: DotGridDay[];
  /** Optional title above the grid */
  title?: string;
}

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export const DotGridCalendar: React.FC<DotGridCalendarProps> = ({
  days,
  title = 'Streak Calendar',
}) => {
  const { theme } = useTheme();
  const { colors, typography, spacing, borderRadius } = theme;

  // Chunk into weeks (columns of 7 rows)
  const weeks: DotGridDay[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const DOT_SIZE = 12;
  const DOT_GAP = 6;
  const COL_GAP = 10;

  return (
    <View
      style={[
        styles.container,
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
      {title ? (
        <Text
          style={[
            styles.title,
            {
              fontSize: typography.sizes.sm,
              fontWeight: typography.weights.bold,
              color: colors.textSecondary,
              textTransform: 'uppercase',
              letterSpacing: 0.8,
              marginBottom: spacing.md,
            },
          ]}
        >
          {title}
        </Text>
      ) : null}

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.grid}>
          {/* Day-of-week row labels on the left */}
          <View style={[styles.dayLabelsCol, { marginRight: COL_GAP }]}>
            {DAY_LABELS.map((d, i) => (
              <Text
                key={i}
                style={[
                  styles.dayLabel,
                  {
                    fontSize: 9,
                    color: colors.textTertiary,
                    fontWeight: typography.weights.medium,
                    height: DOT_SIZE + DOT_GAP,
                    lineHeight: DOT_SIZE + DOT_GAP,
                  },
                ]}
              >
                {d}
              </Text>
            ))}
          </View>

          {/* Week columns */}
          {weeks.map((week, wIdx) => (
            <View key={wIdx} style={[styles.weekCol, { marginRight: COL_GAP }]}>
              {week.map((day, dIdx) => {
                const isFilled = day.completed && !day.isFuture;
                return (
                  <View
                    key={dIdx}
                    style={[
                      styles.dot,
                      {
                        width: DOT_SIZE,
                        height: DOT_SIZE,
                        borderRadius: DOT_SIZE / 2,
                        marginBottom: DOT_GAP,
                        backgroundColor: isFilled
                          ? colors.primaryLight
                          : day.isFuture
                          ? 'transparent'
                          : colors.surfaceSecondary,
                        borderWidth: isFilled ? 0 : 1,
                        borderColor: day.isFuture
                          ? colors.borderLight
                          : colors.border,
                      },
                    ]}
                  />
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Legend */}
      <View style={[styles.legend, { marginTop: spacing.sm }]}>
        <View
          style={[
            styles.legendDot,
            {
              backgroundColor: colors.primaryLight,
              borderRadius: 4,
              marginRight: 5,
            },
          ]}
        />
        <Text
          style={[
            styles.legendLabel,
            {
              fontSize: 10,
              color: colors.textTertiary,
              marginRight: spacing.md,
            },
          ]}
        >
          Completed
        </Text>
        <View
          style={[
            styles.legendDot,
            {
              backgroundColor: colors.surfaceSecondary,
              borderRadius: 4,
              borderWidth: 1,
              borderColor: colors.border,
              marginRight: 5,
            },
          ]}
        />
        <Text style={[styles.legendLabel, { fontSize: 10, color: colors.textTertiary }]}>
          Missed
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  title: {},
  grid: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  dayLabelsCol: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  dayLabel: {
    width: 12,
    textAlign: 'center',
  },
  weekCol: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  dot: {},
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
  },
  legendLabel: {},
});
