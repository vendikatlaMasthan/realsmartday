import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

export interface CircularActionButtonProps {
  label: string;
  iconName: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  size?: number;
  style?: ViewStyle;
  disabled?: boolean;
}

export const CircularActionButton: React.FC<CircularActionButtonProps> = ({
  label,
  iconName,
  onPress,
  size = 80,
  style,
  disabled = false,
}) => {
  const { theme } = useTheme();
  const { colors, typography, borderRadius } = theme;

  const ring1Size = size + 20; // first ring
  const ring2Size = size + 44; // outer ring

  return (
    <View style={[styles.wrapper, style]}>
      {/* Outermost ring */}
      <View
        style={[
          styles.ring,
          {
            width: ring2Size,
            height: ring2Size,
            borderRadius: ring2Size / 2,
            backgroundColor: `${colors.primary}10`,
          },
        ]}
      >
        {/* Inner ring */}
        <View
          style={[
            styles.ring,
            {
              width: ring1Size,
              height: ring1Size,
              borderRadius: ring1Size / 2,
              backgroundColor: `${colors.primary}22`,
            },
          ]}
        >
          {/* Center solid button */}
          <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.8}
            disabled={disabled}
            style={[
              styles.center,
              {
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: disabled ? colors.textTertiary : colors.primary,
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.5,
                shadowRadius: 16,
                elevation: 10,
              },
            ]}
          >
            <Ionicons
              name={iconName}
              size={size * 0.35}
              color={colors.primaryTextOn}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Label below */}
      <Text
        style={[
          styles.label,
          {
            fontSize: typography.sizes.sm,
            fontWeight: typography.weights.bold,
            color: colors.textPrimary,
            marginTop: 14,
            letterSpacing: 0.3,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    textAlign: 'center',
  },
});
