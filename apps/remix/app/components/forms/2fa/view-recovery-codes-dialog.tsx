import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { match } from 'ts-pattern';
import { z } from 'zod';

import { authClient } from '@documenso/auth/client';
import { downloadFile } from '@documenso/lib/client-only/download-file';
import { AppError } from '@documenso/lib/errors/app-error';
import { Alert, AlertDescription } from '@documenso/ui/primitives/alert';
import { Button } from '@documenso/ui/primitives/button';
import {
  Dialog,
  DialogClose,
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
  FormMessage,
} from '@documenso/ui/primitives/form/form';
import { PinInput, PinInputGroup, PinInputSlot } from '@documenso/ui/primitives/pin-input';

import { RecoveryCodeList } from './recovery-code-list';

export const ZViewRecoveryCodesForm = z.object({
  token: z.string().min(1, { message: 'Token is required' }),
});

export type TViewRecoveryCodesForm = z.infer<typeof ZViewRecoveryCodesForm>;

export const ViewRecoveryCodesDialog = () => {
  const [isOpen, setIsOpen] = useState(false);

  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<TViewRecoveryCodesForm>({
    defaultValues: {
      token: '',
    },
    resolver: zodResolver(ZViewRecoveryCodesForm),
  });

  const onFormSubmit = async ({ token }: TViewRecoveryCodesForm) => {
    setError(null);

    try {
      const data = await authClient.twoFactor.viewRecoveryCodes({
        token,
      });

      setRecoveryCodes(data.backupCodes);
    } catch (err) {
      const error = AppError.parseError(err);

      setError(error.code);
    }
  };

  const downloadRecoveryCodes = () => {
    if (recoveryCodes) {
      const blob = new Blob([recoveryCodes.join('\n')], {
        type: 'text/plain',
      });

      downloadFile({
        filename: 'documenso-2FA-recovery-codes.txt',
        data: blob,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex-shrink-0">
          View Codes
        </Button>
      </DialogTrigger>

      <DialogContent className="w-full max-w-xl md:max-w-xl lg:max-w-xl">
        {recoveryCodes ? (
          <div>
            <DialogHeader className="mb-4">
              <DialogTitle>
                View Recovery Codes
              </DialogTitle>

              <DialogDescription>
                
                  Your recovery codes are listed below. Please store them in a safe place.
                
              </DialogDescription>
            </DialogHeader>

            <RecoveryCodeList recoveryCodes={recoveryCodes} />

            <DialogFooter className="mt-4">
              <DialogClose asChild>
                <Button variant="secondary">
                  Close
                </Button>
              </DialogClose>

              <Button onClick={downloadRecoveryCodes}>
                Download
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onFormSubmit)}>
              <DialogHeader className="mb-4">
                <DialogTitle>
                  View Recovery Codes
                </DialogTitle>

                <DialogDescription>
                  Please provide a token from your authenticator, or a backup code.
                </DialogDescription>
              </DialogHeader>

              <fieldset className="flex flex-col space-y-4" disabled={form.formState.isSubmitting}>
                <FormField
                  name="token"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <PinInput {...field} value={field.value ?? ''} maxLength={6}>
                          {Array(6)
                            .fill(null)
                            .map((_, i) => (
                              <PinInputGroup key={i}>
                                <PinInputSlot index={i} />
                              </PinInputGroup>
                            ))}
                        </PinInput>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      {match(AppError.parseError(error).message)
                        .with('INCORRECT_TWO_FACTOR_CODE', () => (
                          Invalid code. Please try again.
                        ))
                        .otherwise(() => (
                          Something went wrong. Please try again or contact support.
                        ))}
                    </AlertDescription>
                  </Alert>
                )}

                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="secondary">
                      Cancel
                    </Button>
                  </DialogClose>

                  <Button type="submit" loading={form.formState.isSubmitting}>
                    View
                  </Button>
                </DialogFooter>
              </fieldset>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};
