import { useState, useEffect, useCallback } from 'react';
import { getErrorMessage } from '../services/api';

type ApiState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string };

/**
 * Hook for fetching API data.
 * Pass `null` as fetcher to skip the request (useful for dependent queries).
 */
export function useApi<T>(
  fetcher: (() => Promise<T>) | null,
  deps: unknown[] = []
): { state: ApiState<T>; refetch: () => void } {
  const [state, setState] = useState<ApiState<T>>({ status: 'idle' });

  const load = useCallback(() => {
    if (!fetcher) {
      setState({ status: 'idle' });
      return;
    }
    setState({ status: 'loading' });
    fetcher()
      .then((data) => setState({ status: 'success', data }))
      .catch((err: unknown) =>
        setState({ status: 'error', error: getErrorMessage(err) })
      );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    load();
  }, [load]);

  return { state, refetch: load };
}
