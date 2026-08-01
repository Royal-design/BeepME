import { arrayUnion, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { UserType } from "@/redux/slice/authSlice";
import { isUserOnline } from "./presence";

const MODEL = import.meta.env.VITE_GEMINI_MODEL || "gemini-2.0-flash";
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

export const geminiConfigured = Boolean(API_KEY);

const AI_REPLIES_KEY = "beepme-ai-enabled";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function isAiEnabled(chatId: string): boolean {
  try {
    const map = JSON.parse(localStorage.getItem(AI_REPLIES_KEY) || "{}");
    return map[chatId] !== false;
  } catch {
    return true;
  }
}

export function setAiEnabled(chatId: string, enabled: boolean) {
  try {
    const map = JSON.parse(localStorage.getItem(AI_REPLIES_KEY) || "{}");
    map[chatId] = enabled;
    localStorage.setItem(AI_REPLIES_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

interface GeminiReplyOptions {
  senderName: string;
  recipientName: string;
  history: { senderId: string; text?: string; img?: string }[];
  senderId: string;
  recipientId: string;
}

function buildPrompt(opts: GeminiReplyOptions): string {
  const lines = opts.history
    .slice(-10)
    .map((m) => {
      const who =
        m.senderId === opts.senderId ? opts.senderName : opts.recipientName;
      const content = m.img ? "[shared an image]" : m.text?.trim() || "";
      return `${who}: ${content}`;
    })
    .join("\n");

  return [
    `You are ${opts.recipientName}'s assistant on BeepME, replying on their behalf while they are away.`,
    `Reply as ${opts.recipientName}: keep it short (1-3 sentences), friendly and natural, matching the language of the conversation.`,
    "Do not mention that you are an AI or that the person is unavailable.",
    "",
    "Conversation so far:",
    lines,
    "",
    `Now continue as ${opts.recipientName}.`
  ].join("\n");
}

async function generateReply(opts: GeminiReplyOptions): Promise<string | null> {
  if (!API_KEY) return null;
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: buildPrompt(opts) }]
            }
          ],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 200
          }
        })
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return typeof text === "string" && text.trim() ? text.trim() : null;
  } catch {
    return null;
  }
}

interface ScheduleReplyOptions {
  chatId: string;
  sender: UserType | null;
  recipient: UserType | null;
}

/**
 * Replies on behalf of an offline recipient using Gemini. Simulates a real
 * person: a pause, a "typing…" flag, then the reply is written to the chat.
 * Silently does nothing when the recipient is online, AI is disabled for the
 * chat, or no API key is configured.
 */
export async function scheduleAiReply({
  chatId,
  sender,
  recipient
}: ScheduleReplyOptions): Promise<void> {
  if (!chatId || !recipient?.id || !sender?.id) return;
  if (isUserOnline(recipient) || !isAiEnabled(chatId)) return;

  const chatRef = doc(db, "chats", chatId);

  await sleep(2000 + Math.random() * 2500);
  await updateDoc(chatRef, { typingBy: recipient.id }).catch(() => {});
  await sleep(1300 + Math.random() * 2200);

  try {
    const chatSnap = await getDoc(chatRef);
    const history = chatSnap.exists()
      ? chatSnap.data().messages || []
      : [];

    const reply = await generateReply({
      senderName: sender.name,
      recipientName: recipient.name,
      history,
      senderId: sender.id,
      recipientId: recipient.id
    });

    if (!reply) {
      await updateDoc(chatRef, { typingBy: "" }).catch(() => {});
      return;
    }

    await updateDoc(chatRef, {
      messages: arrayUnion({
        senderId: recipient.id,
        text: reply,
        createdAt: new Date()
      }),
      typingBy: ""
    });

    await updateAiPreview(chatId, reply, [sender.id, recipient.id]);
  } catch {
    await updateDoc(chatRef, { typingBy: "" }).catch(() => {});
  }
}

async function updateAiPreview(
  chatId: string,
  lastMessage: string,
  userIds: string[]
) {
  await Promise.all(
    userIds.map(async (id) => {
      const ref = doc(db, "userChats", id);
      const snap = await getDoc(ref);
      if (!snap.exists()) return;
      const chats = snap.data().chats || [];
      const idx = chats.findIndex(
        (chat: { chatId: string }) => chat.chatId === chatId
      );
      if (idx === -1) return;
      chats[idx] = {
        ...chats[idx],
        lastMessage,
        isSeen: false,
        updatedAt: Date.now()
      };
      await updateDoc(ref, { chats });
    })
  );
}
