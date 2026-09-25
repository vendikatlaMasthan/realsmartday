// SmartDay Screen Header - Consistent Emerald Forest Design System
// Shared across all screens for 100% unified visual identity

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const getFormattedHeaderDate = () => {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export interface ScreenHeaderProps {
  topPadding: number;
  greetingSub?: string;
  title?: string;
  tagline?: string;
  dateText?: string;
  onDatePress?: () => void;
  onSearchPress?: () => void;
  onNotificationsPress?: () => void;
  onAvatarPress?: () => void;
  rightCustomAction?: React.ReactNode;
  unreadCount?: number;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  topPadding,
  greetingSub = 'Student OS',
  title = 'VENDIKATLA MASTHAN',
  tagline = "Let's make today productive ✨",
  dateText,
  onDatePress,
  onSearchPress,
  onNotificationsPress,
  onAvatarPress,
  rightCustomAction,
  unreadCount = 2,
}) => {
  const displayDate = dateText || getFormattedHeaderDate();

  return (
    <LinearGradient
      colors={['#004D40', '#075E4D', '#0B5646']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.8, y: 1 }}
      style={[styles.headerContainer, { paddingTop: Math.max(topPadding, 12) + 6 }]}
    >
      {/* Subtle organic curved accent overlay */}
      <View style={styles.headerWaveOverlay} pointerEvents="none" />

      {/* Status Bar Row: Only displayed in Web desktop preview, hidden on native Android */}
      {Platform.OS === 'web' && (
        <View style={styles.statusBarRow}>
          <Text style={styles.statusBarTime}>9:41</Text>
          <View style={styles.statusBarIcons}>
            <Ionicons name="cellular" size={14} color="#FFFFFF" />
            <Ionicons name="wifi" size={14} color="#FFFFFF" />
            <View style={styles.batteryPill}>
              <Text style={styles.batteryText}>100</Text>
            </View>
          </View>
        </View>
      )}

      {/* Main Header Row */}
      <View style={styles.headerMainRow}>
        {/* Left: Greeting / Subtitle & Title */}
        <View style={styles.greetingCol}>
          {greetingSub ? <Text style={styles.greetingSub}>{greetingSub}</Text> : null}
          <Text style={styles.greetingName} numberOfLines={2}>
            {title}
          </Text>
          {tagline ? (
            <View style={styles.taglineRow}>
              <Text style={styles.sproutEmoji}>🌱</Text>
              <Text style={styles.greetingTagline}>{tagline}</Text>
            </View>
          ) : null}
        </View>

        {/* Right: Date Capsule + Action Icons + Profile Avatar */}
        <View style={styles.headerRightCol}>
          {/* Date Capsule */}
          {displayDate ? (
            <TouchableOpacity
              style={styles.dateCapsule}
              onPress={onDatePress}
              activeOpacity={0.8}
            >
              <Ionicons name="calendar-outline" size={13} color="#A7F3D0" />
              <Text style={styles.dateCapsuleText}>{displayDate}</Text>
            </TouchableOpacity>
          ) : null}

          {/* Action Icons Row */}
          <View style={styles.actionIconsRow}>
            {rightCustomAction ? rightCustomAction : null}

            {onSearchPress ? (
              <TouchableOpacity
                style={styles.headerIconBtn}
                onPress={onSearchPress}
                activeOpacity={0.7}
                accessibilityLabel="Search"
              >
                <Ionicons name="search" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            ) : null}

            {onNotificationsPress ? (
              <TouchableOpacity
                style={styles.headerIconBtn}
                onPress={onNotificationsPress}
                activeOpacity={0.7}
                accessibilityLabel="Notifications"
              >
                <Ionicons name="notifications-outline" size={18} color="#FFFFFF" />
                {unreadCount > 0 && <View style={styles.notificationDot} />}
              </TouchableOpacity>
            ) : null}

            {/* User Profile Avatar with green online ring */}
            <TouchableOpacity
              style={styles.avatarTouch}
              onPress={onAvatarPress}
              activeOpacity={0.8}
              accessibilityLabel="Profile settings"
            >
              <Image
                source={{
                  uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
                }}
                style={styles.avatarImg}
              />
              <View style={styles.avatarOnlineBadge} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 20,
    paddingBottom: 22,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#002B24',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 10,
  },
  headerWaveOverlay: {
    position: 'absolute',
    bottom: -60,
    left: -40,
    right: -40,
    height: 120,
    borderRadius: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    transform: [{ rotate: '-4deg' }],
  },
  statusBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statusBarTime: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  statusBarIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  batteryPill: {
    borderWidth: 1,
    borderColor: '#FFFFFF',
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 1,
    marginLeft: 2,
  },
  batteryText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  headerMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  greetingCol: {
    flex: 1,
    minWidth: 0,
    paddingRight: 12,
  },
  greetingSub: {
    fontSize: 12,
    fontWeight: '600',
    color: '#A7F3D0',
    marginBottom: 2,
    letterSpacing: 0.2,
  },
  greetingName: {
    fontSize: 19,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
    lineHeight: 24,
  },
  taglineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  sproutEmoji: {
    fontSize: 12,
    marginRight: 4,
  },
  greetingTagline: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.82)',
  },
  headerRightCol: {
    alignItems: 'flex-end',
    gap: 8,
  },
  dateCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    gap: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  dateCapsuleText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  actionIconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#F43F5E',
    borderWidth: 1.5,
    borderColor: '#004D40',
  },
  avatarTouch: {
    position: 'relative',
    marginLeft: 2,
  },
  avatarImg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#10B981',
  },
  avatarOnlineBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#004D40',
  },
});
