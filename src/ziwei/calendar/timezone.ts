/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Calculates Equation of Time (EoT) in minutes for a given day of year.
 * Standard astronomical approximation:
 * B = 360/365 * (d - 81) in degrees
 * EoT = 9.87 * sin(2B) - 7.53 * cos(B) - 1.5 * sin(B)
 */
export function getEquationOfTime(dayOfYear: number): number {
  const b = (360 / 365.24) * (dayOfYear - 81) * (Math.PI / 180);
  return 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b);
}

export function getDayOfYear(year: number, month: number, day: number): number {
  const date = new Date(Date.UTC(year, month - 1, day));
  const startOfYear = new Date(Date.UTC(year, 0, 1));
  const diffTime = date.getTime() - startOfYear.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

export interface TrueSolarTimeResult {
  clockTime: string; // HH:mm
  trueSolarTime: string; // HH:mm
  offsetMinutes: number;
  adjustedHour: number;
  adjustedMinute: number;
}

/**
 * Computes true solar time from local clock time, longitude, and day of year.
 * Standard meridian for Asia/Taipei is 120.0°E.
 * Default Taipei longitude is 121.5°E.
 */
export function calculateTrueSolarTime(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  longitude: number = 121.5,
  standardMeridian: number = 120.0,
): TrueSolarTimeResult {
  const dayOfYear = getDayOfYear(year, month, day);
  const eot = getEquationOfTime(dayOfYear);
  // Longitude correction: 4 minutes per degree
  const lonCorrection = (longitude - standardMeridian) * 4;
  const totalOffsetMinutes = Math.round(lonCorrection + eot);

  let totalMinutes = hour * 60 + minute + totalOffsetMinutes;
  // Normalize within day bounds
  if (totalMinutes < 0) totalMinutes += 24 * 60;
  if (totalMinutes >= 24 * 60) totalMinutes %= 24 * 60;

  const adjHour = Math.floor(totalMinutes / 60);
  const adjMinute = totalMinutes % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');

  return {
    clockTime: `${pad(hour)}:${pad(minute)}`,
    trueSolarTime: `${pad(adjHour)}:${pad(adjMinute)}`,
    offsetMinutes: totalOffsetMinutes,
    adjustedHour: adjHour,
    adjustedMinute: adjMinute,
  };
}
