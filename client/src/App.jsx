import Header from './components/Header.jsx';
import StatsBar from './components/StatsBar.jsx';
import SearchBar from './components/SearchBar.jsx';
import HighMomentum from './components/HighMomentum.jsx';
import TokenTable from './components/TokenTable.jsx';
import Pagination from './components/Pagination.jsx';
import AlertsFeed from './components/AlertsFeed.jsx';
import Footer from './components/Footer.jsx';
import { useTokens } from './hooks/useTokens.js';
import { useWebSocket } from './hooks/useWebSocket.js';

export default function App() {
  const {
    tokens,
    highMomentum,
    stats,
    loading,
    error,
    sort,
    search,
    pagination,
    handleSort,
    handleSearch,
    handlePageChange,
    refresh,
  } = useTokens();

  const { connected, subscribe } = useWebSocket();

  return (
    <div className="min-h-screen flex flex-col">
      <Header connected={connected} onRefresh={refresh} />

      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Error banner */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-sm text-red-300">
              Failed to fetch data: {error}. Retrying automatically...
            </p>
          </div>
        )}

        {/* Stats */}
        <StatsBar stats={stats} />

        {/* High Momentum Section */}
        <HighMomentum tokens={highMomentum} />

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Token table - 3 cols */}
          <div className="lg:col-span-3 space-y-3">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-bold text-gray-200 flex items-center gap-2 flex-shrink-0">
                <svg className="w-5 h-5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                New Tokens
                {loading && (
                  <span className="inline-block w-3 h-3 rounded-full border border-primary-400 border-t-transparent animate-spin" />
                )}
              </h2>
              <div className="w-full max-w-sm">
                <SearchBar value={search} onChange={handleSearch} />
              </div>
            </div>

            <TokenTable
              tokens={tokens}
              sort={sort}
              onSort={handleSort}
              loading={loading}
            />

            <Pagination
              pagination={pagination}
              onPageChange={handlePageChange}
            />
          </div>

          {/* Sidebar - 1 col */}
          <div className="space-y-4">
            <AlertsFeed subscribe={subscribe} />

            {/* Quick info card */}
            <div className="glass-card p-4 glow-border">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">How It Works</h3>
              <ul className="space-y-2 text-xs text-gray-500">
                <li className="flex items-start gap-2">
                  <span className="text-primary-400 mt-0.5">1.</span>
                  Monitors Pump.fun program on Solana for new token launches
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-400 mt-0.5">2.</span>
                  Fetches market data from DEX aggregators in real-time
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-400 mt-0.5">3.</span>
                  Identifies high-momentum tokens based on volume, buy ratio, and age
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-400 mt-0.5">4.</span>
                  Read-only &mdash; no wallet connection, no trading
                </li>
              </ul>
            </div>

            {/* Legend */}
            <div className="glass-card p-4 glow-border">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">Legend</h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="badge-green">70%+ Buy</span>
                  <span className="text-gray-500">Strong buying pressure</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="badge-purple">50-70% Buy</span>
                  <span className="text-gray-500">Neutral activity</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="badge-red">{'<50%'} Buy</span>
                  <span className="text-gray-500">Selling pressure</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
