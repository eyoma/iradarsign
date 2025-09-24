import type { ImgHTMLAttributes } from 'react';

import LogoImage from '@documenso/assets/logo.png';

export type LogoProps = ImgHTMLAttributes<HTMLImageElement>;

export const BrandingLogo = ({ className, ...props }: LogoProps) => {
  return (
    <img src={LogoImage} alt="iRadar Logo" className={`h-6 w-auto ${className || ''}`} {...props} />
  );
};
