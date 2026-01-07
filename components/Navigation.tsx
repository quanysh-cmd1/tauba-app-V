
import React from 'react';
import { ViewState } from '../types';
import { Clock, BookOpen, Compass, Flower, Grid, Palette } from 'lucide-react';

interface NavigationProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  glassColor: string;
  labels: {
    prayerTimes: string;
    zikir: string;
    quran: string;
    qibla: string;
    more: string;
  };
}

const TaubaLogo = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Ресми Tauba логотипі: Сәждедегі адам, ай және жұлдыз */}
    {/* Сыртқы шеңбер */}
    <circle cx="50" cy="50" r="46" stroke="currentColor" strokeWidth="2.5" />
    
    {/* Ай (Crescent) */}
    <path d="M50 35 C 54 35 57 32 57 28 C 57 24 54 21 50 21 C 48 21 46.5 21.5 45 22.5 C 47 23.5 48.5 25.5 48.5 28 C 48.5 30.5 47 32.5 45 33.5 C 46.5 34.5 48 35 50 35 Z" fill="currentColor" />
    
    {/* Жұлдыз (Star) */}
    <path d="M55 23.5 L 56 25 L 57.5 25 L 56.2 26.2 L 56.6 27.8 L 55 26.8 L 53.4 27.8 L 53.8 26.2 L 52.5 25 L 54 25 Z" fill="currentColor" />
    
    {/* Жер сызығы (Ground line) */}
    <line x1="24" y1="73" x2="76" y2="73" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    
    {/* Сәждедегі адам бейнесі (Person in Sujud) */}
    <path d="M72 68 C 70 70 66 71 63 71 C 60 71 58 69 56 67 L 52 63 C 50 61 48 60 45 60 C 42 60 38 62 36 65 L 33 70 L 28 70 L 29 65 C 31 59 35 55 40 52 C 45 49 50 49 55 52 C 60 55 63 60 65 64 L 68 64 C 70 64 72 66 72 68 Z" fill="currentColor" />
    <circle cx="68" cy="65" r="4.5" fill="currentColor" />
  </svg>
);

const Navigation: React.FC<NavigationProps> = ({ currentView, setView, labels }) => {
  const navItems = [
    { id: 'prayer', label: labels.prayerTimes, icon: Clock },
    { id: 'quran', label: labels.quran, icon: BookOpen },
    { id: 'zikir', label: labels.zikir, icon: Flower },
    { id: 'qibla', label: labels.qibla, icon: Compass },
    { id: 'calendar', label: labels.calendar, icon: Calendar },
  ];

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
        <div className="pointer-events-auto ios-glass rounded-[2.2rem] shadow-[0_20px_50px_-15px_rgba(0,0,0,0.6)] p-1.5 flex justify-between items-center max-w-[340px] w-full border border-white/10">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id as ViewState)}
                className={`relative flex flex-col items-center justify-center w-14 h-14 rounded-[1.8rem] transition-all duration-500 group ${
                  isActive ? 'bg-white text-black shadow-xl scale-105' : 'text-white/30 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                {isActive && (
                   <div className="absolute -bottom-1.5 w-1 h-1 bg-black rounded-full shadow-[0_0_8px_black]"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Desktop Sidebar Navigation */}
      <aside className="hidden lg:flex flex-col w-24 h-screen z-50 py-8 px-4 items-center bg-deep-950/20 backdrop-blur-3xl border-r border-white/5 flex-none relative">
        <div className="mb-12">
          {/* Logo container replaces "T" with custom TaubaLogo */}
          <div className="w-16 h-16 bg-emerald-600 rounded-[1.8rem] flex items-center justify-center shadow-lg shadow-emerald-900/40 border border-emerald-400/30 group hover:scale-105 transition-transform duration-500 cursor-pointer" onClick={() => setView('prayer')}>
            <TaubaLogo className="w-11 h-11 text-white" />
          </div>
        </div>

        <nav className="flex-1 flex flex-col gap-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id as ViewState)}
                className={`w-16 h-16 rounded-[1.8rem] flex items-center justify-center transition-all duration-500 relative group ${
                  isActive ? 'bg-white text-black shadow-2xl scale-110' : 'text-white/20 hover:text-white hover:bg-white/5'
                }`}
                title={item.label}
              >
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                {isActive && (
                  <div className="absolute -right-1 w-1.5 h-6 bg-emerald-500 rounded-full blur-[2px]"></div>
                )}
                {/* Tooltip on hover */}
                <div className="absolute left-full ml-4 px-3 py-1 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl">
                  {item.label}
                </div>
              </button>
            );
          })}
        </nav>

        <div className="mt-auto flex flex-col gap-4">
          <button 
            onClick={() => {
              const link = document.createElement('a');
              link.href = 'https://github.com/quanysh-cmd1/tauba-app-V/releases/latest/download/app-release.apk';
              link.download = 'tauba-app.apk';
              link.click();
            }}
            className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white/20 hover:text-white hover:bg-emerald-500/20 hover:border-emerald-500/40 transition-all"
            title="Download APK"
          >
             <Download size={20} />
          </button>
          <button onClick={() => setView('more')} className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white/20 hover:text-white transition-all">
             <Palette size={20} />
          </button>
        </div>
      </aside>
    </>
  );
};

export default Navigation;
