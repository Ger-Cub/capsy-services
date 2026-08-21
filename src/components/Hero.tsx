import React from 'react';
import LucideIcon from './LucideIcon';
import therapistImage from '../assets/images/capsy_consultation_1781254897566.jpg';
import AppointmentsPreview from './AppointmentsPreview';

interface HeroProps {
  onOpenBooking: () => void;
  onOpenStressTest: () => void;
  user?: any;
  onViewAppointments?: () => void;
}

export default function Hero({ onOpenBooking, onOpenStressTest, user, onViewAppointments }: HeroProps) {
  // Image imported above so Vite includes it in production builds

  return (
    <section className="relative overflow-hidden pt-28 pb-16 lg:pt-36 lg:pb-24 bg-gradient-to-br from-white via-white to-brand-wellbeing/5" id="hero-section">

      {/* Background Graphic elements mimicking Image 1 */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-brand-wellbeing/5 rounded-b-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-1/4 h-1/3 bg-brand-wellbeing/5 rounded-r-full blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Left Text details */}
          <div className="lg:col-span-6 space-y-6 text-left" id="hero-text-container">

            {/* Status tagline and RDC emphasis */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-confidence/20 border border-brand-confidence/40 shadow-2xs">
              <span className="flex h-2 w-2 rounded-full bg-brand-confidence animate-pulse" />
              <span className="text-[10px] sm:text-xs font-bold font-poppins text-brand-dark uppercase tracking-widest">
                Capsy Services — RDC
              </span>
            </div>

            <div className="space-y-4">
              {/* Bold headline mimicking Image 1 */}
              <h1 className="text-4xl sm:text-5xl lg:text-5xl font-poppins font-black text-brand-wellbeing leading-[1.125] tracking-tight">
                Le stress n’est pas <br />
                <span className="text-brand-wellbeing">
                  une faiblesse.
                </span>
              </h1>

              {/* Brand core explanation from Image 1 */}
              <p className="text-base sm:text-lg text-brand-gray-text leading-relaxed max-w-xl font-normal font-sans">
                Lorsqu’il devient chronique, il peut affecter grandement votre santé, votre travail et vos relations de couple ou de famille. Parler à quelqu’un qualifié est le premier pas vers le mieux-être.
              </p>
            </div>

            {/* Crucial CTA Call to Action: Green Button formatted like Image 1 */}
            <div className="flex flex-col sm:flex-row gap-3.5 pt-2">
              <button
                onClick={onOpenBooking}
                className="py-3.5 px-7 bg-brand-wellbeing hover:bg-brand-wellbeing/95 text-white rounded-2xl text-base font-extrabold font-poppins flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 cursor-pointer group"
                id="hero-main-cta-btn"
              >
                <div className="p-1 bg-white/10 rounded-lg group-hover:scale-110 transition-transform">
                  <LucideIcon name="Calendar" className="h-5 w-5 text-white" strokeWidth={2.5} />
                </div>
                <span>PRENDRE RENDEZ-VOUS</span>
              </button>

              <button
                onClick={onOpenStressTest}
                className="py-3.5 px-6 bg-brand-wellbeing/10 hover:bg-brand-wellbeing/15 text-brand-wellbeing rounded-2xl text-sm font-bold font-poppins flex items-center justify-center gap-2 transition-all"
                id="hero-secondary-cta-btn"
              >
                <LucideIcon name="Sparkles" className="h-4.5 w-4.5 text-brand-wellbeing" />
                <span>Tester mon niveau de stress</span>
              </button>
            </div>

            {/* Quick trust metrics */}
            <div className="pt-6 border-t border-gray-100 grid grid-cols-3 gap-4">
              <div>
                <p className="text-xl sm:text-2xl font-bold font-poppins text-brand-wellbeing">100%</p>
                <p className="text-[10px] text-brand-gray-text uppercase font-semibold tracking-wide">Confidentiel</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold font-poppins text-brand-wellbeing">Goma</p>
                <p className="text-[10px] text-brand-gray-text uppercase font-semibold tracking-wide">Cabinet Medical</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold font-poppins text-brand-wellbeing">Direct</p>
                <p className="text-[10px] text-brand-gray-text uppercase font-semibold tracking-wide">Accompagnement</p>
              </div>
            </div>

            {/* Aperçu des prochains rendez-vous pour les utilisateurs connectés */}
            {user && onViewAppointments && (
              <AppointmentsPreview
                user={user}
                onViewAll={onViewAppointments}
                onOpenBooking={onOpenBooking}
              />
            )}

          </div>

          {/* Right Side Image framing mimicking Image 1 */}
          <div className="lg:col-span-6 relative flex justify-center" id="hero-image-pane">
            <div className="relative w-full max-w-md sm:max-w-lg lg:max-w-none">

              {/* Curved Background Backdrop shape simulating Image 1 path */}
              <div className="absolute inset-0 bg-brand-wellbeing/10 rounded-3xl -rotate-3 scale-98" />

              {/* Secondary graphic frame block info */}
              <div className="absolute top-4 right-4 bg-brand-dark/90 backdrop-blur-xs text-white p-3 rounded-2xl flex items-center gap-2 shadow-md z-15 select-none animate-pulse">
                <LucideIcon name="Heart" className="h-4 w-4 text-brand-confidence" />
                <span className="text-[10px] sm:text-xs font-poppins font-medium">Votre bien-être est notre priorité</span>
              </div>

              {/* The Therapist/Consultant Image */}
              <div className="overflow-hidden rounded-3xl shadow-xl border-4 border-white relative z-10 aspect-square sm:aspect-4/3 max-h-[480px]">
                <img
                  src={therapistImage}
                  alt="Thérapeute psychologue de Capsy Services accueillante"
                  className="w-full h-full object-cover transition-transform hover:scale-102 duration-700"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Floating Quote Bubbles: Green outline box simulating Image 1 quote */}
              <div className="absolute -bottom-6 -right-2 sm:-right-6 bg-white border border-brand-confidence/50 p-4 rounded-2xl shadow-xl max-w-[280px] z-20 flex gap-3 items-start select-none">
                <div className="p-1 bg-brand-confidence/10 rounded-full text-brand-confidence shrink-0 mt-1">
                  <LucideIcon name="MessageSquareShare" className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="text-xs text-brand-dark leading-relaxed italic font-medium font-sans">
                    « Parler à quelqu’un est souvent le premier pas vers le <span className="text-brand-wellbeing font-extrabold">mieux-être</span>. »
                  </p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
