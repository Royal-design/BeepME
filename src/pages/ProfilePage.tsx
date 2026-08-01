import { Mail, Quote } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { useAppSelector } from "@/redux/store";
import { cn } from "@/lib/utils";
import { isUserOnline } from "@/features/presence";

export const ProfilePage = () => {
  const user = useAppSelector((state) => state.auth.user);
  const online = isUserOnline(user);

  return (
    <div className="flex flex-col items-center gap-5 py-2">
      <Avatar
        src={user?.photo}
        name={user?.name}
        online={online}
        size="xl"
      />

      <div className="text-center">
        <h2 className="text-lg font-semibold tracking-tight">
          {user?.name || "You"}
        </h2>
        <p className="mt-1 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <span
            className={cn(
              "size-1.5 rounded-full",
              online ? "bg-success" : "bg-faint"
            )}
            aria-hidden
          />
          {online ? "Online" : "Offline"}
        </p>
      </div>

      <div className="w-full space-y-2">
        <div className="flex items-center gap-3 rounded-xl border border-border-soft bg-surface px-3.5 py-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent">
            <Mail size={16} strokeWidth={1.8} />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] tracking-wide text-faint uppercase">
              Email
            </p>
            <p className="truncate text-sm">{user?.email || "—"}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-border-soft bg-surface px-3.5 py-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent">
            <Quote size={16} strokeWidth={1.8} />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] tracking-wide text-faint uppercase">
              Bio
            </p>
            <p className="truncate text-sm">
              {user?.bio || "No bio yet"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
