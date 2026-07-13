import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import ServicesGrid from './components/ServicesGrid';
import IdentitySection from './components/IdentitySection';
import StressTest from './components/StressTest';
import AppointmentsManager from './components/AppointmentsManager';
import Faqs from './components/Faqs';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import BookingModal from './components/BookingModal';
import Chatbot from './components/Chatbot';
import LoginModal from './components/LoginModal';
import UserProfilePage from './components/UserProfilePage';
import OdooDashboard from './components/OdooDashboard';
import FormationsPage from './components/FormationsPage';

export default function App() {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [initialServiceId, setInitialServiceId] = useState('');
  const [appointmentsCount, setAppointmentsCount] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const refreshAppointmentsCount = (count?: number) => {
    if (typeof count === 'number') {
      setAppointmentsCount(count);
      return;
    }
  };

  useEffect(() => {
    refreshAppointmentsCount();

    const params = new URLSearchParams(window.location.search);
    const bookingParam = params.get('booking');
    if (bookingParam) {
      handleOpenBooking(bookingParam);
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }

    const savedUser = localStorage.getItem('capsy_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    const handleStorageChange = () => {
      refreshAppointmentsCount();
      const updatedUser = localStorage.getItem('capsy_user');
      setUser(updatedUser ? JSON.parse(updatedUser) : null);
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('appointments-updated', handleStorageChange);
    window.addEventListener('auth-changed', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('appointments-updated', handleStorageChange);
      window.removeEventListener('auth-changed', handleStorageChange);
    };
  }, []);

  const handleOpenBooking = (serviceId: string = '') => {
    setInitialServiceId(serviceId);
    setBookingOpen(true);
  };

  const handleViewAppointments = () => {
    const el = document.getElementById('mes-rendezvous');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleOpenStressTest = () => {
    const el = document.getElementById('stress-test');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleLogout = () => {
    localStorage.removeItem('capsy_user');
    setUser(null);
    window.dispatchEvent(new Event('auth-changed'));
  };

  // --- Vues spéciales ---
  const pathname = window.location.pathname;
  const isFullScreenChat = window.location.search.includes('chat=true') || pathname === '/chat';
  const isDashboard = window.location.search.includes('dashboard=true');

  // Formations routes
  const isFormations = pathname === '/formations' || pathname.startsWith('/formations/');
  const certifMatch = pathname.match(/^\/formations\/certificat\/(.+)$/);
  const certifId = certifMatch ? certifMatch[1] : undefined;

  if (isFormations) {
    return (
      <div className="min-h-screen bg-white text-brand-dark flex flex-col font-sans" id="formations-root">
        <FormationsPage certifId={certifId} />
      </div>
    );
  }

  if (isDashboard) {
    return <OdooDashboard />;
  }

  if (isFullScreenChat) {
    return (
      <div className="h-screen w-screen overflow-hidden bg-white">
        <Chatbot onOpenBooking={handleOpenBooking} isFullScreen={true} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-brand-dark flex flex-col font-sans selection:bg-brand-wellbeing/20 selection:text-brand-dark" id="capsy-landing-root">

      <Header
        onOpenBooking={() => handleOpenBooking('')}
        activeAppointmentsCount={appointmentsCount}
        onViewAppointments={handleViewAppointments}
        user={user}
        onLogin={() => setLoginOpen(true)}
        onLogout={handleLogout}
        onViewProfile={() => setProfileOpen(true)}
      />

      <main className="flex-grow">
        <Hero
          onOpenBooking={() => handleOpenBooking('')}
          onOpenStressTest={handleOpenStressTest}
        />

        <AppointmentsManager
          onOpenBooking={() => handleOpenBooking('')}
          onRefreshCounter={refreshAppointmentsCount}
          user={user}
        />

        <div id="services">
          <ServicesGrid onSelectService={handleOpenBooking} />
        </div>

        <div id="identite">
          <IdentitySection />
        </div>

        <section className="py-20 bg-brand-gray-light border-y border-gray-150" id="stress-test">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-center text-3xl font-poppins font-black text-brand-wellbeing tracking-tight mb-3">
              Solutions Innovantes — Prenez un moment pour vous
            </h2>
            <p className="text-center text-sm text-brand-gray-text max-w-xl mx-auto mb-12">
              Le stress affecte de nombreuses personnes de façon silencieuse. Répondez sincèrement et découvrez nos conseils personnalisés.
            </p>
            <StressTest onOpenBooking={handleOpenBooking} />
          </div>
        </section>

        <div id="faq">
          <Faqs />
        </div>

        <div id="contact">
          <ContactSection />
        </div>
      </main>

      <Footer onOpenBooking={() => handleOpenBooking('')} />

      <BookingModal
        isOpen={bookingOpen}
        onClose={() => setBookingOpen(false)}
        initialServiceId={initialServiceId}
        onBookingSuccess={() => {
          refreshAppointmentsCount();
          window.dispatchEvent(new Event('appointments-updated'));
          setTimeout(handleViewAppointments, 500);
        }}
        user={user}
      />

      <Chatbot onOpenBooking={handleOpenBooking} />

      <LoginModal
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
        onLoginSuccess={(u) => setUser(u)}
      />

      {user && profileOpen && (
        <UserProfilePage
          user={user}
          onClose={() => setProfileOpen(false)}
          onLogout={handleLogout}
        />
      )}

    </div>
  );
}
