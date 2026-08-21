import React from 'react';
import Hero from '../components/Hero';
import SupportTypesSection from '../components/SupportTypesSection';
import IdentitySection from '../components/IdentitySection';
import ContactSection from '../components/ContactSection';
import { NEWS } from '../data/newsData';

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
      <IdentitySection compact />
      <section className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-confidence/20 border border-brand-confidence/40 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-brand-dark font-poppins">PUBLICATIONS</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-poppins font-black text-brand-dark mt-1">Dernières Actualités</h2>
          </div>
          <a href="/actualites" className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold font-poppins text-brand-wellbeing hover:underline">
            Voir toutes les actualités →
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {NEWS.filter(n => n.published).slice(0, 2).map(item => (
            <a
              key={item.id}
              href={`/actualites/${item.slug}`}
              className="bg-white p-6 rounded-2xl border border-gray-150 hover:border-brand-confidence hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <span className="text-xs text-brand-gray-text font-poppins font-medium">{item.date}</span>
                <h3 className="text-lg font-poppins font-bold text-brand-dark group-hover:text-brand-wellbeing transition-colors leading-tight">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-brand-gray-text leading-relaxed font-sans line-clamp-3">
                  {item.excerpt}
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 text-xs font-bold font-poppins text-brand-wellbeing flex items-center gap-1">
                <span>Lire la suite</span>
                <span>→</span>
              </div>
            </a>
          ))}
        </div>

        <div className="mt-6 sm:hidden text-center">
          <a href="/actualites" className="text-xs font-bold font-poppins text-brand-wellbeing underline">Voir toutes les actualités →</a>
        </div>
      </section>
      <ContactSection />
    </main>
  );
}
