// SmartDay Floating Navigation Bar
// Exact match to the reference screenshot: White floating pill with emerald active indicator and raised center '+' action button

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSkin } from '../../skins/SkinContext';

export type TabKey = 'home' | 'plan' | 'sessions' | 'metrics' | 'you';

export interface BottomTabBarProps {
  activeTab: TabKey;
  onTabPress: (tab: TabKey) => void;
  onOpenCreate?: () => void;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  activeTab,
  onTabPress,
  onOpenCreate,
}) => {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 10);

  return (
    <View style={[styles.wrapper, { paddingBottom: bottomPadding }]} pointerEvents="box-none">
      <View style={styles.floatingContainer}>
        {/* 1. HOME TAB */}
        <TouchableOpacity
          onPress={() => onTabPress('home')}
          activeOpacity={0.8}
          style={styles.tabBtn}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'home' }}
        >
          {activeTab === 'home' ? (
            <View style={styles.activeCapsule}>
              <Ionicons name="home" size={18} color="#059669" />
              <Text style={styles.activeText}>Home</Text>
            </View>
          ) : (
            <View style={styles.inactiveItem}>
              <Ionicons name="home-outline" size={20} color="#64748B" />
              <Text style={styles.inactiveText}>Home</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* 2. PLAN TAB */}
        <TouchableOpacity
          onPress={() => onTabPress('plan')}
          activeOpacity={0.8}
          style={styles.tabBtn}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'plan' }}
        >
          {activeTab === 'plan' ? (
            <View style={styles.activeCapsule}>
              <Ionicons name="calendar" size={18} color="#059669" />
              <Text style={styles.activeText}>Plan</Text>
            </View>
          ) : (
            <View style={styles.inactiveItem}>
              <Ionicons name="calendar-outline" size={20} color="#64748B" />
              <Text style={styles.inactiveText}>Plan</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* 3. CENTER RAISED ACTION BUTTON (+) */}
        <TouchableOpacity
          onPress={() => {
            if (onOpenCreate) {
              onOpenCreate();
            } else {
              onTabPress('plan');
            }
          }}
          activeOpacity={0.85}
          style={styles.centerRaisedTouch}
          accessibilityRole="button"
          accessibilityLabel="Create item"
        >
          <View style={styles.centerRaisedCircle}>
            <Ionicons name="add" size={28} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

        {/* 4. FOCUS TAB (Timer / Garden) */}
        <TouchableOpacity
          onPress={() => onTabPress('sessions')}
          activeOpacity={0.8}
          style={styles.tabBtn}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'sessions' }}
        >
          {activeTab === 'sessions' ? (
            <View style={styles.activeCapsule}>
              <Ionicons name="disc" size={18} color="#059669" />
              <Text style={styles.activeText}>Focus</Text>
            </View>
          ) : (
            <View style={styles.inactiveItem}>
              <Ionicons name="disc-outline" size={20} color="#64748B" />
              <Text style={styles.inactiveText}>Focus</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* 5. YOU TAB (Profile) */}
        <TouchableOpacity
          onPress={() => onTabPress('you')}
          activeOpacity={0.8}
          style={styles.tabBtn}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'you' }}
        >
          {activeTab === 'you' ? (
            <View style={styles.activeCapsule}>
              <Ionicons name="person" size={18} color="#059669" />
              <Text style={styles.activeText}>You</Text>
            </View>
          ) : (
            <View style={styles.inactiveItem}>
              <Ionicons name="person-outline" size={20} color="#64748B" />
              <Text style={styles.inactiveText}>You</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 99,
  },
  floatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 36,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
  },
  activeCapsule: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E6FBF2',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  activeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
    marginTop: 1,
  },
  inactiveItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  inactiveText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
  centerRaisedTouch: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -22, // Raised circle above the bar
    zIndex: 100,
  },
  centerRaisedCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#006951',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#004D40',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 10,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
});
