import { memo, useCallback } from "react";
import { motion } from "framer-motion";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { changeChats, setActiveChatId } from "@/redux/slice/chatSlice";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { Chat } from "@/redux/slice/filterSlice";
import { formatTime } from "@/features/formatTime";
import { isUserOnline } from "@/features/presence";
import { usePresenceTick } from "@/hooks/usePresenceTick";
import { useNavigate } from "react-router-dom";
import { Avatar } from "./Avatar";
import { UserSkeleton } from "./UserSkeleton";
import { cn } from "@/lib/utils";
import { SearchX } from "lucide-react";

export const ConversationList = memo(function ConversationList() {
  usePresenceTick();
  const filteredChats = useAppSelector((state) => state.filter.chats);
  const loading = useAppSelector((state) => state.filter.loading);
  const currentUser = useAppSelector((state) => state.auth.user);
  const activeChatId = useAppSelector((state) => state.chats.activeChatId);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleSelect = useCallback(
    async (chat: Chat) => {
      if (!currentUser?.id || !chat?.chatId || !chat?.user) return;

      dispatch(setActiveChatId(chat.chatId));
      localStorage.setItem("activeChat", JSON.stringify(chat));

      try {
        const userChatsRef = doc(db, "userChats", currentUser.id);
        const updatedChats = filteredChats.map((item) =>
          item.chatId === chat.chatId ? { ...item, isSeen: true } : item
        );
        await updateDoc(userChatsRef, { chats: updatedChats });

        dispatch(
          changeChats({
            currentUser,
            user: chat.user,
            chatId: chat.chatId
          })
        );
        navigate(`/chats/${chat.chatId}`);
      } catch (error) {
        console.error("Error updating chat status:", error);
      }
    },
    [currentUser, filteredChats, dispatch, navigate]
  );

  if (loading) {
    return (
      <div className="flex flex-col gap-1 px-2" aria-busy="true" aria-label="Loading conversations">
        {[...Array(4).keys()].map((key) => (
          <UserSkeleton key={key} />
        ))}
      </div>
    );
  }

  if (!loading && filteredChats.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
        <span className="grid size-12 place-items-center rounded-2xl bg-surface-hover text-faint">
          <SearchX size={20} strokeWidth={1.8} />
        </span>
        <div>
          <p className="text-sm font-medium">No conversations yet</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Search for someone above to start the buzz.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-0.5 px-2">
      {filteredChats.map((chat, index) => {
        const active = activeChatId === chat.chatId;
        const unread = !chat.isSeen && Boolean(chat.lastMessage);
        const online = isUserOnline(chat.user);
        const typing = Boolean(chat.typingBy && chat.typingBy === chat.user?.id);

        return (
          <motion.li
            key={chat.chatId}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: Math.min(index * 0.03, 0.3), ease: [0.16, 1, 0.3, 1] }}
          >
            <button
              type="button"
              onClick={() => handleSelect(chat)}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors duration-150",
                active
                  ? "bg-accent-soft text-foreground"
                  : "hover:bg-surface-hover"
              )}
            >
              <Avatar src={chat.user?.photo} name={chat.user?.name} online={online} size="md" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={cn(
                      "truncate text-sm",
                      unread ? "font-semibold" : "font-medium"
                    )}
                  >
                    {chat.user?.name}
                  </span>
                  <span className="tabular shrink-0 text-[10px] text-faint">
                    {chat.lastMessage ? formatTime(chat.updatedAt) : ""}
                  </span>
                </div>
                <div className="mt-0.5 flex items-center justify-between gap-2">
                  {typing ? (
                    <span
                      className="flex min-w-0 items-center gap-1 text-accent"
                      aria-label={`${chat.user?.name} is typing`}
                    >
                      <span className="typing-dot size-1 rounded-full bg-current" />
                      <span className="typing-dot size-1 rounded-full bg-current" />
                      <span className="typing-dot size-1 rounded-full bg-current" />
                      <span className="ml-0.5 truncate text-xs">typing</span>
                    </span>
                  ) : (
                    <span
                      className={cn(
                        "truncate text-xs",
                        unread
                          ? "font-medium text-foreground"
                          : "text-muted-foreground"
                      )}
                    >
                      {chat.lastMessage || "Start the conversation"}
                    </span>
                  )}
                  {unread && (
                    <span
                      className="grid size-4.5 shrink-0 place-items-center rounded-full bg-accent text-[10px] font-semibold text-accent-foreground"
                      aria-label="Unread"
                    >
                      •
                    </span>
                  )}
                </div>
              </div>
            </button>
          </motion.li>
        );
      })}
    </ul>
  );
});
