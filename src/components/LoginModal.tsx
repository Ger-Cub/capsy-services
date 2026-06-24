import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import LucideIcon from './LucideIcon';

type ModalView = 'login' | 'register' | 'reset';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLoginSuccess: (user: any) => void;
}

export default function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
    const [view, setView] = useState<ModalView>('login');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const reset = () => {
        setError(null);
        setSuccess(null);
    };

    const switchView = (v: ModalView) => {
        reset();
        setView(v);
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        reset();
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
                window.dispatchEvent(new Event('auth-changed'));
            } else {
                setError(data.error || 'Erreur d\'authentification');
            }
        } catch {
            setError('Erreur de connexion au serveur');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        reset();
        try {
            const response = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'register', name, email, password }),
            });
            const data = await response.json();
            if (response.ok) {
                setSuccess(data.message);
                setTimeout(() => switchView('login'), 2000);
            } else {
                setError(data.error);
            }
        } catch {
            setError('Erreur de connexion au serveur');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        reset();
        try {
            const response = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'reset_password', email }),
            });
            const data = await response.json();
            if (response.ok) {
                setSuccess(data.message);
            } else {
                setError(data.error);
            }
        } catch {
            setError('Erreur de connexion au serveur');
        } finally {
            setIsLoading(false);
        }
    };

    const titles: Record<ModalView, string> = {
        login: 'Connexion à votre espace',
        register: 'Créer un compte',
        reset: 'Réinitialiser le mot de passe',
    };

    const icons: Record<ModalView, string> = {
        login: 'Lock',
        register: 'UserPlus',
        reset: 'KeyRound',
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
                        key={view}
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden z-10 p-8"
                    >
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="inline-flex p-3 bg-brand-wellbeing/10 rounded-full text-brand-wellbeing mb-4">
                                <LucideIcon name={icons[view]} className="h-8 w-8" />
                            </div>
                            <h3 className="text-2xl font-bold font-poppins text-brand-dark">{titles[view]}</h3>
                            {view === 'login' && <p className="text-sm text-brand-gray-text mt-2">Connectez-vous pour gérer vos consultations</p>}
                            {view === 'register' && <p className="text-sm text-brand-gray-text mt-2">Créez votre espace client CAPSY Services</p>}
                            {view === 'reset' && <p className="text-sm text-brand-gray-text mt-2">Entrez votre email pour recevoir un lien de réinitialisation</p>}
                        </div>

                        {/* Feedback */}
                        {error && (
                            <div className="mb-5 p-3 bg-rose-50 border border-rose-200 text-rose-600 text-sm rounded-xl flex items-center gap-2">
                                <LucideIcon name="AlertTriangle" className="h-4 w-4 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}
                        {success && (
                            <div className="mb-5 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl flex items-center gap-2">
                                <LucideIcon name="CheckCircle" className="h-4 w-4 shrink-0" />
                                <span>{success}</span>
                            </div>
                        )}

                        {/* ── LOGIN FORM ── */}
                        {view === 'login' && (
                            <form onSubmit={handleLogin} className="space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-1.5">Email ou Identifiant</label>
                                    <input
                                        type="text" required value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="votre.email@capsy.com"
                                        className="w-full p-3.5 border-2 border-gray-200 rounded-xl outline-none focus:border-brand-wellbeing transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-1.5">Mot de passe</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'} required value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full p-3.5 pr-12 border-2 border-gray-200 rounded-xl outline-none focus:border-brand-wellbeing transition-colors"
                                        />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-gray-text hover:text-brand-dark transition-colors">
                                            <LucideIcon name={showPassword ? 'EyeOff' : 'Eye'} className="h-5 w-5" />
                                        </button>
                                    </div>
                                    <button type="button" onClick={() => switchView('reset')}
                                        className="text-xs text-brand-wellbeing hover:underline mt-1.5 block text-right">
                                        Mot de passe oublié ?
                                    </button>
                                </div>
                                <button type="submit" disabled={isLoading}
                                    className="w-full py-3.5 bg-brand-wellbeing hover:bg-brand-wellbeing/90 text-white font-bold font-poppins rounded-xl transition-all shadow-md flex items-center justify-center gap-2">
                                    {isLoading ? <><LucideIcon name="Loader2" className="h-5 w-5 animate-spin" /><span>Connexion...</span></> : <><LucideIcon name="LogIn" className="h-5 w-5" /><span>Se connecter</span></>}
                                </button>
                                <p className="text-center text-xs text-brand-gray-text">
                                    Pas encore de compte ?{' '}
                                    <button type="button" onClick={() => switchView('register')} className="text-brand-wellbeing font-bold hover:underline">
                                        Créer un compte
                                    </button>
                                </p>
                            </form>
                        )}

                        {/* ── REGISTER FORM ── */}
                        {view === 'register' && (
                            <form onSubmit={handleRegister} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-1.5">Nom complet</label>
                                    <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
                                        placeholder="Jean-Paul Mutombo"
                                        className="w-full p-3.5 border-2 border-gray-200 rounded-xl outline-none focus:border-brand-wellbeing transition-colors" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-1.5">Email</label>
                                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                                        placeholder="votre.email@exemple.com"
                                        className="w-full p-3.5 border-2 border-gray-200 rounded-xl outline-none focus:border-brand-wellbeing transition-colors" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-1.5">Mot de passe</label>
                                    <div className="relative">
                                        <input type={showPassword ? 'text' : 'password'} required value={password}
                                            onChange={(e) => setPassword(e.target.value)} placeholder="Minimum 8 caractères"
                                            className="w-full p-3.5 pr-12 border-2 border-gray-200 rounded-xl outline-none focus:border-brand-wellbeing transition-colors" />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-gray-text hover:text-brand-dark">
                                            <LucideIcon name={showPassword ? 'EyeOff' : 'Eye'} className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                                <button type="submit" disabled={isLoading}
                                    className="w-full py-3.5 bg-brand-wellbeing hover:bg-brand-wellbeing/90 text-white font-bold font-poppins rounded-xl transition-all shadow-md flex items-center justify-center gap-2">
                                    {isLoading ? <><LucideIcon name="Loader2" className="h-5 w-5 animate-spin" /><span>Création...</span></> : <><LucideIcon name="UserPlus" className="h-5 w-5" /><span>Créer mon compte</span></>}
                                </button>
                                <p className="text-center text-xs text-brand-gray-text">
                                    Déjà un compte ?{' '}
                                    <button type="button" onClick={() => switchView('login')} className="text-brand-wellbeing font-bold hover:underline">Se connecter</button>
                                </p>
                            </form>
                        )}

                        {/* ── RESET FORM ── */}
                        {view === 'reset' && (
                            <form onSubmit={handleResetPassword} className="space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-1.5">Adresse email</label>
                                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                                        placeholder="votre.email@exemple.com"
                                        className="w-full p-3.5 border-2 border-gray-200 rounded-xl outline-none focus:border-brand-wellbeing transition-colors" />
                                </div>
                                <button type="submit" disabled={isLoading}
                                    className="w-full py-3.5 bg-brand-wellbeing hover:bg-brand-wellbeing/90 text-white font-bold font-poppins rounded-xl transition-all shadow-md flex items-center justify-center gap-2">
                                    {isLoading ? <><LucideIcon name="Loader2" className="h-5 w-5 animate-spin" /><span>Envoi...</span></> : <><LucideIcon name="Send" className="h-5 w-5" /><span>Envoyer le lien</span></>}
                                </button>
                                <p className="text-center text-xs text-brand-gray-text">
                                    <button type="button" onClick={() => switchView('login')} className="text-brand-wellbeing font-bold hover:underline">← Retour à la connexion</button>
                                </p>
                            </form>
                        )}

                        <button onClick={onClose} className="mt-6 w-full text-xs text-brand-gray-text hover:text-brand-dark font-medium transition-colors">Fermer</button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
