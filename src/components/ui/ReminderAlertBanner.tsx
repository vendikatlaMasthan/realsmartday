// SmartDay In-App Reminder Alert Banner & Modal
// Triggered when a scheduled reminder is due
// Provides Snooze (5m, 10m, 15m, 30m), Complete Task, and Dismiss.

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ReminderItem } from '../../types';

interface ReminderAlertBannerProps {
  reminder: ReminderItem | null;
  onSnooze: (reminderId: string, minutes: number) => void;
  onComplete: (reminderId: string) => void;
  onDismiss: (reminderId: string) => void;
  onViewItem?: (reminder: ReminderItem) => void;
}

export const ReminderAlertBanner: React.FC<ReminderAlertBannerProps> = ({
  reminder,
  onSnooze,
  onComplete,
  onDismiss,
  onViewItem,
}) => {
  const [showSnoozeOptions, setShowSnoozeOptions] = useState(false);

  if (!reminder) return null;

  return (
    <Modal visible={!!reminder} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Top Header */}
          <View style={styles.headerRow}>
            <View style={styles.badgeRow}>
              <View style={styles.iconCircle}>
                <Ionicons name="notifications" size={20} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.kicker}>REMINDER ALERT</Text>
                <Text style={styles.dueText}>
                  {reminder.isTest ? 'Test Reminder (15s)' : `Scheduled for ${reminder.dueTime}`}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => onDismiss(reminder.id)}
              style={styles.closeBtn}
              accessibilityLabel="Dismiss reminder"
            >
              <Ionicons name="close" size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Main Title & Notes */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => onViewItem && onViewItem(reminder)}
            style={styles.bodyPressable}
          >
            <Text style={styles.titleText}>{reminder.title}</Text>
            {reminder.notes ? (
              <Text style={styles.notesText} numberOfLines={2}>
                {reminder.notes}
              </Text>
            ) : null}
          </TouchableOpacity>

          {/* Web notification limitation tag */}
          <View style={styles.limitationNotice}>
            <Ionicons name="information-circle-outline" size={13} color="#64748B" />
            <Text style={styles.limitationNoticeText}>
              In-app alert active. (Tab must remain open for alerts).
            </Text>
          </View>

          {/* Snooze Sub-options if toggled */}
          {showSnoozeOptions ? (
            <View style={styles.snoozeRow}>
              <Text style={styles.snoozeTitle}>Snooze for:</Text>
              <View style={styles.snoozeBtnsGrid}>
                {[5, 10, 15, 30].map((mins) => (
                  <TouchableOpacity
                    key={mins}
                    style={styles.snoozePill}
                    onPress={() => {
                      setShowSnoozeOptions(false);
                      onSnooze(reminder.id, mins);
                    }}
                  >
                    <Text style={styles.snoozePillText}>+{mins}m</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : null}

          {/* Action Buttons Row */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.snoozeToggleBtn}
              onPress={() => setShowSnoozeOptions(!showSnoozeOptions)}
            >
              <Ionicons name="time-outline" size={16} color="#006951" />
              <Text style={styles.snoozeToggleBtnText}>
                {showSnoozeOptions ? 'Close' : 'Snooze'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.completeBtn}
              onPress={() => onComplete(reminder.id)}
            >
              <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
              <Text style={styles.completeBtnText}>Mark Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    width: '100%',
    maxWidth: 420,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#059669',
    justifyContent: 'center',
    alignItems: 'center',
  },
  kicker: {
    fontSize: 11,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: 0.8,
  },
  dueText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  closeBtn: {
    padding: 6,
  },
  bodyPressable: {
    marginBottom: 12,
  },
  titleText: {
    fontSize: 19,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 25,
  },
  notesText: {
    fontSize: 14,
    color: '#475569',
    marginTop: 6,
    lineHeight: 20,
  },
  limitationNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  limitationNoticeText: {
    fontSize: 11,
    color: '#64748B',
  },
  snoozeRow: {
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  snoozeTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#166534',
    marginBottom: 8,
  },
  snoozeBtnsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  snoozePill: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  snoozePillText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#15803D',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  snoozeToggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
  },
  snoozeToggleBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  completeBtn: {
    flex: 1.3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#059669',
  },
  completeBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
