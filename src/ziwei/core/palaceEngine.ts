/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  HeavenlyStem,
  EarthlyBranch,
  PalaceName,
  PALACE_NAMES,
  HEAVENLY_STEMS,
  EARTHLY_BRANCHES,
} from '../types/constants';
import { PalaceInfo, PalaceRelationship, SanFangSiZheng } from '../types/palace';

/**
 * Derives Palace Heavenly Stem for any branch from Year Gan using 五虎遁.
 */
export function getPalaceStem(yearGan: HeavenlyStem, branch: EarthlyBranch): HeavenlyStem {
  let startGanIdx = 2; // 丙
  switch (yearGan) {
    case '甲':
    case '己':
      startGanIdx = 2; // 丙寅
      break;
    case '乙':
    case '庚':
      startGanIdx = 4; // 戊寅
      break;
    case '丙':
    case '辛':
      startGanIdx = 6; // 庚寅
      break;
    case '丁':
    case '壬':
      startGanIdx = 8; // 壬寅
      break;
    case '戊':
    case '癸':
      startGanIdx = 0; // 甲寅
      break;
  }

  const branchIdx = EARTHLY_BRANCHES.indexOf(branch);
  // 寅 is index 2. Distance from 寅 clockwise:
  const diff = (branchIdx - 2 + 12) % 12;
  const stemIdx = (startGanIdx + diff) % 10;

  return HEAVENLY_STEMS[stemIdx];
}

/**
 * Calculates relationships (opposite, trines, sandwiches) for a given branch.
 */
export function getPalaceRelationships(branch: EarthlyBranch): PalaceRelationship {
  const idx = EARTHLY_BRANCHES.indexOf(branch);
  return {
    opposite: EARTHLY_BRANCHES[(idx + 6) % 12],
    trine1: EARTHLY_BRANCHES[(idx + 4) % 12],
    trine2: EARTHLY_BRANCHES[(idx + 8) % 12],
    sandwich1: EARTHLY_BRANCHES[(idx + 1) % 12],
    sandwich2: EARTHLY_BRANCHES[(idx - 1 + 12) % 12],
  };
}

export class PalaceEngine {
  /**
   * Generates the 12 palaces in standard order starting from 命宮.
   */
  public static generatePalaces(
    mingGongBranch: EarthlyBranch,
    shenGongBranch: EarthlyBranch,
    yearGan: HeavenlyStem,
  ): PalaceInfo[] {
    const mingIdx = EARTHLY_BRANCHES.indexOf(mingGongBranch);
    const palaces: PalaceInfo[] = [];

    // 12 Palaces counter-clockwise from 命宮:
    // 命宮, 兄弟宮, 夫妻宮, 子女宮, 財帛宮, 疾厄宮,
    // 遷移宮, 僕役宮(交友), 官祿宮, 田宅宮, 福德宮, 父母宮
    for (let i = 0; i < 12; i++) {
      const name = PALACE_NAMES[i];
      const branchIdx = (mingIdx - i + 12) % 12;
      const branch = EARTHLY_BRANCHES[branchIdx];
      const stem = getPalaceStem(yearGan, branch);

      palaces.push({
        index: i,
        name,
        branch,
        stem,
        isMingGong: i === 0,
        isShenGong: branch === shenGongBranch,
        relationships: getPalaceRelationships(branch),
        mainStars: [],
        auxiliaryStars: [],
        maleficStars: [],
        extendedStars: [],
        transformations: [],
      });
    }

    return palaces;
  }
}

export class SanFangSiZhengEngine {
  /**
   * Queries San Fang Si Zheng (本宮, 對宮, 三合一, 三合二) for any palace.
   */
  public static query(palaces: PalaceInfo[], targetPalaceName: PalaceName): SanFangSiZheng {
    const target = palaces.find((p) => p.name === targetPalaceName);
    if (!target) {
      throw new Error(`Palace not found: ${targetPalaceName}`);
    }

    const rel = target.relationships;
    const oppositePalace = palaces.find((p) => p.branch === rel.opposite)!;
    const trine1Palace = palaces.find((p) => p.branch === rel.trine1)!;
    const trine2Palace = palaces.find((p) => p.branch === rel.trine2)!;

    return {
      palace: target.name,
      branch: target.branch,
      stem: target.stem,
      opposite: {
        palace: oppositePalace.name,
        branch: oppositePalace.branch,
        stem: oppositePalace.stem,
      },
      trine: [
        {
          palace: trine1Palace.name,
          branch: trine1Palace.branch,
          stem: trine1Palace.stem,
        },
        {
          palace: trine2Palace.name,
          branch: trine2Palace.branch,
          stem: trine2Palace.stem,
        },
      ],
    };
  }
}
