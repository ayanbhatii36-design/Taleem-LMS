import { useCallback, useEffect, useRef, useState } from 'react';
import { API_BASE, apiRequest, getAccessToken } from './client';

let reachableCache: boolean | null = null;

export async function isBackendReachable(): Promise<boolean> {
  if (reachableCache !== null) return reachableCache;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`${API_BASE}/health`, { signal: controller.signal });
    clearTimeout(timer);
    reachableCache = res.ok;
    return reachableCache;
  } catch {
    reachableCache = false;
    return false;
  }
}

export function invalidateReachability(): void {
  reachableCache = null;
}

/**
 * Load data from the backend API. Falls back to the provided mock data when
 * the backend is unreachable, unauthenticated, or errors.
 */
export function useApiData<T>(
  fetcher: () => Promise<T>,
  fallback: T,
  deps: unknown[] = []
): { data: T; loading: boolean; fromBackend: boolean; reload: () => void } {
  const [data, setData] = useState<T>(fallback);
  const [loading, setLoading] = useState(true);
  const [fromBackend, setFromBackend] = useState(false);
  const mounted = useRef(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetcher();
      if (mounted.current && result !== undefined && result !== null) {
        setData(result);
        setFromBackend(true);
      }
    } catch {
      if (mounted.current) setFromBackend(false);
    } finally {
      if (mounted.current) setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    mounted.current = true;
    load();
    return () => {
      mounted.current = false;
    };
  }, [load]);

  const reload = useCallback(() => load(), [load]);

  return { data, loading, fromBackend, reload };
}

export function useSession(): {
  loggedIn: boolean;
  checkSession: () => boolean;
} {
  const [loggedIn, setLoggedIn] = useState<boolean>(() => !!getAccessToken());

  const checkSession = useCallback(() => {
    const ok = !!getAccessToken();
    setLoggedIn(ok);
    return ok;
  }, []);

  return { loggedIn, checkSession };
}

export function useApiMutation<TArgs extends unknown[], TReturn>(
  mutation: (...args: TArgs) => Promise<TReturn>
): {
  mutate: (...args: TArgs) => Promise<TReturn | undefined>;
  loading: boolean;
  error: Error | null;
  clearError: () => void;
} {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(
    async (...args: TArgs) => {
      setLoading(true);
      setError(null);
      try {
        const result = await mutation(...args);
        return result;
      } catch (err) {
        setError(err as Error);
        return undefined;
      } finally {
        setLoading(false);
      }
    },
    [mutation]
  );

  const clearError = useCallback(() => setError(null), []);

  return { mutate, loading, error, clearError };
}

export { apiRequest };