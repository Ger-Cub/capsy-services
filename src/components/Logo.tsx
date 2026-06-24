import React from 'react';
// @ts-ignore
import logoFull from '../assets/images/logo-full-brand.png';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'color' | 'white';
  showSubtitle?: boolean;
}

export default function Logo({
  className = '',
  size = 'md',
  variant = 'color',
  showSubtitle = true,
}: LogoProps) {
  const sizes = {
    sm: 'h-10 sm:h-11',
    md: 'h-14 sm:h-16',
    lg: 'h-20 sm:h-24',
    xl: 'h-28 sm:h-32',
  };

  const selectedClass = sizes[size];

  return (
    <div className={`flex flex-col items-start select-none ${className}`} id="capsy-logo">
      <img
        src={logoFull}
        className={`${selectedClass} w-auto object-contain transition-transform hover:scale-[1.03] duration-300 ${variant === 'white' ? 'brightness-0 invert' : ''}`}
        alt="CAPSY SERVICES"
        referrerPolicy="no-referrer"
      />
    </div>
  );
}

