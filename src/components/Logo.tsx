import React from 'react';
// @ts-ignore
import logoClaire from '../assets/images/logo-surface-claire.svg';
// @ts-ignore
import logoSombre from '../assets/images/logo-surface-sombre.svg';


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
  // Height and responsive dimensions optimized for the 1.9:1 vector artboards
  const sizes = {
    sm: 'h-11 sm:h-12',
    md: 'h-14 sm:h-16',
    lg: 'h-20 sm:h-24',
    xl: 'h-28 sm:h-32',
  };

  const selectedClass = sizes[size];
  const logoSrc = variant === 'color' ? logoClaire : logoSombre;

  return (
    <div className={`flex items-center select-none ${className}`} id="capsy-logo">
      <img
        src={logoSrc}
        className={`${selectedClass} w-auto object-contain transition-transform hover:scale-[1.03] duration-300`}
        alt="CAPSY SERVICES"
        referrerPolicy="no-referrer"
      />
    </div>
  );
}

