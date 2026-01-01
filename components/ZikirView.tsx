
import React, { useState, useEffect } from 'react';
import { RotateCcw, Share2, X, ChevronLeft, Eye, EyeOff, Loader2, Download, Type, Check, Anchor, Heart, Shield, Moon, Sparkles, Ban, Wind } from 'lucide-react';
import { Language, ZikirDefinition, ZikirCategory } from '../types';
import { ZIKIR_LIST } from '../constants';
import { generateZikirRewardImage } from '../services/geminiService';

interface ZikirViewProps {
  lang: Language;
  labels: any;
}

const getCategoryIcon = (cat: ZikirCategory) => {
  switch (cat) {
    case 'sabr': return <Anchor size={14} />;
    case 'tauba': return <Heart size={14} />;
    case 'night': return <Moon size={14} />;
    case 'protection': return <Shield size={14} />;
    default: return null;
  }
};

const ZikirView: React.FC<ZikirViewProps> = ({ lang, labels }) => {
  const [selectedZikir, setSelectedZikir] = useState<ZikirDefinition | null>(null);
  const [activeCategory, setActiveCategory] = useState<ZikirCategory>('sabr');
  const [count, setCount] = useState(0);
  const [target, setTarget] = useState(33);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [rewardImage, setRewardImage] = useState<string | null>(null);
  const [shareBlob, setShareBlob] = useState<Blob | null>(null);
  const [shareDataUrl, setShareDataUrl] = useState<string | null>(null);
  const [isPreparingShare, setIsPreparingShare] = useState(false);
  const [lastCycleCount, setLastCycleCount] = useState(0);

  useEffect(() => {
    if (selectedZikir) {
      localStorage.setItem(`tauba_zikir_${selectedZikir.id}`, count.toString());
    }
  }, [count, selectedZikir]);

  const handleSelectZikir = (zikir: ZikirDefinition) => {
    const savedCount = localStorage.getItem(`tauba_zikir_${zikir.id}`);
    setCount(savedCount ? parseInt(savedCount, 10) : 0);
    setSelectedZikir(zikir);
    setTarget(zikir.defaultTarget);
  };

  const handleTap = () => {
    const newCount = count + 1;
    setCount(newCount);
    if (navigator.vibrate) navigator.vibrate([15]);
    if (newCount > 0 && newCount % target === 0) {
       setLastCycleCount(newCount);
       triggerReward(newCount);
    }
  };

  const triggerReward = async (completedCount: number) => {
    setShowReward(true);
    setRewardImage(null);
    setIsPreparingShare(true);
    const imageUrl = await generateZikirRewardImage(completedCount);
    setRewardImage(imageUrl);
    createCompositedImage(imageUrl, completedCount);
  };

  const createCompositedImage = async (bgUrl: string | null, finalCount: number) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const width = 1080;
    const height = 1920;
    canvas.width = width;
    canvas.height = height;
    if (!ctx) return;

    ctx.fillStyle = '#0a0b10';
    ctx.fillRect(0, 0, width, height);

    if (bgUrl) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        ctx.save();
        ctx.globalAlpha = 0.35;
        const scale = Math.max(width / img.width, height / img.height);
        const x = (width / 2) - (img.width / 2) * scale;
        const y = (height / 2) - (img.height / 2) * scale;
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
        ctx.restore();
        
        const vignette = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, height/1.5);
        vignette.addColorStop(0, 'rgba(10, 11, 16, 0)');
        vignette.addColorStop(1, 'rgba(10, 11, 16, 0.8)');
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, width, height);
        
        drawOverlay();
      };
      img.src = bgUrl;
    } else {
      drawOverlay();
    }

    function drawOverlay() {
      if (!ctx) return;
      
      const glow = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width);
      glow.addColorStop(0, 'rgba(16, 185, 129, 0.12)');
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.font = 'bold 36px Inter';
      ctx.letterSpacing = '14px';
      ctx.fillText('TAUBA', width / 2 + 7, 240);
      ctx.letterSpacing = '0px';
      
      ctx.fillStyle = '#10b981';
      ctx.font = '900 12px Inter';
      ctx.letterSpacing = '8px';
      ctx.fillText('ISLAMIC COMPANION', width / 2 + 4, 275);
      ctx.letterSpacing = '0px';

      ctx.strokeStyle = 'rgba(16, 185, 129, 0.2)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(width / 2 - 100, 340);
      ctx.lineTo(width / 2 + 100, 340);
      ctx.stroke();

      if (selectedZikir) {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 30;
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 130px Amiri';
        ctx.fillText(selectedZikir.arabic, width/2, 640);
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '600 56px Inter';
        ctx.fillText(selectedZikir.title[lang], width/2, 780);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '500 32px Inter';
        const words = selectedZikir.meaning[lang].split(' ');
        let line = '';
        let currentY = 840;
        for (let n = 0; n < words.length; n++) {
            let testLine = line + words[n] + ' ';
            let metrics = ctx.measureText(testLine);
            if (metrics.width > 800 && n > 0) {
                ctx.fillText(line, width/2, currentY);
                line = words[n] + ' ';
                currentY += 45;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, width/2, currentY);
      }

      const countY = 1250;
      ctx.beginPath();
      ctx.arc(width/2, countY - 110, 260, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(16, 185, 129, 0.05)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.15)';
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.fillStyle = '#10b981';
      ctx.font = '900 420px Inter';
      ctx.fillText(finalCount.toString(), width/2, countY);
      
      ctx.fillStyle = 'rgba(16, 185, 129, 0.6)';
      ctx.font = 'bold 40px Inter';
      ctx.letterSpacing = '8px';
      ctx.fillText('ZIKIR COMPLETED', width/2, countY + 100);
      ctx.letterSpacing = '0px';

      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.font = 'bold 24px Inter';
      ctx.letterSpacing = '10px';
      ctx.fillText('WWW.TAUBA.KZ', width/2, height - 120);

      const url = canvas.toDataURL('image/png');
      setShareDataUrl(url);
      canvas.toBlob(blob => setShareBlob(blob));
      setIsPreparingShare(false);
    }
  };

  const handleShare = async () => {
    if (!shareBlob) return;
    const file = new File([shareBlob], 'zikir.png', { type: 'image/png' });
    if (navigator.share && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], text: 'Зікір аяқталды!' });
    } else {
      const a = document.createElement('a');
      a.href = shareDataUrl!;
      a.download = 'tauba-zikir.png';
      a.click();
    }
  };

  const handleCancelShare = () => {
    setShowReward(false);
    setShareDataUrl(null);
    setShareBlob(null);
    setIsPreparingShare(false);
  };

  const progress = Math.min((count % target) / target * 100, 100);

  if (!selectedZikir) {
    const categories: ZikirCategory[] = ['sabr', 'tauba', 'night', 'protection'];
    return (
      <div className="h-full flex flex-col animate-fade-in">
        <div className="px-8 pt-12 pb-10">
           <div className="flex items-center justify-between mb-10">
             <h2 className="text-5xl font-black tracking-tighter text-white">Зікірлер</h2>
             <div className="w-16 h-16 rounded-[2rem] bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-xl">
                <Sparkles size={28} className="text-emerald-400" />
             </div>
           </div>
           
           <div className="ios-glass p-2 rounded-[2.5rem] border border-white/10 flex overflow-hidden shadow-2xl relative max-w-2xl mx-auto">
              {categories.map((cat) => {
                const isActive = activeCategory === cat;
                return (
                  <button 
                    key={cat} 
                    onClick={() => setActiveCategory(cat)} 
                    className={`flex-1 flex flex-col items-center justify-center py-4 px-3 rounded-[2rem] transition-all duration-500 relative z-10 ${isActive ? 'text-white' : 'text-white/30 hover:text-white/60'}`}
                  >
                    <div className={`mb-2 transition-transform duration-500 ${isActive ? 'scale-125' : 'scale-100 opacity-60'}`}>
                      {getCategoryIcon(cat)}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-center truncate w-full">
                      {(labels as any)[`cat_${cat}`]}
                    </span>
                    {isActive && (
                      <div className="absolute inset-0 bg-emerald-600 rounded-[2rem] -z-10 shadow-lg shadow-emerald-900/40 animate-ios-spring"></div>
                    )}
                  </button>
                );
              })}
           </div>
        </div>

        <div className="flex-1 overflow-y-auto px-8 pb-40 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 no-scrollbar">
           {ZIKIR_LIST.filter(z => z.category === activeCategory).map((zikir, idx) => (
             <button 
              key={zikir.id} 
              onClick={() => handleSelectZikir(zikir)} 
              className="w-full text-left ios-glass p-8 rounded-[3rem] border border-white/5 hover:bg-white/10 hover:scale-[1.03] transition-all group active:scale-[0.98] animate-slide-up shadow-xl"
              style={{ animationDelay: `${idx * 40}ms` }}
             >
               <div className="flex justify-between items-start mb-6">
                 <div className="flex flex-col">
                   <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em] mb-2">{zikir.category}</span>
                   <h3 className="font-black text-2xl text-white group-hover:text-emerald-400 transition-colors leading-tight">{zikir.title[lang]}</h3>
                 </div>
                 <span className="text-4xl font-quran text-white/20 group-hover:text-emerald-400/50 transition-all">{zikir.arabic.split(' ')[0]}</span>
               </div>
               <p className="text-[15px] text-white/40 leading-relaxed font-medium line-clamp-2">{zikir.meaning[lang]}</p>
             </button>
           ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full flex flex-col relative transition-all duration-1000 overflow-hidden ${isFocusMode ? 'bg-[#050608]' : 'bg-transparent'}`}>
      {isFocusMode && (
        <div className="absolute inset-0 z-0 animate-fade-in pointer-events-none overflow-hidden">
           <div className="absolute inset-0 bg-[#050608]"></div>
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-emerald-500/5 rounded-full blur-[150px] animate-breathe" style={{ animationDuration: '10s' }}></div>
           <div className="absolute top-0 left-0 w-full h-full">
              <div className="absolute top-[15%] left-[25%] w-96 h-96 bg-teal-900/10 rounded-full blur-[120px] animate-float" style={{ animationDuration: '14s' }}></div>
              <div className="absolute bottom-[25%] right-[15%] w-96 h-96 bg-emerald-900/10 rounded-full blur-[150px] animate-float" style={{ animationDuration: '18s', animationDelay: '-5s' }}></div>
           </div>
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,#050608_95%)]"></div>
        </div>
      )}

      <div className="flex justify-between items-center p-8 z-20">
         <button onClick={() => setSelectedZikir(null)} className={`w-14 h-14 ios-glass rounded-full flex items-center justify-center active:scale-90 hover:bg-white/10 transition-all border border-white/10 shadow-lg ${isFocusMode ? 'opacity-20 hover:opacity-100' : 'opacity-100'}`}><ChevronLeft size={28} /></button>
         
         <button 
           onClick={() => setIsFocusMode(!isFocusMode)} 
           className={`px-8 h-14 rounded-full flex items-center justify-center gap-4 transition-all border active:scale-95 shadow-xl ${
             isFocusMode 
              ? 'bg-emerald-600/20 border-emerald-500/40 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.2)]' 
              : 'ios-glass text-white/40 border-white/10 hover:text-white hover:bg-white/10'
           }`}
         >
           {isFocusMode ? <Wind size={22} className="animate-pulse" /> : <Eye size={22} />}
           <span className="text-[11px] font-black uppercase tracking-[0.2em]">{isFocusMode ? 'Құшу режимі' : 'Фокус режим'}</span>
         </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center z-10 pb-20">
         <div className={`text-center space-y-8 px-10 transition-all duration-1000 ${isFocusMode ? 'opacity-0 -translate-y-24 scale-90 pointer-events-none' : 'opacity-100'}`}>
            <h2 className="text-5xl font-black text-white">{selectedZikir.title[lang]}</h2>
            <p className="text-5xl font-quran text-emerald-400 drop-shadow-[0_0_20px_rgba(16,185,129,0.3)]" dir="rtl">{selectedZikir.arabic}</p>
         </div>

         <div className={`relative transition-all duration-1000 ${isFocusMode ? 'scale-150 translate-y-8' : 'mt-20 scale-100'}`}>
            <button 
              onClick={handleTap} 
              className={`w-96 h-96 rounded-full flex flex-col items-center justify-center relative overflow-hidden transition-all duration-500 active:scale-[0.95] group ${
                isFocusMode 
                  ? 'bg-transparent border-emerald-500/10 border-2 shadow-none' 
                  : 'ios-glass bg-white/5 border border-white/10 hover:border-emerald-500/40 hover:bg-white/10 hover:shadow-[0_0_80px_rgba(16,185,129,0.2)] shadow-3xl'
              }`}
            >
                <div 
                  className={`absolute inset-0 transition-all duration-700 ${isFocusMode ? 'bg-emerald-500/5' : 'bg-gradient-to-t from-emerald-600/30 via-emerald-500/10 to-transparent'}`}
                  style={{ height: `${progress}%`, top: 'auto' }}
                ></div>
                
                <div className="relative z-10 flex flex-col items-center">
                    <span className={`font-black tracking-tighter tabular-nums leading-none transition-all duration-700 ${isFocusMode ? 'text-[13rem] text-emerald-400/95 drop-shadow-[0_0_50px_rgba(16,185,129,0.4)]' : 'text-9xl text-white'}`}>
                      {count}
                    </span>
                    <div className={`mt-6 flex flex-col items-center transition-all duration-700 ${isFocusMode ? 'opacity-20' : 'opacity-40 group-hover:opacity-70'}`}>
                       <span className={`font-black uppercase tracking-[0.5em] ${isFocusMode ? 'text-[16px]' : 'text-[12px]'}`}>{target}</span>
                    </div>
                </div>
            </button>
         </div>

         {!isFocusMode && (
           <div className="mt-20 flex items-center gap-10 animate-fade-in lg:scale-110">
             <button onClick={() => { if(confirm('Нөлдеу?')) setCount(0); }} className="w-16 h-16 ios-glass border border-white/10 bg-white/5 rounded-full flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 hover:border-emerald-500/40 transition-all active:scale-90 shadow-xl"><RotateCcw size={24} /></button>
             
             <div className="ios-glass p-2 rounded-full flex gap-2 border border-white/10 shadow-3xl bg-white/5">
                 {[33, 100, 1000].map(t => (
                   <button 
                     key={t} 
                     onClick={() => setTarget(t)} 
                     className={`px-10 py-4 rounded-full text-[11px] font-black tracking-widest transition-all duration-500 hover:scale-[1.05] active:scale-95 ${target === t ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-900/40' : 'text-white/40 hover:text-white/60 hover:bg-white/5'}`}
                   >
                     {t}
                   </button>
                 ))}
             </div>
             
             <button onClick={() => triggerReward(count)} className="w-16 h-16 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-2xl shadow-emerald-900/50 active:scale-90 hover:bg-emerald-500 transition-all border border-emerald-400/50 hover:-translate-y-2"><Share2 size={24} /></button>
           </div>
         )}
      </div>

      {showReward && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-deep-900/80 backdrop-blur-[60px] animate-fade-in" onClick={handleCancelShare}>
           <div className="ios-glass w-full max-w-md rounded-[3.5rem] overflow-hidden shadow-3xl flex flex-col relative border border-white/10 animate-ios-spring" onClick={e => e.stopPropagation()}>
              <div className="p-10 text-center bg-white/5">
                <div className="w-20 h-20 bg-emerald-500/20 rounded-[1.8rem] flex items-center justify-center text-emerald-400 mx-auto mb-8 shadow-inner border border-emerald-500/10">
                   <Check size={40} strokeWidth={3} />
                </div>
                <h3 className="text-3xl font-black mb-2 text-white">МәшАллаһ!</h3>
                <p className="text-[12px] font-black uppercase tracking-[0.4em] text-white/30">Цикл сәтті аяқталды</p>
              </div>
              
              <div className="aspect-[9/16] bg-black/40 flex items-center justify-center relative overflow-hidden border-y border-white/5">
                 {isPreparingShare ? (
                    <div className="flex flex-col items-center gap-4">
                       <Loader2 className="animate-spin text-emerald-500" size={48} />
                       <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Керемет сурет дайындалуда...</span>
                    </div>
                 ) : shareDataUrl && <img src={shareDataUrl} className="w-full h-full object-contain p-6" alt="Zikir Reward" />}
              </div>
              
              <div className="p-10 flex flex-col gap-4">
                 <button onClick={handleShare} disabled={isPreparingShare} className="w-full py-6 bg-emerald-600 text-white font-black uppercase tracking-widest text-[12px] rounded-[2rem] flex items-center justify-center gap-4 shadow-2xl shadow-emerald-900/50 active:scale-95 transition-all border border-emerald-400/50">
                   <Share2 size={22} />Бөлісу
                 </button>
                 <button onClick={handleCancelShare} className="w-full py-5 bg-white/5 border border-white/10 rounded-[2rem] text-[11px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all flex items-center justify-center gap-3">
                   <Ban size={20} /> Жабу
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ZikirView;
