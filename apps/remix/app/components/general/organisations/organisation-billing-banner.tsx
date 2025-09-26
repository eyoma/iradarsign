import { useState } from 'react';

import { SubscriptionStatus } from '@prisma/client';
import { AlertTriangle } from 'lucide-react';
import { Link } from 'react-router';
import { match } from 'ts-pattern';

import { useOptionalCurrentOrganisation } from '@documenso/lib/client-only/providers/organisation';
import { SUPPORT_EMAIL } from '@documenso/lib/constants/app';
import { canExecuteOrganisationAction } from '@documenso/lib/utils/organisations';
import { trpc } from '@documenso/trpc/react';
import { cn } from '@documenso/ui/lib/utils';
import { Alert, AlertDescription } from '@documenso/ui/primitives/alert';
import { Button } from '@documenso/ui/primitives/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@documenso/ui/primitives/dialog';
import { useToast } from '@documenso/ui/primitives/use-toast';

export const OrganisationBillingBanner = () => {
  const { toast } = useToast();

  const [isOpen, setIsOpen] = useState(false);

  const organisation = useOptionalCurrentOrganisation();

  const { mutateAsync: manageSubscription, isPending } =
    trpc.enterprise.billing.subscription.manage.useMutation();

  const handleCreatePortal = async (organisationId: string) => {
    try {
      const { redirectUrl } = await manageSubscription({ organisationId });

      window.open(redirectUrl, '_blank');

      setIsOpen(false);
    } catch (err) {
      toast({
        title: "Something went wrong",
        description: 
          "We are unable to proceed to the billing portal at this time. Please try again, or contact support.",
        ,
        variant: 'destructive',
        duration: 10000,
      });
    }
  };

  const subscriptionStatus = organisation?.subscription?.status;

  if (
    !organisation ||
    subscriptionStatus === undefined ||
    subscriptionStatus === SubscriptionStatus.ACTIVE
  ) {
    return null;
  }

  return (
    <>
      <div
        className={cn({
          'bg-yellow-200 text-yellow-900 dark:bg-yellow-400':
            subscriptionStatus === SubscriptionStatus.PAST_DUE,
          'bg-destructive text-destructive-foreground':
            subscriptionStatus === SubscriptionStatus.INACTIVE,
        })}
      >
        <div className="mx-auto flex max-w-screen-xl items-center justify-center gap-x-4 px-4 py-2 text-sm font-medium">
          <div className="flex items-center">
            <AlertTriangle className="mr-2.5 h-5 w-5" />

            {match(subscriptionStatus)
              .with(SubscriptionStatus.PAST_DUE, () => Payment overdue)
              .with(SubscriptionStatus.INACTIVE, () => Restricted Access)
              .exhaustive()}
          </div>

          <Button
            variant="outline"
            className={cn({
              'text-yellow-900 hover:bg-yellow-100 dark:hover:bg-yellow-500':
                subscriptionStatus === SubscriptionStatus.PAST_DUE,
              'text-destructive-foreground hover:bg-destructive hover:text-white':
                subscriptionStatus === SubscriptionStatus.INACTIVE,
            })}
            disabled={isPending}
            onClick={() => setIsOpen(true)}
            size="sm"
          >
            Resolve
          </Button>
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={(value) => !isPending && setIsOpen(value)}>
        {match(subscriptionStatus)
          .with(SubscriptionStatus.PAST_DUE, () => (
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  Payment overdue
                </DialogTitle>

                <DialogDescription>
                  
                    Your payment is overdue. Please settle the payment to avoid any service
                    disruptions.
                  
                </DialogDescription>
              </DialogHeader>

              {canExecuteOrganisationAction(
                'MANAGE_BILLING',
                organisation.currentOrganisationRole,
              ) && (
                <DialogFooter>
                  <Button
                    loading={isPending}
                    onClick={async () => handleCreatePortal(organisation.id)}
                  >
                    Resolve payment
                  </Button>
                </DialogFooter>
              )}
            </DialogContent>
          ))
          .with(SubscriptionStatus.INACTIVE, () => (
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  Subscription invalid
                </DialogTitle>

                <DialogDescription>
                  
                    Your plan is no longer valid. Please subscribe to a new plan to continue using
                    iRadar.
                  
                </DialogDescription>
              </DialogHeader>

              <Alert variant="neutral">
                <AlertDescription>
                  
                    If there is any issue with your subscription, please contact us at{' '}
                    <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
                  
                </AlertDescription>
              </Alert>

              {canExecuteOrganisationAction(
                'MANAGE_BILLING',
                organisation.currentOrganisationRole,
              ) && (
                <DialogFooter>
                  <DialogClose asChild>
                    <Button asChild>
                      <Link to={`/o/${organisation.url}/settings/billing`}>
                        Manage Billing
                      </Link>
                    </Button>
                  </DialogClose>
                </DialogFooter>
              )}
            </DialogContent>
          ))
          .otherwise(() => null)}
      </Dialog>
    </>
  );
};
