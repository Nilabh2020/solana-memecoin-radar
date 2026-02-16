export default function Footer({ onTermsClick }) {
  return (
    <footer className="border-t border-tahoe-200 dark:border-primary-950/30 py-4 mt-8">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 space-y-2">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-tahoe-400 dark:text-gray-600">
            Solana Meme Coin Radar &mdash; Read-only analytics. No wallet connection required.
          </p>
          <div className="flex items-center gap-4 text-xs text-tahoe-400 dark:text-gray-600">
            <span>Data from DexScreener &amp; Solana RPC</span>
            <span className="hidden sm:block">&bull;</span>
            <span>Built for research purposes only</span>
            <span className="hidden sm:block">&bull;</span>
            <button onClick={onTermsClick} className="text-primary-500 dark:text-primary-500 hover:text-primary-400 transition-colors">
              Terms
            </button>
          </div>
        </div>
        <p className="text-[10px] text-tahoe-300 dark:text-gray-700 text-center">
          Analytics only. Not financial advice. Crypto trading involves substantial risk of loss.
        </p>
      </div>
    </footer>
  );
}
