import * as ReactEmail from '@react-email/render';

import config from '@documenso/tailwind-config';

import { Tailwind } from './components';
import { BrandingProvider, type BrandingSettings } from './providers/branding';

export type RenderOptions = ReactEmail.Options & {
  branding?: BrandingSettings;
};

// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
const colors = (config.theme?.extend?.colors || {}) as Record<string, string>;

export const render = (element: React.ReactNode, options?: RenderOptions) => {
  console.log('[Email Render] render() function called');
  console.log('[Email Render] Element:', element);
  console.log('[Email Render] Options:', options);
  
  const { branding, ...otherOptions } = options ?? {};
  
  console.log('[Email Render] Branding options:', branding);
  console.log('[Email Render] Other options:', otherOptions);

  const wrappedElement = (
    <Tailwind
      config={{
        theme: {
          extend: {
            colors,
          },
        },
      }}
    >
      <BrandingProvider branding={branding}>{element}</BrandingProvider>
    </Tailwind>
  );

  console.log('[Email Render] Wrapped element with BrandingProvider');
  
  return ReactEmail.render(wrappedElement, otherOptions);
};

export const renderAsync = async (element: React.ReactNode, options?: RenderOptions) => {
  console.log('[Email Render] renderAsync() function called');
  console.log('[Email Render] Element:', element);
  console.log('[Email Render] Options:', options);
  
  const { branding, ...otherOptions } = options ?? {};
  
  console.log('[Email Render] Branding options:', branding);
  console.log('[Email Render] Other options:', otherOptions);

  const wrappedElement = (
    <Tailwind
      config={{
        theme: {
          extend: {
            colors,
          },
        },
      }}
    >
      <BrandingProvider branding={branding}>{element}</BrandingProvider>
    </Tailwind>
  );

  console.log('[Email Render] Wrapped element with BrandingProvider (async)');
  
  return await ReactEmail.renderAsync(wrappedElement, otherOptions);
};
