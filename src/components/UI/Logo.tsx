import React from 'react';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - allow importing asset with spaces in the filename
import logoSrc from '../../../ChatGPT Image Sep 11, 2025, 01_26_10 PM.png';

interface LogoProps {
  size?: number; // pixel size for both width and height
  className?: string; // additional CSS classes
}

// Logo component using the provided image
export function LogoNPlus({ size = 40, className = "" }: LogoProps) {
  return (
    <img 
      src={logoSrc} 
      alt="Nabha Pharmacies" 
      width={size} 
      height={size} 
      className={`rounded ${className}`}
    />
  );
}


