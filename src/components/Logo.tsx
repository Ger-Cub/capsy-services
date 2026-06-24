import React from 'react';
// @ts-ignore
import logoIcon from '../assets/images/capsy-icon-new.png';

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
  const iconSizes = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-14',
    xl: 'h-20',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-3xl',
    xl: 'text-4xl',
  };

  const textColor = variant === 'white' ? 'text-white' : 'text-brand-wellbeing';
  const subtitleColor = variant === 'white' ? 'text-white/60' : 'text-brand-gray-text';

  return (
    <div className={`flex items-center gap-3 select-none ${className}`} id="capsy-logo">
      <img
        src={logoIcon}
        className={`${iconSizes[size]} w-auto object-contain transition-transform hover:scale-105 duration-300`}
        alt="CAPSY"
      />
      <div className="flex flex-col justify-center">
        <h2 className={`${textSizes[size]} font-poppins font-black tracking-tighter leading-none ${textColor}`}>
          CAPSY <span className="font-light">SERVICES</span>
        </h2>
        {showSubtitle && (
          <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] font-poppins opacity-80 mt-0.5" style={{ color: variant === 'white' ? 'rgba(255,255,255,0.7)' : 'var(--color-brand-wellbeing)' }}>
            Santé Mentale & Innovation
          </p>
        )}
      </div>
    </div>
  );
}

