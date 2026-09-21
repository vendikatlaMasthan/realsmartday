export interface AIFocusData {
  title: string;
  subtitle: string;
  recommendation: string;
  estimatedTime: string;
  confidenceScore: number;
  reason: string;
  actionText: string;
}

export interface DailyMetrics {
  tasksCompleted: number;
  tasksTotal: number;
  habitsCompleted: number;
  habitsTotal: number;
  focusScore: number; // e.g. 88%
  streakDays: number;
}

export const mockAIFocus: AIFocusData = {
  title: "AI Daily Focus",
  subtitle: "High Cognitive Window (9:00 AM - 11:30 AM)",
  recommendation: "Review Q3 Mobile Architecture & Deliverable Specs",
  estimatedTime: "45 mins",
  confidenceScore: 94,
  reason: "Calibrated based on your peak focus patterns and upcoming 2:00 PM stakeholder review.",
  actionText: "Start Focus Session",
};

export const mockDailyMetrics: DailyMetrics = {
  tasksCompleted: 4,
  tasksTotal: 7,
  habitsCompleted: 3,
  habitsTotal: 4,
  focusScore: 86,
  streakDays: 12,
};

export const mockQuickActions = [
  { id: 'add_task', label: 'New Task', icon: 'add-circle-outline' as const, route: 'add-task' },
  { id: 'convert', label: 'Convert File', icon: 'document-text-outline' as const, route: 'file-converter' },
  { id: 'log_habit', label: 'Habit Check', icon: 'flame-outline' as const, route: 'habits' },
  { id: 'quick_note', label: 'AI Note', icon: 'sparkles-outline' as const, route: 'notes' },
];
