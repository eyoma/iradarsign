import { NEXT_PUBLIC_WEBAPP_URL } from '@documenso/lib/constants/app';

export const appMetaTags = (title?: string) => {
  const description =
    'iRadarSign,  signing infrastructure, and get a 10x better signing experience. Sign in now and enjoy a faster, smarter, and more beautiful document signing process.';

  return [
    {
      title: title ? `${title} - iRadar` : 'iRadar',
    },
    {
      name: 'description',
      content: description,
    },
    {
      name: 'keywords',
      content:
        'iRadar, DocuSign alternative, document signing, fast signing, beautiful signing, smart templates',
    },
    {
      name: 'author',
      content: 'iRadar, Inc.',
    },
    {
      name: 'robots',
      content: 'index, follow',
    },
    {
      property: 'og:title',
      content: 'iRadarSign - The DocuSign Alternative',
    },
    {
      property: 'og:description',
      content: description,
    },
    {
      property: 'og:image',
      content: `${NEXT_PUBLIC_WEBAPP_URL()}/opengraph-image.jpg`,
    },
    {
      property: 'og:type',
      content: 'website',
    },
    {
      name: 'twitter:card',
      content: 'summary_large_image',
    },
    {
      name: 'twitter:site',
      content: '@iradarsign',
    },
    {
      name: 'twitter:description',
      content: description,
    },
    {
      name: 'twitter:image',
      content: `${NEXT_PUBLIC_WEBAPP_URL()}/opengraph-image.jpg`,
    },
  ];
};
