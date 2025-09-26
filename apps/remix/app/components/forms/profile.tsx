import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useSession } from '@documenso/lib/client-only/providers/session';
import { trpc } from '@documenso/trpc/react';
import { cn } from '@documenso/ui/lib/utils';
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
import { Label } from '@documenso/ui/primitives/label';
import { SignaturePadDialog } from '@documenso/ui/primitives/signature-pad/signature-pad-dialog';
import { useToast } from '@documenso/ui/primitives/use-toast';

export const ZProfileFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "Please enter a valid name.".id }),
  signature: z.string().min(1, { message: "Signature Pad cannot be empty.".id }),
});

export const ZTwoFactorAuthTokenSchema = z.object({
  token: z.string(),
});

export type TTwoFactorAuthTokenSchema = z.infer<typeof ZTwoFactorAuthTokenSchema>;
export type TProfileFormSchema = z.infer<typeof ZProfileFormSchema>;

export type ProfileFormProps = {
  className?: string;
};

export const ProfileForm = ({ className }: ProfileFormProps) => {
  const { toast } = useToast();
  const { user, refreshSession } = useSession();

  const form = useForm<TProfileFormSchema>({
    values: {
      name: user.name ?? '',
      signature: user.signature || '',
    },
    resolver: zodResolver(ZProfileFormSchema),
  });

  const isSubmitting = form.formState.isSubmitting;

  const { mutateAsync: updateProfile } = trpc.profile.updateProfile.useMutation();

  const onFormSubmit = async ({ name, signature }: TProfileFormSchema) => {
    try {
      await updateProfile({
        name,
        signature,
      });

      await refreshSession();

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
        duration: 5000,
      });
    } catch (err) {
      toast({
        title: "An unknown error occurred",
        description: 
          "We encountered an unknown error while attempting update your profile. Please try again later.",
        ,
        variant: 'destructive',
      });
    }
  };

  return (
    <Form {...form}>
      <form
        className={cn('flex w-full flex-col gap-y-4', className)}
        onSubmit={form.handleSubmit(onFormSubmit)}
      >
        <fieldset className="flex w-full flex-col gap-y-4" disabled={isSubmitting}>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Full Name
                </FormLabel>
                <FormControl>
                  <Input type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div>
            <Label htmlFor="email" className="text-muted-foreground">
              Email
            </Label>
            <Input id="email" type="email" className="bg-muted mt-2" value={user.email} disabled />
          </div>

          <FormField
            control={form.control}
            name="signature"
            render={({ field: { onChange, value } }) => (
              <FormItem>
                <FormLabel>
                  Signature
                </FormLabel>
                <FormControl>
                  <SignaturePadDialog
                    disabled={isSubmitting}
                    value={value}
                    onChange={(v) => onChange(v ?? '')}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </fieldset>

        <Button type="submit" loading={isSubmitting} className="self-end">
          Update profile
        </Button>
      </form>
    </Form>
  );
};
