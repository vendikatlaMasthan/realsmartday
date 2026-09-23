// SmartDay Student Notifications & Alerts Modal
// Live academic reminders and persistent alert management.
// Connected directly to SmartDay persistent storage & shared reminder engine.

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSmartDay } from '../../context/SmartDayContext';
import { ReminderItem } from '../../types';
import {
  getBrowserNotificationStatus,
  requestBrowserNotificationPermission,
  BrowserNotificationStatus,
  PLATFORM_NOTIFICATION_NOTICE,
} from '../../services/reminderEngine';

interface NotificationsModalProps {
  visible: boolean;
  onClose: () => void;
  onNavigateToPlan?: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  visible,
  onClose,
  onNavigateToPlan,
}) => {
  const {
    reminders,
    snoozeReminder,
    completeReminder,
    deleteReminder,
    scheduleTestReminder,
    showToast,
  } = useSmartDay();

  const [notifStatus, setNotifStatus] = useState<BrowserNotificationStatus>('default');
  const [selectedSnoozeId, setSelectedSnoozeId] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setNotifStatus(getBrowserNotificationStatus());
    }
  }, [visible]);

  const handleRequestPermission = async () => {
    const status = await requestBrowserNotificationPermission();
    setNotifStatus(status);
    if (status === 'granted') {
      showToast('Browser notifications enabled successfully!');
    } else if (status === 'denied') {
      showToast('Notification permission was blocked in browser settings.');
    }
  };

  const activeReminders = reminders.filter(
    (r) => !r.completed && r.status !== 'cancelled' && r.status !== 'dismissed'
  );
  const completedReminders = reminders.filter((r) => r.completed);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />

        <View style={styles.sheet}>
          <View style={styles.handle} />

          {/* Modal Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.bellCircle}>
                <Ionicons name="notifications" size={20} color="#059669" />
              </View>
              <View>
                <Text style={styles.title}>Reminders & Alerts</Text>
                <Text style={styles.subtitle}>
                  {activeReminders.length} active scheduled alert{activeReminders.length === 1 ? '' : 's'}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {/* Platform Background Scheduling Notice */}
            <View style={styles.noticeBox}>
              <Ionicons name="information-circle" size={16} color="#0284C7" />
              <Text style={styles.noticeText}>
                {PLATFORM_NOTIFICATION_NOTICE}
              </Text>
            </View>

            {/* Notification Permission Card (if not yet granted) */}
            {notifStatus !== 'granted' && notifStatus !== 'unsupported' && (
              <View style={styles.permissionCard}>
                <View style={styles.permissionLeft}>
                  <Ionicons name="notifications-circle" size={24} color="#D97706" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.permissionTitle}>Enable Browser Alerts</Text>
                    <Text style={styles.permissionSub}>
                      Receive desktop banner popups when reminders are due.
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.permissionBtn}
                  onPress={handleRequestPermission}
                >
                  <Text style={styles.permissionBtnText}>Allow</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Test Reminder (15s) Action Bar */}
            <View style={styles.testSection}>
              <View style={styles.testSectionHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.testTitle}>Core Flow Verification</Text>
                  <Text style={styles.testSubtitle}>
                    Trigger real chime sound & alert in 15 seconds (keep tab open)
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.testBtn}
                  onPress={() => scheduleTestReminder(15)}
                >
                  <Ionicons name="timer-outline" size={15} color="#FFFFFF" />
                  <Text style={styles.testBtnText}>Test Reminder (15s)</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Active Reminders List */}
            <Text style={styles.sectionHeader}>Upcoming & Scheduled</Text>

            {activeReminders.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="alarm-outline" size={32} color="#94A3B8" />
                <Text style={styles.emptyTitle}>No scheduled reminders</Text>
                <Text style={styles.emptySubtitle}>
                  Create a task with a reminder or use Quick Capture to schedule alerts.
                </Text>
              </View>
            ) : (
              activeReminders.map((rem) => {
                const isOverdue = rem.targetTimestamp < Date.now();
                const isSnoozeOpen = selectedSnoozeId === rem.id;

                return (
                  <View
                    key={rem.id}
                    style={[
                      styles.itemCard,
                      rem.isTest && styles.itemCardTest,
                      isOverdue && styles.itemCardOverdue,
                    ]}
                  >
                    <View style={styles.itemMainRow}>
                      <View
                        style={[
                          styles.iconBox,
                          isOverdue ? styles.iconBoxOverdue : styles.iconBoxScheduled,
                        ]}
                      >
                        <Ionicons
                          name={isOverdue ? 'alert' : 'time-outline'}
                          size={18}
                          color={isOverdue ? '#DC2626' : '#059669'}
                        />
                      </View>

                      <View style={styles.itemContentCol}>
                        <View style={styles.titleRow}>
                          <Text style={styles.itemTitle}>{rem.title}</Text>
                          {rem.isTest && <Text style={styles.testBadge}>TEST (15s)</Text>}
                        </View>

                        <Text style={styles.itemDue}>
                          {isOverdue ? 'Overdue · ' : 'Due · '}
                          {rem.date ? `${rem.date} ` : ''}
                          {rem.dueTime}
                          {rem.snoozedUntil ? ` (Snoozed until ${rem.snoozedUntil})` : ''}
                        </Text>

                        {rem.notes ? (
                          <Text style={styles.itemNotes} numberOfLines={1}>
                            {rem.notes}
                          </Text>
                        ) : null}
                      </View>
                    </View>

                    {/* Snooze Sub-selector */}
                    {isSnoozeOpen && (
                      <View style={styles.snoozeMenu}>
                        <Text style={styles.snoozeMenuLabel}>Snooze delay:</Text>
                        <View style={styles.snoozeGrid}>
                          {[5, 10, 15, 30].map((mins) => (
                            <TouchableOpacity
                              key={mins}
                              style={styles.snoozeMenuBtn}
                              onPress={() => {
                                setSelectedSnoozeId(null);
                                snoozeReminder(rem.id, mins);
                              }}
                            >
                              <Text style={styles.snoozeMenuBtnText}>+{mins}m</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    )}

                    {/* Action Bar */}
                    <View style={styles.cardActionsRow}>
                      <TouchableOpacity
                        style={styles.actionBtnSnooze}
                        onPress={() =>
                          setSelectedSnoozeId(isSnoozeOpen ? null : rem.id)
                        }
                      >
                        <Ionicons name="time" size={14} color="#0F766E" />
                        <Text style={styles.actionBtnSnoozeText}>
                          {isSnoozeOpen ? 'Cancel' : 'Snooze'}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.actionBtnComplete}
                        onPress={() => completeReminder(rem.id)}
                      >
                        <Ionicons name="checkmark-circle" size={14} color="#059669" />
                        <Text style={styles.actionBtnCompleteText}>Complete</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.actionBtnDelete}
                        onPress={() => deleteReminder(rem.id)}
                      >
                        <Ionicons name="trash-outline" size={14} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}

            {/* Completed Reminders Section */}
            {completedReminders.length > 0 && (
              <>
                <Text style={[styles.sectionHeader, { marginTop: 18 }]}>
                  Completed Reminders ({completedReminders.length})
                </Text>
                {completedReminders.slice(0, 3).map((rem) => (
                  <View key={rem.id} style={styles.completedCard}>
                    <Ionicons name="checkmark-done-circle" size={18} color="#94A3B8" />
                    <Text style={styles.completedTitle} numberOfLines={1}>
                      {rem.title}
                    </Text>
                    <TouchableOpacity
                      onPress={() => deleteReminder(rem.id)}
                      style={{ padding: 4 }}
                    >
                      <Ionicons name="close" size={16} color="#CBD5E1" />
                    </TouchableOpacity>
                  </View>
                ))}
              </>
            )}
          </ScrollView>

          <TouchableOpacity style={styles.footerBtn} onPress={onClose}>
            <Text style={styles.footerBtnText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 36 : 20,
    maxHeight: '85%',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bellCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E6F7F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  closeBtn: {
    padding: 6,
  },
  list: {
    paddingVertical: 12,
  },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0F9FF',
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  noticeText: {
    fontSize: 11,
    color: '#0369A1',
    flex: 1,
    lineHeight: 16,
  },
  permissionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  permissionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    paddingRight: 10,
  },
  permissionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400E',
  },
  permissionSub: {
    fontSize: 11,
    color: '#B45309',
    marginTop: 2,
  },
  permissionBtn: {
    backgroundColor: '#D97706',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  permissionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  testSection: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  testSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  testTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  testSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  testBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#059669',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  testBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 28,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#475569',
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    maxWidth: 240,
    marginTop: 4,
  },
  itemCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  itemCardTest: {
    borderColor: '#A7F3D0',
    backgroundColor: '#F0FDF4',
  },
  itemCardOverdue: {
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
  },
  itemMainRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  iconBoxScheduled: {
    backgroundColor: '#E6F7F0',
  },
  iconBoxOverdue: {
    backgroundColor: '#FEE2E2',
  },
  itemContentCol: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },
  testBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  itemDue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 3,
  },
  itemNotes: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  snoozeMenu: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  snoozeMenuLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
  },
  snoozeGrid: {
    flexDirection: 'row',
    gap: 6,
  },
  snoozeMenuBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  snoozeMenuBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F766E',
  },
  cardActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  actionBtnSnooze: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0FDFA',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  actionBtnSnoozeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F766E',
  },
  actionBtnComplete: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  actionBtnCompleteText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
  },
  actionBtnDelete: {
    marginLeft: 'auto',
    padding: 5,
  },
  completedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 8,
    marginBottom: 6,
  },
  completedTitle: {
    fontSize: 12,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
    flex: 1,
  },
  footerBtn: {
    marginTop: 10,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  footerBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
});
