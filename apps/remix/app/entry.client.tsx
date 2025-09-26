import { StrictMode, startTransition, useEffect } from 'react';

import posthog from 'posthog-js';
import { hydrateRoot } from 'react-dom/client';
import { HydratedRouter } from 'react-router/dom';

import { extractPostHogConfig } from '@documenso/lib/constants/feature-flags';

function PosthogInit() {
  const postHogConfig = extractPostHogConfig();

  useEffect(() => {
    if (postHogConfig) {
      posthog.init(postHogConfig.key, {
        api_host: postHogConfig.host,
        capture_exceptions: true,
      });
    }
  }, []);

  return null;
}

async function main() {
  startTransition(() => {
    hydrateRoot(
      document,
      <StrictMode>
        <HydratedRouter />
        <PosthogInit />
      </StrictMode>,
    );
  });
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
main();
