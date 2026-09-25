// SmartDay Add Exam Modal
// Schedule upcoming university & semester exams with topics, room, and countdown

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface ExamItem {
  id: string;
  courseTitle: string;
  courseCode: string;
  date: string;
  time: string;
  venue: string;
  topics?: string;
  priority?: 'High' | 'Med' | 'Low';
}

interface AddExamModalProps {
  visible: boolean;
  onClose: () => void;
  onSaveExam: (exam: ExamItem) => void;
}

export const AddExamModal: React.FC<AddExamModalProps> = ({
  visible,
  onClose,
  onSaveExam,
}) => {
  const [courseTitle, setCourseTitle] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const [time, setTime] = useState('10:00 AM');
  const [venue, setVenue] = useState('AB-II - Hall 301');
  const [topics, setTopics] = useState('');

  const handleSave = () => {
    if (!courseTitle.trim()) return;
    const newExam: ExamItem = {
      id: `exam-${Date.now()}`,
      courseTitle: courseTitle.trim(),
      courseCode: courseCode.trim() || 'CS-301',
      date,
      time,
      venue: venue.trim() || 'Exam Hall',
      topics: topics.trim() || undefined,
      priority: 'High',
    };
    onSaveExam(newExam);
    setCourseTitle('');
    setCourseCode('');
    setTopics('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={styles.sheetContainer}>
          {/* Handle bar */}
          <View style={styles.handleBar} />

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconCircle}>
                <Ionicons name="school" size={20} color="#EF4444" />
              </View>
              <View>
                <Text style={styles.headerTitle}>Add Upcoming Exam</Text>
                <Text style={styles.headerSubtitle}>Stay organized for your exams</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              accessibilityLabel="Close modal"
            >
              <Ionicons name="close" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Course Title */}
            <Text style={styles.inputLabel}>Course / Subject Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Database Management Systems (DBMS)"
              placeholderTextColor="#94A3B8"
              value={courseTitle}
              onChangeText={setCourseTitle}
              autoFocus
            />

            {/* Course Code */}
            <Text style={styles.inputLabel}>Course Code</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. CS-301"
              placeholderTextColor="#94A3B8"
              value={courseCode}
              onChangeText={setCourseCode}
            />

            {/* Date & Time Row */}
            <View style={styles.row}>
              <View style={styles.flex1}>
                <Text style={styles.inputLabel}>Exam Date</Text>
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#94A3B8"
                  value={date}
                  onChangeText={setDate}
                />
              </View>
              <View style={{ width: 12 }} />
              <View style={styles.flex1}>
                <Text style={styles.inputLabel}>Time</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 10:00 AM"
                  placeholderTextColor="#94A3B8"
                  value={time}
                  onChangeText={setTime}
                />
              </View>
            </View>

            {/* Venue */}
            <Text style={styles.inputLabel}>Venue / Examination Hall</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. AB-II - Hall 301"
              placeholderTextColor="#94A3B8"
              value={venue}
              onChangeText={setVenue}
            />

            {/* Topics / Syllabus */}
            <Text style={styles.inputLabel}>Key Topics & Syllabus</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="e.g. Unit 1-4: Relational Algebra, Normalization (1NF to BCNF), Indexing, Transactions..."
              placeholderTextColor="#94A3B8"
              value={topics}
              onChangeText={setTopics}
              multiline
              numberOfLines={3}
            />
          </ScrollView>

          {/* Action buttons */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.saveBtn,
                !courseTitle.trim() && styles.saveBtnDisabled,
              ]}
              onPress={handleSave}
              disabled={!courseTitle.trim()}
            >
              <Text style={styles.saveBtnText}>Save Exam</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    maxHeight: '85%',
  },
  handleBar: {
    width: 40,
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
    marginBottom: 16,
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
  },
  closeBtn: {
    padding: 6,
  },
  body: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#0F172A',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
  },
  flex1: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748B',
  },
  saveBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
  },
  saveBtnDisabled: {
    backgroundColor: '#94A3B8',
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
