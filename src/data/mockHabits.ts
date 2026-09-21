export interface Habit {
  id: string;
  name: string;
  description: string;
  category: 'health' | 'mindset' | 'productivity' | 'learning';
  streak: number;
  bestStreak: number;
  targetPerWeek: number;
  completedToday: boolean;
  color: string;
  icon: string;
  // History for past 7 days (true = completed, false = missed)
  weeklyHistory: { day: string; date: string; completed: boolean }[];
}

export const initialHabits: Habit[] = [
  {
    id: 'habit-1',
    name: 'Morning Deep Work Block',
    description: '90 minutes of distraction-free uninterrupted focus',
    category: 'productivity',
    streak: 14,
    bestStreak: 28,
    targetPerWeek: 5,
    completedToday: true,
    color: '#6366F1',
    icon: 'flash-outline',
    weeklyHistory: [
      { day: 'M', date: 'Sep 4', completed: true },
      { day: 'T', date: 'Sep 5', completed: true },
      { day: 'W', date: 'Sep 6', completed: true },
      { day: 'T', date: 'Sep 7', completed: true },
      { day: 'F', date: 'Sep 8', completed: true },
      { day: 'S', date: 'Sep 9', completed: false },
      { day: 'S', date: 'Sep 10', completed: true },
    ],
  },
  {
    id: 'habit-2',
    name: 'Hydration Target (2.5L)',
    description: 'Track daily water intake throughout workday',
    category: 'health',
    streak: 9,
    bestStreak: 15,
    targetPerWeek: 7,
    completedToday: true,
    color: '#06B6D4',
    icon: 'water-outline',
    weeklyHistory: [
      { day: 'M', date: 'Sep 4', completed: true },
      { day: 'T', date: 'Sep 5', completed: true },
      { day: 'W', date: 'Sep 6', completed: false },
      { day: 'T', date: 'Sep 7', completed: true },
      { day: 'F', date: 'Sep 8', completed: true },
      { day: 'S', date: 'Sep 9', completed: true },
      { day: 'S', date: 'Sep 10', completed: true },
    ],
  },
  {
    id: 'habit-3',
    name: 'Read Tech Papers & Architecture',
    description: '25 mins exploring state-of-the-art AI and distributed systems',
    category: 'learning',
    streak: 6,
    bestStreak: 21,
    targetPerWeek: 6,
    completedToday: false,
    color: '#8B5CF6',
    icon: 'book-outline',
    weeklyHistory: [
      { day: 'M', date: 'Sep 4', completed: true },
      { day: 'T', date: 'Sep 5', completed: true },
      { day: 'W', date: 'Sep 6', completed: true },
      { day: 'T', date: 'Sep 7', completed: true },
      { day: 'F', date: 'Sep 8', completed: true },
      { day: 'S', date: 'Sep 9', completed: true },
      { day: 'S', date: 'Sep 10', completed: false },
    ],
  },
  {
    id: 'habit-4',
    name: 'Evening Reflection & Day Closeout',
    description: 'Review done items, clear inbox, set top 3 priorities for tomorrow',
    category: 'mindset',
    streak: 11,
    bestStreak: 18,
    targetPerWeek: 7,
    completedToday: false,
    color: '#10B981',
    icon: 'moon-outline',
    weeklyHistory: [
      { day: 'M', date: 'Sep 4', completed: true },
      { day: 'T', date: 'Sep 5', completed: true },
      { day: 'W', date: 'Sep 6', completed: true },
      { day: 'T', date: 'Sep 7', completed: true },
      { day: 'F', date: 'Sep 8', completed: true },
      { day: 'S', date: 'Sep 9', completed: true },
      { day: 'S', date: 'Sep 10', completed: false },
    ],
  },
];
