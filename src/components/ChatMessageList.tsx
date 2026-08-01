import { useEffect, useMemo, useRef } from "react";
import { MessageBubble, MessageData } from "./MessageBubble";
import { formatDayLabel } from "@/features/formatTime";
import { UserType } from "@/redux/slice/authSlice";
import { cn } from "@/lib/utils";

interface ChatMessageListProps {
  messages: MessageData[];
  currentUser: UserType | null;
  chatUser: UserType | null;
  read: boolean;
}

const GROUP_WINDOW_MS = 5 * 60 * 1000;

function isSameDay(a: any, b: any) {
  const da = new Date(a.createdAt?.toDate?.() ?? a.createdAt ?? Date.now());
  const db = new Date(b.createdAt?.toDate?.() ?? b.createdAt ?? Date.now());
  return da.toDateString() === db.toDateString();
}

export function ChatMessageList({
  messages,
  currentUser,
  chatUser,
  read
}: ChatMessageListProps) {
  const endRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
  }, [messages.length]);

  const groups = useMemo(() => {
    return messages.map((message, i) => {
      const prev = messages[i - 1];
      const isOwn = message.senderId === currentUser?.id;
      const sameGroup =
        prev &&
        prev.senderId === message.senderId &&
        new Date(message.createdAt?.toDate?.() ?? message.createdAt).getTime() -
          new Date(prev.createdAt?.toDate?.() ?? prev.createdAt).getTime() <
          GROUP_WINDOW_MS;
      const newDay = !prev || !isSameDay(prev, message);
      return { message, isOwn, isGroupStart: !sameGroup || newDay, isGroupEnd: true };
    });
  }, [messages, currentUser?.id]);

  return (
    <div
      ref={scrollerRef}
      className="scrollbar-thin hex-wall h-full overflow-y-auto px-4 pb-4 sm:px-8"
      aria-live="polite"
    >
      <div className="mx-auto flex max-w-3xl flex-col">
        {groups.map(({ message, isOwn, isGroupStart }, i) => {
          const next = groups[i + 1];
          const isGroupEnd = !next || next.isGroupStart;
          const showDay = i === 0 || !isSameDay(groups[i - 1].message, message);

          return (
            <div key={i} className={cn("flex flex-col")}>
              {showDay && (
                <div className="sticky top-2 z-10 my-4 flex justify-center">
                  <span className="rounded-full border border-border bg-surface/90 px-3 py-1 text-[11px] font-medium text-muted-foreground backdrop-blur">
                    {formatDayLabel(message.createdAt)}
                  </span>
                </div>
              )}
              <MessageBubble
                message={message}
                isOwn={isOwn}
                isGroupStart={isGroupStart}
                isGroupEnd={isGroupEnd}
                showAvatar={!isOwn && isGroupStart}
                senderPhoto={chatUser?.photo}
                senderName={chatUser?.name}
                read={read && isOwn}
              />
            </div>
          );
        })}
        <div ref={endRef} />
      </div>
    </div>
  );
}
