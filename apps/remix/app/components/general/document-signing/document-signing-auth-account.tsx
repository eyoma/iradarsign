import { useState } from 'react';

import { RecipientRole } from '@prisma/client';

import { authClient } from '@documenso/auth/client';
import { Alert, AlertDescription } from '@documenso/ui/primitives/alert';
import { Button } from '@documenso/ui/primitives/button';
import { DialogFooter } from '@documenso/ui/primitives/dialog';
import { useToast } from '@documenso/ui/primitives/use-toast';

import { useRequiredDocumentSigningAuthContext } from './document-signing-auth-provider';

export type DocumentSigningAuthAccountProps = {
  actionTarget?: 'FIELD' | 'DOCUMENT';
  actionVerb?: string;
  onOpenChange: (value: boolean) => void;
};

export const DocumentSigningAuthAccount = ({
  actionTarget = 'FIELD',
  actionVerb = 'sign',
  onOpenChange,
}: DocumentSigningAuthAccountProps) => {
  const { recipient } = useRequiredDocumentSigningAuthContext();

  const { toast } = useToast();

  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleChangeAccount = async (email: string) => {
    try {
      setIsSigningOut(true);

      await authClient.signOut({
        redirectPath: `/signin#email=${email}`,
      });
    } catch {
      setIsSigningOut(false);

      toast({
        title: "Something went wrong",
        description: "We were unable to log you out at this time.",
        duration: 10000,
        variant: 'destructive',
      });
    }
  };

  return (
    <fieldset disabled={isSigningOut} className="space-y-4">
      <Alert variant="warning">
        <AlertDescription>
          {actionTarget === 'DOCUMENT' && recipient.role === RecipientRole.VIEWER ? (
            <span>
              
                To mark this document as viewed, you need to be logged in as{' '}
                <strong>{recipient.email}</strong>
              
            </span>
          ) : (
            <span>
              {/* Todo: Translate */}
              To {actionVerb.toLowerCase()} this {actionTarget.toLowerCase()}, you need to be logged
              in as <strong>{recipient.email}</strong>
            </span>
          )}
        </AlertDescription>
      </Alert>

      <DialogFooter>
        <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>

        <Button onClick={async () => handleChangeAccount(recipient.email)} loading={isSigningOut}>
          Login
        </Button>
      </DialogFooter>
    </fieldset>
  );
};
