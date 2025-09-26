import { useState } from 'react';

import { authClient } from '@documenso/auth/client';
import { Button } from '@documenso/ui/primitives/button';
import { useToast } from '@documenso/ui/primitives/use-toast';

export type DocumentSigningAuthPageViewProps = {
  email: string;
  emailHasAccount?: boolean;
};

export const DocumentSigningAuthPageView = ({
  email,
  emailHasAccount,
}: DocumentSigningAuthPageViewProps) => {
  const { toast } = useToast();

  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleChangeAccount = async (email: string) => {
    try {
      setIsSigningOut(true);

      await authClient.signOut({
        redirectPath: emailHasAccount ? `/signin#email=${email}` : `/signup#email=${email}`,
      });
    } catch {
      toast({
        title: "Something went wrong",
        description: "We were unable to log you out at this time.",
        duration: 10000,
        variant: 'destructive',
      });
    }

    setIsSigningOut(false);
  };

  return (
    <div className="mx-auto flex h-[70vh] w-full max-w-md flex-col items-center justify-center">
      <div>
        <h1 className="text-3xl font-semibold">
          Authentication required
        </h1>

        <p className="text-muted-foreground mt-2 text-sm">
          
            You need to be logged in as <strong>{email}</strong> to view this page.
          
        </p>

        <Button
          className="mt-4 w-full"
          type="submit"
          onClick={async () => handleChangeAccount(email)}
          loading={isSigningOut}
        >
          {emailHasAccount ? Login : Sign up}
        </Button>
      </div>
    </div>
  );
};
