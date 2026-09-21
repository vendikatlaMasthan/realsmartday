import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Habit } from '../../data/mockHabits';

export interface HabitCardProps {
  habit: Habit;
  onToggleToday: (id: string) => void;
  onPress?: (habit: Habit) => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  onToggleToday,
  onPress,
}) => {
  const { theme } = useTheme();
  const { colors, typography, spacing, borderRadius } = theme;

  const accentColor = habit.color || colors.primaryLight;
  const accentBg = `${accentColor}20`;

  return (
    <TouchableOpacity
      onPress={() => onPress?.(habit)}
      activeOpacity={0.8}
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: borderRadius.xl,
          padding: spacing.base,
          marginBottom: spacing.md,
        },
        theme.shadows.sm,
      ]}
    >
      {/* StatusRow layout: icon circle | name+desc | streak pill | check button */}
      <View style={styles.topRow}>
        {/* Left icon circle */}
        <View
          style={[
            styles.iconCircle,
            {
              backgroundColor: accentBg,
              borderRadius: borderRadius.full,
              marginRight: spacing.md,
            },
          ]}
        >
          <Ionicons
            name={habit.icon as any}
            size={20}
            color={accentColor}
          />
        </View>

        {/* Middle: name + description */}
        <View style={styles.textCol}>
          <Text
            numberOfLines={1}
            style={{
              fontSize: typography.sizes.base,
              fontWeight: typography.weights.bold,
              color: colors.textPrimary,
              letterSpacing: -0.2,
            }}
          >
            {habit.name}
          </Text>
          <Text
            numberOfLines={1}
            style={{
              fontSize: typography.sizes.xs + 1,
              color: colors.textSecondary,
              marginTop: 2,
            }}
          >
            {habit.description}
          </Text>
        </View>

        {/* Right: streak pill */}
        <View
          style={[
            styles.streakPill,
            {
              backgroundColor: colors.primarySurface,
              borderRadius: borderRadius.full,
              paddingHorizontal: spacing.sm,
              paddingVertical: 4,
              marginRight: spacing.sm,
            },
          ]}
        >
          <Ionicons name="flame" size={12} color="#F59E0B" style={{ marginRight: 3 }} />
          <Text
            style={{
              fontSize: typography.sizes.xs,
              fontWeight: typography.weights.bold,
              color: colors.primaryLight,
            }}
          >
            {habit.streak}d
          </Text>
        </View>

        {/* Check-in button */}
        <TouchableOpacity
          onPress={() => onToggleToday(habit.id)}
          activeOpacity={0.75}
          style={[
            styles.checkBtn,
            {
              backgroundColor: habit.completedToday ? colors.success : colors.surfaceSecondary,
              borderColor: habit.completedToday ? colors.success : colors.border,
              borderWidth: 1.5,
              borderRadius: borderRadius.full,
            },
          ]}
        >
          <Ionicons
            name={habit.completedToday ? 'checkmark' : 'add'}
            size={20}
            color={habit.completedToday ? '#FFFFFF' : colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* 7-day weekly dot strip */}
      <View
        style={[
          styles.bottomRow,
          {
            marginTop: spacing.md,
            paddingTop: spacing.sm + 2,
            borderTopColor: colors.borderLight,
            borderTopWidth: 1,
          },
        ]}
      >
        <View style={styles.weekDays}>
          {habit.weeklyHistory.map((item, idx) => {
            const isToday = idx === habit.weeklyHistory.length - 1;
            const isDone = isToday ? habit.completedToday : item.completed;
            return (
              <View key={idx} style={styles.dayCol}>
                <Text
                  style={{
                    fontSize: 9,
                    fontWeight: isToday
                      ? typography.weights.bold
                      : typography.weights.regular,
                    color: isToday ? colors.primaryLight : colors.textTertiary,
                    marginBottom: 4,
                    textAlign: 'center',
                  }}
                >
                  {item.day}
                </Text>
                <View
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 8,
                    backgroundColor: isDone
                      ? accentColor
                      : colors.surfaceSecondary,
                    borderWidth: isToday ? 2 : 1,
                    borderColor: isToday
                      ? accentColor
                      : isDone
                      ? accentColor
                      : colors.border,
                  }}
                />
              </View>
            );
          })}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {},
  topRow: {
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
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weekDays: {
    flexDirection: 'row',
    gap: 8,
  },
  dayCol: {
    alignItems: 'center',
  },
});
