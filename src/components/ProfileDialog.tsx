import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "./ui/dialog";
import { ProfilePage } from "@/pages/ProfilePage";

interface ProfileDialogProps {
  isProfileOpen: boolean;
  setIsProfileOpen: React.Dispatch<React.SetStateAction<boolean>>;
}
export const ProfileDialog = ({
  isProfileOpen,
  setIsProfileOpen
}: ProfileDialogProps) => {
  return (
    <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
      <DialogContent
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
        className="max-w-sm rounded-2xl border-border bg-surface-raised text-popover-foreground"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-lg font-semibold tracking-tight">
            Profile
          </DialogTitle>
        </DialogHeader>
        <ProfilePage />
      </DialogContent>
    </Dialog>
  );
};
