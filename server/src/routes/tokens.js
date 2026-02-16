import { Router } from 'express';
import solanaService from '../services/solanaService.js';
import { optionalAuth } from '../middleware/auth.js';
import { attachTier } from '../middleware/tierGate.js';

const router = Router();

// Columns free users can see
const FREE_COLUMNS = ['mintAddress', 'name', 'symbol', 'marketCap', 'createdAt', 'metadata', 'priceUsd'];
const FREE_TOKEN_LIMIT = 20;
const FREE_MOMENTUM_LIMIT = 3;

function stripPremiumColumns(token) {
  const stripped = {};
  for (const key of FREE_COLUMNS) {
    if (token[key] !== undefined) stripped[key] = token[key];
  }
  return stripped;
}

// GET /api/tokens - List tokens with sorting, search, pagination
router.get('/', optionalAuth, attachTier, (req, res) => {
  const {
    sort = 'createdAt',
    order = 'desc',
    search = '',
    limit = '50',
    offset = '0',
  } = req.query;

  const isPremium = req.profile?.tier === 'premium';

  // Free users: no search, capped limit
  if (!isPremium && search) {
    return res.status(403).json({ success: false, error: 'Search requires premium subscription' });
  }

  const allowedSorts = ['createdAt', 'marketCap', 'liquidity', 'volume24h', 'buyRatio', 'name', 'symbol'];
  const sortField = allowedSorts.includes(sort) ? sort : 'createdAt';
  const sortOrder = order === 'asc' ? 'asc' : 'desc';
  const maxLimit = isPremium ? 100 : FREE_TOKEN_LIMIT;
  const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 50, 1), maxLimit);
  const parsedOffset = isPremium ? Math.max(parseInt(offset, 10) || 0, 0) : 0;

  const result = solanaService.getTokens({
    sort: sortField,
    order: sortOrder,
    search: isPremium ? String(search).slice(0, 100) : '',
    limit: parsedLimit,
    offset: parsedOffset,
  });

  const data = isPremium
    ? result.tokens
    : result.tokens.map(stripPremiumColumns);

  res.json({
    success: true,
    data,
    pagination: {
      total: result.total,
      limit: parsedLimit,
      offset: parsedOffset,
    },
    tier: isPremium ? 'premium' : 'free',
  });
});

// GET /api/tokens/high-momentum - Get high momentum tokens
router.get('/high-momentum', optionalAuth, attachTier, (req, res) => {
  const isPremium = req.profile?.tier === 'premium';
  let tokens = solanaService.getHighMomentumTokens();

  if (!isPremium) {
    tokens = tokens.slice(0, FREE_MOMENTUM_LIMIT).map(stripPremiumColumns);
  }

  res.json({
    success: true,
    data: tokens,
    count: tokens.length,
    tier: isPremium ? 'premium' : 'free',
  });
});

// GET /api/tokens/:mintAddress - Get single token details
router.get('/:mintAddress', (req, res) => {
  const { mintAddress } = req.params;
  const { tokens } = solanaService.getTokens({ search: mintAddress, limit: 1 });

  if (tokens.length === 0) {
    return res.status(404).json({ success: false, error: 'Token not found' });
  }

  res.json({ success: true, data: tokens[0] });
});

export default router;
