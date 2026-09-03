import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import LucideIcon from './LucideIcon';
import { getAppointmentsUrl } from '../config/api';
import AppointmentDetailsModal, { AppointmentDetailsData } from './AppointmentDetailsModal';

interface AppointmentsPreviewProps {
  user: any;
  onViewAll: () => void;
  onOpenBooking: () => void;
}

interface MiniAppointment {
  id: number;
  name: string;
  start: string;
  appointment_status: string | false;
  location: string | false;
  user_id?: [number, string] | false;
  raw: any;
}


export default function AppointmentsPreview({ user, onViewAll, onOpenBooking }: AppointmentsPreviewProps) {
  const [appointments, setAppointments] = useState<MiniAppointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentDetailsData | null>(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (user.email && user.password) {
      headers['Authorization'] = `Basic ${btoa(`${user.email}:${user.password}`)}`;
    }
    fetch(`${getAppointmentsUrl()}/?limit=10&future_only=true&mine_only=true`, { headers })
      .then((r) => r.json())
      .then((data: any[]) => {
        const now = new Date();
        const upcoming = data
          .filter((a) => {
            try {
              const d = new Date(a.data.start.replace(' ', 'T') + 'Z');
              return new Date(d.getTime() + 2 * 60 * 60 * 1000) >= now;
            } catch { return false; }
          })
          .slice(0, 3)
          .map((a) => ({
            id: a.data.id,
            name: a.data.name,
            start: a.data.start,
            appointment_status: a.data.appointment_status,
            location: a.data.location,
            user_id: a.data.user_id,
            raw: a.data
          }));
        setAppointments(upcoming);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  // Refresh on new appointment
  useEffect(() => {
    const handler = () => {
      if (!user) return;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (user.email && user.password) headers['Authorization'] = `Basic ${btoa(`${user.email}:${user.password}`)}`;
      fetch(`${getAppointmentsUrl()}/?limit=10&future_only=true&mine_only=true`, { headers })
        .then((r) => r.json())
        .then((data: any[]) => {
          const now = new Date();
          setAppointments(
            data
              .filter((a) => {
                try { return new Date(new Date(a.data.start.replace(' ', 'T') + 'Z').getTime() + 7200000) >= now; } catch { return false; }
              })
              .slice(0, 3)
              .map((a) => ({
                id: a.data.id,
                name: a.data.name,
                start: a.data.start,
                appointment_status: a.data.appointment_status,
                location: a.data.location,
                user_id: a.data.user_id,
                raw: a.data
              }))
          );
        })
        .catch(() => {});
    };
    window.addEventListener('appointments-updated', handler);
    return () => window.removeEventListener('appointments-updated', handler);
  }, [user]);

  if (!user) return null;

  const formatDate = (s: string) => {
    try {
      const d = new Date(s.replace(' ', 'T') + 'Z');
      const k = new Date(d.getTime() + 7200000);
      return k.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }) + ' · ' + k.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } catch { return s; }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6 bg-white/90 backdrop-blur-sm border border-gray-100 rounded-2xl shadow-lg overflow-hidden"
        id="hero-appointments-preview"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-brand-wellbeing/5">
          <div className="flex items-center gap-2">
            <LucideIcon name="CalendarDays" className="h-4 w-4 text-brand-wellbeing" />
            <span className="text-xs font-bold font-poppins text-brand-dark uppercase tracking-wider">Mes prochains RDV</span>
          </div>
          <button
            onClick={onViewAll}
            className="text-xs font-semibold text-brand-wellbeing hover:underline flex items-center gap-1"
            id="hero-preview-view-all-btn"
          >
            Voir tout <LucideIcon name="ArrowRight" className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="p-3">
          {loading && (
            <div className="flex items-center gap-2 py-3 px-1 text-xs text-brand-gray-text">
              <LucideIcon name="Loader2" className="h-4 w-4 animate-spin text-brand-wellbeing" />
              Chargement…
            </div>
          )}

          {!loading && appointments.length === 0 && (
            <div className="text-center py-4">
              <p className="text-xs text-brand-gray-text mb-2">Aucun rendez-vous à venir</p>
              <button
                onClick={onOpenBooking}
                className="text-xs font-bold text-brand-wellbeing hover:underline"
              >
                + Prendre un rendez-vous
              </button>
            </div>
          )}

          {!loading && appointments.length > 0 && (
            <div className="space-y-2">
              {appointments.map((a) => {
                const title = a.name.replace(/^RDV:\s*/i, '').trim();
                const isBooked = a.appointment_status === 'booked';
                const therapistName = Array.isArray(a.user_id) ? a.user_id[1] : null;
                // Build WhatsApp message
                const formatDateShort = (s: string) => {
                  try {
                    const d = new Date(s.replace(' ', 'T') + 'Z');
                    const k = new Date(d.getTime() + 7200000);
                    return k.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
                      + ' à ' + k.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                  } catch { return s; }
                };
                const waText = encodeURIComponent(
                  `*📅 Rappel RDV CAPSY Services*\n\n` +
                  `*Consultation :* ${title}\n` +
                  (therapistName ? `*Psychologue :* ${therapistName}\n` : '') +
                  `*Date :* ${formatDateShort(a.start)}\n` +
                  `*Ref :* #${a.id}\n\n` +
                  `_Centre d\'Assistance Psychologique CAPSY — Goma, RDC_`
                );
                const waLink = `https://wa.me/?text=${waText}`;
                return (
                  <div
                    key={a.id}
                    onClick={() => setSelectedAppointment(a.raw)}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-brand-wellbeing/5 transition-colors cursor-pointer group"
                  >
                    <div className={`p-2 rounded-lg shrink-0 ${isBooked ? 'bg-emerald-50' : 'bg-brand-wellbeing/10'} group-hover:scale-105 transition-transform`}>
                      <LucideIcon name="Calendar" className={`h-4 w-4 ${isBooked ? 'text-emerald-600' : 'text-brand-wellbeing'}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-brand-dark truncate group-hover:text-brand-wellbeing transition-colors">{title}</p>
                      <p className="text-[11px] text-brand-gray-text">{formatDate(a.start)}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isBooked ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                        {isBooked ? 'Confirmé' : 'En attente'}
                      </span>
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Notifier sur WhatsApp"
                        className="p-1.5 rounded-lg bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] transition-colors"
                      >
                        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>

      <AppointmentDetailsModal
        isOpen={!!selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
        appointment={selectedAppointment}
      />
    </>
  );
}
