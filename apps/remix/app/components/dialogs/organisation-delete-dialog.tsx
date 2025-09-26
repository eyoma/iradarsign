import { useEffect, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { z } from 'zod';

import { useCurrentOrganisation } from '@documenso/lib/client-only/providers/organisation';
import { useSession } from '@documenso/lib/client-only/providers/session';
import { AppError } from '@documenso/lib/errors/app-error';
import { trpc } from '@documenso/trpc/react';
import { Button } from '@documenso/ui/primitives/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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

export type OrganisationDeleteDialogProps = {
  trigger?: React.ReactNode;
};

export const OrganisationDeleteDialog = ({ trigger }: OrganisationDeleteDialogProps) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const { toast } = useToast();
  const { refreshSession } = useSession();

  const organisation = useCurrentOrganisation();

  const deleteMessage = "delete ${organisation.name}";

  const ZDeleteOrganisationFormSchema = z.object({
    organisationName: z.literal(deleteMessage, {
      errorMap: () => ({ message: "You must enter '${deleteMessage}' to proceed" }),
    }),
  });

  const form = useForm({
    resolver: zodResolver(ZDeleteOrganisationFormSchema),
    defaultValues: {
      organisationName: '',
    },
  });

  const { mutateAsync: deleteOrganisation } = trpc.organisation.delete.useMutation();

  const onFormSubmit = async () => {
    try {
      await deleteOrganisation({ organisationId: organisation.id });

      toast({
        title: "Success",
        description: "Your organisation has been successfully deleted.",
        duration: 5000,
      });

      await navigate('/settings/organisations');
      await refreshSession();

      setOpen(false);
    } catch (err) {
      const error = AppError.parseError(err);
      console.error(error);

      toast({
        title: "An unknown error occurred",
        description: 
          "We encountered an unknown error while attempting to delete this organisation. Please try again later.",
        ,
        variant: 'destructive',
        duration: 10000,
      });
    }
  };

  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  return (
    <Dialog open={open} onOpenChange={(value) => !form.formState.isSubmitting && setOpen(value)}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="destructive">
            Delete
          </Button>
        )}
      </DialogTrigger>

      <DialogContent position="center">
        <DialogHeader>
          <DialogTitle>
            Are you sure you wish to delete this organisation?
          </DialogTitle>

          <DialogDescription>
            
              You are about to delete <span className="font-semibold">{organisation.name}</span>.
              All data related to this organisation such as teams, documents, and all other
              resources will be deleted. This action is irreversible.
            
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onFormSubmit)}>
            <fieldset
              className="flex h-full flex-col space-y-4"
              disabled={form.formState.isSubmitting}
            >
              <FormField
                control={form.control}
                name="organisationName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      
                        Confirm by typing <span className="text-destructive">{deleteMessage}</span>
                      
                    </FormLabel>
                    <FormControl>
                      <Input className="bg-background" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                  Cancel
                </Button>

                <Button type="submit" variant="destructive" loading={form.formState.isSubmitting}>
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
