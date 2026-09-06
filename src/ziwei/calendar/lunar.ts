/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// @ts-ignore
import { Solar, Lunar } from 'lunar-javascript';
import { CalendarInfo } from '../types/chart';
import { JieQiService } from './jieQi';
import { calculateTrueSolarTime } from './timezone';
import { EarthlyBranch, EARTHLY_BRANCHES } from '../types/constants';

export interface LunarDateResult {
  lunarYear: number;
  lunarMonth: number;
  lunarDay: number;
  isLeapMonth: boolean;
  lunarMonthName: string;
  lunarDayName: string;
  hourBranch: EarthlyBranch;
}

/**
 * Maps hour (0-23) to Earthly Branch.
 * 23:00 - 00:59: 子
 * 01:00 - 02:59: 丑
 * 03:00 - 04:59: 寅
 * 05:00 - 06:59: 卯
 * 07:00 - 08:59: 辰
 * 09:00 - 10:59: 巳
 * 11:00 - 12:59: 午
 * 13:00 - 14:59: 未
 * 15:00 - 16:59: 申
 * 17:00 - 18:59: 酉
 * 19:00 - 20:59: 戌
 * 21:00 - 22:59: 亥
 */
export function getHourBranch(hour: number): EarthlyBranch {
  if (hour === 23 || hour === 0) return '子';
  const index = Math.floor((hour + 1) / 2) % 12;
  return EARTHLY_BRANCHES[index];
}

export class LunarService {
  /**
   * Converts Solar date/time into Lunar date details
   */
  public static solarToLunar(
    solarYear: number,
    solarMonth: number,
    solarDay: number,
    hour: number = 12,
    minute: number = 0,
  ): LunarDateResult {
    const solar = Solar.fromYmdHms(solarYear, solarMonth, solarDay, hour, minute, 0);
    const lunar = solar.getLunar();

    const hourBranch = getHourBranch(hour);
    const lunarMonth = Math.abs(lunar.getMonth());
    const isLeapMonth = lunar.getMonth() < 0 || (typeof lunar.isLeap === 'function' && lunar.isLeap());

    return {
      lunarYear: lunar.getYear(),
      lunarMonth,
      lunarDay: lunar.getDay(),
      isLeapMonth,
      lunarMonthName: (isLeapMonth ? '閏' : '') + lunar.getMonthInChinese() + '月',
      lunarDayName: lunar.getDayInChinese(),
      hourBranch,
    };
  }

  /**
   * Converts Lunar date into Solar date details
   */
  public static lunarToSolar(
    lunarYear: number,
    lunarMonth: number,
    lunarDay: number,
    isLeapMonth: boolean = false,
  ): { solarYear: number; solarMonth: number; solarDay: number } {
    const monthParam = isLeapMonth ? -Math.abs(lunarMonth) : Math.abs(lunarMonth);
    const lunar = Lunar.fromYmd(lunarYear, monthParam, lunarDay);
    const solar = lunar.getSolar();
    return {
      solarYear: solar.getYear(),
      solarMonth: solar.getMonth(),
      solarDay: solar.getDay(),
    };
  }

  /**
   * Assembles comprehensive CalendarInfo including true solar time and 24 JieQi
   */
  public static getCalendarInfo(
    solarYear: number,
    solarMonth: number,
    solarDay: number,
    clockHour: number,
    clockMinute: number,
    longitude: number = 121.5,
  ): CalendarInfo {
    const trueSolar = calculateTrueSolarTime(solarYear, solarMonth, solarDay, clockHour, clockMinute, longitude);
    const lunar = LunarService.solarToLunar(
      solarYear,
      solarMonth,
      solarDay,
      trueSolar.adjustedHour,
      trueSolar.adjustedMinute,
    );
    const jieQi = JieQiService.getSolarTerm(
      solarYear,
      solarMonth,
      solarDay,
      trueSolar.adjustedHour,
      trueSolar.adjustedMinute,
    );

    const pad = (n: number) => n.toString().padStart(2, '0');

    return {
      solarDate: `${solarYear}-${pad(solarMonth)}-${pad(solarDay)}`,
      solarTime: trueSolar.clockTime,
      trueSolarTime: trueSolar.trueSolarTime,
      lunarYear: lunar.lunarYear,
      lunarMonth: lunar.lunarMonth,
      lunarDay: lunar.lunarDay,
      lunarMonthName: lunar.lunarMonthName,
      lunarDayName: lunar.lunarDayName,
      isLeapMonth: lunar.isLeapMonth,
      hourBranch: lunar.hourBranch,
      jieQi,
    };
  }
}
