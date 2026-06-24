import React from 'react';
// @ts-ignore
import logoGreen from '../assets/images/logo-capsy-monochrome-green.png';


interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'color' | 'white';
  showSubtitle?: boolean; // Kept for prop-compatibility
}

export default function Logo({
  className = '',
  size = 'md',
  variant = 'color',
  showSubtitle = true,
}: LogoProps) {
  // Height and responsive dimensions optimized for the brand logo.
  const sizes = {
    sm: 'h-11 sm:h-12',
    md: 'h-14 sm:h-16',
    lg: 'h-20 sm:h-24',
    xl: 'h-28 sm:h-32',
  };

  const selectedClass = sizes[size];
  const logoSrc = logoGreen;

  return (
    <div className={`flex items-center select-none ${className}`} id="capsy-logo">
      <img
        src={logoSrc}
        className={`${selectedClass} w-auto object-contain transition-transform hover:scale-[1.03] duration-300 ${variant === 'white' ? 'brightness-0 invert' : ''}`}
        alt="CAPSY SERVICES"
        referrerPolicy="no-referrer"
      />
    </div>
  );
}

