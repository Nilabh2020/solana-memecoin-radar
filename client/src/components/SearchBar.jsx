import { useState, useCallback } from 'react';

export default function SearchBar({ value, onChange }) {
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

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        type="text"
        placeholder="Search by name, symbol, or address..."
        value={localValue}
        onChange={handleChange}
        className="w-full pl-10 pr-10 py-2.5 bg-surface-300 border border-primary-900/30
                   rounded-lg text-sm text-gray-200 placeholder-gray-600
                   focus:outline-none focus:border-primary-600/50 focus:ring-1 focus:ring-primary-600/30
                   transition-all duration-200"
      />
      {localValue && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
        >
          <svg className="w-4 h-4 text-gray-500 hover:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
