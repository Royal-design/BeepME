import { EditProfilePage } from "@/pages/EditProfilePage";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "./ui/dialog";

interface EditProfileDialogProps {
  isEditDialogOpen: boolean;
  setIsEditDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}
export const EditProfileDialog = ({
  isEditDialogOpen,
  setIsEditDialogOpen
}: EditProfileDialogProps) => {
  return (
    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
      <DialogContent
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
        className="max-w-sm rounded-2xl border-border bg-surface-raised text-popover-foreground"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-lg font-semibold tracking-tight">
            Edit profile
          </DialogTitle>
        </DialogHeader>
        <EditProfilePage setIsEditDialogOpen={setIsEditDialogOpen} />
      </DialogContent>
    </Dialog>
  );
};
