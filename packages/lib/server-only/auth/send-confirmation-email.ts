import { createElement } from 'react';

import { msg } from '@lingui/core/macro';

import { mailer } from '@documenso/email/mailer';
import { render } from '@documenso/email/render';
import { ConfirmEmailTemplate } from '@documenso/email/templates/confirm-email';
import { ConfirmEmailFallbackTemplate } from '@documenso/email/templates/confirm-email-fallback';
import { prisma } from '@documenso/prisma';

import { getI18nInstance } from '../../client-only/providers/i18n-server';
import { NEXT_PUBLIC_WEBAPP_URL } from '../../constants/app';
import {
  DOCUMENSO_INTERNAL_EMAIL,
  USER_SIGNUP_VERIFICATION_TOKEN_IDENTIFIER,
} from '../../constants/email';
import { renderEmailWithI18N } from '../../utils/render-email-with-i18n';

export interface SendConfirmationEmailProps {
  userId: number;
}

export const sendConfirmationEmail = async ({ userId }: SendConfirmationEmailProps) => {
  const user = await prisma.user.findFirstOrThrow({
    where: {
      id: userId,
    },
    include: {
      verificationTokens: {
        where: {
          identifier: USER_SIGNUP_VERIFICATION_TOKEN_IDENTIFIER,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 1,
      },
    },
  });

  const [verificationToken] = user.verificationTokens;

  if (!verificationToken?.token) {
    throw new Error('Verification token not found for the user');
  }

  const assetBaseUrl = NEXT_PUBLIC_WEBAPP_URL() || 'http://localhost:3000';
  const confirmationLink = `${assetBaseUrl}/verify-email/${verificationToken.token}`;

  const confirmationTemplate = createElement(ConfirmEmailTemplate, {
    assetBaseUrl,
    confirmationLink,
  });

  let html: string;
  let text: string;
  let subject: string;

  try {
    const [renderedHtml, renderedText] = await Promise.all([
      renderEmailWithI18N(confirmationTemplate),
      renderEmailWithI18N(confirmationTemplate, { plainText: true }),
    ]);

    html = renderedHtml;
    text = renderedText;

    const i18n = await getI18nInstance();
    subject = i18n._(msg`Please confirm your email`);
  } catch (err) {
    console.error('Failed to render email with i18n, using fallback template:', err);

    // Use fallback template without i18n
    const fallbackTemplate = createElement(ConfirmEmailFallbackTemplate, {
      assetBaseUrl,
      confirmationLink,
    });

    const [renderedHtml, renderedText] = await Promise.all([
      render(fallbackTemplate),
      render(fallbackTemplate, { plainText: true }),
    ]);

    html = renderedHtml;
    text = renderedText;
    subject = 'Please confirm your email';
  }

  return mailer.sendMail({
    to: {
      address: user.email,
      name: user.name || '',
    },
    from: DOCUMENSO_INTERNAL_EMAIL,
    subject,
    html,
    text,
  });
};
