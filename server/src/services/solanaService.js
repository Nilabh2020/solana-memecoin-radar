import NodeCache from 'node-cache';
import env from '../config/env.js';
import {
  CACHE_TTL,
  MAX_TRACKED_TOKENS,
  HIGH_MOMENTUM_CRITERIA,
} from '../config/constants.js';
import logger from '../utils/logger.js';
import { sleep } from '../utils/formatters.js';

const cache = new NodeCache({ stdTTL: CACHE_TTL.tokenList });

// DexScreener API endpoints (free, no key required)
const DEXSCREENER_BASE = 'https://api.dexscreener.com';

class SolanaService {
  constructor() {
    this.tokens = new Map();
    this.listeners = new Set();
    this.isRunning = false;
    this.consecutiveErrors = 0;
  }

  addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners(event, data) {
    for (const listener of this.listeners) {
      try {
        listener(event, data);
      } catch (err) {
        logger.error('Listener notification failed', { error: err.message });
      }
    }
  }

  async start() {
    if (this.isRunning) return;
    this.isRunning = true;
    logger.info('SolanaService starting — using DexScreener as primary data source');

    // Initial fetch
    await this.fetchNewPumpFunTokens();

    // Poll for new tokens from DexScreener (token profiles + search)
    this.pollInterval = setInterval(async () => {
      try {
        await this.fetchNewPumpFunTokens();
        this.consecutiveErrors = 0;
      } catch (err) {
        this.consecutiveErrors++;
        logger.error('Polling error', { error: err.message, consecutive: this.consecutiveErrors });
      }
    }, env.tokenPollInterval);

    // Refresh market data for existing tokens
    this.marketInterval = setInterval(async () => {
      try {
        await this.refreshMarketData();
      } catch (err) {
        logger.error('Market data refresh error', { error: err.message });
      }
    }, env.metadataPollInterval);

    logger.info('SolanaService started successfully');
  }

  stop() {
    this.isRunning = false;
    if (this.pollInterval) clearInterval(this.pollInterval);
    if (this.marketInterval) clearInterval(this.marketInterval);
    logger.info('SolanaService stopped');
  }

  // ──────────────────────────────────────────────────────
  // Primary strategy: DexScreener token-profiles + search
  // ──────────────────────────────────────────────────────

  async fetchNewPumpFunTokens() {
    const newTokens = [];

    try {
      // Strategy 1: DexScreener latest token profiles (gets recently boosted/listed tokens)
      const profileTokens = await this.fetchDexScreenerProfiles();
      for (const t of profileTokens) {
        if (!this.tokens.has(t.mintAddress)) {
          this.tokens.set(t.mintAddress, t);
          newTokens.push(t);
        }
      }
    } catch (err) {
      logger.warn('DexScreener profiles fetch failed', { error: err.message });
    }

    try {
      // Strategy 2: Search for recent pump.fun pairs on Solana
      const searchTokens = await this.fetchDexScreenerNewPairs();
      for (const t of searchTokens) {
        if (!this.tokens.has(t.mintAddress)) {
          this.tokens.set(t.mintAddress, t);
          newTokens.push(t);
        } else {
          // Update existing token with fresh data
          Object.assign(this.tokens.get(t.mintAddress), t);
        }
      }
    } catch (err) {
      logger.warn('DexScreener new pairs fetch failed', { error: err.message });
    }

    // Trim old tokens if needed
    if (this.tokens.size > MAX_TRACKED_TOKENS) {
      const entries = [...this.tokens.entries()]
        .sort((a, b) => b[1].createdAt - a[1].createdAt)
        .slice(0, MAX_TRACKED_TOKENS);
      this.tokens = new Map(entries);
    }

    if (newTokens.length > 0) {
      this.notifyListeners('new_tokens', newTokens);
      logger.info(`Discovered ${newTokens.length} new token(s) — total tracked: ${this.tokens.size}`);
    }

    cache.set('lastFetch', Date.now());
  }

  async fetchDexScreenerProfiles() {
    const response = await fetch(`${DEXSCREENER_BASE}/token-profiles/latest/v1`, {
      signal: AbortSignal.timeout(10000),
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`DexScreener profiles: ${response.status}`);
    }

    const profiles = await response.json();
    if (!Array.isArray(profiles)) return [];

    // Filter to Solana tokens only
    const solanaProfiles = profiles.filter(p => p.chainId === 'solana');

    const tokens = [];
    for (const profile of solanaProfiles.slice(0, 30)) {
      tokens.push({
        id: profile.tokenAddress,
        mintAddress: profile.tokenAddress,
        name: profile.description?.split('\n')?.[0]?.slice(0, 40) || `Token ${profile.tokenAddress.slice(0, 8)}`,
        symbol: profile.tokenAddress.slice(0, 6).toUpperCase(),
        createdAt: Date.now() - Math.random() * 3600000, // Will be refined by pair data
        marketCap: 0,
        liquidity: 0,
        volume24h: 0,
        buyCount: 0,
        sellCount: 0,
        buyRatio: 0.5,
        priceUsd: 0,
        holderCount: 0,
        metadata: {
          image: profile.icon || null,
          description: profile.description || null,
          url: profile.links?.[0]?.url || null,
        },
        lastUpdated: Date.now(),
      });
    }

    return tokens;
  }

  async fetchDexScreenerNewPairs() {
    // Use DexScreener search to find recently-created Solana token pairs
    // The token-boosts endpoint returns recently promoted tokens with pair data
    const urls = [
      `${DEXSCREENER_BASE}/token-boosts/latest/v1`,
      `${DEXSCREENER_BASE}/token-boosts/top/v1`,
    ];

    let allPairs = [];

    for (const url of urls) {
      try {
        const response = await fetch(url, {
          signal: AbortSignal.timeout(10000),
          headers: { 'Accept': 'application/json' },
        });

        if (!response.ok) continue;

        const boosts = await response.json();
        if (!Array.isArray(boosts)) continue;

        // Filter Solana tokens and fetch their pair data
        const solanaAddrs = boosts
          .filter(b => b.chainId === 'solana')
          .map(b => b.tokenAddress)
          .slice(0, 20);

        if (solanaAddrs.length === 0) continue;

        // Batch lookup via the tokens endpoint
        const pairResponse = await fetch(
          `${DEXSCREENER_BASE}/tokens/v1/solana/${solanaAddrs.join(',')}`,
          {
            signal: AbortSignal.timeout(10000),
            headers: { 'Accept': 'application/json' },
          }
        );

        if (pairResponse.ok) {
          const pairs = await pairResponse.json();
          if (Array.isArray(pairs)) {
            allPairs.push(...pairs);
          }
        }
      } catch {
        // Continue to next URL on failure
      }
    }

    if (allPairs.length === 0) return [];

    const tokens = [];
    const seen = new Set();

    for (const pair of allPairs) {
      const mint = pair.baseToken?.address;
      if (!mint || seen.has(mint)) continue;
      seen.add(mint);

      const buys = pair.txns?.h24?.buys || 0;
      const sells = pair.txns?.h24?.sells || 0;

      tokens.push({
        id: mint,
        mintAddress: mint,
        name: pair.baseToken?.name || `Token ${mint.slice(0, 8)}`,
        symbol: pair.baseToken?.symbol || mint.slice(0, 6).toUpperCase(),
        createdAt: pair.pairCreatedAt || Date.now(),
        pairAddress: pair.pairAddress,
        dexId: pair.dexId,
        marketCap: pair.marketCap || pair.fdv || 0,
        liquidity: pair.liquidity?.usd || 0,
        volume24h: pair.volume?.h24 || 0,
        priceUsd: parseFloat(pair.priceUsd || 0),
        priceChange5m: pair.priceChange?.m5 || 0,
        priceChange1h: pair.priceChange?.h1 || 0,
        priceChange24h: pair.priceChange?.h24 || 0,
        buyCount: buys,
        sellCount: sells,
        buyRatio: buys + sells > 0 ? buys / (buys + sells) : 0.5,
        holderCount: 0,
        metadata: {
          image: pair.info?.imageUrl || null,
          description: null,
          url: pair.url || null,
        },
        lastUpdated: Date.now(),
      });
    }

    return tokens;
  }

  // ──────────────────────────────────────────────────
  // Refresh market data for already-tracked tokens
  // ──────────────────────────────────────────────────

  async refreshMarketData() {
    const tokenList = [...this.tokens.values()];
    if (tokenList.length === 0) return;

    // Batch tokens by taking up to 30 addresses and querying DexScreener
    const batch = tokenList
      .sort((a, b) => a.lastUpdated - b.lastUpdated) // refresh stalest first
      .slice(0, 30);

    const updatedTokens = [];

    // DexScreener supports multi-address lookup (up to 30 comma-separated)
    const addresses = batch.map(t => t.mintAddress).join(',');

    try {
      const response = await fetch(
        `${DEXSCREENER_BASE}/tokens/v1/solana/${addresses}`,
        {
          signal: AbortSignal.timeout(15000),
          headers: { 'Accept': 'application/json' },
        }
      );

      if (!response.ok) {
        // Fallback: try the older endpoint format
        await this.refreshMarketDataFallback(batch, updatedTokens);
        return;
      }

      const pairs = await response.json();
      if (!Array.isArray(pairs)) return;

      // Group pairs by base token address
      const pairsByToken = new Map();
      for (const pair of pairs) {
        const addr = pair.baseToken?.address;
        if (!addr) continue;
        if (!pairsByToken.has(addr)) pairsByToken.set(addr, []);
        pairsByToken.get(addr).push(pair);
      }

      for (const token of batch) {
        const tokenPairs = pairsByToken.get(token.mintAddress);
        if (!tokenPairs || tokenPairs.length === 0) continue;

        // Pick highest-liquidity pair
        const primary = tokenPairs.sort((a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0))[0];
        this.applyPairData(token, primary);
        updatedTokens.push(token);
      }
    } catch (err) {
      logger.warn('Batch market refresh failed, using fallback', { error: err.message });
      await this.refreshMarketDataFallback(batch, updatedTokens);
    }

    if (updatedTokens.length > 0) {
      this.notifyListeners('token_update', updatedTokens);
      logger.debug(`Refreshed market data for ${updatedTokens.length} token(s)`);
    }
  }

  async refreshMarketDataFallback(batch, updatedTokens) {
    // Individual lookups as fallback (slower but more compatible)
    for (const token of batch.slice(0, 10)) {
      try {
        const response = await fetch(
          `${DEXSCREENER_BASE}/latest/dex/tokens/${token.mintAddress}`,
          { signal: AbortSignal.timeout(5000) }
        );

        if (!response.ok) continue;

        const data = await response.json();
        const pairs = data?.pairs;
        if (!pairs || pairs.length === 0) continue;

        const primary = pairs.sort((a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0))[0];
        this.applyPairData(token, primary);
        updatedTokens.push(token);

        await sleep(200); // Respect rate limits
      } catch {
        // Skip on error
      }
    }
  }

  applyPairData(token, pair) {
    token.priceUsd = parseFloat(pair.priceUsd || 0);
    token.marketCap = pair.marketCap || pair.fdv || 0;
    token.liquidity = pair.liquidity?.usd || 0;
    token.volume24h = pair.volume?.h24 || 0;
    token.priceChange5m = pair.priceChange?.m5 || 0;
    token.priceChange1h = pair.priceChange?.h1 || 0;
    token.priceChange24h = pair.priceChange?.h24 || 0;

    const buys = pair.txns?.h24?.buys || 0;
    const sells = pair.txns?.h24?.sells || 0;
    token.buyCount = buys;
    token.sellCount = sells;
    token.buyRatio = buys + sells > 0 ? buys / (buys + sells) : 0.5;

    if (pair.info?.imageUrl) {
      token.metadata = token.metadata || {};
      token.metadata.image = pair.info.imageUrl;
    }

    if (pair.baseToken) {
      token.name = pair.baseToken.name || token.name;
      token.symbol = pair.baseToken.symbol || token.symbol;
    }

    if (pair.pairCreatedAt) {
      token.createdAt = pair.pairCreatedAt;
    }

    token.pairAddress = pair.pairAddress || token.pairAddress;
    token.dexId = pair.dexId || token.dexId;
    token.lastUpdated = Date.now();
  }

  // ──────────────────────────────────────────────────
  // Query methods (used by API routes)
  // ──────────────────────────────────────────────────

  getTokens({ sort = 'createdAt', order = 'desc', search = '', limit = 50, offset = 0 } = {}) {
    let tokens = [...this.tokens.values()];

    if (search) {
      const q = search.toLowerCase();
      tokens = tokens.filter(
        t =>
          t.name.toLowerCase().includes(q) ||
          t.symbol.toLowerCase().includes(q) ||
          t.mintAddress.toLowerCase().includes(q)
      );
    }

    // Handle string sorts
    const stringSorts = new Set(['name', 'symbol']);
    tokens.sort((a, b) => {
      let aVal = a[sort] ?? 0;
      let bVal = b[sort] ?? 0;
      if (stringSorts.has(sort)) {
        aVal = String(aVal).toLowerCase();
        bVal = String(bVal).toLowerCase();
        return order === 'desc' ? bVal.localeCompare(aVal) : aVal.localeCompare(bVal);
      }
      return order === 'desc' ? bVal - aVal : aVal - bVal;
    });

    const total = tokens.length;
    tokens = tokens.slice(offset, offset + limit);

    return { tokens, total };
  }

  getHighMomentumTokens() {
    const cacheKey = 'highMomentum';
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    const now = Date.now();
    const maxAgeMs = HIGH_MOMENTUM_CRITERIA.maxAgeHours * 3600000;
    const tokens = [...this.tokens.values()].filter(t => {
      const age = now - t.createdAt;
      return (
        age <= maxAgeMs &&
        t.buyRatio >= HIGH_MOMENTUM_CRITERIA.minBuyRatio &&
        t.volume24h >= HIGH_MOMENTUM_CRITERIA.minVolume24h &&
        t.liquidity >= HIGH_MOMENTUM_CRITERIA.minLiquidity
      );
    });

    // Score: higher volume * buy ratio / age = more momentum
    tokens.sort((a, b) => {
      const ageA = Math.max(1, (now - a.createdAt) / 60000);
      const ageB = Math.max(1, (now - b.createdAt) / 60000);
      const scoreA = (a.volume24h * a.buyRatio) / ageA;
      const scoreB = (b.volume24h * b.buyRatio) / ageB;
      return scoreB - scoreA;
    });

    const result = tokens.slice(0, 10);
    cache.set(cacheKey, result, CACHE_TTL.highMomentum);
    return result;
  }

  getStats() {
    const tokens = [...this.tokens.values()];
    const now = Date.now();
    const last1h = tokens.filter(t => now - t.createdAt < 3600000);
    const totalLiquidity = tokens.reduce((sum, t) => sum + (t.liquidity || 0), 0);
    const totalVolume = tokens.reduce((sum, t) => sum + (t.volume24h || 0), 0);

    return {
      totalTokens: tokens.length,
      newLast1h: last1h.length,
      totalLiquidity,
      totalVolume24h: totalVolume,
      highMomentumCount: this.getHighMomentumTokens().length,
      lastUpdated: Date.now(),
    };
  }
}

const solanaService = new SolanaService();
export default solanaService;
