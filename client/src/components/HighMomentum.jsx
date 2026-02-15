import { formatMarketCap, formatAge, formatBuyRatio } from '../utils/formatters.js';

function MomentumCard({ token, index }) {
  const buyRatioColor =
    token.buyRatio >= 0.7 ? 'text-green-400' :
    token.buyRatio >= 0.5 ? 'text-yellow-400' :
    'text-red-400';

  return (
    <div className="momentum-card" style={{ animationDelay: `${index * 50}ms` }}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {token.metadata?.image ? (
            <img
              src={token.metadata.image}
              alt={token.symbol}
              className="w-8 h-8 rounded-full bg-surface-400"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center text-xs font-bold">
              {token.symbol?.charAt(0) || '?'}
            </div>
          )}
          <div>
            <h3 className="font-semibold text-sm text-gray-100 truncate max-w-[120px]">
              {token.name}
            </h3>
            <p className="text-xs text-gray-500">{token.symbol}</p>
          </div>
        </div>
        <span className="badge-purple text-[10px]">
          {formatAge(token.createdAt)}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-gray-500">MCap</span>
          <p className="font-medium text-gray-200">{formatMarketCap(token.marketCap)}</p>
        </div>
        <div>
          <span className="text-gray-500">Liq</span>
          <p className="font-medium text-gray-200">{formatMarketCap(token.liquidity)}</p>
        </div>
        <div>
          <span className="text-gray-500">Vol 24h</span>
          <p className="font-medium text-gray-200">{formatMarketCap(token.volume24h)}</p>
        </div>
        <div>
          <span className="text-gray-500">Buy Ratio</span>
          <p className={`font-medium ${buyRatioColor}`}>
            {formatBuyRatio(token.buyRatio)}
          </p>
        </div>
      </div>

      {/* Momentum bar */}
      <div className="mt-2 h-1 bg-surface-400 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-500"
          style={{ width: `${Math.min(token.buyRatio * 100, 100)}%` }}
        />
      </div>
    </div>
  );
}

export default function HighMomentum({ tokens }) {
  if (!tokens || tokens.length === 0) {
    return (
      <div className="glass-card p-6 glow-border">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
          </svg>
          <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
            High Momentum
          </span>
        </h2>
        <p className="text-sm text-gray-500 text-center py-4">
          No high momentum tokens detected yet. Watching for tokens with high buy ratio,
          strong volume, and created within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 glow-border">
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-red-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
        </svg>
        <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
          High Momentum
        </span>
        <span className="ml-auto badge-green">{tokens.length} active</span>
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        {tokens.map((token, i) => (
          <MomentumCard key={token.mintAddress} token={token} index={i} />
        ))}
      </div>
    </div>
  );
}
