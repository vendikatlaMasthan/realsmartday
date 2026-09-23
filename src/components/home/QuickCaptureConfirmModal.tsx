// SmartDay Quick Capture Confirmation Modal
// Displays deterministically extracted task details before saving.
// Allows user to edit Title, Date, Time, Category, and Reminder offset.
// Prevents duplicate submissions.

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Switch,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ExtractedTaskData, formatDateFromEpoch, calculateReminderTimestamp } from '../../services/reminderEngine';
import { TaskCategory, Priority } from '../../types';

interface QuickCaptureConfirmModalProps {
  visible: boolean;
  data: ExtractedTaskData | null;
  onClose: () => void;
  onConfirm: (
    finalData: {
      title: string;
      date: string;
      time: string;
      category: TaskCategory;
      priority: Priority;
      targetTimestamp: number;
    },
    enableReminder: boolean,
    reminderOffset: number
  ) => void;
}

export const QuickCaptureConfirmModal: React.FC<QuickCaptureConfirmModalProps> = ({
  visible,
  data,
  onClose,
  onConfirm,
}) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [category, setCategory] = useState<TaskCategory>('work');
  const [priority, setPriority] = useState<Priority>('Med');
  const [enableReminder, setEnableReminder] = useState(true);
  const [reminderOffset, setReminderOffset] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (data) {
      setTitle(data.title);
      setDate(data.date);
      setTime(data.time);
      setCategory(data.category);
      setPriority(data.priority);
      setEnableReminder(true);
      setReminderOffset(0);
      setIsSubmitting(false);
    }
  }, [data]);

  if (!data) return null;

  const handleSave = () => {
    if (!title.trim() || isSubmitting) return;
    setIsSubmitting(true);

    const targetTimestamp = calculateReminderTimestamp(date, time, reminderOffset);

    onConfirm(
      {
        title: title.trim(),
        date,
        time,
        category,
        priority,
        targetTimestamp,
      },
      enableReminder,
      reminderOffset
    );

    setTimeout(() => {
      setIsSubmitting(false);
      onClose();
    }, 250);
  };

  const handleSetToday = () => {
    setDate(formatDateFromEpoch(Date.now()));
  };

  const handleSetTomorrow = () => {
    setDate(formatDateFromEpoch(Date.now() + 24 * 60 * 60 * 1000));
  };

  const categories: { key: TaskCategory; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'work', label: 'Work / Study', icon: 'school-outline' },
    { key: 'personal', label: 'Personal', icon: 'person-outline' },
    { key: 'urgent', label: 'Urgent', icon: 'alert-circle-outline' },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />

        <View style={styles.sheet}>
          <View style={styles.handle} />

          {/* Modal Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconCircle}>
                <Ionicons name="sparkles" size={18} color="#059669" />
              </View>
              <View>
                <Text style={styles.title}>Confirm Task Details</Text>
                <Text style={styles.subtitle}>Deterministic Rule-Based Extraction</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Ambiguous Time Warning */}
            {data.hasAmbiguousTime && (
              <View style={styles.warningBox}>
                <Ionicons name="time" size={16} color="#D97706" />
                <Text style={styles.warningText}>
                  Specific time not detected. Defaulted to 1 hour ahead. You can edit below.
                </Text>
              </View>
            )}

            {/* Title Input */}
            <Text style={styles.inputLabel}>Task Title</Text>
            <TextInput
              style={styles.textInput}
              value={title}
              onChangeText={setTitle}
              placeholder="What do you need to do?"
              placeholderTextColor="#94A3B8"
            />

            {/* Date Row */}
            <View style={styles.rowBetween}>
              <Text style={styles.inputLabel}>Due Date (YYYY-MM-DD)</Text>
              <View style={styles.quickChipsRow}>
                <TouchableOpacity onPress={handleSetToday} style={styles.chip}>
                  <Text style={styles.chipText}>Today</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSetTomorrow} style={styles.chip}>
                  <Text style={styles.chipText}>Tomorrow</Text>
                </TouchableOpacity>
              </View>
            </View>
            <TextInput
              style={styles.textInput}
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#94A3B8"
            />

            {/* Time Row */}
            <Text style={styles.inputLabel}>Due Time (e.g. 9:00 AM, 3:30 PM)</Text>
            <TextInput
              style={styles.textInput}
              value={time}
              onChangeText={setTime}
              placeholder="09:00 AM"
              placeholderTextColor="#94A3B8"
            />

            {/* Category Selector */}
            <Text style={styles.inputLabel}>Category</Text>
            <View style={styles.categoryRow}>
              {categories.map((c) => {
                const isSelected = category === c.key;
                return (
                  <TouchableOpacity
                    key={c.key}
                    style={[styles.categoryBtn, isSelected && styles.categoryBtnActive]}
                    onPress={() => setCategory(c.key)}
                  >
                    <Ionicons
                      name={c.icon}
                      size={15}
                      color={isSelected ? '#059669' : '#64748B'}
                    />
                    <Text
                      style={[
                        styles.categoryBtnText,
                        isSelected && styles.categoryBtnTextActive,
                      ]}
                    >
                      {c.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Reminder Toggle & Offset */}
            <View style={styles.reminderCard}>
              <View style={styles.reminderToggleRow}>
                <View style={styles.reminderTitleCol}>
                  <Text style={styles.reminderCardTitle}>Schedule Reminder Alert</Text>
                  <Text style={styles.reminderCardSub}>
                    Plays audio chime & in-app reminder at due time
                  </Text>
                </View>
                <Switch
                  value={enableReminder}
                  onValueChange={setEnableReminder}
                  trackColor={{ false: '#E2E8F0', true: '#A7F3D0' }}
                  thumbColor={enableReminder ? '#059669' : '#94A3B8'}
                />
              </View>

              {enableReminder && (
                <View style={styles.offsetOptionsBox}>
                  <Text style={styles.offsetLabel}>Alert Offset:</Text>
                  <View style={styles.offsetChipsRow}>
                    {[
                      { val: 0, label: 'At time' },
                      { val: 5, label: '5m before' },
                      { val: 10, label: '10m before' },
                      { val: 15, label: '15m before' },
                      { val: 30, label: '30m before' },
                    ].map((opt) => (
                      <TouchableOpacity
                        key={opt.val}
                        style={[
                          styles.offsetChip,
                          reminderOffset === opt.val && styles.offsetChipActive,
                        ]}
                        onPress={() => setReminderOffset(opt.val)}
                      >
                        <Text
                          style={[
                            styles.offsetChipText,
                            reminderOffset === opt.val && styles.offsetChipTextActive,
                          ]}
                        >
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </View>

            {/* Web Platform Limitation Notice */}
            <View style={styles.platformNote}>
              <Ionicons name="information-circle-outline" size={14} color="#64748B" />
              <Text style={styles.platformNoteText}>
                Web Alert: Browser tab must be open to receive notifications.
              </Text>
            </View>
          </ScrollView>

          {/* Footer Save Button */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              disabled={isSubmitting}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveBtn, isSubmitting && { opacity: 0.6 }]}
              onPress={handleSave}
              disabled={isSubmitting}
            >
              <Ionicons name="checkmark" size={18} color="#FFFFFF" />
              <Text style={styles.saveBtnText}>
                {isSubmitting ? 'Saving...' : 'Confirm & Schedule'}
              </Text>
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
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
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
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E6F7F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
  },
  closeBtn: {
    padding: 6,
  },
  body: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF3C7',
    padding: 10,
    borderRadius: 10,
    marginBottom: 14,
  },
  warningText: {
    fontSize: 12,
    color: '#92400E',
    flex: 1,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
    marginTop: 8,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  quickChipsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  chip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  chipText: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '600',
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  categoryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryBtnActive: {
    backgroundColor: '#E6F7F0',
    borderColor: '#059669',
  },
  categoryBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  categoryBtnTextActive: {
    color: '#059669',
  },
  reminderCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginTop: 14,
  },
  reminderToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reminderTitleCol: {
    flex: 1,
    paddingRight: 10,
  },
  reminderCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  reminderCardSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  offsetOptionsBox: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  offsetLabel: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
    marginBottom: 6,
  },
  offsetChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  offsetChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  offsetChipActive: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  offsetChipText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  offsetChipTextActive: {
    color: '#FFFFFF',
  },
  platformNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
    marginBottom: 6,
    padding: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
  },
  platformNoteText: {
    fontSize: 11,
    color: '#64748B',
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 12,
    marginBottom: Platform.OS === 'ios' ? 20 : 10,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  saveBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#059669',
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
