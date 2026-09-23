// SmartDay — Mobile-First Personal Productivity OS
// Main Application Root with SkinProvider, 5 Tabs & Modals
// 5 Tabs: 1. Home | 2. Plan | 3. Sessions | 4. Metrics | 5. You
// Instant 200ms fade skin switching across Ember, Halo, Grove, Noir

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform, BackHandler } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import './src/theme/injectIconFont';
import { injectIconFonts } from './src/theme/injectIconFont';
import { SkinProvider, useSkin } from './src/skins/SkinContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { SmartDayProvider, useSmartDay } from './src/context/SmartDayContext';
import { BottomTabBar, TabKey } from './src/components/navigation/BottomTabBar';

// 5 Main Tab Screens
import { HomeScreen } from './src/screens/HomeScreen';
import { PlanScreen } from './src/screens/PlanScreen';
import { SessionsScreen } from './src/screens/SessionsScreen';
import { MetricsScreen } from './src/screens/MetricsScreen';
import { YouScreen } from './src/screens/YouScreen';

// Modals & Overlays
import { FocusSessionModal } from './src/components/ui/FocusSessionModal';
import { ToastSnackbar } from './src/components/ui/ToastSnackbar';
import { ReminderAlertBanner } from './src/components/ui/ReminderAlertBanner';
import { SearchModal } from './src/components/ui/SearchModal';
import { AddTaskModal } from './src/screens/AddTaskModal';
import { AddHabitModal } from './src/components/habits/AddHabitModal';
import { QuickNoteModal } from './src/components/notes/QuickNoteModal';
import { FileConverterModal } from './src/components/files/FileConverterModal';
import { WeeklyReportModal } from './src/components/ui/WeeklyReportModal';
import { QuickCreateActionSheet } from './src/components/home/QuickCreateActionSheet';
import { Task } from './src/types';

function MainNavigator() {
  const { skin, currentSkin } = useSkin();
  const { isDark } = useTheme();
  const {
    addTask,
    activeFocusSession,
    activeAlertReminder,
    snoozeReminder,
    completeReminder,
    dismissReminder,
  } = useSmartDay();

  // Active Tab: 5 Tabs
  const [activeTab, setActiveTab] = useState<TabKey>('home');

  // Modals state
  const [isFocusModalVisible, setIsFocusModalVisible] = useState(false);
  const [focusInitialTask, setFocusInitialTask] = useState<Task | undefined>(undefined);
  const [isAddTaskVisible, setIsAddTaskVisible] = useState(false);
  const [isAddHabitVisible, setIsAddHabitVisible] = useState(false);
  const [isQuickNoteVisible, setIsQuickNoteVisible] = useState(false);
  const [isFileConverterVisible, setIsFileConverterVisible] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isWeeklyReportVisible, setIsWeeklyReportVisible] = useState(false);
  const [isQuickCreateVisible, setIsQuickCreateVisible] = useState(false);

  // Focus trigger
  const handleOpenStartFocus = (task?: Task) => {
    setFocusInitialTask(task);
    setActiveTab('sessions');
  };

  const handleSaveTask = (taskData: any) => {
    addTask({
      title: taskData.title,
      notes: taskData.description,
      priority: taskData.priority === 'high' ? 'High' : taskData.priority === 'medium' ? 'Med' : 'Low',
      estimateMin: 25,
      due: 'Today',
      time: taskData.dueTime || undefined,
      tags: taskData.tags || [],
      subtasks: taskData.subtasks,
      reminderEnabled: taskData.reminderEnabled ?? true,
      reminderOffsetMin: taskData.reminderOffsetMin ?? 0,
    });
  };

  // Keyboard Shortcuts for Web/Desktop (X05)
  // 'N' new task, 'F' start focus, '/' search
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const handleKeyDown = (e: KeyboardEvent) => {
        const target = e.target as HTMLElement;
        if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
          return;
        }
        if (e.key === 'n' || e.key === 'N') {
          e.preventDefault();
          setIsAddTaskVisible(true);
        } else if (e.key === 'f' || e.key === 'F') {
          e.preventDefault();
          setActiveTab('sessions');
        } else if (e.key === '/') {
          e.preventDefault();
          setIsSearchVisible(true);
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, []);

  // Android Hardware & Gesture Back Navigation Handling
  useEffect(() => {
    if (Platform.OS === 'android') {
      const onBackPress = () => {
        if (isQuickCreateVisible) {
          setIsQuickCreateVisible(false);
          return true;
        }
        if (isAddTaskVisible) {
          setIsAddTaskVisible(false);
          return true;
        }
        if (isAddHabitVisible) {
          setIsAddHabitVisible(false);
          return true;
        }
        if (isQuickNoteVisible) {
          setIsQuickNoteVisible(false);
          return true;
        }
        if (isFileConverterVisible) {
          setIsFileConverterVisible(false);
          return true;
        }
        if (isSearchVisible) {
          setIsSearchVisible(false);
          return true;
        }
        if (isWeeklyReportVisible) {
          setIsWeeklyReportVisible(false);
          return true;
        }
        if (isFocusModalVisible) {
          setIsFocusModalVisible(false);
          return true;
        }
        if (activeTab !== 'home') {
          setActiveTab('home');
          return true;
        }
        return false; // Allow standard Android system back (exit or minimize)
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }
  }, [
    isQuickCreateVisible,
    isAddTaskVisible,
    isAddHabitVisible,
    isQuickNoteVisible,
    isFileConverterVisible,
    isSearchVisible,
    isWeeklyReportVisible,
    isFocusModalVisible,
    activeTab,
  ]);

  return (
    <View style={[styles.container, { backgroundColor: skin.colors.background }]}>
      <StatusBar style="light" />

      {/* Screen Container */}
      <View style={styles.screenContainer}>
        {activeTab === 'home' && (
          <HomeScreen
            onNavigateToPlan={() => setActiveTab('plan')}
            onNavigateToSessions={(task) => handleOpenStartFocus(task)}
            onNavigateToMetrics={() => setActiveTab('metrics')}
            onNavigateToYou={() => setActiveTab('you')}
            onOpenSearch={() => setIsSearchVisible(true)}
            onOpenAddTask={() => setIsAddTaskVisible(true)}
            onOpenLogHabit={() => setIsAddHabitVisible(true)}
            onOpenQuickNote={() => setIsQuickNoteVisible(true)}
            onOpenFileConverter={() => setIsFileConverterVisible(true)}
            onOpenWeeklyReport={() => setIsWeeklyReportVisible(true)}
          />
        )}

        {activeTab === 'plan' && (
          <PlanScreen
            onOpenAddTask={() => setIsAddTaskVisible(true)}
            onOpenStartFocus={(task) => handleOpenStartFocus(task)}
            onNavigateToYou={() => setActiveTab('you')}
          />
        )}

        {activeTab === 'sessions' && (
          <SessionsScreen
            initialTask={focusInitialTask}
            onNavigateToPlan={() => setActiveTab('plan')}
          />
        )}

        {activeTab === 'metrics' && (
          <MetricsScreen
            onOpenSearch={() => setIsSearchVisible(true)}
            onOpenStartFocus={() => handleOpenStartFocus()}
            onNavigateToPlan={() => setActiveTab('plan')}
          />
        )}

        {activeTab === 'you' && <YouScreen />}
      </View>

      {/* 5-Tab Floating Bottom Navigation Bar with Skin styling */}
      <BottomTabBar
        activeTab={activeTab}
        onTabPress={(tab) => setActiveTab(tab)}
        onOpenCreate={() => setIsQuickCreateVisible(true)}
      />

      {/* Quick Create Action Sheet (from Center + Button) */}
      <QuickCreateActionSheet
        visible={isQuickCreateVisible}
        onClose={() => setIsQuickCreateVisible(false)}
        onAddTask={() => setIsAddTaskVisible(true)}
        onAddEvent={() => setActiveTab('plan')}
        onAddExam={() => setActiveTab('home')}
        onAddNote={() => setIsQuickNoteVisible(true)}
        onStartFocus={() => handleOpenStartFocus()}
      />

      {/* Toast Notification (4s undo toast) */}
      <ToastSnackbar />

      {/* Global In-App Reminder Alert Banner (Plays Chime Sound & Banner) */}
      <ReminderAlertBanner
        reminder={activeAlertReminder}
        onSnooze={snoozeReminder}
        onComplete={completeReminder}
        onDismiss={dismissReminder}
      />

      {/* Full-Screen Focus Player Modal (when opened from Quick Actions) */}
      <FocusSessionModal
        visible={isFocusModalVisible}
        onClose={() => setIsFocusModalVisible(false)}
        initialTask={focusInitialTask}
      />

      {/* Add Task Modal */}
      <AddTaskModal
        visible={isAddTaskVisible}
        onClose={() => setIsAddTaskVisible(false)}
        onSaveTask={handleSaveTask}
      />

      {/* Add Habit Modal */}
      <AddHabitModal
        visible={isAddHabitVisible}
        onClose={() => setIsAddHabitVisible(false)}
      />

      {/* Quick Note Modal */}
      <QuickNoteModal
        visible={isQuickNoteVisible}
        onClose={() => setIsQuickNoteVisible(false)}
      />

      {/* File Converter Modal */}
      <FileConverterModal
        visible={isFileConverterVisible}
        onClose={() => setIsFileConverterVisible(false)}
      />

      {/* Search Modal (F35) */}
      <SearchModal
        visible={isSearchVisible}
        onClose={() => setIsSearchVisible(false)}
        onSelectResult={(type) => {
          if (type === 'task') setActiveTab('plan');
          else if (type === 'habit') setActiveTab('metrics');
          else setActiveTab('metrics');
        }}
      />

      {/* Weekly Report Modal (F11) */}
      <WeeklyReportModal
        visible={isWeeklyReportVisible}
        onClose={() => setIsWeeklyReportVisible(false)}
      />
    </View>
  );
}

export default function App() {
  useEffect(() => {
    injectIconFonts();
  }, []);

  return (
    <SafeAreaProvider>
      <SkinProvider>
        <ThemeProvider>
          <SmartDayProvider>
            <MainNavigator />
          </SmartDayProvider>
        </ThemeProvider>
      </SkinProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  screenContainer: {
    flex: 1,
  },
});
