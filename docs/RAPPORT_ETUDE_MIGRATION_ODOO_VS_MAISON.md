# RAPPORT D'ÉTUDE STRATÉGIQUE & TECHNIQUE
## Évaluation de la continuité Odoo vs. Développement d'un Système Maison Auto-hébergé (VPS)
**Projet :** CAPSY Services — Architecture des Trois Piliers Étanches  
**Modules cibles :** Capsy Académie | Capsy Opérations | Capsy Clinique  
**Destinataires :** Direction Générale & Comité de Direction — CAPSY Services  
**Date :** Octobre 2026  
**Auteur :** Équipe d'Ingénierie & Architecture Logicielle CAPSY  
**Statut :** Document décisionnel confidentiel (Usage interne)

---

## 1. Synthèse Exécutive (Executive Summary)

Face à la croissance des activités de **CAPSY Services** et aux exigences déontologiques et légales de **confidentialité absolue des données cliniques**, la Direction Générale a sollicité une étude d'opportunité et de faisabilité :
1. **Faut-il pérenniser l'usage d'Odoo** (SaaS ou Community auto-hébergé) ?
2. **Ou faut-il concevoir et développer en interne un système sur-mesure ("développement maison")**, déployé sur une infrastructure privée (VPS), garantissant par conception (**Privacy by Design**) l'étanchéité stricte entre les trois modules clés : **Capsy Académie**, **Capsy Opérations**, et **Capsy Clinique** ?

### Conclusion de l'évaluation
- **Le développement d'un ERP complet "from scratch" immédiat** représente un investissement lourd (estimé entre **32 000 $ et 60 000 $** de masse salariale/prestation sur 12 à 18 mois) avec un risque élevé d'essoufflement technique si l'équipe interne n'est pas pérennisée.
- **Odoo dans son modèle monolithique actuel** présente des faiblesses structurelles majeures pour la confidentialité clinique : la table des partenaires (`res.partner`) et le modèle relationnel unifié rendent l'étanchéité difficile à certifier sans failles humaines ou de configuration.
- **La recommandation prioritaire (Option C - Hybride Stratégique)** consiste à :
  - **Sanctuariser immédiatement le module Clinique** via un backend & portail dédié sur mesure (FastAPI / PostgreSQL chiffré) auto-hébergé sur VPS privé, garantissant le secret médical et zéro fuite vers les autres départements.
  - **Conserver temporairement ou rationaliser Odoo Community** pour les fonctions standard de gestion administrative (Opérations/Facturation globale) et de formation (Académie), sans aucune donnée patient.
  - **Planifier une autonomisation graduelle** des modules Académie et Opérations selon la maturité de l'équipe technique.

---

## 2. Analyse du Besoin Spécifique de CAPSY Services

### 2.1 La Philosophie des "Trois Modules Étanches"

La structure fonctionnelle de CAPSY exige que les données ne soient pas partagées de façon indifférenciée entre les collaborateurs :

```
┌────────────────────────────────────────────────────────────────────────┐
│                          CAPSY SERVICES                                │
├─────────────────────┬──────────────────────┬───────────────────────────┤
│   CAPSY ACADÉMIE    │   CAPSY OPÉRATIONS   │      CAPSY CLINIQUE       │
├─────────────────────┼──────────────────────┼───────────────────────────┤
│ • Formations & TCC  │ • Comptabilité/Finance│ • Dossiers Patients       │
│ • Certifications    │ • Ressources Humaines│ • Notes d'Évolution       │
│ • E-learning & LMS  │ • Logistique & Achats│ • Bilans Psychologiques   │
│ • Gestion étudiants │ • Marketing & Com.   │ • Prise de Rendez-vous    │
│ • Intervenants      │ • Partenariats B2B   │ • Facturation Santé       │
├─────────────────────┼──────────────────────┼───────────────────────────┤
│ Risque : Modéré     │ Risque : Interne     │ Risque : CRITIQUE & LÉGAL │
│ Données académiques │ Données corpo/tréso  │ SECRET MÉDICAL ABSOLU     │
└─────────────────────┴──────────────────────┴───────────────────────────┘
          │                      │                       │
          └──────────── ISOLATION STRICTE ───────────────┘
           (Aucun accès croisé non-anonymisé autorisé)
```

### 2.2 Les Limites Structurelles d'Odoo face à cette Philosophie

| Critère | Comportement standard Odoo | Problème pour CAPSY |
| :--- | :--- | :--- |
| **Cloisonnement des contacts** | `res.partner` unifié : tous les contacts (fournisseurs, étudiants, patients, psychologues) partagent le même modèle de base. | Risque qu'un employé des Opérations ou de l'Académie voie le nom d'un patient en thérapie lors d'une recherche transversale. |
| **Gestion des permissions** | Règles de sécurité complexes (`ir.rule` et groupes). Une erreur de configuration peut exposer des données cliniques. | Risque de régression lors des mises à jour ou de création d'utilisateurs. |
| **Traçabilité & Secret Médical** | Pas de chiffrement natif colonne par colonne ni de journal d'audit immuable certifié santé. | Non-conformité aux standards éthiques de prise en charge psychologique (HIPAA / RGPD santé). |
| **Coût d'évolution** | Personnaliser Odoo exige des développeurs experts en ORM Odoo (rares et onéreux). | Chaque upgrade de version (ex: v17 vers v18) peut casser les modules custom. |

---

## 3. Étude Comparative Détaillée des Options

### Option 1 : Maintien et Durcissement d'Odoo (Statu Quo Amélioré)
Consiste à conserver Odoo (idéalement migré sur une version Community hébergée sur un VPS dédié à CAPSY) et à durcir les configurations de sécurité.

#### Faisabilité Technique
- **Séparation :** Nécessiterait de créer **trois bases de données PostgreSQL distinctes** sur la même instance Odoo (`capsy_academie`, `capsy_operations`, `capsy_clinique`), chacune accessible via un sous-domaine spécifique (`academie.capsy.app`, `ops.capsy.app`, `clinique.capsy.app`).
- **Complexité :** L'administration multi-base est standard sous Odoo, mais les intégrations entre modules (ex: statistiques globales de direction) obligent à coder des connecteurs API d'agrégation.

#### Avantages & Inconvénients
- **Avantages :**
  - Outil déjà connu des équipes administratives.
  - Fonctionnalités comptables, RH, CRM et e-commerce immédiatement prêtes à l'emploi.
  - Coût initial de développement quasi nul.
- **Inconvénients :**
  - Odoo n'a pas été pensé comme un dossier patient informatisé (DPI/EHR) en psychologie clinique.
  - Interface lourde pour les praticiens.
  - Maintenance système et montée de version fastidieuse.

---

### Option 2 : Développement Intégral d'un Système Maison (Full Custom)
Consiste à concevoir de zéro une plateforme modulaire sur mesure développée en interne et auto-hébergée sur un VPS privé sous Docker.

#### Architecture Cible (System Design)
```
                          [ Internet / Utilisateurs ]
                                     │
                             [ NGINX / Caddy Proxy ]
                               (TLS 1.3, Rate-Limit)
                                     │
        ┌────────────────────────────┼────────────────────────────┐
        │                            │                            │
 ┌──────▼──────┐              ┌──────▼──────┐              ┌──────▼──────┐
 │   PORTAIL   │              │   PORTAIL   │              │   PORTAIL   │
 │  ACADÉMIE   │              │ OPÉRATIONS  │              │  CLINIQUE   │
 │(React/Vite) │              │(React/Vite) │              │(React/Vite) │
 └──────┬──────┘              └──────┬──────┘              └──────┬──────┘
        │                            │                            │
 ┌──────▼──────┐              ┌──────▼──────┐              ┌──────▼──────┐
 │ API ACADÉMIE│              │   API OPS   │              │API CLINIQUE │
 │  (FastAPI)  │              │  (FastAPI)  │              │  (FastAPI)  │
 └──────┬──────┘              └──────┬──────┘              └──────┬──────┘
        │                            │                            │
 ┌──────▼──────┐              ┌──────▼──────┐              ┌──────▼──────┐
 │ DB ACADÉMIE │              │   DB OPS    │              │ DB CLINIQUE │
 │ (PostgreSQL)│              │(PostgreSQL) │              │(Chiffrée AES│
 └─────────────┘              └─────────────┘              │ + pgcrypto) │
                                                           └─────────────┘
```

#### Faisabilité Technique
- **Sécurité & Confidentialité :** Totale et absolue. Chaque module tourne dans des conteneurs isolés avec des réseaux internes Docker hermétiques.
- **Bases de données :** 3 bases PostgreSQL indépendantes avec utilisateurs distincts. La base Clinique utilise le chiffrement au repos (`pgcrypto` pour les diagnostics et notes de séance) et une table d'audit `audit_logs` en append-only (historique inaltérable de consultation des dossiers).
- **Flexibilité :** Interface utilisateur 100% adaptée au métier des psychologues cliniciens et du secrétariat de CAPSY.

#### Stack Technologique Recommandée
- **Backend :** **Python 3.12 + FastAPI** (haute performance, typage strict Pydantic, async natif, déjà maîtrisé via le microservice actuel).
- **Frontend :** **React 19 + TypeScript + Tailwind CSS** (stack identique au site web actuel, mutualisation maximale des composants UI).
- **Base de données :** **PostgreSQL 16** (robustesse ACID, gestion JSONB, extension pgcrypto, Row-Level Security).
- **Cache & Asynchrone :** **Redis + Celery/ARQ** (envois d'e-mails, rappels SMS/WhatsApp, tâches planifiées).
- **Infrastructure :** **Docker / Docker Compose** sur VPS Linux (Ubuntu 24.04 LTS), géré par Caddy Server (certificats SSL automatiques).
- **Stockage fichiers :** **MinIO** auto-hébergé (compatible API S3, souveraineté complète des documents cliniques).

#### Avantages & Inconvénients
- **Avantages :**
  - **Souveraineté et indépendance absolue :** Aucune licence externe, aucune dépendance d'éditeur.
  - **Conformité médicale parfaite :** Aucun risque de fuite de données vers les modules administratifs.
  - **Expérience utilisateur sur-mesure :** Pas d'écrans encombrants d'un ERP généraliste, workflows fluides.
  - **Propriété intellectuelle :** CAPSY devient propriétaire d'un actif logiciel valorisable.
- **Inconvénients :**
  - **Temps de développement considérable :** Réécrire la comptabilité, la paie, la facturation légale et un LMS prend 12 à 18 mois.
  - **Dette technique & maintenance :** La charge de la sécurité, des bugs et des sauvegardes repose à 100% sur l'équipe CAPSY.
  - **Risque RH :** Dépendance forte envers les développeurs ayant conçu le système.

---

### Option 3 : Approche Hybride Découplée (Recommandation Stratégique)

Cette approche combine le meilleur des deux mondes :
1. **Module Clinique = 100% Développé Maison :** Création immédiate de l'application clinique CAPSY (Dossiers patients, prise de RDV, notes de consultation chiffrées, gestion des psychologues).
2. **Modules Académie & Opérations = Odoo Community :** Conservation d'Odoo uniquement pour la gestion courante, la facturation générale, la comptabilité et les inscriptions formations, **sans jamais y stocker de données de santé**.
3. **Passerelle d'Agrégation Anonymisée :** Pour les statistiques de direction (chiffre d'affaires global, volume d'activité), seule une donnée chiffrée anonyme transitera.

---

## 4. Évaluation Faisabilité, Budget & Compétences

### 4.1 Faisabilité Budgétaire (Projection sur 3 ans en USD)

| Poste de dépenses | Option 1 : Odoo Seul (Community/VPS) | Option 2 : Système Maison Intégral | Option 3 : Hybride Stratégique (Conseillée) |
| :--- | :--- | :--- | :--- |
| **Développement initial** | 2 500 $ (ajustements & paramétrages) | 38 000 $ (18 mois équipe dév) | 16 000 $ (6-8 mois focus Clinique) |
| **Audit de sécurité externe** | 1 500 $ | 3 500 $ | 2 000 $ |
| **Hébergement VPS & Sauvegardes** | 900 $/an (75 $/mois) | 1 800 $/an (150 $/mois) | 1 400 $/an (115 $/mois) |
| **Maintenance & Évolutions annuelles**| 2 000 $/an | 6 000 $/an | 3 500 $/an |
| **Licences logicielles tierces** | 0 $ (Open Source) | 0 $ (Open Source) | 0 $ (Open Source) |
| **TOTAL ANNÉE 1** | **6 900 $** | **49 300 $** | **22 900 $** |
| **TOTAL SUR 3 ANS** | **12 700 $** | **64 900 $** | **32 700 $** |

> **Analyse financière :** L'Option 2 (tout développer) est budgétairement 4 à 5 fois plus onéreuse la première année. L'Option 3 permet d'investir utilement là où réside la vraie valeur ajoutée et le risque juridique de CAPSY : la **Clinique**.

---

### 4.2 Analyse des Compétences Requises

| Rôle / Compétence | Profil requis | Disponibilité interne CAPSY | Action requise |
| :--- | :--- | :--- | :--- |
| **Lead Developer Backend** | Python, FastAPI, PostgreSQL, Architecture REST/Async | Partiellement disponible | Former ou recruter 1 senior |
| **Frontend Developer** | React, TypeScript, Tailwind CSS, State Management | Déjà disponible en interne | Affectation partielle au projet |
| **Administrateur DevOps / SecOps**| Linux (Ubuntu), Docker, Nginx/Caddy, Stratégie Backup, Chiffrement | Faible | Prestation ponctuelle / Consultant |
| **Expert Métier / Référent Clinique**| Psychologue superviseur (règles de déontologie, structure des dossiers) | Présent (Directeur Clinique) | Ateliers de cadrage fonctionnel |

---

## 5. Matrice de Décision Multicritères

Chaque option est notée de **1 à 5** (5 étant la meilleure note) pondérée par l'importance du critère pour CAPSY :

| Critère | Poids | Option 1 : Odoo Pur | Option 2 : Maison 100% | Option 3 : Hybride |
| :--- | :---: | :---: | :---: | :---: |
| **Étanchéité & Secret Médical** | 30% | 2 (0.6) | 5 (1.5) | 5 (1.5) |
| **Maîtrise des coûts (Budget)** | 25% | 5 (1.25) | 2 (0.5) | 4 (1.0) |
| **Délai de mise en œuvre (Time-to-Market)**| 20% | 4 (0.8) | 1 (0.2) | 3.5 (0.7) |
| **Indépendance technologique** | 15% | 2 (0.3) | 5 (0.75) | 4 (0.6) |
| **Facilité de maintenance** | 10% | 3 (0.3) | 2 (0.2) | 3.5 (0.35) |
| **SCORE GLOBAL PONDÉRÉ** | **100%** | **3.25 / 5** | **3.15 / 5** | **4.15 / 5** |

**Gagnant de l'analyse :** **L'Option 3 (Approche Hybride Découplée)** offre le compromis optimal entre impératif éthique, faisabilité technique et maîtrise des finances.

---

## 6. Spécifications Techniques d'Implémentation sur VPS Privé

Si la direction valide l'hébergement privé sur VPS, voici l'architecture système recommandée :

### 6.1 Dimensionnement VPS Recommandé
- **Fournisseur :** Hetzner Cloud (datacenter Falkenstein/Helsinki) ou OVHcloud (Gravelines/Roubaix) — conformité stricte RGPD.
- **Configuration :** 8 vCPU (AMD EPYC ou Intel), 16 Go RAM, 160 Go SSD NVMe, bande passante 1 Gbps.
- **Coût mensuel indicatif :** ~35 € à 55 € / mois.

### 6.2 Sécurité & Cloisonnement Système
1. **Réseau privé Docker :** Le conteneur de base de données clinique (`db_clinique`) n'expose aucun port sur l'adresse IP publique de la machine (`ports: []`), uniquement accessible par l'API Clinique via le bridge interne.
2. **Double Authentification (2FA / TOTP) :** Obligatoire pour tout compte praticien et superviseur.
3. **Politique de Sauvegarde 3-2-1 :**
   - Dump quotidien automatique chiffré via GPG.
   - Stockage local sur le VPS (7 jours glissants).
   - Réplication chiffrée hors-site vers un stockage Cloud S3 indépendant (ex: Backblaze B2, ~5 $/mois).
4. **Pare-feu (UFW) & Fail2ban :** Seuls les ports 80 (HTTP) et 443 (HTTPS) ainsi qu'un port SSH personnalisé avec clé cryptographique (pas de mot de passe) sont ouverts.

---

## 7. Feuille de Route Opérationnelle (Roadmap)

```
[ Mois 1 - 2 ]  CADRAGE & ISOLATION
  ├── Rédaction du cahier des charges précis du "Dossier Patient CAPSY"
  ├── Déploiement et sécurisation du VPS privé (Docker, Caddy, Firewall)
  └── Purge des données cliniques sensibles d'Odoo

[ Mois 3 - 5 ]  DÉVELOPPEMENT MODULE CLINIQUE (MVP)
  ├── Création de l'API FastAPI Clinique (Auth JWT/MFA, Dossiers, Consultations)
  ├── Interface React dédiée pour les psychologues
  └── Connexion du formulaire de prise de rendez-vous en ligne

[ Mois 6 ]      PHASE PILOTE & AUDIT
  ├── Test en conditions réelles avec 2 à 3 psychologues référents
  ├── Audit de non-régression et test de pénétration interne
  └── Bascule définitive des dossiers patients sur le système maison

[ Mois 7+ ]     AUTONOMISATION ACADÉMIE & OPÉRATIONS (Au besoin)
  └── Selon la satisfaction et la charge, évaluation du remplacement d'Odoo
      pour la partie cours/LMS et facturation générale.
```

---

## 8. Conclusion et Décisions Soumises à la Direction

1. **Abandonner l'idée d'un ERP 100% maison développé d'un seul coup :** Le coût et les risques de maintenance dépasseraient les capacités actuelles sans valeur ajoutée sur la partie comptable.
2. **Cesser d'utiliser Odoo comme réceptacle de dossiers cliniques :** Odoo doit être cantonné à la gestion commerciale et financière.
3. **Approuver le lancement du projet "CAPSY Clinique OS" :** Développer en interne le module clinique étanche, sécurisé et auto-hébergé sur VPS, qui constituera le cœur de confiance de l'institution.

---
*Ce rapport reste à la disposition de la Direction Générale pour présentation et échanges lors du prochain conseil d'administration.*

