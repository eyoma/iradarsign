import { Body, Button, Container, Head, Html, Img, Preview, Section, Text } from '../components';

export interface ConfirmEmailFallbackProps {
  confirmationLink: string;
  assetBaseUrl?: string;
}

export const ConfirmEmailFallbackTemplate = ({
  confirmationLink,
  assetBaseUrl = 'http://localhost:3002',
}: ConfirmEmailFallbackProps) => {
  const _getAssetUrl = (path: string) => {
    return new URL(path, assetBaseUrl).toString();
  };

  return (
    <Html>
      <Head />
      <Preview>Please confirm your email address</Preview>
      <Body className="mx-auto my-auto bg-white font-sans">
        <Section>
          <Container className="mx-auto mb-2 mt-8 max-w-xl rounded-lg border border-solid border-slate-200 p-4 backdrop-blur-sm">
            <Section>
              <Img
                src={'https://iradardata.com/wp-content/uploads/2020/09/Group-2537.png'}
                width={200}
                height={50}
                alt="iRadarSign Logo"
                className="mb-4 h-6"
              />

              <Section className="flex-row items-center justify-center">
                <Text className="text-primary mx-auto mb-0 max-w-[80%] text-center text-lg font-semibold">
                  Welcome to iRadarSign!
                </Text>

                <Text className="my-1 text-center text-base text-slate-400">
                  Before you get started, please confirm your email address by clicking the button
                  below:
                </Text>

                <Section className="mb-6 mt-8 text-center">
                  <Button
                    className="bg-documenso-500 inline-flex items-center justify-center rounded-lg px-6 py-3 text-center text-sm font-medium text-black no-underline"
                    href={confirmationLink}
                  >
                    Confirm email
                  </Button>
                  <Text className="mt-8 text-center text-sm italic text-slate-400">
                    You can also copy and paste this link into your browser: {confirmationLink}{' '}
                    (link expires in 1 hour)
                  </Text>
                </Section>
              </Section>
            </Section>
          </Container>
          <div className="mx-auto mt-12 max-w-xl" />

          <Container className="mx-auto max-w-xl">
            <Text className="text-center text-xs text-slate-400">
              © 2024 Documenso. All rights reserved.
            </Text>
          </Container>
        </Section>
      </Body>
    </Html>
  );
};

export default ConfirmEmailFallbackTemplate;
