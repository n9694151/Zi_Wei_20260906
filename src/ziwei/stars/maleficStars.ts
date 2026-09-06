/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  HeavenlyStem,
  EarthlyBranch,
  EARTHLY_BRANCHES,
  PalaceName,
} from '../types/constants';
import { MaleficStarInfo } from '../types/star';
import { PalaceInfo } from '../types/palace';

export class MaleficStarEngine {
  /**
   * Calculates the 6 primary malefic stars:
   * 擎羊, 陀羅, 火星, 鈴星, 地空, 地劫
   */
  public static calculate(
    yearGan: HeavenlyStem,
    yearZhi: EarthlyBranch,
    hourBranch: EarthlyBranch,
    palaces: PalaceInfo[],
  ): MaleficStarInfo[] {
    const branchToPalaceMap = new Map<EarthlyBranch, PalaceName>();
    palaces.forEach((p) => branchToPalaceMap.set(p.branch, p.name));

    const hBranchIdx = EARTHLY_BRANCHES.indexOf(hourBranch);

    // 1. 祿存位置 (0-indexed branch)
    let lucunIdx = 2; // 寅
    switch (yearGan) {
      case '甲': lucunIdx = 2; break; // 寅
      case '乙': lucunIdx = 3; break; // 卯
      case '丙':
      case '戊': lucunIdx = 5; break; // 巳
      case '丁':
      case '己': lucunIdx = 6; break; // 午
      case '庚': lucunIdx = 8; break; // 申
      case '辛': lucunIdx = 9; break; // 酉
      case '壬': lucunIdx = 11; break; // 亥
      case '癸': lucunIdx = 0; break; // 子
    }

    // 擎羊: 祿存前一位 (順時針一格)
    const qingyangIdx = (lucunIdx + 1) % 12;
    // 陀羅: 祿存後一位 (逆時針一格)
    const tuoluoIdx = (lucunIdx - 1 + 12) % 12;

    // 2. 地空 & 地劫: 亥宮起子時
    // 地空: 逆數至生時
    const dikongIdx = (11 - hBranchIdx + 120) % 12;
    // 地劫: 順數至生時
    const dijieIdx = (11 + hBranchIdx) % 12;

    // 3. 火星 & 鈴星:
    let huoxingStart = 2; // 寅
    let lingxingStart = 10; // 戌

    if (['申', '子', '辰'].includes(yearZhi)) {
      huoxingStart = 2; // 寅
      lingxingStart = 10; // 戌
    } else if (['寅', '午', '戌'].includes(yearZhi)) {
      huoxingStart = 1; // 丑
      lingxingStart = 3; // 卯
    } else if (['巳', '酉', '丑'].includes(yearZhi)) {
      huoxingStart = 3; // 卯
      lingxingStart = 10; // 戌
    } else if (['亥', '卯', '未'].includes(yearZhi)) {
      huoxingStart = 9; // 酉
      lingxingStart = 10; // 戌
    }

    const huoxingIdx = (huoxingStart + hBranchIdx) % 12;
    const lingxingIdx = (lingxingStart + hBranchIdx) % 12;

    const maleficList = [
      {
        name: '擎羊',
        idx: qingyangIdx,
        rule: '祿存前一位為擎羊',
      },
      {
        name: '陀羅',
        idx: tuoluoIdx,
        rule: '祿存後一位為陀羅',
      },
      {
        name: '火星',
        idx: huoxingIdx,
        rule: '寅午戌人丑宮起子時順數至生時',
      },
      {
        name: '鈴星',
        idx: lingxingIdx,
        rule: '寅午戌人卯宮起子時順數至生時',
      },
      {
        name: '地空',
        idx: dikongIdx,
        rule: '亥宮起子時逆數至生時為地空',
      },
      {
        name: '地劫',
        idx: dijieIdx,
        rule: '亥宮起子時順數至生時為地劫',
      },
    ];

    const maleficStars: MaleficStarInfo[] = maleficList.map((item) => {
      const branch = EARTHLY_BRANCHES[item.idx];
      const palace = branchToPalaceMap.get(branch) || '命宮';
      return {
        name: item.name,
        category: 'malefic',
        palace,
        branch,
        positionIndex: item.idx,
        sourceRule: item.rule,
      };
    });

    for (const star of maleficStars) {
      const target = palaces.find((p) => p.branch === star.branch);
      if (target) {
        target.maleficStars.push(star);
      }
    }

    return maleficStars;
  }
}
