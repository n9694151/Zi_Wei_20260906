/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { EarthlyBranch, PalaceName, TransformType } from './constants';

export type StarCategory = 'main' | 'lucky' | 'malefic' | 'extended';
export type StarBrightness = '廟' | '旺' | '得' | '利' | '平' | '不' | '陷';

export interface BaseStarInfo {
  name: string;
  category: StarCategory;
  palace: PalaceName;
  branch: EarthlyBranch;
  positionIndex: number; // 0 (子) to 11 (亥)
  brightness?: StarBrightness;
  transformation?: TransformType;
  sourceRule?: string;
}

export interface MainStarInfo extends BaseStarInfo {
  category: 'main';
  system: 'ziwei' | 'tianfu';
}

export interface AuxiliaryStarInfo extends BaseStarInfo {
  category: 'lucky';
}

export interface MaleficStarInfo extends BaseStarInfo {
  category: 'malefic';
  sourceRule: string; // e.g. "祿存前一位為擎羊"
}

export interface ExtStarInfo extends BaseStarInfo {
  category: 'extended';
}
