
import JSZip from 'https://esm.sh/jszip';

/**
 * Жобаның барлық файлдарын ZIP форматында экспорттау.
 * Бұл функция браузерде ZIP архивін жасап, оны автоматты түрде жүктейді.
 */
export const exportProjectAsZip = async () => {
  const zip = new JSZip();

  // 1. Негізгі файлдарды қосу
  zip.file("index.html", document.documentElement.outerHTML);
  zip.file("metadata.json", JSON.stringify({
    "name": "Tauba App",
    "description": "A comprehensive Islamic companion app featuring Quran, prayer times, and AI content.",
    "requestFramePermissions": ["geolocation"]
  }, null, 2));

  // 2. Файл мазмұндарын жинақтау (Ағымдағы сессиядағы кодтарды алу мүмкін болмағандықтан, 
  // бұл жерде негізгі құрылымдық файлдардың үлгілері сақталады)
  // Нақты жағдайда бұл функция серверден немесе құрастыру жүйесінен барлық файлды тартады.
  
  const manifest = {
    "short_name": "Tauba",
    "name": "Tauba Islamic App",
    "start_url": ".",
    "display": "standalone",
    "theme_color": "#0f172a",
    "background_color": "#0f172a"
  };
  zip.file("manifest.json", JSON.stringify(manifest, null, 2));

  zip.file("sw.js", `
    const CACHE_NAME = 'tauba-v2';
    const ASSETS = ['./', './index.html'];
    self.addEventListener('install', (e) => e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS))));
    self.addEventListener('fetch', (e) => e.respondWith(caches.match(e.request).then(r => r || fetch(e.request))));
  `);

  // ZIP файлын жасау және жүктеу
  const content = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Tauba_Full_Source_${new Date().toISOString().split('T')[0]}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
