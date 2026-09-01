import React, { useState, useEffect, useRef } from 'react';
import Logo from './Logo';
import LucideIcon from './LucideIcon';
import { motion, AnimatePresence } from 'motion/react';

interface HeaderProps {
  onOpenBooking: () => void;
  activeAppointmentsCount: number;
  onViewAppointments: () => void;
  user?: any;
  onLogin: () => void;
  onLogout: () => void;
  onViewProfile: () => void;
}

export default function Header({
  onOpenBooking,
  activeAppointmentsCount,
  onViewAppointments,
  user,
  onLogin,
  onLogout,
  onViewProfile,
}: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const toastRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (toastRef.current && !toastRef.current.contains(e.target as Node)) {
        setToastOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';
  const isHomePage = currentPath === '/';
  const useWhiteTop = !isHomePage && !scrolled;

  const navLinks = [
    { name: 'Accueil', href: '/' },
    { name: 'Services', href: '/services' },
    { name: 'À propos', href: '/a-propos' },
    { name: 'Formations', href: '/formations' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Gouvernance', href: '/gouvernance' },
    { name: 'Actualités', href: '/actualites' },
  ];

  // Lien "Mes rendez-vous" visible uniquement pour les utilisateurs connectés
  const rdvLink = { name: 'Mes rendez-vous', href: '/mes-rendezvous', icon: 'Calendar' };

  const isActiveLink = (href: string) => {
    if (href === '/' && currentPath === '/') return true;
    return currentPath === href;
  };

  const Avatar = ({ size = 'sm' }: { size?: 'sm' | 'md' }) => {
    const dim = size === 'sm' ? 'h-9 w-9 text-sm' : 'h-11 w-11 text-base';
    return (
      <div className={`${dim} rounded-full bg-brand-wellbeing text-white font-black font-poppins flex items-center justify-center overflow-hidden ring-2 ring-brand-wellbeing/30 cursor-pointer transition-all hover:ring-brand-wellbeing/60`}>
        {user?.avatar
          ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
          : <span>{initials}</span>
        }
      </div>
    );
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${scrolled ? 'bg-white shadow-md py-2.5 border-b border-gray-150' : useWhiteTop ? 'bg-transparent py-4' : 'bg-white/95 sm:bg-transparent py-4'}`}
      id="main-header"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">

          <a href="/" className="flex items-center">
            <Logo size="md" showSubtitle={true} variant={useWhiteTop ? 'white' : 'color'} />
          </a>

          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => {
              const active = isActiveLink(link.href);
              return (
                <a
                  key={link.name}
                  href={link.href}
                  className={`text-sm font-sans font-semibold transition-colors relative py-1 group ${active ? (useWhiteTop ? 'text-white' : 'text-brand-wellbeing') : useWhiteTop ? 'text-white hover:text-white/80' : 'text-brand-dark hover:text-brand-wellbeing'}`}
                >
                  {link.name}
                  <span className={`absolute bottom-0 left-0 h-0.5 bg-brand-confidence transition-all duration-300 ${active ? 'w-full' : 'w-0 group-hover:w-full'}`} />
                </a>
              );
            })}
            {/* Lien Mes rendez-vous pour les utilisateurs connectés */}
            {user && (
              <a
                href={rdvLink.href}
                onClick={onViewAppointments}
                className={`text-sm font-sans font-semibold transition-colors relative py-1 group flex items-center gap-1.5 ${isActiveLink(rdvLink.href) ? (useWhiteTop ? 'text-white' : 'text-brand-wellbeing') : useWhiteTop ? 'text-white hover:text-white/80' : 'text-brand-dark hover:text-brand-wellbeing'}`}
              >
                <LucideIcon name="CalendarDays" className="h-3.5 w-3.5" />
                {rdvLink.name}
                {activeAppointmentsCount > 0 && (
                  <span className="ml-0.5 bg-brand-wellbeing text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{activeAppointmentsCount}</span>
                )}
                <span className={`absolute bottom-0 left-0 h-0.5 bg-brand-confidence transition-all duration-300 ${isActiveLink(rdvLink.href) ? 'w-full' : 'w-0 group-hover:w-full'}`} />
              </a>
            )}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            {activeAppointmentsCount > 0 && !user && (
              <button
                onClick={onViewAppointments}
                className="py-2 px-3 bg-brand-wellbeing/10 hover:bg-brand-wellbeing/15 text-brand-wellbeing rounded-xl text-xs font-semibold font-poppins flex items-center gap-1.5 transition-all"
                id="my-appointments-header-btn"
              >
                <LucideIcon name="Clock" className="h-4 w-4" />
                <span>Mes RDV ({activeAppointmentsCount})</span>
              </button>
            )}

            {user ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={onViewAppointments}
                  className="relative p-2 text-brand-dark hover:bg-brand-gray-light rounded-xl transition-all group"
                  title="Mes rendez-vous"
                >
                  <LucideIcon name="Calendar" className="h-5 w-5 text-brand-wellbeing" />
                  {activeAppointmentsCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-brand-wellbeing text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm ring-1 ring-brand-wellbeing/20">
                      {activeAppointmentsCount}
                    </span>
                  )}
                </button>

                <div className="relative" ref={toastRef}>
                  <button onClick={() => setToastOpen(!toastOpen)} aria-label="Mon profil">
                    <Avatar />
                  </button>

                  <AnimatePresence>
                    {toastOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -8 }}
                        className="absolute top-12 right-0 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
                      >
                        <div className="p-5 bg-linear-to-br from-brand-wellbeing/5 to-brand-wellbeing/10 flex items-center gap-4 border-b border-gray-100">
                          <div className="h-12 w-12 rounded-full bg-brand-wellbeing text-white font-black font-poppins flex items-center justify-center overflow-hidden shrink-0 ring-2 ring-brand-wellbeing/30">
                            {user.avatar
                              ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                              : <span className="text-base">{initials}</span>
                            }
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold font-poppins text-brand-dark truncate">{user.name}</p>
                            <p className="text-xs text-brand-gray-text truncate">{user.email}</p>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-wellbeing">Client Odoo</span>
                          </div>
                        </div>

                        <div className="p-2">
                          <button
                            onClick={() => { setToastOpen(false); onViewAppointments(); }}
                            className="w-full px-4 py-2.5 text-sm text-brand-dark hover:bg-brand-gray-light rounded-xl flex items-center gap-3 transition-colors"
                          >
                            <LucideIcon name="Calendar" className="h-4 w-4 text-brand-wellbeing" />
                            <span className="font-medium">Mes rendez-vous</span>
                            {activeAppointmentsCount > 0 && (
                              <span className="ml-auto text-xs bg-brand-wellbeing text-white px-1.5 py-0.5 rounded-full">{activeAppointmentsCount}</span>
                            )}
                          </button>
                          <button
                            onClick={() => { setToastOpen(false); onViewProfile(); }}
                            className="w-full px-4 py-2.5 text-sm text-brand-dark hover:bg-brand-gray-light rounded-xl flex items-center gap-3 transition-colors"
                          >
                            <LucideIcon name="UserCircle" className="h-4 w-4 text-brand-wellbeing" />
                            <span className="font-medium">Mon profil</span>
                          </button>
                          <div className="my-1 border-t border-gray-100" />
                          <button
                            onClick={() => { setToastOpen(false); onLogout(); }}
                            className="w-full px-4 py-2.5 text-sm text-rose-500 hover:bg-rose-50 rounded-xl flex items-center gap-3 transition-colors"
                          >
                            <LucideIcon name="LogOut" className="h-4 w-4" />
                            <span className="font-medium">Se déconnecter</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <button
                onClick={onLogin}
                className={`py-2 px-4 rounded-xl text-xs font-bold font-poppins transition-all flex items-center gap-2 ${useWhiteTop ? 'bg-transparent border border-white text-white hover:bg-white/10' : 'text-brand-wellbeing hover:bg-brand-wellbeing/5'}`}
                style={useWhiteTop ? { borderColor: 'rgba(255,255,255,0.8)' } : undefined}
              >
                <LucideIcon name="User" className="h-4 w-4" />
                <span>Connexion</span>
              </button>
            )}

            <button
              onClick={onOpenBooking}
              className={`py-2.5 px-5 rounded-xl text-sm font-bold font-poppins flex items-center gap-2 transition-all shadow-md hover:-translate-y-0.5 cursor-pointer ${useWhiteTop ? 'bg-white text-brand-wellbeing hover:bg-white/90' : 'bg-brand-wellbeing hover:bg-brand-wellbeing/90 text-white shadow-lg hover:shadow-lg'}`}
              id="header-cta-booking-btn"
            >
              <LucideIcon name="Calendar" className="h-4 w-4" />
              <span>Prendre Rendez-vous</span>
            </button>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            {user ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={onViewAppointments}
                  className="relative p-2 text-brand-dark hover:bg-brand-gray-light rounded-xl transition-all"
                >
                  <LucideIcon name="Calendar" className="h-5 w-5 text-brand-wellbeing" />
                  {activeAppointmentsCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-brand-green text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                      {activeAppointmentsCount}
                    </span>
                  )}
                </button>
                <div className="relative" ref={toastRef}>
                  <button onClick={() => setToastOpen(!toastOpen)} className="relative">
                    <Avatar />
                  </button>
                  <AnimatePresence>
                    {toastOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -8 }}
                        className="absolute top-12 right-0 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
                      >
                        <div className="p-4 bg-linear-to-br from-brand-wellbeing/5 to-brand-wellbeing/10 border-b border-gray-100">
                          <p className="font-bold font-poppins text-brand-dark text-sm">{user.name}</p>
                          <p className="text-xs text-brand-gray-text">{user.email}</p>
                        </div>
                        <div className="p-2">
                          <button onClick={() => { setToastOpen(false); onViewProfile(); }}
                            className="w-full px-3 py-2 text-sm text-brand-dark hover:bg-brand-gray-light rounded-xl flex items-center gap-2">
                            <LucideIcon name="UserCircle" className="h-4 w-4 text-brand-wellbeing" />Mon profil
                          </button>
                          <button onClick={() => { setToastOpen(false); onLogout(); }}
                            className="w-full px-3 py-2 text-sm text-rose-500 hover:bg-rose-50 rounded-xl flex items-center gap-2">
                            <LucideIcon name="LogOut" className="h-4 w-4" />Déconnexion
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              activeAppointmentsCount > 0 && (
                <button onClick={onViewAppointments}
                  className="p-2 bg-brand-wellbeing/10 text-brand-wellbeing rounded-xl">
                  <LucideIcon name="Clock" className="h-4 w-4" />
                </button>
              )
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-xl transition-colors ${useWhiteTop ? 'text-white hover:bg-white/10' : 'text-brand-dark hover:bg-brand-gray-light'}`}
              aria-label="Menu principal"
              id="mobile-menu-toggle-btn"
            >
              <LucideIcon name={mobileMenuOpen ? 'X' : 'Menu'} className="h-6 w-6" />
            </button>
          </div>

        </div>
      </div>

      <div
        className={`lg:hidden transition-all duration-300 overflow-hidden bg-white border-b border-gray-150 ${mobileMenuOpen ? 'max-h-125 opacity-100 shadow-lg' : 'max-h-0 opacity-0 pointer-events-none'
          }`}
        id="mobile-menu-drawer"
      >
        <div className="px-4 py-4 space-y-3">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2.5 px-3 rounded-lg text-sm font-medium text-brand-dark hover:bg-brand-gray-light hover:text-brand-wellbeing transition-colors"
            >
              {link.name}
            </a>
          ))}
          {/* Lien Mes rendez-vous en mobile */}
          {user && (
            <a
              href={rdvLink.href}
              onClick={() => { setMobileMenuOpen(false); onViewAppointments(); }}
              className="flex items-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium text-brand-wellbeing bg-brand-wellbeing/5 hover:bg-brand-wellbeing/10 transition-colors"
            >
              <LucideIcon name="CalendarDays" className="h-4 w-4" />
              Mes rendez-vous
              {activeAppointmentsCount > 0 && (
                <span className="ml-auto bg-brand-wellbeing text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{activeAppointmentsCount}</span>
              )}
            </a>
          )}
          <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
            <button
              onClick={onOpenBooking}
              className="w-full sm:w-auto py-2.5 px-5 bg-brand-wellbeing hover:bg-brand-wellbeing/90 text-white text-xs font-bold font-poppins rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
              id="footer-inline-booking-btn"
            >
              <LucideIcon name="Calendar" className="h-4 w-4" />
              <span>Faire une réservation</span>
            </button>
            {!user && (
              <button
                onClick={() => { setMobileMenuOpen(false); onLogin(); }}
                className="w-full py-2.5 bg-brand-wellbeing/5 text-brand-wellbeing font-semibold font-poppins rounded-xl text-center text-sm flex items-center justify-center gap-2"
              >
                <LucideIcon name="User" className="h-4 w-4" />
                <span>Se connecter</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
