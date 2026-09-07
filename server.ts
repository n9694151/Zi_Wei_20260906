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
import {
  generateExpertPrompt,
  generateLocalMasterInterpretation,
} from './src/ziwei/analysis/interpreter';

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
    const { chart, analysis, userQuestion, school = 'combined', context } = req.body;

    if (!chart) {
      return res.status(400).json({ error: 'Missing chart object' });
    }

    const ai = getGenAI();
    if (!ai) {
      // Fallback deterministic synthesis using plain-language engine
      const fallbackText = generateLocalMasterInterpretation(
        chart,
        analysis,
        userQuestion,
        school,
        context
      );
      return res.json({
        interpretation: fallbackText,
        geminiActive: false,
      });
    }

    const prompt = generateExpertPrompt(chart, analysis, userQuestion, school, context);

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
    const fallbackText = generateLocalMasterInterpretation(
      chart,
      analysis,
      userQuestion,
      school,
      context
    );
    res.json({
      interpretation: fallbackText,
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
