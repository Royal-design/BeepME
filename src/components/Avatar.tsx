import { cn } from "@/lib/utils";
import { initials } from "@/lib/utils";
import avatarFallback from "@/assets/user-avatar.jpg";

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  online?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = {
  sm: "size-8 text-[11px]",
  md: "size-10 text-xs",
  lg: "size-12 text-sm",
  xl: "size-20 text-lg"
} as const;

const dotMap = {
  sm: "size-2 border-[1.5px]",
  md: "size-2.5 border-2",
  lg: "size-3 border-2",
  xl: "size-4 border-[3px]"
} as const;

export function Avatar({ src, name, online, size = "md", className }: AvatarProps) {
  const hasImage = Boolean(src);
  return (
    <span
      className={cn("relative inline-flex shrink-0", className)}
      aria-hidden={hasImage ? undefined : true}
    >
      {hasImage ? (
        <img
          src={src!}
          alt=""
          className={cn(
            "size-full rounded-full object-cover ring-1 ring-border",
            sizeMap[size]
          )}
        />
      ) : (
        <span
          className={cn(
            "flex size-full items-center justify-center rounded-full bg-accent-soft font-semibold tracking-wide text-accent ring-1 ring-border",
            sizeMap[size]
          )}
        >
          {initials(name)}
        </span>
      )}
      {online && (
        <span
          className={cn(
            "absolute right-0 bottom-0 rounded-full bg-success ring-background",
            dotMap[size]
          )}
          aria-label="Online"
        />
      )}
    </span>
  );
}

export { avatarFallback };
