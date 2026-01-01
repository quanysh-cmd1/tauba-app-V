
import { Surah, Ayah, Language, Reciter } from '../types';

const BASE_URL = 'https://api.alquran.cloud/v1';

export const RECITERS: Reciter[] = [
  { id: 'ar.alafasy', name: 'Mishary Rashid Alafasy', type: 'api' },
  { id: 'salman', name: 'Салман әл-Утейби', type: 'custom', baseUrl: 'https://everyayah.com/data/Salman_Al-Utaybi_128kbps' },
];

// Official Kazakh names (Muftyat standard)
const KAZAKH_NAMES: { [key: number]: string } = {
  1: "Фатиха", 2: "Бақара", 3: "Әли Имран", 4: "Ниса", 5: "Мәида", 6: "Әнғам", 7: "Ағраф", 8: "Әнфал", 9: "Тәубе", 10: "Жүніс",
  11: "Һуд", 12: "Жүсіп", 13: "Рағыд", 14: "Ибраһим", 15: "Хижр", 16: "Нахл", 17: "Исра", 18: "Кәһф", 19: "Мәриям", 20: "Таһа",
  21: "Әнбия", 22: "Хаж", 23: "Муминун", 24: "Нұр", 25: "Фурқан", 26: "Шуара", 27: "Нәмл", 28: "Қасас", 29: "Әнкәбут", 30: "Рум",
  31: "Лұқман", 32: "Сәжде", 33: "Ахзаб", 34: "Сәбә", 35: "Фатыр", 36: "Ясин", 37: "Саффат", 38: "Сад", 39: "Зүмәр", 40: "Ғафыр",
  41: "Фуссиләт", 42: "Шура", 43: "Зухруф", 44: "Духан", 45: "Жасия", 46: "Ахқаф", 47: "Мұхаммед", 48: "Фатх", 49: "Хужурат", 50: "Қаф",
  51: "Зәрият", 52: "Тур", 53: "Нәжм", 54: "Қамар", 55: "Рахман", 56: "Уақиға", 57: "Хадид", 58: "Мужәдәлә", 59: "Хашр", 60: "Мумтәхина",
  61: "Саф", 62: "Жұма", 63: "Мунафиқун", 64: "Тәғабун", 65: "Талақ", 66: "Тахрим", 67: "Мүлік", 68: "Қаләм", 69: "Хаққа", 70: "Мағариж",
  71: "Нұх", 72: "Жын", 73: "Муззәммил", 74: "Мудәссир", 75: "Қиямет", 76: "Инсан", 77: "Мурсәләт", 78: "Нәбә", 79: "Нәзиғат", 80: "Әбәсә",
  81: "Тәкуир", 82: "Инфитар", 83: "Мутаффифин", 84: "Иншиқақ", 85: "Буруж", 86: "Тариқ", 87: "Ағлә", 88: "Ғашия", 89: "Фәжр", 90: "Бәләд",
  91: "Шәмс", 92: "Ләйл", 93: "Духа", 94: "Инширах", 95: "Тин", 96: "Аләқ", 97: "Қадр", 98: "Бәййінә", 99: "Зілзәлә", 100: "Адият",
  101: "Қариға", 102: "Тәкәсүр", 103: "Аср", 104: "Һумәзә", 105: "Фил", 106: "Құрайыш", 107: "Мағун", 108: "Кәусәр", 109: "Кафирун", 110: "Наср",
  111: "Мәсәд", 112: "Ықылас", 113: "Фәләқ", 114: "Нас"
};

export const getSurahKazakhName = (number: number): string => {
  return KAZAKH_NAMES[number] || "Сүре";
};

export const getSurahs = async (): Promise<Surah[]> => {
  try {
    const response = await fetch(`${BASE_URL}/surah`);
    if (!response.ok) return [];
    const data = await response.json();
    return data.data;
  } catch (error) { return []; }
};

const pad3 = (num: number) => num.toString().padStart(3, '0');

async function safeFetchJson(url: string) {
  try {
    const response = await fetch(url);
    const contentType = response.headers.get('content-type');
    if (response.ok && contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    return null;
  } catch (e) {
    return null;
  }
}

export const getSurahDetails = async (surahNumber: number, lang: Language, reciterId: string = 'ar.alafasy'): Promise<Ayah[]> => {
  try {
    const selectedReciter = RECITERS.find(r => r.id === reciterId) || RECITERS[0];
    const transEdition = lang === 'kk' ? 'kk.mussayev' : (lang === 'ru' ? 'ru.kuliev' : 'en.sahih');
    const audioEdition = selectedReciter.type === 'api' ? selectedReciter.id : 'ar.alafasy';
    
    const url = `${BASE_URL}/surah/${surahNumber}/editions/quran-uthmani,${transEdition},${audioEdition}`;
    const data = await safeFetchJson(url);
    
    if (data && data.data && Array.isArray(data.data)) {
      const quranData = data.data.find((d: any) => d.edition.identifier === 'quran-uthmani');
      const transData = data.data.find((d: any) => d.edition.identifier === transEdition);
      const audioData = data.data.find((d: any) => d.edition.format === 'audio');

      return quranData.ayahs.map((ayah: any, index: number) => {
        let audioUrl = audioData?.ayahs?.[index]?.audio || '';
        if (selectedReciter.type === 'custom' && selectedReciter.baseUrl) {
           audioUrl = `${selectedReciter.baseUrl}/${pad3(surahNumber)}${pad3(ayah.numberInSurah)}.mp3`;
        }
        if (!audioUrl) audioUrl = `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${ayah.number}.mp3`;

        return {
          number: ayah.number,
          numberInSurah: ayah.numberInSurah,
          text: ayah.text,
          translation: transData?.ayahs?.[index]?.text || '',
          audio: audioUrl,
          juz: ayah.juz
        };
      });
    }

    const fallbackData = await safeFetchJson(`${BASE_URL}/surah/${surahNumber}/quran-uthmani`);
    if (fallbackData && fallbackData.data && fallbackData.data.ayahs) {
      return fallbackData.data.ayahs.map((ayah: any) => ({
        number: ayah.number,
        numberInSurah: ayah.numberInSurah,
        text: ayah.text,
        translation: '',
        audio: `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${ayah.number}.mp3`,
        juz: ayah.juz
      }));
    }

    return [];
  } catch (error) { 
      console.error("Surah Service Error:", error);
      return []; 
  }
};
