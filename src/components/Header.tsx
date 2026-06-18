import React, { useState, useEffect } from 'react';
import Logo from './Logo';
import LucideIcon from './LucideIcon';

interface HeaderProps {
  onOpenBooking: () => void;
  activeAppointmentsCount: number;
  onViewAppointments: () => void;
  user?: any;
  onLogin: () => void;
  onLogout: () => void;
}

export default function Header({
  onOpenBooking,
  activeAppointmentsCount,
  onViewAppointments,
  user,
  onLogin,
  onLogout,
}: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Services', href: '#services' },
    { name: 'Notre Identité', href: '#identite' },
    { name: 'Auto-Évaluation', href: '#stress-test' },
    { name: 'FAQ', href: '#faq' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${scrolled
        ? 'bg-white shadow-md py-2.5 border-b border-gray-150'
        : 'bg-white/95 sm:bg-transparent py-4'
        }`}
      id="main-header"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">

          {/* Logo element */}
          <a href="#" className="flex items-center">
            <Logo size="md" showSubtitle={true} variant="color" />
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-7">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm font-sans font-semibold text-brand-dark hover:text-brand-blue transition-colors relative py-1 group"
              >
                {link.name}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-green transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </nav>

          {/* Header Action Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            {activeAppointmentsCount > 0 && (
              <button
                onClick={onViewAppointments}
                className="py-2 px-3 bg-brand-blue/10 hover:bg-brand-blue/15 text-brand-blue rounded-xl text-xs font-semibold font-poppins flex items-center gap-1.5 transition-all"
                title="Gérer mes rendez-vous"
                id="my-appointments-header-btn"
              >
                <LucideIcon name="Clock" className="h-4 w-4" />
                <span>Mes RDV ({activeAppointmentsCount})</span>
              </button>
            )}

            {user ? (
              <div className="flex items-center gap-3 bg-brand-gray-light px-3 py-1.5 rounded-xl border border-gray-200">
                <div className="h-8 w-8 rounded-full bg-brand-blue text-white flex items-center justify-center font-bold text-sm">
                  {user.name.charAt(0)}
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-brand-dark leading-tight">{user.name}</span>
                  <button
                    onClick={onLogout}
                    className="text-[9px] text-rose-500 font-bold hover:underline text-left"
                  >
                    Déconnexion
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={onLogin}
                className="py-2 px-4 text-brand-blue hover:bg-brand-blue/5 rounded-xl text-xs font-bold font-poppins transition-all flex items-center gap-2"
              >
                <LucideIcon name="User" className="h-4 w-4" />
                <span>Connexion</span>
              </button>
            )}

            {/* Clear, highly conspicuous main CTA matching brand Vert Bien-être */}
            <button
              onClick={onOpenBooking}
              className="py-2.5 px-5 bg-brand-green hover:bg-brand-green/95 text-white rounded-xl text-sm font-bold font-poppins flex items-center gap-2 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
              id="header-cta-booking-btn"
            >
              <LucideIcon name="Calendar" className="h-4 w-4" />
              <span>Rendez-vous</span>
            </button>
          </div>

          {/* Mobile Right Controls */}
          <div className="flex items-center gap-2 lg:hidden">
            {activeAppointmentsCount > 0 && (
              <button
                onClick={onViewAppointments}
                className="p-2 bg-brand-blue/10 text-brand-blue rounded-xl flex items-center justify-center transition-all"
                aria-label="Accéder à mes rendez-vous"
              >
                <LucideIcon name="Clock" className="h-4 w-4" />
              </button>
            )}

            {/* Mobile Menu Toggle button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-brand-dark hover:bg-brand-gray-light rounded-xl transition-colors"
              aria-label="Menu principal"
              id="mobile-menu-toggle-btn"
            >
              <LucideIcon name={mobileMenuOpen ? 'X' : 'Menu'} className="h-6 w-6" />
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <div
        className={`lg:hidden transition-all duration-300 overflow-hidden bg-white border-b border-gray-150 ${mobileMenuOpen ? 'max-h-[420px] opacity-100 shadow-lg' : 'max-h-0 opacity-0 pointer-events-none'
          }`}
        id="mobile-menu-drawer"
      >
        <div className="px-4 py-4 space-y-3">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2.5 px-3 rounded-lg text-sm font-medium text-brand-dark hover:bg-brand-gray-light hover:text-brand-blue transition-colors"
            >
              {link.name}
            </a>
          ))}

          <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenBooking();
              }}
              className="w-full py-3 bg-brand-green hover:bg-brand-green/95 text-white font-bold font-poppins rounded-xl text-center text-sm flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
              id="mobile-drawer-cta-booking-btn"
            >
              <LucideIcon name="Calendar" className="h-4.5 w-4.5" />
              <span>Prendre un rendez-vous</span>
            </button>

            {activeAppointmentsCount > 0 && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onViewAppointments();
                }}
                className="w-full py-2.5 bg-brand-gray-light text-brand-blue hover:bg-brand-blue/10 font-semibold font-poppins rounded-xl text-center text-xs flex items-center justify-center gap-2 transition-all"
              >
                <LucideIcon name="Clock" className="h-4 w-4" />
                <span>Consulter mes {activeAppointmentsCount} demandes de RDV</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
