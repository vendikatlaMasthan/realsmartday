// SmartDay Ember Gradient Background (Section 0.5 Spec)
// Home: Blue-to-cyan gradient (matches center phone)
// Calendar + Timer: Full-bleed red-orange -> tangerine -> gold gradient with light bloom

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface EmberGradientBackgroundProps {
  variant: 'home' | 'calendar' | 'timer';
  children?: React.ReactNode;
}

export const EmberGradientBackground: React.FC<EmberGradientBackgroundProps> = ({
  variant,
  children,
}) => {
  // Home = Blue-to-cyan gradient
  // Calendar / Timer = Radiant red-orange -> tangerine -> gold
  const colors =
    variant === 'home'
      ? (['#060D1E', '#0A2540', '#0284C7'] as const)
      : (['#7C2D12', '#C2410C', '#EA580C', '#F59E0B'] as const);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={colors as any}
        start={{ x: 0.1, y: 0.1 }}
        end={{ x: 0.9, y: 0.95 }}
        style={styles.gradientFill}
      />
      {/* Subtle radiant bloom overlay */}
      {variant !== 'home' && (
        <View style={styles.bloomOverlay} pointerEvents="none">
          <View style={styles.bloomCircle} />
        </View>
      )}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gradientFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  bloomOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  bloomCircle: {
    width: 380,
    height: 380,
    borderRadius: 190,
    backgroundColor: 'rgba(251, 191, 36, 0.12)',
  },
});
