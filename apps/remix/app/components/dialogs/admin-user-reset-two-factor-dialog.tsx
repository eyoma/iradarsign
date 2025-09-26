import { useState } from 'react';

import { useRevalidator } from 'react-router';
import { match } from 'ts-pattern';

import { AppError, AppErrorCode } from '@documenso/lib/errors/app-error';
import { trpc } from '@documenso/trpc/react';
import type { TGetUserResponse } from '@documenso/trpc/server/admin-router/get-user.types';
import { Alert, AlertDescription, AlertTitle } from '@documenso/ui/primitives/alert';
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
import { Input } from '@documenso/ui/primitives/input';
import { useToast } from '@documenso/ui/primitives/use-toast';

export type AdminUserResetTwoFactorDialogProps = {
  className?: string;
  user: TGetUserResponse;
};

export const AdminUserResetTwoFactorDialog = ({
  className,
  user,
}: AdminUserResetTwoFactorDialogProps) => {
  const { toast } = useToast();
  const { revalidate } = useRevalidator();
  const [email, setEmail] = useState('');
  const [open, setOpen] = useState(false);

  const { mutateAsync: resetTwoFactor, isPending: isResettingTwoFactor } =
    trpc.admin.user.resetTwoFactor.useMutation();

  const onResetTwoFactor = async () => {
    try {
      await resetTwoFactor({
        userId: user.id,
      });

      toast({
        title: "2FA Rese",
        description: msg"The user's two factor authentication has been reset successfully.",
        duration: 5000,
      });

      await revalidate();
      setOpen(false);
    } catch (err) {
      const error = AppError.parseError(err);

      const errorMessage = match(error.code)
        .with(AppErrorCode.NOT_FOUND, () => "User not found.")
        .with(
          AppErrorCode.UNAUTHORIZED,
          () => "You are not authorized to reset two factor authentcation for this user.",
        )
        .otherwise(
          () => "An error occurred while resetting two factor authentication for the user.",
        );

      toast({
        title: "Error",
        description: errorMessage,
        variant: 'destructive',
        duration: 7500,
      });
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);

    if (!newOpen) {
      setEmail('');
    }
  };

  return (
    <div className={className}>
      <Alert
        className="flex flex-col items-center justify-between gap-4 p-6 md:flex-row"
        variant="neutral"
      >
        <div>
          <AlertTitle>Reset Two Factor Authentication</AlertTitle>
          <AlertDescription className="mr-2">
            
              Reset the users two factor authentication. This action is irreversible and will
              disable two factor authentication for the user.
            
          </AlertDescription>
        </div>

        <div className="flex-shrink-0">
          <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <Button variant="destructive">
                Reset 2FA
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader className="space-y-4">
                <DialogTitle>
                  Reset Two Factor Authentication
                </DialogTitle>
              </DialogHeader>

              <Alert variant="destructive">
                <AlertDescription className="selection:bg-red-100">
                  
                    This action is irreversible. Please ensure you have informed the user before
                    proceeding.
                  
                </AlertDescription>
              </Alert>

              <div>
                <DialogDescription>
                  
                    To confirm, please enter the accounts email address <br />({user.email}).
                  
                </DialogDescription>

                <Input
                  className="mt-2"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <DialogFooter>
                <Button
                  variant="destructive"
                  disabled={email !== user.email}
                  onClick={onResetTwoFactor}
                  loading={isResettingTwoFactor}
                >
                  Reset 2FA
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </Alert>
    </div>
  );
};
