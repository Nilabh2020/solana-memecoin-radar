// In production, VITE_API_URL points to the Render backend.
// In dev, Vite proxy forwards /api to localhost:3001 so API_BASE is empty.
export const API_BASE = import.meta.env.VITE_API_URL || '';

// WebSocket URL: derive from API_BASE or fall back to dev
function deriveWsUrl() {
  if (import.meta.env.VITE_WS_URL) return import.meta.env.VITE_WS_URL;
  if (import.meta.env.VITE_API_URL) {
    // Convert https://foo.render.com -> wss://foo.render.com/ws
    return import.meta.env.VITE_API_URL
      .replace(/^https:/, 'wss:')
      .replace(/^http:/, 'ws:')
      .replace(/\/$/, '') + '/ws';
  }
  // Dev fallback
  return `ws://${window.location.hostname}:3001/ws`;
}

export const WS_URL = deriveWsUrl();
export const PRO_FEATURES_ENABLED = import.meta.env.VITE_ENABLE_PRO_FEATURES === 'true';

export const SORT_OPTIONS = [
  { key: 'createdAt', label: 'Age' },
  { key: 'marketCap', label: 'Market Cap' },
  { key: 'liquidity', label: 'Liquidity' },
  { key: 'volume24h', label: '24h Volume' },
  { key: 'buyRatio', label: 'Buy/Sell Ratio' },
];

export const REFRESH_INTERVAL = 10000;
