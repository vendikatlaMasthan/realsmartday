// SmartDay Home Screen Widgets Preview (Section 6 Spec)
// Live interactive rendering of iOS WidgetKit & Android App Widgets:
// Small ("Today's Rings"), Medium ("Next + Rings"), Large ("Today's Focus List"), Lock Screen.
// Reads real local data; honest empty states ("No focus logged yet today. Open SmartDay to start.").

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { translate } from '../../i18n';
import { useSmartDay } from '../../context/SmartDayContext';

interface WidgetsPreviewModalProps {
  visible: boolean;
  onClose: () => void;
}

export const WidgetsPreviewModal: React.FC<WidgetsPreviewModalProps> = ({
  visible,
  onClose,
}) => {
  const { theme, isDark } = useTheme();
  const { colors, typography, borderRadius, spacing } = theme;
  const { rings, todayTasks, todayFocusMinutes, currentStreak, profile } = useSmartDay();

  const [widgetType, setWidgetType] = useState<'small' | 'medium' | 'large' | 'lock'>('small');

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.borderLight, borderBottomWidth: 1 }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary, fontWeight: typography.weights.bold }]}>
            {translate(profile.language, 'widgetsPreview')}
          </Text>
          <View style={{ width: 44 }} />
        </View>

        {/* Size Segment Selector */}
        <View style={[styles.sizeSelector, { backgroundColor: colors.surfaceSecondary, borderRadius: borderRadius.full }]}>
          {(['small', 'medium', 'large', 'lock'] as const).map((s) => (
            <TouchableOpacity
              key={s}
              onPress={() => setWidgetType(s)}
              style={[
                styles.sizeItem,
                {
                  backgroundColor: widgetType === s ? colors.surface : 'transparent',
                  borderRadius: borderRadius.full,
                },
              ]}
            >
              <Text
                style={{
                  color: widgetType === s ? colors.primary : colors.textSecondary,
                  fontWeight: widgetType === s ? typography.weights.bold : typography.weights.medium,
                  fontSize: 13,
                  textTransform: 'capitalize',
                }}
              >
                {s}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* SIMULATED HOME SCREEN CANVAS */}
          <View style={[styles.canvas, { backgroundColor: isDark ? '#000000' : '#E2E8F0', borderRadius: 32 }]}>
            <Text style={[styles.canvasNote, { color: isDark ? '#6B7280' : '#475569' }]}>
              {widgetType === 'lock' ? 'Lock Screen Widget Preview' : 'Home Screen Widget Preview'}
            </Text>

            {/* A) SMALL WIDGET: Today's Rings */}
            {widgetType === 'small' && (
              <View
                style={[
                  styles.smallWidget,
                  {
                    backgroundColor: isDark ? '#16181C' : '#FFFFFF',
                    borderRadius: 22,
                    borderColor: colors.border,
                  },
                  theme.shadows.md,
                ]}
              >
                <View style={styles.miniRingWrapper}>
                  {/* Concentric rings in mini form */}
                  <View style={[styles.miniRingFocus, { borderColor: colors.primary }]}>
                    <View style={[styles.miniRingTasks, { borderColor: colors.purple }]}>
                      <View style={[styles.miniRingHabits, { borderColor: colors.gold }]} />
                    </View>
                  </View>
                </View>
                <Text style={[styles.widgetCenterText, { color: colors.textPrimary, fontWeight: typography.weights.bold }]}>
                  {rings.closedRingsCount > 0
                    ? `${rings.closedRingsCount} of 3 closed`
                    : 'Let’s start'}
                </Text>
                <Text style={[styles.widgetMeta, { color: colors.textSecondary }]}>
                  {currentStreak > 0 ? `${currentStreak}d Streak` : 'SmartDay'}
                </Text>
              </View>
            )}

            {/* B) MEDIUM WIDGET: Next + Rings */}
            {widgetType === 'medium' && (
              <View
                style={[
                  styles.mediumWidget,
                  {
                    backgroundColor: isDark ? '#16181C' : '#FFFFFF',
                    borderRadius: 22,
                    borderColor: colors.border,
                  },
                  theme.shadows.md,
                ]}
              >
                {/* Left: Mini Rings */}
                <View style={styles.mediumLeft}>
                  <View style={[styles.miniRingFocus, { borderColor: colors.primary }]}>
                    <View style={[styles.miniRingTasks, { borderColor: colors.purple }]}>
                      <View style={[styles.miniRingHabits, { borderColor: colors.gold }]} />
                    </View>
                  </View>
                </View>

                {/* Right: Next Plan Item & Compact Tally */}
                <View style={styles.mediumRight}>
                  <Text style={[styles.mediumHeading, { color: colors.textSecondary }]}>NEXT UP</Text>
                  <Text numberOfLines={1} style={[styles.mediumTitle, { color: colors.textPrimary, fontWeight: typography.weights.bold }]}>
                    {todayTasks[0]?.title || 'No upcoming tasks'}
                  </Text>
                  <Text style={[styles.mediumTally, { color: colors.textSecondary }]}>
                    Focus {todayFocusMinutes}m · Tasks {rings.tasksCompleted}/{rings.tasksPlanned} · Habits {rings.habitsCompleted}/{rings.habitsDue}
                  </Text>
                </View>
              </View>
            )}

            {/* C) LARGE WIDGET: Today's Focus List */}
            {widgetType === 'large' && (
              <View
                style={[
                  styles.largeWidget,
                  {
                    backgroundColor: isDark ? '#16181C' : '#FFFFFF',
                    borderRadius: 22,
                    borderColor: colors.border,
                  },
                  theme.shadows.md,
                ]}
              >
                {/* Rings Header Row */}
                <View style={styles.largeHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.textPrimary, fontWeight: typography.weights.bold, fontSize: 16 }}>
                      Today's Priorities
                    </Text>
                    <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                      {rings.closedRingsCount} of 3 rings closed
                    </Text>
                  </View>
                  <View style={[styles.miniRingFocus, { width: 44, height: 44, borderRadius: 22, borderWidth: 4, borderColor: colors.primary }]}>
                    <View style={[styles.miniRingTasks, { width: 30, height: 30, borderRadius: 15, borderWidth: 3, borderColor: colors.purple }]} />
                  </View>
                </View>

                {/* Top 3 Status Rows */}
                <View style={styles.largeTasksList}>
                  {todayTasks.slice(0, 3).map((t) => (
                    <View key={t.id} style={[styles.widgetTaskRow, { borderBottomColor: colors.borderLight }]}>
                      <Ionicons
                        name={t.status === 'done' ? 'checkbox' : 'square-outline'}
                        size={16}
                        color={t.status === 'done' ? colors.primary : colors.textTertiary}
                        style={{ marginRight: 8 }}
                      />
                      <Text numberOfLines={1} style={{ color: colors.textPrimary, flex: 1, fontSize: 13 }}>
                        {t.title}
                      </Text>
                      <Text style={{ color: colors.textSecondary, fontSize: 11 }}>{t.estimateMin}m</Text>
                    </View>
                  ))}

                  {todayTasks.length === 0 && (
                    <Text style={{ color: colors.textTertiary, fontSize: 12, marginTop: 12 }}>
                      No tasks planned yet today. Open SmartDay to start.
                    </Text>
                  )}
                </View>
              </View>
            )}

            {/* D) LOCK SCREEN WIDGET */}
            {widgetType === 'lock' && (
              <View style={[styles.lockWidget, { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 16 }]}>
                <Ionicons name="timer" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                <View>
                  <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 }}>
                    {todayFocusMinutes}m Focused
                  </Text>
                  <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>
                    {rings.tasksCompleted}/{rings.tasksPlanned} Tasks Done
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Setup Guide */}
          <View style={[styles.instructionsCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: borderRadius.xl }]}>
            <Text style={[styles.instTitle, { color: colors.textPrimary, fontWeight: typography.weights.bold }]}>
              How to Add to Home Screen
            </Text>
            <Text style={[styles.instText, { color: colors.textSecondary }]}>
              1. Touch and hold an empty area on your phone's Home Screen.{'\n'}
              2. Tap the '+' button in the corner.{'\n'}
              3. Search for SmartDay and select your preferred widget size.
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
  headerTitle: {
    fontSize: 17,
  },
  sizeSelector: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 10,
    padding: 4,
  },
  sizeItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
  },
  content: {
    padding: 16,
  },
  canvas: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 320,
    marginBottom: 20,
  },
  canvasNote: {
    fontSize: 12,
    marginBottom: 20,
  },
  smallWidget: {
    width: 155,
    height: 155,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  miniRingWrapper: {
    marginBottom: 8,
  },
  miniRingFocus: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniRingTasks: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniRingHabits: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 3,
  },
  widgetCenterText: {
    fontSize: 13,
    textAlign: 'center',
  },
  widgetMeta: {
    fontSize: 11,
    marginTop: 2,
  },
  mediumWidget: {
    width: 320,
    height: 155,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  mediumLeft: {
    width: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediumRight: {
    flex: 1,
    paddingLeft: 12,
    justifyContent: 'center',
  },
  mediumHeading: {
    fontSize: 10,
    letterSpacing: 0.5,
  },
  mediumTitle: {
    fontSize: 15,
    marginVertical: 4,
  },
  mediumTally: {
    fontSize: 12,
  },
  largeWidget: {
    width: 320,
    height: 320,
    padding: 18,
    borderWidth: 1,
  },
  largeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  largeTasksList: {
    marginTop: 12,
  },
  widgetTaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  lockWidget: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  instructionsCard: {
    padding: 20,
    borderWidth: 1,
  },
  instTitle: {
    fontSize: 15,
    marginBottom: 8,
  },
  instText: {
    fontSize: 13,
    lineHeight: 20,
  },
});
