import { useState, useEffect, useCallback } from 'react';
import { formatMarketCap } from '../utils/formatters.js';
import ProBadge from './ProBadge.jsx';

function AlertItem({ alert }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-surface-300/50 rounded-lg border border-primary-900/20 animate-slide-up">
      <div className="w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
        <svg className="w-4 h-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-200 truncate">
          {alert.token?.name} <span className="text-gray-500">({alert.token?.symbol})</span>
        </p>
        <p className="text-xs text-gray-500">
          Volume spiked {alert.spike?.toFixed(1)}x | Vol: {formatMarketCap(alert.currentVolume)}
        </p>
      </div>
      <span className="text-[10px] text-gray-600 flex-shrink-0">
        {new Date(alert.timestamp).toLocaleTimeString()}
      </span>
    </div>
  );
}

export default function AlertsFeed({ subscribe }) {
  const [alerts, setAlerts] = useState([]);

  const handleAlert = useCallback((msg) => {
    setAlerts(prev => [msg.data, ...prev].slice(0, 20));
  }, []);

  useEffect(() => {
    if (!subscribe) return;
    return subscribe('volume_alert', handleAlert);
  }, [subscribe, handleAlert]);

  return (
    <ProBadge feature="Volume Spike Alerts">
      <div className="glass-card p-4 glow-border">
        <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
          <svg className="w-4 h-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          Volume Alerts
        </h3>
        {alerts.length === 0 ? (
          <p className="text-xs text-gray-600 text-center py-4">No alerts yet. Monitoring for volume spikes...</p>
        ) : (
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {alerts.map((alert, i) => (
              <AlertItem key={`${alert.timestamp}-${i}`} alert={alert} />
            ))}
          </div>
        )}
      </div>
    </ProBadge>
  );
}
