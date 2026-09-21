// SmartDay Habit Streak Row Component (Section 0-D & 4-B Spec)
// Circular check, 14-day dots with exact colors (Teal completed, Purple today, Gold skip, Soft fill missed)
// Pop animation on check, long-press skip today (max 2 per 30 days)

import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Habit } from '../../types';
import { translate, getLocalizedWeekdays } from '../../i18n';
import { useSmartDay } from '../../context/SmartDayContext';

interface HabitStreakRowProps {
  habit: Habit;
  onToggleToday: (id: string) => void;
  onSkipToday?: (id: string) => void;
  onPress?: (habit: Habit) => void;
  showLegend?: boolean;
}

export const HabitStreakRow: React.FC<HabitStreakRowProps> = ({
  habit,
  onToggleToday,
  onSkipToday,
  onPress,
  showLegend,
}) => {
  const { theme, isDark } = useTheme();
  const { colors, typography, borderRadius, spacing } = theme;
  const { profile } = useSmartDay();

  const [skipModalVisible, setSkipModalVisible] = useState(false);
  const popAnim = useRef(new Animated.Value(1)).current;

  const todayStr = new Date().toISOString().split('T')[0];
  const todayLog = habit.logs.find((l) => l.date === todayStr);
  const isDoneToday = Boolean(todayLog?.done);
  const isSkippedToday = Boolean(todayLog?.skipped);

  // 14-day history window
  const weekDays = getLocalizedWeekdays(profile.language);

  const handleCheckPress = () => {
    // Pop animation
    Animated.sequence([
      Animated.timing(popAnim, { toValue: 1.25, duration: 100, useNativeDriver: true }),
      Animated.spring(popAnim, { toValue: 1, friction: 3, useNativeDriver: true }),
    ]).start();

    onToggleToday(habit.id);
  };

  const handleLongPress = () => {
    setSkipModalVisible(true);
  };

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => onPress?.(habit)}
        onLongPress={handleLongPress}
        style={[
          styles.container,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: borderRadius.lg,
            padding: spacing.base,
            marginBottom: spacing.sm + 2,
          },
          theme.shadows.sm,
        ]}
      >
        {/* Top Row: Color Pip + Habit Name + Streak Pill + Circular Check */}
        <View style={styles.topRow}>
          {/* Accent Pip */}
          <View
            style={[
              styles.colorPip,
              {
                backgroundColor: habit.colorPip || colors.primary,
                borderRadius: borderRadius.full,
              },
            ]}
          />

          <View style={styles.titleCol}>
            <Text
              numberOfLines={1}
              style={[
                styles.habitName,
                {
                  color: colors.textPrimary,
                  fontSize: 16,
                  fontWeight: typography.weights.bold,
                },
              ]}
            >
              {habit.name}
            </Text>
            {habit.description ? (
              <Text
                numberOfLines={1}
                style={[
                  styles.habitDesc,
                  {
                    color: colors.textSecondary,
                    fontSize: 12,
                    marginTop: 2,
                  },
                ]}
              >
                {habit.description}
              </Text>
            ) : null}
          </View>

          {/* Streak Counter Pill */}
          <View
            style={[
              styles.streakBadge,
              {
                backgroundColor: isDark ? 'rgba(217, 119, 6, 0.18)' : '#FEF3C7',
                borderRadius: borderRadius.full,
                paddingHorizontal: 8,
                paddingVertical: 4,
                marginRight: 10,
              },
            ]}
          >
            <Ionicons name="flame" size={13} color={colors.gold} style={{ marginRight: 3 }} />
            <Text style={[styles.streakText, { color: colors.gold, fontWeight: typography.weights.bold, fontSize: 11 }]}>
              {habit.streak}{translate(profile.language, 'days')}
            </Text>
          </View>

          {/* Circular Check Button (44px target) */}
          <Animated.View style={{ transform: [{ scale: popAnim }] }}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleCheckPress}
              onLongPress={handleLongPress}
              accessibilityRole="checkbox"
              accessibilityLabel={`Log habit: ${habit.name}`}
              style={[
                styles.circleCheck,
                {
                  borderRadius: borderRadius.full,
                  backgroundColor: isDoneToday
                    ? colors.primary
                    : isSkippedToday
                    ? colors.gold
                    : 'transparent',
                  borderColor: isDoneToday
                    ? colors.primary
                    : isSkippedToday
                    ? colors.gold
                    : colors.purple, // Purple = today due/in-progress
                  borderWidth: isDoneToday || isSkippedToday ? 0 : 2,
                },
              ]}
            >
              {isDoneToday && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
              {isSkippedToday && <Ionicons name="snow" size={14} color="#FFFFFF" />}
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* 7-day Dot Grid */}
        <View style={[styles.dotsContainer, { borderTopColor: colors.borderLight, borderTopWidth: 1, paddingTop: 10, marginTop: 12 }]}>
          {weekDays.map((item, idx) => {
            const isToday = idx === weekDays.length - 1;
            const logItem = habit.logs.find((l) => l.date === item.fullDate);
            const isDone = isToday ? isDoneToday : Boolean(logItem?.done);
            const isSkipped = isToday ? isSkippedToday : Boolean(logItem?.skipped);

            // Color scheme according to section 0-D:
            // Teal = completed, Purple = today (in progress or due), Gold = freeze/skip, Soft fill = missed
            let dotBg = isDark ? '#1E2126' : '#F1F3F5';
            let dotBorder = isDark ? '#272B33' : '#E2E8F0';

            if (isDone) {
              dotBg = colors.primary;
              dotBorder = colors.primary;
            } else if (isSkipped) {
              dotBg = colors.gold;
              dotBorder = colors.gold;
            } else if (isToday) {
              dotBg = isDark ? 'rgba(124, 58, 237, 0.2)' : '#F5F3FF';
              dotBorder = colors.purple;
            }

            return (
              <View key={item.fullDate} style={styles.dotCol}>
                <Text
                  style={[
                    styles.dayLabel,
                    {
                      color: isToday ? colors.purple : colors.textTertiary,
                      fontWeight: isToday ? typography.weights.bold : typography.weights.regular,
                      fontSize: 10,
                      marginBottom: 4,
                    },
                  ]}
                >
                  {item.day}
                </Text>
                <View
                  style={[
                    styles.gridDot,
                    {
                      backgroundColor: dotBg,
                      borderColor: dotBorder,
                      borderWidth: isToday ? 1.5 : 1,
                    },
                  ]}
                />
              </View>
            );
          })}
        </View>
      </TouchableOpacity>

      {/* Long-Press Skip Today Dialog */}
      <Modal visible={skipModalVisible} transparent animationType="fade" onRequestClose={() => setSkipModalVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setSkipModalVisible(false)}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface, borderRadius: borderRadius.xl, borderColor: colors.border }, theme.shadows.md]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary, fontSize: typography.sizes.base, fontWeight: typography.weights.bold, padding: spacing.md }]}>
              {habit.name}
            </Text>
            <TouchableOpacity
              style={styles.modalAction}
              onPress={() => {
                setSkipModalVisible(false);
                onSkipToday?.(habit.id);
              }}
            >
              <Ionicons name="snow-outline" size={20} color={colors.gold} style={{ marginRight: 12 }} />
              <View>
                <Text style={{ color: colors.textPrimary, fontSize: 15, fontWeight: typography.weights.semibold }}>
                  {translate(profile.language, 'skipToday')}
                </Text>
                <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }}>
                  Preserves streak (max 2 skips / 30 days)
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {},
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorPip: {
    width: 6,
    height: 36,
    marginRight: 12,
  },
  titleCol: {
    flex: 1,
    justifyContent: 'center',
  },
  habitName: {
    letterSpacing: -0.2,
  },
  habitDesc: {},
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakText: {},
  circleCheck: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dotCol: {
    alignItems: 'center',
    flex: 1,
  },
  dayLabel: {},
  gridDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 320,
    borderWidth: 1,
    overflow: 'hidden',
  },
  modalTitle: {},
  modalAction: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
});
