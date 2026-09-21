// SmartDay — Dedicated <TimelineRow> Component
// Strictly follows layout requirements:
// 1. Intrinsic height (grows naturally when title wraps, no fixed height)
// 2. Three logical zones:
//    - Left: time + colored dot + connecting line (fixed width column, flex-shrink: 0)
//    - Middle: title (wraps to 2 lines max with ellipsis) + subtitle (cleanly truncated with ellipsis, min-width: 0, flex: 1)
//    - Right: type badge (top-aligned to title's first line via alignSelf: 'flex-start', flex-shrink: 0, never squeezed)

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  TextStyle,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface TimelineBadge {
  text: string;
  bg?: string;
  color?: string;
}

export interface TimelineRowProps {
  id?: string;
  time: string;
  title: string;
  subtitle?: string;
  locationIcon?: keyof typeof Ionicons.glyphMap;
  dotColor?: string;
  badge?: TimelineBadge;
  isLast?: boolean;
  completed?: boolean;
  onPress?: () => void;
  onToggleComplete?: () => void;
  showCheckbox?: boolean;
  checkboxPosition?: 'left' | 'right' | 'bottom';
  children?: React.ReactNode;
  variant?: 'flat' | 'card';
  style?: StyleProp<ViewStyle>;
}

export const TimelineRow: React.FC<TimelineRowProps> = ({
  time,
  title,
  subtitle,
  locationIcon = 'location-outline',
  dotColor = '#059669',
  badge,
  isLast = false,
  completed = false,
  onPress,
  onToggleComplete,
  showCheckbox = false,
  checkboxPosition = 'bottom',
  children,
  variant = 'flat',
  style,
}) => {
  const isCard = variant === 'card';

  const content = (
    <View style={[styles.rowContainer, isCard && styles.cardContainer, style]}>
      {/* ============================================================
          ZONE 1 (LEFT): Time + Dot + Connector (Fixed Width Column)
         ============================================================ */}
      <View style={styles.leftCol}>
        <Text style={[styles.timeText, completed && styles.timeTextCompleted]} numberOfLines={1}>
          {time}
        </Text>
        <View style={styles.indicatorTrack}>
          <View
            style={[
              styles.dot,
              { backgroundColor: completed ? '#94A3B8' : dotColor },
            ]}
          />
          {!isLast && <View style={styles.connector} />}
        </View>
      </View>

      {/* ============================================================
          ZONE 2 (MIDDLE): Title + Subtitle (Intrinsic height, min-width: 0, flex: 1)
         ============================================================ */}
      <View style={styles.middleCol}>
        {/* Title: wraps up to 2 lines max, then ellipsis */}
        <Text
          style={[
            styles.titleText,
            completed && styles.titleCompleted,
          ]}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {title}
        </Text>

        {/* Subtitle / Location: Never hard-cut mid-word, clean ellipsis */}
        {subtitle ? (
          <View style={styles.subtitleRow}>
            <Ionicons
              name={locationIcon}
              size={12}
              color={completed ? '#94A3B8' : '#64748B'}
              style={styles.subtitleIcon}
            />
            <Text
              style={[
                styles.subtitleText,
                completed && styles.subtitleTextCompleted,
                Platform.OS === 'web' && ({
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                } as any),
              ]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {subtitle}
            </Text>
          </View>
        ) : null}

        {/* Optional Action / Bottom Row (e.g. Checkbox, Start Focus) */}
        {children ? <View style={styles.childrenRow}>{children}</View> : null}

        {showCheckbox && checkboxPosition === 'bottom' && (
          <View style={styles.bottomActionRow}>
            <TouchableOpacity
              style={[
                styles.checkCircle,
                completed && styles.checkCircleCompleted,
              ]}
              onPress={onToggleComplete}
              activeOpacity={0.7}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: completed }}
            >
              {completed && <Ionicons name="checkmark" size={11} color="#FFFFFF" />}
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* ============================================================
          ZONE 3 (RIGHT): Type Badge (Top-aligned to 1st line, flex-shrink: 0)
         ============================================================ */}
      <View style={styles.rightCol}>
        {badge ? (
          <View
            style={[
              styles.badge,
              {
                backgroundColor: completed
                  ? '#F1F5F9'
                  : badge.bg || '#E6F7F0',
              },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                {
                  color: completed
                    ? '#64748B'
                    : badge.color || '#059669',
                },
                Platform.OS === 'web' && ({
                  whiteSpace: 'nowrap',
                } as any),
              ]}
              numberOfLines={1}
            >
              {badge.text}
            </Text>
          </View>
        ) : null}

        {showCheckbox && checkboxPosition === 'right' && (
          <TouchableOpacity
            style={[
              styles.checkCircle,
              completed && styles.checkCircleCompleted,
            ]}
            onPress={onToggleComplete}
            activeOpacity={0.7}
          >
            {completed && <Ionicons name="checkmark" size={11} color="#FFFFFF" />}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.75}
        style={styles.touchableWrapper}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  touchableWrapper: {
    width: '100%',
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
    paddingVertical: 6,
    overflow: 'hidden',
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
    marginVertical: 4,
  },

  // Zone 1: Left
  leftCol: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: 72,
    flexShrink: 0,
    marginRight: 6,
    paddingTop: 1,
  },
  timeText: {
    width: 52,
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    textAlign: 'left',
    paddingTop: 1,
  },
  timeTextCompleted: {
    color: '#94A3B8',
  },
  indicatorTrack: {
    width: 14,
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 3,
  },
  connector: {
    width: 1.5,
    flex: 1,
    minHeight: 26,
    backgroundColor: '#E2E8F0',
    marginTop: 3,
    borderRadius: 1,
  },

  // Zone 2: Middle
  middleCol: {
    flex: 1,
    minWidth: 0,
    paddingRight: 8,
    justifyContent: 'flex-start',
  },
  titleText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 18,
    marginBottom: 2,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
    marginTop: 1,
  },
  subtitleIcon: {
    marginRight: 4,
    flexShrink: 0,
  },
  subtitleText: {
    fontSize: 11,
    color: '#64748B',
    flex: 1,
    minWidth: 0,
  },
  subtitleTextCompleted: {
    color: '#94A3B8',
  },
  childrenRow: {
    marginTop: 6,
  },
  bottomActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkCircleCompleted: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },

  // Zone 3: Right
  rightCol: {
    flexShrink: 0,
    alignSelf: 'flex-start', // Anchors to first line of title
    alignItems: 'flex-end',
    gap: 6,
    paddingTop: 0,
  },
  badge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.2,
    flexShrink: 0,
    textAlign: 'center',
  },
});
