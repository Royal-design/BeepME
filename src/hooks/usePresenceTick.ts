import { useEffect, useState } from "react";

const TICK_MS = 30000;

/**
 * Re-renders the calling component on a slow interval so presence states
 * computed from `lastSeen` freshness (see `isUserOnline`) stay accurate
 * even when no new Firestore snapshot arrives.
 */
export function usePresenceTick() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => setTick((n) => n + 1), TICK_MS);
    return () => window.clearInterval(interval);
  }, []);
}
