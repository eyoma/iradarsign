import type { HTMLAttributes } from 'react';

import {
  BracesIcon,
  CreditCardIcon,
  Globe2Icon,
  Lock,
  Settings2Icon,
  User,
  Users,
  WebhookIcon,
} from 'lucide-react';
import { useLocation } from 'react-router';
import { Link } from 'react-router';

import { useSession } from '@documenso/lib/client-only/providers/session';
import { IS_BILLING_ENABLED } from '@documenso/lib/constants/app';
import { isPersonalLayout } from '@documenso/lib/utils/organisations';
import { cn } from '@documenso/ui/lib/utils';
import { Button } from '@documenso/ui/primitives/button';

export type SettingsDesktopNavProps = HTMLAttributes<HTMLDivElement>;

export const SettingsDesktopNav = ({ className, ...props }: SettingsDesktopNavProps) => {
  const { pathname } = useLocation();

  const { organisations } = useSession();

  const isPersonalLayoutMode = isPersonalLayout(organisations);

  return (
    <div className={cn('flex flex-col gap-y-2', className)} {...props}>
      <Link to="/settings/profile">
        <Button
          variant="ghost"
          className={cn(
            'w-full justify-start',
            pathname?.startsWith('/settings/profile') && 'bg-secondary',
          )}
        >
          <User className="mr-2 h-5 w-5" />
          Profile
        </Button>
      </Link>

      {isPersonalLayoutMode && (
        <>
          <Link to="/settings/document">
            <Button variant="ghost" className={cn('w-full justify-start')}>
              <Settings2Icon className="mr-2 h-5 w-5" />
              Preferences
            </Button>
          </Link>

          <Link className="w-full pl-8" to="/settings/document">
            <Button
              variant="ghost"
              className={cn(
                'w-full justify-start',
                pathname?.startsWith('/settings/document') && 'bg-secondary',
              )}
            >
              Document
            </Button>
          </Link>

          <Link className="w-full pl-8" to="/settings/branding">
            <Button
              variant="ghost"
              className={cn(
                'w-full justify-start',
                pathname?.startsWith('/settings/branding') && 'bg-secondary',
              )}
            >
              Branding
            </Button>
          </Link>

          <Link className="w-full pl-8" to="/settings/email">
            <Button
              variant="ghost"
              className={cn(
                'w-full justify-start',
                pathname?.startsWith('/settings/email') && 'bg-secondary',
              )}
            >
              Email
            </Button>
          </Link>

          <Link to="/settings/public-profile">
            <Button
              variant="ghost"
              className={cn(
                'w-full justify-start',
                pathname?.startsWith('/settings/public-profile') && 'bg-secondary',
              )}
            >
              <Globe2Icon className="mr-2 h-5 w-5" />
              Public Profile
            </Button>
          </Link>

          <Link to="/settings/tokens">
            <Button
              variant="ghost"
              className={cn(
                'w-full justify-start',
                pathname?.startsWith('/settings/tokens') && 'bg-secondary',
              )}
            >
              <BracesIcon className="mr-2 h-5 w-5" />
              API Tokens
            </Button>
          </Link>

          <Link to="/settings/webhooks">
            <Button
              variant="ghost"
              className={cn(
                'w-full justify-start',
                pathname?.startsWith('/settings/webhooks') && 'bg-secondary',
              )}
            >
              <WebhookIcon className="mr-2 h-5 w-5" />
              Webhooks
            </Button>
          </Link>

          {IS_BILLING_ENABLED() && (
            <Link to="/settings/billing">
              <Button
                variant="ghost"
                className={cn(
                  'w-full justify-start',
                  pathname?.startsWith('/settings/billing') && 'bg-secondary',
                )}
              >
                <CreditCardIcon className="mr-2 h-5 w-5" />
                Billing
              </Button>
            </Link>
          )}
        </>
      )}

      <Link to="/settings/organisations">
        <Button
          variant="ghost"
          className={cn(
            'w-full justify-start',
            pathname?.startsWith('/settings/organisations') && 'bg-secondary',
          )}
        >
          <Users className="mr-2 h-5 w-5" />
          Organisations
        </Button>
      </Link>

      <Link to="/settings/security">
        <Button
          variant="ghost"
          className={cn(
            'w-full justify-start',
            pathname?.startsWith('/settings/security') && 'bg-secondary',
          )}
        >
          <Lock className="mr-2 h-5 w-5" />
          Security
        </Button>
      </Link>
    </div>
  );
};
