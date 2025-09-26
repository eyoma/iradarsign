import { zodResolver } from '@hookform/resolvers/zod';
import type { TeamGlobalSettings } from '@prisma/client';
import { DocumentVisibility } from '@prisma/client';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useSession } from '@documenso/lib/client-only/providers/session';
import { DATE_FORMATS } from '@documenso/lib/constants/date-formats';
import { DOCUMENT_SIGNATURE_TYPES, DocumentSignatureType } from '@documenso/lib/constants/document';
import {
  SUPPORTED_LANGUAGES,
  SUPPORTED_LANGUAGE_CODES,
  isValidLanguageCode,
} from '@documenso/lib/constants/i18n';
import { TIME_ZONES } from '@documenso/lib/constants/time-zones';
import { isPersonalLayout } from '@documenso/lib/utils/organisations';
import { extractTeamSignatureSettings } from '@documenso/lib/utils/teams';
import {
  type TDocumentMetaDateFormat,
  ZDocumentMetaTimezoneSchema,
} from '@documenso/trpc/server/document-router/schema';
import { DocumentSignatureSettingsTooltip } from '@documenso/ui/components/document/document-signature-settings-tooltip';
import { Alert } from '@documenso/ui/primitives/alert';
import { Button } from '@documenso/ui/primitives/button';
import { Combobox } from '@documenso/ui/primitives/combobox';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@documenso/ui/primitives/form/form';
import { MultiSelectCombobox } from '@documenso/ui/primitives/multi-select-combobox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@documenso/ui/primitives/select';

/**
 * Can't infer this from the schema since we need to keep the schema inside the component to allow
 * it to be dynamic.
 */
export type TDocumentPreferencesFormSchema = {
  documentVisibility: DocumentVisibility | null;
  documentLanguage: (typeof SUPPORTED_LANGUAGE_CODES)[number] | null;
  documentTimezone: string | null;
  documentDateFormat: TDocumentMetaDateFormat | null;
  includeSenderDetails: boolean | null;
  includeSigningCertificate: boolean | null;
  includeAuditLog: boolean | null;
  signatureTypes: DocumentSignatureType[];
};

type SettingsSubset = Pick<
  TeamGlobalSettings,
  | 'documentVisibility'
  | 'documentLanguage'
  | 'documentTimezone'
  | 'documentDateFormat'
  | 'includeSenderDetails'
  | 'includeSigningCertificate'
  | 'includeAuditLog'
  | 'typedSignatureEnabled'
  | 'uploadSignatureEnabled'
  | 'drawSignatureEnabled'
>;

export type DocumentPreferencesFormProps = {
  settings: SettingsSubset;
  canInherit: boolean;
  onFormSubmit: (data: TDocumentPreferencesFormSchema) => Promise<void>;
};

export const DocumentPreferencesForm = ({
  settings,
  onFormSubmit,
  canInherit,
}: DocumentPreferencesFormProps) => {
  const { user, organisations } = useSession();

  const isPersonalLayoutMode = isPersonalLayout(organisations);

  const placeholderEmail = user.email ?? 'user@example.com';

  const ZDocumentPreferencesFormSchema = z.object({
    documentVisibility: z.nativeEnum(DocumentVisibility).nullable(),
    documentLanguage: z.enum(SUPPORTED_LANGUAGE_CODES).nullable(),
    documentTimezone: z.string().nullable(),
    documentDateFormat: ZDocumentMetaTimezoneSchema.nullable(),
    includeSenderDetails: z.boolean().nullable(),
    includeSigningCertificate: z.boolean().nullable(),
    includeAuditLog: z.boolean().nullable(),
    signatureTypes: z.array(z.nativeEnum(DocumentSignatureType)).min(canInherit ? 0 : 1, {
      message: "At least one signature type must be enabled".id,
    }),
  });

  const form = useForm<TDocumentPreferencesFormSchema>({
    defaultValues: {
      documentVisibility: settings.documentVisibility,
      documentLanguage: isValidLanguageCode(settings.documentLanguage)
        ? settings.documentLanguage
        : null,
      documentTimezone: settings.documentTimezone,
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      documentDateFormat: settings.documentDateFormat as TDocumentMetaDateFormat | null,
      includeSenderDetails: settings.includeSenderDetails,
      includeSigningCertificate: settings.includeSigningCertificate,
      includeAuditLog: settings.includeAuditLog,
      signatureTypes: extractTeamSignatureSettings({ ...settings }),
    },
    resolver: zodResolver(ZDocumentPreferencesFormSchema),
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onFormSubmit)}>
        <fieldset
          className="flex h-full max-w-2xl flex-col gap-y-6"
          disabled={form.formState.isSubmitting}
        >
          {!isPersonalLayoutMode && (
            <FormField
              control={form.control}
              name="documentVisibility"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>
                    Default Document Visibility
                  </FormLabel>

                  <FormControl>
                    <Select
                      {...field}
                      value={field.value === null ? '-1' : field.value}
                      onValueChange={(value) => field.onChange(value === '-1' ? null : value)}
                    >
                      <SelectTrigger
                        className="bg-background text-muted-foreground"
                        data-testid="document-visibility-trigger"
                      >
                        <SelectValue />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value={DocumentVisibility.EVERYONE}>
                          Everyone can access and view the document
                        </SelectItem>
                        <SelectItem value={DocumentVisibility.MANAGER_AND_ABOVE}>
                          Only managers and above can access and view the document
                        </SelectItem>
                        <SelectItem value={DocumentVisibility.ADMIN}>
                          Only admins can access and view the document
                        </SelectItem>

                        {canInherit && (
                          <SelectItem value={'-1'}>
                            Inherit from organisation
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </FormControl>

                  <FormDescription>
                    Controls the default visibility of an uploaded document.
                  </FormDescription>
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="documentLanguage"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>
                  Default Document Language
                </FormLabel>

                <FormControl>
                  <Select
                    {...field}
                    value={field.value === null ? '-1' : field.value}
                    onValueChange={(value) => field.onChange(value === '-1' ? null : value)}
                  >
                    <SelectTrigger
                      className="bg-background text-muted-foreground"
                      data-testid="document-language-trigger"
                    >
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                      {Object.entries(SUPPORTED_LANGUAGES).map(([code, language]) => (
                        <SelectItem key={code} value={code}>
                          {language.full}
                        </SelectItem>
                      ))}

                      <SelectItem value={'-1'}>
                        Inherit from organisation
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>

                <FormDescription>
                  
                    Controls the default language of an uploaded document. This will be used as the
                    language in email communications with the recipients.
                  
                </FormDescription>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="documentDateFormat"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Default Date Format
                </FormLabel>

                <FormControl>
                  <Select
                    value={field.value === null ? '-1' : field.value}
                    onValueChange={(value) => field.onChange(value === '-1' ? null : value)}
                  >
                    <SelectTrigger data-testid="document-date-format-trigger">
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                      {DATE_FORMATS.map((format) => (
                        <SelectItem key={format.key} value={format.value}>
                          {format.label}
                        </SelectItem>
                      ))}

                      {canInherit && (
                        <SelectItem value={'-1'}>
                          Inherit from organisation
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="documentTimezone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Default Time Zone
                </FormLabel>

                <FormControl>
                  <Combobox
                    triggerPlaceholder={
                      canInherit ? "Inherit from organisation" : "Local timezone"
                    }
                    placeholder={"Select a time zone"}
                    options={TIME_ZONES}
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                    testId="document-timezone-trigger"
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="signatureTypes"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel className="flex flex-row items-center">
                  Default Signature Settings
                  <DocumentSignatureSettingsTooltip />
                </FormLabel>

                <FormControl>
                  <MultiSelectCombobox
                    options={Object.values(DOCUMENT_SIGNATURE_TYPES).map((option) => ({
                      label: t(option.label),
                      value: option.value,
                    }))}
                    selectedValues={field.value}
                    onChange={field.onChange}
                    className="bg-background w-full"
                    enableSearch={false}
                    emptySelectionPlaceholder={
                      canInherit ? "Inherit from organisation" : "Select signature types"
                    }
                    testId="signature-types-trigger"
                  />
                </FormControl>

                {form.formState.errors.signatureTypes ? (
                  <FormMessage />
                ) : (
                  <FormDescription>
                    
                      Controls which signatures are allowed to be used when signing a document.
                    
                  </FormDescription>
                )}
              </FormItem>
            )}
          />

          {!isPersonalLayoutMode && (
            <FormField
              control={form.control}
              name="includeSenderDetails"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>
                    Send on Behalf of Team
                  </FormLabel>

                  <FormControl>
                    <Select
                      {...field}
                      value={field.value === null ? '-1' : field.value.toString()}
                      onValueChange={(value) =>
                        field.onChange(value === 'true' ? true : value === 'false' ? false : null)
                      }
                    >
                      <SelectTrigger
                        className="bg-background text-muted-foreground"
                        data-testid="include-sender-details-trigger"
                      >
                        <SelectValue />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="true">
                          Yes
                        </SelectItem>

                        <SelectItem value="false">
                          No
                        </SelectItem>

                        {canInherit && (
                          <SelectItem value={'-1'}>
                            Inherit from organisation
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </FormControl>

                  <div className="pt-2">
                    <div className="text-muted-foreground text-xs font-medium">
                      Preview
                    </div>

                    <Alert variant="neutral" className="mt-1 px-2.5 py-1.5 text-sm">
                      {field.value ? (
                        
                          "{placeholderEmail}" on behalf of "Team Name" has invited you to sign
                          "example document".
                        
                      ) : (
                        "Team Name" has invited you to sign "example document".
                      )}
                    </Alert>
                  </div>

                  <FormDescription>
                    
                      Controls the formatting of the message that will be sent when inviting a
                      recipient to sign a document. If a custom message has been provided while
                      configuring the document, it will be used instead.
                    
                  </FormDescription>
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="includeSigningCertificate"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>
                  Include the Signing Certificate in the Document
                </FormLabel>

                <FormControl>
                  <Select
                    {...field}
                    value={field.value === null ? '-1' : field.value.toString()}
                    onValueChange={(value) =>
                      field.onChange(value === 'true' ? true : value === 'false' ? false : null)
                    }
                  >
                    <SelectTrigger
                      className="bg-background text-muted-foreground"
                      data-testid="include-signing-certificate-trigger"
                    >
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="true">
                        Yes
                      </SelectItem>

                      <SelectItem value="false">
                        No
                      </SelectItem>

                      {canInherit && (
                        <SelectItem value={'-1'}>
                          Inherit from organisation
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </FormControl>

                <FormDescription>
                  
                    Controls whether the signing certificate will be included in the document when
                    it is downloaded. The signing certificate can still be downloaded from the logs
                    page separately.
                  
                </FormDescription>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="includeAuditLog"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>
                  Include the Audit Logs in the Document
                </FormLabel>

                <FormControl>
                  <Select
                    {...field}
                    value={field.value === null ? '-1' : field.value.toString()}
                    onValueChange={(value) =>
                      field.onChange(value === 'true' ? true : value === 'false' ? false : null)
                    }
                  >
                    <SelectTrigger className="bg-background text-muted-foreground">
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="true">
                        Yes
                      </SelectItem>

                      <SelectItem value="false">
                        No
                      </SelectItem>

                      {canInherit && (
                        <SelectItem value={'-1'}>
                          Inherit from organisation
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </FormControl>

                <FormDescription>
                  
                    Controls whether the audit logs will be included in the document when it is
                    downloaded. The audit logs can still be downloaded from the logs page
                    separately.
                  
                </FormDescription>
              </FormItem>
            )}
          />

          <div className="flex flex-row justify-end space-x-4">
            <Button type="submit" loading={form.formState.isSubmitting}>
              Update
            </Button>
          </div>
        </fieldset>
      </form>
    </Form>
  );
};
