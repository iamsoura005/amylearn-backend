import { useCallback, useEffect, useRef, useState } from 'react';

const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

export const useDebouncedValue = (value, delay = 250) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);
  return debounced;
};

export const useLiveResource = (fetcher, { fallback = null, minLoading = 360, deps = [], mode = 'replace' } = {}) => {
  const [data, setData] = useState(fallback);
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(false);
  const [error, setError] = useState(null);
  const mounted = useRef(true);
  const requestId = useRef(0);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const load = useCallback(async () => {
    const id = ++requestId.current;
    setLoading(true);
    setError(null);
    const started = Date.now();
    try {
      const result = await fetcherRef.current();
      if (!mounted.current || id !== requestId.current) return;
      const payload = result?.data !== undefined ? result.data : result;
      const empty = isEmpty(payload);
      setUsingMock(empty);
      setData(empty ? fallback : mode === 'merge' && payload && fallback ? { ...fallback, ...payload } : payload);
    } catch (err) {
      if (!mounted.current || id !== requestId.current) return;
      setError(err?.message || 'Request failed');
      setUsingMock(true);
      setData(fallback);
    } finally {
      const elapsed = Date.now() - started;
      if (elapsed < minLoading) await new Promise((resolve) => setTimeout(resolve, minLoading - elapsed));
      if (mounted.current && id === requestId.current) setLoading(false);
    }
  }, [fallback, minLoading, mode]);

  useEffect(() => {
    mounted.current = true;
    load();
    return () => {
      mounted.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, usingMock, error, refresh: load, setData };
};

export const useLocalStorage = (key, initial) => {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored === null ? initial : JSON.parse(stored);
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      if (value === null) localStorage.removeItem(key);
      else localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage may be unavailable */
    }
  }, [key, value]);

  return [value, setValue];
};

export default useLiveResource;
