import React from 'react';
import { VALUES } from '../data/staticData';
import LucideIcon from './LucideIcon';

interface IdentitySectionProps {
  compact?: boolean;
}

export default function IdentitySection({ compact = false }: IdentitySectionProps) {
  if (compact) {
    return (
      <section className="py-16 bg-white border-b border-gray-100" id="identite">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Title block */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-confidence/20 border border-brand-confidence/40 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-brand-dark font-poppins">NOTRE ENGAGEMENT</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-poppins font-black text-brand-wellbeing tracking-tight mt-1">
              Qui Sommes-Nous ?
            </h2>
            <p className="text-sm text-brand-gray-text mt-3 leading-relaxed font-sans max-w-xl mx-auto">
              CAPSY SERVICES est un centre d'accompagnement psychologique d'excellence en RDC, dédié au bien-être mental, à la résilience et à l'épanouissement humain.
            </p>
          </div>

          {/* Mission & Vision Compact Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch mb-10">

            {/* Mission Card */}
            <div className="bg-gradient-to-br from-brand-wellbeing to-brand-wellbeing/90 rounded-2xl p-7 text-white relative overflow-hidden flex flex-col justify-between shadow-sm border border-brand-confidence/20 group">
              <div className="space-y-4 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-brand-confidence/20 border border-brand-confidence/40 rounded-xl text-brand-confidence shrink-0">
                    <LucideIcon name="Target" className="h-6 w-6 text-brand-confidence" />
                  </div>
                  <h3 className="text-xl font-poppins font-black uppercase tracking-wider">Notre Mission</h3>
                </div>
                <p className="text-xs sm:text-sm leading-relaxed text-white/90 font-sans">
                  Accompagner les individus, familles et organisations dans leur bien-être psychologique et psychosocial grâce à des interventions cliniques adaptées aux réalités de la RDC.
                </p>
              </div>
              <div className="pt-4 border-t border-white/10 mt-6 flex flex-wrap items-center gap-2 text-[10px] font-bold tracking-wider uppercase text-brand-confidence relative z-10">
                <span>Soin</span>
                <span className="h-1 w-1 bg-brand-confidence rounded-full" />
                <span>Soutien Communautaire</span>
                <span className="h-1 w-1 bg-brand-confidence rounded-full" />
                <span>Épanouissement</span>
              </div>
            </div>

            {/* Vision Card */}
            <div className="bg-brand-gray-light rounded-2xl p-7 border border-gray-150 flex flex-col justify-between shadow-xs hover:border-brand-confidence transition-all group">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-brand-confidence/20 border border-brand-confidence/40 rounded-xl text-brand-dark shrink-0 group-hover:bg-brand-confidence transition-colors">
                    <LucideIcon name="Sparkles" className="h-6 w-6 text-brand-dark" />
                  </div>
                  <h3 className="text-xl font-poppins font-black text-brand-wellbeing uppercase tracking-wider">Notre Vision</h3>
                </div>
                <p className="text-xs sm:text-sm leading-relaxed text-brand-gray-text font-sans">
                  Être la référence incontournable en santé mentale, accompagnement psychologique de pointe et développement du potentiel humain en République Démocratique du Congo.
                </p>
              </div>
              <div className="pt-4 border-t border-gray-200 mt-6 flex items-center gap-2 text-xs font-semibold text-brand-dark">
                <LucideIcon name="ShieldCheck" className="h-4 w-4 text-brand-confidence shrink-0" />
                <span>Une référence d'excellence et de confidentialité</span>
              </div>
            </div>

          </div>

          {/* Value Pills & CTA Banner */}
          <div className="bg-brand-gray-light/80 rounded-2xl p-6 border border-gray-150 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center sm:text-left">
              <span className="text-[10px] font-bold font-poppins uppercase tracking-wider text-brand-dark">NOS VALEURS FONDATRICES</span>
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                {VALUES.map((val) => (
                  <span key={val.name} className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-xs font-poppins font-semibold text-brand-dark shadow-2xs">
                    {val.name}
                  </span>
                ))}
              </div>
            </div>

            <a
              href="/a-propos"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-confidence text-brand-dark hover:bg-brand-confidence/90 rounded-xl font-poppins font-bold text-xs sm:text-sm shadow-sm transition-all hover:scale-[1.02] shrink-0 border border-brand-confidence/40 cursor-pointer"
            >
              <span>En savoir plus sur CAPSY</span>
              <LucideIcon name="ArrowRight" className="h-4 w-4 text-brand-dark" />
            </a>
          </div>

        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-white" id="identite">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Title block */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-confidence/20 border border-brand-confidence/40 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-dark">NOTRE ENGAGEMENT</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-poppins font-black text-brand-wellbeing tracking-tight mt-1">
            Qui Sommes-Nous ?
          </h2>
          <p className="text-sm text-brand-gray-text mt-3 leading-relaxed font-sans max-w-xl mx-auto">
            Découvrez la vision, la mission d'impact et les valeurs fondatrices qui animent chaque jour les équipes de CAPSY SERVICES.
          </p>
        </div>

        {/* Brand Mission & Vision Split */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-stretch mb-16">

          {/* Mission Card */}
          <div className="bg-gradient-to-br from-brand-wellbeing to-brand-wellbeing/90 rounded-2xl p-8 sm:p-10 text-white relative overflow-hidden flex flex-col justify-between shadow-md border border-brand-confidence/20">
            {/* Ambient vectors representing minds or connection */}
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/5 rounded-full blur-xl" />
            <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-brand-green/10 rounded-full blur-lg" />

            <div className="space-y-6 relative z-10">
              <div className="p-3.5 bg-brand-confidence/20 text-brand-confidence rounded-xl inline-block">
                <LucideIcon name="Target" className="h-7 w-7 text-brand-confidence" />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-poppins font-black uppercase tracking-wider">Notre Mission</h3>
                <p className="text-sm sm:text-base leading-relaxed text-white/90 font-sans">
                  Accompagner les individus, les familles, les organisations et les communautés dans leur bien-être psychologique et psychosocial. Nous offrons des clés d'émancipation et d'épanouissement humain adaptées aux réalités de la RDC.
                </p>
              </div>
            </div>

            <div className="pt-8 border-t border-white/10 mt-8 flex items-center gap-3.5 relative z-10 text-[11px] font-bold tracking-wider uppercase text-brand-confidence">
              <span>Soin</span>
              <span className="h-1.5 w-1.5 bg-brand-confidence rounded-full" />
              <span>Soutien Communautaire</span>
              <span className="h-1.5 w-1.5 bg-brand-confidence rounded-full" />
              <span>Épanouissement</span>
            </div>
          </div>

          {/* Vision Card */}
          <div className="bg-brand-gray-light rounded-2xl p-8 sm:p-10 border border-gray-150 flex flex-col justify-between shadow-xs hover:border-brand-confidence transition-colors group">
            <div className="space-y-6">
              <div className="p-3.5 bg-brand-confidence/20 text-brand-dark rounded-xl inline-block group-hover:bg-brand-confidence group-hover:text-brand-dark transition-colors">
                <LucideIcon name="Sparkles" className="h-7 w-7 text-brand-wellbeing group-hover:text-brand-dark" />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-poppins font-black text-brand-wellbeing uppercase tracking-wider">Notre Vision</h3>
                <p className="text-sm sm:text-base leading-relaxed text-brand-gray-text font-sans">
                  Être le leader d'excellence et la référence incontournable en santé mentale, accompagnement psychologique de pointe et développement du potentiel humain en République Démocratique du Congo.
                </p>
              </div>
            </div>

            <div className="pt-8 border-t border-gray-200 mt-8 flex items-center gap-2 text-xs font-semibold text-brand-wellbeing">
              <LucideIcon name="Send" className="h-4.5 w-4.5 text-brand-confidence" />
              <span>Bâtir une société congolaise résiliente, saine et épanouie</span>
            </div>
          </div>

        </div>

        {/* Brand Values Section - Bento style Grid */}
        <div className="space-y-8" id="valeurs-container">
          <div className="text-center">
            <h3 className="text-xl font-poppins font-bold text-brand-dark">Les Valeurs Fondatrices de CAPSY</h3>
            <p className="text-xs text-brand-gray-text mt-1">Les piliers éthiques de notre engagement clinique quotidien.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {VALUES.map((val) => (
              <div
                key={val.name}
                className="bg-white p-6 rounded-2xl border border-gray-150 hover:border-brand-confidence hover:shadow-md transition-all duration-300 flex items-start gap-4"
              >
                {/* Value Icon */}
                <div className="p-3 bg-brand-confidence/20 text-brand-dark rounded-xl shrink-0">
                  <LucideIcon name={val.iconName} className="h-5.5 w-5.5" />
                </div>
                {/* Text details */}
                <div className="space-y-1.5">
                  <h4 className="font-poppins font-bold text-brand-dark text-base tracking-tight leading-tight">
                    {val.name}
                  </h4>
                  <p className="text-xs sm:text-sm text-brand-gray-text leading-relaxed font-sans font-medium">
                    {val.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}

