# Documentation de l'Intégration Odoo - CAPSY Services

Cette documentation détaille l'architecture et le fonctionnement de la connexion entre l'application CAPSY Services et l'ERP Odoo.

## 1. Architecture Globale

L'application utilise Odoo comme **Backend-as-a-Service (BaaS)** pour gérer :

* **Les Utilisateurs** (Contacts `res.partner` et Utilisateurs `res.users`).
* **Les Rendez-vous** (Événements de calendrier `calendar.event`).
* **Les Paiements** (Lien avec le module de facturation Odoo).

La communication se fait via le protocole **XML-RPC** natif d'Odoo, sécurisé par des handlers API côté serveur (`/api/*`) pour ne jamais exposer les clés d'administration au frontend.

---

## 2. Authentification et Profils

### Fonctionnalités

* **Connexion** : Vérifie les identifiants via Odoo et récupère les informations de profil (Nom, Email, Photo/Avatar, Timezone).
* **Inscription** :
    1. Crée un nouveau contact dans `res.partner`.
    2. Crée un utilisateur portail dans `res.users`.
* **Mot de passe oublié** : Déclenche le workflow natif d'Odoo qui envoie un email de réinitialisation sécurisé à l'utilisateur.
* **Gestion du Profil** : Une interface dédiée affiche les détails Odoo du client et permet un lien direct vers son espace client Odoo.

### Sécurité

Les sessions sont gérées côté client par un état React. L'ID du partenaire Odoo (`partner_id`) est stocké de manière sécurisée après login pour lier toutes les actions futures.

---

## 3. Gestion des Rendez-vous

C'est le cœur de l'intégration métier.

### Création d'un rendez-vous (`calendar.event`)

Lorsqu'un utilisateur réserve une séance :

1. **Vérification/Création du contact** : L'API vérifie si l'email existe déjà dans Odoo. Sinon, un contact est créé.
2. **Liaison des participants** : Le rendez-vous est lié à :
    * L'email saisi dans le formulaire (Patient).
    * L'utilisateur actuellement connecté (Organisateur), garantissant que le rendez-vous apparaît dans sa liste même s'il réserve pour un tiers.
3. **Formatage** : Les détails (Thérapeute, Notes, Téléphone) sont enregistrés dans le champ `description` d'Odoo.

### Affichage et Synchronisation

* **Temps Réel** : La liste des rendez-vous est chargée directement depuis Odoo à chaque ouverture de la section "Mes RDV".
* **Nettoyage HTML** : Comme Odoo stocke les descriptions au format HTML, l'application nettoie automatiquement les balises pour afficher un texte clair et professionnel.
* **Extraction de données** : Un moteur de parsing analyse la description Odoo pour extraire de manière structurée le nom du praticien et les notes, sans modifier la donnée originale dans l'ERP.

---

## 4. Notifications et Actions

* **Bouton Notifier (WhatsApp)** : Génère un message structuré incluant les données du rendez-vous (ID, Date, Heure) pour faciliter la confirmation rapide avec l'équipe CAPSY.
* **Paiement** : Redirige l'utilisateur vers le portail de paiement sécurisé d'Odoo pour régler sa consultation.

---

## 5. Configuration (Variables d'Environnement)

Pour fonctionner, l'application nécessite les variables suivantes dans le fichier `.env` :

```env
ODOO_URL=https://votre-instance.odoo.com
ODOO_DB=nom_de_la_base_de_donnees
ODOO_USERNAME=email_administrateur
ODOO_PASSWORD=cle_api_ou_mot_de_passe
```

---

## 6. Flux de données (Data Flow)

1. **User** -> *Remplit le formulaire* -> **Frontend (React)**
2. **Frontend** -> *POST /api/odoo* -> **Backend (Serverless)**
3. **Backend** -> *XML-RPC call* -> **Odoo ERP**
4. **Odoo ERP** -> *Success (ID)* -> **Backend**
5. **Backend** -> *JSON Success* -> **Frontend**
6. **Frontend** -> *Actualisation UI* -> **User (Wowed! 🚀)**

---
*Document rédigé le 18 Juin 2026 pour CAPSY Services.*
