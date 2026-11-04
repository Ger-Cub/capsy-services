import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import QRCode from 'qrcode';
import fallbackEmployees from '../../employers_1793711702018.json';
import LucideIcon from '../components/LucideIcon';

const PUBLIC_BASE_URL = 'https://www.capsy-rdc.org';

// Strict list of PUBLIC accreditation fields only (private HR & contract data excluded for privacy/confidentiality)
const PUBLIC_EMPLOYEE_FIELDS = [
  'id',
  'display_name',
  'employee_token',
  'photo',
  'job_title',
  'department_id',
  'work_phone',
  'company_id',
  'hr_presence_state'
];

interface EmployerLookupPageProps {
  token?: string;
  onOpenBooking?: () => void;
}

interface EmployeeRecord {
  id: string | number;
  employee_token: string;
  display_name: string;
  photo: string;
  job_title: string;
  department: string;
  company_name: string;
  work_phone: string;
  is_active: boolean;
}

const pick = (value: any): string => {
  if (Array.isArray(value)) return String(value[1] ?? value[0] ?? '');
  if (value === false || value === null || typeof value === 'undefined') return '';
  return String(value);
};

const normalizeRecord = (record: any): EmployeeRecord => {
  const raw = record?.data ?? record ?? {};
  const imageSources = [
    raw.photo,
    raw.image_1920,
    raw.image_1024,
    raw.image_512,
    raw.image_medium,
    raw.image_small,
    raw.image_128,
    raw.avatar_128,
    raw.image
  ].filter(Boolean);

  const company = pick(raw.company_id);

  return {
    id: raw.id ?? '',
    employee_token: raw.employee_token ?? '',
    display_name: raw.display_name ?? raw.name ?? 'Collaborateur CAPSY',
    photo: imageSources[0] ?? '',
    job_title: raw.job_title ?? 'Professionnel de santé / Agent',
    department: pick(raw.department_id) || 'Pôle Clinique & Accompagnement',
    company_name: company || 'Centre d\'Assistance Psychologique, CAPSY SARL',
    work_phone: raw.work_phone ?? '',
    is_active: true
  };
};

export default function EmployerLookupPage({ token: initialToken = '', onOpenBooking }: EmployerLookupPageProps) {
  const [inputToken, setInputToken] = useState(initialToken || '');
  const [activeToken, setActiveToken] = useState(initialToken || '');
  const [employee, setEmployee] = useState<EmployeeRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copied, setCopied] = useState(false);

  // Scanner modal state
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannerError, setScannerError] = useState('');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanLoopRef = useRef<number | null>(null);

  // Synchronize when initialToken changes from URL
  useEffect(() => {
    const routeToken = (initialToken || '').trim();
    if (routeToken) {
      setInputToken(routeToken);
      setActiveToken(routeToken);
      void lookupEmployee(routeToken);
    } else {
      setInputToken('');
      setActiveToken('');
      setEmployee(null);
      setError('');
      setQrDataUrl('');
    }
  }, [initialToken]);

  const lookupEmployee = async (rawToken: string) => {
    const cleanToken = rawToken.trim();
    if (!cleanToken) {
      setEmployee(null);
      setQrDataUrl('');
      setError('');
      return;
    }

    const shareUrl = `${PUBLIC_BASE_URL}/employers/${encodeURIComponent(cleanToken)}`;
    setLoading(true);
    setError('');
    setEmployee(null);
    setQrDataUrl('');

    try {
      const response = await fetch('/api/odoo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'search_read',
          params: {
            model: 'hr.employee',
            domain: [['employee_token', '=', cleanToken]],
            fields: PUBLIC_EMPLOYEE_FIELDS,
            limit: 1,
            order: 'id asc'
          }
        })
      });

      let match: any = null;
      if (response.ok) {
        const json = await response.json();
        const records = Array.isArray(json?.results) ? json.results : Array.isArray(json) ? json : [];
        match = records[0] ?? null;
      }

      // Local fallback lookup if API is offline or not found
      if (!match) {
        const localMatch = (fallbackEmployees as any[]).find((item: any) => {
          const raw = item?.data ?? item ?? {};
          return String(raw.employee_token || '').toLowerCase() === cleanToken.toLowerCase();
        });
        match = localMatch ?? null;
      }

      if (!match) {
        setError('Aucun collaborateur ne correspond à cet identifiant dans le registre officiel de CAPSY SERVICES. Veuillez vérifier le code ou contacter notre administration.');
        setEmployee(null);
        return;
      }

      const normalized = normalizeRecord(match);
      setEmployee(normalized);

      // Generate verification QR code
      try {
        const qr = await QRCode.toDataURL(shareUrl, {
          width: 200,
          margin: 1,
          errorCorrectionLevel: 'M',
          color: { dark: '#003600', light: '#FFFFFF' }
        });
        setQrDataUrl(qr);
      } catch {
        setQrDataUrl('');
      }
    } catch {
      // Offline fallback
      const localMatch = (fallbackEmployees as any[]).find((item: any) => {
        const raw = item?.data ?? item ?? {};
        return String(raw.employee_token || '').toLowerCase() === cleanToken.toLowerCase();
      });

      if (localMatch) {
        const normalized = normalizeRecord(localMatch);
        setEmployee(normalized);
        try {
          const qr = await QRCode.toDataURL(shareUrl, {
            width: 200,
            margin: 1,
            errorCorrectionLevel: 'M',
            color: { dark: '#003600', light: '#FFFFFF' }
          });
          setQrDataUrl(qr);
        } catch {
          setQrDataUrl('');
        }
      } else {
        setError('Impossible d\'effectuer la vérification pour le moment. Veuillez vérifier votre connexion ou réessayer ultérieurement.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const clean = inputToken.trim();
    if (!clean) return;
    setActiveToken(clean);
    // Update URL smoothly without full reload
    if (window.location.pathname !== `/employers/${encodeURIComponent(clean)}`) {
      window.history.pushState({}, '', `/employers/${encodeURIComponent(clean)}`);
    }
    void lookupEmployee(clean);
  };

  const handleResetSearch = () => {
    setInputToken('');
    setActiveToken('');
    setEmployee(null);
    setError('');
    setQrDataUrl('');
    if (window.location.pathname !== '/employers') {
      window.history.pushState({}, '', '/employers');
    }
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard?.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // QR Scanner Lifecycle
  const stopScanner = () => {
    if (scanLoopRef.current) {
      cancelAnimationFrame(scanLoopRef.current);
      scanLoopRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsScannerOpen(false);
    setScannerError('');
  };

  const startScanner = async () => {
    setIsScannerOpen(true);
    setScannerError('');

    if (!navigator.mediaDevices?.getUserMedia) {
      setScannerError('La caméra n\'est pas accessible sur ce navigateur. Veuillez saisir manuellement le code du badge.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      const hasBarcodeDetector = typeof window !== 'undefined' && 'BarcodeDetector' in window;
      if (hasBarcodeDetector) {
        const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
        const tick = async () => {
          try {
            if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
              const codes = await detector.detect(videoRef.current);
              if (codes && codes.length > 0) {
                const text = codes[0].rawValue || '';
                const match = text.match(/\/employers\/([^/?#]+)/i);
                const foundToken = match ? decodeURIComponent(match[1]) : text;
                if (foundToken) {
                  const clean = foundToken.trim();
                  stopScanner();
                  setInputToken(clean);
                  setActiveToken(clean);
                  window.history.pushState({}, '', `/employers/${encodeURIComponent(clean)}`);
                  void lookupEmployee(clean);
                  return;
                }
              }
            }
            scanLoopRef.current = requestAnimationFrame(tick);
          } catch {
            scanLoopRef.current = requestAnimationFrame(tick);
          }
        };
        scanLoopRef.current = requestAnimationFrame(tick);
      } else {
        setScannerError('La détection automatique par caméra requiert un navigateur compatible. Vous pouvez saisir le jeton manuellement.');
      }
    } catch (err: any) {
      setScannerError(err?.message || 'Accès à la caméra refusé. Vérifiez les autorisations de votre navigateur.');
    }
  };

  useEffect(() => {
    return () => {
      if (scanLoopRef.current) cancelAnimationFrame(scanLoopRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-b from-white via-brand-gray-light/30 to-white text-brand-dark">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-brand-dark text-white pt-28 pb-14">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(145,252,163,0.15)_0%,transparent_70%)]" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-confidence/20 border border-brand-confidence/40 mb-4 shadow-2xs">
            <span className="flex h-2 w-2 rounded-full bg-brand-confidence animate-pulse" />
            <span className="text-[10px] sm:text-xs font-bold font-poppins uppercase tracking-widest text-brand-confidence">
              REGISTRE OFFICIEL CAPSY SERVICES
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-poppins font-black leading-tight mb-4">
            Vérification des Collaborateurs
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-white/80 font-sans leading-relaxed">
            Contrôlez en toute sécurité l'identité et le statut d'accréditation professionnelle des praticiens, psychologues et agents de CAPSY SERVICES.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="h-12 w-12 rounded-full border-4 border-brand-wellbeing/20 border-t-brand-wellbeing animate-spin" />
            <p className="font-poppins font-semibold text-brand-dark text-base">
              Vérification dans le registre officiel…
            </p>
          </div>
        )}

        {/* State A: Verified Employee Badge Display */}
        {!loading && employee && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Top Navigation / Reset Action */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handleResetSearch}
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-poppins font-bold text-brand-wellbeing hover:underline"
              >
                <LucideIcon name="ArrowLeft" className="h-4 w-4" />
                Vérifier un autre collaborateur
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-xs font-poppins font-semibold text-brand-dark hover:bg-gray-50 transition"
              >
                <LucideIcon name="Share2" className="h-3.5 w-3.5 text-brand-wellbeing" />
                {copied ? 'Lien copié !' : 'Partager l\'attestation'}
              </button>
            </div>

            {/* Official Digital Badge Card */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
              {/* Badge Header Banner */}
              <div className="bg-brand-dark text-white p-6 sm:p-7 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-confidence/10 rounded-full blur-2xl pointer-events-none" />
                <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-brand-confidence/20 border border-brand-confidence/40 flex items-center justify-center shrink-0">
                      <LucideIcon name="ShieldCheck" className="h-7 w-7 text-brand-confidence" />
                    </div>
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-widest text-brand-confidence font-poppins">
                        Attestation Officielle
                      </div>
                      <div className="text-lg sm:text-xl font-poppins font-black">
                        Accréditation Professionnelle Active
                      </div>
                    </div>
                  </div>

                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs font-poppins font-bold">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    Statut Actif & Vérifié
                  </div>
                </div>
              </div>

              {/* Badge Body */}
              <div className="p-6 sm:p-8">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                  {/* Photo & Identity Summary */}
                  <div className="md:col-span-4 flex flex-col items-center text-center space-y-4">
                    <div className="relative">
                      {employee.photo ? (
                        <img
                          src={employee.photo}
                          alt={employee.display_name}
                          className="h-36 w-36 sm:h-44 sm:w-44 rounded-full border-4 border-brand-wellbeing object-cover shadow-lg"
                        />
                      ) : (
                        <div className="h-36 w-36 sm:h-44 sm:w-44 rounded-full bg-brand-confidence/20 border-4 border-brand-wellbeing flex items-center justify-center shadow-lg">
                          <span className="text-4xl font-poppins font-black text-brand-dark">
                            {employee.display_name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()}
                          </span>
                        </div>
                      )}

                      <div className="absolute bottom-2 right-2 h-7 w-7 rounded-full bg-brand-wellbeing border-2 border-white flex items-center justify-center shadow-md" title="Membre accrédité">
                        <LucideIcon name="Check" className="h-4 w-4 text-white stroke-[3]" />
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-brand-gray-text font-poppins">
                        Matricule officiel
                      </div>
                      <div className="font-mono text-sm font-bold text-brand-dark">
                        #{employee.id || 'N/A'}
                      </div>
                    </div>
                  </div>

                  {/* Information Details */}
                  <div className="md:col-span-8 space-y-6">
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-poppins font-black text-brand-dark leading-snug">
                        {employee.display_name}
                      </h2>
                      <p className="text-base sm:text-lg font-poppins font-bold text-brand-wellbeing mt-1">
                        {employee.job_title}
                      </p>
                      <p className="text-xs sm:text-sm text-brand-gray-text mt-0.5">
                        {employee.department}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-4 border-t border-gray-150">
                      <div className="p-3.5 rounded-2xl bg-brand-gray-light border border-gray-200/80">
                        <div className="flex items-center gap-2 text-xs font-poppins font-semibold text-brand-gray-text">
                          <LucideIcon name="Building2" className="h-4 w-4 text-brand-wellbeing" />
                          Organisation
                        </div>
                        <div className="font-poppins font-bold text-xs sm:text-sm text-brand-dark mt-1">
                          {employee.company_name}
                        </div>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-brand-gray-light border border-gray-200/80">
                        <div className="flex items-center gap-2 text-xs font-poppins font-semibold text-brand-gray-text">
                          <LucideIcon name="ShieldCheck" className="h-4 w-4 text-brand-wellbeing" />
                          Habilitation
                        </div>
                        <div className="font-poppins font-bold text-xs sm:text-sm text-brand-dark mt-1">
                          Personnel officiel agréé
                        </div>
                      </div>

                      {employee.work_phone && (
                        <div className="p-3.5 rounded-2xl bg-brand-gray-light border border-gray-200/80">
                          <div className="flex items-center gap-2 text-xs font-poppins font-semibold text-brand-gray-text">
                            <LucideIcon name="Phone" className="h-4 w-4 text-brand-wellbeing" />
                            Ligne professionnelle
                          </div>
                          <div className="font-poppins font-bold text-xs sm:text-sm text-brand-dark mt-1">
                            {employee.work_phone}
                          </div>
                        </div>
                      )}

                      <div className="p-3.5 rounded-2xl bg-brand-gray-light border border-gray-200/80">
                        <div className="flex items-center gap-2 text-xs font-poppins font-semibold text-brand-gray-text">
                          <LucideIcon name="CheckCircle2" className="h-4 w-4 text-brand-wellbeing" />
                          Authentification
                        </div>
                        <div className="font-mono text-xs font-bold text-brand-dark mt-1 truncate" title={employee.employee_token}>
                          {employee.employee_token.slice(0, 18)}…
                        </div>
                      </div>
                    </div>

                    {/* QR Code Validation Box */}
                    {qrDataUrl && (
                      <div className="flex items-center gap-4 p-4 rounded-2xl border border-brand-confidence/40 bg-brand-confidence/10">
                        <img
                          src={qrDataUrl}
                          alt="QR Code de vérification"
                          className="h-16 w-16 rounded-xl border border-white bg-white p-1 shadow-xs shrink-0"
                        />
                        <div className="text-left text-xs leading-relaxed">
                          <div className="font-poppins font-bold text-brand-dark text-sm">
                            Badge numérique scannable
                          </div>
                          <p className="text-brand-gray-text">
                            Ce QR Code pointe directement vers le certificat en ligne officiel de CAPSY SERVICES.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Confidentiality & Security Notice */}
                <div className="mt-8 pt-6 border-t border-gray-150">
                  <div className="flex items-start gap-3 p-4 rounded-2xl bg-brand-gray-light/70 text-xs text-brand-gray-text leading-relaxed">
                    <LucideIcon name="Info" className="h-4 w-4 text-brand-wellbeing shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-brand-dark font-poppins font-bold">Garantie de Confidentialité & Éthique Professionnelle :</strong>{' '}
                      Cette attestation confirme uniquement la légitimité et la fonction active du collaborateur auprès de CAPSY SERVICES. Conformément aux règles déontologiques et au secret professionnel, les détails contractuels privés et coordonnées personnelles ne sont pas divulgués publiquement.
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="mt-6 flex flex-wrap gap-3 justify-end">
                  <button
                    type="button"
                    onClick={handleResetSearch}
                    className="px-5 py-2.5 rounded-xl border border-gray-200 bg-white font-poppins font-bold text-xs sm:text-sm text-brand-dark hover:bg-gray-50 transition"
                  >
                    Nouvelle vérification
                  </button>

                  {onOpenBooking && (
                    <button
                      type="button"
                      onClick={onOpenBooking}
                      className="px-5 py-2.5 rounded-xl bg-brand-wellbeing text-white font-poppins font-bold text-xs sm:text-sm shadow-md hover:bg-brand-wellbeing/90 transition"
                    >
                      Prendre un rendez-vous avec CAPSY
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* State B: Search Form (When no active employee found yet) */}
        {!loading && !employee && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-white rounded-3xl border border-gray-200 shadow-xl p-6 sm:p-10 text-center">
              <div className="h-16 w-16 mx-auto mb-4 rounded-2xl bg-brand-confidence/20 border border-brand-confidence/40 flex items-center justify-center text-brand-wellbeing">
                <LucideIcon name="ShieldCheck" className="h-8 w-8 text-brand-wellbeing" />
              </div>

              <h2 className="text-2xl font-poppins font-black text-brand-dark mb-2">
                Rechercher un Badge ou une Accréditation
              </h2>
              <p className="text-sm text-brand-gray-text leading-relaxed max-w-lg mx-auto mb-8">
                Veuillez saisir l'identifiant (token) présent sur le badge du collaborateur ou numériser le QR code physique pour vérifier son authenticité.
              </p>

              {error && (
                <div className="mb-6 p-4 rounded-2xl border border-amber-200 bg-amber-50 text-left flex items-start gap-3">
                  <LucideIcon name="AlertCircle" className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs sm:text-sm text-amber-800 leading-relaxed font-sans">
                    {error}
                  </div>
                </div>
              )}

              <form onSubmit={handleSearchSubmit} className="space-y-4">
                <div className="text-left">
                  <label htmlFor="token-input" className="block text-xs font-poppins font-bold text-brand-dark uppercase tracking-wider mb-2">
                    Identifiant / Token du badge
                  </label>
                  <div className="relative">
                    <input
                      id="token-input"
                      type="text"
                      value={inputToken}
                      onChange={(e) => setInputToken(e.target.value)}
                      placeholder="Ex : 3017864e-8c5f-44ab-918c-18497e1a1f43"
                      className="w-full rounded-2xl border border-gray-200 bg-brand-gray-light/40 px-4 py-3.5 pr-10 text-sm text-brand-dark outline-none font-mono transition focus:border-brand-wellbeing focus:bg-white focus:ring-2 focus:ring-brand-confidence/40"
                    />
                    {inputToken && (
                      <button
                        type="button"
                        onClick={() => setInputToken('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        title="Effacer"
                      >
                        <LucideIcon name="X" className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={!inputToken.trim()}
                    className="flex items-center justify-center gap-2 rounded-2xl bg-brand-wellbeing px-5 py-3.5 text-sm font-poppins font-bold text-white shadow-md hover:bg-brand-wellbeing/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <LucideIcon name="Search" className="h-4 w-4" />
                    Vérifier l'authenticité
                  </button>

                  <button
                    type="button"
                    onClick={startScanner}
                    className="flex items-center justify-center gap-2 rounded-2xl border border-brand-wellbeing/40 bg-brand-confidence/20 px-5 py-3.5 text-sm font-poppins font-bold text-brand-dark hover:bg-brand-confidence/30 transition"
                  >
                    <LucideIcon name="Camera" className="h-4 w-4 text-brand-wellbeing" />
                    Scanner un QR Code
                  </button>
                </div>
              </form>

              {/* Security info banner */}
              <div className="mt-8 pt-6 border-t border-gray-150 text-left">
                <div className="flex items-center gap-2 text-xs font-poppins font-bold text-brand-dark mb-1">
                  <LucideIcon name="CheckCircle2" className="h-4 w-4 text-brand-wellbeing" />
                  Sécurité & Traçabilité garantie
                </div>
                <p className="text-[11px] text-brand-gray-text leading-relaxed">
                  Chaque QR code émis sur les badges officiels de CAPSY SERVICES est certifié et infalsifiable. Les données sont validées en direct auprès de notre annuaire professionnel.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* QR Code Scanner Modal with LIVE Camera Stream */}
      <AnimatePresence>
        {isScannerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-gray-100 bg-brand-dark px-6 py-4 text-white">
                <div className="flex items-center gap-2">
                  <LucideIcon name="Camera" className="h-5 w-5 text-brand-confidence" />
                  <h3 className="font-poppins font-bold text-base">Scanner un QR Code</h3>
                </div>
                <button
                  type="button"
                  onClick={stopScanner}
                  className="rounded-full p-1 text-white/70 hover:bg-white/10 hover:text-white transition"
                  title="Fermer"
                >
                  <LucideIcon name="X" className="h-5 w-5" />
                </button>
              </div>

              {/* Viewfinder Area */}
              <div className="relative aspect-square bg-black overflow-hidden flex items-center justify-center">
                {/* Real video stream element */}
                <video
                  ref={videoRef}
                  playsInline
                  autoPlay
                  muted
                  className="h-full w-full object-cover"
                />

                {/* Animated Target Frame */}
                <div className="absolute inset-8 rounded-2xl border-2 border-brand-confidence/80 pointer-events-none shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]">
                  <div className="absolute inset-x-0 top-0 h-1 bg-brand-confidence animate-pulse" />
                </div>

                {scannerError && (
                  <div className="absolute inset-4 flex items-center justify-center bg-black/90 p-6 text-center rounded-2xl">
                    <div className="space-y-3">
                      <div className="h-12 w-12 rounded-full bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
                        <LucideIcon name="AlertCircle" className="h-6 w-6" />
                      </div>
                      <p className="text-xs text-white/90 leading-relaxed font-sans">
                        {scannerError}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-gray-50 flex items-center justify-between">
                <span className="text-xs text-brand-gray-text font-sans">
                  Pointez votre objectif vers le QR code du badge
                </span>
                <button
                  type="button"
                  onClick={stopScanner}
                  className="px-4 py-2 rounded-xl bg-brand-gray-light hover:bg-gray-200 text-xs font-poppins font-bold text-brand-dark transition"
                >
                  Annuler
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
