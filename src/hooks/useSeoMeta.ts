/**
 * useSeoMeta — Hook SEO dynamique pour CAPSY Services
 * Met à jour <title>, meta description, og:, twitter: et canonical
 * à chaque changement de page dans la SPA.
 */

const BASE_URL = 'https://www.capsy-rdc.org';
const DEFAULT_IMAGE = `${BASE_URL}/icons/og-capsy.png`;

interface SeoOptions {
  title: string;
  description: string;
  canonical?: string;
  image?: string;
  type?: 'website' | 'article';
  noIndex?: boolean;
}

function setMeta(name: string, content: string, attr: 'name' | 'property' = 'name') {
  let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.content = content;
}

function setLink(rel: string, href: string) {
  let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
}

export function applySeoMeta(opts: SeoOptions) {
  const fullTitle = opts.title.includes('CAPSY')
    ? opts.title
    : `${opts.title} | CAPSY Services`;
  const description = opts.description;
  const canonical = opts.canonical
    ? `${BASE_URL}${opts.canonical}`
    : `${BASE_URL}${window.location.pathname}`;
  const image = opts.image || DEFAULT_IMAGE;
  const type = opts.type || 'website';

  // Title
  document.title = fullTitle;

  // Basic meta
  setMeta('description', description);
  if (opts.noIndex) {
    setMeta('robots', 'noindex, nofollow');
  } else {
    setMeta('robots', 'index, follow, max-image-preview:large');
  }

  // Open Graph
  setMeta('og:title', fullTitle, 'property');
  setMeta('og:description', description, 'property');
  setMeta('og:url', canonical, 'property');
  setMeta('og:image', image, 'property');
  setMeta('og:type', type, 'property');
  setMeta('og:locale', 'fr_FR', 'property');
  setMeta('og:site_name', 'CAPSY Services', 'property');

  // Twitter Card
  setMeta('twitter:card', 'summary_large_image');
  setMeta('twitter:title', fullTitle);
  setMeta('twitter:description', description);
  setMeta('twitter:image', image);

  // Canonical
  setLink('canonical', canonical);
}

/** Méta SEO par route */
export const PAGE_SEO: Record<string, SeoOptions> = {
  '/': {
    title: 'CAPSY Services — Psychologues à Goma & Kinshasa | Santé mentale en RDC',
    description:
      'CAPSY Services propose un accompagnement psychologique professionnel et confidentiel à Goma et Kinshasa (RDC). Séances individuelles, thérapie de couple, familiale, soutien enfants/ados. Prenez rendez-vous en ligne.',
    canonical: '/',
  },
  '/services': {
    title: 'Nos services — Psychothérapie, accompagnement, évaluation',
    description:
      'Découvrez tous les services de CAPSY Services : psychothérapie individuelle, thérapie de couple, familiale, accompagnement enfants/ados, supervision clinique et soutien post-incident à Goma et Kinshasa.',
    canonical: '/services',
  },
  '/a-propos': {
    title: 'À propos de CAPSY Services — Centre de psychologie clinique en RDC',
    description:
      "CAPSY SARL est un centre de psychologie clinique fondé en RDC, engagé dans l'accompagnement psychologique des individus, familles et organisations à Goma et Kinshasa.",
    canonical: '/a-propos',
  },
  '/contact': {
    title: 'Contactez CAPSY Services — Goma & Kinshasa',
    description:
      "Contactez l'équipe CAPSY Services par WhatsApp (+243 997 707 312) ou par email. Bureaux à Goma (av. des Écoles) et Kinshasa (av. Kabinda). Ouvert du lundi au vendredi 08h–16h.",
    canonical: '/contact',
  },
  '/faq': {
    title: 'Questions fréquentes — CAPSY Services',
    description:
      "Retrouvez les réponses aux questions les plus fréquentes sur les services de CAPSY : confidentialité, tarifs, déroulement des séances, prise en charge et réservation.",
    canonical: '/faq',
  },
  '/gouvernance': {
    title: 'Gouvernance & équipe — CAPSY Services',
    description:
      "Découvrez la direction clinique et l'équipe de psychologues de CAPSY Services : Jacques Kambale Batenga, Josué Kasereka Shamamba et Samuel Kasereka Musisiva.",
    canonical: '/gouvernance',
  },
  '/formations': {
    title: 'CAPSY Academy — Formations en santé mentale (RDC)',
    description:
      "CAPSY Academy propose des formations certifiantes en santé mentale, bien-être psychosocial et premiers secours psychologiques à destination des professionnels et organisations en RDC.",
    canonical: '/formations',
  },
  '/actualites': {
    title: 'Actualités — CAPSY Services',
    description:
      "Suivez les dernières actualités de CAPSY Services : événements, ateliers, publications et informations sur la santé mentale en RDC.",
    canonical: '/actualites',
  },
  '/mentions-legales': {
    title: 'Mentions légales — CAPSY Services',
    description: 'Mentions légales de CAPSY SARL, éditeur du site capsy-rdc.org.',
    canonical: '/mentions-legales',
    noIndex: true,
  },
  '/confidentialite': {
    title: 'Politique de confidentialité — CAPSY Services',
    description:
      "Politique de confidentialité et gestion des données personnelles par CAPSY SARL.",
    canonical: '/confidentialite',
    noIndex: true,
  },
  '/mes-rendezvous': {
    title: 'Mes rendez-vous — CAPSY Services',
    description: "Consultez et gérez vos rendez-vous avec les psychologues CAPSY Services.",
    canonical: '/mes-rendezvous',
    noIndex: true,
  },
};
