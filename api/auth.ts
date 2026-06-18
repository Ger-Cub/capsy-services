import type { VercelRequest, VercelResponse } from '@vercel/node';
import xmlrpc from 'xmlrpc';

const createClient = (path: string, odooUrl: string) => {
    const url = new URL(path, odooUrl);
    return xmlrpc.createSecureClient({
        host: url.hostname,
        port: parseInt(url.port) || 443,
        path: url.pathname + url.search
    });
};

const callOdoo = (path: string, method: string, params: any[], odooUrl: string): Promise<any> => {
    return new Promise((resolve, reject) => {
        const client = createClient(path, odooUrl);
        client.methodCall(method, params, (error, value) => {
            if (error) {
                reject(error);
            } else {
                resolve(value);
            }
        });
    });
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const ODOO_URL = process.env.ODOO_URL || '';
    const ODOO_DB = process.env.ODOO_DB || '';

    if (!ODOO_URL || !ODOO_URL.startsWith('http')) {
        console.error('[Auth API] Config error: ODOO_URL is missing or invalid:', ODOO_URL);
        return res.status(500).json({ error: 'Configuration Odoo incomplète : l\'URL Odoo est absente ou malformée dans le fichier .env' });
    }

    try {
        const { action, username, password } = req.body;
        if (action === 'login') {
            console.log(`[Auth API] Attempting login for ${username}...`);
            const uid = await callOdoo('/xmlrpc/2/common', 'authenticate', [
                ODOO_DB,
                username,
                password,
                {}
            ], ODOO_URL);

            if (!uid) {
                return res.status(401).json({ error: 'Identifiants incorrects' });
            }

            // Fetch user info
            const userData = await callOdoo('/xmlrpc/2/object', 'execute_kw', [
                ODOO_DB, uid, password,
                'res.users', 'read',
                [[uid]],
                { fields: ['name', 'email', 'partner_id'] }
            ], ODOO_URL);

            if (!userData || userData.length === 0) {
                return res.status(500).json({ error: 'Impossible de récupérer les infos utilisateur' });
            }

            const user = userData[0];
            return res.status(200).json({
                success: true,
                user: {
                    id: uid,
                    name: user.name,
                    email: user.email,
                    partner_id: user.partner_id[0],
                    token: Buffer.from(`${username}:${password}`).toString('base64')
                }
            });
        }

        return res.status(400).json({ error: 'Unknown action' });

    } catch (error: any) {
        console.error('[Auth API] Error:', error);
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
}
