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
        const appointmentTypeId = req.query.appointment_type_id as string | undefined;
        const params = new URLSearchParams();
        if (appointmentTypeId) params.append('appointment_type_id', appointmentTypeId);
        if (serviceTitle) params.append('service_title', serviceTitle);
        const queryParam = params.toString() ? `?${params.toString()}` : '';

        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (req.headers.authorization) {
            headers['Authorization'] = String(req.headers.authorization);
        } else if (process.env.ODOO_USERNAME && process.env.ODOO_PASSWORD) {
            const token = Buffer.from(`${process.env.ODOO_USERNAME}:${process.env.ODOO_PASSWORD}`).toString('base64');
            headers['Authorization'] = `Basic ${token}`;
        }

        const upstream = await fetch(`${FASTAPI_BASE}/therapists/${queryParam}`, {
            method: 'GET',
            headers,
        });

        const data = await upstream.json();
        return res.status(upstream.status).json(data);
    } catch (err: any) {
        console.error('[/api/therapists] Error:', err.message);
        return res.status(502).json({ error: `Impossible de joindre le service FastAPI: ${err.message}` });
    }
}
