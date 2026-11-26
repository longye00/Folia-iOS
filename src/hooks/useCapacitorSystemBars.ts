import { useEffect } from 'react';
import { Style, StatusBar } from '@capacitor/status-bar';
import { getRuntimeEnvironment } from '../platform/runtime';

// 当前文件：让 Capacitor 系统栏跟随 Folia 明暗主题，并标记原生安全区环境。

export const useCapacitorSystemBars = (isDaylight: boolean): void => {
  useEffect(() => {
    const runtime = getRuntimeEnvironment();
    if (runtime !== 'capacitor-android' && runtime !== 'capacitor-ios') return;

    document.documentElement.dataset.runtime = runtime;
    void StatusBar.setOverlaysWebView({ overlay: true });
    void StatusBar.setBackgroundColor({ color: '#00000000' });
    void StatusBar.setStyle({ style: isDaylight ? Style.Dark : Style.Light });

    return () => {
      delete document.documentElement.dataset.runtime;
    };
  }, [isDaylight]);
};
