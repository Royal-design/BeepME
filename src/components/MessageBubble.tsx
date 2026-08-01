import { memo } from "react";
import { Check, CheckCheck } from "lucide-react";
import { Avatar } from "./Avatar";
import { formatTime } from "@/features/formatTime";
import { cn } from "@/lib/utils";

export interface MessageData {
  text?: string;
  img?: string;
  createdAt: any;
  senderId: string;
}

interface MessageBubbleProps {
  message: MessageData;
  isOwn: boolean;
  isGroupStart: boolean;
  isGroupEnd: boolean;
  showAvatar: boolean;
  senderPhoto?: string | null;
  senderName?: string | null;
  read: boolean;
}

export const MessageBubble = memo(function MessageBubble({
  message,
  isOwn,
  isGroupStart,
  isGroupEnd,
  showAvatar,
  senderPhoto,
  senderName,
  read
}: MessageBubbleProps) {
  const hasText = Boolean(message.text && message.text.trim().length > 0);

  return (
    <div
      className={cn(
        "flex w-full animate-msg-in",
        isOwn ? "justify-end" : "justify-start",
        isGroupStart ? "mt-3" : "mt-0.5"
      )}
    >
      {!isOwn && (
        <div className="mr-2 flex w-8 shrink-0 justify-center">
          {showAvatar ? (
            <Avatar
              src={senderPhoto}
              name={senderName}
              size="sm"
              className="mt-0.5"
            />
          ) : (
            <span className="mt-0.5 text-[9px] text-faint" aria-hidden>
              {" "}
            </span>
          )}
        </div>
      )}

      <div
        className={cn(
          "flex max-w-[78%] flex-col overflow-hidden border shadow-sm",
          isOwn
            ? "border-accent-strong/40 bg-accent text-accent-foreground"
            : "border-border-soft bg-surface-raised text-foreground",
          isOwn
            ? isGroupEnd
              ? "rounded-2xl rounded-br-lg"
              : "rounded-2xl"
            : isGroupEnd
              ? "rounded-2xl rounded-bl-lg"
              : "rounded-2xl"
        )}
      >
        {message.img && (
          <img
            src={message.img}
            alt="Attachment"
            className="max-h-72 w-full object-cover"
            loading="lazy"
          />
        )}
        {hasText && (
          <p
            className={cn(
              "px-3.5 py-2 text-[14px] leading-relaxed break-words whitespace-pre-wrap",
              message.img && "pb-1"
            )}
          >
            {message.text}
          </p>
        )}
        {(hasText || message.img) && (
          <div
            className={cn(
              "flex items-center justify-end gap-1 px-3 pb-1.5",
              message.img && "pt-0.5",
              isOwn ? "text-accent-foreground/70" : "text-faint"
            )}
          >
            {isOwn && (
              <>
                {read ? (
                  <CheckCheck size={13} className="text-accent-foreground/80" aria-label="Read" />
                ) : (
                  <Check size={13} aria-label="Sent" />
                )}
              </>
            )}
            <span className="tabular text-[10px] leading-none">
              {formatTime(message.createdAt)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
});
