/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HeavenlyStem, EarthlyBranch, PalaceName } from './constants';
import { TransformItem } from './transformation';

export interface MajorLimit {
  index: number;
  startAge: number;
  endAge: number;
  palace: PalaceName;
  branch: EarthlyBranch;
  stem: HeavenlyStem;
  direction: 'clockwise' | 'counterClockwise'; // 順行 / 逆行
}

export interface MinorLimit {
  age: number;
  palace: PalaceName;
  branch: EarthlyBranch;
}

export interface AnnualChart {
  year: number; // e.g. 2031
  age: number; // 虛歲 e.g. 6
  yearGan: HeavenlyStem;
  yearZhi: EarthlyBranch;
  annualMingBranch: EarthlyBranch;
  annualMingPalace: PalaceName;
  annualTransformations: TransformItem[];
}

export interface MonthlyLimit {
  month: number; // 1 to 12
  monthGan: HeavenlyStem;
  monthZhi: EarthlyBranch;
  palace: PalaceName;
  branch: EarthlyBranch;
}

export interface DailyLimit {
  day: number;
  ganzhi: string;
  palace: PalaceName;
  branch: EarthlyBranch;
  status: 'NOT_IMPLEMENTED';
}
