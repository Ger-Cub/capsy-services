import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Proxy serverless Vercel pour l'envoi de messages de contact vers le CRM Odoo (via FastAPI).
 * - Aucun secret côté client.
 * - Endpoint sécurisé : relaie vers POST /crm/contact-message du backend FastAPI.
 * - Route : POST /api/crm-contact
 */
const FASTAPI_BASE = (process.env.ODOO_API_URL || 'http://localhost:8000').replace(/\/$/, '');

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // En-têtes CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Request-Id');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Méthode non autorisée. Seul POST est accepté.'
    });
  }

  try {
    const body = req.body || {};
    const { name, email, message, phone, request_id, page_source, honeypot } = body;

    // Validation préalable côté proxy
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Le nom complet est obligatoire (au moins 2 caractères).'
      });
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({
        success: false,
        error: 'Une adresse e-mail valide est obligatoire.'
      });
    }

    if (!message || typeof message !== 'string' || message.trim().length < 5) {
      return res.status(400).json({
        success: false,
        error: 'Le message est obligatoire (au moins 5 caractères).'
      });
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Authentification technique optionnelle si configurée
    if (process.env.ODOO_USERNAME && process.env.ODOO_PASSWORD) {
      const token = Buffer.from(`${process.env.ODOO_USERNAME}:${process.env.ODOO_PASSWORD}`).toString('base64');
      headers['Authorization'] = `Basic ${token}`;
    }

    const upstream = await fetch(`${FASTAPI_BASE}/crm/contact-message`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: name.trim(),
        email: email.trim(),
        phone: typeof phone === 'string' ? phone.trim() : undefined,
        message: message.trim(),
        request_id: typeof request_id === 'string' ? request_id.trim() : undefined,
        page_source: typeof page_source === 'string' ? page_source.trim() : undefined,
        honeypot: typeof honeypot === 'string' ? honeypot : undefined,
      }),
    });

    let data: any;
    try {
      data = await upstream.json();
    } catch {
      data = { error: 'Réponse invalide du serveur FastAPI' };
    }

    if (!upstream.ok) {
      const detail = data?.detail || data?.error || 'Erreur lors du traitement du message';
      return res.status(upstream.status).json({
        success: false,
        error: detail
      });
    }

    return res.status(200).json(data);
  } catch (err: any) {
    console.error('[/api/crm-contact] Proxy error:', err.message);
    return res.status(502).json({
      success: false,
      error: `Impossible de contacter le service CRM de CAPSY: ${err.message}`
    });
  }
}
