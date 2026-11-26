import { Browser } from '@capacitor/browser';
import { getRuntimeEnvironment } from '../platform/runtime';

// 当前文件：按宿主环境选择 Electron、Capacitor 内置浏览器或浏览器新窗口打开外链。

export const openExternalUrl = async (url: string): Promise<boolean> => {
  const runtime = getRuntimeEnvironment();

  if (runtime === 'electron' && window.electron?.openExternalUrl) {
    return window.electron.openExternalUrl(url);
  }

  if (runtime === 'capacitor-android' || runtime === 'capacitor-ios') {
    await Browser.open({ url });
    return true;
  }

  return Boolean(window.open(url, '_blank', 'noopener,noreferrer'));
};
