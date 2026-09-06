/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BirthInput, CalendarInfo, GanzhiSet } from '../types/chart';
import { parseSolarDate } from './solar';
import { LunarService } from './lunar';
import { JieQiService } from './jieQi';
import { calculateFullGanzhi } from './ganzhi';
import { calculateTrueSolarTime } from './timezone';

export interface TaiwanCalendarOutput {
  calendar: CalendarInfo;
  ganzhi: GanzhiSet;
  trueSolarHour: number;
  trueSolarMinute: number;
}

export class TaiwanCalendarService {
  /**
   * Main entry point for calendar calculations.
   * Supports both 'solar' and 'lunar' calendar types.
   * Preserves timezone and handles true solar time with longitude.
   */
  public static calculate(input: BirthInput): TaiwanCalendarOutput {
    let sYear: number;
    let sMonth: number;
    let sDay: number;

    const lon = input.longitude ?? (input.timezone === 'Asia/Taipei' || !input.timezone ? 121.5 : 120.0);

    if (input.calendarType === 'lunar') {
      const lYear = input.lunarYear || 2026;
      const lMonth = input.lunarMonth || 1;
      const lDay = input.lunarDay || 1;
      const isLeap = input.isLeapMonth || false;

      const converted = LunarService.lunarToSolar(lYear, lMonth, lDay, isLeap);
      sYear = converted.solarYear;
      sMonth = converted.solarMonth;
      sDay = converted.solarDay;
    } else {
      const parsed = parseSolarDate(input.solarDate, input.birthHour, input.birthMinute);
      sYear = parsed.year;
      sMonth = parsed.month;
      sDay = parsed.day;
    }

    // 1. Calculate True Solar Time
    const trueSolar = calculateTrueSolarTime(
      sYear,
      sMonth,
      sDay,
      input.birthHour,
      input.birthMinute,
      lon,
      120.0,
    );

    // 2. Calendar Info
    const calendar = LunarService.getCalendarInfo(
      sYear,
      sMonth,
      sDay,
      input.birthHour,
      input.birthMinute,
      lon,
    );

    // 3. Solar Term (JieQi) Details
    const jieQi = JieQiService.getSolarTerm(
      sYear,
      sMonth,
      sDay,
      trueSolar.adjustedHour,
      trueSolar.adjustedMinute,
    );
    calendar.jieQi = jieQi;

    // 4. Full Ganzhi
    const ganzhi = calculateFullGanzhi(
      sYear,
      sMonth,
      sDay,
      trueSolar.adjustedHour,
      jieQi.solarMonthIndex,
      input.ziHourRule || 'ziEarly',
    );

    return {
      calendar,
      ganzhi,
      trueSolarHour: trueSolar.adjustedHour,
      trueSolarMinute: trueSolar.adjustedMinute,
    };
  }
}
