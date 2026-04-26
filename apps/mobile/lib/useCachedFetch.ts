import { useState, useEffect } from 'react';
import api from './api';
import { getCache, setCache } from './cache';

interface UseCachedFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  isFromCache: boolean;
}

export function useCachedFetch<T>(
  url: string,
  params?: Record<string, any>
): UseCachedFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFromCache, setIsFromCache] = useState(false);

  // Create a cache key from URL + params
  const cacheKey = url + JSON.stringify(params || {});

  const fetch = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);

    try {
      // 1. Try to get fresh data from API
      const response = await api.get(url, { params });
      setData(response.data);
      setIsFromCache(false);

      // 2. Save to cache for offline use
      await setCache(cacheKey, response.data);

    } catch (err: any) {
      // 3. If API fails, try cache
      const cached = await getCache<T>(cacheKey);

      if (cached) {
        setData(cached);
        setIsFromCache(true);
        setError(null);
      } else {
        setError('Walang koneksyon at walang naka-cache na data');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // On mount — show cached data immediately while fetching fresh data
    const loadWithCache = async () => {
      const cached = await getCache<T>(cacheKey);
      if (cached) {
        setData(cached);
        setIsFromCache(true);
        setLoading(false);
      }
      // Then fetch fresh data in background
      await fetch(false);
    };

    loadWithCache();
  }, [url, JSON.stringify(params)]);

  return { data, loading, error, refresh: () => fetch(true), isFromCache };
}