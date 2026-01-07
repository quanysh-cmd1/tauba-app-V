import { PrayerTimes } from '../types';

class AdhanService {
  private audio: HTMLAudioElement | null = null;
  private isEnabled: boolean = true;
  private checkInterval: number | null = null;
  private lastPlayedPrayer: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.audio = new Audio('/audio/adhan.mp3');
      const saved = localStorage.getItem('tauba_adhan_enabled');
      this.isEnabled = saved !== null ? saved === 'true' : true;
    }
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    localStorage.setItem('tauba_adhan_enabled', enabled.toString());
    if (!enabled) {
      this.stop();
    }
  }

  public getEnabled(): boolean {
    return this.isEnabled;
  }

  public play() {
    if (this.audio && this.isEnabled) {
      this.audio.play().catch(err => console.error("Adhan play error:", err));
    }
  }

  public stop() {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
    }
  }

  public startMonitoring(timings: PrayerTimes) {
    if (this.checkInterval) {
      window.clearInterval(this.checkInterval);
    }

    this.checkInterval = window.setInterval(() => {
      this.checkPrayerTimes(timings);
    }, 30000); // Check every 30 seconds
  }

  private checkPrayerTimes(timings: PrayerTimes) {
    if (!this.isEnabled) return;

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    
    for (const prayer of prayers) {
      const prayerTime = (timings as any)[prayer];
      if (prayerTime === currentTime && this.lastPlayedPrayer !== `${prayer}_${currentTime}`) {
        this.play();
        this.lastPlayedPrayer = `${prayer}_${currentTime}`;
        break;
      }
    }
  }
}

export const adhanService = new AdhanService();
