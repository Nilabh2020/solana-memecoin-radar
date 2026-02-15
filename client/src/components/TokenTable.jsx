import { formatMarketCap, formatAge, formatBuyRatio, shortenAddress, formatNumber } from '../utils/formatters.js';
import { SORT_OPTIONS } from '../utils/constants.js';

function SortIcon({ active, order }) {
  if (!active) {
    return (
      <svg className="w-3 h-3 text-gray-600 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
      </svg>
    );
  }

  return (
    <svg className="w-3 h-3 text-primary-400 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      {order === 'desc' ? (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      )}
    </svg>
  );
}

function BuyRatioBadge({ ratio }) {
  const pct = (ratio * 100).toFixed(1);
  if (ratio >= 0.7) return <span className="badge-green">{pct}% Buy</span>;
  if (ratio >= 0.5) return <span className="badge-purple">{pct}% Buy</span>;
  return <span className="badge-red">{pct}% Sell</span>;
}

export default function TokenTable({ tokens, sort, onSort, loading }) {
  if (loading && tokens.length === 0) {
    return (
      <div className="glass-card glow-border overflow-hidden">
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent mb-3" />
          <p className="text-gray-500 text-sm">Scanning Solana for new tokens...</p>
        </div>
      </div>
    );
  }

  if (tokens.length === 0) {
    return (
      <div className="glass-card glow-border overflow-hidden">
        <div className="p-8 text-center">
          <svg className="w-12 h-12 text-gray-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="text-gray-500 text-sm">No tokens found matching your criteria.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card glow-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-primary-900/30">
              <th className="text-left px-4 py-3 text-[10px] uppercase tracking-wider text-gray-500 font-medium">
                Token
              </th>
              {SORT_OPTIONS.map(opt => (
                <th
                  key={opt.key}
                  className="text-right px-4 py-3 text-[10px] uppercase tracking-wider text-gray-500 font-medium cursor-pointer hover:text-gray-300 transition-colors select-none"
                  onClick={() => onSort(opt.key)}
                >
                  <div className="flex items-center justify-end">
                    {opt.label}
                    <SortIcon active={sort.key === opt.key} order={sort.order} />
                  </div>
                </th>
              ))}
              <th className="text-right px-4 py-3 text-[10px] uppercase tracking-wider text-gray-500 font-medium">
                Trades
              </th>
            </tr>
          </thead>
          <tbody>
            {tokens.map((token, idx) => (
              <tr
                key={token.mintAddress || idx}
                className="table-row-hover border-b border-primary-950/20 last:border-0 animate-fade-in"
                style={{ animationDelay: `${idx * 20}ms` }}
              >
                {/* Token info */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {token.metadata?.image ? (
                      <img
                        src={token.metadata.image}
                        alt={token.symbol}
                        className="w-8 h-8 rounded-full bg-surface-400 flex-shrink-0"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-700 to-accent-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {token.symbol?.charAt(0) || '?'}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-gray-200 truncate max-w-[160px]">
                        {token.name}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-primary-400 font-medium">{token.symbol}</span>
                        <span className="text-[10px] text-gray-600 font-mono">
                          {shortenAddress(token.mintAddress)}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>

                {/* Age */}
                <td className="text-right px-4 py-3">
                  <span className="text-sm text-gray-300">{formatAge(token.createdAt)}</span>
                </td>

                {/* Market Cap */}
                <td className="text-right px-4 py-3">
                  <span className="text-sm font-medium text-gray-200">
                    {formatMarketCap(token.marketCap)}
                  </span>
                </td>

                {/* Liquidity */}
                <td className="text-right px-4 py-3">
                  <span className="text-sm text-gray-300">
                    {formatMarketCap(token.liquidity)}
                  </span>
                </td>

                {/* Volume */}
                <td className="text-right px-4 py-3">
                  <span className="text-sm text-gray-300">
                    {formatMarketCap(token.volume24h)}
                  </span>
                </td>

                {/* Buy Ratio */}
                <td className="text-right px-4 py-3">
                  <BuyRatioBadge ratio={token.buyRatio} />
                </td>

                {/* Trades */}
                <td className="text-right px-4 py-3">
                  <div className="text-xs">
                    <span className="text-green-400">{formatNumber(token.buyCount)}</span>
                    <span className="text-gray-600 mx-1">/</span>
                    <span className="text-red-400">{formatNumber(token.sellCount)}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
