/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { EarthlyBranch, EARTHLY_BRANCHES } from '../types/constants';

// 命主依命宮地支
const MING_ZHU_MAP: Record<EarthlyBranch, string> = {
  '子': '貪狼',
  '丑': '巨門',
  '寅': '祿存',
  '卯': '文曲',
  '辰': '廉貞',
  '巳': '武曲',
  '午': '破軍',
  '未': '武曲',
  '申': '廉貞',
  '酉': '文曲',
  '戌': '巨門',
  '亥': '貪狼',
};

// 身主依生年地支
const SHEN_ZHU_MAP: Record<EarthlyBranch, string> = {
  '子': '火星',
  '丑': '天相',
  '寅': '天梁',
  '卯': '天同',
  '辰': '文昌',
  '巳': '天機',
  '午': '火星',
  '未': '天相',
  '申': '天梁',
  '酉': '天同',
  '戌': '文昌',
  '亥': '天機',
};

export class SpecialZhuEngine {
  /**
   * Calculates 命主 (Ming Zhu) from Ming Gong Branch
   */
  public static getMingZhu(mingBranch: EarthlyBranch): string {
    return MING_ZHU_MAP[mingBranch] || '文曲';
  }

  /**
   * Calculates 身主 (Shen Zhu) from Year Branch
   */
  public static getShenZhu(yearBranch: EarthlyBranch): string {
    return SHEN_ZHU_MAP[yearBranch] || '火星';
  }

  /**
   * Calculates 子斗 (Zi Dou):
   * 從子宮起正月，逆數至生月；生月起子時，順數至生時。
   */
  public static getZiDou(lunarMonth: number, hourBranch: EarthlyBranch): EarthlyBranch {
    const hIdx = EARTHLY_BRANCHES.indexOf(hourBranch);
    // 子 is 0. 逆數至生月: - (lunarMonth - 1). 順數至生時: + hIdx.
    const idx = (0 - (lunarMonth - 1) + hIdx + 120) % 12;
    return EARTHLY_BRANCHES[idx];
  }
}
