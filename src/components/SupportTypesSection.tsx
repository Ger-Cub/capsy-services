import React from 'react';
import LucideIcon from './LucideIcon';

interface SupportTypesSectionProps {
  onOpenBooking: () => void;
}

export default function SupportTypesSection({ onOpenBooking }: SupportTypesSectionProps) {
  return (
    <section className="py-20 bg-brand-gray-light" id="types-accompagnement">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-confidence/20 border border-brand-confidence/40 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-dark">Types d’accompagnement</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-poppins font-black text-brand-dark mt-3">
            Accompagnement individuel et de groupe adapté à vos besoins
          </h2>
          <p className="text-sm text-brand-gray-text mt-4 leading-relaxed font-sans">
            Découvrez nos deux approches complémentaires : un accompagnement personnel et une dynamique de groupe pour renforcer le soutien, l’écoute et la résilience.
          </p>
        </div>
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="bg-white rounded-3xl border border-gray-150 p-8 shadow-sm hover:shadow-lg hover:border-brand-confidence transition-all group">
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-brand-confidence/20 border border-brand-confidence/40 text-brand-dark group-hover:bg-brand-confidence transition-colors mb-6">
              <LucideIcon name="User" className="h-6 w-6 text-brand-dark" />
            </div>
            <h3 className="text-2xl font-poppins font-black text-brand-dark mb-4">Accompagnement individuel</h3>
            <p className="text-sm text-brand-gray-text leading-relaxed mb-6">
              Un espace confidentiel pour explorer vos émotions avec un psychologue formé, trouver des repères et bâtir des stratégies concrètes pour apaiser le stress.
            </p>
            <ul className="space-y-3 text-sm text-brand-dark font-medium">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-confidence shrink-0"></span>
                <span>Entretien privé et sécurisé</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-confidence shrink-0"></span>
                <span>Suivi sur-mesure selon votre histoire</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-confidence shrink-0"></span>
                <span>Intervention rapide en cas de crise</span>
              </li>
            </ul>
            <button
              onClick={onOpenBooking}
              className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-brand-confidence border border-brand-confidence/40 px-6 py-3 text-sm font-bold font-poppins text-brand-dark transition-all hover:bg-brand-confidence/90 cursor-pointer shadow-xs"
            >
              Prendre rendez-vous
            </button>
          </div>
          <div className="bg-white rounded-3xl border border-gray-150 p-8 shadow-sm hover:shadow-lg hover:border-brand-confidence transition-all group">
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-brand-confidence/20 border border-brand-confidence/40 text-brand-dark group-hover:bg-brand-confidence transition-colors mb-6">
              <LucideIcon name="Users" className="h-6 w-6 text-brand-dark" />
            </div>
            <h3 className="text-2xl font-poppins font-black text-brand-dark mb-4">Accompagnement de groupe</h3>
            <p className="text-sm text-brand-gray-text leading-relaxed mb-6">
              Un cadre collectif pour partager, apprendre et se soutenir. Idéal pour renforcer les capacités relationnelles et traverser les difficultés avec un groupe bienveillant.
            </p>
            <ul className="space-y-3 text-sm text-brand-dark font-medium">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-confidence shrink-0"></span>
                <span>Cohésion et soutien mutuel</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-confidence shrink-0"></span>
                <span>Exercices pratiques en groupe</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-confidence shrink-0"></span>
                <span>Partage d’expériences dans un cadre sécurisé</span>
              </li>
            </ul>
            <button
              onClick={onOpenBooking}
              className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-brand-confidence border border-brand-confidence/40 px-6 py-3 text-sm font-bold font-poppins text-brand-dark transition-all hover:bg-brand-confidence/90 cursor-pointer shadow-xs"
            >
              Réserver une séance
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
