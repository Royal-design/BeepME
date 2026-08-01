import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { IconRail } from "@/components/IconRail";
import { AppSidebar } from "@/components/AppSidebar";
import { MobileNav } from "@/components/MobileNav";
import { useIsMobile } from "@/hooks/use-mobile";
import { useChatsSubscription } from "@/hooks/useChatsSubscription";
import { usePresence } from "@/hooks/usePresence";

export const RootLayout = () => {
  const location = useLocation();
  useChatsSubscription();
  usePresence();
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState(false);
  const isChatChild = location.pathname.startsWith("/chats/");

  if (isMobile) {
    return (
      <div className="flex h-screen flex-col overflow-hidden bg-background text-foreground">
        <main className="min-h-0 flex-1">
          <Outlet />
        </main>
        {!isChatChild && <MobileNav />}
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <IconRail collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
      <AppSidebar collapsed={collapsed} />
      <main className="min-w-0 flex-1">
        <Outlet />
      </main>
    </div>
  );
};
