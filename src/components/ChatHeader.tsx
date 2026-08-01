import { ArrowLeft, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "@/redux/store";
import { Avatar } from "./Avatar";
import { cn } from "@/lib/utils";
import { isUserOnline } from "@/features/presence";

interface ChatHeaderProps {
  typingBy?: string | null;
  onToggleDetails?: () => void;
}

export const ChatHeader = ({
  typingBy,
  onToggleDetails
}: ChatHeaderProps) => {
  const navigate = useNavigate();
  const chatUser = useAppSelector((state) => state.chats.chats.user);
  const currentUser = useAppSelector((state) => state.auth.user);
  const isBlocked =
    chatUser?.id && currentUser?.blocked.includes(chatUser.id);

  const isTyping = Boolean(typingBy) && typingBy === chatUser?.id;
  const online = isUserOnline(chatUser);
  const status = isBlocked
    ? "Blocked"
    : isTyping
      ? "typing"
      : online
        ? "Online"
        : "Offline";

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border-soft bg-surface px-3 sm:px-4">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={() => navigate("/chats")}
          aria-label="Back to chats"
          className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-lg text-faint transition-colors duration-200 hover:bg-surface-hover hover:text-foreground md:hidden"
        >
          <ArrowLeft size={20} strokeWidth={1.8} />
        </button>
        <Avatar
          src={isBlocked ? null : chatUser?.photo}
          name={chatUser?.name}
          online={!isBlocked && isUserOnline(chatUser)}
          size="md"
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold leading-tight">
            {isBlocked ? "User" : chatUser?.name || "Conversation"}
          </p>
          <p
            className={cn(
              "flex items-center gap-1 text-[11px] leading-tight",
              isTyping ? "text-accent" : "text-muted-foreground"
            )}
            aria-live="polite"
          >
            {isTyping ? (
              <>
                <span className="typing-dot size-1 rounded-full bg-current" />
                <span className="typing-dot size-1 rounded-full bg-current" />
                <span className="typing-dot size-1 rounded-full bg-current" />
                <span className="ml-0.5">typing</span>
              </>
            ) : (
              status || "Offline"
            )}
          </p>
        </div>
      </div>

      {onToggleDetails && (
        <button
          type="button"
          onClick={onToggleDetails}
          aria-label="Open conversation details"
          className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-lg text-faint transition-colors duration-200 hover:bg-surface-hover hover:text-foreground"
        >
          <Info size={19} strokeWidth={1.8} />
        </button>
      )}
    </header>
  );
};
