import { useEffect, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import type * as DialogPrimitive from '@radix-ui/react-dialog';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import type { z } from 'zod';

import { AppError } from '@documenso/lib/errors/app-error';
import { trpc } from '@documenso/trpc/react';
import { ZCreateAdminOrganisationRequestSchema } from '@documenso/trpc/server/admin-router/create-admin-organisation.types';
import { Alert, AlertDescription } from '@documenso/ui/primitives/alert';
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

export type OrganisationCreateDialogProps = {
  trigger?: React.ReactNode;
  ownerUserId: number;
} & Omit<DialogPrimitive.DialogProps, 'children'>;

const ZCreateAdminOrganisationFormSchema = ZCreateAdminOrganisationRequestSchema.shape.data.pick({
  name: true,
});

type TCreateOrganisationFormSchema = z.infer<typeof ZCreateAdminOrganisationFormSchema>;

export const AdminOrganisationCreateDialog = ({
  trigger,
  ownerUserId,
  ...props
}: OrganisationCreateDialogProps) => {
  const { toast } = useToast();

  const [open, setOpen] = useState(false);

  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(ZCreateAdminOrganisationFormSchema),
    defaultValues: {
      name: '',
    },
  });

  const { mutateAsync: createOrganisation } = trpc.admin.organisation.create.useMutation();

  const onFormSubmit = async ({ name }: TCreateOrganisationFormSchema) => {
    try {
      const { organisationId } = await createOrganisation({
        ownerUserId,
        data: {
          name,
        },
      });

      await navigate(`/admin/organisations/${organisationId}`);

      setOpen(false);

      toast({
        title: "Success",
        description: "Organisation created",
        duration: 5000,
      });
    } catch (err) {
      const error = AppError.parseError(err);

      console.error(error);

      toast({
        title: "An unknown error occurred",
        description: "We encountered an unknown error while attempting to create a organisation. Please try again later.",
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    form.reset();
  }, [open, form]);

  return (
    <Dialog
      {...props}
      open={open}
      onOpenChange={(value) => !form.formState.isSubmitting && setOpen(value)}
    >
      <DialogTrigger onClick={(e) => e.stopPropagation()} asChild={true}>
        {trigger ?? (
          <Button className="flex-shrink-0" variant="secondary">
            Create organisation
          </Button>
        )}
      </DialogTrigger>

      <DialogContent position="center">
        <DialogHeader>
          <DialogTitle>
            Create organisation
          </DialogTitle>

          <DialogDescription>
            Create an organisation for this user
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
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>
                      Organisation Name
                    </FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Alert variant="neutral">
                <AlertDescription className="mt-0">
                  
                    You will need to configure any claims or subscription after creating this
                    organisation
                  
                </AlertDescription>
              </Alert>

              {/* <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Default claim ID
                    </FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      Leave blank to use the default free claim
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}

              <DialogFooter>
                <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                  Cancel
                </Button>

                <Button
                  type="submit"
                  data-testid="dialog-create-organisation-button"
                  loading={form.formState.isSubmitting}
                >
                  Create
                </Button>
              </DialogFooter>
            </fieldset>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
