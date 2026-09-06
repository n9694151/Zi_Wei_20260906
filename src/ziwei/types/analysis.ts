/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChartJson } from './chart';
import { PalaceName } from './constants';
import { FlyingTransformation } from './transformation';

export type SchoolMethod = 'sanHe' | 'feiXing' | 'heLuo' | 'qinTian' | 'combined';

export interface ChartAnalysisContext {
  coreChart: ChartJson;
  method: SchoolMethod;
  targetPalace?: PalaceName;
  targetYear?: number;
  targetMajorLimitIndex?: number;
  notes?: string;
}

export interface SanHeAnalysisResult {
  school: 'sanHe';
  corePalace: PalaceName;
  sanFangSiZheng: {
    benGong: PalaceName;
    duiGong: PalaceName;
    trine1: PalaceName;
    trine2: PalaceName;
  };
  mainStarsSummary: string[];
  luckyStarsSummary: string[];
  maleficStarsSummary: string[];
  transformationsSummary: string[];
  careerAndWealthFocus: string;
}

export interface FeiXingAnalysisResult {
  school: 'feiXing';
  birthTransforms: string[];
  palaceStems: Record<string, string>;
  flyingTransforms: FlyingTransformation[];
  majorLimitInfluence?: string;
  annualInfluence?: string;
}

export interface HeLuoAnalysisResult {
  school: 'heLuo';
  wuxingJu: string;
  wuxingElement: string;
  palaceNumbers: Array<{
    palace: PalaceName;
    number: number;
    relation: string; // e.g. "一六共宗", "二七同道"
  }>;
  mingGua: string;
  heLuoStructure: string;
}

export interface QinTianAnalysisResult {
  school: 'qinTian';
  shengNianSiHua: Array<{
    star: string;
    type: string;
    palace: PalaceName;
  }>;
  gongGanSiHua: Array<{
    palace: PalaceName;
    stem: string;
    transforms: Array<{ star: string; type: string }>;
  }>;
  selfTransforms: Array<{
    palace: PalaceName;
    star: string;
    type: string;
    direction: 'centripetal' | 'centrifugal'; // 向心 ↑ 或 離心 ↓
  }>;
  flyingInOutSummary: string[];
}

export interface CombinedAnalysisResult {
  school: 'combined';
  sanHe: SanHeAnalysisResult;
  feiXing: FeiXingAnalysisResult;
  heLuo: HeLuoAnalysisResult;
  qinTian: QinTianAnalysisResult;
  commonPoints: string[];
  differences: string[];
  strongEvidence: string[];
  uncertainPoints: string[];
  finalSynthesis: string;
}
