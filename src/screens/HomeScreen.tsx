// SmartDay Home Screen - Student OS UI
// Complete implementation matching user's reference screenshot for VENDIKATLA MASTHAN

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SmartDayStudentHome } from '../components/home/SmartDayStudentHome';
import { Task } from '../types';

interface HomeScreenProps {
  onNavigateToPlan: () => void;
  onNavigateToSessions: (task?: Task) => void;
  onNavigateToMetrics: () => void;
  onNavigateToYou: () => void;
  onOpenSearch: () => void;
  onOpenAddTask: () => void;
  onOpenLogHabit: () => void;
  onOpenQuickNote: () => void;
  onOpenFileConverter: () => void;
  onOpenWeeklyReport: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigateToPlan,
  onNavigateToSessions,
  onNavigateToMetrics,
  onNavigateToYou,
  onOpenSearch,
  onOpenAddTask,
  onOpenLogHabit,
  onOpenQuickNote,
  onOpenFileConverter,
  onOpenWeeklyReport,
}) => {
  return (
    <View style={styles.container}>
      <SmartDayStudentHome
        onNavigateToPlan={onNavigateToPlan}
        onNavigateToSessions={onNavigateToSessions}
        onNavigateToMetrics={onNavigateToMetrics}
        onNavigateToYou={onNavigateToYou}
        onOpenSearch={onOpenSearch}
        onOpenAddTask={onOpenAddTask}
        onOpenLogHabit={onOpenLogHabit}
        onOpenQuickNote={onOpenQuickNote}
        onOpenFileConverter={onOpenFileConverter}
        onOpenWeeklyReport={onOpenWeeklyReport}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
});
