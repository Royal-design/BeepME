import { logoutUser } from "@/redux/slice/authSlice";
import { useAppDispatch } from "@/redux/store";
import { LogOut } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface SignOutButtonProps {
  className?: string;
}

export const SignOutButton = ({ className }: SignOutButtonProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    const response = await dispatch(logoutUser());
    setLoading(false);

    if (response.success) {
      setIsConfirmOpen(false);
      toast.success("Signed out");
      navigate("/login");
    } else {
      toast.error(response.message || "Logout failed");
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsConfirmOpen(true)}
        aria-label="Sign out"
        className={`grid size-9 shrink-0 cursor-pointer place-items-center rounded-lg text-faint transition-colors duration-200 hover:bg-surface-hover hover:text-destructive active:scale-95 ${className ?? ""}`}
      >
        <LogOut size={18} strokeWidth={2} />
      </button>

      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Sign out?</DialogTitle>
            <DialogDescription>
              You&apos;ll need to log in again to continue chatting.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsConfirmOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleSignOut}
              disabled={loading}
            >
              <LogOut />
              {loading ? "Signing out…" : "Sign out"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
