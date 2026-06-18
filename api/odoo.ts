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
        return res.status(500).json({ error: 'Configuration Odoo incomplète' });
    }

    try {
        const { action, params } = req.body;
        console.log(`[Odoo API] Action received: ${action}`);

        // 1. Authenticate with admin creds to perform operations
        const uid = await callOdoo('/xmlrpc/2/common', 'authenticate', [
            ODOO_DB,
            ODOO_USERNAME,
            ODOO_PASSWORD,
            {}
        ], ODOO_URL);

        if (!uid) {
            console.error('[Odoo API] Authentication failed for user:', ODOO_USERNAME);
            return res.status(401).json({ error: 'Échec de l\'authentification Odoo' });
        }

        if (action === 'create_appointment') {
            const { appointment, loggedInPartnerId } = params;
            console.log(`[Odoo API] Creating appointment for ${appointment.clientEmail}. LoggedInPartner: ${loggedInPartnerId}`);

            // Find or create Partner for the patient
            let partnerIds = await callOdoo('/xmlrpc/2/object', 'execute_kw', [
                ODOO_DB, uid, ODOO_PASSWORD,
                'res.partner', 'search',
                [[['email', '=', appointment.clientEmail]]]
            ], ODOO_URL);

            let partnerId;
            if (partnerIds.length === 0) {
                console.log('[Odoo API] Patient partner not found, creating...');
                partnerId = await callOdoo('/xmlrpc/2/object', 'execute_kw', [
                    ODOO_DB, uid, ODOO_PASSWORD,
                    'res.partner', 'create',
                    [{
                        name: appointment.clientName,
                        email: appointment.clientEmail,
                        phone: appointment.clientPhone,
                        comment: 'Client créé via le site web CAPSY'
                    }]
                ], ODOO_URL);
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
            const appointmentId = await callOdoo('/xmlrpc/2/object', 'execute_kw', [
                ODOO_DB, uid, ODOO_PASSWORD,
                'calendar.event', 'create',
                [{
                    name: `RDV: ${appointment.serviceTitle}`,
                    start: start,
                    stop: stop,
                    partner_ids: [[6, 0, attendees]],
                    description: `Client: ${appointment.clientName}\nEmail: ${appointment.clientEmail}\nPhone: ${appointment.clientPhone}\nNotes: ${appointment.clientNotes}\nTherapist: ${appointment.preferredTherapist}`,
                }]
            ], ODOO_URL);

            console.log(`[Odoo API] Success! Created calendar.event ID: ${appointmentId}`);
            return res.status(200).json({ success: true, id: appointmentId });
        }

        if (action === 'get_appointments') {
            const { partnerInfo } = params;
            console.log(`[Odoo API] Fetching appointments for info: ${partnerInfo}`);

            // Search partner by email or login
            const partnerIds = await callOdoo('/xmlrpc/2/object', 'execute_kw', [
                ODOO_DB, uid, ODOO_PASSWORD,
                'res.partner', 'search',
                [['|', ['email', '=', partnerInfo], ['name', '=', partnerInfo]]]
            ], ODOO_URL);

            if (partnerIds.length === 0) {
                console.log('[Odoo API] No partner found for this info');
                return res.status(200).json({ appointments: [] });
            }

            console.log(`[Odoo API] Partners found: ${partnerIds}. Searching events...`);

            // Search events where this partner is an attendee
            const appointments = await callOdoo('/xmlrpc/2/object', 'execute_kw', [
                ODOO_DB, uid, ODOO_PASSWORD,
                'calendar.event', 'search_read',
                [[['partner_ids', 'in', partnerIds]]],
                {
                    fields: ['name', 'start', 'stop', 'description', 'partner_ids'],
                    order: 'start desc'
                }
            ], ODOO_URL);

            console.log(`[Odoo API] Found ${appointments.length} appointments`);
            return res.status(200).json({ appointments });
        }

        return res.status(400).json({ error: 'Action non supportée' });

    } catch (error: any) {
        console.error('[Odoo API] Global Error:', error);
        return res.status(500).json({ error: error.message || 'Erreur interne du serveur' });
    }
}
