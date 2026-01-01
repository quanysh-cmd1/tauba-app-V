
export type Language = 'kk' | 'ru' | 'en';

export interface PrayerTimes {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
  Midnight: string; 
}

export interface City {
  id: number;
  title: string;
  lng: number | string;
  lat: number | string;
}

export interface HijriDateInfo {
  day: number;
  month: number;
  year: number;
  monthName: string;
  dayName: string;
  fullString: string;
}

export interface IslamicEvent {
  name: {
    kk: string;
    ru: string;
    en: string;
  };
  date: string; // YYYY-MM-DD
  isUpcoming: boolean;
}

export type ViewState = 'prayer' | 'quran' | 'zikir' | 'qibla' | 'ai-imam' | 'more' | 'hadith' | 'riwayat' | 'wallpapers' | 'calendar';

export interface GeneratedContent {
  title: string;
  content: string;
  reference?: string;
  translation?: string;
}

export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

export interface Ayah {
  number: number;
  text: string;
  translation?: string;
  tafsir?: string;
  audio?: string;
  numberInSurah: number;
  juz: number;
  surahName?: string;
}

export interface Reciter {
  id: string;
  name: string;
  type: 'api' | 'custom';
  baseUrl?: string;
}

export type ZikirCategory = 'sabr' | 'tauba' | 'night' | 'protection';

export interface ZikirDefinition {
  id: string;
  arabic: string;
  title: { kk: string; ru: string; en: string };
  meaning: { kk: string; ru: string; en: string };
  category: ZikirCategory;
  defaultTarget: number;
  description: { kk: string; ru: string; en: string };
}

export interface AppBackground {
  id: string;
  url: string;
  type: 'image' | 'gradient' | 'dynamic';
  period?: 'day' | 'night';
  name?: { kk: string; ru: string };
}
