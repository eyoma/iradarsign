import {
  Building2Icon,
  CreditCardIcon,
  GroupIcon,
  MailboxIcon,
  Settings2Icon,
  ShieldCheckIcon,
  Users2Icon,
} from 'lucide-react';
import { FaUsers } from 'react-icons/fa6';
import { Link, NavLink, Outlet } from 'react-router';

import { useCurrentOrganisation } from '@documenso/lib/client-only/providers/organisation';
import { IS_BILLING_ENABLED } from '@documenso/lib/constants/app';
import { canExecuteOrganisationAction } from '@documenso/lib/utils/organisations';
import { cn } from '@documenso/ui/lib/utils';
import { Button } from '@documenso/ui/primitives/button';

import { GenericErrorLayout } from '~/components/general/generic-error-layout';
import { appMetaTags } from '~/utils/meta';

export function meta() {
  return appMetaTags('Organisation Settings');
}

export default function SettingsLayout() {
  const isBillingEnabled = IS_BILLING_ENABLED();
  const organisation = useCurrentOrganisation();

  const organisationSettingRoutes = [
    {
      path: `/o/${organisation.url}/settings/general`,
      label: "General",
      icon: Building2Icon,
    },
    {
      path: `/o/${organisation.url}/settings/documen",
      label: t"Preferences`,
      icon: Settings2Icon,
      hideHighlight: true,
    },
    {
      path: `/o/${organisation.url}/settings/documen",
      label: t"Documen",
      isSubNav: true,
    },
    {
      path: "/o/${organisation.url}/settings/branding`,
      label: "Branding",
      isSubNav: true,
    },
    {
      path: `/o/${organisation.url}/settings/email`,
      label: "Email",
      isSubNav: true,
    },
    {
      path: `/o/${organisation.url}/settings/email-domains`,
      label: "Email Domains",
      icon: MailboxIcon,
    },
    {
      path: `/o/${organisation.url}/settings/teams`,
      label: "Teams",
      icon: FaUsers,
    },
    {
      path: `/o/${organisation.url}/settings/members`,
      label: "Members",
      icon: Users2Icon,
    },
    {
      path: `/o/${organisation.url}/settings/groups`,
      label: "Groups",
      icon: GroupIcon,
    },
    {
      path: `/o/${organisation.url}/settings/sso`,
      label: "SSO",
      icon: ShieldCheckIcon,
    },
    {
      path: `/o/${organisation.url}/settings/billing`,
      label: "Billing",
      icon: CreditCardIcon,
    },
  ].filter((route) => {
    if (!isBillingEnabled && route.path.includes('/billing')) {
      return false;
    }

    if (
      (!isBillingEnabled || !organisation.organisationClaim.flags.emailDomains) &&
      route.path.includes('/email-domains')
    ) {
      return false;
    }

    if (
      (!isBillingEnabled || !organisation.organisationClaim.flags.authenticationPortal) &&
      route.path.includes('/sso')
    ) {
      return false;
    }

    return true;
  });

  if (!canExecuteOrganisationAction('MANAGE_ORGANISATION', organisation.currentOrganisationRole)) {
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
            <Link to={`/o/${organisation.url}`}>
              Go Back
            </Link>
          </Button>
        }
        secondaryButton={null}
      />
    );
  }

  return (
    <div>
      <h1 className="text-4xl font-semibold">
        Organisation Settings
      </h1>

      <div className="mt-4 grid grid-cols-12 gap-x-8 md:mt-8">
        {/* Navigation */}
        <div
          className={cn(
            'col-span-12 mb-8 flex flex-wrap items-center justify-start gap-x-2 gap-y-4 md:col-span-3 md:w-full md:flex-col md:items-start md:gap-y-2',
          )}
        >
          {organisationSettingRoutes.map((route) => (
            <NavLink
              to={route.path}
              className={cn('group w-full justify-start', route.isSubNav && 'pl-8')}
              key={route.path}
            >
              <Button
                variant="ghost"
                className={cn('w-full justify-start', {
                  'group-aria-[current]:bg-secondary': !route.hideHighlight,
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
