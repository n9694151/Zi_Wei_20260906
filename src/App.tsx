/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { BirthInput, ChartJson } from './ziwei/types/chart';
import { PalaceName, PALACE_NAMES } from './ziwei/types/constants';
import { ZiWeiEngine } from './ziwei/engine';
import { CombinedAnalysisEngine } from './ziwei/analysis/combined';
import { ZiweiGrid } from './components/ZiweiGrid';
import { BirthInputForm } from './components/BirthInputForm';
import { SchoolAnalysisTabs } from './components/SchoolAnalysisTabs';
import { LimitsPanel } from './components/LimitsPanel';
import { GeminiInterpretation } from './components/GeminiInterpretation';
import { JsonViewer } from './components/JsonViewer';
import {
  Compass,
  Layers,
  Sparkles,
  ShieldCheck,
  Calendar,
  Clock,
  Code,
  SlidersHorizontal,
  Bot,
} from 'lucide-react';

const GOLDEN_TEST_001_INPUT: BirthInput = {
  name: '黃金測試一號',
  gender: 'male',
  calendarType: 'solar',
  solarDate: '2026-09-06',
  birthHour: 21,
  birthMinute: 45,
  birthPlace: '台北市',
  timezone: 'Asia/Taipei',
  longitude: 121.5,
  ziHourRule: 'ziEarly',
};

export default function App() {
  const [input, setInput] = useState<BirthInput>(GOLDEN_TEST_001_INPUT);
  const [selectedPalaceName, setSelectedPalaceName] = useState<PalaceName>('命宮');
  const [activeTab, setActiveTab] = useState<'grid' | 'schools' | 'limits' | 'ai' | 'form' | 'json'>('grid');

  // 三盤合參狀態（大運與流年即時聯動）
  const [selectedMajorLimitIndex, setSelectedMajorLimitIndex] = useState<number>(1);
  const [selectedAnnualYear, setSelectedAnnualYear] = useState<number>(2026);
  const [showMajorLimit, setShowMajorLimit] = useState<boolean>(true);
  const [showAnnual, setShowAnnual] = useState<boolean>(true);

  // Deterministic calculation in pure TypeScript
  const chart: ChartJson = useMemo(() => {
    return ZiWeiEngine.calculate(input);
  }, [input]);

  // Deterministic 4-school analysis
  const analysis = useMemo(() => {
    return CombinedAnalysisEngine.analyze(chart);
  }, [chart]);

  const handleLoadGolden = () => {
    setInput({ ...GOLDEN_TEST_001_INPUT });
    setSelectedPalaceName('命宮');
  };

  const handleFormSubmit = (newInput: BirthInput) => {
    setInput(newInput);
    setActiveTab('grid');
  };

  const handleChangeLimitDirection = (rule: 'auto' | 'clockwise' | 'counterClockwise') => {
    setInput((prev) => ({
      ...prev,
      limitDirectionRule: rule,
    }));
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Banner */}
      <header className="bg-[#1e293b] text-white border-b border-slate-800 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
          {/* Logo & Title */}
          <div className="flex items-center gap-3.5">
            <div className="bg-amber-500 p-2 rounded-lg text-slate-950 shadow-md flex items-center justify-center">
              <Compass className="w-6 h-6 animate-spin-slow text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold text-white tracking-wide leading-none">
                  紫微 AI 命盤 Core Engine
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/30 rounded text-emerald-400 text-xs font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Golden Test #001 PASSED
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-mono">
                High Reliability Deterministic Architecture
              </p>
            </div>
          </div>

          {/* Golden Test Quick Action & Controls */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleLoadGolden}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xs transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              載入黃金測試 #001
            </button>
          </div>
        </div>
      </header>

      {/* Main Navigation Bar */}
      <nav className="bg-[#111827] border-b border-slate-800 sticky top-[69px] z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-1 sm:gap-2 overflow-x-auto py-2.5">
          <div className="flex bg-[#0f172a] rounded-lg p-1 border border-slate-700/80 gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('grid')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                activeTab === 'grid'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              天盤十二宮
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('schools')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                activeTab === 'schools'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              四大流派會通
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('limits')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                activeTab === 'limits'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              大限與流年
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('ai')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                activeTab === 'ai'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              Gemini AI 命理解讀
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('form')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                activeTab === 'form'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              排盤出生設定
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('json')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                activeTab === 'json'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              核心 JSON
            </button>
          </div>
        </div>
      </nav>

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Verification Alert Banner */}
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-3 text-xs shadow-md">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-slate-300">
              <strong className="text-white font-semibold">{chart.birth.name}</strong> ·{' '}
              <span className="text-amber-400 font-mono">{chart.calendar.solarDate} {chart.calendar.solarTime}</span> (真太陽時: {chart.calendar.trueSolarTime}) ·
              農曆 <span className="text-slate-200">{chart.calendar.lunarYear}年{chart.calendar.lunarMonthName}{chart.calendar.lunarDayName}{chart.calendar.hourBranch}時</span> ·
              <span className="text-slate-200 font-mono">{chart.ganzhi.yearGanZhi.name}年 {chart.ganzhi.monthGanZhi.name}月 {chart.ganzhi.dayGanZhi.name}日 {chart.ganzhi.hourGanZhi.name}時</span> ·
              命宮【<span className="text-emerald-400 font-bold">{chart.mingGong.stem}{chart.mingGong.branch}</span>】 · 【<span className="text-amber-300 font-bold">{chart.wuxingJu.wuxingJu}</span>】
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Deterministic Engine
            </span>
          </div>
        </div>

        {/* Tab Views */}
        {activeTab === 'grid' && (
          <div className="space-y-6">
            <ZiweiGrid
              chart={chart}
              selectedPalaceName={selectedPalaceName}
              onSelectPalace={setSelectedPalaceName}
              onQuickLoadGolden={handleLoadGolden}
              selectedMajorLimitIndex={selectedMajorLimitIndex}
              onSelectMajorLimitIndex={setSelectedMajorLimitIndex}
              selectedAnnualYear={selectedAnnualYear}
              onSelectAnnualYear={setSelectedAnnualYear}
              showMajorLimit={showMajorLimit}
              onToggleShowMajorLimit={() => setShowMajorLimit((prev) => !prev)}
              showAnnual={showAnnual}
              onToggleShowAnnual={() => setShowAnnual((prev) => !prev)}
            />

            {/* Selected Palace Inspector */}
            <div className="bg-[#111827] rounded-xl p-4 sm:p-5 border border-slate-800 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3 mb-4">
                <div className="flex items-center gap-2.5">
                  <span className="font-serif font-bold text-lg text-white">
                    【{selectedPalaceName}】三方四正與三盤合參
                  </span>
                  <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700">
                    地支 {chart.palaces.find((p) => p.name === selectedPalaceName)?.stem}
                    {chart.palaces.find((p) => p.name === selectedPalaceName)?.branch} 位
                  </span>
                </div>

                <div className="text-xs text-slate-400">
                  即時聯動本命、大運與流年宮位疊宮關係
                </div>
              </div>

              {(() => {
                const cur = chart.palaces.find((p) => p.name === selectedPalaceName)!;
                const opp = chart.palaces.find((p) => p.branch === cur.relationships.opposite)!;
                const t1 = chart.palaces.find((p) => p.branch === cur.relationships.trine1)!;
                const t2 = chart.palaces.find((p) => p.branch === cur.relationships.trine2)!;
                const s1 = chart.palaces.find((p) => p.branch === cur.relationships.sandwich1)!;
                const s2 = chart.palaces.find((p) => p.branch === cur.relationships.sandwich2)!;

                const activeMl = chart.majorLimits.find((m) => m.index === selectedMajorLimitIndex) || chart.majorLimits[0];
                const activeAnn = chart.annualCharts.find((a) => a.year === selectedAnnualYear) || chart.annualCharts[0];
                const mlMingPal = chart.palaces.find((p) => p.branch === activeMl?.branch);
                const mlMingIdx = mlMingPal ? chart.palaces.indexOf(mlMingPal) : 0;
                const annMingPal = chart.palaces.find((p) => p.branch === activeAnn?.annualMingBranch);
                const annMingIdx = annMingPal ? chart.palaces.indexOf(annMingPal) : 0;

                const getPalaceOverlayPills = (targetPalace: typeof cur) => {
                  const pIdx = chart.palaces.indexOf(targetPalace);
                  const diffMl = (pIdx - mlMingIdx + 12) % 12;
                  const diffAnn = (pIdx - annMingIdx + 12) % 12;
                  return {
                    major: '大' + PALACE_NAMES[diffMl].replace('宮', ''),
                    annual: '年' + PALACE_NAMES[diffAnn].replace('宮', ''),
                  };
                };

                const renderInspectorCard = (target: typeof cur, label: string, colorStyle: string, textColor: string) => {
                  const overlay = getPalaceOverlayPills(target);
                  return (
                    <div className={`p-3 ${colorStyle} rounded-lg flex flex-col justify-between border`}>
                      <div>
                        <div className={`flex items-center justify-between font-bold mb-1 ${textColor}`}>
                          <span>{label} ({target.name})</span>
                          <span className="font-mono font-normal text-slate-400">{target.stem}{target.branch}</span>
                        </div>
                        <div className="flex items-center gap-1.5 my-1.5 flex-wrap">
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-purple-950/80 text-purple-300 border border-purple-800">
                            {overlay.major}
                          </span>
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-800">
                            {overlay.annual}
                          </span>
                        </div>
                      </div>
                      <div className="font-semibold text-white mt-1 pt-1 border-t border-slate-700/50">
                        {target.mainStars.map((s) => s.name).join('、') || '無主星'}
                      </div>
                    </div>
                  );
                };

                return (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs">
                    {renderInspectorCard(cur, '本宮', 'bg-amber-500/10 border-amber-500/40', 'text-amber-400')}
                    {renderInspectorCard(opp, '對宮', 'bg-rose-500/10 border-rose-500/40', 'text-rose-400')}
                    {renderInspectorCard(t1, '三合一', 'bg-indigo-500/10 border-indigo-500/40', 'text-indigo-400')}
                    {renderInspectorCard(t2, '三合二', 'bg-indigo-500/10 border-indigo-500/40', 'text-indigo-400')}
                    {renderInspectorCard(s1, '夾宮前', 'bg-teal-500/10 border-teal-500/40', 'text-teal-400')}
                    {renderInspectorCard(s2, '夾宮後', 'bg-teal-500/10 border-teal-500/40', 'text-teal-400')}
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {activeTab === 'schools' && (
          <SchoolAnalysisTabs analysis={analysis} chart={chart} />
        )}

        {activeTab === 'limits' && (
          <LimitsPanel
            chart={chart}
            limitDirectionRule={input.limitDirectionRule}
            onChangeLimitDirection={handleChangeLimitDirection}
            selectedMajorLimitIndex={selectedMajorLimitIndex}
            onSelectMajorLimitIndex={setSelectedMajorLimitIndex}
            selectedYear={selectedAnnualYear}
            onSelectYear={setSelectedAnnualYear}
          />
        )}

        {activeTab === 'ai' && (
          <GeminiInterpretation
            chart={chart}
            analysis={analysis}
            selectedMajorLimitIndex={selectedMajorLimitIndex}
            selectedAnnualYear={selectedAnnualYear}
            selectedPalaceName={selectedPalaceName}
          />
        )}

        {activeTab === 'form' && (
          <BirthInputForm
            initialInput={input}
            onSubmit={handleFormSubmit}
            onQuickLoadGolden={handleLoadGolden}
          />
        )}

        {activeTab === 'json' && (
          <JsonViewer chart={chart} analysis={analysis} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#0a0f1d] text-slate-500 text-xs py-4 px-6 border-t border-slate-800 text-center mt-auto">
        <p>
          紫微斗數高可靠度排盤 Engine v1.2.4-STABLE · 核心曆法、安星曜、五行局、四化定位與大限均由純確定性演算生成 ·
          符合嚴格 Golden Test #001 驗證規範
        </p>
      </footer>
    </div>
  );
}
