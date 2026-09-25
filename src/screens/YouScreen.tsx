// SmartDay Tab 5 — You / Student Profile & OS Settings Screen
// Unified Emerald Forest Student OS Design System matching Home Screen

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  Alert,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ScreenHeader } from '../components/common/ScreenHeader';
import { useSmartDay } from '../context/SmartDayContext';
import { WeeklyReportModal } from '../components/ui/WeeklyReportModal';

export const YouScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { profile, updateGoals, resetAllData } = useSmartDay();

  // State
  const [weeklyReportVisible, setWeeklyReportVisible] = useState(false);
  const [breatheModalVisible, setBreatheModalVisible] = useState(false);
  const [breatheSeconds, setBreatheSeconds] = useState(5);
  const [isBreatheActive, setIsBreatheActive] = useState(false);
  const [notificationSync, setNotificationSync] = useState(true);
  const [offlineSync, setOfflineSync] = useState(true);

  // Daily goals state
  const [focusGoal, setFocusGoal] = useState(50);
  const [taskGoal, setTaskGoal] = useState(5);
  const [habitGoal, setHabitGoal] = useState(3);

  // Start breathing exercise
  const startBreathing = () => {
    setBreatheModalVisible(true);
    setBreatheSeconds(5);
    setIsBreatheActive(true);
    const interval = setInterval(() => {
      setBreatheSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsBreatheActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

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
          greetingSub="Student Profile & OS"
          title="VENDIKATLA MASTHAN"
          tagline="Computer Science & Engineering • 3rd Year 🎓"
        />

        <View style={styles.bodyContent}>
          {/* Student Profile Card */}
          <View style={styles.profileCard}>
            <View style={styles.profileHeaderRow}>
              <View style={styles.avatarWrapper}>
                <Image
                  source={{
                    uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
                  }}
                  style={styles.profileAvatar}
                />
                <View style={styles.onlineBadge} />
              </View>

              <View style={styles.profileDetails}>
                <Text style={styles.studentName}>VENDIKATLA MASTHAN</Text>
                <Text style={styles.studentEmail}>vendikatlamasthan143@gmail.com</Text>
                <View style={styles.rollCapsule}>
                  <Text style={styles.rollText}>ID: CS21B042 • Semester 5</Text>
                </View>
              </View>
            </View>

            {/* Academic Honors Badges */}
            <View style={styles.badgesRow}>
              <View style={styles.honorBadge}>
                <Text style={styles.honorBadgeIcon}>🔥</Text>
                <Text style={styles.honorBadgeText}>14-Day Streak</Text>
              </View>
              <View style={styles.honorBadge}>
                <Text style={styles.honorBadgeIcon}>🏅</Text>
                <Text style={styles.honorBadgeText}>DBMS High Honors</Text>
              </View>
              <View style={styles.honorBadge}>
                <Text style={styles.honorBadgeIcon}>🌟</Text>
                <Text style={styles.honorBadgeText}>Dean's List</Text>
              </View>
            </View>
          </View>

          {/* Daily Study Goals (Steppers) */}
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <View style={styles.cardTitleRow}>
                <Ionicons name="flag-outline" size={18} color="#006951" />
                <Text style={styles.cardTitle}>Daily Study Goals</Text>
              </View>
              <Text style={styles.cardSub}>Targets for daily streaks</Text>
            </View>

            {/* Goal 1: Focus Minutes */}
            <View style={styles.goalRow}>
              <View style={styles.goalInfo}>
                <Text style={styles.goalName}>Daily Focus Target</Text>
                <Text style={styles.goalSub}>Minutes of deep study</Text>
              </View>
              <View style={styles.stepperBox}>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => setFocusGoal((g) => Math.max(15, g - 15))}
                >
                  <Ionicons name="remove" size={16} color="#006951" />
                </TouchableOpacity>
                <Text style={styles.stepperValue}>{focusGoal}m</Text>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => setFocusGoal((g) => g + 15)}
                >
                  <Ionicons name="add" size={16} color="#006951" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Goal 2: Tasks Goal */}
            <View style={styles.goalRow}>
              <View style={styles.goalInfo}>
                <Text style={styles.goalName}>Daily Tasks Completed</Text>
                <Text style={styles.goalSub}>Study assignments & labs</Text>
              </View>
              <View style={styles.stepperBox}>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => setTaskGoal((g) => Math.max(1, g - 1))}
                >
                  <Ionicons name="remove" size={16} color="#006951" />
                </TouchableOpacity>
                <Text style={styles.stepperValue}>{taskGoal}</Text>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => setTaskGoal((g) => g + 1)}
                >
                  <Ionicons name="add" size={16} color="#006951" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Goal 3: Habits Goal */}
            <View style={[styles.goalRow, { borderBottomWidth: 0 }]}>
              <View style={styles.goalInfo}>
                <Text style={styles.goalName}>Healthy Study Habits</Text>
                <Text style={styles.goalSub}>Water, posture & sleep</Text>
              </View>
              <View style={styles.stepperBox}>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => setHabitGoal((g) => Math.max(1, g - 1))}
                >
                  <Ionicons name="remove" size={16} color="#006951" />
                </TouchableOpacity>
                <Text style={styles.stepperValue}>{habitGoal}</Text>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => setHabitGoal((g) => g + 1)}
                >
                  <Ionicons name="add" size={16} color="#006951" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Academic Courses & Curriculum */}
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <View style={styles.cardTitleRow}>
                <Ionicons name="school-outline" size={18} color="#006951" />
                <Text style={styles.cardTitle}>Enrolled Courses (Sem 5)</Text>
              </View>
              <Text style={styles.creditsBadge}>15 Credits</Text>
            </View>

            <View style={styles.courseItem}>
              <Text style={styles.courseItemCode}>CS301</Text>
              <View style={styles.courseItemInfo}>
                <Text style={styles.courseItemTitle}>Database Management Systems</Text>
                <Text style={styles.courseItemProf}>Dr. Ramesh K. • 4 Credits</Text>
              </View>
              <View style={styles.courseCheck}>
                <Ionicons name="checkmark" size={14} color="#006951" />
              </View>
            </View>

            <View style={styles.courseItem}>
              <Text style={styles.courseItemCode}>CS302</Text>
              <View style={styles.courseItemInfo}>
                <Text style={styles.courseItemTitle}>Operating Systems & Internals</Text>
                <Text style={styles.courseItemProf}>Prof. Ananya S. • 4 Credits</Text>
              </View>
              <View style={styles.courseCheck}>
                <Ionicons name="checkmark" size={14} color="#006951" />
              </View>
            </View>

            <View style={styles.courseItem}>
              <Text style={styles.courseItemCode}>CS303</Text>
              <View style={styles.courseItemInfo}>
                <Text style={styles.courseItemTitle}>Design & Analysis of Algorithms</Text>
                <Text style={styles.courseItemProf}>Dr. Vikram V. • 4 Credits</Text>
              </View>
              <View style={styles.courseCheck}>
                <Ionicons name="checkmark" size={14} color="#006951" />
              </View>
            </View>

            <View style={[styles.courseItem, { borderBottomWidth: 0 }]}>
              <Text style={styles.courseItemCode}>CS304</Text>
              <View style={styles.courseItemInfo}>
                <Text style={styles.courseItemTitle}>Computer Networks & Protocols</Text>
                <Text style={styles.courseItemProf}>Prof. Harish M. • 3 Credits</Text>
              </View>
              <View style={styles.courseCheck}>
                <Ionicons name="checkmark" size={14} color="#006951" />
              </View>
            </View>
          </View>

          {/* Student OS Tools & Actions */}
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <View style={styles.cardTitleRow}>
                <Ionicons name="construct-outline" size={18} color="#006951" />
                <Text style={styles.cardTitle}>Student OS Utilities</Text>
              </View>
            </View>

            {/* Tool 1: Weekly Report */}
            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => setWeeklyReportVisible(true)}
              activeOpacity={0.7}
            >
              <View style={styles.actionIconCircle}>
                <Ionicons name="bar-chart-outline" size={18} color="#006951" />
              </View>
              <View style={styles.actionTextCol}>
                <Text style={styles.actionTitle}>Weekly Academic Report</Text>
                <Text style={styles.actionSub}>Detailed performance breakdown & PDF</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </TouchableOpacity>

            {/* Tool 2: 5s Mindful Breathe */}
            <TouchableOpacity
              style={styles.actionRow}
              onPress={startBreathing}
              activeOpacity={0.7}
            >
              <View style={styles.actionIconCircle}>
                <Ionicons name="heart-circle-outline" size={18} color="#006951" />
              </View>
              <View style={styles.actionTextCol}>
                <Text style={styles.actionTitle}>Mindful Study Pause</Text>
                <Text style={styles.actionSub}>5-second breath ritual before study</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </TouchableOpacity>

            {/* Tool 3: Export Data */}
            <TouchableOpacity
              style={[styles.actionRow, { borderBottomWidth: 0 }]}
              onPress={() =>
                Alert.alert(
                  'Export Academic Records',
                  'Study sessions, tasks, and notes exported successfully as student_os_backup.json'
                )
              }
              activeOpacity={0.7}
            >
              <View style={styles.actionIconCircle}>
                <Ionicons name="cloud-download-outline" size={18} color="#006951" />
              </View>
              <View style={styles.actionTextCol}>
                <Text style={styles.actionTitle}>Export Backup Data</Text>
                <Text style={styles.actionSub}>Save JSON archive of all study logs</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Mindful Breathing Modal */}
      {breatheModalVisible && (
        <Modal
          visible={true}
          transparent
          animationType="fade"
          onRequestClose={() => setBreatheModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.breatheCard}>
              <Text style={styles.breatheEmoji}>🌸</Text>
              <Text style={styles.breatheTitle}>Take a Deep Breath</Text>
              <Text style={styles.breatheSub}>Inhale deeply... center your focus for study</Text>

              <View style={styles.breatheCircle}>
                <Text style={styles.breatheCount}>{breatheSeconds}</Text>
              </View>

              <TouchableOpacity
                style={styles.breatheCloseBtn}
                onPress={() => setBreatheModalVisible(false)}
              >
                <Text style={styles.breatheCloseText}>Done Breathing</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Weekly Report Modal */}
      <WeeklyReportModal
        visible={weeklyReportVisible}
        onClose={() => setWeeklyReportVisible(false)}
      />
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
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  profileHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  avatarWrapper: {
    position: 'relative',
  },
  profileAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: '#059669',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#10B981',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  profileDetails: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.2,
  },
  studentEmail: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 2,
  },
  rollCapsule: {
    alignSelf: 'flex-start',
    backgroundColor: '#E6FBF2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 6,
  },
  rollText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#006951',
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  honorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    gap: 5,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  honorBadgeIcon: {
    fontSize: 12,
  },
  honorBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  cardSub: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
  },
  creditsBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
    backgroundColor: '#E6FBF2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  goalInfo: {
    flex: 1,
  },
  goalName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  goalSub: {
    fontSize: 11,
    fontWeight: '500',
    color: '#94A3B8',
    marginTop: 2,
  },
  stepperBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  stepperBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#006951',
    minWidth: 32,
    textAlign: 'center',
  },
  courseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 12,
  },
  courseItemCode: {
    fontSize: 11,
    fontWeight: '800',
    color: '#006951',
    backgroundColor: '#E6FBF2',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  courseItemInfo: {
    flex: 1,
  },
  courseItemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  courseItemProf: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 2,
  },
  courseCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#E6FBF2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  actionIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E6FBF2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  actionTextCol: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  actionSub: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  breatheCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    padding: 24,
    alignItems: 'center',
  },
  breatheEmoji: {
    fontSize: 34,
    marginBottom: 8,
  },
  breatheTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  breatheSub: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  breatheCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E6FBF2',
    borderWidth: 4,
    borderColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  breatheCount: {
    fontSize: 36,
    fontWeight: '800',
    color: '#006951',
  },
  breatheCloseBtn: {
    backgroundColor: '#006951',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
  },
  breatheCloseText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
