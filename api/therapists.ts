import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Proxy server-side vers le FastAPI capsy-odoo-api.
 * Évite les erreurs CORS en faisant l'appel depuis le serveur Vercel.
 * Route: GET /api/therapists?service_title=...
 */
const FASTAPI_BASE = (process.env.ODOO_API_URL || 'http://localhost:8000').replace(/\/$/, '');

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Autoriser les requêtes CORS depuis le frontend
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Méthode non autorisée' });
    }

    try {
        const serviceTitle = req.query.service_title as string | undefined;
        const queryParam = serviceTitle ? `?service_title=${encodeURIComponent(serviceTitle)}` : '';

        const upstream = await fetch(`${FASTAPI_BASE}/therapists/${queryParam}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        const data = await upstream.json();
        return res.status(upstream.status).json(data);
    } catch (err: any) {
        console.error('[/api/therapists] Error:', err.message);
        return res.status(502).json({ error: `Impossible de joindre le service FastAPI: ${err.message}` });
    }
}
