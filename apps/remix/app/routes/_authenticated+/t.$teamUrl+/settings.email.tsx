import { trpc } from '@documenso/trpc/react';
import { SpinnerBox } from '@documenso/ui/primitives/spinner';
import { useToast } from '@documenso/ui/primitives/use-toast';

import {
  EmailPreferencesForm,
  type TEmailPreferencesFormSchema,
} from '~/components/forms/email-preferences-form';
import { SettingsHeader } from '~/components/general/settings-header';
import { useCurrentTeam } from '~/providers/team';
import { appMetaTags } from '~/utils/meta';

export function meta() {
  return appMetaTags('Settings');
}

export default function TeamEmailSettingsGeneral() {
  const { toast } = useToast();

  const team = useCurrentTeam();

  const { data: teamWithSettings, isLoading: isLoadingTeam } = trpc.team.get.useQuery({
    teamReference: team.url,
  });

  const { mutateAsync: updateTeamSettings } = trpc.team.settings.update.useMutation();

  const onEmailPreferencesSubmit = async (data: TEmailPreferencesFormSchema) => {
    try {
      const { emailId, emailReplyTo, emailDocumentSettings } = data;

      await updateTeamSettings({
        teamId: team.id,
        data: {
          emailId,
          emailReplyTo,
          // emailReplyToName,
          emailDocumentSettings,
        },
      });

      toast({
        title: "Email preferences updated",
        description: "Your email preferences have been updated",
      });
    } catch (err) {
      toast({
        title: "Something went wrong!",
        description: "We were unable to update your email preferences at this time, please try again later",
        variant: 'destructive',
      });
    }
  };

  if (isLoadingTeam || !teamWithSettings) {
    return <SpinnerBox />;
  }

  return (
    <div className="max-w-2xl">
      <SettingsHeader
        title={"Email Preferences"}
        subtitle={"You can manage your email preferences here"}
      />

      <section>
        <EmailPreferencesForm
          canInherit={true}
          settings={teamWithSettings.teamSettings}
          onFormSubmit={onEmailPreferencesSubmit}
        />
      </section>
    </div>
  );
}
