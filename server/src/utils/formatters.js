export function formatMarketCap(value) {
  if (!value || value === 0) return '$0';
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(2)}K`;
  return `$${value.toFixed(2)}`;
}

export function formatAge(createdAt) {
  const now = Date.now();
  const diffMs = now - new Date(createdAt).getTime();
  const minutes = Math.floor(diffMs / 60000);

  if (minutes < 1) return '<1m';
  if (minutes < 60) return `${minutes}m`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  return `${Math.floor(minutes / 1440)}d`;
}

export function getAgeMinutes(createdAt) {
  const diffMs = Date.now() - new Date(createdAt).getTime();
  return Math.floor(diffMs / 60000);
}

export function shortenAddress(address, chars = 4) {
  if (!address) return '';
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
