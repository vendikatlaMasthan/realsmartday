import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Task } from '../../data/mockTasks';
import { Badge } from '../ui/Badge';

export interface TaskCardProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onPress?: (task: Task) => void;
  compact?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggleComplete,
  onPress,
  compact = false,
}) => {
  const { theme } = useTheme();
  const { colors, typography, spacing, borderRadius } = theme;

  // Priority styling
  let priorityColor = colors.priorityMed;
  let priorityBg = colors.priorityMedBg;
  let priorityLabel = 'Medium';
  let priorityIcon: keyof typeof Ionicons.glyphMap = 'remove-circle-outline';

  if (task.priority === 'high') {
    priorityColor = colors.priorityHigh;
    priorityBg = colors.priorityHighBg;
    priorityLabel = 'High';
    priorityIcon = 'alert-circle-outline';
  }
  if (task.priority === 'low') {
    priorityColor = colors.priorityLow;
    priorityBg = colors.priorityLowBg;
    priorityLabel = 'Low';
    priorityIcon = 'checkmark-circle-outline';
  }

  const completedSubtasks = task.subtasks?.filter((s) => s.completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;

  // Left icon background tinted by priority
  const iconBg = task.completed
    ? colors.surfaceSecondary
    : `${priorityColor}18`;

  return (
    <TouchableOpacity
      onPress={() => onPress?.(task)}
      activeOpacity={0.8}
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: task.completed ? colors.borderLight : colors.border,
          borderWidth: 1,
          borderRadius: borderRadius.xl,
          padding: compact ? spacing.md : spacing.base,
          marginBottom: spacing.md,
          opacity: task.completed ? 0.7 : 1,
        },
        theme.shadows.sm,
      ]}
    >
      <View style={styles.mainRow}>
        {/* Checkbox (left touch target) */}
        <TouchableOpacity
          onPress={() => onToggleComplete(task.id)}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={[
            styles.checkbox,
            {
              borderColor: task.completed ? colors.primary : colors.border,
              backgroundColor: task.completed ? colors.primary : 'transparent',
              borderRadius: borderRadius.sm,
              marginRight: spacing.md,
            },
          ]}
        >
          {task.completed && (
            <Ionicons name="checkmark" size={14} color={colors.primaryTextOn} />
          )}
        </TouchableOpacity>

        {/* Priority-colored icon circle */}
        <View
          style={[
            styles.iconCircle,
            {
              backgroundColor: iconBg,
              borderRadius: borderRadius.full,
              marginRight: spacing.md,
            },
          ]}
        >
          <Ionicons
            name={task.completed ? 'checkmark-circle' : priorityIcon}
            size={20}
            color={task.completed ? colors.textTertiary : priorityColor}
          />
        </View>

        {/* Middle: title + meta */}
        <View style={styles.textCol}>
          <Text
            numberOfLines={compact ? 1 : 2}
            style={{
              fontSize: typography.sizes.base,
              fontWeight: typography.weights.semibold,
              color: task.completed ? colors.textTertiary : colors.textPrimary,
              textDecorationLine: task.completed ? 'line-through' : 'none',
              letterSpacing: -0.2,
              lineHeight: 20,
            }}
          >
            {task.title}
          </Text>

          {/* Meta row */}
          <View style={[styles.metaRow, { marginTop: 5 }]}>
            <Ionicons
              name="time-outline"
              size={11}
              color={colors.textTertiary}
              style={{ marginRight: 3 }}
            />
            <Text
              style={{
                fontSize: typography.sizes.xs,
                color: colors.textSecondary,
                fontWeight: typography.weights.medium,
                marginRight: spacing.sm,
              }}
            >
              {task.dueTime}
            </Text>

            <View
              style={{
                backgroundColor: colors.surfaceSecondary,
                borderRadius: borderRadius.xs,
                paddingHorizontal: 5,
                paddingVertical: 2,
                marginRight: spacing.xs,
              }}
            >
              <Text
                style={{
                  fontSize: 10,
                  color: colors.textSecondary,
                  textTransform: 'capitalize',
                  fontWeight: typography.weights.medium,
                }}
              >
                {task.category}
              </Text>
            </View>

            {task.isAIPrioritized && (
              <Badge
                label="AI"
                variant="ai"
                size="sm"
                icon="sparkles"
                style={{ marginLeft: 2 }}
              />
            )}

            {totalSubtasks > 0 && (
              <View style={[styles.subtaskPill, { backgroundColor: colors.surfaceSecondary, borderRadius: borderRadius.xs, marginLeft: 'auto', paddingHorizontal: 5, paddingVertical: 2 }]}>
                <Ionicons name="git-branch-outline" size={10} color={colors.textSecondary} style={{ marginRight: 3 }} />
                <Text style={{ fontSize: 10, color: colors.textSecondary, fontWeight: typography.weights.medium }}>
                  {completedSubtasks}/{totalSubtasks}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Right: priority pill */}
        <View
          style={{
            backgroundColor: priorityBg,
            borderRadius: borderRadius.full,
            paddingHorizontal: spacing.sm,
            paddingVertical: 4,
            marginLeft: spacing.sm,
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontSize: 10,
              fontWeight: typography.weights.bold,
              color: priorityColor,
              letterSpacing: 0.2,
            }}
          >
            {task.completed ? 'Done' : priorityLabel}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {},
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 1.8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: {
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  subtaskPill: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
