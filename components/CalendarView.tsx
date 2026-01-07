
import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Star } from 'lucide-react';
import { Language, IslamicEvent } from '../types';
import { getHijriDate, getIslamicEvents } from '../services/prayerService';

interface CalendarViewProps {
  lang: Language;
  labels: any;
}

const CalendarView: React.FC<CalendarViewProps> = ({ lang, labels }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const events = useMemo(() => getIslamicEvents(currentDate.getFullYear()), [currentDate]);

  const monthData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    // Start offset (Monday = 0 for better grid alignment in most templates, here we use Sunday start or adjust)
    // We'll use 0=Mon, 6=Sun style
    let startDay = firstDayOfMonth.getDay(); 
    startDay = startDay === 0 ? 6 : startDay - 1; 

    const days = [];
    // Previous month days padding
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
      days.push({ day: prevMonthLastDay - i, currentMonth: false, date: new Date(year, month - 1, prevMonthLastDay - i) });
    }

    // Current month days
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      days.push({ day: i, currentMonth: true, date: new Date(year, month, i) });
    }

    // Next month days padding
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ day: i, currentMonth: false, date: new Date(year, month + 1, i) });
    }

    return days;
  }, [currentDate]);

  const changeMonth = (offset: number) => {
    const next = new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1);
    setCurrentDate(next);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  };

  const getDayEvent = (date: Date) => {
    const dStr = date.toISOString().split('T')[0];
    return events.find(e => e.date === dStr);
  };

  const weekDays = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

  return (
    <div className="flex flex-col h-full animate-fade-in text-white">
      {/* Header */}
      <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
           <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400">
             <CalendarIcon size={16} />
           </div>
           <div>
             <h2 className="text-lg sm:text-xl font-black tracking-tight">{currentDate.toLocaleDateString(lang === 'kk' ? 'kk-KZ' : 'ru-RU', { month: 'long', year: 'numeric' })}</h2>
             <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500/60">Ислами күнтізбе</p>
           </div>
        </div>
        <div className="flex gap-2">
           <button onClick={() => changeMonth(-1)} className="w-10 h-10 ios-glass rounded-full flex items-center justify-center active:scale-90 transition-all border-white/5"><ChevronLeft size={18} /></button>
           <button onClick={() => changeMonth(1)} className="w-10 h-10 ios-glass rounded-full flex items-center justify-center active:scale-90 transition-all border-white/5"><ChevronRight size={18} /></button>
        </div>
      </div>

      {/* Grid */}
      <div className="px-4 mt-2">
        <div className="grid grid-cols-7 mb-2">
          {weekDays.map(d => (
            <div key={d} className="text-center text-[10px] font-black uppercase tracking-widest text-white/20 py-2">
              {labels[d]}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {monthData.map((d, i) => {
            const hDate = getHijriDate(d.date, lang);
            const event = getDayEvent(d.date);
            const active = isToday(d.date);
            
            return (
              <div 
                key={i} 
                className={`aspect-square flex flex-col items-center justify-center rounded-2xl relative transition-all border ${
                  d.currentMonth ? 'opacity-100' : 'opacity-20'
                } ${
                  active 
                    ? 'bg-emerald-600 border-emerald-400 shadow-[0_10px_20px_rgba(16,185,129,0.3)]' 
                    : 'ios-glass border-white/5'
                } ${event ? 'border-emerald-500/40 ring-1 ring-emerald-500/20' : ''}`}
              >
                <span className={`text-[13px] font-black ${active ? 'text-white' : 'text-white/80'}`}>{d.day}</span>
                <span className={`text-[8px] font-bold mt-0.5 ${active ? 'text-white/60' : 'text-emerald-500/50'}`}>{hDate.day}</span>
                {event && (
                  <div className="absolute top-1.5 right-1.5">
                    <Star size={6} fill="currentColor" className="text-amber-400" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Events List */}
      <div className="mt-8 px-6 pb-40 overflow-y-auto no-scrollbar flex-1">
         <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-5">Алдағы оқиғалар</h3>
         <div className="space-y-3">
            {events.filter(e => new Date(e.date) >= new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)).map((e, idx) => {
              const eventDate = new Date(e.date);
              const hDate = getHijriDate(eventDate, lang);
              return (
                <div key={idx} className="ios-glass p-5 rounded-[2rem] border-white/5 flex items-center gap-5 hover:bg-white/5 transition-all group">
                   <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col items-center justify-center flex-shrink-0 group-hover:bg-emerald-600 group-hover:border-emerald-500 transition-all">
                      <span className="text-[11px] font-black text-emerald-400 group-hover:text-white leading-none mb-0.5">{eventDate.getDate()}</span>
                      <span className="text-[7px] font-black uppercase tracking-widest text-white/30 group-hover:text-white/60">
                         {eventDate.toLocaleDateString(lang === 'kk' ? 'kk-KZ' : 'ru-RU', { month: 'short' })}
                      </span>
                   </div>
                   <div className="flex-1">
                      <h4 className="font-black text-[15px] tracking-tight text-white mb-0.5">{e.name[lang]}</h4>
                      <p className="text-[9px] font-bold text-white/30 uppercase tracking-[0.1em]">{hDate.fullString}</p>
                   </div>
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/40"></div>
                </div>
              );
            })}
         </div>
      </div>
    </div>
  );
};

export default CalendarView;
