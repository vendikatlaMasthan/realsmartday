// SmartDay AI Task Breakdown Modal ("Break into steps")
// Breaks larger tasks into sequential subtasks with estimated durations.
// Durations are clearly labeled as estimates. User can edit steps and toggle selection.

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Task, TaskBreakdownStep, Subtask } from '../../types';
import { breakTaskIntoStepsWithAI } from '../../services/aiService';
import { useSmartDay } from '../../context/SmartDayContext';

interface TaskBreakdownModalProps {
  visible: boolean;
  task: Task | null;
  onClose: () => void;
}

export const TaskBreakdownModal: React.FC<TaskBreakdownModalProps> = ({
  visible,
  task,
  onClose,
}) => {
  const { breakdownTask } = useSmartDay();
  const [loading, setLoading] = useState(false);
  const [steps, setSteps] = useState<TaskBreakdownStep[]>([]);
  const [clarification, setClarification] = useState<string | null>(null);

  useEffect(() => {
    if (visible && task) {
      loadBreakdown();
    }
  }, [visible, task]);

  const loadBreakdown = async () => {
    if (!task) return;
    setLoading(true);
    try {
      const res = await breakTaskIntoStepsWithAI(task);
      setSteps(res.steps);
      setClarification(res.clarificationQuestion || null);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStep = (stepId: string) => {
    setSteps((prev) =>
      prev.map((s) => (s.id === stepId ? { ...s, completed: !s.completed } : s))
    );
  };

  const handleUpdateStepTitle = (stepId: string, newTitle: string) => {
    setSteps((prev) =>
      prev.map((s) => (s.id === stepId ? { ...s, title: newTitle } : s))
    );
  };

  const handleSave = () => {
    if (!task) return;
    const subtasks: Subtask[] = steps.map((s) => ({
      id: s.id,
      title: s.title,
      completed: s.completed,
      estimateMin: s.estimateMin,
      isEstimate: true,
    }));
    breakdownTask(task.id, subtasks);
    onClose();
  };

  if (!task) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View style={styles.iconCircle}>
                <Ionicons name="git-branch-outline" size={18} color="#7C3AED" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>AI Task Breakdown</Text>
                <Text style={styles.subtitle} numberOfLines={1}>
                  "{task.title}"
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#7C3AED" />
              <Text style={styles.loadingText}>Breaking task into achievable steps...</Text>
              <Text style={styles.loadingSub}>Calculating duration estimates & scope</Text>
            </View>
          ) : (
            <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
              {/* Clarification Alert if needed */}
              {clarification ? (
                <View style={styles.clarificationCard}>
                  <Ionicons name="help-circle-outline" size={16} color="#B45309" />
                  <Text style={styles.clarificationText}>{clarification}</Text>
                </View>
              ) : null}

              {/* Estimate Notice Banner */}
              <View style={styles.noticeRow}>
                <Ionicons name="information-circle-outline" size={14} color="#64748B" />
                <Text style={styles.noticeText}>
                  Durations below are labeled estimates. You can edit the steps and times before saving.
                </Text>
              </View>

              {/* Steps List */}
              <View style={styles.stepsList}>
                {steps.map((step, idx) => (
                  <View key={step.id} style={styles.stepCard}>
                    <TouchableOpacity
                      style={[styles.checkbox, step.completed && styles.checkboxActive]}
                      onPress={() => handleToggleStep(step.id)}
                    >
                      {step.completed ? (
                        <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                      ) : (
                        <Text style={styles.stepNumber}>{idx + 1}</Text>
                      )}
                    </TouchableOpacity>

                    <View style={styles.stepInputCol}>
                      <TextInput
                        style={styles.stepTextInput}
                        value={step.title}
                        onChangeText={(txt) => handleUpdateStepTitle(step.id, txt)}
                      />
                      <View style={styles.estimateBadge}>
                        <Ionicons name="time-outline" size={12} color="#7C3AED" />
                        <Text style={styles.estimateText}>Est. ~{step.estimateMin} min</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
          )}

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveBtn, loading && styles.disabledBtn]}
              onPress={handleSave}
              disabled={loading}
            >
              <Ionicons name="checkmark-done" size={18} color="#FFFFFF" />
              <Text style={styles.saveText}>Save Subtasks ({steps.length})</Text>
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
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '85%',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 10,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F5F3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    padding: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 14,
  },
  loadingSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  clarificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  clarificationText: {
    fontSize: 12,
    color: '#92400E',
    flex: 1,
    lineHeight: 18,
  },
  noticeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 10,
  },
  noticeText: {
    fontSize: 11,
    color: '#64748B',
    flex: 1,
    lineHeight: 16,
  },
  stepsList: {
    gap: 12,
    marginBottom: 16,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FAF5FF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F3E8FF',
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#A78BFA',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxActive: {
    backgroundColor: '#7C3AED',
    borderColor: '#7C3AED',
  },
  stepNumber: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7C3AED',
  },
  stepInputCol: {
    flex: 1,
  },
  stepTextInput: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    padding: 0,
    marginBottom: 6,
  },
  estimateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },
  estimateText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#7C3AED',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  cancelBtn: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  saveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#7C3AED',
    borderRadius: 14,
    paddingVertical: 14,
  },
  saveText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  disabledBtn: {
    opacity: 0.5,
  },
});
