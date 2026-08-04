import React from 'react';
import PageHero from '../components/PageHero';

const LEADERS = [
  {
    name: 'Dr. Josué Kasereka',
    role: 'Directeur exécutif',
    description: 'Psychologue clinicien et coordinateur des programmes de santé mentale adaptés aux contextes congolais.',
  },
  {
    name: 'Jemima Kyanza',
    role: 'Responsable qualité et éthique',
    description: 'Supervision des pratiques, respect du secret professionnel et suivi des protocoles de protection.',
  },
  {
    name: 'Samuel Kasereka',
    role: 'Coordinateur des interventions cliniques',
    description: 'Assure la qualité des suivis, la formation des équipes et l’accompagnement des bénéficiaires en situation complexe.',
  },
];

const ETHICS = [
  'Contrôle régulier de la qualité des prestations',
  'Respect strict du secret professionnel et des données personnelles',
  'Protection prioritaire des bénéficiaires vulnérables',
  'Procédure claire de signalement des incidents et des abus',
  'Supervision clinique continue et formation permanente du personnel',
];

interface GovernancePageProps {
  onOpenBooking: () => void;
}

export default function GovernancePage({ onOpenBooking }: GovernancePageProps) {
  return (
    <main className="grow">
      <PageHero
        variant="green"
        eyebrow="Gouvernance"
        title="Une direction engagée pour l’éthique et la qualité"
        description="Notre gouvernance repose sur une équipe experte, des procédures claires et un engagement fort envers la protection des bénéficiaires."
        primaryCtaLabel="Prendre rendez-vous"
        onPrimaryCta={onOpenBooking}
      />
      <section className="mt-5 py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-[10px] uppercase tracking-widest text-brand-green font-bold">Leadership</span>
            <h2 className="text-3xl font-poppins font-black text-brand-dark mt-3">Direction et leadership exécutif</h2>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {LEADERS.map((leader) => (
              <div key={leader.name} className="rounded-3xl border border-gray-150 bg-brand-gray-light p-8 shadow-sm hover:shadow-lg transition-all">
                <h3 className="text-xl font-poppins font-bold text-brand-wellbeing mb-2">{leader.name}</h3>
                <p className="text-sm font-semibold text-brand-dark mb-4">{leader.role}</p>
                <p className="text-sm leading-relaxed text-brand-gray-text">{leader.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-20 bg-brand-gray-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-[10px] uppercase tracking-widest text-brand-green font-bold">Qualité et éthique</span>
            <h2 className="text-3xl font-poppins font-black text-brand-dark mt-3">Protection des bénéficiaires</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {ETHICS.map((item) => (
              <div key={item} className="rounded-3xl bg-white border border-gray-150 p-6 shadow-sm">
                <p className="text-sm text-brand-gray-text leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
