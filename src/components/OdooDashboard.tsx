import React, { useState, useEffect } from 'react';
import Logo from './Logo';

import { getFastApiUrl, getAppointmentsUrl } from '../config/api';

// Constante pour l'URL de l'API bridge (fallback)
const API_BASE_URL = getFastApiUrl();

// Configuration des applications Odoo avec icônes adaptées à la charte CAPSY
const APPS = [
    { id: "discussion", label: "Discussion", icon: "💬", color: "#008738" },
    { id: "calendar", label: "Calendrier", icon: "📅", color: "#008738" },
    { id: "appointments", label: "Rendez-vous", icon: "⏰", color: "#008738" },
    { id: "todo", label: "To-do", icon: "✅", color: "#008738" },
    { id: "knowledge", label: "Connaissances", icon: "📚", color: "#008738" },
    { id: "contacts", label: "Contacts", icon: "👤", color: "#008738" },
    { id: "crm", label: "CRM", icon: "🤝", color: "#008738" },
    { id: "sales", label: "Ventes", icon: "📈", color: "#008738" },
    { id: "accounting", label: "Comptabilité", icon: "💰", color: "#008738" },
    { id: "documents", label: "Documents", icon: "📄", color: "#008738" },
    { id: "project", label: "Projet", icon: "📋", color: "#008738" },
    { id: "timesheets", label: "Feuilles de temps", icon: "⏱️", color: "#008738" },
    { id: "employees", label: "Employés", icon: "👨‍💼", color: "#008738" },
    { id: "leave", label: "Congés", icon: "✈️", color: "#008738" },
    { id: "inventory", label: "Inventaire", icon: "📦", color: "#008738" },
    { id: "elearning", label: "eLearning", icon: "🎓", color: "#008738" },
    { id: "marketing", label: "Marketing Auto.", icon: "📢", color: "#008738" },
    { id: "events", label: "Événements", icon: "🎪", color: "#008738" },
];

// Couleurs de la charte CAPSY
const COLORS = {
    primary: '#008738',
    primaryLight: '#91FCA3',
    primaryDark: '#003600',
    white: '#FFFFFF',
    grayLight: '#F5F5F5',
    grayText: '#555555',
    grayBorder: '#E8E8E8',
    shadow: 'rgba(0, 135, 56, 0.15)',
    shadowHover: 'rgba(0, 135, 56, 0.25)',
};

export default function OdooDashboard() {
    const [creds, setCreds] = useState<any>(null);
    const [currentApp, setCurrentApp] = useState<any>(null);
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [showLogin, setShowLogin] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('all');

    // Récupération des identifiants Odoo
    useEffect(() => {
        const saved = localStorage.getItem('odoo_creds');
        if (saved) {
            setCreds(JSON.parse(saved));
            setShowLogin(false);
            return;
        }

        const capsUser = localStorage.getItem('capsy_user');
        if (capsUser) {
            try {
                const u = JSON.parse(capsUser);
                const inferred = {
                    url: u.instance || u.instance_url || '',
                    db: u.database || u.db || '',
                    username: u.login || u.username || u.email || '',
                };
                if (inferred.url && inferred.db) {
                    localStorage.setItem('odoo_creds', JSON.stringify(inferred));
                    setCreds(inferred);
                    setShowLogin(false);
                    return;
                }
            } catch (e) {
                // fall through
            }
        }

        setShowLogin(true);
    }, []);

    // Gestion de la connexion
    const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const newCreds = {
            url: formData.get('url'),
            db: formData.get('db'),
            username: formData.get('username'),
            password: formData.get('password'),
        };
        localStorage.setItem('odoo_creds', JSON.stringify(newCreds));
        setCreds(newCreds);
        setShowLogin(false);
    };

    // Récupération des données de l'application Odoo
    const fetchAppData = async (appId: string) => {
        setLoading(true);
        try {
            // Use server-side proxies when available to avoid CORS (production)
            if (appId === 'appointments') {
                const resp = await fetch(getAppointmentsUrl());
                if (!resp.ok) throw new Error('Upstream error');
                const json = await resp.json();
                setData(json.appointments || json || []);
            } else if (appId === 'products' || appId === 'services') {
                // Use the /api/odoo proxy to list products
                const resp = await fetch('/api/odoo', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'list_products', params: { limit: 20 } }),
                });
                if (!resp.ok) throw new Error('Upstream error');
                const json = await resp.json();
                const products = json.products || [];
                setData(products.map((p: any) => ({ id: p.id, data: p })));
            } else {
                // For other apps we either don't proxy or no endpoint exists — keep empty list
                setData([]);
            }
        } catch (error) {
            console.error("Erreur de récupération:", error);
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    // Sélection d'une application
    const selectApp = (app: any) => {
        setCurrentApp(app);
        fetchAppData(app.id);
        setSearchQuery('');
        setSelectedFilter('all');
    };

    // Retour au dashboard
    const goBack = () => {
        setCurrentApp(null);
        setData([]);
    };

    // Filtrer les données
    const filteredData = data.filter((item: any) => {
        const search = searchQuery.toLowerCase();
        const name = (item.data?.display_name || item.data?.name || '').toLowerCase();
        const matchesSearch = name.includes(search);
        
        if (selectedFilter === 'all') return matchesSearch;
        // Ajouter d'autres filtres si nécessaire
        return matchesSearch;
    });

    // Composant de connexion
    if (showLogin) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: COLORS.grayLight }}>
                <div className="bg-white rounded-3xl p-10 w-full max-w-md" style={{ 
                    boxShadow: `0 20px 60px ${COLORS.shadow}`,
                    border: `1px solid ${COLORS.grayBorder}`
                }}>
                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-4">
                            <Logo size="lg" />
                        </div>
                        <h2 className="text-3xl font-bold" style={{ color: COLORS.primaryDark }}>
                            CAPSY<span style={{ color: COLORS.primary }}>BRIDGE</span>
                        </h2>
                        <p className="text-sm mt-2" style={{ color: COLORS.grayText }}>
                            Connectez-vous à votre instance Odoo
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: COLORS.grayText }}>
                                URL Odoo
                            </label>
                            <input 
                                name="url" 
                                defaultValue="https://essaiek3.odoo.com" 
                                className="w-full px-4 py-3 rounded-xl border outline-none transition-all"
                                style={{ 
                                    borderColor: COLORS.grayBorder,
                                    backgroundColor: COLORS.grayLight,
                                    color: COLORS.primaryDark
                                }}
                                onFocus={(e) => e.currentTarget.style.borderColor = COLORS.primary}
                                onBlur={(e) => e.currentTarget.style.borderColor = COLORS.grayBorder}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: COLORS.grayText }}>
                                Base de données
                            </label>
                            <input 
                                name="db" 
                                defaultValue="essaiek3" 
                                className="w-full px-4 py-3 rounded-xl border outline-none transition-all"
                                style={{ 
                                    borderColor: COLORS.grayBorder,
                                    backgroundColor: COLORS.grayLight,
                                    color: COLORS.primaryDark
                                }}
                                onFocus={(e) => e.currentTarget.style.borderColor = COLORS.primary}
                                onBlur={(e) => e.currentTarget.style.borderColor = COLORS.grayBorder}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: COLORS.grayText }}>
                                Email / Nom d'utilisateur
                            </label>
                            <input 
                                name="username" 
                                defaultValue="bahavukevin@gmail.com" 
                                className="w-full px-4 py-3 rounded-xl border outline-none transition-all"
                                style={{ 
                                    borderColor: COLORS.grayBorder,
                                    backgroundColor: COLORS.grayLight,
                                    color: COLORS.primaryDark
                                }}
                                onFocus={(e) => e.currentTarget.style.borderColor = COLORS.primary}
                                onBlur={(e) => e.currentTarget.style.borderColor = COLORS.grayBorder}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: COLORS.grayText }}>
                                Mot de passe / Token
                            </label>
                            <input 
                                name="password" 
                                type="password" 
                                placeholder="••••••••" 
                                className="w-full px-4 py-3 rounded-xl border outline-none transition-all"
                                style={{ 
                                    borderColor: COLORS.grayBorder,
                                    backgroundColor: COLORS.grayLight,
                                    color: COLORS.primaryDark
                                }}
                                onFocus={(e) => e.currentTarget.style.borderColor = COLORS.primary}
                                onBlur={(e) => e.currentTarget.style.borderColor = COLORS.grayBorder}
                            />
                        </div>
                        <button 
                            type="submit" 
                            className="w-full text-white font-bold py-4 rounded-xl transition-all hover:scale-[1.02] active:scale-95"
                            style={{ 
                                background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})`,
                                boxShadow: `0 8px 24px ${COLORS.shadow}`
                            }}
                        >
                            Initialiser le Bridge 🚀
                        </button>
                    </form>

                    <p className="text-center text-xs mt-6" style={{ color: COLORS.grayText }}>
                        Vos identifiants sont stockés localement et sécurisés
                    </p>
                </div>
            </div>
        );
    }

    // Composant principal du dashboard
    return (
        <div className="min-h-screen" style={{ backgroundColor: COLORS.grayLight }}>
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b" style={{ borderColor: COLORS.grayBorder }}>
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    {/* Logo et navigation */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={goBack}
                            className={`p-2 rounded-xl transition-all ${currentApp ? 'opacity-100 hover:bg-gray-100' : 'opacity-0 pointer-events-none'}`}
                            style={{ color: COLORS.primary }}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </button>
                        <div className="text-2xl font-bold tracking-tight">
                            CAPSY<span style={{ color: COLORS.primary }}>BRIDGE</span>
                        </div>
                    </div>

                    {/* Recherche */}
                    <div className="flex-1 max-w-md mx-8">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Rechercher..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-4 py-2 rounded-xl border outline-none transition-all"
                                style={{ 
                                    borderColor: COLORS.grayBorder,
                                    backgroundColor: COLORS.grayLight,
                                    color: COLORS.primaryDark,
                                    paddingLeft: '40px'
                                }}
                                onFocus={(e) => e.currentTarget.style.borderColor = COLORS.primary}
                                onBlur={(e) => e.currentTarget.style.borderColor = COLORS.grayBorder}
                            />
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: COLORS.grayText }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>

                    {/* Profil utilisateur */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: COLORS.primary }}>
                                {(function(){
                                    try{
                                        const caps = localStorage.getItem('capsy_user');
                                        if(!caps) return '??';
                                        const u = JSON.parse(caps);
                                        const initials = u.name ? u.name.split(' ').map((n:string)=>n[0]).join('').slice(0,2).toUpperCase() : (u.username||u.email||'??').slice(0,2).toUpperCase();
                                        return initials;
                                    }catch(e){return '??'}
                                })()}
                            </div>
                            <span className="text-sm font-medium" style={{ color: COLORS.primaryDark }}>
                                {creds?.username?.split('@')[0] || 'Utilisateur'}
                            </span>
                        </div>
                        <button
                            onClick={() => {
                                localStorage.removeItem('odoo_creds');
                                localStorage.removeItem('capsy_user');
                                window.dispatchEvent(new Event('auth-changed'));
                                setCreds(null);
                                setShowLogin(true);
                            }}
                            className="px-4 py-2 rounded-xl font-bold text-sm transition-all hover:scale-105"
                            style={{ 
                                backgroundColor: '#FEE2E2',
                                color: '#DC2626',
                                border: '2px solid #FECACA'
                            }}
                        >
                            Déconnexion
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                {!currentApp ? (
                    // Vue Dashboard
                    <>
                        <div className="mb-8">
                            <h1 className="text-4xl font-bold mb-2" style={{ color: COLORS.primaryDark }}>
                                Tableau de bord Odoo
                            </h1>
                            <p className="text-sm" style={{ color: COLORS.grayText }}>
                                Sélectionnez une application pour synchroniser et gérer vos données en temps réel
                            </p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {APPS.map(app => (
                                <button
                                    key={app.id}
                                    onClick={() => selectApp(app)}
                                    className="group bg-white rounded-2xl p-6 text-center transition-all hover:scale-105"
                                    style={{ 
                                        border: `1px solid ${COLORS.grayBorder}`,
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.boxShadow = `0 12px 40px ${COLORS.shadow}`;
                                        e.currentTarget.style.borderColor = COLORS.primary;
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                                        e.currentTarget.style.borderColor = COLORS.grayBorder;
                                    }}
                                >
                                    <div 
                                        className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3 transition-transform group-hover:scale-110"
                                        style={{ 
                                            backgroundColor: `${COLORS.primary}15`,
                                            color: COLORS.primary
                                        }}
                                    >
                                        {app.icon}
                                    </div>
                                    <span className="text-sm font-semibold" style={{ color: COLORS.primaryDark }}>
                                        {app.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </>
                ) : (
                    // Vue Application
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                        {/* En-tête de l'application */}
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                            <div>
                                <h2 className="text-3xl font-bold" style={{ color: COLORS.primaryDark }}>
                                    {currentApp.label}
                                </h2>
                                <p className="text-xs font-mono uppercase tracking-wider" style={{ color: COLORS.primary }}>
                                    {currentApp.id} • Synchronisation en temps réel
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    className="px-4 py-2 rounded-xl font-bold transition-all hover:scale-105"
                                    style={{ 
                                        backgroundColor: COLORS.grayLight,
                                        color: COLORS.grayText,
                                        border: `1px solid ${COLORS.grayBorder}`
                                    }}
                                >
                                    🔄 Actualiser
                                </button>
                                <button
                                    className="px-6 py-2 rounded-xl text-white font-bold transition-all hover:scale-105"
                                    style={{ 
                                        background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})`,
                                        boxShadow: `0 4px 16px ${COLORS.shadow}`
                                    }}
                                >
                                    + Nouveau
                                </button>
                            </div>
                        </div>

                        {/* Filtres */}
                        <div className="flex flex-wrap gap-2 mb-6">
                            {['all', 'actif', 'archivé'].map((filter) => (
                                <button
                                    key={filter}
                                    onClick={() => setSelectedFilter(filter)}
                                    className="px-4 py-1.5 rounded-full text-sm font-medium transition-all"
                                    style={{
                                        backgroundColor: selectedFilter === filter ? COLORS.primary : COLORS.grayLight,
                                        color: selectedFilter === filter ? COLORS.white : COLORS.grayText,
                                        border: `1px solid ${selectedFilter === filter ? COLORS.primary : COLORS.grayBorder}`
                                    }}
                                >
                                    {filter === 'all' ? 'Tous' : filter}
                                </button>
                            ))}
                        </div>

                        {/* Tableau des données */}
                        {loading ? (
                            <div className="h-96 flex flex-col items-center justify-center gap-4">
                                <div className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: COLORS.primary, borderTopColor: 'transparent' }}></div>
                                <p className="text-sm" style={{ color: COLORS.grayText }}>Chargement des données...</p>
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: COLORS.grayBorder }}>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr style={{ backgroundColor: COLORS.grayLight }}>
                                                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: COLORS.grayText }}>ID</th>
                                                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: COLORS.grayText }}>Nom</th>
                                                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: COLORS.grayText }}>Statut</th>
                                                <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wider" style={{ color: COLORS.grayText }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y" style={{ borderColor: COLORS.grayBorder }}>
                                            {filteredData.length > 0 ? (
                                                filteredData.map((item: any) => (
                                                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                                                        <td className="px-6 py-3 font-mono text-sm" style={{ color: COLORS.grayText }}>
                                                            #{item.id}
                                                        </td>
                                                        <td className="px-6 py-3 font-medium" style={{ color: COLORS.primaryDark }}>
                                                            {item.data?.display_name || item.data?.name || "Sans nom"}
                                                        </td>
                                                        <td className="px-6 py-3">
                                                            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5" style={{ 
                                                                backgroundColor: `${COLORS.primary}15`,
                                                                color: COLORS.primary
                                                            }}>
                                                                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS.primary }}></span>
                                                                Synchronisé
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-3 text-right">
                                                            <button className="text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: COLORS.primary }}>
                                                                Modifier
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={4} className="px-6 py-12 text-center">
                                                        <div className="flex flex-col items-center gap-2">
                                                            <span className="text-4xl">📭</span>
                                                            <p className="text-sm" style={{ color: COLORS.grayText }}>Aucune donnée trouvée</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pied du tableau */}
                                {filteredData.length > 0 && (
                                    <div className="px-6 py-3 flex items-center justify-between border-t" style={{ borderColor: COLORS.grayBorder }}>
                                        <span className="text-sm" style={{ color: COLORS.grayText }}>
                                            {filteredData.length} élément{filteredData.length > 1 ? 's' : ''}
                                        </span>
                                        <div className="flex gap-1">
                                            <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" style={{ color: COLORS.grayText }}>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                </svg>
                                            </button>
                                            <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" style={{ color: COLORS.grayText }}>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="border-t mt-12" style={{ borderColor: COLORS.grayBorder }}>
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="text-xs" style={{ color: COLORS.grayText }}>
                        CAPSY<span style={{ color: COLORS.primary }}>BRIDGE</span> • Interface Odoo personnalisée
                    </div>
                    <div className="text-xs" style={{ color: COLORS.grayText }}>
                        © {new Date().getFullYear()} CAPSY SERVICES
                    </div>
                </div>
            </footer>
        </div>
    );
}