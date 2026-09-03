import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Proxy server-side vers le FastAPI capsy-odoo-api.
 * Évite les erreurs CORS en faisant l'appel depuis le serveur Vercel.
 * Route: GET /api/appointments-list?limit=10&future_only=true
 * Route: POST /api/appointments-list  → crée un rendez-vous
 */
const FASTAPI_BASE = (process.env.ODOO_API_URL || 'http://localhost:8000').replace(/\/$/, '');

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Autoriser les requêtes CORS depuis le frontend
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        if (req.method === 'GET') {
            const limit = req.query.limit || '10';
            const futureOnly = req.query.future_only || 'false';
            const mineOnly = req.query.mine_only || 'false';
            const partnerId = req.query.partner_id || '';
            
            const params = new URLSearchParams({
                limit: String(limit),
                future_only: String(futureOnly),
                mine_only: String(mineOnly),
            });
            if (partnerId) params.append('partner_id', String(partnerId));

            const headers: Record<string, string> = { 'Content-Type': 'application/json' };
            if (req.headers.authorization) {
                headers['Authorization'] = req.headers.authorization;
            }
            if (req.headers['x-session-id']) {
                headers['X-Session-ID'] = String(req.headers['x-session-id']);
            }

            const upstream = await fetch(`${FASTAPI_BASE}/appointments/?${params.toString()}`, {
                method: 'GET',
                headers,
            });

            const data = await upstream.json();
            return res.status(upstream.status).json(data);
        }

        if (req.method === 'POST') {
            const upstream = await fetch(`${FASTAPI_BASE}/appointments/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(req.body),
            });

            const data = await upstream.json();
            return res.status(upstream.status).json(data);
        }

        return res.status(405).json({ error: 'Méthode non autorisée' });
    } catch (err: any) {
        console.error('[/api/appointments-list] Error:', err.message);
        return res.status(502).json({ error: `Impossible de joindre le service FastAPI: ${err.message}` });
    }
}
