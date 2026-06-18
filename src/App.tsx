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

export default function App() {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [initialServiceId, setInitialServiceId] = useState('');
  const [appointmentsCount, setAppointmentsCount] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [loginOpen, setLoginOpen] = useState(false);

  const refreshAppointmentsCount = () => {
    try {
      const saved = localStorage.getItem('capsy_appointments');
      if (saved) {
        const list = JSON.parse(saved);
        setAppointmentsCount(list.length);
      } else {
        setAppointmentsCount(0);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    refreshAppointmentsCount();

    // Check for booking query parameter
    const params = new URLSearchParams(window.location.search);
    const bookingParam = params.get('booking');
    if (bookingParam) {
      handleOpenBooking(bookingParam);
      // Clean query parameter from URL bar without page reload
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }

    // Check for saved user
    const savedUser = localStorage.getItem('capsy_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    // Listen to changes (e.g. booked/cancelled)
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
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenStressTest = () => {
    const el = document.getElementById('stress-test');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('capsy_user');
    setUser(null);
    window.dispatchEvent(new Event('auth-changed'));
  };

  const isFullScreenChat = typeof window !== 'undefined' &&
    (window.location.search.includes('chat=true') || window.location.pathname === '/chat');

  if (isFullScreenChat) {
    return (
      <div className="h-screen w-screen overflow-hidden bg-white">
        <Chatbot onOpenBooking={handleOpenBooking} isFullScreen={true} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-brand-dark flex flex-col font-sans selection:bg-brand-green/20 selection:text-brand-dark" id="capsy-landing-root">

      {/* Upper Navigation Header */}
      <Header
        onOpenBooking={() => handleOpenBooking('')}
        activeAppointmentsCount={appointmentsCount}
        onViewAppointments={handleViewAppointments}
        user={user}
        onLogin={() => setLoginOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Container */}
      <main className="flex-grow">

        {/* Hero Section Banner */}
        <Hero
          onOpenBooking={() => handleOpenBooking('')}
          onOpenStressTest={handleOpenStressTest}
        />

        {/* Services Grid (Bento/Card format) */}
        <div id="services">
          <ServicesGrid onSelectService={handleOpenBooking} />
        </div>

        {/* Brand Core Identity Section (Mission, Vision, Values) */}
        <div id="identite">
          <IdentitySection />
        </div>

        {/* Innovative Self-assessment Stress Test questionnaire */}
        <section className="py-20 bg-brand-gray-light border-y border-gray-150" id="stress-test">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-center text-3xl font-poppins font-black text-brand-blue tracking-tight mb-3">
              Solutions Innovantes — Prenez un moment pour vous
            </h2>
            <p className="text-center text-sm text-brand-gray-text max-w-xl mx-auto mb-12">
              Le stress affecte de nombreuses personnes de façon silencieuse. Répondez sincèrement et découvrez nos conseils personnalisés.
            </p>
            <StressTest onOpenBooking={handleOpenBooking} />
          </div>
        </section>

        {/* Persistent List of client reservations logged on current device */}
        <AppointmentsManager
          onOpenBooking={() => handleOpenBooking('')}
          onRefreshCounter={refreshAppointmentsCount}
        />

        {/* Collapsible Accordion FAQs */}
        <div id="faq">
          <Faqs />
        </div>

        {/* Contact info, physical location map, and secure messaging form */}
        <div id="contact">
          <ContactSection />
        </div>

      </main>

      {/* Brand Dark-themed footer */}
      <Footer onOpenBooking={() => handleOpenBooking('')} />

      {/* Responsive scheduler wizard (Multi-step portal popup drawer) */}
      <BookingModal
        isOpen={bookingOpen}
        onClose={() => setBookingOpen(false)}
        initialServiceId={initialServiceId}
        onBookingSuccess={() => {
          refreshAppointmentsCount();
          // Broadcast custom event
          window.dispatchEvent(new Event('appointments-updated'));
        }}
      />

      {/* Floating conversational assistant */}
      <Chatbot onOpenBooking={handleOpenBooking} />

      {/* Login Modal */}
      <LoginModal
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
        onLoginSuccess={(u) => setUser(u)}
      />

    </div>
  );
}
