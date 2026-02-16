import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import Header from './components/Header.jsx';
import StatsBar from './components/StatsBar.jsx';
import SearchBar from './components/SearchBar.jsx';
import HighMomentum from './components/HighMomentum.jsx';
import TokenTable from './components/TokenTable.jsx';
import Pagination from './components/Pagination.jsx';
import AlertsFeed from './components/AlertsFeed.jsx';
import PricingSection from './components/PricingSection.jsx';
import ExportButton from './components/ExportButton.jsx';
import Footer from './components/Footer.jsx';
import AuthModal from './components/AuthModal.jsx';
import PaymentModal from './components/PaymentModal.jsx';
import TermsPage from './components/TermsPage.jsx';
import { useTokens } from './hooks/useTokens.js';
import { useWebSocket } from './hooks/useWebSocket.js';

function AppContent() {
  const { user, isPremium } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPricing, setShowPricing] = useState(false);

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

  function handleUpgrade() {
    if (!user) {
      setAuthModalOpen(true);
    } else {
      setPaymentModalOpen(true);
    }
  }

  const headerProps = {
    connected,
    onRefresh: refresh,
    onLoginClick: () => setAuthModalOpen(true),
    onUpgrade: handleUpgrade,
    onPricingClick: () => setShowPricing(true),
  };

  if (showTerms) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header {...headerProps} />
        <main className="flex-1">
          <TermsPage />
          <div className="text-center pb-8">
            <button
              onClick={() => setShowTerms(false)}
              className="text-primary-500 text-sm hover:text-primary-400"
            >
              &larr; Back to Dashboard
            </button>
          </div>
        </main>
        <Footer onTermsClick={() => setShowTerms(true)} />
      </div>
    );
  }

  if (showPricing) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header {...headerProps} />
        <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 py-6">
          <PricingSection onUpgrade={handleUpgrade} fullPage onBack={() => setShowPricing(false)} />
        </main>
        <Footer onTermsClick={() => setShowTerms(true)} />
        <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
        <PaymentModal isOpen={paymentModalOpen} onClose={() => setPaymentModalOpen(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header {...headerProps} />

      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Error banner */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-sm text-red-500 dark:text-red-300">
              Failed to fetch data: {error}. Retrying automatically...
            </p>
          </div>
        )}

        {/* Stats */}
        <StatsBar stats={stats} />

        {/* High Momentum Section */}
        <HighMomentum tokens={highMomentum} />

        {/* Pricing Section */}
        <PricingSection onUpgrade={handleUpgrade} />

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Token table - 3 cols */}
          <div className="lg:col-span-3 space-y-3">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-bold text-tahoe-600 dark:text-gray-200 flex items-center gap-2 flex-shrink-0">
                <svg className="w-5 h-5 text-primary-500 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                New Tokens
                {loading && (
                  <span className="inline-block w-3 h-3 rounded-full border border-primary-400 border-t-transparent animate-spin" />
                )}
              </h2>
              <div className="flex items-center gap-3">
                <ExportButton tokens={tokens} onPricingClick={() => setShowPricing(true)} />
                <div className="w-full max-w-sm">
                  <SearchBar value={search} onChange={handleSearch} onPricingClick={() => setShowPricing(true)} />
                </div>
              </div>
            </div>

            <TokenTable
              tokens={tokens}
              sort={sort}
              onSort={handleSort}
              loading={loading}
              onPricingClick={() => setShowPricing(true)}
            />

            <Pagination
              pagination={pagination}
              onPageChange={handlePageChange}
            />
          </div>

          {/* Sidebar - 1 col */}
          <div className="space-y-4">
            <AlertsFeed subscribe={subscribe} onPricingClick={() => setShowPricing(true)} />

            {/* Quick info card */}
            <div className="glass-card p-4 glow-border">
              <h3 className="text-sm font-semibold text-tahoe-600 dark:text-gray-300 mb-3">How It Works</h3>
              <ul className="space-y-2 text-xs text-tahoe-500 dark:text-gray-500">
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 dark:text-primary-400 mt-0.5">1.</span>
                  Monitors Pump.fun program on Solana for new token launches
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 dark:text-primary-400 mt-0.5">2.</span>
                  Fetches market data from DEX aggregators in real-time
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 dark:text-primary-400 mt-0.5">3.</span>
                  Identifies high-momentum tokens based on volume, buy ratio, and age
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 dark:text-primary-400 mt-0.5">4.</span>
                  Read-only &mdash; no wallet connection, no trading
                </li>
              </ul>
            </div>

            {/* Legend */}
            <div className="glass-card p-4 glow-border">
              <h3 className="text-sm font-semibold text-tahoe-600 dark:text-gray-300 mb-3">Legend</h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="badge-green">70%+ Buy</span>
                  <span className="text-tahoe-500 dark:text-gray-500">Strong buying pressure</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="badge-purple">50-70% Buy</span>
                  <span className="text-tahoe-500 dark:text-gray-500">Neutral activity</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="badge-red">{'<50%'} Buy</span>
                  <span className="text-tahoe-500 dark:text-gray-500">Selling pressure</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer onTermsClick={() => setShowTerms(true)} />

      {/* Modals */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      <PaymentModal isOpen={paymentModalOpen} onClose={() => setPaymentModalOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
