/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChartJson } from '../types/chart';
import { PalaceInfo } from '../types/palace';
import { CombinedAnalysisResult } from '../types/analysis';
import { MajorLimit, AnnualChart } from '../types/limit';
import { HeavenlyStem, PALACE_NAMES, PalaceName } from '../types/constants';
import { FOUR_TRANSFORM_RULES } from '../transform/fourTransformRules';

export interface InterpretationContext {
  selectedMajorLimit?: MajorLimit;
  selectedAnnual?: AnnualChart;
  selectedPalaceName?: string;
}

/**
 * 輔助函數：尋找某星坐落於本命盤哪一個宮位
 */
function findStarPalace(chart: ChartJson, starName: string): PalaceInfo | undefined {
  return chart.palaces.find(
    (p) =>
      p.mainStars.some((s) => s.name === starName) ||
      p.auxiliaryStars.some((s) => s.name === starName) ||
      p.maleficStars.some((s) => s.name === starName)
  );
}

/**
 * 輔助函數：取得宮位在某大限與流年下的疊宮名稱
 */
function getOverlayPalaceTitle(
  chart: ChartJson,
  palace: PalaceInfo,
  activeMajorLimit?: MajorLimit,
  activeAnnual?: AnnualChart
): { majorTitle: string; annualTitle: string } {
  const pIdx = chart.palaces.indexOf(palace);

  // 大限疊宮
  let majorTitle = '';
  if (activeMajorLimit) {
    const mlMingPalace = chart.palaces.find((p) => p.branch === activeMajorLimit.branch);
    const mlMingIdx = mlMingPalace ? chart.palaces.indexOf(mlMingPalace) : 0;
    const diffMl = (pIdx - mlMingIdx + 12) % 12;
    majorTitle = `大限${PALACE_NAMES[diffMl]}`;
  }

  // 流年疊宮
  let annualTitle = '';
  if (activeAnnual) {
    const annualMingPalace = chart.palaces.find((p) => p.branch === activeAnnual.annualMingBranch);
    const annualMingIdx = annualMingPalace ? chart.palaces.indexOf(annualMingPalace) : 0;
    const diffAnnual = (pIdx - annualMingIdx + 12) % 12;
    annualTitle = `流年${PALACE_NAMES[diffAnnual]}`;
  }

  return { majorTitle, annualTitle };
}

/**
 * 輔助函數：計算生年、大運、流年三代四化的詳細落點與實質白話意義
 */
interface DetailedTransform {
  tier: '生年' | '大運' | '流年';
  stem: HeavenlyStem;
  type: '祿' | '權' | '科' | '忌';
  star: string;
  benPalaceName: string;
  benStemBranch: string;
  overlayMajorName?: string;
  overlayAnnualName?: string;
  plainMeaning: string;
}

function getDetailedTransforms(
  chart: ChartJson,
  context?: InterpretationContext
): {
  birthTransforms: DetailedTransform[];
  majorTransforms: DetailedTransform[];
  annualTransforms: DetailedTransform[];
} {
  const activeMajor = context?.selectedMajorLimit || chart.majorLimits[1] || chart.majorLimits[0];
  const activeAnnual =
    context?.selectedAnnual ||
    chart.annualCharts.find((a) => a.year === 2026) ||
    chart.annualCharts[0];

  const types: Array<'祿' | '權' | '科' | '忌'> = ['祿', '權', '科', '忌'];

  // 1. 本命生年四化
  const birthGan = chart.ganzhi.yearGanZhi.gan;
  const birthRules = FOUR_TRANSFORM_RULES[birthGan];
  const birthTransforms: DetailedTransform[] = [];
  if (birthRules) {
    for (const t of types) {
      const star = birthRules[t];
      const p = findStarPalace(chart, star);
      const overlays = p ? getOverlayPalaceTitle(chart, p, activeMajor, activeAnnual) : { majorTitle: '', annualTitle: '' };
      let plainMeaning = '';
      if (t === '祿') plainMeaning = '先天福氣、機緣好處與進財管道所在';
      if (t === '權') plainMeaning = '先天能力、掌握實權、魄力與好勝心所在';
      if (t === '科') plainMeaning = '先天名望、口碑聲譽、貴人化解與考試文書平順';
      if (t === '忌') plainMeaning = '先天執著掛念、責任重擔、容易卡關操心或招惹是非的暗礁';

      birthTransforms.push({
        tier: '生年',
        stem: birthGan,
        type: t,
        star,
        benPalaceName: p?.name || '未知宮',
        benStemBranch: p ? `${p.stem}${p.branch}` : '',
        overlayMajorName: overlays.majorTitle,
        overlayAnnualName: overlays.annualTitle,
        plainMeaning,
      });
    }
  }

  // 2. 當前大限四化
  const majorStem = activeMajor?.stem || birthGan;
  const majorRules = FOUR_TRANSFORM_RULES[majorStem];
  const majorTransforms: DetailedTransform[] = [];
  if (majorRules) {
    for (const t of types) {
      const star = majorRules[t];
      const p = findStarPalace(chart, star);
      const overlays = p ? getOverlayPalaceTitle(chart, p, activeMajor, activeAnnual) : { majorTitle: '', annualTitle: '' };
      let plainMeaning = '';
      if (t === '祿') plainMeaning = `這十年最大資源與機會風口，引動【${overlays.majorTitle || '大限'}】吉運`;
      if (t === '權') plainMeaning = `這十年必須爭取主控、全力擴張突破的領域`;
      if (t === '科') plainMeaning = `這十年獲得口碑聲望、貴人相挺的防護網`;
      if (t === '忌') plainMeaning = `這十年最大的破口、壓力源或容易破財虧損的坑點，須嚴格防守`;

      majorTransforms.push({
        tier: '大運',
        stem: majorStem,
        type: t,
        star,
        benPalaceName: p?.name || '未知宮',
        benStemBranch: p ? `${p.stem}${p.branch}` : '',
        overlayMajorName: overlays.majorTitle,
        overlayAnnualName: overlays.annualTitle,
        plainMeaning,
      });
    }
  }

  // 3. 當前流年四化
  const annualStem = activeAnnual?.yearGan || birthGan;
  const annualRules = FOUR_TRANSFORM_RULES[annualStem];
  const annualTransforms: DetailedTransform[] = [];
  if (annualRules) {
    for (const t of types) {
      const star = annualRules[t];
      const p = findStarPalace(chart, star);
      const overlays = p ? getOverlayPalaceTitle(chart, p, activeMajor, activeAnnual) : { majorTitle: '', annualTitle: '' };
      let plainMeaning = '';
      if (t === '祿') plainMeaning = `今年最有收穫、財路最開拓的亮點`;
      if (t === '權') plainMeaning = `今年承擔具體專案、拍板定案的實質權力`;
      if (t === '科') plainMeaning = `今年利於合約簽署、名聲曝光、考證獲利`;
      if (t === '忌') plainMeaning = `今年最容易卡官非合約、口舌矛盾、突發破財的警戒區`;

      annualTransforms.push({
        tier: '流年',
        stem: annualStem,
        type: t,
        star,
        benPalaceName: p?.name || '未知宮',
        benStemBranch: p ? `${p.stem}${p.branch}` : '',
        overlayMajorName: overlays.majorTitle,
        overlayAnnualName: overlays.annualTitle,
        plainMeaning,
      });
    }
  }

  return { birthTransforms, majorTransforms, annualTransforms };
}

/**
 * 產生提供給 Google AI (Gemini Web 或 API) 之高階專業命盤解讀 Prompt
 * 徹底禁止文言文與玄學套話，強制要求以「宮位」與「四化」為依據，大白話直球回答！
 */
export function generateExpertPrompt(
  chart: ChartJson,
  analysis: CombinedAnalysisResult,
  userQuestion: string,
  school: string = 'combined',
  context?: InterpretationContext
): string {
  const activeMajor = context?.selectedMajorLimit || chart.majorLimits[1] || chart.majorLimits[0];
  const activeAnnual =
    context?.selectedAnnual ||
    chart.annualCharts.find((a) => a.year === 2026) ||
    chart.annualCharts[0];

  const mingPalace = chart.palaces.find((p) => p.isMingGong);
  const mingStars = mingPalace?.mainStars.map((s) => s.name).join('、') || '借對宮安星';
  const guanLuPalace = chart.palaces.find((p) => p.name === '官祿宮');
  const guanStars = guanLuPalace?.mainStars.map((s) => s.name).join('、') || '無主星';
  const caiBoPalace = chart.palaces.find((p) => p.name === '財帛宮');
  const caiStars = caiBoPalace?.mainStars.map((s) => s.name).join('、') || '無主星';
  const fuQiPalace = chart.palaces.find((p) => p.name === '夫妻宮');
  const fuQiStars = fuQiPalace?.mainStars.map((s) => s.name).join('、') || '無主星';
  const qianYiPalace = chart.palaces.find((p) => p.name === '遷移宮');
  const qianStars = qianYiPalace?.mainStars.map((s) => s.name).join('、') || '無主星';

  const { birthTransforms, majorTransforms, annualTransforms } = getDetailedTransforms(chart, context);

  const birthTransformStr = birthTransforms
    .map((t) => `【${t.star}化${t.type}】在${t.benPalaceName}（${t.benStemBranch}）`)
    .join('，');

  const majorTransformStr = majorTransforms
    .map((t) => `【${t.star}大限化${t.type}】入本命${t.benPalaceName}（兼${t.overlayMajorName || '大限宮'}）`)
    .join('，');

  const annualTransformStr = annualTransforms
    .map((t) => `【${t.star}流年化${t.type}】入本命${t.benPalaceName}（兼${t.overlayAnnualName || '流年宮'}）`)
    .join('，');

  return `你是一位經驗豐富、講話一針見血、精通現代職場與心理實戰的紫微斗數大師。
命造向你提問，請針對其問題進行解答。

【核心指令：講大白話，絕對嚴禁文言文與玄虛套話】
1. 嚴格禁止任何八股文言文與玄學空話（嚴禁出現如「天人合一」、「互為體用」、「知命者不怨天」、「命盤乃人生之道地圖，吉曜教人開創」等任何泛泛之談）。
2. 請用直接、乾脆、俐落、現代人一秒聽得懂的繁體中文大白話回答！
3. 每個論點與推斷，必須同時指出：
   - 具體【宮位依據】（如本命官祿宮坐武曲、大限財帛宮、流年命宮等）
   - 具體【四化引動】（明確指出是生年四化、當前大限四化、還是流年四化的祿/權/科/忌哪顆星引動，落在何宮、造成什麼實際吉凶事件）。
4. 嚴格禁止自行推翻排盤數據。所有宮位、星曜、干支皆以排盤引擎給定數據為準。

【命造確定性盤象數據】
- 姓名：${chart.birth.name}（${chart.birth.gender === 'male' ? '男命' : '女命'}）
- 四柱八字：${chart.ganzhi.yearGanZhi.name}年 ${chart.ganzhi.monthGanZhi.name}月 ${chart.ganzhi.dayGanZhi.name}日 ${chart.ganzhi.hourGanZhi.name}時
- 五行局數：${chart.wuxingJu.wuxingJu}（${chart.wuxingJu.ziweiStartingAge}歲起大限）
- 關鍵本命宮位：
  * 命宮：${mingPalace?.stem}${mingPalace?.branch}，坐【${mingStars}】
  * 官祿宮：${guanLuPalace?.stem}${guanLuPalace?.branch}，坐【${guanStars}】
  * 財帛宮：${caiBoPalace?.stem}${caiBoPalace?.branch}，坐【${caiStars}】
  * 夫妻宮：${fuQiPalace?.stem}${fuQiPalace?.branch}，坐【${fuQiStars}】
  * 遷移宮：${qianYiPalace?.stem}${qianYiPalace?.branch}，坐【${qianStars}】
- 先天生年四化（${chart.ganzhi.yearGanZhi.gan}干）：${birthTransformStr}
- 當前選定十年大運（${activeMajor?.startAge || 0}~${activeMajor?.endAge || 0}歲，${activeMajor?.stem}${activeMajor?.branch}·${activeMajor?.palace}）：${majorTransformStr}
- 當前選定流年（${activeAnnual?.year || 2026}年 ${activeAnnual?.yearGan}${activeAnnual?.yearZhi}歲次，流年命宮在【${activeAnnual?.annualMingBranch}宮·${activeAnnual?.annualMingPalace}】）：${annualTransformStr}

【諮詢者核心問題】
${userQuestion || '請進行全盤直白論斷：我的事業財富、感情婚姻、未來十年大運與今年流年有什麼大機會與大坑點？請直白回答！'}

【請嚴格依據以下 4 個結構直白輸出】：
1. 🎯【直白核心結論】：開門見山！1~2 句話直球回答問題核心（能不能做、適合做什麼、幾歲轉機、最大的坑在哪）。
2. 🏛️【關鍵宮位依據】：清楚列出論斷依據的具體宮位（本命、大限、流年疊宮）與星曜組合。
3. ⚡【四化動能引動（吉凶根源）】：明確拆解生年四化、大運四化、流年四化（祿、權、科、忌）到底在哪個宮位引動了什麼好事或壞事。
4. 💡【大白話實戰避坑指南】：給出 3~4 點現代人看得懂、馬上能落地的具體行動策略（例如合約審查、資金控管、溝通模式、防小人條款）。`;
}

/**
 * 客戶端確定性大師級深度解讀產生器（100% 本地演算法合成，無需 API Key，零連線失敗風險）
 * 徹底拋棄文言文，全部轉為直白、務實且具備「宮位 + 四化」嚴密佐證的解答！
 */
export function generateLocalMasterInterpretation(
  chart: ChartJson,
  analysis: CombinedAnalysisResult,
  userQuestion: string = '',
  school: string = 'combined',
  context?: InterpretationContext
): string {
  const activeMajor = context?.selectedMajorLimit || chart.majorLimits[1] || chart.majorLimits[0];
  const activeAnnual =
    context?.selectedAnnual ||
    chart.annualCharts.find((a) => a.year === 2026) ||
    chart.annualCharts[0];

  const mingPalace = chart.palaces.find((p) => p.isMingGong);
  const mingStars = mingPalace?.mainStars.map((s) => s.name).join('、') || '借對宮星曜';
  const guanLuPalace = chart.palaces.find((p) => p.name === '官祿宮');
  const guanStars = guanLuPalace?.mainStars.map((s) => s.name).join('、') || '空宮無主星';
  const caiBoPalace = chart.palaces.find((p) => p.name === '財帛宮');
  const caiStars = caiBoPalace?.mainStars.map((s) => s.name).join('、') || '空宮無主星';
  const fuQiPalace = chart.palaces.find((p) => p.name === '夫妻宮');
  const fuQiStars = fuQiPalace?.mainStars.map((s) => s.name).join('、') || '空宮無主星';
  const tianZhaiPalace = chart.palaces.find((p) => p.name === '田宅宮');
  const tianStars = tianZhaiPalace?.mainStars.map((s) => s.name).join('、') || '空宮無主星';
  const qianYiPalace = chart.palaces.find((p) => p.name === '遷移宮');
  const qianStars = qianYiPalace?.mainStars.map((s) => s.name).join('、') || '空宮無主星';
  const fuDePalace = chart.palaces.find((p) => p.name === '福德宮');
  const fuDeStars = fuDePalace?.mainStars.map((s) => s.name).join('、') || '空宮無主星';

  const { birthTransforms, majorTransforms, annualTransforms } = getDetailedTransforms(chart, context);

  // 四化速查
  const birthLu = birthTransforms.find((t) => t.type === '祿');
  const birthQuan = birthTransforms.find((t) => t.type === '權');
  const birthKe = birthTransforms.find((t) => t.type === '科');
  const birthJi = birthTransforms.find((t) => t.type === '忌');

  const majorLu = majorTransforms.find((t) => t.type === '祿');
  const majorQuan = majorTransforms.find((t) => t.type === '權');
  const majorJi = majorTransforms.find((t) => t.type === '忌');

  const annualLu = annualTransforms.find((t) => t.type === '祿');
  const annualJi = annualTransforms.find((t) => t.type === '忌');

  const q = (userQuestion || '').toLowerCase();
  const isCareer =
    q.includes('官祿') ||
    q.includes('事業') ||
    q.includes('創業') ||
    q.includes('工作') ||
    q.includes('跳槽') ||
    q.includes('當老闆');
  const isWealth =
    q.includes('財帛') ||
    q.includes('財運') ||
    q.includes('發財') ||
    q.includes('賺錢') ||
    q.includes('求財') ||
    q.includes('破財') ||
    q.includes('投資') ||
    q.includes('理財');
  const isMarriage =
    q.includes('夫妻') ||
    q.includes('情感') ||
    q.includes('婚姻') ||
    q.includes('感情') ||
    q.includes('伴侶') ||
    q.includes('對象') ||
    q.includes('桃花') ||
    q.includes('另一半');
  const isLimits =
    q.includes('大運') ||
    q.includes('十年') ||
    q.includes('大限') ||
    q.includes('流年') ||
    q.includes('走勢') ||
    q.includes('運勢') ||
    q.includes('今年');
  const isProperty =
    q.includes('田宅') ||
    q.includes('買房') ||
    q.includes('房產') ||
    q.includes('不動產') ||
    q.includes('置產') ||
    q.includes('搬家');

  // 1. 專題精準回答生成
  let directConclusion = '';
  let keyPalaces = '';
  let fourTransformDynamics = '';
  let practicalAdvice = '';

  if (isCareer) {
    directConclusion = `你非常適合走「專業技術主管、獨立專案負責人或個人顧問品牌」的路線！你有大將風範且執行力極強，但「極不適合跟朋友合夥搞大鍋飯，更忌諱跟風搞不熟悉的投機生意」。`;

    keyPalaces = `1. 【本命官祿宮（${guanLuPalace?.stem}${guanLuPalace?.branch}）】：坐星【${guanStars}】。主掌工作推進與專業手段，具備極強的專業抗壓性與技術信譽，適合在制度健全、重視專業門檻或專案管理的領域打天下。
2. 【本命命宮（${mingPalace?.stem}${mingPalace?.branch}）】：坐星【${mingStars}】。性格責任感過重，有完美主義傾向，不習慣聽命於無能的主管，適合獨立帶隊或擁有決策實權。
3. 【本命財帛宮（${caiBoPalace?.stem}${caiBoPalace?.branch}）】：坐星【${caiStars}】。求財講究尊嚴，靠實力與口碑變現，無法接受低聲下氣或耍小手段求財。
4. 【當前大運（${activeMajor.startAge}~${activeMajor.endAge}歲·${activeMajor.stem}${activeMajor.branch}）】：大限命宮坐${activeMajor.palace}，大限官祿宮進入本盤相應宮位，是建立個人標籤與事業轉型的重要分水嶺。`;

    fourTransformDynamics = `1. 先天生年四化：
   - 【${birthLu?.star}化祿】在${birthLu?.benPalaceName}：對外開拓、出外跑業務或拓展異地市場最有貴人與資源。
   - 【${birthJi?.star}化忌】在${birthJi?.benPalaceName}：這是你事業上最大的心魔！容易思慮過度、鑽牛角尖，工作中常把所有責任攬在自己身上導致心力交瘁；且須防範合約細節不清引發口舌是非。
2. 當前大限四化（${activeMajor.stem}干）：
   - 【${majorLu?.star}化祿】入${majorLu?.benPalaceName}（${majorLu?.overlayMajorName}）：這十年在這方面會出現大好機遇，業務與資源會主動靠攏。
   - 【${majorJi?.star}化忌】入${majorJi?.benPalaceName}（${majorJi?.overlayMajorName}）：這十年最容易踩雷的方向，特別注意合約糾紛、合夥人分歧或下屬捅婁子。
3. 當前流年四化（${activeAnnual.year}年·${activeAnnual.yearGan}干）：
   - 【${annualLu?.star}流年化祿】入${annualLu?.benPalaceName}：今年業務擴張有甜頭。
   - 【${annualJi?.star}流年化忌】入${annualJi?.benPalaceName}：今年在這個宮位容易有公文卡關、進度延誤或主管刁難，切記不可硬頂，凡事留書面證據。`;

    practicalAdvice = `1. 拒絕合夥大鍋飯：你命帶忌星且主星強勢，如果合夥創業，股權與財務混在一起必生嫌隙。若要合作，必須「親兄弟明算帳，只簽合約分利潤，不共用公帳」。
2. 建立不可替代的專業壁壘：靠人脈應酬不如靠硬實力。把精力放在技術、證照、作品集或品牌權威度上，這才是你最穩固的印鈔機。
3. 年度工作避坑：今年切忌意氣用事裸辭或盲目擴充編制，穩固既有現金牛業務，以守待攻。`;
  } else if (isWealth) {
    directConclusion = `你的「正財運」遠大於「偏財運」！靠專業技術、正當業務能穩穩進帳，但你手頭非常容易漏財，存不住大筆活期現金。最適合你的理財方式是「強制買房置產、定期定額投資，或是讓錢轉成不動產鎖住」！`;

    keyPalaces = `1. 【本命財帛宮（${caiBoPalace?.stem}${caiBoPalace?.branch}）】：坐星【${caiStars}】。代表進財來源與金錢態度，財格尊貴端正，靠正派實力吃飯，賺的是心安理得的專業財。
2. 【本命田宅宮（${tianZhaiPalace?.stem}${tianZhaiPalace?.branch}）】：坐星【${tianStars}】。田宅為真正的財庫位。財帛宮好代表會賺錢，田宅宮穩才代表能留得住錢。
3. 【本命福德宮（${fuDePalace?.stem}${fuDePalace?.branch}）】：坐星【${fuDeStars}】。掌管投資心態與精神享受，福德宮的星曜決定了你面對投資時是冷靜精準還是容易焦慮上頭。`;

    fourTransformDynamics = `1. 先天生年四化：
   - 【${birthLu?.star}化祿】在${birthLu?.benPalaceName}：錢財機遇往往來自於外部市場、出差開拓或人際串聯。
   - 【${birthJi?.star}化忌】在${birthJi?.benPalaceName}：這顆忌星就像漏水閥，一旦有閒錢就容易因為家人負擔、突發支出或自己過於焦慮而花掉。
2. 當前大限四化（${activeMajor.stem}干）：
   - 【${majorLu?.star}化祿】入${majorLu?.benPalaceName}：大運財星牽引，這十年只要專注核心本業，進財總量會明顯躍升。
   - 【${majorJi?.star}化忌】入${majorJi?.benPalaceName}：大限忌星所在之處就是破財黑洞，嚴格禁止高槓桿融資、借錢給親友或跟風炒幣炒短線。
3. 流年四化（${activeAnnual.year}年）：
   - 【${annualJi?.star}流年化忌】影響${annualJi?.benPalaceName}：今年不可隨意借貸做保，大筆支出必須三思而後行。`;

    practicalAdvice = `1. 實行「自動截流存錢法」：每個月收入一進來，立刻自動轉走 30%~40% 進入不動產房貸、無法隨意動用的穩健專戶或高評級指數型基金，手頭只留必要生活費。
2. 遠離短線投機與朋友借貸：你的命盤沒有不勞而獲的暴富偏財星，炒短線十賭九輸；朋友向你開口借錢，極大概率有去無回。
3. 最佳資產蓄水池：只要有能力，及早把流動現金轉化為房產或具備實質價值的資產，把忌星的耗散能量轉化為固定資產的折舊或增值。`;
  } else if (isMarriage) {
    directConclusion = `你在感情中比較慢熱，且伴侶非常有主見、性格強勢不服輸！你們相處時最怕「硬碰硬較勁」與「在金錢用度上互相挑剔」。解決之道很直白：財務各管各的、給予彼此充分的工作空間，反而能白頭偕老。`;

    keyPalaces = `1. 【本命夫妻宮（${fuQiPalace?.stem}${fuQiPalace?.branch}）】：坐星【${fuQiStars}】。清楚反映伴侶的性格畫像：做事俐落、能力強、說一不二，在外有威嚴，在家也不容易輕易妥協。
2. 【本命命宮（${mingPalace?.stem}${mingPalace?.branch}）】：坐星【${mingStars}】。你自我原則極強，看似沈穩內斂，但一旦被踩到底線絕不退讓，因此兩人一旦冷戰容易僵持很久。
3. 【本命遷移宮（${qianYiPalace?.stem}${qianYiPalace?.branch}）】：坐星【${qianStars}】。為夫妻宮的氣數位，說明伴侶常年在外面奔波、出差或社交圈廣泛。`;

    fourTransformDynamics = `1. 先天生年四化：
   - 【${birthLu?.star}化祿】在${birthLu?.benPalaceName}：異性緣與社交緣分其實不差，出外或工作中容易結識條件優質的對象。
   - 【${birthJi?.star}化忌】在${birthJi?.benPalaceName}：忌星帶來的執著與敏感，會讓你在感情中容易想太多、缺乏安全感或給對方過大壓力。
2. 當前大限四化（${activeMajor.stem}干）：
   - 當前大限走【${activeMajor.stem}${activeMajor.branch}】，大限夫妻宮座落於相應位置，大限祿權化入感情位主彼此互相成就，若化忌入官祿或疾厄，則容易因工作繁忙而聚少離多。
3. 流年四化（${activeAnnual.year}年）：
   - 【${annualJi?.star}流年化忌】：今年感情溝通上容易產生誤解或情緒上頭，切忌在疲勞煩躁時討論嚴肅問題。`;

    practicalAdvice = `1. 財務獨立制是婚姻保鮮劑：避免因日常柴米油鹽或理財觀念不同而消耗感情，各管各的私房錢，家庭公共開銷按比例共同分攤最安全。
2. 學會「物理降溫」：伴侶脾氣上來時，千萬不要講大道理爭對錯。先離開現場喝杯水，等情緒冷卻後再溝通，能避開 90% 的無謂爭吵。
3. 聚少離多反而是好事：各自保有自己的事業與朋友圈，不要天天黏在一起挑毛病，距離感反而能增添彼此的新鮮感與尊重。`;
  } else if (isLimits) {
    directConclusion = `你目前所處的十年大運（${activeMajor.startAge}~${activeMajor.endAge}歲）是「蹲低蓄力、扎根立威」的關鍵階段！今年（${activeAnnual.year}年）運勢「利於深耕專業與考證，但不利於冒進投資與人事口舌爭端」。`;

    keyPalaces = `1. 【當前大限命宮（${activeMajor.stem}${activeMajor.branch}·${activeMajor.palace}）】：管轄你這十年的核心心態與運勢主軸，行運順逆直接由此宮定調。
2. 【當前大限官祿宮】：主導這十年間工作晉升、事業轉換或業務規模的擴張路徑。
3. 【當前流年命宮（${activeAnnual.annualMingBranch}宮·${activeAnnual.annualMingPalace}）】：主導你今年 ${activeAnnual.year} 年的生活重心、突發事件與環境變動。`;

    fourTransformDynamics = `1. 先天生年四化做底色：
   - 先天【${birthLu?.star}化祿】在${birthLu?.benPalaceName}提供基礎助力，【${birthJi?.star}化忌】在${birthJi?.benPalaceName}提醒你勿忘初心、不可投機。
2. 當前十年大限四化（${activeMajor.stem}干）：
   - 【${majorLu?.star}化祿】入${majorLu?.benPalaceName}（${majorLu?.overlayMajorName}）：這十年的最大紅利在此，務必全力以赴做這方面的積累！
   - 【${majorQuan?.star}化權】入${majorQuan?.benPalaceName}（${majorQuan?.overlayMajorName}）：代表你將在該領域扛起大旗、取得不可撼動的話語權。
   - 【${majorJi?.star}化忌】入${majorJi?.benPalaceName}（${majorJi?.overlayMajorName}）：這十年的定時炸彈在此，萬萬不可違規或因貪心而失足。
3. 當前流年四化（${activeAnnual.year}年·${activeAnnual.yearGan}干）：
   - 【${annualLu?.star}化祿】帶來年度新業務機遇；【${annualJi?.star}化忌】提醒今年切勿隨意簽署擔保文件或輕信他人承諾。`;

    practicalAdvice = `1. 順勢而為，莫逆天行事：大限化祿之處積極出擊，大限化忌之處嚴加防守，這就是最高明的趨吉避凶。
2. 年度關鍵月份提醒：逢流月化忌沖照之月（特別是春夏交接或秋冬轉折之際），放慢腳步，不作重大衝動決策。
3. 身體與心理保健：命帶忌星者容易思慮過度導致睡眠差或消化系統緊繃，每週固定規律運動是排解忌星負能量的最佳良方。`;
  } else if (isProperty) {
    directConclusion = `買房置產是你此生最安全、最能夠守住財富的手段！只要看準標的，及早背上合理房貸，你的資產就會以滾雪球的方式扎實累積。`;

    keyPalaces = `1. 【本命田宅宮（${tianZhaiPalace?.stem}${tianZhaiPalace?.branch}）】：坐星【${tianStars}】。田宅為不動產庫位，代表你能否累積大宗固定資產與居住環境品質。
2. 【本命財帛宮（${caiBoPalace?.stem}${caiBoPalace?.branch}）】：坐星【${caiStars}】。提供購屋與房貸頭期款的現金流來源。`;

    fourTransformDynamics = `1. 生年四化中，若祿權化入田宅或財帛，購屋往往能搭上增值順風車。
2. 大運或流年若有【化忌】沖田宅宮，那一年切忌匆忙交屋簽約，務必詳查產權與漏水等屋況隱患。`;

    practicalAdvice = `1. 買房重在「地段與抗跌性」：選擇捷運機能成熟、學區完整的生活圈，自住兼具保值。
2. 現金留底線：購屋時務必保留至少 6 個月的生活與房貸預備金，不可把現金全部抽乾。`;
  } else {
    // 全盤整體綜合論斷或自訂問題
    directConclusion = `你的命格特質非常鮮明：外表沉著穩重、內心志向高遠，骨子裡極具領導力與開拓慾望！但最大的弱點是「自我要求過高、容易焦慮內耗」，只要學會放過自己、借力使力，事業成就將遠超同儕。`;

    keyPalaces = `1. 【本命命宮（${mingPalace?.stem}${mingPalace?.branch}）】：坐【${mingStars}】。代表先天本質與天賦根基，主星格局宏大，具備極佳的統籌、管理與開創能力。
2. 【本命官祿宮（${guanLuPalace?.stem}${guanLuPalace?.branch}）】：坐【${guanStars}】。代表事業工作模式，重條理與實權，適合組織管理、專業技術或實體經營。
3. 【本命財帛宮（${caiBoPalace?.stem}${caiBoPalace?.branch}）】：坐【${caiStars}】。代表求財手法，靠正職實力和專業威望進財，穩扎穩打。
4. 【本命遷移宮（${qianYiPalace?.stem}${qianYiPalace?.branch}）】：坐【${qianStars}】。出外活動力強，對外人際與社會資源比在封閉環境中更能發揮。`;

    fourTransformDynamics = `1. 先天生年四化能量樞紐（${chart.ganzhi.yearGanZhi.gan}干）：
   - 【${birthLu?.star}化祿】在${birthLu?.benPalaceName}：先天最有福氣、最容易得到幫助的領域。
   - 【${birthQuan?.star}化權】在${birthQuan?.benPalaceName}：天生才幹與想掌控、想說了算的領域。
   - 【${birthKe?.star}化科】在${birthKe?.benPalaceName}：名聲口碑與考運過關、貴人提拔的護身符。
   - 【${birthJi?.star}化忌】在${birthJi?.benPalaceName}：一生中最容易操心、想不開、責任重大但也是讓你百煉成鋼的關鍵課題。
2. 當前大限（${activeMajor.startAge}~${activeMajor.endAge}歲）四化：
   - 【${majorLu?.star}化祿】入${majorLu?.benPalaceName}、大限忌星入${majorJi?.benPalaceName}，推動當前十年的人生命運轉輪。
3. 當前流年（${activeAnnual.year}年）四化：
   - 【${annualLu?.star}流年化祿】與【${annualJi?.star}流年化忌】形成今年吉凶交疊的具體生活考驗。`;

    practicalAdvice = `1. 抓大放小，停止精神內耗：你命中忌星在自己身上，總覺得自己做得不夠好或擔心出錯。多看自己擁有的資源，少盯著不完美。
2. 擇友而交，借力使力：善用出外化祿的優勢，多走出辦公室結識高段位的前輩與跨界人脈，讓外部資源替你帶路。
3. 穩字當頭，步步為營：只要不碰高風險賭博性投資、不被一時誘惑走捷徑，靠著你的專業與耐力，中年之後必定財富名望兼具。`;
  }

  // 組合純粹大白話輸出（絕無文言文，嚴密引用宮位與四化）
  return `【紫微大師一針見血論斷】
（依據確定性排盤數據、宮位配置與三代四化深度剖析）

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 一、直白核心結論
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${directConclusion}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏛️ 二、關鍵宮位依據（看哪幾個宮）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${keyPalaces}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚡ 三、四化動能引動（吉凶到底從哪來）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${fourTransformDynamics}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 四、大白話實戰避坑指南
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${practicalAdvice}`;
}
