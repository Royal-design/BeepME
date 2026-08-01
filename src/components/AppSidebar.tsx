import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { useAppSelector } from "@/redux/store";
import { SearchBar } from "./SearchBar";
import { NewChatDialog } from "./NewChatDialog";
import { ConversationList } from "./ConversationList";
import { UserList } from "./UserList";
import { ProfileMenu } from "./ProfileMenu";
import { Avatar } from "./Avatar";
import { cn } from "@/lib/utils";
import { isUserOnline } from "@/features/presence";

interface AppSidebarProps {
  collapsed: boolean;
}

export const AppSidebar = ({ collapsed }: AppSidebarProps) => {
  const location = useLocation();
  const user = useAppSelector((state) => state.auth.user);
  const onUsers = location.pathname.startsWith("/users");

  return (
    <motion.aside
      aria-label="Sidebar"
      initial={false}
      animate={{ width: collapsed ? 0 : 356 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="hidden h-full shrink-0 overflow-hidden border-r border-border-soft bg-surface md:block"
    >
      <div className="flex h-full w-[356px] flex-col">
        <header className="flex flex-col gap-3 px-4 pt-4 pb-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2.5">
              <Avatar src={user?.photo} name={user?.name} size="sm" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold leading-tight">
                  {user?.name}
                </p>
                <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <span
                    className={cn(
                      "size-1.5 rounded-full",
                      isUserOnline(user) ? "bg-success" : "bg-faint"
                    )}
                    aria-hidden
                  />
                  {isUserOnline(user) ? "Online" : "Offline"}
                </p>
              </div>
            </div>
            <ProfileMenu
              trigger={
                <button
                  type="button"
                  aria-label="Account menu"
                  className="grid size-8 cursor-pointer place-items-center rounded-lg text-faint transition-colors duration-200 hover:bg-surface-hover hover:text-foreground"
                >
                  <Plus size={18} strokeWidth={2} />
                </button>
              }
              align="start"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1">
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
        </header>

        <div className="relative flex-1 min-h-0 overflow-y-auto scrollbar-thin">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={onUsers ? "users" : "chats"}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="pb-3"
            >
              {onUsers ? <UserList /> : <ConversationList />}
            </motion.div>
          </AnimatePresence>
        </div>

        <footer className="flex items-center justify-between border-t border-border-soft px-4 py-2.5">
          <span className="font-display text-xs font-medium tracking-wide text-faint">
            BeepME
          </span>
          <span className="text-[10px] text-faint">Messaging</span>
        </footer>
      </div>
    </motion.aside>
  );
};
