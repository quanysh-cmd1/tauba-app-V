import React, { useEffect, useState } from 'react';
import { Compass, Navigation } from 'lucide-react';
import { calculateQiblaHeading } from '../services/prayerService';

interface QiblaViewProps {
  lat: number;
  lng: number;
  labels: any;
}

const QiblaView: React.FC<QiblaViewProps> = ({ lat, lng, labels }) => {
  const [qiblaAngle, setQiblaAngle] = useState(0);

  useEffect(() => {
    setQiblaAngle(calculateQiblaHeading(lat, lng));
  }, [lat, lng]);

  return (
    <div className="flex flex-col items-center justify-start h-full overflow-hidden text-current pt-4 sm:pt-8 space-y-8 sm:space-y-12">
      
      <div className="text-center space-y-2 sm:space-y-3 z-10">
        <h2 className="text-3xl sm:text-4xl font-bold font-serif drop-shadow-sm tracking-wide">{labels.qibla}</h2>
        <div className="inline-flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-full border border-white/5 backdrop-blur-sm">
          <span className="opacity-70 text-sm font-medium uppercase tracking-wider">{labels.kaabaDirection}:</span>
          <span className="font-bold text-xl text-emerald-300">{Math.round(qiblaAngle)}°</span>
        </div>
      </div>

      <div className="relative w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 group">
        {/* Outer Glow */}
        <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full opacity-50 group-hover:opacity-70 transition-opacity"></div>

        {/* Compass Dial */}
        <div className="w-full h-full rounded-full shadow-2xl overflow-hidden bg-gradient-to-br from-[#0f172a] to-[#1e293b] border border-white/20 relative ring-1 ring-white/10">
           
           {/* Decorative Grid */}
           <div className="absolute inset-0 opacity-40" 
                style={{
                  backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.1) 0%, transparent 70%), repeating-linear-gradient(0deg, transparent 0, transparent 49px, rgba(255,255,255,0.05) 50px)'
                }}>
           </div>
           
           <div className="absolute top-4 left-1/2 -translate-x-1/2 text-sm text-emerald-400/70 font-bold tracking-widest">N</div>
           <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-white/30 font-bold tracking-widest">S</div>
           <div className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-white/30 font-bold tracking-widest">W</div>
           <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-white/30 font-bold tracking-widest">E</div>

           {/* Center Point */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-[0_0_10px_white] z-20"></div>
        </div>

        {/* Needle Container */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none transition-transform duration-1000 ease-out will-change-transform"
             style={{ transform: `rotate(${qiblaAngle}deg)` }}>
           
           {/* The Needle */}
           <div className="absolute -top-3 flex flex-col items-center">
             <div className="w-12 h-12 bg-emerald-500 rounded-full border-[3px] border-[#0f172a] flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.6)] z-30">
                <Navigation size={22} className="text-white fill-white transform -rotate-45" />
             </div>
             {/* Needle tail */}
             <div className="w-1.5 h-36 bg-gradient-to-b from-emerald-500 via-emerald-500/50 to-transparent rounded-full mt-[-16px]"></div>
           </div>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-5 rounded-2xl text-sm text-center max-w-xs shadow-lg w-full mx-auto hover:bg-white/10 transition-colors">
        <div className="flex items-center justify-center mb-3 font-bold opacity-90 text-emerald-200">
           <Compass className="mr-2" size={18} />
           {labels.yourLocation}
        </div>
        <div className="font-mono bg-black/20 p-3 rounded-xl text-xs opacity-80 tracking-widest border border-white/5">
          {lat.toFixed(4)}  |  {lng.toFixed(4)}
        </div>
      </div>
    </div>
  );
};

export default QiblaView;