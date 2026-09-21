// SmartDay Daily Concentric Rings Component
// Focus (Teal) / Tasks (Purple) / Habits (Gold/Green)
// 600ms draw animation, 0% zero-state ("Let's start your day"), tap/long-press goals

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { DailyRingsState } from '../../types';
import { translate } from '../../i18n';
import { useSmartDay } from '../../context/SmartDayContext';

interface DailyRingsProps {
  rings: DailyRingsState;
  onPressRing?: (category: 'focus' | 'tasks' | 'habits') => void;
  onLongPress?: () => void;
  size?: number; // default 210
}

export const DailyRings: React.FC<DailyRingsProps> = ({
  rings,
  onPressRing,
  onLongPress,
  size = 210,
}) => {
  const { theme, isDark } = useTheme();
  const { colors, typography, borderRadius, spacing } = theme;
  const { profile } = useSmartDay();

  // Animation values for the 3 rings (0 to 1)
  const animFocus = useRef(new Animated.Value(0)).current;
  const animTasks = useRef(new Animated.Value(0)).current;
  const animHabits = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(animFocus, {
        toValue: rings.focusPercent,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(animTasks, {
        toValue: rings.tasksPercent,
        duration: 600,
        delay: 80,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(animHabits, {
        toValue: rings.habitsPercent,
        duration: 600,
        delay: 160,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start();
  }, [rings.focusPercent, rings.tasksPercent, rings.habitsPercent]);

  const strokeWidth = 14;
  const ringGap = 6;

  const r1 = size / 2 - strokeWidth / 2; // Outer (Focus)
  const r2 = r1 - strokeWidth - ringGap;  // Middle (Tasks)
  const r3 = r2 - strokeWidth - ringGap;  // Inner (Habits)

  const isZeroState = rings.focusMinutes === 0 && rings.tasksCompleted === 0 && rings.habitsCompleted === 0;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onLongPress={onLongPress}
      onPress={() => onPressRing?.('focus')}
      style={[styles.container, { width: size, height: size }]}
    >
      {/* Outer Ring Track: Focus (Teal) */}
      <View
        style={[
          styles.ringBase,
          {
            width: r1 * 2 + strokeWidth,
            height: r1 * 2 + strokeWidth,
            borderRadius: (r1 * 2 + strokeWidth) / 2,
            borderWidth: strokeWidth,
            borderColor: isDark ? 'rgba(13, 148, 136, 0.18)' : 'rgba(13, 148, 136, 0.15)',
          },
        ]}
      />
      {/* Outer Ring Fill: Focus */}
      {rings.focusPercent > 0 && (
        <View
          style={[
            styles.ringFill,
            {
              width: r1 * 2 + strokeWidth,
              height: r1 * 2 + strokeWidth,
              borderRadius: (r1 * 2 + strokeWidth) / 2,
              borderWidth: strokeWidth,
              borderColor: colors.primary,
              borderTopColor: colors.primary,
              borderRightColor: rings.focusPercent >= 0.25 ? colors.primary : 'transparent',
              borderBottomColor: rings.focusPercent >= 0.5 ? colors.primary : 'transparent',
              borderLeftColor: rings.focusPercent >= 0.75 ? colors.primary : 'transparent',
              transform: [{ rotate: '-45deg' }],
            },
          ]}
        />
      )}

      {/* Middle Ring Track: Tasks (Purple) */}
      <View
        style={[
          styles.ringBase,
          {
            width: r2 * 2 + strokeWidth,
            height: r2 * 2 + strokeWidth,
            borderRadius: (r2 * 2 + strokeWidth) / 2,
            borderWidth: strokeWidth,
            borderColor: isDark ? 'rgba(124, 58, 237, 0.18)' : 'rgba(124, 58, 237, 0.15)',
          },
        ]}
      />
      {/* Middle Ring Fill: Tasks */}
      {rings.tasksPercent > 0 && (
        <View
          style={[
            styles.ringFill,
            {
              width: r2 * 2 + strokeWidth,
              height: r2 * 2 + strokeWidth,
              borderRadius: (r2 * 2 + strokeWidth) / 2,
              borderWidth: strokeWidth,
              borderColor: colors.purple,
              borderTopColor: colors.purple,
              borderRightColor: rings.tasksPercent >= 0.25 ? colors.purple : 'transparent',
              borderBottomColor: rings.tasksPercent >= 0.5 ? colors.purple : 'transparent',
              borderLeftColor: rings.tasksPercent >= 0.75 ? colors.purple : 'transparent',
              transform: [{ rotate: '-45deg' }],
            },
          ]}
        />
      )}

      {/* Inner Ring Track: Habits (Gold/Amber) */}
      <View
        style={[
          styles.ringBase,
          {
            width: r3 * 2 + strokeWidth,
            height: r3 * 2 + strokeWidth,
            borderRadius: (r3 * 2 + strokeWidth) / 2,
            borderWidth: strokeWidth,
            borderColor: isDark ? 'rgba(217, 119, 6, 0.18)' : 'rgba(217, 119, 6, 0.15)',
          },
        ]}
      />
      {/* Inner Ring Fill: Habits */}
      {rings.habitsPercent > 0 && (
        <View
          style={[
            styles.ringFill,
            {
              width: r3 * 2 + strokeWidth,
              height: r3 * 2 + strokeWidth,
              borderRadius: (r3 * 2 + strokeWidth) / 2,
              borderWidth: strokeWidth,
              borderColor: colors.gold,
              borderTopColor: colors.gold,
              borderRightColor: rings.habitsPercent >= 0.25 ? colors.gold : 'transparent',
              borderBottomColor: rings.habitsPercent >= 0.5 ? colors.gold : 'transparent',
              borderLeftColor: rings.habitsPercent >= 0.75 ? colors.gold : 'transparent',
              transform: [{ rotate: '-45deg' }],
            },
          ]}
        />
      )}

      {/* Center Display */}
      <View style={styles.centerContainer}>
        {isZeroState ? (
          <View style={styles.centerZeroBox}>
            <Ionicons name="sparkles" size={20} color={colors.primary} style={{ marginBottom: 4 }} />
            <Text
              style={[
                styles.centerTitle,
                {
                  color: colors.textPrimary,
                  fontSize: 13,
                  fontWeight: typography.weights.bold,
                  textAlign: 'center',
                },
              ]}
            >
              {translate(profile.language, 'ringsZeroTitle')}
            </Text>
          </View>
        ) : (
          <View style={styles.centerStatsBox}>
            {rings.closedRingsCount === 3 ? (
              <Ionicons name="checkmark-circle" size={26} color={colors.primary} />
            ) : (
              <Text
                style={[
                  styles.centerNumber,
                  {
                    color: colors.textPrimary,
                    fontSize: typography.sizes.xl,
                    fontWeight: typography.weights.bold,
                  },
                ]}
              >
                {rings.closedRingsCount}
                <Text style={{ fontSize: typography.sizes.sm, color: colors.textSecondary }}>/3</Text>
              </Text>
            )}
            <Text
              style={[
                styles.centerSubtitle,
                {
                  color: colors.textSecondary,
                  fontSize: 10,
                  fontWeight: typography.weights.medium,
                  textAlign: 'center',
                  marginTop: 2,
                },
              ]}
            >
              {rings.closedRingsCount === 3
                ? translate(profile.language, 'allRingsClosed')
                : translate(profile.language, 'ringsClosedCount', { closed: rings.closedRingsCount })}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    alignSelf: 'center',
  },
  ringBase: {
    position: 'absolute',
  },
  ringFill: {
    position: 'absolute',
  },
  centerContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: 90,
    height: 90,
    paddingHorizontal: 6,
  },
  centerZeroBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerStatsBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerTitle: {
    letterSpacing: -0.2,
  },
  centerNumber: {},
  centerSubtitle: {},
});
