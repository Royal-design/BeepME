import { useEffect, useRef } from "react";
import { ChatWindow } from "@/components/ChatWindow";
import { useAppSelector } from "@/redux/store";

const showNotification = (sender: string, message: string) => {
  if (!("Notification" in window)) return;

  const notify = () => {
    if (Notification.permission === "granted") {
      new Notification(sender, {
        body: message,
        icon: "/favicon.ico"
      });
    }
  };

  if (Notification.permission === "granted") {
    notify();
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") notify();
    });
  }
};

export const ChatMessage = () => {
  const chats = useAppSelector((state) => state.filter.chats);
  const chatId = useAppSelector((state) => state.chats.activeChatId);
  const lastNotified = useRef<Record<string, string>>({});

  useEffect(() => {
    chats.forEach((chat) => {
      if (!chat.isSeen && chat.lastMessage && chat.chatId !== chatId) {
        const key = chat.chatId;
        if (lastNotified.current[key] !== chat.lastMessage) {
          lastNotified.current[key] = chat.lastMessage;
          showNotification(chat.user.name, chat.lastMessage);
        }
      }
    });
  }, [chats, chatId]);

  return <ChatWindow />;
};
