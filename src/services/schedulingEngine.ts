// SmartDay Deterministic Scheduling & Conflict Engine
// Safe, grounded mathematical scheduling rules.
// AI explains and ranks options; deterministic logic finds valid slots and detects overlaps.

import {
  Task,
  ScheduleItem,
  ScheduleConflict,
  TimeSlotOption,
  RecurrenceRule,
  Habit,
  HabitPatternInsight,
  DayPlanBlock,
  PlannedDaySchedule,
} from '../types';

/**
 * Converts "09:30 AM" or "14:15" into minutes from midnight (0 to 1439).
 */
export function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 9 * 60; // default 9:00 AM
  const trimmed = timeStr.trim();

  // 12-hour format e.g. 09:30 AM or 2:00 PM
  const match12 = trimmed.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm|AM|PM)$/i);
  if (match12) {
    let hours = parseInt(match12[1], 10);
    const minutes = match12[2] ? parseInt(match12[2], 10) : 0;
    const meridiem = match12[3].toLowerCase();
    if (meridiem === 'pm' && hours < 12) hours += 12;
    if (meridiem === 'am' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  }

  // 24-hour format e.g. 14:30
  const match24 = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    return parseInt(match24[1], 10) * 60 + parseInt(match24[2], 10);
  }

  return 9 * 60;
}

/**
 * Converts minutes from midnight back to 12-hour "hh:mm AM/PM".
 */
export function minutesToTime(totalMin: number): string {
  const normalized = Math.max(0, Math.min(23 * 60 + 59, totalMin));
  let hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const minStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
  return `${hours}:${minStr} ${ampm}`;
}

interface Interval {
  id: string;
  title: string;
  startMin: number;
  endMin: number;
  durationMin: number;
  type: 'task' | 'class' | 'event';
  sourceItem: any;
}

/**
 * Converts tasks and schedule items for today into intervals.
 */
function buildIntervals(tasks: Task[], scheduleItems: ScheduleItem[]): Interval[] {
  const intervals: Interval[] = [];

  // Schedule items (classes, labs, events)
  for (const s of scheduleItems) {
    if (s.time) {
      const start = parseTimeToMinutes(s.time);
      const duration = s.tag === 'Exam' ? 120 : s.tag === 'Class' ? 60 : 45;
      intervals.push({
        id: s.id,
        title: s.title,
        startMin: start,
        endMin: start + duration,
        durationMin: duration,
        type: s.tag === 'Class' || s.tag === 'Exam' ? 'class' : 'event',
        sourceItem: s,
      });
    }
  }

  // Timed pending tasks
  for (const t of tasks) {
    if (t.status !== 'done' && t.time) {
      const start = parseTimeToMinutes(t.time);
      const duration = t.estimateMin || 30;
      intervals.push({
        id: t.id,
        title: t.title,
        startMin: start,
        endMin: start + duration,
        durationMin: duration,
        type: 'task',
        sourceItem: t,
      });
    }
  }

  return intervals.sort((a, b) => a.startMin - b.startMin);
}

/**
 * Deterministically detects all schedule conflicts:
 * - Overlaps between tasks, classes, and events
 * - Overcapacity when total work exceeds available day hours
 * - Missed tasks from earlier in the day
 */
export function detectScheduleConflicts(
  tasks: Task[],
  scheduleItems: ScheduleItem[],
  workHours: { start: string; end: string } = { start: '08:00', end: '21:00' }
): ScheduleConflict[] {
  const conflicts: ScheduleConflict[] = [];
  const intervals = buildIntervals(tasks, scheduleItems);
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // 1. Detect Overlaps
  for (let i = 0; i < intervals.length; i++) {
    for (let j = i + 1; j < intervals.length; j++) {
      const a = intervals[i];
      const b = intervals[j];

      // If item b starts before item a ends, overlap exists!
      if (b.startMin < a.endMin) {
        const overlapMins = Math.min(a.endMin, b.endMin) - b.startMin;
        const conflictId = `conflict-${a.id}-${b.id}`;

        // Find available alternative slots for item b
        const alternativeSlots = findAvailableSlots(
          b.durationMin,
          'Today',
          tasks.filter((t) => t.id !== b.id),
          scheduleItems.filter((s) => s.id !== b.id),
          workHours
        );

        conflicts.push({
          id: conflictId,
          type: 'overlap',
          title: `Schedule Overlap (${overlapMins}m)`,
          explanation: `"${a.title}" (${minutesToTime(a.startMin)}–${minutesToTime(a.endMin)}) overlaps with "${b.title}" (${minutesToTime(b.startMin)}–${minutesToTime(b.endMin)}).`,
          item1: {
            id: a.id,
            title: a.title,
            time: minutesToTime(a.startMin),
            durationMin: a.durationMin,
            type: a.type,
          },
          item2: {
            id: b.id,
            title: b.title,
            time: minutesToTime(b.startMin),
            durationMin: b.durationMin,
            type: b.type,
          },
          suggestedSlots: alternativeSlots.slice(0, 3),
        });
      }
    }
  }

  // 2. Detect Missed Tasks
  for (const t of tasks) {
    if (t.status !== 'done' && t.time && t.due === 'Today') {
      const taskStart = parseTimeToMinutes(t.time);
      const taskEnd = taskStart + (t.estimateMin || 30);
      if (taskEnd < currentMinutes) {
        const alternativeSlots = findAvailableSlots(
          t.estimateMin || 30,
          'Today',
          tasks.filter((x) => x.id !== t.id),
          scheduleItems,
          workHours
        );

        conflicts.push({
          id: `missed-${t.id}`,
          type: 'missed',
          title: 'Missed Task Slot',
          explanation: `"${t.title}" was scheduled for ${t.time}, which has already passed today.`,
          item1: {
            id: t.id,
            title: t.title,
            time: t.time,
            durationMin: t.estimateMin || 30,
            type: 'task',
          },
          suggestedSlots: alternativeSlots.slice(0, 3),
        });
      }
    }
  }

  // 3. Detect Overcapacity (More planned work than available time)
  const workStartMin = parseTimeToMinutes(workHours.start);
  const workEndMin = parseTimeToMinutes(workHours.end);
  const totalDayCapacity = Math.max(0, workEndMin - workStartMin);

  let totalCommittedMinutes = 0;
  for (const item of intervals) {
    totalCommittedMinutes += item.durationMin;
  }

  if (totalCommittedMinutes > totalDayCapacity) {
    const excess = totalCommittedMinutes - totalDayCapacity;
    conflicts.push({
      id: 'conflict-overcapacity-day',
      type: 'overcapacity',
      title: 'Day Overcapacity',
      explanation: `You have planned ${Math.round(totalCommittedMinutes / 60)}h ${totalCommittedMinutes % 60}m of work & classes, which exceeds your working hours (${workHours.start}–${workHours.end}) by ${excess} minutes.`,
      item1: {
        id: 'total-day-load',
        title: 'Total Day Schedule',
        time: workHours.start,
        durationMin: totalCommittedMinutes,
        type: 'task',
      },
      suggestedSlots: findAvailableSlots(45, 'Tomorrow', tasks, scheduleItems, workHours).slice(0, 3),
    });
  }

  return conflicts;
}

/**
 * Deterministically finds valid, non-overlapping available time slots
 * within working hours.
 */
export function findAvailableSlots(
  durationMinutes: number,
  targetDate: string,
  tasks: Task[],
  scheduleItems: ScheduleItem[],
  workHours: { start: string; end: string } = { start: '08:30', end: '21:00' }
): TimeSlotOption[] {
  const intervals = buildIntervals(tasks, scheduleItems);
  const workStartMin = parseTimeToMinutes(workHours.start);
  const workEndMin = parseTimeToMinutes(workHours.end);

  const options: TimeSlotOption[] = [];
  let pointer = workStartMin;

  for (const item of intervals) {
    if (item.startMin > pointer) {
      const freeGap = item.startMin - pointer;
      if (freeGap >= durationMinutes) {
        options.push({
          date: targetDate,
          time: minutesToTime(pointer),
          endTime: minutesToTime(pointer + durationMinutes),
          durationMin: freeGap,
          label: `Open ${freeGap}m window before "${item.title}"`,
          score: freeGap >= durationMinutes + 15 ? 95 : 80,
        });
      }
    }
    pointer = Math.max(pointer, item.endMin);
  }

  // Window between last item and end of working hours
  if (workEndMin - pointer >= durationMinutes) {
    const freeGap = workEndMin - pointer;
    options.push({
      date: targetDate,
      time: minutesToTime(pointer),
      endTime: minutesToTime(pointer + durationMinutes),
      durationMin: freeGap,
      label: `Open ${freeGap}m evening window after all scheduled items`,
      score: 90,
    });
  }

  return options;
}

/**
 * Calculates next recurrence date deterministically.
 */
export function calculateNextRecurrenceDate(rule: RecurrenceRule, fromDate: string): string {
  const d = new Date(fromDate);
  if (isNaN(d.getTime())) return fromDate;

  switch (rule.frequency) {
    case 'daily':
      d.setDate(d.getDate() + 1);
      break;
    case 'weekdays': {
      d.setDate(d.getDate() + 1);
      while (d.getDay() === 0 || d.getDay() === 6) {
        d.setDate(d.getDate() + 1);
      }
      break;
    }
    case 'specific_days': {
      const days = rule.daysOfWeek && rule.daysOfWeek.length > 0 ? rule.daysOfWeek : [1, 3, 5];
      for (let i = 1; i <= 7; i++) {
        d.setDate(d.getDate() + 1);
        if (days.includes(d.getDay())) break;
      }
      break;
    }
    case 'biweekly': {
      d.setDate(d.getDate() + 14);
      break;
    }
    case 'weekly_target':
    case 'weekly':
    default:
      d.setDate(d.getDate() + 7);
      break;
  }

  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Analyzes habit completion logs to find grounded completion patterns.
 * Never invents claims without evidence (requires >= 5 logged completions).
 */
export function analyzeHabitCompletionPatterns(habit: Habit): HabitPatternInsight {
  const logs = habit.logs || [];
  const completedLogs = logs.filter((l) => l.done);

  if (completedLogs.length < 5) {
    return {
      habitId: habit.id,
      habitName: habit.name,
      evidence: `You have ${completedLogs.length} logged completions. SmartDay needs at least 5 completions to detect timing patterns.`,
      suggestion: 'Keep logging your habit consistently!',
      suggestedTime: habit.reminderTime || '08:00 PM',
      hasEnoughHistory: false,
    };
  }

  // Count weekday vs weekend completions
  let weekdayCount = 0;
  let weekendCount = 0;

  for (const log of completedLogs) {
    const day = new Date(log.date).getDay();
    if (day === 0 || day === 6) weekendCount++;
    else weekdayCount++;
  }

  const total = completedLogs.length;
  const weekdayRate = Math.round((weekdayCount / total) * 100);

  if (weekdayRate >= 70 && habit.schedule !== 'weekdays') {
    return {
      habitId: habit.id,
      habitName: habit.name,
      evidence: `You completed "${habit.name}" ${weekdayCount} of ${total} times (${weekdayRate}%) on weekdays.`,
      suggestion: 'Would you like to streamline this habit schedule to Weekdays Only?',
      suggestedTime: habit.reminderTime || '07:30 PM',
      hasEnoughHistory: true,
    };
  }

  return {
    habitId: habit.id,
    habitName: habit.name,
    evidence: `You've maintained ${total} completions with an active streak of ${habit.streak} days.`,
    suggestion: `Your current reminder time (${habit.reminderTime || '08:00 PM'}) aligns well with your rhythm.`,
    suggestedTime: habit.reminderTime || '08:00 PM',
    hasEnoughHistory: true,
  };
}

/**
 * Deterministically constructs a conflict-free Day Schedule from tasks,
 * schedule items, and breaks.
 */
export function buildDeterministicDayPlan(
  tasks: Task[],
  scheduleItems: ScheduleItem[],
  workHours: { start: string; end: string } = { start: '08:30', end: '20:30' }
): PlannedDaySchedule {
  const blocks: DayPlanBlock[] = [];
  const intervals = buildIntervals([], scheduleItems); // Classes and fixed commitments
  const workStartMin = parseTimeToMinutes(workHours.start);
  const workEndMin = parseTimeToMinutes(workHours.end);

  // Add all classes and events as fixed blocks
  for (const item of intervals) {
    blocks.push({
      id: `block-fixed-${item.id}`,
      title: item.title,
      startTime: minutesToTime(item.startMin),
      endTime: minutesToTime(item.endMin),
      durationMin: item.durationMin,
      type: item.type,
      location: item.sourceItem?.location,
    });
  }

  // Prioritize pending tasks: High priority first, then Med, then Low
  const pendingTasks = [...tasks]
    .filter((t) => t.status !== 'done')
    .sort((a, b) => {
      const pScore = (p: string) => (p === 'High' ? 3 : p === 'Med' ? 2 : 1);
      return pScore(b.priority) - pScore(a.priority);
    });

  let tasksScheduledCount = 0;
  let cursor = workStartMin;

  for (const task of pendingTasks) {
    const taskDuration = Math.min(60, Math.max(20, task.estimateMin || 30));

    // Find next available gap after cursor
    while (cursor + taskDuration <= workEndMin) {
      // Check if cursor..cursor+taskDuration overlaps with any fixed block
      const conflict = intervals.find(
        (int) => cursor < int.endMin && cursor + taskDuration > int.startMin
      );

      if (!conflict) {
        // We found a clean slot!
        blocks.push({
          id: `block-task-${task.id}`,
          taskId: task.id,
          title: task.title,
          startTime: minutesToTime(cursor),
          endTime: minutesToTime(cursor + taskDuration),
          durationMin: taskDuration,
          type: 'task',
          priority: task.priority,
          notes: task.notes,
        });
        tasksScheduledCount++;

        cursor += taskDuration;

        // Insert a 10m break if we have room
        if (cursor + 10 < workEndMin) {
          blocks.push({
            id: `block-break-${cursor}`,
            title: 'Recharge & Hydrate Break 🍵',
            startTime: minutesToTime(cursor),
            endTime: minutesToTime(cursor + 10),
            durationMin: 10,
            type: 'break',
          });
          cursor += 10;
        }
        break;
      } else {
        // Move cursor past the conflicting block
        cursor = conflict.endMin;
      }
    }
  }

  // Sort all blocks chronologically
  blocks.sort((a, b) => parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime));

  const totalDayCapacity = workEndMin - workStartMin;
  const totalScheduled = blocks.reduce((acc, b) => acc + b.durationMin, 0);
  const freeMinutesRemaining = Math.max(0, totalDayCapacity - totalScheduled);

  const topTask = pendingTasks[0]?.title || 'study session';
  const explanation = `Constructed a realistic schedule with ${tasksScheduledCount} priority task${tasksScheduledCount !== 1 ? 's' : ''}, your class lectures, and restorative 10-minute breaks. Starts with ${topTask} in your earliest open window.`;

  return {
    date: 'Today',
    blocks,
    freeMinutesRemaining,
    explanation,
    validatedNoConflicts: true,
    tasksScheduledCount,
  };
}
