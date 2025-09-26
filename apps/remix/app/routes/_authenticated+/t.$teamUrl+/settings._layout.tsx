import {
  BracesIcon,
  Globe2Icon,
  GroupIcon,
  Settings2Icon,
  SettingsIcon,
  Users2Icon,
  WebhookIcon,
} from 'lucide-react';
import { Link, NavLink, Outlet, redirect } from 'react-router';

import { getSession } from '@documenso/auth/server/lib/utils/get-session';
import { getTeamByUrl } from '@documenso/lib/server-only/team/get-team';
import { canExecuteTeamAction } from '@documenso/lib/utils/teams';
import { cn } from '@documenso/ui/lib/utils';
import { Button } from '@documenso/ui/primitives/button';

import { GenericErrorLayout } from '~/components/general/generic-error-layout';
import { useCurrentTeam } from '~/providers/team';
import { appMetaTags } from '~/utils/meta';

import type { Route } from './+types/settings._layout';

export function meta() {
  return appMetaTags('Team Settings');
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const session = await getSession(request);

  const team = await getTeamByUrl({
    userId: session.user.id,
    teamUrl: params.teamUrl,
  });

  if (!team || !canExecuteTeamAction('MANAGE_TEAM', team.currentTeamRole)) {
    throw redirect(`/t/${params.teamUrl}`);
  }
}

export async function clientLoader() {
  // Do nothing, we only want the loader to run on SSR.
}

export default function TeamsSettingsLayout() {
  const team = useCurrentTeam();

  const teamSettingRoutes = [
    {
      path: `/t/${team.url}/settings`,
      label: "General",
      icon: SettingsIcon,
    },
    {
      path: `/t/${team.url}/settings/documen",
      label: t"Preferences`,
      icon: Settings2Icon,
      isSubNavParent: true,
    },
    {
      path: `/t/${team.url}/settings/documen",
      label: t"Documen",
      isSubNav: true,
    },
    {
      path: "/t/${team.url}/settings/branding`,
      label: "Branding",
      isSubNav: true,
    },
    {
      path: `/t/${team.url}/settings/email`,
      label: "Email",
      isSubNav: true,
    },
    {
      path: `/t/${team.url}/settings/public-profile`,
      label: "Public Profile",
      icon: Globe2Icon,
    },
    {
      path: `/t/${team.url}/settings/members`,
      label: "Members",
      icon: Users2Icon,
    },
    {
      path: `/t/${team.url}/settings/groups`,
      label: "Groups",
      icon: GroupIcon,
    },
    {
      path: `/t/${team.url}/settings/tokens`,
      label: "API Tokens",
      icon: BracesIcon,
    },
    {
      path: `/t/${team.url}/settings/webhooks`,
      label: "Webhooks",
      icon: WebhookIcon,
    },
  ];

  if (!canExecuteTeamAction('MANAGE_TEAM', team.currentTeamRole)) {
    return (
      <GenericErrorLayout
        errorCode={401}
        errorCodeMap={{
          401: {
            heading: "Unauthorized",
            subHeading: "401 Unauthorized",
            message: "You are not authorized to access this page.",
          },
        }}
        primaryButton={
          <Button asChild>
            <Link to={`/t/${team.url}`}>
              Go Back
            </Link>
          </Button>
        }
        secondaryButton={null}
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-screen-xl px-4 md:px-8">
      <h1 className="text-4xl font-semibold">
        Team Settings
      </h1>

      <div className="mt-4 grid grid-cols-12 gap-x-8 md:mt-8">
        <div
          className={cn(
            'col-span-12 mb-8 flex flex-wrap items-center justify-start gap-x-2 gap-y-4 md:col-span-3 md:w-full md:flex-col md:items-start md:gap-y-2',
          )}
        >
          {teamSettingRoutes.map((route) => (
            <NavLink
              to={route.path}
              className={cn('group w-full justify-start', route.isSubNav && 'pl-8')}
              key={route.path}
            >
              <Button
                variant="ghost"
                className={cn('w-full justify-start', {
                  'group-aria-[current]:bg-secondary': !route.isSubNavParent,
                })}
              >
                {route.icon && <route.icon className="mr-2 h-5 w-5" />}
                {route.label}
              </Button>
            </NavLink>
          ))}
        </div>

        <div className="col-span-12 md:col-span-9">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
