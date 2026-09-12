/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChartJson } from '../ziwei/types/chart';
import { EarthlyBranch, PalaceName, PALACE_NAMES, HeavenlyStem } from '../ziwei/types/constants';
import { PalaceInfo } from '../ziwei/types/palace';
import { FOUR_TRANSFORM_RULES } from '../ziwei/transform/fourTransformRules';
import { Sparkles, Compass, Layers, Clock, Calendar, Share2, Grid, Columns } from 'lucide-react';
import { MobileZiweiView } from './MobileZiweiView';
import { EffectiveDevice } from '../ziwei/types/viewport';

interface ZiweiGridProps {
  chart: ChartJson;
  selectedPalaceName: PalaceName;
  onSelectPalace: (name: PalaceName) => void;
  onQuickLoadGolden: () => void;
  // 三盤合參控制（大運、流年）
  selectedMajorLimitIndex?: number;
  onSelectMajorLimitIndex?: (index: number) => void;
  selectedAnnualYear?: number;
  onSelectAnnualYear?: (year: number) => void;
  showMajorLimit?: boolean;
  onToggleShowMajorLimit?: () => void;
  showAnnual?: boolean;
  onToggleShowAnnual?: () => void;
  // 設備畫面呈現
  effectiveDevice?: EffectiveDevice;
}

// 4x4 宮位地支坐標對應表
const BRANCH_GRID_POS: Record<EarthlyBranch, { row: number; col: number }> = {
  '巳': { row: 0, col: 0 },
  '午': { row: 0, col: 1 },
  '未': { row: 0, col: 2 },
  '申': { row: 0, col: 3 },
  '辰': { row: 1, col: 0 },
  '酉': { row: 1, col: 3 },
  '卯': { row: 2, col: 0 },
  '戌': { row: 2, col: 3 },
  '寅': { row: 3, col: 0 },
  '丑': { row: 3, col: 1 },
  '子': { row: 3, col: 2 },
  '亥': { row: 3, col: 3 },
};

export interface TransformBadge {
  star: string;
  type: '祿' | '權' | '科' | '忌';
  tier: 'birth' | 'majorLimit' | 'annual';
  tierName: string;
  label: string; // e.g. '本祿', '大權', '年忌'
  sourceGan: string;
  badgeClass: string;
}

export const ZiweiGrid: React.FC<ZiweiGridProps> = ({
  chart,
  selectedPalaceName,
  onSelectPalace,
  onQuickLoadGolden,
  selectedMajorLimitIndex = 1,
  onSelectMajorLimitIndex,
  selectedAnnualYear,
  onSelectAnnualYear,
  showMajorLimit = true,
  onToggleShowMajorLimit,
  showAnnual = true,
  onToggleShowAnnual,
  effectiveDevice = 'desktop',
}) => {
  // 手機模式直接委任專屬行動端檢視
  if (effectiveDevice === 'mobile') {
    return (
      <MobileZiweiView
        chart={chart}
        selectedPalaceName={selectedPalaceName}
        onSelectPalace={onSelectPalace}
        onQuickLoadGolden={onQuickLoadGolden}
        selectedMajorLimitIndex={selectedMajorLimitIndex}
        onSelectMajorLimitIndex={onSelectMajorLimitIndex}
        selectedAnnualYear={selectedAnnualYear}
        onSelectAnnualYear={onSelectAnnualYear}
        showMajorLimit={showMajorLimit}
        onToggleShowMajorLimit={onToggleShowMajorLimit}
        showAnnual={showAnnual}
        onToggleShowAnnual={onToggleShowAnnual}
      />
    );
  }

  const [tabletViewMode, setTabletViewMode] = useState<'grid' | 'split'>('grid');
  const [showSanFangLines, setShowSanFangLines] = useState<boolean>(true);
  const [showTransforms, setShowTransforms] = useState<boolean>(true);

  const gridContainerRef = useRef<HTMLDivElement>(null);
  const [lineCoords, setLineCoords] = useState<{
    benGong: { x: number; y: number };
    duiGong: { x: number; y: number };
    trine1: { x: number; y: number };
    trine2: { x: number; y: number };
  } | null>(null);

  const selectedPalace = chart.palaces.find((p) => p.name === selectedPalaceName) || chart.palaces[0];
  const rel = selectedPalace.relationships;

  // 1. 當前選中的大限（大運）
  const activeMajorLimit =
    chart.majorLimits.find((m) => m.index === selectedMajorLimitIndex) ||
    chart.majorLimits[0];

  // 2. 當前選中的流年
  const activeAnnual =
    chart.annualCharts.find((a) => a.year === selectedAnnualYear) ||
    chart.annualCharts[0];

  // 三代四化之天干
  const birthYearGan = chart.ganzhi.yearGanZhi.gan;
  const majorLimitStem = (activeMajorLimit?.stem || birthYearGan) as HeavenlyStem;
  const annualYearGan = (activeAnnual?.yearGan || birthYearGan) as HeavenlyStem;

  // 大限命宮在 palaces 中的索引
  const mlMingPalace = chart.palaces.find((p) => p.branch === activeMajorLimit?.branch);
  const mlMingIdx = mlMingPalace ? chart.palaces.indexOf(mlMingPalace) : 0;

  // 流年命宮在 palaces 中的索引（流年太歲地支所在的宮位即為流年命宮）
  const annualMingPalace = chart.palaces.find((p) => p.branch === activeAnnual?.annualMingBranch);
  const annualMingIdx = annualMingPalace ? chart.palaces.indexOf(annualMingPalace) : 0;

  // 計算指定宮位在「大限盤」與「流年盤」上的宮位名稱（三盤疊宮）
  const getOverlayPalaceNames = (p: PalaceInfo) => {
    const pIdx = chart.palaces.indexOf(p);

    // 大限十二宮（標準逆布十二宮）
    const diffMl = (pIdx - mlMingIdx + 12) % 12;
    const majorPalaceFullName = PALACE_NAMES[diffMl];
    const majorPalaceShort = '大' + majorPalaceFullName.replace('宮', '');
    const isMajorMing = diffMl === 0;

    // 流年十二宮（標準逆布十二宮）
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
  };

  // 取得某宮位所有的「本命、大運、流年三代四化」清單
  const getPalaceTransforms = (palace: PalaceInfo): TransformBadge[] => {
    const list: TransformBadge[] = [];
    const types: Array<'祿' | '權' | '科' | '忌'> = ['祿', '權', '科', '忌'];

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
  };

  // 取得特定單星上的四化標籤
  const getStarTransforms = (starName: string): TransformBadge[] => {
    const list: TransformBadge[] = [];
    const types: Array<'祿' | '權' | '科' | '忌'> = ['祿', '權', '科', '忌'];

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
  };

  // 即時計算選中宮位三方四正的卡片中心點，繪製精確虛線
  const updateCoordinates = useCallback(() => {
    if (!gridContainerRef.current) return;
    const container = gridContainerRef.current.getBoundingClientRect();

    const getCenter = (branch: EarthlyBranch) => {
      const el = document.getElementById(`palace-card-${branch}`);
      if (el) {
        const rect = el.getBoundingClientRect();
        return {
          x: rect.left - container.left + rect.width / 2,
          y: rect.top - container.top + rect.height / 2,
        };
      }
      const pos = BRANCH_GRID_POS[branch];
      return {
        x: ((pos.col + 0.5) / 4) * container.width,
        y: ((pos.row + 0.5) / 4) * container.height,
      };
    };

    setLineCoords({
      benGong: getCenter(selectedPalace.branch),
      duiGong: getCenter(rel.opposite),
      trine1: getCenter(rel.trine1),
      trine2: getCenter(rel.trine2),
    });
  }, [selectedPalace.branch, rel.opposite, rel.trine1, rel.trine2]);

  useEffect(() => {
    updateCoordinates();
    const handleResize = () => updateCoordinates();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateCoordinates]);

  // Determine highlight type for a palace branch
  const getHighlightClass = (branch: EarthlyBranch) => {
    if (branch === selectedPalace.branch) {
      return 'ring-2 ring-amber-500 border-2 border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/10';
    }
    if (branch === rel.opposite) {
      return 'ring-1 ring-rose-500/60 border-2 border-rose-500/50 bg-rose-500/10';
    }
    if (branch === rel.trine1 || branch === rel.trine2) {
      return 'ring-1 ring-indigo-500/60 border-2 border-indigo-500/50 bg-indigo-500/10';
    }
    if (branch === rel.sandwich1 || branch === rel.sandwich2) {
      return 'ring-1 ring-teal-500/40 border border-teal-500/40 bg-teal-500/10';
    }
    return 'bg-slate-800/40 border border-slate-700/80 hover:border-slate-500 hover:bg-slate-800/70 text-slate-200';
  };

  const renderPalaceCard = (branch: EarthlyBranch) => {
    const p = chart.palaces.find((item) => item.branch === branch);
    if (!p) return null;

    const isSelected = p.name === selectedPalaceName;
    const isOpposite = p.branch === rel.opposite;
    const isTrine = p.branch === rel.trine1 || p.branch === rel.trine2;
    const isSandwich = p.branch === rel.sandwich1 || p.branch === rel.sandwich2;

    const {
      majorPalaceFullName,
      majorPalaceShort,
      isMajorMing,
      annualPalaceFullName,
      annualPalaceShort,
      isAnnualMing,
    } = getOverlayPalaceNames(p);

    const palaceTransforms = showTransforms ? getPalaceTransforms(p) : [];

    return (
      <div
        key={branch}
        id={`palace-card-${branch}`}
        onClick={() => onSelectPalace(p.name)}
        className={`relative flex flex-col justify-between ${
          effectiveDevice === 'tablet'
            ? 'p-2 sm:p-2.5 min-h-[135px] text-xs'
            : 'p-2.5 sm:p-3 min-h-[145px] sm:min-h-[175px]'
        } rounded-lg border transition-all duration-200 cursor-pointer z-10 ${getHighlightClass(
          branch,
        )}`}
      >
        {/* Top Header: Palace Name, Stem-Branch, Tags */}
        <div>
          <div className="flex items-center justify-between gap-1 mb-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-serif font-bold text-base sm:text-lg text-amber-400 tracking-wide">
                {p.name}
              </span>
              {p.isMingGong && (
                <span className="px-1.5 py-0.2 rounded text-[10px] sm:text-xs font-semibold bg-emerald-500 text-slate-950 shadow-xs">
                  命
                </span>
              )}
              {p.isShenGong && (
                <span className="px-1.5 py-0.2 rounded text-[10px] sm:text-xs font-semibold bg-amber-500 text-slate-950 shadow-xs">
                  身
                </span>
              )}
            </div>

            <div className="text-right">
              <span className="font-mono font-bold text-xs sm:text-sm text-slate-400">
                {p.stem}{p.branch}
              </span>
            </div>
          </div>

          {/* 三盤合參疊宮標籤：大運宮位與流年宮位 */}
          {(showMajorLimit || showAnnual) && (
            <div className="flex flex-wrap items-center gap-1 mb-1.5">
              {showMajorLimit && (
                <span
                  className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-bold border transition-all ${
                    isMajorMing
                      ? 'bg-purple-600 text-white border-purple-400 font-extrabold shadow-sm ring-1 ring-purple-300'
                      : 'bg-purple-950/70 text-purple-300 border-purple-800/80 hover:border-purple-600'
                  }`}
                  title={`大限${majorPalaceFullName}（當前第${activeMajorLimit.index}大限 ${activeMajorLimit.startAge}-${activeMajorLimit.endAge}歲）`}
                >
                  {majorPalaceShort}
                </span>
              )}
              {showAnnual && (
                <span
                  className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-bold border transition-all ${
                    isAnnualMing
                      ? 'bg-cyan-500 text-slate-950 border-cyan-300 font-extrabold shadow-sm ring-1 ring-cyan-200'
                      : 'bg-cyan-950/70 text-cyan-300 border-cyan-800/80 hover:border-cyan-600'
                  }`}
                  title={`流年${annualPalaceFullName}（${activeAnnual.year} ${activeAnnual.yearGan}${activeAnnual.yearZhi}年 虛歲${activeAnnual.age}歲）`}
                >
                  {annualPalaceShort}
                </span>
              )}
            </div>
          )}

          {/* Relationship Indicator Pill */}
          <div className="flex items-center gap-1 mb-2">
            {isSelected && (
              <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                本宮
              </span>
            )}
            {isOpposite && (
              <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                對宮
              </span>
            )}
            {isTrine && (
              <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                三合
              </span>
            )}
            {isSandwich && (
              <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/40">
                夾宮
              </span>
            )}
            {p.majorLimit && (
              <span className="text-[10px] font-mono text-slate-400 ml-auto font-medium">
                {p.majorLimit.startAge}-{p.majorLimit.endAge}歲
              </span>
            )}
          </div>

          {/* Main Stars with Brightness & Star-level Transformations */}
          <div className="flex flex-wrap gap-1.5 mb-2">
            {p.mainStars.length === 0 ? (
              <span className="text-xs text-slate-500 italic">空宮借對</span>
            ) : (
              p.mainStars.map((star) => {
                const sTransforms = showTransforms ? getStarTransforms(star.name) : [];
                return (
                  <div
                    key={star.name}
                    className="inline-flex items-center gap-1 bg-[#0f172a] text-amber-300 px-1.5 py-0.5 rounded text-xs sm:text-sm font-serif font-bold border border-slate-700 shadow-xs"
                  >
                    <span>{star.name}</span>
                    {star.brightness && (
                      <span className="text-[10px] text-amber-400/80 font-sans font-normal">
                        {star.brightness}
                      </span>
                    )}
                    {sTransforms.map((t, sIdx) => (
                      <span
                        key={sIdx}
                        className={`px-1 py-0.2 rounded text-[9px] font-mono font-bold border leading-none ${t.badgeClass}`}
                        title={`${t.tierName}四化：${t.star}化${t.type}（${t.sourceGan}干）`}
                      >
                        {t.label}
                      </span>
                    ))}
                  </div>
                );
              })
            )}
          </div>

          {/* 本命、大運、流年三代四化疊曜總覽列 */}
          {palaceTransforms.length > 0 && (
            <div className="flex flex-wrap gap-1 my-1.5 pt-1 border-t border-slate-700/40">
              {palaceTransforms.map((t, idx) => (
                <span
                  key={idx}
                  className={`inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] sm:text-[11px] font-semibold border ${t.badgeClass}`}
                  title={`${t.tierName}四化：${t.star}化${t.type}（${t.sourceGan}干）`}
                >
                  <span className="text-slate-300">{t.star}</span>
                  <span className="font-extrabold">{t.label}</span>
                </span>
              ))}
            </div>
          )}

          {/* Auxiliary Lucky Stars */}
          <div className="flex flex-wrap gap-1 mb-1.5 text-[11px] text-indigo-300">
            {p.auxiliaryStars.map((s) => {
              const auxTransforms = showTransforms ? getStarTransforms(s.name) : [];
              return (
                <span key={s.name} className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-indigo-950/40 border border-indigo-800/40 font-medium">
                  <span>{s.name}</span>
                  {auxTransforms.map((t, sIdx) => (
                    <span
                      key={sIdx}
                      className={`px-0.5 py-0.2 rounded text-[9px] font-mono font-bold border leading-none ${t.badgeClass}`}
                      title={`${t.tierName}四化：${t.star}化${t.type}`}
                    >
                      {t.label}
                    </span>
                  ))}
                </span>
              );
            })}
          </div>

          {/* Malefic Stars */}
          <div className="flex flex-wrap gap-1 text-[11px] text-rose-300">
            {p.maleficStars.map((s) => (
              <span key={s.name} className="px-1 py-0.2 rounded bg-rose-950/40 border border-rose-800/40 font-medium">
                {s.name}
              </span>
            ))}
          </div>
        </div>

        {/* Card Footer: Small summary */}
        <div className="pt-1 mt-1 border-t border-slate-700/60 flex items-center justify-between text-[10px] text-slate-500 font-mono">
          <span>{p.branch}位</span>
          <span>{p.mainStars.length}主星 / {p.auxiliaryStars.length + p.maleficStars.length}輔煞</span>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full space-y-3">
      {/* 三盤合參控制列 (本命盤 · 大運盤 · 流年盤 即時疊宮控制) */}
      <div className="bg-[#111827] p-3 sm:p-4 rounded-xl border border-slate-800 shadow-xl space-y-3 text-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-white text-sm font-serif block">三盤同參疊宮</span>
                <span className="text-[11px] text-slate-400 font-sans">本命盤 + 大運盤 + 流年盤 同步映射</span>
              </div>
            </div>

            {/* 大限（大運）選擇器 */}
            <div className="flex items-center gap-1.5 bg-slate-900/90 px-3 py-1.5 rounded-lg border border-purple-900/60 shadow-inner">
              <Clock className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span className="text-purple-400 font-bold text-xs shrink-0">大運：</span>
              <select
                value={activeMajorLimit.index}
                onChange={(e) => onSelectMajorLimitIndex?.(parseInt(e.target.value, 10))}
                className="bg-slate-900 text-purple-200 text-xs font-semibold focus:outline-none cursor-pointer pr-1"
              >
                {chart.majorLimits.map((ml) => (
                  <option key={ml.index} value={ml.index} className="bg-slate-900 text-white">
                    第{ml.index}限 {ml.startAge}-{ml.endAge}歲 ({ml.stem}{ml.branch}·{ml.palace})
                  </option>
                ))}
              </select>
            </div>

            {/* 流年選擇器 */}
            <div className="flex items-center gap-1.5 bg-slate-900/90 px-3 py-1.5 rounded-lg border border-cyan-900/60 shadow-inner">
              <Calendar className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="text-cyan-400 font-bold text-xs shrink-0">流年：</span>
              <select
                value={activeAnnual.year}
                onChange={(e) => onSelectAnnualYear?.(parseInt(e.target.value, 10))}
                className="bg-slate-900 text-cyan-200 text-xs font-semibold focus:outline-none cursor-pointer pr-1"
              >
                {chart.annualCharts.map((item) => (
                  <option key={item.year} value={item.year} className="bg-slate-900 text-white">
                    {item.year}年 ({item.yearGan}{item.yearZhi} 虛歲{item.age}歲·流年{item.annualMingPalace})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 顯示開關 (Toggle Buttons) */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowSanFangLines((prev) => !prev)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                showSanFangLines
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-xs'
                  : 'bg-slate-900 text-slate-500 border-slate-800'
              }`}
            >
              <Share2 className="w-3.5 h-3.5 text-amber-400" />
              三方四正虛線
            </button>

            <button
              type="button"
              onClick={() => setShowTransforms((prev) => !prev)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                showTransforms
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60 shadow-xs'
                  : 'bg-slate-900 text-slate-500 border-slate-800'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              本命/大運/流年四化
            </button>

            {onToggleShowMajorLimit && (
              <button
                type="button"
                onClick={onToggleShowMajorLimit}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                  showMajorLimit
                    ? 'bg-purple-600/30 text-purple-200 border-purple-500 shadow-xs'
                    : 'bg-slate-900 text-slate-500 border-slate-800'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${showMajorLimit ? 'bg-purple-400' : 'bg-slate-600'}`}></span>
                大運宮位
              </button>
            )}

            {onToggleShowAnnual && (
              <button
                type="button"
                onClick={onToggleShowAnnual}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                  showAnnual
                    ? 'bg-cyan-600/30 text-cyan-200 border-cyan-500 shadow-xs'
                    : 'bg-slate-900 text-slate-500 border-slate-800'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${showAnnual ? 'bg-cyan-400' : 'bg-slate-600'}`}></span>
                流年宮位
              </button>
            )}

            {effectiveDevice === 'tablet' && (
              <div className="flex items-center bg-slate-900/90 p-0.5 rounded-lg border border-slate-700/80">
                <button
                  type="button"
                  onClick={() => setTabletViewMode('grid')}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition-all ${
                    tabletViewMode === 'grid'
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Grid className="w-3 h-3" />
                  <span>4x4 天盤</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTabletViewMode('split')}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition-all ${
                    tabletViewMode === 'split'
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Columns className="w-3 h-3" />
                  <span>雙欄工作區</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 三代四化總覽條 (本命 · 大運 · 流年) */}
        {showTransforms && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-2 border-t border-slate-800 font-mono text-[11px]">
            <div className="flex items-center gap-1.5 bg-slate-900/60 px-2.5 py-1.5 rounded-lg border border-slate-800">
              <span className="text-emerald-400 font-bold">本命四化({birthYearGan}干)：</span>
              <span className="text-slate-200">
                {FOUR_TRANSFORM_RULES[birthYearGan]
                  ? `${FOUR_TRANSFORM_RULES[birthYearGan]['祿']}祿 · ${FOUR_TRANSFORM_RULES[birthYearGan]['權']}權 · ${FOUR_TRANSFORM_RULES[birthYearGan]['科']}科 · ${FOUR_TRANSFORM_RULES[birthYearGan]['忌']}忌`
                  : ''}
              </span>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-900/60 px-2.5 py-1.5 rounded-lg border border-purple-900/40">
              <span className="text-purple-400 font-bold">大運四化({majorLimitStem}干)：</span>
              <span className="text-purple-200">
                {FOUR_TRANSFORM_RULES[majorLimitStem]
                  ? `${FOUR_TRANSFORM_RULES[majorLimitStem]['祿']}祿 · ${FOUR_TRANSFORM_RULES[majorLimitStem]['權']}權 · ${FOUR_TRANSFORM_RULES[majorLimitStem]['科']}科 · ${FOUR_TRANSFORM_RULES[majorLimitStem]['忌']}忌`
                  : ''}
              </span>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-900/60 px-2.5 py-1.5 rounded-lg border border-cyan-900/40">
              <span className="text-cyan-400 font-bold">流年四化({annualYearGan}干)：</span>
              <span className="text-cyan-200">
                {FOUR_TRANSFORM_RULES[annualYearGan]
                  ? `${FOUR_TRANSFORM_RULES[annualYearGan]['祿']}祿 · ${FOUR_TRANSFORM_RULES[annualYearGan]['權']}權 · ${FOUR_TRANSFORM_RULES[annualYearGan]['科']}科 · ${FOUR_TRANSFORM_RULES[annualYearGan]['忌']}忌`
                  : ''}
              </span>
            </div>
          </div>
        )}
      </div>

      {effectiveDevice === 'tablet' && tabletViewMode === 'split' ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* 左側：十二宮速選 3x4 網格 (5 cols) */}
          <div className="md:col-span-5 bg-[#111827] rounded-xl border border-slate-800 p-3 space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-serif font-bold text-amber-400 text-sm">十二宮位速選</span>
              <span className="text-[11px] text-slate-400">點選切換詳解</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {chart.palaces.map((p) => {
                const isSelected = p.name === selectedPalaceName;
                const { majorPalaceShort, annualPalaceShort } = getOverlayPalaceNames(p);
                return (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => onSelectPalace(p.name)}
                    className={`p-2 rounded-lg border text-left flex flex-col justify-between min-h-[78px] transition-all ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-400 shadow-md ring-1 ring-amber-400'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs font-serif text-amber-300">{p.name}</span>
                      <span className="text-[10px] font-mono text-slate-400">{p.branch}</span>
                    </div>

                    <div className="text-xs text-white font-serif font-bold truncate my-1">
                      {p.mainStars.map((s) => s.name).join('、') || '空宮'}
                    </div>

                    <div className="flex items-center gap-1 text-[9px] font-mono">
                      <span className="text-purple-300">{majorPalaceShort}</span>
                      <span className="text-cyan-300">{annualPalaceShort}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* 中堂核心八字與五行局摘要 */}
            <div className="bg-[#0a0f1d] rounded-lg p-3 border border-slate-800 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-amber-400 font-bold">{chart.birth.name || '命主'} ({chart.birth.gender === 'male' ? '乾造' : '坤造'})</span>
                <span className="font-mono text-slate-300">{chart.wuxingJu.wuxingJu}</span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                {chart.ganzhi.yearGanZhi.name}年 {chart.ganzhi.monthGanZhi.name}月 {chart.ganzhi.dayGanZhi.name}日 {chart.ganzhi.hourGanZhi.name}時
              </div>
              <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/80">
                <span>陽曆：{chart.calendar.solarDate}</span>
                <button
                  type="button"
                  onClick={onQuickLoadGolden}
                  className="text-[10px] bg-amber-500/20 text-amber-300 py-0.5 px-2 rounded border border-amber-500/40 hover:bg-amber-500 hover:text-slate-950 font-semibold"
                >
                  黃金測試一號
                </button>
              </div>
            </div>
          </div>

          {/* 右側：焦點宮位 Hero 卡 + 三方四正 2x2 (7 cols) */}
          <div className="md:col-span-7 space-y-3.5">
            {/* 焦點宮位卡片 */}
            <div className="bg-[#111827] rounded-xl border-2 border-amber-500/40 p-4 shadow-xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <span className="font-serif font-bold text-xl text-amber-400">
                    【{selectedPalace.name}】
                  </span>
                  <span className="font-mono text-sm px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700">
                    {selectedPalace.stem}{selectedPalace.branch}位
                  </span>
                  {selectedPalace.isMingGong && (
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-500 text-slate-950">命宮</span>
                  )}
                  {selectedPalace.isShenGong && (
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-500 text-slate-950">身宮</span>
                  )}
                </div>

                {selectedPalace.majorLimit && (
                  <span className="text-xs font-mono text-purple-300 bg-purple-950/80 px-2 py-0.5 rounded border border-purple-800">
                    {selectedPalace.majorLimit.startAge}-{selectedPalace.majorLimit.endAge}歲
                  </span>
                )}
              </div>

              {/* 主星群 */}
              <div className="bg-slate-900/90 rounded-lg p-3 border border-slate-800">
                <div className="text-[11px] font-bold text-slate-400 mb-1.5">主星坐守</div>
                {selectedPalace.mainStars.length === 0 ? (
                  <div className="text-xs text-slate-500 italic">空宮借對</div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {selectedPalace.mainStars.map((star) => {
                      const sTransforms = showTransforms ? getStarTransforms(star.name) : [];
                      return (
                        <div
                          key={star.name}
                          className="inline-flex items-center gap-1.5 bg-[#0a0f1d] px-2.5 py-1.5 rounded-lg border border-amber-500/40"
                        >
                          <span className="font-serif font-bold text-base text-amber-300">{star.name}</span>
                          {star.brightness && <span className="text-xs text-amber-400/90">{star.brightness}</span>}
                          {sTransforms.map((t, idx) => (
                            <span key={idx} className={`px-1 rounded text-[10px] font-mono font-bold border ${t.badgeClass}`}>
                              {t.label}
                            </span>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 三代四化與吉煞 */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-900/60 p-2.5 rounded-lg border border-indigo-900/40">
                  <div className="text-[11px] font-bold text-indigo-400 mb-1">吉星輔曜</div>
                  <div className="flex flex-wrap gap-1">
                    {selectedPalace.auxiliaryStars.map((s) => (
                      <span key={s.name} className="px-1.5 py-0.5 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-800/40 text-[11px]">
                        {s.name}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-900/60 p-2.5 rounded-lg border border-rose-900/40">
                  <div className="text-[11px] font-bold text-rose-400 mb-1">煞星耗曜</div>
                  <div className="flex flex-wrap gap-1">
                    {selectedPalace.maleficStars.map((s) => (
                      <span key={s.name} className="px-1.5 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-800/40 text-[11px]">
                        {s.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 三方四正 2x2 矩陣 */}
            <div className="bg-[#111827] rounded-xl border border-slate-800 p-3 shadow-lg space-y-2">
              <div className="text-xs font-bold text-white flex items-center justify-between border-b border-slate-800 pb-1.5">
                <span>三方四正照會關係</span>
                <span className="text-[10px] text-slate-400 font-normal">點擊切換焦點</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {(() => {
                  const opp = chart.palaces.find((p) => p.branch === rel.opposite)!;
                  const t1 = chart.palaces.find((p) => p.branch === rel.trine1)!;
                  const t2 = chart.palaces.find((p) => p.branch === rel.trine2)!;

                  const renderCard = (target: PalaceInfo, label: string, style: string, textColor: string) => {
                    const { majorPalaceShort, annualPalaceShort } = getOverlayPalaceNames(target);
                    return (
                      <button
                        type="button"
                        onClick={() => onSelectPalace(target.name)}
                        className={`p-2.5 rounded-lg border text-left ${style} hover:border-amber-400 transition-all`}
                      >
                        <div className={`flex items-center justify-between font-bold mb-1 ${textColor}`}>
                          <span>{label} ({target.name})</span>
                          <span className="font-mono text-[11px] text-slate-400">{target.stem}{target.branch}</span>
                        </div>
                        <div className="flex items-center gap-1 mb-1 text-[10px]">
                          <span className="px-1 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-800">{majorPalaceShort}</span>
                          <span className="px-1 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">{annualPalaceShort}</span>
                        </div>
                        <div className="font-serif font-bold text-white truncate">
                          {target.mainStars.map((s) => s.name).join('、') || '空宮借對'}
                        </div>
                      </button>
                    );
                  };

                  return (
                    <>
                      {renderCard(selectedPalace, '本宮', 'bg-amber-500/10 border-amber-500/40 ring-1 ring-amber-400', 'text-amber-400')}
                      {renderCard(opp, '對宮', 'bg-rose-500/10 border-rose-500/40', 'text-rose-400')}
                      {renderCard(t1, '三合一', 'bg-indigo-500/10 border-indigo-500/40', 'text-indigo-400')}
                      {renderCard(t2, '三合二', 'bg-indigo-500/10 border-indigo-500/40', 'text-indigo-400')}
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* 4x4 Grid Container with SVG Overlay */
        <div ref={gridContainerRef} className="relative w-full">
          {/* SVG Dashed Lines for San Fang Si Zheng (三方四正虛線連線) */}
          {showSanFangLines && lineCoords && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-30">
              <defs>
                <filter id="glow-gold" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* 1. 三合三角形 (本宮 -> 三合一 -> 三合二 -> 本宮) */}
              <polygon
                points={`${lineCoords.benGong.x},${lineCoords.benGong.y} ${lineCoords.trine1.x},${lineCoords.trine1.y} ${lineCoords.trine2.x},${lineCoords.trine2.y}`}
                fill="rgba(245, 158, 11, 0.04)"
                stroke="#f59e0b"
                strokeWidth="2.5"
                strokeDasharray="7 5"
                filter="url(#glow-gold)"
              />

              {/* 2. 對宮連線 (本宮 -> 對宮 穿心衝照) */}
              <line
                x1={lineCoords.benGong.x}
                y1={lineCoords.benGong.y}
                x2={lineCoords.duiGong.x}
                y2={lineCoords.duiGong.y}
                stroke="#f43f5e"
                strokeWidth="2.5"
                strokeDasharray="7 5"
              />

              {/* 3. 節點端點標記 (Glowing Node Dots) */}
              {/* 本宮端點 (金色強烈光環) */}
              <circle
                cx={lineCoords.benGong.x}
                cy={lineCoords.benGong.y}
                r="7"
                fill="#f59e0b"
                stroke="#ffffff"
                strokeWidth="2"
              />

              {/* 對宮端點 (玫瑰紅) */}
              <circle
                cx={lineCoords.duiGong.x}
                cy={lineCoords.duiGong.y}
                r="5.5"
                fill="#f43f5e"
                stroke="#ffffff"
                strokeWidth="1.5"
              />

              {/* 三合一端點 (靛藍) */}
              <circle
                cx={lineCoords.trine1.x}
                cy={lineCoords.trine1.y}
                r="5.5"
                fill="#6366f1"
                stroke="#ffffff"
                strokeWidth="1.5"
              />

              {/* 三合二端點 (靛藍) */}
              <circle
                cx={lineCoords.trine2.x}
                cy={lineCoords.trine2.y}
                r="5.5"
                fill="#6366f1"
                stroke="#ffffff"
                strokeWidth="1.5"
              />
            </svg>
          )}

          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            {/* Row 1: 巳(0,0), 午(0,1), 未(0,2), 申(0,3) */}
            {renderPalaceCard('巳')}
            {renderPalaceCard('午')}
            {renderPalaceCard('未')}
            {renderPalaceCard('申')}

            {/* Row 2: 辰(1,0), Center Courtyard (col-span-2 row-span-2), 酉(1,3) */}
            {renderPalaceCard('辰')}

            {/* Center Courtyard (中堂) */}
            <div
              id="center-courtyard"
              className="col-span-2 row-span-2 p-3 sm:p-5 rounded-xl bg-[#0a0f1d] text-slate-200 shadow-2xl flex flex-col justify-between border-2 border-slate-800 z-10"
            >
              {/* Top Bar */}
              <div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <Compass className="w-5 h-5 text-amber-500" />
                    <h2 className="font-serif font-bold text-xl sm:text-2xl text-amber-500 tracking-widest">
                      {chart.birth.name || '紫微天盤'}
                    </h2>
                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                      {chart.birth.gender === 'male' ? '乾造' : '坤造'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      三盤合參中
                    </span>
                  </div>
                </div>

                {/* Core Ganzhi & Calendar Metadata */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 text-xs">
                  <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800 text-center">
                    <div className="text-[10px] uppercase text-slate-500 font-bold">年柱干支</div>
                    <div className="font-bold text-slate-200 font-mono text-sm mt-0.5">
                      {chart.ganzhi.yearGanZhi.name}
                    </div>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800 text-center">
                    <div className="text-[10px] uppercase text-slate-500 font-bold">月柱干支</div>
                    <div className="font-bold text-slate-200 font-mono text-sm mt-0.5">
                      {chart.ganzhi.monthGanZhi.name}
                    </div>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800 text-center">
                    <div className="text-[10px] uppercase text-slate-500 font-bold">日柱干支</div>
                    <div className="font-bold text-slate-200 font-mono text-sm mt-0.5">
                      {chart.ganzhi.dayGanZhi.name}
                    </div>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800 text-center">
                    <div className="text-[10px] uppercase text-slate-500 font-bold">時柱干支</div>
                    <div className="font-bold text-slate-200 font-mono text-sm mt-0.5">
                      {chart.ganzhi.hourGanZhi.name}
                    </div>
                  </div>
                </div>

                {/* Astrological Parameters */}
                <div className="space-y-1.5 text-xs text-slate-300 bg-slate-900/60 p-3 rounded-lg border border-slate-800 mb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">五行局數</span>
                    <span className="font-bold text-slate-200 font-mono">
                      {chart.wuxingJu.wuxingJu}（{chart.wuxingJu.ziweiStartingAge}歲起運）
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">本命 命身宮</span>
                    <span className="font-mono">
                      命宮【<span className="text-emerald-400 font-bold">{chart.mingGong.stem}{chart.mingGong.branch}</span>】 · 身宮【<span className="text-amber-400 font-bold">{chart.shenGong.stem}{chart.shenGong.branch}</span>】
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">當前大限 (大運)</span>
                    <span className="font-mono text-purple-300 font-bold">
                      第{activeMajorLimit.index}限【{activeMajorLimit.palace}·{activeMajorLimit.stem}{activeMajorLimit.branch}】（{activeMajorLimit.startAge}-{activeMajorLimit.endAge}歲）
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">當前流年太歲</span>
                    <span className="font-mono text-cyan-300 font-bold">
                      {activeAnnual.year} {activeAnnual.yearGan}{activeAnnual.yearZhi}年【流年{activeAnnual.annualMingPalace}·{activeAnnual.annualMingBranch}位】（虛歲{activeAnnual.age}歲）
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1.5 border-t border-slate-800 font-mono">
                    <span>陽曆：{chart.calendar.solarDate} {chart.calendar.solarTime}</span>
                    <span>農曆：{chart.calendar.lunarMonthName}{chart.calendar.lunarDayName}</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions at Courtyard bottom */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-slate-800">
                <button
                  type="button"
                  onClick={onQuickLoadGolden}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xs transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  載入黃金測試 #001 (丁酉命)
                </button>

                <span className="text-[11px] text-amber-300/80 font-medium">
                  點擊任一宮位即連動三方四正金色/紅色動態虛線
                </span>
              </div>
            </div>

            {renderPalaceCard('酉')}

            {/* Row 3: 卯(2,0), 戌(2,3) */}
            {renderPalaceCard('卯')}
            {renderPalaceCard('戌')}

            {/* Row 4: 寅(3,0), 丑(3,1), 子(3,2), 亥(3,3) */}
            {renderPalaceCard('寅')}
            {renderPalaceCard('丑')}
            {renderPalaceCard('子')}
            {renderPalaceCard('亥')}
          </div>
        </div>
      )}
    </div>
  );
};
