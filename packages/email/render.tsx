import { Children, cloneElement, isValidElement } from 'react';

import * as ReactEmail from '@react-email/render';

import config from '@documenso/tailwind-config';

import { Tailwind } from './components';
import type { BrandingSettings } from './providers/branding';

export type RenderOptions = ReactEmail.Options & {
  branding?: BrandingSettings;
};

// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
const colors = (config.theme?.extend?.colors || {}) as Record<string, string>;

// Helper function to add branding prop to React elements
const addBrandingToElement = (
  element: React.ReactNode,
  branding?: BrandingSettings,
): React.ReactNode => {
  if (!isValidElement(element)) {
    return element;
  }

  // Clone the element and add branding prop
  const clonedElement = cloneElement(element, {
    ...element.props,
    branding: branding,
  });

  // Recursively process children
  if (element.props.children) {
    const processedChildren = Children.map(element.props.children, (child) => {
      if (isValidElement(child)) {
        return addBrandingToElement(child, branding);
      }
      return child;
    });

    const newProps = {
      ...(clonedElement.props || {}),
      children: processedChildren,
    };

    return cloneElement(clonedElement, newProps);
  }

  return clonedElement;
};

export const render = (element: React.ReactNode, options?: RenderOptions) => {
  console.log('[Email Render] render() function called');
  console.log('[Email Render] Element:', element);
  console.log('[Email Render] Options:', options);

  const { branding, ...otherOptions } = options ?? {};

  console.log('[Email Render] Branding options:', branding);
  console.log('[Email Render] Other options:', otherOptions);

  // Add branding prop to the element instead of using BrandingProvider
  const elementWithBranding = addBrandingToElement(element, branding);

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
      {elementWithBranding}
    </Tailwind>
  );

  console.log('[Email Render] Wrapped element with branding props');

  return ReactEmail.render(wrappedElement, otherOptions);
};

export const renderAsync = async (element: React.ReactNode, options?: RenderOptions) => {
  console.log('[Email Render] renderAsync() function called');
  console.log('[Email Render] Element:', element);
  console.log('[Email Render] Options:', options);

  const { branding, ...otherOptions } = options ?? {};

  console.log('[Email Render] Branding options:', branding);
  console.log('[Email Render] Other options:', otherOptions);

  // Add branding prop to the element instead of using BrandingProvider
  const elementWithBranding = addBrandingToElement(element, branding);

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
      {elementWithBranding}
    </Tailwind>
  );

  console.log('[Email Render] Wrapped element with branding props (async)');

  return await ReactEmail.renderAsync(wrappedElement, otherOptions);
};
