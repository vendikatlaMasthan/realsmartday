import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { SearchBar } from '../components/ui/SearchBar';
import { SegmentControl } from '../components/ui/SegmentControl';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { TaskCard } from '../components/tasks/TaskCard';
import { Task, Priority, TaskCategory } from '../data/mockTasks';

type SegmentKey = 'today' | 'upcoming' | 'completed';
type FilterPill = 'all' | 'high' | 'work' | 'personal' | 'health';

export interface TasksScreenProps {
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onOpenAddTask: () => void;
  onToggleSubtask?: (taskId: string, subtaskId: string) => void;
  onDeleteTask?: (id: string) => void;
}

export const TasksScreen: React.FC<TasksScreenProps> = ({
  tasks,
  onToggleTask,
  onOpenAddTask,
  onToggleSubtask,
  onDeleteTask,
}) => {
  const { theme } = useTheme();
  const { colors, typography, spacing, borderRadius } = theme;
  const insets = useSafeAreaInsets();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeSegment, setActiveSegment] = useState<SegmentKey>('today');
  const [activeFilter, setActiveFilter] = useState<FilterPill>('all');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const selectedTask = useMemo(
    () => tasks.find((t) => t.id === selectedTaskId) || null,
    [tasks, selectedTaskId]
  );

  // Filter tasks based on segment, search, and category/priority pills
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Search matching
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(q);
        const matchesDesc = task.description?.toLowerCase().includes(q);
        const matchesTag = task.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesDesc && !matchesTag) return false;
      }

      // Segment matching
      if (activeSegment === 'completed') {
        if (!task.completed) return false;
      } else if (activeSegment === 'today') {
        if (task.completed || task.dueDate !== 'Today') return false;
      } else if (activeSegment === 'upcoming') {
        if (task.completed || task.dueDate === 'Today' || task.dueDate === 'Completed')
          return false;
      }

      // Filter pills
      if (activeFilter === 'high') return task.priority === 'high';
      if (activeFilter === 'work') return task.category === 'work';
      if (activeFilter === 'personal') return task.category === 'personal';
      if (activeFilter === 'health') return task.category === 'health';

      return true;
    });
  }, [tasks, searchQuery, activeSegment, activeFilter]);

  const todayCount = tasks.filter((t) => !t.completed && t.dueDate === 'Today').length;
  const upcomingCount = tasks.filter(
    (t) => !t.completed && t.dueDate !== 'Today' && t.dueDate !== 'Completed'
  ).length;
  const completedCount = tasks.filter((t) => t.completed).length;

  const segmentOptions = [
    { key: 'today' as SegmentKey, label: 'Today', badge: todayCount },
    { key: 'upcoming' as SegmentKey, label: 'Upcoming', badge: upcomingCount },
    { key: 'completed' as SegmentKey, label: 'Done', badge: completedCount },
  ];

  const filterPills: { key: FilterPill; label: string }[] = [
    { key: 'all', label: 'All Tasks' },
    { key: 'high', label: 'High Priority' },
    { key: 'work', label: 'Work' },
    { key: 'personal', label: 'Personal' },
    { key: 'health', label: 'Wellness' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Header */}
      <View
        style={[
          styles.headerContainer,
          {
            paddingTop: insets.top + spacing.md,
            paddingHorizontal: spacing.base + 4,
            paddingBottom: spacing.sm,
            backgroundColor: colors.background,
          },
        ]}
      >
        <View style={styles.headerRow}>
          <View>
            <Text
              style={[
                styles.screenTitle,
                {
                  fontSize: typography.sizes['2xl'],
                  fontWeight: typography.weights.extrabold,
                  color: colors.textPrimary,
                  letterSpacing: -0.6,
                },
              ]}
            >
              Tasks
            </Text>
            <Text
              style={{
                fontSize: typography.sizes.xs + 1,
                color: colors.textSecondary,
                marginTop: 2,
              }}
            >
              {todayCount} due today · {completedCount} done
            </Text>
          </View>

          <TouchableOpacity
            onPress={onOpenAddTask}
            activeOpacity={0.8}
            style={{
              backgroundColor: colors.primary,
              borderRadius: borderRadius.full,
              width: 44,
              height: 44,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.4,
              shadowRadius: 8,
              elevation: 6,
            }}
          >
            <Ionicons name="add" size={22} color={colors.primaryTextOn} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by title, tag, or note..."
          style={{ marginTop: spacing.md }}
        />

        {/* Segmented Control: Today / Upcoming / Completed */}
        <SegmentControl
          options={segmentOptions}
          selectedKey={activeSegment}
          onSelect={setActiveSegment}
          style={{ marginTop: spacing.md }}
        />

        {/* Filter Pills Horizontal Scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[
            styles.pillsContainer,
            { marginTop: spacing.md },
          ]}
        >
          {filterPills.map((pill) => {
            const isSelected = activeFilter === pill.key;
            return (
              <TouchableOpacity
                key={pill.key}
                onPress={() => setActiveFilter(pill.key)}
                activeOpacity={0.75}
                style={[
                  styles.filterPill,
                  {
                    backgroundColor: isSelected
                      ? colors.primary
                      : colors.surfaceSecondary,
                    borderColor: isSelected ? colors.primary : colors.border,
                    borderRadius: borderRadius.full,
                    paddingHorizontal: spacing.md,
                    paddingVertical: 6,
                    marginRight: spacing.sm,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    {
                      fontSize: typography.sizes.xs + 1,
                      fontWeight: isSelected
                        ? typography.weights.semibold
                        : typography.weights.medium,
                      color: isSelected
                        ? colors.primaryTextOn
                        : colors.textSecondary,
                    },
                  ]}
                >
                  {pill.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Task List */}
      <ScrollView
        contentContainerStyle={[
          styles.listContent,
          {
            paddingHorizontal: spacing.base + 4,
            paddingTop: spacing.sm,
            paddingBottom: insets.bottom + 110,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {filteredTasks.length === 0 ? (
          <View
            style={[
              styles.emptyState,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderRadius: borderRadius.xl,
                padding: spacing['2xl'],
                marginTop: spacing.lg,
              },
            ]}
          >
            <Ionicons
              name="checkmark-circle-outline"
              size={48}
              color={colors.textTertiary}
              style={{ marginBottom: spacing.sm }}
            />
            <Text
              style={[
                styles.emptyTitle,
                {
                  fontSize: typography.sizes.md,
                  fontWeight: typography.weights.bold,
                  color: colors.textPrimary,
                },
              ]}
            >
              No tasks found
            </Text>
            <Text
              style={[
                styles.emptySubtitle,
                {
                  fontSize: typography.sizes.sm,
                  color: colors.textSecondary,
                  textAlign: 'center',
                  marginTop: 4,
                },
              ]}
            >
              {searchQuery
                ? 'Try adjusting your search terms or filter.'
                : 'All clear in this section! Tap + to create a task.'}
            </Text>
          </View>
        ) : (
          filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggleComplete={onToggleTask}
              onPress={(t) => setSelectedTaskId(t.id)}
            />
          ))
        )}
      </ScrollView>

      {/* Floating Action Button (FAB) */}
      <TouchableOpacity
        onPress={onOpenAddTask}
        activeOpacity={0.85}
        style={[
          styles.fab,
          {
            backgroundColor: colors.primary,
            bottom: insets.bottom + 80,
            right: 24,
            borderRadius: borderRadius.full,
          },
          theme.shadows.glow,
        ]}
      >
        <Ionicons name="add" size={26} color={colors.primaryTextOn} />
      </TouchableOpacity>

      {/* Task Detail Modal */}
      <Modal
        visible={!!selectedTask}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedTaskId(null)}
      >
        {selectedTask && (
          <View style={[styles.modalContainer, { backgroundColor: colors.surface }]}>
            {/* Header */}
            <View
              style={[
                styles.modalHeader,
                {
                  paddingTop: Math.max(insets.top, 16),
                  paddingHorizontal: spacing.base + 4,
                  paddingBottom: spacing.base,
                  borderBottomColor: colors.border,
                  borderBottomWidth: 1,
                },
              ]}
            >
              <View style={styles.badgeRow}>
                <Badge
                  label={selectedTask.priority}
                  variant={
                    selectedTask.priority === 'high'
                      ? 'high'
                      : selectedTask.priority === 'medium'
                      ? 'medium'
                      : 'low'
                  }
                  size="sm"
                />
                <View style={{ marginLeft: 8 }}>
                  <Badge label={selectedTask.category} variant="neutral" size="sm" />
                </View>
                {selectedTask.isAIPrioritized && (
                  <View style={{ marginLeft: 8 }}>
                    <Badge label="AI Focus" variant="ai" icon="sparkles" size="sm" />
                  </View>
                )}
              </View>

              <TouchableOpacity
                onPress={() => setSelectedTaskId(null)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={22} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              contentContainerStyle={[
                styles.modalScroll,
                {
                  padding: spacing.base + 4,
                  paddingBottom: insets.bottom + 40,
                },
              ]}
              showsVerticalScrollIndicator={false}
            >
              <Text
                style={[
                  styles.detailTitle,
                  {
                    fontSize: typography.sizes.xl,
                    fontWeight: typography.weights.bold,
                    color: colors.textPrimary,
                    marginBottom: spacing.xs,
                  },
                ]}
              >
                {selectedTask.title}
              </Text>

              <View style={styles.dueRow}>
                <Ionicons
                  name="time-outline"
                  size={14}
                  color={colors.primaryLight}
                  style={{ marginRight: 4 }}
                />
                <Text
                  style={{
                    fontSize: typography.sizes.xs + 1,
                    color: colors.primaryLight,
                    fontWeight: typography.weights.semibold,
                  }}
                >
                  Due {selectedTask.dueDate} at {selectedTask.dueTime}
                </Text>
              </View>

              {selectedTask.description ? (
                <View style={{ marginBottom: spacing.lg }}>
                  <Text
                    style={{
                      fontSize: typography.sizes.xs,
                      fontWeight: typography.weights.bold,
                      color: colors.textTertiary,
                      textTransform: 'uppercase',
                      letterSpacing: 0.6,
                      marginBottom: 6,
                    }}
                  >
                    Notes & Context
                  </Text>
                  <Text
                    style={{
                      fontSize: typography.sizes.sm + 1,
                      color: colors.textSecondary,
                      lineHeight: 22,
                    }}
                  >
                    {selectedTask.description}
                  </Text>
                </View>
              ) : null}

              {selectedTask.isAIPrioritized && (
                <View
                  style={{
                    backgroundColor: colors.surfaceSecondary,
                    borderColor: colors.aiBorderGlow,
                    borderWidth: 1,
                    borderRadius: borderRadius.lg,
                    padding: spacing.md,
                    marginBottom: spacing.lg,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <Ionicons
                    name="sparkles"
                    size={18}
                    color={colors.primaryLight}
                    style={{ marginRight: 8 }}
                  />
                  <Text
                    style={{
                      fontSize: typography.sizes.xs + 1,
                      color: colors.textSecondary,
                      flex: 1,
                      lineHeight: 18,
                    }}
                  >
                    <Text
                      style={{
                        fontWeight: typography.weights.bold,
                        color: colors.textPrimary,
                      }}
                    >
                      AI Calibrated:{' '}
                    </Text>
                    Optimized for your peak cognitive focus window based on historical task completion patterns.
                  </Text>
                </View>
              )}

              {selectedTask.subtasks && selectedTask.subtasks.length > 0 && (
                <View style={{ marginBottom: spacing.xl }}>
                  <Text
                    style={{
                      fontSize: typography.sizes.xs,
                      fontWeight: typography.weights.bold,
                      color: colors.textTertiary,
                      textTransform: 'uppercase',
                      letterSpacing: 0.6,
                      marginBottom: 8,
                    }}
                  >
                    Subtasks ({selectedTask.subtasks.filter((s) => s.completed).length}/
                    {selectedTask.subtasks.length})
                  </Text>
                  {selectedTask.subtasks.map((subtask) => (
                    <TouchableOpacity
                      key={subtask.id}
                      onPress={() =>
                        onToggleSubtask?.(selectedTask.id, subtask.id)
                      }
                      activeOpacity={0.7}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: colors.surfaceSecondary,
                        borderRadius: borderRadius.md,
                        padding: spacing.md,
                        marginBottom: 6,
                      }}
                    >
                      <View
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: 4,
                          borderWidth: 1.5,
                          borderColor: subtask.completed
                            ? colors.primary
                            : colors.border,
                          backgroundColor: subtask.completed
                            ? colors.primary
                            : 'transparent',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: 10,
                        }}
                      >
                        {subtask.completed && (
                          <Ionicons
                            name="checkmark"
                            size={12}
                            color={colors.primaryTextOn}
                          />
                        )}
                      </View>
                      <Text
                        style={{
                          fontSize: typography.sizes.sm,
                          color: subtask.completed
                            ? colors.textTertiary
                            : colors.textPrimary,
                          textDecorationLine: subtask.completed
                            ? 'line-through'
                            : 'none',
                          flex: 1,
                        }}
                      >
                        {subtask.title}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Actions */}
              <View style={{ marginTop: spacing.base, gap: 10 }}>
                <Button
                  title={
                    selectedTask.completed
                      ? 'Mark as Incomplete'
                      : 'Mark as Completed'
                  }
                  variant={selectedTask.completed ? 'secondary' : 'primary'}
                  size="lg"
                  icon={
                    selectedTask.completed
                      ? 'refresh-outline'
                      : 'checkmark-circle-outline'
                  }
                  onPress={() => {
                    onToggleTask(selectedTask.id);
                  }}
                />

                {onDeleteTask && (
                  <Button
                    title="Delete Task"
                    variant="ghost"
                    size="md"
                    icon="trash-outline"
                    onPress={() => {
                      onDeleteTask(selectedTask.id);
                      setSelectedTaskId(null);
                    }}
                  />
                )}
              </View>
            </ScrollView>
          </View>
        )}
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {},
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  screenTitle: {},
  headerAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAddText: {},
  pillsContainer: {
    paddingBottom: 4,
  },
  filterPill: {
    borderWidth: 1,
  },
  filterPillText: {},
  listContent: {},
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  emptyTitle: {},
  emptySubtitle: {},
  fab: {
    position: 'absolute',
    width: 54,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalScroll: {},
  detailTitle: {},
  dueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
