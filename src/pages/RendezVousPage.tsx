import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import LucideIcon from '../components/LucideIcon';
import PageHero from '../components/PageHero';
import { getAppointmentsUrl } from '../config/api';

interface RendezVousPageProps {
  user?: any;
  onOpenBooking: () => void;
  onLogin: () => void;
}

interface OdooAppointment {
  id: number;
  data: {
    id: number;
    name: string;
    display_name: string;
    description: string;
    start: string;
    stop: string;
    display_time: string;
    location: string | false;
    appointment_status: string | false;
    appointment_type_id: [number, string] | false;
    user_id: [number, string] | false;
    partner_id: [number, string] | false;
    current_status: string | false;
    attendees_count: number;
    accepted_count: number;
    videocall_location: string | false;
    create_date: string;
    allday: boolean;
    duration: number;
  };
}


const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  booked: { label: 'Confirmé', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', icon: 'CheckCircle2' },
  cancelled: { label: 'Annulé', color: 'text-rose-700', bg: 'bg-rose-50 border-rose-200', icon: 'XCircle' },
  pending: { label: 'En attente', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', icon: 'Clock' },
  done: { label: 'Terminé', color: 'text-slate-600', bg: 'bg-slate-50 border-slate-200', icon: 'CheckCheck' },
  default: { label: 'Planifié', color: 'text-brand-wellbeing', bg: 'bg-brand-wellbeing/5 border-brand-wellbeing/20', icon: 'Calendar' },
};

function getStatusConfig(status: string | false) {
  if (!status) return STATUS_CONFIG.default;
  return STATUS_CONFIG[status] || STATUS_CONFIG.default;
}

function formatOdooDate(dateStr: string): { date: string; time: string; isPast: boolean } {
  try {
    // Odoo renvoie en UTC, on ajoute +2h pour Kinshasa
    const d = new Date(dateStr.replace(' ', 'T') + 'Z');
    const kinshasa = new Date(d.getTime() + 2 * 60 * 60 * 1000);
    const date = kinshasa.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const time = kinshasa.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const isPast = kinshasa < new Date();
    return { date: date.charAt(0).toUpperCase() + date.slice(1), time, isPast };
  } catch {
    return { date: dateStr, time: '', isPast: false };
  }
}

function AppointmentCard({ appt, index }: { appt: OdooAppointment; index: number }) {
  const { data } = appt;
  const statusKey = typeof data.appointment_status === 'string' ? data.appointment_status : 'default';
  const status = getStatusConfig(data.appointment_status);
  const { date, time, isPast } = formatOdooDate(data.start);

  // Extraire le nom de service depuis le titre
  const serviceTitle = data.name.replace(/^RDV:\s*/i, '').trim();
  const therapistName = Array.isArray(data.user_id) ? data.user_id[1] : null;
  const appointmentTypeName = Array.isArray(data.appointment_type_id) ? data.appointment_type_id[1] : null;

  // WhatsApp notification link
  const waText = encodeURIComponent(
    `*📅 Mon RDV CAPSY Services*\n\n` +
    `*Consultation :* ${serviceTitle}\n` +
    (therapistName ? `*Psychologue :* ${therapistName}\n` : '') +
    `*Date :* ${date} à ${time}\n` +
    (data.location && data.location !== 'false' ? `*Lieu :* ${data.location}\n` : '') +
    `*Référence :* #${data.id}\n\n` +
    `_Centre d\'Assistance Psychologique CAPSY — Goma, RDC_`
  );
  const waLink = `https://wa.me/?text=${waText}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className={`bg-white rounded-2xl border border-gray-150 hover:border-brand-confidence shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${isPast ? 'opacity-70' : ''}`}
    >
      {/* Top accent bar */}
      <div className={`h-1.5 w-full ${statusKey === 'booked' ? 'bg-gradient-to-r from-brand-wellbeing to-brand-confidence' : statusKey === 'cancelled' ? 'bg-rose-400' : 'bg-gradient-to-r from-brand-wellbeing to-brand-confidence'}`} />

      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 bg-brand-wellbeing/10 rounded-xl shrink-0">
              <LucideIcon name="CalendarCheck" className="h-5 w-5 text-brand-wellbeing" />
            </div>
            <div className="min-w-0">
              <h3 className="font-poppins font-bold text-brand-dark text-sm leading-tight line-clamp-2">
                {serviceTitle}
              </h3>
              {appointmentTypeName && (
                <p className="text-xs text-brand-gray-text mt-0.5 truncate">{appointmentTypeName}</p>
              )}
            </div>
          </div>

          {/* Status badge */}
          <span className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${status.bg} ${status.color}`}>
            <LucideIcon name={status.icon as any} className="h-3.5 w-3.5" />
            {status.label}
          </span>
        </div>

        {/* Details */}
        <div className="space-y-2 text-xs text-brand-gray-text">
          <div className="flex items-center gap-2">
            <LucideIcon name="Calendar" className="h-4 w-4 text-brand-wellbeing/70 shrink-0" />
            <span className="font-medium text-brand-dark">{date}</span>
          </div>
          <div className="flex items-center gap-2">
            <LucideIcon name="Clock" className="h-4 w-4 text-brand-wellbeing/70 shrink-0" />
            <span>{time} — <span className="text-brand-dark font-medium">{data.duration}h de séance</span></span>
          </div>
          {therapistName && (
            <div className="flex items-center gap-2">
              <LucideIcon name="UserRound" className="h-4 w-4 text-brand-wellbeing/70 shrink-0" />
              <span>{therapistName}</span>
            </div>
          )}
          {data.location && data.location !== 'false' && (
            <div className="flex items-center gap-2">
              <LucideIcon name="MapPin" className="h-4 w-4 text-brand-wellbeing/70 shrink-0" />
              <span>{data.location}</span>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="mt-4 flex flex-col gap-2">
          {/* Video call link */}
          {data.videocall_location && data.videocall_location !== 'false' && (
            <a
              href={data.videocall_location as string}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-brand-wellbeing text-white text-xs font-bold font-poppins rounded-xl hover:bg-brand-wellbeing/90 transition-all shadow-sm"
            >
              <LucideIcon name="Video" className="h-4 w-4" />
              Rejoindre la séance en ligne
            </a>
          )}

          {/* WhatsApp notify button */}
          {!isPast && (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] text-xs font-bold font-poppins rounded-xl transition-all border border-[#25D366]/30"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Notifier sur WhatsApp
            </a>
          )}
        </div>

        {/* ID Odoo */}
        <p className="mt-3 text-[10px] text-gray-400 font-mono">RDV #{data.id} · Créé le {new Date(data.create_date).toLocaleDateString('fr-FR')}</p>
      </div>
    </motion.div>
  );
}

export default function RendezVousPage({ user, onOpenBooking, onLogin }: RendezVousPageProps) {
  const [appointments, setAppointments] = useState<OdooAppointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');

  const fetchAppointments = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };

      // Authentification HTTP Basic (email + mot de passe stockés dans user)
      if (user.email && user.password) {
        const b64 = btoa(`${user.email}:${user.password}`);
        headers['Authorization'] = `Basic ${b64}`;
      }

      const res = await fetch(`${getAppointmentsUrl()}/?limit=100&mine_only=true`, { headers });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Erreur serveur' }));
        throw new Error(err.detail || 'Impossible de charger les rendez-vous');
      }
      const data: OdooAppointment[] = await res.json();
      setAppointments(data);
    } catch (e: any) {
      setError(e.message || 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAppointments();
    // Rafraîchir si un nouveau RDV est créé
    const handler = () => fetchAppointments();
    window.addEventListener('appointments-updated', handler);
    return () => window.removeEventListener('appointments-updated', handler);
  }, [fetchAppointments]);

  const now = new Date();
  const filtered = appointments.filter((a) => {
    try {
      const start = new Date(a.data.start.replace(' ', 'T') + 'Z');
      const kinshasa = new Date(start.getTime() + 2 * 60 * 60 * 1000);
      if (filter === 'upcoming') return kinshasa >= now;
      if (filter === 'past') return kinshasa < now;
      return true;
    } catch { return true; }
  });

  const upcomingCount = appointments.filter((a) => {
    try {
      const start = new Date(a.data.start.replace(' ', 'T') + 'Z');
      return new Date(start.getTime() + 2 * 60 * 60 * 1000) >= now;
    } catch { return false; }
  }).length;

  return (
    <main className="grow">
      <PageHero
        variant="green"
        eyebrow="Espace personnel"
        title="Mes Rendez-vous"
        description={user ? `Bonjour ${user.name} · ${upcomingCount} RDV à venir` : 'Connectez-vous pour consulter vos rendez-vous'}
        primaryCtaLabel="Nouveau rendez-vous"
        onPrimaryCta={onOpenBooking}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Non connecté */}
        {!user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="inline-flex p-5 bg-brand-wellbeing/10 rounded-3xl mb-6">
              <LucideIcon name="LockKeyhole" className="h-12 w-12 text-brand-wellbeing" />
            </div>
            <h2 className="text-2xl font-poppins font-bold text-brand-dark mb-3">
              Connexion requise
            </h2>
            <p className="text-brand-gray-text max-w-md mx-auto mb-8 font-sans">
              Connectez-vous à votre compte Capsy / Odoo pour consulter vos rendez-vous passés et à venir.
            </p>
            <button
              onClick={onLogin}
              className="px-8 py-3.5 bg-brand-wellbeing text-white font-bold font-poppins rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
            >
              Se connecter
            </button>
          </motion.div>
        )}

        {/* Connecté */}
        {user && (
          <>
            {/* Filtres style */}
            <div className="border-b border-gray-200 mb-8">
              <div className="flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
                <div className="flex gap-1 sm:gap-4">
                  {[
                    { key: 'all', label: `Tous (${appointments.length})`, icon: 'BookOpen' },
                    { key: 'upcoming', label: `À venir (${upcomingCount})`, icon: 'Calendar' },
                    { key: 'past', label: `Passés (${appointments.length - upcomingCount})`, icon: 'History' },
                  ].map((f) => (
                    <button
                      key={f.key}
                      onClick={() => setFilter(f.key as any)}
                      className={`relative flex items-center gap-2 px-3 sm:px-4 py-3.5 text-xs font-poppins font-bold transition-all shrink-0 cursor-pointer ${filter === f.key
                          ? 'text-brand-wellbeing'
                          : 'text-brand-gray-text hover:text-brand-dark'
                        }`}
                    >
                      <LucideIcon name={f.icon as any} className="h-4 w-4" />
                      <span>{f.label}</span>
                      {filter === f.key && (
                        <motion.div
                          layoutId="rdvActiveTabUnderline"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-confidence"
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      )}
                    </button>
                  ))}
                </div>

                <button
                  onClick={fetchAppointments}
                  className="p-2 rounded-xl border border-gray-200 bg-white text-brand-gray-text hover:text-brand-wellbeing hover:border-brand-wellbeing/40 transition-all shrink-0 mb-1"
                  title="Rafraîchir"
                >
                  <LucideIcon name="RefreshCw" className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* États de chargement / erreur */}
            {loading && (
              <div className="flex items-center justify-center py-20 gap-3 text-brand-gray-text">
                <LucideIcon name="Loader2" className="h-6 w-6 animate-spin text-brand-wellbeing" />
                <span className="font-medium">Chargement de vos rendez-vous…</span>
              </div>
            )}

            {!loading && error && (
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center">
                <LucideIcon name="AlertCircle" className="h-10 w-10 text-rose-500 mx-auto mb-3" />
                <p className="font-bold text-rose-700 mb-1">Impossible de charger les rendez-vous</p>
                <p className="text-sm text-rose-600 mb-4">{error}</p>
                <button
                  onClick={fetchAppointments}
                  className="px-5 py-2 bg-rose-500 text-white font-bold font-poppins rounded-xl hover:bg-rose-600 transition-all text-sm"
                >
                  Réessayer
                </button>
              </div>
            )}

            {!loading && !error && filtered.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <div className="inline-flex p-5 bg-brand-wellbeing/10 rounded-3xl mb-6">
                  <LucideIcon name="CalendarX2" className="h-12 w-12 text-brand-wellbeing" />
                </div>
                <h3 className="text-xl font-poppins font-bold text-brand-dark mb-2">
                  {filter === 'upcoming' ? 'Aucun rendez-vous à venir' : 'Aucun rendez-vous trouvé'}
                </h3>
                <p className="text-brand-gray-text font-sans mb-8 max-w-sm mx-auto">
                  {filter === 'upcoming'
                    ? 'Vous n\'avez pas encore de rendez-vous planifié. Prenez-en un dès maintenant !'
                    : 'Aucun rendez-vous dans cette période.'}
                </p>
                {filter === 'upcoming' && (
                  <button
                    onClick={onOpenBooking}
                    className="px-8 py-3.5 bg-brand-wellbeing text-white font-bold font-poppins rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                  >
                    Prendre un rendez-vous
                  </button>
                )}
              </motion.div>
            )}

            {!loading && !error && filtered.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence>
                  {filtered.map((appt, i) => (
                    <AppointmentCard key={appt.id} appt={appt} index={i} />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
