// SmartDay Tab 4 — Highlights (Section 11 Spec)
// Auto-generated insights feed computed strictly from real data (>= 7 days or >= 5 samples)
// Max 3/day, human phrasing in active locale, honest empty state for new users.

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { translate } from '../i18n';
import { useSmartDay } from '../context/SmartDayContext';
import { HighlightCard } from '../components/ui/HighlightCard';

interface HighlightsScreenProps {
  onNavigateToPlan: () => void;
  onNavigateToBrowse: (categoryKey?: string) => void;
  onOpenStartFocus: () => void;
}

export const HighlightsScreen: React.FC<HighlightsScreenProps> = ({
  onNavigateToPlan,
  onNavigateToBrowse,
  onOpenStartFocus,
}) => {
  const { theme, isDark } = useTheme();
  const { colors, typography, borderRadius, spacing } = theme;
  const insets = useSafeAreaInsets();
  const { highlights, profile } = useSmartDay();

  const handleAction = (target?: string) => {
    if (target === 'focus') onOpenStartFocus();
    else if (target === 'plan') onNavigateToPlan();
    else onNavigateToBrowse('focus');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.borderLight, borderBottomWidth: 1 }]}>
        <Text style={[styles.screenTitle, { color: colors.textPrimary, fontWeight: typography.weights.extrabold }]}>
          {translate(profile.language, 'tabHighlights')}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {highlights.length === 0 ? (
          <View style={[styles.emptyContainer, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: borderRadius.xl }, theme.shadows.sm]}>
            <View style={[styles.emptyIconCircle, { backgroundColor: colors.primarySurface }]}>
              <Ionicons name="sparkles" size={32} color={colors.primary} />
            </View>

            <Text style={[styles.emptyTitle, { color: colors.textPrimary, fontWeight: typography.weights.bold }]}>
              No Highlights Yet
            </Text>

            <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>
              {translate(profile.language, 'highlightsEmptyState')}
            </Text>

            <View style={[styles.ruleNotice, { backgroundColor: colors.surfaceSecondary, borderRadius: borderRadius.lg }]}>
              <Ionicons name="information-circle-outline" size={16} color={colors.textSecondary} style={{ marginRight: 6 }} />
              <Text style={{ color: colors.textSecondary, fontSize: 12, flex: 1 }}>
                SmartDay never fabricates insights. Patterns and personal bests are calculated after at least 5 logged sessions or habits.
              </Text>
            </View>
          </View>
        ) : (
          highlights.map((item) => (
            <HighlightCard
              key={item.id}
              highlight={item}
              onActionPress={handleAction}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    height: 56,
    justifyContent: 'center',
  },
  screenTitle: {
    fontSize: 28,
    letterSpacing: -0.5,
  },
  scrollContent: {
    padding: 16,
  },
  emptyContainer: {
    padding: 32,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  ruleNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
});
