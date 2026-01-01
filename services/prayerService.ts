
import { PrayerTimes, HijriDateInfo, IslamicEvent, City } from '../types';

export const cleanTime = (time: string): string => {
  if (!time) return "--:--";
  const match = time.match(/(\d{1,2}):(\d{2})/);
  if (!match) return "--:--";
  let h = parseInt(match[1]);
  const m = match[2];
  return `${h.toString().padStart(2, '0')}:${m}`;
};

const dtr = (d: number) => (d * Math.PI) / 180;
const rtd = (r: number) => (r * 180) / Math.PI;

export const findClosestCity = (lat: number, lng: number, cities: City[]): City => {
  let closest = cities[0];
  let minDistance = Infinity;
  for (const city of cities) {
    const lat2 = Number(city.lat);
    const lon2 = Number(city.lng);
    const R = 6371;
    const dLat = dtr(lat2 - lat);
    const dLon = dtr(lon2 - lng);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(dtr(lat)) * Math.cos(dtr(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const dist = R * c;
    if (dist < minDistance) { minDistance = dist; closest = city; }
  }
  return closest;
};

const fetchAladhanFallback = async (city: City): Promise<PrayerTimes | null> => {
  try {
    const response = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city.title)}&country=Kazakhstan&method=3`);
    if (!response.ok) return null;
    const data = await response.json();
    const t = data.data.timings;
    return {
      Fajr: cleanTime(t.Fajr), Sunrise: cleanTime(t.Sunrise), Dhuhr: cleanTime(t.Dhuhr),
      Asr: cleanTime(t.Asr), Maghrib: cleanTime(t.Maghrib), Isha: cleanTime(t.Isha), Midnight: cleanTime(t.Midnight)
    };
  } catch (e) { return null; }
};

const fetchMuftyatModern = async (city: City, date: Date): Promise<PrayerTimes | null> => {
    try {
        const year = date.getFullYear();
        const lat = city.lat;
        const lng = city.lng;
        // Жаңа Муфтият API: api.muftyat.kz/prayer-times/Year/Lat/Lng
        const url = `https://api.muftyat.kz/prayer-times/${year}/${lat}/${lng}`;
        const res = await fetch(url);
        if (!res.ok) return null;
        const data = await res.json();
        
        // API бүкіл жылдың кестесін қайтарса, ағымдағы күнді табу керек
        const dateStr = date.toISOString().split('T')[0];
        const dayData = data.result?.find((d: any) => d.date === dateStr) || data.result?.[0];

        if (dayData) {
            return {
                Fajr: cleanTime(dayData.fajr),
                Sunrise: cleanTime(dayData.sunrise),
                Dhuhr: cleanTime(dayData.dhuhr),
                Asr: cleanTime(dayData.asr),
                Maghrib: cleanTime(dayData.maghrib),
                Isha: cleanTime(dayData.isha),
                Midnight: "--:--"
            };
        }
        return null;
    } catch (e) { return null; }
};

export const getPrayerTimes = async (city: City, date: Date): Promise<PrayerTimes> => {
  const cacheKey = `prayer_times_${city.id}_${date.toISOString().split('T')[0]}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try { return JSON.parse(cached); } catch(e) {}
  }
  
  let times = await fetchMuftyatModern(city, date);
  if (!times) {
      // Ескі API-ға немесе Aladhan-ға өту
      const oldUrl = `https://namaz.muftyat.kz/kk/namaz/api/today/${city.id}`;
      try {
          const res = await fetch(oldUrl);
          const data = await res.json();
          const t = data.result || data;
          if (t && t.fajr) {
              times = {
                  Fajr: cleanTime(t.fajr), Sunrise: cleanTime(t.sunrise), Dhuhr: cleanTime(t.dhuhr),
                  Asr: cleanTime(t.asr), Maghrib: cleanTime(t.maghrib), Isha: cleanTime(t.isha), Midnight: "--:--"
              };
          }
      } catch (e) {}
  }

  if (!times) times = await fetchAladhanFallback(city);
  
  if (times) {
    localStorage.setItem(cacheKey, JSON.stringify(times));
    return times;
  }
  
  return { Fajr: "--:--", Sunrise: "--:--", Dhuhr: "--:--", Asr: "--:--", Maghrib: "--:--", Isha: "--:--", Midnight: "--:--" };
};

export const calculateQiblaHeading = (lat: number, lng: number): number => {
  const K_LAT = dtr(21.422487);
  const K_LON = dtr(39.826206);
  const latR = dtr(lat);
  const lonR = dtr(lng);
  const dLon = K_LON - lonR;
  return (rtd(Math.atan2(Math.sin(dLon), Math.cos(latR) * Math.tan(K_LAT) - Math.sin(latR) * Math.cos(dLon))) + 360) % 360;
};

export const getHijriDate = (date: Date, lang: string): HijriDateInfo => {
  const locale = lang === 'kk' ? 'kk-KZ-u-ca-islamic' : (lang === 'ru' ? 'ru-RU-u-ca-islamic' : 'en-u-ca-islamic');
  
  const day = parseInt(new Intl.DateTimeFormat(locale, { day: 'numeric' }).format(date));
  const year = parseInt(new Intl.DateTimeFormat(locale, { year: 'numeric' }).format(date));
  const monthName = new Intl.DateTimeFormat(locale, { month: 'long' }).format(date);
  const fullString = new Intl.DateTimeFormat(locale, { day: 'numeric', year: 'numeric', month: 'long' }).format(date);
  
  return { 
    day, 
    month: 0, 
    year, 
    fullString, 
    monthName, 
    dayName: new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(date) 
  };
};

export const getIslamicEvents = (year: number): IslamicEvent[] => {
  if (year === 2026) {
    return [
      { name: { kk: 'Миғраж түні', ru: 'Ночь Мирадж', en: 'Isra and Mi\'raj' }, date: '2026-01-16', isUpcoming: true },
      { name: { kk: 'Бараат түні', ru: 'Ночь Бараат', en: 'Night of Bara\'at' }, date: '2026-02-03', isUpcoming: true },
      { name: { kk: 'Рамазан айының басталуы', ru: 'Начало Рамадана', en: 'Start of Ramadan' }, date: '2026-02-19', isUpcoming: true },
      { name: { kk: 'Қадір түні', ru: 'Ночь Предопределения', en: 'Laylat al-Qadr' }, date: '2026-03-17', isUpcoming: true },
      { name: { kk: 'Ораза айт', ru: 'Ураза Байрам', en: 'Eid al-Fitr' }, date: '2026-03-20', isUpcoming: true },
      { name: { kk: 'Арапа', ru: 'День Арафа', en: 'Day of Arafah' }, date: '2026-05-26', isUpcoming: true },
      { name: { kk: 'Құрбан айт (1-күні)', ru: 'Курбан Байрам (День 1)', en: 'Eid al-Adha (Day 1)' }, date: '2026-05-27', isUpcoming: true },
      { name: { kk: 'Құрбан айт (2-күні)', ru: 'Курбан Байрам (День 2)', en: 'Eid al-Adha (Day 2)' }, date: '2026-05-28', isUpcoming: true },
      { name: { kk: 'Құрбан айт (3-күні)', ru: 'Курбан Байрам (День 3)', en: 'Eid al-Adha (Day 3)' }, date: '2026-05-29', isUpcoming: true },
      { name: { kk: 'Ашура күні', ru: 'День Ашура', en: 'Day of Ashura' }, date: '2026-06-25', isUpcoming: true },
      { name: { kk: 'Мәуліт мерекесі', ru: 'Мавлид ан-Наби', en: 'Mawlid' }, date: '2026-08-25', isUpcoming: true },
    ];
  }
  
  return [
    { name: { kk: 'Рамазан айының басы', ru: 'Начало Рамадана', en: 'Start of Ramadan' }, date: '2025-03-01', isUpcoming: true },
    { name: { kk: 'Қадір түні', ru: 'Ночь Предопределения', en: 'Laylat al-Qadr' }, date: '2025-03-26', isUpcoming: true },
    { name: { kk: 'Ораза айт', ru: 'Ураза Байрам', en: 'Eid al-Fitr' }, date: '2025-03-30', isUpcoming: true },
    { name: { kk: 'Арафа күні', ru: 'День Арафа', en: 'Day of Arafah' }, date: '2025-06-05', isUpcoming: true },
    { name: { kk: 'Құрбан айт', ru: 'Курбан Байрам', en: 'Eid al-Adha' }, date: '2025-06-06', isUpcoming: true },
    { name: { kk: 'Ашура күні', ru: 'День Ашура', en: 'Day of Ashura' }, date: '2025-07-06', isUpcoming: true },
    { name: { kk: 'Мәуліт мерекесі', ru: 'Мавлид ан-Наби', en: 'Mawlid' }, date: '2025-09-04', isUpcoming: true },
  ];
};

export async function checkApiHealth(): Promise<boolean> {
    try {
        const res = await fetch('https://api.muftyat.kz/cities/', { method: 'HEAD', cache: 'no-store' });
        return res.ok;
    } catch (e) { return false; }
}
