import { Link } from 'react-router';

import { getOptionalSession } from '@documenso/auth/server/lib/utils/get-session';
import { acceptOrganisationInvitation } from '@documenso/lib/server-only/organisation/accept-organisation-invitation';
import { prisma } from '@documenso/prisma';
import { Button } from '@documenso/ui/primitives/button';

import type { Route } from './+types/organisation.invite.$token';

export async function loader({ params, request }: Route.LoaderArgs) {
  const session = await getOptionalSession(request);

  const { token } = params;

  if (!token) {
    return {
      state: 'InvalidLink',
    } as const;
  }

  const organisationMemberInvite = await prisma.organisationMemberInvite.findUnique({
    where: {
      token,
    },
    include: {
      organisation: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!organisationMemberInvite) {
    return {
      state: 'InvalidLink',
    } as const;
  }

  const user = await prisma.user.findFirst({
    where: {
      email: {
        equals: organisationMemberInvite.email,
        mode: 'insensitive',
      },
    },
    select: {
      id: true,
    },
  });

  // Directly convert the team member invite to a team member if they already have an account.
  if (user) {
    await acceptOrganisationInvitation({ token: organisationMemberInvite.token });
  }

  if (!user) {
    return {
      state: 'LoginRequired',
      email: organisationMemberInvite.email,
      organisationName: organisationMemberInvite.organisation.name,
    } as const;
  }

  const isSessionUserTheInvitedUser = user.id === session.user?.id;

  return {
    state: 'Success',
    email: organisationMemberInvite.email,
    organisationName: organisationMemberInvite.organisation.name,
    isSessionUserTheInvitedUser,
  } as const;
}

export default function AcceptInvitationPage({ loaderData }: Route.ComponentProps) {
  const data = loaderData;

  if (data.state === 'InvalidLink') {
    return (
      <div className="w-screen max-w-lg px-4">
        <div className="w-full">
          <h1 className="text-4xl font-semibold">
            Invalid token
          </h1>

          <p className="text-muted-foreground mb-4 mt-2 text-sm">
            
              This token is invalid or has expired. Please contact your team for a new invitation.
            
          </p>

          <Button asChild>
            <Link to="/">
              Return
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  if (data.state === 'LoginRequired') {
    return (
      <div>
        <h1 className="text-4xl font-semibold">
          Organisation invitation
        </h1>

        <p className="text-muted-foreground mt-2 text-sm">
          
            You have been invited by <strong>{data.organisationName}</strong> to join their
            organisation.
          
        </p>

        <p className="text-muted-foreground mb-4 mt-1 text-sm">
          To accept this invitation you must create an account.
        </p>

        <Button asChild>
          <Link to={`/signup#email=${encodeURIComponent(data.email)}`}>
            Create account
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-4xl font-semibold">
        Invitation accepted!
      </h1>

      <p className="text-muted-foreground mb-4 mt-2 text-sm">
        
          You have accepted an invitation from <strong>{data.organisationName}</strong> to join
          their organisation.
        
      </p>

      {data.isSessionUserTheInvitedUser ? (
        <Button asChild>
          <Link to="/">
            Continue
          </Link>
        </Button>
      ) : (
        <Button asChild>
          <Link to={`/signin#email=${encodeURIComponent(data.email)}`}>
            Continue to login
          </Link>
        </Button>
      )}
    </div>
  );
}
