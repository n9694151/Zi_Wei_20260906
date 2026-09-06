/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChartJson } from '../types/chart';
import { PalaceName } from '../types/constants';
import { SanHeAnalysisResult } from '../types/analysis';
import { SanFangSiZhengEngine } from '../core/palaceEngine';

export class SanHeAnalysisEngine {
  /**
   * Deterministic SanHe (三合派) pattern recognition and analysis.
   */
  public static analyze(chart: ChartJson, targetPalaceName: PalaceName = '命宮'): SanHeAnalysisResult {
    const sfsz = SanFangSiZhengEngine.query(chart.palaces, targetPalaceName);

    const relatedPalaces = [
      chart.palaces.find((p) => p.name === sfsz.palace)!,
      chart.palaces.find((p) => p.name === sfsz.opposite.palace)!,
      chart.palaces.find((p) => p.name === sfsz.trine[0].palace)!,
      chart.palaces.find((p) => p.name === sfsz.trine[1].palace)!,
    ];

    const mainStarsSummary: string[] = [];
    const luckyStarsSummary: string[] = [];
    const maleficStarsSummary: string[] = [];
    const transformationsSummary: string[] = [];

    for (const p of relatedPalaces) {
      for (const s of p.mainStars) {
        mainStarsSummary.push(`${p.name}(${p.branch})坐${s.name}${s.brightness ? `[${s.brightness}]` : ''}`);
      }
      for (const s of p.auxiliaryStars) {
        luckyStarsSummary.push(`${p.name}見${s.name}`);
      }
      for (const s of p.maleficStars) {
        maleficStarsSummary.push(`${p.name}逢${s.name}`);
      }
      for (const t of p.transformations) {
        transformationsSummary.push(`${p.name}化${t.type}(${t.star})`);
      }
    }

    // Special pattern recognitions (吉格 / 凶格)
    const allLucky = relatedPalaces.flatMap((p) => p.auxiliaryStars.map((s) => s.name));
    const allMalefic = relatedPalaces.flatMap((p) => p.maleficStars.map((s) => s.name));

    const specialPatterns: string[] = [];
    if (allLucky.includes('祿存') && allLucky.includes('天馬')) {
      specialPatterns.push('三方見「祿馬交馳格」：主奔波生財，利於外地發展或經商貿易。');
    }
    if (allLucky.includes('左輔') && allLucky.includes('右弼')) {
      specialPatterns.push('三方「左右會合」：得貴人朋儕相扶，能掌權柄或得眾人推崇。');
    }
    if (allLucky.includes('文昌') && allLucky.includes('文曲')) {
      specialPatterns.push('三方「昌曲同會」：文筆才華出眾，考運考取與名聲名望顯赫。');
    }
    if (allLucky.includes('天魁') && allLucky.includes('天鉞')) {
      specialPatterns.push('三方「魁鉞同會（坐貴向貴）」：多逢長輩貴人提拔，一生遇難呈祥。');
    }
    if (allMalefic.includes('擎羊') || allMalefic.includes('陀羅')) {
      specialPatterns.push('三方逢「羊陀沖照」：行事具開拓衝勁，但須防性急衝動或筋骨受傷、波折阻礙。');
    }
    if (allMalefic.includes('火星') || allMalefic.includes('鈴星')) {
      specialPatterns.push('三方遇「火鈴加會」：激發爆發力，適合技術攻堅或突發事業，惟性格易顯躁進。');
    }
    if (allMalefic.includes('地空') || allMalefic.includes('地劫')) {
      specialPatterns.push('三方會「空劫同照」：思維天馬行空具創意哲思，財務上宜保守穩健，避免投機。');
    }

    // Career and Wealth summary
    const careerPalace = chart.palaces.find((p) => p.name === '官祿宮');
    const wealthPalace = chart.palaces.find((p) => p.name === '財帛宮');
    const careerStars = careerPalace?.mainStars.map((s) => s.name).join('、') || '借對宮';
    const wealthStars = wealthPalace?.mainStars.map((s) => s.name).join('、') || '借對宮';

    const careerAndWealthFocus = `事業宮(${careerPalace?.stem}${careerPalace?.branch})立星[${careerStars}]，財帛宮(${wealthPalace?.stem}${wealthPalace?.branch})立星[${wealthStars}]。${specialPatterns.join(' ')}`;

    return {
      school: 'sanHe',
      corePalace: targetPalaceName,
      sanFangSiZheng: {
        benGong: sfsz.palace,
        duiGong: sfsz.opposite.palace,
        trine1: sfsz.trine[0].palace,
        trine2: sfsz.trine[1].palace,
      },
      mainStarsSummary,
      luckyStarsSummary,
      maleficStarsSummary,
      transformationsSummary,
      careerAndWealthFocus,
    };
  }
}
