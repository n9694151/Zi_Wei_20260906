/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ChartJson } from '../ziwei/types/chart';
import { Clock, Calendar, ArrowRight } from 'lucide-react';

interface LimitsPanelProps {
  chart: ChartJson;
  limitDirectionRule?: 'auto' | 'clockwise' | 'counterClockwise';
  onChangeLimitDirection?: (rule: 'auto' | 'clockwise' | 'counterClockwise') => void;
}

export const LimitsPanel: React.FC<LimitsPanelProps> = ({
  chart,
  limitDirectionRule = 'auto',
  onChangeLimitDirection,
}) => {
  const [selectedYear, setSelectedYear] = useState<number>(
    chart.annualCharts[0]?.year || parseInt(chart.calendar.solarDate.slice(0, 4), 10),
  );

  const currentAnnual = chart.annualCharts.find((a) => a.year === selectedYear) || chart.annualCharts[0];
  const isClockwise = chart.majorLimits[0]?.direction === 'clockwise';

  return (
    <div className="bg-[#111827] rounded-xl border border-slate-800 shadow-xl p-4 sm:p-6 space-y-6 text-slate-200">
      {/* 1. Major Limits (大限) */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            <h3 className="font-serif font-bold text-base sm:text-lg text-white">
              十年大限行運步序
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 font-medium">
              當前：{isClockwise ? '陽男/陰女 順行（時針）' : '陰男/陽女 逆行（逆時針）'}
            </span>
          </div>

          {/* 互動式行運步序選擇按鈕 */}
          {onChangeLimitDirection && (
            <div className="flex flex-wrap items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-700/80 text-xs shadow-inner">
              <span className="text-slate-400 px-1.5 text-[11px] font-medium hidden sm:inline">切換步序：</span>
              <button
                type="button"
                onClick={() => onChangeLimitDirection('auto')}
                className={`px-3 py-1.5 rounded-lg transition-all text-xs font-semibold ${
                  (!limitDirectionRule || limitDirectionRule === 'auto')
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                自動推算
              </button>
              <button
                type="button"
                onClick={() => onChangeLimitDirection('clockwise')}
                className={`px-3 py-1.5 rounded-lg transition-all text-xs font-semibold ${
                  limitDirectionRule === 'clockwise'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                順行（命➜父➜福）
              </button>
              <button
                type="button"
                onClick={() => onChangeLimitDirection('counterClockwise')}
                className={`px-3 py-1.5 rounded-lg transition-all text-xs font-semibold ${
                  limitDirectionRule === 'counterClockwise'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                逆行（命➜兄➜夫）
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
          {chart.majorLimits.map((ml) => (
            <div
              key={ml.index}
              className="p-3 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800/80 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span className="font-mono font-medium">{ml.startAge}-{ml.endAge}歲</span>
                <span className="text-[10px] text-slate-500">第{ml.index}限</span>
              </div>
              <div className="font-serif font-bold text-sm text-amber-400">
                {ml.palace}
              </div>
              <div className="text-xs font-mono text-indigo-400 font-semibold mt-0.5">
                {ml.stem}{ml.branch}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Annual Charts (流年) */}
      <div className="pt-4 border-t border-slate-800">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-500" />
            <h3 className="font-serif font-bold text-base sm:text-lg text-white">流年太歲行度（首12年）</h3>
          </div>
          <span className="text-xs text-slate-400">點擊年份切換流年盤</span>
        </div>

        {/* Year Pills */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {chart.annualCharts.map((item) => {
            const isSelected = item.year === selectedYear;
            return (
              <button
                key={item.year}
                type="button"
                onClick={() => setSelectedYear(item.year)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700/80'
                }`}
              >
                {item.year}年 ({item.age}歲)
              </button>
            );
          })}
        </div>

        {/* Current Selected Annual Detail Card */}
        {currentAnnual && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/30">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-lg text-amber-400">
                  {currentAnnual.year} {currentAnnual.yearGan}{currentAnnual.yearZhi}年
                </span>
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  虛歲 {currentAnnual.age} 歲
                </span>
              </div>

              <div className="text-xs text-slate-300">
                流年命宮：<strong className="font-bold text-amber-300">{currentAnnual.annualMingPalace}</strong>（地支{currentAnnual.annualMingBranch}位）
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-slate-300 mb-1.5">
                {currentAnnual.yearGan}年流年四化：
              </div>
              <div className="flex flex-wrap gap-2">
                {currentAnnual.annualTransformations.map((t, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200"
                  >
                    <span className="text-amber-300">{t.star}</span>
                    <span className="text-amber-400 font-bold">化{t.type}</span>
                    <span className="text-slate-400 text-[10px]">（本命{t.palace}）</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
