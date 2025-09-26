import { Loader } from 'lucide-react';

import { DocumentSignatureType } from '@documenso/lib/constants/document';
import { trpc } from '@documenso/trpc/react';
import { useToast } from '@documenso/ui/primitives/use-toast';

import {
  DocumentPreferencesForm,
  type TDocumentPreferencesFormSchema,
} from '~/components/forms/document-preferences-form';
import { SettingsHeader } from '~/components/general/settings-header';
import { useCurrentTeam } from '~/providers/team';
import { appMetaTags } from '~/utils/meta';

export function meta() {
  return appMetaTags('Document Preferences');
}

export default function TeamsSettingsPage() {
  const team = useCurrentTeam();

  const { toast } = useToast();

  const { data: teamWithSettings, isLoading: isLoadingTeam } = trpc.team.get.useQuery({
    teamReference: team.id,
  });

  const { mutateAsync: updateTeamSettings } = trpc.team.settings.update.useMutation();

  const onDocumentPreferencesSubmit = async (data: TDocumentPreferencesFormSchema) => {
    try {
      const {
        documentVisibility,
        documentLanguage,
        documentTimezone,
        documentDateFormat,
        includeSenderDetails,
        includeSigningCertificate,
        includeAuditLog,
        signatureTypes,
      } = data;

      await updateTeamSettings({
        teamId: team.id,
        data: {
          documentVisibility,
          documentLanguage,
          documentTimezone,
          documentDateFormat,
          includeSenderDetails,
          includeSigningCertificate,
          includeAuditLog,
          ...(signatureTypes.length === 0
            ? {
                typedSignatureEnabled: null,
                uploadSignatureEnabled: null,
                drawSignatureEnabled: null,
              }
            : {
                typedSignatureEnabled: signatureTypes.includes(DocumentSignatureType.TYPE),
                uploadSignatureEnabled: signatureTypes.includes(DocumentSignatureType.UPLOAD),
                drawSignatureEnabled: signatureTypes.includes(DocumentSignatureType.DRAW),
              }),
        },
      });

      toast({
        title: "Document preferences updated",
        description: "Your document preferences have been updated",
      });
    } catch (err) {
      toast({
        title: "Something went wrong!",
        description: "We were unable to update your document preferences at this time, please try again later",
        variant: 'destructive',
      });
    }
  };

  if (isLoadingTeam || !teamWithSettings) {
    return (
      <div className="flex items-center justify-center rounded-lg py-32">
        <Loader className="text-muted-foreground h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <SettingsHeader
        title={"Document Preferences"}
        subtitle={"Here you can set preferences and defaults for your team."}
      />

      <section>
        <DocumentPreferencesForm
          canInherit={true}
          settings={teamWithSettings.teamSettings}
          onFormSubmit={onDocumentPreferencesSubmit}
        />
      </section>
    </div>
  );
}
