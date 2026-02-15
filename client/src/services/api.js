import { API_BASE } from '../utils/constants.js';

async function fetchJson(url, options = {}) {
  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

export async function getTokens({ sort, order, search, limit, offset } = {}) {
  const params = new URLSearchParams();
  if (sort) params.set('sort', sort);
  if (order) params.set('order', order);
  if (search) params.set('search', search);
  if (limit) params.set('limit', String(limit));
  if (offset) params.set('offset', String(offset));

  return fetchJson(`/api/tokens?${params}`);
}

export async function getHighMomentumTokens() {
  return fetchJson('/api/tokens/high-momentum');
}

export async function getStats() {
  return fetchJson('/api/stats');
}

export async function getHealth() {
  return fetchJson('/api/health');
}
