import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { SearchBar } from '../components/ui/SearchBar';
import { Badge } from '../components/ui/Badge';
import { Note, initialNotes } from '../data/mockNotes';
import {
  readNote,
  pauseReading,
  resumeReading,
  stopReading,
  TTSStatus,
  subscribeToVoices,
  VoiceOption,
  getSpeechRecognition,
  SUPPORTED_SPEECH_LANGUAGES,
} from '../services/speechService';
import {
  cleanUpNoteWithAI,
  summarizeNoteWithAI,
  translateNoteWithAI,
} from '../services/aiService';

export interface NotesScreenProps {
  onOpenNote?: (note: Note) => void;
}

export const NotesScreen: React.FC<NotesScreenProps> = () => {
  const { theme } = useTheme();
  const { colors, typography, spacing, borderRadius } = theme;
  const insets = useSafeAreaInsets();

  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState<string>('All');
  const [activeNote, setActiveNote] = useState<Note | null>(null);

  // Creation State
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<Note['category']>('Idea');

  // TTS State
  const [activeReadingNoteId, setActiveReadingNoteId] = useState<string | null>(null);
  const [ttsStatus, setTtsStatus] = useState<TTSStatus>('idle');
  const [readingSpeed, setReadingSpeed] = useState<number>(1.0);
  const [availableVoices, setAvailableVoices] = useState<VoiceOption[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string | undefined>(undefined);
  const [speechLanguage, setSpeechLanguage] = useState('en-US');

  // Voice-to-Text State for Creation
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);

  // AI Enhancements State
  const [aiLoading, setAiLoading] = useState<'cleanup' | 'summarize' | 'translate' | null>(null);
  const [aiPreview, setAiPreview] = useState<{
    mode: 'cleanup' | 'summarize' | 'translate';
    original: string;
    suggested: string;
  } | null>(null);

  // Pulse animation for speaking/listening
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let anim: Animated.CompositeAnimation | null = null;
    if (ttsStatus === 'speaking' || isListening) {
      anim = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.25, duration: 550, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1.0, duration: 550, useNativeDriver: true }),
        ])
      );
      anim.start();
    } else {
      pulseAnim.setValue(1);
    }
    return () => anim?.stop();
  }, [ttsStatus, isListening]);

  // Subscribe to voices
  useEffect(() => {
    const unsub = subscribeToVoices((voices) => {
      setAvailableVoices(voices);
      if (voices.length > 0 && !selectedVoiceURI) {
        const def = voices.find((v) => v.default) || voices[0];
        setSelectedVoiceURI(def.voiceURI);
      }
    });
    return () => {
      unsub();
      stopReading();
    };
  }, []);

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

  // --------------------------------------------------------------------------
  // TTS Control Functions
  // --------------------------------------------------------------------------
  const handleTogglePlayNote = (note: Note) => {
    // If currently speaking this note
    if (activeReadingNoteId === note.id) {
      if (ttsStatus === 'speaking') {
        pauseReading();
        setTtsStatus('paused');
        return;
      }
      if (ttsStatus === 'paused') {
        resumeReading();
        setTtsStatus('speaking');
        return;
      }
    }

    // Stop dictation first
    handleStopDictation();

    // Start reading this note
    setActiveReadingNoteId(note.id);
    const fullText = `${note.title}. ${note.content}`;
    const res = readNote({
      text: fullText,
      lang: speechLanguage,
      rate: readingSpeed,
      voiceURI: selectedVoiceURI,
      onStatusChange: (status) => {
        setTtsStatus(status);
        if (status === 'idle') {
          setActiveReadingNoteId(null);
        }
      },
      onError: (err) => {
        setVoiceNotice(err);
        setActiveReadingNoteId(null);
        setTtsStatus('idle');
      },
    });

    if (!res.ok) {
      setVoiceNotice(res.error || 'Failed to read aloud');
      setActiveReadingNoteId(null);
      setTtsStatus('idle');
    }
  };

  const handleStopSpeech = () => {
    stopReading();
    setActiveReadingNoteId(null);
    setTtsStatus('idle');
  };

  const handleChangeSpeed = (newSpeed: number, note?: Note | null) => {
    setReadingSpeed(newSpeed);
    const targetNote = note || (activeReadingNoteId ? notes.find((n) => n.id === activeReadingNoteId) : null);
    if (targetNote && (ttsStatus === 'speaking' || ttsStatus === 'paused')) {
      stopReading();
      readNote({
        text: `${targetNote.title}. ${targetNote.content}`,
        lang: speechLanguage,
        rate: newSpeed,
        voiceURI: selectedVoiceURI,
        onStatusChange: (status) => {
          setTtsStatus(status);
          if (status === 'idle') setActiveReadingNoteId(null);
        },
      });
    }
  };

  // --------------------------------------------------------------------------
  // Voice-to-Text for Create Note
  // --------------------------------------------------------------------------
  const handleStartDictation = async () => {
    handleStopSpeech();
    setVoiceNotice(null);
    const controller = getSpeechRecognition();

    const ok = await controller.start({
      lang: speechLanguage,
      onFinalResult: (finalText) => {
        setNewContent((prev) => {
          const trimmed = prev.trim();
          if (!trimmed) return finalText;
          const endsWithPunct = /[.!?]$/.test(trimmed);
          return `${trimmed}${endsWithPunct ? ' ' : '. '}${finalText}`;
        });
        setInterimTranscript('');
      },
      onInterimResult: (interim) => {
        setInterimTranscript(interim);
      },
      onError: (err) => {
        setVoiceNotice(err);
        setIsListening(false);
      },
      onStateChange: (listening) => {
        setIsListening(listening);
      },
    });

    if (!ok) setIsListening(false);
  };

  const handleStopDictation = () => {
    const controller = getSpeechRecognition();
    controller.stop();
    setIsListening(false);
    if (interimTranscript.trim()) {
      setNewContent((prev) => {
        const trimmed = prev.trim();
        if (!trimmed) return interimTranscript.trim();
        return `${trimmed} ${interimTranscript.trim()}`;
      });
      setInterimTranscript('');
    }
  };

  // --------------------------------------------------------------------------
  // AI Feature Handlers
  // --------------------------------------------------------------------------
  const handleCleanUpText = async (text: string) => {
    if (!text.trim()) return;
    setAiLoading('cleanup');
    try {
      const res = await cleanUpNoteWithAI(text);
      setAiPreview({ mode: 'cleanup', original: text, suggested: res });
    } finally {
      setAiLoading(null);
    }
  };

  const handleSummarizeText = async (text: string) => {
    if (!text.trim()) return;
    setAiLoading('summarize');
    try {
      const res = await summarizeNoteWithAI(text);
      setAiPreview({ mode: 'summarize', original: text, suggested: res });
    } finally {
      setAiLoading(null);
    }
  };

  const handleTranslateText = async (text: string, langName: string) => {
    if (!text.trim()) return;
    setAiLoading('translate');
    try {
      const res = await translateNoteWithAI(text, langName);
      setAiPreview({ mode: 'translate', original: text, suggested: res });
    } finally {
      setAiLoading(null);
    }
  };

  const handleSaveNewNote = () => {
    if (!newTitle.trim()) return;
    handleStopDictation();
    handleStopSpeech();

    const fullContent = (newContent + (interimTranscript ? ' ' + interimTranscript : '')).trim();
    const newNote: Note = {
      id: `note-${Date.now()}`,
      title: newTitle.trim(),
      content: fullContent,
      category: newCategory,
      isPinned: false,
      hasAISummary: true,
      updatedAt: 'Just now',
      wordCount: fullContent.split(/\s+/).filter(Boolean).length,
    };
    setNotes([newNote, ...notes]);
    setNewTitle('');
    setNewContent('');
    setInterimTranscript('');
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
              {notes.length} notes saved • Tap 🔊 to read aloud
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => {
              handleStopSpeech();
              setIsCreating(true);
            }}
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
          placeholder="Search notes, insights & transcripts..."
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

      {/* Notice alert */}
      {voiceNotice && (
        <View style={styles.noticeBar}>
          <Ionicons name="information-circle-outline" size={16} color="#0369A1" />
          <Text style={styles.noticeText}>{voiceNotice}</Text>
          <TouchableOpacity onPress={() => setVoiceNotice(null)}>
            <Ionicons name="close" size={14} color="#64748B" />
          </TouchableOpacity>
        </View>
      )}

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
        {filteredNotes.map((note) => {
          const isThisPlaying = activeReadingNoteId === note.id;
          return (
            <TouchableOpacity
              key={note.id}
              onPress={() => setActiveNote(note)}
              activeOpacity={0.8}
              style={[
                styles.noteCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: isThisPlaying ? '#059669' : colors.border,
                  borderWidth: isThisPlaying ? 2 : 1,
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
                  backgroundColor: isThisPlaying
                    ? '#DCFCE7'
                    : note.category === 'AI Summary'
                    ? `${colors.primaryLight}20`
                    : colors.surfaceSecondary,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: spacing.md,
                  flexShrink: 0,
                }}
              >
                {isThisPlaying ? (
                  <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                    <Ionicons name="volume-high" size={20} color="#059669" />
                  </Animated.View>
                ) : (
                  <Ionicons
                    name={
                      note.category === 'AI Summary'
                        ? 'sparkles-outline'
                        : note.isPinned
                        ? 'pin-outline'
                        : 'document-text-outline'
                    }
                    size={20}
                    color={
                      note.category === 'AI Summary'
                        ? colors.primaryLight
                        : colors.textSecondary
                    }
                  />
                )}
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
                  {note.isPinned ? '📌 ' : ''}
                  {note.title}
                </Text>
                <Text
                  numberOfLines={2}
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

              {/* Right: Read Aloud Button & Category */}
              <View style={{ alignItems: 'flex-end', gap: 6, marginLeft: spacing.sm }}>
                <View
                  style={{
                    backgroundColor:
                      note.category === 'AI Summary'
                        ? colors.primarySurface
                        : colors.surfaceSecondary,
                    borderRadius: borderRadius.full,
                    paddingHorizontal: spacing.sm,
                    paddingVertical: 3,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: typography.weights.bold,
                      color:
                        note.category === 'AI Summary'
                          ? colors.primaryLight
                          : colors.textSecondary,
                    }}
                  >
                    {note.category}
                  </Text>
                </View>

                {/* 🔊 1-Tap Read Aloud Button */}
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    handleTogglePlayNote(note);
                  }}
                  activeOpacity={0.8}
                  style={[
                    styles.cardPlayBtn,
                    {
                      backgroundColor: isThisPlaying ? '#059669' : colors.surfaceSecondary,
                      borderColor: isThisPlaying ? '#047857' : colors.border,
                    },
                  ]}
                >
                  <Ionicons
                    name={
                      isThisPlaying && ttsStatus === 'speaking'
                        ? 'pause'
                        : isThisPlaying && ttsStatus === 'paused'
                        ? 'play'
                        : 'volume-high-outline'
                    }
                    size={13}
                    color={isThisPlaying ? '#FFFFFF' : colors.textPrimary}
                  />
                  <Text
                    style={[
                      styles.cardPlayBtnText,
                      { color: isThisPlaying ? '#FFFFFF' : colors.textPrimary },
                    ]}
                  >
                    {isThisPlaying && ttsStatus === 'speaking'
                      ? 'Pause'
                      : isThisPlaying && ttsStatus === 'paused'
                      ? 'Resume'
                      : 'Read'}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Note Detail / Reader Modal */}
      <Modal
        visible={!!activeNote}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          handleStopSpeech();
          setActiveNote(null);
        }}
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
            <TouchableOpacity
              onPress={() => {
                handleStopSpeech();
                setActiveNote(null);
              }}
            >
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
            <Badge
              label={activeNote?.category || ''}
              variant={activeNote?.category === 'AI Summary' ? 'ai' : 'neutral'}
            />
            <TouchableOpacity
              onPress={() => {
                if (activeNote) handleTogglePlayNote(activeNote);
              }}
              style={styles.headerAudioBtn}
            >
              <Ionicons
                name={
                  activeReadingNoteId === activeNote?.id && ttsStatus === 'speaking'
                    ? 'pause-circle'
                    : 'volume-high'
                }
                size={22}
                color="#059669"
              />
            </TouchableOpacity>
          </View>

          {/* Dedicated Text-to-Speech Control Player Bar */}
          <View style={[styles.playerBanner, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
            <View style={styles.playerTopRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <TouchableOpacity
                  onPress={() => {
                    if (activeNote) handleTogglePlayNote(activeNote);
                  }}
                  activeOpacity={0.8}
                  style={[
                    styles.playerBigPlayBtn,
                    {
                      backgroundColor:
                        activeReadingNoteId === activeNote?.id && ttsStatus === 'speaking'
                          ? '#059669'
                          : colors.primary,
                    },
                  ]}
                >
                  <Animated.View
                    style={
                      activeReadingNoteId === activeNote?.id && ttsStatus === 'speaking'
                        ? { transform: [{ scale: pulseAnim }] }
                        : {}
                    }
                  >
                    <Ionicons
                      name={
                        activeReadingNoteId === activeNote?.id && ttsStatus === 'speaking'
                          ? 'pause'
                          : 'play'
                      }
                      size={18}
                      color="#FFFFFF"
                    />
                  </Animated.View>
                  <Text style={styles.playerBigPlayText}>
                    {activeReadingNoteId === activeNote?.id && ttsStatus === 'speaking'
                      ? 'Pause'
                      : activeReadingNoteId === activeNote?.id && ttsStatus === 'paused'
                      ? 'Resume'
                      : 'Read Aloud'}
                  </Text>
                </TouchableOpacity>

                {activeReadingNoteId === activeNote?.id && ttsStatus !== 'idle' && (
                  <TouchableOpacity
                    onPress={handleStopSpeech}
                    style={styles.playerStopBtn}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="stop" size={14} color="#DC2626" />
                    <Text style={{ fontSize: 12, fontWeight: '700', color: '#DC2626' }}>Stop</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Speed Buttons */}
              <View style={styles.speedRowSmall}>
                {[0.75, 1.0, 1.25, 1.5, 2.0].map((spd) => {
                  const isSelected = readingSpeed === spd;
                  return (
                    <TouchableOpacity
                      key={spd}
                      onPress={() => handleChangeSpeed(spd, activeNote)}
                      style={[
                        styles.speedPillSmall,
                        {
                          backgroundColor: isSelected ? colors.primaryLight : colors.surface,
                          borderColor: isSelected ? colors.primaryLight : colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={{
                          fontSize: 10,
                          fontWeight: '700',
                          color: isSelected ? '#FFFFFF' : colors.textSecondary,
                        }}
                      >
                        {spd}x
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Speaking animation indicator */}
            {activeReadingNoteId === activeNote?.id && ttsStatus === 'speaking' && (
              <View style={styles.speakingIndicatorRow}>
                <Ionicons name="radio" size={12} color="#059669" />
                <Text style={styles.speakingIndicatorText}>
                  Reading note aloud using device speech synthesis
                </Text>
              </View>
            )}
          </View>

          {/* Quick AI Tools for this note */}
          <View style={[styles.aiNoteBar, { borderColor: colors.borderLight }]}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: colors.textTertiary, textTransform: 'uppercase' }}>
              AI Actions:
            </Text>
            <TouchableOpacity
              onPress={() => activeNote && handleCleanUpText(activeNote.content)}
              disabled={aiLoading !== null}
              style={styles.aiNoteChip}
            >
              <Ionicons name="sparkles-outline" size={12} color="#7C3AED" />
              <Text style={[styles.aiNoteChipText, { color: '#7C3AED' }]}>Clean up</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => activeNote && handleSummarizeText(activeNote.content)}
              disabled={aiLoading !== null}
              style={styles.aiNoteChip}
            >
              <Ionicons name="list-outline" size={12} color="#0284C7" />
              <Text style={[styles.aiNoteChipText, { color: '#0284C7' }]}>Summarize</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => activeNote && handleTranslateText(activeNote.content, 'Spanish')}
              disabled={aiLoading !== null}
              style={styles.aiNoteChip}
            >
              <Ionicons name="language-outline" size={12} color="#EA580C" />
              <Text style={[styles.aiNoteChipText, { color: '#EA580C' }]}>Translate</Text>
            </TouchableOpacity>
          </View>

          {/* AI Preview in Detail Modal */}
          {aiPreview && (
            <View style={styles.aiPreviewBox}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: '#1E293B' }}>
                  AI {aiPreview.mode === 'cleanup' ? 'Cleaned' : aiPreview.mode === 'summarize' ? 'Summary' : 'Translation'}
                </Text>
                <TouchableOpacity onPress={() => setAiPreview(null)}>
                  <Ionicons name="close" size={16} color="#64748B" />
                </TouchableOpacity>
              </View>
              <Text style={{ fontSize: 13, color: '#334155', lineHeight: 18 }}>{aiPreview.suggested}</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                <TouchableOpacity
                  onPress={() => {
                    if (activeNote) {
                      const updated = { ...activeNote, content: aiPreview.suggested };
                      setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
                      setActiveNote(updated);
                    }
                    setAiPreview(null);
                  }}
                  style={styles.aiApplyBtn}
                >
                  <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 11 }}>Replace Text</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

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
                  marginBottom: spacing.lg,
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

      {/* Create Note Modal with Voice-to-Text Dictation */}
      <Modal
        visible={isCreating}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          handleStopDictation();
          setIsCreating(false);
        }}
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
            <TouchableOpacity
              onPress={() => {
                handleStopDictation();
                setIsCreating(false);
              }}
            >
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
            <TouchableOpacity onPress={handleSaveNewNote} disabled={!newTitle.trim()}>
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

          <ScrollView style={[styles.createBody, { padding: spacing.base + 4 }]}>
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
                      backgroundColor: isSelected ? colors.primarySurface : colors.surfaceSecondary,
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

            {/* Voice-to-Text Bar */}
            <View style={[styles.dictationRow, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
              <TouchableOpacity
                onPress={isListening ? handleStopDictation : handleStartDictation}
                activeOpacity={0.8}
                style={[
                  styles.dictateBtn,
                  {
                    backgroundColor: isListening ? '#DC2626' : colors.primarySurface,
                    borderColor: isListening ? '#B91C1C' : colors.primaryLight,
                  },
                ]}
              >
                <Animated.View style={isListening ? { transform: [{ scale: pulseAnim }] } : {}}>
                  <Ionicons
                    name={isListening ? 'stop-circle' : 'mic'}
                    size={18}
                    color={isListening ? '#FFFFFF' : colors.primaryLight}
                  />
                </Animated.View>
                <Text
                  style={[
                    styles.dictateBtnText,
                    { color: isListening ? '#FFFFFF' : colors.primaryLight },
                  ]}
                >
                  {isListening ? 'Stop Listening' : '🎤 Dictate Note'}
                </Text>
              </TouchableOpacity>

              <Text style={{ fontSize: 11, color: colors.textTertiary, flex: 1 }}>
                {isListening ? 'Speak clearly... Appending to note' : 'Tap to speak. Transcribes live on-device.'}
              </Text>
            </View>

            {/* Content text input */}
            <TextInput
              value={newContent}
              onChangeText={setNewContent}
              placeholder="Start capturing your thoughts, or use microphone to dictate…"
              placeholderTextColor={colors.textTertiary}
              multiline
              style={[
                styles.contentTextInput,
                {
                  fontSize: typography.sizes.base,
                  color: colors.textPrimary,
                  lineHeight: 22,
                  minHeight: 180,
                  textAlignVertical: 'top',
                  borderColor: isListening ? '#DC2626' : colors.border,
                  borderWidth: 1,
                  borderRadius: 12,
                  padding: 12,
                  backgroundColor: colors.surface,
                },
              ]}
            />

            {/* Interim live speech preview without duplicating */}
            {interimTranscript.length > 0 && (
              <View style={styles.interimBox}>
                <Ionicons name="radio-outline" size={14} color="#DC2626" />
                <Text style={styles.interimText}>{interimTranscript}</Text>
              </View>
            )}

            {/* Quick AI tools for drafting */}
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
              <TouchableOpacity
                onPress={() => handleCleanUpText(newContent)}
                disabled={aiLoading !== null || !newContent.trim()}
                style={styles.aiQuickBtn}
              >
                <Ionicons name="sparkles-outline" size={13} color="#7C3AED" />
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#7C3AED' }}>Clean up</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleSummarizeText(newContent)}
                disabled={aiLoading !== null || !newContent.trim()}
                style={styles.aiQuickBtn}
              >
                <Ionicons name="list-outline" size={13} color="#0284C7" />
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#0284C7' }}>Summarize</Text>
              </TouchableOpacity>
            </View>

            {/* Preview modal/box in create note */}
            {aiPreview && (
              <View style={[styles.aiPreviewBox, { marginTop: 12 }]}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: '#0F172A', marginBottom: 4 }}>
                  AI Suggestion Preview
                </Text>
                <Text style={{ fontSize: 12, color: '#334155', lineHeight: 18, marginBottom: 8 }}>
                  {aiPreview.suggested}
                </Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity
                    onPress={() => {
                      setNewContent(aiPreview.suggested);
                      setAiPreview(null);
                    }}
                    style={styles.aiApplyBtn}
                  >
                    <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 11 }}>Apply</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setAiPreview(null)} style={{ padding: 6 }}>
                    <Text style={{ color: '#64748B', fontSize: 11 }}>Discard</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>
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
  tagsScroll: {},
  tagPill: {
    borderWidth: 1,
  },
  tagPillText: {},
  notesList: {},
  noteCard: {},
  noticeBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  noticeText: {
    flex: 1,
    fontSize: 12,
    color: '#0369A1',
  },
  cardPlayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  cardPlayBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  detailModal: {
    flex: 1,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerAudioBtn: {
    padding: 4,
  },
  playerBanner: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  playerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  playerBigPlayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  playerBigPlayText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  playerStopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },
  speedRowSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  speedPillSmall: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
  },
  speakingIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  speakingIndicatorText: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '500',
  },
  aiNoteBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  aiNoteChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  aiNoteChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  aiPreviewBox: {
    backgroundColor: '#F1F5F9',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  aiApplyBtn: {
    backgroundColor: '#059669',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  detailBody: {},
  detailTitle: {},
  detailMeta: {},
  detailContent: {},
  createBody: {
    flex: 1,
  },
  titleTextInput: {},
  dictationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10,
  },
  dictateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  dictateBtnText: {
    fontWeight: '700',
    fontSize: 12,
  },
  contentTextInput: {},
  interimBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
    marginTop: 6,
    backgroundColor: '#FFF1F2',
    borderRadius: 8,
  },
  interimText: {
    fontSize: 13,
    color: '#991B1B',
    fontStyle: 'italic',
  },
  aiQuickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
});
