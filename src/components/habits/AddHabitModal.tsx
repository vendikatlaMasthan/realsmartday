// SmartDay Add Habit Modal
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

interface AddHabitModalProps {
  visible: boolean;
  onClose: () => void;
}

export const AddHabitModal: React.FC<AddHabitModalProps> = ({ visible, onClose }) => {
  const { theme } = useTheme();
  const { colors, typography, borderRadius, spacing } = theme;
  const { addHabit, profile } = useSmartDay();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState('#0D9488');

  const colorOptions = ['#0D9488', '#7C3AED', '#D97706', '#0284C7', '#16A34A', '#EC4899'];

  const handleSave = () => {
    if (!name.trim()) return;
    addHabit({
      name: name.trim(),
      description: description.trim(),
      schedule: 'daily',
      colorPip: selectedColor,
    });
    setName('');
    setDescription('');
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
            New Habit
          </Text>
          <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
            <Text style={{ color: colors.primary, fontWeight: typography.weights.bold, fontSize: 16 }}>
              {translate(profile.language, 'save')}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Habit Name</Text>
          <TextInput
            autoFocus
            value={name}
            onChangeText={setName}
            placeholder="e.g. Read 20 Pages"
            placeholderTextColor={colors.textTertiary}
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary, borderRadius: borderRadius.lg }]}
          />

          <Text style={[styles.label, { color: colors.textSecondary, marginTop: spacing.lg }]}>Description (Optional)</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="e.g. Evening reading before bed"
            placeholderTextColor={colors.textTertiary}
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary, borderRadius: borderRadius.lg }]}
          />

          <Text style={[styles.label, { color: colors.textSecondary, marginTop: spacing.lg }]}>Accent Pip Color</Text>
          <View style={styles.colorRow}>
            {colorOptions.map((c) => (
              <TouchableOpacity
                key={c}
                onPress={() => setSelectedColor(c)}
                style={[
                  styles.colorCircle,
                  {
                    backgroundColor: c,
                    borderColor: selectedColor === c ? colors.textPrimary : 'transparent',
                    borderWidth: 2,
                  },
                ]}
              >
                {selectedColor === c && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
              </TouchableOpacity>
            ))}
          </View>
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
  },
  label: {
    fontSize: 13,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    padding: 14,
    fontSize: 15,
  },
  colorRow: {
    flexDirection: 'row',
    gap: 12,
  },
  colorCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
