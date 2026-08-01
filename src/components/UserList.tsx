import { useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import avatar from "@/assets/user-avatar.jpg";
import { UserType } from "@/redux/slice/authSlice";
import { UserSkeleton } from "./UserSkeleton";
import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc
} from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { changeChats, setActiveChatId } from "@/redux/slice/chatSlice";
import { Avatar } from "./Avatar";
import { cn } from "@/lib/utils";
import { UsersRound } from "lucide-react";
import { isUserOnline } from "@/features/presence";
import { usePresenceTick } from "@/hooks/usePresenceTick";

export const UserList = () => {
  usePresenceTick();
  const navigate = useNavigate();
  const users = useAppSelector((state) => state.filter.users);
  const currentUser = useAppSelector((state) => state.auth.user);
  const loading = useAppSelector((state) => state.filter.loading);
  const chats = useAppSelector((state) => state.filter.chats);
  const dispatch = useAppDispatch();
  const pendingRef = useRef(false);

  const handleAddChat = useCallback(
    async (user: UserType) => {
      if (!user || !currentUser || pendingRef.current) return;
      pendingRef.current = true;

      try {
        const userChatsRef = doc(db, "userChats", currentUser.id);
        let existingChatId: string | null = null;

        const existing = chats.find((chat) => chat.receiverId === user.id);
        if (existing) {
          existingChatId = existing.chatId;
        } else {
          const userChatsDoc = await getDoc(userChatsRef);
          const userChats = userChatsDoc.exists()
            ? userChatsDoc.data().chats || []
            : [];
          const existingChat = userChats.find(
            (chat: { receiverId: string }) => chat.receiverId === user.id
          );
          if (existingChat) existingChatId = existingChat.chatId;
        }

        if (existingChatId) {
          dispatch(setActiveChatId(existingChatId));
          dispatch(changeChats({ currentUser, user, chatId: existingChatId }));
          navigate(`/chats/${existingChatId}`);
          return;
        }

        const newChatRef = doc(collection(db, "chats"));
        await setDoc(newChatRef, {
          createdAt: serverTimestamp(),
          messages: []
        });

        const newChatData = {
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: user.id,
          updatedAt: Date.now()
        };

        await updateDoc(userChatsRef, { chats: arrayUnion(newChatData) });
        await updateDoc(doc(db, "userChats", user.id), {
          chats: arrayUnion({
            chatId: newChatRef.id,
            lastMessage: "",
            receiverId: currentUser.id,
            updatedAt: Date.now()
          })
        });

        dispatch(changeChats({ currentUser, user, chatId: newChatRef.id }));
        dispatch(setActiveChatId(newChatRef.id));
        navigate(`/chats/${newChatRef.id}`);
      } catch (error) {
        console.error("Error adding chat:", error);
        toast.error("Failed to add chat. Try again.");
      } finally {
        pendingRef.current = false;
      }
    },
    [currentUser, dispatch, navigate, chats]
  );

  if (!currentUser) return null;

  const filteredUsers = users.filter((user) => user.id !== currentUser.id);

  if (loading) {
    return (
      <div className="flex flex-col gap-1 px-2" aria-busy="true" aria-label="Loading people">
        {[...Array(4).keys()].map((key) => (
          <UserSkeleton key={key} />
        ))}
      </div>
    );
  }

  if (!loading && filteredUsers.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
        <span className="grid size-12 place-items-center rounded-2xl bg-surface-hover text-faint">
          <UsersRound size={20} strokeWidth={1.8} />
        </span>
        <div>
          <p className="text-sm font-medium">No one here yet</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Share BeepME with friends so the hive grows.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-0.5 px-2">
      {filteredUsers.map((user, index) => {
        const online = isUserOnline(user);
        return (
          <motion.li
            key={user.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: Math.min(index * 0.03, 0.3), ease: [0.16, 1, 0.3, 1] }}
          >
            <button
              type="button"
              onClick={() => handleAddChat(user)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors duration-150 hover:bg-surface-hover"
              )}
            >
              <Avatar src={user.photo || avatar} name={user.name} online={online} size="md" />
              <div className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{user.name}</span>
                <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                  {online ? "Online" : user.bio || "Available"}
                </span>
              </div>
            </button>
          </motion.li>
        );
      })}
    </ul>
  );
};
