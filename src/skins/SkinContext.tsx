// SmartDay Skin Switcher Context (Phase 0.3 Spec)
// Persistent: 4 palette dots top-right on Home AND Settings -> Appearance
// Skins: Ember | Halo | Grove | Noir. 200ms fade, does NOT remount the app.
// Default: Ember.

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { Animated } from 'react-native';
import { SkinType, SkinPalette, SKINS } from './types';
import { storage } from '../storage';

const SKIN_STORAGE_KEY = 'smartday_skin_v2';

interface SkinContextType {
  currentSkin: SkinType;
  skin: SkinPalette;
  setSkin: (skin: SkinType) => void;
  fadeAnim: Animated.Value;
  availableSkins: SkinPalette[];
}

const SkinContext = createContext<SkinContextType | undefined>(undefined);

export const SkinProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load saved skin or default to 'ember'
  const [currentSkin, setCurrentSkinState] = useState<SkinType>(() => {
    const saved = storage.getItem(SKIN_STORAGE_KEY);
    if (saved && (saved === 'ember' || saved === 'halo' || saved === 'grove' || saved === 'noir')) {
      return saved as SkinType;
    }
    return 'ember';
  });

  const fadeAnim = useMemo(() => new Animated.Value(1), []);

  const setSkin = useCallback(
    (newSkin: SkinType) => {
      if (newSkin === currentSkin) return;

      // 200ms smooth fade transition
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.6,
          duration: 90,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 110,
          useNativeDriver: true,
        }),
      ]).start();

      setCurrentSkinState(newSkin);
      storage.setItem(SKIN_STORAGE_KEY, newSkin);
    },
    [currentSkin, fadeAnim]
  );

  const skin = useMemo(() => SKINS[currentSkin], [currentSkin]);
  const availableSkins = useMemo(() => Object.values(SKINS), []);

  return (
    <SkinContext.Provider value={{ currentSkin, skin, setSkin, fadeAnim, availableSkins }}>
      {children}
    </SkinContext.Provider>
  );
};

export const useSkin = (): SkinContextType => {
  const context = useContext(SkinContext);
  if (!context) {
    throw new Error('useSkin must be used within a SkinProvider');
  }
  return context;
};
