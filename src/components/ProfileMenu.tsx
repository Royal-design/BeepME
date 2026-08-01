import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { logoutUser } from "@/redux/slice/authSlice";
import { useAppDispatch } from "@/redux/store";
import { LogOut, Pencil, User as UserIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { EditProfileDialog } from "./EditProfileDialog";
import { ProfileDialog } from "./ProfileDialog";
import { Avatar } from "./Avatar";
import { useAppSelector } from "@/redux/store";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ProfileMenuProps {
  trigger?: React.ReactElement;
  align?: "start" | "center" | "end";
}

export const ProfileMenu = ({ trigger, align = "end" }: ProfileMenuProps) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isConfirmSignOutOpen, setIsConfirmSignOutOpen] = useState(false);
  const [loadingSignOut, setLoadingSignOut] = useState(false);
  const navigate = useNavigate();

  const signOut = async () => {
    setLoadingSignOut(true);
    const response = await dispatch(logoutUser());
    setLoadingSignOut(false);
    if (response.success) {
      setIsConfirmSignOutOpen(false);
      toast.success("Signed out");
      navigate("/login");
    } else {
      toast.error(response.message || "Logout failed");
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild className="cursor-pointer outline-none">
          {trigger ?? (
            <Avatar src={user?.photo} name={user?.name} size="md" className="cursor-pointer" />
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align={align}
          className="w-60 bg-surface-raised text-popover-foreground shadow-lg"
        >
          <DropdownMenuLabel className="flex flex-col gap-0.5">
            <span className="text-sm font-medium">{user?.name}</span>
            <span className="text-xs font-normal text-muted-foreground">
              {user?.email}
            </span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-border-soft" />
          <DropdownMenuItem
            onClick={() => setIsProfileOpen(true)}
            className="cursor-pointer focus:bg-surface-hover"
          >
            <UserIcon />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer focus:bg-surface-hover"
            onClick={() => setIsEditDialogOpen(true)}
          >
            <Pencil />
            <span>Edit profile</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-border-soft" />
          <DropdownMenuItem
            variant="destructive"
            className="cursor-pointer focus:bg-destructive/10"
            onClick={() => setIsConfirmSignOutOpen(true)}
          >
            <LogOut />
            <span>Sign out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog
        open={isConfirmSignOutOpen}
        onOpenChange={setIsConfirmSignOutOpen}
      >
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
              onClick={() => setIsConfirmSignOutOpen(false)}
              disabled={loadingSignOut}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={signOut}
              disabled={loadingSignOut}
            >
              <LogOut />
              {loadingSignOut ? "Signing out…" : "Sign out"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <EditProfileDialog
        isEditDialogOpen={isEditDialogOpen}
        setIsEditDialogOpen={setIsEditDialogOpen}
      />
      <ProfileDialog
        isProfileOpen={isProfileOpen}
        setIsProfileOpen={setIsProfileOpen}
      />
    </>
  );
};
