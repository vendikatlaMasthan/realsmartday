// SmartDay Tab 1 — Summary (Section 7 Spec)
// Apple Health Summary Analog + Cotap Visual Language
// Zero fake data guarantee. Real live concentric rings hero, compact stat row,
// 4-card trend strip, highlight of the day, favorites modules with honest empty states.

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { translate, formatLocaleDate } from '../i18n';
import { useSmartDay } from '../context/SmartDayContext';
import { DailyRings } from '../components/ui/DailyRings';
import { TrendStrip } from '../components/ui/TrendStrip';
import { HighlightCard } from '../components/ui/HighlightCard';
import { TaskStatusRow } from '../components/ui/TaskStatusRow';
import { HabitStreakRow } from '../components/ui/HabitStreakRow';
import { QuickActionsGrid } from '../components/ui/QuickActionsGrid';

interface SummaryScreenProps {
  onNavigateToPlan: () => void;
  onNavigateToBrowse: (categoryKey?: string) => void;
  onNavigateToHighlights: () => void;
  onNavigateToYou: () => void;
  onOpenSearch: () => void;
  onOpenStartFocus: () => void;
  onOpenAddTask: () => void;
  onOpenLogHabit: () => void;
  onOpenQuickNote: () => void;
  onOpenFileConverter: () => void;
  onOpenWeeklyReport: () => void;
}

export const SummaryScreen: React.FC<SummaryScreenProps> = ({
  onNavigateToPlan,
  onNavigateToBrowse,
  onNavigateToHighlights,
  onNavigateToYou,
  onOpenSearch,
  onOpenStartFocus,
  onOpenAddTask,
  onOpenLogHabit,
  onOpenQuickNote,
  onOpenFileConverter,
  onOpenWeeklyReport,
}) => {
  const { theme, isDark } = useTheme();
  const { colors, typography, borderRadius, spacing } = theme;
  const insets = useSafeAreaInsets();
  const {
    profile,
    rings,
    todayTasks,
    habits,
    highlights,
    toggleTask,
    deleteTask,
    rescheduleTask,
    convertTaskToHabit,
    toggleHabitToday,
    skipHabitToday,
  } = useSmartDay();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  };

  // Greeting
  const currentHour = new Date().getHours();
  const greetingKey =
    currentHour < 12
      ? 'greetingMorning'
      : currentHour < 18
      ? 'greetingAfternoon'
      : 'greetingEvening';

  const formattedDate = formatLocaleDate(new Date(), profile.language);

  // Top tasks (max 5)
  const topFocusTasks = todayTasks.slice(0, 5);

  // Highlight of the day: top item from highlights feed
  const highlightOfDay = highlights[0];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + spacing.sm,
            paddingBottom: insets.bottom + 96,
            paddingHorizontal: spacing.base,
          },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* A) TOP BAR: Greeting + Date, Avatar, Search */}
        <View style={styles.topBar}>
          <View>
            <Text style={[styles.dateText, { color: colors.textSecondary }]}>
              {formattedDate.toUpperCase()}
            </Text>
            <Text style={[styles.greetingText, { color: colors.textPrimary, fontWeight: typography.weights.extrabold }]}>
              {translate(profile.language, greetingKey)}, {profile.name}
            </Text>
          </View>

          <View style={styles.topBarIcons}>
            <TouchableOpacity
              onPress={onOpenSearch}
              style={[styles.iconButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
              accessibilityLabel="Search"
            >
              <Ionicons name="search" size={20} color={colors.textPrimary} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onNavigateToYou}
              style={[styles.avatarButton, { backgroundColor: colors.primarySurface, borderColor: colors.primary }]}
              accessibilityLabel="Open Profile"
            >
              <Text style={{ color: colors.primary, fontWeight: typography.weights.bold, fontSize: 14 }}>
                {profile.name.charAt(0)}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* B) HERO DAILY RINGS CARD (The Apple Health Hero of the page) */}
        <View
          style={[
            styles.heroCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: borderRadius.xl,
              marginTop: spacing.sm,
              padding: spacing.xl,
            },
            theme.shadows.md,
          ]}
        >
          {/* Header Row of Hero */}
          <View style={styles.heroHeader}>
            <View>
              <Text style={[styles.heroCardTitle, { color: colors.textPrimary, fontWeight: typography.weights.bold }]}>
                Daily Rings
              </Text>
              <Text style={[styles.heroCardSubtitle, { color: colors.textSecondary }]}>
                Focus · Tasks · Habits
              </Text>
            </View>

            <TouchableOpacity
              onPress={onNavigateToYou}
              style={[styles.setGoalPill, { backgroundColor: colors.surfaceSecondary, borderRadius: borderRadius.full }]}
            >
              <Ionicons name="flag-outline" size={12} color={colors.textSecondary} style={{ marginRight: 4 }} />
              <Text style={{ color: colors.textSecondary, fontSize: 11, fontWeight: typography.weights.semibold }}>
                {translate(profile.language, 'setDailyGoals')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* 3 Concentric Rings */}
          <View style={styles.ringsWrapper}>
            <DailyRings
              rings={rings}
              onPressRing={(cat) => onNavigateToBrowse(cat)}
              onLongPress={onNavigateToYou}
            />
          </View>

          {/* Compact Stat Row Under Rings */}
          <View
            style={[
              styles.compactStatRow,
              {
                borderTopColor: colors.borderLight,
                borderTopWidth: 1,
                paddingTop: spacing.base,
                marginTop: spacing.base,
              },
            ]}
          >
            <View style={styles.statCell}>
              <Text style={[styles.statCellVal, { color: colors.primary }]}>{rings.focusMinutes}m</Text>
              <Text style={[styles.statCellLbl, { color: colors.textSecondary }]}>{translate(profile.language, 'focus')}</Text>
            </View>

            <View style={[styles.statDivider, { backgroundColor: colors.borderLight }]} />

            <View style={styles.statCell}>
              <Text style={[styles.statCellVal, { color: colors.purple }]}>
                {rings.tasksCompleted}/{rings.tasksPlanned}
              </Text>
              <Text style={[styles.statCellLbl, { color: colors.textSecondary }]}>{translate(profile.language, 'tasks')}</Text>
            </View>

            <View style={[styles.statDivider, { backgroundColor: colors.borderLight }]} />

            <View style={styles.statCell}>
              <Text style={[styles.statCellVal, { color: colors.gold }]}>
                {rings.habitsCompleted}/{rings.habitsDue}
              </Text>
              <Text style={[styles.statCellLbl, { color: colors.textSecondary }]}>{translate(profile.language, 'habits')}</Text>
            </View>

            <View style={[styles.statDivider, { backgroundColor: colors.borderLight }]} />

            <View style={styles.statCell}>
              <Text style={[styles.statCellVal, { color: colors.gold }]}>{rings.streakDays}d</Text>
              <Text style={[styles.statCellLbl, { color: colors.textSecondary }]}>{translate(profile.language, 'streak')}</Text>
            </View>
          </View>

          {/* The ONE Primary CTA Button on Summary */}
          <TouchableOpacity
            onPress={onOpenStartFocus}
            activeOpacity={0.85}
            style={[
              styles.primaryHeroCta,
              {
                backgroundColor: colors.primary,
                borderRadius: borderRadius.full,
                marginTop: spacing.base,
              },
            ]}
          >
            <Ionicons name="play-circle" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: typography.weights.bold }}>
              {translate(profile.language, 'startFocusSession')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* C) TREND STRIP: 4 Tappable Mini Cards */}
        <View style={styles.sectionWrapper}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontWeight: typography.weights.bold }]}>
            Trends
          </Text>
          <TrendStrip onPressCard={(cat) => onNavigateToBrowse(cat)} />
        </View>

        {/* D) HIGHLIGHT OF THE DAY */}
        <View style={styles.sectionWrapper}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontWeight: typography.weights.bold }]}>
              {translate(profile.language, 'highlightOfTheDay')}
            </Text>
            {highlightOfDay ? (
              <TouchableOpacity onPress={onNavigateToHighlights}>
                <Text style={{ color: colors.primary, fontSize: 13, fontWeight: typography.weights.semibold }}>
                  {translate(profile.language, 'seeAll')}
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {highlightOfDay ? (
            <HighlightCard
              highlight={highlightOfDay}
              onActionPress={(target) => {
                if (target === 'focus') onOpenStartFocus();
                else if (target === 'plan') onNavigateToPlan();
                else onNavigateToHighlights();
              }}
            />
          ) : (
            <View
              style={[
                styles.emptyHighlightCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderRadius: borderRadius.xl,
                  padding: spacing.xl,
                },
                theme.shadows.sm,
              ]}
            >
              <Ionicons name="sparkles-outline" size={26} color={colors.textTertiary} style={{ marginBottom: 6 }} />
              <Text style={[styles.emptyHighlightText, { color: colors.textSecondary }]}>
                {translate(profile.language, 'highlightsEmptyState')}
              </Text>
            </View>
          )}
        </View>

        {/* E) MODULE — QUICK ACTIONS (FIXED 3x2 GRID, 6 CARDS) */}
        <View style={styles.sectionWrapper}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontWeight: typography.weights.bold }]}>
            {translate(profile.language, 'quickActions')}
          </Text>
          <QuickActionsGrid
            onStartFocus={onOpenStartFocus}
            onAddTask={onOpenAddTask}
            onLogHabit={onOpenLogHabit}
            onQuickNote={onOpenQuickNote}
            onConvertFile={onOpenFileConverter}
            onWeeklyReport={onOpenWeeklyReport}
          />
        </View>

        {/* F) MODULE — TODAY'S TOP FOCUS */}
        <View style={styles.sectionWrapper}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontWeight: typography.weights.bold }]}>
              {translate(profile.language, 'todaysTopFocus')}
            </Text>
            <TouchableOpacity onPress={onNavigateToPlan}>
              <Text style={{ color: colors.primary, fontSize: 13, fontWeight: typography.weights.semibold }}>
                {translate(profile.language, 'seeAll')}
              </Text>
            </TouchableOpacity>
          </View>

          {topFocusTasks.length === 0 ? (
            <View
              style={[
                styles.emptyModuleCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderRadius: borderRadius.xl,
                  padding: spacing.xl,
                },
                theme.shadows.sm,
              ]}
            >
              <Ionicons name="checkbox-outline" size={28} color={colors.textTertiary} style={{ marginBottom: 6 }} />
              <Text style={[styles.emptyModuleText, { color: colors.textSecondary }]}>
                {translate(profile.language, 'noTasksPlannedYet')}
              </Text>
            </View>
          ) : (
            topFocusTasks.map((t) => (
              <TaskStatusRow
                key={t.id}
                task={t}
                onToggle={toggleTask}
                onPress={() => onNavigateToPlan()}
                onDelete={deleteTask}
                onReschedule={(id) => rescheduleTask(id, '15:00')}
                onConvertToHabit={convertTaskToHabit}
              />
            ))
          )}
        </View>

        {/* G) MODULE — HABIT STREAKS */}
        <View style={styles.sectionWrapper}>
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontWeight: typography.weights.bold }]}>
                {translate(profile.language, 'habitStreaks')}
              </Text>
              {/* Universal Legend Defined Once */}
              <Text style={[styles.legendText, { color: colors.textSecondary }]}>
                {translate(profile.language, 'habitLegend')}
              </Text>
            </View>

            <TouchableOpacity onPress={onOpenLogHabit}>
              <Ionicons name="add-circle" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {habits.length === 0 ? (
            <View
              style={[
                styles.emptyModuleCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderRadius: borderRadius.xl,
                  padding: spacing.xl,
                },
                theme.shadows.sm,
              ]}
            >
              <Ionicons name="flame-outline" size={28} color={colors.textTertiary} style={{ marginBottom: 6 }} />
              <Text style={[styles.emptyModuleText, { color: colors.textSecondary }]}>
                {translate(profile.language, 'addFirstHabitHint')}
              </Text>
            </View>
          ) : (
            habits.slice(0, 4).map((h) => (
              <HabitStreakRow
                key={h.id}
                habit={h}
                onToggleToday={toggleHabitToday}
                onSkipToday={skipHabitToday}
                onPress={() => onNavigateToBrowse('habits')}
              />
            ))
          )}
        </View>

        {/* H) MODULE — NEXT UP (CALENDAR BLOCKS) */}
        <View style={styles.sectionWrapper}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontWeight: typography.weights.bold }]}>
            {translate(profile.language, 'nextUp')}
          </Text>
          <View
            style={[
              styles.emptyModuleCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderRadius: borderRadius.xl,
                padding: spacing.xl,
              },
              theme.shadows.sm,
            ]}
          >
            <Ionicons name="calendar-outline" size={26} color={colors.textTertiary} style={{ marginBottom: 6 }} />
            <Text style={[styles.emptyModuleText, { color: colors.textSecondary }]}>
              {translate(profile.language, 'nothingScheduledHint')}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {},
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dateText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  greetingText: {
    fontSize: 24,
    letterSpacing: -0.5,
    marginTop: 2,
  },
  topBarIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  avatarButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  heroCard: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  heroCardTitle: {
    fontSize: 18,
    letterSpacing: -0.3,
  },
  heroCardSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  setGoalPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  ringsWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  compactStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statCell: {
    alignItems: 'center',
    flex: 1,
  },
  statCellVal: {
    fontSize: 15,
    fontWeight: '700',
  },
  statCellLbl: {
    fontSize: 11,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
  },
  primaryHeroCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  sectionWrapper: {
    marginTop: 28, // strict section spacing rhythm
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    letterSpacing: -0.2,
    marginBottom: 8,
  },
  legendText: {
    fontSize: 11,
    marginTop: 2,
  },
  emptyHighlightCard: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyHighlightText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  emptyModuleCard: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyModuleText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});
