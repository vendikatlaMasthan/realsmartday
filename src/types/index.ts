// SmartDay Core Domain Models & Types

export type Priority = 'High' | 'Med' | 'Low';
export type TaskCategory = 'work' | 'personal' | 'urgent';
export type TaskStatus = 'inbox' | 'scheduled' | 'doing' | 'done';
export type RecurrencePattern = 'none' | 'daily' | 'weekdays' | 'weekly';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  notes?: string;
  priority: Priority;
  category?: TaskCategory; // AI auto-categorized or manually edited (Work, Personal, Urgent)
  estimateMin: number;
  actualMin?: number;
  due?: string; // ISO or YYYY-MM-DD
  time?: string; // HH:mm
  status: TaskStatus;
  tags: string[];
  subtasks?: Subtask[];
  linkedNoteId?: string;
  linkedFocusSessionId?: string;
  recurrence?: RecurrencePattern;
  createdAt: string;
  completedAt?: string;
}

export interface ExamItem {
  id: string;
  courseCode: string;
  courseTitle: string;
  date: string;
  venue: string;
  time?: string;
  notes?: string;
  createdAt?: string;
}

export interface ScheduleItem {
  id: string;
  time: string;
  title: string;
  location: string;
  tag: 'Class' | 'Event' | 'Study' | 'Exam';
  tagColor?: { bg: string; text: string };
  dotColor?: string;
  iconName?: string;
  description?: string;
  completed?: boolean;
  priority?: 'high' | 'medium' | 'low';
  date?: string; // YYYY-MM-DD
  courseCode?: string;
}

export interface ReminderItem {
  id: string;
  title: string;
  dueTime: string; // e.g. "10:30 AM" or ISO
  date?: string;   // YYYY-MM-DD
  notes?: string;
  snoozedUntil?: string;
  completed: boolean;
  alarmFired?: boolean;
  taskId?: string;
}

export interface DailySummary {
  date: string; // YYYY-MM-DD
  summaryText: string;
  topPriority: string;
  totalPending: number;
  generatedAt: string;
  isAiGenerated: boolean;
}

export interface NewsDigestItem {
  id: string;
  title: string;
  source: string;
  snippet: string;
  category: string;
  timeAgo?: string;
  url?: string;
}

export interface NewsDigest {
  date: string; // YYYY-MM-DD
  headlineSummary: string;
  items: NewsDigestItem[];
  fetchedAt: string;
  isAiSummarized: boolean;
}

export interface HabitLog {
  date: string; // YYYY-MM-DD
  done: boolean;
  skipped?: boolean;
}

export interface Habit {
  id: string;
  name: string;
  description?: string;
  schedule: 'daily' | 'weekdays' | 'weekends' | string[];
  reminderTime?: string;
  colorPip?: string; // Left color accent pip only
  streak: number;
  longest: number;
  skips: string[]; // dates of skips (max 2 per 30 days)
  logs: HabitLog[];
  archived?: boolean;
  createdAt: string;
}

export interface FocusSession {
  id: string;
  taskId?: string;
  taskTitle?: string;
  start: string; // ISO
  end: string;   // ISO
  minutes: number;
  quality?: 1 | 2 | 3 | 4 | 5;
  note?: string;
  ambientSound?: 'none' | 'rain' | 'brown-noise';
  interruptionsCount?: number;
}

export interface Note {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  taskId?: string;
  pinned: boolean;
  tags: string[];
}

export interface FileItem {
  id: string;
  name: string;
  type: string; // txt, md, pdf
  size: string;
  content: string;
  uploadedAt: string;
  extractedTasks?: string[];
  summary?: string;
}

export type HighlightType = 'Win' | 'Warning' | 'Pattern' | 'Drift' | 'Streak';

export interface Highlight {
  id: string;
  type: HighlightType;
  title: string;
  body: string;
  whyExplanation: string;
  metric?: string;
  sparklineData?: number[];
  actionLabel?: string;
  actionTarget?: 'plan' | 'focus' | 'goals' | 'trends';
  createdAt: string;
  read: boolean;
}

export interface WeeklyReportPayload {
  weekOf: string;
  focusMinutesTotal: number;
  tasksCompletedTotal: number;
  longestHabitStreak: number;
  highlightSummary: string;
  ringsClosedCount: number;
  nextWeekFocusGoal: number;
}

export interface Report {
  id: string;
  weekOf: string;
  payload: WeeklyReportPayload;
  createdAt: string;
}

export interface DataSource {
  id: 'calendar' | 'files' | 'manual';
  name: string;
  enabled: boolean;
  lastSync?: string;
  writes: string[];
  privacyNote: string;
}

export type SupportedLanguage = 'en' | 'es' | 'fr' | 'de' | 'hi' | 'ja' | 'ar';

export interface UserProfile {
  name: string;
  avatar?: string;
  memberSince: string;
  goals: {
    focusMinutes: number; // default 120
    tasksDue: number;     // default 5
    habitsDue: number;    // default 3
  };
  workHours: {
    start: string; // '09:00'
    end: string;   // '18:00'
  };
  quietHours: {
    start: string; // '22:00'
    end: string;   // '07:00'
  };
  focusPreferences: {
    defaultDuration: 25 | 45 | 60 | number;
    autoStartNext: boolean;
    playSoundOnEnd: boolean;
    qualityPromptEnabled: boolean;
  };
  aiTone: 'Concise' | 'Coach' | 'Direct';
  language: SupportedLanguage;
  favorites: string[]; // Module IDs to display and reorder on Summary
}

export interface DailyRingsState {
  focusMinutes: number;
  focusGoal: number;
  focusPercent: number; // 0 to 1

  tasksCompleted: number;
  tasksPlanned: number;
  tasksPercent: number; // 0 to 1

  habitsCompleted: number;
  habitsDue: number;
  habitsPercent: number; // 0 to 1

  closedRingsCount: number;
  streakDays: number;
}

export interface CategoryMetricHistory {
  period: 'D' | 'W' | 'M' | '6M' | 'Y';
  currentValue: number;
  previousValue: number | null; // null if no real previous history
  percentageChange: number | null; // null if no previous history
  average: number;
  total: number;
  bestDay: { label: string; value: number } | null;
  chartData: { label: string; value: number }[];
}
