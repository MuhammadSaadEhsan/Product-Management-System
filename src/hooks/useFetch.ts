'use client';

import { useState, useEffect, useCallback } from 'react';

interface UseFetchOptions {
  immediate?: boolean;
}

export function useFetch<T>(url: string, options?: UseFetchOptions) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (queryParams?: Record<string, string>) => {
    setLoading(true);
    setError(null);
    try {
      let fetchUrl = url;
      if (queryParams) {
        const params = new URLSearchParams(queryParams);
        fetchUrl += `?${params.toString()}`;
      }
      const res = await fetch(fetchUrl);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to fetch');
      setData(json.data);
      return json;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'An error occurred';
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    if (options?.immediate !== false) {
      fetchData();
    }
  }, [fetchData, options?.immediate]);

  return { data, loading, error, refetch: fetchData };
}

export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}
