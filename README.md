# 🌌 紫微斗數 AI 命盤排盤系統 (Ziwei AI Astrology)

> 高可靠度、數學可驗證的確定性紫微斗數排盤引擎，深度融合三合、飛星、河洛與欽天四化四大流派，並結合 Gemini AI 進行大師級專業命盤解讀。

![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)
![React Version](https://img.shields.io/badge/React-19-blue.svg)
![Vite Version](https://img.shields.io/badge/Vite-6-purple.svg)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)
![License](https://img.shields.io/badge/license-Apache--2.0-orange.svg)

---

## 🌟 核心特色與架構優勢

1. **確定性高可靠排盤引擎 (Deterministic Core Engine)**
   - **完全無幻覺**：所有星曜、十二宮位、天干地支、五行局、生年四化、自化與流派飛化均以純 TypeScript 數學公式固定演算。
   - **精準時間校驗**：支援經緯度**真太陽時換算**、**早子時／晚子時**精確切換，並完整整合農曆干支閏月演算法。
   - **黃金測試保障**：內建 Golden Test 自動化測試套件，確保核心排盤規則零偏差。

2. **四大經典流派多視角分析**
   - **三合派**：星情廟旺平陷、三方四正會照、生年四化格局論斷（如科名會祿、祿權相應）。
   - **飛星派**：十二宮天干飛化、祿轉忌、忌轉忌、大限步步飛化追蹤吉凶牽引。
   - **河洛派**：河圖洛書天地數理、體用一如、天地人合一之數理結構。
   - **欽天四化派**：來因宮定位、生年四化質能互換、自化離心向心之宿命因果。

3. **Gemini AI 專業大師解讀**
   - 將確定性演算法計算出之標準化 JSON 盤象餵入 Google Gemini 3.1 模型，針對事業、財帛、婚姻、大限運程進行全方位深度的自然語言分析。
   - 若未設定 `GEMINI_API_KEY` 或離線狀態，系統將自動降級（Fallback）呈現演算法四大流派確定性分析摘要，保證隨時可用。

---

## 🛠️ 技術棧 (Tech Stack)

- **前端框架**：[React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **樣式與動畫**：[Tailwind CSS v4](https://tailwindcss.com/) + [Motion](https://motion.dev/)
- **圖示庫**：[Lucide React](https://lucide.dev/)
- **建置工具**：[Vite 6](https://vitejs.dev/)
- **全端伺服器**：[Express 4](https://expressjs.com/) + [tsx](https://github.com/privatenumber/tsx) + [esbuild](https://esbuild.github.io/)
- **AI 整合**：[@google/genai](https://www.npmjs.com/package/@google/genai) (Gemini API)
- **陰陽曆換算**：[lunar-javascript](https://github.com/6tail/lunar-javascript)

---

## 🚀 快速開始 (Getting Started)

### 1. 前置需求
- **Node.js**：建議 `v20.0.0` 或 `v22 LTS` 以上版本
- **npm**：建議 `10.x` 以上版本（Windows 請使用 `npm.cmd` 或 PowerShell 支援環境）

### 2. 下載與安裝套件

```bash
# 複製專案庫
git clone https://github.com/n9694151/Zi_Wei_20260906.git
cd Zi_Wei_20260906

# 安裝所有依賴套件
npm install
```

### 3. 環境變數配置 (可選)

本專案之**核心排盤與四大流派分析引擎為純前端/純演算法運作，不依賴任何外部 API**。若您希望啟用 **Gemini AI 智能大師解讀** 功能，請設定 API Key：

1. 複製範本建立 `.env` 檔案：
   ```bash
   cp .env.example .env
   ```
2. 編輯 `.env` 填入您的 Google AI Studio API Key：
   ```env
   GEMINI_API_KEY="AIzaSyYourGeminiApiKeyHere"
   PORT=3000
   ```

---

## 💻 常用指令說明 (npm scripts)

| 指令 | 說明 |
| :--- | :--- |
| `npm run dev` | **啟動全端開發環境**（包含 Express API 與 Vite 熱模組更新） |
| `npm run dev:client` | **啟動純前端 Vite 開發環境**（無需後端，適合離線與快速排盤介面微調） |
| `npm run build` | **完整編譯建置**（同時打包前端 SPA 至 `dist/` 與後端為 `dist/server.cjs`） |
| `npm run build:client` | **僅打包前端**（產出靜態網站至 `dist/`，適合 GitHub Pages / Vercel 託管） |
| `npm run start` | **啟動生產環境後端**（執行 `dist/server.cjs`） |
| `npm run preview` | **預覽前端生產建置產物** |
| `npm run typecheck` | **執行 TypeScript 型別檢查**（`tsc --noEmit`，零型別錯誤保障） |
| `npm run test` | **執行黃金測試一號**（`tsx scripts/verifyGolden001.ts` 驗證排盤邏輯） |
| `npm run verify` | **整合品質驗證**（依序執行型別檢查與黃金排盤測試） |
| `npm run clean` | **清理建置產物**（跨平台安全刪除 `dist/` 與快取檔案） |

---

## 🌐 GitHub Actions 自動化部署 (GitHub Pages)

專案已內建 `.github/workflows/deploy.yml`，讓您**推送到 GitHub 即可自動驗證並上線**！

### 啟用步驟：
1. 將程式碼推送至 GitHub 專案庫的 `main` 分支。
2. 進入專案頁面，點選上方 **「Settings」** 分頁。
3. 在左側選單點選 **「Pages」**。
4. 在 **「Build and deployment」** 區塊：
   - **Source** 下拉選單選擇 **「GitHub Actions」**。
5. 只要推送程式碼或在 GitHub 的 **「Actions」** 頁籤點選 **「Run workflow」**，工作流程即會自動：
   - 檢出程式碼與設定 Node.js 22 LTS。
   - 執行 `npm ci` 與 TypeScript 型別檢查。
   - 執行黃金測試確定排盤邏輯 100% 正確。
   - 打包靜態網頁並自動發布至 `https://<您的帳號>.github.io/Zi_Wei_20260906/`。

---

## 🛡️ 安全防護與 .gitignore 設計

專案遵循資深工程師等級的程式碼衛生與安全規範：
- **金鑰嚴格防護**：`.env`、`.env.*`、憑證私鑰（`*.pem`, `*.key`）一律自動忽略，嚴防洩漏至公開 Repository（僅保留範本 `.env.example`）。
- **乾淨版本控制**：自動忽略 `node_modules/`、`dist/`、建置暫存與 IDE 設定，確保 commit 紀錄輕巧清晰。
- **跨平台支援**：全面排除 macOS (`.DS_Store`) 與 Windows (`Thumbs.db`, `Desktop.ini`) 之作業系統暫存檔。

---

## 📜 專案授權

本專案採用 [Apache License 2.0](LICENSE) 授權釋出。
