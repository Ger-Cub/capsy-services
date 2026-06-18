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
            if (error) reject(error);
            else resolve(value);
        });
    });
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const ODOO_URL = process.env.ODOO_URL || '';
    const ODOO_DB = process.env.ODOO_DB || '';

    if (!ODOO_URL || !ODOO_URL.startsWith('http')) {
        return res.status(500).json({ error: 'Configuration Odoo incomplète : URL manquante ou invalide dans .env' });
    }

    try {
        const { action, username, password, name, email } = req.body;

        // --- LOGIN ---
        if (action === 'login') {
            console.log(`[Auth API] Login attempt for: ${username}`);
            const uid = await callOdoo('/xmlrpc/2/common', 'authenticate', [
                ODOO_DB, username, password, {}
            ], ODOO_URL);

            if (!uid) {
                return res.status(401).json({ error: 'Identifiants incorrects. Vérifiez votre email et mot de passe.' });
            }

            const userData = await callOdoo('/xmlrpc/2/object', 'execute_kw', [
                ODOO_DB, uid, password,
                'res.users', 'read', [[uid]],
                { fields: ['name', 'email', 'partner_id', 'image_128', 'lang', 'tz', 'login'] }
            ], ODOO_URL);

            if (!userData || userData.length === 0) {
                return res.status(500).json({ error: 'Impossible de récupérer vos informations.' });
            }

            const u = userData[0];
            const avatar = u.image_128
                ? `data:image/png;base64,${u.image_128}`
                : null;

            return res.status(200).json({
                success: true,
                user: {
                    id: uid,
                    name: u.name,
                    email: u.email,
                    login: u.login,
                    partner_id: u.partner_id[0],
                    avatar,
                    lang: u.lang,
                    tz: u.tz,
                    token: Buffer.from(`${username}:${password}`).toString('base64')
                }
            });
        }

        // --- REGISTER (create partner then portal user) ---
        if (action === 'register') {
            if (!name || !email || !password) {
                return res.status(400).json({ error: 'Nom, email et mot de passe sont requis.' });
            }

            // Use admin credentials to create the user
            const ODOO_USER = process.env.ODOO_USERNAME || '';
            const ODOO_PASS = process.env.ODOO_PASSWORD || '';

            const adminUid = await callOdoo('/xmlrpc/2/common', 'authenticate', [
                ODOO_DB, ODOO_USER, ODOO_PASS, {}
            ], ODOO_URL);

            if (!adminUid) {
                return res.status(500).json({ error: 'Impossible de créer le compte (erreur admin Odoo).' });
            }

            // Check if user already exists
            const existing = await callOdoo('/xmlrpc/2/object', 'execute_kw', [
                ODOO_DB, adminUid, ODOO_PASS,
                'res.partner', 'search', [[['email', '=', email]]]
            ], ODOO_URL);

            if (existing.length > 0) {
                return res.status(409).json({ error: 'Un compte avec cet email existe déjà.' });
            }

            // Create partner
            const partnerId = await callOdoo('/xmlrpc/2/object', 'execute_kw', [
                ODOO_DB, adminUid, ODOO_PASS,
                'res.partner', 'create', [{
                    name,
                    email,
                    customer_rank: 1,
                }]
            ], ODOO_URL);

            // Create portal user linked to the partner
            await callOdoo('/xmlrpc/2/object', 'execute_kw', [
                ODOO_DB, adminUid, ODOO_PASS,
                'res.users', 'create', [{
                    name,
                    login: email,
                    password,
                    partner_id: partnerId,
                    groups_id: [[4, 9]], // portal group
                }]
            ], ODOO_URL);

            return res.status(200).json({ success: true, message: 'Compte créé avec succès. Vous pouvez vous connecter.' });
        }

        // --- RESET PASSWORD (trigger Odoo's built-in reset email) ---
        if (action === 'reset_password') {
            if (!email) {
                return res.status(400).json({ error: 'Email requis pour la réinitialisation.' });
            }

            const ODOO_USER = process.env.ODOO_USERNAME || '';
            const ODOO_PASS = process.env.ODOO_PASSWORD || '';
            const adminUid = await callOdoo('/xmlrpc/2/common', 'authenticate', [
                ODOO_DB, ODOO_USER, ODOO_PASS, {}
            ], ODOO_URL);

            if (!adminUid) {
                return res.status(500).json({ error: 'Erreur serveur lors de la réinitialisation.' });
            }

            // Find user by email
            const userIds = await callOdoo('/xmlrpc/2/object', 'execute_kw', [
                ODOO_DB, adminUid, ODOO_PASS,
                'res.users', 'search', [[['login', '=', email]]]
            ], ODOO_URL);

            if (userIds.length === 0) {
                // For security, don't reveal if user exists
                return res.status(200).json({ success: true, message: 'Si ce compte existe, un email de réinitialisation a été envoyé.' });
            }

            // Trigger Odoo reset password workflow
            await callOdoo('/xmlrpc/2/object', 'execute_kw', [
                ODOO_DB, adminUid, ODOO_PASS,
                'res.users', 'action_reset_password', [userIds]
            ], ODOO_URL);

            return res.status(200).json({ success: true, message: 'Email de réinitialisation envoyé. Vérifiez votre boîte mail.' });
        }

        return res.status(400).json({ error: 'Action inconnue' });

    } catch (error: any) {
        console.error('[Auth API] Error:', error);
        return res.status(500).json({ error: error.message || 'Erreur interne du serveur' });
    }
}
