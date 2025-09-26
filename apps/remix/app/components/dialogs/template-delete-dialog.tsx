import { trpc as trpcReact } from '@documenso/trpc/react';
import { Button } from '@documenso/ui/primitives/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@documenso/ui/primitives/dialog';
import { useToast } from '@documenso/ui/primitives/use-toast';

type TemplateDeleteDialogProps = {
  id: number;
  open: boolean;
  onOpenChange: (_open: boolean) => void;
  onDelete?: () => Promise<void> | void;
};

export const TemplateDeleteDialog = ({
  id,
  open,
  onOpenChange,
  onDelete,
}: TemplateDeleteDialogProps) => {
  const { toast } = useToast();

  const { mutateAsync: deleteTemplate, isPending } = trpcReact.template.deleteTemplate.useMutation({
    onSuccess: async () => {
      await onDelete?.();

      toast({
        title: "Template deleted",
        description: "Your template has been successfully deleted.",
        duration: 5000,
      });

      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Something went wrong",
        description: "This template could not be deleted at this time. Please try again.",
        variant: 'destructive',
        duration: 7500,
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={(value) => !isPending && onOpenChange(value)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Do you want to delete this template?
          </DialogTitle>

          <DialogDescription>
            
              Please note that this action is irreversible. Once confirmed, your template will be
              permanently deleted.
            
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            disabled={isPending}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="destructive"
            loading={isPending}
            onClick={async () => deleteTemplate({ templateId: id })}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
