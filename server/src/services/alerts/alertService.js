import env from '../../config/env.js';
import { HIGH_MOMENTUM_CRITERIA } from '../../config/constants.js';
import logger from '../../utils/logger.js';
import telegramService from './telegramService.js';
import websocketService from '../websocketService.js';

class AlertService {
  constructor() {
    this.volumeHistory = new Map(); // mintAddress -> previous volume
    this.alertedTokens = new Set(); // avoid duplicate alerts
    this.enabled = env.enableProFeatures;
  }

  async checkAlerts(tokens) {
    if (!this.enabled) return;

    for (const token of tokens) {
      await this.checkVolumeSpike(token);
    }
  }

  async checkVolumeSpike(token) {
    const prevVolume = this.volumeHistory.get(token.mintAddress) || 0;
    this.volumeHistory.set(token.mintAddress, token.volume24h);

    if (prevVolume === 0 || token.volume24h === 0) return;

    const spike = token.volume24h / prevVolume;

    if (spike >= HIGH_MOMENTUM_CRITERIA.minVolumeSpike) {
      const alertKey = `${token.mintAddress}_${Math.floor(Date.now() / 300000)}`; // 5-min dedup
      if (this.alertedTokens.has(alertKey)) return;
      this.alertedTokens.add(alertKey);

      const alert = {
        token,
        spike,
        previousVolume: prevVolume,
        currentVolume: token.volume24h,
        timestamp: Date.now(),
      };

      logger.info('Volume spike detected', {
        name: token.name,
        spike: spike.toFixed(2),
      });

      websocketService.broadcastVolumeAlert(alert);
      await telegramService.sendVolumeSpikeAlert(token);
    }

    // Cleanup old alerts (older than 30 minutes)
    if (this.alertedTokens.size > 1000) {
      this.alertedTokens.clear();
    }
  }

  async notifyHighMomentum(tokens) {
    if (!this.enabled) return;
    await telegramService.sendHighMomentumAlert(tokens);
  }
}

const alertService = new AlertService();
export default alertService;
