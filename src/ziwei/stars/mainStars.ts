/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { EarthlyBranch, PalaceName, WuxingJu } from '../types/constants';
import { MainStarInfo, StarBrightness } from '../types/star';
import { PalaceInfo } from '../types/palace';
import { getZiweiBranch, ZiWeiStarEngine } from './ziweiSystem';
import { getTianfuBranch, TianFuStarEngine } from './tianfuSystem';

const JU_TO_NUMBER: Record<WuxingJu, number> = {
  '水二局': 2,
  '木三局': 3,
  '金四局': 4,
  '土五局': 5,
  '火六局': 6,
};

// Traditional Star Brightness Table (廟旺得利平不陷)
// Format: starName -> array of 12 branches [子, 丑, 寅, 卯, 辰, 巳, 午, 未, 申, 酉, 戌, 亥]
export const STAR_BRIGHTNESS_TABLE: Record<string, StarBrightness[]> = {
  '紫微': ['平', '廟', '廟', '旺', '得', '旺', '廟', '廟', '得', '旺', '平', '旺'],
  '天機': ['廟', '陷', '得', '旺', '平', '平', '廟', '陷', '得', '旺', '平', '平'],
  '太陽': ['陷', '陷', '旺', '廟', '旺', '旺', '廟', '得', '得', '平', '不', '陷'],
  '武曲': ['旺', '廟', '得', '利', '廟', '平', '旺', '廟', '得', '利', '廟', '平'],
  '天同': ['旺', '陷', '利', '平', '平', '廟', '陷', '陷', '旺', '平', '平', '廟'],
  '廉貞': ['平', '利', '廟', '平', '利', '陷', '平', '利', '廟', '平', '利', '陷'],
  '天府': ['廟', '廟', '廟', '得', '廟', '得', '旺', '廟', '得', '得', '廟', '得'],
  '太陰': ['廟', '廟', '陷', '陷', '陷', '陷', '陷', '得', '平', '旺', '旺', '廟'],
  '貪狼': ['旺', '廟', '平', '平', '廟', '陷', '旺', '廟', '平', '平', '廟', '陷'],
  '巨門': ['旺', '旺', '廟', '廟', '平', '平', '旺', '陷', '廟', '廟', '平', '旺'],
  '天相': ['廟', '廟', '廟', '陷', '旺', '平', '廟', '得', '廟', '陷', '旺', '平'],
  '天梁': ['廟', '旺', '廟', '廟', '旺', '陷', '廟', '旺', '陷', '得', '旺', '陷'],
  '七殺': ['旺', '廟', '廟', '陷', '廟', '平', '旺', '廟', '廟', '陷', '廟', '平'],
  '破軍': ['廟', '旺', '陷', '陷', '旺', '平', '廟', '旺', '陷', '陷', '旺', '平'],
};

export class MainStarEngine {
  /**
   * Calculates the 14 main stars and assigns them to palaces.
   */
  public static calculate(
    lunarDay: number,
    wuxingJu: WuxingJu,
    palaces: PalaceInfo[],
  ): { mainStars: MainStarInfo[]; ziweiBranch: EarthlyBranch; tianfuBranch: EarthlyBranch } {
    const juNumber = JU_TO_NUMBER[wuxingJu];
    const ziweiBranch = getZiweiBranch(lunarDay, juNumber);
    const tianfuBranch = getTianfuBranch(ziweiBranch);

    const ziweiGroup = ZiWeiStarEngine.calculate(ziweiBranch);
    const tianfuGroup = TianFuStarEngine.calculate(tianfuBranch);

    const branchToPalaceMap = new Map<EarthlyBranch, PalaceName>();
    palaces.forEach((p) => branchToPalaceMap.set(p.branch, p.name));

    const mainStars: MainStarInfo[] = [];

    // Ziwei Group
    for (const star of ziweiGroup) {
      const palace = branchToPalaceMap.get(star.branch) || '命宮';
      const brightness = STAR_BRIGHTNESS_TABLE[star.name]?.[star.branchIndex];
      const starInfo: MainStarInfo = {
        name: star.name,
        category: 'main',
        system: 'ziwei',
        palace,
        branch: star.branch,
        positionIndex: star.branchIndex,
        brightness,
      };
      mainStars.push(starInfo);

      const targetPalace = palaces.find((p) => p.branch === star.branch);
      if (targetPalace) {
        targetPalace.mainStars.push(starInfo);
      }
    }

    // Tianfu Group
    for (const star of tianfuGroup) {
      const palace = branchToPalaceMap.get(star.branch) || '命宮';
      const brightness = STAR_BRIGHTNESS_TABLE[star.name]?.[star.branchIndex];
      const starInfo: MainStarInfo = {
        name: star.name,
        category: 'main',
        system: 'tianfu',
        palace,
        branch: star.branch,
        positionIndex: star.branchIndex,
        brightness,
      };
      mainStars.push(starInfo);

      const targetPalace = palaces.find((p) => p.branch === star.branch);
      if (targetPalace) {
        targetPalace.mainStars.push(starInfo);
      }
    }

    return { mainStars, ziweiBranch, tianfuBranch };
  }
}
