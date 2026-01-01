
import { City, ZikirDefinition, AppBackground } from './types';

export const CITY_DATABASE: City[] = [
  {id: 1, title: "Алматы қаласы", lng: 76.945465, lat: 43.238293},
  {id: 2, title: "Астана қаласы", lng: 71.433333, lat: 51.133333},
  {id: 3, title: "Шымкент қаласы", lng: 69.612769, lat: 42.368009},
  {id: 19, title: "Ақтау қаласы", lng: 51.166667, lat: 43.650000},
  {id: 20, title: "Ақтөбе қаласы", lng: 57.166667, lat: 50.283333},
  {id: 15, title: "Атырау қаласы", lng: 51.916667, lat: 47.116667},
  {id: 11, title: "Қарағанды қаласы", lng: 73.083333, lat: 49.800000},
  {id: 14, title: "Қостанай қаласы", lng: 63.633333, lat: 53.216667},
  {id: 10, title: "Қызылорда қаласы", lng: 65.500000, lat: 44.850000},
  {id: 8, title: "Павлодар қаласы", lng: 76.950000, lat: 52.300000},
  {id: 6, title: "Петропавл қаласы", lng: 69.150000, lat: 54.866667},
  {id: 4, title: "Тараз қаласы", lng: 71.366667, lat: 42.900000},
  {id: 5, title: "Орал қаласы", lng: 51.366667, lat: 51.233333},
  {id: 7, title: "Өскемен қаласы", lng: 82.616667, lat: 49.950000},
  {id: 9, title: "Көкшетау қаласы", lng: 69.383333, lat: 53.283333},
  {id: 12, title: "Талдықорған қаласы", lng: 78.366667, lat: 45.016667},
  {id: 13, title: "Түркістан қаласы", lng: 68.216667, lat: 43.300000}
];

export const DEFAULT_CITY: City = CITY_DATABASE[0];

export const BACKGROUNDS: AppBackground[] = [
  { id: 'dynamic', type: 'dynamic', url: '', name: { kk: 'Динамикалық режим', ru: 'Динамический режим' } },
  { id: 'mosque-interior-day', period: 'day', type: 'image', url: 'https://images.unsplash.com/photo-1581490216447-e16067f920f2?q=80&w=1080', name: { kk: 'Мешіт іші (Күндіз)', ru: 'Интерьер мечети' } },
  { id: 'kaaba-day', period: 'day', type: 'image', url: 'https://images.unsplash.com/photo-1591604021695-0c69b7c05981?q=80&w=1080', name: { kk: 'Қасиетті Мекке', ru: 'Священная Мекка' } },
  { id: 'medina-day', period: 'day', type: 'image', url: 'https://images.unsplash.com/photo-1551041777-ed07f99b57d4?q=80&w=1080', name: { kk: 'Мәдина қаласы', ru: 'Медина' } },
  { id: 'minaret-night', period: 'night', type: 'image', url: 'https://images.unsplash.com/photo-1504333638930-c8787321eee0?q=80&w=1080', name: { kk: 'Айлы түндегі мұнара', ru: 'Минарет ночью' } },
  { id: 'mosque-night-glow', period: 'night', type: 'image', url: 'https://images.unsplash.com/photo-1542751110-9764642429f3?q=80&w=1080', name: { kk: 'Мешіт сәулесі', ru: 'Сияние мечети' } },
  { id: 'kaaba-night', period: 'night', type: 'image', url: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?q=80&w=1080', name: { kk: 'Түнгі Қағба', ru: 'Ночная Кааба' } },
  { id: 'mosque-silhouette', period: 'night', type: 'image', url: 'https://images.unsplash.com/photo-1584281723351-404394073f32?q=80&w=1080', name: { kk: 'Түнгі тыныштық', ru: 'Ночная тишина' } },
];

export const ZIKIR_LIST: ZikirDefinition[] = [
  { id: 'subhanallah', arabic: 'سُبْحَانَ ٱللَّٰهِ', title: { kk: 'Субханаллах', ru: 'Субханаллах', en: 'Subhanallah' }, meaning: { kk: 'Алла кемшілік атаулыдан пәк', ru: 'Аллах пречист от недостатков', en: 'Glory be to Allah' }, category: 'sabr', defaultTarget: 33, description: { kk: 'Жүректі тыныштандырады', ru: 'Успокаивает сердце', en: 'Calms the heart' } },
  { id: 'alhamdulillah', arabic: 'ٱلْحَمْدُ لِلَّٰهِ', title: { kk: 'Әлхамдулилләһ', ru: 'Альхамдулиллях', en: 'Alhamdulillah' }, meaning: { kk: 'Барлық мақтау Аллаға тән', ru: 'Вся хвала Аллаху', en: 'All praise is due to Allah' }, category: 'sabr', defaultTarget: 33, description: { kk: 'Ризықты арттырады', ru: 'Увеличивает удел', en: 'Increases provision' } }
];

export const TRANSLATIONS = {
  kk: { 
    appName: 'Tauba', prayerTimes: 'Намаз', hadith: 'Хадис', riwayat: 'Риуаят', zikir: 'Зікір', quran: 'Құран', qibla: 'Құбыла', aiImam: 'Имам', more: 'Тағы', 
    fajr: 'Таң', sunrise: 'Күн шығуы', dhuhr: 'Бесін', asr: 'Екінті', maghrib: 'Ақшам', isha: 'Құптан', midnight: 'Түн ортасы', 
    selectCity: 'Елді мекенді таңдаңыз', loading: 'Есептелуде...', loadingCities: 'Тізім жүктелуде...', generateHadith: 'Жаңа хадис', 
    generateRiwayat: 'Жаңа риуаят', askQuestion: 'Сұрақ қойыңыз...', source: 'Дереккөз', error: 'Қате', nextPrayer: 'Келесі намаз', 
    upcoming: 'Алда', timeLeft: 'қалды', kaabaDirection: 'Қағба бағыты', yourLocation: 'Сіздің орныңыз', 
    geminiDisclaimer: 'AI (Gemini) арқылы жасалған.', islamicDate: 'Хижри күнтізбесі', searchSurah: 'Сүре іздеу...', 
    tafsir: 'Тәпсір', share: 'Бөлісу', readInTauba: 'Tauba қосымшасында алынды', focusMode: 'Тыныш режим', 
    cat_sabr: 'Сабыр', cat_tauba: 'Тәубе', cat_night: 'Түн', cat_protection: 'Қорғаныс', dailyConsistency: 'Тұрақтылық', 
    reset: 'Нөлдеу', niyatTitle: 'Ниет', niyatText: 'Алла разылығы үшін...', startZikir: 'Бастау', 
    mashallah: 'МәшАллаһ!', cycleCompleted: 'Зікір аяқталды', generatingReward: 'Дайындалуда...', 
    shareMessage: 'Зікір жасауды ұмытпаңыз.', zikirCount: 'Зікір', close: 'Жабу', 
    searchCityPlaceholder: 'Ауыл немесе қала атын жазыңыз...', selectWallpaper: 'Тұсқағаз', 
    calendar: 'Күнтізбе', mon: 'Дс', tue: 'Сс', wed: 'Ср', thu: 'Бс', fri: 'Жм', sat: 'Сн', sun: 'Жс'
  },
  ru: { 
    appName: 'Tauba', prayerTimes: 'Намаз', hadith: 'Хадисы', riwayat: 'Истории', zikir: 'Зикр', quran: 'Коран', qibla: 'Кибла', aiImam: 'Имам', more: 'Еще', 
    fajr: 'Фаджр', sunrise: 'Восход', dhuhr: 'Зухр', asr: 'Аср', maghrib: 'Магриб', isha: 'Иша', midnight: 'Полночь', 
    selectCity: 'Выберите город', loading: 'Вычисление...', loadingCities: 'Загрузка...', generateHadith: 'Новый хадис', 
    generateRiwayat: 'Новая история', askQuestion: 'Ваш вопрос...', source: 'Источник', error: 'Ошибка', nextPrayer: 'Следующий намаз', 
    upcoming: 'Скоро', timeLeft: 'осталось', kaabaDirection: 'Направление Каабы', yourLocation: 'Ваше положение', 
    geminiDisclaimer: 'Сгенерировано ИИ.', islamicDate: 'Хиджра', searchSurah: 'Поиск суры...', 
    tafsir: 'Тафсир', share: 'Поделиться', readInTauba: 'Получено в Tauba', focusMode: 'Фокус режим', 
    cat_sabr: 'Сабр', cat_tauba: 'Покаяние', cat_night: 'Ночь', cat_protection: 'Защита', dailyConsistency: 'Стабильность', 
    reset: 'Сброс', niyatTitle: 'Намерение', niyatText: 'Ради Аллаха...', startZikir: 'Начать', 
    mashallah: 'Машаллах!', cycleCompleted: 'Зикр завершен', generatingReward: 'Генерация...', 
    shareMessage: 'Не забывайте о зикре.', zikirCount: 'Зикр', close: 'Закрыть', 
    searchCityPlaceholder: 'Название села или города...', selectWallpaper: 'Обои', 
    calendar: 'Календарь', mon: 'Пн', tue: 'Вт', wed: 'Ср', thu: 'Чт', fri: 'Пт', sat: 'Сб', sun: 'Вс'
  }
};
