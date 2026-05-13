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

  const cacheKey = url + JSON.stringify(params || {});

  // Helper to extract data from response
  // Handles both paginated (Page object) and non-paginated responses
  const extractData = (responseData: any): T => {
    if (responseData && responseData.content !== undefined) {
      return responseData.content as T;
    }
    return responseData as T;
  };

  const fetch = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);

    try {
      const response = await api.get(url, { params });
      const extracted = extractData(response.data);
      setData(extracted);
      setIsFromCache(false);
      await setCache(cacheKey, extracted);
    } catch (err: any) {
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
    const loadWithCache = async () => {
      const cached = await getCache<T>(cacheKey);
      if (cached) {
        setData(cached);
        setIsFromCache(true);
        setLoading(false);
      }
      await fetch(false);
    };

    loadWithCache();
  }, [url, JSON.stringify(params)]);

  return { data, loading, error, refresh: () => fetch(true), isFromCache };
}