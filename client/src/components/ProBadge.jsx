import { PRO_FEATURES_ENABLED } from '../utils/constants.js';

export default function ProBadge({ children, feature }) {
  if (PRO_FEATURES_ENABLED) {
    return children;
  }

  return (
    <div className="relative">
      <div className="opacity-40 pointer-events-none blur-[1px]">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="glass-card px-4 py-2 flex items-center gap-2 border border-primary-500/30">
          <svg className="w-4 h-4 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span className="text-xs font-medium text-primary-300">
            PRO: {feature}
          </span>
        </div>
      </div>
    </div>
  );
}
