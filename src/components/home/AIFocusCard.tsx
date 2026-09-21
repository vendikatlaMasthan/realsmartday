import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { AIFocusData } from '../../data/mockHome';

export interface AIFocusCardProps {
  data: AIFocusData;
  onActionPress: () => void;
}

export const AIFocusCard: React.FC<AIFocusCardProps> = ({
  data,
  onActionPress,
}) => {
  const { theme, isDark } = useTheme();
  const { colors, typography, spacing, borderRadius } = theme;

  return (
    <View
      style={[
        styles.wrapper,
        {
          borderRadius: borderRadius['2xl'],
          marginBottom: spacing.xl,
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: isDark ? 0.5 : 0.3,
          shadowRadius: 20,
          elevation: 12,
        },
      ]}
    >
      <LinearGradient
        colors={
          isDark
            ? ['#1E1A5E', '#2D2480', '#3730A3']
            : ['#4338CA', '#5B4FE9', '#7C3AED']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.container,
          {
            borderRadius: borderRadius['2xl'],
            padding: spacing.xl,
            borderColor: isDark
              ? 'rgba(129, 140, 248, 0.2)'
              : 'rgba(255, 255, 255, 0.15)',
            borderWidth: 1,
          },
        ]}
      >
        {/* Top row: status pill left, goal ring right */}
        <View style={styles.topRow}>
          {/* Status pill */}
          <View
            style={[
              styles.statusPill,
              {
                backgroundColor: 'rgba(255,255,255,0.18)',
                borderRadius: borderRadius.full,
                paddingHorizontal: spacing.sm + 2,
                paddingVertical: 5,
              },
            ]}
          >
            <View style={[styles.statusDot, { backgroundColor: '#34D399' }]} />
            <Text
              style={[
                styles.statusPillText,
                {
                  fontSize: typography.sizes.xs,
                  fontWeight: typography.weights.bold,
                  color: '#FFFFFF',
                  letterSpacing: 0.5,
                },
              ]}
            >
              AI FOCUS
            </Text>
          </View>

          {/* Confidence ring stat */}
          <View style={styles.ringStatWrapper}>
            <View
              style={[
                styles.ringOuter,
                {
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  borderWidth: 2,
                  borderColor: 'rgba(255,255,255,0.25)',
                },
              ]}
            >
              <View
                style={[
                  styles.ringInner,
                  {
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: 'rgba(255,255,255,0.15)',
                  },
                ]}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: typography.weights.extrabold,
                    color: '#FFFFFF',
                    lineHeight: 16,
                  }}
                >
                  {data.confidenceScore}%
                </Text>
              </View>
            </View>
            <Text
              style={{
                fontSize: 9,
                color: 'rgba(255,255,255,0.65)',
                textAlign: 'center',
                marginTop: 4,
                fontWeight: typography.weights.medium,
              }}
            >
              OPTIMAL
            </Text>
          </View>
        </View>

        {/* Hero stat — big task name / estimated time */}
        <Text
          style={[
            styles.heroTime,
            {
              fontSize: typography.sizes['4xl'] - 2,
              fontWeight: typography.weights.extrabold,
              color: '#FFFFFF',
              letterSpacing: -1.5,
              marginTop: spacing.md,
              lineHeight: 40,
            },
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {data.estimatedTime}
        </Text>

        <Text
          numberOfLines={2}
          style={[
            styles.recommendation,
            {
              fontSize: typography.sizes.base,
              fontWeight: typography.weights.semibold,
              color: 'rgba(255,255,255,0.9)',
              lineHeight: 22,
              marginTop: spacing.xs,
              letterSpacing: -0.2,
            },
          ]}
        >
          {data.recommendation}
        </Text>

        {/* Sub-stat row: Focus Level / Est. Time / Priority */}
        <View
          style={[
            styles.subStatRow,
            {
              marginTop: spacing.base,
              paddingTop: spacing.md,
              borderTopWidth: 1,
              borderTopColor: 'rgba(255,255,255,0.12)',
            },
          ]}
        >
          <View style={styles.subStat}>
            <Ionicons name="pulse-outline" size={14} color="rgba(255,255,255,0.6)" />
            <Text style={[styles.subStatLabel, { color: 'rgba(255,255,255,0.6)', fontSize: 10 }]}>
              Focus Level
            </Text>
            <Text style={[styles.subStatValue, { color: '#FFFFFF', fontSize: typography.sizes.sm, fontWeight: typography.weights.bold }]}>
              High
            </Text>
          </View>

          <View style={[styles.subStatDivider, { backgroundColor: 'rgba(255,255,255,0.15)' }]} />

          <View style={styles.subStat}>
            <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.6)" />
            <Text style={[styles.subStatLabel, { color: 'rgba(255,255,255,0.6)', fontSize: 10 }]}>
              Est. Time
            </Text>
            <Text style={[styles.subStatValue, { color: '#FFFFFF', fontSize: typography.sizes.sm, fontWeight: typography.weights.bold }]}>
              {data.estimatedTime}
            </Text>
          </View>

          <View style={[styles.subStatDivider, { backgroundColor: 'rgba(255,255,255,0.15)' }]} />

          <View style={styles.subStat}>
            <Ionicons name="flag-outline" size={14} color="rgba(255,255,255,0.6)" />
            <Text style={[styles.subStatLabel, { color: 'rgba(255,255,255,0.6)', fontSize: 10 }]}>
              Priority
            </Text>
            <Text style={[styles.subStatValue, { color: '#FFFFFF', fontSize: typography.sizes.sm, fontWeight: typography.weights.bold }]}>
              Urgent
            </Text>
          </View>
        </View>

        {/* Full-width pill CTA */}
        <TouchableOpacity
          onPress={onActionPress}
          activeOpacity={0.85}
          style={[
            styles.ctaButton,
            {
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: borderRadius.full,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.3)',
              paddingVertical: spacing.md,
              marginTop: spacing.base,
            },
          ]}
        >
          <Ionicons name="play-circle-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text
            style={{
              fontSize: typography.sizes.base,
              fontWeight: typography.weights.bold,
              color: '#FFFFFF',
              letterSpacing: 0.3,
            }}
          >
            {data.actionText}
          </Text>
          <Ionicons name="arrow-forward" size={16} color="rgba(255,255,255,0.7)" style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    overflow: 'hidden',
  },
  container: {
    overflow: 'hidden',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusPillText: {},
  ringStatWrapper: {
    alignItems: 'center',
  },
  ringOuter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTime: {},
  recommendation: {},
  subStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  subStat: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  subStatLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  subStatValue: {},
  subStatDivider: {
    width: 1,
    height: 32,
    marginHorizontal: 4,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
