
import React, { useState, useEffect, useMemo } from 'react';
import { ViewState, Language, City, PrayerTimes, HijriDateInfo, AppBackground } from './types';
import { CITY_DATABASE, TRANSLATIONS, BACKGROUNDS, ZIKIR_LIST } from './constants';
import { getPrayerTimes, getHijriDate, getIslamicEvents, calculateQiblaHeading } from './services/prayerService';
import PrayerTimesView from './components/PrayerTimesView';
import Navigation from './components/Navigation';
import ZikirView from './components/ZikirView';
import QiblaView from './components/QiblaView';
import AIImamView from './components/AIImamView';
import QuranView from './components/QuranView';
import HadithView from './components/HadithView';
import CalendarView from './components/CalendarView';
// Fixed: Added Landmark to the imports from lucide-react
import { MapPin, Search, X, Check, ChevronRight, Sparkles, Compass, Book, Calendar, Palette, Moon, Sun, Download, FileArchive, Loader2, MessageCircle, ScrollText, Landmark } from 'lucide-react';

const ParticleBackground = () => {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white opacity-[0.03] animate-float"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            width: `${Math.random() * 4 + 1}px`,
            height: `${Math.random() * 4 + 1}px`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${Math.random() * 10 + 10}s`,
            boxShadow: '0 0 10px rgba(255,255,255,0.5)'
          }}
        ></div>
      ))}
      <div className="absolute top-[20%] left-[10%] w-64 h-64 bg-emerald-500/5 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '4s' }}></div>
      <div className="absolute bottom-[30%] right-[10%] w-80 h-80 bg-blue-500/5 rounded-full blur-[140px] animate-pulse" style={{ animationDuration: '7s' }}></div>
    </div>
  );
};

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('kk');
  const [currentView, setCurrentView] = useState<ViewState>('prayer');
  const [selectedCity, setSelectedCity] = useState<City>(() => {
    const saved = localStorage.getItem('tauba_city_id');
    if (saved) return CITY_DATABASE.find(c => c.id === parseInt(saved)) || CITY_DATABASE[0];
    return CITY_DATABASE[0];
  });
  const [currentBg, setCurrentBg] = useState<AppBackground>(() => {
    const saved = localStorage.getItem('tauba_bg_id');
    if (saved) return BACKGROUNDS.find(b => b.id === saved) || BACKGROUNDS[0];
    return BACKGROUNDS[0];
  });
  const [showCitySearch, setShowCitySearch] = useState(false);
  const [showWallpaperSelector, setShowWallpaperSelector] = useState(false);
  const [cityQuery, setCityQuery] = useState('');
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [hijriDate, setHijriDate] = useState<HijriDateInfo | null>(null);
  const [nextPrayer, setNextPrayer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const t = TRANSLATIONS[lang];

  const resolvedBgUrl = useMemo(() => {
    if (currentBg.type === 'dynamic') {
      const hour = new Date().getHours();
      const isDay = hour >= 6 && hour < 19;
      return isDay 
        ? (BACKGROUNDS.find(b => b.id === 'mosque-interior-day')?.url || BACKGROUNDS[1].url)
        : (BACKGROUNDS.find(b => b.id === 'minaret-night')?.url || BACKGROUNDS[4].url);
    }
    return currentBg.url;
  }, [currentBg]);

  useEffect(() => {
    localStorage.setItem('tauba_city_id', selectedCity.id.toString());
    localStorage.setItem('tauba_bg_id', currentBg.id);
  }, [selectedCity, currentBg]);

  useEffect(() => {
    const update = async () => {
      setLoading(true);
      const date = new Date();
      const times = await getPrayerTimes(selectedCity, date);
      setPrayerTimes(times);
      setHijriDate(getHijriDate(date, lang));
      setLoading(false);
    };
    update();
  }, [selectedCity, lang]);

  useEffect(() => {
    if (!prayerTimes) return;
    const calculateNextPrayer = () => {
      const now = new Date();
      const currentMin = now.getHours() * 60 + now.getMinutes();
      const timeToMin = (s: string) => {
        if (!s || s === '--:--') return null;
        const [h, m] = s.split(':').map(Number);
        return h * 60 + m;
      };
      const order = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
      let found = false;
      for (const p of order) {
        const pMin = timeToMin((prayerTimes as any)[p]);
        if (pMin !== null && pMin > currentMin) {
          setNextPrayer(p);
          found = true;
          break;
        }
      }
      if (!found) setNextPrayer('Fajr');
    };
    calculateNextPrayer();
    const interval = setInterval(calculateNextPrayer, 30000);
    return () => clearInterval(interval);
  }, [prayerTimes]);

  const filteredCities = useMemo(() => {
    if (!cityQuery.trim()) return CITY_DATABASE.slice(0, 20);
    const q = cityQuery.toLowerCase();
    return CITY_DATABASE.filter(c => c.title.toLowerCase().includes(q)).slice(0, 100);
  }, [cityQuery]);

  const qiblaAngle = useMemo(() => calculateQiblaHeading(Number(selectedCity.lat), Number(selectedCity.lng)), [selectedCity]);

  return (
    <div className="h-full font-sans bg-deep-950 text-white overflow-hidden relative flex flex-col lg:flex-row">
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 liquid-mesh rounded-full animate-liquid-blob"></div>
        <div className="absolute bottom-[-5%] right-[-5%] w-[60%] h-[60%] bg-blue-500/10 liquid-mesh rounded-full animate-liquid-blob" style={{ animationDelay: '-5s' }}></div>
        <ParticleBackground />
      </div>
      
      <div className="absolute inset-0 z-[1] bg-cover bg-center bg-no-repeat transition-all duration-[3000ms] scale-110" style={{ backgroundImage: `url(${resolvedBgUrl})` }}>
        <div className="absolute inset-0 bg-deep-950/60 backdrop-blur-[2px]"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-deep-950/20 via-deep-950/50 to-deep-950 lg:bg-gradient-to-r"></div>
      </div>

      <Navigation currentView={currentView} setView={setCurrentView} labels={t as any} glassColor="ios-glass" />

      <div className="flex-1 flex flex-col h-full relative z-10 overflow-hidden">
        {currentView === 'prayer' && (
          <header className="flex-none px-6 pt-safe mt-3 z-40 relative flex justify-center animate-fade-in-up">
            <div className="ios-glass h-12 rounded-full px-1.5 flex items-center justify-between w-full max-w-[340px] shadow-2xl backdrop-blur-md">
               <button onClick={() => setShowCitySearch(true)} className="flex items-center space-x-2 px-4 h-9 hover:bg-white/5 rounded-full transition-all active:scale-95">
                  <MapPin size={15} className="text-emerald-500" />
                  <span className="text-[13px] font-bold tracking-tight text-white/90">{selectedCity.title}</span>
               </button>
               <div className="flex items-center gap-1">
                   <button onClick={() => setShowWallpaperSelector(true)} className="w-9 h-9 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors group">
                     <Palette size={14} className="text-white/40 group-hover:text-emerald-400 transition-colors" />
                   </button>
                   <button onClick={() => setLang(lang === 'kk' ? 'ru' : 'kk')} className="px-3 h-9 text-[11px] font-black text-emerald-500 hover:bg-white/10 rounded-full transition-all uppercase tracking-[0.2em]">
                     {lang}
                   </button>
               </div>
            </div>
          </header>
        )}

        <main className={`flex-1 relative w-full mx-auto overflow-y-auto no-scrollbar scroll-smooth ${currentView === 'prayer' ? 'pt-4' : 'pt-2'} px-5 max-w-5xl`}>
          <div className="pb-36 lg:pb-12 pt-4">
            {currentView === 'prayer' && (
              <div className="animate-slide-up space-y-8">
                <PrayerTimesView timings={prayerTimes} hijri={hijriDate} events={getIslamicEvents(new Date().getFullYear())} loading={loading} labels={t} nextPrayer={nextPrayer} lang={lang} />
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                  <button onClick={() => setCurrentView('qibla')} className="ios-glass rounded-[2.5rem] p-6 flex flex-col items-center justify-center space-y-4 hover:bg-white/5 transition-all active:scale-[0.98] animate-slide-up" style={{animationDelay: '100ms'}}>
                    <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group"><Compass size={28} className="text-emerald-400 group-hover:rotate-45 transition-transform duration-500" style={{ transform: `rotate(${qiblaAngle}deg)` }} /></div>
                    <div className="text-center"><p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-1">{t.qibla}</p><p className="text-xs font-bold text-white/80">{Math.round(qiblaAngle)}° Бағыт</p></div>
                  </button>
                  <button onClick={() => setCurrentView('calendar')} className="ios-glass rounded-[2.5rem] p-6 flex flex-col items-center justify-center space-y-4 hover:bg-white/5 transition-all active:scale-[0.98] animate-slide-up" style={{animationDelay: '150ms'}}>
                    <div className="w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20"><Calendar size={28} className="text-blue-400" /></div>
                    <div className="text-center"><p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-1">{t.calendar}</p><p className="text-xs font-bold text-white/80">{hijriDate?.monthName}</p></div>
                  </button>
                  <button onClick={() => setCurrentView('hadith')} className="ios-glass rounded-[2.5rem] p-6 flex flex-col items-center justify-center space-y-4 hover:bg-white/5 transition-all active:scale-[0.98] animate-slide-up" style={{animationDelay: '200ms'}}>
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20"><Book size={28} className="text-amber-400" /></div>
                    <div className="text-center"><p className="text-[10px] font-black uppercase tracking-widest text-amber-400 mb-1">{t.hadith}</p><p className="text-xs font-bold text-white/80">Күн Хадисі</p></div>
                  </button>
                  <button onClick={() => setCurrentView('ai-imam')} className="ios-glass rounded-[2.5rem] p-6 flex flex-col items-center justify-center space-y-4 hover:bg-white/5 transition-all active:scale-[0.98] animate-slide-up" style={{animationDelay: '250ms'}}>
                    <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20"><Sparkles size={28} className="text-purple-400 animate-pulse" /></div>
                    <div className="text-center"><p className="text-[10px] font-black uppercase tracking-widest text-purple-400 mb-1">{t.aiImam}</p><p className="text-xs font-bold text-white/80">AI Көмекші</p></div>
                  </button>
                </div>
              </div>
            )}
            
            <div className="space-y-6">
              {currentView === 'calendar' && <CalendarView lang={lang} labels={t} />}
              {currentView === 'quran' && <QuranView lang={lang} labels={t} />}
              {currentView === 'zikir' && <div className="animate-slide-up ios-glass rounded-[3rem] overflow-hidden min-h-[600px]"><ZikirView lang={lang} labels={t} /></div>}
              {currentView === 'qibla' && <div className="animate-slide-up ios-glass rounded-[3rem] p-10"><QiblaView lat={Number(selectedCity.lat)} lng={Number(selectedCity.lng)} labels={t} /></div>}
              {currentView === 'ai-imam' && <div className="animate-slide-up ios-glass rounded-[3rem] overflow-hidden min-h-[600px]"><AIImamView lang={lang} labels={t} /></div>}
              {currentView === 'hadith' && <HadithView lang={lang} labels={t} mode="hadith" />}
              {currentView === 'riwayat' && <HadithView lang={lang} labels={t} mode="riwayat" />}
              {currentView === 'more' && (
                <div className="animate-slide-up ios-glass rounded-[3rem] p-10 flex flex-col space-y-6">
                    <div className="mb-6"><h3 className="text-5xl font-black tracking-tighter text-white animate-fade-in-up">Қосымша</h3><p className="text-[11px] text-emerald-400 font-black uppercase tracking-[0.3em] mt-2 animate-fade-in-up" style={{animationDelay: '100ms'}}>Реттеулер мен сервистер</p></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button onClick={() => setCurrentView('hadith')} className="flex items-center justify-between p-6 rounded-[2.2rem] bg-white/5 border border-white/5 w-full hover:bg-white/10 active:scale-[0.97] group animate-slide-up" style={{animationDelay: '120ms'}}>
                        <div className="flex items-center gap-5"><div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg"><Book size={22} className="text-white" /></div><span className="font-bold text-xl">{t.hadith}</span></div><ChevronRight className="text-white/20 group-hover:text-emerald-500" size={22} />
                      </button>
                      <button onClick={() => setCurrentView('riwayat')} className="flex items-center justify-between p-6 rounded-[2.2rem] bg-white/5 border border-white/5 w-full hover:bg-white/10 active:scale-[0.97] group animate-slide-up" style={{animationDelay: '130ms'}}>
                        <div className="flex items-center gap-5"><div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center shadow-lg"><ScrollText size={22} className="text-white" /></div><span className="font-bold text-xl">{t.riwayat}</span></div><ChevronRight className="text-white/20 group-hover:text-emerald-500" size={22} />
                      </button>
                      <button onClick={() => setCurrentView('ai-imam')} className="flex items-center justify-between p-6 rounded-[2.2rem] bg-white/5 border border-white/5 w-full hover:bg-white/10 active:scale-[0.97] group animate-slide-up" style={{animationDelay: '140ms'}}>
                        <div className="flex items-center gap-5"><div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-lg"><MessageCircle size={22} className="text-white" /></div><span className="font-bold text-xl">{t.aiImam}</span></div><ChevronRight className="text-white/20 group-hover:text-emerald-500" size={22} />
                      </button>
                      <button onClick={() => setCurrentView('calendar')} className="flex items-center justify-between p-6 rounded-[2.2rem] bg-white/5 border border-white/5 w-full hover:bg-white/10 active:scale-[0.97] group animate-slide-up" style={{animationDelay: '160ms'}}>
                        <div className="flex items-center gap-5"><div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg"><Calendar size={22} className="text-white" /></div><span className="font-bold text-xl">{t.calendar}</span></div><ChevronRight className="text-white/20 group-hover:text-emerald-500" size={22} />
                      </button>
                      <button onClick={() => setShowWallpaperSelector(true)} className="flex items-center justify-between p-6 rounded-[2.2rem] bg-white/5 border border-white/5 w-full hover:bg-white/10 active:scale-[0.97] group animate-slide-up" style={{animationDelay: '180ms'}}>
                        <div className="flex items-center gap-5"><div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10"><Palette size={22} className="text-emerald-400" /></div><span className="font-bold text-xl">{t.selectWallpaper}</span></div><ChevronRight className="text-white/20 group-hover:text-emerald-500" size={22} />
                      </button>
                    </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* City Search Modal - Desktop Centered */}
      {showCitySearch && (
        <div className="fixed inset-0 z-[100] bg-deep-950/40 backdrop-blur-[80px] flex items-center justify-center p-6 animate-fade-in">
           <div className="ios-glass w-full max-w-xl rounded-[3rem] p-10 flex flex-col shadow-2xl animate-ios-spring">
             <div className="flex justify-between items-center mb-10"><h2 className="text-4xl font-black tracking-tighter">Қала таңдау</h2><button onClick={() => setShowCitySearch(false)} className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center active:scale-90"><X size={24} /></button></div>
             <div className="relative mb-8"><input type="text" placeholder={t.searchCityPlaceholder} value={cityQuery} onChange={(e) => setCityQuery(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-3xl py-5 pl-14 pr-8 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-xl font-bold placeholder-white/20 shadow-inner" /><Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" size={22} /></div>
             <div className="flex-1 max-h-[50vh] overflow-y-auto no-scrollbar space-y-4 pb-8">{filteredCities.map(city => (<button key={city.id} onClick={() => { setSelectedCity(city); setShowCitySearch(false); }} className={`w-full text-left p-6 rounded-[2.5rem] flex items-center justify-between transition-all active:scale-[0.98] ${selectedCity.id === city.id ? 'bg-emerald-600 border-emerald-400' : 'bg-white/5 border border-white/5 hover:bg-white/10'}`}><span className="font-bold text-xl">{city.title}</span>{selectedCity.id === city.id && <Check size={24} strokeWidth={4} />}</button>))}</div>
           </div>
        </div>
      )}

      {/* Wallpaper Selector - Desktop Centered */}
      {showWallpaperSelector && (
        <div className="fixed inset-0 z-[100] bg-deep-950/40 backdrop-blur-[80px] flex items-center justify-center p-6 animate-fade-in">
           <div className="ios-glass w-full max-w-4xl rounded-[3rem] p-10 flex flex-col shadow-2xl animate-ios-spring">
             <div className="flex justify-between items-center mb-10"><h2 className="text-4xl font-black tracking-tighter">{t.selectWallpaper}</h2><button onClick={() => setShowWallpaperSelector(false)} className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center active:scale-90"><X size={24} /></button></div>
             <div className="flex-1 overflow-y-auto max-h-[60vh] no-scrollbar pb-10"><div className="grid grid-cols-2 md:grid-cols-4 gap-5">{BACKGROUNDS.map(bg => (<button key={bg.id} onClick={() => { setCurrentBg(bg); setShowWallpaperSelector(false); }} className={`aspect-[9/16] rounded-[2.8rem] overflow-hidden relative border-[4px] transition-all duration-500 ${currentBg.id === bg.id ? 'border-emerald-500 scale-100' : 'border-transparent opacity-40 hover:opacity-100'}`}>{bg.type === 'dynamic' ? (<div className="w-full h-full bg-gradient-to-br from-emerald-600 via-indigo-900 to-black flex flex-col items-center justify-center p-4"><div className="flex gap-2 mb-4"><Sun className="text-amber-400 animate-pulse" size={32} /><Moon className="text-blue-300" size={32} /></div><span className="text-[11px] font-black uppercase text-center tracking-widest">{bg.name?.[lang === 'en' ? 'ru' : lang]}</span></div>) : (<img src={bg.url} className="w-full h-full object-cover" alt="Wallpaper" />)}{currentBg.id === bg.id && (<div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center"><div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-2xl"><Check size={26} className="text-emerald-600" strokeWidth={5} /></div></div>)}<div className="absolute bottom-6 left-0 right-0 text-center"><span className="text-[9px] font-black uppercase tracking-[0.3em] bg-black/60 px-4 py-2 rounded-full backdrop-blur-md border border-white/10">{bg.name?.[lang === 'en' ? 'ru' : lang] || bg.id}</span></div></button>))}</div></div>
           </div>
        </div>
      )}
    </div>
  );
};

export default App;
