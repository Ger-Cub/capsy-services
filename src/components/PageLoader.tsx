import React from 'react';
import Logo from './Logo';

export default function PageLoader() {
  return (
    <div className="w-full min-h-[50vh] flex flex-col items-center justify-center p-8 bg-white/50 backdrop-blur-xs">
      <div className="relative flex flex-col items-center gap-4">
        {/* Animated pulse ring */}
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border-3 border-brand-wellbeing/20 border-t-brand-wellbeing animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Logo size="sm" showSubtitle={false} />
          </div>
        </div>

        <div className="flex flex-col items-center gap-1">
          <p className="text-sm font-semibold font-poppins text-brand-dark tracking-wide animate-pulse">
            Chargement de la page...
          </p>
          <span className="text-xs text-brand-gray-text">Capsy Services</span>
        </div>
      </div>
    </div>
  );
}
