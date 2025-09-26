import { zodResolver } from '@hookform/resolvers/zod';
import { OrganisationMemberRole } from '@prisma/client';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useCurrentOrganisation } from '@documenso/lib/client-only/providers/organisation';
import { ORGANISATION_MEMBER_ROLE_HIERARCHY } from '@documenso/lib/constants/organisations';
import { ORGANISATION_MEMBER_ROLE_MAP } from '@documenso/lib/constants/organisations-translations';
import {
  formatOrganisationCallbackUrl,
  formatOrganisationLoginUrl,
} from '@documenso/lib/utils/organisation-authentication-portal';
import { trpc } from '@documenso/trpc/react';
import { domainRegex } from '@documenso/trpc/server/enterprise-router/create-organisation-email-domain.types';
import type { TGetOrganisationAuthenticationPortalResponse } from '@documenso/trpc/server/enterprise-router/get-organisation-authentication-portal.types';
import { ZUpdateOrganisationAuthenticationPortalRequestSchema } from '@documenso/trpc/server/enterprise-router/update-organisation-authentication-portal.types';
import { CopyTextButton } from '@documenso/ui/components/common/copy-text-button';
import { Alert, AlertDescription } from '@documenso/ui/primitives/alert';
import { Button } from '@documenso/ui/primitives/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@documenso/ui/primitives/form/form';
import { Input } from '@documenso/ui/primitives/input';
import { Label } from '@documenso/ui/primitives/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@documenso/ui/primitives/select';
import { SpinnerBox } from '@documenso/ui/primitives/spinner';
import { Switch } from '@documenso/ui/primitives/switch';
import { Textarea } from '@documenso/ui/primitives/textarea';
import { useToast } from '@documenso/ui/primitives/use-toast';

import { SettingsHeader } from '~/components/general/settings-header';
import { appMetaTags } from '~/utils/meta';

const ZProviderFormSchema = ZUpdateOrganisationAuthenticationPortalRequestSchema.shape.data
  .pick({
    enabled: true,
    wellKnownUrl: true,
    clientId: true,
    autoProvisionUsers: true,
    defaultOrganisationRole: true,
  })
  .extend({
    clientSecret: z.string().nullable(),
    allowedDomains: z.string().refine(
      (value) => {
        const domains = value.split(' ').filter(Boolean);

        return domains.every((domain) => domainRegex.test(domain));
      },
      {
        message: "Invalid domains".id,
      },
    ),
  });

type TProviderFormSchema = z.infer<typeof ZProviderFormSchema>;

export function meta() {
  return appMetaTags('Organisation SSO Portal');
}

export default function OrganisationSettingSSOLoginPage() {
  const organisation = useCurrentOrganisation();

  const { data: authenticationPortal, isLoading: isLoadingAuthenticationPortal } =
    trpc.enterprise.organisation.authenticationPortal.get.useQuery({
      organisationId: organisation.id,
    });

  if (isLoadingAuthenticationPortal || !authenticationPortal) {
    return <SpinnerBox className="py-32" />;
  }

  return (
    <div className="max-w-2xl">
      <SettingsHeader
        title={"Organisation SSO Portal"}
        subtitle={"Manage a custom SSO login portal for your organisation."}
      />

      <SSOProviderForm authenticationPortal={authenticationPortal} />
    </div>
  );
}

type SSOProviderFormProps = {
  authenticationPortal: TGetOrganisationAuthenticationPortalResponse;
};

const SSOProviderForm = ({ authenticationPortal }: SSOProviderFormProps) => {
  const { toast } = useToast();

  const organisation = useCurrentOrganisation();

  const { mutateAsync: updateOrganisationAuthenticationPortal } =
    trpc.enterprise.organisation.authenticationPortal.update.useMutation();

  const form = useForm<TProviderFormSchema>({
    resolver: zodResolver(ZProviderFormSchema),
    defaultValues: {
      enabled: authenticationPortal.enabled,
      clientId: authenticationPortal.clientId,
      clientSecret: authenticationPortal.clientSecretProvided ? null : '',
      wellKnownUrl: authenticationPortal.wellKnownUrl,
      autoProvisionUsers: authenticationPortal.autoProvisionUsers,
      defaultOrganisationRole: authenticationPortal.defaultOrganisationRole,
      allowedDomains: authenticationPortal.allowedDomains.join(' '),
    },
  });

  const onSubmit = async (values: TProviderFormSchema) => {
    const { enabled, clientId, clientSecret, wellKnownUrl } = values;

    if (enabled && !clientId) {
      form.setError('clientId', {
        message: "Client ID is required",
      });

      return;
    }

    if (enabled && clientSecret === '') {
      form.setError('clientSecret', {
        message: "Client secret is required",
      });

      return;
    }

    if (enabled && !wellKnownUrl) {
      form.setError('wellKnownUrl', {
        message: "Well-known URL is required",
      });

      return;
    }

    try {
      await updateOrganisationAuthenticationPortal({
        organisationId: organisation.id,
        data: {
          enabled,
          clientId,
          clientSecret: values.clientSecret ?? undefined,
          wellKnownUrl,
          autoProvisionUsers: values.autoProvisionUsers,
          defaultOrganisationRole: values.defaultOrganisationRole,
          allowedDomains: values.allowedDomains.split(' ').filter(Boolean),
        },
      });

      toast({
        title: "Success",
        description: "Provider has been updated successfully",
        duration: 5000,
      });
    } catch (err) {
      console.error(err);

      toast({
        title: "An error occurred",
        description: "We couldn't update the provider. Please try again.",
        variant: 'destructive',
      });
    }
  };

  const isSsoEnabled = form.watch('enabled');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <fieldset disabled={form.formState.isSubmitting} className="space-y-6">
          <div className="space-y-2">
            <Label>
              Organisation authentication portal URL
            </Label>

            <div className="relative">
              <Input
                className="pr-12"
                disabled
                value={formatOrganisationLoginUrl(organisation.url)}
              />
              <div className="absolute bottom-0 right-2 top-0 flex items-center justify-center">
                <CopyTextButton
                  value={formatOrganisationLoginUrl(organisation.url)}
                  onCopySuccess={() => toast({ title: "Copied to clipboard" })}
                />
              </div>
            </div>

            <p className="text-muted-foreground text-xs">
              This is the URL which users will use to sign in to your organisation.
            </p>
          </div>

          <div className="space-y-2">
            <Label>
              Redirect URI
            </Label>

            <div className="relative">
              <Input
                className="pr-12"
                disabled
                value={formatOrganisationCallbackUrl(organisation.url)}
              />
              <div className="absolute bottom-0 right-2 top-0 flex items-center justify-center">
                <CopyTextButton
                  value={formatOrganisationCallbackUrl(organisation.url)}
                  onCopySuccess={() => toast({ title: "Copied to clipboard" })}
                />
              </div>
            </div>

            <p className="text-muted-foreground text-xs">
              Add this URL to your provider's allowed redirect URIs
            </p>
          </div>

          <div className="space-y-2">
            <Label>
              Required scopes
            </Label>

            <Input className="pr-12" disabled value={`openid profile email`} />

            <p className="text-muted-foreground text-xs">
              This is the required scopes you must set in your provider's settings
            </p>
          </div>

          <FormField
            control={form.control}
            name="wellKnownUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel required={isSsoEnabled}>
                  Issuer URL
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={'https://your-provider.com/.well-known/openid-configuration'}
                    {...field}
                  />
                </FormControl>

                {!form.formState.errors.wellKnownUrl && (
                  <p className="text-muted-foreground text-xs">
                    The OpenID discovery endpoint URL for your provider
                  </p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="clientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required={isSsoEnabled}>
                    Client ID
                  </FormLabel>
                  <FormControl>
                    <Input id="client-id" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="clientSecret"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required={isSsoEnabled}>
                    Client Secret
                  </FormLabel>
                  <FormControl>
                    <Input
                      id="client-secret"
                      type="password"
                      {...field}
                      value={field.value === null ? '**********************' : field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="defaultOrganisationRole"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Default Organisation Role for New Users
                </FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder={"Select default role"} />
                    </SelectTrigger>
                    <SelectContent>
                      {ORGANISATION_MEMBER_ROLE_HIERARCHY[OrganisationMemberRole.MANAGER].map(
                        (role) => (
                          <SelectItem key={role} value={role}>
                            {t(ORGANISATION_MEMBER_ROLE_MAP[role])}
                          </SelectItem>
                        ),
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
            name="allowedDomains"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Allowed Email Domains
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder={"your-domain.com another-domain.com"}
                    className="min-h-[80px]"
                  />
                </FormControl>

                {!form.formState.errors.allowedDomains && (
                  <p className="text-muted-foreground text-xs">
                    
                      Space-separated list of domains. Leave empty to allow all domains.
                    
                  </p>
                )}

                <FormMessage />
              </FormItem>
            )}
          />

          {/* Todo: This is just dummy toggle, we need to decide what this does first. */}
          {/* <FormField
            control={form.control}
            name="autoProvisionUsers"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border px-4 py-3">
                <div className="space-y-0.5">
                  <FormLabel>
                    Auto-provision Users
                  </FormLabel>
                  <p className="text-muted-foreground text-sm">
                    Automatically create accounts for new users on first login
                  </p>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          /> */}

          <FormField
            control={form.control}
            name="enabled"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border px-4 py-3">
                <div className="space-y-0.5">
                  <FormLabel>
                    Enable SSO portal
                  </FormLabel>
                  <p className="text-muted-foreground text-sm">
                    Whether to enable the SSO portal for your organisation
                  </p>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Alert variant="warning">
            <AlertDescription>
              
                Please note that anyone who signs in through your portal will be added to your
                organisation as a member.
              
            </AlertDescription>
          </Alert>

          <div className="flex justify-end gap-2">
            <Button loading={form.formState.isSubmitting} type="submit">
              Update
            </Button>
          </div>
        </fieldset>
      </form>
    </Form>
  );
};
