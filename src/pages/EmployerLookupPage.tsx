import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import QRCode from 'qrcode';
import fallbackEmployees from '../../employers_1793711702018.json';
import Logo from '../components/Logo';

const PUBLIC_BASE_URL = 'https://www.capsy-rdc.org';

const EMPLOYEE_FIELDS = [
  'id',
  'display_name',
  'employee_token',
  'photo',
  'contract_date_start',
  'contract_date_end',
  'resource_calendar_id',
  'country_id',
  'work_phone',
  'country_code',
  'lang',
  'contract_type_id',
  'department_id',
  'job_title',
  'private_state_id',
  'hours_per_week',
  'hr_presence_state',
  'hr_icon_display',
  'tz'
];

const FRENCH_LABELS: Record<string, string> = {
  employee_token: 'Jeton employé',
  display_name: 'Nom complet',
  id: 'Identifiant',
  photo: 'Photo',
  contract_date_start: 'Date de début du contrat',
  contract_date_end: 'Date de fin du contrat',
  resource_calendar_id: 'Calendrier',
  country_id: 'Pays',
  work_phone: 'Téléphone professionnel',
  country_code: 'Code pays',
  language: 'Langue',
  contract_type_id: 'Type de contrat',
  department_id: 'Département',
  job_title: 'Fonction',
  private_state_id: 'Province / État',
  hours_per_week: 'Heures par semaine',
  hr_presence_state: 'Présence RH',
  hr_icon_display: 'Icône présence',
  time_zone: 'Fuseau horaire'
};

const pick = (value: any) => {
  if (Array.isArray(value)) return value[1] ?? value[0] ?? '';
  if (value === false || value === null || typeof value === 'undefined') return '';
  return String(value);
};

const normalizeRecord = (record: any) => {
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

  return {
    id: raw.id ?? '',
    employee_token: raw.employee_token ?? '',
    display_name: raw.display_name ?? raw.name ?? '',
    photo: imageSources[0] ?? '',
    contract_date_start: raw.contract_date_start ?? '',
    contract_date_end: raw.contract_date_end ?? '',
    resource_calendar_id: pick(raw.resource_calendar_id),
    country_id: pick(raw.country_id),
    work_phone: raw.work_phone ?? '',
    country_code: raw.country_code ?? '',
    language: raw.lang ?? raw.language ?? '',
    contract_type_id: pick(raw.contract_type_id),
    department_id: pick(raw.department_id),
    job_title: raw.job_title ?? '',
    private_state_id: pick(raw.private_state_id),
    hours_per_week: raw.hours_per_week ?? '',
    hr_presence_state: raw.hr_presence_state ?? '',
    hr_icon_display: raw.hr_icon_display ?? '',
    time_zone: raw.tz ?? raw.time_zone ?? '',
  };
};

const formatDisplay = (value: string | number | undefined) => {
  if (value === undefined || value === null || value === '') return '—';
  if (typeof value === 'number') return String(value);
  return value;
};

export default function EmployerLookupPage({ token: initialToken = '' }: { token?: string }) {
  const [token, setToken] = useState(initialToken || '');
  const [employee, setEmployee] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const publicUrl = useMemo(() => {
    const cleanToken = token.trim();
    if (!cleanToken) return '';
    return `${PUBLIC_BASE_URL}/employers/${encodeURIComponent(cleanToken)}`;
  }, [token]);

  useEffect(() => {
    const routeToken = (initialToken || '').trim();
    if (!routeToken) {
      setToken('');
      setEmployee(null);
      setQrDataUrl('');
      setError('');
      setIsModalOpen(false);
      return;
    }

    setToken(routeToken);
    void lookupEmployee(routeToken);
  }, [initialToken]);

  const lookupEmployee = async (rawToken: string) => {
    const cleanToken = rawToken.trim();
    if (!cleanToken) {
      setEmployee(null);
      setQrDataUrl('');
      setError('');
      setIsModalOpen(false);
      return;
    }

    const queryUrl = `${PUBLIC_BASE_URL}/employers/${encodeURIComponent(cleanToken)}`;
    let cancelled = false;

    setLoading(true);
    setError('');
    setEmployee(null);
    setQrDataUrl('');
    setIsModalOpen(false);

    try {
      const response = await fetch('/api/odoo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'search_read',
          params: {
            model: 'hr.employee',
            domain: [['employee_token', '=', cleanToken]],
            fields: EMPLOYEE_FIELDS,
            limit: 1,
            order: 'id asc'
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Odoo inaccessible (${response.status})`);
      }

      const json = await response.json();
      if (json?.error) {
        throw new Error(String(json.error));
      }

      const records = Array.isArray(json?.results) ? json.results : Array.isArray(json) ? json : [];
      let match = records[0] ?? null;

      if (!match) {
        const localMatch = (fallbackEmployees as any[]).find((item: any) => {
          const raw = item?.data ?? item ?? {};
          return String(raw.employee_token || '').toLowerCase() === cleanToken.toLowerCase();
        });
        match = localMatch ?? null;
      }

      if (!match) {
        setError('Aucun employé n\'a été trouvé pour cet identifiant. Veuillez vérifier le code ou réessayer plus tard. Nous nous excusons pour la gêne occasionnée.');
        setEmployee(null);
        setQrDataUrl('');
        setIsModalOpen(true);
        return;
      }

      const found = normalizeRecord(match);
      let nextQrDataUrl = '';

      try {
        nextQrDataUrl = await QRCode.toDataURL(queryUrl, {
          width: 220,
          margin: 1,
          errorCorrectionLevel: 'M',
          color: { dark: '#003600', light: '#FFFFFF' }
        });
      } catch {
        nextQrDataUrl = '';
      }

      if (cancelled) return;
      setEmployee(found);
      setQrDataUrl(nextQrDataUrl);
      setIsModalOpen(true);
    } catch (err: any) {
      const fallbackMatch = (fallbackEmployees as any[]).find((item: any) => {
        const raw = item?.data ?? item ?? {};
        return String(raw.employee_token || '').toLowerCase() === cleanToken.toLowerCase();
      });

      if (fallbackMatch) {
        const employeeData = normalizeRecord(fallbackMatch);
        let nextQrDataUrl = '';

        try {
          nextQrDataUrl = await QRCode.toDataURL(queryUrl, {
            width: 220,
            margin: 1,
            errorCorrectionLevel: 'M',
            color: { dark: '#003600', light: '#FFFFFF' }
          });
        } catch {
          nextQrDataUrl = '';
        }

        if (!cancelled) {
          setEmployee(employeeData);
          setQrDataUrl(nextQrDataUrl);
          setIsModalOpen(true);
        }
        return;
      }

      if (!cancelled) {
        setEmployee(null);
        setQrDataUrl('');
        setError('Aucun employé n\'a été trouvé pour cet identifiant. Veuillez vérifier le code ou réessayer plus tard. Nous nous excusons pour la gêne occasionnée.');
        setIsModalOpen(true);
      }
    } finally {
      if (!cancelled) setLoading(false);
    }

    return () => {
      cancelled = true;
    };
  };

  useEffect(() => {
    if (!token.trim()) {
      setEmployee(null);
      setQrDataUrl('');
      setError('');
      setIsModalOpen(false);
      return;
    }
  }, [token]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const cleanToken = token.trim();
    if (!cleanToken) return;
    void lookupEmployee(cleanToken);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const cleanToken = token.trim();
      if (!cleanToken) return;
      void lookupEmployee(cleanToken);
    }
  };

  const handleScanQr = async () => {
    if (!('BarcodeDetector' in window) || !navigator.mediaDevices?.getUserMedia) {
      setError('Le scan QR n\'est pas supporté sur ce navigateur.');
      setEmployee(null);
      setIsModalOpen(true);
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

      const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
      const tick = async () => {
        try {
          if (!videoRef.current || !videoRef.current.videoWidth) {
            requestAnimationFrame(tick);
            return;
          }
          const codes = await detector.detect(videoRef.current);
          if (codes && codes.length > 0) {
            const text = codes[0].rawValue || '';
            const match = text.match(/\/employers\/([^/?#]+)/i);
            const foundToken = match ? decodeURIComponent(match[1]) : text;
            if (foundToken) {
              const cleanToken = foundToken.trim();
              setToken(cleanToken);
              setError('');
              setIsModalOpen(false);
              if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop());
                streamRef.current = null;
              }
              void lookupEmployee(cleanToken);
              return;
            }
          }
          requestAnimationFrame(tick);
        } catch {
          requestAnimationFrame(tick);
        }
      };

      requestAnimationFrame(tick);
    } catch (err: any) {
      setError(err?.message || 'Impossible d’ouvrir le scanner QR.');
      setEmployee(null);
      setIsModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0eee8] text-[#003600] flex items-center justify-center p-4">
      <div className="w-full max-w-xl rounded-[28px] border border-[#dde6df] bg-[#f7f7f5] p-4 shadow-[0_22px_60px_rgba(0,54,0,0.08)]">
        <div className="mb-5 flex justify-center">
          <Logo size="md" className="mx-auto" />
        </div>

        <div className="mb-5 text-center">
          <div className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#4b6a5a]">CAPSY Services</div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-2">
            <input
              value={token}
              onChange={(e) => setToken(e.target.value)}
              onKeyDown={handleInputKeyDown}
              placeholder="employee_token"
              className="flex-1 rounded-xl border border-[#d5e0d8] bg-white px-3 py-3 text-sm text-[#003600] outline-none transition focus:border-[#008738]"
            />
            <button
              type="submit"
              disabled={!token.trim() || loading}
              className="rounded-xl bg-[#008738] px-4 py-3 text-sm font-semibold text-white hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Envoyer
            </button>
          </div>

          <button
            type="button"
            onClick={handleScanQr}
            className="w-full rounded-xl border border-[#0a8c4a] bg-[#ecf9f1] px-4 py-3 text-sm font-semibold text-[#0a7f3d] hover:bg-[#e2f6e9]"
          >
            Scanner un QR Code
          </button>
        </form>

        {loading && (
          <div className="mt-5 rounded-xl border border-[#dfe9e2] bg-[#f8faf8] p-3 text-center text-sm text-[#5d7262]">
            Recherche en cours…
          </div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 24 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="relative w-full max-w-4xl overflow-hidden rounded-[28px] border border-[#dfe9e2] bg-white shadow-[0_28px_70px_rgba(0,54,0,0.18)]"
            >
              <div className={`flex items-center gap-3 border-b px-5 py-4 ${error ? 'border-rose-200 bg-rose-50' : 'border-[#dfe9e2] bg-[#f3faf5]'}`}>
                <div className={`flex h-11 w-11 items-center justify-center rounded-full text-xl font-bold ${error ? 'bg-rose-100 text-rose-600' : 'bg-[#dff5e5] text-[#0a7f3d]'}`}>
                  {error ? '!' : '✓'}
                </div>
                <div className="text-left">
                  <div className={`text-lg font-bold ${error ? 'text-rose-700' : 'text-[#0a7f3d]'}`}>
                    {error === 'Le scan QR n\'est pas supporté sur ce navigateur.' ? 'Scanner QR indisponible' : error ? 'Employé introuvable' : 'Profil employé trouvé'}
                  </div>
                  <div className={`text-xs ${error ? 'text-rose-600' : 'text-[#567061]'}`}>
                    {error === 'Le scan QR n\'est pas supporté sur ce navigateur.' ? 'Utilisez le champ de saisie pour retrouver l\'employé.' : error ? 'Vérifiez le token ou réessayez plus tard.' : 'Informations validées et disponibles.'}
                  </div>
                </div>
              </div>

              <div className="p-5">
                {error ? (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-center text-sm leading-relaxed text-rose-700">
                    {error}
                  </div>
                ) : employee ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 rounded-2xl bg-[#f7faf8] p-3">
                      {employee.photo ? (
                        <img src={employee.photo} alt={employee.display_name} className="h-14 w-14 rounded-full border border-[#dfe9e2] object-cover" />
                      ) : (
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#dff5e5] text-sm font-bold text-[#0a7f3d]">
                          {(employee.display_name?.split(' ').slice(0, 2).map((part: string) => part[0]).join('').toUpperCase() || 'EM')}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="truncate font-semibold text-[#003600]">{formatDisplay(employee.display_name)}</div>
                        <div className="text-xs text-[#5f7665]">#{formatDisplay(employee.id)}</div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-[#edf1ee] bg-white p-3">
                      <div className="space-y-2">
                        {[
                          ['job_title', employee.job_title],
                          ['private_state_id', employee.private_state_id],
                          ['contract_type_id', employee.contract_type_id],
                          ['work_phone', employee.work_phone],
                          ['contract_date_start', employee.contract_date_start],
                          ['contract_date_end', employee.contract_date_end]
                        ].map(([key, value]) => (
                          <div key={String(key)} className="grid grid-cols-[150px_1fr] gap-2 border-b border-[#f0f3f1] pb-2 last:border-b-0 last:pb-0">
                            <div className="text-sm text-[#5f7665]">{FRENCH_LABELS[String(key)] || String(key).replace(/_/g, ' ')}</div>
                            <div className="break-all text-sm font-medium text-[#003600]">{formatDisplay(value as any)}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="flex justify-end border-t border-[#edf1ee] bg-[#fbfcfb] px-5 py-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl bg-[#008738] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-95"
                >
                  Fermer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
