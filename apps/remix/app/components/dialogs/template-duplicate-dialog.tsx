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

type TemplateDuplicateDialogProps = {
  id: number;
  open: boolean;
  onOpenChange: (_open: boolean) => void;
};

export const TemplateDuplicateDialog = ({
  id,
  open,
  onOpenChange,
}: TemplateDuplicateDialogProps) => {
  const { toast } = useToast();

  const { mutateAsync: duplicateTemplate, isPending } =
    trpcReact.template.duplicateTemplate.useMutation({
      onSuccess: () => {
        toast({
          title: "Template duplicated",
          description: "Your template has been duplicated successfully.",
          duration: 5000,
        });

        onOpenChange(false);
      },
      onError: () => {
        toast({
          title: "Error",
          description: "An error occurred while duplicating template.",
          variant: 'destructive',
        });
      },
    });

  return (
    <Dialog open={open} onOpenChange={(value) => !isPending && onOpenChange(value)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Do you want to duplicate this template?
          </DialogTitle>

          <DialogDescription className="pt-2">
            Your template will be duplicated.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            type="button"
            disabled={isPending}
            variant="secondary"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>

          <Button
            type="button"
            loading={isPending}
            onClick={async () =>
              duplicateTemplate({
                templateId: id,
              })
            }
          >
            Duplicate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
