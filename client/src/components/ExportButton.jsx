import { useAuth } from '../context/AuthContext.jsx';

export default function ExportButton({ tokens, onPricingClick }) {
  const { isPremium } = useAuth();

  function handleExport() {
    if (!tokens || tokens.length === 0) return;

    const headers = [
      'Name', 'Symbol', 'Mint Address', 'Market Cap', 'Liquidity',
      'Volume 24h', 'Buy Ratio', 'Buy Count', 'Sell Count', 'Price USD', 'Created At',
    ];

    const rows = tokens.map(t => [
      `"${(t.name || '').replace(/"/g, '""')}"`,
      t.symbol,
      t.mintAddress,
      t.marketCap,
      t.liquidity,
      t.volume24h,
      t.buyRatio,
      t.buyCount,
      t.sellCount,
      t.priceUsd,
      t.createdAt ? new Date(t.createdAt).toISOString() : '',
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `meme-coin-radar-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!isPremium) {
    return (
      <button
        onClick={onPricingClick}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-tahoe-400 dark:text-gray-500
                   border border-tahoe-200 dark:border-primary-900/30 hover:bg-tahoe-200/40 dark:hover:bg-surface-50
                   hover:text-tahoe-500 dark:hover:text-gray-400 transition-colors
                   opacity-60 hover:opacity-80 cursor-pointer"
        title="Export CSV (Premium)"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        Export CSV
      </button>
    );
  }

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-tahoe-500 dark:text-gray-400
                 border border-tahoe-200 dark:border-primary-900/30 hover:bg-tahoe-200/40 dark:hover:bg-surface-50
                 hover:text-tahoe-600 dark:hover:text-gray-200 transition-colors"
      title="Export CSV"
    >
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      Export CSV
    </button>
  );
}
