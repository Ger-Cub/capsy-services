import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import LucideIcon from './LucideIcon';

export interface AppointmentDetailsData {
  id: number | string;
  name: string;
  start: string;
  stop?: string;
  duration?: number;
  appointment_status?: string | false;
  location?: string | false;
  description?: string | false;
  user_id?: [number, string] | false | null;
  appointment_type_id?: [number, string] | false | null;
  videocall_location?: string | false | null;
  create_date?: string;
}

interface AppointmentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: AppointmentDetailsData | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  booked: { label: 'Confirmé', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', icon: 'CheckCircle2' },
  cancelled: { label: 'Annulé', color: 'text-rose-700', bg: 'bg-rose-50 border-rose-200', icon: 'XCircle' },
  pending: { label: 'En attente', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', icon: 'Clock' },
  done: { label: 'Terminé', color: 'text-slate-600', bg: 'bg-slate-50 border-slate-200', icon: 'CheckCheck' },
  default: { label: 'Planifié', color: 'text-brand-wellbeing', bg: 'bg-brand-wellbeing/10 border-brand-wellbeing/20', icon: 'Calendar' },
};

function getStatusConfig(status: string | false | undefined) {
  if (!status) return STATUS_CONFIG.default;
  return STATUS_CONFIG[status] || STATUS_CONFIG.default;
}

function formatOdooDateTime(dateStr: string): { fullDate: string; time: string; endCalculated: string; isPast: boolean } {
  try {
    const d = new Date(dateStr.replace(' ', 'T') + 'Z');
    const kinshasaStart = new Date(d.getTime() + 2 * 60 * 60 * 1000);
    const kinshasaEnd = new Date(kinshasaStart.getTime() + 60 * 60 * 1000);

    const fullDate = kinshasaStart.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    const time = kinshasaStart.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const endCalculated = kinshasaEnd.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const isPast = kinshasaStart < new Date();

    return {
      fullDate: fullDate.charAt(0).toUpperCase() + fullDate.slice(1),
      time,
      endCalculated,
      isPast
    };
  } catch {
    return { fullDate: dateStr, time: '', endCalculated: '', isPast: false };
  }
}

export default function AppointmentDetailsModal({ isOpen, onClose, appointment }: AppointmentDetailsModalProps) {
  if (!isOpen || !appointment) return null;

  const statusKey = typeof appointment.appointment_status === 'string' ? appointment.appointment_status : 'default';
  const status = getStatusConfig(appointment.appointment_status);
  const { fullDate, time, endCalculated, isPast } = formatOdooDateTime(appointment.start);

  const serviceTitle = appointment.name ? appointment.name.replace(/^RDV:\s*/i, '').trim() : 'Consultation Psychologique';
  const therapistName = Array.isArray(appointment.user_id) ? appointment.user_id[1] : null;
  const appointmentTypeName = Array.isArray(appointment.appointment_type_id) ? appointment.appointment_type_id[1] : null;
  const hasVideoCall = Boolean(appointment.videocall_location && appointment.videocall_location !== 'false');
  const locationText = (appointment.location && appointment.location !== 'false')
    ? appointment.location
    : (hasVideoCall ? 'Consultation en ligne (Visioconférence)' : 'Centre CAPSY — Goma, RDC');

  // WhatsApp notification link
  const waText = encodeURIComponent(
    `*📅 Détails de mon RDV CAPSY Services*\n\n` +
    `*Service :* ${serviceTitle}\n` +
    (therapistName ? `*Psychologue :* ${therapistName}\n` : '') +
    `*Date :* ${fullDate}\n` +
    `*Heure :* ${time} - ${endCalculated}\n` +
    `*Lieu / Format :* ${locationText}\n` +
    `*Référence :* #${appointment.id}\n\n` +
    `_Centre d'Assistance Psychologique CAPSY — Goma, RDC_`
  );
  const waLink = `https://wa.me/?text=${waText}`;

  // Google Calendar link
  const buildGoogleCalendarUrl = () => {
    try {
      const d = new Date(appointment.start.replace(' ', 'T') + 'Z');
      const startIso = d.toISOString().replace(/-|:|\.\d\d\d/g, '');
      const endD = new Date(d.getTime() + (appointment.duration || 1) * 3600000);
      const endIso = endD.toISOString().replace(/-|:|\.\d\d\d/g, '');
      const details = encodeURIComponent(`Rendez-vous CAPSY: ${serviceTitle}\nTherapeute: ${therapistName || 'Assigné'}\nRef: #${appointment.id}`);
      return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('RDV CAPSY - ' + serviceTitle)}&dates=${startIso}/${endIso}&details=${details}&location=${encodeURIComponent(locationText)}`;
    } catch {
      return '#';
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-brand-dark/60 backdrop-blur-md transition-opacity"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 my-8 z-10"
        >
          {/* Header Accent Gradient */}
          <div className="h-3 w-full bg-gradient-to-r from-brand-wellbeing via-brand-confidence to-brand-green" />

          {/* Modal Header */}
          <div className="p-6 border-b border-gray-100 flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-brand-wellbeing/10 rounded-2xl shrink-0">
                <LucideIcon name="CalendarCheck" className="h-6 w-6 text-brand-wellbeing" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-gray-100 text-brand-gray-text">
                    RDV #{appointment.id}
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${status.bg} ${status.color}`}>
                    <LucideIcon name={status.icon as any} className="h-3.5 w-3.5" />
                    {status.label}
                  </span>
                </div>
                <h2 className="font-poppins font-bold text-lg text-brand-dark mt-1 leading-snug">
                  {serviceTitle}
                </h2>
                {appointmentTypeName && (
                  <p className="text-xs text-brand-gray-text mt-0.5">{appointmentTypeName}</p>
                )}
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full text-brand-gray-text hover:text-brand-dark hover:bg-gray-100 transition-colors"
              aria-label="Fermer"
            >
              <LucideIcon name="X" className="h-5 w-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">

            {/* Date & Time Highlight Card */}
            <div className="p-4 rounded-2xl bg-brand-wellbeing/5 border border-brand-wellbeing/15 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider text-brand-wellbeing">Date & Horaire</p>
                <p className="text-sm font-bold text-brand-dark font-poppins">{fullDate}</p>
                <p className="text-xs text-brand-gray-text flex items-center gap-1.5">
                  <LucideIcon name="Clock" className="h-3.5 w-3.5 text-brand-wellbeing" />
                  <span>{time} à {endCalculated} (UTC+2 Kinshasa/Goma)</span>
                </p>
              </div>
              <div className="p-3 bg-white rounded-xl shadow-sm border border-brand-wellbeing/10 text-center shrink-0">
                <span className="block text-xs font-bold text-brand-dark">{appointment.duration || 1}h</span>
                <span className="block text-[10px] text-brand-gray-text uppercase">Séance</span>
              </div>
            </div>

            {/* Assigned Therapist */}
            <div className="p-4 rounded-2xl bg-white border border-gray-150 shadow-sm flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-brand-wellbeing to-brand-green flex items-center justify-center text-white font-bold font-poppins text-sm shrink-0 shadow-sm">
                {therapistName ? therapistName.split(' ').map((n) => n[0]).slice(0, 2).join('') : 'CP'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-brand-gray-text uppercase tracking-wider">Psychologue Assigné</p>
                <p className="text-sm font-bold text-brand-dark truncate">{therapistName || 'Attribution en cours (Therapeute CAPSY)'}</p>
                <p className="text-xs text-brand-wellbeing font-medium">Centre CAPSY Services</p>
              </div>
            </div>

            {/* Location / Format */}
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-150 space-y-2">
              <div className="flex items-center gap-2">
                <LucideIcon name={hasVideoCall ? 'Video' : 'MapPin'} className="h-4 w-4 text-brand-wellbeing shrink-0" />
                <span className="text-xs font-bold text-brand-dark uppercase tracking-wider">
                  {hasVideoCall ? 'Format Visioconférence' : 'Format Présentiel'}
                </span>
              </div>
              <p className="text-xs text-brand-gray-text pl-6">
                {locationText}
              </p>

              {hasVideoCall && (
                <div className="pt-2 pl-6">
                  <a
                    href={appointment.videocall_location as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 py-2 px-4 bg-brand-wellbeing text-white text-xs font-bold font-poppins rounded-xl hover:bg-brand-wellbeing/90 transition-all shadow-sm"
                  >
                    <LucideIcon name="Video" className="h-4 w-4" />
                    Rejoindre la séance vidéo
                  </a>
                </div>
              )}
            </div>

            {/* Clean HTML Description / Notes */}
            {appointment.description && (
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-150 space-y-1.5">
                <p className="text-xs font-bold text-brand-dark uppercase tracking-wider flex items-center gap-2">
                  <LucideIcon name="FileText" className="h-4 w-4 text-brand-wellbeing" />
                  Notes & Précisions
                </p>
                <div
                  className="text-xs text-brand-gray-text space-y-1 leading-relaxed max-h-32 overflow-y-auto pr-1"
                  dangerouslySetInnerHTML={{ __html: appointment.description }}
                />
              </div>
            )}

            {/* Creation metadata */}
            {appointment.create_date && (
              <p className="text-[11px] text-gray-400 font-mono text-center">
                RDV enregistré le {new Date(appointment.create_date).toLocaleDateString('fr-FR')} dans Odoo
              </p>
            )}
          </div>

          {/* Modal Footer Actions */}
          <div className="p-5 bg-brand-gray-light border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* WhatsApp Share Button */}
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 py-2.5 px-4 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] text-xs font-bold font-poppins rounded-xl transition-all border border-[#25D366]/30"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                WhatsApp
              </a>

              {/* Google Calendar Link */}
              <a
                href={buildGoogleCalendarUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 py-2.5 px-4 bg-white hover:bg-gray-100 text-brand-dark text-xs font-bold font-poppins rounded-xl transition-all border border-gray-200"
              >
                <LucideIcon name="CalendarPlus" className="h-4 w-4 text-brand-wellbeing" />
                Google Agenda
              </a>
            </div>

            <button
              onClick={onClose}
              className="w-full sm:w-auto py-2.5 px-6 bg-brand-dark text-white font-poppins font-bold text-xs rounded-xl hover:bg-brand-dark/90 transition-all shadow-sm"
            >
              Fermer
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
