// SmartDay Unified Reactive State Context & Engine
// Zero seed data. Real live calculations. Instant reactivity across all 5 tabs.

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  UserProfile,
  Task,
  TaskCategory,
  Habit,
  FocusSession,
  Note,
  FileItem,
  Highlight,
  Report,
  DataSource,
  DailyRingsState,
  SupportedLanguage,
  ExamItem,
  ScheduleItem,
  ReminderItem,
  DailySummary,
  NewsDigest,
} from '../types';
import {
  loadStoredProfile,
  saveStoredProfile,
  loadStoredTasks,
  saveStoredTasks,
  loadStoredHabits,
  saveStoredHabits,
  loadStoredSessions,
  saveStoredSessions,
  loadStoredNotes,
  saveStoredNotes,
  loadStoredFiles,
  saveStoredFiles,
  loadStoredHighlights,
  saveStoredHighlights,
  loadStoredReports,
  saveStoredReports,
  loadStoredSources,
  saveStoredSources,
  loadStoredExams,
  saveStoredExams,
  loadStoredSchedule,
  saveStoredSchedule,
  loadStoredReminders,
  saveStoredReminders,
  loadStoredDailySummary,
  saveStoredDailySummary,
  loadStoredNewsDigest,
  saveStoredNewsDigest,
  clearAllLocalData,
} from '../storage';
import { translate } from '../i18n';
import { classifyTask, classifyTaskOffline, generateDailySummary, fetchDailyNewsDigest } from '../services/aiService';

interface ToastState {
  visible: boolean;
  message: string;
  onUndo?: () => void;
}

interface SmartDayContextType {
  // State
  profile: UserProfile;
  tasks: Task[];
  habits: Habit[];
  sessions: FocusSession[];
  notes: Note[];
  files: FileItem[];
  highlights: Highlight[];
  reports: Report[];
  sources: DataSource[];
  exams: ExamItem[];
  scheduleItems: ScheduleItem[];
  reminders: ReminderItem[];
  dailySummary: DailySummary | null;
  newsDigest: NewsDigest | null;
  activeAlarmReminder: ReminderItem | null;
  toast: ToastState;
  activeFocusSession: {
    isRunning: boolean;
    taskId?: string;
    taskTitle?: string;
    durationMinutes: number;
    elapsedSeconds: number;
  } | null;

  // Computed live metrics
  rings: DailyRingsState;
  todayTasks: Task[];
  todayFocusMinutes: number;
  currentStreak: number;

  // Task Actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'status'> & { category?: TaskCategory }) => void;
  toggleTask: (taskId: string) => void;
  deleteTask: (taskId: string) => void;
  updateTask: (task: Task) => void;
  rescheduleTask: (taskId: string, newTime?: string) => void;
  convertTaskToHabit: (taskId: string) => void;
  batchCompleteTasks: (taskIds: string[]) => void;
  batchDeleteTasks: (taskIds: string[]) => void;

  // Habit Actions
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'streak' | 'longest' | 'skips' | 'logs'>) => void;
  toggleHabitToday: (habitId: string) => void;
  skipHabitToday: (habitId: string) => boolean; // returns false if max skips reached
  archiveHabit: (habitId: string) => void;

  // Focus Session Actions
  startFocus: (durationMinutes: number, taskId?: string, taskTitle?: string) => void;
  pauseFocus: () => void;
  resumeFocus: () => void;
  endFocus: (actualMinutes: number, quality?: 1 | 2 | 3 | 4 | 5, note?: string) => void;
  cancelFocus: () => void;

  // Notes Actions
  addNote: (title: string, body: string, taskId?: string) => void;
  updateNote: (id: string, title: string, body: string) => void;
  deleteNote: (id: string) => void;
  togglePinNote: (id: string) => void;

  // Files Actions
  addFile: (file: Omit<FileItem, 'id' | 'uploadedAt'>) => void;

  // Exams Actions
  addExam: (exam: ExamItem) => void;
  deleteExam: (id: string) => void;

  // Schedule & Timetable Actions
  addScheduleItem: (item: Omit<ScheduleItem, 'id'>) => void;
  updateScheduleItem: (item: ScheduleItem) => void;
  toggleScheduleComplete: (id: string) => void;
  deleteScheduleItem: (id: string) => void;

  // Reminders & Alarm Actions
  addReminder: (title: string, dueTime: string, notes?: string) => void;
  deleteReminder: (id: string) => void;
  toggleReminderComplete: (id: string) => void;
  snoozeReminder: (id: string, minutes?: number) => void;
  triggerAlarm: (reminder: ReminderItem) => void;
  dismissAlarm: () => void;
  snoozeAlarm: (minutes?: number) => void;

  // Daily Summary & News Actions
  refreshDailySummary: () => Promise<void>;
  refreshNewsDigest: () => Promise<void>;

  // Profile & Preferences
  updateProfile: (partial: Partial<UserProfile>) => void;
  updateGoals: (goals: UserProfile['goals']) => void;
  setLanguage: (lang: SupportedLanguage) => void;
  reorderFavorites: (newFavorites: string[]) => void;
  toggleSource: (sourceId: string) => void;

  // Reports
  generateWeeklyReport: () => Report;

  // Reset & Toasts
  dismissToast: () => void;
  showToast: (message: string, onUndo?: () => void) => void;
  resetAllData: () => void;
}

const SmartDayContext = createContext<SmartDayContextType | undefined>(undefined);

export const SmartDayProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Initial State (loaded from storage; starts empty for fresh installs)
  const [profile, setProfile] = useState<UserProfile>(loadStoredProfile);
  const [tasks, setTasks] = useState<Task[]>(loadStoredTasks);
  const [habits, setHabits] = useState<Habit[]>(loadStoredHabits);
  const [sessions, setSessions] = useState<FocusSession[]>(loadStoredSessions);
  const [notes, setNotes] = useState<Note[]>(loadStoredNotes);
  const [files, setFiles] = useState<FileItem[]>(loadStoredFiles);
  const [highlights, setHighlights] = useState<Highlight[]>(loadStoredHighlights);
  const [reports, setReports] = useState<Report[]>(loadStoredReports);
  const [sources, setSources] = useState<DataSource[]>(loadStoredSources);

  // Active running focus session player
  const [activeFocusSession, setActiveFocusSession] = useState<{
    isRunning: boolean;
    taskId?: string;
    taskTitle?: string;
    durationMinutes: number;
    elapsedSeconds: number;
  } | null>(null);

  // Undo Toast state (4 seconds duration)
  const [toast, setToast] = useState<ToastState>({ visible: false, message: '' });

  // Persistence hooks
  useEffect(() => saveStoredProfile(profile), [profile]);
  useEffect(() => saveStoredTasks(tasks), [tasks]);
  useEffect(() => saveStoredHabits(habits), [habits]);
  useEffect(() => saveStoredSessions(sessions), [sessions]);
  useEffect(() => saveStoredNotes(notes), [notes]);
  useEffect(() => saveStoredFiles(files), [files]);
  useEffect(() => saveStoredHighlights(highlights), [highlights]);
  useEffect(() => saveStoredReports(reports), [reports]);
  useEffect(() => saveStoredSources(sources), [sources]);

  // Today string YYYY-MM-DD
  const todayStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  // Show Toast with auto-dismiss after 4000ms
  const showToast = useCallback((message: string, onUndo?: () => void) => {
    setToast({ visible: true, message, onUndo });
    setTimeout(() => {
      setToast((prev) => (prev.message === message ? { visible: false, message: '' } : prev));
    }, 4000);
  }, []);

  const dismissToast = useCallback(() => {
    setToast({ visible: false, message: '' });
  }, []);

  // 2. Computed Live Metrics
  // A) Focus Minutes Today
  const todayFocusMinutes = useMemo(() => {
    return sessions
      .filter((s) => s.end.startsWith(todayStr))
      .reduce((sum, s) => sum + s.minutes, 0);
  }, [sessions, todayStr]);

  // B) Tasks Today
  const todayTasks = useMemo(() => {
    return tasks.filter((t) => !t.due || t.due.startsWith(todayStr));
  }, [tasks, todayStr]);

  const tasksCompletedCount = useMemo(() => {
    return todayTasks.filter((t) => t.status === 'done').length;
  }, [todayTasks]);

  const tasksPlannedCount = useMemo(() => {
    return Math.max(todayTasks.length, profile.goals.tasksDue);
  }, [todayTasks.length, profile.goals.tasksDue]);

  // C) Habits Today
  const habitsDoneCount = useMemo(() => {
    return habits.filter((h) => h.logs.some((l) => l.date === todayStr && l.done)).length;
  }, [habits, todayStr]);

  const habitsDueCount = useMemo(() => {
    return Math.max(habits.length, profile.goals.habitsDue);
  }, [habits.length, profile.goals.habitsDue]);

  // D) Streak calculation from habits & tasks
  const currentStreak = useMemo(() => {
    if (habits.length === 0) return 0;
    const maxStreak = Math.max(...habits.map((h) => h.streak), 0);
    return maxStreak;
  }, [habits]);

  // E) Daily Concentric Rings State
  const rings: DailyRingsState = useMemo(() => {
    const focusGoal = profile.goals.focusMinutes || 120;
    const focusPercent = focusGoal > 0 ? Math.min(1, todayFocusMinutes / focusGoal) : 0;

    const tasksPercent = tasksPlannedCount > 0 ? Math.min(1, tasksCompletedCount / tasksPlannedCount) : 0;
    const habitsPercent = habitsDueCount > 0 ? Math.min(1, habitsDoneCount / habitsDueCount) : 0;

    let closed = 0;
    if (focusPercent >= 1) closed++;
    if (tasksPercent >= 1) closed++;
    if (habitsPercent >= 1) closed++;

    return {
      focusMinutes: todayFocusMinutes,
      focusGoal,
      focusPercent,

      tasksCompleted: tasksCompletedCount,
      tasksPlanned: tasksPlannedCount,
      tasksPercent,

      habitsCompleted: habitsDoneCount,
      habitsDue: habitsDueCount,
      habitsPercent,

      closedRingsCount: closed,
      streakDays: currentStreak,
    };
  }, [
    todayFocusMinutes,
    profile.goals.focusMinutes,
    tasksCompletedCount,
    tasksPlannedCount,
    habitsDoneCount,
    habitsDueCount,
    currentStreak,
  ]);

  // 3. Rule-Based Highlights Engine (Section 11 Spec)
  // Strictly requires >= 7 days or >= 5 samples; max 3/day; honest empty state otherwise
  useEffect(() => {
    const totalSamples = sessions.length + tasks.filter((t) => t.status === 'done').length + habits.reduce((acc, h) => acc + h.logs.length, 0);

    if (totalSamples < 5) {
      // Not enough data yet - keep highlights empty
      if (highlights.length > 0) setHighlights([]);
      return;
    }

    const newHighlights: Highlight[] = [];

    // Check personal best habit streak
    const bestHabit = habits.reduce((prev, curr) => (curr.streak > (prev?.streak || 0) ? curr : prev), habits[0]);
    if (bestHabit && bestHabit.streak >= 3) {
      newHighlights.push({
        id: `hl-streak-${bestHabit.id}`,
        type: 'Streak',
        title: `${bestHabit.streak}-day streak on ${bestHabit.name}!`,
        body: `You have maintained consistency on ${bestHabit.name} for ${bestHabit.streak} consecutive days.`,
        whyExplanation: 'Triggered when a habit reaches 3 or more consecutive logged days.',
        actionLabel: 'View Trend',
        actionTarget: 'trends',
        createdAt: new Date().toISOString(),
        read: false,
      });
    }

    // Check tasks closed vs planned
    const closedTasks = tasks.filter((t) => t.status === 'done');
    if (closedTasks.length >= 5) {
      newHighlights.push({
        id: 'hl-tasks-win',
        type: 'Win',
        title: `${closedTasks.length} tasks closed this cycle`,
        body: 'Your completion rate is trending ahead of your scheduled commitments.',
        whyExplanation: 'Triggered once 5 or more total tasks are successfully completed.',
        actionLabel: 'View Trend',
        actionTarget: 'trends',
        createdAt: new Date().toISOString(),
        read: false,
      });
    }

    // Check focus duration
    const totalFocus = sessions.reduce((s, x) => s + x.minutes, 0);
    if (totalFocus >= 60) {
      newHighlights.push({
        id: 'hl-focus-pattern',
        type: 'Pattern',
        title: 'Strong deep work momentum',
        body: `You have accumulated ${totalFocus} minutes of focused deep work sessions.`,
        whyExplanation: 'Triggered after exceeding 60 logged minutes of focused work.',
        actionLabel: 'Start Focus',
        actionTarget: 'focus',
        createdAt: new Date().toISOString(),
        read: false,
      });
    }

    // Max 3 highlights
    setHighlights(newHighlights.slice(0, 3));
  }, [sessions, tasks, habits]);

  // 4. Task Actions
  const addTask = useCallback((taskData: Omit<Task, 'id' | 'createdAt' | 'status'>) => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
      status: 'scheduled',
      tags: taskData.tags || [],
    };
    setTasks((prev) => [newTask, ...prev]);
  }, []);

  const toggleTask = useCallback(
    (taskId: string) => {
      const target = tasks.find((t) => t.id === taskId);
      if (!target) return;

      const willBeComplete = target.status !== 'done';
      const prevStatus = target.status;
      const prevCompletedAt = target.completedAt;

      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? {
                ...t,
                status: willBeComplete ? 'done' : 'scheduled',
                completedAt: willBeComplete ? new Date().toISOString() : undefined,
              }
            : t
        )
      );

      if (willBeComplete) {
        showToast(translate(profile.language, 'taskCompletedToast'), () => {
          // Revert on Undo
          setTasks((prev) =>
            prev.map((t) =>
              t.id === taskId ? { ...t, status: prevStatus, completedAt: prevCompletedAt } : t
            )
          );
        });
      }
    },
    [tasks, profile.language, showToast]
  );

  const deleteTask = useCallback((taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  }, []);

  const updateTask = useCallback((updated: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  }, []);

  const rescheduleTask = useCallback((taskId: string, newTime?: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, time: newTime || '14:00' } : t))
    );
  }, []);

  const convertTaskToHabit = useCallback((taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const newHabit: Habit = {
      id: `habit-${Date.now()}`,
      name: task.title,
      description: task.notes || '',
      schedule: 'daily',
      streak: 0,
      longest: 0,
      skips: [],
      logs: [],
      createdAt: new Date().toISOString(),
    };
    setHabits((prev) => [newHabit, ...prev]);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  }, [tasks]);

  const batchCompleteTasks = useCallback((taskIds: string[]) => {
    setTasks((prev) =>
      prev.map((t) =>
        taskIds.includes(t.id) ? { ...t, status: 'done', completedAt: new Date().toISOString() } : t
      )
    );
  }, []);

  const batchDeleteTasks = useCallback((taskIds: string[]) => {
    setTasks((prev) => prev.filter((t) => !taskIds.includes(t.id)));
  }, []);

  // 5. Habit Actions (Section 4-B Spec)
  const addHabit = useCallback(
    (habitData: Omit<Habit, 'id' | 'createdAt' | 'streak' | 'longest' | 'skips' | 'logs'>) => {
      const newHabit: Habit = {
        ...habitData,
        id: `habit-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        streak: 0,
        longest: 0,
        skips: [],
        logs: [],
        createdAt: new Date().toISOString(),
      };
      setHabits((prev) => [newHabit, ...prev]);
    },
    []
  );

  const toggleHabitToday = useCallback(
    (habitId: string) => {
      setHabits((prev) =>
        prev.map((h) => {
          if (h.id !== habitId) return h;

          const todayLogIndex = h.logs.findIndex((l) => l.date === todayStr);
          const wasDone = todayLogIndex >= 0 && h.logs[todayLogIndex].done;

          let updatedLogs = [...h.logs];
          if (todayLogIndex >= 0) {
            if (wasDone) {
              // Un-check same day: reverse streak
              updatedLogs.splice(todayLogIndex, 1);
            } else {
              updatedLogs[todayLogIndex] = { date: todayStr, done: true };
            }
          } else {
            updatedLogs.push({ date: todayStr, done: true });
          }

          const newStreak = wasDone ? Math.max(0, h.streak - 1) : h.streak + 1;
          const newLongest = Math.max(h.longest, newStreak);

          return {
            ...h,
            streak: newStreak,
            longest: newLongest,
            logs: updatedLogs,
          };
        })
      );
    },
    [todayStr]
  );

  // Skip today (freeze streak, max 2 skips in 30 days)
  const skipHabitToday = useCallback(
    (habitId: string): boolean => {
      let success = false;
      setHabits((prev) =>
        prev.map((h) => {
          if (h.id !== habitId) return h;

          // Check if user has already used 2 skips in past 30 days
          const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
          const recentSkips = h.skips.filter((s) => new Date(s).getTime() > thirtyDaysAgo);

          if (recentSkips.length >= 2) {
            return h;
          }

          success = true;
          const updatedLogs = h.logs.filter((l) => l.date !== todayStr);
          updatedLogs.push({ date: todayStr, done: false, skipped: true });

          return {
            ...h,
            skips: [...h.skips, todayStr],
            logs: updatedLogs,
          };
        })
      );
      return success;
    },
    [todayStr]
  );

  const archiveHabit = useCallback((habitId: string) => {
    setHabits((prev) => prev.map((h) => (h.id === habitId ? { ...h, archived: true } : h)));
  }, []);

  // 6. Focus Session Actions
  const startFocus = useCallback((durationMinutes: number, taskId?: string, taskTitle?: string) => {
    setActiveFocusSession({
      isRunning: true,
      taskId,
      taskTitle,
      durationMinutes,
      elapsedSeconds: 0,
    });
  }, []);

  const pauseFocus = useCallback(() => {
    setActiveFocusSession((prev) => (prev ? { ...prev, isRunning: false } : null));
  }, []);

  const resumeFocus = useCallback(() => {
    setActiveFocusSession((prev) => (prev ? { ...prev, isRunning: true } : null));
  }, []);

  const endFocus = useCallback(
    (actualMinutes: number, quality?: 1 | 2 | 3 | 4 | 5, note?: string) => {
      const now = new Date();
      const startTime = new Date(now.getTime() - actualMinutes * 60000);

      const newSession: FocusSession = {
        id: `session-${Date.now()}`,
        taskId: activeFocusSession?.taskId,
        taskTitle: activeFocusSession?.taskTitle,
        start: startTime.toISOString(),
        end: now.toISOString(),
        minutes: actualMinutes,
        quality,
        note,
      };

      setSessions((prev) => [newSession, ...prev]);

      // If linked to a task, update actualMin
      if (activeFocusSession?.taskId) {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === activeFocusSession.taskId
              ? { ...t, actualMin: (t.actualMin || 0) + actualMinutes }
              : t
          )
        );
      }

      setActiveFocusSession(null);
    },
    [activeFocusSession]
  );

  const cancelFocus = useCallback(() => {
    setActiveFocusSession(null);
  }, []);

  // 7. Notes Actions
  const addNote = useCallback((title: string, body: string, taskId?: string) => {
    const newNote: Note = {
      id: `note-${Date.now()}`,
      title,
      body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      taskId,
      pinned: false,
      tags: [],
    };
    setNotes((prev) => [newNote, ...prev]);
  }, []);

  const deleteNote = useCallback((id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const togglePinNote = useCallback((id: string) => {
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n)));
  }, []);

  // 8. Files Actions
  const addFile = useCallback((fileData: Omit<FileItem, 'id' | 'uploadedAt'>) => {
    const newFile: FileItem = {
      ...fileData,
      id: `file-${Date.now()}`,
      uploadedAt: new Date().toISOString(),
    };
    setFiles((prev) => [newFile, ...prev]);
  }, []);

  // 9. Profile & Settings
  const updateProfile = useCallback((partial: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...partial }));
  }, []);

  const updateGoals = useCallback((goals: UserProfile['goals']) => {
    setProfile((prev) => ({ ...prev, goals }));
  }, []);

  const setLanguage = useCallback((language: SupportedLanguage) => {
    setProfile((prev) => ({ ...prev, language }));
  }, []);

  const reorderFavorites = useCallback((newFavorites: string[]) => {
    setProfile((prev) => ({ ...prev, favorites: newFavorites }));
  }, []);

  const toggleSource = useCallback((sourceId: string) => {
    setSources((prev) =>
      prev.map((s) => (s.id === sourceId ? { ...s, enabled: !s.enabled } : s))
    );
  }, []);

  // 10. Weekly Reports Generator
  const generateWeeklyReport = useCallback((): Report => {
    const focusTotal = sessions.reduce((s, x) => s + x.minutes, 0);
    const tasksTotal = tasks.filter((t) => t.status === 'done').length;
    const topStreak = Math.max(...habits.map((h) => h.streak), 0);

    const report: Report = {
      id: `report-${Date.now()}`,
      weekOf: todayStr,
      payload: {
        weekOf: todayStr,
        focusMinutesTotal: focusTotal,
        tasksCompletedTotal: tasksTotal,
        longestHabitStreak: topStreak,
        highlightSummary: `Completed ${tasksTotal} tasks and sustained ${focusTotal}m deep work.`,
        ringsClosedCount: rings.closedRingsCount,
        nextWeekFocusGoal: profile.goals.focusMinutes * 7,
      },
      createdAt: new Date().toISOString(),
    };

    setReports((prev) => [report, ...prev]);
    return report;
  }, [sessions, tasks, habits, todayStr, rings.closedRingsCount, profile.goals.focusMinutes]);

  // 11. Clear All Data
  const resetAllData = useCallback(() => {
    clearAllLocalData();
    setTasks([]);
    setHabits([]);
    setSessions([]);
    setNotes([]);
    setFiles([]);
    setHighlights([]);
    setReports([]);
  }, []);

  const contextValue = useMemo(
    () => ({
      profile,
      tasks,
      habits,
      sessions,
      notes,
      files,
      highlights,
      reports,
      sources,
      toast,
      activeFocusSession,
      rings,
      todayTasks,
      todayFocusMinutes,
      currentStreak,
      addTask,
      toggleTask,
      deleteTask,
      updateTask,
      rescheduleTask,
      convertTaskToHabit,
      batchCompleteTasks,
      batchDeleteTasks,
      addHabit,
      toggleHabitToday,
      skipHabitToday,
      archiveHabit,
      startFocus,
      pauseFocus,
      resumeFocus,
      endFocus,
      cancelFocus,
      addNote,
      deleteNote,
      togglePinNote,
      addFile,
      updateProfile,
      updateGoals,
      setLanguage,
      reorderFavorites,
      toggleSource,
      generateWeeklyReport,
      dismissToast,
      showToast,
      resetAllData,
    }),
    [
      profile,
      tasks,
      habits,
      sessions,
      notes,
      files,
      highlights,
      reports,
      sources,
      toast,
      activeFocusSession,
      rings,
      todayTasks,
      todayFocusMinutes,
      currentStreak,
      addTask,
      toggleTask,
      deleteTask,
      updateTask,
      rescheduleTask,
      convertTaskToHabit,
      batchCompleteTasks,
      batchDeleteTasks,
      addHabit,
      toggleHabitToday,
      skipHabitToday,
      archiveHabit,
      startFocus,
      pauseFocus,
      resumeFocus,
      endFocus,
      cancelFocus,
      addNote,
      deleteNote,
      togglePinNote,
      addFile,
      updateProfile,
      updateGoals,
      setLanguage,
      reorderFavorites,
      toggleSource,
      generateWeeklyReport,
      dismissToast,
      showToast,
      resetAllData,
    ]
  );

  return <SmartDayContext.Provider value={contextValue}>{children}</SmartDayContext.Provider>;
};

export const useSmartDay = (): SmartDayContextType => {
  const context = useContext(SmartDayContext);
  if (!context) {
    throw new Error('useSmartDay must be used within a SmartDayProvider');
  }
  return context;
};
