import dotenv from 'dotenv';
dotenv.config();

const env = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',

  solanaRpcUrl: process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
  heliusApiKey: process.env.HELIUS_API_KEY || '',

  tokenPollInterval: parseInt(process.env.TOKEN_POLL_INTERVAL || '10000', 10),
  metadataPollInterval: parseInt(process.env.METADATA_POLL_INTERVAL || '30000', 10),

  enableProFeatures: process.env.ENABLE_PRO_FEATURES === 'true',
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
  telegramChatId: process.env.TELEGRAM_CHAT_ID || '',

  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),

  // Supabase
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',

  // Premium / Payment
  premiumEnabled: process.env.PREMIUM_ENABLED === 'true',
  betaMode: process.env.BETA_MODE !== 'false', // default true
  monthlyPrice: parseFloat(process.env.MONTHLY_PRICE_SOL || '0.02'),
  lifetimePrice: parseFloat(process.env.LIFETIME_PRICE_SOL || '0.05'),
  paymentWalletAddress: process.env.PAYMENT_WALLET_ADDRESS || 'EcNDgT8jmBqDiRm4zcg4PjqdqjBwmCF51v2h1KUuo9z7',
  premiumTestSecret: process.env.PREMIUM_TEST_SECRET || '',

  get heliusRpcUrl() {
    if (this.heliusApiKey) {
      return `https://mainnet.helius-rpc.com/?api-key=${this.heliusApiKey}`;
    }
    return this.solanaRpcUrl;
  },

  get heliusApiUrl() {
    if (this.heliusApiKey) {
      return `https://api.helius.xyz/v0`;
    }
    return null;
  },
};

export default env;
