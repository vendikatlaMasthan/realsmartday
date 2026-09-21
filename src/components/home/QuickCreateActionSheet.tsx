// SmartDay Quick Create Action Sheet (Triggered by Center + Button)
// Fast shortcuts to add Task, Event, Exam, Note, or Launch Focus

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface QuickCreateActionSheetProps {
  visible: boolean;
  onClose: () => void;
  onAddTask: () => void;
  onAddEvent: () => void;
  onAddExam: () => void;
  onAddNote: () => void;
  onStartFocus: () => void;
}

export const QuickCreateActionSheet: React.FC<QuickCreateActionSheetProps> = ({
  visible,
  onClose,
  onAddTask,
  onAddEvent,
  onAddExam,
  onAddNote,
  onStartFocus,
}) => {
  const actions = [
    {
      label: 'New Task',
      desc: 'Add a to-do item with time & priority',
      icon: 'checkmark-circle',
      bg: '#DCFCE7',
      color: '#059669',
      onPress: () => {
        onClose();
        onAddTask();
      },
    },
    {
      label: 'New Event / Class',
      desc: 'Schedule a lecture, lab or study block',
      icon: 'calendar',
      bg: '#EFF6FF',
      color: '#2563EB',
      onPress: () => {
        onClose();
        onAddEvent();
      },
    },
    {
      label: 'Add Exam',
      desc: 'Track semester exams, venue & syllabus',
      icon: 'school',
      bg: '#FEE2E2',
      color: '#EF4444',
      onPress: () => {
        onClose();
        onAddExam();
      },
    },
    {
      label: 'Quick Note',
      desc: 'Capture ideas, formula sheets or notes',
      icon: 'document-text',
      bg: '#FEF3C7',
      color: '#D97706',
      onPress: () => {
        onClose();
        onAddNote();
      },
    },
    {
      label: 'Start Focus Session',
      desc: '25-minute Pomodoro with garden visual',
      icon: 'play-circle',
      bg: '#E6F7F0',
      color: '#004D40',
      onPress: () => {
        onClose();
        onStartFocus();
      },
    },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />

        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <Text style={styles.title}>Create New</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          <View style={styles.list}>
            {actions.map((act, index) => (
              <TouchableOpacity
                key={index}
                style={styles.item}
                onPress={act.onPress}
                activeOpacity={0.7}
              >
                <View style={[styles.iconBox, { backgroundColor: act.bg }]}>
                  <Ionicons name={act.icon as any} size={22} color={act.color} />
                </View>
                <View style={styles.itemText}>
                  <Text style={styles.itemTitle}>{act.label}</Text>
                  <Text style={styles.itemDesc}>{act.desc}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
              </TouchableOpacity>
            ))}
          </View>
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
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
  },
  handle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
    alignSelf: 'center',
    marginBottom: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    paddingBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  closeBtn: {
    padding: 6,
  },
  list: {
    gap: 8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  itemText: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  itemDesc: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
});
