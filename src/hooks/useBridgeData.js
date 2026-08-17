import { useEffect, useState, useCallback } from 'react';
import { getStats, getFeed, onUpdate } from '../lib/raverBridge';

/**
 * Mantiene stats + feed sincronizados con el canal compartido del bridge.
 * Se actualiza al instante ante cambios (evento storage / evento propio)
 * y además hace polling cada 4s como red de seguridad, igual que el
 * index.html original.
 */
export function useBridgeData() {
  const [stats, setStats] = useState(getStats);
  const [feed, setFeed] = useState(getFeed);

  const refresh = useCallback(() => {
    setStats(getStats());
    setFeed(getFeed());
  }, []);

  useEffect(() => {
    refresh();
    const unsubscribe = onUpdate(refresh);
    const interval = setInterval(refresh, 4000);
    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [refresh]);

  return { stats, feed };
}
