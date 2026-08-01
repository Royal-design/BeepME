import { Plus } from "lucide-react";
import { useAppSelector } from "@/redux/store";
import { Avatar } from "./Avatar";
import { ProfileMenu } from "./ProfileMenu";
import { SearchBar } from "./SearchBar";
import { NewChatDialog } from "./NewChatDialog";
import { ConversationList } from "./ConversationList";
import { SignOutButton } from "./SignOutButton";

export const MobileChatsPage = () => {
  const user = useAppSelector((state) => state.auth.user);

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between gap-2 px-4 pt-4 pb-2">
        <div className="flex items-center gap-2.5">
          <Avatar src={user?.photo} name={user?.name} size="sm" />
          <p className="text-sm font-semibold">Chats</p>
        </div>
        <div className="flex items-center gap-1">
          <SignOutButton />
          <ProfileMenu align="end" />
        </div>
      </header>

      <div className="flex items-center gap-2 px-4 pb-3">
        <div className="min-w-0 flex-1">
          <SearchBar />
        </div>
        <NewChatDialog
          trigger={
            <button
              type="button"
              aria-label="Start a new chat"
              className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-lg bg-accent text-accent-foreground shadow-sm transition-all duration-200 hover:bg-accent-hover active:scale-95"
            >
              <Plus size={18} strokeWidth={2.2} />
            </button>
          }
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin">
        <ConversationList />
      </div>
    </div>
  );
};
