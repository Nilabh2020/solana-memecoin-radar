# Solana Meme Coin Radar

Real-time dashboard that tracks newly launched tokens from Pump.fun on Solana. Built as a production-ready SaaS application with a modern crypto-themed dark UI.

## Architecture

```
┌─────────────────────┐     WebSocket/REST     ┌──────────────────────┐
│   React + Vite      │ ◄──────────────────►   │  Node.js + Express   │
│   Tailwind CSS      │                        │  WebSocket Server    │
│   (Vercel)          │                        │  (Railway/Render)    │
└─────────────────────┘                        └──────────┬───────────┘
                                                          │
                                               ┌──────────▼───────────┐
                                               │  Solana RPC          │
                                               │  DexScreener API     │
                                               │  Helius API (opt)    │
                                               └──────────────────────┘
```

## Features

### Core
- **Token Discovery** — Monitors Pump.fun program for new token mints in real-time
- **Market Data** — Fetches price, market cap, liquidity, volume from DexScreener
- **High Momentum Detection** — Identifies tokens with volume spikes, high buy ratio, age < 60min
- **Sortable & Searchable** — Sort by any column, search by name/symbol/address
- **WebSocket Updates** — Real-time push updates via WebSocket connection
- **Responsive Design** — Full mobile support with dark purple/blue crypto theme

### Pro Features (Feature-Flagged)
- Volume spike alerts (in-app + WebSocket)
- Telegram webhook notifications
- Custom wallet tracking (extensible)

### Security
- Read-only analytics only — **no wallet connection**
- Helmet security headers
- Rate limiting on all API endpoints
- Input sanitization

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### 1. Clone and install

```bash
# Backend
cd server
cp .env.example .env
npm install

# Frontend
cd ../client
cp .env.example .env
npm install
```

### 2. Configure environment

Edit `server/.env`:

```env
# Required — Use a dedicated RPC for better rate limits
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com

# Recommended — Helius provides enriched data and higher rate limits (free tier available)
HELIUS_API_KEY=your_helius_api_key

# Server
PORT=3001
CORS_ORIGIN=http://localhost:5173

# Pro features (optional)
ENABLE_PRO_FEATURES=false
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
```

### 3. Run development

```bash
# Terminal 1 — Backend
cd server
npm run dev

# Terminal 2 — Frontend
cd client
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## API Reference

| Endpoint | Method | Description |
|---|---|---|
| `/api/tokens` | GET | List tokens (query: sort, order, search, limit, offset) |
| `/api/tokens/high-momentum` | GET | Get high-momentum tokens |
| `/api/tokens/:mintAddress` | GET | Get single token details |
| `/api/stats` | GET | Dashboard statistics |
| `/api/health` | GET | Health check |

### WebSocket

Connect to `ws://localhost:3001/ws`

Events:
- `token_update` — Updated market data for tracked tokens
- `new_token` — Newly discovered token launch
- `high_momentum` — High momentum tokens list
- `volume_alert` — Volume spike alert (Pro)

## Deployment

### Frontend → Vercel

```bash
cd client
npx vercel
```

Set environment variables in Vercel dashboard:
- `VITE_API_URL` = your backend URL
- `VITE_WS_URL` = your backend WebSocket URL
- `VITE_ENABLE_PRO_FEATURES` = false

Update `vercel.json` rewrite rules to point to your backend.

### Backend → Railway / Render

**Railway:**
```bash
cd server
railway init
railway up
```

**Render:**
- Create a new Web Service pointing to the `server/` directory
- Build: `npm install`
- Start: `npm start`
- Add environment variables from `.env.example`

**Docker:**
```bash
cd server
docker build -t memecoin-radar-api .
docker run -p 3001:3001 --env-file .env memecoin-radar-api
```

## Project Structure

```
├── server/
│   ├── src/
│   │   ├── config/          # Environment & constants
│   │   ├── middleware/       # Security, rate limiting
│   │   ├── routes/           # API endpoints
│   │   ├── services/         # Core business logic
│   │   │   ├── alerts/       # Telegram & alert system
│   │   │   ├── solanaService.js    # Token discovery & market data
│   │   │   └── websocketService.js # Real-time push
│   │   ├── utils/            # Logging, formatters
│   │   └── index.js          # Server entry point
│   ├── Dockerfile
│   └── package.json
├── client/
│   ├── src/
│   │   ├── components/       # React UI components
│   │   ├── hooks/            # useTokens, useWebSocket
│   │   ├── services/         # API client
│   │   ├── utils/            # Formatters, constants
│   │   ├── App.jsx           # Root component
│   │   └── main.jsx          # Entry point
│   ├── vercel.json
│   ├── tailwind.config.js
│   └── package.json
└── README.md
```

## RPC Recommendations

The free Solana RPC has aggressive rate limits. For production use:

| Provider | Free Tier | Recommended For |
|---|---|---|
| [Helius](https://helius.dev) | 100k credits/day | Best DX, enriched APIs |
| [QuickNode](https://quicknode.com) | Limited | Low latency |
| [Alchemy](https://alchemy.com) | Free tier | General purpose |

## Disclaimer

This tool is for **research and educational purposes only**. It does not provide financial advice. Always DYOR (Do Your Own Research) before interacting with any token.
