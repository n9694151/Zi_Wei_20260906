/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// @ts-ignore
import { Solar } from 'lunar-javascript';
import { JieQiDetails, SolarTermInfo } from '../types/chart';

export const SOLAR_TERMS_TRADITIONAL = [
  '立春', '雨水', '驚蟄', '春分', '清明', '穀雨',
  '立夏', '小滿', '芒種', '夏至', '小暑', '大暑',
  '立秋', '處暑', '白露', '秋分', '寒露', '霜降',
  '立冬', '小雪', '大雪', '冬至', '小寒', '大寒',
] as const;

export type SolarTermName = typeof SOLAR_TERMS_TRADITIONAL[number];

const SIMPLIFIED_TO_TRADITIONAL_MAP: Record<string, SolarTermName> = {
  '立春': '立春', '雨水': '雨水', '惊蛰': '驚蟄', '驚蟄': '驚蟄',
  '春分': '春分', '清明': '清明', '谷雨': '穀雨', '穀雨': '穀雨',
  '立夏': '立夏', '小满': '小滿', '小滿': '小滿', '芒种': '芒種', '芒種': '芒種',
  '夏至': '夏至', '小暑': '小暑', '大暑': '大暑',
  '立秋': '立秋', '处暑': '處暑', '處暑': '處暑', '白露': '白露',
  '秋分': '秋分', '寒露': '寒露', '霜降': '霜降',
  '立冬': '立冬', '小雪': '小雪', '大雪': '大雪',
  '冬至': '冬至', '小寒': '小寒', '大寒': '大寒',
};

// 12 'Jie' (節) that define the start of solar months (寅月 to 丑月)
// 立春(寅), 驚蟄(卯), 清明(辰), 立夏(巳), 芒種(午), 小暑(未),
// 立秋(申), 白露(酉), 寒露(戌), 立冬(亥), 大雪(子), 小寒(丑)
const JIE_TO_SOLAR_MONTH: Record<string, number> = {
  '立春': 1, '雨水': 1,
  '驚蟄': 2, '春分': 2,
  '清明': 3, '穀雨': 3,
  '立夏': 4, '小滿': 4,
  '芒種': 5, '夏至': 5,
  '小暑': 6, '大暑': 6,
  '立秋': 7, '處暑': 7,
  '白露': 8, '秋分': 8,
  '寒露': 9, '霜降': 9,
  '立冬': 10, '小雪': 10,
  '大雪': 11, '冬至': 11,
  '小寒': 12, '大寒': 12,
};

export class JieQiService {
  /**
   * Retrieves current, previous, and next solar terms and the calculated solarMonthIndex
   */
  public static getSolarTerm(year: number, month: number, day: number, hour: number, minute: number): JieQiDetails {
    const solar = Solar.fromYmdHms(year, month, day, hour, minute, 0);
    const lunar = solar.getLunar();

    const prevJieQi = lunar.getPrevJieQi();
    const nextJieQi = lunar.getNextJieQi();
    const currJieQi = lunar.getCurrentJieQi();

    const prevNameRaw = prevJieQi ? prevJieQi.getName() : '立春';
    const prevName = SIMPLIFIED_TO_TRADITIONAL_MAP[prevNameRaw] || (prevNameRaw as SolarTermName);
    const prevSolar = prevJieQi ? prevJieQi.getSolar() : solar;
    const prevTerm: SolarTermInfo = {
      name: prevName,
      solarDate: prevSolar.toYmd(),
      solarTime: prevSolar.toYmdHms().slice(11),
    };

    const nextNameRaw = nextJieQi ? nextJieQi.getName() : '雨水';
    const nextName = SIMPLIFIED_TO_TRADITIONAL_MAP[nextNameRaw] || (nextNameRaw as SolarTermName);
    const nextSolar = nextJieQi ? nextJieQi.getSolar() : solar;
    const nextTerm: SolarTermInfo = {
      name: nextName,
      solarDate: nextSolar.toYmd(),
      solarTime: nextSolar.toYmdHms().slice(11),
    };

    let currentTerm: SolarTermInfo;
    if (currJieQi) {
      const currNameRaw = currJieQi.getName();
      const currName = SIMPLIFIED_TO_TRADITIONAL_MAP[currNameRaw] || (currNameRaw as SolarTermName);
      const currSolar = currJieQi.getSolar();
      currentTerm = {
        name: currName,
        solarDate: currSolar.toYmd(),
        solarTime: currSolar.toYmdHms().slice(11),
      };
    } else {
      currentTerm = prevTerm;
    }

    const solarMonthIndex = JIE_TO_SOLAR_MONTH[prevName] || 1;

    return {
      previousTerm: prevTerm,
      currentTerm,
      nextTerm,
      solarMonthIndex,
    };
  }
}
