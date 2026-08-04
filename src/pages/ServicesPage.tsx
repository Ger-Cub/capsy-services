import React from 'react';
import PageHero from '../components/PageHero';
import ServicesGrid from '../components/ServicesGrid';

interface ServicesPageProps {
  onOpenBooking: () => void;
}

export default function ServicesPage({ onOpenBooking }: ServicesPageProps) {
  return (
    <main className="grow">
      <PageHero
        variant="green"
        eyebrow="Services"
        title="Nos services"
        description="Explorez nos services spécialisés : séances individuelles, psychothérapie, thérapie familiale, évaluations psychologiques, accompagnement des jeunes et supervision clinique."
        primaryCtaLabel="Prendre un rendez-vous"
        onPrimaryCta={onOpenBooking}
      />
      <div className="mt-5">
        <ServicesGrid onSelectService={onOpenBooking} />
      </div>
      <section className="py-20 bg-brand-wellbeing/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-brand-wellbeing/20 bg-white p-10 shadow-lg">
            <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr] items-center">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-brand-green">Cas sortant du cadre habituel</span>
                <h2 className="mt-4 text-3xl font-poppins font-black text-brand-dark">Vous avez un besoin clinique ou institutionnel spécifique ?</h2>
                <p className="mt-4 text-sm leading-relaxed text-brand-gray-text">
                  Nous construisons des interventions sur mesure pour les organisations, les structures humanitaires et les situations qui nécessitent un accompagnement hors du commun.
                </p>
              </div>
              <div className="text-right lg:text-left">
                <a
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-2xl bg-brand-wellbeing px-6 py-3 text-sm font-bold text-white transition-all hover:bg-brand-wellbeing/95"
                >
                  S'inscrire ou planifier
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
