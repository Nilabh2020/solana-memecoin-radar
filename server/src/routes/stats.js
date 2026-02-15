import { Router } from 'express';
import solanaService from '../services/solanaService.js';
import websocketService from '../services/websocketService.js';

const router = Router();

// GET /api/stats - Dashboard statistics
router.get('/', (req, res) => {
  const stats = solanaService.getStats();
  res.json({
    success: true,
    data: {
      ...stats,
      wsClients: websocketService.getClientCount(),
    },
  });
});

export default router;
