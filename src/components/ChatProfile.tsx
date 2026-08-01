import { motion } from "framer-motion";
import { useState } from "react";
import { Ban, ShieldCheck, Sparkles, X } from "lucide-react";
import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { changeBlock } from "@/redux/slice/chatSlice";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { Avatar } from "./Avatar";
import { cn } from "@/lib/utils";
import { isUserOnline } from "@/features/presence";
import {
  geminiConfigured,
  isAiEnabled,
  setAiEnabled
} from "@/features/gemini";

interface ChatProfileProps {
  onClose: () => void;
}

export const ChatProfile = ({ onClose }: ChatProfileProps) => {
  const dispatch = useAppDispatch();
  const chatUser = useAppSelector((state) => state.chats.chats.user);
  const currentUser = useAppSelector((state) => state.auth.user);
  const chatId = useAppSelector((state) => state.chats.activeChatId);
  const { isReceiverBlocked, isCurrentUserBlocked } = useAppSelector(
    (state) => state.chats.chats
  );
  const [aiEnabled, setAiEnabledState] = useState(() =>
    isAiEnabled(chatId || "")
  );

  const toggleAi = () => {
    const next = !aiEnabled;
    setAiEnabledState(next);
    if (chatId) setAiEnabled(chatId, next);
  };

  const handleBlock = async () => {
    if (!chatUser || !currentUser) return;
    try {
      await updateDoc(doc(db, "users", currentUser.id), {
        blocked: isReceiverBlocked
          ? arrayRemove(chatUser.id)
          : arrayUnion(chatUser.id)
      });
      dispatch(changeBlock());
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <motion.aside
      key="profile"
      initial={{ opacity: 0, x: 32 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 32 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      aria-label="Conversation details"
      className="fixed inset-y-0 right-0 z-40 flex h-full w-[300px] shrink-0 flex-col border-l border-border-soft bg-surface shadow-lg md:static md:z-auto md:h-full md:w-[280px] md:shadow-none"
    >
      <header className="flex h-14 shrink-0 items-center justify-between px-4">
        <h2 className="text-sm font-semibold">Details</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close details"
          className="grid size-9 cursor-pointer place-items-center rounded-lg text-faint transition-colors duration-200 hover:bg-surface-hover hover:text-foreground"
        >
          <X size={18} strokeWidth={1.8} />
        </button>
      </header>

      <div className="flex flex-col items-center gap-3 px-6 pt-4">
        <Avatar
          src={chatUser?.photo}
          name={chatUser?.name}
          online={!isCurrentUserBlocked && isUserOnline(chatUser)}
          size="xl"
        />
        <div className="text-center">
          <p className="text-lg font-semibold tracking-tight">
            {isCurrentUserBlocked ? "User" : chatUser?.name || "Conversation"}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {isCurrentUserBlocked
              ? "Blocked"
              : isUserOnline(chatUser)
                ? "Online"
                : "Offline"}
          </p>
        </div>
        <p className="text-center text-sm leading-relaxed text-muted-foreground">
          {chatUser?.bio || "No bio yet"}
        </p>
      </div>

      <div className="mt-auto flex flex-col gap-2 border-t border-border-soft p-4">
        {!isCurrentUserBlocked && (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface-raised px-3.5 py-3">
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 text-sm font-medium">
                <Sparkles size={14} className="shrink-0 text-accent" />
                AI auto-reply
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {geminiConfigured
                  ? "Gemini replies when they're away"
                  : "Add a Gemini key to enable"}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={aiEnabled}
              aria-label="Toggle AI auto-reply"
              onClick={toggleAi}
              className={cn(
                "relative h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200",
                aiEnabled ? "bg-accent" : "bg-surface-hover"
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow-sm transition-transform duration-200",
                  aiEnabled && "translate-x-5"
                )}
              />
            </button>
          </div>
        )}

        {isCurrentUserBlocked ? (
          <div className="flex items-center gap-2 rounded-xl border border-border bg-surface-raised px-3 py-2.5 text-xs text-muted-foreground">
            <ShieldCheck size={16} className="shrink-0 text-success" />
            This user has blocked you. You can't send messages in this chat.
          </div>
        ) : (
          <button
            type="button"
            onClick={handleBlock}
            aria-label={isReceiverBlocked ? "Unblock this user" : "Block this user"}
            className={cn(
              "flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border text-sm font-medium transition-colors duration-200",
              isReceiverBlocked
                ? "border-success/30 bg-success/10 text-success hover:bg-success/15"
                : "border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/15"
            )}
          >
            {isReceiverBlocked ? <ShieldCheck size={16} /> : <Ban size={16} />}
            {isReceiverBlocked ? "Unblock user" : "Block user"}
          </button>
        )}
      </div>
    </motion.aside>
  );
};
