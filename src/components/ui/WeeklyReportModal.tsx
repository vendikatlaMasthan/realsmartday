// SmartDay Weekly Report Modal (Section 12-G & 13 Spec)
// Beautiful single-page card (dark teal hero, rings, 4 stats, quote highlight, next week goal)
// Export/share and history of last 8 reports. Honest empty state before first full week.

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { translate } from '../../i18n';
import { useSmartDay } from '../../context/SmartDayContext';

interface WeeklyReportModalProps {
  visible: boolean;
  onClose: () => void;
}

export const WeeklyReportModal: React.FC<WeeklyReportModalProps> = ({
  visible,
  onClose,
}) => {
  const { theme, isDark } = useTheme();
  const { colors, typography, borderRadius, spacing } = theme;
  const { reports, generateWeeklyReport, rings, profile } = useSmartDay();

  const latestReport = reports[0];

  const handleShare = async () => {
    if (!latestReport) return;
    try {
      await Share.share({
        message: `SmartDay Weekly Report (${latestReport.weekOf}):\n🎯 ${latestReport.payload.tasksCompletedTotal} Tasks closed\n⚡ ${Math.round(latestReport.payload.focusMinutesTotal / 60)}h Focused\n🔥 ${latestReport.payload.longestHabitStreak}d Streak\n${latestReport.payload.highlightSummary}`,
      });
    } catch {
      // Ignored
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.borderLight, borderBottomWidth: 1 }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary, fontWeight: typography.weights.bold }]}>
            {translate(profile.language, 'actionWeeklyReport')}
          </Text>
          <TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
            <Ionicons name="share-outline" size={22} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {latestReport ? (
            <>
              {/* Premium Report Card */}
              <View style={[styles.reportCardWrapper, { borderRadius: borderRadius.xl }, theme.shadows.md]}>
                <LinearGradient
                  colors={colors.heroGradient as [string, string, ...string[]]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[styles.gradientCard, { borderRadius: borderRadius.xl, padding: spacing.xl }]}
                >
                  <View style={styles.cardTop}>
                    <Text style={styles.brandTitle}>SmartDay Summary</Text>
                    <Text style={styles.weekLabel}>Week of {latestReport.weekOf}</Text>
                  </View>

                  {/* 4 Big Stat Columns */}
                  <View style={styles.statGrid}>
                    <View style={styles.statBox}>
                      <Text style={styles.statNum}>
                        {Math.round(latestReport.payload.focusMinutesTotal / 60)}h
                      </Text>
                      <Text style={styles.statLabel}>Focus Time</Text>
                    </View>
                    <View style={styles.statBox}>
                      <Text style={styles.statNum}>{latestReport.payload.tasksCompletedTotal}</Text>
                      <Text style={styles.statLabel}>Tasks Done</Text>
                    </View>
                    <View style={styles.statBox}>
                      <Text style={styles.statNum}>{latestReport.payload.longestHabitStreak}d</Text>
                      <Text style={styles.statLabel}>Top Streak</Text>
                    </View>
                    <View style={styles.statBox}>
                      <Text style={styles.statNum}>{latestReport.payload.ringsClosedCount}/3</Text>
                      <Text style={styles.statLabel}>Rings Closed</Text>
                    </View>
                  </View>

                  {/* Highlight Quote */}
                  <View style={styles.quoteBox}>
                    <Ionicons name="sparkles" size={16} color="#2DD4BF" style={{ marginRight: 8 }} />
                    <Text style={styles.quoteText}>{latestReport.payload.highlightSummary}</Text>
                  </View>

                  {/* Next Week Target */}
                  <View style={styles.targetRow}>
                    <Text style={styles.targetLabel}>Next Week Target:</Text>
                    <Text style={styles.targetValue}>
                      {Math.round(latestReport.payload.nextWeekFocusGoal / 60)}h Focus
                    </Text>
                  </View>
                </LinearGradient>
              </View>

              {/* Action Buttons */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => generateWeeklyReport()}
                style={[styles.generateBtn, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: borderRadius.full }]}
              >
                <Ionicons name="refresh-outline" size={18} color={colors.textPrimary} style={{ marginRight: 8 }} />
                <Text style={{ color: colors.textPrimary, fontWeight: typography.weights.bold, fontSize: 14 }}>
                  Regenerate Report
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={[styles.emptyContainer, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: borderRadius.xl }]}>
              <Ionicons name="document-text-outline" size={44} color={colors.textTertiary} style={{ marginBottom: 12 }} />
              <Text style={[styles.emptyTitle, { color: colors.textPrimary, fontWeight: typography.weights.bold }]}>
                No Weekly Reports Yet
              </Text>
              <Text style={[styles.emptyBody, { color: colors.textSecondary }]}>
                {translate(profile.language, 'weeklyReportEmptyHint')}
              </Text>

              <TouchableOpacity
                onPress={() => generateWeeklyReport()}
                activeOpacity={0.8}
                style={[styles.nowBtn, { backgroundColor: colors.primary, borderRadius: borderRadius.full, marginTop: 20 }]}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: typography.weights.bold, fontSize: 14 }}>
                  Generate Initial Snapshot
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Past Reports History (last 8) */}
          {reports.length > 1 && (
            <View style={styles.historySection}>
              <Text style={[styles.historyHeading, { color: colors.textPrimary, fontWeight: typography.weights.bold }]}>
                Past Reports
              </Text>
              {reports.slice(1, 8).map((rep) => (
                <View
                  key={rep.id}
                  style={[styles.historyRow, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: borderRadius.lg }]}
                >
                  <Ionicons name="calendar-outline" size={18} color={colors.primary} style={{ marginRight: 12 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.textPrimary, fontWeight: typography.weights.semibold, fontSize: 14 }}>
                      Week of {rep.weekOf}
                    </Text>
                    <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                      {rep.payload.tasksCompletedTotal} tasks · {Math.round(rep.payload.focusMinutesTotal / 60)}h focus
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
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
  closeBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
  },
  shareBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 20,
  },
  reportCardWrapper: {
    overflow: 'hidden',
    marginBottom: 20,
  },
  gradientCard: {},
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  brandTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: -0.2,
  },
  weekLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
  },
  statGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statBox: {
    alignItems: 'center',
  },
  statNum: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    marginTop: 4,
  },
  quoteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  quoteText: {
    color: '#FFFFFF',
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  targetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
    paddingTop: 12,
  },
  targetLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  targetValue: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  generateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderWidth: 1,
    marginBottom: 24,
  },
  emptyContainer: {
    padding: 32,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    marginBottom: 6,
  },
  emptyBody: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  nowBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  historySection: {
    marginTop: 16,
  },
  historyHeading: {
    fontSize: 16,
    marginBottom: 12,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
});
