import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Proxy server-side vers le FastAPI pour récupérer les détails complets d'un type de RDV Odoo :
 * - Descriptif (message_intro HTML)
 * - Questions dynamiques (mode de paiement, lieu, téléphone…)
 * - Créneaux hebdomadaires configurés (appointment.slot)
 * - Options (délai min/max, fuseau horaire)
 *
 * Route: GET /api/appointment-details?id=14
 */
const FASTAPI_BASE = (process.env.ODOO_API_URL || 'http://localhost:8000').replace(/\/$/, '');

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Méthode non autorisée' });

    const id = req.query.id;
    if (!id) return res.status(400).json({ error: 'Paramètre id requis' });

    try {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (process.env.ODOO_USERNAME && process.env.ODOO_PASSWORD) {
            const token = Buffer.from(`${process.env.ODOO_USERNAME}:${process.env.ODOO_PASSWORD}`).toString('base64');
            headers['Authorization'] = `Basic ${token}`;
        }

        const upstream = await fetch(`${FASTAPI_BASE}/appointments/types/${id}/details`, {
            method: 'GET',
            headers,
        });

        const data = await upstream.json();
        return res.status(upstream.status).json(data);
    } catch (err: any) {
        console.error('[/api/appointment-details] Error:', err.message);
        return res.status(502).json({ error: `Impossible de joindre le service FastAPI: ${err.message}` });
    }
}

