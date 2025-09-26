import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import type { ApiToken } from '@prisma/client';
import { AnimatePresence, motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { match } from 'ts-pattern';
import type { z } from 'zod';

import { useCopyToClipboard } from '@documenso/lib/client-only/hooks/use-copy-to-clipboard';
import { AppError, AppErrorCode } from '@documenso/lib/errors/app-error';
import { trpc } from '@documenso/trpc/react';
import { ZCreateApiTokenRequestSchema } from '@documenso/trpc/server/api-token-router/create-api-token.types';
import { cn } from '@documenso/ui/lib/utils';
import { Button } from '@documenso/ui/primitives/button';
import { Card, CardContent } from '@documenso/ui/primitives/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@documenso/ui/primitives/form/form';
import { Input } from '@documenso/ui/primitives/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@documenso/ui/primitives/select';
import { Switch } from '@documenso/ui/primitives/switch';
import { useToast } from '@documenso/ui/primitives/use-toast';

import { useCurrentTeam } from '~/providers/team';

export const EXPIRATION_DATES = {
  ONE_WEEK: "7 days",
  ONE_MONTH: "1 month",
  THREE_MONTHS: "3 months",
  SIX_MONTHS: "6 months",
  ONE_YEAR: "12 months",
} as const;

const ZCreateTokenFormSchema = ZCreateApiTokenRequestSchema.pick({
  tokenName: true,
  expirationDate: true,
});

type TCreateTokenFormSchema = z.infer<typeof ZCreateTokenFormSchema>;

type NewlyCreatedToken = {
  id: number;
  token: string;
};

export type ApiTokenFormProps = {
  className?: string;
  tokens?: Pick<ApiToken, 'id'>[];
};

export const ApiTokenForm = ({ className, tokens }: ApiTokenFormProps) => {
  const [, copy] = useCopyToClipboard();

  const team = useCurrentTeam();

  const { toast } = useToast();

  const [newlyCreatedToken, setNewlyCreatedToken] = useState<NewlyCreatedToken | null>();
  const [noExpirationDate, setNoExpirationDate] = useState(false);

  const { mutateAsync: createTokenMutation } = trpc.apiToken.create.useMutation({
    onSuccess(data) {
      setNewlyCreatedToken(data);
    },
  });

  const form = useForm<TCreateTokenFormSchema>({
    resolver: zodResolver(ZCreateTokenFormSchema),
    defaultValues: {
      tokenName: '',
      expirationDate: '',
    },
  });

  const copyToken = async (token: string) => {
    try {
      const copied = await copy(token);

      if (!copied) {
        throw new Error('Unable to copy the token');
      }

      toast({
        title: "Token copied to clipboard",
        description: "The token was copied to your clipboard.",
      });
    } catch (error) {
      toast({
        title: "Unable to copy token",
        description: "We were unable to copy the token to your clipboard. Please try again.",
        variant: 'destructive',
      });
    }
  };

  const onSubmit = async ({ tokenName, expirationDate }: TCreateTokenFormSchema) => {
    try {
      await createTokenMutation({
        teamId: team.id,
        tokenName,
        expirationDate: noExpirationDate ? null : expirationDate,
      });

      toast({
        title: "Token created",
        description: "A new token was created successfully.",
        duration: 5000,
      });

      form.reset();
    } catch (err) {
      const error = AppError.parseError(err);

      const errorMessage = match(error.code)
        .with(
          AppErrorCode.UNAUTHORIZED,
          () => "You do not have permission to create a token for this team",
        )
        .otherwise(() => "Something went wrong. Please try again later.");

      toast({
        title: "An error occurred",
        description: errorMessage,
        variant: 'destructive',
        duration: 5000,
      });
    }
  };

  return (
    <div className={cn(className)}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <fieldset
            className="mt-6 flex w-full flex-col gap-4"
            disabled={form.formState.isSubmitting}
          >
            <FormField
              control={form.control}
              name="tokenName"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel className="text-muted-foreground">
                    Token name
                  </FormLabel>

                  <div className="flex items-center gap-x-4">
                    <FormControl className="flex-1">
                      <Input type="text" {...field} />
                    </FormControl>
                  </div>

                  <FormDescription className="text-xs italic">
                    
                      Please enter a meaningful name for your token. This will help you identify it
                      later.
                    
                  </FormDescription>

                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col gap-4 md:flex-row">
              <FormField
                control={form.control}
                name="expirationDate"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel className="text-muted-foreground">
                      Token expiration date
                    </FormLabel>

                    <div className="flex items-center gap-x-4">
                      <FormControl className="flex-1">
                        <Select onValueChange={field.onChange} disabled={noExpirationDate}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder={"Choose..."} />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(EXPIRATION_DATES).map(([key, date]) => (
                              <SelectItem key={key} value={key}>
                                {date}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </div>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <FormLabel className="text-muted-foreground mt-2">
                  Never expire
                </FormLabel>
                <div className="block md:py-1.5">
                  <Switch
                    className="bg-background mt-2"
                    checked={noExpirationDate}
                    onCheckedChange={setNoExpirationDate}
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="hidden md:inline-flex"
              loading={form.formState.isSubmitting}
            >
              Create token
            </Button>

            <div className="md:hidden">
              <Button type="submit" loading={form.formState.isSubmitting}>
                Create token
              </Button>
            </div>
          </fieldset>
        </form>
      </Form>

      <AnimatePresence>
        {newlyCreatedToken &&
          tokens &&
          tokens.find((token) => token.id === newlyCreatedToken.id) && (
            <motion.div
              className="mt-8"
              initial={{ opacity: 0, y: -40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
            >
              <Card gradient>
                <CardContent className="p-4">
                  <p className="text-muted-foreground mt-2 text-sm">
                    
                      Your token was created successfully! Make sure to copy it because you won't be
                      able to see it again!
                    
                  </p>

                  <p className="bg-muted-foreground/10 my-4 rounded-md px-2.5 py-1 font-mono text-sm">
                    {newlyCreatedToken.token}
                  </p>

                  <Button variant="outline" onClick={() => void copyToken(newlyCreatedToken.token)}>
                    Copy token
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
      </AnimatePresence>
    </div>
  );
};
