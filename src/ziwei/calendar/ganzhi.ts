/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// @ts-ignore
import { Solar } from 'lunar-javascript';
import {
  HeavenlyStem,
  EarthlyBranch,
  HEAVENLY_STEMS,
  EARTHLY_BRANCHES,
  ZiHourRule,
} from '../types/constants';
import { GanzhiRecord, GanzhiSet } from '../types/chart';

// 60 JiaZi Table
export const SIXTY_JIAZI: string[] = [];
for (let i = 0; i < 60; i++) {
  SIXTY_JIAZI.push(`${HEAVENLY_STEMS[i % 10]}${EARTHLY_BRANCHES[i % 12]}`);
}

// Reference date: 2000-01-01 UTC was 戊午 (JiaZi index 54: 戊=4, 午=6 => (4,6) = 54)
const REFERENCE_DATE_MILLIS = Date.UTC(2000, 0, 1);
const REFERENCE_JIAZI_INDEX = 54;

/**
 * Calculates Year GanZhi.
 * Explicitly separates calendar year, lunar year, and solar term (Lichun) GanZhi year.
 */
export function getYearGanZhi(
  solarYear: number,
  solarMonth: number,
  solarDay: number,
  hour: number = 12,
  minute: number = 0,
): {
  lunarYearGanzhi: GanzhiRecord;
  solarTermYearGanzhi: GanzhiRecord;
  calendarYear: number;
  lunarYear: number;
  ganZhiYear: number;
} {
  const solar = Solar.fromYmdHms(solarYear, solarMonth, solarDay, hour, minute, 0);
  const lunar = solar.getLunar();

  // Lunar-based Year GanZhi (standard for Ziwei chart star placement)
  const lYear = lunar.getYear();
  const lYearOffset = (lYear - 4) % 60;
  const lGanIdx = ((lYearOffset % 10) + 10) % 10;
  const lZhiIdx = ((lYearOffset % 12) + 12) % 12;

  const lunarYearGanzhi: GanzhiRecord = {
    gan: HEAVENLY_STEMS[lGanIdx],
    zhi: EARTHLY_BRANCHES[lZhiIdx],
    name: `${HEAVENLY_STEMS[lGanIdx]}${EARTHLY_BRANCHES[lZhiIdx]}`,
  };

  // Solar Term Lichun-based Year GanZhi
  const exactYearGz = lunar.getYearInGanZhiExact(); // Based on Lichun
  const sGan = exactYearGz[0] as HeavenlyStem;
  const sZhi = exactYearGz[1] as EarthlyBranch;
  const solarTermYearGanzhi: GanzhiRecord = {
    gan: sGan,
    zhi: sZhi,
    name: `${sGan}${sZhi}`,
  };

  return {
    lunarYearGanzhi,
    solarTermYearGanzhi,
    calendarYear: solarYear,
    lunarYear: lYear,
    ganZhiYear: lunar.getYearInGanZhiExact() ? parseInt(exactYearGz, 10) || lYear : lYear,
  };
}

/**
 * Calculates Month GanZhi based on Solar Terms (JieQi) and Year Gan using 五虎遁.
 * 寅月為正月 (Solar Month 1):
 * 甲己之年丙作首 (寅=丙)
 * 乙庚之歲戊為頭 (寅=戊)
 * 丙辛之歲尋庚上 (寅=庚)
 * 丁壬壬位順行流 (寅=壬)
 * 戊癸之年何方起，甲寅之上好追求 (寅=甲)
 */
export function getMonthGanZhi(yearGan: HeavenlyStem, solarMonthIndex: number): GanzhiRecord {
  // solarMonthIndex: 1 = 寅月, 2 = 卯月, ..., 11 = 子月, 12 = 丑月
  // Starting stem for 寅 (Tiger) month:
  let startGanIdx = 2; // Default 丙
  switch (yearGan) {
    case '甲':
    case '己':
      startGanIdx = 2; // 丙
      break;
    case '乙':
    case '庚':
      startGanIdx = 4; // 戊
      break;
    case '丙':
    case '辛':
      startGanIdx = 6; // 庚
      break;
    case '丁':
    case '壬':
      startGanIdx = 8; // 壬
      break;
    case '戊':
    case '癸':
      startGanIdx = 0; // 甲
      break;
  }

  // Calculate stem index: startGanIdx + (solarMonthIndex - 1)
  const monthGanIdx = (startGanIdx + (solarMonthIndex - 1)) % 10;
  // Branch index: 寅 is 2, 卯 is 3, ..., 丑 is 1
  const monthZhiIdx = (2 + (solarMonthIndex - 1)) % 12;

  const gan = HEAVENLY_STEMS[monthGanIdx];
  const zhi = EARTHLY_BRANCHES[monthZhiIdx];

  return {
    gan,
    zhi,
    name: `${gan}${zhi}`,
  };
}

/**
 * Calculates Day GanZhi using reference date algorithm.
 * Reference date: 2000-01-01 was 戊午 (index 54).
 * Handles ZiHourRule:
 * - "ziEarly": 23:00 - 23:59 belongs to the next day's day Ganzhi
 * - "ziLate": 23:00 - 23:59 belongs to current day's day Ganzhi
 */
export function getDayGanZhi(
  year: number,
  month: number,
  day: number,
  hour: number,
  ziHourRule: ZiHourRule = 'ziEarly',
): GanzhiRecord {
  let targetYear = year;
  let targetMonth = month;
  let targetDay = day;

  // If ziEarly and hour is 23, advance day by 1
  if (ziHourRule === 'ziEarly' && hour === 23) {
    const nextDate = new Date(Date.UTC(year, month - 1, day + 1));
    targetYear = nextDate.getUTCFullYear();
    targetMonth = nextDate.getUTCMonth() + 1;
    targetDay = nextDate.getUTCDate();
  }

  const targetUtc = Date.UTC(targetYear, targetMonth - 1, targetDay);
  const diffDays = Math.round((targetUtc - REFERENCE_DATE_MILLIS) / (1000 * 60 * 60 * 24));

  let jiaZiIdx = (REFERENCE_JIAZI_INDEX + diffDays) % 60;
  if (jiaZiIdx < 0) jiaZiIdx += 60;

  const gan = HEAVENLY_STEMS[jiaZiIdx % 10];
  const zhi = EARTHLY_BRANCHES[jiaZiIdx % 12];

  return {
    gan,
    zhi,
    name: `${gan}${zhi}`,
  };
}

/**
 * Calculates Hour GanZhi from Day Gan using 五鼠遁.
 * 甲己還加甲 (子=甲)
 * 乙庚丙作初 (子=丙)
 * 丙辛從戊起 (子=戊)
 * 丁壬庚子居 (子=庚)
 * 戊癸何方發，壬子是真途 (子=壬)
 */
export function getHourGanZhi(dayGan: HeavenlyStem, hour: number): GanzhiRecord {
  // Determine hour branch index (0=子, 1=丑, ..., 11=亥)
  const branchIdx = hour === 23 ? 0 : Math.floor((hour + 1) / 2) % 12;

  let startGanIdx = 0; // 子時 starting stem
  switch (dayGan) {
    case '甲':
    case '己':
      startGanIdx = 0; // 甲
      break;
    case '乙':
    case '庚':
      startGanIdx = 2; // 丙
      break;
    case '丙':
    case '辛':
      startGanIdx = 4; // 戊
      break;
    case '丁':
    case '壬':
      startGanIdx = 6; // 庚
      break;
    case '戊':
    case '癸':
      startGanIdx = 8; // 壬
      break;
  }

  const stemIdx = (startGanIdx + branchIdx) % 10;
  const gan = HEAVENLY_STEMS[stemIdx];
  const zhi = EARTHLY_BRANCHES[branchIdx];

  return {
    gan,
    zhi,
    name: `${gan}${zhi}`,
  };
}

/**
 * Assembles full GanzhiSet
 */
export function calculateFullGanzhi(
  solarYear: number,
  solarMonth: number,
  solarDay: number,
  adjustedHour: number,
  solarMonthIndex: number,
  ziHourRule: ZiHourRule = 'ziEarly',
): GanzhiSet {
  const yearGz = getYearGanZhi(solarYear, solarMonth, solarDay, adjustedHour, 0);
  // In Ziwei Doushu, year Gan is the birth lunar year Gan
  const birthYearGan = yearGz.lunarYearGanzhi.gan;
  const monthGz = getMonthGanZhi(birthYearGan, solarMonthIndex);
  const dayGz = getDayGanZhi(solarYear, solarMonth, solarDay, adjustedHour, ziHourRule);
  const hourGz = getHourGanZhi(dayGz.gan, adjustedHour);

  return {
    yearGanZhi: yearGz.lunarYearGanzhi,
    monthGanZhi: monthGz,
    dayGanZhi: dayGz,
    hourGanZhi: hourGz,
    calendarYear: yearGz.calendarYear,
    lunarYear: yearGz.lunarYear,
    ganZhiYear: yearGz.ganZhiYear,
  };
}
