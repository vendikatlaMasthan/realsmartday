// SmartDay Interactive Voice Capture Modal
// Audio waveform visualizer with real-time speech-to-text simulation and instant conversion to task or note

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface VoiceCaptureModalProps {
  visible: boolean;
  onClose: () => void;
  onSaveAsTask: (title: string) => void;
  onSaveAsNote: (title: string, body: string) => void;
}

export const VoiceCaptureModal: React.FC<VoiceCaptureModalProps> = ({
  visible,
  onClose,
  onSaveAsTask,
  onSaveAsNote,
}) => {
  const [isRecording, setIsRecording] = useState(true);
  const [transcript, setTranscript] = useState('');
  const [timerSeconds, setTimerSeconds] = useState(0);

  // Animated bars for soundwave
  const barAnims = useRef(Array.from({ length: 9 }, () => new Animated.Value(0.3))).current;

  // Waveform loop
  useEffect(() => {
    let animLoop: Animated.CompositeAnimation | null = null;
    if (visible && isRecording) {
      const animations = barAnims.map((anim, idx) =>
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: 0.2 + ((idx * 17) % 8) / 10,
              duration: 150 + (idx % 3) * 60,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0.9 - ((idx * 13) % 5) / 10,
              duration: 200 + (idx % 4) * 50,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0.3,
              duration: 180,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ])
        )
      );
      animLoop = Animated.parallel(animations);
      animLoop.start();
    } else {
      barAnims.forEach((anim) => anim.setValue(0.25));
    }

    return () => {
      if (animLoop) animLoop.stop();
    };
  }, [visible, isRecording]);

  // Simulation speech-to-text text typewriter
  useEffect(() => {
    if (!visible) {
      setTranscript('');
      setTimerSeconds(0);
      setIsRecording(true);
      return;
    }

    const sampleTranscripts = [
      'Prepare DBMS Normalization assignment and review BCNF notes before 6:00 PM',
      'Meeting with Professor at 3:00 PM in Faculty Block to review thesis draft',
      'Revise Operating Systems virtual memory paging lab questions tonight',
    ];
    const picked = sampleTranscripts[Math.floor(Math.random() * sampleTranscripts.length)];

    let currentLength = 0;
    const typingInterval = setInterval(() => {
      if (currentLength < picked.length) {
        currentLength += 3;
        setTranscript(picked.substring(0, currentLength));
      } else {
        clearInterval(typingInterval);
      }
    }, 80);

    const timerInterval = setInterval(() => {
      setTimerSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      clearInterval(typingInterval);
      clearInterval(timerInterval);
    };
  }, [visible]);

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  const handleSaveTask = () => {
    if (transcript.trim()) {
      onSaveAsTask(transcript.trim());
      onClose();
    }
  };

  const handleSaveNote = () => {
    if (transcript.trim()) {
      onSaveAsNote('Voice Memo: ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), transcript.trim());
      onClose();
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />

        <View style={styles.dialogCard}>
          {/* Top close */}
          <View style={styles.topRow}>
            <View style={styles.recBadge}>
              <View style={[styles.recDot, { backgroundColor: isRecording ? '#EF4444' : '#94A3B8' }]} />
              <Text style={styles.recText}>{isRecording ? 'RECORDING' : 'PAUSED'} · {formatTime(timerSeconds)}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Sound wave visualizer */}
          <View style={styles.waveContainer}>
            {barAnims.map((anim, idx) => (
              <Animated.View
                key={idx}
                style={[
                  styles.waveBar,
                  {
                    transform: [{ scaleY: anim }],
                    backgroundColor: isRecording ? (idx % 2 === 0 ? '#059669' : '#10B981') : '#CBD5E1',
                  },
                ]}
              />
            ))}
          </View>

          {/* Mic Toggle Button */}
          <TouchableOpacity
            style={[styles.micBtn, isRecording && styles.micBtnActive]}
            onPress={toggleRecording}
            activeOpacity={0.8}
          >
            <Ionicons name={isRecording ? 'pause' : 'mic'} size={28} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.micHint}>{isRecording ? 'Listening... Tap to pause' : 'Paused. Tap to resume'}</Text>

          {/* Live Transcript Box */}
          <Text style={styles.transcriptLabel}>Live Speech Transcription</Text>
          <View style={styles.transcriptBox}>
            <TextInput
              style={styles.transcriptInput}
              value={transcript}
              onChangeText={setTranscript}
              placeholder="Speak to transcribe in real time..."
              placeholderTextColor="#94A3B8"
              multiline
            />
          </View>

          {/* Save Action Buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.taskBtn, !transcript.trim() && styles.btnDisabled]}
              onPress={handleSaveTask}
              disabled={!transcript.trim()}
            >
              <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
              <Text style={styles.actionBtnText}>Save as Task</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.noteBtn, !transcript.trim() && styles.btnDisabled]}
              onPress={handleSaveNote}
              disabled={!transcript.trim()}
            >
              <Ionicons name="document-text" size={18} color="#FFFFFF" />
              <Text style={styles.actionBtnText}>Save as Note</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  dialogCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: '100%',
    maxWidth: 420,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
  },
  recBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
    gap: 6,
  },
  recDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  recText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  closeBtn: {
    padding: 4,
  },
  waveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    gap: 6,
    marginVertical: 12,
  },
  waveBar: {
    width: 4,
    height: 48,
    borderRadius: 2,
  },
  micBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#64748B',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  micBtnActive: {
    backgroundColor: '#059669',
  },
  micHint: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 8,
    marginBottom: 16,
  },
  transcriptLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  transcriptBox: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 12,
    minHeight: 76,
    marginBottom: 20,
  },
  transcriptInput: {
    fontSize: 14,
    color: '#0F172A',
    lineHeight: 20,
  },
  actionRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
  },
  taskBtn: {
    backgroundColor: '#059669',
  },
  noteBtn: {
    backgroundColor: '#7C3AED',
  },
  btnDisabled: {
    opacity: 0.5,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});
