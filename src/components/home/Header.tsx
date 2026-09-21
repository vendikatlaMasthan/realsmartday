import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

export interface HeaderProps {
  onSettingsPress: () => void;
  onNotificationsPress?: () => void;
  greeting?: string;
  userName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onSettingsPress,
  onNotificationsPress,
  greeting = 'Good afternoon,',
  userName = 'Masthan',
}) => {
  const { theme, isDark } = useTheme();
  const { colors, typography, spacing, borderRadius } = theme;

  const today = new Date();
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  };
  const formattedDate = today.toLocaleDateString('en-US', options);

  return (
    <View style={[styles.container, { marginBottom: spacing.lg }]}>
      <View style={styles.leftColumn}>
        <View style={styles.dateRow}>
          <Ionicons
            name="calendar-clear-outline"
            size={13}
            color={colors.primaryLight}
            style={{ marginRight: 5 }}
          />
          <Text
            style={[
              styles.dateText,
              {
                fontSize: typography.sizes.xs + 1,
                fontWeight: typography.weights.semibold,
                color: colors.primaryLight,
                textTransform: 'uppercase',
                letterSpacing: 0.7,
              },
            ]}
          >
            {formattedDate}
          </Text>
        </View>

        <Text
          style={[
            styles.greeting,
            {
              fontSize: typography.sizes['2xl'] + 2,
              fontWeight: typography.weights.extrabold,
              color: colors.textPrimary,
              letterSpacing: -0.8,
              marginTop: 3,
              lineHeight: 32,
            },
          ]}
        >
          {greeting}{'\n'}
          <Text style={{ color: colors.primaryLight }}>{userName}</Text>
          <Text style={{ fontSize: typography.sizes.xl + 2 }}> 👋</Text>
        </Text>
      </View>

      <View style={styles.rightActions}>
        {/* Notification bell */}
        <TouchableOpacity
          onPress={onNotificationsPress}
          activeOpacity={0.7}
          style={[
            styles.iconButton,
            {
              backgroundColor: colors.surfaceSecondary,
              borderColor: colors.border,
              borderRadius: borderRadius.full,
              borderWidth: 1,
              marginRight: spacing.sm,
            },
          ]}
        >
          <Ionicons
            name="notifications-outline"
            size={20}
            color={colors.textPrimary}
          />
          <View
            style={[
              styles.notificationDot,
              {
                backgroundColor: '#EF4444',
                borderColor: colors.surface,
              },
            ]}
          />
        </TouchableOpacity>

        {/* Avatar */}
        <TouchableOpacity
          onPress={onSettingsPress}
          activeOpacity={0.7}
          style={[
            styles.avatarButton,
            {
              backgroundColor: colors.primary,
              borderRadius: borderRadius.full,
              borderColor: isDark
                ? 'rgba(99,102,241,0.4)'
                : colors.primarySurface,
              borderWidth: 2,
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.4,
              shadowRadius: 8,
              elevation: 6,
            },
          ]}
        >
          <Text
            style={[
              styles.avatarText,
              {
                fontSize: typography.sizes.sm,
                fontWeight: typography.weights.bold,
                color: colors.primaryTextOn,
              },
            ]}
          >
            MV
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  leftColumn: {
    flex: 1,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {},
  greeting: {},
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  iconButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
  },
  avatarButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {},
});
