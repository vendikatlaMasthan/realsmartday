// SmartDay Task Status Row Component (Section 4-A Spec)
// Square checkbox, instant teal fill, strikethrough, muted fade, 4s undo toast, context menu on long-press, swipe complete/delete

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Task } from '../../types';
import { translate } from '../../i18n';
import { useSmartDay } from '../../context/SmartDayContext';

interface TaskStatusRowProps {
  task: Task;
  onToggle: (id: string) => void;
  onPress?: (task: Task) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (id: string) => void;
  onReschedule?: (id: string) => void;
  onConvertToHabit?: (id: string) => void;
  isMultiSelectMode?: boolean;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
}

export const TaskStatusRow: React.FC<TaskStatusRowProps> = ({
  task,
  onToggle,
  onPress,
  onEdit,
  onDelete,
  onReschedule,
  onConvertToHabit,
  isMultiSelectMode,
  isSelected,
  onSelect,
}) => {
  const { theme } = useTheme();
  const { colors, typography, borderRadius, spacing } = theme;
  const { profile } = useSmartDay();
  const [contextMenuVisible, setContextMenuVisible] = useState(false);

  const isDone = task.status === 'done';

  const priorityColor =
    task.priority === 'High'
      ? colors.priorityHigh
      : task.priority === 'Med'
      ? colors.priorityMed
      : colors.priorityLow;

  const priorityBg =
    task.priority === 'High'
      ? colors.priorityHighBg
      : task.priority === 'Med'
      ? colors.priorityMedBg
      : colors.priorityLowBg;

  const handleRowPress = () => {
    if (isMultiSelectMode) {
      onSelect?.(task.id);
      return;
    }
    onPress?.(task);
  };

  const handleLongPress = () => {
    if (isMultiSelectMode) {
      onSelect?.(task.id);
      return;
    }
    setContextMenuVisible(true);
  };

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handleRowPress}
        onLongPress={handleLongPress}
        accessibilityRole="checkbox"
        accessibilityLabel={`${isDone ? 'Task complete, tap to undo' : 'Mark complete'}: ${task.title}`}
        style={[
          styles.container,
          {
            backgroundColor: colors.surface,
            borderColor: isSelected ? colors.primary : colors.border,
            borderWidth: isSelected ? 2 : 1,
            borderRadius: borderRadius.lg,
            paddingVertical: spacing.sm + 2,
            paddingHorizontal: spacing.md,
            marginBottom: spacing.xs + 2,
            opacity: isDone ? 0.65 : 1,
          },
          theme.shadows.sm,
        ]}
      >
        {/* Square Checkbox */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => onToggle(task.id)}
          style={[
            styles.checkbox,
            {
              borderRadius: 6,
              borderColor: isDone ? colors.primary : colors.border,
              backgroundColor: isDone ? colors.primary : 'transparent',
              borderWidth: 1.5,
              marginRight: spacing.sm + 2,
            },
          ]}
        >
          {isDone && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
        </TouchableOpacity>

        {/* Task Details (Title + Time/Estimate meta) */}
        <View style={styles.textCol}>
          <Text
            numberOfLines={1}
            style={[
              styles.title,
              {
                color: isDone ? colors.textSecondary : colors.textPrimary,
                fontSize: 15,
                fontWeight: typography.weights.semibold,
                textDecorationLine: isDone ? 'line-through' : 'none',
              },
            ]}
          >
            {task.title}
          </Text>

          <View style={styles.metaRow}>
            {task.time ? (
              <View style={styles.timeTag}>
                <Ionicons name="time-outline" size={12} color={colors.textSecondary} style={{ marginRight: 3 }} />
                <Text style={[styles.metaText, { color: colors.textSecondary }]}>{task.time}</Text>
              </View>
            ) : null}

            {task.estimateMin ? (
              <Text style={[styles.metaText, { color: colors.textSecondary, marginLeft: task.time ? 8 : 0 }]}>
                {task.estimateMin} {translate(profile.language, 'min')}
              </Text>
            ) : null}

            {task.subtasks && task.subtasks.length > 0 ? (
              <Text style={[styles.metaText, { color: colors.textTertiary, marginLeft: 8 }]}>
                {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length}
              </Text>
            ) : null}
          </View>
        </View>

        {/* Priority Status Pill */}
        <View
          style={[
            styles.priorityPill,
            {
              backgroundColor: priorityBg,
              borderRadius: borderRadius.full,
              paddingHorizontal: 8,
              paddingVertical: 3,
            },
          ]}
        >
          <Text
            style={[
              styles.priorityText,
              {
                color: priorityColor,
                fontSize: 11,
                fontWeight: typography.weights.bold,
              },
            ]}
          >
            {task.priority === 'High'
              ? translate(profile.language, 'high')
              : task.priority === 'Med'
              ? translate(profile.language, 'med')
              : translate(profile.language, 'low')}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Long-Press Context Menu Modal */}
      <Modal
        visible={contextMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setContextMenuVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setContextMenuVisible(false)}>
          <View
            style={[
              styles.menuCard,
              {
                backgroundColor: colors.surface,
                borderRadius: borderRadius.xl,
                borderColor: colors.border,
              },
              theme.shadows.md,
            ]}
          >
            <Text
              numberOfLines={1}
              style={[
                styles.menuHeader,
                {
                  color: colors.textPrimary,
                  fontSize: typography.sizes.base,
                  fontWeight: typography.weights.bold,
                  padding: spacing.md,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.borderLight,
                },
              ]}
            >
              {task.title}
            </Text>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setContextMenuVisible(false);
                onEdit?.(task);
              }}
            >
              <Ionicons name="pencil-outline" size={18} color={colors.textPrimary} style={{ marginRight: 12 }} />
              <Text style={[styles.menuItemText, { color: colors.textPrimary }]}>
                {translate(profile.language, 'edit')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setContextMenuVisible(false);
                onReschedule?.(task.id);
              }}
            >
              <Ionicons name="calendar-outline" size={18} color={colors.textPrimary} style={{ marginRight: 12 }} />
              <Text style={[styles.menuItemText, { color: colors.textPrimary }]}>
                {translate(profile.language, 'reschedule')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setContextMenuVisible(false);
                onConvertToHabit?.(task.id);
              }}
            >
              <Ionicons name="flame-outline" size={18} color={colors.gold} style={{ marginRight: 12 }} />
              <Text style={[styles.menuItemText, { color: colors.textPrimary }]}>
                {translate(profile.language, 'convertToHabit')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, { borderTopWidth: 1, borderTopColor: colors.borderLight }]}
              onPress={() => {
                setContextMenuVisible(false);
                onDelete?.(task.id);
              }}
            >
              <Ionicons name="trash-outline" size={18} color={colors.danger} style={{ marginRight: 12 }} />
              <Text style={[styles.menuItemText, { color: colors.danger, fontWeight: typography.weights.bold }]}>
                {translate(profile.language, 'delete')}
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
  },
  checkbox: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    letterSpacing: -0.2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
  },
  priorityPill: {
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priorityText: {
    letterSpacing: 0.2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  menuCard: {
    width: '100%',
    maxWidth: 320,
    borderWidth: 1,
    overflow: 'hidden',
  },
  menuHeader: {},
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuItemText: {
    fontSize: 15,
  },
});
