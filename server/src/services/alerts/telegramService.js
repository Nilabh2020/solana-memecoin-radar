import env from '../../config/env.js';
import logger from '../../utils/logger.js';
import { formatMarketCap } from '../../utils/formatters.js';

class TelegramService {
  constructor() {
    this.enabled = env.enableProFeatures && env.telegramBotToken && env.telegramChatId;
    this.baseUrl = `https://api.telegram.org/bot${env.telegramBotToken}`;
    this.rateLimitMs = 1000; // 1 message per second
    this.lastSent = 0;
  }

  async sendMessage(text, parseMode = 'HTML') {
    if (!this.enabled) return;

    const now = Date.now();
    if (now - this.lastSent < this.rateLimitMs) return;
    this.lastSent = now;

    try {
      const response = await fetch(`${this.baseUrl}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: env.telegramChatId,
          text,
          parse_mode: parseMode,
          disable_web_page_preview: true,
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        logger.error('Telegram send failed', { error: err });
      }
    } catch (err) {
      logger.error('Telegram API error', { error: err.message });
    }
  }

  async sendVolumeSpikeAlert(token) {
    const msg = [
      '🚀 <b>Volume Spike Alert</b>',
      '',
      `<b>${token.name}</b> (${token.symbol})`,
      `💰 Market Cap: ${formatMarketCap(token.marketCap)}`,
      `💧 Liquidity: ${formatMarketCap(token.liquidity)}`,
      `📊 24h Volume: ${formatMarketCap(token.volume24h)}`,
      `📈 Buy Ratio: ${(token.buyRatio * 100).toFixed(1)}%`,
      '',
      `🔗 <code>${token.mintAddress}</code>`,
    ].join('\n');

    await this.sendMessage(msg);
  }

  async sendHighMomentumAlert(tokens) {
    if (tokens.length === 0) return;

    const lines = tokens.slice(0, 5).map((t, i) =>
      `${i + 1}. <b>${t.name}</b> (${t.symbol}) - MC: ${formatMarketCap(t.marketCap)} | Buy: ${(t.buyRatio * 100).toFixed(0)}%`
    );

    const msg = [
      '🔥 <b>High Momentum Tokens</b>',
      '',
      ...lines,
    ].join('\n');

    await this.sendMessage(msg);
  }
}

const telegramService = new TelegramService();
export default telegramService;
