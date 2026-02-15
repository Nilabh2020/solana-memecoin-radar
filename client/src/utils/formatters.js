export function formatMarketCap(value) {
  if (!value || value === 0) return '$0';
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(2)}K`;
  return `$${value.toFixed(2)}`;
}

export function formatVolume(value) {
  return formatMarketCap(value);
}

export function formatAge(createdAt) {
  const now = Date.now();
  const diffMs = now - new Date(createdAt).getTime();
  const minutes = Math.floor(diffMs / 60000);

  if (minutes < 1) return '<1m ago';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ${minutes % 60}m ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function formatBuyRatio(ratio) {
  return `${(ratio * 100).toFixed(1)}%`;
}

export function shortenAddress(address, chars = 4) {
  if (!address) return '';
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function formatNumber(num) {
  if (!num) return '0';
  return num.toLocaleString();
}
