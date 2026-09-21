// SmartDay Schedule Item Details Modal
// Detail modal for lectures, professor meetings, and study blocks

import React from 'react';
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

export interface ScheduleItem {
  id: string;
  time: string;
  title: string;
  location: string;
  tag: string;
  tagColor: { bg: string; text: string };
  dotColor: string;
  iconName: keyof typeof Ionicons.glyphMap;
  description?: string;
  completed?: boolean;
}

interface ScheduleDetailModalProps {
  visible: boolean;
  onClose: () => void;
  item: ScheduleItem | null;
  onToggleComplete?: (id: string) => void;
  onStartFocus?: (title: string) => void;
}

export const ScheduleDetailModal: React.FC<ScheduleDetailModalProps> = ({
  visible,
  onClose,
  item,
  onToggleComplete,
  onStartFocus,
}) => {
  if (!visible || !item) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />

        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerBadge}>
              <View style={[styles.dot, { backgroundColor: item.dotColor }]} />
              <View style={[styles.tagPill, { backgroundColor: item.tagColor.bg }]}>
                <Text style={[styles.tagText, { color: item.tagColor.text }]}>{item.tag}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Time & Title */}
          <Text style={styles.timeText}>{item.time}</Text>
          <Text style={styles.titleText}>{item.title}</Text>

          {/* Location / Room info */}
          <View style={styles.infoRow}>
            <Ionicons name={item.iconName} size={18} color="#059669" />
            <Text style={styles.locationText}>{item.location}</Text>
          </View>

          {/* Description */}
          <Text style={styles.descText}>
            {item.description ||
              'Scheduled academic session for semester syllabus. Please ensure notebooks, laptop, and lab assignments are prepared.'}
          </Text>

          {/* Action buttons */}
          <View style={styles.btnRow}>
            {onStartFocus && (
              <TouchableOpacity
                style={styles.focusBtn}
                onPress={() => {
                  onStartFocus(item.title);
                  onClose();
                }}
              >
                <Ionicons name="play" size={16} color="#FFFFFF" />
                <Text style={styles.focusBtnText}>Focus on This</Text>
              </TouchableOpacity>
            )}

            {onToggleComplete && (
              <TouchableOpacity
                style={styles.completeBtn}
                onPress={() => {
                  onToggleComplete(item.id);
                  onClose();
                }}
              >
                <Ionicons name="checkmark-done" size={16} color="#059669" />
                <Text style={styles.completeBtnText}>Mark Done</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: '100%',
    maxWidth: 380,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  tagPill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  timeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#059669',
    marginBottom: 4,
  },
  titleText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 12,
    marginBottom: 14,
  },
  locationText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  descText: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 20,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  focusBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#034D3C',
    paddingVertical: 12,
    borderRadius: 14,
  },
  focusBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  completeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#E6F7F0',
    paddingVertical: 12,
    borderRadius: 14,
  },
  completeBtnText: {
    color: '#059669',
    fontWeight: '700',
    fontSize: 13,
  },
});
