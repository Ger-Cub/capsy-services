Searched for files: *
Viewed .env:1-11
Viewed package.json:1-49
Viewed server.ts:1-120
Viewed server.ts:121-176
Searched for "/api/"
Viewed api.ts:1-60
Viewed vercel.json:1-50
Viewed chat.ts:1-119
Viewed .htaccess
Searched for files: *.htaccess
Viewed main.py:1-60
Viewed auth.ts:1-100
Viewed DOCS_ODOO.md:1-85
Viewed odoo.ts:1-60
Used tool: read_url_content
Used tool: read_url_content

Voici exactement ce qui se passe et comment résoudre ce problème.

---

### 🔍 Pourquoi cela ne fonctionne pas actuellement ?

1. **La nature de votre build (`npm run build`)** :
   Le dossier `dist/` produit par Vite ne contient **que le frontend statique** (HTML, CSS et JavaScript client). Il ne contient **aucun serveur backend**.

2. **Le rôle des variables d'environnement (`.env`)** :
   - Dans un projet Vite, seules les variables commençant par `VITE_` sont injectées dans le code JavaScript du navigateur lors du build.
   - Vos clés secrètes comme `GEMINI_API_KEY` ou `ODOO_PASSWORD` **ne sont pas** et **ne doivent pas** être intégrées dans le build du navigateur (sinon n'importe quel visiteur pourrait les voir en ouvrant l'inspecteur).
   - Ces clés sont consommées côté serveur par votre fichier [`server.ts`](file:///home/gerard/Documents/CAPSY%20SERVICES/capsy-services/server.ts) ou par les fonctions du dossier [`api/`](file:///home/gerard/Documents/CAPSY%20SERVICES/capsy-services/api) (`api/chat.ts`, `api/auth.ts`, `api/odoo.ts`).

3. **Ce qui se passe sur cPanel** :
   - Apache dans `public_html` sert parfaitement les fichiers statiques (c'est pour cela que la page d'accueil s'affiche).
   - Mais quand vous essayez de vous connecter (`POST /api/auth`) ou d'écrire au chatbot (`POST /api/chat`), Apache ne trouve aucun script serveur pour traiter ces routes. À la place, il renvoie une erreur 404 ou le fichier `index.html` (à cause de la réécriture SPA du `.htaccess`).
   - Le navigateur s'attend à du JSON ou au flux Gemini, mais reçoit du HTML ➔ d'où les messages d'erreur :
     - *"Erreur de connexion au serveur"*
     - *"Impossible de joindre le service de discussion"*

---

### 🛠️ Les solutions pour résoudre le problème

Voici les **3 options possibles**, de la plus simple à la plus complète :

---

#### Option 1 : La plus simple et recommandée (Pointer le domaine sur Vercel)

Puisque votre projet a été conçu avec des fonctions serverless (`api/*.ts`, [`vercel.json`](file:///home/gerard/Documents/CAPSY%20SERVICES/capsy-services/vercel.json)) et que le backend fonctionne déjà sur Vercel :

1. Allez sur votre compte **Vercel** dans votre projet `capsy-services` :
   - **Settings** ➔ **Domains** ➔ Ajoutez `capsy-rdc.org` et `www.capsy-rdc.org`.
   - Vercel vous donnera les enregistrements DNS à appliquer (généralement un type `A` vers `76.76.21.21` et un `CNAME` pour `www` vers `cname.vercel-dns.com`).
2. Allez sur **cPanel** dans l'outil **Zone Editor** (Gestionnaire de zones DNS) :
   - Modifiez l'enregistrement `A` de `capsy-rdc.org` pour pointer vers `76.76.21.21`.
   - Modifiez ou ajoutez le `CNAME` de `www.capsy-rdc.org` vers `cname.vercel-dns.com`.
3. **Résultat** : En quelques minutes, votre domaine sera relié, le SSL sera généré automatiquement, et Gemini comme Odoo fonctionneront sans toucher à Apache.

---

#### Option 2 : Conserver les fichiers sur cPanel + Proxy vers le backend Vercel

Si vous devez obligatoirement garder l'hébergement des fichiers dans le `public_html` de cPanel :

Le frontend sur `https://capsy-rdc.org` doit pouvoir relayer ses requêtes `/api/*` vers le backend Vercel (`https://capsy-services.vercel.app/api/*`).

Sur cPanel, éditez votre fichier `.htaccess` dans `public_html` (ou créez-le) avec ces règles :

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  # 1. Relayer tous les appels /api vers le backend Vercel (mod_proxy)
  RewriteRule ^api/(.*)$ https://capsy-services.vercel.app/api/$1 [P,L]

  # 2. Gestion du Single Page Application React (redirection vers index.html)
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```
> [!NOTE]
> Cette méthode nécessite que le module Apache `mod_proxy` soit activé sur votre hébergeur cPanel. Si `mod_proxy` n'est pas autorisé par votre formule cPanel, utilisez l'Option 1 ou l'Option 3.

---

#### Option 3 : Faire tourner l'application Node.js directement sur cPanel

Si votre hébergement cPanel propose l'outil **"Setup Node.js App"** (CloudLinux NodeJS Selector) :

1. Dans cPanel, cherchez **"Setup Node.js App"** :
   - Créez une application Node.js (version 20+).
   - Application root : un dossier en dehors de `public_html` (ex: `/home1/capsydba/capsy-app`).
   - Application startup file : `server.js` (ou `dist-server/server.js`).
2. Uploadez l'ensemble du projet (avec `package.json`, `.env`, et les dépendances `npm install`).
3. Renseignez les variables d'environnement dans l'interface cPanel (`GEMINI_API_KEY`, `ODOO_URL`, `ODOO_DB`, `ODOO_USERNAME`, `ODOO_PASSWORD`).
4. Lancez le serveur Node.js via cPanel.

---

### Quelle solution préférez-vous ?

- Si vous avez accès au **Zone Editor** sur cPanel et au compte **Vercel**, **l'Option 1** est la plus rapide et la plus stable (zéro configuration serveur manuelle).
- Si vous souhaitez tester immédiatement la redirection sur cPanel, **l'Option 2** se fait en 2 minutes en modifiant simplement le fichier `.htaccess` présent dans votre `public_html`.