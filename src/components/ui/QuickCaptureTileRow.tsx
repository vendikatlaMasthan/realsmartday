// SmartDay — Dedicated <QuickCaptureTileRow> Component
// Strictly follows layout requirements:
// 1. Never let tiles overlap (uses flex-wrap: wrap with fixed gap)
// 2. Minimum width sufficient for longest label ("Reminder" / "Event")
// 3. flex-shrink: 0 on icon and label
// 4. Explicit gap between icon and label, no negative margins

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface CaptureTileItem {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  bg: string;
  color: string;
  onPress: () => void;
}

export interface QuickCaptureTileRowProps {
  items: CaptureTileItem[];
  style?: StyleProp<ViewStyle>;
}

export const QuickCaptureTileRow: React.FC<QuickCaptureTileRowProps> = ({
  items,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {items.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={[styles.tile, { backgroundColor: item.bg }]}
          onPress={item.onPress}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel={`Capture ${item.label}`}
        >
          <Ionicons
            name={item.icon}
            size={13}
            color={item.color}
            style={styles.tileIcon}
          />
          <Text
            style={[
              styles.tileLabel,
              { color: item.color },
              Platform.OS === 'web' && ({
                whiteSpace: 'nowrap',
                userSelect: 'none',
              } as any),
            ]}
            numberOfLines={1}
          >
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    width: '100%',
    alignItems: 'center',
  },
  tile: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    minWidth: 74,
    flexGrow: 1,
    flexShrink: 0,
    minHeight: 34,
  },
  tileIcon: {
    flexShrink: 0,
  },
  tileLabel: {
    fontSize: 11,
    fontWeight: '700',
    flexShrink: 0,
    letterSpacing: 0.1,
  },
});
