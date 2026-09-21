// SmartDay Note Reader & Editor Modal
// Comprehensive academic and study notes viewer with markdown-like sections and instant editing

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Note } from '../../types';

interface NoteReaderModalProps {
  visible: boolean;
  onClose: () => void;
  note: Note | null;
  onSaveNote?: (id: string, title: string, body: string) => void;
}

export const NoteReaderModal: React.FC<NoteReaderModalProps> = ({
  visible,
  onClose,
  note,
  onSaveNote,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(note?.title || 'Database Normalization');
  const [body, setBody] = useState(
    note?.body ||
      `Notes on 1NF, 2NF, 3NF and BCNF

• 1NF (First Normal Form):
- Each column must contain atomic (indivisible) values.
- No repeating groups or arrays of items in a single cell.
- A primary key uniquely identifies each tuple.

• 2NF (Second Normal Form):
- Must be in 1NF.
- No partial dependency: every non-prime attribute must depend on the whole candidate key, not just a subset.

• 3NF (Third Normal Form):
- Must be in 2NF.
- No transitive dependency: non-prime attributes must not determine other non-prime attributes (X -> Y where neither is superkey).

• BCNF (Boyce-Codd Normal Form):
- For every functional dependency X -> Y, X must be a super key.`
  );

  // Sync state on open
  React.useEffect(() => {
    if (note) {
      setTitle(note.title);
      setBody(note.body);
    }
    setIsEditing(false);
  }, [note, visible]);

  const handleSave = () => {
    if (note && onSaveNote) {
      onSaveNote(note.id, title, body);
    }
    setIsEditing(false);
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />

        <View style={styles.modalCard}>
          {/* Top Bar */}
          <View style={styles.topBar}>
            <View style={styles.badgeRow}>
              <View style={styles.iconBox}>
                <Ionicons name="document-text" size={20} color="#D97706" />
              </View>
              <View>
                <Text style={styles.categoryBadge}>STUDY NOTES</Text>
                <Text style={styles.timestamp}>Updated 2h ago · DBMS CS-301</Text>
              </View>
            </View>

            <View style={styles.actionIcons}>
              <TouchableOpacity
                onPress={() => (isEditing ? handleSave() : setIsEditing(true))}
                style={styles.editBtn}
              >
                <Ionicons name={isEditing ? 'checkmark' : 'pencil'} size={18} color="#059669" />
                <Text style={styles.editBtnText}>{isEditing ? 'Save' : 'Edit'}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Body Content */}
          <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
            {isEditing ? (
              <>
                <Text style={styles.label}>Title</Text>
                <TextInput
                  style={styles.titleInput}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Note Title"
                />
                <Text style={styles.label}>Notes Content</Text>
                <TextInput
                  style={styles.bodyInput}
                  value={body}
                  onChangeText={setBody}
                  multiline
                  placeholder="Write your notes here..."
                />
              </>
            ) : (
              <>
                <Text style={styles.noteTitle}>{title}</Text>
                <View style={styles.tagsRow}>
                  <View style={styles.tagPill}>
                    <Text style={styles.tagText}>#DBMS</Text>
                  </View>
                  <View style={[styles.tagPill, { backgroundColor: '#EFF6FF' }]}>
                    <Text style={[styles.tagText, { color: '#2563EB' }]}>#Normalization</Text>
                  </View>
                  <View style={[styles.tagPill, { backgroundColor: '#F5F3FF' }]}>
                    <Text style={[styles.tagText, { color: '#7C3AED' }]}>#ExamPrep</Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <Text style={styles.bodyText}>{body}</Text>
              </>
            )}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.doneBtn} onPress={onClose}>
              <Text style={styles.doneBtnText}>Close Note</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D97706',
    letterSpacing: 0.5,
  },
  timestamp: {
    fontSize: 11,
    color: '#64748B',
  },
  actionIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  editBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  closeBtn: {
    padding: 6,
  },
  contentScroll: {
    paddingVertical: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 6,
    marginTop: 10,
  },
  titleInput: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 10,
  },
  bodyInput: {
    fontSize: 14,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    minHeight: 220,
    lineHeight: 22,
    textAlignVertical: 'top',
  },
  noteTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  tagPill: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B45309',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  bodyText: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 24,
  },
  footer: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  doneBtn: {
    backgroundColor: '#0F172A',
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
