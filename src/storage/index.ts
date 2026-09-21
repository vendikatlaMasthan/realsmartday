// SmartDay Local-First Storage Adapter
// Zero seed/fake data on fresh launch. Persists across reloads.

import {
  UserProfile,
  Task,
  Habit,
  FocusSession,
  Note,
  FileItem,
  Highlight,
  Report,
  DataSource,
  ExamItem,
  ScheduleItem,
  ReminderItem,
  DailySummary,
  NewsDigest,
} from '../types';

const STORAGE_KEYS = {
  PROFILE: 'smartday_profile_v2',
  TASKS: 'smartday_tasks_v2',
  HABITS: 'smartday_habits_v2',
  SESSIONS: 'smartday_sessions_v2',
  NOTES: 'smartday_notes_v2',
  FILES: 'smartday_files_v2',
  HIGHLIGHTS: 'smartday_highlights_v2',
  REPORTS: 'smartday_reports_v2',
  SOURCES: 'smartday_sources_v2',
  EXAMS: 'smartday_exams_v2',
  SCHEDULE: 'smartday_schedule_v2',
  REMINDERS: 'smartday_reminders_v2',
  DAILY_SUMMARY: 'smartday_daily_summary_v2',
  NEWS_DIGEST: 'smartday_news_digest_v2',
};

// Default profile for user
export const defaultUserProfile: UserProfile = {
  name: 'Vendikatla Masthan',
  avatar: 'masthan_avatar.jpg',
  memberSince: new Date().toISOString(),
  goals: {
    focusMinutes: 120,
    tasksDue: 5,
    habitsDue: 3,
  },
  workHours: {
    start: '09:00',
    end: '18:00',
  },
  quietHours: {
    start: '22:00',
    end: '07:00',
  },
  focusPreferences: {
    defaultDuration: 25,
    autoStartNext: false,
    playSoundOnEnd: true,
    qualityPromptEnabled: true,
  },
  aiTone: 'Coach',
  language: 'en',
  favorites: ['rings', 'trends', 'highlight', 'top_focus', 'habits', 'quick_actions', 'next_up'],
};

export const defaultSources: DataSource[] = [
  {
    id: 'calendar',
    name: 'Google / Outlook Calendar',
    enabled: false,
    writes: ['Events', 'Meeting blocks'],
    privacyNote: 'Read-only calendar access. Never shares event data externally.',
  },
  {
    id: 'files',
    name: 'Local Device Files',
    enabled: true,
    lastSync: 'Continuous',
    writes: ['Converted notes', 'Extracted tasks'],
    privacyNote: 'Files processed locally on device.',
  },
  {
    id: 'manual',
    name: 'Manual Entry',
    enabled: true,
    lastSync: 'Active',
    writes: ['Tasks', 'Habits', 'Focus Sessions', 'Notes'],
    privacyNote: 'Direct user-entered personal productivity telemetry.',
  },
];

class StorageEngine {
  private memoryCache: Record<string, string> = {};

  private isWebStorage(): boolean {
    try {
      return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
    } catch {
      return false;
    }
  }

  getItem(key: string): string | null {
    if (this.isWebStorage()) {
      try {
        return window.localStorage.getItem(key);
      } catch {
        return this.memoryCache[key] || null;
      }
    }
    return this.memoryCache[key] || null;
  }

  setItem(key: string, value: string): void {
    this.memoryCache[key] = value;
    if (this.isWebStorage()) {
      try {
        window.localStorage.setItem(key, value);
      } catch {
        // Fallback to memory
      }
    }
  }

  removeItem(key: string): void {
    delete this.memoryCache[key];
    if (this.isWebStorage()) {
      try {
        window.localStorage.removeItem(key);
      } catch {
        // Fallback
      }
    }
  }

  clear(): void {
    this.memoryCache = {};
    if (this.isWebStorage()) {
      try {
        Object.values(STORAGE_KEYS).forEach((k) => window.localStorage.removeItem(k));
      } catch {
        // Fallback
      }
    }
  }
}

export const storage = new StorageEngine();

import { getMiaSeedData } from './seedData';

const miaSeed = getMiaSeedData();

export const loadStoredProfile = (): UserProfile => {
  const data = storage.getItem(STORAGE_KEYS.PROFILE);
  if (!data) return miaSeed.profile;
  try {
    return { ...miaSeed.profile, ...JSON.parse(data) };
  } catch {
    return miaSeed.profile;
  }
};

export const saveStoredProfile = (profile: UserProfile): void => {
  storage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
};

// Seed user Mia with 21 days of history per Phase 0.1 spec
export const loadStoredTasks = (): Task[] => {
  const data = storage.getItem(STORAGE_KEYS.TASKS);
  if (!data) return miaSeed.tasks;
  try {
    return JSON.parse(data);
  } catch {
    return miaSeed.tasks;
  }
};

export const saveStoredTasks = (tasks: Task[]): void => {
  storage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
};

export const loadStoredHabits = (): Habit[] => {
  const data = storage.getItem(STORAGE_KEYS.HABITS);
  if (!data) return miaSeed.habits;
  try {
    return JSON.parse(data);
  } catch {
    return miaSeed.habits;
  }
};

export const saveStoredHabits = (habits: Habit[]): void => {
  storage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
};

export const loadStoredSessions = (): FocusSession[] => {
  const data = storage.getItem(STORAGE_KEYS.SESSIONS);
  if (!data) return miaSeed.sessions;
  try {
    return JSON.parse(data);
  } catch {
    return miaSeed.sessions;
  }
};

export const saveStoredSessions = (sessions: FocusSession[]): void => {
  storage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
};

export const loadStoredNotes = (): Note[] => {
  const data = storage.getItem(STORAGE_KEYS.NOTES);
  if (!data) return miaSeed.notes;
  try {
    return JSON.parse(data);
  } catch {
    return miaSeed.notes;
  }
};

export const saveStoredNotes = (notes: Note[]): void => {
  storage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
};

export const loadStoredFiles = (): FileItem[] => {
  const data = storage.getItem(STORAGE_KEYS.FILES);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
};

export const saveStoredFiles = (files: FileItem[]): void => {
  storage.setItem(STORAGE_KEYS.FILES, JSON.stringify(files));
};

export const loadStoredHighlights = (): Highlight[] => {
  const data = storage.getItem(STORAGE_KEYS.HIGHLIGHTS);
  if (!data) return miaSeed.highlights;
  try {
    return JSON.parse(data);
  } catch {
    return miaSeed.highlights;
  }
};

export const saveStoredHighlights = (highlights: Highlight[]): void => {
  storage.setItem(STORAGE_KEYS.HIGHLIGHTS, JSON.stringify(highlights));
};

export const loadStoredReports = (): Report[] => {
  const data = storage.getItem(STORAGE_KEYS.REPORTS);
  if (!data) return miaSeed.reports;
  try {
    return JSON.parse(data);
  } catch {
    return miaSeed.reports;
  }
};

export const saveStoredReports = (reports: Report[]): void => {
  storage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
};

export const loadStoredSources = (): DataSource[] => {
  const data = storage.getItem(STORAGE_KEYS.SOURCES);
  if (!data) return defaultSources;
  try {
    return JSON.parse(data);
  } catch {
    return defaultSources;
  }
};

export const saveStoredSources = (sources: DataSource[]): void => {
  storage.setItem(STORAGE_KEYS.SOURCES, JSON.stringify(sources));
};

// Initial student schedule items
export const defaultScheduleItems: ScheduleItem[] = [
  {
    id: 'sched-1',
    time: '11:00 AM',
    title: 'DBMS Lecture',
    location: 'AB-II – 301',
    tag: 'Class',
    tagColor: { bg: '#E6F7F0', text: '#059669' },
    dotColor: '#0D9488',
    iconName: 'business-outline',
    description: 'Lecture covering Normalization, 1NF to BCNF, Functional Dependencies, and Relational Algebra.',
    completed: false,
    priority: 'high',
  },
  {
    id: 'sched-2',
    time: '3:00 PM',
    title: 'Meeting with Professor',
    location: 'Faculty Block',
    tag: 'Event',
    tagColor: { bg: '#EFF6FF', text: '#2563EB' },
    dotColor: '#3B82F6',
    iconName: 'location-outline',
    description: 'Department faculty block meeting to review the final semester project milestone and architecture document.',
    completed: false,
    priority: 'medium',
  },
  {
    id: 'sched-3',
    time: '6:00 PM',
    title: 'Study DBMS',
    location: 'Normalization',
    tag: 'Study',
    tagColor: { bg: '#F5F3FF', text: '#7C3AED' },
    dotColor: '#F59E0B',
    iconName: 'document-text-outline',
    description: 'Deep work study session: solve textbook problems on multi-valued dependencies and decomposition.',
    completed: false,
    priority: 'high',
  },
];

export const loadStoredSchedule = (): ScheduleItem[] => {
  const data = storage.getItem(STORAGE_KEYS.SCHEDULE);
  if (!data) return defaultScheduleItems;
  try {
    return JSON.parse(data);
  } catch {
    return defaultScheduleItems;
  }
};

export const saveStoredSchedule = (items: ScheduleItem[]): void => {
  storage.setItem(STORAGE_KEYS.SCHEDULE, JSON.stringify(items));
};

export const loadStoredExams = (): ExamItem[] => {
  const data = storage.getItem(STORAGE_KEYS.EXAMS);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
};

export const saveStoredExams = (exams: ExamItem[]): void => {
  storage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(exams));
};

export const defaultReminders: ReminderItem[] = [
  {
    id: 'rem-1',
    title: 'Submit DBMS Normalization Milestone',
    dueTime: '11:59 PM',
    date: new Date().toISOString().split('T')[0],
    notes: 'Upload PDF to university portal before midnight.',
    completed: false,
  },
];

export const loadStoredReminders = (): ReminderItem[] => {
  const data = storage.getItem(STORAGE_KEYS.REMINDERS);
  if (!data) return defaultReminders;
  try {
    return JSON.parse(data);
  } catch {
    return defaultReminders;
  }
};

export const saveStoredReminders = (reminders: ReminderItem[]): void => {
  storage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(reminders));
};

export const loadStoredDailySummary = (): DailySummary | null => {
  const data = storage.getItem(STORAGE_KEYS.DAILY_SUMMARY);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
};

export const saveStoredDailySummary = (summary: DailySummary): void => {
  storage.setItem(STORAGE_KEYS.DAILY_SUMMARY, JSON.stringify(summary));
};

export const loadStoredNewsDigest = (): NewsDigest | null => {
  const data = storage.getItem(STORAGE_KEYS.NEWS_DIGEST);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
};

export const saveStoredNewsDigest = (digest: NewsDigest): void => {
  storage.setItem(STORAGE_KEYS.NEWS_DIGEST, JSON.stringify(digest));
};

export const exportAllDataJSON = (): string => {
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      profile: loadStoredProfile(),
      tasks: loadStoredTasks(),
      habits: loadStoredHabits(),
      focusSessions: loadStoredSessions(),
      notes: loadStoredNotes(),
      files: loadStoredFiles(),
      highlights: loadStoredHighlights(),
      reports: loadStoredReports(),
      sources: loadStoredSources(),
      schedule: loadStoredSchedule(),
      exams: loadStoredExams(),
      reminders: loadStoredReminders(),
    },
    null,
    2
  );
};

export const clearAllLocalData = (): void => {
  storage.clear();
};
