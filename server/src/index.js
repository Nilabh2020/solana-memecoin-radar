import express from 'express';
import cors from 'cors';
import { createServer } from 'http';

import env from './config/env.js';
import { setupSecurity } from './middleware/security.js';
import logger from './utils/logger.js';

import tokenRoutes from './routes/tokens.js';
import statsRoutes from './routes/stats.js';
import healthRoutes from './routes/health.js';
import authRoutes from './routes/auth.js';
import paymentRoutes from './routes/payments.js';

import solanaService from './services/solanaService.js';
import websocketService from './services/websocketService.js';
import alertService from './services/alerts/alertService.js';
import { WS_EVENTS } from './config/constants.js';

const app = express();
const server = createServer(app);

// CORS — allow configured origin + Render/Vercel preview URLs
app.use(cors({
  origin(origin, callback) {
    // Allow requests with no origin (curl, server-to-server)
    if (!origin) return callback(null, true);
    // Wildcard allows all origins
    if (env.corsOrigin === '*') return callback(null, true);
    const allowed = [
      env.corsOrigin,
      /\.onrender\.com$/,
      /\.vercel\.app$/,
      /localhost/,
    ];
    const isAllowed = allowed.some(a =>
      a instanceof RegExp ? a.test(origin) : a === origin
    );
    callback(null, isAllowed);
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH'],
  credentials: true,
}));

// Security middleware
setupSecurity(app);

// JSON parsing
app.use(express.json({ limit: '1mb' }));

// Routes
app.use('/api/tokens', tokenRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/payments', paymentRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Not found' });
});

// Error handler
app.use((err, req, res, _next) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  res.status(500).json({ success: false, error: 'Internal server error' });
});

// Initialize WebSocket
websocketService.initialize(server);

// Connect Solana service events to WebSocket broadcasts
solanaService.addListener((event, data) => {
  switch (event) {
    case 'new_tokens':
      websocketService.broadcastNewToken(data);
      break;
    case 'token_update':
      websocketService.broadcastTokenUpdate(data);
      alertService.checkAlerts(data);
      break;
  }
});

// Periodic high-momentum broadcast
setInterval(() => {
  const momentum = solanaService.getHighMomentumTokens();
  if (momentum.length > 0) {
    websocketService.broadcastHighMomentum(momentum);
  }
}, 30000);

// Start server — bind 0.0.0.0 (required by Render/Railway free tier)
const PORT = process.env.PORT || env.port;
server.listen(PORT, '0.0.0.0', () => {
  logger.info(`Server running on 0.0.0.0:${PORT} [${env.nodeEnv}]`);
  solanaService.start();
});

// Graceful shutdown
function shutdown() {
  logger.info('Shutting down...');
  solanaService.stop();
  websocketService.shutdown();
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 5000);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
