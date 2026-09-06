/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { EarthlyBranch, EARTHLY_BRANCHES } from '../types/constants';

export interface MingShenResult {
  mingGongBranch: EarthlyBranch;
  mingGongBranchIndex: number; // 0 (子) to 11 (亥)
  shenGongBranch: EarthlyBranch;
  shenGongBranchIndex: number; // 0 (子) to 11 (亥)
}

/**
 * MingGongEngine:
 * Algorithm:
 * 「寅上起正月，順數至生月；生月起子時，逆數至生時安命宮。」
 * 1. 寅 (Branch index 2) 為起點，順數至農曆出生月份 (lunarMonth - 1)。
 *    Month Branch = (2 + (lunarMonth - 1)) % 12
 * 2. 在該月份地支上起子時，逆數至出生時辰地支 (hourBranchIndex)。
 *    Ming Gong Branch Index = (Month Branch - hourBranchIndex + 12) % 12
 */
export class MingGongEngine {
  public static calculate(lunarMonth: number, hourBranch: EarthlyBranch): { branch: EarthlyBranch; branchIndex: number } {
    const hourBranchIndex = EARTHLY_BRANCHES.indexOf(hourBranch);
    const monthBranchIndex = (2 + (lunarMonth - 1)) % 12;
    const mingGongBranchIndex = (monthBranchIndex - hourBranchIndex + 12) % 12;

    return {
      branch: EARTHLY_BRANCHES[mingGongBranchIndex],
      branchIndex: mingGongBranchIndex,
    };
  }
}

/**
 * ShenGongEngine:
 * Algorithm:
 * 「寅上起正月，順數至生月；生月起子時，順數至生時安身宮。」
 * 1. 寅 (Branch index 2) 為起點，順數至農曆出生月份 (lunarMonth - 1)。
 *    Month Branch = (2 + (lunarMonth - 1)) % 12
 * 2. 在該月份地支上起子時，順數至出生時辰地支 (hourBranchIndex)。
 *    Shen Gong Branch Index = (Month Branch + hourBranchIndex) % 12
 */
export class ShenGongEngine {
  public static calculate(lunarMonth: number, hourBranch: EarthlyBranch): { branch: EarthlyBranch; branchIndex: number } {
    const hourBranchIndex = EARTHLY_BRANCHES.indexOf(hourBranch);
    const monthBranchIndex = (2 + (lunarMonth - 1)) % 12;
    const shenGongBranchIndex = (monthBranchIndex + hourBranchIndex) % 12;

    return {
      branch: EARTHLY_BRANCHES[shenGongBranchIndex],
      branchIndex: shenGongBranchIndex,
    };
  }
}

export class MingShenEngine {
  public static calculate(lunarMonth: number, hourBranch: EarthlyBranch): MingShenResult {
    const ming = MingGongEngine.calculate(lunarMonth, hourBranch);
    const shen = ShenGongEngine.calculate(lunarMonth, hourBranch);

    return {
      mingGongBranch: ming.branch,
      mingGongBranchIndex: ming.branchIndex,
      shenGongBranch: shen.branch,
      shenGongBranchIndex: shen.branchIndex,
    };
  }
}
