import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Proxy de l'API Auth vers la FastAPI capsy-odoo-api (http://localhost:8000).
 * Remplace l'ancienne implémentation XML-RPC par les endpoints JSON-RPC Session.
 */

const ODOO_API_BASE = process.env.ODOO_API_URL || 'http://localhost:8000';

async function callOdooAPI(endpoint: string, body: object): Promise<{ ok: boolean; status: number; data: any }> {
    try {
        const response = await fetch(`${ODOO_API_BASE}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        const data = await response.json();
        return { ok: response.ok, status: response.status, data };
    } catch (err: any) {
        return { ok: false, status: 502, data: { detail: `Impossible de joindre l'API Odoo : ${err.message}` } };
    }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Méthode non autorisée' });
    }

    const { action, username, password, name, email } = req.body || {};

    // ─── LOGIN ────────────────────────────────────────────────────────────────
    if (action === 'login') {
        if (!username || !password) {
            return res.status(400).json({ error: 'Email et mot de passe requis.' });
        }

        const { ok, status, data } = await callOdooAPI('/login', { username, password });

        if (!ok) {
            const msg = data?.detail || data?.message || 'Identifiants incorrects.';
            return res.status(status === 401 ? 401 : 500).json({ error: msg });
        }

        return res.status(200).json({
            success: true,
            user: {
                id:         data.uid,
                name:       data.name,
                email:      data.username,
                login:      data.username,
                company:    data.company,
                session_id: data.session_id,
                instance:   data.instance,
                database:   data.database,
                avatar:     null,
            },
        });
    }

    // ─── REGISTER / SIGNUP ───────────────────────────────────────────────────
    if (action === 'register') {
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Nom, email et mot de passe sont requis.' });
        }

        const { ok, status, data } = await callOdooAPI('/signup', {
            name,
            login: email,
            password,
        });

        if (!ok) {
            const msg = data?.detail || data?.message || 'Erreur lors de la création du compte.';
            // Odoo retourne 400 si l'email existe déjà
            const httpStatus = status === 400 ? 409 : (status || 500);
            return res.status(httpStatus).json({ error: msg });
        }

        return res.status(200).json({
            success: true,
            message: data.message || 'Compte créé avec succès. Vous pouvez vous connecter.',
        });
    }

    // ─── MOT DE PASSE OUBLIÉ ─────────────────────────────────────────────────
    if (action === 'reset_password') {
        if (!email) {
            return res.status(400).json({ error: 'Email requis pour la réinitialisation.' });
        }

        const { ok, data } = await callOdooAPI('/forgot-password', { login: email });

        if (!ok) {
            const msg = data?.detail || data?.message || 'Erreur lors de la réinitialisation.';
            return res.status(502).json({ error: msg });
        }

        return res.status(200).json({
            success: true,
            message: data.message || 'Si ce compte existe, un email de réinitialisation a été envoyé.',
        });
    }

    return res.status(400).json({ error: 'Action inconnue. Actions valides : login, register, reset_password.' });
}
