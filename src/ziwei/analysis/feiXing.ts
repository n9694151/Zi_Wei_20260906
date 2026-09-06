/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChartJson } from '../types/chart';
import { FeiXingAnalysisResult } from '../types/analysis';
import { FlyingTransformation } from '../types/transformation';
import { FOUR_TRANSFORM_RULES } from '../transform/fourTransformRules';
import { TRANSFORM_TYPES } from '../types/constants';

export class FeiXingAnalysisEngine {
  /**
   * Deterministic FeiXing (飛星派) palace flight and self-transformation analysis.
   */
  public static analyze(chart: ChartJson): FeiXingAnalysisResult {
    const palaceStems: Record<string, string> = {};
    const flyingTransforms: FlyingTransformation[] = [];

    // Map star name to its residence palace
    const starToPalaceMap = new Map<string, { palaceName: string; branch: any }>();
    for (const p of chart.palaces) {
      palaceStems[p.name] = p.stem;
      for (const s of p.mainStars) {
        starToPalaceMap.set(s.name, { palaceName: p.name, branch: p.branch });
      }
      for (const s of p.auxiliaryStars) {
        starToPalaceMap.set(s.name, { palaceName: p.name, branch: p.branch });
      }
      for (const s of p.maleficStars) {
        starToPalaceMap.set(s.name, { palaceName: p.name, branch: p.branch });
      }
    }

    // Compute 12 Palace Stems Flying Transformations
    for (const p of chart.palaces) {
      const stemRules = FOUR_TRANSFORM_RULES[p.stem];
      if (!stemRules) continue;

      for (const type of TRANSFORM_TYPES) {
        const star = stemRules[type];
        const target = starToPalaceMap.get(star);
        if (!target) continue;

        let direction: FlyingTransformation['direction'] = 'incoming';
        if (target.palaceName === p.name) {
          direction = 'selfTransform';
        } else if (p.relationships.opposite === target.branch) {
          direction = 'outgoing';
        }

        flyingTransforms.push({
          sourcePalace: p.name,
          sourceGan: p.stem,
          targetPalace: target.palaceName as any,
          targetBranch: target.branch,
          star,
          type,
          direction,
        });
      }
    }

    // Summarize Birth Transforms
    const birthTransforms = chart.fourTransformations.map(
      (t) => `生年${t.type}在${t.palace}(${t.branch})，化於[${t.star}]`,
    );

    // Ming Palace Flight Summary
    const mingFlies = flyingTransforms.filter((f) => f.sourcePalace === '命宮');
    const mingLu = mingFlies.find((f) => f.type === '祿');
    const mingJi = mingFlies.find((f) => f.type === '忌');

    const majorLimitInfluence = `命宮(${palaceStems['命宮']})化祿入[${mingLu?.targetPalace || '本宮'}]，化忌入[${mingJi?.targetPalace || '本宮'}]。主性格動力傾向於${mingLu?.targetPalace}，而牽掛與壓力核心在於${mingJi?.targetPalace}。`;

    return {
      school: 'feiXing',
      birthTransforms,
      palaceStems,
      flyingTransforms,
      majorLimitInfluence,
      annualInfluence: '流年行至不同地支時，將觸動本命宮干與大限宮干之飛星連鎖引動。',
    };
  }
}
