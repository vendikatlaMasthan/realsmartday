// SmartDay Tab 2 — Plan / Calendar & Timetable Screen
// Unified Emerald Forest Student OS Design System matching Home Screen

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ScreenHeader } from '../components/common/ScreenHeader';
import { useSmartDay } from '../context/SmartDayContext';
import { Task } from '../types';
import { TimelineRow } from '../components/ui/TimelineRow';

interface PlanScreenProps {
  onOpenAddTask: () => void;
  onOpenStartFocus: (task?: Task) => void;
  onNavigateToYou: () => void;
}

interface ScheduleItem {
  id: string;
  time: string;
  title: string;
  location: string;
  tag: 'Class' | 'Event' | 'Study' | 'Exam';
  tagBg: string;
  tagColor: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
}

export const PlanScreen: React.FC<PlanScreenProps> = ({
  onOpenAddTask,
  onOpenStartFocus,
  onNavigateToYou,
}) => {
  const insets = useSafeAreaInsets();
  const { tasks, toggleTask } = useSmartDay();

  const [viewMode, setViewMode] = useState<'timeline' | 'matrix'>('timeline');
  const [selectedDay, setSelectedDay] = useState(21); // Sep 21 matching Home screen
  const [selectedItemDetail, setSelectedItemDetail] = useState<ScheduleItem | null>(null);

  // Calendar days around Sep 21
  const daysOfWeek = [
    { day: 'Thu', date: 17, hasDot: false },
    { day: 'Fri', date: 18, hasDot: true },
    { day: 'Sat', date: 19, hasDot: false },
    { day: 'Sun', date: 20, hasDot: true },
    { day: 'Mon', date: 21, hasDot: true, isToday: true },
    { day: 'Tue', date: 22, hasDot: true },
    { day: 'Wed', date: 23, hasDot: false },
  ];

  // Schedule data for the day
  const [scheduleList, setScheduleList] = useState<ScheduleItem[]>([
    {
      id: 'pl-1',
      time: '08:30 AM',
      title: 'Operating Systems Lab',
      location: 'CS Lab 2 • Block A',
      tag: 'Class',
      tagBg: '#E6F7F0',
      tagColor: '#059669',
      completed: true,
      priority: 'high',
    },
    {
      id: 'pl-2',
      time: '11:00 AM',
      title: 'DBMS Lecture',
      location: 'AB-II – 301',
      tag: 'Class',
      tagBg: '#E6F7F0',
      tagColor: '#059669',
      completed: true,
      priority: 'high',
    },
    {
      id: 'pl-3',
      time: '01:30 PM',
      title: 'Lunch & Campus Walk',
      location: 'Central Cafeteria',
      tag: 'Event',
      tagBg: '#EFF6FF',
      tagColor: '#2563EB',
      completed: true,
      priority: 'low',
    },
    {
      id: 'pl-4',
      time: '03:00 PM',
      title: 'Meeting with Professor',
      location: 'Faculty Block • Room 402',
      tag: 'Event',
      tagBg: '#EFF6FF',
      tagColor: '#2563EB',
      completed: false,
      priority: 'medium',
    },
    {
      id: 'pl-5',
      time: '06:00 PM',
      title: 'Study DBMS (Normalization)',
      location: 'Library Quiet Zone',
      tag: 'Study',
      tagBg: '#F5F3FF',
      tagColor: '#7C3AED',
      completed: false,
      priority: 'high',
    },
    {
      id: 'pl-6',
      time: '08:30 PM',
      title: 'Algorithms Assignment Review',
      location: 'Hostel Study Desk',
      tag: 'Study',
      tagBg: '#F5F3FF',
      tagColor: '#7C3AED',
      completed: false,
      priority: 'medium',
    },
  ]);

  const toggleScheduleComplete = (id: string) => {
    setScheduleList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
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
        {/* Consistent Emerald Header */}
        <ScreenHeader
          topPadding={insets.top}
          greetingSub="Academic Calendar"
          title="PLAN & SCHEDULE"
          tagline="Master your classes, study hours & deadlines 📚"
          dateText="Mon, Sep 21, 2024"
          onAvatarPress={onNavigateToYou}
          rightCustomAction={
            <TouchableOpacity
              style={styles.headerModeToggle}
              onPress={() => setViewMode((prev) => (prev === 'timeline' ? 'matrix' : 'timeline'))}
              activeOpacity={0.8}
            >
              <Ionicons
                name={viewMode === 'timeline' ? 'grid-outline' : 'calendar-outline'}
                size={16}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          }
        />

        <View style={styles.bodyContent}>
          {/* Calendar Strip Card */}
          <View style={styles.calendarCard}>
            <View style={styles.calendarHeaderRow}>
              <View style={styles.monthBadge}>
                <Ionicons name="calendar" size={14} color="#059669" />
                <Text style={styles.monthBadgeText}>September 2024</Text>
              </View>

              <View style={styles.viewModeTabs}>
                <TouchableOpacity
                  style={[
                    styles.viewModeBtn,
                    viewMode === 'timeline' && styles.viewModeBtnActive,
                  ]}
                  onPress={() => setViewMode('timeline')}
                >
                  <Text
                    style={[
                      styles.viewModeBtnText,
                      viewMode === 'timeline' && styles.viewModeBtnTextActive,
                    ]}
                  >
                    Timeline
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.viewModeBtn,
                    viewMode === 'matrix' && styles.viewModeBtnActive,
                  ]}
                  onPress={() => setViewMode('matrix')}
                >
                  <Text
                    style={[
                      styles.viewModeBtnText,
                      viewMode === 'matrix' && styles.viewModeBtnTextActive,
                    ]}
                  >
                    Matrix
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Days Strip */}
            <View style={styles.daysRow}>
              {daysOfWeek.map((d) => {
                const isSelected = selectedDay === d.date;
                return (
                  <TouchableOpacity
                    key={d.date}
                    style={[styles.dayCell, isSelected && styles.dayCellSelected]}
                    onPress={() => setSelectedDay(d.date)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.dayLabel, isSelected && styles.dayLabelSelected]}>
                      {d.day}
                    </Text>
                    <Text style={[styles.dateNumber, isSelected && styles.dateNumberSelected]}>
                      {d.date}
                    </Text>
                    {d.hasDot && (
                      <View style={[styles.dayDot, isSelected && styles.dayDotSelected]} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* View Mode 1: Day Timeline */}
          {viewMode === 'timeline' ? (
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeaderRow}>
                <View>
                  <Text style={styles.sectionTitle}>Today's Schedule</Text>
                  <Text style={styles.sectionSub}>6 events & sessions planned</Text>
                </View>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={onOpenAddTask}
                  activeOpacity={0.8}
                >
                  <Ionicons name="add" size={18} color="#FFFFFF" />
                  <Text style={styles.addButtonText}>Add Event</Text>
                </TouchableOpacity>
              </View>

              {/* Timeline Items */}
              <View style={styles.timelineList}>
                {scheduleList.map((item, index) => (
                  <TimelineRow
                    key={item.id}
                    time={item.time}
                    title={item.title}
                    subtitle={item.location}
                    locationIcon="location-outline"
                    dotColor={item.tagColor}
                    badge={{
                      text: item.tag,
                      bg: item.tagBg,
                      color: item.tagColor,
                    }}
                    completed={item.completed}
                    isLast={index === scheduleList.length - 1}
                    onPress={() => setSelectedItemDetail(item)}
                    variant="card"
                    showCheckbox={true}
                    onToggleComplete={() => toggleScheduleComplete(item.id)}
                  >
                    {item.tag === 'Study' && !item.completed && (
                      <TouchableOpacity
                        style={styles.focusChip}
                        onPress={() => onOpenStartFocus()}
                      >
                        <Ionicons name="play" size={11} color="#006951" />
                        <Text style={styles.focusChipText}>Start Focus</Text>
                      </TouchableOpacity>
                    )}
                  </TimelineRow>
                ))}
              </View>
            </View>
          ) : (
            /* View Mode 2: Eisenhower Matrix */
            <View style={styles.matrixContainer}>
              <View style={styles.sectionHeaderRow}>
                <View>
                  <Text style={styles.sectionTitle}>Eisenhower Matrix</Text>
                  <Text style={styles.sectionSub}>Prioritize by urgency and importance</Text>
                </View>
              </View>

              {/* Quadrant 1: Urgent & Important */}
              <View style={[styles.quadrantCard, { borderColor: '#FCA5A5' }]}>
                <View style={styles.quadrantHeader}>
                  <View style={[styles.quadrantDot, { backgroundColor: '#EF4444' }]} />
                  <Text style={styles.quadrantTitle}>Do First (Urgent & Important)</Text>
                </View>
                <View style={styles.quadrantItemRow}>
                  <Ionicons name="alert-circle" size={16} color="#EF4444" />
                  <Text style={styles.quadrantItemText}>DBMS Lecture (11:00 AM) • Mandatory</Text>
                </View>
                <View style={styles.quadrantItemRow}>
                  <Ionicons name="alert-circle" size={16} color="#EF4444" />
                  <Text style={styles.quadrantItemText}>Study DBMS Normalization Exam prep</Text>
                </View>
              </View>

              {/* Quadrant 2: Important, Not Urgent */}
              <View style={[styles.quadrantCard, { borderColor: '#A7F3D0' }]}>
                <View style={styles.quadrantHeader}>
                  <View style={[styles.quadrantDot, { backgroundColor: '#059669' }]} />
                  <Text style={styles.quadrantTitle}>Schedule (Important, Not Urgent)</Text>
                </View>
                <View style={styles.quadrantItemRow}>
                  <Ionicons name="calendar-outline" size={16} color="#059669" />
                  <Text style={styles.quadrantItemText}>Meeting with Professor (3:00 PM)</Text>
                </View>
                <View style={styles.quadrantItemRow}>
                  <Ionicons name="calendar-outline" size={16} color="#059669" />
                  <Text style={styles.quadrantItemText}>Review Algorithms Research Paper</Text>
                </View>
              </View>

              {/* Quadrant 3: Urgent, Not Important */}
              <View style={[styles.quadrantCard, { borderColor: '#FDE68A' }]}>
                <View style={styles.quadrantHeader}>
                  <View style={[styles.quadrantDot, { backgroundColor: '#F59E0B' }]} />
                  <Text style={styles.quadrantTitle}>Delegate / Quick (Urgent, Not Important)</Text>
                </View>
                <View style={styles.quadrantItemRow}>
                  <Ionicons name="time-outline" size={16} color="#F59E0B" />
                  <Text style={styles.quadrantItemText}>Sign Department Club requisition form</Text>
                </View>
              </View>

              {/* Quadrant 4: Neither Urgent nor Important */}
              <View style={[styles.quadrantCard, { borderColor: '#E2E8F0' }]}>
                <View style={styles.quadrantHeader}>
                  <View style={[styles.quadrantDot, { backgroundColor: '#94A3B8' }]} />
                  <Text style={styles.quadrantTitle}>Eliminate / Low Priority</Text>
                </View>
                <View style={styles.quadrantItemRow}>
                  <Ionicons name="remove-circle-outline" size={16} color="#94A3B8" />
                  <Text style={styles.quadrantItemText}>Browse CS discussion forums</Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Item Detail Modal */}
      {selectedItemDetail && (
        <Modal
          visible={true}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedItemDetail(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeaderRow}>
                <View style={[styles.tagBadge, { backgroundColor: selectedItemDetail.tagBg }]}>
                  <Text style={[styles.tagBadgeText, { color: selectedItemDetail.tagColor }]}>
                    {selectedItemDetail.tag}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setSelectedItemDetail(null)}
                  style={styles.closeBtn}
                >
                  <Ionicons name="close" size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalTitle}>{selectedItemDetail.title}</Text>

              <View style={styles.modalMetaRow}>
                <Ionicons name="time-outline" size={16} color="#059669" />
                <Text style={styles.modalMetaText}>{selectedItemDetail.time}</Text>
              </View>

              <View style={styles.modalMetaRow}>
                <Ionicons name="location-outline" size={16} color="#059669" />
                <Text style={styles.modalMetaText}>{selectedItemDetail.location}</Text>
              </View>

              <View style={styles.modalBtnRow}>
                <TouchableOpacity
                  style={styles.modalStartFocusBtn}
                  onPress={() => {
                    setSelectedItemDetail(null);
                    onOpenStartFocus();
                  }}
                >
                  <Ionicons name="play" size={16} color="#FFFFFF" />
                  <Text style={styles.modalStartFocusText}>Start Focus Session</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalCompleteBtn}
                  onPress={() => {
                    toggleScheduleComplete(selectedItemDetail.id);
                    setSelectedItemDetail(null);
                  }}
                >
                  <Ionicons
                    name={selectedItemDetail.completed ? 'checkmark-circle' : 'checkmark-circle-outline'}
                    size={16}
                    color="#006951"
                  />
                  <Text style={styles.modalCompleteText}>
                    {selectedItemDetail.completed ? 'Mark Incomplete' : 'Mark Done'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
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
  headerModeToggle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  bodyContent: {
    paddingHorizontal: 16,
    marginTop: -10,
  },
  calendarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 20,
  },
  calendarHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  monthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6FBF2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 6,
  },
  monthBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#059669',
  },
  viewModeTabs: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 3,
    gap: 2,
  },
  viewModeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 9,
  },
  viewModeBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  viewModeBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  viewModeBtnTextActive: {
    color: '#006951',
    fontWeight: '700',
  },
  daysRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dayCell: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 9,
    borderRadius: 16,
    width: 44,
  },
  dayCellSelected: {
    backgroundColor: '#006951',
    shadowColor: '#004D40',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  dayLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 4,
  },
  dayLabelSelected: {
    color: '#A7F3D0',
  },
  dateNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
  },
  dateNumberSelected: {
    color: '#FFFFFF',
  },
  dayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#10B981',
    marginTop: 4,
  },
  dayDotSelected: {
    backgroundColor: '#A7F3D0',
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  sectionSub: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 1,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#006951',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    gap: 4,
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  timelineList: {
    gap: 12,
  },
  scheduleCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  scheduleCardCompleted: {
    opacity: 0.7,
    backgroundColor: '#F8FAFC',
  },
  timePillar: {
    width: 72,
    alignItems: 'flex-start',
    position: 'relative',
  },
  timePillarText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#006951',
  },
  timeLineBar: {
    width: 2,
    flex: 1,
    backgroundColor: '#E2E8F0',
    marginLeft: 18,
    marginTop: 8,
    borderRadius: 1,
  },
  scheduleContentBox: {
    flex: 1,
    paddingLeft: 8,
  },
  scheduleHeaderLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  scheduleItemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },
  scheduleItemTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
  },
  tagBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  tagBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  scheduleLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  scheduleLocationText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
  },
  cardActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleCompleted: {
    backgroundColor: '#006951',
    borderColor: '#006951',
  },
  focusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6FBF2',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
  },
  focusChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#006951',
  },
  matrixContainer: {
    gap: 12,
  },
  quadrantCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1.5,
  },
  quadrantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  quadrantDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  quadrantTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  quadrantItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 5,
  },
  quadrantItemText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#334155',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  closeBtn: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  modalMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  modalMetaText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  modalStartFocusBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#006951',
    paddingVertical: 12,
    borderRadius: 14,
    gap: 6,
  },
  modalStartFocusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalCompleteBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E6FBF2',
    paddingVertical: 12,
    borderRadius: 14,
    gap: 6,
  },
  modalCompleteText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#006951',
  },
});
