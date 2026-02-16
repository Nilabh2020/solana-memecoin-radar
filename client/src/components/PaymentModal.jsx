import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { verifyPayment, getPricing } from '../services/api.js';
import { PAYMENT_WALLET } from '../utils/constants.js';

export default function PaymentModal({ isOpen, onClose }) {
  const { refreshProfile } = useAuth();
  const [planType, setPlanType] = useState('monthly');
  const [txSignature, setTxSignature] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const prices = { monthly: 0.02, lifetime: 0.05 };

  async function handleVerify(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await verifyPayment(txSignature.trim(), planType);
      if (res.success) {
        setSuccess(true);
        await refreshProfile();
      } else {
        setError(res.error || 'Verification failed');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleCopyAddress() {
    navigator.clipboard.writeText(PAYMENT_WALLET);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="glass-card glow-border max-w-lg w-full p-6 animate-fade-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-300"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {success ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-100">Premium Activated!</h3>
            <p className="text-sm text-gray-400 mt-2">
              You now have access to all premium features. Enjoy!
            </p>
            <button onClick={onClose} className="mt-4 btn-primary px-6 py-2 text-sm">
              Start Exploring
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold text-gray-100 mb-2">Upgrade to Premium</h2>
            <p className="text-sm text-gray-500 mb-6">Pay with SOL to unlock all features</p>

            {/* Plan selection */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                onClick={() => setPlanType('monthly')}
                className={`p-4 rounded-lg border text-left transition-all ${
                  planType === 'monthly'
                    ? 'border-primary-500 bg-primary-500/10'
                    : 'border-primary-900/30 bg-surface-300 hover:border-primary-700/50'
                }`}
              >
                <p className="text-sm font-semibold text-gray-200">Monthly</p>
                <p className="text-lg font-bold text-primary-400">{prices.monthly} SOL</p>
                <p className="text-xs text-gray-500">30 days access</p>
              </button>

              <button
                onClick={() => setPlanType('lifetime')}
                className={`p-4 rounded-lg border text-left transition-all relative ${
                  planType === 'lifetime'
                    ? 'border-primary-500 bg-primary-500/10'
                    : 'border-primary-900/30 bg-surface-300 hover:border-primary-700/50'
                }`}
              >
                <span className="absolute -top-2 right-2 badge-green text-[9px]">Best Deal</span>
                <p className="text-sm font-semibold text-gray-200">Lifetime</p>
                <p className="text-lg font-bold text-primary-400">{prices.lifetime} SOL</p>
                <p className="text-xs text-gray-500">First 20 users only</p>
              </button>
            </div>

            {/* Payment instructions */}
            <div className="bg-surface-300/50 rounded-lg p-4 mb-4 space-y-3">
              <p className="text-sm font-medium text-gray-300">Step 1: Send SOL</p>
              <p className="text-xs text-gray-500">
                Send exactly <strong className="text-primary-400">{prices[planType]} SOL</strong> to:
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs bg-surface-400 rounded px-3 py-2 text-gray-300 font-mono break-all">
                  {PAYMENT_WALLET}
                </code>
                <button
                  onClick={handleCopyAddress}
                  className="p-2 rounded-lg hover:bg-surface-50 transition-colors flex-shrink-0"
                  title="Copy address"
                >
                  {copied ? (
                    <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Transaction verification */}
            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Step 2: Paste Transaction Signature
                </label>
                <input
                  type="text"
                  value={txSignature}
                  onChange={(e) => setTxSignature(e.target.value)}
                  required
                  placeholder="Paste your Solana transaction signature here..."
                  className="w-full px-4 py-2.5 bg-surface-300 border border-primary-900/30 rounded-lg
                             text-sm text-gray-200 placeholder-gray-600 font-mono
                             focus:outline-none focus:border-primary-600/50 focus:ring-1 focus:ring-primary-600/30"
                />
              </div>

              {error && (
                <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || !txSignature.trim()}
                className="w-full btn-primary py-2.5 text-sm font-medium disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="inline-block w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Verifying on-chain...
                  </span>
                ) : (
                  'Verify Payment'
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
