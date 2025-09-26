import type { RenderOptions } from '@documenso/email/render';
import { render } from '@documenso/email/render';

export const renderEmailWithoutI18N = async (
  component: React.ReactElement,
  options?: RenderOptions,
) => {
  try {
    return render(component, options);
  } catch (err) {
    console.error('Failed to render email:', err);
    throw new Error('Failed to render email');
  }
};
