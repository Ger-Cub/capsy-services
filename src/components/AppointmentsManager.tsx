import React, { useEffect, useState } from 'react';
import { Appointment } from '../types';
import { SERVICES as STATIC_SERVICES } from '../data/staticData';
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
  const [productsList, setProductsList] = useState<any[]>([]);

  const stripHtml = (html: string) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  };

  const loadFromOdoo = async () => {
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

        const mapped: Appointment[] = (data.appointments || []).map((app: any) => {
          const startDate = app.start ? new Date(app.start.replace(' ', 'T') + 'Z') : new Date();
          const stopDate = app.stop ? new Date(app.stop.replace(' ', 'T') + 'Z') : new Date();

          // Odoo might return HTML in description
          const rawDesc = app.description || '';
          const cleanDesc = stripHtml(rawDesc);

          // Regex extraction from the clean text
          const therapistMatch = cleanDesc.match(/Therapist:\s*([^\n]*)/i);
          const notesMatch = cleanDesc.match(/Notes:\s*([\s\S]*?)($|\n[A-Z][a-z]+:)/i);
          const clientPhoneMatch = cleanDesc.match(/Phone:\s*([^\n]*)/i);

          // If we found therapist with extra junk (like "Organisé par"), clean it
          let therapist = therapistMatch ? therapistMatch[1].trim() : '';
          if (therapist.includes('Organisé par')) {
            therapist = therapist.split('Organisé par')[0].trim();
          }

          // If therapy session name is just Jacques Batenga etc, use it
          if (!therapist && cleanDesc) {
            // First line might be the therapist if it doesn't have keywords
            const firstLine = cleanDesc.split('\n')[0].trim();
            if (!firstLine.includes(':') && firstLine.length < 50) {
              therapist = firstLine;
            }
          }

          return {
            id: `odoo-${app.id}`,
            serviceId: 'odoo-sync',
            serviceTitle: app.name.replace('RDV: ', ''),
            date: startDate.toISOString().split('T')[0],
            timeSlot: `${startDate.getHours()}h00 - ${stopDate.getHours()}h00`,
            preferredTherapist: therapist || 'Assigné Odoo',
            clientName: user.name,
            clientEmail: user.email,
            clientPhone: clientPhoneMatch ? clientPhoneMatch[1].trim() : '',
            clientNotes: notesMatch ? notesMatch[1].trim() : (cleanDesc.length < 100 ? cleanDesc : 'Détails dans Odoo'),
            createdAt: startDate.toISOString(),
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
    // Fetch products/services for price lookups (non-blocking)
    (async () => {
      try {
        const resp = await fetch('/api/odoo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'list_products', params: { limit: 100 } }),
        });
        if (!resp.ok) return;
        const data = await resp.json();
        setProductsList(data.products || []);
      } catch (err) {
        console.debug('Unable to fetch products for AppointmentsManager');
      }
    })();
    const handleUpdate = () => loadFromOdoo();
    window.addEventListener('appointments-updated', handleUpdate);
    window.addEventListener('auth-changed', handleUpdate);
    return () => {
      window.removeEventListener('appointments-updated', handleUpdate);
      window.removeEventListener('auth-changed', handleUpdate);
    };
  }, [user]);

  const handlePay = async (app: Appointment) => {
    const product = productsList.find((p) => String(p.id) === String(app.serviceId));
    const service = STATIC_SERVICES.find((s) => s.id === app.serviceId);
    const amount = (product && product.list_price) || service?.price || 40;
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
        if (data.payment_url) window.open(data.payment_url, '_blank');
      }
    } catch (err) {
      console.error('Payment error:', err);
    }
  };

  if (!user) return null;

  return (
    <section className="py-20 bg-white" id="mes-rendezvous">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex p-2 bg-brand-wellbeing/10 rounded-full text-brand-wellbeing mb-2.5">
            <LucideIcon name="Clock" className="h-6 w-6 text-brand-green" />
          </div>
          <h2 className="text-3xl font-poppins font-black text-brand-wellbeing tracking-tight">Mes Rendez-vous</h2>
          <p className="text-sm text-brand-gray-text mt-2 leading-relaxed">
            Gérez vos consultations en temps réel depuis Odoo.
          </p>
          <button onClick={loadFromOdoo} disabled={isRefreshing} className="mt-4 text-xs font-bold text-brand-wellbeing flex items-center justify-center gap-1.5 mx-auto hover:underline">
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
              <button onClick={onOpenBooking} className="mt-6 px-6 py-2.5 bg-brand-wellbeing text-white rounded-xl font-bold text-sm">Prendre un rendez-vous</button>
            </div>
          ) : (
            appointments.map((app) => {
              const whatsappMessage = encodeURIComponent(
                `Bonjour CAPSY, je viens de prendre mon rendez-vous sur votre site web :\n\n- Service : ${app.serviceTitle}\n- Date : ${app.date}\n- Heure : ${app.timeSlot}\n- ID : ${app.id}`
              );

              return (
                <div key={app.id} className="bg-white rounded-2xl border-2 border-gray-100 hover:border-brand-wellbeing/30 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm transition-all relative overflow-hidden">
                  <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-brand-wellbeing" />
                  <div className="space-y-4 flex-1 pl-2 w-full">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-mono text-[10px] font-bold text-brand-wellbeing bg-brand-wellbeing/10 px-2 py-0.5 rounded-md lowercase">{app.id}</span>
                      <span className="text-[10px] bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Confirmé Odoo</span>
                    </div>
                    <div>
                      <h4 className="text-lg font-poppins font-bold text-brand-dark lowercase first-letter:uppercase">{app.serviceTitle}</h4>
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4">
                        <div className="flex items-center gap-2 text-xs text-brand-gray-text">
                          <LucideIcon name="User" className="h-3.5 w-3.5 text-brand-wellbeing" />
                          <span className="font-medium">Praticien :</span>
                          <span className="text-brand-dark truncate">{app.preferredTherapist}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-brand-gray-text">
                          <LucideIcon name="Phone" className="h-3.5 w-3.5 text-brand-wellbeing" />
                          <span className="font-medium">Contact :</span>
                          <span className="text-brand-dark">{app.clientPhone || 'N/A'}</span>
                        </div>
                      </div>
                      {app.clientNotes && app.clientNotes !== 'Aucun détail' && app.clientNotes !== 'Détails dans Odoo' && (
                        <div className="mt-2.5 p-2.5 bg-brand-gray-light rounded-xl text-[11px] text-brand-gray-text border-l-2 border-brand-green/30 italic">
                          "{app.clientNotes}"
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-4 text-xs font-semibold mt-2.5 text-brand-dark py-2 px-3 bg-brand-gray-light rounded-xl w-fit">
                      <div className="flex items-center gap-1.5"><LucideIcon name="Calendar" className="h-4 w-4 text-brand-green" /><span>{new Date(app.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}</span></div>
                      <div className="h-4 w-[1px] bg-gray-300" /><div className="flex items-center gap-1.5"><LucideIcon name="Clock" className="h-4 w-4 text-brand-green" /><span className="font-mono">{app.timeSlot}</span></div>
                    </div>
                  </div>
                  <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto self-stretch md:self-center justify-end shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100">
                    <button onClick={() => handlePay(app)} className="flex-1 md:flex-none py-2.5 px-5 bg-brand-green hover:bg-brand-green/90 text-white font-bold font-poppins text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm">
                      <LucideIcon name="CreditCard" className="h-4 w-4" /><span>Payer</span>
                    </button>
                    <a href={`https://wa.me/243971234567?text=${whatsappMessage}`} target="_blank" rel="noopener noreferrer" className="flex-1 md:flex-none py-2.5 px-5 bg-white border border-gray-200 text-brand-dark hover:bg-gray-50 font-bold font-poppins text-xs rounded-xl flex items-center justify-center gap-1.5">
                      <svg className="h-4 w-4 fill-green-500" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                      </svg>
                      <span>Notifier</span>
                    </a>
                  </div>
                </div>
              );
            })
          )}
        </div>
        <div className="bg-brand-wellbeing/5 p-5 rounded-2xl border border-brand-wellbeing/10 flex gap-4 text-xs text-brand-gray-text leading-relaxed mt-10">
          <LucideIcon name="ShieldCheck" className="h-5 w-5 text-brand-wellbeing shrink-0" />
          <p>Ces informations proviennent directement de votre compte <strong>Odoo CAPSY Services</strong>. Connecté en tant que <strong>{user.name}</strong>.</p>
        </div>
      </div>
    </section>
  );
}
