// SmartDay Grove Topographic Contour Background
// Beautiful organic olive topographic map curves flowing across the screen.

import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const TopoBackground: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <View style={styles.container}>
      {/* Topo lines rendered with layered curved elements */}
      <View style={styles.topoLayer} pointerEvents="none">
        {/* Concentric organic contour rings */}
        <View style={[styles.contourRing, { top: -60, right: -40, width: 420, height: 420, borderRadius: 210 }]} />
        <View style={[styles.contourRing, { top: -20, right: 0, width: 340, height: 340, borderRadius: 170 }]} />
        <View style={[styles.contourRing, { top: 20, right: 40, width: 260, height: 260, borderRadius: 130 }]} />
        <View style={[styles.contourRing, { top: 60, right: 80, width: 180, height: 180, borderRadius: 90 }]} />

        {/* Lower elevation contours */}
        <View style={[styles.contourRing, { bottom: 120, left: -100, width: 520, height: 440, borderRadius: 240 }]} />
        <View style={[styles.contourRing, { bottom: 160, left: -60, width: 420, height: 360, borderRadius: 200 }]} />
        <View style={[styles.contourRing, { bottom: 200, left: -20, width: 320, height: 280, borderRadius: 160 }]} />
        <View style={[styles.contourRing, { bottom: 240, left: 20, width: 220, height: 200, borderRadius: 110 }]} />

        {/* Diagonal contour ridges */}
        <View style={[styles.contourRidge, { top: height * 0.38, left: -50, width: width + 120 }]} />
        <View style={[styles.contourRidge, { top: height * 0.44, left: -40, width: width + 100 }]} />
        <View style={[styles.contourRidge, { top: height * 0.50, left: -60, width: width + 140 }]} />
      </View>

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
    backgroundColor: '#3A4434', // Deep Olive
  },
  topoLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  contourRing: {
    position: 'absolute',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.07)',
  },
  contourRidge: {
    position: 'absolute',
    height: 120,
    borderTopWidth: 1.5,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    borderBottomWidth: 1.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    transform: [{ rotate: '-8deg' }],
    borderRadius: 80,
  },
});
