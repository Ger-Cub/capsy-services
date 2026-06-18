import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import LucideIcon from './LucideIcon';

interface UserProfilePageProps {
    user: any;
    onClose: () => void;
    onLogout: () => void;
}

export default function UserProfilePage({ user, onClose, onLogout }: UserProfilePageProps) {
    const [isVisible, setIsVisible] = useState(true);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300);
    };

    const handleLogout = () => {
        handleClose();
        setTimeout(onLogout, 350);
    };

    const initials = user?.name
        ? user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
        : '?';

    return (
        <AnimatePresence>
            {isVisible && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={handleClose}
                    />

                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 30 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 30 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden z-10"
                    >
                        {/* Close button */}
                        <button
                            onClick={handleClose}
                            className="absolute top-4 right-4 z-20 p-2 bg-white/80 hover:bg-white text-brand-dark rounded-xl shadow-sm transition-colors"
                        >
                            <LucideIcon name="X" className="h-4 w-4" />
                        </button>

                        {/* Top section: Reduced banner height */}
                        <div className="relative bg-gradient-to-br from-brand-blue to-brand-blue/70 pt-8 pb-10 flex flex-col items-center">
                            {/* Decorative circles */}
                            <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/4" />
                            <div className="absolute bottom-0 left-0 h-24 w-24 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/4" />

                            {/* Avatar straddling the line */}
                            <div className="relative z-10 h-24 w-24 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white flex items-center justify-center -mb-12">
                                {user?.avatar ? (
                                    <img
                                        src={user.avatar}
                                        alt={user.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    <span className="text-brand-blue font-black text-3xl font-poppins">{initials}</span>
                                )}
                            </div>
                        </div>

                        {/* Name + email section with more margin */}
                        <div className="px-8 mt-14 text-center">
                            <div className="bg-white rounded-2xl shadow-sm px-6 py-5 border border-gray-100 ring-1 ring-gray-200/50">
                                <h2 className="text-xl font-poppins font-black text-brand-dark leading-tight">{user?.name}</h2>
                                <p className="text-sm text-brand-gray-text mt-1">{user?.email}</p>
                                <span className="mt-3 inline-block text-[10px] font-bold uppercase tracking-widest bg-brand-blue/10 text-brand-blue px-3 py-1.5 rounded-full">
                                    Client Odoo
                                </span>
                            </div>
                        </div>

                        {/* Info Cards */}
                        <div className="px-8 mt-6 grid grid-cols-2 gap-3">
                            <InfoCard icon="User" label="Identifiant" value={user?.login || user?.email} />
                            <InfoCard icon="Hash" label="ID Partenaire" value={user?.partner_id ? `#${user.partner_id}` : '—'} />
                            <InfoCard icon="Globe" label="Langue" value={user?.lang || 'Non définie'} />
                            <InfoCard icon="Clock" label="Fuseau horaire" value={user?.tz || 'Non défini'} />
                        </div>

                        {/* Actions */}
                        <div className="px-8 mt-8 mb-8 flex flex-col sm:flex-row gap-3">
                            <a
                                href={`${process.env.ODOO_URL}/my/account`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 py-3 px-4 border-2 border-brand-blue text-brand-blue hover:bg-brand-blue/5 rounded-xl font-bold font-poppins text-sm flex items-center justify-center gap-2 transition-colors"
                            >
                                <LucideIcon name="ExternalLink" className="h-4 w-4" />
                                <span>Voir sur Odoo</span>
                            </a>
                            <button
                                onClick={handleLogout}
                                className="flex-1 py-3 px-4 bg-rose-50 hover:bg-rose-100 text-rose-600 border-2 border-rose-200 rounded-xl font-bold font-poppins text-sm flex items-center justify-center gap-2 transition-colors"
                            >
                                <LucideIcon name="LogOut" className="h-4 w-4" />
                                <span>Déconnexion</span>
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

function InfoCard({ icon, label, value }: { icon: string; label: string; value: string }) {
    return (
        <div className="p-3.5 bg-brand-gray-light rounded-xl flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg shadow-xs text-brand-blue shrink-0">
                <LucideIcon name={icon} className="h-4 w-4" />
            </div>
            <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-brand-gray-text">{label}</p>
                <p className="text-xs font-semibold text-brand-dark truncate">{value}</p>
            </div>
        </div>
    );
}
