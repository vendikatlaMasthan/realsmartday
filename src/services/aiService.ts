// SmartDay AI & NLP Service (Section 2 Spec)
// Powered by @google/genai with deterministic offline fallbacks.
// Never blocks task creation or app usage on API failure.

import { GoogleGenAI } from '@google/genai';
import {
  Task,
  TaskCategory,
  ScheduleItem,
  DailySummary,
  NewsDigest,
  NewsDigestItem,
  PlannedDaySchedule,
  TaskBreakdownResult,
  ExtractedActionItem,
  AssistantChatMessage,
  Habit,
  FocusSession,
  Priority,
  RecurrencePattern,
} from '../types';
import {
  buildDeterministicDayPlan,
  detectScheduleConflicts,
  findAvailableSlots,
  parseTimeToMinutes,
  minutesToTime,
} from './schedulingEngine';
import { parseQuickCapture, ExtractedTaskData } from './reminderEngine';

// Lazy client initialization to avoid startup crashes if key is not configured
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  if (aiClient) return aiClient;
  const apiKey =
    (typeof process !== 'undefined' && process.env && (process.env.GEMINI_API_KEY || process.env.API_KEY)) ||
    (typeof window !== 'undefined' && (window as any).__GEMINI_API_KEY__) ||
    '';

  if (apiKey) {
    try {
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    } catch {
      aiClient = null;
    }
  }
  return aiClient;
}

/**
 * 2.1 AI Task Categorization (Work / Personal / Urgent)
 */
export function classifyTaskOffline(title: string, notes?: string): TaskCategory {
  const combined = `${title} ${notes || ''}`.toLowerCase();

  const urgentRegex = /\b(urgent|asap|now|emergency|critical|immediately|deadline|due today|exam today)\b/i;
  if (urgentRegex.test(combined)) {
    return 'urgent';
  }

  const workRegex = /\b(meeting|assignment|submit|class|lecture|lab|study|exam|project|faculty|professor|homework|research|syllabus|presentation|quiz|chapter|paper|thesis|office)\b/i;
  if (workRegex.test(combined)) {
    return 'work';
  }

  return 'personal';
}

export async function classifyTask(title: string, notes?: string): Promise<TaskCategory> {
  const fallback = classifyTaskOffline(title, notes);
  const client = getAiClient();
  if (!client) {
    return fallback;
  }

  try {
    const prompt = `Classify this task as Work, Personal, or Urgent based on its content.
Title: "${title}"
Notes: "${notes || ''}"
Respond with ONLY ONE WORD from: Work, Personal, Urgent.`;

    const response = await client.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    const result = response.text?.trim().toLowerCase();
    if (result?.includes('urgent')) return 'urgent';
    if (result?.includes('work')) return 'work';
    if (result?.includes('personal')) return 'personal';

    return fallback;
  } catch {
    return fallback;
  }
}

/**
 * 2.2 AI Daily Summary ("Today's Focus")
 */
export async function generateDailySummary(
  tasks: Task[],
  scheduleItems: ScheduleItem[]
): Promise<DailySummary> {
  const todayStr = new Date().toISOString().split('T')[0];

  const pendingTasks = tasks.filter((t) => t.status !== 'done');
  const pendingSchedule = scheduleItems.filter((s) => !s.completed);
  const totalPending = pendingTasks.length + pendingSchedule.length;

  if (totalPending === 0) {
    return {
      date: todayStr,
      summaryText: "You are all caught up! No pending tasks or classes scheduled for today. Enjoy your day or plan ahead.",
      topPriority: 'All tasks completed',
      totalPending: 0,
      generatedAt: new Date().toISOString(),
      isAiGenerated: false,
    };
  }

  const highPriorityTask = pendingTasks.find((t) => t.priority === 'High' || t.category === 'urgent');
  const nextClass = pendingSchedule.find((s) => s.tag === 'Class' || s.tag === 'Exam');
  const topPriorityTitle = highPriorityTask?.title || nextClass?.title || pendingTasks[0]?.title || "Today's key objective";

  const deterministicSummary = `You have ${totalPending} pending items scheduled for today. Focus on ${topPriorityTitle} first, then review your upcoming schedule to stay on track.`;

  const client = getAiClient();
  if (!client) {
    return {
      date: todayStr,
      summaryText: deterministicSummary,
      topPriority: topPriorityTitle,
      totalPending,
      generatedAt: new Date().toISOString(),
      isAiGenerated: false,
    };
  }

  try {
    const prompt = `You are an encouraging academic AI assistant for a student named Masthan.
Analyze these pending tasks and schedule items for today:
Tasks: ${pendingTasks.map((t) => `${t.title} (${t.priority || 'Med'}, Category: ${t.category || 'general'})`).join('; ')}
Schedule: ${pendingSchedule.map((s) => `${s.time}: ${s.title} (${s.location})`).join('; ')}

Generate a friendly, concise morning summary in 2 sentences. Highlight the top priority and encourage a productive focus. Never fabricate tasks not in this list.`;

    const response = await client.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    const aiText = response.text?.trim();
    if (aiText && aiText.length > 20) {
      return {
        date: todayStr,
        summaryText: aiText,
        topPriority: topPriorityTitle,
        totalPending,
        generatedAt: new Date().toISOString(),
        isAiGenerated: true,
      };
    }

    return {
      date: todayStr,
      summaryText: deterministicSummary,
      topPriority: topPriorityTitle,
      totalPending,
      generatedAt: new Date().toISOString(),
      isAiGenerated: false,
    };
  } catch {
    return {
      date: todayStr,
      summaryText: deterministicSummary,
      topPriority: topPriorityTitle,
      totalPending,
      generatedAt: new Date().toISOString(),
      isAiGenerated: false,
    };
  }
}

/**
 * 2.3 Daily News Digest
 */
export async function fetchDailyNewsDigest(): Promise<NewsDigest> {
  const todayStr = new Date().toISOString().split('T')[0];

  const feedItems: NewsDigestItem[] = [
    {
      id: 'news-1',
      title: 'Open Source AI Models Advance in Academic Reasoning Benchmarks',
      source: 'MIT Technology Review',
      snippet: 'New lightweight models achieve top percentiles on database theory, discrete mathematics, and algorithmic problem solving.',
      category: 'Computer Science',
      timeAgo: '2h ago',
    },
    {
      id: 'news-2',
      title: 'University Campuses Transition to Unified Local-First Productivity Tools',
      source: 'EdTech Magazine',
      snippet: 'Higher education institutions emphasize student privacy and on-device data retention to reduce cloud dependency.',
      category: 'Campus & Tech',
      timeAgo: '4h ago',
    },
    {
      id: 'news-3',
      title: 'National Student Research Grants Announced for Autonomous Systems',
      source: 'Science Daily',
      snippet: 'Undergraduate and graduate research grants expand for computational modeling, robotics, and cloud-native architectures.',
      category: 'Academics',
      timeAgo: '6h ago',
    },
    {
      id: 'news-4',
      title: 'Global Tech Summit Highlights Green Computing and Edge Optimization',
      source: 'TechCrunch',
      snippet: 'Engineers showcase battery-efficient on-device neural processing units enabling real-time voice and document transcription.',
      category: 'Technology',
      timeAgo: '8h ago',
    },
  ];

  const client = getAiClient();
  let headlineSummary = 'Top academic and technology briefing: Open-source models surge in student benchmarks, university privacy-first software gains traction, and research grants open for robotics and autonomous computing.';
  let isAi = false;

  if (client) {
    try {
      const prompt = `Summarize these 4 technology and education headlines into a concise 2-sentence morning briefing for a computer science student:
${feedItems.map((item, idx) => `${idx + 1}. ${item.title} (${item.source})`).join('\n')}`;

      const response = await client.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      if (response.text && response.text.trim().length > 30) {
        headlineSummary = response.text.trim();
        isAi = true;
      }
    } catch {
      // Curated fallback
    }
  }

  return {
    date: todayStr,
    headlineSummary,
    items: feedItems,
    fetchedAt: new Date().toISOString(),
    isAiSummarized: isAi,
  };
}

/**
 * 2.4 AI Daily Planner ("Plan My Day")
 * Synthesizes pending tasks, deadlines, class timetable, and working hours into a realistic schedule.
 * Code validates conflicts & working hours before showing preview to user.
 */
export async function planMyDayWithAI(
  tasks: Task[],
  scheduleItems: ScheduleItem[],
  workHours: { start: string; end: string } = { start: '08:30', end: '20:30' }
): Promise<PlannedDaySchedule> {
  const deterministicPlan = buildDeterministicDayPlan(tasks, scheduleItems, workHours);
  const client = getAiClient();
  if (!client) {
    return deterministicPlan;
  }

  try {
    const pendingTasks = tasks.filter((t) => t.status !== 'done');
    const classes = scheduleItems.map((s) => `${s.time}: ${s.title} (${s.location})`);

    const prompt = `You are SmartDay's student schedule optimizer.
Student profile: Masthan (Computer Science).
Today's fixed timetable (CANNOT BE MOVED):
${classes.join('\n')}

Pending tasks needing time:
${pendingTasks.map((t) => `- "${t.title}" (Priority: ${t.priority}, Est: ${t.estimateMin || 30}m, Due: ${t.due || 'Soon'})`).join('\n')}

Working hours: ${workHours.start} to ${workHours.end}.
Rules:
1. Schedule pending tasks into realistic open windows between classes.
2. Insert 10-15 minute recharge breaks between intense study sessions.
3. Provide a friendly 1-2 sentence explanation of the schedule (e.g., "You have 90 minutes free before DBMS lecture. I suggest 40 minutes for the assignment, a 10-minute break, and 30 minutes of revision.").

Return ONLY valid JSON matching this structure:
{
  "explanation": "...",
  "blocks": [
    {
      "taskId": "task id if matching a task",
      "title": "title",
      "startTime": "09:00 AM",
      "endTime": "09:40 AM",
      "durationMin": 40,
      "type": "task" | "break" | "class" | "event"
    }
  ]
}`;

    const response = await client.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    const cleaned = (response.text || '')
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    const parsed = JSON.parse(cleaned);

    if (parsed && Array.isArray(parsed.blocks) && parsed.blocks.length > 0) {
      // Validate in code: ensure no overlapping blocks
      const convertedTasks: Task[] = parsed.blocks
        .filter((b: any) => b.type === 'task')
        .map((b: any, idx: number) => ({
          id: b.taskId || `planned-t-${idx}`,
          title: b.title,
          time: b.startTime,
          estimateMin: b.durationMin || 30,
          priority: 'Med' as Priority,
          category: 'work' as TaskCategory,
          status: 'scheduled' as const,
          tags: [],
          createdAt: new Date().toISOString(),
        }));

      const conflicts = detectScheduleConflicts(convertedTasks, scheduleItems, workHours);

      // If AI generated schedule has no critical overlaps, use it!
      if (conflicts.filter((c) => c.type === 'overlap').length === 0) {
        return {
          date: 'Today',
          blocks: parsed.blocks.map((b: any, idx: number) => ({
            id: `ai-block-${idx}`,
            taskId: b.taskId,
            title: b.title,
            startTime: b.startTime,
            endTime: b.endTime,
            durationMin: b.durationMin || 30,
            type: b.type || 'task',
          })),
          freeMinutesRemaining: deterministicPlan.freeMinutesRemaining,
          explanation: parsed.explanation || deterministicPlan.explanation,
          validatedNoConflicts: true,
          tasksScheduledCount: convertedTasks.length,
        };
      }
    }

    return deterministicPlan;
  } catch {
    return deterministicPlan;
  }
}

/**
 * 2.5 Smart Quick Capture with AI Fallback
 * Extracts multiple tasks, recurring patterns, duration, and dependencies.
 * Highlights inferred fields and flags clarifying questions if dates are ambiguous.
 */
export interface SmartCaptureResult {
  tasks: Array<
    ExtractedTaskData & {
      recurrence?: RecurrencePattern;
      estimateMin?: number;
      dependencies?: string[];
      inferredFields: string[];
    }
  >;
  clarifyingQuestion?: string;
  isAiEnhanced: boolean;
}

export async function smartQuickCapture(input: string): Promise<SmartCaptureResult> {
  const baseExtraction = parseQuickCapture(input);
  const trimmed = input.trim();

  // If deterministic parser found a clean single match and input is simple, return immediately
  const isComplex =
    trimmed.includes(' and ') ||
    trimmed.includes(' also ') ||
    trimmed.includes('before ') ||
    trimmed.includes('every ') ||
    trimmed.includes('weekly') ||
    trimmed.length > 50;

  if (!isComplex) {
    return {
      tasks: [
        {
          ...baseExtraction,
          recurrence: 'none',
          estimateMin: 30,
          inferredFields: baseExtraction.hasAmbiguousTime ? ['time'] : [],
        },
      ],
      isAiEnhanced: false,
    };
  }

  const client = getAiClient();
  if (!client) {
    return {
      tasks: [
        {
          ...baseExtraction,
          recurrence: 'none',
          estimateMin: 30,
          inferredFields: ['time'],
        },
      ],
      isAiEnhanced: false,
    };
  }

  try {
    const prompt = `You are SmartDay's natural language task parser.
Current Reference Date: ${new Date().toDateString()}.
Extract one or more actionable tasks from this student input:
"${trimmed}"

Rules:
- Identify title, date (YYYY-MM-DD), time (e.g. "03:00 PM"), duration (estimate in minutes), priority (High/Med/Low), category (work/personal/urgent), and recurrence ('none' | 'daily' | 'weekdays' | 'weekly').
- Note which fields were inferred vs explicitly mentioned.
- If a date or relative reference is ambiguous (e.g. "before Friday's meeting" when meeting time is unstated), provide a clarifying question.
- Never silently invent a random date.

Return ONLY a JSON object:
{
  "tasks": [
    {
      "title": "...",
      "date": "YYYY-MM-DD",
      "time": "10:00 AM",
      "priority": "High" | "Med" | "Low",
      "category": "work" | "personal" | "urgent",
      "estimateMin": 30,
      "recurrence": "none" | "daily" | "weekdays" | "weekly",
      "inferredFields": ["date", "time"]
    }
  ],
  "clarifyingQuestion": "..." // optional string or null
}`;

    const response = await client.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    const cleaned = (response.text || '')
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    const parsed = JSON.parse(cleaned);

    if (parsed && Array.isArray(parsed.tasks) && parsed.tasks.length > 0) {
      return {
        tasks: parsed.tasks.map((t: any) => ({
          raw: trimmed,
          title: t.title || baseExtraction.title,
          date: t.date || baseExtraction.date,
          time: t.time || baseExtraction.time,
          category: (t.category as TaskCategory) || baseExtraction.category,
          priority: (t.priority as Priority) || baseExtraction.priority,
          targetTimestamp: baseExtraction.targetTimestamp,
          offsetMinutes: 0,
          hasAmbiguousTime: t.inferredFields?.includes('time') || false,
          timeExplanation: `Scheduled for ${t.date || 'Today'} at ${t.time || '09:00 AM'}`,
          recurrence: (t.recurrence as RecurrencePattern) || 'none',
          estimateMin: t.estimateMin || 30,
          dependencies: t.dependencies || [],
          inferredFields: t.inferredFields || [],
        })),
        clarifyingQuestion: parsed.clarifyingQuestion || undefined,
        isAiEnhanced: true,
      };
    }

    return {
      tasks: [{ ...baseExtraction, recurrence: 'none', estimateMin: 30, inferredFields: [] }],
      isAiEnhanced: false,
    };
  } catch {
    return {
      tasks: [{ ...baseExtraction, recurrence: 'none', estimateMin: 30, inferredFields: [] }],
      isAiEnhanced: false,
    };
  }
}

/**
 * 2.6 AI Task Breakdown ("Break into steps")
 * Breaks a large task into 3-5 subtasks with estimated durations.
 */
export async function breakTaskIntoStepsWithAI(task: Task): Promise<TaskBreakdownResult> {
  const fallbackSteps = [
    { id: 'step-1', title: `Review requirements & scope for ${task.title}`, estimateMin: 15, isEstimate: true, completed: false },
    { id: 'step-2', title: `Draft initial solution & key points`, estimateMin: 30, isEstimate: true, completed: false },
    { id: 'step-3', title: `Refine, verify & check for errors`, estimateMin: 20, isEstimate: true, completed: false },
  ];

  const client = getAiClient();
  if (!client) {
    return {
      taskId: task.id,
      taskTitle: task.title,
      steps: fallbackSteps,
    };
  }

  try {
    const prompt = `Break down this student task into 3-5 concrete, actionable sequential steps with estimated durations in minutes.
Task: "${task.title}"
Notes: "${task.notes || 'None'}"
Priority: ${task.priority}

Return ONLY valid JSON:
{
  "steps": [
    { "title": "Step action", "estimateMin": 20 }
  ],
  "clarificationQuestion": "Optional question if scope is ambiguous, else null"
}`;

    const response = await client.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    const cleaned = (response.text || '')
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    const parsed = JSON.parse(cleaned);

    if (parsed && Array.isArray(parsed.steps) && parsed.steps.length > 0) {
      return {
        taskId: task.id,
        taskTitle: task.title,
        steps: parsed.steps.map((s: any, idx: number) => ({
          id: `step-${Date.now()}-${idx}`,
          title: s.title,
          estimateMin: s.estimateMin || 20,
          isEstimate: true,
          completed: false,
        })),
        clarificationQuestion: parsed.clarificationQuestion || undefined,
      };
    }

    return {
      taskId: task.id,
      taskTitle: task.title,
      steps: fallbackSteps,
    };
  } catch {
    return {
      taskId: task.id,
      taskTitle: task.title,
      steps: fallbackSteps,
    };
  }
}

/**
 * 2.7 Notes -> Action Items Extractor
 * Extracts explicit action items, deadlines, and questions from notes, pairing with original text snippets.
 */
export async function extractActionItemsFromNotesWithAI(noteText: string): Promise<ExtractedActionItem[]> {
  const lines = noteText
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  // Deterministic fallback: extract bullet points or lines with action verbs
  const fallbackItems: ExtractedActionItem[] = [];
  const actionRegex = /^(?:TODO|to\s*do|submit|review|prepare|read|study|complete|bring|call|email|check|meet)[\s:-]/i;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('-') || line.startsWith('*') || actionRegex.test(line)) {
      const cleanTitle = line.replace(/^[-*•\d.)\s]+/, '').replace(/^(?:TODO|to\s*do)[\s:-]*/i, '').trim();
      fallbackItems.push({
        id: `extracted-${i}`,
        title: cleanTitle || line,
        originalText: line,
        priority: 'Med',
        category: 'work',
        selected: true,
      });
    }
  }

  const client = getAiClient();
  if (!client) {
    return fallbackItems.length > 0
      ? fallbackItems
      : [
          {
            id: 'extracted-fallback-1',
            title: `Review notes: "${lines[0]?.slice(0, 40) || 'Lecture material'}"`,
            originalText: lines[0] || noteText,
            priority: 'Med',
            category: 'work',
            selected: true,
          },
        ];
  }

  try {
    const prompt = `Analyze these student class/meeting notes and extract all explicit action items, deadlines, mentioned events, and follow-up questions.
For each item, include the EXACT snippet of text from the note it was derived from.

Notes:
"""
${noteText}
"""

Return ONLY a valid JSON array:
[
  {
    "title": "Action title",
    "originalText": "Exact text quote from note",
    "explicitDeadline": "YYYY-MM-DD or null",
    "priority": "High" | "Med" | "Low",
    "category": "work" | "personal",
    "isEvent": false,
    "needsFollowUp": false,
    "question": null
  }
]`;

    const response = await client.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    const cleaned = (response.text || '')
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    const parsed = JSON.parse(cleaned);

    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((item: any, idx: number) => ({
        id: `extracted-ai-${idx}-${Date.now()}`,
        title: item.title,
        originalText: item.originalText || item.title,
        explicitDeadline: item.explicitDeadline || undefined,
        priority: item.priority || 'Med',
        category: item.category || 'work',
        isEvent: !!item.isEvent,
        needsFollowUp: !!item.needsFollowUp,
        question: item.question || undefined,
        selected: true,
      }));
    }

    return fallbackItems;
  } catch {
    return fallbackItems;
  }
}

/**
 * 2.8 "Ask SmartDay" Grounded Planning Assistant
 * Answers queries using actual task, schedule, and habit state.
 * Requires user confirmation for state-changing operations.
 */
export async function answerAskSmartDay(
  query: string,
  appData: {
    tasks: Task[];
    scheduleItems: ScheduleItem[];
    habits: Habit[];
    sessions: FocusSession[];
  }
): Promise<AssistantChatMessage> {
  const { tasks, scheduleItems, habits, sessions } = appData;
  const qLower = query.toLowerCase();
  const now = new Date();
  const timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // 1. Tool 1: What is due tomorrow?
  if (qLower.includes('due tomorrow') || qLower.includes('tomorrow')) {
    const tomorrowTasks = tasks.filter((t) => t.due?.toLowerCase().includes('tomorrow'));
    const text =
      tomorrowTasks.length > 0
        ? `You have ${tomorrowTasks.length} task${tomorrowTasks.length > 1 ? 's' : ''} due tomorrow:\n${tomorrowTasks.map((t) => `• ${t.title} (${t.priority} priority, ${t.time || 'No specific time'})`).join('\n')}`
        : "You don't have any specific tasks due tomorrow. Would you like to schedule one?";

    return {
      id: `chat-${Date.now()}`,
      sender: 'assistant',
      text,
      timestamp,
      referencedTaskIds: tomorrowTasks.map((t) => t.id),
    };
  }

  // 2. Tool 2: Which assignments are overdue / missed?
  if (qLower.includes('overdue') || qLower.includes('missed') || qLower.includes('late')) {
    const overdueTasks = tasks.filter((t) => t.status !== 'done' && (t.due === 'Overdue' || (t.time && t.due === 'Today')));
    const text =
      overdueTasks.length > 0
        ? `I found ${overdueTasks.length} pending task${overdueTasks.length > 1 ? 's' : ''} that need attention:\n${overdueTasks.map((t) => `• ${t.title} (Scheduled: ${t.time || t.due})`).join('\n')}\nWould you like me to find open slots to reschedule them?`
        : 'Great news! You have no overdue assignments right now.';

    return {
      id: `chat-${Date.now()}`,
      sender: 'assistant',
      text,
      timestamp,
      referencedTaskIds: overdueTasks.map((t) => t.id),
    };
  }

  // 3. Tool 3: Find time for a workout or activity
  if (qLower.includes('workout') || qLower.includes('find time') || qLower.includes('free time')) {
    const matchMin = query.match(/(\d+)\s*(?:min|mins|minute|minutes)/i);
    const duration = matchMin ? parseInt(matchMin[1], 10) : 45;
    const slots = findAvailableSlots(duration, 'Today', tasks, scheduleItems);

    if (slots.length > 0) {
      const best = slots[0];
      return {
        id: `chat-${Date.now()}`,
        sender: 'assistant',
        text: `I found ${slots.length} available slot${slots.length > 1 ? 's' : ''} for a ${duration}-minute session:\n• ${best.time} – ${best.endTime} (${best.label})\n\nWould you like to schedule it?`,
        timestamp,
        proposedAction: {
          type: 'create_task',
          description: `Schedule ${duration}m Workout at ${best.time}`,
          payload: {
            title: `${duration}m Workout & Exercise`,
            time: best.time,
            due: 'Today',
            estimateMin: duration,
            priority: 'Med',
            category: 'personal',
          },
          status: 'pending',
        },
      };
    } else {
      return {
        id: `chat-${Date.now()}`,
        sender: 'assistant',
        text: `Today's schedule is packed without a full ${duration}-minute window. I recommend scheduling it for tomorrow morning at 07:30 AM before classes begin.`,
        timestamp,
      };
    }
  }

  // 4. Tool 4: Tasks without reminders
  if (qLower.includes('without reminder') || qLower.includes('no reminder')) {
    const noReminderTasks = tasks.filter((t) => t.status !== 'done' && !t.reminderEnabled);
    const text =
      noReminderTasks.length > 0
        ? `You have ${noReminderTasks.length} task${noReminderTasks.length > 1 ? 's' : ''} without active reminders:\n${noReminderTasks.map((t) => `• ${t.title}`).join('\n')}\nWould you like me to enable reminders for them?`
        : 'All of your pending tasks currently have active reminders scheduled!';

    return {
      id: `chat-${Date.now()}`,
      sender: 'assistant',
      text,
      timestamp,
      referencedTaskIds: noReminderTasks.map((t) => t.id),
    };
  }

  // 5. Tool 5: What did I complete this week?
  if (qLower.includes('complete') || qLower.includes('finished') || qLower.includes('done')) {
    const completedTasks = tasks.filter((t) => t.status === 'done');
    const totalFocusMinutes = sessions.reduce((acc, s) => acc + s.minutes, 0);

    return {
      id: `chat-${Date.now()}`,
      sender: 'assistant',
      text: `Here is your completion summary:\n• ${completedTasks.length} tasks completed\n• ${totalFocusMinutes} minutes of focused study logged\n• Active habits maintained: ${habits.filter((h) => h.streak > 0).length}\nKeep up the great momentum!`,
      timestamp,
      referencedTaskIds: completedTasks.slice(0, 5).map((t) => t.id),
    };
  }

  // Fallback to grounded Gemini LLM response
  const client = getAiClient();
  if (client) {
    try {
      const prompt = `You are SmartDay's academic planning assistant for a student named Masthan.
Student's real app data:
- Pending Tasks: ${tasks.filter((t) => t.status !== 'done').map((t) => `${t.title} (${t.priority}, time: ${t.time || 'unset'})`).join('; ') || 'None'}
- Schedule: ${scheduleItems.map((s) => `${s.time}: ${s.title} (${s.location})`).join('; ') || 'None'}
- Habits: ${habits.map((h) => `${h.name} (Streak: ${h.streak}d)`).join('; ') || 'None'}

Student's question: "${query}"

Provide a direct, accurate answer using ONLY this real data. If asked to make a schedule change or add a task, propose it clearly. Never invent tasks not listed above. Keep answer under 3 sentences.`;

      const response = await client.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      if (response.text && response.text.trim().length > 10) {
        return {
          id: `chat-${Date.now()}`,
          sender: 'assistant',
          text: response.text.trim(),
          timestamp,
        };
      }
    } catch {
      // Fallback
    }
  }

  return {
    id: `chat-${Date.now()}`,
    sender: 'assistant',
    text: `You have ${tasks.filter((t) => t.status !== 'done').length} pending tasks and ${scheduleItems.length} schedule items today. Ask me about due dates, free time, overdue tasks, or schedule recommendations!`,
    timestamp,
  };
}

/**
 * 2.9 AI Weekly Review
 * Calculates real metrics in code, then has Gemini synthesize actionable insights and improvements.
 */
export async function generateWeeklyReviewWithAI(
  tasks: Task[],
  habits: Habit[],
  sessions: FocusSession[]
): Promise<{
  tasksCompleted: number;
  tasksPlanned: number;
  completionRate: number;
  totalFocusMin: number;
  habitStreak: number;
  overdueCount: number;
  summaryExplanation: string;
  suggestedImprovements: string[];
}> {
  const completed = tasks.filter((t) => t.status === 'done').length;
  const totalTasks = tasks.length || 1;
  const rate = Math.round((completed / totalTasks) * 100);
  const totalFocusMin = sessions.reduce((acc, s) => acc + s.minutes, 0);
  const maxStreak = habits.reduce((max, h) => Math.max(max, h.streak), 0);
  const overdueCount = tasks.filter((t) => t.status !== 'done' && t.due === 'Overdue').length;

  const defaultImprovements = [
    'Schedule your most challenging study tasks in morning open windows before lectures.',
    'Keep logging focus sessions to build higher retention before major exams.',
  ];

  const defaultSummary = `This week you completed ${completed} out of ${totalTasks} tasks (${rate}%) and logged ${totalFocusMin} minutes of deep focus. Your longest habit streak is ${maxStreak} days.`;

  const client = getAiClient();
  if (!client) {
    return {
      tasksCompleted: completed,
      tasksPlanned: totalTasks,
      completionRate: rate,
      totalFocusMin,
      habitStreak: maxStreak,
      overdueCount,
      summaryExplanation: defaultSummary,
      suggestedImprovements: defaultImprovements,
    };
  }

  try {
    const prompt = `You are SmartDay's academic performance coach.
Here are the student's exact calculated metrics for the week:
- Tasks Completed: ${completed} of ${totalTasks} (${rate}%)
- Focus Minutes: ${totalFocusMin} minutes
- Longest Habit Streak: ${maxStreak} days
- Overdue Tasks: ${overdueCount}

Rules:
1. Explain the results encouragingly and realistically without inventing fake scores or numbers.
2. Provide 2 concise, practical suggestions for next week.

Return ONLY JSON:
{
  "summaryExplanation": "2-3 sentences explaining the achievements and areas of focus",
  "suggestedImprovements": ["Suggestion 1", "Suggestion 2"]
}`;

    const response = await client.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    const cleaned = (response.text || '')
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    const parsed = JSON.parse(cleaned);

    if (parsed && parsed.summaryExplanation) {
      return {
        tasksCompleted: completed,
        tasksPlanned: totalTasks,
        completionRate: rate,
        totalFocusMin,
        habitStreak: maxStreak,
        overdueCount,
        summaryExplanation: parsed.summaryExplanation,
        suggestedImprovements: parsed.suggestedImprovements || defaultImprovements,
      };
    }

    return {
      tasksCompleted: completed,
      tasksPlanned: totalTasks,
      completionRate: rate,
      totalFocusMin,
      habitStreak: maxStreak,
      overdueCount,
      summaryExplanation: defaultSummary,
      suggestedImprovements: defaultImprovements,
    };
  } catch {
    return {
      tasksCompleted: completed,
      tasksPlanned: totalTasks,
      completionRate: rate,
      totalFocusMin,
      habitStreak: maxStreak,
      overdueCount,
      summaryExplanation: defaultSummary,
      suggestedImprovements: defaultImprovements,
    };
  }
}

/**
 * Clean up dictated note: improve punctuation, capitalization, and formatting
 * while strictly preserving original meaning, dates, numbers, names.
 */
export async function cleanUpNoteWithAI(text: string): Promise<string> {
  if (!text.trim()) return text;
  const client = getAiClient();
  if (!client) {
    // Deterministic formatting fallback
    return text
      .split('\n')
      .map((p) => p.trim())
      .filter(Boolean)
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1) + (p.endsWith('.') || p.endsWith('?') || p.endsWith('!') ? '' : '.'))
      .join('\n\n');
  }

  try {
    const prompt = `You are an expert transcript editor.
Improve the punctuation, capitalization, paragraphs, and readability of this dictated note while strictly preserving all original information, meaning, names, dates, numbers, and terminology.
Never invent facts, never omit numbers or names, never change dates.

Note to clean up:
"""
${text}
"""

Return ONLY the cleaned up text, without markdown code fences or conversational preamble.`;

    const res = await client.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });
    return (res.text || '').trim() || text;
  } catch {
    return text;
  }
}

/**
 * Summarize note: turn a long dictated note into key bullet points and core takeaways.
 */
export async function summarizeNoteWithAI(text: string): Promise<string> {
  if (!text.trim()) return text;
  const client = getAiClient();
  if (!client) {
    const lines = text.split(/[.\n]/).map(s => s.trim()).filter(s => s.length > 5);
    return lines.slice(0, 4).map(l => `• ${l}`).join('\n');
  }

  try {
    const prompt = `You are an executive summary assistant.
Summarize this dictated note into concise, actionable bullet points highlighting key insights, decisions, and deadlines.
Preserve all specific names, dates, and figures.

Note content:
"""
${text}
"""

Format as:
Key Takeaways:
• [bullet 1]
• [bullet 2]
• [bullet 3]

Return ONLY the summary.`;

    const res = await client.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });
    return (res.text || '').trim() || text;
  } catch {
    return text;
  }
}

/**
 * Translate note into target language.
 */
export async function translateNoteWithAI(text: string, targetLanguage: string): Promise<string> {
  if (!text.trim()) return text;
  const client = getAiClient();
  if (!client) {
    return `[${targetLanguage} Translation]\n${text}`;
  }

  try {
    const prompt = `Translate the following note accurately and fluently into ${targetLanguage}.
Maintain tone, bullet formatting, and factual accuracy. Preserve dates, numbers, and proper names where appropriate.

Note text:
"""
${text}
"""

Return ONLY the translation without preamble.`;

    const res = await client.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });
    return (res.text || '').trim() || text;
  } catch {
    return text;
  }
}
