import { useEffect } from 'react';
import { useAuthStore } from '../store/auth.store';
import { isTokenValid } from '../api/token';

export function useSessionValidation(onValid?: () => void) {
  useEffect(() => {
    const state = useAuthStore.getState();
    if (!state.token || !state.isAuthenticated) return;

    if (isTokenValid(state.token)) {
      onValid?.();
      return;
    }

    let cancelled = false;
    state.refreshSession().then((ok) => {
      if (cancelled) return;
      if (ok) {
        onValid?.();
      } else {
        useAuthStore.getState().clearSession();
      }
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
