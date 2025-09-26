import { useState } from 'react';

import { useNavigate } from 'react-router';
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

export type AdminUserDeleteDialogProps = {
  className?: string;
  user: TGetUserResponse;
};

export const AdminUserDeleteDialog = ({ className, user }: AdminUserDeleteDialogProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  const { mutateAsync: deleteUser, isPending: isDeletingUser } =
    trpc.admin.user.delete.useMutation();

  const onDeleteAccount = async () => {
    try {
      await deleteUser({
        id: user.id,
      });

      await navigate('/admin/users');

      toast({
        title: "Account deleted",
        description: "The account has been deleted successfully.",
        duration: 5000,
      });
    } catch (err) {
      const error = AppError.parseError(err);

      const errorMessage = match(error.code)
        .with(AppErrorCode.NOT_FOUND, () => "User not found.")
        .with(AppErrorCode.UNAUTHORIZED, () => "You are not authorized to delete this user.")
        .otherwise(() => "An error occurred while deleting the user.");

      toast({
        title: "Error",
        description: errorMessage,
        variant: 'destructive',
        duration: 7500,
      });
    }
  };

  return (
    <div className={className}>
      <Alert
        className="flex flex-col items-center justify-between gap-4 p-6 md:flex-row"
        variant="neutral"
      >
        <div>
          <AlertTitle>Delete Account</AlertTitle>
          <AlertDescription className="mr-2">
            
              Delete the users account and all its contents. This action is irreversible and will
              cancel their subscription, so proceed with caution.
            
          </AlertDescription>
        </div>

        <div className="flex-shrink-0">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive">
                Delete Account
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader className="space-y-4">
                <DialogTitle>
                  Delete Account
                </DialogTitle>

                <Alert variant="destructive">
                  <AlertDescription className="selection:bg-red-100">
                    This action is not reversible. Please be certain.
                  </AlertDescription>
                </Alert>
              </DialogHeader>

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
                  onClick={onDeleteAccount}
                  loading={isDeletingUser}
                  variant="destructive"
                  disabled={email !== user.email}
                >
                  Delete account
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </Alert>
    </div>
  );
};
