// SmartDay Notes -> Action Items Extractor Modal
// Extracts explicit action items, deadlines, and questions from notes.
// Pairs each item with the original quote text from the note.

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
import { extractActionItemsFromNotesWithAI } from '../../services/aiService';
import { ExtractedActionItem } from '../../types';

interface NotesActionItemsModalProps {
  visible: boolean;
  onClose: () => void;
  initialText?: string;
}

export const NotesActionItemsModal: React.FC<NotesActionItemsModalProps> = ({
  visible,
  onClose,
  initialText = '',
}) => {
  const { notes, addExtractedTasks } = useSmartDay();
  const [noteContent, setNoteContent] = useState(
    initialText || (notes[0]?.body || 'Operating Systems Lecture 4:\n- Review page replacement algorithms (FIFO vs LRU)\n- Submit Assignment 2 before Friday 5 PM\n- Prepare 3 questions on virtual memory for next lab\n- Team meeting tomorrow at 3 PM to discuss project architecture')
  );
  const [loading, setLoading] = useState(false);
  const [extractedItems, setExtractedItems] = useState<ExtractedActionItem[]>([]);
  const [hasExtracted, setHasExtracted] = useState(false);

  const handleExtract = async () => {
    if (!noteContent.trim() || loading) return;
    setLoading(true);
    try {
      const items = await extractActionItemsFromNotesWithAI(noteContent);
      setExtractedItems(items);
      setHasExtracted(true);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  const handleToggleItem = (id: string) => {
    setExtractedItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))
    );
  };

  const handleImport = () => {
    const selected = extractedItems.filter((i) => i.selected);
    if (selected.length > 0) {
      addExtractedTasks(selected);
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
                <Ionicons name="document-text-outline" size={20} color="#2563EB" />
              </View>
              <View>
                <Text style={styles.title}>Notes → Action Items</Text>
                <Text style={styles.subtitle}>Extract tasks paired with source text quotes</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {!hasExtracted ? (
              <View>
                <Text style={styles.sectionLabel}>Paste Lecture Notes or Meeting Minutes:</Text>
                <TextInput
                  style={styles.textInput}
                  multiline
                  numberOfLines={8}
                  placeholder="Paste lecture notes or to-do bullets here..."
                  placeholderTextColor="#94A3B8"
                  value={noteContent}
                  onChangeText={setNoteContent}
                />

                <TouchableOpacity
                  style={[styles.extractBtn, (!noteContent.trim() || loading) && styles.disabledBtn]}
                  onPress={handleExtract}
                  disabled={!noteContent.trim() || loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons name="sparkles" size={18} color="#FFFFFF" />
                      <Text style={styles.extractBtnText}>Extract Action Items with AI</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <View style={styles.extractedHeaderRow}>
                  <Text style={styles.sectionLabel}>
                    Found {extractedItems.length} Action Items (Select to import):
                  </Text>
                  <TouchableOpacity onPress={() => setHasExtracted(false)}>
                    <Text style={styles.editNotesText}>Edit Notes</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.itemsList}>
                  {extractedItems.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={[styles.itemCard, item.selected && styles.itemCardSelected]}
                      onPress={() => handleToggleItem(item.id)}
                    >
                      <View style={[styles.checkbox, item.selected && styles.checkboxActive]}>
                        {item.selected ? (
                          <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                        ) : null}
                      </View>

                      <View style={{ flex: 1 }}>
                        <Text style={styles.itemTitle}>{item.title}</Text>

                        {/* Quoted snippet from original notes */}
                        <View style={styles.quoteRow}>
                          <Ionicons name="chatbubble-ellipses-outline" size={12} color="#94A3B8" />
                          <Text style={styles.quoteText} numberOfLines={2}>
                            "{item.originalText}"
                          </Text>
                        </View>

                        <View style={styles.tagRow}>
                          {item.explicitDeadline ? (
                            <View style={styles.deadlinetag}>
                              <Ionicons name="calendar-outline" size={12} color="#DC2626" />
                              <Text style={styles.deadlineText}>{item.explicitDeadline}</Text>
                            </View>
                          ) : null}
                          <View style={styles.priorityTag}>
                            <Text style={styles.priorityText}>{item.priority} Priority</Text>
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>

          {/* Footer */}
          {hasExtracted && (
            <View style={styles.footer}>
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.importBtn} onPress={handleImport}>
                <Ionicons name="add-circle" size={18} color="#FFFFFF" />
                <Text style={styles.importText}>
                  Import Selected ({extractedItems.filter((i) => i.selected).length})
                </Text>
              </TouchableOpacity>
            </View>
          )}
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
    maxHeight: '90%',
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
    backgroundColor: '#EFF6FF',
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    fontSize: 14,
    color: '#0F172A',
    textAlignVertical: 'top',
    height: 150,
    marginBottom: 16,
  },
  extractBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2563EB',
    borderRadius: 14,
    paddingVertical: 14,
  },
  extractBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  disabledBtn: {
    opacity: 0.5,
  },
  extractedHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  editNotesText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563EB',
  },
  itemsList: {
    gap: 10,
    marginBottom: 16,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  itemCardSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  quoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  quoteText: {
    fontSize: 11,
    color: '#64748B',
    fontStyle: 'italic',
    flex: 1,
  },
  tagRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  deadlinetag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  deadlineText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#DC2626',
  },
  priorityTag: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 14,
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
  importBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2563EB',
    borderRadius: 14,
    paddingVertical: 14,
  },
  importText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
