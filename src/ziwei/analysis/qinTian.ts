/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChartJson } from '../types/chart';
import { QinTianAnalysisResult } from '../types/analysis';
import { FOUR_TRANSFORM_RULES } from '../transform/fourTransformRules';
import { TRANSFORM_TYPES, PalaceName } from '../types/constants';

export class QinTianAnalysisEngine {
  /**
   * Deterministic QinTian (欽天四化派) analysis.
   * Focuses on:
   * - 來因宮 (Lai Yin Gong)
   * - 生年四化質能 (祿權科忌)
   * - 宮干自化 (Self-transformation: 離心力 ↓)
   * - 對宮向心力 (Centripetal: 向心力 ↑)
   */
  public static analyze(chart: ChartJson): QinTianAnalysisResult {
    const birthYearGan = chart.ganzhi.yearGanZhi.gan;

    // 1. 來因宮 (Lai Yin Gong): Palace whose stem equals the Birth Year Stem
    const laiYinPalace = chart.palaces.find((p) => p.stem === birthYearGan);
    const laiYinName = laiYinPalace ? `${laiYinPalace.name}(${laiYinPalace.stem}${laiYinPalace.branch})` : '命宮';

    // 2. 生年四化
    const shengNianSiHua = chart.fourTransformations.map((t) => ({
      star: t.star,
      type: t.type,
      palace: t.palace,
    }));

    // 3. 宮干自化與向心力
    const gongGanSiHua: Array<{
      palace: PalaceName;
      stem: string;
      transforms: Array<{ star: string; type: string }>;
    }> = [];

    const selfTransforms: Array<{
      palace: PalaceName;
      star: string;
      type: string;
      direction: 'centripetal' | 'centrifugal';
    }> = [];

    const flyingInOutSummary: string[] = [];
    flyingInOutSummary.push(`【來因宮】立於：${laiYinName}。此為前世造化因緣之寄宿，主一生事業、吉凶禍福之發動點。`);

    for (const p of chart.palaces) {
      const stemRules = FOUR_TRANSFORM_RULES[p.stem];
      if (!stemRules) continue;

      const pTransforms: Array<{ star: string; type: string }> = [];

      for (const type of TRANSFORM_TYPES) {
        const star = stemRules[type];
        pTransforms.push({ star, type });

        // Check if star sits inside this palace (自化 = 離心力)
        const isStarInThisPalace =
          p.mainStars.some((s) => s.name === star) ||
          p.auxiliaryStars.some((s) => s.name === star) ||
          p.maleficStars.some((s) => s.name === star);

        if (isStarInThisPalace) {
          selfTransforms.push({
            palace: p.name,
            star,
            type,
            direction: 'centrifugal',
          });
          flyingInOutSummary.push(
            `${p.name}宮干${p.stem}引動[${star}自化${type}]（離心力↓）：能量向外散逸，顯現該宮位事物隨時間容易釋放或變動。`,
          );
        }

        // Check opposite palace (向心力)
        const oppositePalace = chart.palaces.find((other) => other.branch === p.relationships.opposite);
        if (oppositePalace) {
          const oppStemRules = FOUR_TRANSFORM_RULES[oppositePalace.stem];
          if (oppStemRules && oppStemRules[type] === star && isStarInThisPalace) {
            selfTransforms.push({
              palace: p.name,
              star,
              type,
              direction: 'centripetal',
            });
            flyingInOutSummary.push(
              `${oppositePalace.name}向${p.name}化入[${star}${type}]（向心力↑）：對宮引力聚入本宮，具強大凝聚與受動磁場。`,
            );
          }
        }
      }

      gongGanSiHua.push({
        palace: p.name,
        stem: p.stem,
        transforms: pTransforms,
      });
    }

    return {
      school: 'qinTian',
      shengNianSiHua,
      gongGanSiHua,
      selfTransforms,
      flyingInOutSummary,
    };
  }
}
