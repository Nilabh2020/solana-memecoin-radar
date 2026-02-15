import { WebSocketServer } from 'ws';
import { WS_EVENTS } from '../config/constants.js';
import logger from '../utils/logger.js';

class WebSocketService {
  constructor() {
    this.wss = null;
    this.clients = new Set();
    this.heartbeatInterval = null;
  }

  initialize(server) {
    this.wss = new WebSocketServer({ server, path: '/ws' });

    this.wss.on('connection', (ws, req) => {
      const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      logger.info('WebSocket client connected', { ip: clientIp });

      ws.isAlive = true;
      this.clients.add(ws);

      ws.on('pong', () => {
        ws.isAlive = true;
      });

      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message);
          this.handleMessage(ws, data);
        } catch {
          // Ignore malformed messages
        }
      });

      ws.on('close', () => {
        this.clients.delete(ws);
        logger.debug('WebSocket client disconnected');
      });

      ws.on('error', (err) => {
        logger.error('WebSocket error', { error: err.message });
        this.clients.delete(ws);
      });

      // Send welcome message
      this.send(ws, {
        type: 'connected',
        message: 'Connected to Solana Meme Coin Radar',
        timestamp: Date.now(),
      });
    });

    // Heartbeat to detect stale connections
    this.heartbeatInterval = setInterval(() => {
      this.wss.clients.forEach((ws) => {
        if (!ws.isAlive) {
          this.clients.delete(ws);
          return ws.terminate();
        }
        ws.isAlive = false;
        ws.ping();
      });
    }, 30000);

    logger.info('WebSocket server initialized');
  }

  handleMessage(ws, data) {
    switch (data.type) {
      case 'subscribe':
        ws.subscriptions = ws.subscriptions || new Set();
        ws.subscriptions.add(data.channel);
        break;
      case 'unsubscribe':
        ws.subscriptions?.delete(data.channel);
        break;
      case 'ping':
        this.send(ws, { type: 'pong', timestamp: Date.now() });
        break;
    }
  }

  send(ws, data) {
    if (ws.readyState === ws.OPEN) {
      try {
        ws.send(JSON.stringify(data));
      } catch (err) {
        logger.error('WebSocket send error', { error: err.message });
      }
    }
  }

  broadcast(event, data) {
    const message = JSON.stringify({ type: event, data, timestamp: Date.now() });

    for (const client of this.clients) {
      if (client.readyState === client.OPEN) {
        try {
          client.send(message);
        } catch {
          this.clients.delete(client);
        }
      }
    }
  }

  broadcastTokenUpdate(tokens) {
    this.broadcast(WS_EVENTS.TOKEN_UPDATE, tokens);
  }

  broadcastNewToken(tokens) {
    this.broadcast(WS_EVENTS.NEW_TOKEN, tokens);
  }

  broadcastHighMomentum(tokens) {
    this.broadcast(WS_EVENTS.HIGH_MOMENTUM, tokens);
  }

  broadcastVolumeAlert(alert) {
    this.broadcast(WS_EVENTS.VOLUME_ALERT, alert);
  }

  getClientCount() {
    return this.clients.size;
  }

  shutdown() {
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
    if (this.wss) {
      this.wss.clients.forEach((ws) => ws.terminate());
      this.wss.close();
    }
    logger.info('WebSocket server shut down');
  }
}

const websocketService = new WebSocketService();
export default websocketService;
