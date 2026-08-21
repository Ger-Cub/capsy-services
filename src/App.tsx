import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import BookingModal from './components/BookingModal';
import Chatbot from './components/Chatbot';
import LoginModal from './components/LoginModal';
import UserProfilePage from './components/UserProfilePage';
import OdooDashboard from './components/OdooDashboard';
import ToastContainer from './components/Toast';
import HomePage from './pages/HomePage';
import StressTest from './components/StressTest';
import { AnimatePresence, motion } from 'motion/react';
import ServicesPage from './pages/ServicesPage';
import AboutPage from './pages/AboutPage';
import FaqPage from './pages/FaqPage';
import GovernancePage from './pages/GovernancePage';
import ContactPage from './pages/ContactPage';
import FormationsPage from './pages/FormationsPage';
import ActualitesPage from './pages/ActualitesPage';
import ActualiteDetailPage from './pages/ActualiteDetailPage';
import ContactSection from './components/ContactSection';
import RendezVousPage from './pages/RendezVousPage';

export default function App() {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [initialServiceId, setInitialServiceId] = useState('');
  const [appointmentsCount, setAppointmentsCount] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [stressOpen, setStressOpen] = useState(false);

  // --- Client-side SPA routing state ---
  const [currentLocation, setCurrentLocation] = useState({
    pathname: window.location.pathname,
    search: window.location.search,
  });

  const refreshAppointmentsCount = (count?: number) => {
    if (typeof count === 'number') {
      setAppointmentsCount(count);
      return;
    }
  };

  useEffect(() => {
    refreshAppointmentsCount();

    const handleLocationChange = () => {
      setCurrentLocation({
        pathname: window.location.pathname,
        search: window.location.search,
      });

      const params = new URLSearchParams(window.location.search);
      const bookingParam = params.get('booking');
      if (bookingParam) {
        handleOpenBooking(bookingParam);
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      }
    };

    handleLocationChange();

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('locationchange', handleLocationChange);

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

    // Global click listener to intercept internal SPA link navigation without full page reloads
    const handleGlobalClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (!target) return;
      const href = target.getAttribute('href');
      if (!href) return;

      if (
        href.startsWith('http://') ||
        href.startsWith('https://') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('#') ||
        target.getAttribute('target') === '_blank' ||
        e.metaKey || e.ctrlKey || e.shiftKey || e.altKey
      ) {
        return;
      }

      if (href.startsWith('/')) {
        e.preventDefault();
        if (window.location.pathname + window.location.search !== href) {
          window.history.pushState({}, '', href);
          window.dispatchEvent(new Event('locationchange'));
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    };

    document.addEventListener('click', handleGlobalClick);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('locationchange', handleLocationChange);
      document.removeEventListener('click', handleGlobalClick);
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
    // Naviguer vers la page dédiée si un user est connecté, sinon scroll vers section
    window.history.pushState({}, '', '/mes-rendezvous');
    window.dispatchEvent(new Event('locationchange'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenStressTest = () => {
    setStressOpen(true);
  };

  const handleOpenStressBooking = (serviceId: string = '') => {
    setStressOpen(false);
    handleOpenBooking(serviceId);
  };

  const handleLogout = () => {
    localStorage.removeItem('capsy_user');
    setUser(null);
    window.dispatchEvent(new Event('auth-changed'));
  };

  // --- Vues spéciales ---
  const pathname = currentLocation.pathname;
  const search = currentLocation.search;
  const isFullScreenChat = search.includes('chat=true') || pathname === '/chat';
  const isDashboard = search.includes('dashboard=true');

  // Page routes
  const isFormations = pathname === '/formations' || pathname.startsWith('/formations/');
  const isActualites = pathname === '/actualites';
  const actualiteMatch = pathname.match(/^\/actualites\/(.+)$/);
  const actualiteSlug = actualiteMatch ? actualiteMatch[1] : undefined;
  const isServices = pathname === '/services';
  const isAPropos = pathname === '/a-propos';
  const isFaq = pathname === '/faq';
  const isGouvernance = pathname === '/gouvernance';
  const isContact = pathname === '/contact';
  const isRendezVous = pathname === '/mes-rendezvous';
  const certifMatch = pathname.match(/^\/formations\/certificat\/(.+)$/);
  const certifId = certifMatch ? certifMatch[1] : undefined;

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

  const currentPageContent = isRendezVous ? (
    <RendezVousPage user={user} onOpenBooking={() => handleOpenBooking('')} onLogin={() => setLoginOpen(true)} />
  ) : isServices ? (
    <ServicesPage onOpenBooking={handleOpenBooking} />
  ) : isAPropos ? (
    <AboutPage onOpenBooking={handleOpenBooking} />
  ) : isFaq ? (
    <FaqPage onOpenBooking={handleOpenBooking} />
  ) : isGouvernance ? (
    <GovernancePage onOpenBooking={handleOpenBooking} />
  ) : isContact ? (
    <ContactPage onOpenBooking={handleOpenBooking} />
  ) : actualiteSlug ? (
    <ActualiteDetailPage slug={actualiteSlug} />
  ) : isActualites ? (
    <ActualitesPage onOpenBooking={handleOpenBooking} />
  ) : isFormations ? (
    <FormationsPage certifId={certifId} onOpenBooking={handleOpenBooking} />
  ) : (
    <HomePage onOpenBooking={handleOpenBooking} onOpenStressTest={handleOpenStressTest} user={user} onViewAppointments={handleViewAppointments} />
  );

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

      <main className="grow">
        {currentPageContent}
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

      <ToastContainer />

      <LoginModal
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
        onLoginSuccess={(u) => setUser(u)}
      />

      <AnimatePresence>
        {stressOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setStressOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ type: 'spring', damping: 22, stiffness: 180 }}
              className="w-full max-w-3xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <StressTest onOpenBooking={handleOpenStressBooking} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
