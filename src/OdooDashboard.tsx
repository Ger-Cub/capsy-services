import React, { useState, useEffect } from 'react';
import Logo from './components/Logo';
import { getFastApiUrl } from './config/api';

const APPS = [
    { id: "discussion", label: "Discussion", icon: "💬", color: "bg-orange-500" },
    { id: "calendar", label: "Calendrier", icon: "📅", color: "bg-blue-500" },
    { id: "appointments", label: "Rendez-vous", icon: "⏰", color: "bg-indigo-600" },
    { id: "todo", label: "To-do", icon: "✅", color: "bg-emerald-500" },
    { id: "knowledge", label: "Knowledge", icon: "📚", color: "bg-amber-400" },
    { id: "contacts", label: "Contacts", icon: "👤", color: "bg-cyan-500" },
    { id: "crm", label: "CRM", icon: "🤝", color: "bg-rose-500" },
    { id: "sales", label: "Ventes", icon: "📈", color: "bg-sky-400" },
    { id: "accounting", label: "Comptabilité", icon: "💰", color: "bg-teal-600" },
    { id: "documents", label: "Documents", icon: "📄", color: "bg-blue-400" },
    { id: "timesheets", label: "Timesheets", icon: "⏱️", color: "bg-blue-700" },
    { id: "employees", label: "Employés", icon: "👨‍💼", color: "bg-red-500" },
    { id: "inventory", label: "Inventaire", icon: "📦", color: "bg-orange-400" },
    { id: "leave", label: "Congés", icon: "✈️", color: "bg-emerald-400" },
];

export default function OdooDashboard() {
    const [creds, setCreds] = useState<any>(null);
    const [currentApp, setCurrentApp] = useState<any>(null);
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [showLogin, setShowLogin] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('odoo_creds');
        if (saved) {
            setCreds(JSON.parse(saved));
            setShowLogin(false);
            return;
        }

        // If the user is logged into CAPSY and we have Odoo info, prefill bridge creds
        const capsUser = localStorage.getItem('capsy_user');
        if (capsUser) {
            try {
                const u = JSON.parse(capsUser);
                const inferred = {
                    url: u.instance || u.instance_url || '',
                    db: u.database || u.db || '',
                    username: u.login || u.username || u.email || '',
                    // password/token is intentionally not set here
                };
                // if we have at least url and db, use it to bypass the local bridge login
                if (inferred.url && inferred.db) {
                    localStorage.setItem('odoo_creds', JSON.stringify(inferred));
                    setCreds(inferred);
                    setShowLogin(false);
                    return;
                }
            } catch (e) {
                // fall through to showing login
            }
        }

        setShowLogin(true);
    }, []);

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

    const fetchAppData = async (appId: string) => {
        setLoading(true);
        try {
            const response = await fetch(`${getFastApiUrl()}/${appId}/?limit=10`);
            const result = await response.json();
            setData(result);
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    const selectApp = (app: any) => {
        setCurrentApp(app);
        fetchAppData(app.id);
    };

    if (showLogin) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl border border-gray-100 p-8 w-full max-w-md shadow-2xl">
                    <h2 className="text-3xl font-black text-brand-dark mb-2">Connecter Odoo</h2>
                    <p className="text-brand-gray-text mb-8 text-sm">Entrez vos identifiants Odoo pour accéder au pont Capsy.</p>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-xs uppercase tracking-widest text-brand-gray-text font-bold mb-2">URL Odoo</label>
                            <input name="url" defaultValue="https://essaiek3.odoo.com" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-brand-dark outline-none focus:border-brand-wellbeing transition-colors" />
                        </div>
                        <div>
                            <label className="block text-xs uppercase tracking-widest text-brand-gray-text font-bold mb-2">Base de données</label>
                            <input name="db" defaultValue="essaiek3" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-brand-dark outline-none focus:border-brand-wellbeing transition-colors" />
                        </div>
                        <div>
                            <label className="block text-xs uppercase tracking-widest text-brand-gray-text font-bold mb-2">Email / Username</label>
                            <input name="username" defaultValue="bahavukevin@gmail.com" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-brand-dark outline-none focus:border-brand-wellbeing transition-colors" />
                        </div>
                        <div>
                            <label className="block text-xs uppercase tracking-widest text-brand-gray-text font-bold mb-2">Mot de passe / Token</label>
                            <input name="password" type="password" placeholder="••••••••" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-brand-dark outline-none focus:border-brand-wellbeing transition-colors" />
                        </div>
                        <button type="submit" className="w-full bg-linear-to-r from-brand-wellbeing to-brand-green-fresh text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-brand-wellbeing/20 transition-all active:scale-95">
                            Initialiser le Bridge 🚀
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white text-brand-dark font-sans overflow-x-hidden">
            {/* Header */}
            <header className="px-8 py-6 flex justify-between items-center border-b border-gray-150 bg-white/95 sticky top-0 z-50">
                <div className="flex items-center gap-4">
                        <button
                        onClick={() => setCurrentApp(null)}
                        className={`p-2 rounded-lg hover:bg-gray-100 transition-colors ${currentApp ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                    >
                        ←
                    </button>
                    <div className="text-2xl font-black tracking-tighter">
                        CAPSY<span className="text-brand-wellbeing">BRIDGE</span>
                    </div>
                </div>
                <div className="flex items-center gap-4 w-full">
                    <div className="flex-1 flex items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-brand-wellbeing flex items-center justify-center text-xs font-bold text-white">BK</div>
                            <span className="text-sm font-medium text-brand-dark">{creds?.username}</span>
                        </div>
                    </div>

                    {/* Center: logo / return to site */}
                    <div className="flex-1 flex items-center justify-center">
                        <a href="/" className="inline-flex items-center gap-3 py-2 px-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md text-sm font-bold">
                            <Logo size="sm" className="w-auto!" />
                            <span>Retour sur le site</span>
                        </a>
                    </div>

                    {/* Right: avatar + logout */}
                    <div className="flex-1 flex items-center justify-end gap-3">
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-brand-gray-light flex items-center justify-center text-brand-wellbeing font-black">{(function(){
                                try{
                                    const caps = localStorage.getItem('capsy_user');
                                    if(!caps) return '??';
                                    const u = JSON.parse(caps);
                                    const initials = u.name ? u.name.split(' ').map((n:string)=>n[0]).join('').slice(0,2).toUpperCase() : (u.username||u.email||'??').slice(0,2).toUpperCase();
                                    return initials;
                                }catch(e){return '??'}
                            })()}</div>
                            <button onClick={() => {
                                // clear odoo bridge creds and capsy user
                                localStorage.removeItem('odoo_creds');
                                localStorage.removeItem('capsy_user');
                                // signal auth change to host app
                                window.dispatchEvent(new Event('auth-changed'));
                                setCreds(null);
                                setShowLogin(true);
                            }} className="py-2 px-4 bg-rose-50 hover:bg-rose-100 text-rose-600 border-2 border-rose-200 rounded-xl font-bold text-sm">Déconnexion</button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-8">
                {!currentApp ? (
                    <>
                        <h2 className="text-4xl font-black mb-2">Dashboard Odoo</h2>
                        <p className="text-slate-400 mb-12">Sélectionnez une application pour synchroniser et gérer vos données en temps réel.</p>

                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                            {APPS.map(app => (
                                <button
                                    key={app.id}
                                    onClick={() => selectApp(app)}
                                    className="group flex flex-col items-center gap-4 p-6 bg-white border border-gray-100 rounded-3xl hover:shadow-lg transition-all hover:-translate-y-2"
                                >
                                    <div className={`w-20 h-20 ${app.color} rounded-sm flex items-center justify-center text-3xl shadow-xl group-hover:scale-110 transition-transform`}>
                                        {app.icon}
                                    </div>
                                    <span className="text-sm font-bold tracking-tight text-center">{app.label}</span>
                                </button>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="flex justify-between items-end mb-8">
                            <div>
                                <h2 className="text-5xl font-black mb-2">{currentApp.label}</h2>
                                <p className="text-brand-wellbeing font-mono text-sm tracking-tighter uppercase">{currentApp.id} / synchronization live</p>
                            </div>
                            <button className="bg-brand-wellbeing text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:bg-brand-wellbeing-dark transition-colors">
                                + Nouveau {currentApp.label}
                            </button>
                        </div>

                        {loading ? (
                            <div className="h-96 flex items-center justify-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-wellbeing"></div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-gray-100 text-slate-600 text-xs uppercase tracking-widest font-bold">
                                            <th className="px-6 py-4">ID</th>
                                            <th className="px-6 py-4">Nom / Libellé</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {data.length > 0 ? data.map((item: any) => (
                                            <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
                                                <td className="px-6 py-4 font-mono text-slate-500 text-sm">{item.id}</td>
                                                <td className="px-6 py-4 font-bold">{item.data.display_name || item.data.name || "Élément sans nom"}</td>
                                                <td className="px-6 py-4">
                                                    <span className="bg-brand-green-fresh/20 text-brand-green-fresh px-3 py-1 rounded-full text-xs font-bold uppercase tracking-tighter">Synchronisé</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button className="text-brand-wellbeing opacity-0 group-hover:opacity-100 transition-opacity font-bold text-sm">Modifier</button>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-12 text-center text-slate-500 italic">Aucune donnée trouvée pour ce module.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
