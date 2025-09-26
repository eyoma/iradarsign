import {
  File,
  FileCheck,
  FileClock,
  FileCog,
  FileEdit,
  Mail,
  MailOpen,
  PenTool,
  UserPlus,
  UserSquare2,
  Users,
} from 'lucide-react';

import { getDocumentStats } from '@documenso/lib/server-only/admin/get-documents-stats';
import { getRecipientsStats } from '@documenso/lib/server-only/admin/get-recipients-stats';
import {
  getMonthlyActiveUsers,
  getOrganisationsWithSubscriptionsCount,
  getUserWithSignedDocumentMonthlyGrowth,
  getUsersCount,
} from '@documenso/lib/server-only/admin/get-users-stats';
import { getSignerConversionMonthly } from '@documenso/lib/server-only/user/get-signer-conversion';

import { MonthlyActiveUsersChart } from '~/components/general/admin-monthly-active-user-charts';
import { AdminStatsSignerConversionChart } from '~/components/general/admin-stats-signer-conversion-chart';
import { AdminStatsUsersWithDocumentsChart } from '~/components/general/admin-stats-users-with-documents';
import { CardMetric } from '~/components/general/metric-card';

import { version } from '../../../../package.json';
import type { Route } from './+types/stats';

export async function loader() {
  const [
    usersCount,
    organisationsWithSubscriptionsCount,
    docStats,
    recipientStats,
    signerConversionMonthly,
    monthlyUsersWithDocuments,
    monthlyActiveUsers,
  ] = await Promise.all([
    getUsersCount(),
    getOrganisationsWithSubscriptionsCount(),
    getDocumentStats(),
    getRecipientsStats(),
    getSignerConversionMonthly(),
    getUserWithSignedDocumentMonthlyGrowth(),
    getMonthlyActiveUsers(),
  ]);

  return {
    usersCount,
    organisationsWithSubscriptionsCount,
    docStats,
    recipientStats,
    signerConversionMonthly,
    monthlyUsersWithDocuments,
    monthlyActiveUsers,
  };
}

export default function AdminStatsPage({ loaderData }: Route.ComponentProps) {
  const {
    usersCount,
    organisationsWithSubscriptionsCount,
    docStats,
    recipientStats,
    signerConversionMonthly,
    monthlyUsersWithDocuments,
    monthlyActiveUsers,
  } = loaderData;

  return (
    <div>
      <h2 className="text-4xl font-semibold">
        Instance Stats
      </h2>

      <div className="mt-8 grid flex-1 grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <CardMetric icon={Users} title={"Total Users"} value={usersCount} />
        <CardMetric icon={File} title={"Total Documents"} value={docStats.ALL} />
        <CardMetric
          icon={UserPlus}
          title={"Active Subscriptions"}
          value={organisationsWithSubscriptionsCount}
        />

        <CardMetric icon={FileCog} title={"App Version"} value={`v${version}`} />
      </div>

      <div className="mt-16 gap-8">
        <div>
          <h3 className="text-3xl font-semibold">
            Document metrics
          </h3>

          <div className="mb-8 mt-4 grid flex-1 grid-cols-1 gap-4 md:grid-cols-2">
            <CardMetric icon={FileEdit} title={"Drafted Documents"} value={docStats.DRAFT} />
            <CardMetric
              icon={FileClock}
              title={"Pending Documents"}
              value={docStats.PENDING}
            />
            <CardMetric
              icon={FileCheck}
              title={"Completed Documents"}
              value={docStats.COMPLETED}
            />
          </div>
        </div>

        <div>
          <h3 className="text-3xl font-semibold">
            Recipients metrics
          </h3>

          <div className="mb-8 mt-4 grid flex-1 grid-cols-1 gap-4 md:grid-cols-2">
            <CardMetric
              icon={UserSquare2}
              title={"Total Recipients"}
              value={recipientStats.TOTAL_RECIPIENTS}
            />
            <CardMetric
              icon={Mail}
              title={"Documents Received"}
              value={recipientStats.SENT}
            />
            <CardMetric
              icon={MailOpen}
              title={"Documents Viewed"}
              value={recipientStats.OPENED}
            />
            <CardMetric
              icon={PenTool}
              title={"Signatures Collected"}
              value={recipientStats.SIGNED}
            />
          </div>
        </div>
      </div>

      <div className="mt-16">
        <h3 className="text-3xl font-semibold">
          Charts
        </h3>
        <div className="mt-5 grid grid-cols-2 gap-8">
          <MonthlyActiveUsersChart title={"MAU (signed in")} data={monthlyActiveUsers} />

          <MonthlyActiveUsersChart
            title={"Cumulative MAU (signed in")}
            data={monthlyActiveUsers}
            cummulative
          />

          <AdminStatsUsersWithDocumentsChart
            data={monthlyUsersWithDocuments}
            title={"MAU (created document")}
            tooltip={"Monthly Active Users: Users that created at least one Documen"}
          />
          <AdminStatsUsersWithDocumentsChart
            data={monthlyUsersWithDocuments}
            completed
            title={msg"MAU (had document completed")}
            tooltip={
              "Monthly Active Users: Users that had at least one of their documents completed",
            }
          />
          <AdminStatsSignerConversionChart
            title="Signers that Signed Up"
            data={signerConversionMonthly}
          />
          <AdminStatsSignerConversionChart
            title={"Total Signers that Signed Up"}
            data={signerConversionMonthly}
            cummulative
          />
        </div>
      </div>
    </div>
  );
}
