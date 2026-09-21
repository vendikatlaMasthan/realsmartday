import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { SearchBar } from '../components/ui/SearchBar';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Note, initialNotes } from '../data/mockNotes';

export interface NotesScreenProps {
  onOpenNote?: (note: Note) => void;
}

export const NotesScreen: React.FC<NotesScreenProps> = () => {
  const { theme, isDark } = useTheme();
  const { colors, typography, spacing, borderRadius } = theme;
  const insets = useSafeAreaInsets();

  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState<string>('All');
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<Note['category']>('Idea');

  const tags = ['All', 'AI Summary', 'Architecture', 'Idea', 'Meeting'];

  const filteredNotes = useMemo(() => {
    return notes.filter((n) => {
      if (activeTag !== 'All' && n.category !== activeTag) return false;
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase();
        return (
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          n.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [notes, activeTag, searchQuery]);

  const handleSaveNewNote = () => {
    if (!newTitle.trim()) return;
    const newNote: Note = {
      id: `note-${Date.now()}`,
      title: newTitle.trim(),
      content: newContent.trim(),
      category: newCategory,
      isPinned: false,
      hasAISummary: true,
      updatedAt: 'Just now',
      wordCount: newContent.trim().split(/\s+/).filter(Boolean).length,
    };
    setNotes([newNote, ...notes]);
    setNewTitle('');
    setNewContent('');
    setNewCategory('Idea');
    setIsCreating(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + spacing.md,
            paddingHorizontal: spacing.base + 4,
            paddingBottom: spacing.sm,
          },
        ]}
      >
        <View style={styles.headerRow}>
          <View>
            <Text
              style={[
                styles.screenTitle,
                {
                  fontSize: typography.sizes['2xl'],
                  fontWeight: typography.weights.extrabold,
                  color: colors.textPrimary,
                  letterSpacing: -0.6,
                },
              ]}
            >
              AI Notes & Ideas
            </Text>
            <Text
              style={{
                fontSize: typography.sizes.xs + 1,
                color: colors.textSecondary,
                marginTop: 2,
              }}
            >
              {notes.length} notes saved
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => setIsCreating(true)}
            activeOpacity={0.8}
            style={{
              backgroundColor: colors.primary,
              borderRadius: borderRadius.full,
              width: 44,
              height: 44,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.4,
              shadowRadius: 8,
              elevation: 6,
            }}
          >
            <Ionicons name="create-outline" size={20} color={colors.primaryTextOn} />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search AI notes, insights & summaries..."
          style={{ marginTop: spacing.md }}
        />

        {/* Tags horizontal filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[
            styles.tagsScroll,
            { marginTop: spacing.md, paddingBottom: 4 },
          ]}
        >
          {tags.map((tag) => {
            const isSelected = activeTag === tag;
            return (
              <TouchableOpacity
                key={tag}
                onPress={() => setActiveTag(tag)}
                activeOpacity={0.75}
                style={[
                  styles.tagPill,
                  {
                    backgroundColor: isSelected
                      ? colors.primary
                      : colors.surfaceSecondary,
                    borderColor: isSelected ? colors.primary : colors.border,
                    borderRadius: borderRadius.full,
                    paddingHorizontal: spacing.md,
                    paddingVertical: 6,
                    marginRight: spacing.sm,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.tagPillText,
                    {
                      fontSize: typography.sizes.xs + 1,
                      fontWeight: isSelected
                        ? typography.weights.semibold
                        : typography.weights.medium,
                      color: isSelected
                        ? colors.primaryTextOn
                        : colors.textSecondary,
                    },
                  ]}
                >
                  {tag}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Notes Cards List */}
      <ScrollView
        contentContainerStyle={[
          styles.notesList,
          {
            paddingHorizontal: spacing.base + 4,
            paddingTop: spacing.sm,
            paddingBottom: insets.bottom + 100,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {filteredNotes.map((note) => (
          <TouchableOpacity
            key={note.id}
            onPress={() => setActiveNote(note)}
            activeOpacity={0.8}
            style={[
              styles.noteCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderWidth: 1,
                borderRadius: borderRadius.xl,
                padding: spacing.base,
                marginBottom: spacing.md,
                flexDirection: 'row',
                alignItems: 'flex-start',
              },
              theme.shadows.sm,
            ]}
          >
            {/* Left icon circle */}
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: note.category === 'AI Summary'
                  ? `${colors.primaryLight}20`
                  : colors.surfaceSecondary,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: spacing.md,
                flexShrink: 0,
              }}
            >
              <Ionicons
                name={note.category === 'AI Summary' ? 'sparkles-outline' : note.isPinned ? 'pin-outline' : 'document-text-outline'}
                size={20}
                color={note.category === 'AI Summary' ? colors.primaryLight : colors.textSecondary}
              />
            </View>

            {/* Middle: title + preview */}
            <View style={{ flex: 1 }}>
              <Text
                numberOfLines={1}
                style={{
                  fontSize: typography.sizes.base,
                  fontWeight: typography.weights.bold,
                  color: colors.textPrimary,
                  letterSpacing: -0.2,
                }}
              >
                {note.isPinned ? '📌 ' : ''}{note.title}
              </Text>
              <Text
                numberOfLines={1}
                style={{
                  fontSize: typography.sizes.xs + 1,
                  color: colors.textSecondary,
                  marginTop: 3,
                  lineHeight: 18,
                }}
              >
                {note.content}
              </Text>
              <Text
                style={{
                  fontSize: 10,
                  color: colors.textTertiary,
                  marginTop: 5,
                }}
              >
                {note.updatedAt} · {note.wordCount} words
              </Text>
            </View>

            {/* Right: category pill */}
            <View
              style={{
                backgroundColor: note.category === 'AI Summary'
                  ? colors.primarySurface
                  : colors.surfaceSecondary,
                borderRadius: borderRadius.full,
                paddingHorizontal: spacing.sm,
                paddingVertical: 4,
                marginLeft: spacing.sm,
                alignSelf: 'flex-start',
              }}
            >
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: typography.weights.bold,
                  color: note.category === 'AI Summary'
                    ? colors.primaryLight
                    : colors.textSecondary,
                }}
              >
                {note.category}
              </Text>
            </View>
          </TouchableOpacity>
        ))}

      </ScrollView>

      {/* Note Detail / Reader Modal */}
      <Modal
        visible={!!activeNote}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setActiveNote(null)}
      >
        <View style={[styles.detailModal, { backgroundColor: colors.surface }]}>
          <View
            style={[
              styles.detailHeader,
              {
                paddingTop: Math.max(insets.top, 16),
                paddingHorizontal: spacing.base + 4,
                paddingBottom: spacing.base,
                borderBottomColor: colors.border,
                borderBottomWidth: 1,
              },
            ]}
          >
            <TouchableOpacity onPress={() => setActiveNote(null)}>
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
            <Badge
              label={activeNote?.category || ''}
              variant={activeNote?.category === 'AI Summary' ? 'ai' : 'neutral'}
            />
            <TouchableOpacity>
              <Ionicons name="share-outline" size={20} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={[
              styles.detailBody,
              {
                padding: spacing.base + 4,
                paddingBottom: insets.bottom + 40,
              },
            ]}
          >
            <Text
              style={[
                styles.detailTitle,
                {
                  fontSize: typography.sizes['2xl'],
                  fontWeight: typography.weights.extrabold,
                  color: colors.textPrimary,
                  marginBottom: spacing.xs,
                },
              ]}
            >
              {activeNote?.title}
            </Text>
            <Text
              style={[
                styles.detailMeta,
                {
                  fontSize: typography.sizes.xs,
                  color: colors.textTertiary,
                  marginBottom: spacing.xl,
                },
              ]}
            >
              Updated {activeNote?.updatedAt} • {activeNote?.wordCount} words
            </Text>
            <Text
              style={[
                styles.detailContent,
                {
                  fontSize: typography.sizes.base,
                  color: colors.textPrimary,
                  lineHeight: 24,
                },
              ]}
            >
              {activeNote?.content}
            </Text>
          </ScrollView>
        </View>
      </Modal>

      {/* Create Note Modal */}
      <Modal
        visible={isCreating}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsCreating(false)}
      >
        <View style={[styles.detailModal, { backgroundColor: colors.surface }]}>
          <View
            style={[
              styles.detailHeader,
              {
                paddingTop: Math.max(insets.top, 16),
                paddingHorizontal: spacing.base + 4,
                paddingBottom: spacing.base,
                borderBottomColor: colors.border,
                borderBottomWidth: 1,
              },
            ]}
          >
            <TouchableOpacity onPress={() => setIsCreating(false)}>
              <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.base }}>
                Cancel
              </Text>
            </TouchableOpacity>
            <Text
              style={{
                fontSize: typography.sizes.base + 1,
                fontWeight: typography.weights.bold,
                color: colors.textPrimary,
              }}
            >
              New Note
            </Text>
            <TouchableOpacity
              onPress={handleSaveNewNote}
              disabled={!newTitle.trim()}
            >
              <Text
                style={{
                  color: newTitle.trim() ? colors.primaryLight : colors.textTertiary,
                  fontWeight: typography.weights.bold,
                  fontSize: typography.sizes.base,
                }}
              >
                Save
              </Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.createBody, { padding: spacing.base + 4 }]}>
            <TextInput
              value={newTitle}
              onChangeText={setNewTitle}
              placeholder="Note title or thesis..."
              placeholderTextColor={colors.textTertiary}
              style={[
                styles.titleTextInput,
                {
                  fontSize: typography.sizes.xl,
                  fontWeight: typography.weights.bold,
                  color: colors.textPrimary,
                  marginBottom: spacing.sm,
                },
              ]}
              autoFocus
            />

            {/* Note Category Selector */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: spacing.md }}>
              {(['Idea', 'AI Summary', 'Architecture', 'Meeting'] as Note['category'][]).map((cat) => {
                const isSelected = newCategory === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setNewCategory(cat)}
                    activeOpacity={0.75}
                    style={{
                      backgroundColor: isSelected
                        ? colors.primarySurface
                        : colors.surfaceSecondary,
                      borderColor: isSelected ? colors.primaryLight : colors.border,
                      borderWidth: 1,
                      borderRadius: borderRadius.full,
                      paddingHorizontal: spacing.md,
                      paddingVertical: 5,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: typography.sizes.xs,
                        fontWeight: isSelected ? typography.weights.bold : typography.weights.medium,
                        color: isSelected ? colors.primaryLight : colors.textSecondary,
                      }}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <TextInput
              value={newContent}
              onChangeText={setNewContent}
              placeholder="Start capturing your thoughts or meeting minutes..."
              placeholderTextColor={colors.textTertiary}
              multiline
              style={[
                styles.contentTextInput,
                {
                  fontSize: typography.sizes.base,
                  color: colors.textPrimary,
                  lineHeight: 22,
                  flex: 1,
                  textAlignVertical: 'top',
                },
              ]}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {},
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  screenTitle: {},
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addBtnText: {},
  tagsScroll: {},
  tagPill: {
    borderWidth: 1,
  },
  tagPillText: {},
  notesList: {},
  noteCard: {},
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timestamp: {},
  noteTitle: {},
  noteSnippet: {},
  aiFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  aiFooterText: {},
  detailModal: {
    flex: 1,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detailBody: {},
  detailTitle: {},
  detailMeta: {},
  detailContent: {},
  createBody: {
    flex: 1,
  },
  titleTextInput: {},
  contentTextInput: {},
});
