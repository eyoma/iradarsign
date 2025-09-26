import { useState } from 'react';

import { authClient } from '@documenso/auth/client';
import { useSession } from '@documenso/lib/client-only/providers/session';
import { trpc } from '@documenso/trpc/react';
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
import { Label } from '@documenso/ui/primitives/label';
import { useToast } from '@documenso/ui/primitives/use-toast';

export type AccountDeleteDialogProps = {
  className?: string;
};

export const AccountDeleteDialog = ({ className }: AccountDeleteDialogProps) => {
  const { user } = useSession();

  const { toast } = useToast();

  const hasTwoFactorAuthentication = user.twoFactorEnabled;

  const [enteredEmail, setEnteredEmail] = useState<string>('');

  const { mutateAsync: deleteAccount, isPending: isDeletingAccount } =
    trpc.profile.deleteAccount.useMutation();

  const onDeleteAccount = async () => {
    try {
      await deleteAccount();

      toast({
        title: "Account deleted",
        description: "Your account has been deleted successfully.",
        duration: 5000,
      });

      return await authClient.signOut();
    } catch (err) {
      toast({
        title: "An unknown error occurred",
        variant: 'destructive',
        description: 
          "We encountered an unknown error while attempting to delete your account. Please try again later.",
        ,
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
          <AlertTitle>
            Delete Account
          </AlertTitle>
          <AlertDescription className="mr-2">
            
              Delete your account and all its contents, including completed documents. This action
              is irreversible and will cancel your subscription, so proceed with caution.
            
          </AlertDescription>
        </div>

        <div className="flex-shrink-0">
          <Dialog onOpenChange={() => setEnteredEmail('')}>
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

                {hasTwoFactorAuthentication && (
                  <Alert variant="destructive">
                    <AlertDescription className="selection:bg-red-100">
                      Disable Two Factor Authentication before deleting your account.
                    </AlertDescription>
                  </Alert>
                )}

                <DialogDescription>
                  
                    iRadar will delete <span className="font-semibold">all of your documents</span>,
                    along with all of your completed documents, signatures, and all other resources
                    belonging to your Account.
                  
                </DialogDescription>
              </DialogHeader>

              {!hasTwoFactorAuthentication && (
                <div>
                  <Label>
                    
                      Please type{' '}
                      <span className="text-muted-foreground font-semibold">{user.email}</span> to
                      confirm.
                    
                  </Label>

                  <Input
                    type="text"
                    className="mt-2"
                    aria-label="Confirm Email"
                    value={enteredEmail}
                    onChange={(e) => setEnteredEmail(e.target.value)}
                  />
                </div>
              )}
              <DialogFooter>
                <Button
                  onClick={onDeleteAccount}
                  loading={isDeletingAccount}
                  variant="destructive"
                  disabled={hasTwoFactorAuthentication || enteredEmail !== user.email}
                >
                  {isDeletingAccount ? "Deleting account..." : "Confirm Deletion"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </Alert>
    </div>
  );
};
