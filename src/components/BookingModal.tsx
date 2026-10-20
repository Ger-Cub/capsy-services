import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SERVICES as STATIC_SERVICES } from '../data/staticData';
import { Appointment } from '../types';
import LucideIcon from './LucideIcon';
import { Country, DEFAULT_COUNTRY, ALL_COUNTRIES } from '../data/countries';

import { getTherapistsUrl, getAppointmentsUrl, getAppointmentTypesUrl } from '../config/api';
import {
  validateClientName,
  validateClientPhone,
  validateClientEmail,
  detectDrcNetwork,
  MobileNetwork,
} from '../utils/bookingValidation';

const OPERATORS: { name: MobileNetwork; color: string }[] = [
  { name: 'Airtel', color: '#E70310' },
  { name: 'Vodacom', color: '#EC0102' },
  { name: 'Orange', color: '#FF6421' },
  { name: 'Africell', color: '#A51473' },
  { name: 'Autre', color: '#0F766E' },
];

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialServiceId?: string;
  onBookingSuccess?: (appointment: Appointment) => void;
  user?: any;
}

// Horaires de consultation : de 09h00 à 16h00
const TIME_SLOTS = [
  '09h00 - 10h00',
  '10h30 - 11h30',
  '12h00 - 13h00',
  '13h30 - 14h30',
  '14h30 - 15h30',
  '15h00 - 16h00',
];

export default function BookingModal({
  isOpen,
  onClose,
  initialServiceId = '',
  onBookingSuccess,
  user,
}: BookingModalProps) {
  const [step, setStep] = useState(1);
  const [serviceId, setServiceId] = useState(initialServiceId || (STATIC_SERVICES[0] && STATIC_SERVICES[0].id) || '');
  const [preferredTherapist, setPreferredTherapist] = useState('Premier disponible');
  const [format, setFormat] = useState<'presentiel' | 'en_ligne'>('presentiel');
  const [date, setDate] = useState('');
  // Stable service title for therapist filtering — survives Odoo product list reload
  const [selectedServiceTitle, setSelectedServiceTitle] = useState<string>(() => {
    const s = STATIC_SERVICES.find((x) => x.id === (initialServiceId || STATIC_SERVICES[0]?.id));
    return s?.title || '';
  });
  const [timeSlot, setTimeSlot] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientPhoneType, setClientPhoneType] = useState('Orange'); // DRC commonly has multiple networks: Vodacom, Orange, Airtel
  const [clientNotes, setClientNotes] = useState('');
  const [createdAppointment, setCreatedAppointment] = useState<Appointment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [servicesList, setServicesList] = useState<any[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [isLoadingTherapists, setIsLoadingTherapists] = useState(false);

  // Validation des coordonnées client
  const [nameError, setNameError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  // Sélecteur de pays pour l'indicatif téléphonique (RDC par défaut)
  const [selectedCountry, setSelectedCountry] = useState<Country>(DEFAULT_COUNTRY);
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [countrySearchQuery, setCountrySearchQuery] = useState('');
  const countryDropdownRef = useRef<HTMLDivElement>(null);
  const countrySearchInputRef = useRef<HTMLInputElement>(null);

  // Filtrage des pays par nom, indicatif ou code ISO
  const filteredCountries = useMemo(() => {
    const q = countrySearchQuery.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (!q) return ALL_COUNTRIES;
    return ALL_COUNTRIES.filter((c) => {
      const normName = c.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const normDial = c.dialCode.replace('+', '');
      const normCode = c.code.toLowerCase();
      return normName.includes(q) || c.dialCode.includes(q) || normDial.includes(q) || normCode.includes(q);
    });
  }, [countrySearchQuery]);

  // Fermer le dropdown au clic en dehors ou avec la touche Échap
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        countryDropdownRef.current &&
        !countryDropdownRef.current.contains(event.target as Node)
      ) {
        setIsCountryDropdownOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isCountryDropdownOpen) {
        setIsCountryDropdownOpen(false);
      }
    };

    if (isCountryDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isCountryDropdownOpen]);

  // Validation stricte en temps réel (email et téléphone obligatoires)
  const phoneValidation = validateClientPhone(clientPhone, selectedCountry.dialCode);
  const emailValidation = validateClientEmail(clientEmail);
  const nameValidation = validateClientName(clientName);
  const isFormValid = phoneValidation.isValid && emailValidation.isValid && nameValidation.isValid;

  // Pre-fill user data if logged in
  useEffect(() => {
    if (user && isOpen) {
      setClientName(user.name || '');
      setClientEmail(user.email || '');
    }
  }, [user, isOpen]);

  const sourceServices = servicesList.length > 0 ? servicesList : STATIC_SERVICES;
  // matchedService for display — may be undefined if Odoo IDs differ from static IDs
  const matchedService = sourceServices.find((s) => String(s.id) === String(serviceId))
    || STATIC_SERVICES.find((s) => String(s.id) === String(serviceId));


  // Synchroniser le service sélectionné si initialServiceId change
  useEffect(() => {
    const sid = typeof initialServiceId === 'string' ? initialServiceId : '';
    if (!sid) return;
    const sidLower = sid.toLowerCase();
    const match = sourceServices.find((s) =>
      String(s.id) === sid ||
      (s.title && s.title.toLowerCase().includes(sidLower))
    );
    if (match) {
      setServiceId(match.id);
      setSelectedServiceTitle(match.title);
    } else {
      setServiceId(sid);
    }
  }, [initialServiceId, sourceServices]);

  // Récupérer les types de rendez-vous publiés depuis Odoo (module Rendez-vous)
  useEffect(() => {
    if (!isOpen) return;
    const controller = new AbortController();
    setIsLoadingServices(true);
    (async () => {
      try {
        const resp = await fetch(`${getAppointmentTypesUrl()}?limit=50`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
        });
        if (!resp.ok) return;
        const data = await resp.json();
        const rawTypes = Array.isArray(data) ? data : (data.types || data.items || []);
        if (rawTypes.length > 0) {
          const mapped = rawTypes.map((item: any) => {
            const d = item.data || item;
            const name = d.name || item.name || `Type de rendez-vous #${item.id}`;
            const nameLower = name.toLowerCase();

            // Attribuer une icône pertinente selon le service
            let iconName = 'HeartHandshake';
            if (nameLower.includes('individuelle') || nameLower.includes('individuel')) {
              iconName = 'User';
            } else if (nameLower.includes('enfant') || nameLower.includes('ado')) {
              iconName = 'Smile';
            } else if (nameLower.includes('supervision')) {
              iconName = 'GraduationCap';
            } else if (nameLower.includes('couple')) {
              iconName = 'Heart';
            } else if (nameLower.includes('famille')) {
              iconName = 'Users';
            }

            // Description courte adaptée
            let shortDescription = d.category === 'recurring' ? 'Rendez-vous récurrent' : 'Séance d\'accompagnement clinique';
            if (nameLower.includes('individuelle')) {
              shortDescription = 'Entretien confidentiel avec un psychologue clinicien certifié.';
            } else if (nameLower.includes('enfant') || nameLower.includes('ado')) {
              shortDescription = 'Bilan psycho-émotionnel et accompagnement adapté aux jeunes.';
            } else if (nameLower.includes('supervision')) {
              shortDescription = 'Supervision clinique, perfectionnement et analyse de pratique.';
            }

            return {
              id: String(item.id),
              appointmentTypeId: Number(item.id),
              title: name,
              shortDescription,
              duration: d.appointment_duration || 1,
              staffUserIds: d.staff_user_ids || [],
              iconName,
              therapists: [],
            };
          });

          setServicesList(mapped);

          // Si un initialServiceId était demandé, faire correspondre intelligemment
          const initSid = typeof initialServiceId === 'string' ? initialServiceId : '';
          let matched = null;
          if (initSid) {
            const initSidLower = initSid.toLowerCase();
            matched = mapped.find((m: any) =>
              String(m.id) === initSid ||
              m.title.toLowerCase().includes(initSidLower)
            );
          }

          if (matched) {
            setServiceId(matched.id);
            setSelectedServiceTitle(matched.title);
          } else if (!serviceId || serviceId === STATIC_SERVICES[0].id) {
            setServiceId(mapped[0].id);
            setSelectedServiceTitle(mapped[0].title);
          }
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.debug('Unable to fetch appointment types from Odoo, using static SERVICES fallback');
        }
      } finally {
        setIsLoadingServices(false);
      }
    })();
    return () => controller.abort();
  }, [isOpen]);

  const [odooTherapists, setOdooTherapists] = useState<{ id: number; name: string; avatar: string | null }[]>([]);

  // Charger les thérapeutes autorisés pour ce type de rendez-vous depuis Odoo
  useEffect(() => {
    if (!isOpen) return;

    const currentService = sourceServices.find((s) => String(s.id) === String(serviceId));
    const apptTypeId = currentService?.appointmentTypeId || (!isNaN(Number(serviceId)) ? Number(serviceId) : undefined);
    const serviceTitle = currentService?.title || selectedServiceTitle;

    const params = new URLSearchParams();
    if (apptTypeId) {
      params.append('appointment_type_id', String(apptTypeId));
    }
    if (serviceTitle) {
      params.append('service_title', serviceTitle);
    }
    const queryString = params.toString() ? `?${params.toString()}` : '';

    setIsLoadingTherapists(true);
    fetch(`${getTherapistsUrl()}${queryString}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          // Filtrer strictement par staffUserIds du service sélectionné (garantie anti-non-thérapeutes)
          const validStaffIds = currentService?.staffUserIds;
          const filtered = (validStaffIds && Array.isArray(validStaffIds) && validStaffIds.length > 0)
            ? data.filter((t: any) => validStaffIds.includes(t.id))
            : data;

          setOdooTherapists(filtered);
          // Si le praticien actuellement sélectionné n'est pas dans la liste des psychologues habilités,
          // réinitialiser à 'Premier disponible'
          setPreferredTherapist((prev) => {
            if (prev === 'Premier disponible') return prev;
            const exists = filtered.some((t: any) => t.name === prev);
            return exists ? prev : 'Premier disponible';
          });
        }
      })
      .catch((err) => {
        console.warn('Erreur chargement thérapeutes Odoo:', err);
      })
      .finally(() => {
        setIsLoadingTherapists(false);
      });
  }, [isOpen, serviceId, selectedServiceTitle, sourceServices]);

  // Generate 7 upcoming business days dynamically
  const [availableDates, setAvailableDates] = useState<{ value: string; label: string }[]>([]);
  useEffect(() => {
    const dates: { value: string; label: string }[] = [];
    const today = new Date();
    let count = 0;
    while (count < 8) {
      today.setDate(today.getDate() + 1);
      // Skip Sundays
      if (today.getDay() !== 0) {
        const valueStr = today.toISOString().split('T')[0];
        const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' };
        // Format French
        const labelStr = today.toLocaleDateString('fr-FR', options);
        dates.push({
          value: valueStr,
          label: labelStr.charAt(0).toUpperCase() + labelStr.slice(1),
        });
        count++;
      }
    }
    setAvailableDates(dates);
    if (dates.length > 0) {
      setDate(dates[0].value);
    }
  }, []);

  const handleServiceSelect = (id: string) => {
    setServiceId(id);
    // Resolve title: prefer static match by id, then from Odoo products list
    const fromStatic = STATIC_SERVICES.find((s) => String(s.id) === String(id));
    const fromOdoo = servicesList.find((s) => String(s.id) === String(id));
    setSelectedServiceTitle(fromStatic?.title || fromOdoo?.title || '');
    setStep(2);
  };

  const handleNextStep = () => {
    if (step === 2) {
      if (!date || !timeSlot) return;
      setStep(3);
    }
  };

  const handlePrevStep = () => {
    setStep((prev) => Math.max(1, prev - 1));
  };

  const validateForm = () => {
    const nameRes = validateClientName(clientName);
    const phoneRes = validateClientPhone(clientPhone, selectedCountry.dialCode);
    const emailRes = validateClientEmail(clientEmail);

    setNameError(nameRes.isValid ? null : (nameRes.error || 'Nom invalide'));
    setPhoneError(phoneRes.isValid ? null : (phoneRes.error || 'Numéro invalide'));
    setEmailError(emailRes.isValid ? null : (emailRes.error || 'E-mail invalide'));

    const isAllValid = nameRes.isValid && phoneRes.isValid && emailRes.isValid;
    return isAllValid ? (phoneRes.cleanPhone || clientPhone) : null;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasAttemptedSubmit(true);

    const validPhone = validateForm();
    if (!validPhone) {
      window.dispatchEvent(new CustomEvent('capsy:toast', {
        detail: {
          message: 'Veuillez corriger les informations requises avant de confirmer.',
          type: 'error'
        }
      }));
      return;
    }

    setIsSubmitting(true);

    const appointmentId = `CAPS-${Date.now().toString().slice(-4)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newAppointment: Appointment = {
      id: appointmentId,
      serviceId,
      serviceTitle: matchedService?.title || 'Consultation Générale',
      clientName: clientName.trim() || 'Patient',
      clientEmail: clientEmail.trim(),
      clientPhone: validPhone.startsWith('+') ? validPhone : `${selectedCountry.dialCode} ${validPhone}`,
      clientNotes: clientNotes || 'Aucun détail supplémentaire',
      date,
      timeSlot,
      preferredTherapist,
      status: 'en_attente',
      createdAt: new Date().toISOString(),
    };

    try {
      // Try to save to Odoo
      // Post directly to FastAPI backend which uses its .env credentials
      const currentApptTypeId = matchedService?.appointmentTypeId || (!isNaN(Number(serviceId)) ? Number(serviceId) : undefined);

      const response = await fetch(getAppointmentsUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointment: {
            ...newAppointment,
            appointmentTypeId: currentApptTypeId,
            format,                           // 'presentiel' | 'en_ligne'
          },
          loggedInPartnerId: user?.partner_id || null,
          loggedInUserId: user?.uid || null,
          loggedInSessionId: user?.session_id || null,
        })
      });

      if (!response.ok) {
        let errorMsg: any = 'Erreur lors de la synchronisation Odoo';
        try {
          const errorData = await response.json();
          errorMsg = errorData.error || errorData.detail || errorData.message || errorMsg;
        } catch (_e) {
          try {
            const text = await response.text();
            if (text) errorMsg = text;
          } catch (_e) {}
        }
        if (typeof errorMsg === 'object') {
          if (Array.isArray(errorMsg)) {
            errorMsg = errorMsg.map((err: any) => err.msg || JSON.stringify(err)).join(', ');
          } else {
            errorMsg = JSON.stringify(errorMsg);
          }
        }
        throw new Error(String(errorMsg));
      }

      const data = await response.json();
      console.log('Successfully synced with Odoo, ID:', data.id);

      setCreatedAppointment(newAppointment);
      setStep(4);
      if (onBookingSuccess) {
        onBookingSuccess(newAppointment);
      }

      // success toast
      window.dispatchEvent(new CustomEvent('capsy:toast', { detail: { message: 'Rendez-vous enregistré. Un conseiller vous contactera bientôt.', type: 'success' } }));

      // Dispatch event to refresh manager
      window.dispatchEvent(new Event('appointments-updated'));

    } catch (err: any) {
      console.error('Odoo sync error:', err);
      // Extract friendly message
      let msg = 'Impossible de programmer votre rendez-vous dans notre système Odoo.';
      try {
        if (err && err.message) {
          // err.message may contain JSON or plain text
          try {
            const parsed = JSON.parse(err.message);
            msg = parsed.detail || parsed.error || parsed.message || msg;
          } catch (_e) {
            msg = err.message;
          }
        }
      } catch (_e) {}
      // Dispatch toast event
      window.dispatchEvent(new CustomEvent('capsy:toast', { detail: { message: msg, type: 'error' } }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setServiceId(initialServiceId || (sourceServices[0] && sourceServices[0].id) || '');
    setPreferredTherapist('Premier disponible');
    setFormat('presentiel');
    if (availableDates.length > 0) setDate(availableDates[0].value);
    setTimeSlot('');
    setClientName('');
    setClientEmail('');
    setClientPhone('');
    setSelectedCountry(DEFAULT_COUNTRY);
    setIsCountryDropdownOpen(false);
    setCountrySearchQuery('');
    setClientNotes('');
    setNameError(null);
    setPhoneError(null);
    setEmailError(null);
    setHasAttemptedSubmit(false);
    setCreatedAppointment(null);
  };

  const handleCloseModal = () => {
    resetForm();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleCloseModal}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
            id="rdv-modal"
          >
            {/* Header */}
            <div className="p-6 bg-brand-wellbeing text-white flex items-center justify-between border-b border-white/10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-lg">
                  <LucideIcon name="Calendar" className="h-6 w-6 text-brand-green" />
                </div>
                <div>
                  <h3 className="text-xl font-bold font-poppins">Prendre un Rendez-vous</h3>
                  <p className="text-xs text-white/80 font-sans mt-0.5">Votre bien-être mental est notre priorité légitime</p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-1 rounded-full hover:bg-white/10 transition-colors text-white"
                aria-label="Fermer"
              >
                <LucideIcon name="X" className="h-6 w-6" />
              </button>
            </div>

            {/* Stepper Progress Bar */}
            {step < 4 && (
              <div className="bg-brand-gray-light px-6 py-3 border-b border-gray-200 flex justify-between items-center text-xs text-brand-gray-text font-medium shrink-0">
                <div className="flex items-center gap-2">
                  <span className={`h-6 w-6 flex items-center justify-center rounded-full text-white font-bold ${step >= 1 ? 'bg-brand-wellbeing' : 'bg-gray-300'}`}>1</span>
                  <span>Service</span>
                </div>
                <div className="h-0.5 bg-gray-300 flex-1 mx-3" />
                <div className="flex items-center gap-2">
                  <span className={`h-6 w-6 flex items-center justify-center rounded-full text-white font-bold ${step >= 2 ? 'bg-brand-wellbeing' : 'bg-gray-300'}`}>2</span>
                  <span>Date & Heure</span>
                </div>
                <div className="h-0.5 bg-gray-300 flex-1 mx-3" />
                <div className="flex items-center gap-2">
                  <span className={`h-6 w-6 flex items-center justify-center rounded-full text-white font-bold ${step >= 3 ? 'bg-brand-wellbeing' : 'bg-gray-300'}`}>3</span>
                  <span>Vos coordonnées</span>
                </div>
              </div>
            )}

            {/* Content Body - Scrollable */}
            <div className="p-6 overflow-y-auto flex-1">
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <p className="font-poppins font-medium text-brand-dark text-center text-lg mb-2">
                    Quel type d'accompagnement recherchez-vous aujourd'hui ?
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" id="service-selector">
                    {isLoadingServices
                      ? Array.from({ length: 4 }).map((_, i) => (
                          <div key={i} className="p-4 rounded-xl border-2 border-gray-100 bg-gray-50 animate-pulse flex flex-col gap-2 h-28">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-lg bg-gray-200 shrink-0" />
                              <div className="h-4 w-2/3 rounded-md bg-gray-200" />
                            </div>
                            <div className="h-3 w-full rounded-md bg-gray-100 mt-1" />
                            <div className="h-3 w-4/5 rounded-md bg-gray-100" />
                          </div>
                        ))
                      : sourceServices.map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => handleServiceSelect(s.id)}
                            className={`p-4 rounded-xl border-2 text-left transition-all hover:bg-neutral-50 flex flex-col justify-between h-full ${serviceId === s.id
                              ? 'border-brand-green bg-green-50/20 shadow-sm'
                              : 'border-gray-200'
                              }`}
                          >
                            <div className="flex items-center gap-3 mb-2">
                              <div className={`p-2 rounded-lg ${serviceId === s.id ? 'bg-brand-green text-white' : 'bg-brand-gray-light text-brand-wellbeing'}`}>
                                <LucideIcon name={s.iconName} className="h-5 w-5" />
                              </div>
                              <span className="font-poppins font-bold text-brand-dark text-sm leading-tight">
                                {s.title}
                              </span>
                            </div>
                            <p className="text-xs text-brand-gray-text line-clamp-2 mt-1">
                              {s.shortDescription}
                            </p>
                            {serviceId === s.id && (
                              <div className="flex justify-end w-full mt-3">
                                <span className="text-brand-green text-xs font-semibold flex items-center gap-1">
                                  Sélectionné <LucideIcon name="Check" className="h-3.5 w-3.5" strokeWidth={3} />
                                </span>
                              </div>
                            )}
                          </button>
                        ))
                    }
                  </div>
                  <div className="space-y-2 mt-3">
                    <div className="bg-brand-gray-light p-3.5 rounded-xl flex gap-3 text-xs text-brand-gray-text leading-relaxed border border-gray-200">
                      <LucideIcon name="Info" className="h-5 w-5 text-brand-wellbeing shrink-0 mt-0.5" />
                      <p>
                        Cette demande permet de solliciter un rendez-vous. Elle ne constitue pas une consultation, un diagnostic ni une prise en charge d’urgence.
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-900 leading-relaxed">
                      <LucideIcon name="AlertTriangle" className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                      <p>
                        <strong className="font-semibold">Urgence :</strong> En cas de danger immédiat, de risque de violence ou d’urgence médicale, contactez les services d’urgence disponibles dans votre zone ou rendez-vous dans la structure de santé la plus proche. CAPSY ne remplace pas les services d’urgence.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-5"
                >
                  {/* Select Format */}
                  <div>
                    <label className="block text-sm font-poppins font-bold text-brand-dark mb-2">
                      Format de consultation
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setFormat('presentiel')}
                        className={`p-3 rounded-xl border-2 flex items-center justify-center gap-2 transition-all ${format === 'presentiel'
                          ? 'border-brand-wellbeing bg-brand-wellbeing/5 text-brand-wellbeing font-semibold'
                          : 'border-gray-200 text-brand-gray-text hover:bg-neutral-50'
                          }`}
                      >
                        <LucideIcon name="MapPin" className="h-4 w-4" />
                        <span>Présentiel (Goma)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormat('en_ligne')}
                        className={`p-3 rounded-xl border-2 flex items-center justify-center gap-2 transition-all ${format === 'en_ligne'
                          ? 'border-brand-wellbeing bg-brand-wellbeing/5 text-brand-wellbeing font-semibold'
                          : 'border-gray-200 text-brand-gray-text hover:bg-neutral-50'
                          }`}
                      >
                        <LucideIcon name="Globe" className="h-4 w-4" />
                        <span>Séance en Ligne</span>
                      </button>
                    </div>
                  </div>

                  {/* Select Calendar Day */}
                  <div>
                    <label className="block text-sm font-poppins font-bold text-brand-dark mb-2">
                      Choisir une date
                    </label>
                    <select
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full p-3.5 border-2 border-gray-200 rounded-xl bg-white font-sans text-brand-dark focus:border-brand-wellbeing outline-none transition-colors"
                      id="date-picker"
                    >
                      {availableDates.map((d) => (
                        <option key={d.value} value={d.value}>
                          {d.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Select Time Slot */}
                  <div>
                    <label className="block text-sm font-poppins font-bold text-brand-dark mb-2">
                      Créneaux horaires disponibles
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5" id="time-grid">
                      {TIME_SLOTS.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setTimeSlot(slot)}
                          className={`p-3 rounded-xl border-2 text-center text-xs font-semibold font-mono transition-all ${timeSlot === slot
                            ? 'border-brand-green bg-green-50/20 text-brand-green shadow-xs'
                            : 'border-gray-200 text-brand-gray-text hover:border-gray-300'
                            }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Select Therapist Option */}
                  <div>
                    <label className="block text-sm font-poppins font-bold text-brand-dark mb-2.5">
                      Préférence de praticien (Psychologues Odoo)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setPreferredTherapist('Premier disponible')}
                        className={`p-3.5 rounded-2xl border-2 text-left flex items-center gap-3 transition-all ${preferredTherapist === 'Premier disponible'
                          ? 'border-brand-wellbeing bg-brand-wellbeing/5 text-brand-wellbeing font-semibold shadow-xs'
                          : 'border-gray-200 text-brand-gray-text hover:border-gray-300'
                          }`}
                      >
                        <div className="h-10 w-10 rounded-full bg-brand-wellbeing/10 text-brand-wellbeing flex items-center justify-center shrink-0 font-bold">
                          <LucideIcon name="Zap" className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs font-poppins font-bold text-brand-dark leading-tight">Premier disponible</p>
                          <p className="text-[10px] text-brand-gray-text mt-0.5">Orientation la plus rapide</p>
                        </div>
                      </button>

                      {isLoadingTherapists
                        ? Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="p-3.5 rounded-2xl border-2 border-gray-100 bg-gray-50 animate-pulse flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-gray-200 shrink-0" />
                              <div className="flex flex-col gap-1.5 flex-1">
                                <div className="h-3 w-3/4 rounded-md bg-gray-200" />
                                <div className="h-2.5 w-1/2 rounded-md bg-gray-100" />
                              </div>
                            </div>
                          ))
                        : (odooTherapists.length > 0
                            ? odooTherapists.map(t => ({ label: t.name, avatar: t.avatar, desc: 'Psychologue Clinicien' }))
                            : (matchedService?.therapists?.map(name => ({
                                label: name,
                                avatar: null,
                                desc: name.includes('Batenga') ? 'Sénior Clinicien' : name.includes('SHAMAMBA') ? 'Spécialiste TCC' : 'Psychologue Clinicien'
                              })) || [])
                          ).map((therapist) => (
                            <button
                              key={therapist.label}
                              type="button"
                              onClick={() => setPreferredTherapist(therapist.label)}
                              className={`p-3.5 rounded-2xl border-2 text-left flex items-center gap-3 transition-all ${preferredTherapist === therapist.label
                                ? 'border-brand-wellbeing bg-brand-wellbeing/5 text-brand-wellbeing font-semibold shadow-xs'
                                : 'border-gray-200 text-brand-gray-text hover:border-gray-300'
                                }`}
                            >
                              {therapist.avatar ? (
                                <img
                                  src={therapist.avatar}
                                  alt={therapist.label}
                                  className="h-10 w-10 rounded-full object-cover shrink-0 ring-2 ring-brand-wellbeing/30 shadow-xs"
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-brand-wellbeing/10 text-brand-wellbeing font-bold font-poppins text-xs flex items-center justify-center shrink-0 border border-brand-wellbeing/20">
                                  {therapist.label.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()}
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="text-xs font-poppins font-bold text-brand-dark leading-tight truncate">{therapist.label}</p>
                                <p className="text-[10px] text-brand-gray-text mt-0.5 truncate">{therapist.desc}</p>
                              </div>
                            </button>
                          ))
                      }
                    </div>

                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <form onSubmit={handleFormSubmit} className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-poppins font-bold uppercase tracking-wider text-brand-dark">
                          Votre nom ou pseudonyme <span className="text-brand-gray-text font-normal lowercase"> </span>
                        </label>
                        {nameError && (
                          <span className="text-[11px] text-red-600 font-medium flex items-center gap-1">
                            <LucideIcon name="AlertCircle" className="h-3 w-3" />
                            {nameError}
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        value={clientName}
                        onChange={(e) => {
                          const val = e.target.value;
                          setClientName(val);
                          const res = validateClientName(val);
                          setNameError(res.isValid ? null : (res.error || null));
                        }}
                        placeholder="Ex: Jean Mukendi (ou laissez vide)"
                        className={`w-full p-3.5 border-2 rounded-xl text-brand-dark font-sans placeholder-gray-400 outline-none transition-colors ${
                          nameError ? 'border-red-400 bg-red-50/20 focus:border-red-500' : 'border-gray-200 focus:border-brand-wellbeing'
                        }`}
                        id="form-client-name"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-xs font-poppins font-bold uppercase tracking-wider text-brand-dark">
                            Numéro WhatsApp / Téléphone *
                          </label>
                          {phoneValidation.isValid && clientPhone.trim() && (
                            <span className="text-[11px] text-brand-green font-semibold flex items-center gap-0.5">
                              <LucideIcon name="Check" className="h-3 w-3" /> Valide
                            </span>
                          )}
                        </div>
                        {/* Conteneur avec sélecteur de pays et input */}
                        <div className="relative" ref={countryDropdownRef}>
                          <div className={`flex rounded-xl border-2 transition-colors ${
                            phoneError ? 'border-red-400 bg-red-50/20' : 'border-gray-200 focus-within:border-brand-wellbeing'
                          }`}>
                            {/* Bouton sélecteur de pays / indicatif */}
                            <button
                              type="button"
                              onClick={() => {
                                setIsCountryDropdownOpen((prev) => !prev);
                                if (!isCountryDropdownOpen) {
                                  setTimeout(() => countrySearchInputRef.current?.focus(), 60);
                                }
                              }}
                              className="bg-brand-gray-light hover:bg-gray-200/80 text-brand-dark font-sans text-xs font-semibold px-2.5 py-3 flex items-center gap-1.5 border-r border-gray-200 select-none transition-colors shrink-0 rounded-l-[10px]"
                              title="Changer de pays / indicatif"
                              aria-label="Changer de pays"
                            >
                              <span className="text-base leading-none">{selectedCountry.flag}</span>
                              <span className="font-bold text-gray-700">{selectedCountry.dialCode}</span>
                              <LucideIcon
                                name="ChevronDown"
                                className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-200 ${
                                  isCountryDropdownOpen ? 'rotate-180' : ''
                                }`}
                              />
                            </button>

                            {/* Champ de saisie du numéro */}
                            <input
                              type="tel"
                              required
                              value={clientPhone}
                              onChange={(e) => {
                                const val = e.target.value;
                                setClientPhone(val);

                                if (selectedCountry.code === 'CD') {
                                  const detected = detectDrcNetwork(val, selectedCountry.dialCode);
                                  const currentNet = detected || clientPhoneType;
                                  if (detected && detected !== clientPhoneType) {
                                    setClientPhoneType(detected);
                                  }
                                }

                                const res = validateClientPhone(val, selectedCountry.dialCode);
                                setPhoneError(res.isValid ? null : (res.error || null));
                              }}
                              placeholder={selectedCountry.code === 'CD' ? 'Ex: 991102448' : 'Numéro de téléphone'}
                              className="w-full p-3 text-brand-dark font-sans outline-none placeholder-gray-400 bg-transparent rounded-r-[10px]"
                              id="form-client-phone"
                            />
                          </div>

                          {/* Menu déroulant des pays avec barre de recherche */}
                          {isCountryDropdownOpen && (
                            <div className="absolute top-full left-0 mt-1.5 w-72 sm:w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
                              {/* Barre de recherche */}
                              <div className="p-2.5 border-b border-gray-100 bg-gray-50/90">
                                <div className="relative flex items-center">
                                  <LucideIcon name="Search" className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 pointer-events-none" />
                                  <input
                                    ref={countrySearchInputRef}
                                    type="text"
                                    value={countrySearchQuery}
                                    onChange={(e) => setCountrySearchQuery(e.target.value)}
                                    placeholder="Rechercher pays ou indicatif..."
                                    className="w-full pl-8 pr-7 py-1.5 text-xs bg-white border border-gray-200 rounded-lg outline-none focus:border-brand-wellbeing focus:ring-1 focus:ring-brand-wellbeing/20 text-gray-800 placeholder-gray-400"
                                  />
                                  {countrySearchQuery && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setCountrySearchQuery('');
                                        countrySearchInputRef.current?.focus();
                                      }}
                                      className="absolute right-2 p-0.5 text-gray-400 hover:text-gray-600 rounded-full"
                                    >
                                      <LucideIcon name="X" className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* Liste des pays scrollable */}
                              <div className="max-h-60 overflow-y-auto divide-y divide-gray-50">
                                {filteredCountries.length > 0 ? (
                                  filteredCountries.map((c) => {
                                    const isSelected = c.code === selectedCountry.code;
                                    return (
                                      <button
                                        key={c.code}
                                        type="button"
                                        onClick={() => {
                                          setSelectedCountry(c);
                                          setIsCountryDropdownOpen(false);
                                          setCountrySearchQuery('');
                                          if (clientPhone) {
                                            const res = validateClientPhone(clientPhone, c.dialCode);
                                            setPhoneError(res.isValid ? null : (res.error || null));
                                          }
                                        }}
                                        className={`w-full px-3 py-2 text-left flex items-center gap-2.5 transition-colors text-xs ${
                                          isSelected
                                            ? 'bg-brand-green/10 text-brand-green font-semibold'
                                            : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                      >
                                        <span className="text-base shrink-0 leading-none">{c.flag}</span>
                                        <span className="truncate flex-1 font-medium">{c.name}</span>
                                        <span className={`text-[11px] font-mono shrink-0 ${isSelected ? 'text-brand-green font-bold' : 'text-gray-400'}`}>
                                          {c.dialCode}
                                        </span>
                                        {isSelected && (
                                          <LucideIcon name="Check" className="w-3.5 h-3.5 text-brand-green shrink-0 ml-1" />
                                        )}
                                      </button>
                                    );
                                  })
                                ) : (
                                  <div className="p-4 text-center text-xs text-gray-400">
                                    Aucun pays trouvé pour &laquo;{countrySearchQuery}&raquo;
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {phoneError ? (
                          <p className="text-[11px] text-red-600 font-medium flex items-center gap-1 mt-1 leading-tight">
                            <LucideIcon name="AlertCircle" className="h-3.5 w-3.5 shrink-0" />
                            {phoneError}
                          </p>
                        ) : (
                          <p className="text-[10px] text-brand-gray-text mt-1">
                            {selectedCountry.code === 'CD'
                              ? '9 chiffres (ex: 991102448 ou 812345678).'
                              : `Numéro sans indicatif international (indicatif ${selectedCountry.dialCode} inclus automatiquement).`}
                          </p>
                        )}

                        {selectedCountry.code === 'CD' ? (
                          <div className="flex gap-1.5 mt-2 flex-wrap items-center">
                            {OPERATORS.map((op) => {
                              const detected = detectDrcNetwork(clientPhone, selectedCountry.dialCode);
                              const isDetected = phoneValidation.isValid && detected === op.name;
                              return (
                                <span
                                  key={op.name}
                                  style={isDetected ? { backgroundColor: op.color, borderColor: op.color, color: '#FFFFFF' } : undefined}
                                  className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border transition-all duration-200 select-none pointer-events-none cursor-default ${
                                    isDetected
                                      ? 'shadow-xs scale-105'
                                      : 'bg-gray-100 text-gray-400 border-gray-200'
                                  }`}
                                >
                                  {op.name}
                                </span>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 mt-2 text-[10px] text-brand-gray-text font-medium">
                            <LucideIcon name="Globe" className="h-3 w-3 text-brand-green" />
                            <span>International &bull; {selectedCountry.name} ({selectedCountry.dialCode})</span>
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-xs font-poppins font-bold uppercase tracking-wider text-brand-dark">
                            Adresse e-mail *
                          </label>
                          {emailValidation.isValid && clientEmail.trim() && (
                            <span className="text-[11px] text-brand-green font-semibold flex items-center gap-0.5">
                              <LucideIcon name="Check" className="h-3 w-3" /> Valide
                            </span>
                          )}
                        </div>
                        <input
                          type="email"
                          required
                          value={clientEmail}
                          onChange={(e) => {
                            const val = e.target.value;
                            setClientEmail(val);
                            const res = validateClientEmail(val);
                            setEmailError(res.isValid ? null : (res.error || null));
                          }}
                          placeholder="Ex: votre.nom@domaine.com"
                          className={`w-full p-3.5 border-2 rounded-xl text-brand-dark font-sans placeholder-gray-400 outline-none transition-colors ${
                            emailError ? 'border-red-400 bg-red-50/20 focus:border-red-500' : 'border-gray-200 focus:border-brand-wellbeing'
                          }`}
                          id="form-client-email"
                        />
                        {emailError ? (
                          <p className="text-[11px] text-red-600 font-medium flex items-center gap-1 mt-1 leading-tight">
                            <LucideIcon name="AlertCircle" className="h-3.5 w-3.5 shrink-0" />
                            {emailError}
                          </p>
                        ) : (
                          <p className="text-[10px] text-brand-gray-text mt-1"></p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-poppins font-bold uppercase tracking-wider text-brand-dark mb-1.5">
                        Dites-nous brièvement ce qui vous amène (Optionnel & Confidentiel)
                      </label>
                      <textarea
                        value={clientNotes}
                        onChange={(e) => setClientNotes(e.target.value)}
                        placeholder="Ex: Difficultés de sommeil récurrentes liées au surmenage professionnel..."
                        rows={3}
                        className="w-full p-3.5 border-2 border-gray-200 rounded-xl text-brand-dark font-sans placeholder-gray-400 focus:border-brand-wellbeing outline-none transition-colors resize-none"
                        id="form-client-notes"
                      />
                    </div>

                    <div className="bg-brand-gray-light p-3 rounded-xl border border-gray-200 flex gap-2.5 text-xs text-brand-gray-text font-medium leading-relaxed">
                      <LucideIcon name="ShieldCheck" className="h-4.5 w-4.5 text-brand-green shrink-0 mt-0.5" />
                      <p>
                        Les échanges sont traités de manière confidentielle, conformément au secret professionnel, à notre politique de confidentialité et aux limites prévues par la loi et la protection des personnes.
                      </p>
                    </div>

                    {/* Hidden Submit Button to allow press Enter */}
                    <button type="submit" className="hidden" />
                  </form>
                </motion.div>
              )}

              {step === 4 && createdAppointment && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6 text-center py-4"
                  id="rdv-success-view"
                >
                  <div className="inline-flex p-3 bg-brand-green/10 rounded-full text-brand-green mb-1 animate-bounce">
                    <LucideIcon name="CheckCircle2" className="h-14 w-14" />
                  </div>

                  <div>
                    <h4 className="text-2xl font-bold font-poppins text-brand-dark mb-1">
                      Rendez-vous pré-enregistré !
                    </h4>
                    <p className="text-sm text-brand-gray-text max-w-md mx-auto">
                      Un conseiller de <span className="font-semibold text-brand-wellbeing">Capsy Services</span> va vous contacter sur WhatsApp dans l'heure pour finaliser et confirmer l'horaire précis.
                    </p>
                  </div>

                  {/* Receipt/Coupon */}
                  <div className="border border-dashed border-gray-300 rounded-2xl p-5 bg-brand-gray-light max-w-md mx-auto text-left relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3">
                      <span className="text-[10px] bg-brand-green/15 text-brand-green px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                        En Attente
                      </span>
                    </div>

                    <p className="text-[11px] font-mono text-brand-gray-text uppercase tracking-widest mb-1">
                      Numéro de suivi RDV
                    </p>
                    <p className="text-xl font-mono font-bold text-brand-wellbeing mb-4">
                      {createdAppointment.id}
                    </p>

                    <div className="space-y-2 text-xs font-sans text-brand-dark">
                      <div className="flex justify-between border-b border-gray-200 pb-1.5">
                        <span className="text-brand-gray-text font-medium">Service :</span>
                        <span className="font-bold">{createdAppointment.serviceTitle}</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-200 pb-1.5">
                        <span className="text-brand-gray-text font-medium">Date :</span>
                        <span className="font-bold">
                          {new Date(createdAppointment.date).toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-gray-200 pb-1.5">
                        <span className="text-brand-gray-text font-medium">Créneau :</span>
                        <span className="font-bold">{createdAppointment.timeSlot}</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-200 pb-1.5">
                        <span className="text-brand-gray-text font-medium">Praticien :</span>
                        <span className="font-bold">{createdAppointment.preferredTherapist}</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-200 pb-1.5">
                        <span className="text-brand-gray-text font-medium">Format :</span>
                        <span className="font-bold uppercase tracking-wider text-[10px] bg-brand-wellbeing/10 px-2 py-0.5 rounded-full text-brand-wellbeing">
                          {format === 'presentiel' ? 'Présentiel (Goma)' : 'En Ligne'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-brand-gray-text font-medium">Nom :</span>
                        <span className="font-semibold">{createdAppointment.clientName}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-2.5 justify-center pt-2 max-w-md mx-auto">
                    <a
                      href={`https://wa.me/243997707312?text=Bonjour%20Capsy%20Services%2C%20je%20viens%20de%20soumettre%20une%20demande%20de%20rendez-vous%20sur%20votre%20site.%20Mon%20N%C2%B0%20de%20suivi%20est%20${createdAppointment.id}.%20Merci!`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-3 px-4 bg-[#25D366] hover:bg-[#20ba56] text-white font-bold font-poppins rounded-xl flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer text-sm"
                    >
                      <LucideIcon name="MessageSquareShare" className="h-5 w-5" />
                      <span>Notifier sur WhatsApp</span>
                    </a>
                    <button
                      onClick={handleCloseModal}
                      className="py-3 px-6 bg-brand-wellbeing hover:bg-brand-wellbeing/90 text-white font-bold font-poppins rounded-xl transition-all text-sm"
                    >
                      Terminer
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Footer Buttons for Wizard (steps 1, 2, 3) */}
            {step < 4 && (
              <div className="p-4 bg-brand-gray-light border-t border-gray-250 flex items-center justify-between shrink-0">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  disabled={step === 1}
                  className={`py-2 px-4 rounded-xl text-xs font-bold font-poppins flex items-center gap-2 transition-all ${step === 1 ? 'opacity-30 cursor-not-allowed text-brand-gray-text' : 'text-brand-wellbeing hover:bg-neutral-200'
                    }`}
                >
                  <LucideIcon name="ChevronDown" className="h-4 w-4 rotate-90" />
                  <span>Retour</span>
                </button>

                {step === 2 ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    disabled={!timeSlot}
                    className={`py-2.5 px-6 rounded-xl font-poppins font-bold text-sm flex items-center gap-2 transition-all shadow-md text-white ${!timeSlot ? 'bg-gray-400 cursor-not-allowed' : 'bg-brand-wellbeing hover:bg-brand-wellbeing/90'
                      }`}
                  >
                    <span>Continuer</span>
                    <LucideIcon name="ChevronDown" className="h-4 w-4 -rotate-90" />
                  </button>
                ) : step === 3 ? (
                  <button
                    type="button"
                    onClick={handleFormSubmit}
                    disabled={!isFormValid || isSubmitting}
                    className={`py-2.5 px-6 rounded-xl font-poppins font-bold text-sm flex items-center gap-2 transition-all shadow-md text-white ${
                      !isFormValid || isSubmitting
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                        : 'bg-brand-green hover:bg-brand-green/95 active:scale-95'
                    }`}
                    id="submit-appointment-btn"
                  >
                    {isSubmitting ? (
                      <>
                        <LucideIcon name="Loader2" className="h-4 w-4 animate-spin" />
                        <span>Transmission...</span>
                      </>
                    ) : (
                      <>
                        <LucideIcon name="Check" className="h-4 w-4" />
                        <span>Confirmer le RDV</span>
                      </>
                    )}
                  </button>
                ) : (
                  <div /> // Placeholder for step 1 which goes forward automatically upon click
                )}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
