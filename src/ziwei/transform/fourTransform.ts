/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HeavenlyStem, TransformType, TRANSFORM_TYPES } from '../types/constants';
import { TransformItem, FourTransformResult, FourTransformMethod } from '../types/transformation';
import { PalaceInfo } from '../types/palace';
import { FOUR_TRANSFORM_RULES } from './fourTransformRules';

export class FourTransformEngine {
  /**
   * Calculates the Four Transformations (祿, 權, 科, 忌) for a given Heavenly Stem.
   * Matches transformed stars against palace star locations and attaches them.
   */
  public static calculate(
    sourceGan: HeavenlyStem,
    palaces: PalaceInfo[],
    method: FourTransformMethod = 'traditional',
    sourceType: 'birth' | 'majorLimit' | 'annual' | 'palaceFly' = 'birth',
  ): FourTransformResult {
    const rules = FOUR_TRANSFORM_RULES[sourceGan];
    if (!rules) {
      throw new Error(`Four transform rules not found for stem: ${sourceGan}`);
    }

    const transformations: TransformItem[] = [];

    for (const type of TRANSFORM_TYPES) {
      const starName = rules[type];

      // Find which palace contains this star (searching main, auxiliary, malefic)
      let foundPalace: PalaceInfo | undefined;
      for (const p of palaces) {
        const hasMain = p.mainStars.some((s) => s.name === starName);
        const hasAux = p.auxiliaryStars.some((s) => s.name === starName);
        const hasMal = p.maleficStars.some((s) => s.name === starName);
        if (hasMain || hasAux || hasMal) {
          foundPalace = p;
          break;
        }
      }

      const palaceName = foundPalace ? foundPalace.name : '命宮';
      const branch = foundPalace ? foundPalace.branch : '子';

      const item: TransformItem = {
        star: starName,
        type,
        palace: palaceName,
        branch,
        sourceGan,
        sourceType,
      };

      transformations.push(item);

      if (foundPalace && sourceType === 'birth') {
        foundPalace.transformations.push(item);
      }
    }

    return {
      method,
      sourceGan,
      transformations,
    };
  }
}
