/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HeavenlyStem, PalaceName, TransformType, EarthlyBranch } from './constants';

export type FourTransformMethod = 'traditional' | 'sanHe' | 'feiXing' | 'heLuo' | 'qinTian';

export interface TransformItem {
  star: string;
  type: TransformType; // 祿 | 權 | 科 | 忌
  palace: PalaceName;
  branch: EarthlyBranch;
  sourceGan: HeavenlyStem;
  sourceType?: 'birth' | 'majorLimit' | 'annual' | 'palaceFly';
}

export interface FourTransformResult {
  method: FourTransformMethod;
  sourceGan: HeavenlyStem;
  transformations: TransformItem[];
}

export interface FlyingTransformation {
  sourcePalace: PalaceName;
  sourceGan: HeavenlyStem;
  targetPalace: PalaceName;
  targetBranch: EarthlyBranch;
  star: string;
  type: TransformType;
  direction: 'incoming' | 'outgoing' | 'selfTransform' | 'centripetal' | 'centrifugal';
}
