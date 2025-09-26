import type { RenderOptions } from '@documenso/email/render';
import { render } from '@documenso/email/render';

export const renderEmailWithI18N = async (
  component: React.ReactElement,
  options?: RenderOptions & {
    lang?: string;
  },
) => {
  // Just call render directly, ignoring i18n completely
  return render(component, options);
};
