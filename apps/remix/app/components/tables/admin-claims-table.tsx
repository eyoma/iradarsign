import { useMemo } from 'react';

import { EditIcon, MoreHorizontalIcon, Trash2Icon } from 'lucide-react';
import { Link, useSearchParams } from 'react-router';

import { useUpdateSearchParams } from '@documenso/lib/client-only/hooks/use-update-search-params';
import { ZUrlSearchParamsSchema } from '@documenso/lib/types/search-params';
import { SUBSCRIPTION_CLAIM_FEATURE_FLAGS } from '@documenso/lib/types/subscription';
import { trpc } from '@documenso/trpc/react';
import { CopyTextButton } from '@documenso/ui/components/common/copy-text-button';
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
import { useToast } from '@documenso/ui/primitives/use-toast';

import { ClaimDeleteDialog } from '../dialogs/claim-delete-dialog';
import { ClaimUpdateDialog } from '../dialogs/claim-update-dialog';

export const AdminClaimsTable = () => {
  const { toast } = useToast();

  const [searchParams] = useSearchParams();
  const updateSearchParams = useUpdateSearchParams();

  const parsedSearchParams = ZUrlSearchParamsSchema.parse(Object.fromEntries(searchParams ?? []));

  const { data, isLoading, isLoadingError } = trpc.admin.claims.find.useQuery({
    query: parsedSearchParams.query,
    page: parsedSearchParams.page,
    perPage: parsedSearchParams.perPage,
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
        header: "ID",
        accessorKey: 'id',
        maxSize: 50,
        cell: ({ row }) => (
          <CopyTextButton
            value={row.original.id}
            onCopySuccess={() => toast({ title: "ID copied to clipboard" })}
          />
        ),
      },
      {
        header: "Name",
        accessorKey: 'name',
        cell: ({ row }) => (
          <Link to={`/admin/organisations?query=claim:${row.original.id}`}>
            {row.original.name}
          </Link>
        ),
      },
      {
        header: "Allowed teams",
        accessorKey: 'teamCount',
        cell: ({ row }) => {
          if (row.original.teamCount === 0) {
            return <p className="text-muted-foreground">{"Unlimited"}</p>;
          }

          return <p className="text-muted-foreground">{row.original.teamCount}</p>;
        },
      },
      {
        header: "Feature Flags",
        cell: ({ row }) => {
          const flags = Object.values(SUBSCRIPTION_CLAIM_FEATURE_FLAGS).filter(
            ({ key }) => row.original.flags[key],
          );

          if (flags.length === 0) {
            return <p className="text-muted-foreground text-xs">{"None"}</p>;
          }

          return (
            <ul className="text-muted-foreground list-disc space-y-1 text-xs">
              {flags.map(({ key, label }) => (
                <li key={key}>{label}</li>
              ))}
            </ul>
          );
        },
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

              <ClaimUpdateDialog
                claim={row.original}
                trigger={
                  <DropdownMenuItem asChild onSelect={(e) => e.preventDefault()}>
                    <div>
                      <EditIcon className="mr-2 h-4 w-4" />
                      Update
                    </div>
                  </DropdownMenuItem>
                }
              />

              <ClaimDeleteDialog
                claimId={row.original.id}
                claimName={row.original.name}
                claimLocked={row.original.locked}
                trigger={
                  <DropdownMenuItem asChild onSelect={(e) => e.preventDefault()}>
                    <div>
                      <Trash2Icon className="mr-2 h-4 w-4" />
                      Delete
                    </div>
                  </DropdownMenuItem>
                }
              />
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
        {(table) => <DataTablePagination additionalInformation="VisibleCount" table={table} />}
      </DataTable>
    </div>
  );
};
