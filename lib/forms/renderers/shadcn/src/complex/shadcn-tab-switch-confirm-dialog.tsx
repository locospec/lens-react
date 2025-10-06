import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@lens2/shadcn/components/ui/alert-dialog";

export interface ShadcnTabSwitchConfirmDialogProps {
  open: boolean;
  handleClose: () => void;
  confirm: () => void;
  cancel: () => void;
  id: string;
}

export const ShadcnTabSwitchConfirmDialog = ({
  open,
  handleClose,
  confirm,
  cancel,
  id,
}: ShadcnTabSwitchConfirmDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={handleClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Clear form?</AlertDialogTitle>
          <AlertDialogDescription>
            Your data will be cleared if you navigate away from this tab. Do you
            want to proceed?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={cancel}>No</AlertDialogCancel>
          <AlertDialogAction
            onClick={confirm}
            autoFocus
            id={`${id}-confirm-yes`}
          >
            Yes
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
