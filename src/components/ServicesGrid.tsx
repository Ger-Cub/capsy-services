import React, { useState } from 'react';
import { SERVICES as STATIC_SERVICES } from '../data/staticData';
import { Service } from '../types';
import LucideIcon from './LucideIcon';

interface ServicesGridProps {
  onSelectService: (serviceId: string) => void;
}

export default function ServicesGrid({ onSelectService }: ServicesGridProps) {
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  return (
    <section className="py-20 bg-brand-gray-light" id="services">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Title alignment */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-wellbeing/10 text-brand-wellbeing text-xs font-bold font-poppins uppercase tracking-wider mb-3">
            <LucideIcon name="ShieldCheck" className="h-4 w-4 text-brand-green" />
            <span>Nos Solutions Saines et Structurées</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-poppins font-black text-brand-wellbeing tracking-tight">
            Services d'Accompagnement Psychologique
          </h2>
          <p className="text-sm sm:text-base text-brand-gray-text mt-3 leading-relaxed font-sans font-medium">
            Des services spécialisés construits avec rigueur pour accompagner individus, couples, familles, et structures professionnelles vers un bien-être durable.
          </p>
        </div>

        {/* The Grid mapping */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" id="services-list-container">
          {STATIC_SERVICES.map((srv) => {
            return (
              <div
                key={srv.id}
                className="bg-white rounded-2xl border border-gray-150 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden group"
              >
                <div>
                  {/* Decorative speaking image header with Price tag and Modality */}
                  <div className="h-48 w-full overflow-hidden relative border-b border-gray-100 bg-neutral-100">
                    <img
                      src={srv.imageUrl}
                      alt={srv.imageAlt}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 left-3 bg-[var(--color-brand-wellbeing)]/95 backdrop-blur-xs text-white text-[10px] font-bold font-poppins px-2.5 py-1 rounded-md shadow-xs uppercase tracking-wider">
                      {srv.price} USD
                    </div>
                    {srv.modalite && (
                      <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs text-brand-dark text-[9px] font-bold px-2 py-1 rounded-md shadow-xs flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-brand-wellbeing)]"></span>
                        {srv.modalite.toLowerCase().includes('en ligne') ? 'Cabinet ou En ligne' : 'Cabinet'}
                      </div>
                    )}
                  </div>

                  <div className="p-6 space-y-4">
                    {/* Header: Icon + Title */}
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 bg-[var(--color-brand-wellbeing)]/10 text-[var(--color-brand-wellbeing)] rounded-xl shrink-0 mt-0.5 group-hover:bg-[var(--color-brand-wellbeing)] group-hover:text-white transition-colors">
                        <LucideIcon name={srv.iconName} className="h-5 w-5" />
                      </div>
                      <h3 className="text-base font-bold font-poppins text-brand-dark tracking-tight leading-snug">
                        {srv.title}
                      </h3>
                    </div>

                    {/* Description Text */}
                    <p className="text-xs sm:text-sm text-brand-gray-text leading-relaxed font-sans line-clamp-3">
                      {srv.shortDescription}
                    </p>

                    {/* Therapist Lineup */}
                    {srv.therapists && srv.therapists.length > 0 && (
                      <div className="pt-3 border-t border-gray-100">
                        <p className="text-[10px] font-poppins font-bold uppercase tracking-wider text-[var(--color-brand-wellbeing)] mb-1.5">
                          Praticiens CAPSY :
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {srv.therapists.map((th, idx) => (
                            <span key={idx} className="text-[9px] bg-neutral-100 text-brand-dark px-2 py-0.5 rounded-md font-sans border border-neutral-150">
                              {th}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="p-6 pt-0 flex gap-2">
                  <button
                    onClick={() => setSelectedService(srv)}
                    className="flex-1 py-2.5 px-4 bg-brand-gray-light hover:bg-neutral-200 text-[var(--color-brand-wellbeing)] text-xs font-bold font-poppins rounded-xl transition-colors cursor-pointer text-center"
                  >
                    Voir détails
                  </button>
                  <button
                    onClick={() => onSelectService(srv.id)}
                    className="py-2.5 px-4 bg-[var(--color-brand-wellbeing)]/10 hover:bg-[var(--color-brand-wellbeing)] hover:text-white text-[var(--color-brand-wellbeing)] text-xs font-extrabold font-poppins rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
                  >
                    <span>Prendre RDV</span>
                    <LucideIcon name="ChevronDown" className="h-3 w-3 -rotate-90" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Informative lower callout */}
        <div className="mt-14 bg-[var(--color-brand-wellbeing)] rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full translate-x-8 -translate-y-8 blur-lg" />
          <div className="space-y-2 text-center md:text-left max-w-2xl relative z-10">
            <h4 className="text-xl font-poppins font-bold">Un cas sortant du cadre habituel ?</h4>
            <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-sans">
              Nous concevons des plans d'accompagnement clinique sur-mesure pour les structures d'aide humanitaire, institutions et ONGs en RDC. Parlons-en.
            </p>
          </div>
          <button
            onClick={() => onSelectService('individuelle')}
            className="w-full md:w-auto px-6 py-3 bg-white hover:bg-brand-gray-light text-[var(--color-brand-wellbeing)] rounded-xl text-xs font-poppins font-bold uppercase tracking-wider select-none shrink-0 transition-colors cursor-pointer"
          >
            S'inscrire ou planifier
          </button>
        </div>

      </div>

      {/* Details Modal overlay for a single service view */}
      {selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setSelectedService(null)}
          />
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col animate-in fade-in zoom-in-95 duration-200 max-h-[90vh]">
            
            {/* Modal header with Image */}
            <div className="h-48 sm:h-56 w-full relative shrink-0">
              <img
                src={selectedService.imageUrl}
                alt={selectedService.imageAlt}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent" />
              
              <button
                onClick={() => setSelectedService(null)}
                className="absolute top-4 right-4 h-8 w-8 bg-black/40 hover:bg-black/70 rounded-full text-white flex items-center justify-center transition-colors shadow-lg cursor-pointer"
              >
                <LucideIcon name="X" className="h-4 w-4" />
              </button>

              <div className="absolute bottom-4 left-6 right-6">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="bg-[var(--color-brand-wellbeing)] text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full">
                    {selectedService.price} USD
                  </span>
                  <span className="bg-white/20 text-white backdrop-blur-xs text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full">
                    ⏱ {selectedService.duree}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-black font-poppins text-white tracking-tight">
                  {selectedService.title}
                </h3>
              </div>
            </div>

            {/* Scrollable Modal Content */}
            <div className="p-6 sm:p-8 space-y-5 overflow-y-auto">
              
              {/* Introduction */}
              <div className="space-y-1">
                <p className="text-[10px] font-poppins font-black text-[var(--color-brand-wellbeing)] uppercase tracking-wider">Présentation</p>
                <p className="text-xs sm:text-sm text-brand-dark leading-relaxed font-sans">
                  {selectedService.shortDescription} {selectedService.fullDescription}
                </p>
              </div>

              {/* Sub-details grid details */}
              <div className="space-y-3 pt-1">
                {selectedService.pourQui && (
                  <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-150">
                    <p className="text-[9px] font-poppins font-black text-[var(--color-brand-wellbeing)] uppercase tracking-wider mb-1">Pour qui ?</p>
                    <p className="text-xs text-brand-gray-text leading-relaxed font-sans">{selectedService.pourQui}</p>
                  </div>
                )}

                {selectedService.objectif && (
                  <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-150">
                    <p className="text-[9px] font-poppins font-black text-[var(--color-brand-wellbeing)] uppercase tracking-wider mb-1">Objectif thérapeutique</p>
                    <p className="text-xs text-brand-gray-text leading-relaxed font-sans">{selectedService.objectif}</p>
                  </div>
                )}

                {selectedService.commentCaSePasse && (
                  <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-150">
                    <p className="text-[9px] font-poppins font-black text-[var(--color-brand-wellbeing)] uppercase tracking-wider mb-1">Comment se déroule la séance ?</p>
                    <p className="text-xs text-brand-gray-text leading-relaxed font-sans">{selectedService.commentCaSePasse}</p>
                  </div>
                )}

                {selectedService.quandLutiliser && (
                  <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-150">
                    <p className="text-[9px] font-poppins font-black text-[var(--color-brand-wellbeing)] uppercase tracking-wider mb-1">Indications cliniques fréquentes</p>
                    <p className="text-xs text-brand-gray-text leading-relaxed font-sans">{selectedService.quandLutiliser}</p>
                  </div>
                )}
              </div>

              {/* Clinic staff reassurance block */}
              <div className="p-4 bg-[var(--color-brand-wellbeing)]/5 rounded-xl border border-[var(--color-brand-wellbeing)]/15 space-y-2">
                <p className="text-[9px] font-poppins font-black uppercase tracking-wider text-[var(--color-brand-wellbeing)]">
                  Spécialistes qualifiés d'astreinte :
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedService.therapists?.map((th, idx) => (
                    <span key={idx} className="text-[10px] bg-white text-brand-dark px-2 py-1 rounded-md border border-neutral-200 font-medium">
                      👤 {th}
                    </span>
                  ))}
                </div>
                <p className="text-[9px] text-[var(--color-brand-wellbeing)] leading-tight font-sans">
                  📍 Modalité : {selectedService.modalite}
                </p>
              </div>

            </div>

            {/* Modal actions pane */}
            <div className="p-4 sm:p-6 bg-neutral-50 border-t border-neutral-200 flex gap-2 w-full shrink-0">
              <button
                type="button"
                onClick={() => setSelectedService(null)}
                className="flex-1 py-3 px-4 bg-white hover:bg-neutral-100 text-brand-gray-text border border-neutral-300 rounded-xl text-xs font-bold font-poppins transition-colors cursor-pointer"
              >
                Fermer
              </button>
              <button
                type="button"
                onClick={() => {
                  const id = selectedService.id;
                  setSelectedService(null);
                  onSelectService(id);
                }}
                className="flex-1 py-3 px-4 bg-[var(--color-brand-wellbeing)] hover:bg-[var(--color-brand-wellbeing)]/95 text-white rounded-xl text-xs font-bold font-poppins transition-all flex items-center justify-center gap-1.5 shadow-md shadow-brand-green/10 cursor-pointer"
              >
                <LucideIcon name="Calendar" className="h-4 w-4" />
                <span>Prendre RDV</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </section>
  );
}
