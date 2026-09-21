// SmartDay Persistent 4-Palette Dots Switcher (Section 0.3 Spec)
// Placed on Home top-right and Settings -> Appearance
// Instant restyle, 200ms fade, shows active ring indicator

import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useSkin } from './SkinContext';
import { SkinType } from './types';

interface SkinSwitcherDotsProps {
  showLabels?: boolean;
}

export const SkinSwitcherDots: React.FC<SkinSwitcherDotsProps> = ({ showLabels = false }) => {
  const { currentSkin, setSkin } = useSkin();

  const dots: { type: SkinType; color: string; label: string }[] = [
    { type: 'ember', color: '#F97316', label: 'Ember' },
    { type: 'halo', color: '#E2E8F0', label: 'Halo' },
    { type: 'grove', color: '#65A30D', label: 'Grove' },
    { type: 'noir', color: '#0D9488', label: 'Noir' },
  ];

  return (
    <View style={styles.container}>
      {dots.map((dot) => {
        const isActive = currentSkin === dot.type;
        return (
          <TouchableOpacity
            key={dot.type}
            onPress={() => setSkin(dot.type)}
            activeOpacity={0.7}
            accessibilityLabel={`Switch to ${dot.label} skin`}
            style={[
              styles.dotTouch,
              isActive && {
                borderWidth: 2,
                borderColor: '#FFFFFF',
                borderRadius: 14,
              },
            ]}
          >
            <View style={[styles.dot, { backgroundColor: dot.color }]} />
            {showLabels && (
              <Text
                style={[
                  styles.label,
                  { color: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.6)', fontWeight: isActive ? '700' : '500' },
                ]}
              >
                {dot.label}
              </Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 4,
  },
  dotTouch: {
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.25)',
  },
  label: {
    fontSize: 10,
    marginTop: 2,
  },
});
