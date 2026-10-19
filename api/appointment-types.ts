import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Proxy server-side vers le FastAPI capsy-odoo-api pour lister les types de rendez-vous Odoo.
 * Évite les erreurs CORS et transmet l'authentification si configurée.
 * Route: GET /api/appointment-types?limit=50
 */
const FASTAPI_BASE = (process.env.ODOO_API_URL || 'http://localhost:8000').replace(/\/$/, '');

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Méthode non autorisée' });
    }

    try {
        const limit = req.query.limit || '50';
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };

        if (req.headers.authorization) {
            headers['Authorization'] = String(req.headers.authorization);
        } else if (process.env.ODOO_USERNAME && process.env.ODOO_PASSWORD) {
            const token = Buffer.from(`${process.env.ODOO_USERNAME}:${process.env.ODOO_PASSWORD}`).toString('base64');
            headers['Authorization'] = `Basic ${token}`;
        }

        const upstream = await fetch(`${FASTAPI_BASE}/appointments/types/?limit=${limit}`, {
            method: 'GET',
            headers,
        });

        const data = await upstream.json();
        return res.status(upstream.status).json(data);
    } catch (err: any) {
        console.error('[/api/appointment-types] Error:', err.message);
        return res.status(502).json({ error: `Impossible de joindre le service FastAPI: ${err.message}` });
    }
}
