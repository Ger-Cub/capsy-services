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

    </main>
  );
}
