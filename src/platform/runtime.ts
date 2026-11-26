import { Capacitor } from '@capacitor/core';

// 当前文件：统一描述 Web、Electron 与 Capacitor 原生壳的运行时能力。

export type RuntimeEnvironment = 'web' | 'electron' | 'capacitor-android' | 'capacitor-ios';

export const hasElectronBridge = (): boolean => (
  typeof window !== 'undefined'
  && Boolean((window as typeof window & { electron?: unknown }).electron)
);

export const isCapacitorAndroid = (): boolean => (
  typeof window !== 'undefined'
  && Capacitor.isNativePlatform()
  && Capacitor.getPlatform() === 'android'
);

export const isCapacitorIos = (): boolean => (
  typeof window !== 'undefined'
  && Capacitor.isNativePlatform()
  && Capacitor.getPlatform() === 'ios'
);

export const isCapacitorNative = (): boolean => isCapacitorAndroid() || isCapacitorIos();

export const getRuntimeEnvironment = (): RuntimeEnvironment => {
  if (hasElectronBridge()) return 'electron';
  if (isCapacitorAndroid()) return 'capacitor-android';
  if (isCapacitorIos()) return 'capacitor-ios';
  return 'web';
};

export const supportsLocalMusicImport = (): boolean => !isCapacitorNative();
