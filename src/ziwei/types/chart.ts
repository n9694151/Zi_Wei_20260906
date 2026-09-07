/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  HeavenlyStem,
  EarthlyBranch,
  PalaceName,
  WuxingJu,
  WuxingElement,
  Gender,
  CalendarType,
  ZiHourRule,
} from './constants';
import { PalaceInfo } from './palace';
import { MainStarInfo, AuxiliaryStarInfo, MaleficStarInfo, ExtStarInfo } from './star';
import { TransformItem } from './transformation';
import { MajorLimit, AnnualChart } from './limit';

export type CalculationStatus = 'verified' | 'implemented' | 'partial' | 'notImplemented';

export interface BirthInput {
  id?: string;
  name: string;
  gender: Gender;
  calendarType: CalendarType;
  solarDate: string; // "YYYY-MM-DD"
  lunarYear?: number;
  lunarMonth?: number;
  lunarDay?: number;
  isLeapMonth?: boolean;
  birthHour: number; // 0 - 23
  birthMinute: number; // 0 - 59
  birthPlace: string;
  latitude?: number;
  longitude?: number;
  timezone: string; // e.g. "Asia/Taipei"
  dst?: boolean;
  ziHourRule?: ZiHourRule; // "ziEarly" | "ziLate", default "ziEarly"
  limitDirectionRule?: 'auto' | 'clockwise' | 'counterClockwise'; // 大限行運步序: 自動/順行/逆行
}

export interface GanzhiRecord {
  gan: HeavenlyStem;
  zhi: EarthlyBranch;
  name: string; // e.g. "丙午"
}

export interface GanzhiSet {
  yearGanZhi: GanzhiRecord;
  monthGanZhi: GanzhiRecord;
  dayGanZhi: GanzhiRecord;
  hourGanZhi: GanzhiRecord;
  // Distinct separation between calendar year, lunar year, and solar term Ganzhi year
  calendarYear: number;
  lunarYear: number;
  ganZhiYear: number;
}

export interface SolarTermInfo {
  name: string;
  solarDate: string;
  solarTime: string;
}

export interface JieQiDetails {
  previousTerm: SolarTermInfo;
  currentTerm: SolarTermInfo;
  nextTerm: SolarTermInfo;
  solarMonthIndex: number; // 1 to 12
}

export interface CalendarInfo {
  solarDate: string;
  solarTime: string;
  trueSolarTime: string;
  lunarYear: number;
  lunarMonth: number;
  lunarDay: number;
  lunarMonthName: string;
  lunarDayName: string;
  isLeapMonth: boolean;
  hourBranch: EarthlyBranch;
  jieQi: JieQiDetails;
}

export interface CalculationMetadata {
  engineVersion: string;
  calendarVersion: string;
  fourTransformVersion: string;
  methodVersion: string;
  timezone: string;
  ziHourRule: ZiHourRule;
  createdAt: string;
  calculationStatus: CalculationStatus;
}

export interface ChartJson {
  chartVersion: string;
  birth: BirthInput;
  calendar: CalendarInfo;
  ganzhi: GanzhiSet;
  mingGong: {
    branch: EarthlyBranch;
    stem: HeavenlyStem;
    palaceName: PalaceName;
  };
  shenGong: {
    branch: EarthlyBranch;
    stem: HeavenlyStem;
    palaceName: PalaceName;
  };
  wuxingJu: {
    wuxingElement: WuxingElement;
    wuxingJu: WuxingJu;
    ziweiStartingAge: number;
  };
  specialZhu: {
    mingZhu: string; // 命主 (e.g. 文曲)
    shenZhu: string; // 身主 (e.g. 火星)
    ziDou: EarthlyBranch; // 子斗
  };
  palaces: PalaceInfo[];
  mainStars: MainStarInfo[];
  auxiliaryStars: AuxiliaryStarInfo[];
  maleficStars: MaleficStarInfo[];
  extendedStars?: ExtStarInfo[];
  fourTransformations: TransformItem[];
  majorLimits: MajorLimit[];
  annualCharts: AnnualChart[];
  calculationMetadata: CalculationMetadata;
}
