import { useMemo } from 'react';

import { EditIcon, MoreHorizontalIcon, Trash2Icon } from 'lucide-react';
import { Link } from 'react-router';

import { useCurrentOrganisation } from '@documenso/lib/client-only/providers/organisation';
import { IS_BILLING_ENABLED } from '@documenso/lib/constants/app';
import { generateEmailDomainRecords } from '@documenso/lib/utils/email-domains';
import { trpc } from '@documenso/trpc/react';
import type { TGetOrganisationEmailDomainResponse } from '@documenso/trpc/server/enterprise-router/get-organisation-email-domain.types';
import { Alert, AlertDescription, AlertTitle } from '@documenso/ui/primitives/alert';
import { Button } from '@documenso/ui/primitives/button';
import { DataTable, type DataTableColumnDef } from '@documenso/ui/primitives/data-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@documenso/ui/primitives/dropdown-menu';
import { SpinnerBox } from '@documenso/ui/primitives/spinner';

import { OrganisationEmailCreateDialog } from '~/components/dialogs/organisation-email-create-dialog';
import { OrganisationEmailDeleteDialog } from '~/components/dialogs/organisation-email-delete-dialog';
import { OrganisationEmailDomainDeleteDialog } from '~/components/dialogs/organisation-email-domain-delete-dialog';
import { OrganisationEmailDomainRecordsDialog } from '~/components/dialogs/organisation-email-domain-records-dialog';
import { OrganisationEmailUpdateDialog } from '~/components/dialogs/organisation-email-update-dialog';
import { GenericErrorLayout } from '~/components/general/generic-error-layout';
import { SettingsHeader } from '~/components/general/settings-header';

import type { Route } from './+types/o.$orgUrl.settings.groups.$id';

export default function OrganisationEmailDomainSettingsPage({ params }: Route.ComponentProps) {
  const organisation = useCurrentOrganisation();

  const emailDomainId = params.id;

  const { data: emailDomain, isLoading: isLoadingEmailDomain } =
    trpc.enterprise.organisation.emailDomain.get.useQuery(
      {
        emailDomainId,
      },
      {
        enabled: !!emailDomainId,
      },
    );

  const emailColumns = useMemo(() => {
    return [
      {
        header: "Name",
        accessorKey: 'emailName',
      },
      {
        header: "Email",
        accessorKey: 'email',
      },
      {
        header: "Actions",
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <MoreHorizontalIcon className="text-muted-foreground h-5 w-5" />
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-52" align="start" forceMount>
              <DropdownMenuLabel>
                Actions
              </DropdownMenuLabel>

              <OrganisationEmailUpdateDialog
                organisationEmail={row.original}
                trigger={
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <EditIcon className="mr-2 h-4 w-4" />
                    Update
                  </DropdownMenuItem>
                }
              />

              <OrganisationEmailDeleteDialog
                emailId={row.original.id}
                email={row.original.email}
                trigger={
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Trash2Icon className="mr-2 h-4 w-4" />
                    Remove
                  </DropdownMenuItem>
                }
              />
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ] satisfies DataTableColumnDef<TGetOrganisationEmailDomainResponse['emails'][number]>[];
  }, [organisation]);

  if (!IS_BILLING_ENABLED()) {
    return null;
  }

  if (isLoadingEmailDomain) {
    return <SpinnerBox className="py-32" />;
  }

  // Todo: Update UI, currently out of place.
  if (!emailDomain) {
    return (
      <GenericErrorLayout
        errorCode={404}
        errorCodeMap={{
          404: {
            heading: "Email domain not found",
            subHeading: "404 Email domain not found",
            message: "The email domain you are looking for may have been removed, renamed or may have never
                    existed.",
          },
        }}
        primaryButton={
          <Button asChild>
            <Link to={`/o/${organisation.url}/settings/email-domains`}>
              Go back
            </Link>
          </Button>
        }
        secondaryButton={null}
      />
    );
  }

  const records = generateEmailDomainRecords(emailDomain.selector, emailDomain.publicKey);

  return (
    <div>
      <SettingsHeader
        title={"Email Domain Settings"}
        subtitle={"Manage your email domain settings."}
      >
        <OrganisationEmailCreateDialog emailDomain={emailDomain} />
      </SettingsHeader>

      <div className="mt-4">
        <label className="text-sm font-medium leading-none">
          Emails
        </label>

        <div className="my-2">
          <DataTable columns={emailColumns} data={emailDomain.emails} />
        </div>
      </div>

      <Alert
        className="mt-6 flex flex-col justify-between p-6 sm:flex-row sm:items-center"
        variant="neutral"
      >
        <div className="mb-4 sm:mb-0">
          <AlertTitle>
            DNS Records
          </AlertTitle>

          <AlertDescription className="mr-2">
            View the DNS records for this email domain
          </AlertDescription>
        </div>

        <OrganisationEmailDomainRecordsDialog
          records={records}
          trigger={
            <Button variant="outline">
              View DNS Records
            </Button>
          }
        />
      </Alert>

      <Alert
        className="mt-6 flex flex-col justify-between p-6 sm:flex-row sm:items-center"
        variant="neutral"
      >
        <div className="mb-4 sm:mb-0">
          <AlertTitle>
            Delete email domain
          </AlertTitle>

          <AlertDescription className="mr-2">
            This will remove all emails associated with this email domain
          </AlertDescription>
        </div>

        <OrganisationEmailDomainDeleteDialog
          emailDomainId={emailDomainId}
          emailDomain={emailDomain.domain}
          trigger={
            <Button variant="destructive" title={"Remove email domain"}>
              Delete Email Domain
            </Button>
          }
        />
      </Alert>
    </div>
  );
}
