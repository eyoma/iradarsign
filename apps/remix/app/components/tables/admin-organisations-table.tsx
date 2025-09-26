import { useMemo } from 'react';

import {
  CreditCardIcon,
  ExternalLinkIcon,
  MoreHorizontalIcon,
  SettingsIcon,
  UserIcon,
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router';

import { useUpdateSearchParams } from '@documenso/lib/client-only/hooks/use-update-search-params';
import { SUBSCRIPTION_STATUS_MAP } from '@documenso/lib/constants/billing';
import { ZUrlSearchParamsSchema } from '@documenso/lib/types/search-params';
import { trpc } from '@documenso/trpc/react';
import { Badge } from '@documenso/ui/primitives/badge';
import type { DataTableColumnDef } from '@documenso/ui/primitives/data-table';
import { DataTable } from '@documenso/ui/primitives/data-table';
import { DataTablePagination } from '@documenso/ui/primitives/data-table-pagination';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@documenso/ui/primitives/dropdown-menu';
import { Skeleton } from '@documenso/ui/primitives/skeleton';
import { TableCell } from '@documenso/ui/primitives/table';

type AdminOrganisationsTableOptions = {
  ownerUserId?: number;
  memberUserId?: number;
  showOwnerColumn?: boolean;
  hidePaginationUntilOverflow?: boolean;
};

export const AdminOrganisationsTable = ({
  ownerUserId,
  memberUserId,
  showOwnerColumn = true,
  hidePaginationUntilOverflow,
}: AdminOrganisationsTableOptions) => {
  const [searchParams] = useSearchParams();
  const updateSearchParams = useUpdateSearchParams();

  const parsedSearchParams = ZUrlSearchParamsSchema.parse(Object.fromEntries(searchParams ?? []));

  const { data, isLoading, isLoadingError } = trpc.admin.organisation.find.useQuery({
    query: parsedSearchParams.query,
    page: parsedSearchParams.page,
    perPage: parsedSearchParams.perPage,
    ownerUserId,
    memberUserId,
  });

  const onPaginationChange = (page: number, perPage: number) => {
    updateSearchParams({
      page,
      perPage,
    });
  };

  const results = data ?? {
    data: [],
    perPage: 10,
    currentPage: 1,
    totalPages: 1,
  };

  const columns = useMemo(() => {
    return [
      {
        header: "Organisation",
        accessorKey: 'name',
        cell: ({ row }) => (
          <Link to={`/admin/organisations/${row.original.id}`}>{row.original.name}</Link>
        ),
      },
      {
        header: "Created At",
        accessorKey: 'createdAt',
        cell: ({ row }) => i18n.date(row.original.createdAt),
      },
      {
        header: "Owner",
        accessorKey: 'owner',
        cell: ({ row }) => (
          <Link to={`/admin/users/${row.original.owner.id}`}>{row.original.owner.name}</Link>
        ),
      },
      {
        header: "Status",
        cell: ({ row }) => (
          <Badge variant="neutral">
            {row.original.owner.id === memberUserId ? "Owner" : "Member"}
          </Badge>
        ),
      },
      {
        header: "Subscription",
        cell: ({ row }) =>
          row.original.subscription ? (
            <Link
              to={`https://dashboard.stripe.com/subscriptions/${row.original.subscription.planId}`}
              target="_blank"
              className="flex flex-row items-center gap-2"
            >
              {SUBSCRIPTION_STATUS_MAP[row.original.subscription.status]}
              <ExternalLinkIcon className="h-4 w-4" />
            </Link>
          ) : (
            'None'
          ),
      },
      {
        id: 'actions',
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <MoreHorizontalIcon className="text-muted-foreground h-5 w-5" />
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-52" align="start" forceMount>
              <DropdownMenuLabel>
                Actions
              </DropdownMenuLabel>

              <DropdownMenuItem asChild>
                <Link to={`/admin/organisations/${row.original.id}`}>
                  <SettingsIcon className="mr-2 h-4 w-4" />
                  Manage
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link to={`/admin/users/${row.original.owner.id}`}>
                  <UserIcon className="mr-2 h-4 w-4" />
                  View owner
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem disabled={!row.original.customerId} asChild>
                <Link to={`https://dashboard.stripe.com/customers/${row.original.customerId}`}>
                  <CreditCardIcon className="mr-2 h-4 w-4" />
                  Stripe
                  {!row.original.customerId && <span>&nbsp;(N/A)</span>}
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ] satisfies DataTableColumnDef<(typeof results)['data'][number]>[];
  }, []);

  return (
    <div>
      <DataTable
        columns={columns}
        data={results.data}
        perPage={results.perPage}
        currentPage={results.currentPage}
        totalPages={results.totalPages}
        onPaginationChange={onPaginationChange}
        columnVisibility={{
          owner: showOwnerColumn,
          status: memberUserId !== undefined,
        }}
        error={{
          enable: isLoadingError,
        }}
        skeleton={{
          enable: isLoading,
          rows: 3,
          component: (
            <>
              <TableCell className="py-4 pr-4">
                <Skeleton className="h-4 w-20 rounded-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-12 rounded-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-12 rounded-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-12 rounded-full" />
              </TableCell>
              <TableCell>
                <div className="flex flex-row justify-end space-x-2">
                  <Skeleton className="h-2 w-6 rounded" />
                </div>
              </TableCell>
            </>
          ),
        }}
      >
        {(table) =>
          !hidePaginationUntilOverflow || 1 > table.getPageCount() ? (
            <DataTablePagination additionalInformation="VisibleCount" table={table} />
          ) : null
        }
      </DataTable>
    </div>
  );
};
