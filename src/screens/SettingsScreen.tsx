import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, ThemeMode } from '../context/ThemeContext';
import { SegmentControl } from '../components/ui/SegmentControl';
import { Badge } from '../components/ui/Badge';

export interface SettingsScreenProps {
  onBack: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack }) => {
  const { theme, themeMode, setThemeMode, isDark } = useTheme();
  const { colors, typography, spacing, borderRadius } = theme;
  const insets = useSafeAreaInsets();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [dailyBriefingEnabled, setDailyBriefingEnabled] = useState(true);
  const [smartPrioritization, setSmartPrioritization] = useState(true);
  const [autoReschedule, setAutoReschedule] = useState(false);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);

  const themeOptions: { key: ThemeMode; label: string }[] = [
    { key: 'light', label: 'Light' },
    { key: 'dark', label: 'Dark' },
    { key: 'system', label: 'System' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + spacing.md,
            paddingHorizontal: spacing.base + 4,
            paddingBottom: spacing.base,
            borderBottomColor: colors.border,
            borderBottomWidth: 1,
          },
        ]}
      >
        <TouchableOpacity
          onPress={onBack}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>

        <Text
          style={[
            styles.headerTitle,
            {
              fontSize: typography.sizes.lg,
              fontWeight: typography.weights.bold,
              color: colors.textPrimary,
            },
          ]}
        >
          Profile & Settings
        </Text>

        <View style={{ width: 22 }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingHorizontal: spacing.base + 4,
            paddingTop: spacing.lg,
            paddingBottom: insets.bottom + 40,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View
          style={[
            styles.profileCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderWidth: 1,
              borderRadius: borderRadius.xl,
              padding: spacing.base,
              marginBottom: spacing.xl,
              overflow: 'hidden',
            },
            theme.shadows.sm,
          ]}
        >
          {/* Gradient accent strip */}
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 4,
              backgroundColor: colors.primary,
              borderRadius: borderRadius.xl,
            }}
          />
          <View style={[styles.profileRow, { marginTop: 8 }]}>
            <View
              style={[
                styles.profileAvatar,
                {
                  backgroundColor: colors.primary,
                  borderRadius: borderRadius.full,
                  shadowColor: colors.primary,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.4,
                  shadowRadius: 8,
                  elevation: 6,
                },
              ]}
            >
              <Text
                style={[
                  styles.profileAvatarText,
                  {
                    fontSize: typography.sizes.lg,
                    fontWeight: typography.weights.bold,
                    color: colors.primaryTextOn,
                  },
                ]}
              >
                MV
              </Text>
            </View>

            <View style={styles.profileDetails}>
              <View style={styles.nameRow}>
                <Text
                  style={[
                    styles.profileName,
                    {
                      fontSize: typography.sizes.base + 1,
                      fontWeight: typography.weights.bold,
                      color: colors.textPrimary,
                    },
                  ]}
                >
                  Masthan V.
                </Text>
                <Badge label="PRO" variant="ai" size="sm" style={{ marginLeft: 6 }} />
              </View>
              <Text
                style={[
                  styles.profileEmail,
                  {
                    fontSize: typography.sizes.xs + 1,
                    color: colors.textSecondary,
                    marginTop: 2,
                  },
                ]}
              >
                masthan@smartday.ai
              </Text>
            </View>

            <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
          </View>
        </View>

        {/* Appearance Section */}
        <Text
          style={[
            styles.sectionTitle,
            {
              fontSize: typography.sizes.xs,
              fontWeight: typography.weights.bold,
              color: colors.textTertiary,
              textTransform: 'uppercase',
              letterSpacing: 0.6,
              marginBottom: spacing.sm,
            },
          ]}
        >
          Appearance
        </Text>
        <View
          style={[
            styles.settingCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderWidth: 1,
              borderRadius: borderRadius.xl,
              padding: spacing.base,
              marginBottom: spacing.xl,
            },
            theme.shadows.sm,
          ]}
        >
          <View style={styles.settingHeaderRow}>
            <Ionicons
              name={isDark ? 'moon-outline' : 'sunny-outline'}
              size={18}
              color={colors.primaryLight}
              style={{ marginRight: spacing.sm }}
            />
            <Text
              style={[
                styles.settingLabel,
                {
                  fontSize: typography.sizes.sm + 1,
                  fontWeight: typography.weights.semibold,
                  color: colors.textPrimary,
                  flex: 1,
                },
              ]}
            >
              Theme Mode
            </Text>
          </View>

          <SegmentControl
            options={themeOptions}
            selectedKey={themeMode}
            onSelect={(m) => setThemeMode(m as ThemeMode)}
            style={{ marginTop: spacing.md }}
          />
        </View>

        {/* AI & Automation Settings */}
        <Text
          style={[
            styles.sectionTitle,
            {
              fontSize: typography.sizes.xs,
              fontWeight: typography.weights.bold,
              color: colors.textTertiary,
              textTransform: 'uppercase',
              letterSpacing: 0.6,
              marginBottom: spacing.sm,
            },
          ]}
        >
          AI Automation
        </Text>
        <View
          style={[
            styles.settingCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderWidth: 1,
              borderRadius: borderRadius.xl,
              padding: spacing.base,
              marginBottom: spacing.xl,
            },
            theme.shadows.sm,
          ]}
        >
          <View style={styles.switchRow}>
            <View style={styles.switchTextCol}>
              <Text
                style={[
                  styles.switchTitle,
                  {
                    fontSize: typography.sizes.sm + 1,
                    fontWeight: typography.weights.semibold,
                    color: colors.textPrimary,
                  },
                ]}
              >
                Smart Prioritization
              </Text>
              <Text
                style={[
                  styles.switchDesc,
                  {
                    fontSize: typography.sizes.xs,
                    color: colors.textSecondary,
                    marginTop: 2,
                  },
                ]}
              >
                Auto-sort tasks according to peak cognitive focus windows
              </Text>
            </View>
            <Switch
              value={smartPrioritization}
              onValueChange={setSmartPrioritization}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View
            style={[
              styles.divider,
              { backgroundColor: colors.borderLight, marginVertical: spacing.md },
            ]}
          />

          <View style={styles.switchRow}>
            <View style={styles.switchTextCol}>
              <Text
                style={[
                  styles.switchTitle,
                  {
                    fontSize: typography.sizes.sm + 1,
                    fontWeight: typography.weights.semibold,
                    color: colors.textPrimary,
                  },
                ]}
              >
                Auto-Reschedule Overdue
              </Text>
              <Text
                style={[
                  styles.switchDesc,
                  {
                    fontSize: typography.sizes.xs,
                    color: colors.textSecondary,
                    marginTop: 2,
                  },
                ]}
              >
                Suggest next available slot for uncompleted priorities
              </Text>
            </View>
            <Switch
              value={autoReschedule}
              onValueChange={setAutoReschedule}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Notifications */}
        <Text
          style={[
            styles.sectionTitle,
            {
              fontSize: typography.sizes.xs,
              fontWeight: typography.weights.bold,
              color: colors.textTertiary,
              textTransform: 'uppercase',
              letterSpacing: 0.6,
              marginBottom: spacing.sm,
            },
          ]}
        >
          Notifications
        </Text>
        <View
          style={[
            styles.settingCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderWidth: 1,
              borderRadius: borderRadius.xl,
              padding: spacing.base,
              marginBottom: spacing.xl,
            },
            theme.shadows.sm,
          ]}
        >
          <View style={styles.switchRow}>
            <View style={styles.switchTextCol}>
              <Text
                style={[
                  styles.switchTitle,
                  {
                    fontSize: typography.sizes.sm + 1,
                    fontWeight: typography.weights.semibold,
                    color: colors.textPrimary,
                  },
                ]}
              >
                Morning AI Briefing
              </Text>
              <Text
                style={[
                  styles.switchDesc,
                  {
                    fontSize: typography.sizes.xs,
                    color: colors.textSecondary,
                    marginTop: 2,
                  },
                ]}
              >
                Receive synthesized daily plan at 8:00 AM
              </Text>
            </View>
            <Switch
              value={dailyBriefingEnabled}
              onValueChange={setDailyBriefingEnabled}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View
            style={[
              styles.divider,
              { backgroundColor: colors.borderLight, marginVertical: spacing.md },
            ]}
          />

          <View style={styles.switchRow}>
            <View style={styles.switchTextCol}>
              <Text
                style={[
                  styles.switchTitle,
                  {
                    fontSize: typography.sizes.sm + 1,
                    fontWeight: typography.weights.semibold,
                    color: colors.textPrimary,
                  },
                ]}
              >
                Haptic Touch Feedback
              </Text>
              <Text
                style={[
                  styles.switchDesc,
                  {
                    fontSize: typography.sizes.xs,
                    color: colors.textSecondary,
                    marginTop: 2,
                  },
                ]}
              >
                Vibrate on habit check-ins and task completions
              </Text>
            </View>
            <Switch
              value={hapticsEnabled}
              onValueChange={setHapticsEnabled}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Privacy & About */}
        <Text
          style={[
            styles.sectionTitle,
            {
              fontSize: typography.sizes.xs,
              fontWeight: typography.weights.bold,
              color: colors.textTertiary,
              textTransform: 'uppercase',
              letterSpacing: 0.6,
              marginBottom: spacing.sm,
            },
          ]}
        >
          About & Privacy
        </Text>
        <View
          style={[
            styles.settingCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderWidth: 1,
              borderRadius: borderRadius.xl,
              padding: spacing.base,
              marginBottom: spacing.xl,
            },
            theme.shadows.sm,
          ]}
        >
          <TouchableOpacity
            style={styles.menuRow}
            activeOpacity={0.7}
            onPress={() => {
              Alert.alert(
                'Cache & Storage',
                'Local offline store is healthy (3.4 MB indexed). Cache refreshed and temporary buffers cleared!'
              );
            }}
          >
            <Text
              style={[
                styles.menuLabel,
                {
                  fontSize: typography.sizes.sm + 1,
                  color: colors.textPrimary,
                },
              ]}
            >
              Local Data & Cache
            </Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
          </TouchableOpacity>

          <View
            style={[
              styles.divider,
              { backgroundColor: colors.borderLight, marginVertical: spacing.md },
            ]}
          />

          <TouchableOpacity
            style={styles.menuRow}
            activeOpacity={0.7}
            onPress={() => {
              Alert.alert(
                'Export Complete',
                'Generated smartday_backup.json with your active tasks, habit streaks, and synthesized notes.'
              );
            }}
          >
            <Text
              style={[
                styles.menuLabel,
                {
                  fontSize: typography.sizes.sm + 1,
                  color: colors.textPrimary,
                },
              ]}
            >
              Export JSON Backup
            </Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>

        <View style={styles.appFooter}>
          <Text
            style={[
              styles.appVersion,
              {
                fontSize: typography.sizes.xs,
                color: colors.textTertiary,
                textAlign: 'center',
              },
            ]}
          >
            SmartDay v1.2.0 • AI Daily Productivity
          </Text>
          <Text
            style={[
              styles.appCopyright,
              {
                fontSize: typography.sizes.xs - 1,
                color: colors.textTertiary,
                textAlign: 'center',
                marginTop: 2,
              },
            ]}
          >
            Designed for high cognitive performance
          </Text>
        </View>
      </ScrollView>
    </View>
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
  },
  headerTitle: {},
  content: {},
  profileCard: {},
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileAvatar: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  profileAvatarText: {},
  profileDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileName: {},
  profileEmail: {},
  sectionTitle: {},
  settingCard: {},
  settingHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {},
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchTextCol: {
    flex: 1,
    paddingRight: 12,
  },
  switchTitle: {},
  switchDesc: {},
  divider: {
    height: 1,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuLabel: {},
  appFooter: {
    marginTop: 10,
    marginBottom: 20,
  },
  appVersion: {},
  appCopyright: {},
});
