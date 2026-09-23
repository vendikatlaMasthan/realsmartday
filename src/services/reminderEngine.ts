// SmartDay Shared Reminder Engine
// Platform: React Native Web / Browser
// Notification Approach:
// - Browser Notification API when permission is granted.
// - Built-in synthesized audio chime (Web Audio API) for zero-dependency sound.
// - In-App Alert Banner & Modal with Snooze (+5, +10, +15, +30 min), Complete, and Dismiss.
// - Deterministic Natural Language Parsing for Quick Capture.
//
// NOTE ON CLOSED-APP LIMITATION:
// In a pure web environment without a dedicated backend Web Push server,
// background notifications cannot fire after the browser tab is fully closed.
// This limitation is clearly labeled in the UI.

import { TaskCategory, Priority, ReminderItem } from '../types';

export const PLATFORM_NOTIFICATION_NOTICE =
  'Web Alert Mode: Browser tab must remain open. Background alerts when browser is closed require a native OS build or Web Push service.';

export interface ExtractedTaskData {
  raw: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "09:00 AM"
  category: TaskCategory;
  priority: Priority;
  targetTimestamp: number;
  offsetMinutes: number;
  hasAmbiguousTime: boolean;
  timeExplanation: string;
}

/**
 * Converts 12-hour or 24-hour time strings + date into Epoch MS timestamp.
 */
export function calculateReminderTimestamp(
  dateStr: string,
  timeStr: string,
  offsetMinutes: number = 0
): number {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    let hours = 9;
    let minutes = 0;

    const trimmed = timeStr.trim();
    const match12 = trimmed.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm|AM|PM)$/i);
    const match24 = trimmed.match(/^(\d{1,2}):(\d{2})$/);

    if (match12) {
      let h = parseInt(match12[1], 10);
      const m = match12[2] ? parseInt(match12[2], 10) : 0;
      const meridiem = match12[3].toLowerCase();
      if (meridiem === 'pm' && h < 12) h += 12;
      if (meridiem === 'am' && h === 12) h = 0;
      hours = h;
      minutes = m;
    } else if (match24) {
      hours = parseInt(match24[1], 10);
      minutes = parseInt(match24[2], 10);
    }

    const d = new Date(year, (month || 1) - 1, day || 1, hours, minutes, 0, 0);
    const baseEpoch = d.getTime();
    return Math.max(Date.now(), baseEpoch - offsetMinutes * 60 * 1000);
  } catch {
    return Date.now() + 60 * 60 * 1000;
  }
}

/**
 * Format epoch timestamp to clean readable time e.g. "11:30 AM"
 */
export function formatTimeFromEpoch(epochMs: number): string {
  const d = new Date(epochMs);
  let hours = d.getHours();
  const minutes = d.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 becomes 12
  const minStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
  return `${hours}:${minStr} ${ampm}`;
}

/**
 * Format epoch timestamp to YYYY-MM-DD
 */
export function formatDateFromEpoch(epochMs: number): string {
  const d = new Date(epochMs);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Deterministic NLP Extraction for Quick Capture.
 * Supports patterns:
 * - "Submit DBMS assignment tomorrow at 9 AM"
 * - "Call mom in 30 minutes"
 * - "Meeting with prof in 1 hour"
 * - "Finish project on Friday at 4 PM"
 * - "Emergency exam preparation tonight at 8 PM"
 */
export function parseQuickCapture(input: string): ExtractedTaskData {
  const text = input.trim();
  const now = new Date();
  const todayStr = formatDateFromEpoch(now.getTime());

  let targetDate = todayStr;
  let targetTime = '09:00 AM';
  let targetTimestamp = now.getTime() + 60 * 60 * 1000; // default 1h ahead
  let hasAmbiguousTime = false;
  let timeExplanation = 'Scheduled for today at 9:00 AM';

  // 1. Relative "in X minutes / in X hours"
  const inMinMatch = text.match(/\bin\s+(\d+)\s*(?:min|mins|minute|minutes)\b/i);
  const inHourMatch = text.match(/\bin\s+(\d+)\s*(?:hr|hrs|hour|hours)\b/i);

  if (inMinMatch) {
    const mins = parseInt(inMinMatch[1], 10);
    targetTimestamp = now.getTime() + mins * 60 * 1000;
    targetDate = formatDateFromEpoch(targetTimestamp);
    targetTime = formatTimeFromEpoch(targetTimestamp);
    timeExplanation = `Due in ${mins} minutes (${targetTime})`;
  } else if (inHourMatch) {
    const hrs = parseInt(inHourMatch[1], 10);
    targetTimestamp = now.getTime() + hrs * 60 * 60 * 1000;
    targetDate = formatDateFromEpoch(targetTimestamp);
    targetTime = formatTimeFromEpoch(targetTimestamp);
    timeExplanation = `Due in ${hrs} hour${hrs > 1 ? 's' : ''} (${targetTime})`;
  } else {
    // 2. Date extraction: "tomorrow", "tonight", "today"
    let d = new Date();
    if (/\btomorrow\b/i.test(text)) {
      d.setDate(d.getDate() + 1);
      targetDate = formatDateFromEpoch(d.getTime());
      timeExplanation = 'Tomorrow';
    } else if (/\btonight\b/i.test(text)) {
      timeExplanation = 'Tonight';
    }

    // 3. Time extraction: "at 9 AM", "at 9:30 PM", "9am", "14:00"
    const timeRegex = /\b(?:at\s+)?(\d{1,2}(?::\d{2})?\s*(?:am|pm|AM|PM))\b/;
    const timeMatch = text.match(timeRegex);

    if (timeMatch) {
      const rawTime = timeMatch[1].trim().toUpperCase();
      // Normalize to "HH:MM AM/PM"
      const parts = rawTime.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/);
      if (parts) {
        const hh = parts[1].padStart(2, '0');
        const mm = parts[2] || '00';
        targetTime = `${hh}:${mm} ${parts[3]}`;
        timeExplanation += ` at ${targetTime}`;
      } else {
        targetTime = rawTime;
      }
    } else if (/\btonight\b/i.test(text)) {
      targetTime = '08:00 PM';
      timeExplanation += ' at 08:00 PM';
    } else if (/\bmorning\b/i.test(text)) {
      targetTime = '09:00 AM';
      timeExplanation += ' at 09:00 AM';
    } else if (/\bafternoon\b/i.test(text)) {
      targetTime = '02:00 PM';
      timeExplanation += ' at 02:00 PM';
    } else {
      // Default to 1 hour ahead if no time is provided
      const oneHourAhead = new Date(now.getTime() + 60 * 60 * 1000);
      targetTime = formatTimeFromEpoch(oneHourAhead.getTime());
      hasAmbiguousTime = true;
      timeExplanation = `Defaulted to 1 hour ahead (${targetTime})`;
    }

    targetTimestamp = calculateReminderTimestamp(targetDate, targetTime, 0);
  }

  // 4. Clean Title by stripping time/date phrases
  let cleanedTitle = text
    .replace(/\bin\s+\d+\s*(?:min|mins|minute|minutes|hr|hrs|hour|hours)\b/gi, '')
    .replace(/\b(?:at\s+)?\d{1,2}(?::\d{2})?\s*(?:am|pm|AM|PM)\b/gi, '')
    .replace(/\b(tomorrow|today|tonight|in the morning|in the afternoon|in the evening)\b/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  // Remove leading/trailing prepositions or punctuation
  cleanedTitle = cleanedTitle.replace(/^[-–—:,.\s]+/, '').replace(/[-–—:,.\s]+$/, '').trim();
  if (!cleanedTitle) {
    cleanedTitle = text;
  }

  // 5. Deterministic Category & Priority
  const lower = text.toLowerCase();
  let category: TaskCategory = 'personal';
  let priority: Priority = 'Med';

  if (/\b(urgent|asap|now|emergency|critical|immediately|deadline)\b/i.test(lower)) {
    category = 'urgent';
    priority = 'High';
  } else if (
    /\b(submit|assignment|dbms|homework|class|lecture|exam|lab|project|professor|faculty|paper|quiz|study|presentation|code|review|office|syllabus)\b/i.test(
      lower
    )
  ) {
    category = 'work';
    priority = 'High';
  } else if (/\b(call|mom|dad|doctor|dentist|grocery|buy|dinner|lunch|clean|gym|workout|water)\b/i.test(lower)) {
    category = 'personal';
    priority = 'Med';
  }

  return {
    raw: text,
    title: cleanedTitle,
    date: targetDate,
    time: targetTime,
    category,
    priority,
    targetTimestamp,
    offsetMinutes: 0,
    hasAmbiguousTime,
    timeExplanation,
  };
}

/**
 * Web Audio API synthesizer for clean notification chimes.
 * Works across all browsers with zero assets/network requests.
 */
let audioCtx: any = null;

export function playNotificationChime(): void {
  try {
    if (typeof window === 'undefined') return;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;

    // First note: 587.33 Hz (D5)
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.25, now + 0.05);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    osc1.start(now);
    osc1.stop(now + 0.4);

    // Second note: 880 Hz (A5)
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.15);
    gain2.gain.setValueAtTime(0, now + 0.15);
    gain2.gain.linearRampToValueAtTime(0.3, now + 0.2);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.65);
  } catch {
    // Audio context not allowed or failed
  }
}

/**
 * Web browser notification permission state
 */
export type BrowserNotificationStatus = 'granted' | 'denied' | 'default' | 'unsupported';

export function getBrowserNotificationStatus(): BrowserNotificationStatus {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission as BrowserNotificationStatus;
}

export async function requestBrowserNotificationPermission(): Promise<BrowserNotificationStatus> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  try {
    const result = await Notification.requestPermission();
    return result as BrowserNotificationStatus;
  } catch {
    return 'denied';
  }
}

/**
 * Fires a browser desktop notification if permitted.
 */
export function triggerBrowserNotification(
  title: string,
  body: string,
  tag?: string,
  onClick?: () => void
): void {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  try {
    const notification = new Notification(title, {
      body,
      icon: '/assets/icon.png',
      tag: tag || `smartday-${Date.now()}`,
    });

    if (onClick) {
      notification.onclick = () => {
        window.focus();
        onClick();
        notification.close();
      };
    }
  } catch {
    // Non-fatal if browser blocks
  }
}

/**
 * Checks whether current time is within user quiet hours (e.g. 22:00 to 07:00).
 */
export function isDuringQuietHours(
  quietHours: { start: string; end: string } = { start: '22:00', end: '07:00' }
): boolean {
  try {
    const now = new Date();
    const currentMin = now.getHours() * 60 + now.getMinutes();
    const [startH, startM] = quietHours.start.split(':').map(Number);
    const [endH, endM] = quietHours.end.split(':').map(Number);
    const startMin = startH * 60 + (startM || 0);
    const endMin = endH * 60 + (endM || 0);

    if (startMin > endMin) {
      // Overnight range e.g. 22:00 to 07:00
      return currentMin >= startMin || currentMin < endMin;
    }
    return currentMin >= startMin && currentMin < endMin;
  } catch {
    return false;
  }
}

/**
 * Groups reminders scheduled within 15 minutes of each other into bundles.
 */
export function findBundledReminders(
  reminders: ReminderItem[]
): Array<{ timeWindow: string; items: ReminderItem[] }> {
  const active = reminders.filter((r) => r.status === 'scheduled' || r.status === 'snoozed');
  active.sort((a, b) => a.targetTimestamp - b.targetTimestamp);

  const bundles: Array<{ timeWindow: string; items: ReminderItem[] }> = [];

  for (const rem of active) {
    const existing = bundles.find(
      (b) => Math.abs(b.items[0].targetTimestamp - rem.targetTimestamp) <= 15 * 60 * 1000
    );

    if (existing) {
      existing.items.push(rem);
    } else {
      bundles.push({
        timeWindow: rem.dueTime || formatTimeFromEpoch(rem.targetTimestamp),
        items: [rem],
      });
    }
  }

  return bundles.filter((b) => b.items.length > 1);
}

