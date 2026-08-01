import { Timestamp } from "firebase/firestore";

const ONLINE_WINDOW_MS = 90000;

function toTime(input: unknown): number | null {
  if (input instanceof Timestamp) return input.toDate().getTime();
  if (input instanceof Date) return input.getTime();
  if (typeof input === "number") return input;
  if (typeof input === "string") {
    const d = new Date(input);
    return Number.isNaN(d.getTime()) ? null : d.getTime();
  }
  return null;
}

/**
 * A user counts as online when their stored status is "online" AND their
 * `lastSeen` heartbeat is recent. Users with no `lastSeen` (legacy docs)
 * or a stale heartbeat read as offline.
 */
export function isUserOnline(
  user?: { status?: string; lastSeen?: unknown } | null
): boolean {
  if (!user || user.status !== "online") return false;
  const lastSeen = toTime(user.lastSeen);
  if (lastSeen === null) return false;
  return Date.now() - lastSeen < ONLINE_WINDOW_MS;
}
