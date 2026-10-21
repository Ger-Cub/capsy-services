import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Proxy server-side vers le FastAPI pour calculer les créneaux horaires disponibles en temps réel.
 * Déduit les RDV déjà réservés via calendar.event Odoo.
 *
 * Route: GET /api/available-slots?appointment_type_id=14&date=2026-10-27&therapist_user_id=64
 */
const FASTAPI_BASE = (process.env.ODOO_API_URL || 'http://localhost:8000').replace(/\/$/, '');

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Méthode non autorisée' });

    const { appointment_type_id, date, therapist_user_id } = req.query;

    if (!appointment_type_id || !date) {
        return res.status(400).json({ error: 'Paramètres appointment_type_id et date requis' });
    }

    try {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (process.env.ODOO_USERNAME && process.env.ODOO_PASSWORD) {
            const token = Buffer.from(`${process.env.ODOO_USERNAME}:${process.env.ODOO_PASSWORD}`).toString('base64');
            headers['Authorization'] = `Basic ${token}`;
        }

        const params = new URLSearchParams({
            appointment_type_id: String(appointment_type_id),
            date: String(date),
        });
        if (therapist_user_id) params.set('therapist_user_id', String(therapist_user_id));

        const upstream = await fetch(`${FASTAPI_BASE}/appointments/available-slots?${params}`, {
            method: 'GET',
            headers,
        });

        const data = await upstream.json();
        return res.status(upstream.status).json(data);
    } catch (err: any) {
        console.error('[/api/available-slots] Error:', err.message);
        return res.status(502).json({ error: `Impossible de joindre le service FastAPI: ${err.message}` });
    }
}

