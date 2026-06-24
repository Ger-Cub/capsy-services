import React from 'react';
import Logo from './Logo';
import LucideIcon from './LucideIcon';

interface FooterProps {
  onOpenBooking: () => void;
}

export default function Footer({ onOpenBooking }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-brand-dark text-white pt-16 pb-8 border-t border-white/5" id="main-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Core Layout Split */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start pb-12 border-b border-white/10 select-none">

          {/* Logo and About Column */}
          <div className="md:col-span-5 space-y-4">
            <Logo size="md" variant="white" showSubtitle={true} />
            <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-sans max-w-sm pt-2">
              Nous sommes engagés pour l'accompagnement humain, la dématérialisation et la santé mentale d'excellence en République Démocratique du Congo.
            </p>
            <div className="pt-2 text-xs text-white/60 space-y-1.5 font-sans">
              <p className="flex items-center gap-1.5 hover:text-white transition-colors">
                <LucideIcon name="Mail" className="h-3.5 w-3.5 text-brand-green" />
                <span>contact@capsy-rdc.org</span>
              </p>
              <p className="flex items-center gap-1.5 hover:text-white transition-colors">
                <LucideIcon name="Phone" className="h-3.5 w-3.5 text-brand-green" />
                <span>+243 997 707 312</span>
              </p>
              <p className="flex items-start gap-1.5">
                <LucideIcon name="MapPin" className="h-3.5 w-3.5 text-brand-green shrink-0 mt-0.5" />
                <span>Goma : N°18, av. Des écoles, Q. Les Volcans, RDC<br />
                  Kinshasa : N°63, av. Kabinda, Q. Boyoma, RDC</span>
              </p>
            </div>
          </div>

          {/* Quick Navigate columns */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="font-poppins font-bold text-sm uppercase tracking-wider text-brand-green">Accès Rapide</h4>
            <ul className="space-y-2 text-xs sm:text-sm text-white/70 font-sans">
              <li>
                <a href="#services" className="hover:text-brand-green transition-colors">Nos Services</a>
              </li>
              <li>
                <a href="#identite" className="hover:text-brand-green transition-colors">Notre Identité</a>
              </li>
              <li>
                <a href="#stress-test" className="hover:text-brand-green transition-colors">Faire l'Auto-Évaluation</a>
              </li>
              <li>
                <a href="#faq" className="hover:text-brand-green transition-colors">Foire Aux Questions</a>
              </li>
              <li>
                <a href="#contact" className="hover:text-brand-green transition-colors">Nous Contacter</a>
              </li>
            </ul>
          </div>

          {/* Prompt Booking column */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="font-poppins font-bold text-sm uppercase tracking-wider text-brand-green">Besoin d'aide ?</h4>
            <p className="text-xs text-white/70 leading-relaxed font-sans">
              N'attendez pas de vous sentir submergé(e). Soumettez votre demande de consultation en quelques instants de façon sécurisée.
            </p>
            <button
              onClick={onOpenBooking}
              className="w-full sm:w-auto py-2.5 px-5 bg-brand-wellbeing hover:bg-brand-wellbeing/90 text-white text-xs font-bold font-poppins rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
              id="footer-inline-booking-btn"
            >
              <LucideIcon name="Calendar" className="h-4 w-4" />
              <span>Prendre un rendez-vous</span>
            </button>
          </div>

        </div>

        {/* Dynamic sliding, aligned brand values indicator ticker block */}
        <div className="py-6 border-b border-white/10 flex flex-wrap gap-4 items-center justify-center text-[10px] sm:text-xs font-poppins font-bold text-white/80 uppercase tracking-widest select-none">
          <span>Écoute</span>
          <span className="h-1.5 w-1.5 bg-brand-green rounded-full" />
          <span>Bienveillance</span>
          <span className="h-1.5 w-1.5 bg-brand-green rounded-full" />
          <span>Confidentialité</span>
          <span className="h-1.5 w-1.5 bg-brand-green rounded-full" />
          <span>Professionnalisme</span>
          <span className="h-1.5 w-1.5 bg-brand-green rounded-full" />
          <span>Respect</span>
          <span className="h-1.5 w-1.5 bg-brand-green rounded-full" />
          <span>Innovation</span>
        </div>

        {/* Footnotes of Goma/RDC copyright */}
        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] sm:text-xs text-white/50 select-none">
          <p className="text-center sm:text-left">
            &copy; {currentYear} CAPSY SERVICES. Tous droits réservés. Centre d'Assistance Psychologique (RDC).
          </p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition-colors">Mentions légales</a>
            <span>&bull;</span>
            <a href="#" className="hover:text-white transition-colors">Politique de confidentialité</a>
            <span>&bull;</span>
            <span className="text-brand-green flex items-center gap-1 font-semibold">
              <span className="h-2 w-2 rounded-full bg-brand-green animate-ping" />
              Goma & Kinshasa, RDC
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}
