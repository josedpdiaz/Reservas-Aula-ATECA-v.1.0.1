/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';

export interface DeviceInfo {
  isMobile: boolean;           // Smartphone (< 768px o UA móvil)
  isTablet: boolean;           // Tablet (iPad, Android Tablet, 768px <= width < 1024px, o UA tablet)
  isDesktop: boolean;          // Monitor de ordenador PC (width >= 1024px sin touch/tablet)
  isMobileOrTablet: boolean;    // Móvil o Tablet (cualquier pantalla < 1024px o dispositivo táctil móvil/tablet)
  isPortrait: boolean;         // Modo vertical (alto >= ancho)
  isLandscape: boolean;        // Modo apaisado (ancho > alto)
  screenWidth: number;
  screenHeight: number;
}

export function detectDevice(): DeviceInfo {
  if (typeof window === 'undefined') {
    return {
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      isMobileOrTablet: false,
      isPortrait: false,
      isLandscape: true,
      screenWidth: 1200,
      screenHeight: 800,
    };
  }

  const width = window.innerWidth || document.documentElement.clientWidth || 1024;
  const height = window.innerHeight || document.documentElement.clientHeight || 768;
  const isPortrait = height >= width;
  const isLandscape = !isPortrait;

  const ua = (typeof navigator !== 'undefined' ? navigator.userAgent : '') || '';
  const isTouch = (typeof window !== 'undefined' && ('ontouchstart' in window)) || 
                  (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0);

  // Expresiones regulares de detección
  const mobileRegex = /Android.*Mobile|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i;
  const tabletRegex = /(iPad|Tablet|Android(?!.*Mobile)|Kindle|Silk|PlayBook)/i;
  
  // iPads en iOS 13+ suelen identificarse como Macintosh con soporte táctil
  const isIPad = (ua.includes('Macintosh') && isTouch) || tabletRegex.test(ua);
  const isMobileUA = mobileRegex.test(ua) && !isIPad;

  let isMobile = false;
  let isTablet = false;

  if (isMobileUA || (width < 768 && isTouch)) {
    isMobile = true;
  } else if (isIPad || (isTouch && width < 1024) || (width >= 768 && width < 1024)) {
    isTablet = true;
  } else if (width < 1024) {
    isMobile = width < 768;
    isTablet = width >= 768;
  }

  const isMobileOrTablet = isMobile || isTablet || width < 1024;
  const isDesktop = !isMobileOrTablet;

  return {
    isMobile,
    isTablet,
    isDesktop,
    isMobileOrTablet,
    isPortrait,
    isLandscape,
    screenWidth: width,
    screenHeight: height,
  };
}

export function useDeviceDetection(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(() => detectDevice());

  useEffect(() => {
    let timeoutId: any = null;

    const handleUpdate = () => {
      // Usar debounce ligero para cambios rápidos de orientación o resize
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setDeviceInfo(detectDevice());
      }, 50);
    };

    window.addEventListener('resize', handleUpdate, { passive: true });
    window.addEventListener('orientationchange', handleUpdate, { passive: true });

    // Actualización inmediata al montar
    handleUpdate();

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleUpdate);
      window.removeEventListener('orientationchange', handleUpdate);
    };
  }, []);

  return deviceInfo;
}
