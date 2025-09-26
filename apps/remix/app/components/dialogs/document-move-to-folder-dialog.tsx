import { useEffect, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import type * as DialogPrimitive from '@radix-ui/react-dialog';
import { FolderIcon, HomeIcon, Loader2, Search } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { z } from 'zod';

import { AppError, AppErrorCode } from '@documenso/lib/errors/app-error';
import { FolderType } from '@documenso/lib/types/folder-type';
import { formatDocumentsPath } from '@documenso/lib/utils/teams';
import { trpc } from '@documenso/trpc/react';
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

import { useCurrentTeam } from '~/providers/team';

export type DocumentMoveToFolderDialogProps = {
  documentId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentFolderId?: string;
} & Omit<DialogPrimitive.DialogProps, 'children'>;

const ZMoveDocumentFormSchema = z.object({
  folderId: z.string().nullable().optional(),
});

type TMoveDocumentFormSchema = z.infer<typeof ZMoveDocumentFormSchema>;

export const DocumentMoveToFolderDialog = ({
  documentId,
  open,
  onOpenChange,
  currentFolderId,
  ...props
}: DocumentMoveToFolderDialogProps) => {
  const { toast } = useToast();

  const navigate = useNavigate();
  const team = useCurrentTeam();

  const [searchTerm, setSearchTerm] = useState('');

  const form = useForm<TMoveDocumentFormSchema>({
    resolver: zodResolver(ZMoveDocumentFormSchema),
    defaultValues: {
      folderId: currentFolderId,
    },
  });

  const { data: folders, isLoading: isFoldersLoading } = trpc.folder.findFolders.useQuery(
    {
      parentId: currentFolderId,
      type: FolderType.DOCUMENT,
    },
    {
      enabled: open,
    },
  );

  const { mutateAsync: moveDocumentToFolder } = trpc.folder.moveDocumentToFolder.useMutation();

  useEffect(() => {
    if (!open) {
      form.reset();
      setSearchTerm('');
    } else {
      form.reset({ folderId: currentFolderId });
    }
  }, [open, currentFolderId, form]);

  const onSubmit = async (data: TMoveDocumentFormSchema) => {
    try {
      await moveDocumentToFolder({
        documentId,
        folderId: data.folderId ?? null,
      });

      const documentsPath = formatDocumentsPath(team.url);

      if (data.folderId) {
        await navigate(`${documentsPath}/f/${data.folderId}`);
      } else {
        await navigate(documentsPath);
      }

      toast({
        title: "Document moved",
        description: "The document has been moved successfully.",
        variant: 'default',
      });

      onOpenChange(false);
    } catch (err) {
      const error = AppError.parseError(err);

      if (error.code === AppErrorCode.NOT_FOUND) {
        toast({
          title: "Error",
          description: "The folder you are trying to move the document to does not exist.",
          variant: 'destructive',
        });

        return;
      }

      if (error.code === AppErrorCode.UNAUTHORIZED) {
        toast({
          title: "Error",
          description: "You are not allowed to move this document.",
          variant: 'destructive',
        });

        return;
      }

      toast({
        title: "Error",
        description: "An error occurred while moving the document.",
        variant: 'destructive',
      });
    }
  };

  const filteredFolders = folders?.data.filter((folder) =>
    folder.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <Dialog {...props} open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Move Document to Folder
          </DialogTitle>

          <DialogDescription>
            Select a folder to move this document to.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="text-muted-foreground absolute left-2 top-3 h-4 w-4" />
          <Input
            placeholder={"Search folders..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-y-4">
            <FormField
              control={form.control}
              name="folderId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Folder
                  </FormLabel>

                  <FormControl>
                    <div className="max-h-96 space-y-2 overflow-y-auto">
                      {isFoldersLoading ? (
                        <div className="flex h-10 items-center justify-center">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      ) : (
                        <>
                          <Button
                            type="button"
                            variant={field.value === null ? 'default' : 'outline'}
                            className="w-full justify-start"
                            onClick={() => field.onChange(null)}
                            disabled={currentFolderId === null}
                          >
                            <HomeIcon className="mr-2 h-4 w-4" />
                            Home (No Folder)
                          </Button>

                          {filteredFolders?.map((folder) => (
                            <Button
                              key={folder.id}
                              type="button"
                              variant={field.value === folder.id ? 'default' : 'outline'}
                              className="w-full justify-start"
                              onClick={() => field.onChange(folder.id)}
                              disabled={currentFolderId === folder.id}
                            >
                              <FolderIcon className="mr-2 h-4 w-4" />
                              {folder.name}
                            </Button>
                          ))}

                          {searchTerm && filteredFolders?.length === 0 && (
                            <div className="text-muted-foreground px-2 py-2 text-center text-sm">
                              No folders found
                            </div>
                          )}
                        </>
                      )}
                    </div>
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
                type="submit"
                disabled={
                  isFoldersLoading || form.formState.isSubmitting || currentFolderId === null
                }
              >
                Move
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
