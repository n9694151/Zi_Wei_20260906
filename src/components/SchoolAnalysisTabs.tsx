/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CombinedAnalysisResult } from '../ziwei/types/analysis';
import { ChartJson } from '../ziwei/types/chart';
import { Layers, GitBranch, Binary, Zap, Scale } from 'lucide-react';

interface SchoolAnalysisTabsProps {
  analysis: CombinedAnalysisResult;
  chart: ChartJson;
}

export const SchoolAnalysisTabs: React.FC<SchoolAnalysisTabsProps> = ({ analysis, chart }) => {
  const [activeTab, setActiveTab] = useState<'combined' | 'sanHe' | 'feiXing' | 'heLuo' | 'qinTian'>('combined');

  const tabs = [
    { id: 'combined', label: '四大流派會通', icon: Scale },
    { id: 'sanHe', label: '三合派（星性格局）', icon: Layers },
    { id: 'feiXing', label: '飛星派（化象動態）', icon: GitBranch },
    { id: 'heLuo', label: '河洛派（數理體用）', icon: Binary },
    { id: 'qinTian', label: '欽天派（因果質能）', icon: Zap },
  ] as const;

  return (
    <div className="bg-[#111827] rounded-xl border border-slate-800 shadow-xl p-4 sm:p-6 text-slate-200">
      {/* Tab Buttons */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3 mb-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700/80'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content Panels */}
      {activeTab === 'combined' && (
        <div className="space-y-4">
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
            <h4 className="font-serif font-bold text-amber-400 text-sm mb-2">四大流派核心共識點</h4>
            <ul className="space-y-1.5 text-xs text-amber-200/90 list-disc list-inside">
              {analysis.commonPoints.map((pt, i) => (
                <li key={i}>{pt}</li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
              <h4 className="font-serif font-bold text-white text-sm mb-2">四大流派論斷著眼差異</h4>
              <ul className="space-y-2 text-xs text-slate-300">
                {analysis.differences.map((diff, i) => (
                  <li key={i} className="border-l-2 border-amber-500/60 pl-2.5">
                    {diff}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
              <h4 className="font-serif font-bold text-white text-sm mb-2">關鍵確定性強證據</h4>
              <ul className="space-y-1 text-xs text-emerald-300/90 list-disc list-inside mb-3">
                {analysis.strongEvidence.map((ev, i) => (
                  <li key={i}>{ev}</li>
                ))}
              </ul>

              <h4 className="font-serif font-bold text-slate-400 text-sm mt-3 mb-1">後天變數與待驗證點</h4>
              <ul className="space-y-1 text-xs text-slate-400 list-disc list-inside">
                {analysis.uncertainPoints.map((un, i) => (
                  <li key={i}>{un}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="p-4 bg-[#0a0f1d] border border-amber-500/30 rounded-xl">
            <h4 className="font-serif font-bold text-amber-400 text-sm mb-1.5">流派會通總綱</h4>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              {analysis.finalSynthesis}
            </p>
          </div>
        </div>
      )}

      {activeTab === 'sanHe' && (
        <div className="space-y-4 text-xs">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
            <h4 className="font-serif font-bold text-white text-sm mb-2">三方四正架構（以本命宮為核心）</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3">
              <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700">
                <span className="text-slate-400 text-[10px]">本宮</span>
                <div className="font-bold text-amber-400 text-sm">{analysis.sanHe.sanFangSiZheng.benGong}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700">
                <span className="text-slate-400 text-[10px]">對宮</span>
                <div className="font-bold text-rose-400 text-sm">{analysis.sanHe.sanFangSiZheng.duiGong}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700">
                <span className="text-slate-400 text-[10px]">三合宮一</span>
                <div className="font-bold text-indigo-400 text-sm">{analysis.sanHe.sanFangSiZheng.trine1}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700">
                <span className="text-slate-400 text-[10px]">三合宮二</span>
                <div className="font-bold text-indigo-400 text-sm">{analysis.sanHe.sanFangSiZheng.trine2}</div>
              </div>
            </div>

            <div className="space-y-2">
              <div>
                <span className="font-bold text-slate-400">三方四正主星：</span>
                <span className="text-slate-200">{analysis.sanHe.mainStarsSummary.join(' · ')}</span>
              </div>
              <div>
                <span className="font-bold text-slate-400">吉曜聚會：</span>
                <span className="text-indigo-300">{analysis.sanHe.luckyStarsSummary.join(' · ') || '無吉星會合'}</span>
              </div>
              <div>
                <span className="font-bold text-slate-400">煞曜牽制：</span>
                <span className="text-rose-300">{analysis.sanHe.maleficStarsSummary.join(' · ') || '無煞星會合'}</span>
              </div>
            </div>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl">
            <h4 className="font-serif font-bold text-amber-400 text-sm mb-1">事業官祿與財富格局</h4>
            <p className="text-xs text-amber-200/90 leading-relaxed">{analysis.sanHe.careerAndWealthFocus}</p>
          </div>
        </div>
      )}

      {activeTab === 'feiXing' && (
        <div className="space-y-4 text-xs">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
            <h4 className="font-serif font-bold text-white text-sm mb-2">十二宮天干飛化（祿權科忌之動態軌跡）</h4>
            <p className="text-slate-300 mb-3">{analysis.feiXing.majorLimitInfluence}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-1">
              {analysis.feiXing.flyingTransforms.map((f, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-200">
                      {f.sourcePalace}({f.sourceGan})
                    </span>
                    <span className="text-slate-500">→</span>
                    <span className="font-semibold text-amber-400">
                      {f.targetPalace}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    化{f.type}入 [{f.star}]
                    {f.direction === 'selfTransform' && <span className="ml-1 text-rose-400 font-bold">(自化)</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'heLuo' && (
        <div className="space-y-4 text-xs">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
            <h4 className="font-serif font-bold text-white text-sm mb-2">河圖洛書體用數理</h4>
            <p className="text-slate-300 leading-relaxed mb-3">{analysis.heLuo.heLuoStructure}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {analysis.heLuo.palaceNumbers.slice(0, 6).map((item) => (
                <div key={item.number} className="p-2.5 bg-slate-800/80 rounded-lg border border-slate-700">
                  <div className="font-semibold text-amber-400">
                    第{item.number}宮：{item.palace}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{item.relation}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'qinTian' && (
        <div className="space-y-4 text-xs">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
            <h4 className="font-serif font-bold text-white text-sm mb-2">欽天四化（來因因果與向心/離心力）</h4>
            <div className="space-y-2 mb-3">
              {analysis.qinTian.flyingInOutSummary.map((summary, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-200">
                  {summary}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
