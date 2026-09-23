// SmartDay Note Reader & Editor Modal
// Comprehensive academic and study notes viewer with:
// 1. Text-to-Speech "Read Aloud" with Play, Pause, Resume, Stop, adjustable speed & speaking indicator
// 2. Voice-to-Text Dictation with mic button, listening indicator, stop button & language support
// 3. AI Note Cleanup and Summarization

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Note } from '../../types';
import {
  readNote,
  pauseReading,
  resumeReading,
  stopReading,
  TTSStatus,
  getSpeechRecognition,
} from '../../services/speechService';
import { cleanUpNoteWithAI, summarizeNoteWithAI } from '../../services/aiService';

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
- No transitive dependency: non-prime attributes must not determine other non-prime attributes.

• BCNF (Boyce-Codd Normal Form):
- For every functional dependency X -> Y, X must be a super key.`
  );

  // Text-to-Speech state
  const [ttsStatus, setTtsStatus] = useState<TTSStatus>('idle');
  const [readingSpeed, setReadingSpeed] = useState<number>(1.0);

  // Dictation state
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');

  // AI State
  const [aiPreview, setAiPreview] = useState<string | null>(null);

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

  // Sync state on open
  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setBody(note.body);
    }
    setIsEditing(false);
    setAiPreview(null);
    if (!visible) {
      stopReading();
      setTtsStatus('idle');
      handleStopDictation();
    }
  }, [note, visible]);

  // --------------------------------------------------------------------------
  // TTS Handlers
  // --------------------------------------------------------------------------
  const handleToggleReadAloud = () => {
    // Stop dictation if running
    handleStopDictation();

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

    const textToRead = `${title}. ${body}`.trim();
    if (!textToRead) return;

    readNote({
      text: textToRead,
      rate: readingSpeed,
      onStatusChange: (status) => setTtsStatus(status),
    });
  };

  const handleStopReading = () => {
    stopReading();
    setTtsStatus('idle');
  };

  const handleChangeSpeed = (newSpeed: number) => {
    setReadingSpeed(newSpeed);
    if (ttsStatus === 'speaking' || ttsStatus === 'paused') {
      stopReading();
      readNote({
        text: `${title}. ${body}`.trim(),
        rate: newSpeed,
        onStatusChange: (status) => setTtsStatus(status),
      });
    }
  };

  // --------------------------------------------------------------------------
  // Dictation Handlers
  // --------------------------------------------------------------------------
  const handleStartDictation = async () => {
    handleStopReading();
    const controller = getSpeechRecognition();

    const ok = await controller.start({
      onFinalResult: (finalText) => {
        setBody((prev) => {
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
      setBody((prev) => {
        const trimmed = prev.trim();
        if (!trimmed) return interimTranscript.trim();
        return `${trimmed} ${interimTranscript.trim()}`;
      });
      setInterimTranscript('');
    }
  };

  // --------------------------------------------------------------------------
  // AI Actions
  // --------------------------------------------------------------------------
  const handleCleanUp = async () => {
    if (!body.trim()) return;
    const res = await cleanUpNoteWithAI(body);
    setAiPreview(res);
  };

  const handleSummarize = async () => {
    if (!body.trim()) return;
    const res = await summarizeNoteWithAI(body);
    setAiPreview(res);
  };

  const handleSave = () => {
    handleStopDictation();
    handleStopReading();
    if (note && onSaveNote) {
      onSaveNote(note.id, title, body);
    }
    setIsEditing(false);
  };

  const handleClose = () => {
    handleStopReading();
    handleStopDictation();
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={handleClose} />

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
              {/* Read Aloud Icon Button */}
              <TouchableOpacity
                onPress={handleToggleReadAloud}
                style={[
                  styles.audioTopBtn,
                  {
                    backgroundColor: ttsStatus === 'speaking' ? '#059669' : '#ECFDF5',
                  },
                ]}
              >
                <Ionicons
                  name={
                    ttsStatus === 'speaking'
                      ? 'pause'
                      : ttsStatus === 'paused'
                      ? 'play'
                      : 'volume-high-outline'
                  }
                  size={16}
                  color={ttsStatus === 'speaking' ? '#FFFFFF' : '#059669'}
                />
                <Text
                  style={[
                    styles.audioTopBtnText,
                    { color: ttsStatus === 'speaking' ? '#FFFFFF' : '#059669' },
                  ]}
                >
                  {ttsStatus === 'speaking' ? 'Pause' : ttsStatus === 'paused' ? 'Resume' : 'Read'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => (isEditing ? handleSave() : setIsEditing(true))}
                style={styles.editBtn}
              >
                <Ionicons name={isEditing ? 'checkmark' : 'pencil'} size={18} color="#059669" />
                <Text style={styles.editBtnText}>{isEditing ? 'Save' : 'Edit'}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Text-to-Speech Player Bar (Visible when active or listening) */}
          {ttsStatus !== 'idle' && (
            <View style={styles.ttsBar}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Animated.View style={ttsStatus === 'speaking' ? { transform: [{ scale: pulseAnim }] } : {}}>
                  <Ionicons name="volume-high" size={16} color="#059669" />
                </Animated.View>
                <Text style={styles.ttsBarLabel}>
                  {ttsStatus === 'speaking' ? 'Reading aloud...' : 'Reading paused'}
                </Text>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                {[0.75, 1.0, 1.25, 1.5].map((spd) => (
                  <TouchableOpacity
                    key={spd}
                    onPress={() => handleChangeSpeed(spd)}
                    style={[
                      styles.speedPill,
                      readingSpeed === spd && { backgroundColor: '#059669', borderColor: '#059669' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.speedPillText,
                        readingSpeed === spd && { color: '#FFFFFF' },
                      ]}
                    >
                      {spd}x
                    </Text>
                  </TouchableOpacity>
                ))}

                <TouchableOpacity onPress={handleStopReading} style={styles.ttsBarStopBtn}>
                  <Ionicons name="stop" size={12} color="#DC2626" />
                  <Text style={{ fontSize: 11, fontWeight: '700', color: '#DC2626' }}>Stop</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

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

                {/* Voice-to-Text Dictation Row */}
                <View style={styles.dictateRow}>
                  <TouchableOpacity
                    onPress={isListening ? handleStopDictation : handleStartDictation}
                    style={[
                      styles.dictateBtn,
                      { backgroundColor: isListening ? '#DC2626' : '#EFF6FF' },
                    ]}
                  >
                    <Animated.View style={isListening ? { transform: [{ scale: pulseAnim }] } : {}}>
                      <Ionicons
                        name={isListening ? 'stop-circle' : 'mic'}
                        size={16}
                        color={isListening ? '#FFFFFF' : '#2563EB'}
                      />
                    </Animated.View>
                    <Text
                      style={[
                        styles.dictateBtnText,
                        { color: isListening ? '#FFFFFF' : '#2563EB' },
                      ]}
                    >
                      {isListening ? 'Stop' : '🎤 Dictate'}
                    </Text>
                  </TouchableOpacity>
                  <Text style={{ fontSize: 11, color: '#64748B', flex: 1 }}>
                    {isListening ? 'Listening... speech appends without overwriting' : 'Tap to dictate with microphone'}
                  </Text>
                </View>

                {interimTranscript.length > 0 && (
                  <View style={styles.interimBox}>
                    <Ionicons name="radio-outline" size={13} color="#DC2626" />
                    <Text style={styles.interimText}>{interimTranscript}</Text>
                  </View>
                )}

                <Text style={styles.label}>Notes Content</Text>
                <TextInput
                  style={styles.bodyInput}
                  value={body}
                  onChangeText={setBody}
                  multiline
                  placeholder="Write your notes here or dictate using the mic above..."
                />

                {/* Quick AI tools in edit mode */}
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                  <TouchableOpacity onPress={handleCleanUp} style={styles.aiBtn}>
                    <Ionicons name="sparkles-outline" size={13} color="#7C3AED" />
                    <Text style={{ fontSize: 11, fontWeight: '700', color: '#7C3AED' }}>Clean up</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleSummarize} style={styles.aiBtn}>
                    <Ionicons name="list-outline" size={13} color="#0284C7" />
                    <Text style={{ fontSize: 11, fontWeight: '700', color: '#0284C7' }}>Summarize</Text>
                  </TouchableOpacity>
                </View>
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

                {/* AI Preview Card if requested */}
                {aiPreview && (
                  <View style={styles.aiPreviewBox}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text style={{ fontSize: 12, fontWeight: '700', color: '#0F172A' }}>
                        AI Generated Output
                      </Text>
                      <TouchableOpacity onPress={() => setAiPreview(null)}>
                        <Ionicons name="close" size={16} color="#64748B" />
                      </TouchableOpacity>
                    </View>
                    <Text style={{ fontSize: 12, color: '#334155', lineHeight: 18 }}>{aiPreview}</Text>
                    <TouchableOpacity
                      onPress={() => {
                        setBody(aiPreview);
                        setAiPreview(null);
                      }}
                      style={styles.aiApplyBtn}
                    >
                      <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 11 }}>
                        Replace Note Content
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Read Aloud button in viewer mode */}
                <TouchableOpacity
                  onPress={handleToggleReadAloud}
                  style={[
                    styles.bigReadAloudBtn,
                    {
                      backgroundColor: ttsStatus === 'speaking' ? '#059669' : '#0F172A',
                    },
                  ]}
                  activeOpacity={0.85}
                >
                  <Ionicons
                    name={
                      ttsStatus === 'speaking'
                        ? 'pause'
                        : ttsStatus === 'paused'
                        ? 'play'
                        : 'volume-high'
                    }
                    size={18}
                    color="#FFFFFF"
                  />
                  <Text style={styles.bigReadAloudBtnText}>
                    {ttsStatus === 'speaking'
                      ? 'Pause Reading'
                      : ttsStatus === 'paused'
                      ? 'Resume Reading'
                      : '🔊 Read Note Aloud'}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.doneBtn} onPress={handleClose}>
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
  audioTopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 10,
  },
  audioTopBtnText: {
    fontSize: 12,
    fontWeight: '700',
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
  ttsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  ttsBarLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#166534',
  },
  speedPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
  },
  speedPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  ttsBarStopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
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
  dictateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    marginBottom: 6,
  },
  dictateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  dictateBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  interimBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 6,
    backgroundColor: '#FEF2F2',
    borderRadius: 6,
    marginBottom: 8,
  },
  interimText: {
    fontSize: 12,
    color: '#991B1B',
    fontStyle: 'italic',
  },
  bodyInput: {
    fontSize: 14,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    minHeight: 180,
    lineHeight: 22,
    textAlignVertical: 'top',
  },
  aiBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  aiPreviewBox: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginTop: 12,
  },
  aiApplyBtn: {
    backgroundColor: '#059669',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    marginTop: 8,
    alignSelf: 'flex-start',
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
  bigReadAloudBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 20,
  },
  bigReadAloudBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
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
