// SmartDay Schedule Conflict Resolution Modal
// Displays detected overlaps, past-deadline tasks, or overcapacity.
// Offers 2-3 valid alternative time slots computed deterministically with 1-tap reschedule.

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSmartDay } from '../../context/SmartDayContext';
import { ScheduleConflict, TimeSlotOption } from '../../types';

interface ConflictResolutionModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ConflictResolutionModal: React.FC<ConflictResolutionModalProps> = ({
  visible,
  onClose,
}) => {
  const { conflicts, rescheduleTaskWithSlot } = useSmartDay();

  const handleReschedule = (conflict: ScheduleConflict, slot: TimeSlotOption) => {
    // If conflict item 2 is a task, reschedule it, otherwise item 1
    const targetTaskId =
      conflict.item2 && conflict.item2.type === 'task' ? conflict.item2.id : conflict.item1.id;

    rescheduleTaskWithSlot(targetTaskId, slot.time, slot.date);
    if (conflicts.length <= 1) {
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View style={styles.badge}>
                <Ionicons name="alert-circle" size={20} color="#DC2626" />
              </View>
              <View>
                <Text style={styles.title}>Schedule Conflict Assistant</Text>
                <Text style={styles.subtitle}>
                  {conflicts.length} conflict{conflicts.length !== 1 ? 's' : ''} detected
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {conflicts.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="checkmark-circle-outline" size={48} color="#059669" />
                <Text style={styles.emptyTitle}>Schedule is Clear!</Text>
                <Text style={styles.emptySub}>
                  No overlapping items, past deadlines, or overcapacity issues.
                </Text>
              </View>
            ) : (
              conflicts.map((conflict) => (
                <View key={conflict.id} style={styles.conflictCard}>
                  <View style={styles.conflictTitleRow}>
                    <Ionicons
                      name={conflict.type === 'overlap' ? 'git-compare-outline' : 'warning-outline'}
                      size={18}
                      color="#DC2626"
                    />
                    <Text style={styles.conflictTitle}>{conflict.title}</Text>
                  </View>

                  <Text style={styles.explanationText}>{conflict.explanation}</Text>

                  {/* Conflicting items comparison */}
                  <View style={styles.itemsComparison}>
                    <View style={styles.itemBox}>
                      <Text style={styles.itemLabel}>Item 1</Text>
                      <Text style={styles.itemTitle}>{conflict.item1.title}</Text>
                      <Text style={styles.itemTime}>{conflict.item1.time} ({conflict.item1.durationMin}m)</Text>
                    </View>
                    {conflict.item2 ? (
                      <View style={[styles.itemBox, styles.itemBoxSecondary]}>
                        <Text style={styles.itemLabel}>Item 2 (Overlaps)</Text>
                        <Text style={styles.itemTitle}>{conflict.item2.title}</Text>
                        <Text style={styles.itemTime}>{conflict.item2.time} ({conflict.item2.durationMin}m)</Text>
                      </View>
                    ) : null}
                  </View>

                  {/* Suggested alternative slots */}
                  {conflict.suggestedSlots && conflict.suggestedSlots.length > 0 ? (
                    <View style={styles.slotsSection}>
                      <Text style={styles.slotsHeader}>Recommended Alternative Slots:</Text>
                      <View style={styles.slotsList}>
                        {conflict.suggestedSlots.map((slot, idx) => (
                          <TouchableOpacity
                            key={`slot-${idx}`}
                            style={styles.slotOption}
                            onPress={() => handleReschedule(conflict, slot)}
                          >
                            <View style={{ flex: 1 }}>
                              <View style={styles.slotTimeRow}>
                                <Text style={styles.slotTime}>{slot.time}</Text>
                                <View style={styles.scoreBadge}>
                                  <Text style={styles.scoreText}>Clear Slot</Text>
                                </View>
                              </View>
                              <Text style={styles.slotLabel}>{slot.label}</Text>
                            </View>
                            <View style={styles.moveBtn}>
                              <Text style={styles.moveText}>Move here</Text>
                              <Ionicons name="arrow-forward" size={14} color="#059669" />
                            </View>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  ) : null}
                </View>
              ))
            )}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.doneBtn} onPress={onClose}>
              <Text style={styles.doneText}>Done Reviewing</Text>
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
  },
  badge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FEE2E2',
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
    color: '#DC2626',
    fontWeight: '600',
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#059669',
    marginTop: 12,
  },
  emptySub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
  },
  conflictCard: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
  },
  conflictTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  conflictTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#991B1B',
  },
  explanationText: {
    fontSize: 13,
    color: '#7F1D1D',
    lineHeight: 18,
    marginBottom: 12,
  },
  itemsComparison: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  itemBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  itemBoxSecondary: {
    borderColor: '#FCA5A5',
    backgroundColor: '#FFF5F5',
  },
  itemLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#991B1B',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  itemTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A',
  },
  itemTime: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  slotsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  slotsHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  slotsList: {
    gap: 8,
  },
  slotOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  slotTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  slotTime: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  scoreBadge: {
    backgroundColor: '#E6F7F0',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  scoreText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
  slotLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  moveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E6F7F0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  moveText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  doneBtn: {
    backgroundColor: '#0F172A',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  doneText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
