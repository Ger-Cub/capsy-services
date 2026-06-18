import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import LucideIcon from './LucideIcon';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLoginSuccess: (user: any) => void;
}

export default function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'login', username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('capsy_user', JSON.stringify(data.user));
                onLoginSuccess(data.user);
                onClose();
                // Global event to notify other components
                window.dispatchEvent(new Event('auth-changed'));
            } else {
                setError(data.error || 'Erreur d\'authentification');
            }
        } catch (err) {
            setError('Erreur de connexion au serveur');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden z-10 p-8"
                    >
                        <div className="text-center mb-8">
                            <div className="inline-flex p-3 bg-brand-blue/10 rounded-full text-brand-blue mb-4">
                                <LucideIcon name="Lock" className="h-8 w-8" />
                            </div>
                            <h3 className="text-2xl font-bold font-poppins text-brand-dark">Connexion Odoo</h3>
                            <p className="text-sm text-brand-gray-text mt-2">Connectez-vous pour gérer vos consultations</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {error && (
                                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 text-sm rounded-xl flex items-center gap-2">
                                    <LucideIcon name="AlertTriangle" className="h-4 w-4" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-1.5">
                                    Email ou Identifiant
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="votre.email@capsy.com"
                                    className="w-full p-3.5 border-2 border-gray-200 rounded-xl outline-none focus:border-brand-blue transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-1.5">
                                    Mot de passe
                                </label>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full p-3.5 border-2 border-gray-200 rounded-xl outline-none focus:border-brand-blue transition-colors"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3.5 bg-brand-blue hover:bg-brand-blue/90 text-white font-bold font-poppins rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <LucideIcon name="Loader2" className="h-5 w-5 animate-spin" />
                                        <span>Connexion en cours...</span>
                                    </>
                                ) : (
                                    <>
                                        <LucideIcon name="LogIn" className="h-5 w-5" />
                                        <span>Se connecter</span>
                                    </>
                                )}
                            </button>
                        </form>

                        <button
                            onClick={onClose}
                            className="mt-6 w-full text-xs text-brand-gray-text hover:text-brand-dark font-medium transition-colors"
                        >
                            Annuler
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
