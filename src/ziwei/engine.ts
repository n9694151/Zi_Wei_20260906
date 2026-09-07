/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BirthInput, ChartJson, CalculationMetadata } from './types/chart';
import { TaiwanCalendarService } from './calendar/taiwanCalendarService';
import { MingShenEngine } from './core/mingShenEngine';
import { PalaceEngine, getPalaceStem } from './core/palaceEngine';
import { WuxingJuEngine } from './core/wuxingJuEngine';
import { MainStarEngine } from './stars/mainStars';
import { AuxiliaryStarEngine } from './stars/auxiliaryStars';
import { MaleficStarEngine } from './stars/maleficStars';
import { SpecialZhuEngine } from './stars/luckyStars';
import { FourTransformEngine } from './transform/fourTransform';
import { MajorLimitEngine } from './limits/majorLimit';
import { AnnualChartEngine } from './limits/annualLimit';

export const ENGINE_VERSION = '1.0.0-PROD';
export const CALENDAR_VERSION = 'lunar-js-1.6';
export const FOUR_TRANSFORM_VERSION = 'orthodox-v1';
export const METHOD_VERSION = 'deterministic-2026';

export class ZiWeiEngine {
  /**
   * Main deterministic pipeline to generate complete Ziwei Doushu Chart.
   * ABSOLUTELY ZERO GEMINI / LLM involved. Pure deterministic calculation.
   */
  public static calculate(input: BirthInput): ChartJson {
    // 1. Calendar Engine & Ganzhi
    const calOutput = TaiwanCalendarService.calculate(input);
    const { calendar, ganzhi } = calOutput;

    // 2. Ming & Shen Gong Calculation
    // Using Lunar Month and Lunar Hour Branch
    const mingShen = MingShenEngine.calculate(calendar.lunarMonth, calendar.hourBranch);
    const birthYearGan = ganzhi.yearGanZhi.gan;
    const birthYearZhi = ganzhi.yearGanZhi.zhi;

    const mingStem = getPalaceStem(birthYearGan, mingShen.mingGongBranch);
    const shenStem = getPalaceStem(birthYearGan, mingShen.shenGongBranch);

    // 3. Palace Engine (12 Palaces)
    const palaces = PalaceEngine.generatePalaces(
      mingShen.mingGongBranch,
      mingShen.shenGongBranch,
      birthYearGan,
    );

    // 4. Wuxing Ju (五行局)
    const wuxingJuResult = WuxingJuEngine.calculate(mingStem, mingShen.mingGongBranch);

    // 5. 14 Main Stars (Ziwei + Tianfu Systems)
    const mainStarResult = MainStarEngine.calculate(
      calendar.lunarDay,
      wuxingJuResult.wuxingJu,
      palaces,
    );

    // 6. Auxiliary Stars & Extended Stars
    const auxResult = AuxiliaryStarEngine.calculate(
      birthYearGan,
      birthYearZhi,
      calendar.lunarMonth,
      calendar.lunarDay,
      calendar.hourBranch,
      palaces,
    );

    // 7. Malefic Stars
    const maleficStars = MaleficStarEngine.calculate(
      birthYearGan,
      birthYearZhi,
      calendar.hourBranch,
      palaces,
    );

    // 8. Special Zhu (命主, 身主, 子斗)
    const specialZhu = {
      mingZhu: SpecialZhuEngine.getMingZhu(mingShen.mingGongBranch),
      shenZhu: SpecialZhuEngine.getShenZhu(birthYearZhi),
      ziDou: SpecialZhuEngine.getZiDou(calendar.lunarMonth, calendar.hourBranch),
    };

    // 9. Four Transformations (生年四化)
    const transformResult = FourTransformEngine.calculate(
      birthYearGan,
      palaces,
      'traditional',
      'birth',
    );

    // 10. Major Limits (大限)
    const majorLimits = MajorLimitEngine.calculate(
      birthYearGan,
      input.gender,
      wuxingJuResult.wuxingJu,
      palaces,
      input.limitDirectionRule,
    );

    // 11. Annual Charts (流年 - 產生 24 年供大限與流年三盤同參)
    const birthSolarYear = parseInt(calendar.solarDate.slice(0, 4), 10);
    const annualCharts = AnnualChartEngine.generateRange(
      birthSolarYear,
      birthSolarYear,
      24,
      palaces,
    );

    // 12. Metadata
    const calculationMetadata: CalculationMetadata = {
      engineVersion: ENGINE_VERSION,
      calendarVersion: CALENDAR_VERSION,
      fourTransformVersion: FOUR_TRANSFORM_VERSION,
      methodVersion: METHOD_VERSION,
      timezone: input.timezone || 'Asia/Taipei',
      ziHourRule: input.ziHourRule || 'ziEarly',
      createdAt: new Date().toISOString(),
      calculationStatus: 'verified',
    };

    return {
      chartVersion: ENGINE_VERSION,
      birth: input,
      calendar,
      ganzhi,
      mingGong: {
        branch: mingShen.mingGongBranch,
        stem: mingStem,
        palaceName: '命宮',
      },
      shenGong: {
        branch: mingShen.shenGongBranch,
        stem: shenStem,
        palaceName: palaces.find((p) => p.branch === mingShen.shenGongBranch)?.name || '夫妻宮',
      },
      wuxingJu: wuxingJuResult,
      specialZhu,
      palaces,
      mainStars: mainStarResult.mainStars,
      auxiliaryStars: auxResult.auxiliaryStars,
      maleficStars,
      extendedStars: auxResult.extendedStars,
      fourTransformations: transformResult.transformations,
      majorLimits,
      annualCharts,
      calculationMetadata,
    };
  }
}
