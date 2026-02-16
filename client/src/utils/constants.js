// In production, VITE_API_URL points to the Render backend.
// In dev, Vite proxy forwards /api to localhost:3001 so API_BASE is empty.
const PROD_API_URL = 'https://solana-memecoin-radar.onrender.com';
export const API_BASE = (import.meta.env.VITE_API_URL
  || (import.meta.env.PROD ? PROD_API_URL : '')).replace(/\/+$/, '');

// WebSocket URL: derive from API_BASE or fall back to dev
function deriveWsUrl() {
  if (import.meta.env.VITE_WS_URL) return import.meta.env.VITE_WS_URL;
  const apiUrl = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? PROD_API_URL : '');
  if (apiUrl) {
    // Convert https://foo.render.com -> wss://foo.render.com/ws
    return apiUrl
      .replace(/^https:/, 'wss:')
      .replace(/^http:/, 'ws:')
      .replace(/\/$/, '') + '/ws';
  }
  // Dev fallback
  return `ws://${window.location.hostname}:3001/ws`;
}

export const WS_URL = deriveWsUrl();

// Legacy flag — kept for backwards compat but tier is now driven by AuthContext
export const PRO_FEATURES_ENABLED = import.meta.env.VITE_ENABLE_PRO_FEATURES === 'true';

export const SORT_OPTIONS = [
  { key: 'createdAt', label: 'Age' },
  { key: 'marketCap', label: 'Market Cap' },
  { key: 'liquidity', label: 'Liquidity' },
  { key: 'volume24h', label: '24h Volume' },
  { key: 'buyRatio', label: 'Buy/Sell Ratio' },
];

// Refresh intervals by tier
export const REFRESH_INTERVAL_FREE = 30000;  // 30s for free
export const REFRESH_INTERVAL_PREMIUM = 10000; // 10s for premium
export const REFRESH_INTERVAL = 10000; // default (backwards compat)

// Payment
export const PAYMENT_WALLET = 'EcNDgT8jmBqDiRm4zcg4PjqdqjBwmCF51v2h1KUuo9z7';
