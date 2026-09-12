/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';

export type DeviceMode = 'auto' | 'desktop' | 'tablet' | 'mobile';
export type EffectiveDevice = 'desktop' | 'tablet' | 'mobile';

export function getEffectiveDevice(mode: DeviceMode, windowWidth: number): EffectiveDevice {
  if (mode === 'desktop') return 'desktop';
  if (mode === 'tablet') return 'tablet';
  if (mode === 'mobile') return 'mobile';

  // auto detection based on standard breakpoints
  if (windowWidth < 640) return 'mobile';
  if (windowWidth < 1024) return 'tablet';
  return 'desktop';
}

export function useResponsiveDevice(mode: DeviceMode = 'auto') {
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const effectiveDevice = getEffectiveDevice(mode, windowWidth);

  return {
    windowWidth,
    effectiveDevice,
  };
}
