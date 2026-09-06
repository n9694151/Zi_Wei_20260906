/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { EarthlyBranch, EARTHLY_BRANCHES, MainStarName } from '../types/constants';

/**
 * Calculates Tianfu Branch based on Ziwei Branch.
 * Tianfu is symmetric to Ziwei across the 寅-申 axis.
 * Formula: (ziweiBranchIndex + tianfuBranchIndex) % 12 = 4
 * => tianfuBranchIndex = (4 - ziweiBranchIndex + 12) % 12
 */
export function getTianfuBranch(ziweiBranch: EarthlyBranch): EarthlyBranch {
  const zIdx = EARTHLY_BRANCHES.indexOf(ziweiBranch);
  const tIdx = (4 - zIdx + 12) % 12;
  return EARTHLY_BRANCHES[tIdx];
}

export interface TianfuStarPosition {
  name: MainStarName;
  branch: EarthlyBranch;
  branchIndex: number;
}

export class TianFuStarEngine {
  /**
   * Generates the 8 stars of the Tianfu System based on Tianfu's branch.
   * Tianfu System (clockwise):
   * 1. 天府: at T
   * 2. 太陰: (T + 1)
   * 3. 貪狼: (T + 2)
   * 4. 巨門: (T + 3)
   * 5. 天相: (T + 4)
   * 6. 天梁: (T + 5)
   * 7. 七殺: (T + 6)
   * 8. 破軍: (T + 10)
   */
  public static calculate(tianfuBranch: EarthlyBranch): TianfuStarPosition[] {
    const tIdx = EARTHLY_BRANCHES.indexOf(tianfuBranch);

    const positions: Array<{ name: MainStarName; offset: number }> = [
      { name: '天府', offset: 0 },
      { name: '太陰', offset: 1 },
      { name: '貪狼', offset: 2 },
      { name: '巨門', offset: 3 },
      { name: '天相', offset: 4 },
      { name: '天梁', offset: 5 },
      { name: '七殺', offset: 6 },
      { name: '破軍', offset: 10 },
    ];

    return positions.map((p) => {
      const idx = (tIdx + p.offset) % 12;
      return {
        name: p.name,
        branch: EARTHLY_BRANCHES[idx],
        branchIndex: idx,
      };
    });
  }
}
