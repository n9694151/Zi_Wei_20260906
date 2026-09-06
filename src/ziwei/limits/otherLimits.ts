/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MinorLimit, MonthlyLimit, DailyLimit } from '../types/limit';
import { EarthlyBranch, Gender, PalaceName, EARTHLY_BRANCHES } from '../types/constants';
import { PalaceInfo } from '../types/palace';

export class MinorLimitEngine {
  /**
   * Calculates Minor Limit (小限).
   * Starting branch based on Year Branch:
   * 寅午戌人在辰, 申子辰人在戌, 巳酉丑人在未, 亥卯未人在丑
   * 男順女逆 (Male clockwise, Female counter-clockwise)
   */
  public static calculate(
    yearZhi: EarthlyBranch,
    gender: Gender,
    age: number,
    palaces: PalaceInfo[],
  ): MinorLimit {
    let startBranchIdx = 4; // 辰
    if (['寅', '午', '戌'].includes(yearZhi)) startBranchIdx = 4; // 辰
    else if (['申', '子', '辰'].includes(yearZhi)) startBranchIdx = 10; // 戌
    else if (['巳', '酉', '丑'].includes(yearZhi)) startBranchIdx = 7; // 未
    else if (['亥', '卯', '未'].includes(yearZhi)) startBranchIdx = 1; // 丑

    const isClockwise = gender === 'male' || gender === '男' || gender === '陽男' || gender === '陰男';
    const ageOffset = age - 1;

    const branchIdx = isClockwise
      ? (startBranchIdx + ageOffset) % 12
      : (startBranchIdx - ageOffset + 120) % 12;

    const branch = EARTHLY_BRANCHES[branchIdx];
    const matched = palaces.find((p) => p.branch === branch);

    return {
      age,
      palace: matched ? matched.name : '命宮',
      branch,
    };
  }
}

export class MonthlyLimitEngine {
  /**
   * Monthly limit (流月).
   * Status: PARTIAL (Pending full multi-school standardization).
   */
  public static calculate(
    annualMingBranch: EarthlyBranch,
    targetMonth: number,
    palaces: PalaceInfo[],
  ): MonthlyLimit & { status: 'PARTIAL' } {
    const annualIdx = EARTHLY_BRANCHES.indexOf(annualMingBranch);
    // Standard rule: 流年命宮起正月，順數至所求流月
    const targetBranchIdx = (annualIdx + (targetMonth - 1)) % 12;
    const branch = EARTHLY_BRANCHES[targetBranchIdx];
    const matched = palaces.find((p) => p.branch === branch);

    return {
      month: targetMonth,
      monthGan: '甲',
      monthZhi: branch,
      palace: matched ? matched.name : ('命宮' as PalaceName),
      branch,
      status: 'PARTIAL',
    };
  }
}

export class DailyLimitEngine {
  /**
   * Daily limit (流日).
   * Explicitly marked NOT_IMPLEMENTED to prevent fake or unverified output.
   */
  public static calculate(day: number): DailyLimit {
    return {
      day,
      ganzhi: '',
      palace: '命宮',
      branch: '子',
      status: 'NOT_IMPLEMENTED',
    };
  }
}
