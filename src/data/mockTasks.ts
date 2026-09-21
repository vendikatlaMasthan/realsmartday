export type Priority = 'high' | 'medium' | 'low';
export type TaskCategory = 'work' | 'personal' | 'focus' | 'health';

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  category: TaskCategory;
  dueDate: string;
  dueTime: string;
  completed: boolean;
  isAIPrioritized?: boolean;
  subtasks?: { id: string; title: string; completed: boolean }[];
  tags: string[];
}

export const initialTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Review Q3 Mobile Architecture & Deliverables',
    description: 'Finalize offline sync strategy, state hydration, and design tokens for the design system.',
    priority: 'high',
    category: 'work',
    dueDate: 'Today',
    dueTime: '10:30 AM',
    completed: false,
    isAIPrioritized: true,
    tags: ['Work', 'Tech Specs'],
    subtasks: [
      { id: 'sub-1', title: 'Verify SQLite offline schema', completed: true },
      { id: 'sub-2', title: 'Review theme token contrast ratios', completed: false },
    ],
  },
  {
    id: 'task-2',
    title: 'Executive sync with Product Strategy',
    description: 'Present AI-assisted daily workflows roadmap and latency benchmarks.',
    priority: 'high',
    category: 'work',
    dueDate: 'Today',
    dueTime: '2:00 PM',
    completed: false,
    isAIPrioritized: true,
    tags: ['Meeting', 'Leadership'],
  },
  {
    id: 'task-3',
    title: 'Draft weekly engineering sprint retro',
    description: 'Summarize pull request throughput, test coverage deltas, and platform fixes.',
    priority: 'medium',
    category: 'work',
    dueDate: 'Today',
    dueTime: '4:15 PM',
    completed: false,
    tags: ['Sprint', 'Engineering'],
  },
  {
    id: 'task-4',
    title: 'Order ergonomics wrist support & desk mat',
    description: 'Select memory foam option from approved hardware catalog.',
    priority: 'low',
    category: 'personal',
    dueDate: 'Today',
    dueTime: '6:00 PM',
    completed: false,
    tags: ['Personal'],
  },
  {
    id: 'task-5',
    title: 'Hydration & 20-min mindful walking break',
    description: 'Outdoor fresh air reset to prevent mid-afternoon cognitive fatigue.',
    priority: 'medium',
    category: 'health',
    dueDate: 'Today',
    dueTime: '1:00 PM',
    completed: true,
    tags: ['Wellness'],
  },
  {
    id: 'task-6',
    title: 'Review iOS App Store signing certificates',
    description: 'Renew APNs push notification keys before upcoming monthly expiration.',
    priority: 'high',
    category: 'work',
    dueDate: 'Tomorrow',
    dueTime: '11:00 AM',
    completed: false,
    tags: ['DevOps', 'iOS'],
  },
  {
    id: 'task-7',
    title: 'Refactor audio waveform caching layer',
    description: 'Benchmark memory foot-print with 60-second audio files in background player.',
    priority: 'medium',
    category: 'work',
    dueDate: 'Sep 12',
    dueTime: '3:30 PM',
    completed: false,
    tags: ['Performance'],
  },
  {
    id: 'task-8',
    title: 'Weekly grocery restock (Almonds, Matcha, Greens)',
    description: 'Pick up organic nutrition provisions from local farmers market.',
    priority: 'low',
    category: 'personal',
    dueDate: 'Completed',
    dueTime: '8:00 AM',
    completed: true,
    tags: ['Home'],
  },
];
