import { formatMarketCap, formatAge, formatBuyRatio, shortenAddress, formatNumber } from '../utils/formatters.js';
import { SORT_OPTIONS } from '../utils/constants.js';
import { useAuth } from '../context/AuthContext.jsx';

function SortIcon({ active, order }) {
  if (!active) {
    return (
      <svg className="w-3 h-3 text-tahoe-300 dark:text-gray-600 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
      </svg>
    );
  }

  return (
    <svg className="w-3 h-3 text-primary-500 dark:text-primary-400 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      {order === 'desc' ? (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      )}
    </svg>
  );
}

function LockIcon() {
  return (
    <svg className="w-3 h-3 text-primary-400/60 dark:text-primary-500/60 ml-1 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
}

function BuyRatioBadge({ ratio }) {
  const pct = (ratio * 100).toFixed(1);
  if (ratio >= 0.7) return <span className="badge-green">{pct}% Buy</span>;
  if (ratio >= 0.5) return <span className="badge-purple">{pct}% Buy</span>;
  return <span className="badge-red">{pct}% Sell</span>;
}

function BlurredCell({ children, onClick }) {
  return (
    <td className="text-right px-4 py-3">
      <div
        className="relative cursor-pointer group"
        onClick={onClick}
      >
        <span className="blur-[5px] select-none pointer-events-none text-sm text-tahoe-500 dark:text-gray-300">
          {children}
        </span>
        <div className="absolute inset-0 flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
          <LockIcon />
        </div>
      </div>
    </td>
  );
}

const PLACEHOLDER = {
  liquidity: '$12.3K',
  volume: '$45.6K',
  buyRatio: '72.1% Buy',
  buys: '142',
  sells: '38',
};

const PREMIUM_SORT_KEYS = ['liquidity', 'volume24h', 'buyRatio'];

export default function TokenTable({ tokens, sort, onSort, loading, onPricingClick }) {
  const { isPremium } = useAuth();

  if (loading && tokens.length === 0) {
    return (
      <div className="glass-card glow-border overflow-hidden">
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent mb-3" />
          <p className="text-tahoe-400 dark:text-gray-500 text-sm">Scanning Solana for new tokens...</p>
        </div>
      </div>
    );
  }

  if (tokens.length === 0) {
    return (
      <div className="glass-card glow-border overflow-hidden">
        <div className="p-8 text-center">
          <svg className="w-12 h-12 text-tahoe-300 dark:text-gray-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="text-tahoe-400 dark:text-gray-500 text-sm">No tokens found matching your criteria.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card glow-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-tahoe-200 dark:border-primary-900/30">
              <th className="text-left px-4 py-3 text-[10px] uppercase tracking-wider text-tahoe-400 dark:text-gray-500 font-medium">
                Token
              </th>
              {SORT_OPTIONS.map(opt => {
                const isLocked = !isPremium && PREMIUM_SORT_KEYS.includes(opt.key);
                return (
                  <th
                    key={opt.key}
                    className={`text-right px-4 py-3 text-[10px] uppercase tracking-wider font-medium select-none transition-colors ${
                      isLocked
                        ? 'text-tahoe-300 dark:text-gray-600 cursor-pointer hover:text-tahoe-400 dark:hover:text-gray-400'
                        : 'text-tahoe-400 dark:text-gray-500 cursor-pointer hover:text-tahoe-600 dark:hover:text-gray-300'
                    }`}
                    onClick={() => isLocked ? onPricingClick?.() : onSort(opt.key)}
                  >
                    <div className="flex items-center justify-end">
                      {opt.label}
                      {isLocked ? <LockIcon /> : <SortIcon active={sort.key === opt.key} order={sort.order} />}
                    </div>
                  </th>
                );
              })}
              <th className={`text-right px-4 py-3 text-[10px] uppercase tracking-wider font-medium ${!isPremium ? 'text-tahoe-300 dark:text-gray-600' : 'text-tahoe-400 dark:text-gray-500'}`}>
                <div className="flex items-center justify-end">
                  Trades
                  {!isPremium && <LockIcon />}
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {tokens.map((token, idx) => (
              <tr
                key={token.mintAddress || idx}
                className="table-row-hover border-b border-tahoe-100 dark:border-primary-950/20 last:border-0 animate-fade-in"
                style={{ animationDelay: `${idx * 20}ms` }}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {token.metadata?.image ? (
                      <img
                        src={token.metadata.image}
                        alt={token.symbol}
                        className="w-8 h-8 rounded-full bg-tahoe-200 dark:bg-surface-400 flex-shrink-0"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 dark:from-primary-700 dark:to-accent-700 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                        {token.symbol?.charAt(0) || '?'}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-tahoe-600 dark:text-gray-200 truncate max-w-[160px]">
                        {token.name}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-primary-500 dark:text-primary-400 font-medium">{token.symbol}</span>
                        <span className="text-[10px] text-tahoe-400 dark:text-gray-600 font-mono">
                          {shortenAddress(token.mintAddress)}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>

                <td className="text-right px-4 py-3">
                  <span className="text-sm text-tahoe-500 dark:text-gray-300">{formatAge(token.createdAt)}</span>
                </td>

                <td className="text-right px-4 py-3">
                  <span className="text-sm font-medium text-tahoe-600 dark:text-gray-200">
                    {formatMarketCap(token.marketCap)}
                  </span>
                </td>

                {isPremium ? (
                  <>
                    <td className="text-right px-4 py-3">
                      <span className="text-sm text-tahoe-500 dark:text-gray-300">
                        {formatMarketCap(token.liquidity)}
                      </span>
                    </td>
                    <td className="text-right px-4 py-3">
                      <span className="text-sm text-tahoe-500 dark:text-gray-300">
                        {formatMarketCap(token.volume24h)}
                      </span>
                    </td>
                    <td className="text-right px-4 py-3">
                      <BuyRatioBadge ratio={token.buyRatio} />
                    </td>
                    <td className="text-right px-4 py-3">
                      <div className="text-xs">
                        <span className="text-green-500 dark:text-green-400">{formatNumber(token.buyCount)}</span>
                        <span className="text-tahoe-300 dark:text-gray-600 mx-1">/</span>
                        <span className="text-red-500 dark:text-red-400">{formatNumber(token.sellCount)}</span>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <BlurredCell onClick={onPricingClick}>{PLACEHOLDER.liquidity}</BlurredCell>
                    <BlurredCell onClick={onPricingClick}>{PLACEHOLDER.volume}</BlurredCell>
                    <BlurredCell onClick={onPricingClick}>{PLACEHOLDER.buyRatio}</BlurredCell>
                    <BlurredCell onClick={onPricingClick}>
                      <span className="text-green-500 dark:text-green-400">{PLACEHOLDER.buys}</span>
                      <span className="text-tahoe-300 dark:text-gray-600 mx-1">/</span>
                      <span className="text-red-500 dark:text-red-400">{PLACEHOLDER.sells}</span>
                    </BlurredCell>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
