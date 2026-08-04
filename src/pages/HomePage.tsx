import React from 'react';
import Hero from '../components/Hero';
import SupportTypesSection from '../components/SupportTypesSection';
import IdentitySection from '../components/IdentitySection';
import ContactSection from '../components/ContactSection';

interface HomePageProps {
  onOpenBooking: () => void;
  onOpenStressTest: () => void;
}

export default function HomePage({ onOpenBooking, onOpenStressTest }: HomePageProps) {
  return (
    <main className="grow">
      <Hero onOpenBooking={onOpenBooking} onOpenStressTest={onOpenStressTest} />
      <SupportTypesSection onOpenBooking={onOpenBooking} />
      <IdentitySection />
      <ContactSection />
    </main>
  );
}
