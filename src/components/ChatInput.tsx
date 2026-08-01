import { useEffect, useRef, useState } from "react";
import { arrayUnion, doc, getDoc, updateDoc } from "firebase/firestore";
import EmojiPicker, { Theme as EmojiTheme } from "emoji-picker-react";
import { ArrowUp, ImagePlus, SmilePlus } from "lucide-react";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { db } from "@/firebase/firebase";
import { resetFocus } from "@/redux/slice/chatSlice";
import { cn } from "@/lib/utils";
import { scheduleAiReply } from "@/features/gemini";

export const ChatInput = () => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.user);
  const { chatId, shouldFocus, isCurrentUserBlocked, isReceiverBlocked, user } =
    useAppSelector((state) => state.chats.chats);

  const [text, setText] = useState("");
  const [openEmoji, setOpenEmoji] = useState(false);
  const [sending, setSending] = useState(false);
  const [typingSent, setTypingSent] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const aiPendingRef = useRef(false);

  const blocked = isCurrentUserBlocked || isReceiverBlocked;

  useEffect(() => {
    if (shouldFocus) {
      const t = setTimeout(() => textareaRef.current?.focus(), 100);
      dispatch(resetFocus());
      return () => clearTimeout(t);
    }
  }, [shouldFocus, dispatch]);

  useEffect(() => {
    if (typingSent && chatId) {
      updateDoc(doc(db, "chats", chatId), { typingBy: "" }).catch(() => {});
      setTypingSent(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId]);

  const autoGrow = (el: HTMLTextAreaElement) => {
    el.style.height = "0px";
    el.style.height = `${Math.min(el.scrollHeight, 132)}px`;
  };

  const markTyping = () => {
    if (blocked || !chatId || typingSent || !currentUser?.id) return;
    updateDoc(doc(db, "chats", chatId), { typingBy: currentUser.id }).catch(
      () => {}
    );
    setTypingSent(true);
  };

  const clearTyping = () => {
    if (!chatId) return;
    updateDoc(doc(db, "chats", chatId), { typingBy: "" }).catch(() => {});
  };

  const updateChatPreview = async (message: string) => {
    const ids = [currentUser?.id, user?.id];
    await Promise.all(
      ids.map(async (id) => {
        if (!id) return;
        const ref = doc(db, "userChats", id);
        const snap = await getDoc(ref);
        if (!snap.exists()) return;
        const chats = snap.data().chats || [];
        const idx = chats.findIndex(
          (c: { chatId: string }) => c.chatId === chatId
        );
        if (idx === -1) return;
        chats[idx] = {
          ...chats[idx],
          lastMessage: message,
          isSeen: id === currentUser?.id,
          updatedAt: Date.now()
        };
        await updateDoc(ref, { chats });
      })
    );
  };

  const sendText = async () => {
    const message = text.trim();
    if (!message || !chatId || !currentUser?.id) return;
    setSending(true);
    try {
      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion({
          senderId: currentUser.id,
          text: message,
          createdAt: new Date()
        }),
        typingBy: ""
      });
      await updateChatPreview(message);
      setText("");
      setTypingSent(false);
      setOpenEmoji(false);
      requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.style.height = "0px";
          textareaRef.current.focus();
        }
      });
      void maybeAutoReply();
    } catch {
      toast.error("Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  const handleImageUpload = async (file?: File | null) => {
    if (!file || !chatId || !currentUser?.id) return;
    setSending(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "chattybee");
    try {
      const response = await fetch(
        "https://api.cloudinary.com/v1_1/chattybee/image/upload",
        { method: "POST", body: formData }
      );
      if (!response.ok) throw new Error("Upload failed");
      const data = await response.json();
      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion({
          senderId: currentUser.id,
          text: "",
          img: data.secure_url,
          createdAt: new Date()
        }),
        typingBy: ""
      });
      await updateChatPreview("📷 Image");
      setTypingSent(false);
      if (fileRef.current) fileRef.current.value = "";
      void maybeAutoReply();
    } catch {
      toast.error("Image upload failed. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendText();
    }
  };

  const maybeAutoReply = async () => {
    if (aiPendingRef.current) return;
    aiPendingRef.current = true;
    try {
      await scheduleAiReply({ chatId, sender: currentUser, recipient: user });
    } finally {
      aiPendingRef.current = false;
    }
  };

  return (
    <div className="border-t border-border-soft bg-surface px-3 py-3 sm:px-4">
      <div className="relative mx-auto flex max-w-3xl items-end gap-1.5 sm:gap-2">
        {openEmoji && !blocked && (
          <div className="absolute bottom-full left-0 z-20 mb-2 rounded-2xl border border-border bg-surface-raised p-2 shadow-lg">
            <EmojiPicker
              lazyLoadEmojis
              theme={EmojiTheme.DARK}
              width={300}
              height={360}
              onEmojiClick={(e) => {
                setText((prev) => prev + e.emoji);
                textareaRef.current?.focus();
              }}
            />
          </div>
        )}

        <button
          type="button"
          disabled={blocked}
          onClick={() => setOpenEmoji((v) => !v)}
          aria-label={openEmoji ? "Close emoji picker" : "Add an emoji"}
          aria-expanded={openEmoji}
          className="grid size-10 shrink-0 cursor-pointer place-items-center rounded-xl text-faint transition-colors duration-200 hover:bg-surface-hover hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
        >
          <SmilePlus size={20} strokeWidth={1.8} />
        </button>

        <div className="flex min-w-0 flex-1 items-end rounded-2xl border border-input bg-background px-2 py-1.5 transition-colors focus-within:border-accent">
          <textarea
            ref={textareaRef}
            value={text}
            disabled={blocked || sending}
            rows={1}
            placeholder={
              blocked ? "You can't send messages in this chat" : "Message"
            }
            aria-label="Message"
            onChange={(e) => {
              setText(e.target.value);
              autoGrow(e.target);
              if (e.target.value.trim()) markTyping();
            }}
            onKeyDown={onKeyDown}
            onBlur={() => {
              if (typingSent && !text.trim()) {
                clearTyping();
                setTypingSent(false);
              }
            }}
            className="scrollbar-thin max-h-[132px] min-h-[40px] flex-1 resize-none bg-transparent px-1 py-1.5 text-[14px] leading-relaxed text-foreground outline-none placeholder:text-faint disabled:cursor-not-allowed"
          />
        </div>

        <button
          type="button"
          disabled={blocked || sending}
          onClick={() => fileRef.current?.click()}
          aria-label="Attach an image"
          className="grid size-10 shrink-0 cursor-pointer place-items-center rounded-xl text-faint transition-colors duration-200 hover:bg-surface-hover hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ImagePlus size={20} strokeWidth={1.8} />
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => void handleImageUpload(e.target.files?.[0])}
        />

        <button
          type="button"
          onClick={() => void sendText()}
          disabled={blocked || sending || !text.trim()}
          aria-label="Send message"
          className={cn(
            "grid size-10 shrink-0 cursor-pointer place-items-center rounded-xl bg-accent text-accent-foreground shadow-sm transition-all duration-200",
            "hover:bg-accent-hover active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
          )}
        >
          {sending ? (
            <span className="size-4 animate-spin rounded-full border-2 border-accent-foreground/40 border-t-accent-foreground" />
          ) : (
            <ArrowUp size={19} strokeWidth={2.2} />
          )}
        </button>
      </div>
    </div>
  );
};
