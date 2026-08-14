import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Proxy server-side vers le FastAPI capsy-odoo-api.
 * Évite les erreurs CORS et les 401 en faisant l'appel depuis le serveur Vercel.
 * Route: GET /api/products?limit=50
 */
const FASTAPI_BASE = (process.env.ODOO_API_URL || 'http://localhost:8000').replace(/\/$/, '');

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
        const limit = req.query.limit || '50';

        const upstream = await fetch(`${FASTAPI_BASE}/products/?limit=${limit}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        const data = await upstream.json();
        // Retourner au même format que l'action list_products
        if (Array.isArray(data)) {
            return res.status(200).json({ products: data.map((item: any) => item.data || item) });
        }
        return res.status(upstream.status).json(data);
    } catch (err: any) {
        console.error('[/api/products] Error:', err.message);
        return res.status(502).json({ error: `Impossible de joindre le service FastAPI: ${err.message}` });
    }
}
