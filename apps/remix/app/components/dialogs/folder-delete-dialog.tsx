import { useEffect } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import type * as DialogPrimitive from '@radix-ui/react-dialog';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { AppError, AppErrorCode } from '@documenso/lib/errors/app-error';
import { trpc } from '@documenso/trpc/react';
import type { TFolderWithSubfolders } from '@documenso/trpc/server/folder-router/schema';
import { Alert, AlertDescription } from '@documenso/ui/primitives/alert';
import { Button } from '@documenso/ui/primitives/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@documenso/ui/primitives/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@documenso/ui/primitives/form/form';
import { Input } from '@documenso/ui/primitives/input';
import { useToast } from '@documenso/ui/primitives/use-toast';

export type FolderDeleteDialogProps = {
  folder: TFolderWithSubfolders;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
} & Omit<DialogPrimitive.DialogProps, 'children'>;

export const FolderDeleteDialog = ({ folder, isOpen, onOpenChange }: FolderDeleteDialogProps) => {
  const { toast } = useToast();
  const { mutateAsync: deleteFolder } = trpc.folder.deleteFolder.useMutation();

  const deleteMessage = "delete ${folder.name}";

  const ZDeleteFolderFormSchema = z.object({
    confirmText: z.literal(deleteMessage, {
      errorMap: () => ({ message: "You must type '${deleteMessage}' to confirm" }),
    }),
  });

  type TDeleteFolderFormSchema = z.infer<typeof ZDeleteFolderFormSchema>;

  const form = useForm<TDeleteFolderFormSchema>({
    resolver: zodResolver(ZDeleteFolderFormSchema),
    defaultValues: {
      confirmText: '',
    },
  });

  const onFormSubmit = async () => {
    try {
      await deleteFolder({
        id: folder.id,
      });

      onOpenChange(false);

      toast({
        title: "Folder deleted successfully",
      });
    } catch (err) {
      const error = AppError.parseError(err);

      if (error.code === AppErrorCode.NOT_FOUND) {
        toast({
          title: "Folder not found",
          description: "The folder you are trying to delete does not exist.",
          variant: 'destructive',
        });

        return;
      }

      toast({
        title: "Failed to delete folder",
        description: "An unknown error occurred while deleting the folder.",
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    if (!isOpen) {
      form.reset();
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Delete Folder
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this folder?
          </DialogDescription>
        </DialogHeader>

        {(folder._count.documents > 0 ||
          folder._count.templates > 0 ||
          folder._count.subfolders > 0) && (
          <Alert variant="destructive">
            <AlertDescription>
              
                This folder contains multiple items. Deleting it will remove all subfolders and move
                all nested documents and templates to the root folder.
              
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onFormSubmit)}>
            <fieldset disabled={form.formState.isSubmitting} className="space-y-4">
              <FormField
                control={form.control}
                name="confirmText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      
                        Confirm by typing:{' '}
                        <span className="font-sm text-destructive font-semibold">
                          {deleteMessage}
                        </span>
                      
                    </FormLabel>
                    <FormControl>
                      <Input placeholder={deleteMessage} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  type="submit"
                  disabled={!form.formState.isValid}
                  loading={form.formState.isSubmitting}
                >
                  Delete
                </Button>
              </DialogFooter>
            </fieldset>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
