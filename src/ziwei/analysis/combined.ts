/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChartJson } from '../types/chart';
import { CombinedAnalysisResult } from '../types/analysis';
import { SanHeAnalysisEngine } from './sanHe';
import { FeiXingAnalysisEngine } from './feiXing';
import { HeLuoAnalysisEngine } from './heLuo';
import { QinTianAnalysisEngine } from './qinTian';

export class CombinedAnalysisEngine {
  /**
   * Deterministic multi-school synthesis.
   * Compares and synthesizes results from SanHe, FeiXing, HeLuo, and QinTian schools.
   */
  public static analyze(chart: ChartJson): CombinedAnalysisResult {
    const sanHe = SanHeAnalysisEngine.analyze(chart, '命宮');
    const feiXing = FeiXingAnalysisEngine.analyze(chart);
    const heLuo = HeLuoAnalysisEngine.analyze(chart);
    const qinTian = QinTianAnalysisEngine.analyze(chart);

    const mingStars = chart.palaces.find((p) => p.isMingGong)?.mainStars.map((s) => s.name) || [];
    const mingStem = chart.mingGong.stem;
    const mingBranch = chart.mingGong.branch;

    const commonPoints: string[] = [
      `命宮立於${mingStem}${mingBranch}，主星坐[${mingStars.join('、') || '借星安宮'}]，四大流派皆以此宮作為命造本源特徵之錨定點。`,
      `生年四化(${chart.ganzhi.yearGanZhi.gan}年：${chart.fourTransformations.map((t) => `${t.star}化${t.type}`).join('、')})為先天宿命根本磁場，三合、飛星與欽天皆高度重視其在十二宮位之落點。`,
      `五行局為【${chart.wuxingJu.wuxingJu}】，起始大限自${chart.wuxingJu.ziweiStartingAge}歲起運，奠定河洛體用數理及大限時間軸推演之基礎節律。`,
    ];

    const differences: string[] = [
      '【三合派】重星情互照與格局搭配（如昌曲、左右、魁鉞吉會，或羊陀火鈴煞忌交衝），著眼於社會成就、事業財運與器度高低。',
      '【飛星派】重宮干化入化出，追蹤「祿之所向」為慾望機遇，「忌之所往」為執念牽掛，論斷事情發生的連鎖反應與時空因果。',
      '【河洛派】重一六共宗、五十同途等河圖洛書天地數理，將十二宮轉化為數值體用共振，探討先天身心與後天聚散之根基。',
      '【欽天四化派】重視「來因宮」的因果根源，將四化視為男女質能轉換，並以「向心力(↑)」與「離心力(↓)」斷定緣分聚散與時空定位。',
    ];

    const strongEvidence: string[] = [
      `命宮干支為 ${mingStem}${mingBranch}，納音五行定局為 ${chart.wuxingJu.wuxingJu}，其氣數起點明確且不可動搖。`,
      `生年祿存在於 ${chart.auxiliaryStars.find((s) => s.name === '祿存')?.palace || '特定宮位'}，擎羊陀羅夾護格局具備客觀穩定之引力軌道。`,
      `第一大限自 ${chart.majorLimits[0].startAge} 歲啟動，依陽男順行軌跡步入父母、福德、田宅宮，行運脈絡具清晰之時序進程。`,
    ];

    const uncertainPoints: string[] = [
      '後天環境教育與個人意志選擇對主星特質具有顯著引導分流效果（如廉貞可為公職法紀亦可為藝術才藝，武曲可為金融商賈亦可為技術工匠）。',
      '大限與流年交疊之際，四化疊宮（本命四化、大限四化、流年四化）之動態感應，需配合當事人實際現實處境作細密微調。',
    ];

    const finalSynthesis = `本命造以${mingStem}${mingBranch}宮位為心性核心，結合三合星情之才具格局、飛星四化之牽引動態、河洛數理之五行局氣候，以及欽天來因因果。先天具備鮮明之性格開拓力與才藝潛質，行運時善用命主星曜之優勢並謹慎應對化忌所在之考驗，即可於人生各階段穩健成就。`;

    return {
      school: 'combined',
      sanHe,
      feiXing,
      heLuo,
      qinTian,
      commonPoints,
      differences,
      strongEvidence,
      uncertainPoints,
      finalSynthesis,
    };
  }
}
