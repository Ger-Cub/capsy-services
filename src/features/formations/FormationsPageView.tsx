import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import LucideIcon from '../../components/LucideIcon';
import PageHero from '../../components/PageHero';
import QRCode from 'qrcode';
import logoFull from '../../assets/images/logo-full-brand.png';
import { FORMATIONS } from '../../data/formationsData';
import type { Formation, Participant } from './types';

// Load certificate image and PDF assets (Vite import)
const certImages = import.meta.glob('../../assets/images/*.png', { eager: true, as: 'url' }) as Record<string, string>;
const certPdfs = import.meta.glob('../../assets/documents/certificats/*.pdf', { eager: true, as: 'url' }) as Record<string, string>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getVerifUrl(certifId: string) {
    const base = typeof window !== 'undefined' ? window.location.origin : 'https://capsy-services.vercel.app';
    return `${base}/formations/certificat/${certifId}`;
}

function useQrCode(url: string) {
    const [dataUrl, setDataUrl] = useState('');
    useEffect(() => {
        if (!url) return;
        QRCode.toDataURL(url, {
            width: 120,
            margin: 1,
            color: { dark: '#003600', light: '#ffffff' },
        }).then(setDataUrl);
    }, [url]);
    return dataUrl;
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status, variant = 'default' }: { status: Formation['status']; variant?: 'default' | 'header' }) {
    const map = {
        passée: {
            label: 'Terminée',
            cls: variant === 'header' ? 'bg-white/20 text-white border-white/30' : 'bg-slate-100 text-slate-600 border-slate-200',
        },
        en_cours: {
            label: 'En cours',
            cls: variant === 'header' ? 'bg-amber-400/25 text-amber-100 border-amber-300/40' : 'bg-amber-50 text-amber-700 border-amber-200',
        },
        à_venir: {
            label: 'À venir',
            cls: variant === 'header' ? 'bg-brand-confidence/30 text-white border-brand-confidence/50' : 'bg-brand-confidence/20 text-brand-dark border-brand-confidence/40',
        },
    };
    const { label, cls } = map[status];
    return (
        <span className={`text-[10px] font-bold font-poppins uppercase tracking-widest px-2.5 py-1 rounded-full border ${cls}`}>
            {label}
        </span>
    );
}

// ─── Certificate Modal ────────────────────────────────────────────────────────

function CertificateModal({
    formation,
    participant,
    onClose,
}: {
    formation: Formation;
    participant: Participant;
    onClose: () => void;
}) {
    const verifUrl = getVerifUrl(participant.id);
    const qrDataUrl = useQrCode(verifUrl);
    const certRef = useRef<HTMLDivElement>(null);

    // print action removed — printing removed from modal UI

    const certifNum = participant.id;
    const dateStr = formation.dateRange.split(' - ').slice(-1)[0] || formation.dateRange;

    // determine available certificate assets
    const [downloadFormat, setDownloadFormat] = useState<'png' | 'pdf'>('png');
    const pngEntry = Object.entries(certImages).find(([p]) => p.includes(participant.id));
    const pngUrl = pngEntry ? pngEntry[1] : undefined;
    const pdfEntry = Object.entries(certPdfs).find(([p]) => p.includes(participant.id));
    const pdfUrl = pdfEntry ? pdfEntry[1] : undefined;

    const handleDownload = async () => {
        const url = downloadFormat === 'png' ? pngUrl : pdfUrl;
        if (!url) {
            alert('Fichier non disponible');
            return;
        }
        try {
            const res = await fetch(url);
            if (!res.ok) {
                // fallback: open in new tab if fetch fails
                window.open(url, '_blank');
                return;
            }
            const blob = await res.blob();
            const ext = downloadFormat === 'png' ? 'png' : 'pdf';
            const filename = `${participant.id}.${ext}`;
            const blobUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(blobUrl);
        } catch (err) {
            console.error('Download failed', err);
            // final fallback: open in new tab
            window.open(url, '_blank');
        }
    };

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 20 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-y-auto"
            >
                {/* Modal toolbar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
                    <div className="w-full sm:w-auto">
                        <p className="font-poppins font-bold text-brand-dark text-sm">Certificat de réussite</p>
                        <p className="text-xs text-brand-gray-text truncate">{participant.name}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto mt-3 sm:mt-0 justify-end">
                        <select
                            value={downloadFormat}
                            onChange={(e) => setDownloadFormat(e.target.value as 'png' | 'pdf')}
                            className="text-sm px-3 py-2 border rounded-lg bg-white w-full sm:w-auto"
                        >
                            <option value="png">Image (PNG)</option>
                            <option value="pdf">Document (PDF)</option>
                        </select>

                        <button
                            onClick={handleDownload}
                            className="flex items-center gap-1.5 px-4 py-2 bg-brand-confidence text-brand-dark rounded-xl text-xs font-bold font-poppins hover:bg-brand-confidence/90 transition-all no-print w-full sm:w-auto justify-center"
                        >
                            <LucideIcon name="Download" className="h-3.5 w-3.5 text-brand-dark" />
                            Télécharger
                        </button>

                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl hover:bg-gray-100 transition-all no-print"
                        >
                            <LucideIcon name="X" className="h-5 w-5 text-gray-500" />
                        </button>
                    </div>
                </div>

                {/* Certificate body */}
                <div className="p-6 sm:p-10 print:p-0">
                    <div ref={certRef} className="certificate-paper relative bg-white w-full aspect-[1.414/1] border-[12px] border-brand-wellbeing rounded-lg overflow-hidden shadow-xl print:shadow-none print:border-[8px] select-none" style={{ fontFamily: 'serif' }}>
                        {pngUrl ? (
                            <div className="w-full h-full overflow-hidden">
                                <img
                                    src={pngUrl}
                                    alt={`Certificat ${participant.name}`}
                                    className="w-full h-full object-cover block"
                                />
                            </div>
                        ) : (
                            <>
                                {/* Green left decorative stripe */}
                                <div className="absolute left-0 top-0 h-full w-12 bg-gradient-to-b from-brand-dark via-brand-darkgreen to-brand-confidence opacity-90" />

                                {/* Content area */}
                                <div className="absolute inset-0 left-12 flex flex-col px-4 sm:px-8 py-3 sm:py-5 text-brand-dark">
                                    {/* Header row */}
                                    <div className="flex items-start justify-between mb-2">
                                        {/* Logos placeholder */}
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 sm:h-14 sm:w-14 rounded-full bg-brand-wellbeing/10 border-2 border-brand-wellbeing flex items-center justify-center shrink-0">
                                                <svg viewBox="0 0 40 40" className="h-7 w-7 sm:h-9 sm:w-9 fill-brand-wellbeing">
                                                    <circle cx="20" cy="20" r="18" fill="none" stroke="#008738" strokeWidth="2" />
                                                    <text x="50%" y="55%" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#008738">STAR</text>
                                                </svg>
                                            </div>
                                            <div className="h-10 sm:h-14 px-2 py-1 border border-brand-wellbeing rounded flex items-center">
                                                <span className="font-poppins font-black text-brand-wellbeing text-[10px] sm:text-xs tracking-tight leading-tight">HEAL<br />AFRICA</span>
                                            </div>
                                            <div className="h-10 sm:h-14 px-2 py-1 border border-brand-wellbeing rounded flex flex-col items-center justify-center">
                                                <span className="font-poppins font-black text-brand-wellbeing text-[9px] sm:text-[11px] tracking-tight">CAPSY</span>
                                                <span className="font-poppins text-brand-dark text-[7px] sm:text-[9px] tracking-tight">SERVICES</span>
                                            </div>
                                        </div>

                                        {/* Cert info */}
                                        <div className="text-right text-[8px] sm:text-[10px] space-y-0.5 leading-tight shrink-0">
                                            <p><strong>Certificat N° :</strong> {certifNum}</p>
                                            <p><strong>Durée :</strong> {formation.duration}</p>
                                            <p><strong>Date :</strong> {formation.dateRange}</p>
                                            <a href="https://www.capsy-rdc.org" className="text-brand-wellbeing underline">www.capsy-rdc.org</a>
                                        </div>
                                    </div>

                                    {/* Title */}
                                    <div className="text-center mb-1.5 sm:mb-2">
                                        <p className="font-poppins text-brand-wellbeing text-[11px] sm:text-sm italic" style={{ fontFamily: 'Georgia, serif' }}>
                                            Certificat de réussite
                                        </p>
                                        <p className="font-poppins font-black text-brand-dark text-[9px] sm:text-xs uppercase tracking-wider">
                                            {formation.title}
                                        </p>
                                        <p className="text-[8px] sm:text-[10px] text-brand-gray-text mt-0.5">Décerné à</p>
                                    </div>

                                    {/* Participant name */}
                                    <div className="text-center mb-1.5">
                                        <p className="text-brand-wellbeing text-[14px] sm:text-xl font-bold italic" style={{ fontFamily: 'Georgia, serif' }}>
                                            {participant.name}
                                        </p>
                                        <div className="h-px bg-brand-wellbeing/30 mx-auto w-2/3 my-1" />
                                        <p className="text-[8px] sm:text-[10px] text-brand-gray-text">{participant.title}</p>
                                    </div>

                                    {/* Body text */}
                                    <div className="text-[7px] sm:text-[9px] text-brand-dark leading-relaxed mb-1.5 space-y-1">
                                        <p>
                                            Qui a satisfait avec succès aux exigences de la formation intensive organisée par le Centre d'Assistance Psychologique, CAPSY SARL, en partenariat avec HEAL AFRICA/STAR-RDC.
                                        </p>
                                        <p>Au cours de cette formation, le participant a développé les compétences nécessaires pour :</p>
                                        <ul className="list-none pl-2 space-y-0.5">
                                            {formation.competences.map((c, i) => (
                                                <li key={i}>• {c} ;</li>
                                            ))}
                                        </ul>
                                        <p>
                                            La formation a été validée au moyen d'un pré-test, d'un post-test, d'exercices pratiques, de jeux de rôle supervisés et d'une évaluation finale des compétences.
                                        </p>
                                        <p className="text-center font-semibold mt-1">Fait à {formation.location.split(',')[0]}, le {dateStr}</p>
                                    </div>

                                    {/* Signatures */}
                                    <div className="flex items-end justify-between mt-auto">
                                        <div className="flex gap-3 sm:gap-6 flex-wrap">
                                            {formation.signataires.map((s, i) => (
                                                <div key={i} className="text-center">
                                                    <div className="h-4 sm:h-6 border-b border-brand-dark/50 mb-0.5" />
                                                    <p className="font-bold text-[7px] sm:text-[8px] text-brand-dark">{s.name}</p>
                                                    <p className="text-[6px] sm:text-[7px] text-brand-gray-text">{s.role}</p>
                                                </div>
                                            ))}
                                        </div>

                                        {/* QR Code */}
                                        <div className="shrink-0">
                                            {qrDataUrl ? (
                                                <img src={qrDataUrl} alt="QR Code vérification" className="h-12 w-12 sm:h-16 sm:w-16" />
                                            ) : (
                                                <div className="h-12 w-12 sm:h-16 sm:w-16 bg-gray-100 flex items-center justify-center rounded">
                                                    <LucideIcon name="QrCode" className="h-6 w-6 text-gray-300" />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Footer note */}
                                    <p className="text-[5px] sm:text-[7px] text-brand-gray-text text-center mt-1 italic">
                                        Cette certification atteste uniquement de la réussite de la formation et ne constitue pas une autorisation d'exercice professionnel indépendante.
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

// ─── Certificate Verification View ───────────────────────────────────────────

function CertificateVerificationView({ certifId }: { certifId: string }) {
    // Find the participant
    let foundFormation: Formation | null = null;
    let foundParticipant: Participant | null = null;

    for (const f of FORMATIONS) {
        const p = f.participants.find((p) => p.id === certifId);
        if (p) {
            foundFormation = f;
            foundParticipant = p;
            break;
        }
    }

    const verifUrl = getVerifUrl(certifId);
    const qrDataUrl = useQrCode(verifUrl);
    const [showCert, setShowCert] = useState(false);

    if (!foundFormation || !foundParticipant) {
        return (
            <div className="min-h-screen bg-brand-gray-light flex items-center justify-center p-6">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                    <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <LucideIcon name="AlertCircle" className="h-8 w-8 text-red-500" />
                    </div>
                    <h2 className="font-poppins font-bold text-xl text-brand-dark mb-2">Certificat introuvable</h2>
                    <p className="text-brand-gray-text text-sm mb-4">
                        Le certificat avec l'identifiant <strong>{certifId}</strong> n'a pas été trouvé dans notre base de données.
                    </p>
                    <a href="/formations" className="inline-flex items-center gap-2 px-4 py-2 bg-brand-wellbeing text-white rounded-xl text-sm font-bold font-poppins hover:bg-brand-wellbeing/90 transition-all">
                        <LucideIcon name="ArrowLeft" className="h-4 w-4" />
                        Retour aux formations
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-brand-dark via-brand-dark to-brand-darkgreen flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
                {/* Header */}
                <div className="bg-brand-dark p-6 text-white text-center border-b border-white/10">
                    <div className="h-16 w-16 bg-brand-confidence/20 border border-brand-confidence/40 rounded-full flex items-center justify-center mx-auto mb-3">
                        <LucideIcon name="ShieldCheck" className="h-8 w-8 text-brand-confidence" />
                    </div>
                    <h1 className="font-poppins font-black text-xl">Certificat Authentique</h1>
                    <p className="text-white/80 text-sm mt-1">Vérification réussie — CAPSY SERVICES</p>
                </div>

                {/* Content */}
                <div className="p-6 space-y-5">
                    {/* Participant card */}
                    <div className="bg-brand-gray-light rounded-2xl p-5 text-center">
                        <div className="h-14 w-14 bg-brand-confidence/20 border-2 border-brand-confidence/40 rounded-full flex items-center justify-center mx-auto mb-3">
                            <LucideIcon name="GraduationCap" className="h-7 w-7 text-brand-dark" />
                        </div>
                        <p className="font-poppins font-black text-brand-dark text-lg">{foundParticipant.name}</p>
                        <p className="text-brand-gray-text text-sm">{foundParticipant.title}</p>
                    </div>

                    {/* Details */}
                    <div className="space-y-3">
                        <DetailRow icon="Award" label="Formation" value={foundFormation.shortTitle} />
                        <DetailRow icon="Calendar" label="Date" value={foundFormation.dateRange} />
                        <DetailRow icon="Clock" label="Durée" value={foundFormation.duration} />
                        <DetailRow icon="MapPin" label="Lieu" value={foundFormation.location} />
                        <DetailRow icon="Hash" label="N° Certificat" value={foundParticipant.id} />
                    </div>

                    {/* QR */}
                    {qrDataUrl && (
                        <div className="flex items-center gap-4 p-4 border border-gray-100 rounded-2xl">
                            <img src={qrDataUrl} alt="QR de vérification" className="h-16 w-16 rounded-lg" />
                            <div>
                                <p className="font-poppins font-bold text-brand-dark text-sm">QR Code de vérification</p>
                                <p className="text-xs text-brand-gray-text break-all">{verifUrl}</p>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowCert(true)}
                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-brand-confidence text-brand-dark rounded-xl text-sm font-bold font-poppins hover:bg-brand-confidence/90 transition-all"
                        >
                            <LucideIcon name="Download" className="h-4 w-4 text-brand-dark" />
                            Voir le certificat
                        </button>
                        <a
                            href="/"
                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-brand-gray-light text-brand-dark rounded-xl text-sm font-bold font-poppins hover:bg-gray-200 transition-all"
                        >
                            <LucideIcon name="Home" className="h-4 w-4" />
                            Accueil
                        </a>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 pb-6 text-center">
                    <p className="text-[10px] text-brand-gray-text">
                        Ce certificat a été émis par CAPSY SERVICES (Centre d'Assistance Psychologique, RDC).
                        <br />Toute falsification est passible de poursuites judiciaires.
                    </p>
                </div>
            </motion.div>

            <AnimatePresence>
                {showCert && (
                    <CertificateModal
                        formation={foundFormation}
                        participant={foundParticipant}
                        onClose={() => setShowCert(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

function DetailRow({ icon, label, value }: { icon: string; label: string; value: string }) {
    return (
        <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-brand-confidence/20 border border-brand-confidence/40 rounded-lg flex items-center justify-center shrink-0">
                <LucideIcon name={icon} className="h-4 w-4 text-brand-dark" />
            </div>
            <div>
                <p className="text-[10px] text-brand-gray-text uppercase tracking-wider font-poppins">{label}</p>
                <p className="font-semibold text-brand-dark text-sm">{value}</p>
            </div>
        </div>
    );
}

// ─── Participants List (in formation detail) ──────────────────────────────────

function ParticipantsList({
    formation,
    onViewCertificate,
}: {
    formation: Formation;
    onViewCertificate: (p: Participant) => void;
}) {
    const [search, setSearch] = useState('');
    const filtered = formation.participants.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-4">
            <div className="relative">
                <LucideIcon name="Search" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-gray-text" />
                <input
                    type="text"
                    placeholder="Rechercher un participant..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-confidence/40 focus:border-brand-confidence transition-all"
                />
            </div>

            <div className="grid gap-2 max-h-[50vh] overflow-y-auto pr-1">
                {filtered.map((p, idx) => (
                    <motion.div
                        key={p.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.02 }}
                        className="flex items-center justify-between gap-3 p-3 bg-white border border-gray-100 rounded-xl hover:border-brand-confidence hover:shadow-sm transition-all group"
                    >
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="h-8 w-8 rounded-full bg-brand-confidence/20 border border-brand-confidence/40 flex items-center justify-center shrink-0 font-poppins font-bold text-brand-dark text-xs">
                                {String(idx + 1).padStart(2, '0')}
                            </div>
                            <div className="min-w-0">
                                <p className="font-semibold text-brand-dark text-sm truncate">{p.name}</p>
                                <p className="text-[10px] text-brand-gray-text">{p.id}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => onViewCertificate(p)}
                            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-brand-confidence/20 hover:bg-brand-confidence text-brand-dark border border-brand-confidence/40 rounded-lg text-[11px] font-bold font-poppins transition-all"
                            title="Voir le certificat"
                        >
                            <LucideIcon name="Award" className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Certificat</span>
                        </button>
                    </motion.div>
                ))}
                {filtered.length === 0 && (
                    <p className="text-center text-brand-gray-text text-sm py-6">Aucun participant trouvé.</p>
                )}
            </div>
        </div>
    );
}

// ─── Formation Card ───────────────────────────────────────────────────────────

function FormationCard({
    formation,
    onSelect,
}: {
    formation: Formation;
    onSelect: () => void;
    onOpenBooking: () => void;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -1 }}
            transition={{ duration: 0 }}
            onClick={onSelect}
            className="bg-white rounded-2xl border border-gray-150 shadow-sm hover:border-brand-confidence hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden group"
        >
            <div className="h-44 bg-brand-gray-light border-b border-gray-100 relative overflow-hidden flex items-center justify-center">
                {formation.imageUrl ? (
                    <img
                        src={formation.imageUrl}
                        alt={formation.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-brand-confidence/10 via-brand-gray-light to-brand-confidence/20 p-6 relative">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(145,252,163,0.25),_transparent_40%)]" />
                        <img
                            src={logoFull}
                            alt="CAPSY SERVICES"
                            className="max-h-20 max-w-[75%] object-contain opacity-90 transition-transform duration-500 group-hover:scale-105"
                        />
                    </div>
                )}
                <div className="absolute top-3 left-3 rounded-full bg-white/90 text-brand-dark p-2 shadow-sm backdrop-blur-xs transition-colors group-hover:bg-brand-confidence group-hover:text-brand-dark border border-brand-confidence/30">
                    <LucideIcon name="BookOpen" className="h-4 w-4" />
                </div>
                <div className="absolute bottom-3 left-3">
                    <span className={`inline-flex items-center gap-2 text-[9px] uppercase tracking-widest font-bold px-3 py-1 rounded-full shadow-xs backdrop-blur-xs ${formation.status === 'passée' ? 'bg-slate-100/90 text-slate-700' : formation.status === 'en_cours' ? 'bg-amber-50/90 text-amber-800' : 'bg-brand-confidence/20 text-brand-dark border border-brand-confidence/40'}`}>
                        {formation.status === 'passée' ? 'Terminée' : formation.status === 'en_cours' ? 'En cours' : 'À venir'}
                    </span>
                </div>
            </div>

            <div className="p-6 space-y-4">
                <div className="flex items-start gap-4">
                    <div className="rounded-3xl bg-brand-confidence/20 text-brand-dark border border-brand-confidence/40 p-3 shrink-0 group-hover:bg-brand-confidence group-hover:text-brand-dark transition-colors">
                        <LucideIcon name="GraduationCap" className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-base font-black font-poppins text-brand-dark leading-tight tracking-tight">
                            {formation.shortTitle}
                        </h3>
                        <p className="text-[10px] uppercase tracking-[0.24em] font-semibold text-brand-gray-text mt-1">
                            {formation.dateRange}
                        </p>
                    </div>
                </div>

                <p className="text-sm text-brand-gray-text leading-relaxed line-clamp-3">
                    {formation.description}
                </p>

                <div className="flex flex-wrap gap-2">
                    <span className="text-[10px] bg-neutral-100 text-brand-dark px-2 py-1 rounded-full border border-neutral-200">
                        Durée {formation.duration}
                    </span>
                    <span className="text-[10px] bg-neutral-100 text-brand-dark px-2 py-1 rounded-full border border-neutral-200">
                        {formation.participants.length} participants
                    </span>
                </div>
            </div>

            <div className="p-6 pt-0 border-t border-gray-100 flex gap-2">
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onSelect();
                    }}
                    className="flex-1 py-2.5 px-4 bg-brand-confidence/20 hover:bg-brand-confidence text-brand-dark text-xs font-bold font-poppins rounded-xl border border-brand-confidence/40 transition-colors cursor-pointer"
                >
                    Voir détails
                </button>

            </div>
        </motion.div>
    );
}

// ─── Formation Detail Drawer ──────────────────────────────────────────────────

function FormationDetail({
    formation,
    onClose,
    onViewCertificate,
}: {
    formation: Formation;
    onClose: () => void;
    onViewCertificate: (p: Participant) => void;
}) {
    const [activeTab, setActiveTab] = useState<'overview' | 'participants' | 'modules'>('overview');

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    onClick={onClose}
                />

                {/* Modal Container */}
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 250 }}
                    className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
                >
                    {/* Header */}
                    <div className="p-6 bg-brand-dark text-white flex items-center justify-between border-b border-white/10 shrink-0">
                        <div className="flex items-center gap-3.5 min-w-0 pr-2">
                            <div className="p-2.5 bg-brand-confidence/20 border border-brand-confidence/40 rounded-xl shrink-0 text-brand-confidence">
                                <LucideIcon name="GraduationCap" className="h-6 w-6 text-brand-confidence" />
                            </div>
                            <div className="min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <StatusBadge status={formation.status} variant="header" />
                                </div>
                                <h3 className="text-lg sm:text-xl font-bold font-poppins text-white leading-tight truncate">
                                    {formation.title}
                                </h3>
                                <div className="flex flex-wrap gap-3 mt-1 text-xs text-white/80 font-sans">
                                    <span className="flex items-center gap-1">
                                        <LucideIcon name="Calendar" className="h-3.5 w-3.5 text-brand-confidence" />
                                        {formation.dateRange}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <LucideIcon name="Clock" className="h-3.5 w-3.5 text-brand-confidence" />
                                        {formation.duration}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <LucideIcon name="MapPin" className="h-3.5 w-3.5 text-brand-confidence" />
                                        {formation.location}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1 rounded-full hover:bg-white/10 transition-colors text-white shrink-0"
                            aria-label="Fermer"
                        >
                            <LucideIcon name="X" className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-gray-100 px-6">
                        {[
                            { key: 'overview', label: 'Aperçu', icon: 'Info' },
                            { key: 'participants', label: `Participants (${formation.participants.length})`, icon: 'Users' },
                            { key: 'modules', label: 'Modules', icon: 'BookOpen' },
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key as any)}
                                className={`relative flex items-center gap-1.5 px-3 py-3.5 text-xs font-poppins font-bold transition-all cursor-pointer ${activeTab === tab.key
                                    ? 'text-brand-dark'
                                    : 'text-brand-gray-text hover:text-brand-dark'
                                    }`}
                            >
                                <LucideIcon name={tab.icon} className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">{tab.label}</span>
                                <span className="sm:hidden">{tab.key === 'participants' ? formation.participants.length : tab.label}</span>
                                {activeTab === tab.key && (
                                    <motion.div
                                        layoutId="modalActiveTabUnderline"
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-confidence"
                                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                    />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Tab content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {activeTab === 'overview' && (
                            <div className="space-y-5">
                                <p className="text-sm text-brand-gray-text leading-relaxed">{formation.description}</p>

                                <div>
                                    <h4 className="font-poppins font-bold text-brand-dark text-sm mb-3 flex items-center gap-2">
                                        <LucideIcon name="Target" className="h-4 w-4 text-brand-confidence" />
                                        Compétences développées
                                    </h4>
                                    <ul className="space-y-2">
                                        {formation.competences.map((c, i) => (
                                            <li key={i} className="flex items-start gap-2.5 text-sm text-brand-dark">
                                                <LucideIcon name="CheckCircle2" className="h-4 w-4 text-brand-confidence mt-0.5 shrink-0" />
                                                {c}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div>
                                    <h4 className="font-poppins font-bold text-brand-dark text-sm mb-3 flex items-center gap-2">
                                        <LucideIcon name="Users" className="h-4 w-4 text-brand-confidence" />
                                        Formateurs & Signataires
                                    </h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        {formation.signataires.map((s) => (
                                            <div key={s.name} className="bg-brand-gray-light rounded-xl p-3 text-center">
                                                <div className="h-9 w-9 bg-brand-confidence/20 border border-brand-confidence/40 rounded-full flex items-center justify-center mx-auto mb-2">
                                                    <LucideIcon name="User" className="h-4 w-4 text-brand-dark" />
                                                </div>
                                                <p className="font-poppins font-bold text-brand-dark text-[10px] leading-tight">{s.name}</p>
                                                <p className="text-[9px] text-brand-gray-text mt-0.5">{s.role}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-poppins font-bold text-brand-dark text-sm mb-2 flex items-center gap-2">
                                        <LucideIcon name="Handshake" className="h-4 w-4 text-brand-confidence" />
                                        Partenaires
                                    </h4>
                                    <div className="flex gap-2 flex-wrap">
                                        {formation.partners.map((p) => (
                                            <span key={p} className="px-3 py-1.5 bg-brand-confidence/20 text-brand-dark rounded-lg text-xs font-poppins font-bold border border-brand-confidence/40">
                                                {p}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'participants' && (
                            <ParticipantsList formation={formation} onViewCertificate={onViewCertificate} />
                        )}

                        {activeTab === 'modules' && (
                            <div className="space-y-3">
                                {formation.modules && formation.modules.length > 0 ? (
                                    formation.modules.map((m, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 bg-brand-gray-light rounded-xl">
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 bg-brand-confidence/20 border border-brand-confidence/40 rounded-lg flex items-center justify-center">
                                                    <LucideIcon name="BookOpen" className="h-4 w-4 text-brand-dark" />
                                                </div>
                                                <p className="font-semibold text-brand-dark text-sm">{m.title}</p>
                                            </div>
                                            {m.url ? (
                                                <a
                                                    href={m.url}
                                                    download
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-confidence text-brand-dark rounded-lg text-xs font-bold font-poppins hover:bg-brand-confidence/90 transition-all"
                                                >
                                                    <LucideIcon name="Download" className="h-3.5 w-3.5 text-brand-dark" />
                                                    Télécharger
                                                </a>
                                            ) : (
                                                <span className="text-xs text-brand-gray-text font-poppins">Non disponible</span>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <LucideIcon name="BookOpen" className="h-7 w-7 text-gray-300" />
                                        </div>
                                        <p className="font-poppins font-semibold text-brand-dark">Modules non disponibles</p>
                                        <p className="text-sm text-brand-gray-text mt-1">
                                            Les modules de cette formation seront disponibles prochainement.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

// ─── Main Formations Page ─────────────────────────────────────────────────────

interface FormationsPageProps {
    certifId?: string;
}

export default function FormationsPageView({ certifId, onOpenBooking }: FormationsPageProps & { onOpenBooking: () => void }) {
    const [selectedFormation, setSelectedFormation] = useState<Formation | null>(null);
    const [certModal, setCertModal] = useState<{ formation: Formation; participant: Participant } | null>(null);
    const [filterStatus, setFilterStatus] = useState<'all' | Formation['status']>('all');

    if (certifId) {
        return <CertificateVerificationView certifId={certifId} />;
    }

    const filtered = FORMATIONS.filter(
        (f) => filterStatus === 'all' || f.status === filterStatus
    );

    const counts = {
        all: FORMATIONS.length,
        passée: FORMATIONS.filter((f) => f.status === 'passée').length,
        en_cours: FORMATIONS.filter((f) => f.status === 'en_cours').length,
        à_venir: FORMATIONS.filter((f) => f.status === 'à_venir').length,
    };
    const totalParticipants = FORMATIONS.reduce((s, f) => s + f.participants.length, 0);

    return (
        <div className="min-h-screen bg-brand-gray-light" id="formations-page">
            <PageHero
                variant="green"
                eyebrow="Formations"
                title="Nos Formations"
                description={`Retrouvez toutes les formations organisées par CAPSY SERVICES (${counts.all} formation${counts.all > 1 ? 's' : ''}, ${totalParticipants} participants, 24h+ de formation). Les participants peuvent télécharger leurs certificats et les modules disponibles.`}
                primaryCtaLabel="Prendre rendez-vous"
                onPrimaryCta={onOpenBooking}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                <div className="flex border-b border-gray-200 gap-1 sm:gap-4 overflow-x-auto no-scrollbar">
                    {[
                        { key: 'all', label: `Toutes (${counts.all})`, icon: 'BookOpen' },
                        { key: 'passée', label: `Terminées (${counts.passée})`, icon: 'CheckCircle2' },
                        { key: 'en_cours', label: `En cours (${counts.en_cours})`, icon: 'Clock' },
                        { key: 'à_venir', label: `À venir (${counts.à_venir})`, icon: 'Calendar' },
                    ].map((f) => (
                        <button
                            key={f.key}
                            onClick={() => setFilterStatus(f.key as any)}
                            className={`relative flex items-center gap-2 px-3 sm:px-4 py-3.5 text-xs font-poppins font-bold transition-all shrink-0 cursor-pointer ${filterStatus === f.key
                                ? 'text-brand-dark'
                                : 'text-brand-gray-text hover:text-brand-dark'
                                }`}
                        >
                            <LucideIcon name={f.icon} className="h-4 w-4" />
                            <span>{f.label}</span>
                            {filterStatus === f.key && (
                                <motion.div
                                    layoutId="pageActiveTabUnderline"
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-confidence"
                                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Formations Grid */}
            <div id="formations" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-3.5">
                {filtered.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filtered.map((f) => (
                            <FormationCard
                                key={f.id}
                                formation={f}
                                onSelect={() => setSelectedFormation(f)}
                                onOpenBooking={onOpenBooking}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                            <LucideIcon name="GraduationCap" className="h-9 w-9 text-gray-300" />
                        </div>
                        <p className="font-poppins font-bold text-brand-dark text-lg">Aucune formation dans cette catégorie</p>
                        <p className="text-brand-gray-text text-sm mt-1">Revenez bientôt pour découvrir nos prochaines formations.</p>
                    </div>
                )}
            </div>

            {/* Formation detail drawer */}
            <AnimatePresence>
                {selectedFormation && (
                    <FormationDetail
                        formation={selectedFormation}
                        onClose={() => setSelectedFormation(null)}
                        onViewCertificate={(p) => {
                            setCertModal({ formation: selectedFormation, participant: p });
                        }}
                    />
                )}
            </AnimatePresence>

            {/* Certificate modal */}
            <AnimatePresence>
                {certModal && (
                    <CertificateModal
                        formation={certModal.formation}
                        participant={certModal.participant}
                        onClose={() => setCertModal(null)}
                    />
                )}
            </AnimatePresence>

            {/* Print styles injected */}
            <style>{`
        @media print {
          body > *:not(.certificate-paper) { display: none !important; }
          .no-print { display: none !important; }
          .certificate-paper {
            border-width: 8px !important;
            box-shadow: none !important;
            width: 100vw !important;
            aspect-ratio: 1.414/1 !important;
            page-break-inside: avoid;
          }
        }
      `}</style>
        </div>
    );
}
