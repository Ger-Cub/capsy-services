import React from 'react';
import { VALUES } from '../data/staticData';
import LucideIcon from './LucideIcon';

export default function IdentitySection() {
  return (
    <section className="py-20 bg-white" id="identite">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title block */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-[10px] font-bold uppercase tracking-widest text-brand-green">NOTRE ENGAGEMENT</span>
          <h2 className="text-3xl sm:text-4xl font-poppins font-black text-brand-blue tracking-tight mt-1">
            Qui Sommes-Nous ?
          </h2>
          <p className="text-sm text-brand-gray-text mt-3 leading-relaxed font-sans max-w-xl mx-auto">
            Découvrez la vision, la mission d'impact et les valeurs fondatrices qui animent chaque jour les équipes de CAPSY SERVICES.
          </p>
        </div>

        {/* Brand Mission & Vision Split */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-stretch mb-16">
          
          {/* Mission Card */}
          <div className="bg-gradient-to-br from-brand-blue to-brand-blue/90 rounded-2xl p-8 sm:p-10 text-white relative overflow-hidden flex flex-col justify-between shadow-md">
            {/* Ambient vectors representing minds or connection */}
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/5 rounded-full blur-xl" />
            <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-brand-green/10 rounded-full blur-lg" />
            
            <div className="space-y-6 relative z-10">
              <div className="p-3.5 bg-white/10 text-brand-green rounded-xl inline-block">
                <LucideIcon name="Target" className="h-7 w-7 text-white" />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-poppins font-black uppercase tracking-wider">Notre Mission</h3>
                <p className="text-sm sm:text-base leading-relaxed text-white/90 font-sans">
                  Accompagner les individus, les familles, les organisations et les communautés dans leur bien-être psychologique et psychosocial. Nous offrons des clés d'émancipation et d'épanouissement humain adaptées aux réalités de la RDC.
                </p>
              </div>
            </div>

            <div className="pt-8 border-t border-white/10 mt-8 flex items-center gap-3.5 relative z-10 text-[11px] font-bold tracking-wider uppercase text-brand-green">
              <span>Soin</span>
              <span className="h-1.5 w-1.5 bg-white rounded-full" />
              <span>Soutien Communautaire</span>
              <span className="h-1.5 w-1.5 bg-white rounded-full" />
              <span>Épanouissement</span>
            </div>
          </div>

          {/* Vision Card */}
          <div className="bg-brand-gray-light rounded-2xl p-8 sm:p-10 border border-gray-150 flex flex-col justify-between shadow-xs hover:border-brand-blue transition-colors group">
            <div className="space-y-6">
              <div className="p-3.5 bg-brand-blue/10 text-brand-blue rounded-xl inline-block group-hover:bg-brand-blue group-hover:text-white transition-colors">
                <LucideIcon name="Sparkles" className="h-7 w-7 text-brand-blue group-hover:text-white" />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-poppins font-black text-brand-blue uppercase tracking-wider">Notre Vision</h3>
                <p className="text-sm sm:text-base leading-relaxed text-brand-gray-text font-sans">
                  Être le leader d'excellence et la référence incontournable en santé mentale, accompagnement psychologique de pointe et développement du potentiel humain en République Démocratique du Congo.
                </p>
              </div>
            </div>

            <div className="pt-8 border-t border-gray-200 mt-8 flex items-center gap-2 text-xs font-semibold text-brand-blue">
              <LucideIcon name="Send" className="h-4.5 w-4.5 text-brand-green" />
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
                className="bg-white p-6 rounded-2xl border border-gray-150 hover:border-brand-green/40 hover:shadow-md transition-all duration-300 flex items-start gap-4"
              >
                {/* Value Icon */}
                <div className="p-3 bg-brand-green/10 text-brand-green rounded-xl shrink-0">
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
