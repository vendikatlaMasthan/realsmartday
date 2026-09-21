// SmartDay Quick Actions Grid (Section 0-A Spec)
// 6 DISTINCT containerized cards in a strict 3 columns × 2 rows grid
// Centered 24px icon + 12px label, 16–20px border-radius, equal gutters, min 44×44 hit area, scale + opacity press feedback

import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { translate } from '../../i18n';
import { useSmartDay } from '../../context/SmartDayContext';

export interface QuickActionDef {
  id: 'focus' | 'task' | 'habit' | 'note' | 'file' | 'report';
  labelKey: 'actionStartFocus' | 'actionAddTask' | 'actionLogHabit' | 'actionQuickNote' | 'actionConvertFile' | 'actionWeeklyReport';
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  onPress: () => void;
}

interface QuickActionsGridProps {
  onStartFocus: () => void;
  onAddTask: () => void;
  onLogHabit: () => void;
  onQuickNote: () => void;
  onConvertFile: () => void;
  onWeeklyReport: () => void;
}

interface ActionCardItemProps {
  item: QuickActionDef;
  onPress: () => void;
}

const ActionCardItem: React.FC<ActionCardItemProps> = ({ item, onPress }) => {
  const { theme } = useTheme();
  const { colors, typography, borderRadius } = theme;
  const { profile } = useSmartDay();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.94,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={[styles.cardWrapper, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderRadius: borderRadius.lg, // 16-20px
          },
          theme.shadows.sm,
        ]}
      >
        <View
          style={[
            styles.iconCircle,
            {
              backgroundColor: `${item.color}18`,
              borderRadius: borderRadius.full,
            },
          ]}
        >
          <Ionicons name={item.icon} size={24} color={item.color} />
        </View>
        <Text
          numberOfLines={1}
          style={[
            styles.cardLabel,
            {
              color: colors.textPrimary,
              fontSize: 12,
              fontWeight: typography.weights.semibold,
            },
          ]}
        >
          {translate(profile.language, item.labelKey)}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export const QuickActionsGrid: React.FC<QuickActionsGridProps> = ({
  onStartFocus,
  onAddTask,
  onLogHabit,
  onQuickNote,
  onConvertFile,
  onWeeklyReport,
}) => {
  const { theme } = useTheme();
  const { colors, spacing } = theme;

  const actions: QuickActionDef[] = [
    {
      id: 'focus',
      labelKey: 'actionStartFocus',
      icon: 'timer-outline',
      color: colors.primary,
      onPress: onStartFocus,
    },
    {
      id: 'task',
      labelKey: 'actionAddTask',
      icon: 'checkbox-outline',
      color: colors.purple,
      onPress: onAddTask,
    },
    {
      id: 'habit',
      labelKey: 'actionLogHabit',
      icon: 'flame-outline',
      color: colors.gold,
      onPress: onLogHabit,
    },
    {
      id: 'note',
      labelKey: 'actionQuickNote',
      icon: 'document-text-outline',
      color: colors.info,
      onPress: onQuickNote,
    },
    {
      id: 'file',
      labelKey: 'actionConvertFile',
      icon: 'swap-horizontal-outline',
      color: colors.success,
      onPress: onConvertFile,
    },
    {
      id: 'report',
      labelKey: 'actionWeeklyReport',
      icon: 'bar-chart-outline',
      color: colors.primaryDeep,
      onPress: onWeeklyReport,
    },
  ];

  return (
    <View style={styles.gridContainer}>
      <View style={styles.row}>
        {actions.slice(0, 3).map((item) => (
          <ActionCardItem key={item.id} item={item} onPress={item.onPress} />
        ))}
      </View>
      <View style={[styles.row, { marginTop: spacing.sm }]}>
        {actions.slice(3, 6).map((item) => (
          <ActionCardItem key={item.id} item={item} onPress={item.onPress} />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  gridContainer: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  cardWrapper: {
    flex: 1,
    minHeight: 88,
  },
  card: {
    flex: 1,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 88,
  },
  iconCircle: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  cardLabel: {
    textAlign: 'center',
    letterSpacing: -0.1,
  },
});
