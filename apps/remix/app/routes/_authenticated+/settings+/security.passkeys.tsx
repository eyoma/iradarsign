import { PasskeyCreateDialog } from '~/components/dialogs/passkey-create-dialog';
import { SettingsHeader } from '~/components/general/settings-header';
import { SettingsSecurityPasskeyTable } from '~/components/tables/settings-security-passkey-table';
import { appMetaTags } from '~/utils/meta';

export function meta() {
  return appMetaTags('Manage passkeys');
}

export default function SettingsPasskeys() {
  return (
    <div>
      <SettingsHeader
        title={"Passkeys"}
        subtitle={"Manage your passkeys."}
        hideDivider={true}
      >
        <PasskeyCreateDialog />
      </SettingsHeader>

      <div className="mt-4">
        <SettingsSecurityPasskeyTable />
      </div>
    </div>
  );
}
