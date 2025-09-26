import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import type { TeamProfile } from '@prisma/client';
import { motion } from 'framer-motion';
import { AnimatePresence } from 'framer-motion';
import { CheckSquareIcon, CopyIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';

import { useCopyToClipboard } from '@documenso/lib/client-only/hooks/use-copy-to-clipboard';
import { useSession } from '@documenso/lib/client-only/providers/session';
import { AppError, AppErrorCode } from '@documenso/lib/errors/app-error';
import { isPersonalLayout } from '@documenso/lib/utils/organisations';
import { formatUserProfilePath } from '@documenso/lib/utils/public-profiles';
import {
  MAX_PROFILE_BIO_LENGTH,
  ZUpdateTeamRequestSchema,
} from '@documenso/trpc/server/team-router/update-team.types';
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
import { Textarea } from '@documenso/ui/primitives/textarea';
import { useToast } from '@documenso/ui/primitives/use-toast';

import { useCurrentTeam } from '~/providers/team';

export const ZPublicProfileFormSchema = ZUpdateTeamRequestSchema.shape.data.pick({
  profileBio: true,
  url: true,
});

export type TPublicProfileFormSchema = z.infer<typeof ZPublicProfileFormSchema>;

export type PublicProfileFormProps = {
  className?: string;
  onProfileUpdate: (data: TPublicProfileFormSchema) => Promise<unknown>;
  profile: TeamProfile;
};
export const PublicProfileForm = ({
  className,
  profile,
  onProfileUpdate,
}: PublicProfileFormProps) => {
  const { toast } = useToast();

  const [, copy] = useCopyToClipboard();

  const [copiedTimeout, setCopiedTimeout] = useState<NodeJS.Timeout | null>(null);

  const { organisations } = useSession();

  const isPersonalLayoutMode = isPersonalLayout(organisations);

  const team = useCurrentTeam();

  const form = useForm<TPublicProfileFormSchema>({
    values: {
      url: team.url,
      profileBio: profile?.bio ?? '',
    },
    resolver: zodResolver(ZPublicProfileFormSchema),
  });

  const isSubmitting = form.formState.isSubmitting;

  const onFormSubmit = async (data: TPublicProfileFormSchema) => {
    try {
      await onProfileUpdate(data);

      toast({
        title: "Success",
        description: "Your public profile has been updated.",
        duration: 5000,
      });

      form.reset({
        url: data.url,
        profileBio: data.profileBio,
      });
    } catch (err) {
      const error = AppError.parseError(err);

      switch (error.code) {
        case AppErrorCode.ALREADY_EXISTS:
        case 'PREMIUM_PROFILE_URL':
        case 'PROFILE_URL_TAKEN':
          form.setError('url', {
            type: 'manual',
            message: error.message,
          });

          break;

        default:
          toast({
            title: "An unknown error occurred",
            description: 
              "We encountered an unknown error while attempting to update your public profile. Please try again later.",
            ,
            variant: 'destructive',
          });
      }
    }
  };

  const onCopy = async () => {
    await copy(formatUserProfilePath(form.getValues('url') ?? '')).then(() => {
      toast({
        title: "Copied to clipboard",
        description: "The profile link has been copied to your clipboard",
      });
    });

    if (copiedTimeout) {
      clearTimeout(copiedTimeout);
    }

    setCopiedTimeout(
      setTimeout(() => {
        setCopiedTimeout(null);
      }, 2000),
    );
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
            name="url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Public profile URL
                </FormLabel>
                <FormControl>
                  <Input {...field} disabled={field.disabled || !isPersonalLayoutMode} />
                </FormControl>

                {!isPersonalLayoutMode && (
                  <p className="text-muted-foreground text-xs">
                    
                      You can update the profile URL by updating the team URL in the general
                      settings page.
                    
                  </p>
                )}

                <div className="h-8">
                  {!form.formState.errors.url && (
                    <div className="text-muted-foreground h-8 text-sm">
                      {field.value ? (
                        <div>
                          <Button
                            type="button"
                            variant="none"
                            className="h-7 rounded bg-neutral-50 pl-2 pr-0.5 font-normal dark:border dark:border-neutral-500 dark:bg-neutral-600"
                            onClick={async () => onCopy()}
                          >
                            <p>
                              {formatUserProfilePath('').replace(/https?:\/\//, '')}
                              <span className="font-semibold">{field.value}</span>
                            </p>

                            <div className="ml-1 flex h-6 w-6 items-center justify-center rounded transition-all hover:bg-neutral-200 hover:active:bg-neutral-300 dark:hover:bg-neutral-500 dark:hover:active:bg-neutral-400">
                              <AnimatePresence mode="wait" initial={false}>
                                <motion.div
                                  key={copiedTimeout ? 'copied' : 'copy'}
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0, transition: { duration: 0.1 } }}
                                  className="absolute"
                                >
                                  {copiedTimeout ? (
                                    <CheckSquareIcon className="h-3.5 w-3.5" />
                                  ) : (
                                    <CopyIcon className="h-3.5 w-3.5" />
                                  )}
                                </motion.div>
                              </AnimatePresence>
                            </div>
                          </Button>
                        </div>
                      ) : (
                        <p>
                          A unique URL to access your profile
                        </p>
                      )}
                    </div>
                  )}

                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="profileBio"
            render={({ field }) => {
              const remaningLength = MAX_PROFILE_BIO_LENGTH - (field.value || '').length;

              return (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder={"Write a description to display on your public profile"}
                    />
                  </FormControl>

                  {!form.formState.errors.profileBio && (
                    <p className="text-muted-foreground text-sm">
                      {remaningLength >= 0 ? (
                        <Plural
                          value={remaningLength}
                          one={# character remaining}
                          other={# characters remaining}
                        />
                      ) : (
                        <Plural
                          value={Math.abs(remaningLength)}
                          one={# character over the limit}
                          other={# characters over the limit}
                        />
                      )}
                    </p>
                  )}

                  <FormMessage />
                </FormItem>
              );
            }}
          />

          <div className="flex flex-row justify-end space-x-4">
            <AnimatePresence>
              {form.formState.isDirty && (
                <motion.div
                  initial={{
                    opacity: 0,
                  }}
                  animate={{
                    opacity: 1,
                  }}
                  exit={{
                    opacity: 0,
                  }}
                >
                  <Button type="button" variant="secondary" onClick={() => form.reset()}>
                    Reset
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              type="submit"
              className="transition-opacity"
              disabled={!form.formState.isDirty}
              loading={form.formState.isSubmitting}
            >
              Update
            </Button>
          </div>
        </fieldset>
      </form>
    </Form>
  );
};
