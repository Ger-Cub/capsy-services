import React from 'react';
import PageHero from '../components/PageHero';
import ContactSection from '../components/ContactSection';

interface ContactPageProps {
  onOpenBooking: () => void;
}

export default function ContactPage({ onOpenBooking }: ContactPageProps) {
  return (
    <main className="grow">
      <PageHero
        variant="green"
        eyebrow="Contact"
        title="Nous contacter"
        description="Nous sommes là pour répondre à vos questions, organiser un rendez-vous ou vous orienter vers le bon service."
        primaryCtaLabel="Prendre rendez-vous"
        onPrimaryCta={onOpenBooking}
      />
      <div className="mt-5">
        <ContactSection />
      </div>
    </main>
  );
}
