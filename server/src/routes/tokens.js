import { Router } from 'express';
import solanaService from '../services/solanaService.js';

const router = Router();

// GET /api/tokens - List tokens with sorting, search, pagination
router.get('/', (req, res) => {
  const {
    sort = 'createdAt',
    order = 'desc',
    search = '',
    limit = '50',
    offset = '0',
  } = req.query;

  const allowedSorts = ['createdAt', 'marketCap', 'liquidity', 'volume24h', 'buyRatio', 'name', 'symbol'];
  const sortField = allowedSorts.includes(sort) ? sort : 'createdAt';
  const sortOrder = order === 'asc' ? 'asc' : 'desc';
  const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 100);
  const parsedOffset = Math.max(parseInt(offset, 10) || 0, 0);

  const result = solanaService.getTokens({
    sort: sortField,
    order: sortOrder,
    search: String(search).slice(0, 100),
    limit: parsedLimit,
    offset: parsedOffset,
  });

  res.json({
    success: true,
    data: result.tokens,
    pagination: {
      total: result.total,
      limit: parsedLimit,
      offset: parsedOffset,
    },
  });
});

// GET /api/tokens/high-momentum - Get high momentum tokens
router.get('/high-momentum', (req, res) => {
  const tokens = solanaService.getHighMomentumTokens();
  res.json({
    success: true,
    data: tokens,
    count: tokens.length,
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
