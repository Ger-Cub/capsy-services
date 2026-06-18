import React, { useEffect, useState } from 'react';
import { Appointment } from '../types';
import { SERVICES } from '../data/staticData';
import LucideIcon from './LucideIcon';

interface AppointmentsManagerProps {
  onOpenBooking: () => void;
  onRefreshCounter: () => void;
  user?: any;
}

export default function AppointmentsManager({
  onOpenBooking,
  onRefreshCounter,
  user,
}: AppointmentsManagerProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadAppointments = async () => {
    if (user) {
      await loadFromOdoo();
      return;
    }

    try {
      const saved = localStorage.getItem('capsy_appointments');
      if (saved) {
        setAppointments(JSON.parse(saved));
      } else {
        setAppointments([]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadFromOdoo = async () => {
    if (!user) return;
    setIsRefreshing(true);
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
        const mapped: Appointment[] = data.appointments.map((app: any) => ({
          id: app.id.toString(),
          serviceId: 'odoo-sync', // Placeholder for Odoo events
          serviceTitle: app.name,
          date: app.start.split(' ')[0],
          timeSlot: `${app.start.split(' ')[1].substring(0, 5)} - ${app.stop.split(' ')[1].substring(0, 5)}`,
          preferredTherapist: 'Assigné Odoo',
          clientName: user.name,
          clientEmail: user.email,
          clientPhone: '',
          clientNotes: app.description || 'Aucune note',
          createdAt: new Date().toISOString(),
          status: 'confirmed'
        }));
        setAppointments(mapped);
      }
    } catch (err) {
      console.error('Odoo load error:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRefreshFromOdoo = async () => {
    if (appointments.length === 0) return;
    setIsRefreshing(true);
    // Use the first appointment's contact info to fetch all related ones
    const contactInfo = appointments[0].clientPhone || appointments[0].clientEmail;

    try {
      const response = await fetch('/api/odoo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_appointments',
          params: { partnerInfo: contactInfo }
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched from Odoo:', data.appointments);
        // Here we could merge or update statuses, but for now we just log it
      }
    } catch (err) {
      console.error('Refresh error:', err);
    } finally {
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  };

  useEffect(() => {
    loadAppointments();

    const handleUpdate = () => {
      loadAppointments();
    };

    window.addEventListener('storage', handleUpdate);
    window.addEventListener('appointments-updated', handleUpdate);
    window.addEventListener('auth-changed', handleUpdate);

    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('appointments-updated', handleUpdate);
      window.removeEventListener('auth-changed', handleUpdate);
    };
  }, [user]);

  const handleCancelAppointment = (id: string) => {
    if (window.confirm('Voulez-vous vraiment annuler cette demande de consultation ?')) {
      const saved = localStorage.getItem('capsy_appointments');
      if (saved) {
        const list: Appointment[] = JSON.parse(saved);
        const updated = list.filter((app) => app.id !== id);
        localStorage.setItem('capsy_appointments', JSON.stringify(updated));
        setAppointments(updated);
        onRefreshCounter();
        // Trigger global listener
        window.dispatchEvent(new Event('appointments-updated'));
      }
    }
  };
  const handlePay = async (app: Appointment) => {
    const service = SERVICES.find((s) => s.id === app.serviceId);
    const amount = service?.price || 40;

    try {
      const response = await fetch('/api/odoo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_payment',
          params: { amount, appointmentId: app.id }
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
      alert('Erreur lors de la préparation du paiement. Veuillez réessayer ou payer sur place.');
    }
  };

  if (appointments.length === 0 && !user) {
    return null; // Return empty for anonymous users if no local storage
  }

  return (
    <section className="py-20 bg-white" id="mes-rendezvous">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Title Alignment */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex p-2 bg-brand-blue/10 rounded-full text-brand-blue mb-2.5">
            <LucideIcon name="Clock" className="h-6 w-6 text-brand-green" />
          </div>
          <h2 className="text-3xl font-poppins font-black text-brand-blue tracking-tight">
            Vos Demandes de Consultation
          </h2>
          <p className="text-sm text-brand-gray-text mt-2 leading-relaxed">
            Consultez, suivez et gérez l'état de vos demandes de rendez-vous. Connecté en temps réel à notre instance Odoo.
          </p>
          <button
            onClick={handleRefreshFromOdoo}
            className="mt-4 text-xs font-bold text-brand-blue flex items-center justify-center gap-1.5 mx-auto hover:underline"
            disabled={isRefreshing}
          >
            <LucideIcon name="RefreshCw" className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Synchronisation...' : 'Actualiser mes statuts'}</span>
          </button>
        </div>

        {/* List of active requests */}
        <div className="space-y-4" id="appointments-tracking-list">
          {appointments.length === 0 ? (
            <div className="text-center py-12 bg-brand-gray-light rounded-2xl border-2 border-dashed border-gray-200">
              <LucideIcon name="Calendar" className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-brand-gray-text">Aucun rendez-vous trouvé dans votre compte Odoo.</p>
              <button
                onClick={onOpenBooking}
                className="mt-4 text-xs font-bold text-brand-blue hover:underline"
              >
                Prendre mon premier rendez-vous
              </button>
            </div>
          ) : (
            appointments.map((app) => (
              <div
                key={app.id}
                className="bg-white rounded-2xl border-2 border-slate-100 hover:border-slate-200 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 shadow-sm transition-all relative overflow-hidden"
              >
                {/* Highlight left vertical bar */}
                <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-brand-blue" />

                <div className="space-y-3.5 flex-1 pl-2">

                  {/* ID & Date Header */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-brand-blue bg-brand-blue/10 px-2.5 py-1 rounded-md">
                      {app.id}
                    </span>

                    <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      En attente d'appel
                    </span>

                    <span className="text-xs text-brand-gray-text font-semibold">
                      Créé {new Date(app.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  {/* Details breakdown */}
                  <div>
                    <h4 className="text-base font-poppins font-bold text-brand-dark">
                      {app.serviceTitle}
                    </h4>
                    <p className="text-xs text-brand-gray-text font-sans font-medium mt-1">
                      Praticien : <span className="text-brand-dark font-semibold">{app.preferredTherapist}</span>
                    </p>
                  </div>

                  {/* Date & Time breakdown block */}
                  <div className="flex flex-wrap gap-4 text-xs font-semibold font-sans mt-2.5 text-brand-dark py-2 px-3 bg-brand-gray-light rounded-xl">
                    <div className="flex items-center gap-1.5">
                      <LucideIcon name="Calendar" className="h-4 w-4 text-brand-green" />
                      <span>
                        {new Date(app.date).toLocaleDateString('fr-FR', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'long',
                        })}
                      </span>
                    </div>
                    <div className="h-4 w-[1px] bg-gray-300 hidden sm:block" />
                    <div className="flex items-center gap-1.5">
                      <LucideIcon name="Clock" className="h-4 w-4 text-brand-green" />
                      <span className="font-mono">{app.timeSlot}</span>
                    </div>
                  </div>

                  {/* Patient metadata summary */}
                  <div className="text-xs font-sans text-brand-gray-text space-y-0.5 border-t border-gray-100 pt-2.5">
                    <p>Coordonnées : <span className="font-semibold text-brand-dark bg-slate-50 px-1.5 py-0.5 rounded-sm">{app.clientName}</span> ({app.clientPhone})</p>
                    {app.clientNotes && app.clientNotes !== 'Aucun détail supplémentaire' && (
                      <p className="line-clamp-1 italic text-[11px] mt-1">Note : "{app.clientNotes}"</p>
                    )}
                  </div>

                </div>

                {/* Action columns: Contact with WA link or Cancel booking */}
                <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto self-stretch sm:self-center justify-end shrink-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-gray-100">

                  {/* Direct Whatsapp shortcut reminder */}
                  <a
                    href={`https://wa.me/243971234567?text=Bonjour%20Capsy%20Services%2C%20je%20viens%20de%20soumettre%20une%20demande%20de%20rendez-vous%20sur%20votre%20site.%20Mon%20N%C2%B0%20de%20suivi%20est%20${app.id}.%20Merci!`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-none py-2 px-3.5 bg-[#25D366] hover:bg-[#20ba56] text-white font-bold font-poppins text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs"
                  >
                    <LucideIcon name="MessageSquareShare" className="h-4 w-4" />
                    <span>Notifier</span>
                  </a>

                  {/* Payment button */}
                  <button
                    type="button"
                    onClick={() => handlePay(app)}
                    className="flex-1 sm:flex-none py-2 px-3.5 bg-brand-green hover:bg-brand-green/90 text-white font-bold font-poppins text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs"
                  >
                    <LucideIcon name="CreditCard" className="h-4 w-4" />
                    <span>Payer</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCancelAppointment(app.id)}
                    className="flex-1 sm:flex-none py-2 px-3.5 hover:bg-rose-50 text-rose-600 border border-rose-200 hover:border-rose-300 font-bold font-poppins text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <LucideIcon name="X" className="h-3.5 w-3.5" />
                    <span>Annuler</span>
                  </button>

                </div>

              </div>
            ))
          )}
        </div>

        {/* Bottom banner details */}
        <div className="bg-brand-gray-light p-4 rounded-xl border border-gray-150 flex gap-3 text-xs text-brand-gray-text leading-relaxed mt-10">
          <LucideIcon name="Info" className="h-5 w-5 text-brand-blue shrink-0 mt-0.5" />
          <p>
            {user
              ? "Ces informations sont synchronisées en temps réel avec votre compte Odoo. Toute modification effectuée par nos agents cliniques apparaîtra ici."
              : "Ces demandes sont conservées localement dans votre navigateur Web. Connectez-vous pour synchroniser vos rendez-vous avec votre compte Odoo."
            }
          </p>
        </div>

      </div>
    </section>
  );
}
