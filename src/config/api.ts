/**
 * Retourne l'URL de base du FastAPI (capsy-odoo-api).
 * En production, les requêtes doivent passer par les proxies Vercel (/api/...)
 * pour éviter les erreurs CORS. Cette fonction est gardée pour le mode local.
 */
export const getFastApiUrl = (): string => {
  const metaEnv = (import.meta as any).env || {};
  const procEnv = (typeof process !== 'undefined' ? process.env : {}) || {};

  const apiUrl = metaEnv.ODOO_API_URL || procEnv.ODOO_API_URL || metaEnv.VITE_ODOO_API_URL;
  if (apiUrl) {
    return apiUrl.replace(/\/$/, '');
  }
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return 'https://capsy-odoo-api.vercel.app';
  }
  return 'http://localhost:8000';
};

/**
 * Retourne l'URL de base pour les appels API du frontend.
 * - En production (Vercel) : utilise les proxies /api/... pour éviter CORS.
 * - En local : appelle directement le FastAPI sur localhost:8000.
 */

export const getApiBase = (): string => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const isLocal = hostname === 'localhost'
      || hostname === '127.0.0.1'
      || hostname === '0.0.0.0'
      || hostname.startsWith('192.168.')
      || hostname.startsWith('10.');
    if (!isLocal) {
      // Production : utiliser les endpoints proxy Vercel (même domaine = pas de CORS)
      return '';
    }
  }
  // Local development : appel direct au FastAPI
  return 'http://localhost:8000';
};

/**
 * URL pour lister/créer des rendez-vous.
 * Proxy Vercel en prod, FastAPI direct en local.
 */
export const getAppointmentsUrl = (): string => {
  const base = getApiBase();
  if (base === '') {
    return '/api/appointments-list';
  }
  return `${base}/appointments`;
};

/**
 * URL pour récupérer les thérapeutes par service.
 * Proxy Vercel en prod, FastAPI direct en local.
 */
export const getTherapistsUrl = (): string => {
  const base = getApiBase();
  if (base === '') {
    return '/api/therapists';
  }
  return `${base}/therapists`;
};

/**
 * URL pour récupérer les types de rendez-vous Odoo (module Rendez-vous).
 * Proxy Vercel/Express en prod, FastAPI direct en local.
 */
export const getAppointmentTypesUrl = (): string => {
  const base = getApiBase();
  if (base === '') {
    return '/api/appointment-types';
  }
  return `${base}/appointments/types/`;
};

/**
 * URL pour récupérer les détails complets d'un type de RDV Odoo
 * (descriptif, questions, disponibilités, options).
 * Proxy Vercel/Express en prod, FastAPI direct en local.
 */
export const getAppointmentDetailsUrl = (id: number | string): string => {
  const base = getApiBase();
  if (base === '') {
    return `/api/appointment-details?id=${id}`;
  }
  return `${base}/appointments/types/${id}/details`;
};

/**
 * URL pour récupérer les créneaux disponibles en temps réel pour une date et un service.
 * Proxy Vercel/Express en prod, FastAPI direct en local.
 */
export const getAvailableSlotsUrl = (
  appointmentTypeId: number | string,
  date: string,
  therapistUserId?: number | string
): string => {
  const base = getApiBase();
  const params = new URLSearchParams({
    appointment_type_id: String(appointmentTypeId),
    date,
  });
  if (therapistUserId) params.set('therapist_user_id', String(therapistUserId));

  if (base === '') {
    return `/api/available-slots?${params}`;
  }
  return `${base}/appointments/available-slots?${params}`;
};
