/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChartJson } from '../types/chart';
import { HeLuoAnalysisResult } from '../types/analysis';
import { PALACE_NAMES, PalaceName } from '../types/constants';

export class HeLuoAnalysisEngine {
  /**
   * Deterministic HeLuo (河洛派) mathematical structure analysis.
   * Based on Hetu / Luoshu numbers and Wuxing elemental interactions.
   */
  public static analyze(chart: ChartJson): HeLuoAnalysisResult {
    // 1: 命宮, 2: 兄弟, 3: 夫妻, 4: 子女, 5: 財帛, 6: 疾厄,
    // 7: 遷移, 8: 交友, 9: 官祿, 10: 田宅, 11: 福德, 12: 父母
    const palaceNumbers: Array<{ palace: PalaceName; number: number; relation: string }> = [];

    const heLuoRelations: Record<number, string> = {
      1: '一六共宗（命疾為體用一體，主先天身心元神）',
      2: '二七同道（兄遷同道，主人際走動與同儕流動）',
      3: '三八為朋（夫僕為朋，主配偶與廣大緣分之互動）',
      4: '四九為友（子官為友，主子息與事業格局之互涉）',
      5: '五十同途（財田同途，主現金財帛與不動產庫位之聚散）',
      6: '一六共宗之歸藏（疾厄為命宮之體，深層潛意識與身心底蘊）',
      7: '二七同道之發散（遷移為外在展現，社會舞台與外在吉凶）',
      8: '三八為朋之聚散（交友僕役為眾生緣，人脈資源庫）',
      9: '四九為友之顯揚（官祿為事業之顯，行事作風與氣數氣魄）',
      10: '五十同途之歸宿（田宅為財庫總匯，家庭根基與祖產祖業）',
      11: '先天一氣（福德為因果造化、精神福報源泉）',
      12: '乾坤父母（父母為相貌宮、基因遺傳與文書光明體）',
    };

    PALACE_NAMES.forEach((name, idx) => {
      const num = idx + 1;
      palaceNumbers.push({
        palace: name,
        number: num,
        relation: heLuoRelations[num] || '',
      });
    });

    const wuxingJu = chart.wuxingJu.wuxingJu;
    const wuxingElement = chart.wuxingJu.wuxingElement;

    const heLuoStructure = `本命為【${wuxingJu}】（${wuxingElement}局），以河圖數理觀之，五行局定命造之氣數深度。一六共宗(命宮-疾厄宮)主先天精氣神；五十同途(財帛宮-田宅宮)鎖定財源與庫存之共振。納音五行與本宮天干五行相輔相成，奠定河洛體用之機軸。`;

    return {
      school: 'heLuo',
      wuxingJu,
      wuxingElement,
      palaceNumbers,
      mingGua: `河圖洛書體用數：${chart.wuxingJu.ziweiStartingAge}數起運`,
      heLuoStructure,
    };
  }
}
