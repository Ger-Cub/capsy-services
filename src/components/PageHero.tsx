import React from 'react';
import LucideIcon from './LucideIcon';

interface PageHeroProps {
  eyebrow: string;
  title: string;
  description: string;
  primaryCtaLabel?: string;
  secondaryCtaLabel?: string;
  onPrimaryCta?: () => void;
  onSecondaryCta?: () => void;
  ctaLink?: string;
  variant?: 'default' | 'green';
}

export default function PageHero({
  eyebrow,
  title,
  description,
  primaryCtaLabel,
  secondaryCtaLabel,
  onPrimaryCta,
  onSecondaryCta,
  ctaLink,
  variant = 'default',
}: PageHeroProps) {
  const isGreen = variant === 'green';

  return (
    <section className={`relative ${isGreen ? 'bg-gradient-to-br from-brand-wellbeing to-brand-wellbeing/80' : 'bg-linear-to-br from-white via-white to-brand-wellbeing/5'} pt-28 pb-12 overflow-hidden`} id="hero-section">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15)_0%,transparent_70%)]" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 translate-y-1/2 -z-10" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${isGreen ? 'bg-white/15 text-white border border-white/20' : 'bg-brand-wellbeing/10 border border-brand-wellbeing/15 text-brand-wellbeing'} shadow-2xs`}>
              <span className={`flex h-2 w-2 rounded-full ${isGreen ? 'bg-white' : 'bg-brand-wellbeing'} animate-pulse`} />
              <span className={`text-[10px] sm:text-xs font-bold font-poppins uppercase tracking-widest ${isGreen ? 'text-white' : 'text-brand-wellbeing'}`}>
                {eyebrow}
              </span>
            </div>
            <div className="space-y-4">
              <h1 className={`text-3xl sm:text-4xl font-poppins font-black leading-tight ${isGreen ? 'text-white' : 'text-brand-wellbeing'}`}>
                {title}
              </h1>
              <p className={`text-sm sm:text-base leading-relaxed font-normal font-sans ${isGreen ? 'text-white/85' : 'text-brand-gray-text'}`}>
                {description}
              </p>
            </div>
          </div>

          <div className="lg:col-span-6 relative flex justify-center">
            <div className="relative w-full max-w-xl overflow-hidden rounded-4xl shadow-[0_40px_120px_rgba(0,0,0,0.08)]">
              <div className="p-8 sm:p-10 flex items-center justify-center">
                {primaryCtaLabel && (
                  <button
                    onClick={onPrimaryCta}
                    className={`flex items-center gap-2 px-5 py-3 bg-white text-brand-wellbeing font-bold font-poppins text-sm rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all`}
                    id="pagehero-primary-cta"
                  >
                    <LucideIcon name="Plus" className="h-4 w-4" />
                    {primaryCtaLabel}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
