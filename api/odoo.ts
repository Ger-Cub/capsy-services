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
    const ODOO_USERNAME = process.env.ODOO_USERNAME || '';
    const ODOO_PASSWORD = process.env.ODOO_PASSWORD || '';

    if (!ODOO_URL || !ODOO_URL.startsWith('http')) {
        console.error('[Odoo API] Config error: ODOO_URL is missing or invalid:', ODOO_URL);
        return res.status(500).json({ error: 'Configuration Odoo incomplète : l\'URL Odoo est absente ou malformée dans le fichier .env' });
    }

    try {
        const { action, params } = req.body;
        console.log(`[Odoo API] Action: ${action}`, params);

        // 1. Authenticate
        console.log(`[Odoo API] Authenticating ${ODOO_USERNAME} on ${ODOO_URL}...`);
        const uid = await callOdoo('/xmlrpc/2/common', 'authenticate', [
            ODOO_DB,
            ODOO_USERNAME,
            ODOO_PASSWORD,
            {}
        ], ODOO_URL);

        if (!uid) {
            console.error('[Odoo API] Authentication failed: UID is null');
            return res.status(401).json({ error: 'Authentication failed (check your credentials in .env)' });
        }

        console.log(`[Odoo API] Authenticated successfully, UID: ${uid}`);

        if (action === 'create_appointment') {
            const { appointment } = params;
            console.log('[Odoo API] Creating appointment for:', appointment.clientName);

            let partnerId = await callOdoo('/xmlrpc/2/object', 'execute_kw', [
                ODOO_DB, uid, ODOO_PASSWORD,
                'res.partner', 'search',
                [[['email', '=', appointment.clientEmail]]]
            ], ODOO_URL);

            if (partnerId.length === 0) {
                console.log('[Odoo API] Partner not found, creating new partner...');
                partnerId = [await callOdoo('/xmlrpc/2/object', 'execute_kw', [
                    ODOO_DB, uid, ODOO_PASSWORD,
                    'res.partner', 'create',
                    [{
                        name: appointment.clientName,
                        email: appointment.clientEmail,
                        phone: appointment.clientPhone,
                        comment: 'Created from website booking'
                    }]
                ], ODOO_URL)];
            }
            console.log(`[Odoo API] Using Partner ID: ${partnerId}`);

            const startDateTime = new Date(`${appointment.date}T${appointment.timeSlot.split(' - ')[0].replace('h', ':')}:00Z`);
            const stopDateTime = new Date(`${appointment.date}T${appointment.timeSlot.split(' - ')[1].replace('h', ':')}:00Z`);

            console.log(`[Odoo API] Creating calendar event from ${startDateTime.toISOString()} to ${stopDateTime.toISOString()}...`);

            const appointmentId = await callOdoo('/xmlrpc/2/object', 'execute_kw', [
                ODOO_DB, uid, ODOO_PASSWORD,
                'calendar.event', 'create',
                [{
                    name: `RDV: ${appointment.serviceTitle}`,
                    start: startDateTime.toISOString().replace('T', ' ').split('.')[0],
                    stop: stopDateTime.toISOString().replace('T', ' ').split('.')[0],
                    partner_ids: [[6, 0, partnerId]],
                    description: `Notes: ${appointment.clientNotes}\nTherapist: ${appointment.preferredTherapist}`,
                }]
            ], ODOO_URL);
            console.log(`[Odoo API] Appointment created successfully, ID: ${appointmentId}`);
            return res.status(200).json({ success: true, id: appointmentId });
        }

        if (action === 'get_appointments') {
            const { partnerInfo } = params;
            const partnerIds = await callOdoo('/xmlrpc/2/object', 'execute_kw', [
                ODOO_DB, uid, ODOO_PASSWORD,
                'res.partner', 'search',
                [['|', ['email', '=', partnerInfo], ['phone', '=', partnerInfo]]]
            ], ODOO_URL);
            if (partnerIds.length === 0) return res.status(200).json({ appointments: [] });
            const appointments = await callOdoo('/xmlrpc/2/object', 'execute_kw', [
                ODOO_DB, uid, ODOO_PASSWORD,
                'calendar.event', 'search_read',
                [[['partner_ids', 'in', partnerIds]]],
                { fields: ['name', 'start', 'stop', 'description'] }
            ], ODOO_URL);
            return res.status(200).json({ appointments });
        }

        if (action === 'create_payment') {
            const { amount, currency = 'USD' } = params;
            return res.status(200).json({
                success: true,
                payment_url: `${ODOO_URL}/payment/pay?amount=${amount}&currency=${currency}`
            });
        }

        return res.status(400).json({ error: 'Unknown action' });

    } catch (error: any) {
        console.error('Odoo API Error:', error);
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
}
