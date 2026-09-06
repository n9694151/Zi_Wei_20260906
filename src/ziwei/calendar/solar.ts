/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SolarDateObj {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second?: number;
}

export function parseSolarDate(solarDateStr: string, hour: number, minute: number): SolarDateObj {
  const parts = solarDateStr.split('-').map((s) => parseInt(s, 10));
  if (parts.length < 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) {
    throw new Error(`Invalid solar date format: "${solarDateStr}". Expected YYYY-MM-DD.`);
  }
  const year = parts[0];
  const month = parts[1];
  const day = parts[2];

  if (month < 1 || month > 12) {
    throw new Error(`Month must be between 1 and 12, got: ${month}`);
  }
  if (day < 1 || day > 31) {
    throw new Error(`Day must be between 1 and 31, got: ${day}`);
  }

  return {
    year,
    month,
    day,
    hour: Math.max(0, Math.min(23, hour)),
    minute: Math.max(0, Math.min(59, minute)),
  };
}

export function formatSolarDate(year: number, month: number, day: number): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${year}-${pad(month)}-${pad(day)}`;
}
