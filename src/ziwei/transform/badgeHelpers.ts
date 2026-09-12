/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PalaceInfo } from '../types/palace';
import { ChartJson } from '../types/chart';
import { PALACE_NAMES, HeavenlyStem } from '../types/constants';
import { FOUR_TRANSFORM_RULES } from './fourTransformRules';

export interface TransformBadge {
  star: string;
  type: '祿' | '權' | '科' | '忌';
  tier: 'birth' | 'majorLimit' | 'annual';
  tierName: string;
  label: string; // e.g. '本祿', '大權', '年忌'
  sourceGan: string;
  badgeClass: string;
}

export interface OverlayPalaceInfo {
  majorPalaceFullName: string;
  majorPalaceShort: string;
  isMajorMing: boolean;
  annualPalaceFullName: string;
  annualPalaceShort: string;
  isAnnualMing: boolean;
}

export function computeOverlayPalaceNames(
  chart: ChartJson,
  palace: PalaceInfo,
  selectedMajorLimitIndex: number,
  selectedAnnualYear?: number,
): OverlayPalaceInfo {
  const activeMajorLimit =
    chart.majorLimits.find((m) => m.index === selectedMajorLimitIndex) || chart.majorLimits[0];
  const activeAnnual =
    chart.annualCharts.find((a) => a.year === selectedAnnualYear) || chart.annualCharts[0];

  const mlMingPalace = chart.palaces.find((p) => p.branch === activeMajorLimit?.branch);
  const mlMingIdx = mlMingPalace ? chart.palaces.indexOf(mlMingPalace) : 0;

  const annualMingPalace = chart.palaces.find((p) => p.branch === activeAnnual?.annualMingBranch);
  const annualMingIdx = annualMingPalace ? chart.palaces.indexOf(annualMingPalace) : 0;

  const pIdx = chart.palaces.indexOf(palace);

  // 大限十二宮（逆布）
  const diffMl = (pIdx - mlMingIdx + 12) % 12;
  const majorPalaceFullName = PALACE_NAMES[diffMl];
  const majorPalaceShort = '大' + majorPalaceFullName.replace('宮', '');
  const isMajorMing = diffMl === 0;

  // 流年十二宮（逆布）
  const diffAnnual = (pIdx - annualMingIdx + 12) % 12;
  const annualPalaceFullName = PALACE_NAMES[diffAnnual];
  const annualPalaceShort = '年' + annualPalaceFullName.replace('宮', '');
  const isAnnualMing = diffAnnual === 0;

  return {
    majorPalaceFullName,
    majorPalaceShort,
    isMajorMing,
    annualPalaceFullName,
    annualPalaceShort,
    isAnnualMing,
  };
}

export function computePalaceTransforms(
  chart: ChartJson,
  palace: PalaceInfo,
  selectedMajorLimitIndex: number,
  selectedAnnualYear?: number,
): TransformBadge[] {
  const list: TransformBadge[] = [];
  const types: Array<'祿' | '權' | '科' | '忌'> = ['祿', '權', '科', '忌'];

  const birthYearGan = chart.ganzhi.yearGanZhi.gan;
  const activeMajorLimit =
    chart.majorLimits.find((m) => m.index === selectedMajorLimitIndex) || chart.majorLimits[0];
  const activeAnnual =
    chart.annualCharts.find((a) => a.year === selectedAnnualYear) || chart.annualCharts[0];

  const majorLimitStem = (activeMajorLimit?.stem || birthYearGan) as HeavenlyStem;
  const annualYearGan = (activeAnnual?.yearGan || birthYearGan) as HeavenlyStem;

  const checkStarInPalace = (starName: string) => {
    return (
      palace.mainStars.some((s) => s.name === starName) ||
      palace.auxiliaryStars.some((s) => s.name === starName) ||
      palace.maleficStars.some((s) => s.name === starName)
    );
  };

  // 1. 本命四化
  const birthRules = FOUR_TRANSFORM_RULES[birthYearGan];
  if (birthRules) {
    for (const type of types) {
      const star = birthRules[type];
      if (checkStarInPalace(star)) {
        let badgeClass = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50';
        if (type === '權') badgeClass = 'bg-rose-500/20 text-rose-300 border-rose-500/50';
        if (type === '科') badgeClass = 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50';
        if (type === '忌') badgeClass = 'bg-purple-500/20 text-purple-300 border-purple-500/50';

        list.push({
          star,
          type,
          tier: 'birth',
          tierName: '本命',
          label: `本${type}`,
          sourceGan: birthYearGan,
          badgeClass,
        });
      }
    }
  }

  // 2. 大運（大限）四化
  const majorRules = FOUR_TRANSFORM_RULES[majorLimitStem];
  if (majorRules) {
    for (const type of types) {
      const star = majorRules[type];
      if (checkStarInPalace(star)) {
        let badgeClass = 'bg-emerald-950/90 text-emerald-300 border border-purple-500/70 shadow-xs';
        if (type === '權') badgeClass = 'bg-rose-950/90 text-rose-300 border border-purple-500/70 shadow-xs';
        if (type === '科') badgeClass = 'bg-cyan-950/90 text-cyan-300 border border-purple-500/70 shadow-xs';
        if (type === '忌') badgeClass = 'bg-purple-900/90 text-purple-200 border-2 border-purple-400 font-bold shadow-xs';

        list.push({
          star,
          type,
          tier: 'majorLimit',
          tierName: '大運',
          label: `大${type}`,
          sourceGan: majorLimitStem,
          badgeClass,
        });
      }
    }
  }

  // 3. 流年四化
  const annualRules = FOUR_TRANSFORM_RULES[annualYearGan];
  if (annualRules) {
    for (const type of types) {
      const star = annualRules[type];
      if (checkStarInPalace(star)) {
        let badgeClass = 'bg-emerald-950/90 text-emerald-300 border border-cyan-500/70 shadow-xs';
        if (type === '權') badgeClass = 'bg-rose-950/90 text-rose-300 border border-cyan-500/70 shadow-xs';
        if (type === '科') badgeClass = 'bg-cyan-950/90 text-cyan-300 border border-cyan-500/70 shadow-xs';
        if (type === '忌') badgeClass = 'bg-rose-900/90 text-rose-200 border-2 border-rose-400 font-bold shadow-xs';

        list.push({
          star,
          type,
          tier: 'annual',
          tierName: '流年',
          label: `年${type}`,
          sourceGan: annualYearGan,
          badgeClass,
        });
      }
    }
  }

  return list;
}

export function computeStarTransforms(
  chart: ChartJson,
  starName: string,
  selectedMajorLimitIndex: number,
  selectedAnnualYear?: number,
): TransformBadge[] {
  const list: TransformBadge[] = [];
  const types: Array<'祿' | '權' | '科' | '忌'> = ['祿', '權', '科', '忌'];

  const birthYearGan = chart.ganzhi.yearGanZhi.gan;
  const activeMajorLimit =
    chart.majorLimits.find((m) => m.index === selectedMajorLimitIndex) || chart.majorLimits[0];
  const activeAnnual =
    chart.annualCharts.find((a) => a.year === selectedAnnualYear) || chart.annualCharts[0];

  const majorLimitStem = (activeMajorLimit?.stem || birthYearGan) as HeavenlyStem;
  const annualYearGan = (activeAnnual?.yearGan || birthYearGan) as HeavenlyStem;

  // 本命
  const bRules = FOUR_TRANSFORM_RULES[birthYearGan];
  if (bRules) {
    for (const type of types) {
      if (bRules[type] === starName) {
        let badgeClass = 'bg-emerald-500/30 text-emerald-300 border-emerald-500/60';
        if (type === '權') badgeClass = 'bg-rose-500/30 text-rose-300 border-rose-500/60';
        if (type === '科') badgeClass = 'bg-cyan-500/30 text-cyan-300 border-cyan-500/60';
        if (type === '忌') badgeClass = 'bg-purple-500/30 text-purple-300 border-purple-500/60';
        list.push({ star: starName, type, tier: 'birth', tierName: '本命', label: `本${type}`, sourceGan: birthYearGan, badgeClass });
      }
    }
  }

  // 大運
  const mRules = FOUR_TRANSFORM_RULES[majorLimitStem];
  if (mRules) {
    for (const type of types) {
      if (mRules[type] === starName) {
        let badgeClass = 'bg-purple-950 text-purple-300 border border-purple-500';
        if (type === '忌') badgeClass = 'bg-purple-900 text-purple-100 border-2 border-purple-400 font-bold';
        list.push({ star: starName, type, tier: 'majorLimit', tierName: '大運', label: `大${type}`, sourceGan: majorLimitStem, badgeClass });
      }
    }
  }

  // 流年
  const aRules = FOUR_TRANSFORM_RULES[annualYearGan];
  if (aRules) {
    for (const type of types) {
      if (aRules[type] === starName) {
        let badgeClass = 'bg-cyan-950 text-cyan-300 border border-cyan-500';
        if (type === '忌') badgeClass = 'bg-rose-900 text-rose-100 border-2 border-rose-400 font-bold';
        list.push({ star: starName, type, tier: 'annual', tierName: '流年', label: `年${type}`, sourceGan: annualYearGan, badgeClass });
      }
    }
  }

  return list;
}
