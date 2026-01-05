
import React, { useState, useEffect, useRef } from 'react';
import { Surah, Ayah, Language } from '../types';
import { getSurahs, getSurahDetails, getSurahKazakhName } from '../services/quranService';
import { getAyahTafsir } from '../services/geminiService';
import { ChevronLeft, Play, Pause, X, Sparkles, Eye, EyeOff, Loader2, Search, Copy } from 'lucide-react';
import { updateQuranProgress } from '../services/firebase';
import { auth } from '../services/firebase';

interface QuranViewProps {
  lang: Language;
  labels: any;
}

const QuranView: React.FC<QuranViewProps> = ({ lang, labels }) => {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);

  const [currentAyahIndex, setCurrentAyahIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const verseRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  const [selectedTafsirAyah, setSelectedTafsirAyah] = useState<Ayah | null>(null);
  const [aiTafsir, setAiTafsir] = useState<string>('');
  const [isTafsirLoading, setIsTafsirLoading] = useState(false);

  useEffect(() => {
    const fetchList = async () => {
      setLoading(true);
      const list = await getSurahs();
      setSurahs(list);
      setLoading(false);
    };
    fetchList();
  }, []);

  const handleSelectSurah = async (surah: Surah) => {
    setLoading(true);
    setSelectedSurah(surah);
    const details = await getSurahDetails(surah.number, lang, 'ar.alafasy');
    setAyahs(details);
    setLoading(false);
  };

  const togglePlay = (index: number) => {
    if (currentAyahIndex === index && isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      setCurrentAyahIndex(index);
      setIsPlaying(true);
      if (audioRef.current) {
        audioRef.current.src = ayahs[index].audio || '';
        audioRef.current.play();
      }
    }
  };

  const handleTafsir = async (ayah: Ayah) => {
    setSelectedTafsirAyah(ayah);
    setIsTafsirLoading(true);
    const result = await getAyahTafsir(selectedSurah?.englishName || '', ayah.numberInSurah, ayah.text, lang);
    setAiTafsir(result);
    setIsTafsirLoading(false);
  };

  const filteredSurahs = surahs.filter(s => {
    const kzName = getSurahKazakhName(s.number).toLowerCase();
    const query = searchQuery.toLowerCase();
    return kzName.includes(query) || s.number.toString() === query;
  });

  if (loading && !selectedSurah) {
    return (
      <div className="h-96 flex flex-col items-center justify-center opacity-40">
        <Loader2 className="animate-spin text-emerald-500 mb-6" size={48} />
        <p className="text-[12px] font-black uppercase tracking-[0.3em]">Сүрелер жүктелуде...</p>
      </div>
    );
  }

  if (selectedSurah) {
    const kzTitle = getSurahKazakhName(selectedSurah.number);
    return (
      <div className={`fixed inset-0 z-[100] flex flex-col transition-all duration-1000 ${isFocusMode ? 'bg-[#050608]' : 'bg-deep-900/40 backdrop-blur-[80px]'}`}>
        <div className={`p-8 flex items-center justify-between z-20 ${isFocusMode ? 'opacity-20 hover:opacity-100' : 'opacity-100'}`}>
          <button onClick={() => setSelectedSurah(null)} className="w-14 h-14 ios-glass rounded-full flex items-center justify-center active:scale-90 transition-all shadow-xl border-white/10"><ChevronLeft size={28} /></button>
          <div className="text-center px-4">
            <h2 className="text-4xl font-black tracking-tight">{kzTitle} сүресі</h2>
            <p className="text-[12px] font-black uppercase tracking-widest text-emerald-500 mt-1">{selectedSurah.revelationType === 'Meccan' ? 'Меккелік' : 'Мәдиналық'}</p>
          </div>
          <button onClick={() => setIsFocusMode(!isFocusMode)} className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isFocusMode ? 'bg-emerald-600 text-white' : 'ios-glass shadow-lg shadow-black/20 border-white/10'}`}>
            {isFocusMode ? <EyeOff size={24} /> : <Eye size={24} />}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar px-3 sm:px-6 md:px-10 pb-32 pt-10 max-w-5xl mx-auto w-full">
           {loading ? (
             <div className="flex flex-col items-center justify-center py-32 opacity-20">
                <Loader2 className="animate-spin text-emerald-500 mb-8" size={64} />
             </div>
           ) : ayahs.map((ayah, idx) => {
             const active = currentAyahIndex === idx;
             return (
               <div key={idx} className={`relative group mb-20 transition-all duration-700 ${active ? 'scale-105' : 'scale-100'}`} ref={(el) => { verseRefs.current[idx] = el; }}>
                  <div className="flex flex-col items-end w-full">
                     <div className="flex items-center gap-6 mb-8">
                        <span className="w-10 h-10 rounded-full border border-emerald-500/20 flex items-center justify-center text-[12px] font-black text-emerald-500/50">{ayah.numberInSurah}</span>
                        <div className="h-px w-24 bg-emerald-500/10"></div>
                     </div>
                     <p className={`text-3xl sm:text-5xl md:text-7xl font-quran leading-[2] text-right text-white selection:bg-emerald-500/30 transition-all duration-700 ${active ? 'text-emerald-400 drop-shadow-[0_0_40px_rgba(16,185,129,0.4)]' : 'opacity-80'}`} dir="rtl">
                       {ayah.text}
                     </p>
                  </div>
                  {!isFocusMode && (
                    <div className="mt-12 flex items-center gap-6 opacity-30 group-hover:opacity-100 transition-opacity">
                       <button onClick={() => togglePlay(idx)} className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-xl ${active && isPlaying ? 'bg-emerald-600 text-white animate-pulse' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}>
                          {active && isPlaying ? <Pause size={24} /> : <Play size={24} />}
                       </button>
                       <button onClick={() => handleTafsir(ayah)} className="h-14 px-8 rounded-2xl bg-white/5 border border-white/5 text-[11px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/10 transition-all flex items-center gap-3">
                          <Sparkles size={16} /> Тәпсір
                       </button>
                       <button onClick={() => { navigator.clipboard.writeText(ayah.text); }} className="w-14 h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-white/20 hover:text-white transition-all">
                          <Copy size={20} />
                       </button>
                    </div>
                  )}
                  {!isFocusMode && ayah.translation && (
                    <p className="mt-10 text-xl leading-relaxed text-white/40 font-medium max-w-3xl italic">
                       {ayah.translation}
                    </p>
                  )}
               </div>
             );
           })}
        </div>

        <audio ref={audioRef} onEnded={() => {
           if (currentAyahIndex !== null && currentAyahIndex < ayahs.length - 1) togglePlay(currentAyahIndex + 1);
           else setIsPlaying(false);
        }} />

        {selectedTafsirAyah && (
          <div className="fixed inset-0 z-[110] bg-deep-950/40 backdrop-blur-[60px] flex items-center justify-center p-8 animate-fade-in" onClick={() => setSelectedTafsirAyah(null)}>
             <div className="w-full max-w-3xl bg-deep-900 ios-glass rounded-[3.5rem] border border-white/10 p-12 max-h-[90vh] overflow-y-auto no-scrollbar animate-ios-spring shadow-3xl" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 flex items-center justify-center text-emerald-400"><Sparkles size={32} /></div>
                    <div><h3 className="text-3xl font-black">Аят тәпсірі</h3><p className="text-[12px] font-black uppercase tracking-widest text-white/30">{kzTitle} сүресі : {selectedTafsirAyah.numberInSurah} аят</p></div>
                  </div>
                  <button onClick={() => setSelectedTafsirAyah(null)} className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center hover:bg-white/10 transition-all"><X size={24} /></button>
                </div>
                <div className="bg-white/5 p-10 rounded-[2.5rem] border border-white/5 mb-10"><p className="text-4xl font-quran text-right text-emerald-400/80 leading-relaxed" dir="rtl">{selectedTafsirAyah.text}</p></div>
                {isTafsirLoading ? (
                   <div className="py-20 flex flex-col items-center justify-center gap-6 opacity-40"><Loader2 className="animate-spin text-emerald-500" size={48} /><p className="text-[12px] font-black uppercase tracking-widest">AI Тәпсір дайындауда...</p></div>
                ) : (
                   <div className="prose prose-invert max-w-none"><p className="text-xl leading-[1.9] text-white/70 whitespace-pre-wrap font-medium">{aiTafsir}</p></div>
                )}
                <button onClick={() => setSelectedTafsirAyah(null)} className="w-full py-6 bg-emerald-600 border border-emerald-400/50 rounded-[2rem] mt-12 text-[12px] font-black uppercase tracking-widest text-white shadow-xl active:scale-95 transition-all">Түсінікті</button>
             </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="px-6 pt-10 pb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
         <h2 className="text-5xl font-black tracking-tighter">Құран Кәрім</h2>
         <div className="relative w-full md:max-w-md">
            <input 
              type="text" placeholder={labels.searchSurah} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-full py-5 pl-16 pr-8 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-xl font-bold placeholder-white/20 shadow-inner transition-all"
            />
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" size={24} />
         </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-40 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 no-scrollbar">
         {filteredSurahs.map((surah, idx) => {
           const kzName = getSurahKazakhName(surah.number);
           return (
             <button 
               key={surah.number} onClick={() => handleSelectSurah(surah)}
               className="w-full ios-glass p-7 rounded-[3rem] border border-white/5 flex items-center gap-6 hover:bg-white/10 hover:scale-[1.03] active:scale-[0.97] transition-all group animate-slide-up shadow-2xl overflow-hidden"
               style={{ animationDelay: `${idx * 15}ms` }}
             >
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-[13px] font-black text-white/30 border border-white/10 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-500 transition-all shadow-inner flex-shrink-0">
                   {surah.number}
                </div>
                <div className="text-left flex-1 min-w-0">
                    <h4 className="font-black text-2xl text-white group-hover:text-emerald-400 transition-colors truncate mb-1">{kzName}</h4>
                    <div className="flex items-center gap-3">
                      <p className="text-[12px] font-black uppercase tracking-widest text-white/30 whitespace-nowrap">
                        {surah.numberOfAyahs} аят
                      </p>
                      <div className="w-1 h-1 rounded-full bg-white/10 flex-shrink-0"></div>
                      <p className="text-[12px] font-black uppercase tracking-widest text-white/30 truncate">
                        {surah.revelationType === 'Meccan' ? 'Меккелік' : 'Мәдиналық'}
                      </p>
                    </div>
                </div>
             </button>
           );
         })}
      </div>
    </div>
  );
};

export default QuranView;
