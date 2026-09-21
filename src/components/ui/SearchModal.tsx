// SmartDay Search Modal (Section 2 & 13 Spec)
// Search across Tasks, Habits, Notes, and Highlights with filter chips

import React, { useState, useMemo } from 'react';
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

interface SearchModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectResult?: (type: string, id: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  visible,
  onClose,
  onSelectResult,
}) => {
  const { theme, isDark } = useTheme();
  const { colors, typography, borderRadius, spacing } = theme;
  const { tasks, habits, notes, highlights, profile } = useSmartDay();

  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'tasks' | 'habits' | 'notes'>('all');

  const filteredResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const results: { id: string; type: 'task' | 'habit' | 'note'; title: string; subtitle: string }[] = [];

    if (activeFilter === 'all' || activeFilter === 'tasks') {
      tasks.forEach((t) => {
        if (t.title.toLowerCase().includes(q) || t.notes?.toLowerCase().includes(q)) {
          results.push({ id: t.id, type: 'task', title: t.title, subtitle: `${t.priority} Priority · ${t.status}` });
        }
      });
    }

    if (activeFilter === 'all' || activeFilter === 'habits') {
      habits.forEach((h) => {
        if (h.name.toLowerCase().includes(q) || h.description?.toLowerCase().includes(q)) {
          results.push({ id: h.id, type: 'habit', title: h.name, subtitle: `Streak: ${h.streak}d` });
        }
      });
    }

    if (activeFilter === 'all' || activeFilter === 'notes') {
      notes.forEach((n) => {
        if (n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q)) {
          results.push({ id: n.id, type: 'note', title: n.title, subtitle: n.body.slice(0, 45) });
        }
      });
    }

    return results;
  }, [query, activeFilter, tasks, habits, notes]);

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="fade" presentationStyle="fullScreen" onRequestClose={onClose}>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Search Header */}
        <View style={[styles.header, { borderBottomColor: colors.borderLight, borderBottomWidth: 1 }]}>
          <View
            style={[
              styles.searchBar,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderRadius: borderRadius.lg,
              },
            ]}
          >
            <Ionicons name="search" size={18} color={colors.textSecondary} style={{ marginRight: 8 }} />
            <TextInput
              autoFocus
              value={query}
              onChangeText={setQuery}
              placeholder={translate(profile.language, 'searchPlaceholder')}
              placeholderTextColor={colors.textTertiary}
              style={[styles.input, { color: colors.textPrimary }]}
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')}>
                <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
            <Text style={{ color: colors.primary, fontSize: 15, fontWeight: typography.weights.semibold }}>
              {translate(profile.language, 'cancel')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Filter Chips */}
        <View style={styles.filterRow}>
          {(['all', 'tasks', 'habits', 'notes'] as const).map((filter) => (
            <TouchableOpacity
              key={filter}
              onPress={() => setActiveFilter(filter)}
              style={[
                styles.chip,
                {
                  backgroundColor: activeFilter === filter ? colors.primarySurface : colors.surface,
                  borderColor: activeFilter === filter ? colors.primary : colors.border,
                  borderRadius: borderRadius.full,
                },
              ]}
            >
              <Text
                style={{
                  color: activeFilter === filter ? colors.primary : colors.textSecondary,
                  fontSize: 12,
                  fontWeight: activeFilter === filter ? typography.weights.bold : typography.weights.regular,
                  textTransform: 'capitalize',
                }}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Results List */}
        <ScrollView contentContainerStyle={styles.resultsList} showsVerticalScrollIndicator={false}>
          {query.trim().length === 0 ? (
            <View style={styles.emptyPrompt}>
              <Ionicons name="search-outline" size={40} color={colors.textTertiary} />
              <Text style={{ color: colors.textSecondary, marginTop: 8, fontSize: 14 }}>
                Type to search tasks, habits, and notes...
              </Text>
            </View>
          ) : filteredResults.length === 0 ? (
            <View style={styles.emptyPrompt}>
              <Text style={{ color: colors.textTertiary, fontSize: 14 }}>No matches found for "{query}".</Text>
            </View>
          ) : (
            filteredResults.map((item) => (
              <TouchableOpacity
                key={`${item.type}-${item.id}`}
                activeOpacity={0.75}
                onPress={() => {
                  onClose();
                  onSelectResult?.(item.type, item.id);
                }}
                style={[
                  styles.resultCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    borderRadius: borderRadius.lg,
                  },
                  theme.shadows.sm,
                ]}
              >
                <View
                  style={[
                    styles.typeIcon,
                    {
                      backgroundColor:
                        item.type === 'task'
                          ? colors.primarySurface
                          : item.type === 'habit'
                          ? colors.goldSurface
                          : colors.infoSurface,
                      borderRadius: borderRadius.full,
                    },
                  ]}
                >
                  <Ionicons
                    name={
                      item.type === 'task'
                        ? 'checkbox-outline'
                        : item.type === 'habit'
                        ? 'flame-outline'
                        : 'document-text-outline'
                    }
                    size={16}
                    color={
                      item.type === 'task'
                        ? colors.primary
                        : item.type === 'habit'
                        ? colors.gold
                        : colors.info
                    }
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text numberOfLines={1} style={{ color: colors.textPrimary, fontSize: 15, fontWeight: typography.weights.semibold }}>
                    {item.title}
                  </Text>
                  <Text numberOfLines={1} style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }}>
                    {item.subtitle}
                  </Text>
                </View>

                <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
              </TouchableOpacity>
            ))
          )}
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
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 42,
  },
  input: {
    flex: 1,
    fontSize: 15,
    height: '100%',
  },
  cancelBtn: {
    marginLeft: 12,
    paddingHorizontal: 4,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderWidth: 1,
  },
  resultsList: {
    padding: 16,
  },
  emptyPrompt: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  typeIcon: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
});
