import { useEffect } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { FaIdCardClip } from 'react-icons/fa6';
import { FcGoogle } from 'react-icons/fc';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { z } from 'zod';

import communityCardsImage from '@documenso/assets/images/community-cards.png';
import { authClient } from '@documenso/auth/client';
import { useAnalytics } from '@documenso/lib/client-only/hooks/use-analytics';
import { AppError, AppErrorCode } from '@documenso/lib/errors/app-error';
import { ZPasswordSchema } from '@documenso/trpc/server/auth-router/schema';
import { cn } from '@documenso/ui/lib/utils';
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
import { PasswordInput } from '@documenso/ui/primitives/password-input';
import { SignaturePadDialog } from '@documenso/ui/primitives/signature-pad/signature-pad-dialog';
import { useToast } from '@documenso/ui/primitives/use-toast';

import { UserProfileTimur } from '~/components/general/user-profile-timur';

export const ZSignUpFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, { message: "Please enter a valid name.".id }),
    email: z.string().email().min(1),
    password: ZPasswordSchema,
    signature: z.string().min(1, { message: "We need your signature to sign documents".id }),
  })
  .refine(
    (data) => {
      const { name, email, password } = data;
      return !password.includes(name) && !password.includes(email.split('@')[0]);
    },
    {
      message: "Password should not be common or based on personal information".id,
      path: ['password'],
    },
  );

export const signupErrorMessages: Record<string, MessageDescriptor> = {
  SIGNUP_DISABLED: "Signups are disabled.",
  [AppErrorCode.ALREADY_EXISTS]: "User with this email already exists. Please use a different email address.",
  [AppErrorCode.INVALID_REQUEST]: "We were unable to create your account. Please review the information you provided and try again.",
};

export type TSignUpFormSchema = z.infer<typeof ZSignUpFormSchema>;

export type SignUpFormProps = {
  className?: string;
  initialEmail?: string;
  isGoogleSSOEnabled?: boolean;
  isOIDCSSOEnabled?: boolean;
};

export const SignUpForm = ({
  className,
  initialEmail,
  isGoogleSSOEnabled,
  isOIDCSSOEnabled,
}: SignUpFormProps) => {
  const { toast } = useToast();

  const analytics = useAnalytics();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const utmSrc = searchParams.get('utm_source') ?? null;

  const form = useForm<TSignUpFormSchema>({
    values: {
      name: '',
      email: initialEmail ?? '',
      password: '',
      signature: '',
    },
    mode: 'onBlur',
    resolver: zodResolver(ZSignUpFormSchema),
  });

  const isSubmitting = form.formState.isSubmitting;

  const onFormSubmit = async ({ name, email, password, signature }: TSignUpFormSchema) => {
    try {
      await authClient.emailPassword.signUp({
        name,
        email,
        password,
        signature,
      });

      await navigate(`/unverified-accoun");

      toast({
        title: msg"Registration Successful`,
        description: 
          "You have successfully registered. Please verify your account by clicking on the link you received in the email.",
        ,
        duration: 5000,
      });

      analytics.capture('App: User Sign Up', {
        email,
        timestamp: new Date().toISOString(),
        custom_campaign_params: { src: utmSrc },
      });
    } catch (err) {
      const error = AppError.parseError(err);

      const errorMessage = signupErrorMessages[error.code] ?? signupErrorMessages.INVALID_REQUEST;

      toast({
        title: "An error occurred",
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const onSignUpWithGoogleClick = async () => {
    try {
      await authClient.google.signIn();
    } catch (err) {
      toast({
        title: "An unknown error occurred",
        description: 
          "We encountered an unknown error while attempting to sign you Up. Please try again later.",
        ,
        variant: 'destructive',
      });
    }
  };

  const onSignUpWithOIDCClick = async () => {
    try {
      await authClient.oidc.signIn();
    } catch (err) {
      toast({
        title: "An unknown error occurred",
        description: 
          "We encountered an unknown error while attempting to sign you Up. Please try again later.",
        ,
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    const hash = window.location.hash.slice(1);

    const params = new URLSearchParams(hash);

    const email = params.get('email');

    if (email) {
      form.setValue('email', email);
    }
  }, [form]);

  return (
    <div className={cn('flex justify-center gap-x-12', className)}>
      <div className="border-border relative hidden flex-1 overflow-hidden rounded-xl border xl:flex">
        <div className="absolute -inset-8 -z-[2] backdrop-blur">
          <img
            src={communityCardsImage}
            alt="community-cards"
            className="h-full w-full object-cover dark:brightness-95 dark:contrast-[70%] dark:invert"
          />
        </div>

        <div className="bg-background/50 absolute -inset-8 -z-[1] backdrop-blur-[2px]" />

        <div className="relative flex h-full w-full flex-col items-center justify-evenly">
          <div className="bg-background rounded-2xl border px-4 py-1 text-sm font-medium">
            User profiles are here!
          </div>

          <div className="w-full max-w-md">
            <UserProfileTimur
              rows={2}
              className="bg-background border-border rounded-2xl border shadow-md"
            />
          </div>

          <div />
        </div>
      </div>

      <div className="border-border dark:bg-background relative z-10 flex min-h-[min(850px,80vh)] w-full max-w-lg flex-col rounded-xl border bg-neutral-100 p-6">
        <div className="h-20">
          <h1 className="text-xl font-semibold md:text-2xl">
            Create a new account
          </h1>

          <p className="text-muted-foreground mt-2 text-xs md:text-sm">
            
              Create your account and start using state-of-the-art document signing. Open and
              beautiful signing is within your grasp.
            
          </p>
        </div>

        <hr className="-mx-6 my-4" />

        <Form {...form}>
          <form
            className="flex w-full flex-1 flex-col gap-y-4"
            onSubmit={form.handleSubmit(onFormSubmit)}
          >
            <fieldset
              className={cn(
                'flex h-[550px] w-full flex-col gap-y-4',
                (isGoogleSSOEnabled || isOIDCSSOEnabled) && 'h-[650px]',
              )}
              disabled={isSubmitting}
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Full Name
                    </FormLabel>
                    <FormControl>
                      <Input type="text" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Email Address
                    </FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Password
                    </FormLabel>

                    <FormControl>
                      <PasswordInput {...field} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="signature"
                render={({ field: { onChange, value } }) => (
                  <FormItem>
                    <FormLabel>
                      Sign Here
                    </FormLabel>
                    <FormControl>
                      <SignaturePadDialog
                        disabled={isSubmitting}
                        value={value}
                        onChange={(v) => onChange(v ?? '')}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              {(isGoogleSSOEnabled || isOIDCSSOEnabled) && (
                <>
                  <div className="relative flex items-center justify-center gap-x-4 py-2 text-xs uppercase">
                    <div className="bg-border h-px flex-1" />
                    <span className="text-muted-foreground bg-transparent">
                      Or
                    </span>
                    <div className="bg-border h-px flex-1" />
                  </div>
                </>
              )}

              {isGoogleSSOEnabled && (
                <>
                  <Button
                    type="button"
                    size="lg"
                    variant={'outline'}
                    className="bg-background text-muted-foreground border"
                    disabled={isSubmitting}
                    onClick={onSignUpWithGoogleClick}
                  >
                    <FcGoogle className="mr-2 h-5 w-5" />
                    Sign Up with Google
                  </Button>
                </>
              )}

              {isOIDCSSOEnabled && (
                <>
                  <Button
                    type="button"
                    size="lg"
                    variant={'outline'}
                    className="bg-background text-muted-foreground border"
                    disabled={isSubmitting}
                    onClick={onSignUpWithOIDCClick}
                  >
                    <FaIdCardClip className="mr-2 h-5 w-5" />
                    Sign Up with OIDC
                  </Button>
                </>
              )}

              <p className="text-muted-foreground mt-4 text-sm">
                
                  Already have an account?{' '}
                  <Link to="/signin" className="text-documenso-700 duration-200 hover:opacity-70">
                    Sign in instead
                  </Link>
                
              </p>
            </fieldset>

            <Button
              loading={form.formState.isSubmitting}
              type="submit"
              size="lg"
              className="mt-6 w-full"
            >
              Complete
            </Button>
          </form>
        </Form>
        <p className="text-muted-foreground mt-6 text-xs">
          
            By proceeding, you agree to our{' '}
            <Link
              to="https://documen.so/terms"
              target="_blank"
              className="text-documenso-700 duration-200 hover:opacity-70"
            >
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link
              to="https://documen.so/privacy"
              target="_blank"
              className="text-documenso-700 duration-200 hover:opacity-70"
            >
              Privacy Policy
            </Link>
            .
          
        </p>
      </div>
    </div>
  );
};
