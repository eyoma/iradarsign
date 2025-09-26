import { useState } from 'react';

import { MailsIcon } from 'lucide-react';
import { Link, redirect, useSearchParams } from 'react-router';

import { authClient } from '@documenso/auth/client';
import { getOptionalSession } from '@documenso/auth/server/lib/utils/get-session';
import { AppError, AppErrorCode } from '@documenso/lib/errors/app-error';
import { prisma } from '@documenso/prisma';
import { Button } from '@documenso/ui/primitives/button';
import { Checkbox } from '@documenso/ui/primitives/checkbox';
import { useToast } from '@documenso/ui/primitives/use-toast';

import { GenericErrorLayout } from '~/components/general/generic-error-layout';
import { appMetaTags } from '~/utils/meta';

import type { Route } from './+types/o.$orgUrl.signin';

export function meta() {
  return appMetaTags('Sign In');
}

export function ErrorBoundary() {
  return (
    <GenericErrorLayout
      errorCode={404}
      errorCodeMap={{
        404: {
          heading: "Authentication Portal Not Found",
          subHeading: "404 Not Found",
          message: "The organisation authentication portal does not exist, or is not configured",
        },
      }}
      primaryButton={
        <Button asChild>
          <Link to={`/`}>
            Go back
          </Link>
        </Button>
      }
      secondaryButton={null}
    />
  );
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const { isAuthenticated, user } = await getOptionalSession(request);

  const orgUrl = params.orgUrl;

  const organisation = await prisma.organisation.findFirst({
    where: {
      url: orgUrl,
    },
    select: {
      name: true,
      organisationClaim: true,
      organisationAuthenticationPortal: {
        select: {
          enabled: true,
        },
      },
      members: {
        select: {
          userId: true,
        },
      },
    },
  });

  if (
    !organisation ||
    !organisation.organisationAuthenticationPortal.enabled ||
    !organisation.organisationClaim.flags.authenticationPortal
  ) {
    throw new AppError(AppErrorCode.NOT_FOUND, {
      message: 'Organisation not found',
    });
  }

  // Redirect to organisation if already signed in and a member of the organisation.
  if (isAuthenticated && user && organisation.members.find((member) => member.userId === user.id)) {
    throw redirect(`/o/${orgUrl}`);
  }

  return {
    organisationName: organisation.name,
    orgUrl,
  };
}

export default function OrganisationSignIn({ loaderData }: Route.ComponentProps) {
  const [searchParams] = useSearchParams();

  const { organisationName, orgUrl } = loaderData;

  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmationChecked, setIsConfirmationChecked] = useState(false);

  const action = searchParams.get('action');

  const onSignInWithOIDCClick = async () => {
    setIsSubmitting(true);

    try {
      await authClient.oidc.org.signIn({
        orgUrl,
      });
    } catch (err) {
      toast({
        title: "An unknown error occurred",
        description: "We encountered an unknown error while attempting to sign you In. Please try again later.",
        variant: 'destructive',
      });
    }

    setIsSubmitting(false);
  };

  if (action === 'verification-required') {
    return (
      <div className="w-screen max-w-lg px-4">
        <div className="flex items-start">
          <div className="mr-4 mt-1 hidden md:block">
            <MailsIcon className="text-primary h-10 w-10" strokeWidth={2} />
          </div>
          <div className="">
            <h2 className="text-2xl font-bold md:text-4xl">
              Confirmation email sent
            </h2>

            <p className="text-muted-foreground mt-4">
              
                To gain access to your account, please confirm your email address by clicking on the
                confirmation link from your inbox.
              
            </p>

            <div className="mt-4 flex items-center gap-x-2">
              <Button asChild>
                <Link to={`/o/${orgUrl}/signin`} replace>
                  Return
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen max-w-lg px-4">
      <div className="border-border dark:bg-background z-10 rounded-xl border bg-neutral-100 p-6">
        <h1 className="text-2xl font-semibold">
          Welcome to {organisationName}
        </h1>

        <p className="text-muted-foreground mt-2 text-sm">
          Sign in to your account
        </p>

        <hr className="-mx-6 my-4" />

        <div className="mb-4 flex items-center gap-x-2">
          <Checkbox
            id={`flag-3rd-party-service`}
            checked={isConfirmationChecked}
            onCheckedChange={(checked) =>
              setIsConfirmationChecked(checked === 'indeterminate' ? false : checked)
            }
          />

          <label
            className="text-muted-foreground ml-2 flex flex-row items-center text-sm"
            htmlFor={`flag-3rd-party-service`}
          >
            
              I understand that I am providing my credentials to a 3rd party service configured by
              this organisation
            
          </label>
        </div>

        <Button
          type="button"
          size="lg"
          variant="outline"
          className="bg-background w-full"
          loading={isSubmitting}
          disabled={!isConfirmationChecked}
          onClick={onSignInWithOIDCClick}
        >
          Sign In
        </Button>

        <div className="relative mt-2 flex items-center justify-center gap-x-4 py-2 text-xs uppercase">
          <div className="bg-border h-px flex-1" />
          <span className="text-muted-foreground bg-transparent">
            OR
          </span>
          <div className="bg-border h-px flex-1" />
        </div>

        <div className="text-muted-foreground mt-1 flex items-center justify-center text-xs">
          <Link to="/signin">
            Return to iRadar sign in page here
          </Link>
        </div>
      </div>
    </div>
  );
}
