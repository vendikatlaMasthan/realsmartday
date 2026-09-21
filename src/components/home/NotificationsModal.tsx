// SmartDay Student Notifications & Alerts Modal
// Live academic reminders for class times, faculty appointments, and task deadlines

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
  const alerts = [
    {
      id: 'a1',
      icon: 'school-outline',
      iconBg: '#E6F7F0',
      iconColor: '#059669',
      title: 'DBMS Lecture at 11:00 AM',
      body: 'AB-II - 301. Bring relational schema homework sheet.',
      time: 'in 45 mins',
      unread: true,
    },
    {
      id: 'a2',
      icon: 'people-outline',
      iconBg: '#EFF6FF',
      iconColor: '#2563EB',
      title: 'Meeting with Professor at 3:00 PM',
      body: 'Faculty Block 402 for project milestone review.',
      time: 'Today',
      unread: true,
    },
    {
      id: 'a3',
      icon: 'flame-outline',
      iconBg: '#FEF3C7',
      iconColor: '#D97706',
      title: '35-Day Consistency Streak!',
      body: 'You completed your morning problem set and habit ritual.',
      time: '2h ago',
      unread: false,
    },
    {
      id: 'a4',
      icon: 'checkmark-circle-outline',
      iconBg: '#F3E8FF',
      iconColor: '#7C3AED',
      title: 'OS Lab Assignment Submitted',
      body: 'Virtual memory simulation assignment recorded successfully.',
      time: '3h ago',
      unread: false,
    },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />

        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.bellCircle}>
                <Ionicons name="notifications" size={20} color="#059669" />
              </View>
              <View>
                <Text style={styles.title}>Notifications</Text>
                <Text style={styles.subtitle}>2 unread student alerts</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {alerts.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.itemCard, item.unread && styles.itemCardUnread]}
                onPress={() => {
                  if (onNavigateToPlan) onNavigateToPlan();
                  onClose();
                }}
              >
                <View style={[styles.itemIcon, { backgroundColor: item.iconBg }]}>
                  <Ionicons name={item.icon as any} size={20} color={item.iconColor} />
                </View>

                <View style={styles.itemContent}>
                  <View style={styles.itemTopRow}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    <Text style={styles.itemTime}>{item.time}</Text>
                  </View>
                  <Text style={styles.itemBody}>{item.body}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.footerBtn} onPress={onClose}>
            <Text style={styles.footerBtnText}>Mark all as read</Text>
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
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    maxHeight: '80%',
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
  bellCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E6F7F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
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
  list: {
    marginBottom: 14,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  itemCardUnread: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  itemIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemContent: {
    flex: 1,
  },
  itemTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  itemTime: {
    fontSize: 11,
    color: '#94A3B8',
  },
  itemBody: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
  },
  footerBtn: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  footerBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
});
