import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { useAppSelector } from "@/redux/store";
import { MessageData } from "./MessageBubble";
import { ChatMessageList } from "./ChatMessageList";
import { ChatInput } from "./ChatInput";
import { ChatHeader } from "./ChatHeader";
import { ChatProfile } from "./ChatProfile";

export const ChatWindow = () => {
  const chatId = useAppSelector((state) => state.chats.activeChatId);
  const chatUser = useAppSelector((state) => state.chats.chats.user);
  const currentUser = useAppSelector((state) => state.auth.user);
  const activeChat = useAppSelector((state) =>
    state.filter.chats.find((c) => c.chatId === state.chats.activeChatId)
  );

  const [messages, setMessages] = useState<MessageData[]>([]);
  const [typingBy, setTypingBy] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    if (!chatId) return;

    const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
      if (res.exists()) {
        const data = res.data();
        setMessages((data.messages || []) as MessageData[]);
        setTypingBy(data.typingBy ?? null);
      } else {
        setMessages([]);
        setTypingBy(null);
      }
    });

    return () => unSub();
  }, [chatId]);

  if (!chatId) return null;

  return (
    <div className="relative flex h-full min-w-0 bg-background">
      <div className="flex h-full min-w-0 flex-1 flex-col">
        <ChatHeader
          typingBy={typingBy}
          onToggleDetails={() => setDetailsOpen((v) => !v)}
        />

        <ChatMessageList
          messages={messages}
          currentUser={currentUser}
          chatUser={chatUser}
          read={Boolean(activeChat?.isSeen)}
        />

        <ChatInput />
      </div>

      <AnimatePresence initial={false}>
        {detailsOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-30 bg-black/50 backdrop-blur-[2px] md:hidden"
            onClick={() => setDetailsOpen(false)}
          />
        )}
        {detailsOpen && (
          <ChatProfile
            key="profile"
            onClose={() => setDetailsOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
