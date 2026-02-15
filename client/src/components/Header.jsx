import { useState } from 'react';

export default function Header({ connected, onRefresh }) {
  const [refreshing, setRefreshing] = useState(false);

  function handleRefresh() {
    setRefreshing(true);
    onRefresh();
    setTimeout(() => setRefreshing(false), 1000);
  }

  return (
    <header className="glass-card border-b border-primary-900/30 sticky top-0 z-50">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/radar.svg" alt="Radar" className="w-8 h-8 animate-pulse-slow" />
          <div>
            <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
              Solana Meme Coin Radar
            </h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">
              Pump.fun Token Tracker
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className="p-2 rounded-lg hover:bg-surface-50 transition-colors"
            title="Refresh data"
          >
            <svg
              className={`w-4 h-4 text-gray-400 ${refreshing ? 'animate-spin' : ''}`}
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

          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                connected
                  ? 'bg-green-400 shadow-glow-green'
                  : 'bg-red-400 shadow-glow-red'
              }`}
            />
            <span className="text-xs text-gray-500 hidden sm:block">
              {connected ? 'Live' : 'Connecting...'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
