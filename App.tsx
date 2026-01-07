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
import { MapPin, Search, X, Check, ChevronRight, Sparkles, Compass, Book, Calendar, Palette, Moon, Sun, Download, FileArchive, Loader2, MessageCircle, ScrollText, Landmark, LogIn, LogOut, User, Bell, BellOff } from 'lucide-react';
import { auth, signInWithGoogle, signOutUser, getUserProgress, updateUserSettings, saveUserProgress } from './services/firebase';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { adhanService } from './services/adhanService';
import AdminView from './components/AdminView';

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
  const [showAdmin, setShowAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [adhanEnabled, setAdhanEnabled] = useState(adhanService.getEnabled());
  
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

  // Firebase auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        getUserProgress(user).then(progress => {
          if (progress?.settings) {
            if (progress.settings.language) setLang(progress.settings.language as Language);
            if (progress.settings.selectedCity) {
              const city = CITY_DATABASE.find(c => c.id === progress.settings.selectedCity);
              if (city) setSelectedCity(city);
            }
          }
        });
      }
    });
    return unsubscribe;
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      const user = await signInWithGoogle();
      if (user) {
        const progress = await getUserProgress(user);
        if (!progress) {
          await saveUserProgress(user, {
            settings: {
              language: lang,
              selectedCity: selectedCity.id,
              theme: currentBg.id
            }
          });
        }
      }
      setShowAuthModal(false);
    } catch (error) {
      console.error('Sign in failed:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  const toggleAdhan = () => {
    const newState = !adhanEnabled;
    setAdhanEnabled(newState);
    adhanService.setEnabled(newState);
  };

  // Save settings to Firebase when they change
  useEffect(() => {
    if (currentUser) {
      updateUserSettings(currentUser, {
        language: lang,
        selectedCity: selectedCity.id,
        theme: currentBg.id
      });
    }
  }, [lang, selectedCity, currentBg, currentUser]);

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
      if (times) adhanService.startMonitoring(times);
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
        {/* Top Bar */}
        <header className="flex-none px-6 pt-safe mt-3 z-40 relative flex justify-center animate-fade-in-up">
          <div className="ios-glass h-12 rounded-full px-1.5 flex items-center justify-between w-full max-w-[450px] shadow-2xl backdrop-blur-md">
             <button onClick={() => setShowCitySearch(true)} className="flex items-center space-x-2 px-4 h-9 hover:bg-white/5 rounded-full transition-all active:scale-95">
                <MapPin size={15} className="text-emerald-500" />
                <span className="text-[13px] font-bold tracking-tight text-white/90 truncate max-w-[120px]">{selectedCity.title}</span>
             </button>
             
             <div className="flex items-center gap-1">
                 <button 
                   onClick={toggleAdhan}
                   className={`w-9 h-9 flex items-center justify-center rounded-full transition-all ${
                     adhanEnabled ? 'text-emerald-400 bg-emerald-500/10' : 'text-white/20 hover:bg-white/10'
                   }`}
                 >
                   {adhanEnabled ? <Bell size={14} /> : <BellOff size={14} />}
                 </button>
                 
                 <button onClick={() => setShowWallpaperSelector(true)} className="w-9 h-9 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors group">
                   <Palette size={14} className="text-white/40 group-hover:text-emerald-400 transition-colors" />
                 </button>
                 
                 <button onClick={() => setLang(lang === 'kk' ? 'ru' : 'kk')} className="px-3 h-9 text-[11px] font-black text-emerald-500 hover:bg-white/10 rounded-full transition-all uppercase tracking-[0.2em]">
                   {lang}
                 </button>

                 {currentUser ? (
                   <div className="flex items-center gap-2 pl-1">
                     <img 
                       src={currentUser.photoURL || ''} 
                       alt="User" 
                       className="w-8 h-8 rounded-full border border-emerald-500/30"
	                       onDoubleClick={() => {
	                         if (currentUser?.email === 'kuanyshbekzhigit@gmail.com') {
	                           setShowAdmin(true);
	                         }
	                       }}
                     />
                     <button onClick={handleSignOut} className="w-9 h-9 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors group">
                       <LogOut size={14} className="text-white/40 group-hover:text-red-400 transition-colors" />
                     </button>
                   </div>
                 ) : (
                   <button onClick={() => setShowAuthModal(true)} className="w-9 h-9 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors group">
                     <LogIn size={14} className="text-white/40 group-hover:text-emerald-400 transition-colors" />
                   </button>
                 )}
             </div>
          </div>
        </header>

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
            </div>
          </div>
        </main>
      </div>

      {/* Modals */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[100] bg-deep-950/40 backdrop-blur-[80px] flex items-center justify-center p-6 animate-fade-in">
          <div className="ios-glass w-full max-w-md rounded-[3rem] p-10 flex flex-col shadow-2xl animate-ios-spring">
            <h2 className="text-3xl font-black tracking-tighter mb-6">Google-ға кіру</h2>
            <p className="text-white/60 mb-8">Өтінегіңіз сақталады және келесі күні жалғастыра аласыз</p>
            <button onClick={handleGoogleSignIn} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-2xl transition-all active:scale-95 mb-4 flex items-center justify-center gap-3">
              <LogIn size={20} /> Google-ға кіру
            </button>
            <button onClick={() => setShowAuthModal(false)} className="w-full bg-white/5 hover:bg-white/10 text-white font-bold py-4 rounded-2xl transition-all">
              Бас тарту
            </button>
          </div>
        </div>
      )}

      {showAdmin && <AdminView lang={lang} onClose={() => setShowAdmin(false)} />}

      {showCitySearch && (
        <div className="fixed inset-0 z-[100] bg-deep-950/40 backdrop-blur-[80px] flex items-center justify-center p-6 animate-fade-in">
          <div className="ios-glass w-full max-w-2xl h-[70vh] rounded-[3rem] flex flex-col shadow-2xl animate-ios-spring overflow-hidden">
            <div className="p-8 flex-none">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-black tracking-tighter">Қала таңдау</h2>
                <button onClick={() => setShowCitySearch(false)} className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all">
                  <X size={24} />
                </button>
              </div>
              <div className="relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30" size={20} />
                <input 
                  type="text" 
                  placeholder="Қала немесе ауыл атын жазыңыз..." 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-lg font-bold focus:outline-none focus:border-emerald-500/50 transition-all"
                  value={cityQuery}
                  onChange={(e) => setCityQuery(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-8 pb-8 no-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredCities.map(city => (
                  <button 
                    key={city.id} 
                    onClick={() => {
                      setSelectedCity(city);
                      setShowCitySearch(false);
                    }}
                    className={`flex items-center justify-between p-5 rounded-2xl border transition-all active:scale-95 ${
                      selectedCity.id === city.id 
                        ? 'bg-emerald-500/20 border-emerald-500/30 text-white' 
                        : 'bg-white/5 border-white/5 text-white/60 hover:bg-white/10 hover:border-white/10'
                    }`}
                  >
                    <span className="font-bold">{city.title}</span>
                    {selectedCity.id === city.id && <Check size={18} className="text-emerald-400" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {showWallpaperSelector && (
        <div className="fixed inset-0 z-[100] bg-deep-950/40 backdrop-blur-[80px] flex items-center justify-center p-6 animate-fade-in">
          <div className="ios-glass w-full max-w-4xl h-[80vh] rounded-[3rem] flex flex-col shadow-2xl animate-ios-spring overflow-hidden">
            <div className="p-8 flex-none">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-black tracking-tighter">Тұсқағаздар</h2>
                <button onClick={() => setShowWallpaperSelector(false)} className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all">
                  <X size={24} />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-8 pb-8 no-scrollbar">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {BACKGROUNDS.map(bg => (
                  <button 
                    key={bg.id} 
                    onClick={() => {
                      setCurrentBg(bg);
                      setShowWallpaperSelector(false);
                    }}
                    className={`group relative aspect-[16/10] rounded-3xl overflow-hidden border-2 transition-all active:scale-95 ${
                      currentBg.id === bg.id ? 'border-emerald-500 shadow-2xl shadow-emerald-500/20' : 'border-transparent'
                    }`}
                  >
                    <img src={bg.url} alt={bg.id} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-widest text-white/90">{bg.name?.[lang as 'kk' | 'ru'] || bg.id}</span>
                      {currentBg.id === bg.id && <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center"><Check size={12} /></div>}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
