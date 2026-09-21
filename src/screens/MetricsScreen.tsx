// SmartDay Tab 4 — Metrics & Academic Analytics Screen
// Unified Emerald Forest Student OS Design System matching Home Screen

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ScreenHeader } from '../components/common/ScreenHeader';
import { useSmartDay } from '../context/SmartDayContext';

type SubTab = 'overview' | 'courses' | 'budget' | 'streaks';

interface MetricsScreenProps {
  onOpenSearch?: () => void;
  onOpenStartFocus?: () => void;
  onNavigateToPlan?: () => void;
}

export const MetricsScreen: React.FC<MetricsScreenProps> = ({
  onOpenSearch,
  onOpenStartFocus,
  onNavigateToPlan,
}) => {
  const insets = useSafeAreaInsets();
  const { todayTasks, habits } = useSmartDay();

  const [activeTab, setActiveTab] = useState<SubTab>('overview');
  const [timeRange, setTimeRange] = useState<'3d' | 'week' | 'month'>('week');

  // Student Expenses Data
  const [expenses, setExpenses] = useState([
    { id: 'e1', title: 'DBMS Textbook (Korth 7th Ed)', amount: 45.0, date: 'Today, 10:15 AM', category: 'Books' },
    { id: 'e2', title: 'Campus Cafeteria Coffee & Snack', amount: 4.5, date: 'Today, 8:45 AM', category: 'Food' },
    { id: 'e3', title: 'Spiral Notebooks & Gel Pens', amount: 8.25, date: 'Yesterday', category: 'Stationery' },
    { id: 'e4', title: 'Hostel Wi-Fi Subscription', amount: 15.0, date: 'Sep 18', category: 'Utilities' },
  ]);

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const weeklyBudget = 100.0;

  return (
    <View style={styles.rootContainer}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          { paddingBottom: insets.bottom + 120 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Emerald Screen Header */}
        <ScreenHeader
          topPadding={insets.top}
          greetingSub="Academic Analytics"
          title="PERFORMANCE & METRICS"
          tagline="Track your study hours, consistency & course progress 📊"
          dateText="Mon, Sep 21, 2024"
          onSearchPress={onOpenSearch}
        />

        <View style={styles.bodyContent}>
          {/* Sub-tab Navigation Pill */}
          <View style={styles.subTabRow}>
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'courses', label: 'Courses' },
              { id: 'budget', label: 'Student Budget' },
              { id: 'streaks', label: 'Streaks' },
            ].map((tab) => (
              <TouchableOpacity
                key={tab.id}
                style={[
                  styles.subTabBtn,
                  activeTab === tab.id && styles.subTabBtnActive,
                ]}
                onPress={() => setActiveTab(tab.id as SubTab)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.subTabText,
                    activeTab === tab.id && styles.subTabTextActive,
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <View style={styles.tabSection}>
              {/* Primary Progress Card */}
              <View style={styles.card}>
                <View style={styles.cardHeaderRow}>
                  <View>
                    <Text style={styles.cardTitle}>Today's Academic Score</Text>
                    <Text style={styles.cardSub}>60% overall daily milestone achieved</Text>
                  </View>
                  <View style={styles.scoreBadge}>
                    <Text style={styles.scoreBadgeText}>+12% vs avg</Text>
                  </View>
                </View>

                {/* Metrics Stats Triple Grid */}
                <View style={styles.statsGrid}>
                  <View style={styles.statBox}>
                    <View style={styles.statIconCircle}>
                      <Ionicons name="checkmark-done" size={16} color="#006951" />
                    </View>
                    <Text style={styles.statNumber}>3 / 5</Text>
                    <Text style={styles.statLabel}>Tasks Done</Text>
                  </View>

                  <View style={styles.statBox}>
                    <View style={styles.statIconCircle}>
                      <Ionicons name="time" size={16} color="#006951" />
                    </View>
                    <Text style={styles.statNumber}>50 min</Text>
                    <Text style={styles.statLabel}>Deep Focus</Text>
                  </View>

                  <View style={styles.statBox}>
                    <View style={styles.statIconCircle}>
                      <Ionicons name="flame" size={16} color="#006951" />
                    </View>
                    <Text style={styles.statNumber}>1 / 3</Text>
                    <Text style={styles.statLabel}>Habits Logged</Text>
                  </View>
                </View>
              </View>

              {/* Weekly Study Hours Breakdown */}
              <View style={styles.card}>
                <View style={styles.cardHeaderRow}>
                  <View>
                    <Text style={styles.cardTitle}>Study Distribution</Text>
                    <Text style={styles.cardSub}>28.5 hrs logged this week</Text>
                  </View>
                  <View style={styles.rangePill}>
                    <Text style={styles.rangePillText}>This Week</Text>
                  </View>
                </View>

                {/* Progress bars by course */}
                <View style={styles.courseDistributionList}>
                  {[
                    { name: 'Database Management Systems', hours: '11.5h', pct: 85, color: '#006951' },
                    { name: 'Operating Systems', hours: '8.0h', pct: 65, color: '#059669' },
                    { name: 'Algorithms & Data Structures', hours: '6.0h', pct: 50, color: '#10B981' },
                    { name: 'Computer Networks', hours: '3.0h', pct: 30, color: '#34D399' },
                  ].map((c) => (
                    <View key={c.name} style={styles.courseBarItem}>
                      <View style={styles.courseBarInfoRow}>
                        <Text style={styles.courseBarName}>{c.name}</Text>
                        <Text style={styles.courseBarHours}>{c.hours}</Text>
                      </View>
                      <View style={styles.progressBarTrack}>
                        <View
                          style={[
                            styles.progressBarFill,
                            { width: `${c.pct}%`, backgroundColor: c.color },
                          ]}
                        />
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}

          {/* TAB 2: COURSES */}
          {activeTab === 'courses' && (
            <View style={styles.tabSection}>
              {[
                { code: 'CS301', title: 'Database Management Systems', grade: 'A', gpa: '94%', prof: 'Dr. Ramesh K.', room: 'AB-II – 301' },
                { code: 'CS302', title: 'Operating Systems & Architecture', grade: 'A-', gpa: '89%', prof: 'Prof. Ananya S.', room: 'AB-I – 204' },
                { code: 'CS303', title: 'Design & Analysis of Algorithms', grade: 'A', gpa: '92%', prof: 'Dr. Vikram V.', room: 'CS Lab 2' },
                { code: 'CS304', title: 'Computer Networks & Security', grade: 'B+', gpa: '85%', prof: 'Prof. Harish M.', room: 'AB-II – 402' },
              ].map((course) => (
                <View key={course.code} style={styles.courseCard}>
                  <View style={styles.courseHeader}>
                    <View style={styles.courseCodeBadge}>
                      <Text style={styles.courseCodeText}>{course.code}</Text>
                    </View>
                    <View style={styles.gradeBadge}>
                      <Text style={styles.gradeBadgeText}>{course.grade} ({course.gpa})</Text>
                    </View>
                  </View>

                  <Text style={styles.courseTitle}>{course.title}</Text>

                  <View style={styles.courseDetailsRow}>
                    <View style={styles.detailItem}>
                      <Ionicons name="person-outline" size={13} color="#64748B" />
                      <Text style={styles.detailText}>{course.prof}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Ionicons name="location-outline" size={13} color="#64748B" />
                      <Text style={styles.detailText}>{course.room}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* TAB 3: STUDENT BUDGET */}
          {activeTab === 'budget' && (
            <View style={styles.tabSection}>
              <View style={styles.card}>
                <View style={styles.cardHeaderRow}>
                  <View>
                    <Text style={styles.cardTitle}>Weekly Student Allowance</Text>
                    <Text style={styles.cardSub}>Budget: ${weeklyBudget.toFixed(2)}</Text>
                  </View>
                  <Text style={styles.budgetLeftText}>
                    ${(weeklyBudget - totalSpent).toFixed(2)} left
                  </Text>
                </View>

                {/* Progress bar */}
                <View style={[styles.progressBarTrack, { height: 10, marginVertical: 14 }]}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${Math.min(100, (totalSpent / weeklyBudget) * 100)}%`,
                        backgroundColor: '#006951',
                      },
                    ]}
                  />
                </View>

                <View style={styles.budgetQuickActionRow}>
                  <TouchableOpacity
                    style={styles.budgetActionBtn}
                    onPress={() => {
                      const newExp = {
                        id: 'e_' + Date.now(),
                        title: 'Quick Campus Expense',
                        amount: 5.0,
                        date: 'Just now',
                        category: 'Food',
                      };
                      setExpenses([newExp, ...expenses]);
                      Alert.alert('Expense Logged', 'Added $5.00 to expenses.');
                    }}
                  >
                    <Ionicons name="add" size={16} color="#006951" />
                    <Text style={styles.budgetActionBtnText}>+ Log Expense</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.budgetActionBtn}
                    onPress={() => Alert.alert('Receipt OCR Scanner', 'Scanned Campus Store receipt! Extracted: $12.50 for Stationery.')}
                  >
                    <Ionicons name="scan-outline" size={16} color="#006951" />
                    <Text style={styles.budgetActionBtnText}>Scan Receipt</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Expense Items */}
              <View style={styles.card}>
                <Text style={[styles.cardTitle, { marginBottom: 12 }]}>Recent Expenses</Text>
                {expenses.map((exp) => (
                  <View key={exp.id} style={styles.expenseRow}>
                    <View style={styles.expenseIconBox}>
                      <Ionicons name="receipt-outline" size={16} color="#006951" />
                    </View>
                    <View style={styles.expenseInfo}>
                      <Text style={styles.expenseTitle}>{exp.title}</Text>
                      <Text style={styles.expenseDate}>{exp.date} • {exp.category}</Text>
                    </View>
                    <Text style={styles.expenseAmount}>-${exp.amount.toFixed(2)}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* TAB 4: STREAKS */}
          {activeTab === 'streaks' && (
            <View style={styles.tabSection}>
              <View style={styles.card}>
                <View style={styles.cardHeaderRow}>
                  <View>
                    <Text style={styles.cardTitle}>Study Streak Leaderboard</Text>
                    <Text style={styles.cardSub}>Rank among Computer Science cohort</Text>
                  </View>
                  <View style={styles.streakFlameBadge}>
                    <Ionicons name="flame" size={16} color="#F59E0B" />
                    <Text style={styles.streakFlameText}>14 Days</Text>
                  </View>
                </View>

                <View style={styles.leaderboardList}>
                  {[
                    { rank: 1, name: 'VENDIKATLA MASTHAN (You)', streak: '14 Days', hours: '48.5h', isUser: true },
                    { rank: 2, name: 'Rahul Sharma', streak: '12 Days', hours: '42.0h', isUser: false },
                    { rank: 3, name: 'Sneha Patel', streak: '10 Days', hours: '39.0h', isUser: false },
                    { rank: 4, name: 'Karthik Reddy', streak: '9 Days', hours: '35.5h', isUser: false },
                  ].map((player) => (
                    <View
                      key={player.rank}
                      style={[
                        styles.leaderboardRow,
                        player.isUser && styles.leaderboardRowActive,
                      ]}
                    >
                      <View style={styles.rankBadge}>
                        <Text style={[styles.rankText, player.isUser && styles.rankTextActive]}>
                          #{player.rank}
                        </Text>
                      </View>
                      <View style={styles.playerInfo}>
                        <Text style={[styles.playerName, player.isUser && styles.playerNameActive]}>
                          {player.name}
                        </Text>
                        <Text style={styles.playerSub}>{player.hours} logged</Text>
                      </View>
                      <View style={styles.playerStreakBadge}>
                        <Text style={styles.playerStreakText}>{player.streak}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContainer: {
    paddingBottom: 120,
  },
  bodyContent: {
    paddingHorizontal: 16,
    marginTop: -10,
    gap: 16,
  },
  subTabRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  subTabBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 9,
    borderRadius: 14,
  },
  subTabBtnActive: {
    backgroundColor: '#006951',
  },
  subTabText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  subTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  tabSection: {
    gap: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  cardSub: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 2,
  },
  scoreBadge: {
    backgroundColor: '#E6FBF2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  scoreBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E6FBF2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  statNumber: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
  rangePill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  rangePillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  courseDistributionList: {
    gap: 12,
  },
  courseBarItem: {
    gap: 6,
  },
  courseBarInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  courseBarName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  courseBarHours: {
    fontSize: 12,
    fontWeight: '800',
    color: '#006951',
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  courseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  courseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  courseCodeBadge: {
    backgroundColor: '#E6F7F0',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  courseCodeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#059669',
  },
  gradeBadge: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  gradeBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#006951',
  },
  courseTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
  },
  courseDetailsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
  },
  budgetLeftText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#006951',
  },
  budgetQuickActionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  budgetActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E6FBF2',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  budgetActionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#006951',
  },
  expenseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  expenseIconBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#E6FBF2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  expenseInfo: {
    flex: 1,
  },
  expenseTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  expenseDate: {
    fontSize: 11,
    fontWeight: '500',
    color: '#94A3B8',
    marginTop: 2,
  },
  expenseAmount: {
    fontSize: 13,
    fontWeight: '800',
    color: '#EF4444',
  },
  streakFlameBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  streakFlameText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#D97706',
  },
  leaderboardList: {
    gap: 10,
  },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  leaderboardRowActive: {
    backgroundColor: '#E6FBF2',
    borderColor: '#A7F3D0',
  },
  rankBadge: {
    width: 28,
    alignItems: 'center',
  },
  rankText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#94A3B8',
  },
  rankTextActive: {
    color: '#006951',
  },
  playerInfo: {
    flex: 1,
    marginLeft: 8,
  },
  playerName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  playerNameActive: {
    color: '#006951',
    fontWeight: '800',
  },
  playerSub: {
    fontSize: 11,
    fontWeight: '500',
    color: '#94A3B8',
    marginTop: 1,
  },
  playerStreakBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  playerStreakText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#006951',
  },
});
