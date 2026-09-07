/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ChartJson } from '../ziwei/types/chart';
import { EarthlyBranch, PalaceName, PALACE_NAMES } from '../ziwei/types/constants';
import { PalaceInfo } from '../ziwei/types/palace';
import { Sparkles, Compass, Layers, Clock, Calendar } from 'lucide-react';

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
}) => {
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

    return (
      <div
        key={branch}
        id={`palace-card-${branch}`}
        onClick={() => onSelectPalace(p.name)}
        className={`relative flex flex-col justify-between p-2.5 sm:p-3 rounded-lg border transition-all duration-200 cursor-pointer min-h-[145px] sm:min-h-[175px] ${getHighlightClass(
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

          {/* Main Stars with Brightness */}
          <div className="flex flex-wrap gap-1.5 mb-2">
            {p.mainStars.length === 0 ? (
              <span className="text-xs text-slate-500 italic">空宮借對</span>
            ) : (
              p.mainStars.map((star) => (
                <div
                  key={star.name}
                  className="inline-flex items-center gap-0.5 bg-[#0f172a] text-amber-300 px-1.5 py-0.5 rounded text-xs sm:text-sm font-serif font-bold border border-slate-700 shadow-xs"
                >
                  <span>{star.name}</span>
                  {star.brightness && (
                    <span className="text-[10px] text-amber-400/80 font-sans font-normal">
                      {star.brightness}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Four Transformations on Stars */}
          {p.transformations.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {p.transformations.map((t, idx) => {
                let badgeStyle = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
                if (t.type === '權') badgeStyle = 'bg-rose-500/20 text-rose-300 border-rose-500/40';
                if (t.type === '科') badgeStyle = 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
                if (t.type === '忌') badgeStyle = 'bg-purple-500/20 text-purple-300 border-purple-500/40';

                return (
                  <span
                    key={idx}
                    className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] font-semibold border ${badgeStyle}`}
                  >
                    <span>{t.star}</span>
                    <span className="font-bold">化{t.type}</span>
                  </span>
                );
              })}
            </div>
          )}

          {/* Auxiliary Lucky Stars */}
          <div className="flex flex-wrap gap-1 mb-1.5 text-[11px] text-indigo-300">
            {p.auxiliaryStars.map((s) => (
              <span key={s.name} className="px-1 py-0.2 rounded bg-indigo-950/40 border border-indigo-800/40 font-medium">
                {s.name}
              </span>
            ))}
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
      <div className="bg-[#111827] p-3 sm:p-4 rounded-xl border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-3 text-xs">
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
            <span className="text-purple-400 font-bold text-xs shrink-0">當前大運：</span>
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
            <span className="text-cyan-400 font-bold text-xs shrink-0">當前流年：</span>
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
        <div className="flex items-center gap-2">
          {onToggleShowMajorLimit && (
            <button
              type="button"
              onClick={onToggleShowMajorLimit}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                showMajorLimit
                  ? 'bg-purple-600/30 text-purple-200 border-purple-500 shadow-xs'
                  : 'bg-slate-900 text-slate-500 border-slate-800'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${showMajorLimit ? 'bg-purple-400' : 'bg-slate-600'}`}></span>
              顯示大運宮位 (大命/大財/大官...)
            </button>
          )}

          {onToggleShowAnnual && (
            <button
              type="button"
              onClick={onToggleShowAnnual}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                showAnnual
                  ? 'bg-cyan-600/30 text-cyan-200 border-cyan-500 shadow-xs'
                  : 'bg-slate-900 text-slate-500 border-slate-800'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${showAnnual ? 'bg-cyan-400' : 'bg-slate-600'}`}></span>
              顯示流年宮位 (年命/年財/年官...)
            </button>
          )}
        </div>
      </div>

      {/* 4x4 Grid Container */}
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
          className="col-span-2 row-span-2 p-4 sm:p-6 rounded-xl bg-[#0a0f1d] text-slate-200 shadow-2xl flex flex-col justify-between border-2 border-slate-800"
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
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">生年四化</span>
                <span className="text-amber-400 font-medium font-mono">
                  {chart.fourTransformations.map((t) => `${t.star}化${t.type}`).join('、')}
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

            <span className="text-[11px] text-slate-500 italic">
              點擊任一宮位即顯示三方四正與三盤疊宮
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
  );
};
