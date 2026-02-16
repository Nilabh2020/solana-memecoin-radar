import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

export default function AuthModal({ isOpen, onClose }) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await signIn(email, password);
        onClose();
      } else {
        await signUp(email, password);
        setSignupSuccess(true);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="glass-card glow-border max-w-md w-full p-6 animate-fade-in">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-300"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-xl font-bold text-gray-100 mb-6">
          {mode === 'login' ? 'Sign In' : 'Create Account'}
        </h2>

        {signupSuccess ? (
          <div className="text-center py-4">
            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-gray-200 font-medium">Check your email!</p>
            <p className="text-sm text-gray-500 mt-2">
              We sent a confirmation link to <strong className="text-gray-300">{email}</strong>.
              Click it to activate your account.
            </p>
            <button
              onClick={() => { setMode('login'); setSignupSuccess(false); }}
              className="mt-4 text-primary-400 text-sm hover:text-primary-300"
            >
              Back to sign in
            </button>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-surface-300 border border-primary-900/30 rounded-lg
                             text-sm text-gray-200 placeholder-gray-600
                             focus:outline-none focus:border-primary-600/50 focus:ring-1 focus:ring-primary-600/30"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-2.5 bg-surface-300 border border-primary-900/30 rounded-lg
                             text-sm text-gray-200 placeholder-gray-600
                             focus:outline-none focus:border-primary-600/50 focus:ring-1 focus:ring-primary-600/30"
                  placeholder="Min 6 characters"
                />
              </div>

              {error && (
                <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-2.5 text-sm font-medium disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="inline-block w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                  </span>
                ) : (
                  mode === 'login' ? 'Sign In' : 'Create Account'
                )}
              </button>
            </form>

            <div className="mt-4 text-center">
              {mode === 'login' ? (
                <p className="text-sm text-gray-500">
                  Don&apos;t have an account?{' '}
                  <button
                    onClick={() => { setMode('signup'); setError(''); }}
                    className="text-primary-400 hover:text-primary-300"
                  >
                    Sign up
                  </button>
                </p>
              ) : (
                <p className="text-sm text-gray-500">
                  Already have an account?{' '}
                  <button
                    onClick={() => { setMode('login'); setError(''); }}
                    className="text-primary-400 hover:text-primary-300"
                  >
                    Sign in
                  </button>
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
