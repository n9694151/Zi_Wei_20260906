/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ChartJson } from '../ziwei/types/chart';
import { CombinedAnalysisResult } from '../ziwei/types/analysis';
import { Code, Copy, Check } from 'lucide-react';

interface JsonViewerProps {
  chart: ChartJson;
  analysis: CombinedAnalysisResult;
}

export const JsonViewer: React.FC<JsonViewerProps> = ({ chart, analysis }) => {
  const [copied, setCopied] = useState(false);
  const fullPayload = { chart, analysis };
  const jsonStr = JSON.stringify(fullPayload, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#111827] rounded-xl border border-slate-800 shadow-xl p-4 sm:p-6 text-slate-200">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Code className="w-5 h-5 text-amber-400" />
          <h3 className="font-mono font-bold text-sm text-slate-100">
            確定性命盤核心 JSON 數據結構 (Deterministic Chart Payload)
          </h3>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? '已複製 JSON' : '複製完整數據'}
        </button>
      </div>

      <div className="relative max-h-96 overflow-y-auto font-mono text-xs text-amber-100/90 bg-[#0a0f1d] p-4 rounded-xl border border-slate-800">
        <pre className="whitespace-pre">{jsonStr}</pre>
      </div>
    </div>
  );
};
