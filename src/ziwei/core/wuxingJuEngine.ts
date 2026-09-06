/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HeavenlyStem, EarthlyBranch, WuxingJu, WuxingElement } from '../types/constants';

export interface WuxingJuResult {
  wuxingJu: WuxingJu;
  wuxingElement: WuxingElement;
  ziweiStartingAge: number; // 2, 3, 4, 5, 6
}

// 60 JiaZi to NaYin Element mapping
const NAYIN_ELEMENT_MAP: Record<string, WuxingElement> = {
  '甲子': '金', '乙丑': '金',
  '丙寅': '火', '丁卯': '火',
  '戊辰': '木', '己巳': '木',
  '庚午': '土', '辛未': '土',
  '壬申': '金', '癸酉': '金',
  '甲戌': '火', '乙亥': '火',
  '丙子': '水', '丁丑': '水',
  '戊寅': '土', '己卯': '土',
  '庚辰': '金', '辛巳': '金',
  '壬午': '木', '癸未': '木',
  '甲申': '水', '乙酉': '水',
  '丙戌': '土', '丁亥': '土',
  '戊子': '火', '己丑': '火',
  '庚寅': '木', '辛卯': '木',
  '壬辰': '水', '癸巳': '水',
  '甲午': '金', '乙未': '金',
  '丙申': '火', '丁酉': '火',
  '戊戌': '木', '己亥': '木',
  '庚子': '土', '辛丑': '土',
  '壬寅': '金', '癸卯': '金',
  '甲辰': '火', '乙巳': '火',
  '丙午': '水', '丁未': '水',
  '戊申': '土', '己酉': '土',
  '庚戌': '金', '辛亥': '金',
  '壬子': '木', '癸丑': '木',
  '甲寅': '水', '乙卯': '水',
  '丙辰': '土', '丁巳': '土',
  '戊午': '火', '己未': '火',
  '庚申': '木', '辛酉': '木',
  '壬戌': '水', '癸亥': '水',
};

const ELEMENT_TO_JU_MAP: Record<WuxingElement, { ju: WuxingJu; startAge: number }> = {
  '水': { ju: '水二局', startAge: 2 },
  '木': { ju: '木三局', startAge: 3 },
  '金': { ju: '金四局', startAge: 4 },
  '土': { ju: '土五局', startAge: 5 },
  '火': { ju: '火六局', startAge: 6 },
};

export class WuxingJuEngine {
  /**
   * Calculates Wuxing Ju from Ming Gong stem and branch using standard NaYin.
   */
  public static calculate(mingStem: HeavenlyStem, mingBranch: EarthlyBranch): WuxingJuResult {
    const gz = `${mingStem}${mingBranch}`;
    const element = NAYIN_ELEMENT_MAP[gz];
    if (!element) {
      throw new Error(`NaYin element not found for Ganzhi: ${gz}`);
    }

    const { ju, startAge } = ELEMENT_TO_JU_MAP[element];
    return {
      wuxingJu: ju,
      wuxingElement: element,
      ziweiStartingAge: startAge,
    };
  }
}
