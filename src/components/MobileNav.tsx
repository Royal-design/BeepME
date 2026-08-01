import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Info, MessageSquare, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/chats", label: "Chats", icon: MessageSquare },
  { to: "/users", label: "People", icon: Users },
  { to: "/about", label: "About", icon: Info }
];

export const MobileNav = () => {
  const location = useLocation();
  const isChatChild = location.pathname.startsWith("/chats/");

  if (isChatChild) return null;

  return (
    <nav
      aria-label="Primary"
      className="z-30 border-t border-border-soft bg-surface/95 px-6 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 backdrop-blur"
    >
      <div className="mx-auto flex max-w-sm items-center justify-around">
        {items.map(({ to, label, icon: Icon }) => {
          const active =
            to === "/chats"
              ? location.pathname === "/chats" || location.pathname === "/"
              : location.pathname.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              className="relative flex flex-col items-center gap-0.5 py-1"
            >
              {active && (
                <motion.span
                  layoutId="mobile-nav-dot"
                  className="absolute -top-0.5 size-1 rounded-full bg-accent"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span
                className={cn(
                  "grid size-9 place-items-center rounded-xl transition-colors duration-200",
                  active ? "text-accent" : "text-faint"
                )}
              >
                <Icon size={20} strokeWidth={active ? 2.2 : 1.8} />
              </span>
              <span
                className={cn(
                  "text-[10px] font-medium",
                  active ? "text-foreground" : "text-faint"
                )}
              >
                {label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
