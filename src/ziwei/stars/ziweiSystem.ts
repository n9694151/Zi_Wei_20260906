/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { EarthlyBranch, EARTHLY_BRANCHES, MainStarName } from '../types/constants';

/**
 * Calculates the Earthly Branch of Ziwei Star deterministically.
 * Formula:
 * Given lunar day (1-30) and Wuxing Ju number (水=2, 木=3, 金=4, 土=5, 火=6):
 * If remainder r = (ju - (day % ju)) % ju === 0:
 *   quotient = day / ju
 *   branchIndex = (寅(2) + (quotient - 1)) % 12
 * If r !== 0:
 *   quotient = (day + r) / ju
 *   if r is even:
 *     branchIndex = (寅(2) + (quotient - 1) + r) % 12
 *   if r is odd:
 *     branchIndex = (寅(2) + (quotient - 1) - r + 120) % 12
 */
export function getZiweiBranch(lunarDay: number, juNumber: number): EarthlyBranch {
  const remainder = (juNumber - (lunarDay % juNumber)) % juNumber;

  if (remainder === 0) {
    const quotient = Math.floor(lunarDay / juNumber);
    const branchIdx = (2 + (quotient - 1)) % 12;
    return EARTHLY_BRANCHES[branchIdx];
  }

  const quotient = Math.floor((lunarDay + remainder) / juNumber);
  let branchIdx: number;

  if (remainder % 2 === 0) {
    branchIdx = (2 + (quotient - 1) + remainder) % 12;
  } else {
    branchIdx = (2 + (quotient - 1) - remainder + 120) % 12;
  }

  return EARTHLY_BRANCHES[branchIdx];
}

export interface ZiweiStarPosition {
  name: MainStarName;
  branch: EarthlyBranch;
  branchIndex: number;
}

export class ZiWeiStarEngine {
  /**
   * Generates the 6 stars of the Ziwei System based on Ziwei's branch.
   * Ziwei System (counter-clockwise):
   * 1. 紫微: at Z
   * 2. 天機: (Z - 1)
   * 3. 太陽: (Z - 3)
   * 4. 武曲: (Z - 4)
   * 5. 天同: (Z - 5)
   * 6. 廉貞: (Z - 8)
   */
  public static calculate(ziweiBranch: EarthlyBranch): ZiweiStarPosition[] {
    const zIdx = EARTHLY_BRANCHES.indexOf(ziweiBranch);

    const positions: Array<{ name: MainStarName; offset: number }> = [
      { name: '紫微', offset: 0 },
      { name: '天機', offset: -1 },
      { name: '太陽', offset: -3 },
      { name: '武曲', offset: -4 },
      { name: '天同', offset: -5 },
      { name: '廉貞', offset: -8 },
    ];

    return positions.map((p) => {
      const idx = (zIdx + p.offset + 120) % 12;
      return {
        name: p.name,
        branch: EARTHLY_BRANCHES[idx],
        branchIndex: idx,
      };
    });
  }
}
