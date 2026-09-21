import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Switch,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Button } from '../components/ui/Button';
import { Priority, TaskCategory, Task } from '../data/mockTasks';

export interface AddTaskModalProps {
  visible: boolean;
  onClose: () => void;
  onSaveTask: (task: Omit<Task, 'id' | 'completed'>) => void;
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({
  visible,
  onClose,
  onSaveTask,
}) => {
  const { theme, isDark } = useTheme();
  const { colors, typography, spacing, borderRadius } = theme;
  const insets = useSafeAreaInsets();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState<TaskCategory>('work');
  const [dueTime, setDueTime] = useState('11:00 AM');
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [aiOrganizeEnabled, setAiOrganizeEnabled] = useState(true);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPriority('medium');
    setCategory('work');
    setDueTime('11:00 AM');
  };

  const handleSave = () => {
    if (!title.trim()) return;

    onSaveTask({
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      category,
      dueDate: 'Today',
      dueTime,
      isAIPrioritized: aiOrganizeEnabled,
      tags: [category.charAt(0).toUpperCase() + category.slice(1)],
      subtasks: aiOrganizeEnabled
        ? [
            { id: 'sub-1', title: 'Prepare documentation & context notes', completed: false },
            { id: 'sub-2', title: 'Execute primary milestone deliverables', completed: false },
          ]
        : undefined,
    });

    resetForm();
    onClose();
  };

  const priorities: { key: Priority; label: string; color: string }[] = [
    { key: 'high', label: 'High Priority', color: colors.priorityHigh },
    { key: 'medium', label: 'Medium', color: colors.priorityMed },
    { key: 'low', label: 'Low', color: colors.priorityLow },
  ];

  const categories: { key: TaskCategory; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'work', label: 'Work', icon: 'briefcase-outline' },
    { key: 'personal', label: 'Personal', icon: 'person-outline' },
    { key: 'focus', label: 'Deep Focus', icon: 'flash-outline' },
    { key: 'health', label: 'Health', icon: 'heart-outline' },
  ];

  const times = ['9:00 AM', '11:00 AM', '2:00 PM', '4:30 PM', '6:00 PM'];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.modalContainer, { backgroundColor: colors.surface }]}
      >
        {/* Modal Header */}
        <View
          style={[
            styles.header,
            {
              paddingTop: Math.max(insets.top, 16),
              paddingHorizontal: spacing.base + 4,
              paddingBottom: spacing.base,
              borderBottomColor: colors.border,
              borderBottomWidth: 1,
            },
          ]}
        >
          <TouchableOpacity
            onPress={onClose}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text
              style={[
                styles.cancelText,
                {
                  fontSize: typography.sizes.base,
                  color: colors.textSecondary,
                },
              ]}
            >
              Cancel
            </Text>
          </TouchableOpacity>

          <Text
            style={[
              styles.modalTitle,
              {
                fontSize: typography.sizes.base + 1,
                fontWeight: typography.weights.bold,
                color: colors.textPrimary,
              },
            ]}
          >
            Create Task
          </Text>

          <TouchableOpacity
            onPress={handleSave}
            disabled={!title.trim()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text
              style={[
                styles.saveText,
                {
                  fontSize: typography.sizes.base,
                  fontWeight: typography.weights.bold,
                  color: title.trim() ? colors.primaryLight : colors.textTertiary,
                },
              ]}
            >
              Done
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.body,
            {
              paddingHorizontal: spacing.base + 4,
              paddingTop: spacing.lg,
              paddingBottom: insets.bottom + 40,
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Title Input */}
          <Text
            style={[
              styles.sectionLabel,
              {
                fontSize: typography.sizes.xs,
                fontWeight: typography.weights.bold,
                color: colors.textTertiary,
                textTransform: 'uppercase',
                letterSpacing: 0.6,
                marginBottom: spacing.xs,
              },
            ]}
          >
            Task Name
          </Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Complete quarterly product benchmark"
            placeholderTextColor={colors.textTertiary}
            style={[
              styles.titleInput,
              {
                backgroundColor: colors.surfaceSecondary,
                borderColor: colors.border,
                borderRadius: borderRadius.lg,
                color: colors.textPrimary,
                fontSize: typography.sizes.base,
                padding: spacing.md,
                marginBottom: spacing.base,
              },
            ]}
            autoFocus
          />

          {/* Description Input */}
          <Text
            style={[
              styles.sectionLabel,
              {
                fontSize: typography.sizes.xs,
                fontWeight: typography.weights.bold,
                color: colors.textTertiary,
                textTransform: 'uppercase',
                letterSpacing: 0.6,
                marginBottom: spacing.xs,
              },
            ]}
          >
            Notes & Context
          </Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Add relevant specs, links, or success criteria..."
            placeholderTextColor={colors.textTertiary}
            multiline
            numberOfLines={3}
            style={[
              styles.descInput,
              {
                backgroundColor: colors.surfaceSecondary,
                borderColor: colors.border,
                borderRadius: borderRadius.lg,
                color: colors.textPrimary,
                fontSize: typography.sizes.sm + 1,
                padding: spacing.md,
                minHeight: 80,
                textAlignVertical: 'top',
                marginBottom: spacing.lg,
              },
            ]}
          />

          {/* Priority Selection */}
          <Text
            style={[
              styles.sectionLabel,
              {
                fontSize: typography.sizes.xs,
                fontWeight: typography.weights.bold,
                color: colors.textTertiary,
                textTransform: 'uppercase',
                letterSpacing: 0.6,
                marginBottom: spacing.sm,
              },
            ]}
          >
            Priority Level
          </Text>
          <View style={[styles.chipsRow, { marginBottom: spacing.lg }]}>
            {priorities.map((item) => {
              const isSelected = priority === item.key;
              return (
                <TouchableOpacity
                  key={item.key}
                  onPress={() => setPriority(item.key)}
                  activeOpacity={0.8}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: isSelected
                        ? colors.surfaceSecondary
                        : 'transparent',
                      borderColor: isSelected ? item.color : colors.border,
                      borderWidth: isSelected ? 1.8 : 1,
                      borderRadius: borderRadius.xl,
                      paddingHorizontal: spacing.md,
                      paddingVertical: spacing.sm,
                      marginRight: spacing.sm,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.colorDot,
                      { backgroundColor: item.color, marginRight: 6 },
                    ]}
                  />
                  <Text
                    style={[
                      styles.chipText,
                      {
                        fontSize: typography.sizes.xs + 1,
                        fontWeight: isSelected
                          ? typography.weights.bold
                          : typography.weights.medium,
                        color: colors.textPrimary,
                      },
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Category Selection */}
          <Text
            style={[
              styles.sectionLabel,
              {
                fontSize: typography.sizes.xs,
                fontWeight: typography.weights.bold,
                color: colors.textTertiary,
                textTransform: 'uppercase',
                letterSpacing: 0.6,
                marginBottom: spacing.sm,
              },
            ]}
          >
            Category
          </Text>
          <View style={[styles.chipsRow, { marginBottom: spacing.lg }]}>
            {categories.map((cat) => {
              const isSelected = category === cat.key;
              return (
                <TouchableOpacity
                  key={cat.key}
                  onPress={() => setCategory(cat.key)}
                  activeOpacity={0.8}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: isSelected
                        ? colors.primarySurface
                        : colors.surfaceSecondary,
                      borderColor: isSelected ? colors.primaryLight : colors.border,
                      borderWidth: 1,
                      borderRadius: borderRadius.xl,
                      paddingHorizontal: spacing.md,
                      paddingVertical: spacing.sm,
                      marginRight: spacing.sm,
                    },
                  ]}
                >
                  <Ionicons
                    name={cat.icon}
                    size={14}
                    color={isSelected ? colors.primaryLight : colors.textSecondary}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={[
                      styles.chipText,
                      {
                        fontSize: typography.sizes.xs + 1,
                        fontWeight: isSelected
                          ? typography.weights.bold
                          : typography.weights.medium,
                        color: isSelected ? colors.primaryLight : colors.textSecondary,
                      },
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Due Time Selection */}
          <Text
            style={[
              styles.sectionLabel,
              {
                fontSize: typography.sizes.xs,
                fontWeight: typography.weights.bold,
                color: colors.textTertiary,
                textTransform: 'uppercase',
                letterSpacing: 0.6,
                marginBottom: spacing.sm,
              },
            ]}
          >
            Target Time
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[styles.timeRow, { marginBottom: spacing.lg }]}
          >
            {times.map((t) => {
              const isSelected = dueTime === t;
              return (
                <TouchableOpacity
                  key={t}
                  onPress={() => setDueTime(t)}
                  activeOpacity={0.8}
                  style={[
                    styles.timeChip,
                    {
                      backgroundColor: isSelected
                        ? colors.primary
                        : colors.surfaceSecondary,
                      borderRadius: borderRadius.lg,
                      paddingHorizontal: spacing.md,
                      paddingVertical: spacing.sm,
                      marginRight: spacing.sm,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.timeChipText,
                      {
                        fontSize: typography.sizes.xs + 1,
                        fontWeight: isSelected
                          ? typography.weights.bold
                          : typography.weights.medium,
                        color: isSelected ? colors.primaryTextOn : colors.textSecondary,
                      },
                    ]}
                  >
                    {t}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* AI Smart Scheduling & Auto-Breakdown Toggle */}
          <View
            style={[
              styles.toggleCard,
              {
                backgroundColor: colors.surfaceSecondary,
                borderColor: isDark
                  ? 'rgba(129, 140, 248, 0.3)'
                  : colors.primarySurface,
                borderRadius: borderRadius.xl,
                padding: spacing.base,
                marginBottom: spacing.lg,
                borderWidth: 1,
              },
            ]}
          >
            <View style={styles.toggleRow}>
              <View style={styles.toggleInfo}>
                <View style={styles.aiLabelRow}>
                  <Ionicons
                    name="sparkles"
                    size={16}
                    color={colors.primaryLight}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={[
                      styles.toggleTitle,
                      {
                        fontSize: typography.sizes.sm + 1,
                        fontWeight: typography.weights.bold,
                        color: colors.textPrimary,
                      },
                    ]}
                  >
                    AI Smart Scheduling
                  </Text>
                </View>
                <Text
                  style={[
                    styles.toggleDesc,
                    {
                      fontSize: typography.sizes.xs,
                      color: colors.textSecondary,
                      marginTop: 2,
                    },
                  ]}
                >
                  Auto-generate optimal time slot and breakdown subtasks
                </Text>
              </View>

              <Switch
                value={aiOrganizeEnabled}
                onValueChange={setAiOrganizeEnabled}
                trackColor={{
                  false: colors.border,
                  true: colors.primaryLight,
                }}
                thumbColor="#FFFFFF"
              />
            </View>

            {aiOrganizeEnabled && (
              <View
                style={[
                  styles.aiPreviewBox,
                  {
                    backgroundColor: colors.surface,
                    borderRadius: borderRadius.lg,
                    padding: spacing.md,
                    marginTop: spacing.md,
                    borderColor: colors.borderLight,
                    borderWidth: 1,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.aiPreviewHeader,
                    {
                      fontSize: typography.sizes.xs,
                      fontWeight: typography.weights.bold,
                      color: colors.primaryLight,
                      textTransform: 'uppercase',
                      marginBottom: 6,
                    },
                  ]}
                >
                  Suggested AI Subtasks
                </Text>
                <View style={styles.previewSubtask}>
                  <Ionicons
                    name="git-commit-outline"
                    size={14}
                    color={colors.textSecondary}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={[
                      styles.previewText,
                      {
                        fontSize: typography.sizes.xs + 1,
                        color: colors.textSecondary,
                      },
                    ]}
                  >
                    Prepare documentation & context notes
                  </Text>
                </View>
                <View style={[styles.previewSubtask, { marginTop: 4 }]}>
                  <Ionicons
                    name="git-commit-outline"
                    size={14}
                    color={colors.textSecondary}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={[
                      styles.previewText,
                      {
                        fontSize: typography.sizes.xs + 1,
                        color: colors.textSecondary,
                      },
                    ]}
                  >
                    Execute primary milestone deliverables
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Reminder Toggle */}
          <View
            style={[
              styles.reminderRow,
              {
                backgroundColor: colors.surfaceSecondary,
                borderRadius: borderRadius.xl,
                padding: spacing.base,
                marginBottom: spacing['2xl'],
              },
            ]}
          >
            <View style={styles.toggleInfo}>
              <Text
                style={[
                  styles.toggleTitle,
                  {
                    fontSize: typography.sizes.sm + 1,
                    fontWeight: typography.weights.bold,
                    color: colors.textPrimary,
                  },
                ]}
              >
                Smart Notification
              </Text>
              <Text
                style={[
                  styles.toggleDesc,
                  {
                    fontSize: typography.sizes.xs,
                    color: colors.textSecondary,
                    marginTop: 2,
                  },
                ]}
              >
                Alert 15 mins before scheduled window
              </Text>
            </View>

            <Switch
              value={reminderEnabled}
              onValueChange={setReminderEnabled}
              trackColor={{
                false: colors.border,
                true: colors.primaryLight,
              }}
              thumbColor="#FFFFFF"
            />
          </View>

          {/* Action Button */}
          <Button
            title="Create Task"
            variant="ai"
            size="lg"
            icon="sparkles"
            onPress={handleSave}
            disabled={!title.trim()}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cancelText: {},
  modalTitle: {},
  saveText: {},
  body: {},
  sectionLabel: {},
  titleInput: {
    borderWidth: 1,
  },
  descInput: {
    borderWidth: 1,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  chipText: {},
  timeRow: {
    flexDirection: 'row',
  },
  timeChip: {},
  timeChipText: {},
  toggleCard: {},
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleInfo: {
    flex: 1,
    paddingRight: 12,
  },
  aiLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleTitle: {},
  toggleDesc: {},
  aiPreviewBox: {},
  aiPreviewHeader: {},
  previewSubtask: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewText: {},
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
