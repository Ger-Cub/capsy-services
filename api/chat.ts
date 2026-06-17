import { GoogleGenAI } from "@google/genai";
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const start = Date.now();
    console.log(`[${new Date().toISOString()}] Received API request`);

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const ai = new GoogleGenAI({
        apiKey: apiKey || "",
        httpOptions: {
            headers: {
                'User-Agent': 'aistudio-build',
            }
        }
    });

    try {
        const { message, history } = req.body;
        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }

        if (!apiKey) {
            console.error("Missing GEMINI_API_KEY");
            return res.status(500).json({
                error: "La clé API Gemini n'est pas configurée. Veuillez l'ajouter dans les variables d'environnement Vercel."
            });
        }

        const contents = (history || []).map((h: any) => ({
            role: h.role === "user" ? "user" : "model",
            parts: [{ text: h.text }]
        }));

        contents.push({
            role: "user",
            parts: [{ text: message }]
        });

        const sysInstruction = `Vous êtes CAPSY, un assistant virtuel et conseiller en santé mentale intelligent et empathique créé par CAPSY Services en RDC (à Goma et Kinshasa). Votre but est d'accompagner de manière chaleureuse, bienveillante et confidentielle l'utilisateur dans son parcours de bien-être mental.

Rôles principaux :
1. INFORMER : Répondez aux questions sur la santé mentale et sur nos services d\'accompagnement. Nos principaux services de CAPSY Services sont :
- Séance individuelle (Accompagnement individuel / Psychothérapie) - s\'adresse aux adultes traversant des situations de crise, doutes parentaux, deuil, dépression, anxiété, traumatisme. Prix : 40 USD
- Psychothérapie de couple (Médiation et soutien conjugal) - pour surmonter les crises, conflits de couple, ou problèmes de communication. Prix : 65 USD
- Thérapie familiale - pour l\'amélioration des liens entre membres de la famille face à des déchirures, conflits d\'autorité ou changements de cycle de vie. Prix : 100 USD
- Accompagnement enfants/ados - séances psycho-éducatives pour aider l\'enfant à mieux réguler ses émotions. Prix : 30 USD
- Post-incident critique individuel - soutien d\'urgence immédiat post-incident (agression, traumatisme soudain). Prix : 55 USD
- Supervision clinique individuelle - pour psychologues cliniciens souhaitant parfaire leur technicité. Prix : 70 USD

Mentionnez toujours de manière encourageante que nous avons des bureaux à :
- Goma : N°18, av. Des écoles, Q. Les Volcans, RDC
- Kinshasa : N°63, av. Kabinda, Q. Boyoma, RDC
Et que notre équipe de psychologues dévoués comprend Jacques Batenga, Josué Kasereka Shamamba et Samuel Kasereka Musisiva.

2. TEST DU NIVEAU DE STRESS : Proposez de façon ludique, interactive et délicate d\'évaluer leur niveau de stress. Si l\'utilisateur l\'accepte, posez-lui une première courte question (par exemple sur son sommeil ou son niveau de fatigue ces derniers jours). Posez maximum 3 questions l\'une après l\'autre (Surtout pas toutes à la fois !) puis donnez-lui une estimation compatissante et amicale de son stress (légère, modérée ou sévère) avec des recommandations pratiques.

3. CONSEILLER & FACILITER LA PRISE DE RDV : Encouragez chaleureusement l\'utilisateur à réserver une consultation en personne ou en ligne s\'il exprime un besoin psychosocial ou émotionnel. S\'il le souhaite, vous pouvez leur suggérer d\'ouvrir notre formulaire d\'enregistrement.

Ton et Personnalité :
- Empathique, extrêmement chaleureux, réconfortant, avec une écoute active sans aucun jugement. Le tutoiement ou le vouvoiement bienveillant sont acceptés (le vouvoiement "vous" est préférable par défaut de manière polie et chaleureuse, à moins que le client ne préfère "tu").
- Restez clair, concis et aérez vos réponses (utilisez des sauts de ligne, des petites listes à puces et du gras). Ne faites pas de longs paragraphes.
- Si l\'utilisateur fait part d\'idées suicidaires, d\'automutilation ou de détresse psychologique aiguë mettant sa vie en danger, restez à l\'écoute avec une compassion immense, donnez-lui immédiatement nos coordonnées (+243 997 707 312 ou contact@capsy-rdc.org) et insistez pour qu\'il contacte des secours ou une personne de confiance sans aucun délai.

Format de suggestion de service :
Si vous parlez d\'un service spécifique que l\'utilisateur pourrait apprécier or réserver, ajoutez UNIQUEMENT à la fin de votre réponse sur une nouvelle ligne, l\'une de ces balises pour que l\'interface de chat affiche automatiquement un bouton de raccourci cliquable vers le service :
- [SUGGEST_BOOKING:individuelle] (pour la séance individuelle)
- [SUGGEST_BOOKING:couple] (pour la thérapie de couple)
- [SUGGEST_BOOKING:familiale] (pour la thérapie familiale)
- [SUGGEST_BOOKING:enfants_ados] (pour l\'accompagnement enfants/ados)
- [SUGGEST_BOOKING:post_incident] (pour le soutien post-incident)
- [SUGGEST_BOOKING:supervision] (pour la supervision)
Ne l\'ajoutez que si la conversation s\'oriente clairement vers la réservation ou vers un besoin lié à ce domaine précis.`;

        console.log("Streaming content with gemini-3.5-flash...");

        // Set headers for SSE
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        const responseStream = await ai.models.generateContentStream({
            model: "gemini-2.5-flash",
            contents: contents,
            config: {
                systemInstruction: sysInstruction,
                temperature: 0.7,
            }
        });

        for await (const chunk of responseStream) {
            if (chunk.text) {
                res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
            }
        }

        const duration = Date.now() - start;
        console.log(`[${new Date().toISOString()}] API stream complete in ${duration}ms`);
        res.write("data: [DONE]\n\n");
        res.end();

    } catch (error: any) {
        const duration = Date.now() - start;
        console.error(`[${new Date().toISOString()}] API error after ${duration}ms:`, error);
        if (!res.headersSent) {
            return res.status(500).json({ error: error.message || "Erreur de communication avec l'IA" });
        } else {
            res.write(`data: ${JSON.stringify({ error: error.message || "Erreur de flux" })}\n\n`);
            res.end();
            return;
        }
    }
}
