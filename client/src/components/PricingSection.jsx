import { useAuth } from '../context/AuthContext.jsx';

const FREE_FEATURES = [
  '20 tokens visible',
  'Basic columns (Name, Symbol, MCap, Age)',
  'Top 3 high momentum tokens',
  '30-second refresh interval',
];

const PREMIUM_FEATURES = [
  'Unlimited tokens (500+)',
  'All columns (Liquidity, Volume, Trades, Price Changes)',
  'Full high momentum (top 10)',
  '10-second refresh + WebSocket live updates',
  'Volume spike alerts feed',
  'Full search & filters',
  'Telegram webhook integration',
  'CSV export',
];

export default function PricingSection({ onUpgrade, fullPage, onBack }) {
  const { isPremium } = useAuth();

  return (
    <div className={`glass-card p-6 glow-border ${fullPage ? 'max-w-3xl mx-auto' : ''}`}>
      {fullPage && (
        <button
          onClick={onBack}
          className="text-primary-500 dark:text-primary-400 text-sm hover:text-primary-400 dark:hover:text-primary-300 mb-4 flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </button>
      )}
      <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
        <svg className="w-5 h-5 text-primary-500 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
        <span className="bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
          Premium Features
        </span>
      </h2>
      <p className="text-sm text-tahoe-400 dark:text-gray-500 mb-6">Unlock the full power of Meme Coin Radar</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Free tier card */}
        <div className="rounded-2xl border border-tahoe-200 dark:border-primary-900/30 bg-tahoe-100/50 dark:bg-surface-300/50 p-5">
          <h3 className="font-semibold text-tahoe-600 dark:text-gray-200 mb-1">Free</h3>
          <p className="text-2xl font-bold text-tahoe-600 dark:text-gray-200 mb-4">$0</p>
          <ul className="space-y-2">
            {FREE_FEATURES.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-tahoe-500 dark:text-gray-400">
                <svg className="w-4 h-4 text-tahoe-300 dark:text-gray-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Premium tier card */}
        <div className="rounded-2xl border border-primary-300 dark:border-primary-500/50 bg-primary-50/50 dark:bg-primary-500/5 p-5 relative">
          <span className="absolute -top-2.5 right-3 badge-green text-[9px] px-2 py-0.5">BETA PRICING</span>
          <h3 className="font-semibold text-tahoe-600 dark:text-gray-200 mb-1">Premium</h3>
          <div className="flex items-baseline gap-2 mb-1">
            <p className="text-2xl font-bold text-primary-500 dark:text-primary-400">0.02 SOL</p>
            <span className="text-sm text-tahoe-400 dark:text-gray-500">/ month</span>
          </div>
          <p className="text-xs text-tahoe-400 dark:text-gray-500 mb-4">
            or <strong className="text-primary-500 dark:text-primary-400">0.05 SOL</strong> lifetime (first 20 users)
          </p>
          <ul className="space-y-2">
            {PREMIUM_FEATURES.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-tahoe-600 dark:text-gray-300">
                <svg className="w-4 h-4 text-primary-500 dark:text-primary-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {f}
              </li>
            ))}
          </ul>
          {!isPremium && (
            <button
              onClick={onUpgrade}
              className="w-full btn-primary py-2.5 text-sm font-medium mt-5"
            >
              Upgrade Now
            </button>
          )}
          {isPremium && (
            <div className="mt-5 text-center py-2 rounded-xl bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 text-sm font-medium">
              Active
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
