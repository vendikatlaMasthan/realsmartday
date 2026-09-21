// SmartDay Focus Session Player Sheet (Section 8 Spec)
// The ONLY focus player in the app. Full-screen modal.
// Duration picker (25 / 45 / 60 / custom), task attach, ambient UI, countdown ring,
// Pause / Skip / End, and completion prompt (log actual minutes, 1–5 quality rating, 1-line note).

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { translate } from '../../i18n';
import { useSmartDay } from '../../context/SmartDayContext';
import { Task } from '../../types';

interface FocusSessionModalProps {
  visible: boolean;
  onClose: () => void;
  initialTask?: Task;
}

export const FocusSessionModal: React.FC<FocusSessionModalProps> = ({
  visible,
  onClose,
  initialTask,
}) => {
  const { theme, isDark } = useTheme();
  const { colors, typography, borderRadius, spacing } = theme;
  const { tasks, endFocus, profile } = useSmartDay();

  // Mode: 'config' | 'running' | 'summary'
  const [mode, setMode] = useState<'config' | 'running' | 'summary'>('config');

  // Config options
  const [durationMinutes, setDurationMinutes] = useState<number>(25);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(initialTask);
  const [ambientSound, setAmbientSound] = useState<'none' | 'rain' | 'brown-noise'>('none');

  // Running state
  const [secondsRemaining, setSecondsRemaining] = useState<number>(durationMinutes * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  // Summary ratings
  const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5>(5);
  const [reflectionNote, setReflectionNote] = useState<string>('');

  // Sync initial task
  useEffect(() => {
    if (initialTask) {
      setSelectedTask(initialTask);
      if (initialTask.estimateMin) setDurationMinutes(initialTask.estimateMin);
    }
  }, [initialTask]);

  // Countdown timer
  useEffect(() => {
    let interval: any = null;
    if (mode === 'running' && isRunning && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else if (secondsRemaining === 0 && mode === 'running') {
      setIsRunning(false);
      setMode('summary');
    }
    return () => clearInterval(interval);
  }, [mode, isRunning, secondsRemaining]);

  const handleStart = () => {
    setSecondsRemaining(durationMinutes * 60);
    setElapsedSeconds(0);
    setIsRunning(true);
    setMode('running');
  };

  const handlePauseResume = () => {
    setIsRunning((prev) => !prev);
  };

  const handleEarlyEnd = () => {
    setIsRunning(false);
    setMode('summary');
  };

  const handleSaveSummary = () => {
    const loggedMin = Math.max(1, Math.round(elapsedSeconds / 60));
    endFocus(loggedMin, rating, reflectionNote);
    // Reset state & close
    setMode('config');
    setReflectionNote('');
    onClose();
  };

  const formatTimer = (totalSeconds: number): string => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const ringProgress = durationMinutes > 0 ? (durationMinutes * 60 - secondsRemaining) / (durationMinutes * 60) : 0;

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Top Header */}
        <View style={[styles.header, { borderBottomColor: colors.borderLight, borderBottomWidth: 1 }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
            <Ionicons name="close" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary, fontWeight: typography.weights.bold }]}>
            {translate(profile.language, 'categoryFocus')}
          </Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* STEP 1: CONFIG MODE */}
          {mode === 'config' && (
            <View style={styles.configContainer}>
              <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
                {translate(profile.language, 'focusDuration')}
              </Text>
              <View style={styles.durationRow}>
                {[25, 45, 60, 90].map((mins) => (
                  <TouchableOpacity
                    key={mins}
                    onPress={() => setDurationMinutes(mins)}
                    activeOpacity={0.8}
                    style={[
                      styles.durationPill,
                      {
                        backgroundColor: durationMinutes === mins ? colors.primary : colors.surface,
                        borderColor: durationMinutes === mins ? colors.primary : colors.border,
                        borderRadius: borderRadius.full,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: durationMinutes === mins ? '#FFFFFF' : colors.textPrimary,
                        fontWeight: typography.weights.bold,
                        fontSize: 15,
                      }}
                    >
                      {mins} {translate(profile.language, 'min')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Attach Task Selector */}
              <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: spacing.xl }]}>
                {translate(profile.language, 'attachTaskOptional')}
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.taskScroll}>
                {tasks
                  .filter((t) => t.status !== 'done')
                  .slice(0, 8)
                  .map((task) => (
                    <TouchableOpacity
                      key={task.id}
                      onPress={() => setSelectedTask(selectedTask?.id === task.id ? undefined : task)}
                      style={[
                        styles.taskAttachCard,
                        {
                          backgroundColor: selectedTask?.id === task.id ? colors.primarySurface : colors.surface,
                          borderColor: selectedTask?.id === task.id ? colors.primary : colors.border,
                          borderRadius: borderRadius.lg,
                        },
                      ]}
                    >
                      <Ionicons
                        name={selectedTask?.id === task.id ? 'checkbox' : 'square-outline'}
                        size={18}
                        color={selectedTask?.id === task.id ? colors.primary : colors.textTertiary}
                        style={{ marginRight: 8 }}
                      />
                      <Text
                        numberOfLines={1}
                        style={{
                          color: colors.textPrimary,
                          fontSize: 13,
                          fontWeight: selectedTask?.id === task.id ? typography.weights.bold : typography.weights.medium,
                          maxWidth: 160,
                        }}
                      >
                        {task.title}
                      </Text>
                    </TouchableOpacity>
                  ))}
              </ScrollView>

              {/* Ambient Noise Selector */}
              <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: spacing.xl }]}>
                {translate(profile.language, 'ambientSound')}
              </Text>
              <View style={styles.ambientRow}>
                {[
                  { id: 'none', labelKey: 'soundNone' as const, icon: 'volume-mute-outline' },
                  { id: 'rain', labelKey: 'soundRain' as const, icon: 'rainy-outline' },
                  { id: 'brown-noise', labelKey: 'soundBrownNoise' as const, icon: 'radio-outline' },
                ].map((sound) => (
                  <TouchableOpacity
                    key={sound.id}
                    onPress={() => setAmbientSound(sound.id as any)}
                    style={[
                      styles.ambientCard,
                      {
                        backgroundColor: ambientSound === sound.id ? colors.primarySurface : colors.surface,
                        borderColor: ambientSound === sound.id ? colors.primary : colors.border,
                        borderRadius: borderRadius.lg,
                      },
                    ]}
                  >
                    <Ionicons
                      name={sound.icon as any}
                      size={20}
                      color={ambientSound === sound.id ? colors.primary : colors.textSecondary}
                      style={{ marginBottom: 6 }}
                    />
                    <Text
                      style={{
                        color: ambientSound === sound.id ? colors.primary : colors.textPrimary,
                        fontSize: 12,
                        fontWeight: typography.weights.semibold,
                      }}
                    >
                      {translate(profile.language, sound.labelKey)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Launch CTA */}
              <TouchableOpacity
                onPress={handleStart}
                activeOpacity={0.85}
                style={[
                  styles.primaryCta,
                  {
                    backgroundColor: colors.primary,
                    borderRadius: borderRadius.full,
                    marginTop: spacing.xxl,
                  },
                ]}
              >
                <Ionicons name="play" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.primaryCtaText}>{translate(profile.language, 'startFocusSession')}</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* STEP 2: RUNNING MODE */}
          {mode === 'running' && (
            <View style={styles.runningContainer}>
              {selectedTask ? (
                <View
                  style={[
                    styles.linkedTaskBadge,
                    {
                      backgroundColor: colors.primarySurface,
                      borderColor: colors.primary,
                      borderRadius: borderRadius.full,
                    },
                  ]}
                >
                  <Ionicons name="link" size={14} color={colors.primary} style={{ marginRight: 6 }} />
                  <Text numberOfLines={1} style={{ color: colors.primary, fontWeight: typography.weights.bold, fontSize: 12 }}>
                    {selectedTask.title}
                  </Text>
                </View>
              ) : null}

              {/* Circular Depleting Ring Display */}
              <View style={[styles.timerRingOuter, { borderColor: colors.borderLight }]}>
                <View
                  style={[
                    styles.timerRingProgress,
                    {
                      borderColor: colors.primary,
                      transform: [{ rotate: `${ringProgress * 360}deg` }],
                    },
                  ]}
                />
                <Text
                  style={[
                    styles.timerBigText,
                    {
                      color: colors.textPrimary,
                      fontWeight: typography.weights.extrabold,
                    },
                  ]}
                >
                  {formatTimer(secondsRemaining)}
                </Text>
                <Text style={[styles.timerSubLabel, { color: colors.textSecondary }]}>
                  {isRunning ? 'Deep Work In Progress' : 'Paused'}
                </Text>
              </View>

              {/* Control Buttons */}
              <View style={styles.runningControls}>
                <TouchableOpacity
                  onPress={handlePauseResume}
                  activeOpacity={0.8}
                  style={[
                    styles.controlBtn,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      borderRadius: borderRadius.full,
                    },
                  ]}
                >
                  <Ionicons
                    name={isRunning ? 'pause' : 'play'}
                    size={28}
                    color={colors.primary}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleEarlyEnd}
                  activeOpacity={0.8}
                  style={[
                    styles.controlBtn,
                    {
                      backgroundColor: colors.dangerSurface,
                      borderColor: colors.danger,
                      borderRadius: borderRadius.full,
                      marginLeft: 24,
                    },
                  ]}
                >
                  <Ionicons name="stop" size={24} color={colors.danger} />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* STEP 3: SUMMARY & QUALITY RATING */}
          {mode === 'summary' && (
            <View style={styles.summaryContainer}>
              <Ionicons name="checkmark-circle" size={56} color={colors.primary} style={{ alignSelf: 'center', marginBottom: 12 }} />
              <Text style={[styles.summaryTitle, { color: colors.textPrimary, fontWeight: typography.weights.bold }]}>
                Focus Session Complete!
              </Text>
              <Text style={[styles.summarySub, { color: colors.textSecondary }]}>
                Logged {Math.max(1, Math.round(elapsedSeconds / 60))} {translate(profile.language, 'min')}
              </Text>

              {/* 1-5 Quality Rating */}
              <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: spacing.xl }]}>
                {translate(profile.language, 'focusQualityPrompt')}
              </Text>
              <View style={styles.ratingRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity key={star} onPress={() => setRating(star as any)} style={styles.starBtn}>
                    <Ionicons
                      name={star <= rating ? 'star' : 'star-outline'}
                      size={32}
                      color={star <= rating ? colors.gold : colors.textTertiary}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              {/* Reflection Note */}
              <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: spacing.xl }]}>
                Reflection (Optional)
              </Text>
              <TextInput
                value={reflectionNote}
                onChangeText={setReflectionNote}
                placeholder={translate(profile.language, 'reflectionNotePlaceholder')}
                placeholderTextColor={colors.textTertiary}
                style={[
                  styles.reflectionInput,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.textPrimary,
                    borderRadius: borderRadius.lg,
                  },
                ]}
              />

              {/* Save Button */}
              <TouchableOpacity
                onPress={handleSaveSummary}
                activeOpacity={0.85}
                style={[
                  styles.primaryCta,
                  {
                    backgroundColor: colors.primary,
                    borderRadius: borderRadius.full,
                    marginTop: spacing.xl,
                  },
                ]}
              >
                <Text style={styles.primaryCtaText}>{translate(profile.language, 'saveSession')}</Text>
              </TouchableOpacity>
            </View>
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
  content: {
    padding: 24,
    alignItems: 'center',
  },
  configContainer: {
    width: '100%',
    maxWidth: 420,
  },
  sectionLabel: {
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  durationRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  durationPill: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderWidth: 1,
  },
  taskScroll: {
    flexDirection: 'row',
  },
  taskAttachCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    marginRight: 10,
  },
  ambientRow: {
    flexDirection: 'row',
    gap: 12,
  },
  ambientCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderWidth: 1,
  },
  primaryCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    width: '100%',
  },
  primaryCtaText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  runningContainer: {
    alignItems: 'center',
    paddingTop: 32,
    width: '100%',
  },
  linkedTaskBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderWidth: 1,
    marginBottom: 32,
  },
  timerRingOuter: {
    width: 250,
    height: 250,
    borderRadius: 125,
    borderWidth: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerRingProgress: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    borderWidth: 8,
    borderTopColor: 'transparent',
    borderLeftColor: 'transparent',
  },
  timerBigText: {
    fontSize: 48,
    letterSpacing: -1,
  },
  timerSubLabel: {
    fontSize: 13,
    marginTop: 4,
  },
  runningControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 48,
  },
  controlBtn: {
    width: 64,
    height: 64,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryContainer: {
    width: '100%',
    maxWidth: 420,
    paddingTop: 24,
  },
  summaryTitle: {
    fontSize: 22,
    textAlign: 'center',
  },
  summarySub: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  starBtn: {
    padding: 4,
  },
  reflectionInput: {
    borderWidth: 1,
    padding: 14,
    fontSize: 14,
    minHeight: 48,
  },
});
