/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ChartJson } from '../ziwei/types/chart';
import { CombinedAnalysisResult } from '../ziwei/types/analysis';
import {
  generateExpertPrompt,
  generateLocalMasterInterpretation,
} from '../ziwei/analysis/interpreter';
import {
  Bot,
  Sparkles,
  Send,
  ShieldCheck,
  Loader2,
  ExternalLink,
  Copy,
  Check,
  Zap,
} from 'lucide-react';

interface GeminiInterpretationProps {
  chart: ChartJson;
  analysis: CombinedAnalysisResult;
}

export const GeminiInterpretation: React.FC<GeminiInterpretationProps> = ({
  chart,
  analysis,
}) => {
  const [question, setQuestion] = useState<string>('');
  const [selectedSchool, setSelectedSchool] = useState<string>('combined');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<string | null>(null);
  const [copiedStatus, setCopiedStatus] = useState<string | null>(null);

  const presets = [
    '全盤整體格局、性情稟賦與人生總綱論斷',
    '官祿與財帛分析：事業創業天賦、適合領域與求財方向',
    '夫妻宮與情感姻緣：婚姻狀態、伴侶特質與相處之道',
    '未來十年大運走勢重點與流年趨吉避凶指南',
  ];

  // 複製提示訊息自動消失
  const triggerCopyFeedback = (msg: string) => {
    setCopiedStatus(msg);
    setTimeout(() => setCopiedStatus(null), 4000);
  };

  const handleAsk = async (queryText?: string) => {
    const q = queryText || question;
    setLoading(true);

    try {
      // 優先嘗試連線至後端伺服器（本地全端模式）
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const resp = await fetch('/api/gemini/interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          chart,
          analysis,
          userQuestion: q,
          school: selectedSchool,
        }),
      }).catch(() => null);

      clearTimeout(timeoutId);

      // 若後端 API 存在且回傳合法 JSON
      if (resp && resp.ok) {
        const contentType = resp.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = await resp.json();
          if (data && data.interpretation) {
            setResult(data.interpretation);
            return;
          }
        }
      }

      // 若處於 GitHub Pages 靜態網站或無伺服器環境：直接使用確定性大師級純前端引擎解讀
      // 免去使用者配置任何 GEMINI_API_KEY，且保證 100% 絕不報錯！
      const localResult = generateLocalMasterInterpretation(
        chart,
        analysis,
        q,
        selectedSchool
      );
      setResult(localResult);
    } catch {
      // 萬無一失的 Fallback 保障
      const fallbackResult = generateLocalMasterInterpretation(
        chart,
        analysis,
        q,
        selectedSchool
      );
      setResult(fallbackResult);
    } finally {
      setLoading(false);
    }
  };

  // 一鍵前往 Google AI (Gemini Web) 進行免費深入對話
  const handleOpenGoogleAIWeb = async () => {
    const prompt = generateExpertPrompt(chart, analysis, question, selectedSchool);

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(prompt);
      }
    } catch (err) {
      console.warn('Clipboard write failed:', err);
    }

    triggerCopyFeedback('已將「紫微命盤完整結構與提問」複製到剪貼簿！已為您在新分頁開啟 Google Gemini，直接貼上（Ctrl+V）即可免費詢問！');

    // 開啟 Google Gemini 官方免費對話網頁（無需 API Key）
    window.open('https://gemini.google.com/app', '_blank', 'noopener,noreferrer');
  };

  // 僅複製當前大師論斷結果
  const handleCopyResult = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      triggerCopyFeedback('大師論斷結果已複製到剪貼簿！');
    } catch {
      triggerCopyFeedback('複製失敗，請手動反白選取複製。');
    }
  };

  // 複製提供給 AI 的完整 Prompt
  const handleCopyPrompt = async () => {
    const prompt = generateExpertPrompt(chart, analysis, question, selectedSchool);
    try {
      await navigator.clipboard.writeText(prompt);
      triggerCopyFeedback('Google AI 完整專家提示詞（Prompt）已複製到剪貼簿！');
    } catch {
      triggerCopyFeedback('複製失敗，請手動反白選取。');
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
            <h3 className="font-serif font-bold text-base sm:text-lg text-white flex flex-wrap items-center gap-2">
              Google AI 紫微大師深度解讀
              <span className="text-[11px] font-sans font-normal px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 inline-flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                確定性引擎合成 · 免 API Key
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              排盤數據 100% 來自確定性數學引擎。點擊即可在瀏覽器直接取得深度論斷，或一鍵帶入 Google AI 免費深度詢問。
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

      {/* Input box & Actions */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="輸入特定提問，例如：命宮主星與三方四正格局如何？未來適合創業嗎？..."
            className="flex-1 px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAsk();
            }}
          />
          <button
            type="button"
            onClick={() => handleAsk()}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs sm:text-sm font-bold shadow-xs transition-all disabled:opacity-50 shrink-0"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                解析中...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                大師論斷
              </>
            )}
          </button>
        </div>

        {/* Action button: Direct to Google AI Gemini Web */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
          <button
            type="button"
            onClick={handleOpenGoogleAIWeb}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 font-medium transition-colors"
          >
            <Zap className="w-3.5 h-3.5 text-blue-400" />
            帶入命盤前往 Google AI (Gemini) 免費對話
            <ExternalLink className="w-3 h-3 text-blue-400 ml-0.5" />
          </button>

          <button
            type="button"
            onClick={handleCopyPrompt}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <Copy className="w-3 h-3" />
            複製 Google AI 專家提示詞 (Prompt)
          </button>
        </div>
      </div>

      {/* Copy Notification Toast */}
      {copiedStatus && (
        <div className="p-3 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{copiedStatus}</span>
        </div>
      )}

      {/* Interpretation Output Display */}
      {result && (
        <div className="p-4 sm:p-5 rounded-xl bg-[#0a0f1d] border border-slate-800 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <span className="font-serif font-bold text-sm text-amber-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              大師論斷結果
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyResult}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors"
              >
                <Copy className="w-3 h-3 text-slate-400" />
                複製結果
              </button>
              <button
                type="button"
                onClick={handleOpenGoogleAIWeb}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-mono border border-amber-500/40 transition-colors"
              >
                <ExternalLink className="w-3 h-3 text-amber-400" />
                至 Google AI 深入追問
              </button>
            </div>
          </div>

          <div className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
            {result}
          </div>
        </div>
      )}
    </div>
  );
};
