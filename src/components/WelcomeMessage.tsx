import { motion } from "framer-motion";
import { ArrowRight, MessagesSquare, UsersRound } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { BEEPME } from "@/assets/logo";
import { NewChatDialog } from "./NewChatDialog";

export const WelcomeMessage = () => {
  const location = useLocation();
  const userPage = location.pathname === "/users";

  const title = userPage ? "Find your people" : "Welcome to the hive";
  const description = userPage
    ? "Pick someone from the list and start a conversation. The buzz begins with a hello."
    : "Select a conversation to keep buzzing, or start a new one with someone new.";

  return (
    <div className="hex-wall flex h-full w-full flex-col items-center justify-center overflow-y-auto px-6 py-10 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <img
          src={BEEPME}
          alt=""
          className="size-16 rounded-2xl object-contain ring-1 ring-border"
        />
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="mt-6 text-[11px] font-semibold tracking-[0.22em] text-accent uppercase"
      >
        BeepME
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.16, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="mt-2 max-w-md font-display text-2xl font-medium tracking-tight sm:text-3xl"
      >
        {title}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.24, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground"
      >
        {description}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.32, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="mt-8 flex flex-col gap-2.5 sm:flex-row"
      >
        {!userPage && (
          <NewChatDialog
            trigger={
              <button
                type="button"
                className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl bg-accent px-4 text-sm font-semibold text-accent-foreground shadow-sm transition-all duration-200 hover:bg-accent-hover active:scale-[0.98]"
              >
                <MessagesSquare size={16} strokeWidth={2} />
                Start a new chat
              </button>
            }
          />
        )}
        <NavLink
          to={userPage ? "/chats" : "/users"}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 text-sm font-medium text-foreground transition-colors duration-200 hover:bg-surface-hover"
        >
          {userPage ? <MessagesSquare size={16} /> : <UsersRound size={16} />}
          {userPage ? "Browse chats" : "Discover people"}
          <ArrowRight size={14} strokeWidth={2} />
        </NavLink>
      </motion.div>
    </div>
  );
};
