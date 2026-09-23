// SmartDay "Ask SmartDay" Planning Assistant Modal
// Answers queries grounded in actual tasks, schedule, and habits.
// Proposes actions (e.g., reschedule, add task) with mandatory user confirmation before executing.

import React, { useState } from 'react';
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
import { useSmartDay } from '../../context/SmartDayContext';
import { answerAskSmartDay } from '../../services/aiService';
import { AssistantChatMessage } from '../../types';

interface AskSmartDayModalProps {
  visible: boolean;
  onClose: () => void;
}

const QUICK_CHIPS = [
  'What is due tomorrow?',
  'Which assignments are overdue?',
  'Find time for a 45-min workout',
  'What did I complete this week?',
  'Show tasks without reminders',
];

export const AskSmartDayModal: React.FC<AskSmartDayModalProps> = ({ visible, onClose }) => {
  const { tasks, scheduleItems, habits, sessions, addTask, rescheduleTaskWithSlot, showToast } =
    useSmartDay();
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<AssistantChatMessage[]>([
    {
      id: 'init-msg',
      sender: 'assistant',
      text: "Hello Masthan! I'm your SmartDay academic planning assistant. Ask me about your upcoming deadlines, free schedule slots, or habits.",
      timestamp: 'Now',
    },
  ]);

  const handleSend = async (queryText?: string) => {
    const textToSend = (queryText || inputText).trim();
    if (!textToSend || loading) return;

    const userMsg: AssistantChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const response = await answerAskSmartDay(textToSend, {
        tasks,
        scheduleItems,
        habits,
        sessions,
      });
      setMessages((prev) => [...prev, response]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: "I couldn't process that request right now. Please try asking again.",
          timestamp: 'Now',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAction = (msgId: string, action: NonNullable<AssistantChatMessage['proposedAction']>) => {
    if (action.type === 'create_task') {
      addTask({
        title: action.payload.title,
        time: action.payload.time,
        due: action.payload.due || 'Today',
        priority: action.payload.priority || 'Med',
        category: action.payload.category || 'personal',
        estimateMin: action.payload.estimateMin || 30,
        tags: ['assistant-scheduled'],
      });
      showToast(`Confirmed! Scheduled "${action.payload.title}"`);
    } else if (action.type === 'reschedule_task') {
      rescheduleTaskWithSlot(action.payload.taskId, action.payload.newTime, action.payload.newDate);
      showToast(`Confirmed! Rescheduled task`);
    }

    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId && m.proposedAction
          ? {
              ...m,
              proposedAction: { ...m.proposedAction, status: 'confirmed' as const },
            }
          : m
      )
    );
  };

  const handleDeclineAction = (msgId: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId && m.proposedAction
          ? {
              ...m,
              proposedAction: { ...m.proposedAction, status: 'cancelled' as const },
            }
          : m
      )
    );
    showToast('Proposed action declined.');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View style={styles.badge}>
                <Ionicons name="chatbubbles" size={20} color="#059669" />
              </View>
              <View>
                <Text style={styles.title}>Ask SmartDay</Text>
                <Text style={styles.subtitle}>Grounded in your real tasks, classes & habits</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Quick Query Chips */}
          <View style={styles.chipsContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
              {QUICK_CHIPS.map((chip, idx) => (
                <TouchableOpacity
                  key={`chip-${idx}`}
                  style={styles.chip}
                  onPress={() => handleSend(chip)}
                  disabled={loading}
                >
                  <Ionicons name="sparkles-outline" size={12} color="#059669" />
                  <Text style={styles.chipText}>{chip}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Chat Messages */}
          <ScrollView style={styles.messagesContainer} contentContainerStyle={styles.messagesContent}>
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <View
                  key={msg.id}
                  style={[styles.messageRow, isUser ? styles.userRow : styles.assistantRow]}
                >
                  <View
                    style={[
                      styles.messageBubble,
                      isUser ? styles.userBubble : styles.assistantBubble,
                    ]}
                  >
                    <Text
                      style={[
                        styles.messageText,
                        isUser ? styles.userText : styles.assistantText,
                      ]}
                    >
                      {msg.text}
                    </Text>

                    {/* Proposed State Changing Action Card requiring user confirmation */}
                    {msg.proposedAction ? (
                      <View style={styles.actionCard}>
                        <View style={styles.actionCardHeader}>
                          <Ionicons name="calendar-outline" size={16} color="#059669" />
                          <Text style={styles.actionCardTitle}>Schedule Action Proposed</Text>
                        </View>
                        <Text style={styles.actionCardDesc}>{msg.proposedAction.description}</Text>

                        {msg.proposedAction.status === 'pending' ? (
                          <View style={styles.actionButtonsRow}>
                            <TouchableOpacity
                              style={styles.declineBtn}
                              onPress={() => handleDeclineAction(msg.id)}
                            >
                              <Text style={styles.declineText}>Decline</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={styles.confirmBtn}
                              onPress={() => handleConfirmAction(msg.id, msg.proposedAction!)}
                            >
                              <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                              <Text style={styles.confirmText}>Confirm & Apply</Text>
                            </TouchableOpacity>
                          </View>
                        ) : (
                          <View style={styles.statusBadge}>
                            <Ionicons
                              name={msg.proposedAction.status === 'confirmed' ? 'checkmark-circle' : 'close-circle'}
                              size={14}
                              color={msg.proposedAction.status === 'confirmed' ? '#059669' : '#94A3B8'}
                            />
                            <Text
                              style={[
                                styles.statusText,
                                {
                                  color:
                                    msg.proposedAction.status === 'confirmed' ? '#059669' : '#64748B',
                                },
                              ]}
                            >
                              {msg.proposedAction.status === 'confirmed' ? 'Confirmed & Applied' : 'Declined'}
                            </Text>
                          </View>
                        )}
                      </View>
                    ) : null}

                    <Text style={styles.timestampText}>{msg.timestamp}</Text>
                  </View>
                </View>
              );
            })}

            {loading ? (
              <View style={[styles.messageRow, styles.assistantRow]}>
                <View style={[styles.messageBubble, styles.assistantBubble, styles.typingBubble]}>
                  <ActivityIndicator size="small" color="#059669" />
                  <Text style={styles.typingText}>SmartDay is checking your timetable...</Text>
                </View>
              </View>
            ) : null}
          </ScrollView>

          {/* Input Box */}
          <View style={styles.inputArea}>
            <TextInput
              style={styles.input}
              placeholder="Ask anything about your tasks or schedule..."
              placeholderTextColor="#94A3B8"
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={() => handleSend()}
              returnKeyType="send"
            />
            <TouchableOpacity
              style={[styles.sendBtn, (!inputText.trim() || loading) && styles.disabledSend]}
              onPress={() => handleSend()}
              disabled={!inputText.trim() || loading}
            >
              <Ionicons name="send" size={18} color="#FFFFFF" />
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
    height: '90%',
    paddingBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
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
    backgroundColor: '#E6F7F0',
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
  chipsContainer: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  chipsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#166534',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    gap: 12,
  },
  messageRow: {
    flexDirection: 'row',
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  assistantRow: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '85%',
    borderRadius: 18,
    padding: 14,
  },
  userBubble: {
    backgroundColor: '#059669',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: '#F8FAFC',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userText: {
    color: '#FFFFFF',
  },
  assistantText: {
    color: '#0F172A',
  },
  timestampText: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 6,
    alignSelf: 'flex-end',
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typingText: {
    fontSize: 12,
    color: '#64748B',
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  actionCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  actionCardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#065F46',
  },
  actionCardDesc: {
    fontSize: 13,
    color: '#334155',
    marginBottom: 10,
    fontWeight: '500',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  declineBtn: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  declineText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#059669',
  },
  confirmText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  inputArea: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 10,
    gap: 10,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    color: '#0F172A',
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledSend: {
    backgroundColor: '#CBD5E1',
  },
});
