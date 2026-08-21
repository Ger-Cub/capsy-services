export interface NewsMedia {
  type: 'image' | 'video' | 'embed';
  src: string;
  alt?: string;
  caption?: string;
}

export interface NewsItem {
  id: string;
  title: string;
  slug: string;
  date: string; // ISO or human-readable
  excerpt: string;
  content: string; // html/markdown string
  media?: NewsMedia[];
  tags?: string[];
  authors?: { name: string; role?: string }[];
  partners?: string[];
  location?: string;
  published?: boolean;
  featured?: boolean;
}

export const NEWS: NewsItem[] = [
  {
    id: 'news-2026-formation-tccg-closure',
    title: "Clôture de la formation TCC-G — Goma, Juillet 2026",
    slug: 'cloture-formation-tccg-goma-2026',
    date: '2026-07-03',
    excerpt: "La formation des Psychologues Facilitateurs en TCC-G s'est achevée avec succès à Goma. Retour sur les moments forts.",
    content: `La formation intensive organisée par le Centre d'Assistance Psychologique (CAPSY SERVICES) en partenariat avec HEAL AFRICA/STAR-RDC s'est terminée le 3 juillet 2026. Les participants ont complété 24 heures de formation pratique et théorique, connaissent désormais le protocole TCC-G et ont reçu des certificats.\n\nPrincipales activités : sessions pratiques, supervision clinique, et évaluation finale. Les certificats portent le préfixe TCCG-2026.`,
    media: [
      { type: 'image', src: '/images/news/tccg-cloture-1.svg', alt: 'Photo de groupe - formation TCCG', caption: 'Participants et formateurs après la cérémonie de clôture' },
      { type: 'image', src: '/images/news/tccg-cloture-2.svg', alt: 'Atelier pratique', caption: 'Mise en situation lors d’une séance de groupe' },
    ],
    tags: ['formation', 'TCC-G', 'Goma', 'CAPSY'],
    authors: [{ name: 'CAPSY SERVICES', role: 'Organisation' }],
    partners: ['HEAL AFRICA', 'STAR-RDC'],
    location: 'Goma, RDC',
    published: true,
    featured: true,
  },

  {
    id: 'news-2026-ecole-activite-sante-mental',
    title: "Atelier de sensibilisation en santé mentale dans les écoles locales",
    slug: 'atelier-sensibilisation-ecoles-2026',
    date: '2026-06-15',
    excerpt: "CAPSY a mené une activité communautaire de sensibilisation en santé mentale auprès d'élèves et enseignants.",
    content: `Le 15 juin 2026, une équipe de CAPSY SERVICES est intervenue dans trois écoles de la ville pour animer des ateliers de sensibilisation sur la santé mentale des enfants et des adolescents. L'objectif était d'informer les enseignants sur la détection précoce et les techniques de soutien psychosocial simple.\n\nInterventions : présentations, jeux pédagogiques et distribution de fiches pratiques pour enseignants.`,
    media: [
      { type: 'image', src: '/images/news/ecole-atelier-1.svg', alt: 'Atelier en classe', caption: 'Jeux pédagogiques utilisés pour expliquer le stress' },
      { type: 'image', src: '/images/news/ecole-atelier-2.svg', alt: 'Remise de fiches', caption: 'Distribution de fiches aux enseignants' },
    ],
    tags: ['communauté', 'écoles', 'sensibilisation'],
    authors: [{ name: 'Marie N.', role: 'Chargée de programme' }],
    location: 'Rutshuru / Goma',
    published: true,
    featured: false,
  },

  {
    id: 'news-2026-annonce-formation-ouverte',
    title: "Nouvelle session — Formation courte : Techniques de prise en charge en urgence psychologique",
    slug: 'annonce-formation-urgence-2026',
    date: '2026-08-01',
    excerpt: "Inscrivez-vous à la prochaine session courte sur la prise en charge en situation d'urgence psychologique.",
    content: `CAPSY SERVICES propose une session de 16 heures destinée aux intervenants humanitaires et cliniciens souhaitant renforcer leurs compétences en prise en charge psychologique d'urgence. La formation couvre l'évaluation rapide, interventions brèves et référencements.\n\nDate : 10–11 Septembre 2026. Lieu : Goma. Places limitées. Pour s'inscrire, contactez contact@capsyservices.org.`,
    media: [
      { type: 'embed', src: 'https://www.youtube.com/embed/dQw4w9WgXcQ', caption: "Présentation de la formation (vidéo)" },
    ],
    tags: ['formation', 'annonce', 'urgence'],
    authors: [{ name: 'CAPSY Formation', role: 'Coordination' }],
    partners: [],
    location: 'Goma',
    published: true,
    featured: false,
  },

  {
    id: 'news-2026-galerie-evenement-communaute',
    title: "Galerie — Journée communautaire : prise en charge psychosociale",
    slug: 'galerie-journee-communaute-2026',
    date: '2026-05-20',
    excerpt: "Retour en images sur la journée communautaire dédiée à la prise en charge psychosociale.",
    content: `La journée communautaire du 20 mai a rassemblé des familles, volontaires et professionnels pour des activités de soutien psychosocial et des ateliers d'information. Voici une sélection de photos de l'événement.`,
    media: [
      { type: 'image', src: '/images/news/communaute-1.svg', alt: 'Stand d’information', caption: 'Stand d’information et distribution de ressources' },
      { type: 'image', src: '/images/news/communaute-2.svg', alt: 'Ateliers', caption: 'Ateliers de jeux thérapeutiques pour enfants' },
      { type: 'image', src: '/images/news/communaute-3.svg', alt: 'Bénévoles', caption: 'Bénévoles et équipes CAPSY' },
    ],
    tags: ['galerie', 'communauté', 'événement'],
    authors: [{ name: 'Equipe CAPSY', role: 'Communication' }],
    location: 'Goma',
    published: true,
    featured: false,
  },
];
