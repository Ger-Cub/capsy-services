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
    <section className={`relative overflow-hidden pt-28 pb-20 ${isGreen ? 'bg-linear-to-br from-brand-darkgreen via-brand-wellbeing to-[#00a847]' : 'bg-linear-to-br from-white via-white to-brand-wellbeing/5'}`} id="hero-section">
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-white/10 rounded-b-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-1/4 h-1/3 bg-white/10 rounded-r-full blur-3xl -z-10" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${isGreen ? 'bg-white/15 text-white border border-white/20' : 'bg-brand-wellbeing/10 border border-brand-wellbeing/15 text-brand-wellbeing'} shadow-2xs`}>
              <span className={`flex h-2 w-2 rounded-full ${isGreen ? 'bg-white' : 'bg-brand-wellbeing'} animate-pulse`} />
              <span className={`text-[10px] sm:text-xs font-bold font-poppins uppercase tracking-widest ${isGreen ? 'text-white' : 'text-brand-wellbeing'}`}>
                {eyebrow}
              </span>
            </div>
            <div className="space-y-4">
              <h1 className={`text-4xl sm:text-5xl lg:text-5xl font-poppins font-black leading-[1.1] tracking-tight ${isGreen ? 'text-white' : 'text-brand-wellbeing'}`}>
                {title}
              </h1>
              <p className={`text-base sm:text-lg leading-relaxed max-w-2xl font-normal font-sans ${isGreen ? 'text-white/85' : 'text-brand-gray-text'}`}>
                {description}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3.5 pt-2">
              {primaryCtaLabel && (
                <button
                  onClick={onPrimaryCta}
                  className={`py-3.5 px-7 rounded-2xl text-base font-extrabold font-poppins transition-all shadow-lg hover:-translate-y-0.5 cursor-pointer ${isGreen ? 'bg-white text-brand-darkgreen hover:bg-white/95' : 'bg-brand-wellbeing hover:bg-brand-wellbeing/95 text-white'}`}
                >
                  {primaryCtaLabel}
                </button>
              )}
              {secondaryCtaLabel && (
                <button
                  onClick={onSecondaryCta}
                  className={`py-3.5 px-6 rounded-2xl text-sm font-bold font-poppins transition-all ${isGreen ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-brand-wellbeing/10 hover:bg-brand-wellbeing/15 text-brand-wellbeing'}`}
                >
                  {secondaryCtaLabel}
                </button>
              )}
              {ctaLink && !onSecondaryCta && (
                <a
                  href={ctaLink}
                  className={`py-3.5 px-6 rounded-2xl text-sm font-bold font-poppins text-center transition-all ${isGreen ? 'bg-white text-brand-darkgreen hover:bg-white/95' : 'bg-brand-wellbeing/10 hover:bg-brand-wellbeing/15 text-brand-wellbeing'}`}
                >
                  {secondaryCtaLabel}
                </a>
              )}
            </div>
          </div>
          <div className="lg:col-span-6 relative flex justify-center">
            <div className={`relative w-full max-w-xl overflow-hidden rounded-4xl shadow-[0_40px_120px_rgba(0,0,0,0.08)] ${isGreen ? 'bg-white/10 border border-white/15' : 'bg-white border border-gray-100'}`}>
              <div className="p-8 sm:p-10">
                <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-xs font-bold uppercase tracking-wider mb-6 ${isGreen ? 'bg-white/15 text-white' : 'bg-brand-wellbeing/10 text-brand-wellbeing'}`}>
                  <LucideIcon name="ShieldCheck" className="h-4 w-4" />
                  Approche structurée
                </div>
                <div className={`space-y-4 text-sm leading-relaxed font-sans ${isGreen ? 'text-white/85' : 'text-brand-gray-text'}`}>
                  <p>
                    Nous mettons en oeuvre une expérience de navigation claire et une page dédiée à chaque besoin : services, formations, gouvernance, FAQ et contact.
                  </p>
                  <p>
                    Cette organisation garantit une lecture fluide tout en restant fidèle à la charte visuelle du site existant.
                  </p>
                </div>
              </div>
              <div className={`${isGreen ? 'bg-white/10 text-white' : 'bg-brand-wellbeing/90 text-white'} py-6 px-8 text-sm font-semibold font-poppins`}>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className={`text-xs uppercase tracking-[0.3em] ${isGreen ? 'text-white/70' : 'text-brand-wellbeing/40'}`}>Besoin d'une réponse rapide ?</p>
                    <p className="text-lg font-black">Contactez notre équipe</p>
                  </div>
                  <div className="h-12 w-12 rounded-3xl bg-white/15 flex items-center justify-center">
                    <LucideIcon name="Phone" className="h-5 w-5" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
