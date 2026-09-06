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
import { AuxiliaryStarInfo, ExtStarInfo } from '../types/star';
import { PalaceInfo } from '../types/palace';

export class AuxiliaryStarEngine {
  /**
   * Places 8 primary lucky stars: 左輔, 右弼, 文昌, 文曲, 天魁, 天鉞, 祿存, 天馬
   * and extended auspicious stars: 紅鸞, 天喜, 龍池, 鳳閣, 三台, 八座, 恩光, 天貴, 台輔, 封誥
   */
  public static calculate(
    yearGan: HeavenlyStem,
    yearZhi: EarthlyBranch,
    lunarMonth: number,
    lunarDay: number,
    hourBranch: EarthlyBranch,
    palaces: PalaceInfo[],
  ): { auxiliaryStars: AuxiliaryStarInfo[]; extendedStars: ExtStarInfo[] } {
    const branchToPalaceMap = new Map<EarthlyBranch, PalaceName>();
    palaces.forEach((p) => branchToPalaceMap.set(p.branch, p.name));

    const yZhiIdx = EARTHLY_BRANCHES.indexOf(yearZhi);
    const hBranchIdx = EARTHLY_BRANCHES.indexOf(hourBranch);

    // 1. 左輔: 辰宮起正月，順數至生月
    const zuofuIdx = (4 + (lunarMonth - 1)) % 12;
    // 2. 右弼: 戌宮起正月，逆數至生月
    const youbiIdx = (10 - (lunarMonth - 1) + 120) % 12;

    // 3. 文昌: 戌宮起子時，逆數至生時
    const wenchangIdx = (10 - hBranchIdx + 120) % 12;
    // 4. 文曲: 辰宮起子時，順數至生時
    const wenquIdx = (4 + hBranchIdx) % 12;

    // 5. 天魁 & 天鉞:
    let tiankuiIdx = 1;
    let tianyueIdx = 7;
    switch (yearGan) {
      case '甲':
      case '戊':
      case '庚':
        tiankuiIdx = 1; // 丑
        tianyueIdx = 7; // 未
        break;
      case '乙':
      case '己':
        tiankuiIdx = 0; // 子
        tianyueIdx = 8; // 申
        break;
      case '丙':
      case '丁':
        tiankuiIdx = 11; // 亥
        tianyueIdx = 9; // 酉
        break;
      case '壬':
      case '癸':
        tiankuiIdx = 3; // 卯
        tianyueIdx = 5; // 巳
        break;
      case '辛':
        tiankuiIdx = 6; // 午
        tianyueIdx = 2; // 寅
        break;
    }

    // 6. 祿存:
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

    // 7. 天馬: 申子辰在寅, 寅午戌在申, 巳酉丑在亥, 亥卯未在巳
    let tianmaIdx = 8; // 申
    if (['申', '子', '辰'].includes(yearZhi)) tianmaIdx = 2; // 寅
    else if (['寅', '午', '戌'].includes(yearZhi)) tianmaIdx = 8; // 申
    else if (['巳', '酉', '丑'].includes(yearZhi)) tianmaIdx = 11; // 亥
    else if (['亥', '卯', '未'].includes(yearZhi)) tianmaIdx = 5; // 巳

    const luckyList = [
      { name: '左輔', idx: zuofuIdx },
      { name: '右弼', idx: youbiIdx },
      { name: '文昌', idx: wenchangIdx },
      { name: '文曲', idx: wenquIdx },
      { name: '天魁', idx: tiankuiIdx },
      { name: '天鉞', idx: tianyueIdx },
      { name: '祿存', idx: lucunIdx },
      { name: '天馬', idx: tianmaIdx },
    ];

    const auxiliaryStars: AuxiliaryStarInfo[] = luckyList.map((item) => {
      const branch = EARTHLY_BRANCHES[item.idx];
      const palace = branchToPalaceMap.get(branch) || '命宮';
      return {
        name: item.name,
        category: 'lucky',
        palace,
        branch,
        positionIndex: item.idx,
      };
    });

    // Extended Auspicious Stars:
    // 紅鸞: 卯宮起子年，逆數至生年支
    const hongluanIdx = (3 - yZhiIdx + 120) % 12;
    // 天喜: 紅鸞對宮
    const tianxiIdx = (hongluanIdx + 6) % 12;
    // 龍池: 辰宮起子年，順數至生年支
    const longchiIdx = (4 + yZhiIdx) % 12;
    // 鳳閣: 戌宮起子年，逆數至生年支
    const fenggeIdx = (10 - yZhiIdx + 120) % 12;
    // 三台: 左輔所在宮起初一，順數至生日
    const santaiIdx = (zuofuIdx + (lunarDay - 1)) % 12;
    // 八座: 右弼所在宮起初一，逆數至生日
    const bazuoIdx = (youbiIdx - (lunarDay - 1) + 120) % 12;
    // 恩光: 文昌所在宮起初一，順數至生日減一 (文昌 + day - 2)
    const enguangIdx = (wenchangIdx + (lunarDay - 2) + 120) % 12;
    // 天貴: 文曲所在宮起初一，順數至生日減一
    const tianguiIdx = (wenquIdx + (lunarDay - 2) + 120) % 12;
    // 台輔: 午宮起子時，順數至生時
    const taifuIdx = (6 + hBranchIdx) % 12;
    // 封誥: 寅宮起子時，順數至生時
    const fenggaoIdx = (2 + hBranchIdx) % 12;

    const extList = [
      { name: '紅鸞', idx: hongluanIdx },
      { name: '天喜', idx: tianxiIdx },
      { name: '龍池', idx: longchiIdx },
      { name: '鳳閣', idx: fenggeIdx },
      { name: '三台', idx: santaiIdx },
      { name: '八座', idx: bazuoIdx },
      { name: '恩光', idx: enguangIdx },
      { name: '天貴', idx: tianguiIdx },
      { name: '台輔', idx: taifuIdx },
      { name: '封誥', idx: fenggaoIdx },
    ];

    const extendedStars: ExtStarInfo[] = extList.map((item) => {
      const branch = EARTHLY_BRANCHES[item.idx];
      const palace = branchToPalaceMap.get(branch) || '命宮';
      return {
        name: item.name,
        category: 'extended',
        palace,
        branch,
        positionIndex: item.idx,
      };
    });

    // Populate palace star lists
    for (const star of auxiliaryStars) {
      const target = palaces.find((p) => p.branch === star.branch);
      if (target) target.auxiliaryStars.push(star);
    }
    for (const star of extendedStars) {
      const target = palaces.find((p) => p.branch === star.branch);
      if (target) {
        if (!target.extendedStars) target.extendedStars = [];
        target.extendedStars.push(star);
      }
    }

    return { auxiliaryStars, extendedStars };
  }
}
