/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  HeavenlyStem,
  EarthlyBranch,
  HEAVENLY_STEMS,
  EARTHLY_BRANCHES,
  PalaceName,
} from '../types/constants';
import { AnnualChart } from '../types/limit';
import { PalaceInfo } from '../types/palace';
import { FourTransformEngine } from '../transform/fourTransform';

export class AnnualChartEngine {
  /**
   * Calculates Annual Chart (流年) for a specific Gregorian year.
   * e.g. 2031:
   * year: 2031, age: 6, yearGan: 辛, yearZhi: 亥,
   * annualMingBranch: 亥, annualMingPalace: palace at 亥
   * annualTransformations: Four Transformations for 辛 (巨陽曲昌)
   */
  public static calculateSingleYear(
    targetYear: number,
    birthYear: number,
    palaces: PalaceInfo[],
  ): AnnualChart {
    const age = targetYear - birthYear + 1; // 虛歲

    // Year Ganzhi
    const offset = (targetYear - 4) % 60;
    const ganIdx = ((offset % 10) + 10) % 10;
    const zhiIdx = ((offset % 12) + 12) % 12;

    const yearGan = HEAVENLY_STEMS[ganIdx];
    const yearZhi = EARTHLY_BRANCHES[zhiIdx];

    // 流年命宮地支 = 流年太歲地支 (年支)
    const annualMingBranch = yearZhi;
    const matchedPalace = palaces.find((p) => p.branch === annualMingBranch);
    const annualMingPalace: PalaceName = matchedPalace ? matchedPalace.name : '命宮';

    // 流年四化
    const transformResult = FourTransformEngine.calculate(
      yearGan,
      palaces,
      'traditional',
      'annual',
    );

    return {
      year: targetYear,
      age,
      yearGan,
      yearZhi,
      annualMingBranch,
      annualMingPalace,
      annualTransformations: transformResult.transformations,
    };
  }

  /**
   * Generates a series of annual charts (e.g. from birth year to +20 years or selected window)
   */
  public static generateRange(
    birthYear: number,
    startYear: number,
    count: number,
    palaces: PalaceInfo[],
  ): AnnualChart[] {
    const charts: AnnualChart[] = [];
    for (let i = 0; i < count; i++) {
      charts.push(this.calculateSingleYear(startYear + i, birthYear, palaces));
    }
    return charts;
  }
}
