// SmartDay Complete Student OS Home Dashboard
// Faithfully matching the reference visual design for VENDIKATLA MASTHAN

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSmartDay } from '../../context/SmartDayContext';
import { CircularProgress } from './CircularProgress';
import { AddExamModal, ExamItem } from './AddExamModal';
import { AllExamsModal } from './AllExamsModal';
import { VoiceCaptureModal } from './VoiceCaptureModal';
import { NoteReaderModal } from './NoteReaderModal';
import { ScheduleDetailModal, ScheduleItem } from './ScheduleDetailModal';
import { NotificationsModal } from './NotificationsModal';
import { TimelineRow } from '../ui/TimelineRow';
import { QuickCaptureTileRow } from '../ui/QuickCaptureTileRow';

// Masthan avatar image asset
const avatarImg = require('../../../assets/masthan_avatar.jpg');

interface SmartDayStudentHomeProps {
  onNavigateToPlan: () => void;
  onNavigateToSessions: (task?: any) => void;
  onNavigateToMetrics: () => void;
  onNavigateToYou: () => void;
  onOpenSearch: () => void;
  onOpenAddTask: () => void;
  onOpenLogHabit: () => void;
  onOpenQuickNote: () => void;
  onOpenFileConverter: () => void;
  onOpenWeeklyReport: () => void;
}

export const SmartDayStudentHome: React.FC<SmartDayStudentHomeProps> = ({
  onNavigateToPlan,
  onNavigateToSessions,
  onNavigateToMetrics,
  onNavigateToYou,
  onOpenSearch,
  onOpenAddTask,
  onOpenLogHabit,
  onOpenQuickNote,
}) => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isWide = width >= 720;

  const {
    profile,
    tasks,
    todayTasks,
    habits,
    notes,
    addTask,
    addNote,
    showToast,
  } = useSmartDay();

  // Local state for modals
  const [isAddExamOpen, setIsAddExamOpen] = useState(false);
  const [isAllExamsOpen, setIsAllExamsOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isNoteReaderOpen, setIsNoteReaderOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [selectedScheduleItem, setSelectedScheduleItem] = useState<ScheduleItem | null>(null);
  const [isScheduleDetailOpen, setIsScheduleDetailOpen] = useState(false);

  // Quick capture input state
  const [quickCaptureText, setQuickCaptureText] = useState('');

  // Exams state: starts with 0 to match screenshot ("No exams scheduled")
  const [exams, setExams] = useState<ExamItem[]>([]);

  // Focus state for "Today's Focus"
  const [focusProgress, setFocusProgress] = useState(0.5); // 50%
  const [isFocusActive, setIsFocusActive] = useState(false);

  // Schedule items for "Next Up" matching the reference image
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([
    {
      id: 'sched-1',
      time: '11:00 AM',
      title: 'DBMS Lecture',
      location: 'AB-II – 301',
      tag: 'Class',
      tagColor: { bg: '#E6F7F0', text: '#059669' },
      dotColor: '#0D9488',
      iconName: 'business-outline',
      description: 'Lecture covering Normalization, 1NF to BCNF, Functional Dependencies, and Relational Algebra.',
    },
    {
      id: 'sched-2',
      time: '3:00 PM',
      title: 'Meeting with Professor',
      location: 'Faculty Block',
      tag: 'Event',
      tagColor: { bg: '#EFF6FF', text: '#2563EB' },
      dotColor: '#3B82F6',
      iconName: 'location-outline',
      description: 'Department faculty block meeting to review the final semester project milestone and architecture document.',
    },
    {
      id: 'sched-3',
      time: '6:00 PM',
      title: 'Study DBMS',
      location: 'Normalization',
      tag: 'Study',
      tagColor: { bg: '#F5F3FF', text: '#7C3AED' },
      dotColor: '#F59E0B',
      iconName: 'document-text-outline',
      description: 'Deep work study session: solve textbook problems on multi-valued dependencies and decomposition.',
    },
  ]);

  // Recent note (Database Normalization)
  const recentNote = notes.find((n) => n.title.includes('Normalization')) || {
    id: 'note-dbms',
    title: 'Database Normalization',
    body: 'Notes on 1NF, 2NF, 3NF and BCNF. 1NF eliminates duplicate columns from the same table and creates separate tables for each group of related data. 2NF meets 1NF and removes subsets of data that apply to multiple rows. 3NF removes columns that are not dependent upon the primary key.',
    createdAt: new Date().toISOString(),
    tags: ['DBMS', 'Study'],
  };

  // Handlers for Quick Capture
  const handleQuickCapture = (type: 'task' | 'note' | 'event') => {
    const text = quickCaptureText.trim();
    if (!text) {
      if (type === 'task') onOpenAddTask();
      else if (type === 'note') onOpenQuickNote();
      else onNavigateToPlan();
      return;
    }

    if (type === 'task') {
      addTask({
        title: text,
        priority: 'Med',
        estimateMin: 30,
        due: 'Today',
        tags: ['Quick Capture'],
      });
      showToast(`Task added: "${text}"`);
    } else if (type === 'note') {
      addNote(text.substring(0, 30), text);
      showToast(`Note created: "${text.substring(0, 24)}..."`);
    } else if (type === 'event') {
      addTask({
        title: text,
        priority: 'High',
        estimateMin: 60,
        due: 'Today',
        time: '4:00 PM',
        tags: ['Event', 'Campus'],
      });
      showToast(`Event added to schedule: "${text}"`);
    }
    setQuickCaptureText('');
  };

  const handleVoiceTask = (text: string) => {
    addTask({
      title: text,
      priority: 'Med',
      estimateMin: 25,
      due: 'Today',
      tags: ['Voice Memo'],
    });
    showToast(`Voice task created: "${text.substring(0, 24)}..."`);
  };

  const handleVoiceNote = (title: string, body: string) => {
    addNote(title, body);
    showToast(`Voice note saved: "${title}"`);
  };

  const handleSaveExam = (exam: ExamItem) => {
    setExams((prev) => [exam, ...prev]);
    showToast(`Exam scheduled: ${exam.courseTitle}`);
  };

  const handleDeleteExam = (id: string) => {
    setExams((prev) => prev.filter((e) => e.id !== id));
    showToast('Exam removed from schedule');
  };

  const handleStartFocus = () => {
    setIsFocusActive(true);
    setFocusProgress((prev) => Math.min(prev + 0.1, 1));
    showToast('Focus session started! Keep your garden growing 🌱');
    onNavigateToSessions();
  };

  // Completed task / habit calculations matching reference screenshot
  // In screenshot: 60% Today's Progress, 3/5 tasks, 1/3 habits, 50m focus
  const completedTasksCount = 3;
  const totalTasksCount = 5;
  const habitsDoneCount = 1;
  const habitsTotalCount = 3;
  const focusMinutes = 50;

  return (
    <View style={styles.rootContainer}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          {
            paddingBottom: insets.bottom + 110,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ============================================================
            1. TOP EMERALD GREEN HEADER SECTION
           ============================================================ */}
        <LinearGradient
          colors={['#004D40', '#075E4D', '#0B5646']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.8, y: 1 }}
          style={[styles.headerContainer, { paddingTop: Math.max(insets.top, 12) + 6 }]}
        >
          {/* Subtle wave curve styling overlay */}
          <View style={styles.headerWaveOverlay} pointerEvents="none" />

          {/* Status Bar Row: 9:41 · Cellular · Wi-Fi · Battery 100 */}
          <View style={styles.statusBarRow}>
            <Text style={styles.statusBarTime}>9:41</Text>
            <View style={styles.statusBarIcons}>
              <Ionicons name="cellular" size={14} color="#FFFFFF" />
              <Ionicons name="wifi" size={14} color="#FFFFFF" />
              <View style={styles.batteryPill}>
                <Text style={styles.batteryText}>100</Text>
              </View>
            </View>
          </View>

          {/* Main Header Content */}
          <View style={styles.headerMainRow}>
            {/* Left: User Greeting */}
            <View style={styles.greetingCol}>
              <Text style={styles.greetingSub}>Good morning,</Text>
              <Text style={styles.greetingName}>VENDIKATLA MASTHAN</Text>
              <View style={styles.taglineRow}>
                <Text style={styles.sproutEmoji}>🌱</Text>
                <Text style={styles.greetingTagline}>Let's make today productive ✨</Text>
              </View>
            </View>

            {/* Right: Date Capsule + Action Icons + Profile Avatar */}
            <View style={styles.headerRightCol}>
              {/* Date Capsule */}
              <TouchableOpacity
                style={styles.dateCapsule}
                onPress={onNavigateToPlan}
                activeOpacity={0.8}
              >
                <Ionicons name="calendar-outline" size={13} color="#A7F3D0" />
                <Text style={styles.dateCapsuleText}>Mon, Sep 21, 2024</Text>
              </TouchableOpacity>

              {/* Action Icons Row */}
              <View style={styles.actionIconsRow}>
                {/* Search Button */}
                <TouchableOpacity
                  style={styles.headerIconBtn}
                  onPress={onOpenSearch}
                  activeOpacity={0.7}
                  accessibilityLabel="Search"
                >
                  <Ionicons name="search" size={18} color="#FFFFFF" />
                </TouchableOpacity>

                {/* Notification Bell Button */}
                <TouchableOpacity
                  style={styles.headerIconBtn}
                  onPress={() => setIsNotificationsOpen(true)}
                  activeOpacity={0.7}
                  accessibilityLabel="Notifications"
                >
                  <Ionicons name="notifications-outline" size={18} color="#FFFFFF" />
                  <View style={styles.unreadBadgeDot} />
                </TouchableOpacity>

                {/* Masthan Avatar Photo */}
                <TouchableOpacity
                  style={styles.avatarBtn}
                  onPress={onNavigateToYou}
                  activeOpacity={0.85}
                  accessibilityLabel="User profile"
                >
                  <Image source={avatarImg} style={styles.avatarImage} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* ============================================================
            2. TODAY'S PROGRESS CARD (Floating with 60% Gauge)
           ============================================================ */}
        <View style={styles.progressCard}>
          <View style={styles.progressCardInner}>
            {/* Left: 60% Circular Progress Meter */}
            <View style={styles.progressGaugeBox}>
              <CircularProgress
                size={70}
                strokeWidth={7}
                progress={0.6}
                color="#059669"
                trackColor="#E2E8F0"
                label="60%"
              />
            </View>

            {/* Center: Title + 3 Stat Chips */}
            <View style={styles.progressStatsCol}>
              <Text style={styles.progressCardTitle}>Today's Progress</Text>

              <View style={styles.progressChipsRow}>
                {/* 3/5 tasks */}
                <TouchableOpacity
                  style={styles.statChip}
                  onPress={onNavigateToPlan}
                  activeOpacity={0.7}
                >
                  <View style={[styles.statIconSquare, { backgroundColor: '#E6FBF2' }]}>
                    <Ionicons name="checkmark" size={13} color="#059669" />
                  </View>
                  <View style={styles.statChipTextCol}>
                    <Text style={styles.statChipValue}>3/5</Text>
                    <Text style={styles.statChipLabel}>tasks</Text>
                  </View>
                </TouchableOpacity>

                {/* 1/3 habits */}
                <TouchableOpacity
                  style={styles.statChip}
                  onPress={onOpenLogHabit}
                  activeOpacity={0.7}
                >
                  <View style={[styles.statIconSquare, { backgroundColor: '#EDFDF4' }]}>
                    <Ionicons name="leaf" size={13} color="#10B981" />
                  </View>
                  <View style={styles.statChipTextCol}>
                    <Text style={styles.statChipValue}>1/3</Text>
                    <Text style={styles.statChipLabel}>habits</Text>
                  </View>
                </TouchableOpacity>

                {/* 50m focus */}
                <TouchableOpacity
                  style={styles.statChip}
                  onPress={() => onNavigateToSessions()}
                  activeOpacity={0.7}
                >
                  <View style={[styles.statIconSquare, { backgroundColor: '#E0F7F6' }]}>
                    <Ionicons name="time-outline" size={13} color="#0D9488" />
                  </View>
                  <View style={styles.statChipTextCol}>
                    <Text style={styles.statChipValue}>50m</Text>
                    <Text style={styles.statChipLabel}>focus</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* Right: Small steps callout quote pill */}
            <TouchableOpacity
              style={styles.quotePill}
              onPress={onNavigateToMetrics}
              activeOpacity={0.75}
            >
              <Text style={styles.quoteText}>“Small steps make big progress ”</Text>
              <Ionicons name="chevron-forward" size={14} color="#065F46" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ============================================================
            3. FOUR QUICK CATEGORY CARDS (Tasks, Events, Notes, Reminder)
           ============================================================ */}
        <View style={styles.quickCardsRow}>
          {/* Card 1: 5 Tasks */}
          <TouchableOpacity
            style={styles.quickCard}
            onPress={onNavigateToPlan}
            activeOpacity={0.8}
          >
            <View style={styles.quickCardTop}>
              <View style={[styles.quickCardIconBox, { backgroundColor: '#E6FBF2' }]}>
                <Ionicons name="checkmark" size={18} color="#059669" />
              </View>
              <Ionicons name="chevron-forward" size={14} color="#CBD5E1" />
            </View>
            <Text style={styles.quickCardCount}>5</Text>
            <Text style={styles.quickCardLabel}>Tasks</Text>
          </TouchableOpacity>

          {/* Card 2: 2 Events */}
          <TouchableOpacity
            style={styles.quickCard}
            onPress={onNavigateToPlan}
            activeOpacity={0.8}
          >
            <View style={styles.quickCardTop}>
              <View style={[styles.quickCardIconBox, { backgroundColor: '#F3E8FF' }]}>
                <Ionicons name="calendar" size={18} color="#7C3AED" />
              </View>
              <Ionicons name="chevron-forward" size={14} color="#CBD5E1" />
            </View>
            <Text style={styles.quickCardCount}>2</Text>
            <Text style={styles.quickCardLabel}>Events</Text>
          </TouchableOpacity>

          {/* Card 3: 3 Notes */}
          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => setIsNoteReaderOpen(true)}
            activeOpacity={0.8}
          >
            <View style={styles.quickCardTop}>
              <View style={[styles.quickCardIconBox, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="document-text" size={18} color="#D97706" />
              </View>
              <Ionicons name="chevron-forward" size={14} color="#CBD5E1" />
            </View>
            <Text style={styles.quickCardCount}>3</Text>
            <Text style={styles.quickCardLabel}>Notes</Text>
          </TouchableOpacity>

          {/* Card 4: 1 Reminder */}
          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => setIsNotificationsOpen(true)}
            activeOpacity={0.8}
          >
            <View style={styles.quickCardTop}>
              <View style={[styles.quickCardIconBox, { backgroundColor: '#FEE2E2' }]}>
                <Ionicons name="notifications" size={18} color="#EF4444" />
              </View>
              <Ionicons name="chevron-forward" size={14} color="#CBD5E1" />
            </View>
            <Text style={styles.quickCardCount}>1</Text>
            <Text style={styles.quickCardLabel}>Reminder</Text>
          </TouchableOpacity>
        </View>

        {/* ============================================================
            4. MIDDLE SECTION: Next Up & Today's Focus (Responsive Grid)
           ============================================================ */}
        <View style={[styles.twoColumnGrid, !isWide && styles.twoColumnGridStacked]}>
          {/* LEFT COLUMN: Next Up Timeline Card */}
          <View style={[styles.gridCard, isWide ? { flex: 1 } : { width: '100%' }]}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardHeaderTitle}>Next Up</Text>
              <TouchableOpacity onPress={onNavigateToPlan} activeOpacity={0.7}>
                <Text style={styles.seeAllText}>See all</Text>
              </TouchableOpacity>
            </View>

            {/* Timeline List using <TimelineRow> */}
            <View style={styles.timelineList}>
              {scheduleItems.map((item, idx) => {
                const isLast = idx === scheduleItems.length - 1;
                return (
                  <TimelineRow
                    key={item.id}
                    time={item.time}
                    title={item.title}
                    subtitle={item.location}
                    locationIcon={item.iconName as any}
                    dotColor={item.dotColor}
                    badge={{
                      text: item.tag,
                      bg: item.tagColor.bg,
                      color: item.tagColor.text,
                    }}
                    isLast={isLast}
                    onPress={() => {
                      setSelectedScheduleItem(item);
                      setIsScheduleDetailOpen(true);
                    }}
                  />
                );
              })}
            </View>
          </View>

          {/* RIGHT COLUMN: Today's Focus Card */}
          <View style={[styles.gridCard, isWide ? { flex: 1 } : { width: '100%' }]}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardHeaderTitle}>Today's Focus</Text>
              <TouchableOpacity onPress={() => onNavigateToSessions()} activeOpacity={0.7}>
                <Ionicons name="chevron-forward" size={16} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Center: Gauge Arc with Sprout */}
            <View style={styles.focusCenterBox}>
              <View style={styles.focusGaugeWrapper}>
                <CircularProgress
                  size={100}
                  strokeWidth={9}
                  progress={focusProgress}
                  color="#A7F3D0"
                  trackColor="#E2E8F0"
                  isOpenArc
                  centerElement={
                    <View style={styles.focusSproutCircle}>
                      <Text style={{ fontSize: 26 }}>🌿</Text>
                    </View>
                  }
                />
              </View>

              <Text style={styles.focusTitleText}>Start Focus</Text>
              <Text style={styles.focusSubText}>Stay focused, grow your garden.</Text>
            </View>

            {/* Bottom Button: ▶ Start Focus */}
            <TouchableOpacity
              style={styles.startFocusBtn}
              onPress={handleStartFocus}
              activeOpacity={0.85}
            >
              <Ionicons name="play" size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.startFocusBtnText}>Start Focus</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ============================================================
            5. BOTTOM SECTION: Upcoming Exams & Quick Capture (Responsive Grid)
           ============================================================ */}
        <View style={[styles.twoColumnGrid, !isWide && styles.twoColumnGridStacked]}>
          {/* LEFT COLUMN: Upcoming Exams Card */}
          <View style={[styles.gridCard, isWide ? { flex: 1 } : { width: '100%' }]}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardHeaderTitle}>Upcoming Exams</Text>
              <TouchableOpacity onPress={() => setIsAllExamsOpen(true)} activeOpacity={0.7}>
                <Text style={styles.seeAllText}>See all</Text>
              </TouchableOpacity>
            </View>

            {exams.length === 0 ? (
              <View style={styles.emptyExamsBox}>
                <View style={styles.examIconCircle}>
                  <Ionicons name="school" size={24} color="#EF4444" />
                </View>
                <Text style={styles.noExamsTitle}>No exams scheduled</Text>
                <Text style={styles.noExamsSubtitle}>
                  Add your upcoming exams to stay prepared.
                </Text>

                <TouchableOpacity
                  style={styles.addExamOutlinedBtn}
                  onPress={() => setIsAddExamOpen(true)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="add" size={16} color="#059669" />
                  <Text style={styles.addExamBtnText}>+ Add Exam</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.scheduledExamsList}>
                {exams.slice(0, 2).map((exam) => (
                  <View key={exam.id} style={styles.examItemRow}>
                    <View style={styles.examBadge}>
                      <Text style={styles.examBadgeText}>{exam.courseCode}</Text>
                    </View>
                    <View style={styles.examContentCol}>
                      <Text style={styles.examRowTitle} numberOfLines={1} ellipsizeMode="tail">
                        {exam.courseTitle}
                      </Text>
                      <Text style={styles.examRowDate} numberOfLines={1} ellipsizeMode="tail">
                        {exam.date} · {exam.venue}
                      </Text>
                    </View>
                  </View>
                ))}
                <TouchableOpacity
                  style={styles.addExamOutlinedBtn}
                  onPress={() => setIsAddExamOpen(true)}
                >
                  <Text style={styles.addExamBtnText}>+ Add Another Exam</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* RIGHT COLUMN: Quick Capture Card */}
          <View style={[styles.gridCard, isWide ? { flex: 1 } : { width: '100%' }]}>
            <View style={styles.quickCaptureHeader}>
              <View style={styles.quickCaptureTitleRow}>
                <Ionicons name="sparkles" size={16} color="#059669" />
                <Text style={styles.cardHeaderTitle}>Quick Capture</Text>
              </View>
              <Text style={styles.quickCaptureSubtitle}>Capture anything, instantly.</Text>
            </View>

            {/* Input Bar with Microphone */}
            <View style={styles.quickCaptureInputBar}>
              <Ionicons name="mic" size={18} color="#059669" style={{ marginRight: 8, flexShrink: 0 }} />
              <TextInput
                style={styles.quickCaptureTextInput}
                placeholder="What would you like to capture?"
                placeholderTextColor="#94A3B8"
                value={quickCaptureText}
                onChangeText={setQuickCaptureText}
                onSubmitEditing={() => handleQuickCapture('task')}
                returnKeyType="done"
              />
            </View>

            {/* Quick Capture Tile Row (never overlaps, wraps or flexes gracefully) */}
            <QuickCaptureTileRow
              items={[
                {
                  id: 'task',
                  label: 'Task',
                  icon: 'checkmark',
                  bg: '#DCFCE7',
                  color: '#15803D',
                  onPress: () => handleQuickCapture('task'),
                },
                {
                  id: 'note',
                  label: 'Note',
                  icon: 'document-text',
                  bg: '#F3E8FF',
                  color: '#7E22CE',
                  onPress: () => handleQuickCapture('note'),
                },
                {
                  id: 'event',
                  label: 'Event',
                  icon: 'calendar',
                  bg: '#DBEAFE',
                  color: '#1D4ED8',
                  onPress: () => handleQuickCapture('event'),
                },
                {
                  id: 'voice',
                  label: 'Voice',
                  icon: 'mic',
                  bg: '#FEF3C7',
                  color: '#B45309',
                  onPress: () => setIsVoiceModalOpen(true),
                },
              ]}
            />
          </View>
        </View>

        {/* ============================================================
            6. RECENT NOTES SECTION (Database Normalization)
           ============================================================ */}
        <View style={styles.recentNotesCard}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardHeaderTitle}>Recent Notes</Text>
            <TouchableOpacity onPress={() => setIsNoteReaderOpen(true)} activeOpacity={0.7}>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>

          {/* Note Row Item */}
          <TouchableOpacity
            style={styles.recentNoteRow}
            onPress={() => setIsNoteReaderOpen(true)}
            activeOpacity={0.75}
          >
            <View style={styles.noteIconSquare}>
              <Ionicons name="document-text" size={20} color="#D97706" />
            </View>

            <View style={styles.noteTextCol}>
              <Text style={styles.noteTitleText}>{recentNote.title}</Text>
              <Text style={styles.noteSnippetText} numberOfLines={1}>
                {recentNote.body || 'Notes on 1NF, 2NF, 3NF and BCNF...'}
              </Text>
            </View>

            <View style={styles.noteRightCol}>
              <Text style={styles.noteTimeText}>2h ago</Text>
              <Ionicons name="chevron-forward" size={14} color="#CBD5E1" />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ============================================================
          INTERACTIVE MODALS
         ============================================================ */}
      {/* Add Exam Modal */}
      <AddExamModal
        visible={isAddExamOpen}
        onClose={() => setIsAddExamOpen(false)}
        onSaveExam={handleSaveExam}
      />

      {/* All Exams Modal */}
      <AllExamsModal
        visible={isAllExamsOpen}
        onClose={() => setIsAllExamsOpen(false)}
        exams={exams}
        onOpenAddExam={() => setIsAddExamOpen(true)}
        onDeleteExam={handleDeleteExam}
      />

      {/* Voice Capture Modal */}
      <VoiceCaptureModal
        visible={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onSaveAsTask={handleVoiceTask}
        onSaveAsNote={handleVoiceNote}
      />

      {/* Note Reader Modal */}
      <NoteReaderModal
        visible={isNoteReaderOpen}
        onClose={() => setIsNoteReaderOpen(false)}
        note={recentNote as any}
      />

      {/* Schedule Detail Modal */}
      <ScheduleDetailModal
        visible={isScheduleDetailOpen}
        onClose={() => setIsScheduleDetailOpen(false)}
        item={selectedScheduleItem}
        onStartFocus={(title) => {
          setIsScheduleDetailOpen(false);
          onNavigateToSessions({ title } as any);
        }}
        onToggleComplete={(id) => {
          showToast('Session marked as completed!');
        }}
      />

      {/* Notifications Modal */}
      <NotificationsModal
        visible={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onNavigateToPlan={onNavigateToPlan}
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

  // 1. Header Styles
  headerContainer: {
    paddingHorizontal: 20,
    paddingBottom: 22,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    position: 'relative',
    overflow: 'hidden',
  },
  headerWaveOverlay: {
    position: 'absolute',
    top: -50,
    right: -40,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  statusBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  statusBarTime: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  statusBarIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  batteryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  batteryText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  headerMainRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  greetingCol: {
    flex: 1,
  },
  greetingSub: {
    color: '#A7F3D0',
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 2,
  },
  greetingName: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  taglineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sproutEmoji: {
    fontSize: 13,
  },
  greetingTagline: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    fontWeight: '500',
  },
  headerRightCol: {
    alignItems: 'flex-end',
    gap: 8,
  },
  dateCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0, 45, 35, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  dateCapsuleText: {
    color: '#E2E8F0',
    fontSize: 11,
    fontWeight: '600',
  },
  actionIconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  unreadBadgeDot: {
    position: 'absolute',
    top: 7,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  avatarBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },

  // 2. Today's Progress Card
  progressCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: -10,
    borderRadius: 22,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.04)',
  },
  progressCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  progressGaugeBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressStatsCol: {
    flex: 1,
  },
  progressCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  progressChipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statIconSquare: {
    width: 26,
    height: 26,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statChipTextCol: {},
  statChipValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  statChipLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: '#64748B',
    marginTop: -2,
  },
  quotePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    maxWidth: 130,
  },
  quoteText: {
    fontSize: 11,
    fontStyle: 'italic',
    fontWeight: '600',
    color: '#065F46',
    flex: 1,
  },

  // 3. 4 Category Quick Cards
  quickCardsRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 14,
    gap: 10,
  },
  quickCard: {
    flex: 1,
    minWidth: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.03)',
    overflow: 'hidden',
  },
  quickCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  quickCardIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickCardCount: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0F172A',
  },
  quickCardLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 1,
  },

  // 4. Middle Section 2-Column Grid
  twoColumnGrid: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 14,
    gap: 12,
  },
  twoColumnGridStacked: {
    flexDirection: 'column',
    gap: 14,
  },
  gridCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.03)',
    overflow: 'hidden',
    minWidth: 0,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardHeaderTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },

  // Timeline (Next Up)
  timelineList: {
    gap: 4,
    width: '100%',
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  timelineIndicatorCol: {
    alignItems: 'center',
    width: 14,
    marginRight: 8,
    marginTop: 3,
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  timelineConnector: {
    width: 1.5,
    height: 34,
    backgroundColor: '#E2E8F0',
    marginTop: 3,
  },
  timelineContentCol: {
    flex: 1,
  },
  timelineTime: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  timelineTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginVertical: 1,
  },
  timelineMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  timelineLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    flex: 1,
  },
  timelineLocationText: {
    fontSize: 10,
    color: '#64748B',
  },
  timelineTagPill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  timelineTagText: {
    fontSize: 9,
    fontWeight: '800',
  },

  // Today's Focus Card
  focusCenterBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  focusGaugeWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  focusSproutCircle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  focusTitleText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  focusSubText: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 10,
  },
  startFocusBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#034D3C',
    borderRadius: 999,
    paddingVertical: 10,
    marginTop: 4,
  },
  startFocusBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  // Upcoming Exams
  emptyExamsBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  examIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  noExamsTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  noExamsSubtitle: {
    fontSize: 10,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 15,
  },
  addExamOutlinedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderWidth: 1.5,
    borderColor: '#059669',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  addExamBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  scheduledExamsList: {
    gap: 8,
  },
  examItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    padding: 8,
    borderRadius: 10,
    overflow: 'hidden',
  },
  examBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    flexShrink: 0,
  },
  examBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#DC2626',
  },
  examContentCol: {
    flex: 1,
    minWidth: 0,
  },
  examRowTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  examRowDate: {
    fontSize: 10,
    color: '#64748B',
  },

  // Quick Capture
  quickCaptureHeader: {
    marginBottom: 10,
  },
  quickCaptureTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  quickCaptureSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  quickCaptureInputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginBottom: 10,
    width: '100%',
    overflow: 'hidden',
  },
  quickCaptureTextInput: {
    flex: 1,
    minWidth: 0,
    fontSize: 12,
    color: '#0F172A',
    padding: 0,
    ...(Platform.OS === 'web'
      ? ({
          outlineStyle: 'none',
          textOverflow: 'ellipsis',
        } as any)
      : {}),
  },

  // 6. Recent Notes
  recentNotesCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.03)',
    overflow: 'hidden',
  },
  recentNoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
    overflow: 'hidden',
  },
  noteIconSquare: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  noteTextCol: {
    flex: 1,
    minWidth: 0,
  },
  noteTitleText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  noteSnippetText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  noteRightCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 0,
  },
  noteTimeText: {
    fontSize: 11,
    color: '#94A3B8',
  },
});
