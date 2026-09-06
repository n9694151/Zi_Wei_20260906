/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const;
export type HeavenlyStem = typeof HEAVENLY_STEMS[number];

export const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const;
export type EarthlyBranch = typeof EARTHLY_BRANCHES[number];

export const PALACE_NAMES = [
  '命宮',
  '兄弟宮',
  '夫妻宮',
  '子女宮',
  '財帛宮',
  '疾厄宮',
  '遷移宮',
  '僕役宮', // 也稱交友宮
  '官祿宮',
  '田宅宮',
  '福德宮',
  '父母宮',
] as const;
export type PalaceName = typeof PALACE_NAMES[number];

export const WUXING_JUS = ['水二局', '木三局', '金四局', '土五局', '火六局'] as const;
export type WuxingJu = typeof WUXING_JUS[number];

export const WUXING_ELEMENTS = ['金', '木', '水', '火', '土'] as const;
export type WuxingElement = typeof WUXING_ELEMENTS[number];

export const MAIN_STARS = [
  '紫微', '天機', '太陽', '武曲', '天同', '廉貞',
  '天府', '太陰', '貪狼', '巨門', '天相', '天梁', '七殺', '破軍',
] as const;
export type MainStarName = typeof MAIN_STARS[number];

export const LUCKY_STARS = [
  '左輔', '右弼', '文昌', '文曲', '天魁', '天鉞', '祿存', '天馬',
] as const;
export type LuckyStarName = typeof LUCKY_STARS[number];

export const MALEFIC_STARS = [
  '擎羊', '陀羅', '火星', '鈴星', '地空', '地劫',
] as const;
export type MaleficStarName = typeof MALEFIC_STARS[number];

export const EXTENDED_STARS = [
  '紅鸞', '天喜', '龍池', '鳳閣', '三台', '八座', '恩光', '天貴', '台輔', '封誥', '天刑', '天姚',
] as const;
export type ExtendedStarName = typeof EXTENDED_STARS[number];

export type AllStarName = MainStarName | LuckyStarName | MaleficStarName | ExtendedStarName | string;

export const TRANSFORM_TYPES = ['祿', '權', '科', '忌'] as const;
export type TransformType = typeof TRANSFORM_TYPES[number];

export type Gender = 'male' | 'female' | '男' | '女' | '陽男' | '陽女' | '陰男' | '陰女';
export type CalendarType = 'solar' | 'lunar';
export type ZiHourRule = 'ziEarly' | 'ziLate';
