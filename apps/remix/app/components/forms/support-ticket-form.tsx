import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { trpc } from '@documenso/trpc/react';
import { Button } from '@documenso/ui/primitives/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@documenso/ui/primitives/form/form';
import { Input } from '@documenso/ui/primitives/input';
import { Textarea } from '@documenso/ui/primitives/textarea';
import { useToast } from '@documenso/ui/primitives/use-toast';

const ZSupportTicketSchema = z.object({
  subject: z.string().min(3, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type TSupportTicket = z.infer<typeof ZSupportTicketSchema>;

export type SupportTicketFormProps = {
  organisationId: string;
  teamId?: string | null;
  onSuccess?: () => void;
  onClose?: () => void;
};

export const SupportTicketForm = ({
  organisationId,
  teamId,
  onSuccess,
  onClose,
}: SupportTicketFormProps) => {
  const { toast } = useToast();

  const { mutateAsync: submitSupportTicket, isPending } =
    trpc.profile.submitSupportTicket.useMutation();

  const form = useForm<TSupportTicket>({
    resolver: zodResolver(ZSupportTicketSchema),
    defaultValues: {
      subject: '',
      message: '',
    },
  });

  const isLoading = form.formState.isLoading || isPending;

  const onSubmit = async (data: TSupportTicket) => {
    const { subject, message } = data;

    try {
      await submitSupportTicket({
        subject,
        message,
        organisationId,
        teamId,
      });

      toast({
        title: "Support ticket created",
        description: "Your support request has been submitted. We'll get back to you soon!",
      });

      if (onSuccess) {
        onSuccess();
      }

      form.reset();
    } catch (err) {
      toast({
        title: "Failed to create support ticket",
        description: "An error occurred. Please try again later.",
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <fieldset disabled={isLoading} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>
                    Subject
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>
                    Message
                  </FormLabel>
                  <FormControl>
                    <Textarea rows={5} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="mt-2 flex flex-row gap-2">
              <Button type="submit" size="sm" loading={isLoading}>
                Submit
              </Button>
              {onClose && (
                <Button variant="outline" size="sm" type="button" onClick={onClose}>
                  Close
                </Button>
              )}
            </div>
          </fieldset>
        </form>
      </Form>
    </>
  );
};
