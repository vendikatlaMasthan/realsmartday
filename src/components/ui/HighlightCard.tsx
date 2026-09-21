// SmartDay Highlight Card Component (Section 11 Spec)
// Type chip: Win (green), Warning (red), Pattern (purple), Drift (amber), Streak (gold)
// One sentence in human language, 'Why this showed up' accordion, primary action button.

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Highlight } from '../../types';
import { translate } from '../../i18n';
import { useSmartDay } from '../../context/SmartDayContext';

interface HighlightCardProps {
  highlight: Highlight;
  onActionPress?: (target?: string) => void;
}

export const HighlightCard: React.FC<HighlightCardProps> = ({
  highlight,
  onActionPress,
}) => {
  const { theme, isDark } = useTheme();
  const { colors, typography, borderRadius, spacing } = theme;
  const { profile } = useSmartDay();
  const [expandedWhy, setExpandedWhy] = useState(false);

  // Type chip styles
  const typeConfig = {
    Win: {
      color: colors.success,
      bg: colors.successSurface,
      labelKey: 'chipWin' as const,
      icon: 'trophy-outline' as const,
    },
    Warning: {
      color: colors.danger,
      bg: colors.dangerSurface,
      labelKey: 'chipWarning' as const,
      icon: 'alert-circle-outline' as const,
    },
    Pattern: {
      color: colors.purple,
      bg: colors.purpleSurface,
      labelKey: 'chipPattern' as const,
      icon: 'bulb-outline' as const,
    },
    Drift: {
      color: colors.gold,
      bg: colors.goldSurface,
      labelKey: 'chipDrift' as const,
      icon: 'trending-down-outline' as const,
    },
    Streak: {
      color: colors.gold,
      bg: colors.goldSurface,
      labelKey: 'chipStreak' as const,
      icon: 'flame-outline' as const,
    },
  }[highlight.type] || {
    color: colors.primary,
    bg: colors.primarySurface,
    labelKey: 'chipPattern' as const,
    icon: 'sparkles-outline' as const,
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: borderRadius.xl,
          padding: spacing.base,
          marginBottom: spacing.md,
        },
        theme.shadows.sm,
      ]}
    >
      {/* Top Row: Type Chip + Timestamp */}
      <View style={styles.topRow}>
        <View
          style={[
            styles.typeChip,
            {
              backgroundColor: typeConfig.bg,
              borderRadius: borderRadius.full,
            },
          ]}
        >
          <Ionicons name={typeConfig.icon} size={12} color={typeConfig.color} style={{ marginRight: 4 }} />
          <Text style={[styles.chipText, { color: typeConfig.color, fontWeight: typography.weights.bold }]}>
            {translate(profile.language, typeConfig.labelKey)}
          </Text>
        </View>

        <Text style={[styles.timeText, { color: colors.textTertiary }]}>Today</Text>
      </View>

      {/* Main Insight Title & Sentence */}
      <Text
        style={[
          styles.title,
          {
            color: colors.textPrimary,
            fontSize: 16,
            fontWeight: typography.weights.bold,
            marginTop: 10,
          },
        ]}
      >
        {highlight.title}
      </Text>

      <Text
        style={[
          styles.body,
          {
            color: colors.textSecondary,
            fontSize: 14,
            lineHeight: 20,
            marginTop: 4,
          },
        ]}
      >
        {highlight.body}
      </Text>

      {/* 'Why this showed up' Expander Accordion */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setExpandedWhy((prev) => !prev)}
        style={styles.whyHeader}
      >
        <Text style={[styles.whyText, { color: colors.primary, fontWeight: typography.weights.semibold }]}>
          {translate(profile.language, 'whyThisShowedUp')}
        </Text>
        <Ionicons
          name={expandedWhy ? 'chevron-up' : 'chevron-down'}
          size={14}
          color={colors.primary}
          style={{ marginLeft: 4 }}
        />
      </TouchableOpacity>

      {expandedWhy && (
        <View
          style={[
            styles.whyBody,
            {
              backgroundColor: colors.surfaceSecondary,
              borderRadius: borderRadius.md,
              borderColor: colors.borderLight,
            },
          ]}
        >
          <Text style={[styles.whyBodyText, { color: colors.textSecondary }]}>
            {highlight.whyExplanation}
          </Text>
        </View>
      )}

      {/* Primary Action Button */}
      {highlight.actionLabel ? (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onActionPress?.(highlight.actionTarget)}
          style={[
            styles.actionButton,
            {
              backgroundColor: colors.surfaceSecondary,
              borderColor: colors.border,
              borderRadius: borderRadius.full,
              marginTop: spacing.md,
            },
          ]}
        >
          <Text
            style={[
              styles.actionButtonText,
              {
                color: colors.textPrimary,
                fontWeight: typography.weights.bold,
                fontSize: 13,
              },
            ]}
          >
            {highlight.actionLabel}
          </Text>
          <Ionicons name="arrow-forward" size={14} color={colors.textPrimary} style={{ marginLeft: 6 }} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  chipText: {
    fontSize: 11,
    letterSpacing: 0.3,
  },
  timeText: {
    fontSize: 11,
  },
  title: {
    letterSpacing: -0.2,
  },
  body: {},
  whyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  whyText: {
    fontSize: 12,
  },
  whyBody: {
    padding: 10,
    marginTop: 6,
    borderWidth: 1,
  },
  whyBodyText: {
    fontSize: 12,
    lineHeight: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
  },
  actionButtonText: {},
});
