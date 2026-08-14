import type { VercelRequest, VercelResponse } from '@vercel/node';

const FASTAPI_BASE = (process.env.ODOO_API_URL || 'http://localhost:8000').replace(/\/$/, '');

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Basic CORS for browser preflight
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // reconstruct upstream URL from the catch-all path
    const path = (req.query.path as string[]) || [];
    const upstreamPath = `/${path.join('/')}`;
    const qs = new URLSearchParams(req.query as Record<string, string>).toString();
    const url = `${FASTAPI_BASE}${upstreamPath}${qs ? `?${qs}` : ''}`;

    const headers: Record<string, string> = {};
    // forward content-type
    if (req.headers['content-type']) headers['Content-Type'] = String(req.headers['content-type']);

    // If Vercel env contains ODOO credentials, inject Basic Auth into upstream
    const username = process.env.ODOO_USERNAME;
    const password = process.env.ODOO_PASSWORD;
    if (username && password) {
      const token = Buffer.from(`${username}:${password}`).toString('base64');
      headers['Authorization'] = `Basic ${token}`;
    }

    // Fetch upstream
    const upstream = await fetch(url, {
      method: req.method as string,
      headers,
      body: ['GET', 'HEAD'].includes((req.method || 'GET').toUpperCase()) ? undefined : JSON.stringify(req.body),
    });

    // Proxy response status and body
    const text = await upstream.text();
    res.status(upstream.status);
    // copy some headers
    const ct = upstream.headers.get('content-type');
    if (ct) res.setHeader('Content-Type', ct);
    return res.send(text);
  } catch (err: any) {
    console.error('[/api/fastapi/*] proxy error', err);
    return res.status(502).json({ error: String(err) });
  }
}
