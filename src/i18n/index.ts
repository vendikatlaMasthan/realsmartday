// SmartDay i18n & Localization Architecture
import { SupportedLanguage } from '../types';
import { en, TranslationKeys } from './locales/en';
import { es } from './locales/es';
import { fr } from './locales/fr';
import { de } from './locales/de';
import { hi } from './locales/hi';
import { ja } from './locales/ja';
import { ar } from './locales/ar';

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
  isRTL: boolean;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', isRTL: false },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', isRTL: false },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', isRTL: false },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', isRTL: false },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', isRTL: false },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', isRTL: false },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', isRTL: true },
];

const dictionaries: Record<SupportedLanguage, Record<TranslationKeys, string>> = {
  en,
  es,
  fr,
  de,
  hi,
  ja,
  ar,
};

export const translate = (
  lang: SupportedLanguage,
  key: TranslationKeys,
  params?: Record<string, string | number>
): string => {
  const dict = dictionaries[lang] || dictionaries.en;
  let text = dict[key] || dictionaries.en[key] || (key as string);

  if (params) {
    Object.entries(params).forEach(([paramKey, val]) => {
      text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(val));
    });
  }
  return text;
};

// Check if language is RTL
export const isLanguageRTL = (lang: SupportedLanguage): boolean => {
  return lang === 'ar';
};

// Locale-aware Date Formatter (e.g., "Sat 12 Sep")
export const formatLocaleDate = (date: Date, lang: SupportedLanguage): string => {
  try {
    const localeMap: Record<SupportedLanguage, string> = {
      en: 'en-US',
      es: 'es-ES',
      fr: 'fr-FR',
      de: 'de-DE',
      hi: 'hi-IN',
      ja: 'ja-JP',
      ar: 'ar-SA',
    };
    const locale = localeMap[lang] || 'en-US';
    return new Intl.DateTimeFormat(locale, {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    }).format(date);
  } catch {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]}`;
  }
};

// Locale-aware relative time (e.g., "2h ago", "yesterday", "in 3d")
export const formatRelativeTime = (dateStr: string, lang: SupportedLanguage): string => {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSec < 60) return lang === 'ja' ? '今' : lang === 'ar' ? 'الآن' : 'just now';
  if (diffMin < 60) return `${diffMin}${translate(lang, 'min')} ${lang === 'ar' ? 'مضت' : 'ago'}`;
  if (diffHours < 24) return `${diffHours}${translate(lang, 'hours')} ${lang === 'ar' ? 'مضت' : 'ago'}`;
  if (diffDays === 1) return lang === 'es' ? 'ayer' : lang === 'fr' ? 'hier' : lang === 'de' ? 'gestern' : lang === 'ar' ? 'أمس' : 'yesterday';
  return `${diffDays}${translate(lang, 'days')} ${lang === 'ar' ? 'مضت' : 'ago'}`;
};

// 7-day localized weekday labels for dot grids with correct first day
export const getLocalizedWeekdays = (lang: SupportedLanguage): { day: string; fullDate: string }[] => {
  const result: { day: string; fullDate: string }[] = [];
  const today = new Date();

  // Past 6 days + today = 7 days
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const fullDate = `${yyyy}-${mm}-${dd}`;

    let dayLetter = 'M';
    try {
      const localeMap: Record<SupportedLanguage, string> = {
        en: 'en-US',
        es: 'es-ES',
        fr: 'fr-FR',
        de: 'de-DE',
        hi: 'hi-IN',
        ja: 'ja-JP',
        ar: 'ar-SA',
      };
      const formatted = new Intl.DateTimeFormat(localeMap[lang] || 'en-US', { weekday: 'narrow' }).format(d);
      dayLetter = formatted.charAt(0);
    } catch {
      const englishDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
      dayLetter = englishDays[d.getDay()];
    }

    result.push({ day: dayLetter, fullDate });
  }

  return result;
};
