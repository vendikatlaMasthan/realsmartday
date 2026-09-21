// SmartDay Vector Circular Progress Ring Component
// Produces crisp circular arcs on Web & Native with smooth SVG-like stroke rendering

import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

interface CircularProgressProps {
  size: number;
  strokeWidth: number;
  progress: number; // 0 to 1
  color: string;
  trackColor?: string;
  label?: string;
  sublabel?: string;
  centerElement?: React.ReactNode;
  isOpenArc?: boolean;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  size,
  strokeWidth,
  progress,
  color,
  trackColor = '#E2E8F0',
  label,
  sublabel,
  centerElement,
  isOpenArc = false,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - Math.min(Math.max(progress, 0), 1));

  if (Platform.OS === 'web') {
    // Render standard SVG on web for vector quality
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ transform: 'rotate(-90deg)' }}
        >
          {/* Background track circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={trackColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={isOpenArc ? `${circumference * 0.75} ${circumference * 0.25}` : undefined}
            strokeLinecap="round"
          />
          {/* Foreground progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={isOpenArc ? circumference * (1 - progress * 0.75) : strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 0.6s ease-out',
            }}
          />
        </svg>

        {/* Center content */}
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <View style={styles.centerBox}>
            {centerElement ? (
              centerElement
            ) : label ? (
              <>
                <Text style={styles.labelText}>{label}</Text>
                {sublabel && <Text style={styles.sublabelText}>{sublabel}</Text>}
              </>
            ) : null}
          </View>
        </View>
      </View>
    );
  }

  // Fallback for native runtime
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View
        style={[
          styles.nativeCircle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: trackColor,
            borderTopColor: color,
            borderRightColor: progress >= 0.25 ? color : trackColor,
            borderBottomColor: progress >= 0.5 ? color : trackColor,
            borderLeftColor: progress >= 0.75 ? color : trackColor,
            transform: [{ rotate: '-45deg' }],
          },
        ]}
      />
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={styles.centerBox}>
          {centerElement ? (
            centerElement
          ) : label ? (
            <>
              <Text style={styles.labelText}>{label}</Text>
              {sublabel && <Text style={styles.sublabelText}>{sublabel}</Text>}
            </>
          ) : null}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  sublabelText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    marginTop: -2,
  },
  nativeCircle: {
    position: 'absolute',
  },
});
