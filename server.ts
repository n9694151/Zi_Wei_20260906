/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { ZiWeiEngine } from './src/ziwei/engine';
import { CombinedAnalysisEngine } from './src/ziwei/analysis/combined';
import { BirthInput } from './src/ziwei/types/chart';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized GoogleGenAI client
let genAiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!genAiClient && process.env.GEMINI_API_KEY) {
    genAiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return genAiClient;
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    engine: 'ZiWeiEngine Deterministic v1.0.0',
    geminiConfigured: !!process.env.GEMINI_API_KEY,
  });
});

// Deterministic Chart Calculation API
// ABSOLUTELY ZERO AI / GEMINI INVOLVED. Pure deterministic algorithm.
app.post('/api/calculate', (req, res) => {
  try {
    const input = req.body as BirthInput;
    if (!input || !input.solarDate) {
      return res.status(400).json({ error: 'Missing required solarDate in birth input' });
    }
    const chart = ZiWeiEngine.calculate(input);
    const analysis = CombinedAnalysisEngine.analyze(chart);
    res.json({ chart, analysis });
  } catch (err: any) {
    console.error('Calculation error:', err);
    res.status(500).json({ error: err.message || 'Internal chart calculation error' });
  }
});

// Multi-School Analysis API
app.post('/api/analyze-school', (req, res) => {
  try {
    const { chart } = req.body;
    if (!chart) {
      return res.status(400).json({ error: 'Missing chart in request body' });
    }
    const analysis = CombinedAnalysisEngine.analyze(chart);
    res.json({ analysis });
  } catch (err: any) {
    console.error('Analysis error:', err);
    res.status(500).json({ error: err.message || 'Analysis generation error' });
  }
});

// Gemini Astrological Interpretation API
// GEMINI STRICTLY FOR ANALYSIS & NATURAL LANGUAGE INTERPRETATION.
app.post('/api/gemini/interpret', async (req, res) => {
  try {
    const { chart, analysis, userQuestion, school = 'combined' } = req.body;

    if (!chart) {
      return res.status(400).json({ error: 'Missing chart object' });
    }

    const ai = getGenAI();
    if (!ai) {
      // Fallback deterministic synthesis if GEMINI_API_KEY is not set yet in the preview environment
      return res.json({
        interpretation: `【系統提示：目前未配置 GEMINI_API_KEY，以下為 Engine 核心四大流派確定性分析摘要】\n\n` +
          `◆ 命造局數：${chart.wuxingJu.wuxingJu}（${chart.wuxingJu.wuxingElement}局），命宮安於【${chart.mingGong.stem}${chart.mingGong.branch}】。\n` +
          `◆ 生年四化：${chart.fourTransformations.map((t: any) => `${t.star}化${t.type}在${t.palace}`).join('、')}。\n` +
          `◆ 三合派視角：${analysis.sanHe.careerAndWealthFocus}\n` +
          `◆ 飛星派視角：${analysis.feiXing.majorLimitInfluence}\n` +
          `◆ 河洛派視角：${analysis.heLuo.heLuoStructure}\n` +
          `◆ 欽天派視角：${analysis.qinTian.flyingInOutSummary.slice(0, 2).join(' ')}\n\n` +
          `◆ 綜合建議：${analysis.finalSynthesis}`,
        geminiActive: false,
      });
    }

    const prompt = `你是一位精通三合紫微、飛星紫微、河洛紫微、欽天四化四大流派的資深紫微斗數大師。
現在請根據後方由後端 Deterministic Calculation Engine 嚴格計算出來的「紫微斗數命盤核心 JSON」與「流派分析結構 JSON」，為命造進行深度解讀。

【最高禁令】
嚴格禁止自行重新排盤或推翻任何星曜位置、五行局、命宮、干支與四化。所有宮位、星曜、四化已由數學引擎固定。

【命造基本盤】
姓名：${chart.birth.name}
性別：${chart.birth.gender === 'male' ? '男' : '女'}
公曆：${chart.calendar.solarDate} ${chart.calendar.solarTime} (真太陽時: ${chart.calendar.trueSolarTime})
農曆：${chart.calendar.lunarYear}年${chart.calendar.lunarMonthName}${chart.calendar.lunarDayName} ${chart.calendar.hourBranch}時
四柱干支：${chart.ganzhi.yearGanZhi.name}年 ${chart.ganzhi.monthGanZhi.name}月 ${chart.ganzhi.dayGanZhi.name}日 ${chart.ganzhi.hourGanZhi.name}時
命宮：${chart.mingGong.stem}${chart.mingGong.branch}
身宮：${chart.shenGong.stem}${chart.shenGong.branch} (${chart.shenGong.palaceName})
五行局：${chart.wuxingJu.wuxingJu} (${chart.wuxingJu.ziweiStartingAge}歲起運)
命主：${chart.specialZhu.mingZhu}，身主：${chart.specialZhu.shenZhu}，子斗：${chart.specialZhu.ziDou}
生年四化：${chart.fourTransformations.map((t: any) => `${t.star}化${t.type}(${t.palace})`).join('、')}

【四大流派分析摘要】
1. 三合派分析：${analysis.sanHe.careerAndWealthFocus}
2. 飛星派分析：${analysis.feiXing.majorLimitInfluence}
3. 河洛派分析：${analysis.heLuo.heLuoStructure}
4. 欽天派分析：${analysis.qinTian.flyingInOutSummary.join('\n')}

【用戶特定提問或關注流派】
關注流派：${school}
用戶問題：${userQuestion || '請進行全盤命造綜合論斷，解析個性稟賦、事業財富、婚姻情感、大運走勢與流年重點。'}

請結構化輸出：
1. 命格總體特徵與格局稟賦（結合命身宮與三方四正星曜）
2. 四大流派多視角剖析（三合星情格局、飛星化象牽引、河洛數理體用、欽天來因因果）
3. 當前大運走勢與關鍵十年前瞻
4. 人生關鍵指引與知命造命建議`;

    let aiText = '';
    const candidateModels = ['gemini-flash-latest', 'gemini-3.1-flash-lite'];

    for (const model of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
        });
        if (response.text) {
          aiText = response.text;
          break;
        }
      } catch (callErr: any) {
        console.warn(`Model ${model} call failed, trying next:`, callErr.message);
      }
    }

    if (aiText) {
      return res.json({
        interpretation: aiText,
        geminiActive: true,
      });
    }

    // High demand fallback: deterministic synthesis from engine
    res.json({
      interpretation: `【系統提示：AI 雲端服務當前繁忙，以下為排盤 Engine 確定性四大流派深度解析】\n\n` +
        `◆ 命造局數：${chart.wuxingJu.wuxingJu}（${chart.wuxingJu.wuxingElement}局），命宮安於【${chart.mingGong.stem}${chart.mingGong.branch}】。\n` +
        `◆ 生年四化：${chart.fourTransformations.map((t: any) => `${t.star}化${t.type}在${t.palace}`).join('、')}。\n` +
        `◆ 三合派視角：${analysis.sanHe.careerAndWealthFocus}\n` +
        `◆ 飛星派視角：${analysis.feiXing.majorLimitInfluence}\n` +
        `◆ 河洛派視角：${analysis.heLuo.heLuoStructure}\n` +
        `◆ 欽天派視角：${analysis.qinTian.flyingInOutSummary.slice(0, 2).join(' ')}\n\n` +
        `◆ 綜合建議：${analysis.finalSynthesis}`,
      geminiActive: false,
    });
  } catch (err: any) {
    console.error('Gemini interpret error:', err);
    res.status(500).json({ error: err.message || 'Gemini interpretation error' });
  }
});

// Vite middleware for dev / static for prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Ziwei AI Full-Stack Server running on port ${PORT}`);
  });
}

startServer();
