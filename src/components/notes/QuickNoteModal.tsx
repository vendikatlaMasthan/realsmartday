// SmartDay Quick Note Modal (Section 13 Spec)
// Bottom sheet quick capture, save to inbox, optional task link

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { translate } from '../../i18n';
import { useSmartDay } from '../../context/SmartDayContext';

interface QuickNoteModalProps {
  visible: boolean;
  onClose: () => void;
}

export const QuickNoteModal: React.FC<QuickNoteModalProps> = ({ visible, onClose }) => {
  const { theme } = useTheme();
  const { colors, typography, borderRadius, spacing } = theme;
  const { addNote, profile } = useSmartDay();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const handleSave = () => {
    if (!title.trim() && !body.trim()) return;
    addNote(title.trim() || 'Untitled Note', body.trim());
    setTitle('');
    setBody('');
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.borderLight, borderBottomWidth: 1 }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary, fontWeight: typography.weights.bold }]}>
            {translate(profile.language, 'actionQuickNote')}
          </Text>
          <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
            <Text style={{ color: colors.primary, fontWeight: typography.weights.bold, fontSize: 16 }}>
              {translate(profile.language, 'save')}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <TextInput
            autoFocus
            value={title}
            onChangeText={setTitle}
            placeholder="Note Title..."
            placeholderTextColor={colors.textTertiary}
            style={[styles.titleInput, { color: colors.textPrimary }]}
          />

          <TextInput
            multiline
            value={body}
            onChangeText={setBody}
            placeholder="Capture thoughts, ideas, or meeting takeaways..."
            placeholderTextColor={colors.textTertiary}
            style={[styles.bodyInput, { color: colors.textPrimary }]}
          />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
  },
  closeBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
  },
  saveBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  content: {
    padding: 20,
    flex: 1,
  },
  titleInput: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  bodyInput: {
    fontSize: 16,
    lineHeight: 24,
    minHeight: 200,
    textAlignVertical: 'top',
  },
});
