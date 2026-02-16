import { API_BASE } from '../utils/constants.js';
import { supabase } from './supabase.js';

async function getAuthHeaders() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      return { Authorization: `Bearer ${session.access_token}` };
    }
  } catch {
    // Not logged in
  }
  return {};
}

async function fetchJson(url, options = {}) {
  const authHeaders = await getAuthHeaders();

  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// Token endpoints
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

// Auth endpoints
export async function getMe() {
  return fetchJson('/api/auth/me');
}

export async function getSubscription() {
  return fetchJson('/api/auth/subscription');
}

// Payment endpoints
export async function verifyPayment(txSignature, planType) {
  return fetchJson('/api/payments/verify', {
    method: 'POST',
    body: JSON.stringify({ tx_signature: txSignature, plan_type: planType }),
  });
}

export async function getPaymentHistory() {
  return fetchJson('/api/payments/history');
}

export async function getPricing() {
  return fetchJson('/api/payments/pricing');
}
