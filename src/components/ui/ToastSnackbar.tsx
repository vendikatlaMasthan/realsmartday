// SmartDay Toast Snackbar (Section 4-A Spec)
// Floats at bottom for 4s with "Task completed · Undo" button

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { translate } from '../../i18n';
import { useSmartDay } from '../../context/SmartDayContext';

export const ToastSnackbar: React.FC = () => {
  const { theme, isDark } = useTheme();
  const { colors, typography, borderRadius } = theme;
  const { toast, dismissToast, profile } = useSmartDay();

  if (!toast.visible) return null;

  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      <View
        style={[
          styles.toastCard,
          {
            backgroundColor: isDark ? '#1E2126' : '#0F1720',
            borderRadius: borderRadius.full,
            borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
          },
          theme.shadows.md,
        ]}
      >
        <Text
          style={[
            styles.message,
            {
              color: '#FFFFFF',
              fontSize: 14,
              fontWeight: typography.weights.medium,
            },
          ]}
        >
          {toast.message}
        </Text>

        {toast.onUndo ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              toast.onUndo?.();
              dismissToast();
            }}
            style={styles.undoBtn}
          >
            <Text
              style={[
                styles.undoText,
                {
                  color: colors.primaryLight,
                  fontSize: 14,
                  fontWeight: typography.weights.bold,
                },
              ]}
            >
              {translate(profile.language, 'undo')}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 96,
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 9999,
  },
  toastCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 20,
    minWidth: 260,
    maxWidth: 400,
    borderWidth: 1,
  },
  message: {
    flex: 1,
  },
  undoBtn: {
    marginLeft: 16,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  undoText: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
