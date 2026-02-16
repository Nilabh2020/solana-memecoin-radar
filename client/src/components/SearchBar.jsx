import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

export default function SearchBar({ value, onChange, onPricingClick }) {
  const { isPremium } = useAuth();
  const [localValue, setLocalValue] = useState(value);
  const debounceRef = { current: null };

  const handleChange = useCallback((e) => {
    const val = e.target.value;
    setLocalValue(val);

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onChange(val);
    }, 300);
  }, [onChange]);

  function handleClear() {
    setLocalValue('');
    onChange('');
  }

  if (!isPremium) {
    return (
      <div
        className="relative opacity-60 cursor-pointer group hover:opacity-75 transition-opacity"
        onClick={onPricingClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onPricingClick?.()}
      >
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="w-4 h-4 text-tahoe-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search (Premium only)"
          disabled
          className="w-full pl-10 pr-10 py-2.5 bg-tahoe-200/50 dark:bg-surface-300 border border-tahoe-200 dark:border-primary-900/30
                     rounded-xl text-sm text-tahoe-400 dark:text-gray-500 placeholder-tahoe-400 dark:placeholder-gray-600 cursor-pointer pointer-events-none"
        />
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg className="w-4 h-4 text-tahoe-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        type="text"
        placeholder="Search by name, symbol, or address..."
        value={localValue}
        onChange={handleChange}
        className="w-full pl-10 pr-10 py-2.5 bg-tahoe-200/50 dark:bg-surface-300 border border-tahoe-200 dark:border-primary-900/30
                   rounded-xl text-sm text-tahoe-600 dark:text-gray-200 placeholder-tahoe-400 dark:placeholder-gray-600
                   focus:outline-none focus:border-primary-400 dark:focus:border-primary-600/50 focus:ring-1 focus:ring-primary-400/30 dark:focus:ring-primary-600/30
                   transition-all duration-200"
      />
      {localValue && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
        >
          <svg className="w-4 h-4 text-tahoe-400 dark:text-gray-500 hover:text-tahoe-600 dark:hover:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
