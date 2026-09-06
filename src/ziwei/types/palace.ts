/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HeavenlyStem, EarthlyBranch, PalaceName } from './constants';
import { MainStarInfo, AuxiliaryStarInfo, MaleficStarInfo, ExtStarInfo } from './star';
import { TransformItem } from './transformation';

export interface PalaceRelationship {
  opposite: EarthlyBranch; // 對宮
  trine1: EarthlyBranch; // 三合一
  trine2: EarthlyBranch; // 三合二
  sandwich1: EarthlyBranch; // 夾宮前
  sandwich2: EarthlyBranch; // 夾宮後
}

export interface SanFangSiZheng {
  palace: PalaceName;
  branch: EarthlyBranch;
  stem: HeavenlyStem;
  opposite: {
    palace: PalaceName;
    branch: EarthlyBranch;
    stem: HeavenlyStem;
  };
  trine: Array<{
    palace: PalaceName;
    branch: EarthlyBranch;
    stem: HeavenlyStem;
  }>;
}

export interface PalaceInfo {
  index: number; // 0 to 11
  name: PalaceName;
  branch: EarthlyBranch;
  stem: HeavenlyStem;
  isMingGong: boolean;
  isShenGong: boolean;
  relationships: PalaceRelationship;
  mainStars: MainStarInfo[];
  auxiliaryStars: AuxiliaryStarInfo[];
  maleficStars: MaleficStarInfo[];
  extendedStars?: ExtStarInfo[];
  transformations: TransformItem[];
  selfTransformations?: Array<{
    star: string;
    type: string;
    direction: 'centripetal' | 'centrifugal'; // 向心 ↑ 或 離心 ↓
  }>;
  majorLimit?: {
    startAge: number;
    endAge: number;
  };
}
