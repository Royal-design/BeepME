import { cn } from "@/lib/utils";

interface UserSkeletonProps {
  className?: string;
}

export function UserSkeleton({ className }: UserSkeletonProps) {
  return (
    <div className={cn("flex items-center gap-3 py-2", className)}>
      <span className="skeleton size-11 shrink-0 rounded-full" />
      <div className="flex flex-1 flex-col gap-2">
        <span className="skeleton h-3 w-24 rounded-full" />
        <span className="skeleton h-2.5 w-40 rounded-full" />
      </div>
    </div>
  );
}
