// SmartDay Tab 3 — Sessions / Deep Study Focus Timer & Forest Grove
// Unified Emerald Forest Student OS Design System matching Home Screen

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ScreenHeader } from '../components/common/ScreenHeader';
import { useSmartDay } from '../context/SmartDayContext';
import { Task } from '../types';

interface SessionsScreenProps {
  initialTask?: Task;
  onNavigateToPlan: () => void;
}

interface LapRecord {
  id: number;
  lapTime: string;
  totalTime: string;
}

export const SessionsScreen: React.FC<SessionsScreenProps> = ({
  initialTask,
  onNavigateToPlan,
}) => {
  const insets = useSafeAreaInsets();
  const { todayTasks } = useSmartDay();

  // Timer State
  const [isRunning, setIsRunning] = useState(false);
  const [targetMinutes, setTargetMinutes] = useState(50); // Default: 50m matching home
  const [secondsRemaining, setSecondsRemaining] = useState(50 * 60);
  const [activeTaskTitle, setActiveTaskTitle] = useState(
    initialTask?.title || 'Study DBMS (Normalization)'
  );
  const [selectedSoundscape, setSelectedSoundscape] = useState<string>('Library');
  const [qualityRating, setQualityRating] = useState<number>(5);
  const [showGroveModal, setShowGroveModal] = useState(false);

  // Laps
  const [laps, setLaps] = useState<LapRecord[]>([
    { id: 2, lapTime: '25:00', totalTime: '25:00' },
    { id: 1, lapTime: '15:00', totalTime: '40:00' },
  ]);

  // Trees planted in grove
  const [grownTrees, setGrownTrees] = useState([
    { name: 'DBMS Normalization', icon: '🌲', time: '50m', date: 'Today, 9:30 AM' },
    { name: 'Operating Systems Lab', icon: '🌳', time: '45m', date: 'Today, 11:30 AM' },
    { name: 'Algorithms Review', icon: '🍁', time: '30m', date: 'Yesterday' },
    { name: 'Linear Algebra Prep', icon: '🌲', time: '60m', date: 'Sep 19' },
  ]);

  // Timer Tick
  useEffect(() => {
    let interval: any = null;
    if (isRunning && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);
    } else if (secondsRemaining === 0 && isRunning) {
      setIsRunning(false);
      Alert.alert('🎉 Focus Session Completed!', `Great job! You grew a new study tree for ${activeTaskTitle}.`);
      setGrownTrees((prev) => [
        { name: activeTaskTitle, icon: '🌲', time: `${targetMinutes}m`, date: 'Just now' },
        ...prev,
      ]);
    }
    return () => clearInterval(interval);
  }, [isRunning, secondsRemaining, activeTaskTitle, targetMinutes]);

  const handleSelectPreset = (mins: number) => {
    setIsRunning(false);
    setTargetMinutes(mins);
    setSecondsRemaining(mins * 60);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const progressPercent = Math.min(
    1,
    Math.max(0, (targetMinutes * 60 - secondsRemaining) / (targetMinutes * 60))
  );

  return (
    <View style={styles.rootContainer}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          { paddingBottom: insets.bottom + 120 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Emerald Header */}
        <ScreenHeader
          topPadding={insets.top}
          greetingSub="Deep Study Focus"
          title="FOCUS & GROVE"
          tagline="50m target · Keep your focus tree flourishing 🌱"
          rightCustomAction={
            <TouchableOpacity
              style={styles.headerGroveBtn}
              onPress={() => setShowGroveModal(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.headerGroveEmoji}>🌲</Text>
            </TouchableOpacity>
          }
        />

        <View style={styles.bodyContent}>
          {/* Main Focus Card */}
          <View style={styles.focusCard}>
            {/* Active Task Selector Pill */}
            <View style={styles.activeTaskPill}>
              <Ionicons name="book-outline" size={14} color="#059669" />
              <Text style={styles.activeTaskText} numberOfLines={1}>
                {activeTaskTitle}
              </Text>
            </View>

            {/* Circular Timer Visual */}
            <View style={styles.timerCircleContainer}>
              <View style={styles.timerOuterRing}>
                <View style={styles.timerInnerGlow}>
                  <Text style={styles.treeEmoji}>{isRunning ? '🌱' : '🌳'}</Text>
                  <Text style={styles.timerDigits}>{formatTime(secondsRemaining)}</Text>
                  <Text style={styles.timerSubLabel}>
                    {isRunning ? 'FOCUSING NOW' : `${targetMinutes}m TARGET`}
                  </Text>
                </View>
              </View>
            </View>

            {/* Presets (25m, 50m, 90m) */}
            <View style={styles.presetsRow}>
              {[25, 50, 90].map((mins) => (
                <TouchableOpacity
                  key={mins}
                  style={[
                    styles.presetBtn,
                    targetMinutes === mins && styles.presetBtnActive,
                  ]}
                  onPress={() => handleSelectPreset(mins)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.presetBtnText,
                      targetMinutes === mins && styles.presetBtnTextActive,
                    ]}
                  >
                    {mins} mins
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Controls Row */}
            <View style={styles.controlsRow}>
              {/* Reset */}
              <TouchableOpacity
                style={styles.secondaryControlBtn}
                onPress={() => {
                  setIsRunning(false);
                  setSecondsRemaining(targetMinutes * 60);
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="refresh" size={20} color="#64748B" />
              </TouchableOpacity>

              {/* Play / Pause Main Button */}
              <TouchableOpacity
                style={styles.mainPlayBtn}
                onPress={() => setIsRunning((r) => !r)}
                activeOpacity={0.85}
              >
                <Ionicons
                  name={isRunning ? 'pause' : 'play'}
                  size={26}
                  color="#FFFFFF"
                  style={!isRunning ? { marginLeft: 3 } : undefined}
                />
              </TouchableOpacity>

              {/* Lap */}
              <TouchableOpacity
                style={styles.secondaryControlBtn}
                onPress={() => {
                  const elapsed = targetMinutes * 60 - secondsRemaining;
                  const newLap: LapRecord = {
                    id: laps.length + 1,
                    lapTime: formatTime(elapsed),
                    totalTime: formatTime(elapsed),
                  };
                  setLaps([newLap, ...laps]);
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="flag-outline" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Soundscapes Card */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderLine}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="headset-outline" size={18} color="#006951" />
                <Text style={styles.sectionCardTitle}>Study Soundscapes</Text>
              </View>
              <Text style={styles.soundscapeActive}>{selectedSoundscape}</Text>
            </View>

            <View style={styles.soundscapesRow}>
              {[
                { name: 'Library', icon: 'library-outline' },
                { name: 'Rain', icon: 'rainy-outline' },
                { name: 'Brown Noise', icon: 'radio-outline' },
                { name: 'Mute', icon: 'volume-mute-outline' },
              ].map((snd) => (
                <TouchableOpacity
                  key={snd.name}
                  style={[
                    styles.soundscapeChip,
                    selectedSoundscape === snd.name && styles.soundscapeChipActive,
                  ]}
                  onPress={() => setSelectedSoundscape(snd.name)}
                >
                  <Ionicons
                    name={snd.icon as any}
                    size={15}
                    color={selectedSoundscape === snd.name ? '#006951' : '#64748B'}
                  />
                  <Text
                    style={[
                      styles.soundscapeText,
                      selectedSoundscape === snd.name && styles.soundscapeTextActive,
                    ]}
                  >
                    {snd.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Body Pings (Study Health) */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderLine}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="fitness-outline" size={18} color="#006951" />
                <Text style={styles.sectionCardTitle}>Study Health & Body Pings</Text>
              </View>
            </View>

            <View style={styles.pingsRow}>
              <TouchableOpacity
                style={styles.pingCard}
                onPress={() => Alert.alert('💧 Hydration', 'Logged 250ml water!')}
              >
                <Text style={styles.pingEmoji}>💧</Text>
                <Text style={styles.pingTitle}>Drink Water</Text>
                <Text style={styles.pingSub}>250ml</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.pingCard}
                onPress={() => Alert.alert('🧘 Shoulder Stretch', 'Take 30 seconds to roll your shoulders back.')}
              >
                <Text style={styles.pingEmoji}>🧘</Text>
                <Text style={styles.pingTitle}>Stretch</Text>
                <Text style={styles.pingSub}>30 sec</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.pingCard}
                onPress={() => Alert.alert('👀 20-20-20 Rule', 'Look 20 feet away for 20 seconds to relax your eyes.')}
              >
                <Text style={styles.pingEmoji}>👀</Text>
                <Text style={styles.pingTitle}>20-20-20 Eyes</Text>
                <Text style={styles.pingSub}>Relax</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Study Grove (Trees Grown) */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderLine}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="leaf-outline" size={18} color="#006951" />
                <Text style={styles.sectionCardTitle}>Personal Study Grove</Text>
              </View>
              <Text style={styles.treesCountBadge}>{grownTrees.length} Trees</Text>
            </View>

            <View style={styles.treesList}>
              {grownTrees.map((tree, idx) => (
                <View key={idx} style={styles.treeRow}>
                  <Text style={styles.treeRowIcon}>{tree.icon}</Text>
                  <View style={styles.treeRowInfo}>
                    <Text style={styles.treeRowName}>{tree.name}</Text>
                    <Text style={styles.treeRowDate}>{tree.date}</Text>
                  </View>
                  <View style={styles.treeDurationBadge}>
                    <Text style={styles.treeDurationText}>{tree.time}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Grove Detail Modal */}
      {showGroveModal && (
        <Modal
          visible={true}
          transparent
          animationType="fade"
          onRequestClose={() => setShowGroveModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeaderRow}>
                <View style={styles.modalTitleRow}>
                  <Text style={{ fontSize: 24 }}>🌲</Text>
                  <Text style={styles.modalHeading}>Your Study Grove</Text>
                </View>
                <TouchableOpacity onPress={() => setShowGroveModal(false)}>
                  <Ionicons name="close" size={22} color="#64748B" />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalDesc}>
                Every completed focus session plants an enduring tree in your academic forest grove.
              </Text>

              <View style={styles.groveStatsBox}>
                <View style={styles.groveStatItem}>
                  <Text style={styles.groveStatNum}>14</Text>
                  <Text style={styles.groveStatLbl}>Day Streak</Text>
                </View>
                <View style={styles.groveStatItem}>
                  <Text style={styles.groveStatNum}>{grownTrees.length}</Text>
                  <Text style={styles.groveStatLbl}>Trees Grown</Text>
                </View>
                <View style={styles.groveStatItem}>
                  <Text style={styles.groveStatNum}>98%</Text>
                  <Text style={styles.groveStatLbl}>Completion</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.closeModalBtn}
                onPress={() => setShowGroveModal(false)}
              >
                <Text style={styles.closeModalBtnText}>Continue Focusing</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContainer: {
    paddingBottom: 120,
  },
  headerGroveBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerGroveEmoji: {
    fontSize: 16,
  },
  bodyContent: {
    paddingHorizontal: 16,
    marginTop: -10,
    gap: 16,
  },
  focusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    padding: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 4,
  },
  activeTaskPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6FBF2',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
    marginBottom: 20,
  },
  activeTaskText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  timerCircleContainer: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },
  timerOuterRing: {
    width: 190,
    height: 190,
    borderRadius: 95,
    borderWidth: 6,
    borderColor: '#E6FBF2',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  timerInnerGlow: {
    width: 166,
    height: 166,
    borderRadius: 83,
    backgroundColor: '#004D40',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#002B24',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  treeEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  timerDigits: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  timerSubLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#A7F3D0',
    marginTop: 3,
    letterSpacing: 0.8,
  },
  presetsRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    padding: 3,
    gap: 4,
    marginBottom: 20,
  },
  presetBtn: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 11,
  },
  presetBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  presetBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  presetBtnTextActive: {
    color: '#006951',
    fontWeight: '700',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  secondaryControlBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainPlayBtn: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#006951',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#004D40',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionHeaderLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  soundscapeActive: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  soundscapesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  soundscapeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  soundscapeChipActive: {
    backgroundColor: '#E6FBF2',
    borderColor: '#A7F3D0',
  },
  soundscapeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  soundscapeTextActive: {
    color: '#006951',
    fontWeight: '700',
  },
  pingsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  pingCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pingEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  pingTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E293B',
  },
  pingSub: {
    fontSize: 10,
    fontWeight: '500',
    color: '#94A3B8',
    marginTop: 2,
  },
  treesCountBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
    backgroundColor: '#E6FBF2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  treesList: {
    gap: 10,
  },
  treeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  treeRowIcon: {
    fontSize: 22,
    marginRight: 10,
  },
  treeRowInfo: {
    flex: 1,
  },
  treeRowName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  treeRowDate: {
    fontSize: 11,
    fontWeight: '500',
    color: '#94A3B8',
    marginTop: 2,
  },
  treeDurationBadge: {
    backgroundColor: '#E6FBF2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  treeDurationText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalDesc: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 18,
  },
  groveStatsBox: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  groveStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  groveStatNum: {
    fontSize: 20,
    fontWeight: '800',
    color: '#006951',
  },
  groveStatLbl: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
  closeModalBtn: {
    backgroundColor: '#006951',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  closeModalBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
