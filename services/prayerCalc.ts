
/**
 * Prayer Time Calculation Logic
 * Based on standard astronomical formulas
 */

export interface PrayerTimes {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
  Midnight: string;
}

const DTR = Math.PI / 180;
const RTD = 180 / Math.PI;

const fixAngle = (a: number) => {
  a = a - 360 * Math.floor(a / 360);
  return a < 0 ? a + 360 : a;
};

const fixHour = (a: number) => {
  a = a - 24 * Math.floor(a / 24);
  return a < 0 ? a + 24 : a;
};

const dsin = (d: number) => Math.sin(d * DTR);
const dcos = (d: number) => Math.cos(d * DTR);
const dtan = (d: number) => Math.tan(d * DTR);
const dasin = (x: number) => Math.asin(x) * RTD;
const dacos = (x: number) => Math.acos(x) * RTD;
const datan = (x: number) => Math.atan(x) * RTD;
const datan2 = (y: number, x: number) => Math.atan2(y, x) * RTD;

const formatTime = (time: number) => {
  if (isNaN(time)) return "--:--";
  time = fixHour(time + 0.5 / 60); // round to nearest minute
  const hours = Math.floor(time);
  const minutes = Math.floor((time - hours) * 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

export const calculatePrayerTimes = (
  date: Date,
  lat: number,
  lng: number,
  timezone: number = 5,
  fajrAngle: number = 15,
  ishaAngle: number = 15
): PrayerTimes => {
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
  
  // Equation of time and Declination
  const D = dayOfYear + (6 - lng / 15) / 24;
  const M = fixAngle(357.5291 + 0.98560028 * D);
  const L = fixAngle(280.4665 + 0.98564736 * D);
  const Lambda = fixAngle(L + 1.915 * dsin(M) + 0.02 * dsin(2 * M));
  
  const epsilon = 23.439 - 0.0000004 * D;
  const alpha = datan2(dcos(epsilon) * dsin(Lambda), dcos(Lambda)) / 15;
  const decl = dasin(dsin(epsilon) * dsin(Lambda));
  const eqt = L / 15 - fixHour(alpha);
  
  const computeTime = (angle: number, direction: 'ccw' | 'cw') => {
    const V = (1 / 15) * dacos((-dsin(angle) - dsin(decl) * dsin(lat)) / (dcos(decl) * dcos(lat)));
    return direction === 'ccw' ? 12 + eqt - lng / 15 - V : 12 + eqt - lng / 15 + V;
  };

  const midDay = 12 + eqt - lng / 15;
  const sunrise = computeTime(0.833, 'ccw');
  const sunset = computeTime(0.833, 'cw');
  const fajr = computeTime(fajrAngle, 'ccw');
  const isha = computeTime(ishaAngle, 'cw');
  
  // Asr (Shafi'i: 1, Hanafi: 2) - Using Hanafi as default for Kazakhstan
  const asrStep = 2;
  const asrAngle = datan(asrStep + dtan(Math.abs(lat - decl)));
  const asr = 12 + eqt - lng / 15 + (1 / 15) * dacos((dsin(90 - asrAngle) - dsin(decl) * dsin(lat)) / (dcos(decl) * dcos(lat)));

  const adjust = (t: number) => t + timezone;

  return {
    Fajr: formatTime(adjust(fajr)),
    Sunrise: formatTime(adjust(sunrise)),
    Dhuhr: formatTime(adjust(midDay)),
    Asr: formatTime(adjust(asr)),
    Maghrib: formatTime(adjust(sunset)),
    Isha: formatTime(adjust(isha)),
    Midnight: formatTime(adjust(midDay + 12))
  };
};
