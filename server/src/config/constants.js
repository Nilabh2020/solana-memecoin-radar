// Pump.fun program ID on Solana
export const PUMP_FUN_PROGRAM_ID = '6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P';

// Pump.fun token mint authority
export const PUMP_FUN_MINT_AUTHORITY = 'TSLvdd1pWpHVjahSpsvCXUbgwsL3JAcvokwaKt1eokM';

// Raydium AMM program
export const RAYDIUM_AMM_PROGRAM_ID = '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8';

// Token program IDs
export const TOKEN_PROGRAM_ID = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
export const TOKEN_2022_PROGRAM_ID = 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb';

// Metadata program
export const METAPLEX_METADATA_PROGRAM_ID = 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s';

// High momentum thresholds
export const HIGH_MOMENTUM_CRITERIA = {
  maxAgeHours: 24,        // Tokens created within last 24 hours
  minBuyRatio: 0.55,      // 55%+ buy pressure
  minVolumeSpike: 2.0,    // 2x average volume
  minLiquidity: 5000,     // $5K minimum liquidity
  minVolume24h: 10000,    // $10K minimum 24h volume
};

// Cache TTLs (seconds)
export const CACHE_TTL = {
  tokenList: 10,
  tokenMetadata: 60,
  marketData: 15,
  highMomentum: 10,
};

// Max tokens to track
export const MAX_TRACKED_TOKENS = 500;

// WebSocket message types
export const WS_EVENTS = {
  TOKEN_UPDATE: 'token_update',
  NEW_TOKEN: 'new_token',
  HIGH_MOMENTUM: 'high_momentum',
  VOLUME_ALERT: 'volume_alert',
  HEARTBEAT: 'heartbeat',
  ERROR: 'error',
};
