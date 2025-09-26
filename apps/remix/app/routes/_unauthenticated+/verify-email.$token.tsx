import { useEffect, useState } from 'react';

import { AlertTriangle, CheckCircle2, Loader, XCircle } from 'lucide-react';
import { Link, redirect, useNavigate } from 'react-router';
import { match } from 'ts-pattern';

import { authClient } from '@documenso/auth/client';
import { useOptionalSession } from '@documenso/lib/client-only/providers/session';
import { EMAIL_VERIFICATION_STATE } from '@documenso/lib/constants/email';
import { Button } from '@documenso/ui/primitives/button';
import { useToast } from '@documenso/ui/primitives/use-toast';

import type { Route } from './+types/verify-email.$token';

export const loader = ({ params }: Route.LoaderArgs) => {
  const { token } = params;

  if (!token) {
    throw redirect('/verify-email');
  }

  return {
    token,
  };
};

export default function VerifyEmailPage({ loaderData }: Route.ComponentProps) {
  const { token } = loaderData;

  const { refreshSession } = useOptionalSession();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [state, setState] = useState<keyof typeof EMAIL_VERIFICATION_STATE | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const verifyToken = async () => {
    setIsLoading(true);

    try {
      const response = await authClient.emailPassword.verifyEmail({
        token,
      });

      await refreshSession();

      setState(response.state);
    } catch (err) {
      console.error(err);

      toast({
        title: "Something went wrong",
        description: "We were unable to verify your email at this time.",
      });

      await navigate('/verify-email');
    }

    setIsLoading(false);
  };

  useEffect(() => {
    void verifyToken();
  }, []);

  if (isLoading || state === null) {
    return (
      <div className="relative">
        <Loader className="text-documenso h-8 w-8 animate-spin" />
      </div>
    );
  }

  return match(state)
    .with(EMAIL_VERIFICATION_STATE.NOT_FOUND, () => (
      <div className="w-screen max-w-lg px-4">
        <div className="flex w-full items-start">
          <div className="mr-4 mt-1 hidden md:block">
            <AlertTriangle className="h-10 w-10 text-yellow-500" strokeWidth={2} />
          </div>

          <div>
            <h2 className="text-2xl font-bold md:text-4xl">
              Something went wrong
            </h2>

            <p className="text-muted-foreground mt-4">
              
                We were unable to verify your email. If your email is not verified already, please
                try again.
              
            </p>

            <Button className="mt-4" asChild>
              <Link to="/">
                Go back home
              </Link>
            </Button>
          </div>
        </div>
      </div>
    ))
    .with(EMAIL_VERIFICATION_STATE.EXPIRED, () => (
      <div className="w-screen max-w-lg px-4">
        <div className="flex w-full items-start">
          <div className="mr-4 mt-1 hidden md:block">
            <XCircle className="text-destructive h-10 w-10" strokeWidth={2} />
          </div>

          <div>
            <h2 className="text-2xl font-bold md:text-4xl">
              Your token has expired!
            </h2>

            <p className="text-muted-foreground mt-4">
              
                It seems that the provided token has expired. We've just sent you another token,
                please check your email and try again.
              
            </p>

            <Button className="mt-4" asChild>
              <Link to="/">
                Go back home
              </Link>
            </Button>
          </div>
        </div>
      </div>
    ))
    .with(EMAIL_VERIFICATION_STATE.VERIFIED, () => (
      <div className="w-screen max-w-lg px-4">
        <div className="flex w-full items-start">
          <div className="mr-4 mt-1 hidden md:block">
            <CheckCircle2 className="h-10 w-10 text-green-500" strokeWidth={2} />
          </div>

          <div>
            <h2 className="text-2xl font-bold md:text-4xl">
              Email Confirmed!
            </h2>

            <p className="text-muted-foreground mt-4">
              
                Your email has been successfully confirmed! You can now use all features of iRadar.
              
            </p>

            <Button className="mt-4" asChild>
              <Link to="/">
                Continue
              </Link>
            </Button>
          </div>
        </div>
      </div>
    ))
    .with(EMAIL_VERIFICATION_STATE.ALREADY_VERIFIED, () => (
      <div className="w-screen max-w-lg px-4">
        <div className="flex w-full items-start">
          <div className="mr-4 mt-1 hidden md:block">
            <CheckCircle2 className="h-10 w-10 text-green-500" strokeWidth={2} />
          </div>

          <div>
            <h2 className="text-2xl font-bold md:text-4xl">
              Email already confirmed
            </h2>

            <p className="text-muted-foreground mt-4">
              
                Your email has already been confirmed. You can now use all features of iRadar.
              
            </p>

            <Button className="mt-4" asChild>
              <Link to="/">
                Go back home
              </Link>
            </Button>
          </div>
        </div>
      </div>
    ))
    .exhaustive();
}
