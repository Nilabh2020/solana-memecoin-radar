import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

export default function AccountMenu({ onUpgrade }) {
  const { user, profile, tier, isPremium, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const displayName = profile?.display_name || user.email?.split('@')[0] || 'User';

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-tahoe-200/60 dark:hover:bg-surface-50 transition-colors"
      >
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 dark:from-primary-600 dark:to-accent-600 flex items-center justify-center text-xs font-bold text-white">
          {displayName.charAt(0).toUpperCase()}
        </div>
        <span className="text-sm text-tahoe-600 dark:text-gray-300 hidden sm:block max-w-[100px] truncate">
          {displayName}
        </span>
        {isPremium && (
          <span className="badge-green text-[9px] px-1.5 py-0.5">PRO</span>
        )}
        <svg className={`w-3 h-3 text-tahoe-400 dark:text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 glass-card glow-border rounded-2xl overflow-hidden shadow-tahoe-lg dark:shadow-xl z-50 animate-fade-in">
          <div className="p-3 border-b border-tahoe-200 dark:border-primary-900/30">
            <p className="text-sm font-medium text-tahoe-600 dark:text-gray-200 truncate">{user.email}</p>
            <p className="text-xs text-tahoe-400 dark:text-gray-500 mt-0.5">
              {isPremium ? (
                <span className="text-green-500 dark:text-green-400">
                  Premium {profile?.lifetime ? '(Lifetime)' : ''}
                </span>
              ) : (
                'Free Tier'
              )}
            </p>
            {isPremium && !profile?.lifetime && profile?.tier_expires_at && (
              <p className="text-[10px] text-tahoe-300 dark:text-gray-600 mt-1">
                Expires: {new Date(profile.tier_expires_at).toLocaleDateString()}
              </p>
            )}
          </div>

          <div className="py-1">
            {!isPremium && (
              <button
                onClick={() => { setOpen(false); onUpgrade(); }}
                className="w-full px-3 py-2 text-left text-sm text-primary-500 dark:text-primary-400 hover:bg-tahoe-200/40 dark:hover:bg-surface-50 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                Upgrade to Premium
              </button>
            )}
            <button
              onClick={() => { setOpen(false); signOut(); }}
              className="w-full px-3 py-2 text-left text-sm text-tahoe-500 dark:text-gray-400 hover:bg-tahoe-200/40 dark:hover:bg-surface-50 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
