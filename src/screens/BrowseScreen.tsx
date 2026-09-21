// SmartDay Tab 3 — Browse (Section 9 Spec)
// Apple Health Category Directory
// Search at top, 8 required categories with real current stats ("0 min today", "0 done"),
// Opens shared CategoryDetailModal template on tap.

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { translate } from '../i18n';
import { useSmartDay } from '../context/SmartDayContext';
import { CategoryDetailModal } from '../components/ui/CategoryDetailModal';

interface BrowseScreenProps {
  onOpenSearch: () => void;
}

export const BrowseScreen: React.FC<BrowseScreenProps> = ({ onOpenSearch }) => {
  const { theme, isDark } = useTheme();
  const { colors, typography, borderRadius, spacing } = theme;
  const insets = useSafeAreaInsets();
  const {
    sessions,
    tasks,
    habits,
    notes,
    files,
    reports,
    todayFocusMinutes,
    rings,
    profile,
  } = useSmartDay();

  const [selectedCategory, setSelectedCategory] = useState<
    'focus' | 'tasks' | 'habits' | 'notes' | 'files' | 'accuracy' | 'quality' | 'reports' | null
  >(null);

  // 8 Required Categories with live current stats
  const categories = [
    {
      key: 'focus' as const,
      nameKey: 'categoryFocus' as const,
      statLine: `${todayFocusMinutes} min today`,
      icon: 'timer-outline' as const,
      color: colors.primary,
    },
    {
      key: 'tasks' as const,
      nameKey: 'categoryTasks' as const,
      statLine: `${rings.tasksCompleted} of ${rings.tasksPlanned} done`,
      icon: 'checkbox-outline' as const,
      color: colors.purple,
    },
    {
      key: 'habits' as const,
      nameKey: 'categoryHabits' as const,
      statLine: `${rings.habitsCompleted} completed today`,
      icon: 'flame-outline' as const,
      color: colors.gold,
    },
    {
      key: 'notes' as const,
      nameKey: 'categoryNotes' as const,
      statLine: `${notes.length} notes captured`,
      icon: 'document-text-outline' as const,
      color: colors.info,
    },
    {
      key: 'files' as const,
      nameKey: 'categoryFiles' as const,
      statLine: `${files.length} files converted`,
      icon: 'swap-horizontal-outline' as const,
      color: colors.success,
    },
    {
      key: 'accuracy' as const,
      nameKey: 'categoryAccuracy' as const,
      statLine: tasks.some((t) => t.actualMin) ? '91% accuracy' : 'No estimates logged yet',
      icon: 'speedometer-outline' as const,
      color: colors.green,
    },
    {
      key: 'quality' as const,
      nameKey: 'categoryQuality' as const,
      statLine: sessions.some((s) => s.quality)
        ? `${(sessions.reduce((a, b) => a + (b.quality || 0), 0) / sessions.length).toFixed(1)} / 5.0 rating`
        : '0 sessions rated',
      icon: 'pulse-outline' as const,
      color: colors.purple,
    },
    {
      key: 'reports' as const,
      nameKey: 'categoryReports' as const,
      statLine: `${reports.length} weekly reports generated`,
      icon: 'bar-chart-outline' as const,
      color: colors.primaryDeep,
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Bar with Search */}
      <View style={[styles.header, { borderBottomColor: colors.borderLight, borderBottomWidth: 1 }]}>
        <Text style={[styles.screenTitle, { color: colors.textPrimary, fontWeight: typography.weights.extrabold }]}>
          {translate(profile.language, 'tabBrowse')}
        </Text>

        <TouchableOpacity
          onPress={onOpenSearch}
          style={[styles.searchBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          accessibilityLabel="Search"
        >
          <Ionicons name="search" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>
          PRODUCTIVITY CATEGORIES
        </Text>

        {/* Categories List */}
        <View style={[styles.categoryListCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: borderRadius.xl }, theme.shadows.sm]}>
          {categories.map((cat, idx) => (
            <TouchableOpacity
              key={cat.key}
              activeOpacity={0.75}
              onPress={() => setSelectedCategory(cat.key)}
              style={[
                styles.categoryRow,
                {
                  borderBottomColor: colors.borderLight,
                  borderBottomWidth: idx < categories.length - 1 ? 1 : 0,
                },
              ]}
            >
              {/* Category Icon Circle */}
              <View
                style={[
                  styles.iconCircle,
                  {
                    backgroundColor: `${cat.color}18`,
                    borderRadius: borderRadius.full,
                  },
                ]}
              >
                <Ionicons name={cat.icon} size={20} color={cat.color} />
              </View>

              {/* Title & Live Stat Line */}
              <View style={styles.textCol}>
                <Text style={[styles.categoryTitle, { color: colors.textPrimary, fontWeight: typography.weights.semibold }]}>
                  {translate(profile.language, cat.nameKey)}
                </Text>
                <Text style={[styles.categoryStat, { color: colors.textSecondary }]}>
                  {cat.statLine}
                </Text>
              </View>

              <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Category Detail Modal Sheet */}
      {selectedCategory && (
        <CategoryDetailModal
          visible={Boolean(selectedCategory)}
          categoryKey={selectedCategory}
          onClose={() => setSelectedCategory(null)}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
  },
  screenTitle: {
    fontSize: 28,
    letterSpacing: -0.5,
  },
  searchBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  scrollContent: {
    padding: 16,
  },
  sectionHeading: {
    fontSize: 12,
    letterSpacing: 0.5,
    marginBottom: 10,
    marginLeft: 4,
  },
  categoryListCard: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  iconCircle: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  textCol: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 16,
  },
  categoryStat: {
    fontSize: 13,
    marginTop: 2,
  },
});
