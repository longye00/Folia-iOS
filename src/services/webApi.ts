import { isCapacitorNative } from '../platform/runtime';

// 当前文件：解析 Web 与 Capacitor 共用的 Folia 服务端 API 地址。

export interface FoliaApiResolutionOptions {
  apiBase?: string | null;
  capacitorNative?: boolean;
}

const readConfiguredApiBase = (): string => (
  String(import.meta.env.VITE_FOLIA_API_BASE || '').trim()
);

const normalizeApiBase = (value: string): string => value.replace(/\/+$/, '');
const normalizeEndpoint = (value: string): string => value.replace(/^\/+/, '').replace(/^api\/+/, '');

// Builds one API URL while preserving the existing same-origin Web fallback.
export const resolveFoliaApiUrl = (
  endpoint: string,
  options: FoliaApiResolutionOptions = {},
): string => {
  const configuredBase = options.apiBase === undefined
    ? readConfiguredApiBase()
    : String(options.apiBase || '').trim();
  const capacitorNative = options.capacitorNative ?? isCapacitorNative();
  const normalizedEndpoint = normalizeEndpoint(endpoint);

  if (configuredBase) {
    return `${normalizeApiBase(configuredBase)}/${normalizedEndpoint}`;
  }

  if (capacitorNative) {
    throw new Error('VITE_FOLIA_API_BASE must be configured for Capacitor mobile builds.');
  }

  return `/api/${normalizedEndpoint}`;
};
