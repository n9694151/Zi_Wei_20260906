/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChartJson } from '../types/chart';
import { CombinedAnalysisResult } from '../types/analysis';

/**
 * 產生提供給 Google AI (Gemini Web 或 API) 之高階專業命盤解讀 Prompt
 */
export function generateExpertPrompt(
  chart: ChartJson,
  analysis: CombinedAnalysisResult,
  userQuestion: string,
  school: string = 'combined'
): string {
  const mingStars =
    chart.palaces.find((p) => p.isMingGong)?.mainStars.map((s) => s.name).join('、') || '借對宮安星';
  const shenStars =
    chart.palaces.find((p) => p.isShenGong)?.mainStars.map((s) => s.name).join('、') || '借對宮安星';

  const fourTransformationsText = chart.fourTransformations
    .map((t) => `${t.star}化${t.type}(在${t.palace})`)
    .join('、');

  const laiYinPalace = chart.palaces.find((p) => p.stem === chart.ganzhi.yearGanZhi.gan);
  const laiYinName = laiYinPalace ? `${laiYinPalace.name}(${laiYinPalace.stem}${laiYinPalace.branch})` : '命宮';

  return `你是一位精通三合紫微、飛星紫微、河洛紫微、欽天四化四大流派的資深紫微斗數國寶級大師。
現在請根據後方由高可靠度排盤引擎（Deterministic Engine）嚴格計算出來的「紫微斗數確定性命盤核心特徵」與「四大流派數理結構」，為命造進行深度、精準且具備人生啟發的解析。

【最高禁令】
嚴格禁止自行重新排盤或推翻任何星曜位置、五行局、命宮、身宮、干支與四化。所有宮位、星曜、四化數據均已固定，請以此盤象為唯一真理進行論斷。

【命造基本盤象】
- 命造姓名：${chart.birth.name}（${chart.birth.gender === 'male' ? '乾造/男命' : '坤造/女命'}）
- 公曆生辰：${chart.calendar.solarDate} ${chart.calendar.solarTime}（真太陽時：${chart.calendar.trueSolarTime}）
- 農曆生辰：${chart.calendar.lunarYear}年 ${chart.calendar.lunarMonthName}${chart.calendar.lunarDayName} ${chart.calendar.hourBranch}時
- 四柱八字：${chart.ganzhi.yearGanZhi.name}年 ${chart.ganzhi.monthGanZhi.name}月 ${chart.ganzhi.dayGanZhi.name}日 ${chart.ganzhi.hourGanZhi.name}時
- 命宮位置：${chart.mingGong.stem}${chart.mingGong.branch}宮（主星坐：${mingStars}）
- 身宮位置：${chart.shenGong.stem}${chart.shenGong.branch}宮（${chart.shenGong.palaceName}，主星坐：${shenStars}）
- 五行局數：${chart.wuxingJu.wuxingJu}（${chart.wuxingJu.ziweiStartingAge}歲起運）
- 命主/身主：命主【${chart.specialZhu.mingZhu}】，身主【${chart.specialZhu.shenZhu}】，子斗【${chart.specialZhu.ziDou}】
- 先天生年四化：${fourTransformationsText}
- 欽天來因宮：${laiYinName}

【四大流派分析結構】
1. 三合派分析：${analysis.sanHe.careerAndWealthFocus}
2. 飛星派分析：${analysis.feiXing.majorLimitInfluence}
3. 河洛派分析：${analysis.heLuo.heLuoStructure}
4. 欽天派分析：${analysis.qinTian.flyingInOutSummary.join('；')}

【當前解讀視角與用戶提問】
- 聚焦流派：${school}
- 用戶諮詢核心問題：${userQuestion || '請進行全盤命造綜合論斷，剖析性情天賦、事業財富、婚姻情感、大運關鍵走勢與知命造命指引。'}

請以溫暖、客觀、高深且兼具現代心理學視角進行結構化解讀：
1. 命造根基與性情器度（結合命宮、身宮星情與三方四正會照格局）
2. 四大流派多維度會通深入論斷（三合星情格局、飛星化象軌跡、河洛數理體用、欽天來因前世因果）
3. 針對提問專題剖析（若問事業財帛/感情/大限，請深入具體宮位與化曜作透徹論斷）
4. 當前大限樞紐與行運前瞻
5. 知命造命：大師給予此命造的人生智慧關鍵箴言`;
}

/**
 * 客戶端確定性大師級深度解讀產生器（100% 本地演算法合成，無需 API Key，零連線失敗風險）
 */
export function generateLocalMasterInterpretation(
  chart: ChartJson,
  analysis: CombinedAnalysisResult,
  userQuestion: string = '',
  school: string = 'combined'
): string {
  const mingStars =
    chart.palaces.find((p) => p.isMingGong)?.mainStars.map((s) => s.name).join('、') || '借對宮安星';
  const shenStars =
    chart.palaces.find((p) => p.isShenGong)?.mainStars.map((s) => s.name).join('、') || '借對宮安星';

  const fourTransformationsText = chart.fourTransformations
    .map((t) => `${t.star}化${t.type}（坐${t.palace}）`)
    .join('、');

  const laiYinPalace = chart.palaces.find((p) => p.stem === chart.ganzhi.yearGanZhi.gan);
  const laiYinName = laiYinPalace ? `${laiYinPalace.name}（${laiYinPalace.stem}${laiYinPalace.branch}）` : '命宮';

  const q = userQuestion.toLowerCase();
  const isCareerWealth = q.includes('官祿') || q.includes('事業') || q.includes('財帛') || q.includes('創業') || q.includes('求財');
  const isMarriage = q.includes('夫妻') || q.includes('情感') || q.includes('婚姻') || q.includes('感情') || q.includes('伴侶');
  const isLimits = q.includes('大運') || q.includes('十年') || q.includes('大限') || q.includes('流年') || q.includes('走勢');

  // 1. 專題客製化解讀內容
  let topicAnalysis = '';
  if (isCareerWealth) {
    const guanLuPalace = chart.palaces.find((p) => p.name === '官祿宮');
    const caiBoPalace = chart.palaces.find((p) => p.name === '財帛宮');
    const guanStars = guanLuPalace?.mainStars.map((s) => s.name).join('、') || '空宮借星';
    const caiStars = caiBoPalace?.mainStars.map((s) => s.name).join('、') || '空宮借星';

    topicAnalysis = `【專題深入：事業官祿與求財格局】
▸ 官祿宮位立於【${guanLuPalace?.stem}${guanLuPalace?.branch}】，坐星【${guanStars}】：
  主事業開拓之動力與專業方向。配合三合三方會照，事業展現出鮮明的專業主見與進取氣度，適宜往具備深度專業、組織架構或開創性領域生根。
▸ 財帛宮位立於【${caiBoPalace?.stem}${caiBoPalace?.branch}】，坐星【${caiStars}】：
  為一生求財方式與現金流動之樞紐。三合派指引：${analysis.sanHe.careerAndWealthFocus}。
▸ 飛星與自化啟示：宮干飛化牽引進財路徑，宜掌握自身核心技術，穩扎穩打，避免投機短線，方能積累厚實產業資產。`;
  } else if (isMarriage) {
    const fuQiPalace = chart.palaces.find((p) => p.name === '夫妻宮');
    const fuQiStars = fuQiPalace?.mainStars.map((s) => s.name).join('、') || '空宮借星';
    topicAnalysis = `【專題深入：夫妻宮位與情感因緣】
▸ 夫妻宮安於【${fuQiPalace?.stem}${fuQiPalace?.branch}】，坐星【${fuQiStars}】：
  對應伴侶之性格特質、相處節奏與深層互動模式。命造身心互為體用，感情世界重視精神契合與相互扶持。
▸ 欽天因果與生年四化：欽天派定來因宮於【${laiYinName}】，情感並非偶然，而是宿命深層的能量交匯。
▸ 相處建議：凡事多以溝通包容為先，互相給予適當的獨立思考空間，化執念為理解，婚姻自能長久美滿。`;
  } else if (isLimits) {
    const ml = chart.majorLimits[0];
    const ml2 = chart.majorLimits[1];
    topicAnalysis = `【專題深入：大運走勢與關鍵時序前瞻】
▸ 先天起運數：五行局為【${chart.wuxingJu.wuxingJu}】，自 ${chart.wuxingJu.ziweiStartingAge} 歲起大限行運。
▸ 第一大限（${ml.startAge}-${ml.endAge}歲）坐【${ml.stem}${ml.branch}·${ml.palace}】：奠定身心基石與求知學識之黃金期。
▸ 後續大限（${ml2.startAge}-${ml2.endAge}歲）順行邁入【${ml2.stem}${ml2.branch}·${ml2.palace}】：大限步步飛化推動社會角色確立與事業機遇。
▸ 飛星脈絡提示：${analysis.feiXing.majorLimitInfluence}。`;
  } else {
    topicAnalysis = `【全盤整體格局、性情稟賦與人生總綱論斷】
▸ 命身雙宮配置：命宮坐【${chart.mingGong.stem}${chart.mingGong.branch}·${mingStars}】，身宮立於【${chart.shenGong.stem}${chart.shenGong.branch}·${shenStars}】（${chart.shenGong.palaceName}）。
  命宮管先天心性本質，身宮主後天行動歸宿；兩者呼應，展現出知行合一的成熟意志與開拓潛能。
▸ 先天生年四化能量樞紐：${fourTransformationsText}。祿表機緣與福澤、權表才幹與開創、科表名望與智慧、忌表執著與磨礪，四者交織構成先天命造的核心驅動力。`;
  }

  // 2. 組合四大流派解析精髓
  return `【紫微大師深度論斷（確定性排盤引擎深度合成）】

一、命造根基與先天格局
◆ 命盤基本：${chart.birth.name}（${chart.birth.gender === 'male' ? '乾造' : '坤造'}），四柱干支為【${chart.ganzhi.yearGanZhi.name}年 ${chart.ganzhi.monthGanZhi.name}月 ${chart.ganzhi.dayGanZhi.name}日 ${chart.ganzhi.hourGanZhi.name}時】。
◆ 五行定局：${chart.wuxingJu.wuxingJu}（${chart.wuxingJu.wuxingElement}局），${chart.wuxingJu.ziweiStartingAge}歲起運。命主【${chart.specialZhu.mingZhu}】、身主【${chart.specialZhu.shenZhu}】、子斗安【${chart.specialZhu.ziDou}】。
◆ 命宮安於【${chart.mingGong.stem}${chart.mingGong.branch}】（星曜：${mingStars}），身宮寄於【${chart.shenGong.stem}${chart.shenGong.branch}】（${chart.shenGong.palaceName}）。
◆ 先天生年四化：${fourTransformationsText}。

二、${topicAnalysis}

三、四大流派多維度精準會通
1. 【三合派格局論】：${analysis.sanHe.careerAndWealthFocus}
2. 【飛星派化象論】：${analysis.feiXing.majorLimitInfluence}
3. 【河洛派體用論】：${analysis.heLuo.heLuoStructure}
4. 【欽天派因果論】：來因宮安於【${laiYinName}】。${analysis.qinTian.flyingInOutSummary.slice(0, 2).join(' ')}

四、大師知命造命箴言
◆ ${analysis.finalSynthesis}
◆ 命盤乃人生之道地圖，吉曜教人開創，煞曜策人精進。知命者不怨天，知己者不尤人。順應自身命格稟賦，借四化之動能於對的時機發揮所長，定能圓融通達，成就非凡人生。`;
}
