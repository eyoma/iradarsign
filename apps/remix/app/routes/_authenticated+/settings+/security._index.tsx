import { Link } from 'react-router';

import { getSession } from '@documenso/auth/server/lib/utils/get-session';
import { useSession } from '@documenso/lib/client-only/providers/session';
import { prisma } from '@documenso/prisma';
import { Alert, AlertDescription, AlertTitle } from '@documenso/ui/primitives/alert';
import { Button } from '@documenso/ui/primitives/button';

import { DisableAuthenticatorAppDialog } from '~/components/forms/2fa/disable-authenticator-app-dialog';
import { EnableAuthenticatorAppDialog } from '~/components/forms/2fa/enable-authenticator-app-dialog';
import { ViewRecoveryCodesDialog } from '~/components/forms/2fa/view-recovery-codes-dialog';
import { PasswordForm } from '~/components/forms/password';
import { SettingsHeader } from '~/components/general/settings-header';
import { appMetaTags } from '~/utils/meta';

import type { Route } from './+types/security._index';

export function meta() {
  return appMetaTags('Security');
}

export async function loader({ request }: Route.LoaderArgs) {
  const { user } = await getSession(request);

  // Todo: Use providers instead after RR7 migration.
  // const accounts = await prisma.account.findMany({
  //   where: {
  //     userId: user.id,
  //   },
  //   select: {
  //     provider: true,
  //   },
  // });

  // const providers = accounts.map((account) => account.provider);
  // let hasEmailPasswordAccount = providers.includes('DOCUMENSO');

  const hasEmailPasswordAccount: boolean = await prisma.user
    .count({
      where: {
        id: user.id,
        password: {
          not: null,
        },
      },
    })
    .then((value) => value > 0);

  return {
    // providers,
    hasEmailPasswordAccount,
  };
}

export default function SettingsSecurity({ loaderData }: Route.ComponentProps) {
  const { hasEmailPasswordAccount } = loaderData;

  const { user } = useSession();

  return (
    <div>
      <SettingsHeader
        title={"Security"}
        subtitle={"Here you can manage your password and security settings."}
      />
      {hasEmailPasswordAccount && (
        <>
          <PasswordForm user={user} />

          <hr className="border-border/50 mt-6" />
        </>
      )}

      <Alert
        className="mt-6 flex flex-col justify-between p-6 sm:flex-row sm:items-center"
        variant="neutral"
      >
        <div className="mb-4 sm:mb-0">
          <AlertTitle>
            Two factor authentication
          </AlertTitle>

          <AlertDescription className="mr-4">
            {hasEmailPasswordAccount ? (
              
                Add an authenticator to serve as a secondary authentication method when signing in,
                or when signing documents.
              
            ) : (
              
                Add an authenticator to serve as a secondary authentication method for signing
                documents.
              
            )}
          </AlertDescription>
        </div>

        {user.twoFactorEnabled ? (
          <DisableAuthenticatorAppDialog />
        ) : (
          <EnableAuthenticatorAppDialog />
        )}
      </Alert>

      {user.twoFactorEnabled && (
        <Alert
          className="mt-6 flex flex-col justify-between p-6 sm:flex-row sm:items-center"
          variant="neutral"
        >
          <div className="mb-4 sm:mb-0">
            <AlertTitle>
              Recovery codes
            </AlertTitle>

            <AlertDescription className="mr-4">
              
                Two factor authentication recovery codes are used to access your account in the
                event that you lose access to your authenticator app.
              
            </AlertDescription>
          </div>

          <ViewRecoveryCodesDialog />
        </Alert>
      )}

      <Alert
        className="mt-6 flex flex-col justify-between p-6 sm:flex-row sm:items-center"
        variant="neutral"
      >
        <div className="mb-4 sm:mb-0">
          <AlertTitle>
            Passkeys
          </AlertTitle>

          <AlertDescription className="mr-4">
            
              Allows authenticating using biometrics, password managers, hardware keys, etc.
            
          </AlertDescription>
        </div>

        <Button asChild variant="outline" className="bg-background">
          <Link to="/settings/security/passkeys">
            Manage passkeys
          </Link>
        </Button>
      </Alert>

      <Alert
        className="mt-6 flex flex-col justify-between p-6 sm:flex-row sm:items-center"
        variant="neutral"
      >
        <div className="mb-4 mr-4 sm:mb-0">
          <AlertTitle>
            Recent activity
          </AlertTitle>

          <AlertDescription className="mr-2">
            View all recent security activity related to your account.
          </AlertDescription>
        </div>

        <Button asChild variant="outline" className="bg-background">
          <Link to="/settings/security/activity">
            View activity
          </Link>
        </Button>
      </Alert>

      <Alert
        className="mt-6 flex flex-col justify-between p-6 sm:flex-row sm:items-center"
        variant="neutral"
      >
        <div className="mb-4 mr-4 sm:mb-0">
          <AlertTitle>
            Active sessions
          </AlertTitle>

          <AlertDescription className="mr-2">
            View and manage all active sessions for your account.
          </AlertDescription>
        </div>

        <Button asChild variant="outline" className="bg-background">
          <Link to="/settings/security/sessions">
            Manage sessions
          </Link>
        </Button>
      </Alert>

      <Alert
        className="mt-6 flex flex-col justify-between p-6 sm:flex-row sm:items-center"
        variant="neutral"
      >
        <div className="mb-4 mr-4 sm:mb-0">
          <AlertTitle>
            Linked Accounts
          </AlertTitle>

          <AlertDescription className="mr-2">
            View and manage all login methods linked to your account.
          </AlertDescription>
        </div>

        <Button asChild variant="outline" className="bg-background">
          <Link to="/settings/security/linked-accounts">
            Manage linked accounts
          </Link>
        </Button>
      </Alert>
    </div>
  );
}
