/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ChartJson } from '../ziwei/types/chart';
import { PalaceName, PALACE_NAMES, EarthlyBranch } from '../ziwei/types/constants';
import { PalaceInfo } from '../ziwei/types/palace';
import {
  computePalaceTransforms,
  computeStarTransforms,
  computeOverlayPalaceNames,
} from '../ziwei/transform/badgeHelpers';
import {
  Compass,
  Clock,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowRight,
  Eye,
  Grid,
  List,
} from 'lucide-react';

interface MobileZiweiViewProps {
  chart: ChartJson;
  selectedPalaceName: PalaceName;
  onSelectPalace: (name: PalaceName) => void;
  onQuickLoadGolden: () => void;
  selectedMajorLimitIndex?: number;
  onSelectMajorLimitIndex?: (index: number) => void;
  selectedAnnualYear?: number;
  onSelectAnnualYear?: (year: number) => void;
  showMajorLimit?: boolean;
  onToggleShowMajorLimit?: () => void;
  showAnnual?: boolean;
  onToggleShowAnnual?: () => void;
}

// 4x4 地支坐標（用於微縮天盤）
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

export const MobileZiweiView: React.FC<MobileZiweiViewProps> = ({
  chart,
  selectedPalaceName,
  onSelectPalace,
  onQuickLoadGolden,
  selectedMajorLimitIndex = 1,
  onSelectMajorLimitIndex,
  selectedAnnualYear,
  onSelectAnnualYear,
  showMajorLimit = true,
  showAnnual = true,
}) => {
  const [subView, setSubView] = useState<'focus' | 'cards' | 'mini4x4'>('focus');
  const [isSummaryExpanded, setIsSummaryExpanded] = useState<boolean>(false);

  const activeMajorLimit =
    chart.majorLimits.find((m) => m.index === selectedMajorLimitIndex) || chart.majorLimits[0];
  const activeAnnual =
    chart.annualCharts.find((a) => a.year === selectedAnnualYear) || chart.annualCharts[0];

  const currentPalace =
    chart.palaces.find((p) => p.name === selectedPalaceName) || chart.palaces[0];

  // 三方四正宮位
  const oppPalace = chart.palaces.find((p) => p.branch === currentPalace.relationships.opposite)!;
  const t1Palace = chart.palaces.find((p) => p.branch === currentPalace.relationships.trine1)!;
  const t2Palace = chart.palaces.find((p) => p.branch === currentPalace.relationships.trine2)!;
  const s1Palace = chart.palaces.find((p) => p.branch === currentPalace.relationships.sandwich1)!;
  const s2Palace = chart.palaces.find((p) => p.branch === currentPalace.relationships.sandwich2)!;

  // 渲染單一宮位的詳細 Hero 卡片內容
  const renderHeroPalaceCard = (p: PalaceInfo) => {
    const overlay = computeOverlayPalaceNames(chart, p, selectedMajorLimitIndex, selectedAnnualYear);
    const palaceTransforms = computePalaceTransforms(chart, p, selectedMajorLimitIndex, selectedAnnualYear);

    return (
      <div className="bg-[#111827] rounded-2xl border-2 border-amber-500/40 p-4 shadow-xl space-y-3">
        {/* 卡片頂部：宮名、干支、命身、疊宮 */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-serif font-bold text-xl text-amber-400 tracking-wide">
              {p.name}
            </h3>
            {p.isMingGong && (
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-500 text-slate-950 shadow-xs">
                本命
              </span>
            )}
            {p.isShenGong && (
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-500 text-slate-950 shadow-xs">
                身宮
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-sm px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              {p.stem}{p.branch}
            </span>
            {p.majorLimit && (
              <span className="text-xs font-mono text-purple-300 font-semibold bg-purple-950/80 px-2 py-0.5 rounded border border-purple-800">
                {p.majorLimit.startAge}-{p.majorLimit.endAge}歲
              </span>
            )}
          </div>
        </div>

        {/* 疊宮映射標籤（大運與流年） */}
        {(showMajorLimit || showAnnual) && (
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            {showMajorLimit && (
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold border ${
                  overlay.isMajorMing
                    ? 'bg-purple-600 text-white border-purple-400 shadow-xs'
                    : 'bg-purple-950/80 text-purple-300 border-purple-800'
                }`}
              >
                <span>大限</span>
                <span>{overlay.majorPalaceFullName}</span>
              </span>
            )}
            {showAnnual && (
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold border ${
                  overlay.isAnnualMing
                    ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-xs'
                    : 'bg-cyan-950/80 text-cyan-300 border-cyan-800'
                }`}
              >
                <span>流年</span>
                <span>{overlay.annualPalaceFullName}</span>
              </span>
            )}
          </div>
        )}

        {/* 主星群 (Main Stars) */}
        <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 space-y-2">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            主星坐守
          </div>
          {p.mainStars.length === 0 ? (
            <div className="text-xs text-slate-500 italic py-1">
              無主星坐守（空宮，需借對宮【{oppPalace.name}】星曜為用）
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {p.mainStars.map((star) => {
                const sTransforms = computeStarTransforms(chart, star.name, selectedMajorLimitIndex, selectedAnnualYear);
                return (
                  <div
                    key={star.name}
                    className="inline-flex items-center gap-1.5 bg-[#0a0f1d] px-2.5 py-1.5 rounded-lg border border-amber-500/40 shadow-xs"
                  >
                    <span className="font-serif font-bold text-base text-amber-300">
                      {star.name}
                    </span>
                    {star.brightness && (
                      <span className="text-xs text-amber-400/90 font-medium font-sans">
                        {star.brightness}
                      </span>
                    )}
                    {sTransforms.map((t, idx) => (
                      <span
                        key={idx}
                        className={`px-1 py-0.2 rounded text-[10px] font-mono font-bold border ${t.badgeClass}`}
                        title={`${t.tierName}四化：${t.star}化${t.type}`}
                      >
                        {t.label}
                      </span>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 宮位三代四化總覽條 */}
        {palaceTransforms.length > 0 && (
          <div className="flex flex-wrap gap-1.5 p-2 rounded-lg bg-slate-900/60 border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 mr-1 self-center">宮內四化：</span>
            {palaceTransforms.map((t, idx) => (
              <span
                key={idx}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold border ${t.badgeClass}`}
              >
                <span>{t.star}</span>
                <span className="font-extrabold">{t.label}</span>
              </span>
            ))}
          </div>
        )}

        {/* 吉星與煞星群 (Auxiliary & Malefic Stars) */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* 吉星 */}
          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-indigo-900/40 space-y-1">
            <div className="text-[11px] font-bold text-indigo-400">吉星輔曜</div>
            {p.auxiliaryStars.length === 0 ? (
              <span className="text-slate-500 text-[11px] italic">無</span>
            ) : (
              <div className="flex flex-wrap gap-1">
                {p.auxiliaryStars.map((s) => {
                  const aTransforms = computeStarTransforms(chart, s.name, selectedMajorLimitIndex, selectedAnnualYear);
                  return (
                    <span
                      key={s.name}
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-800/50 text-[11px]"
                    >
                      <span>{s.name}</span>
                      {aTransforms.map((t, idx) => (
                        <span key={idx} className={`px-0.5 rounded text-[9px] font-mono font-bold ${t.badgeClass}`}>
                          {t.label}
                        </span>
                      ))}
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {/* 煞星 */}
          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-rose-900/40 space-y-1">
            <div className="text-[11px] font-bold text-rose-400">煞星耗曜</div>
            {p.maleficStars.length === 0 ? (
              <span className="text-slate-500 text-[11px] italic">無</span>
            ) : (
              <div className="flex flex-wrap gap-1">
                {p.maleficStars.map((s) => (
                  <span
                    key={s.name}
                    className="px-1.5 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-800/50 text-[11px]"
                  >
                    {s.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // 渲染三方四正的小卡片
  const renderRelationCard = (
    target: PalaceInfo,
    relationTitle: string,
    colorStyle: string,
    textColor: string,
    isFocus: boolean = false,
  ) => {
    const overlay = computeOverlayPalaceNames(chart, target, selectedMajorLimitIndex, selectedAnnualYear);
    return (
      <button
        type="button"
        onClick={() => onSelectPalace(target.name)}
        className={`w-full text-left p-2.5 rounded-xl border transition-all ${colorStyle} ${
          isFocus ? 'ring-2 ring-amber-400 shadow-md' : 'hover:border-amber-500/60'
        }`}
      >
        <div className="flex items-center justify-between mb-1">
          <span className={`font-bold text-xs ${textColor}`}>
            {relationTitle} · {target.name}
          </span>
          <span className="font-mono text-[11px] text-slate-400">
            {target.stem}{target.branch}
          </span>
        </div>

        <div className="flex items-center gap-1 mb-1.5 flex-wrap">
          <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-purple-950 text-purple-300 border border-purple-800">
            {overlay.majorPalaceShort}
          </span>
          <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800">
            {overlay.annualPalaceShort}
          </span>
        </div>

        <div className="text-xs text-white font-serif font-bold truncate">
          {target.mainStars.map((s) => s.name).join('、') || '空宮借對'}
        </div>
      </button>
    );
  };

  return (
    <div className="w-full space-y-3.5">
      {/* 1. 手機端頂部命盤摘要與三盤合參控制器 */}
      <div className="bg-[#111827] rounded-xl border border-slate-800 shadow-lg p-3 space-y-2.5">
        {/* 折疊摘要列 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-amber-500/20 p-1 rounded-md text-amber-400 border border-amber-500/30">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-white text-sm">
                  {chart.birth.name || '紫微命盤'}
                </span>
                <span className="text-[11px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  {chart.birth.gender === 'male' ? '乾造' : '坤造'}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                {chart.ganzhi.yearGanZhi.name}年 {chart.wuxingJu.wuxingJu}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsSummaryExpanded((prev) => !prev)}
            className="flex items-center gap-1 text-xs text-amber-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 hover:bg-slate-800"
          >
            <span>{isSummaryExpanded ? '收合' : '命盤資訊'}</span>
            {isSummaryExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* 展開之完整生辰八字與五行局資訊 */}
        {isSummaryExpanded && (
          <div className="pt-2 border-t border-slate-800 text-xs space-y-1.5 text-slate-300">
            <div className="grid grid-cols-4 gap-1 text-center font-mono text-[11px] mb-2">
              <div className="bg-slate-900 p-1 rounded border border-slate-800">
                <div className="text-[9px] text-slate-500">年柱</div>
                <div className="font-bold text-slate-200">{chart.ganzhi.yearGanZhi.name}</div>
              </div>
              <div className="bg-slate-900 p-1 rounded border border-slate-800">
                <div className="text-[9px] text-slate-500">月柱</div>
                <div className="font-bold text-slate-200">{chart.ganzhi.monthGanZhi.name}</div>
              </div>
              <div className="bg-slate-900 p-1 rounded border border-slate-800">
                <div className="text-[9px] text-slate-500">日柱</div>
                <div className="font-bold text-slate-200">{chart.ganzhi.dayGanZhi.name}</div>
              </div>
              <div className="bg-slate-900 p-1 rounded border border-slate-800">
                <div className="text-[9px] text-slate-500">時柱</div>
                <div className="font-bold text-slate-200">{chart.ganzhi.hourGanZhi.name}</div>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">陽曆生辰</span>
              <span className="font-mono">{chart.calendar.solarDate} {chart.calendar.solarTime}</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">農曆生辰</span>
              <span>{chart.calendar.lunarMonthName}{chart.calendar.lunarDayName} {chart.calendar.hourBranch}時</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">命宮 / 身宮</span>
              <span className="font-mono text-emerald-400 font-bold">
                {chart.mingGong.stem}{chart.mingGong.branch} / {chart.shenGong.stem}{chart.shenGong.branch}
              </span>
            </div>
          </div>
        )}

        {/* 大限與流年快捷切換 */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/80">
          <div className="flex items-center gap-1.5 bg-slate-900/90 px-2 py-1.5 rounded-lg border border-purple-900/60 text-xs">
            <Clock className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <select
              value={activeMajorLimit.index}
              onChange={(e) => onSelectMajorLimitIndex?.(parseInt(e.target.value, 10))}
              className="bg-transparent text-purple-200 text-xs font-semibold focus:outline-none w-full cursor-pointer"
            >
              {chart.majorLimits.map((ml) => (
                <option key={ml.index} value={ml.index} className="bg-slate-900 text-white">
                  第{ml.index}限 {ml.startAge}-{ml.endAge}歲 ({ml.palace})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900/90 px-2 py-1.5 rounded-lg border border-cyan-900/60 text-xs">
            <Calendar className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <select
              value={activeAnnual.year}
              onChange={(e) => onSelectAnnualYear?.(parseInt(e.target.value, 10))}
              className="bg-transparent text-cyan-200 text-xs font-semibold focus:outline-none w-full cursor-pointer"
            >
              {chart.annualCharts.map((item) => (
                <option key={item.year} value={item.year} className="bg-slate-900 text-white">
                  {item.year}年 ({item.yearGan}{item.yearZhi}·{item.annualMingPalace})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 2. 手機版專屬十二宮橫向滑動切換列 (Palace Carousel Bar) */}
      <div className="relative">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 pt-0.5">
          {chart.palaces.map((p) => {
            const isSelected = p.name === selectedPalaceName;
            return (
              <button
                key={p.name}
                type="button"
                onClick={() => onSelectPalace(p.name)}
                className={`shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-bold'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                <span>{p.name}</span>
                <span className="text-[10px] font-mono opacity-80">{p.branch}</span>
                {p.isMingGong && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                )}
                {p.isShenGong && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-300"></span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. 手機版次級檢視分頁按鈕：焦點宮位 / 十二宮列表 / 微縮 4x4 天盤 */}
      <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs">
        <button
          type="button"
          onClick={() => setSubView('focus')}
          className={`flex-1 py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
            subView === 'focus'
              ? 'bg-amber-500 text-slate-950 shadow-xs'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          焦點宮位
        </button>

        <button
          type="button"
          onClick={() => setSubView('cards')}
          className={`flex-1 py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
            subView === 'cards'
              ? 'bg-amber-500 text-slate-950 shadow-xs'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <List className="w-3.5 h-3.5" />
          十二宮列表
        </button>

        <button
          type="button"
          onClick={() => setSubView('mini4x4')}
          className={`flex-1 py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
            subView === 'mini4x4'
              ? 'bg-amber-500 text-slate-950 shadow-xs'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Grid className="w-3.5 h-3.5" />
          微縮天盤
        </button>
      </div>

      {/* 4. 主要內容呈現區 */}
      {subView === 'focus' && (
        <div className="space-y-3.5">
          {/* 焦點宮位精緻大卡片 */}
          {renderHeroPalaceCard(currentPalace)}

          {/* 三方四正 2x2 矩陣聯動面板 */}
          <div className="bg-[#111827] rounded-2xl border border-slate-800 p-3.5 shadow-lg space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span>【{currentPalace.name}】三方四正照會</span>
              </div>
              <span className="text-[10px] text-slate-400">點擊卡片可切換焦點</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {renderRelationCard(currentPalace, '本宮', 'bg-amber-500/10 border-amber-500/50', 'text-amber-400', true)}
              {renderRelationCard(oppPalace, '對宮衝照', 'bg-rose-500/10 border-rose-500/40', 'text-rose-400')}
              {renderRelationCard(t1Palace, '三合宮位一', 'bg-indigo-500/10 border-indigo-500/40', 'text-indigo-400')}
              {renderRelationCard(t2Palace, '三合宮位二', 'bg-indigo-500/10 border-indigo-500/40', 'text-indigo-400')}
            </div>

            {/* 夾宮輔助列 */}
            <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => onSelectPalace(s1Palace.name)}
                className="p-2 rounded-lg bg-teal-500/10 border border-teal-500/30 text-left hover:border-teal-400"
              >
                <div className="text-[10px] text-teal-400 font-semibold">夾宮前 ({s1Palace.name})</div>
                <div className="text-white font-mono text-[11px] truncate">
                  {s1Palace.mainStars.map((s) => s.name).join('、') || '無主星'}
                </div>
              </button>
              <button
                type="button"
                onClick={() => onSelectPalace(s2Palace.name)}
                className="p-2 rounded-lg bg-teal-500/10 border border-teal-500/30 text-left hover:border-teal-400"
              >
                <div className="text-[10px] text-teal-400 font-semibold">夾宮後 ({s2Palace.name})</div>
                <div className="text-white font-mono text-[11px] truncate">
                  {s2Palace.mainStars.map((s) => s.name).join('、') || '無主星'}
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {subView === 'cards' && (
        <div className="space-y-3">
          {chart.palaces.map((p) => {
            const isSelected = p.name === selectedPalaceName;
            return (
              <div
                key={p.name}
                onClick={() => onSelectPalace(p.name)}
                className={`cursor-pointer transition-all ${isSelected ? 'ring-2 ring-amber-400 rounded-2xl' : ''}`}
              >
                {renderHeroPalaceCard(p)}
              </div>
            );
          })}
        </div>
      )}

      {subView === 'mini4x4' && (
        <div className="bg-[#111827] rounded-2xl border border-slate-800 p-2.5 shadow-xl space-y-2">
          <div className="text-center text-xs text-amber-400 font-serif font-bold py-1">
            4x4 微縮天盤（點擊任一宮位即聚焦）
          </div>

          <div className="grid grid-cols-4 gap-1.5">
            {/* Row 1: 巳, 午, 未, 申 */}
            {['巳', '午', '未', '申'].map((branch) => {
              const p = chart.palaces.find((x) => x.branch === branch)!;
              const isSelected = p.name === selectedPalaceName;
              return (
                <button
                  key={branch}
                  type="button"
                  onClick={() => {
                    onSelectPalace(p.name);
                    setSubView('focus');
                  }}
                  className={`p-1.5 rounded-lg border text-left flex flex-col justify-between min-h-[64px] transition-all ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-400 shadow-xs'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[11px] text-amber-300 font-serif">{p.name}</span>
                    <span className="text-[9px] font-mono text-slate-500">{p.branch}</span>
                  </div>
                  <div className="text-[10px] text-white font-serif truncate">
                    {p.mainStars[0]?.name || '空宮'}
                  </div>
                  <div className="text-[9px] text-slate-400 font-mono">
                    {p.stem}{p.branch}
                  </div>
                </button>
              );
            })}

            {/* Row 2: 辰, [中堂 2x2], 酉 */}
            {(() => {
              const pChen = chart.palaces.find((x) => x.branch === '辰')!;
              const isChenSelected = pChen.name === selectedPalaceName;
              return (
                <button
                  type="button"
                  onClick={() => {
                    onSelectPalace(pChen.name);
                    setSubView('focus');
                  }}
                  className={`p-1.5 rounded-lg border text-left flex flex-col justify-between min-h-[64px] transition-all ${
                    isChenSelected
                      ? 'bg-amber-500/20 border-amber-400 shadow-xs'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[11px] text-amber-300 font-serif">{pChen.name}</span>
                    <span className="text-[9px] font-mono text-slate-500">辰</span>
                  </div>
                  <div className="text-[10px] text-white font-serif truncate">
                    {pChen.mainStars[0]?.name || '空宮'}
                  </div>
                  <div className="text-[9px] text-slate-400 font-mono">
                    {pChen.stem}辰
                  </div>
                </button>
              );
            })()}

            {/* 中堂微縮資訊 */}
            <div className="col-span-2 row-span-2 bg-[#0a0f1d] rounded-xl border border-slate-800 p-2 flex flex-col justify-between text-center">
              <div>
                <div className="font-serif font-bold text-amber-400 text-xs">
                  {chart.birth.name || '紫微命盤'}
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                  {chart.birth.gender === 'male' ? '乾造' : '坤造'} · {chart.wuxingJu.wuxingJu}
                </div>
              </div>
              <div className="text-[9px] text-slate-500 font-mono">
                {chart.calendar.solarDate}
              </div>
              <button
                type="button"
                onClick={onQuickLoadGolden}
                className="text-[9px] bg-amber-500/20 text-amber-300 py-0.5 px-1.5 rounded border border-amber-500/40 hover:bg-amber-500 hover:text-slate-950 transition-all font-semibold"
              >
                黃金測試一號
              </button>
            </div>

            {(() => {
              const pYou = chart.palaces.find((x) => x.branch === '酉')!;
              const isYouSelected = pYou.name === selectedPalaceName;
              return (
                <button
                  type="button"
                  onClick={() => {
                    onSelectPalace(pYou.name);
                    setSubView('focus');
                  }}
                  className={`p-1.5 rounded-lg border text-left flex flex-col justify-between min-h-[64px] transition-all ${
                    isYouSelected
                      ? 'bg-amber-500/20 border-amber-400 shadow-xs'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[11px] text-amber-300 font-serif">{pYou.name}</span>
                    <span className="text-[9px] font-mono text-slate-500">酉</span>
                  </div>
                  <div className="text-[10px] text-white font-serif truncate">
                    {pYou.mainStars[0]?.name || '空宮'}
                  </div>
                  <div className="text-[9px] text-slate-400 font-mono">
                    {pYou.stem}酉
                  </div>
                </button>
              );
            })()}

            {/* Row 3: 卯, 戌 */}
            {(() => {
              const pMao = chart.palaces.find((x) => x.branch === '卯')!;
              const isMaoSelected = pMao.name === selectedPalaceName;
              return (
                <button
                  type="button"
                  onClick={() => {
                    onSelectPalace(pMao.name);
                    setSubView('focus');
                  }}
                  className={`p-1.5 rounded-lg border text-left flex flex-col justify-between min-h-[64px] transition-all ${
                    isMaoSelected
                      ? 'bg-amber-500/20 border-amber-400 shadow-xs'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[11px] text-amber-300 font-serif">{pMao.name}</span>
                    <span className="text-[9px] font-mono text-slate-500">卯</span>
                  </div>
                  <div className="text-[10px] text-white font-serif truncate">
                    {pMao.mainStars[0]?.name || '空宮'}
                  </div>
                  <div className="text-[9px] text-slate-400 font-mono">
                    {pMao.stem}卯
                  </div>
                </button>
              );
            })()}

            {(() => {
              const pXu = chart.palaces.find((x) => x.branch === '戌')!;
              const isXuSelected = pXu.name === selectedPalaceName;
              return (
                <button
                  type="button"
                  onClick={() => {
                    onSelectPalace(pXu.name);
                    setSubView('focus');
                  }}
                  className={`p-1.5 rounded-lg border text-left flex flex-col justify-between min-h-[64px] transition-all ${
                    isXuSelected
                      ? 'bg-amber-500/20 border-amber-400 shadow-xs'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[11px] text-amber-300 font-serif">{pXu.name}</span>
                    <span className="text-[9px] font-mono text-slate-500">戌</span>
                  </div>
                  <div className="text-[10px] text-white font-serif truncate">
                    {pXu.mainStars[0]?.name || '空宮'}
                  </div>
                  <div className="text-[9px] text-slate-400 font-mono">
                    {pXu.stem}戌
                  </div>
                </button>
              );
            })()}

            {/* Row 4: 寅, 丑, 子, 亥 */}
            {['寅', '丑', '子', '亥'].map((branch) => {
              const p = chart.palaces.find((x) => x.branch === branch)!;
              const isSelected = p.name === selectedPalaceName;
              return (
                <button
                  key={branch}
                  type="button"
                  onClick={() => {
                    onSelectPalace(p.name);
                    setSubView('focus');
                  }}
                  className={`p-1.5 rounded-lg border text-left flex flex-col justify-between min-h-[64px] transition-all ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-400 shadow-xs'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[11px] text-amber-300 font-serif">{p.name}</span>
                    <span className="text-[9px] font-mono text-slate-500">{p.branch}</span>
                  </div>
                  <div className="text-[10px] text-white font-serif truncate">
                    {p.mainStars[0]?.name || '空宮'}
                  </div>
                  <div className="text-[9px] text-slate-400 font-mono">
                    {p.stem}{p.branch}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
