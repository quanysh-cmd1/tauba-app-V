
import React, { useEffect, useState, useMemo } from 'react';
import { PrayerTimes, HijriDateInfo, IslamicEvent, Language } from '../types';
import { Clock, Bell, BellOff, Info, Sunrise, Sun, SunMedium, Sunset, Moon, Sparkles } from 'lucide-react';

interface PrayerTimesViewProps {
  timings: PrayerTimes | null;
  hijri: HijriDateInfo | null;
  events: IslamicEvent[];
  loading: boolean;
  labels: any;
  nextPrayer: string | null;
  lang: Language;
}

const getPrayerIcon = (name: string, size = 18) => {
  switch (name.toLowerCase()) {
    case 'fajr': return <Sunrise size={size} />;
    case 'sunrise': return <Sun size={size} />;
    case 'dhuhr': return <SunMedium size={size} />;
    case 'asr': return <SunMedium size={size} className="rotate-45" />;
    case 'maghrib': return <Sunset size={size} />;
    case 'isha': return <Moon size={size} />;
    default: return <Clock size={size} />;
  }
};

const PrayerRow = ({ name, label, time, active, delay }: { name: string; label: string; time: string; active: boolean; delay: number }) => (
  <div className={`flex items-center justify-between py-5 px-6 rounded-[2.2rem] transition-all duration-700 border relative overflow-hidden animate-slide-up ${
    active 
      ? 'bg-emerald-600/20 text-white shadow-[0_20px_50px_rgba(16,185,129,0.2)] scale-[1.02] z-10 border-emerald-400/30' 
      : 'ios-glass border-white/5 opacity-40 hover:opacity-100 hover:scale-[1.01]'
  }`} style={{ animationDelay: `${delay}ms` }}>
    
    {active && <div className="animate-shimmer-slide"></div>}

    <div className="flex items-center gap-5 relative z-10">
       <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${active ? 'bg-emerald-500 text-white shadow-lg' : 'bg-white/5 text-white/30'}`}>
          {getPrayerIcon(name, 22)}
       </div>
       <div className="flex flex-col">
          <span className={`text-[8px] font-black uppercase tracking-[0.3em] mb-0.5 ${active ? 'text-emerald-400' : 'text-white/20'}`}>Уақыты</span>
          <span className="text-lg font-black tracking-tight">{label}</span>
       </div>
    </div>
    <div className="flex items-center space-x-6 relative z-10">
        <span className={`text-2xl font-black tabular-nums tracking-tighter ${active ? 'text-emerald-300' : 'text-white/70'}`}>
          {time}
        </span>
        <div className={`w-2 h-2 rounded-full transition-all duration-1000 ${active ? 'bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,1)] scale-125 animate-pulse' : 'bg-white/5'}`}></div>
    </div>
  </div>
);

const PrayerTimesView: React.FC<PrayerTimesViewProps> = ({ timings, hijri, events, loading, labels, nextPrayer, lang }) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const clockTimer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(clockTimer);
  }, []);

  useEffect(() => {
    if (!timings || !nextPrayer) return;

    const timer = setInterval(() => {
        const now = new Date();
        const timeStr = (timings as any)[nextPrayer];
        if (!timeStr || timeStr === '--:--') return;

        const [nextH, nextM] = timeStr.split(':').map(Number);
        const nextTime = new Date();
        nextTime.setHours(nextH, nextM, 0);

        if (nextTime < now) nextTime.setDate(nextTime.getDate() + 1);

        const diff = nextTime.getTime() - now.getTime();
        
        const maxTime = 6 * 60 * 60 * 1000; 
        const currentProgress = Math.max(0, Math.min(100, (1 - diff / maxTime) * 100));
        setProgress(currentProgress);

        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(timer);
  }, [timings, nextPrayer]);

  const circleLength = 2 * Math.PI * 120;

  if (loading || !timings) {
    return (
      <div className="flex flex-col items-center justify-center py-32 animate-pulse">
        <div className="w-16 h-16 border-4 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin"></div>
        <p className="mt-8 text-[12px] font-black uppercase tracking-[0.4em] text-white/20">Жүктелуде...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row lg:items-start lg:gap-8">
      <div className="flex flex-col items-center justify-center mb-6 relative px-4 lg:sticky lg:top-10 lg:w-1/3">
          <div className="text-center z-10 w-full flex flex-col items-center">
            <div className="inline-flex items-center gap-3 bg-white/5 px-4 py-2.5 rounded-full border border-white/10 backdrop-blur-3xl mb-8 shadow-inner animate-slide-up">
               <span className="text-[14px] font-black text-emerald-400 tabular-nums tracking-wider">{currentTime.toLocaleTimeString('kk-KZ', { hour: '2-digit', minute: '2-digit' })}</span>
               <div className="w-2 h-2 bg-emerald-500/40 rounded-full animate-pulse"></div>
               <span className="text-[12px] font-black text-white/50 uppercase tracking-[0.2em]">{hijri?.fullString}</span>
            </div>
            
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center animate-float lg:scale-110">
                <div className="absolute inset-0 bg-emerald-500/5 blur-[120px] rounded-full scale-125 animate-breathe"></div>
                
                <svg className="absolute inset-0 -rotate-90 w-full h-full p-4 drop-shadow-[0_0_30px_rgba(16,185,129,0.3)]" viewBox="0 0 320 320">
                   <circle cx="160" cy="160" r="140" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="4" />
                   <circle 
                     cx="160" cy="160" r="140" 
                     fill="none" stroke="url(#prayerGradient)" 
                     strokeWidth="8" 
                     strokeLinecap="round"
                     strokeDasharray={2 * Math.PI * 140}
                     strokeDashoffset={2 * Math.PI * 140 - (2 * Math.PI * 140 * progress) / 100}
                     className="transition-all duration-1000 ease-out"
                   />
                   <defs>
                     <linearGradient id="prayerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                       <stop offset="0%" stopColor="#10b981" />
                       <stop offset="100%" stopColor="#34d399" />
                     </linearGradient>
                   </defs>
                </svg>

                <div className="flex flex-col items-center justify-center relative z-10">
                    <span className="text-[12px] font-black uppercase tracking-[0.8em] text-white/20 mb-3">қалды</span>
                    <div className="text-6xl sm:text-8xl font-black tracking-tighter text-white tabular-nums flex items-baseline leading-none drop-shadow-2xl">
                        {timeLeft ? timeLeft.split(':').slice(0, 2).join(':') : "00:00"}
                        <span className="text-3xl opacity-20 ml-2 font-bold tabular-nums tracking-tighter">
                          {timeLeft ? timeLeft.split(':')[2] : "00"}
                        </span>
                    </div>
                    <div className="mt-10 flex flex-col items-center group cursor-pointer">
                        <div className="bg-emerald-500/10 px-8 py-3 rounded-2xl border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-all active:scale-95 flex items-center gap-4">
                           <div className="text-emerald-400 group-hover:animate-bounce">
                             {nextPrayer && getPrayerIcon(nextPrayer, 24)}
                           </div>
                           <h2 className="text-2xl font-black text-emerald-400 tracking-tight uppercase font-serif">
                              {nextPrayer ? (labels as any)[nextPrayer.toLowerCase()] : ''}
                           </h2>
                        </div>
                    </div>
                </div>
            </div>
          </div>
      </div>

      <div className="w-full lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-4 pb-20">
            <PrayerRow name="fajr" label={labels.fajr} time={timings.Fajr} active={nextPrayer === 'Fajr'} delay={100} />
            <PrayerRow name="sunrise" label={labels.sunrise} time={timings.Sunrise} active={nextPrayer === 'Sunrise'} delay={150} />
            <PrayerRow name="dhuhr" label={labels.dhuhr} time={timings.Dhuhr} active={nextPrayer === 'Dhuhr'} delay={200} />
            <PrayerRow name="asr" label={labels.asr} time={timings.Asr} active={nextPrayer === 'Asr'} delay={250} />
            <PrayerRow name="maghrib" label={labels.maghrib} time={timings.Maghrib} active={nextPrayer === 'Maghrib'} delay={300} />
            <PrayerRow name="isha" label={labels.isha} time={timings.Isha} active={nextPrayer === 'Isha'} delay={350} />
        
        <div className="col-span-full mt-8 p-8 rounded-[3rem] bg-white/5 border border-white/5 flex items-start gap-6 animate-slide-up" style={{ animationDelay: '400ms' }}>
           <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center flex-shrink-0 border border-white/10 shadow-inner">
              <Sparkles size={22} className="text-white/30" />
           </div>
           <p className="text-[13px] leading-relaxed font-bold text-white/20 italic">
             Мүфтият бекіткен 2026 жылға арналған ресми кесте. Уақыт айырмашылығы болса, қала параметрлерін тексеріңіз.
           </p>
        </div>
      </div>
    </div>
  );
};

export default PrayerTimesView;
