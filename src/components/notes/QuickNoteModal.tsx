// SmartDay Quick Note Modal
// Features:
// 1. Voice-to-Text 🎤 (Web Speech API, interim vs final separate, append without overwriting,
//    language selector, listening animation, stop control, permission/error handling).
// 2. Text-to-Speech 🔊 (Read Aloud with Play/Pause/Resume/Stop, speed controls, voice selector, speaking animation).
// 3. AI Features ✨ (Clean up, Summarize, Extract Tasks, Translate with diff preview before replacing).
// 4. Privacy & safety (Stops TTS before dictation, local processing note, no silent overwriting).

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { translate } from '../../i18n';
import { useSmartDay } from '../../context/SmartDayContext';
import {
  getSpeechRecognition,
  readNote,
  pauseReading,
  resumeReading,
  stopReading,
  isSpeechRecognitionSupported,
  isSpeechSynthesisSupported,
  SUPPORTED_SPEECH_LANGUAGES,
  subscribeToVoices,
  VoiceOption,
  TTSStatus,
} from '../../services/speechService';
import {
  cleanUpNoteWithAI,
  summarizeNoteWithAI,
  translateNoteWithAI,
  extractActionItemsFromNotesWithAI,
} from '../../services/aiService';
import { ExtractedActionItem } from '../../types';

interface QuickNoteModalProps {
  visible: boolean;
  onClose: () => void;
  initialText?: string;
  initialTitle?: string;
}

export const QuickNoteModal: React.FC<QuickNoteModalProps> = ({
  visible,
  onClose,
  initialText = '',
  initialTitle = '',
}) => {
  const { theme, isDark } = useTheme();
  const { colors, typography, borderRadius, spacing } = theme;
  const { addNote, addTask, profile } = useSmartDay();

  // Note text state
  const [title, setTitle] = useState(initialTitle);
  const [body, setBody] = useState(initialText);
  const [originalDraftBeforeAI, setOriginalDraftBeforeAI] = useState<string | null>(null);

  // Dictation state
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [speechLanguage, setSpeechLanguage] = useState('en-US');
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);
  const [speechNotice, setSpeechNotice] = useState<{ text: string; type: 'info' | 'error' | 'warn' } | null>(null);

  // Text-to-Speech (TTS) state
  const [ttsStatus, setTtsStatus] = useState<TTSStatus>('idle');
  const [ttsSpeed, setTtsSpeed] = useState<number>(1.0);
  const [availableVoices, setAvailableVoices] = useState<VoiceOption[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string | undefined>(undefined);
  const [showTtsControls, setShowTtsControls] = useState(false);

  // AI Assistance state
  const [aiProcessingMode, setAiProcessingMode] = useState<'cleanup' | 'summarize' | 'translate' | 'extract' | null>(null);
  const [aiPreviewData, setAiPreviewData] = useState<{
    mode: 'cleanup' | 'summarize' | 'translate';
    original: string;
    suggested: string;
  } | null>(null);
  const [extractedTasks, setExtractedTasks] = useState<ExtractedActionItem[] | null>(null);

  // Animation pulse for listening & speaking
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse animation loop when listening or speaking
  useEffect(() => {
    let animation: Animated.CompositeAnimation | null = null;
    if (isListening || ttsStatus === 'speaking') {
      animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.25,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
    } else {
      pulseAnim.setValue(1);
    }
    return () => {
      animation?.stop();
    };
  }, [isListening, ttsStatus]);

  // Load available TTS voices
  useEffect(() => {
    const unsubscribe = subscribeToVoices((voices) => {
      setAvailableVoices(voices);
      if (voices.length > 0 && !selectedVoiceURI) {
        const defaultVoice = voices.find((v) => v.default) || voices[0];
        setSelectedVoiceURI(defaultVoice.voiceURI);
      }
    });
    return () => unsubscribe();
  }, []);

  // Sync initial props on open
  useEffect(() => {
    if (visible) {
      if (initialTitle) setTitle(initialTitle);
      if (initialText) setBody(initialText);
      setInterimTranscript('');
      setSpeechNotice(null);
      setAiPreviewData(null);
      setExtractedTasks(null);
    } else {
      // Clean up when closing modal
      handleStopDictation();
      stopReading();
      setTtsStatus('idle');
    }
  }, [visible, initialText, initialTitle]);

  // --------------------------------------------------------------------------
  // Voice-to-Text (Dictation) Handlers
  // --------------------------------------------------------------------------

  const handleStartDictation = async () => {
    // 1. Stop any active reading so mic doesn't transcribe app speech
    stopReading();
    setTtsStatus('idle');
    setSpeechNotice(null);

    const controller = getSpeechRecognition();

    const ok = await controller.start({
      lang: speechLanguage,
      onFinalResult: (finalText) => {
        // Append speech without overwriting existing notes
        setBody((prev) => {
          const trimmed = prev.trim();
          if (!trimmed) return finalText;
          // Clean spacing between sentences
          const endsWithPunct = /[.!?]$/.test(trimmed);
          return `${trimmed}${endsWithPunct ? ' ' : '. '}${finalText}`;
        });
        setInterimTranscript('');
      },
      onInterimResult: (interim) => {
        setInterimTranscript(interim);
      },
      onError: (err) => {
        setSpeechNotice({ text: err, type: 'error' });
        setIsListening(false);
      },
      onStateChange: (listening) => {
        setIsListening(listening);
      },
    });

    if (!ok) {
      setIsListening(false);
    }
  };

  const handleStopDictation = () => {
    const controller = getSpeechRecognition();
    controller.stop();
    setIsListening(false);
    // If there was lingering interim speech, append it as finalized text
    if (interimTranscript.trim()) {
      setBody((prev) => {
        const trimmed = prev.trim();
        if (!trimmed) return interimTranscript.trim();
        return `${trimmed} ${interimTranscript.trim()}`;
      });
      setInterimTranscript('');
    }
  };

  const toggleDictation = () => {
    if (isListening) {
      handleStopDictation();
    } else {
      handleStartDictation();
    }
  };

  // --------------------------------------------------------------------------
  // Text-to-Speech (Read Aloud) Handlers
  // --------------------------------------------------------------------------

  const handleToggleReadAloud = () => {
    const textToRead = (body + (interimTranscript ? ' ' + interimTranscript : '')).trim();
    if (!textToRead) {
      setSpeechNotice({ text: 'Note is empty. Add or dictate some text to read aloud.', type: 'warn' });
      return;
    }

    if (ttsStatus === 'speaking') {
      pauseReading();
    } else if (ttsStatus === 'paused') {
      resumeReading();
    } else {
      // Start reading
      setShowTtsControls(true);
      const res = readNote({
        text: textToRead,
        lang: speechLanguage,
        rate: ttsSpeed,
        voiceURI: selectedVoiceURI,
        onStatusChange: (newStatus) => {
          setTtsStatus(newStatus);
        },
        onError: (err) => {
          setSpeechNotice({ text: err, type: 'error' });
          setTtsStatus('idle');
        },
      });

      if (!res.ok) {
        setSpeechNotice({ text: res.error || 'Failed to read aloud', type: 'error' });
      }
    }
  };

  const handleStopReadAloud = () => {
    stopReading();
    setTtsStatus('idle');
  };

  const handleChangeSpeed = (newSpeed: number) => {
    setTtsSpeed(newSpeed);
    if (ttsStatus === 'speaking' || ttsStatus === 'paused') {
      // Re-trigger with new speed from current note text
      const textToRead = body.trim();
      stopReading();
      readNote({
        text: textToRead,
        lang: speechLanguage,
        rate: newSpeed,
        voiceURI: selectedVoiceURI,
        onStatusChange: setTtsStatus,
      });
    }
  };

  // --------------------------------------------------------------------------
  // AI Feature Handlers (with Preview & Confirmation)
  // --------------------------------------------------------------------------

  const handleCleanUp = async () => {
    if (!body.trim()) return;
    setAiProcessingMode('cleanup');
    try {
      const original = body;
      const suggested = await cleanUpNoteWithAI(body);
      setOriginalDraftBeforeAI(original);
      setAiPreviewData({
        mode: 'cleanup',
        original,
        suggested,
      });
    } catch {
      setSpeechNotice({ text: 'Could not clean up note right now.', type: 'warn' });
    } finally {
      setAiProcessingMode(null);
    }
  };

  const handleSummarize = async () => {
    if (!body.trim()) return;
    setAiProcessingMode('summarize');
    try {
      const original = body;
      const suggested = await summarizeNoteWithAI(body);
      setOriginalDraftBeforeAI(original);
      setAiPreviewData({
        mode: 'summarize',
        original,
        suggested,
      });
    } catch {
      setSpeechNotice({ text: 'Could not summarize note right now.', type: 'warn' });
    } finally {
      setAiProcessingMode(null);
    }
  };

  const handleTranslate = async (targetLangName: string) => {
    if (!body.trim()) return;
    setAiProcessingMode('translate');
    try {
      const original = body;
      const suggested = await translateNoteWithAI(body, targetLangName);
      setOriginalDraftBeforeAI(original);
      setAiPreviewData({
        mode: 'translate',
        original,
        suggested,
      });
    } catch {
      setSpeechNotice({ text: `Could not translate note to ${targetLangName}.`, type: 'warn' });
    } finally {
      setAiProcessingMode(null);
    }
  };

  const handleExtractTasks = async () => {
    if (!body.trim()) return;
    setAiProcessingMode('extract');
    try {
      const items = await extractActionItemsFromNotesWithAI(body);
      setExtractedTasks(items);
    } catch {
      setSpeechNotice({ text: 'Failed to extract tasks from note.', type: 'warn' });
    } finally {
      setAiProcessingMode(null);
    }
  };

  const handleApplyPreview = (action: 'replace' | 'append') => {
    if (!aiPreviewData) return;
    if (action === 'replace') {
      setBody(aiPreviewData.suggested);
    } else {
      setBody((prev) => `${prev}\n\n--- AI Output ---\n${aiPreviewData.suggested}`);
    }
    setAiPreviewData(null);
  };

  const handleDiscardPreview = () => {
    setAiPreviewData(null);
  };

  const handleCreateExtractedTask = (item: ExtractedActionItem) => {
    addTask({
      title: item.title,
      notes: `Extracted from note: "${item.originalText}"`,
      priority: item.priority || 'Med',
      estimateMin: 30,
      due: item.explicitDeadline || 'Today',
      time: item.time || '11:00 AM',
      tags: ['Voice Note'],
      reminderEnabled: true,
    });
    // Remove from active extracted list
    setExtractedTasks((prev) => (prev ? prev.filter((t) => t.id !== item.id) : null));
    setSpeechNotice({ text: `Created task: "${item.title}"`, type: 'info' });
  };

  // --------------------------------------------------------------------------
  // Save & Dismiss Handlers
  // --------------------------------------------------------------------------

  const handleSave = () => {
    const fullText = (body + (interimTranscript ? ' ' + interimTranscript : '')).trim();
    if (!title.trim() && !fullText) {
      onClose();
      return;
    }

    // Stop ongoing processes
    handleStopDictation();
    stopReading();

    addNote(title.trim() || 'Quick Voice Note', fullText);
    setTitle('');
    setBody('');
    setInterimTranscript('');
    onClose();
  };

  const handleModalClose = () => {
    handleStopDictation();
    stopReading();
    onClose();
  };

  if (!visible) return null;

  const currentLangObj =
    SUPPORTED_SPEECH_LANGUAGES.find((l) => l.code === speechLanguage) ||
    SUPPORTED_SPEECH_LANGUAGES[0];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleModalClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Top Header */}
        <View style={[styles.header, { borderBottomColor: colors.borderLight, borderBottomWidth: 1 }]}>
          <TouchableOpacity onPress={handleModalClose} style={styles.closeBtn} activeOpacity={0.7}>
            <Ionicons name="close" size={24} color={colors.textPrimary} />
          </TouchableOpacity>

          <View style={styles.headerTitleContainer}>
            <Text style={[styles.headerTitle, { color: colors.textPrimary, fontWeight: typography.weights.bold }]}>
              {translate(profile.language, 'actionQuickNote')}
            </Text>
            <Text style={[styles.headerSubtitle, { color: colors.textTertiary }]}>
              Dictate or type • On-device audio
            </Text>
          </View>

          <TouchableOpacity onPress={handleSave} style={styles.saveBtn} activeOpacity={0.8}>
            <Text style={{ color: colors.primary, fontWeight: typography.weights.bold, fontSize: 16 }}>
              {translate(profile.language, 'save')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Status / Alert Notices */}
        {speechNotice && (
          <View
            style={[
              styles.noticeBar,
              {
                backgroundColor:
                  speechNotice.type === 'error'
                    ? '#FEE2E2'
                    : speechNotice.type === 'warn'
                    ? '#FEF3C7'
                    : '#E0F2FE',
                borderColor:
                  speechNotice.type === 'error'
                    ? '#FCA5A5'
                    : speechNotice.type === 'warn'
                    ? '#FCD34D'
                    : '#BAE6FD',
              },
            ]}
          >
            <Ionicons
              name={
                speechNotice.type === 'error'
                  ? 'alert-circle'
                  : speechNotice.type === 'warn'
                  ? 'warning-outline'
                  : 'information-circle-outline'
              }
              size={16}
              color={
                speechNotice.type === 'error'
                  ? '#991B1B'
                  : speechNotice.type === 'warn'
                  ? '#92400E'
                  : '#0369A1'
              }
            />
            <Text
              style={[
                styles.noticeText,
                {
                  color:
                    speechNotice.type === 'error'
                      ? '#991B1B'
                      : speechNotice.type === 'warn'
                      ? '#92400E'
                      : '#0369A1',
                },
              ]}
            >
              {speechNotice.text}
            </Text>
            <TouchableOpacity onPress={() => setSpeechNotice(null)} style={{ padding: 2 }}>
              <Ionicons name="close" size={14} color="#64748B" />
            </TouchableOpacity>
          </View>
        )}

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Note Title */}
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Quick Note Title (e.g. CS301 Lecture Ideas)..."
            placeholderTextColor={colors.textTertiary}
            style={[
              styles.titleInput,
              {
                color: colors.textPrimary,
                borderBottomColor: colors.borderLight,
                borderBottomWidth: 1,
              },
            ]}
          />

          {/* Active Dictation "Listening..." Banner */}
          {isListening && (
            <View
              style={[
                styles.listeningBanner,
                {
                  backgroundColor: '#FEF2F2',
                  borderColor: '#F87171',
                },
              ]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                  <View style={styles.recordingDot} />
                </Animated.View>
                <View>
                  <Text style={styles.listeningTitle}>Listening...</Text>
                  <Text style={styles.listeningSubtitle}>
                    Speak clearly in {currentLangObj.name}. Tap Stop when finished.
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={handleStopDictation}
                activeOpacity={0.8}
                style={styles.stopDictationBtn}
              >
                <Ionicons name="stop" size={14} color="#FFFFFF" />
                <Text style={styles.stopDictationBtnText}>Stop</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Text Editor with live interim speech preview */}
          <View
            style={[
              styles.editorCard,
              {
                backgroundColor: colors.surface,
                borderColor: isListening ? '#EF4444' : colors.border,
              },
            ]}
          >
            <TextInput
              multiline
              value={body}
              onChangeText={setBody}
              placeholder="Type your note or tap 'Dictate' below to transcribe your voice…"
              placeholderTextColor={colors.textTertiary}
              style={[styles.bodyInput, { color: colors.textPrimary }]}
            />

            {/* Interim Transcript preview without duplicating into body */}
            {interimTranscript.length > 0 && (
              <View style={styles.interimBox}>
                <Ionicons name="radio-outline" size={14} color="#EF4444" />
                <Text style={styles.interimText}>
                  {interimTranscript}
                </Text>
              </View>
            )}
          </View>

          {/* Core Dictate & Read Aloud Action Row */}
          <View style={styles.voiceControlsRow}>
            {/* 🎤 Dictate Button */}
            <TouchableOpacity
              onPress={toggleDictation}
              activeOpacity={0.85}
              style={[
                styles.primaryVoiceBtn,
                {
                  backgroundColor: isListening ? '#DC2626' : colors.primarySurface,
                  borderColor: isListening ? '#B91C1C' : colors.primaryLight,
                },
              ]}
            >
              <Animated.View style={isListening ? { transform: [{ scale: pulseAnim }] } : {}}>
                <Ionicons
                  name={isListening ? 'stop-circle' : 'mic'}
                  size={20}
                  color={isListening ? '#FFFFFF' : colors.primaryLight}
                />
              </Animated.View>
              <Text
                style={[
                  styles.primaryVoiceBtnText,
                  { color: isListening ? '#FFFFFF' : colors.primaryLight },
                ]}
              >
                {isListening ? 'Stop Dictating' : '🎤 Dictate'}
              </Text>
            </TouchableOpacity>

            {/* 🔊 Read Aloud Button */}
            <TouchableOpacity
              onPress={handleToggleReadAloud}
              activeOpacity={0.85}
              style={[
                styles.primaryVoiceBtn,
                {
                  backgroundColor: ttsStatus === 'speaking' ? '#059669' : colors.surfaceSecondary,
                  borderColor: ttsStatus === 'speaking' ? '#047857' : colors.border,
                },
              ]}
            >
              <Animated.View style={ttsStatus === 'speaking' ? { transform: [{ scale: pulseAnim }] } : {}}>
                <Ionicons
                  name={
                    ttsStatus === 'speaking'
                      ? 'pause'
                      : ttsStatus === 'paused'
                      ? 'play'
                      : 'volume-high-outline'
                  }
                  size={20}
                  color={ttsStatus === 'speaking' ? '#FFFFFF' : colors.textPrimary}
                />
              </Animated.View>
              <Text
                style={[
                  styles.primaryVoiceBtnText,
                  { color: ttsStatus === 'speaking' ? '#FFFFFF' : colors.textPrimary },
                ]}
              >
                {ttsStatus === 'speaking'
                  ? 'Pause'
                  : ttsStatus === 'paused'
                  ? 'Resume'
                  : '🔊 Read Aloud'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Text-to-Speech Detailed Controls & Speaking Indicator */}
          {(showTtsControls || ttsStatus !== 'idle') && (
            <View
              style={[
                styles.ttsPanel,
                {
                  backgroundColor: colors.surfaceSecondary,
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={styles.ttsHeaderRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons
                    name="volume-medium"
                    size={18}
                    color={ttsStatus === 'speaking' ? '#059669' : colors.textSecondary}
                  />
                  <Text style={[styles.ttsLabel, { color: colors.textPrimary }]}>
                    Speech Playback: {ttsStatus === 'speaking' ? 'Speaking...' : ttsStatus === 'paused' ? 'Paused' : 'Ready'}
                  </Text>
                </View>

                {ttsStatus !== 'idle' && (
                  <TouchableOpacity
                    onPress={handleStopReadAloud}
                    style={styles.ttsStopPill}
                    activeOpacity={0.75}
                  >
                    <Ionicons name="square" size={11} color="#DC2626" />
                    <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#DC2626' }}>Stop</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Speed Pills */}
              <View style={styles.speedRow}>
                <Text style={[styles.speedLabel, { color: colors.textSecondary }]}>Speed:</Text>
                {[0.75, 1.0, 1.25, 1.5, 2.0].map((rate) => {
                  const isSelected = ttsSpeed === rate;
                  return (
                    <TouchableOpacity
                      key={rate}
                      onPress={() => handleChangeSpeed(rate)}
                      style={[
                        styles.speedPill,
                        {
                          backgroundColor: isSelected ? colors.primaryLight : colors.surface,
                          borderColor: isSelected ? colors.primaryLight : colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.speedPillText,
                          { color: isSelected ? '#FFFFFF' : colors.textSecondary },
                        ]}
                      >
                        {rate}x
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Language Selector Bar */}
          <View
            style={[
              styles.languageRow,
              {
                backgroundColor: colors.surfaceSecondary,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ fontSize: 14 }}>{currentLangObj.flag}</Text>
              <Text style={[styles.langLabel, { color: colors.textSecondary }]}>
                Language: <Text style={{ fontWeight: '700', color: colors.textPrimary }}>{currentLangObj.name}</Text>
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => setShowLanguagePicker(!showLanguagePicker)}
              activeOpacity={0.7}
              style={styles.changeLangBtn}
            >
              <Text style={{ fontSize: 12, fontWeight: '600', color: colors.primaryLight }}>
                {showLanguagePicker ? 'Close' : 'Change'}
              </Text>
              <Ionicons
                name={showLanguagePicker ? 'chevron-up' : 'chevron-down'}
                size={14}
                color={colors.primaryLight}
              />
            </TouchableOpacity>
          </View>

          {/* Language selection pills */}
          {showLanguagePicker && (
            <View style={[styles.langPickerContainer, { borderColor: colors.border }]}>
              {SUPPORTED_SPEECH_LANGUAGES.map((lang) => {
                const isSelected = speechLanguage === lang.code;
                return (
                  <TouchableOpacity
                    key={lang.code}
                    onPress={() => {
                      setSpeechLanguage(lang.code);
                      setShowLanguagePicker(false);
                      if (isListening) {
                        handleStopDictation();
                      }
                    }}
                    style={[
                      styles.langItem,
                      {
                        backgroundColor: isSelected ? `${colors.primaryLight}20` : 'transparent',
                      },
                    ]}
                  >
                    <Text style={{ fontSize: 16, marginRight: 8 }}>{lang.flag}</Text>
                    <Text
                      style={[
                        styles.langItemText,
                        {
                          color: isSelected ? colors.primaryLight : colors.textPrimary,
                          fontWeight: isSelected ? '700' : '500',
                        },
                      ]}
                    >
                      {lang.name} ({lang.code})
                    </Text>
                    {isSelected && (
                      <Ionicons name="checkmark" size={16} color={colors.primaryLight} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Optional AI Actions Toolbar */}
          <View style={styles.aiToolbarContainer}>
            <View style={styles.aiToolbarHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="sparkles" size={15} color="#8B5CF6" />
                <Text style={[styles.aiToolbarTitle, { color: colors.textPrimary }]}>
                  AI Note Enhancements
                </Text>
              </View>
              <Text style={[styles.aiToolbarNote, { color: colors.textTertiary }]}>
                Preview before applying
              </Text>
            </View>

            <View style={styles.aiActionsRow}>
              {/* Clean up note */}
              <TouchableOpacity
                onPress={handleCleanUp}
                disabled={aiProcessingMode !== null || !body.trim()}
                activeOpacity={0.8}
                style={[
                  styles.aiActionBtn,
                  {
                    backgroundColor: colors.surface,
                    borderColor: '#DDD6FE',
                    opacity: !body.trim() ? 0.5 : 1,
                  },
                ]}
              >
                {aiProcessingMode === 'cleanup' ? (
                  <ActivityIndicator size="small" color="#7C3AED" />
                ) : (
                  <>
                    <Ionicons name="sparkles-outline" size={14} color="#7C3AED" />
                    <Text style={[styles.aiActionBtnText, { color: '#7C3AED' }]}>
                      Clean up
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Summarize */}
              <TouchableOpacity
                onPress={handleSummarize}
                disabled={aiProcessingMode !== null || !body.trim()}
                activeOpacity={0.8}
                style={[
                  styles.aiActionBtn,
                  {
                    backgroundColor: colors.surface,
                    borderColor: '#BAE6FD',
                    opacity: !body.trim() ? 0.5 : 1,
                  },
                ]}
              >
                {aiProcessingMode === 'summarize' ? (
                  <ActivityIndicator size="small" color="#0284C7" />
                ) : (
                  <>
                    <Ionicons name="list-outline" size={14} color="#0284C7" />
                    <Text style={[styles.aiActionBtnText, { color: '#0284C7' }]}>
                      Summarize
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Extract Tasks */}
              <TouchableOpacity
                onPress={handleExtractTasks}
                disabled={aiProcessingMode !== null || !body.trim()}
                activeOpacity={0.8}
                style={[
                  styles.aiActionBtn,
                  {
                    backgroundColor: colors.surface,
                    borderColor: '#BBF7D0',
                    opacity: !body.trim() ? 0.5 : 1,
                  },
                ]}
              >
                {aiProcessingMode === 'extract' ? (
                  <ActivityIndicator size="small" color="#16A34A" />
                ) : (
                  <>
                    <Ionicons name="checkbox-outline" size={14} color="#16A34A" />
                    <Text style={[styles.aiActionBtnText, { color: '#16A34A' }]}>
                      Extract Tasks
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Translate */}
              <TouchableOpacity
                onPress={() => handleTranslate(currentLangObj.name)}
                disabled={aiProcessingMode !== null || !body.trim()}
                activeOpacity={0.8}
                style={[
                  styles.aiActionBtn,
                  {
                    backgroundColor: colors.surface,
                    borderColor: '#FED7AA',
                    opacity: !body.trim() ? 0.5 : 1,
                  },
                ]}
              >
                {aiProcessingMode === 'translate' ? (
                  <ActivityIndicator size="small" color="#EA580C" />
                ) : (
                  <>
                    <Ionicons name="language-outline" size={14} color="#EA580C" />
                    <Text style={[styles.aiActionBtnText, { color: '#EA580C' }]}>
                      Translate
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* AI Result Preview & Confirmation Modal/Card */}
          {aiPreviewData && (
            <View
              style={[
                styles.previewCard,
                {
                  backgroundColor: '#F8FAFC',
                  borderColor: '#CBD5E1',
                },
              ]}
            >
              <View style={styles.previewHeaderRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name="eye-outline" size={16} color="#475569" />
                  <Text style={styles.previewTitle}>
                    AI {aiPreviewData.mode === 'cleanup' ? 'Clean Up' : aiPreviewData.mode === 'summarize' ? 'Summary' : 'Translation'} Preview
                  </Text>
                </View>
                <Text style={styles.previewSubtitle}>Review before applying</Text>
              </View>

              <Text style={styles.previewBody}>
                {aiPreviewData.suggested}
              </Text>

              {/* Action Choices */}
              <View style={styles.previewActionRow}>
                <TouchableOpacity
                  onPress={() => handleApplyPreview('replace')}
                  style={[styles.previewConfirmBtn, { backgroundColor: colors.primary }]}
                  activeOpacity={0.85}
                >
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                  <Text style={styles.previewConfirmText}>Replace Note</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleApplyPreview('append')}
                  style={[styles.previewAppendBtn, { borderColor: colors.border }]}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.previewAppendText, { color: colors.textPrimary }]}>
                    Append to Note
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleDiscardPreview}
                  style={styles.previewDiscardBtn}
                  activeOpacity={0.7}
                >
                  <Text style={{ fontSize: 12, color: '#64748B' }}>Discard</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Extracted Tasks Suggestions Card */}
          {extractedTasks && extractedTasks.length > 0 && (
            <View style={styles.extractedCard}>
              <View style={styles.extractedHeader}>
                <Ionicons name="checkbox-outline" size={16} color="#16A34A" />
                <Text style={styles.extractedTitle}>
                  Found {extractedTasks.length} action items in your note
                </Text>
              </View>
              {extractedTasks.map((task) => (
                <View key={task.id} style={styles.extractedItem}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.extractedItemTitle}>{task.title}</Text>
                    <Text style={styles.extractedItemQuote}>"{task.originalText}"</Text>
                    <Text style={styles.extractedItemMeta}>
                      Priority: {task.priority} • Due: {task.explicitDeadline || 'Today'}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleCreateExtractedTask(task)}
                    style={styles.extractedItemAddBtn}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="add" size={14} color="#FFFFFF" />
                    <Text style={styles.extractedItemAddText}>Add Task</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Privacy Footnote */}
          <View style={styles.privacyFootnote}>
            <Ionicons name="shield-checkmark-outline" size={14} color="#94A3B8" />
            <Text style={styles.privacyFootnoteText}>
              Voice recognition runs locally in your browser. No audio recordings leave your device.
            </Text>
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
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
  },
  headerSubtitle: {
    fontSize: 11,
    marginTop: 1,
  },
  saveBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  noticeBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  noticeText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  titleInput: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingVertical: 8,
    marginBottom: 12,
  },
  listeningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#EF4444',
  },
  listeningTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#991B1B',
  },
  listeningSubtitle: {
    fontSize: 11,
    color: '#B91C1C',
  },
  stopDictationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DC2626',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  stopDictationBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  editorCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    minHeight: 180,
    marginBottom: 14,
  },
  bodyInput: {
    fontSize: 15,
    lineHeight: 22,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  interimBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  interimText: {
    fontSize: 14,
    color: '#64748B',
    fontStyle: 'italic',
  },
  voiceControlsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  primaryVoiceBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  primaryVoiceBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  ttsPanel: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  ttsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  ttsLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  ttsStopPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  speedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  speedLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginRight: 4,
  },
  speedPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  speedPillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  languageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12,
  },
  langLabel: {
    fontSize: 12,
  },
  changeLangBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  langPickerContainer: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 6,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  langItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  langItemText: {
    flex: 1,
    fontSize: 13,
  },
  aiToolbarContainer: {
    marginBottom: 14,
  },
  aiToolbarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  aiToolbarTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  aiToolbarNote: {
    fontSize: 11,
  },
  aiActionsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  aiActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  aiActionBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  previewCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  previewHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  previewTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  previewSubtitle: {
    fontSize: 11,
    color: '#64748B',
  },
  previewBody: {
    fontSize: 13,
    lineHeight: 19,
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  previewActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  previewConfirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  previewConfirmText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  previewAppendBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
  },
  previewAppendText: {
    fontSize: 12,
    fontWeight: '600',
  },
  previewDiscardBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  extractedCard: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#DCFCE7',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  extractedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  extractedTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#166534',
  },
  extractedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 6,
  },
  extractedItemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  extractedItemQuote: {
    fontSize: 11,
    color: '#64748B',
    fontStyle: 'italic',
    marginTop: 2,
  },
  extractedItemMeta: {
    fontSize: 10,
    color: '#166534',
    marginTop: 2,
  },
  extractedItemAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#16A34A',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
  },
  extractedItemAddText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 11,
  },
  privacyFootnote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingHorizontal: 4,
  },
  privacyFootnoteText: {
    fontSize: 11,
    color: '#94A3B8',
    flex: 1,
  },
});
