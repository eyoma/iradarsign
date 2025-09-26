import { OrganisationMemberInviteStatus } from '@prisma/client';
import { Link } from 'react-router';

import { prisma } from '@documenso/prisma';
import { Button } from '@documenso/ui/primitives/button';

import type { Route } from './+types/organisation.decline.$token';

export async function loader({ params }: Route.LoaderArgs) {
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

  if (organisationMemberInvite.status !== OrganisationMemberInviteStatus.DECLINED) {
    await prisma.organisationMemberInvite.update({
      where: {
        id: organisationMemberInvite.id,
      },
      data: {
        status: OrganisationMemberInviteStatus.DECLINED,
      },
    });
  }

  return {
    state: 'Success',
    organisationName: organisationMemberInvite.organisation.name,
  } as const;
}

export default function DeclineInvitationPage({ loaderData }: Route.ComponentProps) {
  const data = loaderData;

  if (data.state === 'InvalidLink') {
    return (
      <div className="w-screen max-w-lg px-4">
        <div className="w-full">
          <h1 className="text-4xl font-semibold">
            Invalid token
          </h1>

          <p className="text-muted-foreground mb-4 mt-2 text-sm">
            This token is invalid or has expired. No action is needed.
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

  return (
    <div className="w-screen max-w-lg px-4">
      <h1 className="text-4xl font-semibold">
        Invitation declined
      </h1>

      <p className="text-muted-foreground mb-4 mt-2 text-sm">
        
          You have declined the invitation from <strong>{data.organisationName}</strong> to join
          their organisation.
        
      </p>

      <Button asChild>
        <Link to="/">
          Return to Home
        </Link>
      </Button>
    </div>
  );
}
