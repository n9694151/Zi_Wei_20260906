/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ZiWeiEngine } from '../src/ziwei/engine';
import { BirthInput } from '../src/ziwei/types/chart';

const input: BirthInput = {
  name: '黃金測試一號',
  gender: 'male',
  calendarType: 'solar',
  solarDate: '2026-09-06',
  birthHour: 21,
  birthMinute: 45,
  birthPlace: '台北市',
  timezone: 'Asia/Taipei',
  longitude: 121.5,
  ziHourRule: 'ziEarly',
};

console.log('=== RUNNING GOLDEN TEST #001 ===');
const chart = ZiWeiEngine.calculate(input);

const assertions: Array<{ name: string; expected: any; actual: any }> = [
  { name: '農曆年份', expected: 2026, actual: chart.calendar.lunarYear },
  { name: '農曆月份', expected: 7, actual: chart.calendar.lunarMonth },
  { name: '農曆日期', expected: 25, actual: chart.calendar.lunarDay },
  { name: '時辰地支', expected: '亥', actual: chart.calendar.hourBranch },
  { name: '年干支', expected: '丙午', actual: chart.ganzhi.yearGanZhi.name },
  { name: '月干支', expected: '丙申', actual: chart.ganzhi.monthGanZhi.name },
  { name: '日干支', expected: '癸未', actual: chart.ganzhi.dayGanZhi.name },
  { name: '時干支', expected: '癸亥', actual: chart.ganzhi.hourGanZhi.name },
  { name: '命宮地支', expected: '酉', actual: chart.mingGong.branch },
  { name: '命宮天干', expected: '丁', actual: chart.mingGong.stem },
  { name: '身宮地支', expected: '未', actual: chart.shenGong.branch },
  { name: '五行局', expected: '火六局', actual: chart.wuxingJu.wuxingJu },
  { name: '五行局起運年齡', expected: 6, actual: chart.wuxingJu.ziweiStartingAge },
  { name: '命主', expected: '文曲', actual: chart.specialZhu.mingZhu },
  { name: '身主', expected: '火星', actual: chart.specialZhu.shenZhu },
  { name: '子斗', expected: '巳', actual: chart.specialZhu.ziDou },
];

let failedCount = 0;

for (const a of assertions) {
  const pass = a.expected === a.actual;
  if (pass) {
    console.log(`✅ PASS: ${a.name} => ${a.actual}`);
  } else {
    console.error(`❌ FAIL: ${a.name} => expected: ${a.expected}, got: ${a.actual}`);
    failedCount++;
  }
}

// Check Four Transformations for 丙年
const sH = chart.fourTransformations;
const lu = sH.find((t) => t.type === '祿');
const quan = sH.find((t) => t.type === '權');
const ke = sH.find((t) => t.type === '科');
const ji = sH.find((t) => t.type === '忌');

const fourTransformsPass =
  lu?.star === '天同' && quan?.star === '天機' && ke?.star === '文昌' && ji?.star === '廉貞';

if (fourTransformsPass) {
  console.log(`✅ PASS: 丙年生年四化 (天同祿, 天機權, 文昌科, 廉貞忌)`);
} else {
  console.error(`❌ FAIL: 生年四化 mismatch!`, sH);
  failedCount++;
}

// Check Major Limit 1
const ml1 = chart.majorLimits[0];
if (ml1 && ml1.startAge === 6 && ml1.endAge === 15 && ml1.palace === '命宮' && ml1.branch === '酉') {
  console.log(`✅ PASS: 第一大限 => 6-15 命宮 (丁酉)`);
} else {
  console.error(`❌ FAIL: 第一大限 mismatch!`, ml1);
  failedCount++;
}

console.log(`\n=== SUMMARY: ${failedCount === 0 ? 'ALL GOLDEN TEST ASSERTIONS PASSED! 🎉' : `${failedCount} TESTS FAILED`} ===`);
if (failedCount > 0) process.exit(1);
