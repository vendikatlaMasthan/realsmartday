import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { HabitCard } from '../components/habits/HabitCard';
import { DotGridCalendar, DotGridDay } from '../components/habits/DotGridCalendar';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Button } from '../components/ui/Button';
import { Habit } from '../data/mockHabits';

export interface HabitsScreenProps {
  habits: Habit[];
  onToggleHabit: (id: string) => void;
  onAddHabit: (habit: Omit<Habit, 'id'>) => void;
}

export const HabitsScreen: React.FC<HabitsScreenProps> = ({
  habits,
  onToggleHabit,
  onAddHabit,
}) => {
  const { theme, isDark } = useTheme();
  const { colors, typography, spacing, borderRadius } = theme;
  const insets = useSafeAreaInsets();

  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitDesc, setNewHabitDesc] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Habit['category']>('productivity');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filteredHabits = React.useMemo(() => {
    if (activeCategory === 'all') return habits;
    return habits.filter((h) => h.category === activeCategory);
  }, [habits, activeCategory]);

  const completedCount = habits.filter((h) => h.completedToday).length;
  const completionRate = Math.round((completedCount / (habits.length || 1)) * 100) || 0;
  const totalStreak = habits.reduce((acc, h) => acc + h.streak, 0);
  const bestStreak = Math.max(...habits.map((h) => h.bestStreak));

  // Build dot-grid data from all habits' weekly history (aggregate: day done if any habit done)
  const dotGridDays: DotGridDay[] = React.useMemo(() => {
    if (habits.length === 0) return [];
    const weekLen = habits[0].weeklyHistory.length;
    return habits[0].weeklyHistory.map((entry, idx) => {
      const anyDone = habits.some((h) => h.weeklyHistory[idx]?.completed);
      return { date: entry.date, completed: anyDone };
    });
  }, [habits]);

  // Extend to 4 weeks (28 days) by repeating pattern for display richness
  const extendedDotGrid: DotGridDay[] = React.useMemo(() => {
    const pattern = dotGridDays;
    if (pattern.length === 0) return [];
    const result: DotGridDay[] = [];
    for (let w = 0; w < 4; w++) {
      pattern.forEach((d, idx) => {
        const weekOffset = w * 7 + idx;
        result.push({
          date: d.date,
          completed: w < 3 ? d.completed : w === 3 && idx < 3 ? d.completed : false,
          isFuture: w === 3 && idx >= 3,
        });
      });
    }
    return result;
  }, [dotGridDays]);

  const handleCreateHabit = () => {
    if (!newHabitName.trim()) return;

    onAddHabit({
      name: newHabitName.trim(),
      description: newHabitDesc.trim() || 'Daily personal consistency goal',
      category: selectedCategory,
      streak: 1,
      bestStreak: 1,
      targetPerWeek: 7,
      completedToday: false,
      color: colors.primaryLight,
      icon: 'sparkles-outline',
      weeklyHistory: [
        { day: 'M', date: 'Sep 4', completed: true },
        { day: 'T', date: 'Sep 5', completed: true },
        { day: 'W', date: 'Sep 6', completed: false },
        { day: 'T', date: 'Sep 7', completed: true },
        { day: 'F', date: 'Sep 8', completed: true },
        { day: 'S', date: 'Sep 9', completed: false },
        { day: 'S', date: 'Sep 10', completed: false },
      ],
    });

    setNewHabitName('');
    setNewHabitDesc('');
    setAddModalVisible(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + spacing.md,
            paddingHorizontal: spacing.base + 4,
            paddingBottom: spacing.base,
          },
        ]}
      >
        <View style={styles.titleRow}>
          <View>
            <Text
              style={{
                fontSize: typography.sizes['2xl'],
                fontWeight: typography.weights.extrabold,
                color: colors.textPrimary,
                letterSpacing: -0.6,
              }}
            >
              Habits & Rituals
            </Text>
            <Text
              style={{
                fontSize: typography.sizes.xs + 1,
                color: colors.textSecondary,
                marginTop: 2,
              }}
            >
              {completedCount} of {habits.length} completed today
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => setAddModalVisible(true)}
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
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: spacing.base + 4,
          paddingBottom: insets.bottom + 110,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Gradient Card */}
        <View
          style={{
            borderRadius: borderRadius['2xl'],
            marginBottom: spacing.xl,
            overflow: 'hidden',
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: isDark ? 0.5 : 0.25,
            shadowRadius: 20,
            elevation: 12,
          }}
        >
          <LinearGradient
            colors={
              isDark
                ? ['#1E1A5E', '#2D2480', '#3730A3']
                : ['#4338CA', '#5B4FE9', '#7C3AED']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderRadius: borderRadius['2xl'],
              padding: spacing.xl,
              borderWidth: 1,
              borderColor: isDark
                ? 'rgba(129,140,248,0.2)'
                : 'rgba(255,255,255,0.15)',
            }}
          >
            {/* Top row */}
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <View
                style={{
                  backgroundColor: 'rgba(255,255,255,0.18)',
                  borderRadius: borderRadius.full,
                  paddingHorizontal: spacing.sm + 2,
                  paddingVertical: 5,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <Ionicons name="flame" size={13} color="#F59E0B" style={{ marginRight: 5 }} />
                <Text style={{ fontSize: typography.sizes.xs, fontWeight: typography.weights.bold, color: '#FFFFFF', letterSpacing: 0.5 }}>
                  STREAK OVERVIEW
                </Text>
              </View>

              {/* Ring stat */}
              <View style={{ alignItems: 'center' }}>
                <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 2, borderColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' }}>
                  <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 13, fontWeight: typography.weights.extrabold, color: '#FFFFFF' }}>
                      {completionRate}%
                    </Text>
                  </View>
                </View>
                <Text style={{ fontSize: 9, color: 'rgba(255,255,255,0.65)', textAlign: 'center', marginTop: 4 }}>
                  TODAY
                </Text>
              </View>
            </View>

            {/* Hero stat: streak days */}
            <Text
              style={{
                fontSize: typography.sizes['4xl'] - 2,
                fontWeight: typography.weights.extrabold,
                color: '#FFFFFF',
                letterSpacing: -1.5,
                marginTop: spacing.md,
                lineHeight: 40,
              }}
            >
              {totalStreak} Days
            </Text>
            <Text style={{ fontSize: typography.sizes.base, color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>
              Combined streak across all habits
            </Text>

            {/* Sub-stat row */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-around',
                marginTop: spacing.base,
                paddingTop: spacing.md,
                borderTopWidth: 1,
                borderTopColor: 'rgba(255,255,255,0.12)',
              }}
            >
              {[
                { icon: 'trophy-outline' as const, label: 'Best Streak', value: `${bestStreak}d` },
                { icon: 'checkmark-circle-outline' as const, label: 'Active Habits', value: String(habits.length) },
                { icon: 'trending-up-outline' as const, label: 'vs Last Week', value: '+22%' },
              ].map((s, i) => (
                <React.Fragment key={i}>
                  {i > 0 && (
                    <View style={{ width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.15)' }} />
                  )}
                  <View style={{ flex: 1, alignItems: 'center', gap: 3 }}>
                    <Ionicons name={s.icon} size={14} color="rgba(255,255,255,0.6)" />
                    <Text style={{ fontSize: 9, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      {s.label}
                    </Text>
                    <Text style={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.bold, color: '#FFFFFF' }}>
                      {s.value}
                    </Text>
                  </View>
                </React.Fragment>
              ))}
            </View>
          </LinearGradient>
        </View>

        {/* Dot Grid Calendar */}
        {extendedDotGrid.length > 0 && (
          <DotGridCalendar days={extendedDotGrid} title="30-Day Habit Calendar" />
        )}

        {/* Category Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 4, marginBottom: spacing.md }}
        >
          {[
            { key: 'all', label: 'All Habits' },
            { key: 'productivity', label: 'Productivity' },
            { key: 'health', label: 'Health' },
            { key: 'mindset', label: 'Mindset' },
            { key: 'learning', label: 'Learning' },
          ].map((cat) => {
            const isSelected = activeCategory === cat.key;
            return (
              <TouchableOpacity
                key={cat.key}
                onPress={() => setActiveCategory(cat.key)}
                activeOpacity={0.75}
                style={{
                  backgroundColor: isSelected ? colors.primary : colors.surfaceSecondary,
                  borderColor: isSelected ? colors.primary : colors.border,
                  borderWidth: 1,
                  borderRadius: borderRadius.full,
                  paddingHorizontal: spacing.md,
                  paddingVertical: 7,
                  marginRight: spacing.sm,
                }}
              >
                <Text
                  style={{
                    fontSize: typography.sizes.xs + 1,
                    fontWeight: isSelected ? typography.weights.semibold : typography.weights.medium,
                    color: isSelected ? colors.primaryTextOn : colors.textSecondary,
                  }}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Active Habits */}
        <SectionHeader title="Active Habits" badge={filteredHabits.length} />

        {filteredHabits.map((habit) => (
          <HabitCard
            key={habit.id}
            habit={habit}
            onToggleToday={onToggleHabit}
          />
        ))}
      </ScrollView>

      {/* Add Habit Modal */}
      <Modal
        visible={addModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setAddModalVisible(false)}
      >
        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
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
            <TouchableOpacity onPress={() => setAddModalVisible(false)}>
              <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.base }}>
                Cancel
              </Text>
            </TouchableOpacity>
            <Text
              style={{
                fontSize: typography.sizes.base + 1,
                fontWeight: typography.weights.bold,
                color: colors.textPrimary,
              }}
            >
              New Habit
            </Text>
            <TouchableOpacity
              onPress={handleCreateHabit}
              disabled={!newHabitName.trim()}
            >
              <Text
                style={{
                  color: newHabitName.trim() ? colors.primaryLight : colors.textTertiary,
                  fontWeight: typography.weights.bold,
                  fontSize: typography.sizes.base,
                }}
              >
                Save
              </Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.modalBody, { padding: spacing.base + 4 }]}>
            <Text
              style={{
                fontSize: typography.sizes.xs,
                fontWeight: typography.weights.bold,
                color: colors.textTertiary,
                textTransform: 'uppercase',
                letterSpacing: 0.8,
                marginBottom: spacing.xs,
              }}
            >
              Habit Name
            </Text>
            <TextInput
              value={newHabitName}
              onChangeText={setNewHabitName}
              placeholder="e.g. 20-min Reading or Outdoor Sprint"
              placeholderTextColor={colors.textTertiary}
              style={[
                styles.textInput,
                {
                  backgroundColor: colors.surfaceSecondary,
                  borderColor: colors.border,
                  borderRadius: borderRadius.lg,
                  color: colors.textPrimary,
                  padding: spacing.md,
                  marginBottom: spacing.base,
                  fontSize: typography.sizes.base,
                },
              ]}
              autoFocus
            />

            <Text
              style={{
                fontSize: typography.sizes.xs,
                fontWeight: typography.weights.bold,
                color: colors.textTertiary,
                textTransform: 'uppercase',
                letterSpacing: 0.8,
                marginBottom: spacing.xs,
              }}
            >
              Cue & Frequency
            </Text>
            <TextInput
              value={newHabitDesc}
              onChangeText={setNewHabitDesc}
              placeholder="e.g. Daily at 7:30 AM before team standup"
              placeholderTextColor={colors.textTertiary}
              style={[
                styles.textInput,
                {
                  backgroundColor: colors.surfaceSecondary,
                  borderColor: colors.border,
                  borderRadius: borderRadius.lg,
                  color: colors.textPrimary,
                  padding: spacing.md,
                  marginBottom: spacing.xl,
                  fontSize: typography.sizes.base,
                },
              ]}
            />

            <Button
              title="Create Habit"
              variant="ai"
              size="lg"
              icon="flame"
              onPress={handleCreateHabit}
              disabled={!newHabitName.trim()}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {},
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalContent: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalBody: {},
  textInput: {
    borderWidth: 1,
  },
});
