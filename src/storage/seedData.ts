// SmartDay Seed Dataset for User Mia (Phase 0.1 Spec)
// Streak 35 days · Today 2h 30m focused · 3 tasks · 1 meeting at 8:00 AM · 21 days of rich history

import { UserProfile, Task, Habit, FocusSession, Note, Highlight, Report, DataSource } from '../types';

export interface SeedDataResult {
  profile: UserProfile;
  tasks: Task[];
  habits: Habit[];
  sessions: FocusSession[];
  notes: Note[];
  highlights: Highlight[];
  reports: Report[];
  sources: DataSource[];
}

export const getMiaSeedData = (): SeedDataResult => {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  // Helper to get past dates
  const getPastDateStr = (daysAgo: number): string => {
    const d = new Date(today);
    d.setDate(today.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
  };

  // 1. User Profile
  const profile: UserProfile = {
    name: 'Vendikatla Masthan',
    avatar: 'masthan_avatar.jpg',
    memberSince: getPastDateStr(35),
    goals: {
      focusMinutes: 150, // 2h 30m target
      tasksDue: 3,
      habitsDue: 3,
    },
    workHours: {
      start: '08:00',
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
    favorites: ['rings', 'trends', 'sessions', 'top_focus', 'habits', 'quick_actions', 'next_up'],
  };

  // 2. Tasks (including the schedule from the screenshot and completed tasks)
  const tasks: Task[] = [
    {
      id: 'task-dbms-lecture',
      title: 'DBMS Lecture',
      notes: 'AB-II – 301. Covers ER Diagrams, relational algebra and schema design.',
      priority: 'High',
      estimateMin: 60,
      actualMin: 60,
      due: todayStr,
      time: '11:00 AM',
      status: 'scheduled',
      tags: ['Class', 'AB-II - 301'],
      createdAt: getPastDateStr(1),
    },
    {
      id: 'task-prof-meeting',
      title: 'Meeting with Professor',
      notes: 'Faculty Block, Room 402. Review DBMS project milestone and paper submission.',
      priority: 'Med',
      estimateMin: 45,
      actualMin: 30,
      due: todayStr,
      time: '3:00 PM',
      status: 'scheduled',
      tags: ['Event', 'Faculty Block'],
      createdAt: getPastDateStr(1),
    },
    {
      id: 'task-study-dbms',
      title: 'Study DBMS',
      notes: 'Normalization, 1NF, 2NF, 3NF, BCNF problem sets and textbook exercises.',
      priority: 'High',
      estimateMin: 90,
      due: todayStr,
      time: '6:00 PM',
      status: 'scheduled',
      tags: ['Study', 'Normalization'],
      createdAt: getPastDateStr(1),
    },
    {
      id: 'task-done-1',
      title: 'Morning Code Practice & Algorithm warmup',
      notes: 'Completed 2 LeetCode problems on tree traversal',
      priority: 'Med',
      estimateMin: 40,
      actualMin: 40,
      due: todayStr,
      time: '08:00 AM',
      status: 'done',
      tags: ['Practice'],
      createdAt: getPastDateStr(1),
      completedAt: `${todayStr}T08:45:00.000Z`,
    },
    {
      id: 'task-done-2',
      title: 'Submit Operating Systems Lab Assignment 4',
      notes: 'Paging & virtual memory simulation code uploaded',
      priority: 'High',
      estimateMin: 30,
      actualMin: 30,
      due: todayStr,
      time: '09:30 AM',
      status: 'done',
      tags: ['Lab'],
      createdAt: getPastDateStr(1),
      completedAt: `${todayStr}T10:00:00.000Z`,
    },
    {
      id: 'task-done-3',
      title: 'Review Engineering Mathematics lecture notes',
      notes: 'Probability distributions and conditional probability review',
      priority: 'Low',
      estimateMin: 25,
      actualMin: 25,
      due: todayStr,
      time: '10:15 AM',
      status: 'done',
      tags: ['Math'],
      createdAt: getPastDateStr(1),
      completedAt: `${todayStr}T10:45:00.000Z`,
    },
  ];

  // 21 days of completed past tasks
  for (let i = 1; i <= 21; i++) {
    const pastDate = getPastDateStr(i);
    tasks.push(
      {
        id: `task-hist-${i}-1`,
        title: `Sprint Deliverable Review #${i}`,
        priority: 'High',
        estimateMin: 60,
        actualMin: 55,
        due: pastDate,
        time: '10:00',
        status: 'done',
        tags: ['Product'],
        createdAt: getPastDateStr(i + 1),
        completedAt: `${pastDate}T11:00:00.000Z`,
      },
      {
        id: `task-hist-${i}-2`,
        title: `Weekly sync documentation & notes #${i}`,
        priority: 'Med',
        estimateMin: 45,
        actualMin: 40,
        due: pastDate,
        time: '14:00',
        status: 'done',
        tags: ['Team'],
        createdAt: getPastDateStr(i + 1),
        completedAt: `${pastDate}T15:00:00.000Z`,
      }
    );
  }

  // 3. Focus Sessions (Today 2h 30m = 150m, plus 21 days history)
  const sessions: FocusSession[] = [
    // Today session 1: Meeting with the team (90m = 01:30:00)
    {
      id: 'session-today-1',
      taskId: 'task-today-1',
      taskTitle: 'Meeting with the team',
      start: `${todayStr}T08:02:00.000Z`,
      end: `${todayStr}T09:32:00.000Z`,
      minutes: 90,
      quality: 5,
      note: 'Aligned on mobile navigation and color tokens.',
      ambientSound: 'none',
    },
    // Today session 2: First Screen Design (60m = 01:00:00) -> Total 150m (2h 30m)
    {
      id: 'session-today-2',
      taskId: 'task-today-2',
      taskTitle: 'First Screen Design',
      start: `${todayStr}T10:00:00.000Z`,
      end: `${todayStr}T11:00:00.000Z`,
      minutes: 60,
      quality: 5,
      note: 'Polished analog clock timer component and ring geometries.',
      ambientSound: 'brown-noise',
    },
  ];

  // 21 days of continuous focus logs (~120-180m per day)
  for (let i = 1; i <= 21; i++) {
    const pastDate = getPastDateStr(i);
    const dayMins = 120 + (i % 4) * 20;
    sessions.push({
      id: `session-hist-${i}`,
      taskTitle: i % 2 === 0 ? 'Deep Work Architecture' : 'Product Research & Synthesis',
      start: `${pastDate}T09:00:00.000Z`,
      end: `${pastDate}T11:30:00.000Z`,
      minutes: dayMins,
      quality: ((i % 2 === 0 ? 5 : 4) as 1 | 2 | 3 | 4 | 5),
      note: 'High focus flow state.',
    });
  }

  // 4. Habits with 35-day streak
  const habits: Habit[] = [
    {
      id: 'habit-1',
      name: 'Deep Work Before Noon',
      description: 'Minimum 90 minutes of uninterrupted focus',
      schedule: 'daily',
      streak: 35,
      longest: 35,
      skips: [],
      logs: Array.from({ length: 22 }, (_, idx) => ({
        date: getPastDateStr(idx),
        done: true,
      })),
      colorPip: '#0D9488',
      createdAt: getPastDateStr(35),
    },
    {
      id: 'habit-2',
      name: 'Hydration (2L Water)',
      description: '8 glasses spaced throughout the workday',
      schedule: 'daily',
      streak: 21,
      longest: 28,
      skips: [],
      logs: Array.from({ length: 22 }, (_, idx) => ({
        date: getPastDateStr(idx),
        done: true,
      })),
      colorPip: '#0284C7',
      createdAt: getPastDateStr(28),
    },
    {
      id: 'habit-3',
      name: 'Evening Shutdown & Review',
      description: 'Inbox zero-ish and identify tomorrow frog',
      schedule: 'daily',
      streak: 18,
      longest: 24,
      skips: [getPastDateStr(5)],
      logs: Array.from({ length: 22 }, (_, idx) => ({
        date: getPastDateStr(idx),
        done: idx !== 5,
        skipped: idx === 5,
      })),
      colorPip: '#F59E0B',
      createdAt: getPastDateStr(24),
    },
  ];

  // 5. Notes
  const notes: Note[] = [
    {
      id: 'note-dbms-norm',
      title: 'Database Normalization',
      body: 'Notes on 1NF, 2NF, 3NF and BCNF. 1NF eliminates duplicate columns from the same table and creates separate tables for each group of related data. 2NF meets 1NF and removes subsets of data that apply to multiple rows. 3NF removes columns that are not dependent upon the primary key.',
      createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      pinned: true,
      tags: ['DBMS', 'Study', 'Normalization'],
    },
    {
      id: 'note-1',
      title: 'SmartDay Architecture Manifesto',
      body: 'Three complete presentation skins: Ember, Halo, and Grove. Single reactive data engine. Real analog timer with lap recordings.',
      createdAt: getPastDateStr(2),
      updatedAt: getPastDateStr(1),
      pinned: true,
      tags: ['Architecture', 'Product'],
    },
    {
      id: 'note-2',
      title: 'Team Meeting Takeaways — Q3 Goals',
      body: '1. Ship pixel-faithful Ember calendar cells.\n2. Keep Halo area chart and podium pristine.\n3. Grove topographic overlay for all cards.',
      createdAt: getPastDateStr(1),
      updatedAt: getPastDateStr(1),
      pinned: true,
      tags: ['Work'],
    },
  ];

  // 6. Highlights (calculated from real telemetry)
  const highlights: Highlight[] = [
    {
      id: 'hl-streak-35',
      type: 'Streak',
      title: 'Personal Best: 35-Day Consistency Streak!',
      body: 'You have maintained your morning deep work ritual for 35 consecutive days without interruption.',
      whyExplanation: 'Triggered upon surpassing previous streak benchmark of 30 days.',
      actionLabel: 'View Trend',
      actionTarget: 'trends',
      createdAt: todayStr,
      read: false,
    },
    {
      id: 'hl-win-focus',
      type: 'Win',
      title: '2h 30m Deep Work Logged Today',
      body: 'You have already hit 100% of your daily focus goal across two high-quality sessions.',
      whyExplanation: 'Triggered when daily focus exceeds 150 logged minutes before 12:00 PM.',
      actionLabel: 'Start Focus',
      actionTarget: 'focus',
      createdAt: todayStr,
      read: false,
    },
    {
      id: 'hl-pattern-peak',
      type: 'Pattern',
      title: 'Morning Focus Velocity Outperforming Afternoon',
      body: 'Your historical focus quality rating is 4.8 / 5.0 between 8:00 AM and 11:30 AM.',
      whyExplanation: 'Derived from 21 days of session quality telemetry.',
      actionLabel: 'View Schedule',
      actionTarget: 'plan',
      createdAt: todayStr,
      read: false,
    },
  ];

  // 7. Weekly Reports (Last 3 weeks)
  const reports: Report[] = [
    {
      id: 'report-1',
      weekOf: getPastDateStr(7),
      payload: {
        weekOf: getPastDateStr(7),
        focusMinutesTotal: 960, // 16 hours
        tasksCompletedTotal: 24,
        longestHabitStreak: 35,
        highlightSummary: 'Sustained 16 hours of deep work and completed all high-priority sprint deliverables.',
        ringsClosedCount: 3,
        nextWeekFocusGoal: 1050,
      },
      createdAt: getPastDateStr(7),
    },
    {
      id: 'report-2',
      weekOf: getPastDateStr(14),
      payload: {
        weekOf: getPastDateStr(14),
        focusMinutesTotal: 880,
        tasksCompletedTotal: 21,
        longestHabitStreak: 28,
        highlightSummary: 'Strong habit consistency and balanced time distribution.',
        ringsClosedCount: 3,
        nextWeekFocusGoal: 900,
      },
      createdAt: getPastDateStr(14),
    },
  ];

  // 8. Data Sources
  const sources: DataSource[] = [
    {
      id: 'calendar',
      name: 'Google / Outlook Calendar',
      enabled: true,
      lastSync: 'Synced 8:00 AM',
      writes: ['Events', 'Meeting blocks'],
      privacyNote: 'Local read-only calendar sync.',
    },
    {
      id: 'files',
      name: 'Local Device Files',
      enabled: true,
      lastSync: 'Active',
      writes: ['Markdown notes', 'Receipts'],
      privacyNote: 'On-device text processing.',
    },
    {
      id: 'manual',
      name: 'Manual Telemetry',
      enabled: true,
      lastSync: 'Continuous',
      writes: ['Focus logs', 'Habit check-ins'],
      privacyNote: 'Primary local store.',
    },
  ];

  return {
    profile,
    tasks,
    habits,
    sessions,
    notes,
    highlights,
    reports,
    sources,
  };
};
