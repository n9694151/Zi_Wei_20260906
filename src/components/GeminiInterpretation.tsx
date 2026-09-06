/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ChartJson } from '../ziwei/types/chart';
import { CombinedAnalysisResult } from '../ziwei/types/analysis';
import { Bot, Sparkles, Send, ShieldCheck, Loader2 } from 'lucide-react';

interface GeminiInterpretationProps {
  chart: ChartJson;
  analysis: CombinedAnalysisResult;
}

export const GeminiInterpretation: React.FC<GeminiInterpretationProps> = ({ chart, analysis }) => {
  const [question, setQuestion] = useState<string>('');
  const [selectedSchool, setSelectedSchool] = useState<string>('combined');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<string | null>(null);

  const presets = [
    '全盤整體格局、性情稟賦與人生總綱論斷',
    '官祿與財帛分析：事業創業天賦、適合領域與求財方向',
    '夫妻宮與情感姻緣：婚姻狀態、伴侶特質與相處之道',
    '未來十年大運走勢重點與流年趨吉避凶指南',
  ];

  const handleAsk = async (queryText?: string) => {
    const q = queryText || question;
    setLoading(true);

    try {
      const resp = await fetch('/api/gemini/interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chart,
          analysis,
          userQuestion: q,
          school: selectedSchool,
        }),
      });

      const data = await resp.json();
      if (data.interpretation) {
        setResult(data.interpretation);
      } else {
        setResult('無法取得解讀結果，請稍後重試。');
      }
    } catch (err: any) {
      setResult(`連線錯誤：${err.message || '伺服器異常'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#111827] rounded-xl border border-slate-800 shadow-xl p-4 sm:p-6 space-y-5 text-slate-200">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-base sm:text-lg text-white flex items-center gap-2">
              Gemini AI 紫微大師深度解讀
              <span className="text-[11px] font-sans font-normal px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 inline-flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                排盤由引擎計算 · AI 僅負責解讀
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              嚴格遵循最高原則：排盤數據 100% 來自後端數學引擎，AI 僅基於確定性命盤與四大流派數據提供深度解析。
            </p>
          </div>
        </div>

        {/* School Focus Selector */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">解讀視角：</span>
          <select
            value={selectedSchool}
            onChange={(e) => setSelectedSchool(e.target.value)}
            className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs font-medium focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="combined">四大流派綜合會通</option>
            <option value="sanHe">三合派（重格局星曜與吉煞）</option>
            <option value="feiXing">飛星派（重宮干化入化出動態）</option>
            <option value="heLuo">河洛派（重數理天地體用氣數）</option>
            <option value="qinTian">欽天派（重來因宮因果與質能）</option>
          </select>
        </div>
      </div>

      {/* Preset Questions */}
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-2">快速快捷提問：</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {presets.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setQuestion(preset);
                handleAsk(preset);
              }}
              disabled={loading}
              className="text-left px-3 py-2.5 rounded-xl text-xs bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 transition-colors flex items-center justify-between"
            >
              <span>{preset}</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 ml-1.5" />
            </button>
          ))}
        </div>
      </div>

      {/* Input box */}
      <div className="flex gap-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="輸入特定提問，例如：今年流年與命盤中的破軍星如何互動？..."
          className="flex-1 px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAsk();
          }}
        />
        <button
          type="button"
          onClick={() => handleAsk()}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs sm:text-sm font-bold shadow-xs transition-all disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              解析中...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              送出問答
            </>
          )}
        </button>
      </div>

      {/* Interpretation Output Display */}
      {result && (
        <div className="p-4 sm:p-5 rounded-xl bg-[#0a0f1d] border border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
            <span className="font-serif font-bold text-sm text-amber-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              大師論斷結果
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              依據命盤 JSON 確定性特徵推演
            </span>
          </div>

          <div className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
            {result}
          </div>
        </div>
      )}
    </div>
  );
};
