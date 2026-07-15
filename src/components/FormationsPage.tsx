import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import LucideIcon from './LucideIcon';
import Logo from './Logo';
import QRCode from 'qrcode';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Participant {
    id: string;
    name: string;
    title: string;
}

export interface Formation {
    id: string;
    title: string;
    shortTitle: string;
    status: 'passée' | 'en_cours' | 'à_venir';
    dateRange: string;
    duration: string;
    location: string;
    certifNumPrefix: string;
    description: string;
    competences: string[];
    signataires: { name: string; role: string }[];
    partners: string[];
    participants: Participant[];
    modules?: { title: string; url?: string }[];
}

// ─── Données des formations ───────────────────────────────────────────────────

const FORMATIONS: Formation[] = [
    {
        id: 'tccg-2026',
        title: 'Formation des Psychologues Facilitateurs en TCCG',
        shortTitle: 'Thérapie Cognitivo-Comportementale de Groupe',
        status: 'passée',
        dateRange: '01 - 03 Juillet 2026',
        duration: '24 heures',
        location: 'Goma, RDC',
        certifNumPrefix: 'TCCG-2026',
        description:
            'Formation intensive organisée par le Centre d\'Assistance Psychologique, CAPSY SARL, en partenariat avec HEAL AFRICA/STAR-RDC. Les participants ont développé les compétences nécessaires pour animer des groupes thérapeutiques TCC-G et conduire des interventions cliniques conformément au protocole.',
        competences: [
            'Animer des groupes thérapeutiques TCC-G',
            'Appliquer les techniques de restructuration cognitive',
            'Conduire des séances de psychoéducation',
            'Gérer les situations cliniques complexes',
            'Utiliser les outils de communication thérapeutique',
            'Documenter les interventions conformément au protocole',
        ],
        signataires: [
            { name: 'JACQUE KAMBALE', role: 'Formateur principal' },
            { name: 'LISETTE PANZU', role: 'Cofacilitateur' },
            { name: 'VINCENT', role: 'Cofacilitateur' },
            { name: 'ELIE LUSENGE', role: 'Pour CAPSY SERVICE' },
        ],
        partners: ['HEAL AFRICA', 'STAR-RDC', 'CAPSY SERVICES'],
        participants: [
            { id: 'TCCG-2026-001', name: 'BALUGE NYAMWIRUKA Bienfaiteur', title: 'psychologue clinicien (ne)' },
            { id: 'TCCG-2026-002', name: 'KAVIRA MWASI Esther', title: 'psychologue clinicien (ne)' },
            { id: 'TCCG-2026-003', name: 'KAVUGHO KATIMIKA Gloria', title: 'psychologue clinicien (ne)' },
            { id: 'TCCG-2026-004', name: 'NSIMIRE NAKAKONDA Deborah', title: 'psychologue clinicien (ne)' },
            { id: 'TCCG-2026-005', name: 'NSTII BAHUNGA Merveille', title: 'psychologue clinicien (ne)' },
            { id: 'TCCG-2026-006', name: 'KAHINDO KALEMBA Gloria', title: 'psychologue clinicien (ne)' },
            { id: 'TCCG-2026-007', name: 'KAVIRA WANZUVA Julie', title: 'psychologue clinicien (ne)' },
            { id: 'TCCG-2026-008', name: 'Innocent KASEREKA NKUBA', title: 'psychologue clinicien (ne)' },
            { id: 'TCCG-2026-009', name: 'Jean Claude TSHUMA', title: 'psychologue clinicien (ne)' },
            { id: 'TCCG-2026-010', name: 'BULONZA BWINO Agnès', title: 'psychologue clinicien (ne)' },
            { id: 'TCCG-2026-011', name: 'IRAGI BWIZA Grâce', title: 'psychologue clinicien (ne)' },
            { id: 'TCCG-2026-012', name: 'SIMWERAY BITSIBU Paul', title: 'psychologue clinicien (ne)' },
            { id: 'TCCG-2026-013', name: 'AMINA MARONYI Marceline', title: 'psychologue clinicien (ne)' },
            { id: 'TCCG-2026-014', name: 'AÏSHA VALIHALI Sarah', title: 'psychologue clinicien (ne)' },
            { id: 'TCCG-2026-015', name: 'LUANDA AYUWA Eunice', title: 'psychologue clinicien (ne)' },
            { id: 'TCCG-2026-016', name: 'MUNGUAKONKWA MATENDO Mignonne', title: 'psychologue clinicien (ne)' },
            { id: 'TCCG-2026-017', name: 'NZABARINDA SHIRAMBERE Heleine', title: 'psychologue clinicien (ne)' },
            { id: 'TCCG-2026-018', name: 'MUDERWA MUNJUZA Laetitia', title: 'psychologue clinicien (ne)' },
            { id: 'TCCG-2026-019', name: 'Nathalie CHIBANGUKA', title: 'psychologue clinicien (ne)' },
            { id: 'TCCG-2026-020', name: 'SIFA SHARANGUZA Marie', title: 'psychologue clinicien (ne)' },
            { id: 'TCCG-2026-021', name: 'Jemima KYANZA BWAMI', title: 'psychologue clinicien (ne)' },
            { id: 'TCCG-2026-022', name: 'KABUMBA MATEMBERA David', title: 'psychologue clinicien (ne)' },
            { id: 'TCCG-2026-023', name: 'KABUO SIVANZIRE Judith', title: 'psychologue clinicien (ne)' },
            { id: 'TCCG-2026-024', name: 'AMINA SALIMA Solange', title: 'psychologue clinicien (ne)' },
        ],
        modules: [],
    },
];

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

function StatusBadge({ status }: { status: Formation['status'] }) {
    const map = {
        passée: { label: 'Terminée', cls: 'bg-slate-100 text-slate-600 border-slate-200' },
        en_cours: { label: 'En cours', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
        à_venir: { label: 'À venir', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
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

    const handlePrint = () => {
        window.print();
    };

    const certifNum = participant.id;
    const dateStr = formation.dateRange.split(' - ').slice(-1)[0] || formation.dateRange;

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
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
                    <div>
                        <p className="font-poppins font-bold text-brand-dark text-sm">Certificat de réussite</p>
                        <p className="text-xs text-brand-gray-text">{participant.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-1.5 px-4 py-2 bg-brand-wellbeing text-white rounded-xl text-xs font-bold font-poppins hover:bg-brand-wellbeing/90 transition-all no-print"
                        >
                            <LucideIcon name="Download" className="h-3.5 w-3.5" />
                            Télécharger / Imprimer
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
                    <div
                        ref={certRef}
                        className="certificate-paper relative bg-white w-full aspect-[1.414/1] border-[12px] border-brand-wellbeing rounded-lg overflow-hidden shadow-xl print:shadow-none print:border-[8px] select-none"
                        style={{ fontFamily: 'serif' }}
                    >
                        {/* Green left decorative stripe */}
                        <div className="absolute left-0 top-0 h-full w-12 bg-gradient-to-b from-brand-darkgreen via-brand-wellbeing to-brand-confidence opacity-90" />

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
        <div className="min-h-screen bg-gradient-to-br from-brand-darkgreen to-brand-wellbeing flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-brand-darkgreen to-brand-wellbeing p-6 text-white text-center">
                    <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <LucideIcon name="ShieldCheck" className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="font-poppins font-black text-xl">Certificat Authentique</h1>
                    <p className="text-white/80 text-sm mt-1">Vérification réussie — CAPSY SERVICES</p>
                </div>

                {/* Content */}
                <div className="p-6 space-y-5">
                    {/* Participant card */}
                    <div className="bg-brand-gray-light rounded-2xl p-5 text-center">
                        <div className="h-14 w-14 bg-brand-wellbeing/10 border-2 border-brand-wellbeing rounded-full flex items-center justify-center mx-auto mb-3">
                            <LucideIcon name="GraduationCap" className="h-7 w-7 text-brand-wellbeing" />
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
                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-brand-wellbeing text-white rounded-xl text-sm font-bold font-poppins hover:bg-brand-wellbeing/90 transition-all"
                        >
                            <LucideIcon name="Download" className="h-4 w-4" />
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
            <div className="h-8 w-8 bg-brand-wellbeing/10 rounded-lg flex items-center justify-center shrink-0">
                <LucideIcon name={icon} className="h-4 w-4 text-brand-wellbeing" />
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
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-wellbeing/30 focus:border-brand-wellbeing transition-all"
                />
            </div>

            <div className="grid gap-2 max-h-[50vh] overflow-y-auto pr-1">
                {filtered.map((p, idx) => (
                    <motion.div
                        key={p.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.02 }}
                        className="flex items-center justify-between gap-3 p-3 bg-white border border-gray-100 rounded-xl hover:border-brand-wellbeing/30 hover:shadow-sm transition-all group"
                    >
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="h-8 w-8 rounded-full bg-brand-wellbeing/10 flex items-center justify-center shrink-0 font-poppins font-bold text-brand-wellbeing text-xs">
                                {String(idx + 1).padStart(2, '0')}
                            </div>
                            <div className="min-w-0">
                                <p className="font-semibold text-brand-dark text-sm truncate">{p.name}</p>
                                <p className="text-[10px] text-brand-gray-text">{p.id}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => onViewCertificate(p)}
                            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-brand-wellbeing/5 hover:bg-brand-wellbeing text-brand-wellbeing hover:text-white rounded-lg text-[11px] font-bold font-poppins transition-all"
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
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.3 }}
            onClick={onSelect}
            className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-lg hover:border-brand-wellbeing/30 transition-all cursor-pointer overflow-hidden group"
        >
            {/* Top gradient band */}
            <div className={`h-1.5 w-full ${formation.status === 'passée' ? 'bg-gradient-to-r from-slate-400 to-slate-500' :
                formation.status === 'en_cours' ? 'bg-gradient-to-r from-amber-400 to-amber-500' :
                    'bg-gradient-to-r from-brand-wellbeing to-brand-confidence'
                }`} />

            <div className="p-5 sm:p-6">
                <div className="flex items-start justify-between gap-3 mb-3">
                    <StatusBadge status={formation.status} />
                    <span className="text-[10px] text-brand-gray-text font-poppins font-semibold whitespace-nowrap">{formation.duration}</span>
                </div>

                <h3 className="font-poppins font-black text-brand-dark text-base sm:text-lg leading-tight mb-2 group-hover:text-brand-wellbeing transition-colors">
                    {formation.shortTitle}
                </h3>
                <p className="text-sm text-brand-gray-text leading-relaxed line-clamp-2 mb-4">
                    {formation.description}
                </p>

                <div className="flex flex-wrap gap-3 text-xs text-brand-gray-text mb-4">
                    <span className="flex items-center gap-1">
                        <LucideIcon name="Calendar" className="h-3.5 w-3.5 text-brand-wellbeing" />
                        {formation.dateRange}
                    </span>
                    <span className="flex items-center gap-1">
                        <LucideIcon name="MapPin" className="h-3.5 w-3.5 text-brand-wellbeing" />
                        {formation.location}
                    </span>
                    <span className="flex items-center gap-1">
                        <LucideIcon name="Users" className="h-3.5 w-3.5 text-brand-wellbeing" />
                        {formation.participants.length} participants
                    </span>
                </div>

                <div className="flex gap-2 flex-wrap">
                    {formation.partners.map((p) => (
                        <span key={p} className="text-[10px] px-2 py-0.5 bg-brand-wellbeing/5 text-brand-wellbeing rounded-full font-poppins font-semibold border border-brand-wellbeing/10">
                            {p}
                        </span>
                    ))}
                </div>
            </div>

            <div className="px-5 sm:px-6 pb-5 pt-0 border-t border-gray-50">
                <div className="flex items-center justify-between pt-4">
                    <span className="text-xs text-brand-gray-text">
                        {formation.modules && formation.modules.length > 0
                            ? `${formation.modules.length} module(s) disponible(s)`
                            : 'Modules non disponibles'}
                    </span>
                    <span className="flex items-center gap-1.5 text-brand-wellbeing text-xs font-poppins font-bold group-hover:gap-2.5 transition-all">
                        Voir les détails
                        <LucideIcon name="ChevronRight" className="h-4 w-4" />
                    </span>
                </div>
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
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
                onClick={(e) => e.target === e.currentTarget && onClose()}
            >
                <motion.div
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 100 }}
                    transition={{ type: 'spring', damping: 25 }}
                    className="bg-white w-full sm:max-w-3xl sm:rounded-3xl rounded-t-3xl shadow-2xl max-h-[92vh] overflow-hidden flex flex-col"
                >
                    {/* Header */}
                    <div className="px-6 py-5 border-b border-gray-100 flex items-start justify-between gap-4">
                        <div className="min-w-0">
                            <StatusBadge status={formation.status} />
                            <h2 className="font-poppins font-black text-brand-dark text-lg sm:text-xl mt-2 leading-tight">
                                {formation.title}
                            </h2>
                            <div className="flex flex-wrap gap-3 mt-2 text-xs text-brand-gray-text">
                                <span className="flex items-center gap-1">
                                    <LucideIcon name="Calendar" className="h-3.5 w-3.5 text-brand-wellbeing" />
                                    {formation.dateRange}
                                </span>
                                <span className="flex items-center gap-1">
                                    <LucideIcon name="Clock" className="h-3.5 w-3.5 text-brand-wellbeing" />
                                    {formation.duration}
                                </span>
                                <span className="flex items-center gap-1">
                                    <LucideIcon name="MapPin" className="h-3.5 w-3.5 text-brand-wellbeing" />
                                    {formation.location}
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl hover:bg-gray-100 transition-all shrink-0"
                        >
                            <LucideIcon name="X" className="h-5 w-5 text-gray-500" />
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
                                className={`flex items-center gap-1.5 px-3 py-3.5 text-xs font-poppins font-bold border-b-2 transition-all -mb-px ${activeTab === tab.key
                                    ? 'border-brand-wellbeing text-brand-wellbeing'
                                    : 'border-transparent text-brand-gray-text hover:text-brand-dark'
                                    }`}
                            >
                                <LucideIcon name={tab.icon} className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">{tab.label}</span>
                                <span className="sm:hidden">{tab.key === 'participants' ? formation.participants.length : tab.label}</span>
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
                                        <LucideIcon name="Target" className="h-4 w-4 text-brand-wellbeing" />
                                        Compétences développées
                                    </h4>
                                    <ul className="space-y-2">
                                        {formation.competences.map((c, i) => (
                                            <li key={i} className="flex items-start gap-2.5 text-sm text-brand-dark">
                                                <LucideIcon name="CheckCircle2" className="h-4 w-4 text-brand-wellbeing mt-0.5 shrink-0" />
                                                {c}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div>
                                    <h4 className="font-poppins font-bold text-brand-dark text-sm mb-3 flex items-center gap-2">
                                        <LucideIcon name="Users" className="h-4 w-4 text-brand-wellbeing" />
                                        Formateurs & Signataires
                                    </h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        {formation.signataires.map((s) => (
                                            <div key={s.name} className="bg-brand-gray-light rounded-xl p-3 text-center">
                                                <div className="h-9 w-9 bg-brand-wellbeing/10 rounded-full flex items-center justify-center mx-auto mb-2">
                                                    <LucideIcon name="User" className="h-4 w-4 text-brand-wellbeing" />
                                                </div>
                                                <p className="font-poppins font-bold text-brand-dark text-[10px] leading-tight">{s.name}</p>
                                                <p className="text-[9px] text-brand-gray-text mt-0.5">{s.role}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-poppins font-bold text-brand-dark text-sm mb-2 flex items-center gap-2">
                                        <LucideIcon name="Handshake" className="h-4 w-4 text-brand-wellbeing" />
                                        Partenaires
                                    </h4>
                                    <div className="flex gap-2 flex-wrap">
                                        {formation.partners.map((p) => (
                                            <span key={p} className="px-3 py-1.5 bg-brand-wellbeing/5 text-brand-wellbeing rounded-lg text-xs font-poppins font-bold border border-brand-wellbeing/15">
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
                                                <div className="h-9 w-9 bg-brand-wellbeing/10 rounded-lg flex items-center justify-center">
                                                    <LucideIcon name="BookOpen" className="h-4 w-4 text-brand-wellbeing" />
                                                </div>
                                                <p className="font-semibold text-brand-dark text-sm">{m.title}</p>
                                            </div>
                                            {m.url ? (
                                                <a
                                                    href={m.url}
                                                    download
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-wellbeing text-white rounded-lg text-xs font-bold font-poppins hover:bg-brand-wellbeing/90 transition-all"
                                                >
                                                    <LucideIcon name="Download" className="h-3.5 w-3.5" />
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
            </motion.div>
        </AnimatePresence>
    );
}

// ─── Main Formations Page ─────────────────────────────────────────────────────

interface FormationsPageProps {
    certifId?: string; // if provided, show verification view
}

export default function FormationsPage({ certifId }: FormationsPageProps) {
    const [selectedFormation, setSelectedFormation] = useState<Formation | null>(null);
    const [certModal, setCertModal] = useState<{ formation: Formation; participant: Participant } | null>(null);
    const [filterStatus, setFilterStatus] = useState<'all' | Formation['status']>('all');

    // If we're on the certificate verification page
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

    return (
        <div className="min-h-screen bg-brand-gray-light" id="formations-page">
            {/* Hero / Banner */}
            <div className="relative bg-gradient-to-br from-brand-darkgreen via-brand-wellbeing to-[#00a847] py-8 sm:py-12 overflow-hidden">
                {/* Decorative circles */}
                <div className="absolute top-0 right-0 h-64 w-64 bg-white/5 rounded-full translate-x-1/2 -translate-y-1/3" />
                <div className="absolute bottom-0 left-0 h-48 w-48 bg-white/5 rounded-full -translate-x-1/3 translate-y-1/3" />

                <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/15 rounded-full text-white/90 text-xs font-poppins font-bold uppercase tracking-widest mb-4"
                    >
                        <LucideIcon name="GraduationCap" className="h-3.5 w-3.5" />
                        Espace Formations
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="font-poppins font-black text-white text-2xl sm:text-3xl leading-tight mb-3"
                    >
                        Nos Formations
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-white/80 text-sm sm:text-base max-w-2xl mx-auto"
                    >
                        Retrouvez toutes les formations organisées par CAPSY SERVICES. Les participants peuvent télécharger leurs certificats et les modules disponibles.
                    </motion.p>

                    {/* Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-wrap justify-center gap-4 sm:gap-8 mt-4"
                    >
                        {[
                            { label: 'Formations', value: counts.all, icon: 'BookOpen' },
                            {
                                label: 'Participants',
                                value: FORMATIONS.reduce((s, f) => s + f.participants.length, 0),
                                icon: 'Users',
                            },
                            { label: 'Heures de formation', value: '24+', icon: 'Clock' },
                        ].map((s) => (
                            <div key={s.label} className="text-center">
                                <p className="font-poppins font-black text-white text-2xl sm:text-3xl">{s.value}</p>
                                <p className="text-white/70 text-xs mt-0.5 font-poppins">{s.label}</p>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex flex-wrap gap-2">
                    {[
                        { key: 'all', label: `Toutes (${counts.all})` },
                        { key: 'passée', label: `Terminées (${counts.passée})` },
                        { key: 'en_cours', label: `En cours (${counts.en_cours})` },
                        { key: 'à_venir', label: `À venir (${counts.à_venir})` },
                    ].map((f) => (
                        <button
                            key={f.key}
                            onClick={() => setFilterStatus(f.key as any)}
                            className={`px-4 py-2 rounded-xl text-xs font-poppins font-bold transition-all ${filterStatus === f.key
                                ? 'bg-brand-wellbeing text-white shadow-md'
                                : 'bg-white text-brand-gray-text hover:bg-brand-wellbeing/5 hover:text-brand-wellbeing border border-gray-200'
                                }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Formations Grid */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
                {filtered.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filtered.map((f) => (
                            <FormationCard
                                key={f.id}
                                formation={f}
                                onSelect={() => setSelectedFormation(f)}
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
