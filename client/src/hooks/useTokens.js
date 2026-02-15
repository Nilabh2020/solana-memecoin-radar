import { useState, useEffect, useCallback, useRef } from 'react';
import { getTokens, getHighMomentumTokens, getStats } from '../services/api.js';
import { REFRESH_INTERVAL } from '../utils/constants.js';

export function useTokens() {
  const [tokens, setTokens] = useState([]);
  const [highMomentum, setHighMomentum] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sort, setSort] = useState({ key: 'createdAt', order: 'desc' });
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ total: 0, limit: 50, offset: 0 });
  const intervalRef = useRef(null);

  const fetchData = useCallback(async () => {
    try {
      const [tokenRes, momentumRes, statsRes] = await Promise.all([
        getTokens({
          sort: sort.key,
          order: sort.order,
          search,
          limit: pagination.limit,
          offset: pagination.offset,
        }),
        getHighMomentumTokens(),
        getStats(),
      ]);

      setTokens(tokenRes.data);
      setPagination(prev => ({ ...prev, total: tokenRes.pagination.total }));
      setHighMomentum(momentumRes.data);
      setStats(statsRes.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [sort, search, pagination.limit, pagination.offset]);

  useEffect(() => {
    setLoading(true);
    fetchData();

    intervalRef.current = setInterval(fetchData, REFRESH_INTERVAL);
    return () => clearInterval(intervalRef.current);
  }, [fetchData]);

  const handleSort = useCallback((key) => {
    setSort(prev => ({
      key,
      order: prev.key === key && prev.order === 'desc' ? 'asc' : 'desc',
    }));
  }, []);

  const handleSearch = useCallback((value) => {
    setSearch(value);
    setPagination(prev => ({ ...prev, offset: 0 }));
  }, []);

  const handlePageChange = useCallback((newOffset) => {
    setPagination(prev => ({ ...prev, offset: newOffset }));
  }, []);

  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    tokens,
    highMomentum,
    stats,
    loading,
    error,
    sort,
    search,
    pagination,
    handleSort,
    handleSearch,
    handlePageChange,
    refresh,
  };
}
