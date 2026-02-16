import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import AccountMenu from './AccountMenu.jsx';

export default function Header({ connected, onRefresh, onLoginClick, onUpgrade, onPricingClick }) {
  const [refreshing, setRefreshing] = useState(false);
  const { user, isPremium, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();

  function handleRefresh() {
    setRefreshing(true);
    onRefresh();
    setTimeout(() => setRefreshing(false), 1000);
  }

  return (
    <header className="glass-card border-b border-tahoe-200/80 dark:border-primary-900/30 sticky top-0 z-50 rounded-none">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/radar.svg" alt="Radar" className="w-8 h-8 animate-pulse-slow" />
          <div>
            <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
              Solana Meme Coin Radar
            </h1>
            <p className="text-[10px] text-tahoe-400 dark:text-gray-500 uppercase tracking-widest">
              Pump.fun Token Tracker
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Pricing link */}
          <button
            onClick={onPricingClick}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium
                       text-tahoe-500 dark:text-gray-400
                       hover:bg-tahoe-200/60 dark:hover:bg-surface-50 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            Pricing
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl hover:bg-tahoe-200/60 dark:hover:bg-surface-50 transition-colors"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <svg className="w-4 h-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-tahoe-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {/* Refresh */}
          <button
            onClick={handleRefresh}
            className="p-2 rounded-xl hover:bg-tahoe-200/60 dark:hover:bg-surface-50 transition-colors"
            title="Refresh data"
          >
            <svg
              className={`w-4 h-4 text-tahoe-400 dark:text-gray-400 ${refreshing ? 'animate-spin' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>

          {/* Connection status */}
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                isPremium
                  ? (connected ? 'bg-green-400 shadow-glow-green' : 'bg-yellow-400')
                  : 'bg-green-400 shadow-glow-green'
              }`}
            />
            <span className="text-xs text-tahoe-400 dark:text-gray-500 hidden sm:block">
              {isPremium
                ? (connected ? 'Live' : 'Connecting...')
                : 'Online'}
            </span>
          </div>

          {/* Auth: Login button or Account menu */}
          {!loading && (
            user ? (
              <AccountMenu onUpgrade={onUpgrade} />
            ) : (
              <button
                onClick={onLoginClick}
                className="btn-primary px-4 py-1.5 text-sm font-medium"
              >
                Sign In
              </button>
            )
          )}
        </div>
      </div>
    </header>
  );
}
