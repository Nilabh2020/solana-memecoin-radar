export default function Footer() {
  return (
    <footer className="border-t border-primary-950/30 py-4 mt-8">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="text-xs text-gray-600">
          Solana Meme Coin Radar &mdash; Read-only analytics. No wallet connection required.
        </p>
        <div className="flex items-center gap-4 text-xs text-gray-600">
          <span>Data from DexScreener &amp; Solana RPC</span>
          <span className="hidden sm:block">&bull;</span>
          <span>Built for research purposes only</span>
        </div>
      </div>
    </footer>
  );
}
