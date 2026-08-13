import React from 'react';
import Hero from '../components/Hero';
import SupportTypesSection from '../components/SupportTypesSection';
import IdentitySection from '../components/IdentitySection';
import ContactSection from '../components/ContactSection';

interface HomePageProps {
  onOpenBooking: () => void;
  onOpenStressTest: () => void;
  user?: any;
  onViewAppointments?: () => void;
}

export default function HomePage({ onOpenBooking, onOpenStressTest, user, onViewAppointments }: HomePageProps) {
  return (
    <main className="grow">
      <Hero onOpenBooking={onOpenBooking} onOpenStressTest={onOpenStressTest} user={user} onViewAppointments={onViewAppointments} />
      <SupportTypesSection onOpenBooking={onOpenBooking} />
      <IdentitySection />
      <ContactSection />
    </main>
  );
}
