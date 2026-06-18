# CAPSY Services - Plateforme de Santé Mentale & Bien-être

CAPSY Services est une application web moderne dédiée à la santé mentale, intégrée nativement avec **Odoo ERP** pour une gestion fluide des patients et des rendez-vous.

## 🚀 Fonctionnalités Clés

* **IA Conversationnelle** : Un assistant intelligent (Gemini) pour orienter les utilisateurs et répondre aux questions de santé mentale.
* **Système de Réservation** : Prise de rendez-vous intuitive avec sélection de services, praticiens et créneaux horaires.
* **Intégration Odoo Native** :
  * Authentification complète (Login, Inscription, Reset Password).
  * Synchronisation des rendez-vous en temps réel.
  * Profil utilisateur enrichi (données CRM Odoo).
* **Paiement Sécurisé** : Lien direct avec le portail de paiement Odoo.
* **Assistance WhatsApp** : Bouton de notification direct avec message pré-rempli.

## 🛠️ Stack Technique

* **Frontend** : Vite, React, Tailwind CSS (via components), Motion (AnimatePresence).
* **IA** : Google Gemini Pro via Vercel AI SDK.
* **Backend** : Node.js (Vercel Serverless Functions), Express.
* **ERP/CRM** : Odoo via XML-RPC.

## 📦 Installation et Lancement

**Prérequis** : Node.js (v18+)

1. **Cloner le projet** :

    ```bash
    git clone https://github.com/Ger-Cub/capsy-services.git
    cd capsy-services
    ```

2. **Installer les dépendances** :

    ```bash
    npm install
    ```

3. **Configurer les variables d'environnement** :
    Créez un fichier `.env` à la racine (voir `.env.example`) :

    ```env
    GEMINI_API_KEY=votre_cle_gemini
    ODOO_URL=https://votre-instance.odoo.com
    ODOO_DB=db_name
    ODOO_USERNAME=admin_email
    ODOO_PASSWORD=api_key
    ```

4. **Lancer en mode développement** :

    ```bash
    npm run dev
    ```

    L'application sera disponible sur `http://localhost:3000`.

## 📖 Documentation Additionnelle

Consultez [DOCS_ODOO.md](./DOCS_ODOO.md) pour plus de détails sur le fonctionnement interne de l'intégration Odoo.

---
© 2026 CAPSY Services.
