import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { Info, MessageSquare, Moon, PanelLeftClose, PanelLeftOpen, Sun, Users } from "lucide-react";
import { BEEPME } from "@/assets/logo";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";
import { ProfileMenu } from "./ProfileMenu";
import { Avatar } from "./Avatar";
import { useAppSelector } from "@/redux/store";

interface IconRailProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { to: "/chats", label: "Chats", icon: MessageSquare, end: false },
  { to: "/users", label: "People", icon: Users, end: false },
  { to: "/about", label: "About", icon: Info, end: false }
];

export const IconRail = ({ collapsed, onToggle }: IconRailProps) => {
  const { theme, toggleTheme } = useTheme();
  const user = useAppSelector((state) => state.auth.user);

  return (
    <nav
      aria-label="Primary"
      className="z-20 flex h-full w-14 shrink-0 flex-col items-center gap-2 border-r border-border-soft bg-surface py-3"
    >
      <NavLink
        to="/chats"
        aria-label="BeepME home"
        className="mb-2 grid size-10 place-items-center rounded-xl bg-accent-soft transition-colors duration-200 hover:bg-accent-strong"
      >
        <img src={BEEPME} alt="" className="size-7 rounded-lg object-contain" />
      </NavLink>

      <div className="flex flex-1 flex-col items-center gap-1.5">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            aria-label={label}
            className="relative grid size-10 place-items-center rounded-xl text-faint transition-colors duration-200 hover:bg-surface-hover hover:text-foreground"
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId="rail-indicator"
                    className="absolute inset-0 rounded-xl bg-accent-soft"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon
                  className={cn("relative size-[20px]", isActive && "text-accent")}
                  strokeWidth={1.8}
                />
              </>
            )}
          </NavLink>
        ))}
      </div>

      <div className="flex flex-col items-center gap-1.5">
        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="hidden md:grid size-10 place-items-center rounded-xl text-faint transition-colors duration-200 hover:bg-surface-hover hover:text-foreground"
        >
          {collapsed ? <PanelLeftOpen size={20} strokeWidth={1.8} /> : <PanelLeftClose size={20} strokeWidth={1.8} />}
        </button>
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          className="grid size-10 place-items-center rounded-xl text-faint transition-colors duration-200 hover:bg-surface-hover hover:text-foreground"
        >
          {theme === "dark" ? <Sun size={20} strokeWidth={1.8} /> : <Moon size={20} strokeWidth={1.8} />}
        </button>
        <ProfileMenu
          trigger={
            <button
              type="button"
              aria-label="Account menu"
              className="mt-1 cursor-pointer rounded-full transition-transform duration-200 hover:scale-105"
            >
              <Avatar src={user?.photo} name={user?.name} size="sm" />
            </button>
          }
        />
      </div>
    </nav>
  );
};
