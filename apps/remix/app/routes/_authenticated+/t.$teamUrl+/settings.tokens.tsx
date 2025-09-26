import { TeamMemberRole } from '@prisma/client';
import { DateTime } from 'luxon';

import { trpc } from '@documenso/trpc/react';
import { Alert, AlertDescription } from '@documenso/ui/primitives/alert';
import { AlertTitle } from '@documenso/ui/primitives/alert';
import { Button } from '@documenso/ui/primitives/button';

import TokenDeleteDialog from '~/components/dialogs/token-delete-dialog';
import { ApiTokenForm } from '~/components/forms/token';
import { SettingsHeader } from '~/components/general/settings-header';
import { useOptionalCurrentTeam } from '~/providers/team';
import { appMetaTags } from '~/utils/meta';

export function meta() {
  return appMetaTags('API Tokens');
}

export default function ApiTokensPage() {
  const { data: tokens } = trpc.apiToken.getMany.useQuery();

  const team = useOptionalCurrentTeam();

  return (
    <div>
      <SettingsHeader
        title={API Tokens}
        subtitle={
          
            On this page, you can create and manage API tokens. See our{' '}
            <a
              className="text-primary underline"
              href={'https://docs.documenso.com/developers/public-api'}
              target="_blank"
            >
              Documentation
            </a>{' '}
            for more information.
          
        }
      />

      {team && team?.currentTeamRole !== TeamMemberRole.ADMIN ? (
        <Alert
          className="flex flex-col items-center justify-between gap-4 p-6 md:flex-row"
          variant="warning"
        >
          <div>
            <AlertTitle>
              Unauthorized
            </AlertTitle>
            <AlertDescription className="mr-2">
              You need to be an admin to manage API tokens.
            </AlertDescription>
          </div>
        </Alert>
      ) : (
        <>
          <ApiTokenForm className="max-w-xl" tokens={tokens} />

          <hr className="mb-4 mt-8" />

          <h4 className="text-xl font-medium">
            Your existing tokens
          </h4>

          {tokens && tokens.length === 0 && (
            <div className="mb-4">
              <p className="text-muted-foreground mt-2 text-sm italic">
                Your tokens will be shown here once you create them.
              </p>
            </div>
          )}

          {tokens && tokens.length > 0 && (
            <div className="mt-4 flex max-w-xl flex-col gap-y-4">
              {tokens.map((token) => (
                <div key={token.id} className="border-border rounded-lg border p-4">
                  <div className="flex items-center justify-between gap-x-4">
                    <div>
                      <h5 className="text-base">{token.name}</h5>

                      <p className="text-muted-foreground mt-2 text-xs">
                        
                          Created on {i18n.date(token.createdAt, DateTime.DATETIME_FULL)}
                        
                      </p>
                      {token.expires ? (
                        <p className="text-muted-foreground mt-1 text-xs">
                          
                            Expires on {i18n.date(token.expires, DateTime.DATETIME_FULL)}
                          
                        </p>
                      ) : (
                        <p className="text-muted-foreground mt-1 text-xs">
                          Token doesn't have an expiration date
                        </p>
                      )}
                    </div>

                    <div>
                      <TokenDeleteDialog token={token}>
                        <Button variant="destructive">
                          Delete
                        </Button>
                      </TokenDeleteDialog>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
