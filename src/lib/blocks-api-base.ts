const DEFAULT_SELISE_API = 'https://api.seliseblocks.com';

/**
 * Absolute origin for Selise Blocks HTTP APIs.
 * If `VITE_API_BASE_URL` is missing at build time, relative paths like `/idp/v1/...` resolve
 * against the SPA host; static nginx then serves `index.html` and JSON clients fail with
 * `Unexpected token '<'`.
 */
export function getBlocksApiBaseUrl(): string {
  const raw = import.meta.env.VITE_API_BASE_URL;
  if (typeof raw === 'string' && raw.trim() !== '') {
    return raw.replace(/\/$/, '');
  }
  return DEFAULT_SELISE_API;
}
