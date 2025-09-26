import { OrganisationGroupCreateDialog } from '~/components/dialogs/organisation-group-create-dialog';
import { SettingsHeader } from '~/components/general/settings-header';
import { OrganisationGroupsDataTable } from '~/components/tables/organisation-groups-table';

export default function TeamsSettingsMembersPage() {
  return (
    <div>
      <SettingsHeader
        title={"Custom Organisation Groups"}
        subtitle={"Manage the custom groups of members for your organisation."}
      >
        <OrganisationGroupCreateDialog />
      </SettingsHeader>

      <div>
        <OrganisationGroupsDataTable />
      </div>
    </div>
  );
}
