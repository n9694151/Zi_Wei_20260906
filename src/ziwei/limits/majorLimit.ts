/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HeavenlyStem, Gender, WuxingJu } from '../types/constants';
import { MajorLimit } from '../types/limit';
import { PalaceInfo } from '../types/palace';

const JU_TO_START_AGE: Record<WuxingJu, number> = {
  '水二局': 2,
  '木三局': 3,
  '金四局': 4,
  '土五局': 5,
  '火六局': 6,
};

export class MajorLimitEngine {
  /**
   * Calculates 12 Major Limits (大限) for the chart.
   * Direction rules:
   * 陽男陰女順行 (Clockwise: 命宮 -> 父母宮 -> 福德宮 -> ...)
   * 陰男陽女逆行 (Counter-Clockwise: 命宮 -> 兄弟宮 -> 夫妻宮 -> ...)
   *
   * 陽干: 甲, 丙, 戊, 庚, 壬
   * 陰干: 乙, 丁, 己, 辛, 癸
   */
  public static calculate(
    yearGan: HeavenlyStem,
    gender: Gender,
    wuxingJu: WuxingJu,
    palaces: PalaceInfo[],
  ): MajorLimit[] {
    const isYangGan = ['甲', '丙', '戊', '庚', '壬'].includes(yearGan);
    const isMale = gender === 'male' || gender === '男' || gender === '陽男' || gender === '陰男';
    const isYang = (isMale && isYangGan) || (!isMale && !isYangGan);
    const direction = isYang ? 'clockwise' : 'counterClockwise';

    const startAge = JU_TO_START_AGE[wuxingJu];
    const limits: MajorLimit[] = [];

    // Find Ming Gong index in the palaces array
    const mingIdx = palaces.findIndex((p) => p.isMingGong);
    const totalPalaces = palaces.length; // 12

    for (let i = 0; i < 12; i++) {
      const curStart = startAge + i * 10;
      const curEnd = curStart + 9;

      let targetPalaceIdx: number;
      if (isYang) {
        // Clockwise in palaces:
        // Index 0: 命宮, Index 11: 父母宮, Index 10: 福德宮, Index 9: 田宅宮...
        targetPalaceIdx = (mingIdx - i + 120) % totalPalaces;
      } else {
        // Counter-clockwise in palaces:
        // Index 0: 命宮, Index 1: 兄弟宮, Index 2: 夫妻宮, Index 3: 子女宮...
        targetPalaceIdx = (mingIdx + i) % totalPalaces;
      }

      const p = palaces[targetPalaceIdx];
      const limitItem: MajorLimit = {
        index: i + 1,
        startAge: curStart,
        endAge: curEnd,
        palace: p.name,
        branch: p.branch,
        stem: p.stem,
        direction,
      };

      limits.push(limitItem);

      // Attach major limit age info to palace
      if (!p.majorLimit) {
        p.majorLimit = {
          startAge: curStart,
          endAge: curEnd,
        };
      }
    }

    return limits;
  }
}
