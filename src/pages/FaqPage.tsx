import React from 'react';
import PageHero from '../components/PageHero';
import Faqs from '../components/Faqs';

interface FaqPageProps {
  onOpenBooking: () => void;
}

export default function FaqPage({ onOpenBooking }: FaqPageProps) {
  return (
    <main className="grow">
      <PageHero
        variant="green"
        eyebrow="FAQ"
        title="Foire aux questions"
        description="Consultez rapidement les informations sur nos consultations, nos services et la confidentialité de nos accompagnements psychologiques."
        primaryCtaLabel="Prendre rendez-vous"
        onPrimaryCta={onOpenBooking}
      />
      <div className="mt-5">
        <Faqs />
      </div>
    </main>
  );
}
