import { useEffect } from "react";
import {
  DocumentData,
  doc,
  getDoc,
  onSnapshot
} from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { UserType } from "@/redux/slice/authSlice";
import {
  Chat,
  setOriginalChats,
  updateChatUsers,
  updateChatTyping
} from "@/redux/slice/filterSlice";
import { useAppDispatch, useAppSelector } from "@/redux/store";

export function useChatsSubscription() {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    if (!currentUser?.id) return;

    const userChatsRef = doc(db, "userChats", currentUser.id);
    const partnerUnsubs: (() => void)[] = [];
    const chatTypingUnsubs: (() => void)[] = [];

    const subscribeToPartners = (items: DocumentData[]) => {
      partnerUnsubs.forEach((unsub) => unsub());
      partnerUnsubs.length = 0;

      const receivers = new Set<string>(
        items.map((item) => String(item.receiverId))
      );

      receivers.forEach((receiverId) => {
        const userRef = doc(db, "users", receiverId);
        const unsub = onSnapshot(userRef, (snap) => {
          if (!snap.exists()) return;
          dispatch(
            updateChatUsers({
              [receiverId]: {
                id: receiverId,
                ...snap.data()
              } as UserType
            })
          );
        });
        partnerUnsubs.push(unsub);
      });
    };

    const subscribeToChatTyping = (items: DocumentData[]) => {
      chatTypingUnsubs.forEach((unsub) => unsub());
      chatTypingUnsubs.length = 0;

      items.forEach((item) => {
        const chatId = String(item.chatId);
        const chatRef = doc(db, "chats", chatId);
        const unsub = onSnapshot(chatRef, (snap) => {
          if (!snap.exists()) return;
          dispatch(
            updateChatTyping({
              [chatId]: snap.data().typingBy ?? null
            })
          );
        });
        chatTypingUnsubs.push(unsub);
      });
    };

    const unSubChats = onSnapshot(userChatsRef, async (res) => {
      const items = (res.data()?.chats || []) as DocumentData[];
      subscribeToPartners(items);
      subscribeToChatTyping(items);

      const promises = items.map(async (item) => {
        const userDocRef = doc(db, "users", item.receiverId);
        const userDocSnap = await getDoc(userDocRef);
        const user = userDocSnap.exists()
          ? { id: item.receiverId, ...userDocSnap.data() }
          : null;
        return { ...item, user };
      });

      const chatData = (await Promise.all(promises)) as Chat[];

      const byReceiver = new Map<string, Chat>();
      for (const chat of chatData) {
        const existing = byReceiver.get(chat.receiverId);
        if (!existing || (chat.updatedAt ?? 0) >= (existing.updatedAt ?? 0)) {
          byReceiver.set(chat.receiverId, chat);
        }
      }

      const sortedChats = [...byReceiver.values()].sort(
        (a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0)
      );
      dispatch(setOriginalChats(sortedChats));
    });

    return () => {
      unSubChats();
      partnerUnsubs.forEach((unsub) => unsub());
      chatTypingUnsubs.forEach((unsub) => unsub());
    };
  }, [currentUser?.id, dispatch]);
}
