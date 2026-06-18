import React, { useEffect, useState } from 'react';
import { Appointment } from '../types';
import { SERVICES } from '../data/staticData';
import LucideIcon from './LucideIcon';

interface AppointmentsManagerProps {
  onOpenBooking: () => void;
  onRefreshCounter: (count: number) => void;
  user?: any;
}

export default function AppointmentsManager({
  onOpenBooking,
  onRefreshCounter,
  user,
}: AppointmentsManagerProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFromOdoo = async () => {
    // If no user is logged in, we don't show Odoo appointments
    if (!user) {
      setAppointments([]);
      onRefreshCounter(0);
      return;
    }

    setIsRefreshing(true);
    setError(null);

    try {
      const response = await fetch('/api/odoo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_appointments',
          params: { partnerInfo: user.email }
        })
      });

      if (response.ok) {
        const data = await response.json();

        // Map Odoo calendar.event to our Appointment interface
        const mapped: Appointment[] = (data.appointments || []).map((app: any) => {
          // Odoo dates are usually in "YYYY-MM-DD HH:MM:SS"
          const startDate = app.start ? new Date(app.start.replace(' ', 'T') + 'Z') : new Date();
          const stopDate = app.stop ? new Date(app.stop.replace(' ', 'T') + 'Z') : new Date();

          return {
            id: `odoo-${app.id}`,
            serviceId: 'odoo-sync',
            serviceTitle: app.name.replace('RDV: ', ''),
            date: startDate.toISOString().split('T')[0],
            timeSlot: `${startDate.getHours()}h00 - ${stopDate.getHours()}h00`,
            preferredTherapist: 'Assigné Odoo',
            clientName: user.name,
            clientEmail: user.email,
            clientPhone: '',
            clientNotes: app.description || 'Aucun détail',
            createdAt: startDate.toISOString(), // Placeholder
            status: 'confirmed'
          };
        });

        setAppointments(mapped);
        onRefreshCounter(mapped.length);
      } else {
        const errData = await response.json();
        setError(errData.error || 'Erreur de synchronisation');
      }
    } catch (err) {
      console.error('Odoo load error:', err);
      setError('Impossible de se connecter à Odoo');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadFromOdoo();

    const handleUpdate = () => {
      loadFromOdoo();
    };

    window.addEventListener('appointments-updated', handleUpdate);
    window.addEventListener('auth-changed', handleUpdate);

    return () => {
      window.removeEventListener('appointments-updated', handleUpdate);
      window.removeEventListener('auth-changed', handleUpdate);
    };
  }, [user]);

  const handlePay = async (app: Appointment) => {
    const service = SERVICES.find((s) => s.id === app.serviceId);
    const amount = service?.price || 40;

    try {
      const response = await fetch('/api/odoo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_payment',
          params: { amount, appointmentId: app.id.replace('odoo-', '') }
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.payment_url) {
          window.open(data.payment_url, '_blank');
        }
      }
    } catch (err) {
      console.error('Payment error:', err);
      alert('Erreur lors de la préparation du paiement.');
    }
  };

  // If no user is logged in, we hide the manager (as per your request to not use LocalStorage)
  if (!user) {
    return null;
  }

  return (
    <section className="py-20 bg-white" id="mes-rendezvous">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex p-2 bg-brand-blue/10 rounded-full text-brand-blue mb-2.5">
            <LucideIcon name="Clock" className="h-6 w-6 text-brand-green" />
          </div>
          <h2 className="text-3xl font-poppins font-black text-brand-blue tracking-tight">
            Vos Rendez-vous Odoo
          </h2>
          <p className="text-sm text-brand-gray-text mt-2 leading-relaxed">
            Liste de vos consultations récupérées en temps réel depuis votre compte CAPSY Services sur Odoo.
          </p>
          <button
            onClick={loadFromOdoo}
            className="mt-4 text-xs font-bold text-brand-blue flex items-center justify-center gap-1.5 mx-auto hover:underline"
            disabled={isRefreshing}
          >
            <LucideIcon name="RefreshCw" className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Mise à jour...' : 'Actualiser'}</span>
          </button>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-rose-50 border border-rose-200 text-rose-600 text-sm rounded-2xl flex items-center gap-3">
            <LucideIcon name="AlertCircle" className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-4">
          {appointments.length === 0 && !isRefreshing && !error ? (
            <div className="text-center py-20 bg-brand-gray-light rounded-3xl border-2 border-dashed border-gray-200">
              <LucideIcon name="Calendar" className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-brand-dark">Aucun rendez-vous</h3>
              <p className="text-sm text-brand-gray-text mt-1">
                Vous n'avez pas encore de rendez-vous programmé sur Odoo.
              </p>
              <button
                onClick={onOpenBooking}
                className="mt-6 px-6 py-2.5 bg-brand-blue text-white rounded-xl font-bold text-sm hover:bg-brand-blue/90 transition-all"
              >
                Prendre un rendez-vous
              </button>
            </div>
          ) : (
            appointments.map((app) => (
              <div
                key={app.id}
                className="bg-white rounded-2xl border-2 border-slate-100 hover:border-brand-blue/30 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 shadow-sm transition-all relative overflow-hidden"
              >
                <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-brand-blue" />

                <div className="space-y-3.5 flex-1 pl-2">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-mono text-[10px] font-bold text-brand-blue bg-brand-blue/10 px-2 py-0.5 rounded-md lowercase">
                      {app.id}
                    </span>
                    <span className="text-[10px] bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      Confirmé Odoo
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-poppins font-bold text-brand-dark lowercase first-letter:uppercase">
                      {app.serviceTitle}
                    </h4>
                  </div>

                  <div className="flex flex-wrap gap-4 text-xs font-semibold font-sans mt-2.5 text-brand-dark py-2 px-3 bg-brand-gray-light rounded-xl w-fit">
                    <div className="flex items-center gap-1.5">
                      <LucideIcon name="Calendar" className="h-4 w-4 text-brand-green" />
                      <span>
                        {new Date(app.date).toLocaleDateString('fr-FR', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="h-4 w-[1px] bg-gray-300" />
                    <div className="flex items-center gap-1.5">
                      <LucideIcon name="Clock" className="h-4 w-4 text-brand-green" />
                      <span className="font-mono">{app.timeSlot}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto self-stretch sm:self-center justify-end shrink-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                  <button
                    type="button"
                    onClick={() => handlePay(app)}
                    className="flex-1 sm:flex-none py-2.5 px-5 bg-brand-green hover:bg-brand-green/90 text-white font-bold font-poppins text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm"
                  >
                    <LucideIcon name="CreditCard" className="h-4 w-4" />
                    <span>Payer</span>
                  </button>

                  <a
                    href="https://wa.me/243971234567"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-none py-2.5 px-5 bg-white border border-gray-200 text-brand-dark hover:bg-gray-50 font-bold font-poppins text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all"
                  >
                    <LucideIcon name="MessageCircle" className="h-4 w-4 text-green-500" />
                    <span>Aide</span>
                  </a>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="bg-brand-blue/5 p-5 rounded-2xl border border-brand-blue/10 flex gap-4 text-xs text-brand-gray-text leading-relaxed mt-10">
          <LucideIcon name="ShieldCheck" className="h-5 w-5 text-brand-blue shrink-0" />
          <p>
            Ces informations proviennent directement de votre compte <strong>Odoo CAPSY Services</strong>.
            Connecté en tant que <strong>{user.name}</strong>.
          </p>
        </div>
      </div>
    </section>
  );
}
