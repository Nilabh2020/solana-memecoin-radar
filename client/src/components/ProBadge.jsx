import { useAuth } from '../context/AuthContext.jsx';

export default function ProBadge({ children, feature, onClick }) {
  const { isPremium } = useAuth();

  if (isPremium) {
    return children;
  }

  return (
    <div
      className="relative cursor-pointer group"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
    >
      <div className="opacity-40 pointer-events-none blur-[1px]">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center transition-opacity group-hover:opacity-80">
        <div className="glass-card px-4 py-2 flex items-center gap-2 border border-primary-300 dark:border-primary-500/30 group-hover:border-primary-400 dark:group-hover:border-primary-400/50 transition-colors">
          <svg className="w-4 h-4 text-primary-500 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span className="text-xs font-medium text-primary-600 dark:text-primary-300">
            PRO: {feature}
          </span>
        </div>
      </div>
    </div>
  );
}
