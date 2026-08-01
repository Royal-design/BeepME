import { useEffect, useRef, useState } from "react";
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
import { Button } from "./ui/button";
import { ArrowRight, Search as SearchIcon, UsersRound } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "@/redux/store";
import { UserType } from "@/redux/slice/authSlice";
import { Avatar } from "./Avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "./ui/dialog";

interface NewChatDialogProps {
  trigger?: React.ReactElement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const MAX_RESULTS = 8;

export const NewChatDialog = ({
  trigger,
  open,
  onOpenChange
}: NewChatDialogProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserType[]>([]);
  const [searched, setSearched] = useState(false);
  const [internalOpen, setInternalOpen] = useState(false);
  const currentUser = useAppSelector((state) => state.auth.user);
  const allUsers = useAppSelector((state) => state.auth.users);
  const navigate = useNavigate();
  const pendingRef = useRef(false);

  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const setIsOpen = (v: boolean) => {
    if (isControlled) onOpenChange?.(v);
    else setInternalOpen(v);
    if (!v) {
      setTimeout(() => {
        setQuery("");
        setResults([]);
        setSearched(false);
      }, 200);
    }
  };

  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      setResults([]);
      setSearched(false);
      return;
    }

    const t = setTimeout(() => {
      const matches = (allUsers ?? [])
        .filter((user) => user.id !== currentUser?.id)
        .filter((user) => user.name.toLowerCase().includes(q))
        .slice(0, MAX_RESULTS);
      setResults(matches);
      setSearched(true);
    }, 200);

    return () => clearTimeout(t);
  }, [query, allUsers, currentUser?.id]);

  const handleAddChat = async (user: UserType) => {
    if (!user || !currentUser || pendingRef.current) return;
    pendingRef.current = true;
    try {
      const userChatsRef = doc(db, "userChats", currentUser.id);
      const userChatsSnap = await getDoc(userChatsRef);

      if (userChatsSnap.exists()) {
        const userChats = userChatsSnap.data().chats || [];
        const existingChat = userChats.find(
          (chat: { receiverId: string }) => chat.receiverId === user.id
        );
        if (existingChat) {
          toast.success("Opening existing chat");
          navigate(`/chats/${existingChat.chatId}`);
          setIsOpen(false);
          return;
        }
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

      toast.success("Chat created");
      navigate("/chats");
      setIsOpen(false);
    } catch {
      toast.error("Failed to add chat. Try again.");
    } finally {
      pendingRef.current = false;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        className="inset-0 flex h-dvh w-full max-w-none translate-x-0 translate-y-0 flex-col overflow-hidden rounded-none border-border bg-surface-raised p-6 text-popover-foreground shadow-lg sm:inset-y-0 sm:left-auto sm:right-0 sm:w-[400px] sm:max-w-[400px] sm:rounded-none sm:border-l"
      >
        <DialogHeader className="text-left">
          <DialogTitle className="font-display text-xl font-semibold tracking-tight">
            New chat
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Search by name — partial matches work.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => e.preventDefault()}
          className="flex items-center gap-2"
          role="search"
        >
          <div className="relative flex-1">
            <SearchIcon
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name"
              aria-label="Person's name"
              className="h-10 w-full rounded-lg border border-input bg-background pr-3 pl-9 text-sm transition-colors focus:border-accent focus:outline-none"
            />
          </div>
        </form>

        <div className="mt-4 min-h-0 flex-1 overflow-y-auto scrollbar-thin">
          {results.length > 0 ? (
            <ul className="space-y-2">
              {results.map((user) => (
                <li
                  key={user.id}
                  className="flex items-center gap-3 rounded-xl border border-border bg-background p-3"
                >
                  <Avatar src={user.photo} name={user.name} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{user.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {user.bio || "Available"}
                    </p>
                  </div>
                  <Button
                    onClick={() => handleAddChat(user)}
                    size="sm"
                    className="shrink-0 rounded-lg"
                  >
                    Message
                    <ArrowRight size={14} />
                  </Button>
                </li>
              ))}
            </ul>
          ) : searched ? (
            <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
              <span className="grid size-10 place-items-center rounded-xl bg-surface-hover text-faint">
                <UsersRound size={18} strokeWidth={1.8} />
              </span>
              <p className="text-sm text-muted-foreground">
                No one here goes by that name.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
              <span className="grid size-10 place-items-center rounded-xl bg-surface-hover text-faint">
                <UsersRound size={18} strokeWidth={1.8} />
              </span>
              <p className="text-sm text-muted-foreground">
                Start typing a name to find people.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
