
import React, { useState, useEffect } from 'react';
import { GeneratedContent, Language } from '../types';
import { getDailyHadith, getRiwayat } from '../services/geminiService';
import { Sparkles, Book, RefreshCw, Share2, Loader2, X, Download, Type, Image as ImageIcon, Ban, ScrollText } from 'lucide-react';

interface HadithViewProps {
  lang: Language;
  labels: any;
  mode?: 'hadith' | 'riwayat';
}

const HadithView: React.FC<HadithViewProps> = ({ lang, labels, mode = 'hadith' }) => {
  const [content, setContent] = useState<GeneratedContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [isPreparingShare, setIsPreparingShare] = useState(false);
  const [shareImage, setShareImage] = useState<string | null>(null);
  const [shareBlob, setShareBlob] = useState<Blob | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const fetchContent = async () => {
    setLoading(true);
    let result;
    if (mode === 'hadith') {
      result = await getDailyHadith(lang, 'General');
    } else {
      result = await getRiwayat(lang);
    }
    setContent(result);
    setLoading(false);
  };

  useEffect(() => {
    fetchContent();
  }, [lang, mode]);

  const wrapText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number, draw: boolean = true) => {
    const words = text.split(/\s+/);
    let line = '';
    let currentY = y;
    for (let n = 0; n < words.length; n++) {
      let testLine = line + words[n] + ' ';
      let metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        if (draw) ctx.fillText(line, x, currentY);
        line = words[n] + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    if (draw) ctx.fillText(line, x, currentY);
    return currentY + lineHeight;
  };

  const generateShareImage = async () => {
    if (!content) return;
    setIsPreparingShare(true);
    setShowPreview(true);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 1080;
    const height = 1920;
    canvas.width = width;
    canvas.height = height;

    ctx.fillStyle = '#0f111a';
    ctx.fillRect(0, 0, width, height);

    const glow = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width);
    glow.addColorStop(0, 'rgba(16, 185, 129, 0.08)');
    glow.addColorStop(1, 'rgba(15, 17, 26, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(100, 450);
    ctx.lineTo(width - 100, 450);
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.font = 'bold 32px Inter';
    ctx.fillText('TAUBA', width / 2, 220);
    
    ctx.fillStyle = '#10b981';
    ctx.font = '900 12px Inter';
    ctx.letterSpacing = '12px';
    ctx.fillText('APP', width / 2 + 6, 255);
    ctx.letterSpacing = '0px';

    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 54px Amiri';
    ctx.fillText(content.title, width / 2, 580);

    const padding = 120;
    const textWidth = width - (padding * 2);
    let fontSize = 48;
    ctx.fillStyle = '#f8fafc';
    ctx.font = `${fontSize}px Inter`;
    
    const measureAndScale = (startSize: number) => {
      let currentSize = startSize;
      ctx.font = `${currentSize}px Inter`;
      let lastY = wrapText(ctx, content.content, width / 2, 720, textWidth, currentSize * 1.6, false);
      while (lastY > 1500 && currentSize > 28) {
        currentSize -= 2;
        ctx.font = `${currentSize}px Inter`;
        lastY = wrapText(ctx, content.content, width / 2, 720, textWidth, currentSize * 1.6, false);
      }
      return currentSize;
    };

    const finalFontSize = measureAndScale(fontSize);
    ctx.font = `500 ${finalFontSize}px Inter`;
    wrapText(ctx, content.content, width / 2, 720, textWidth, finalFontSize * 1.6, true);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.font = 'bold 20px Inter';
    ctx.fillText('WWW.TAUBA.KZ', width / 2, height - 120);

    const dataUrl = canvas.toDataURL('image/png');
    setShareImage(dataUrl);
    canvas.toBlob((blob) => setShareBlob(blob), 'image/png');
    setIsPreparingShare(false);
  };

  const handleShareText = async () => {
    if (!content) return;
    const shareText = `${content.title}\n\n${content.content}\n\nTauba App арқылы оқылды.`;
    if (navigator.share) {
      await navigator.share({ title: content.title, text: shareText });
    } else {
      await navigator.clipboard.writeText(shareText);
      alert('Көшірілді');
    }
  };

  const handleFinalShare = async () => {
    if (!shareBlob) return;
    const file = new File([shareBlob], `tauba-${Date.now()}.png`, { type: "image/png" });
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: content?.title });
    } else {
      const a = document.createElement('a');
      a.href = shareImage!;
      a.download = 'tauba-share.png';
      a.click();
    }
  };

  const handleCancelShare = () => {
    setShowPreview(false);
    setShareImage(null);
    setShareBlob(null);
    setIsPreparingShare(false);
  };

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="px-4 sm:px-6 pt-6 sm:pt-10 pb-2">
         <h2 className="text-2xl sm:text-3xl font-black tracking-tighter mb-2">{mode === 'hadith' ? labels.hadith : labels.riwayat}</h2>
         <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400 mb-4 sm:mb-6">{mode === 'hadith' ? 'Күнделікті қасиетті хадистер' : 'Ғибратты қиссалар мен оқиғалар'}</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 sm:px-5 pb-40 no-scrollbar">
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center opacity-40">
            <Loader2 className="animate-spin text-emerald-500 mb-4" size={32} />
            <p className="text-[9px] font-black uppercase tracking-[0.3em]">Жүктелуде...</p>
          </div>
        ) : content ? (
          <div className="animate-slide-up ios-glass rounded-[3rem] border-white/5 overflow-hidden relative shadow-2xl flex flex-col mb-8">
            <div className="absolute top-0 right-0 p-8 opacity-10">
               {mode === 'hadith' ? <Book size={120} className="text-emerald-500" /> : <ScrollText size={120} className="text-orange-500" />}
            </div>
            <div className="p-6 sm:p-10 relative z-10">
              <h3 className="text-xl sm:text-2xl font-black text-emerald-400 mb-6 sm:mb-8 font-serif leading-tight">{content.title}</h3>
              <p className="text-base sm:text-[17px] font-medium leading-[1.8] text-white/80 whitespace-pre-wrap">{content.content}</p>
              {content.reference && <p className="mt-8 sm:mt-10 text-[10px] text-white/20 font-black uppercase tracking-widest border-t border-white/5 pt-6">{labels.source}: {content.reference}</p>}
              
              <div className="mt-12 flex gap-3">
                 <button onClick={generateShareImage} className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[1.8rem] text-[11px] font-black uppercase tracking-widest text-white shadow-xl active:scale-95 transition-all ${mode === 'hadith' ? 'bg-emerald-600 shadow-emerald-900/40' : 'bg-orange-600 shadow-orange-900/40'}`}>
                   <ImageIcon size={16} /><span>Сурет</span>
                 </button>
                 <button onClick={handleShareText} className="w-16 h-16 flex items-center justify-center bg-white/5 rounded-[1.8rem] text-white/60 hover:bg-white/10 transition-all border border-white/5">
                   <Type size={20} />
                 </button>
              </div>
            </div>
          </div>
        ) : null}
        {!loading && <button onClick={fetchContent} className={`w-full py-5 ios-glass border-white/5 font-black uppercase tracking-[0.3em] text-[10px] rounded-[2rem] flex items-center justify-center gap-3 active:scale-95 transition-all ${mode === 'hadith' ? 'text-emerald-400' : 'text-orange-400'}`}><RefreshCw size={16} />{mode === 'hadith' ? labels.generateHadith : labels.generateRiwayat}</button>}
      </div>

      {showPreview && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-deep-900/80 backdrop-blur-[60px] animate-fade-in" onClick={handleCancelShare}>
           <div className="ios-glass w-full max-w-sm rounded-[3rem] overflow-hidden shadow-2xl flex flex-col relative border-white/10 animate-ios-spring" onClick={e => e.stopPropagation()}>
              <div className="p-6 flex items-center justify-between border-b border-white/5">
                 <span className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-4">Алдын ала көру</span>
                 <button onClick={handleCancelShare} className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center active:scale-90 transition-transform"><X size={20} /></button>
              </div>
              <div className="aspect-[9/16] bg-black/40 flex items-center justify-center relative overflow-hidden">
                 {isPreparingShare ? (
                    <div className="flex flex-col items-center gap-4">
                       <Loader2 className="animate-spin text-emerald-500" size={32} />
                    </div>
                 ) : shareImage && <img src={shareImage} className="w-full h-full object-contain p-4" alt="Share Preview" />}
              </div>
              <div className="p-8 flex flex-col gap-3">
                 <button onClick={handleFinalShare} disabled={isPreparingShare} className={`w-full py-5 text-white font-black uppercase tracking-widest text-[11px] rounded-[1.8rem] flex items-center justify-center gap-3 shadow-2xl active:scale-95 transition-all disabled:opacity-50 ${mode === 'hadith' ? 'bg-emerald-600 shadow-emerald-900/50' : 'bg-orange-600 shadow-orange-900/50'}`}>
                   <Share2 size={18} />Бөлісу
                 </button>
                 <div className="grid grid-cols-2 gap-3">
                   <button onClick={() => { const a = document.createElement('a'); a.href = shareImage!; a.download = 'tauba.png'; a.click(); }} disabled={isPreparingShare} className="py-4 ios-glass border-white/10 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white transition-all flex items-center justify-center gap-2">
                     <Download size={14} /> Сақтау
                   </button>
                   <button onClick={handleCancelShare} className="py-4 bg-red-500/10 border border-red-500/20 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest text-red-400 hover:bg-red-500/20 transition-all flex items-center justify-center gap-2">
                     <Ban size={14} /> Тоқтату
                   </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default HadithView;
