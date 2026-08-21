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
    // Environment fallbacks; prefer credentials and instance info sent in request body
    const ENV_ODOO_USERNAME = process.env.ODOO_USERNAME || '';
    const ENV_ODOO_PASSWORD = process.env.ODOO_PASSWORD || '';
    const CAPSY_API_BASE = (process.env.ODOO_API_URL || 'http://localhost:8000').replace(/\/$/, '');

    // Allow client to supply `url` and `db` in the request body so the frontend
    // can use the logged-in user's instance and database instead of server env vars.
    const ODOO_URL = (req.body && req.body.url) ? String(req.body.url) : (process.env.ODOO_URL || '');
    const ODOO_DB = (req.body && req.body.db) ? String(req.body.db) : (process.env.ODOO_DB || '');

    if (!ODOO_URL || !ODOO_URL.startsWith('http')) {
        console.error('[Odoo API] Config error: ODOO_URL is missing or invalid:', ODOO_URL);
        return res.status(500).json({ error: 'Configuration Odoo incomplète (url manquante). Veuillez fournir `url` et `db` dans le corps de la requête ou configurer les variables d\'environnement.' });
    }

    if (!ODOO_URL || !ODOO_URL.startsWith('http')) {
        console.error('[Odoo API] Config error: ODOO_URL is missing or invalid:', ODOO_URL);
        return res.status(500).json({ error: 'Configuration Odoo incomplète' });
    }

    try {
        const { action, params, username: bodyUsername, password: bodyPassword } = req.body;
        console.log(`[Odoo API] Action received: ${action}`);

        // Helper: call session proxy on capsy-odoo-api
        const callSession = async (model: string, method: string, args: any[] = [], kwargs: any = {}) => {
            try {
                const resp = await fetch(`${CAPSY_API_BASE}/session/call`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ session_id: req.body.session_id, uid: req.body.uid, username: req.body.username || bodyUsername, model, method, args, kwargs, db: ODOO_DB, url: ODOO_URL }),
                });
                if (!resp.ok) throw new Error(await resp.text());
                const d = await resp.json();
                return d.result;
            } catch (err) {
                throw err;
            }
        };

        // Determine which credentials to use: prefer credentials sent in body, fall back to env vars
        const usernameToUse = (bodyUsername && String(bodyUsername)) || ENV_ODOO_USERNAME;
        const passwordToUse = (bodyPassword && String(bodyPassword)) || ENV_ODOO_PASSWORD;

        // If client provided session_id & uid, use session mode (no password required)
        let uid: any = null;
        let xmlrpcMode = true;
        if (req.body && req.body.session_id && req.body.uid) {
            xmlrpcMode = false;
            uid = req.body.uid;
        } else {
            if (!usernameToUse || !passwordToUse) {
                console.error('[Odoo API] No credentials provided (neither body nor env).');
                return res.status(401).json({ error: "Aucun identifiant Odoo fourni. Pour créer des rendez-vous sans authentification interactive, configurez une 'service user' via les variables d'environnement ODOO_USERNAME/ODOO_PASSWORD ou envoyez 'username' et 'password' dans le corps de la requête." });
            }
            try {
                uid = await callOdoo('/xmlrpc/2/common', 'authenticate', [
                    ODOO_DB,
                    usernameToUse,
                    passwordToUse,
                    {}
                ], ODOO_URL);
            } catch (err) {
                console.error('[Odoo API] Authentication failed for user:', usernameToUse);
                return res.status(401).json({ error: "Échec de l'authentification Odoo" });
            }

            if (!uid) {
                console.error('[Odoo API] Authentication returned falsy uid for user:', usernameToUse);
                return res.status(401).json({ error: "Échec de l'authentification Odoo" });
            }
        }

        if (action === 'create_appointment') {
            const { appointment, loggedInPartnerId } = params;
            console.log(`[Odoo API] Creating appointment for ${appointment.clientEmail}. LoggedInPartner: ${loggedInPartnerId}`);

            // Find or create Partner for the patient
            let partnerIds;
            if (!xmlrpcMode) {
                partnerIds = await callSession('res.partner', 'search', [[['email', '=', appointment.clientEmail]]]);
            } else {
                partnerIds = await callOdoo('/xmlrpc/2/object', 'execute_kw', [
                    ODOO_DB, uid, passwordToUse,
                    'res.partner', 'search',
                    [[['email', '=', appointment.clientEmail]]]
                ], ODOO_URL);
            }

            let partnerId;
            if (partnerIds.length === 0) {
                console.log('[Odoo API] Patient partner not found, creating...');
                if (!xmlrpcMode) {
                    partnerId = await callSession('res.partner', 'create', [{
                        name: appointment.clientName,
                        email: appointment.clientEmail,
                        phone: appointment.clientPhone,
                        comment: 'Client créé via le site web CAPSY'
                    }]);
                } else {
                    partnerId = await callOdoo('/xmlrpc/2/object', 'execute_kw', [
                        ODOO_DB, uid, passwordToUse,
                        'res.partner', 'create',
                        [{
                            name: appointment.clientName,
                            email: appointment.clientEmail,
                            phone: appointment.clientPhone,
                            comment: 'Client créé via le site web CAPSY'
                        }]
                    ], ODOO_URL);
                }
            } else {
                partnerId = partnerIds[0];
                console.log(`[Odoo API] Patient partner found: ID ${partnerId}`);
            }

            // Attendees: patient (+ logged in user if different)
            const attendees = [partnerId];
            if (loggedInPartnerId && loggedInPartnerId !== partnerId) {
                attendees.push(loggedInPartnerId);
            }

            // Dates conversion
            const times = appointment.timeSlot.split(' - ');
            const startTimeStr = times[0].replace('h', ':');
            const endTimeStr = times[1].replace('h', ':');

            const start = `${appointment.date} ${startTimeStr}:00`;
            const stop = `${appointment.date} ${endTimeStr}:00`;

            console.log(`[Odoo API] Event details: ${start} to ${stop}`);

            // Create Event
            let appointmentId;
            if (!xmlrpcMode) {
                appointmentId = await callSession('calendar.event', 'create', [{
                    name: `RDV: ${appointment.serviceTitle}`,
                    start: start,
                    stop: stop,
                    partner_ids: [[6, 0, attendees]],
                    description: `Client: ${appointment.clientName}\nEmail: ${appointment.clientEmail}\nPhone: ${appointment.clientPhone}\nNotes: ${appointment.clientNotes}\nTherapist: ${appointment.preferredTherapist}`,
                }]);
            } else {
                appointmentId = await callOdoo('/xmlrpc/2/object', 'execute_kw', [
                    ODOO_DB, uid, passwordToUse,
                    'calendar.event', 'create',
                    [{
                        name: `RDV: ${appointment.serviceTitle}`,
                        start: start,
                        stop: stop,
                        partner_ids: [[6, 0, attendees]],
                        description: `Client: ${appointment.clientName}\nEmail: ${appointment.clientEmail}\nPhone: ${appointment.clientPhone}\nNotes: ${appointment.clientNotes}\nTherapist: ${appointment.preferredTherapist}`,
                    }]
                ], ODOO_URL);
            }

            console.log(`[Odoo API] Success! Created calendar.event ID: ${appointmentId}`);
            return res.status(200).json({ success: true, id: appointmentId });
        }

        if (action === 'get_appointments') {
            const { partnerInfo } = params;
            console.log(`[Odoo API] Fetching appointments for info: ${partnerInfo}`);

            // Search partner by email or login
            let partnerIds;
            if (!xmlrpcMode) {
                partnerIds = await callSession('res.partner', 'search', [['|', ['email', '=', partnerInfo], ['name', '=', partnerInfo]]]);
            } else {
                partnerIds = await callOdoo('/xmlrpc/2/object', 'execute_kw', [
                    ODOO_DB, uid, passwordToUse,
                    'res.partner', 'search',
                    [['|', ['email', '=', partnerInfo], ['name', '=', partnerInfo]]]
                ], ODOO_URL);
            }

            if (partnerIds.length === 0) {
                console.log('[Odoo API] No partner found for this info');
                return res.status(200).json({ appointments: [] });
            }

            console.log(`[Odoo API] Partners found: ${partnerIds}. Searching events...`);

            // Search events where this partner is an attendee
            let appointments;
            if (!xmlrpcMode) {
                appointments = await callSession('calendar.event', 'search_read', [[['partner_ids', 'in', partnerIds]]], { fields: ['name', 'start', 'stop', 'description', 'partner_ids'], order: 'start desc' });
            } else {
                appointments = await callOdoo('/xmlrpc/2/object', 'execute_kw', [
                    ODOO_DB, uid, passwordToUse,
                    'calendar.event', 'search_read',
                    [[['partner_ids', 'in', partnerIds]]],
                    {
                        fields: ['name', 'start', 'stop', 'description', 'partner_ids'],
                        order: 'start desc'
                    }
                ], ODOO_URL);
            }

            console.log(`[Odoo API] Found ${appointments.length} appointments`);
            return res.status(200).json({ appointments });
        }

        if (action === 'list_products') {
            const { limit = 50, fields = ['id', 'display_name', 'name', 'list_price'] } = params || {};
            console.log(`[Odoo API] Listing products with limit ${limit}`);
            let products;
            if (!xmlrpcMode) {
                products = await callSession('product.product', 'search_read', [[]], { fields, limit });
            } else {
                products = await callOdoo('/xmlrpc/2/object', 'execute_kw', [
                    ODOO_DB, uid, passwordToUse,
                    'product.product', 'search_read',
                    [ [] ],
                    { fields, limit }
                ], ODOO_URL);
            }
            return res.status(200).json({ products });
        }

        // Generic search_read for listing model records from Odoo
        if (action === 'search_read') {
            const { model, domain = [], fields = [], limit = 50, order } = params || {};
            if (!model) return res.status(400).json({ error: 'Missing model parameter for search_read' });
            console.log(`[Odoo API] search_read model=${model} limit=${limit}`);
            let records: any;
            if (!xmlrpcMode) {
                records = await callSession(model, 'search_read', [domain], { fields, limit, order });
            } else {
                records = await callOdoo('/xmlrpc/2/object', 'execute_kw', [
                    ODOO_DB, uid, passwordToUse,
                    model, 'search_read',
                    [domain],
                    { fields, limit, order }
                ], ODOO_URL);
            }
            return res.status(200).json({ results: records });
        }

        return res.status(400).json({ error: 'Action non supportée' });

    } catch (error: any) {
        console.error('[Odoo API] Global Error:', error);
        return res.status(500).json({ error: error.message || 'Erreur interne du serveur' });
    }
}
