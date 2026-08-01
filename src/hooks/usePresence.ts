import { useEffect } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { useAppSelector } from "@/redux/store";

const HEARTBEAT_MS = 20000;

/**
 * Keeps the signed-in user's presence fresh while the app is open.
 * Writes `status: "online"` + `lastSeen` on a heartbeat, and flags the
 * user offline on unmount / tab close. Statuses are only considered
 * "online" when `lastSeen` is recent (see `isUserOnline`), so a closed
 * tab naturally reads as offline shortly after it stops heartbeating.
 */
export function usePresence() {
  const userId = useAppSelector((state) => state.auth.user?.id);

  useEffect(() => {
    if (!userId) return;

    const ref = doc(db, "users", userId);

    const goOnline = () => {
      updateDoc(ref, {
        status: "online",
        lastSeen: new Date()
      }).catch(() => {});
    };

    const goOffline = () => {
      updateDoc(ref, { status: "offline" }).catch(() => {});
    };

    goOnline();
    const interval = window.setInterval(goOnline, HEARTBEAT_MS);

    const handleUnload = () => goOffline();
    window.addEventListener("beforeunload", handleUnload);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("beforeunload", handleUnload);
      goOffline();
    };
  }, [userId]);
}
