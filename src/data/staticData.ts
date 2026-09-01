import { Service, Value, Question } from '../types';
import seanceIndivImg from '../assets/images_site/Seance_psychologique_individuelle.png';
import psychotherapieIndivImg from '../assets/images_site/Psychotherapie_individuelle.png';
import therapieFamilialeImg from '../assets/images_site/Therapie_familiale.png';
import therapieFamiliale2Img from '../assets/images_site/Therapie_familiale_2.png';
import evalEnfantsImg from '../assets/images_site/Evaluation_psychologique_enfants_ados_2.png';
import evalAdultesImg from '../assets/images_site/Evaluation_psyhonoligique_adulte.png';
import accompEnfantsImg from '../assets/images_site/Accompagnement_enfants_ados.png';
import postIncidentImg from '../assets/images_site/Post-incident_critique_individuel.png';
import supervisionImg from '../assets/images_site/Supersion_clinique_individuelle.png';

export const SERVICES: Service[] = [
  {
    id: 'individuelle',
    title: 'Séance psychologique individuelle',
    shortDescription: 'Entretien confidentiel avec un psychologue pour comprendre ce que vous traversez et vous aider à retrouver un apaisement.',
    fullDescription: 'C’est un espace pour exprimer librement ce que vous ressentez, sans jugement, avec un professionnel qui vous accompagne pas à pas.',
    iconName: 'User',
    imageAlt: 'Séance psychologique individuelle chez CAPSY',
    price: 55,
    therapists: ['David Kabumba', 'Jemima Kyanza', 'Josué Kasereka', 'Judith Kabuo', 'Solange Salima'],
    pourQui: 'Adultes et jeunes qui souhaitent parler à un psychologue.',
    objectif: 'Réduire le stress, clarifier les pensées, améliorer le bien-être émotionnel de manière mesurable (sommeil, humeur, concentration).',
    commentCaSePasse: 'Vous discutez avec un psychologue formé. Il vous aide à identifier ce qui vous pèse et propose des outils simples pour gérer les émotions, les pensées difficiles et les situations stressantes.',
    duree: '60 minutes',
    modalite: 'Au bureau CAPSY ou en ligne',
    quandLutiliser: 'Quand on se sent dépassé, triste, anxieux, qu’on n’arrive plus à gérer un souci familial, professionnel ou personnel.',
    imageUrl: seanceIndivImg
  },
  {
    id: 'psychotherapie',
    title: 'Psychothérapie individuelle',
    shortDescription: 'Suivi structuré avec un psychothérapeute pour traiter des difficultés émotionnelles plus profondes.',
    fullDescription: 'La psychothérapie aide à changer durablement les pensées et comportements qui causent de la souffrance en s’appuyant sur des bases scientifiques.',
    iconName: 'BrainCircuit',
    imageAlt: 'Séance active de psychothérapie clinique chez CAPSY',
    price: 55,
    therapists: ['Jacques Betenga', 'Samuel Kasereka'],
    pourQui: 'Personnes qui vivent des difficultés persistantes ou récurrentes.',
    objectif: 'Améliorer l’humeur, réduire les symptômes anxieux ou traumatiques, stabiliser le fonctionnement quotidien.',
    commentCaSePasse: 'Le thérapeute utilise des méthodes cliniques reconnues (TCC, NET, approche systémique). Vous avancez étape par étape pour transformer ce qui vous bloque.',
    duree: '60 minutes',
    modalite: 'Présentiel ou en ligne',
    quandLutiliser: 'Traumatisme (VBG, guerre, accident), anxiété chronique, crises émotionnelles, souvenirs envahissants, difficultés relationnelles profondes.',
    imageUrl: psychotherapieIndivImg
  },
  {
    id: 'famille',
    title: 'Thérapie familiale',
    shortDescription: 'Séance collective pour rétablir l’harmonie dans les familles en conflit. Le thérapeute aide chacun à s’exprimer.',
    fullDescription: 'Le thérapeute facilite la communication constructive et aide chaque membre à se faire entendre dans un cadre sécurisé.',
    iconName: 'Users',
    imageAlt: 'Thérapie familiale collective',
    price: 120,
    therapists: ['Samuel Kasereka'],
    pourQui: 'Couples mariés ou de fait, en situation de conflit ou de rupture de communication.',
    objectif: 'Améliorer la communication, réduire les disputes répétitives, renforcer la confiance mutuelle et la stabilité émotionnelle au sein du couple.',
    commentCaSePasse: 'Les deux partenaires échangent avec un thérapeute neutre. Des exercices cliniques pratiques sont proposés pour améliorer l’écoute, la compréhension et le respect mutuel.',
    duree: '60–75 minutes',
    modalite: 'Au bureau CAPSY uniquement',
    quandLutiliser: 'Tensions constantes, jalousie démesurée, manque d’écoute, violences psychologiques, familles sous pression économique ou sécuritaire (contexte fréquent en RDC).',
    imageUrl: therapieFamilialeImg
  },
  {
    id: 'famille',
    title: 'Thérapie familiale',
    shortDescription: 'Séance d’accompagnement collectif pour rétablir la communication et l’harmonie dans les foyers en conflit.',
    fullDescription: 'Le thérapeute aide chaque membre du noyau familial à s’exprimer calmement et à réformer la structure relationnelle pour retrouver un climat stable.',
    iconName: 'Users',
    imageAlt: 'Thérapie familiale collective',
    price: 120,
    therapists: ['Samuel KASEREKA MUSISIVA'],
    pourQui: 'Familles, parents, enfants, fratries, adolescents.',
    objectif: 'Réduire les conflits intra-familiaux, améliorer la fluidité relationnelle, restaurer la confiance parentale et filiale.',
    commentCaSePasse: 'Tous les membres concernés participent. Le thérapeute guide les échanges, favorise la décharge émotionnelle saine et propose des stratégies pour un mieux-vivre ensemble.',
    duree: '75–90 minutes',
    modalite: 'Au bureau CAPSY uniquement',
    quandLutiliser: 'Tensions parents-enfants, problèmes de comportement scolaire, ruptures de dialogue, déchirements lors de recompositions familiales, stress de précarité ou d’insécurité.',
    imageUrl: therapieFamiliale2Img
  },
  {
    id: 'evaluation_enfants',
    title: 'Évaluation psychologique enfants/ados',
    shortDescription: 'Analyse complète du fonctionnement cognitif, émotionnel et comportemental de l’enfant et de l’adolescent.',
    fullDescription: 'Ce bilan permet de mieux comprendre les difficultés et de proposer des orientations thérapeutiques adaptées.',
    iconName: 'Activity',
    imageAlt: 'Bilan psychologique pour enfant',
    price: 200,
    therapists: ['Jacques Batenga'],
    pourQui: 'Enfants et adolescents (6 à 17 ans).',
    objectif: 'Identifier les forces psychologiques, cartographier les besoins spécifiques (TDAH, anxiété, etc.) et poser des orientations thérapeutiques adaptées.',
    commentCaSePasse: 'Tests psychologiques cliniques standardisés, phases d’observation ludique, entretiens approfondis avec les parents, suivis d’un rapport écrit détaillé.',
    duree: 'Variable (1 à 2 séances complètes)',
    modalite: 'Au bureau CAPSY uniquement',
    quandLutiliser: 'Baisse inexpliquée des résultats scolaires, agitation excessive, retrait relationnel, traumatisme post-déplacement ou deuil, violences vécues.',
    imageUrl: evalEnfantsImg
  },
  {
    id: 'evaluation_adultes',
    title: 'Évaluation psychologique adultes',
    shortDescription: 'Bilan complet du fonctionnement mental, émotionnel et cognitif. Un rapport clair est fourni pour comprendre l’état.',
    fullDescription: 'Le rapport permet d’orienter un suivi adapté et de documenter précisément les forces et besoins psychologiques.',
    iconName: 'LineChart',
    imageAlt: 'Bilan psychologique pour adultes',
    price: 300,
    therapists: ['Jacques Batenga', 'Josué Kasereka', 'Samuel Kasereka'],
    pourQui: 'Adultes et professionnels.',
    objectif: 'Mesurer objectivement le degré de stress, l’attention, la mémoire, le profil de personnalité ou l’humeur.',
    commentCaSePasse: 'Tests cliniques validés, entretiens diagnotiques semi-structurés, interprétation scientifique des résultats et remise d’un rapport écrit exploitable en thérapie ou RH.',
    duree: 'Variable selon les indicateurs recherchés',
    modalite: 'Au bureau CAPSY',
    quandLutiliser: 'Burn-out professionnel, séquelles de psycho-traumatismes, baisse de performances au travail, indécisions lourdes, fatigue cognitive chronique.',
    imageUrl: evalAdultesImg
  },
  {
    id: 'accompagnement_enfants',
    title: 'Accompagnement enfants/ados',
    shortDescription: 'Séance adaptée pour aider l’enfant à mieux gérer ses émotions et comportements.',
    fullDescription: 'Un suivi pensé pour les jeunes afin de soutenir leur stabilité affective et scolaire.',
    iconName: 'GraduationCap',
    imageAlt: 'Soutien psychologique jeunesse',
    price: 30,
    therapists: ['Jacques Batenga', 'Samuel Kasereka'],
    pourQui: 'Enfants et adolescents (6 à 17 ans) sous pression cognitive ou affective.',
    objectif: 'Renforcer l’intelligence émotionnelle, apaiser les accès de colère ou de peur, et restaurer l’estime de soi.',
    commentCaSePasse: 'Discussions simplifiées, jeux de rôles, techniques artistiques thérapeutiques, et guidance éducative parentale régulière.',
    duree: '60 minutes',
    modalite: 'Au bureau CAPSY',
    quandLutiliser: 'Colères récurrentes, phobies, repli sur soi, difficultés à l’école, traumatismes liés au déplacement sécuritaire en RDC, harcèlement.',
    imageUrl: accompEnfantsImg
  },
  {
    id: 'post_incident',
    title: 'Post-incident critique individuel',
    shortDescription: 'Soutien rapide pour une personne ayant vécu un événement traumatisant dans le cadre du travail.',
    fullDescription: 'Intervention clinique rapide indispensable pour stabiliser et aider à reprendre pied après un incident grave.',
    iconName: 'LifeBuoy',
    imageAlt: 'Soutien de crise immédiat post-incident',
    price: 55,
    therapists: ['Jacques Batenga', 'Samuel Kasereka'],
    pourQui: 'Employés, humanitaires, cadres, ou particuliers suite à un choc.',
    objectif: 'Stabiliser psychologiquement, réduire le niveau de détresse aigu, amorcer la verbalisation de l’effroi subi.',
    commentCaSePasse: 'Séance clinique d’impact précoce avec un psychologue formé, recours à des techniques de stabilisation physique et d’ancrage émotionnel.',
    duree: '1 à 1,5 heure',
    modalite: 'Bureau CAPSY ou en ligne',
    quandLutiliser: 'Vol, hold-up, agression violente directe, mort subite d’un collègue, crash, catastrophe naturelle ou crise en zone de conflit.',
    imageUrl: postIncidentImg
  },
  {
    id: 'supervision',
    title: 'Supervision clinique individuelle',
    shortDescription: 'Accompagnement professionnel pour psychologues souhaitant améliorer leur pratique.',
    fullDescription: 'Un espace nécessaire d’analyse de la pratique, d’ajustement des postures et de protection contre l’épuisement émotionnel.',
    iconName: 'Sparkles',
    imageAlt: 'Supervision de psychologue',
    price: 70,
    therapists: ['Jacques Batenga', 'Samuel Kasereka'],
    pourQui: 'Psychologues cliniciens, psychothérapeutes, conseillers d’orientation, éducateurs spécialisés.',
    objectif: 'Prendre du recul, enrichir ses outils d’intervention, analyser des profils complexes et valider sa démarche clinique d’accompagnement.',
    commentCaSePasse: 'Séances individuelles calquées sur l’étude de cas concrets, l’évaluation de la contre-attitude thérapeutique, et la formation croisée.',
    duree: '60 minutes',
    modalite: 'Bureau CAPSY ou en ligne',
    quandLutiliser: 'Sentiment d’impasse sur un suivi thérapeutique, dilemme déontologique aigu, surcharge ou saturation émotionnelle ressentie.',
    imageUrl: supervisionImg
  }
];

export const VALUES: Value[] = [
  {
    name: 'Dignité & Respect',
    description: 'Chaque personne est accueillie sans aucune discrimination. Nous veillons scrupuleusement à protéger la vie privée, les droits et la dignité de chacun.',
    iconName: 'Heart'
  },
  {
    name: 'Éthique & Responsabilité',
    description: 'La protection des personnes est notre priorité absolue. Nous refusons toute attitude d’abus ou d’exagération et agissons selon nos compétences strictes.',
    iconName: 'ShieldCheck'
  },
  {
    name: 'Compétence Professionnelle',
    description: 'Nos interventions reposent sur des pratiques validées scientifiquement, une formation clinique continue et une supervision professionnelle régulière.',
    iconName: 'Award'
  },
  {
    name: 'Confidentialité Absolue',
    description: 'Le secret professionnel entoure tous nos échanges. Aucune information personnelle n’est divulguée ou exploitée sans consentement formel.',
    iconName: 'Lock'
  },
  {
    name: 'Équité & Accessibilité',
    description: 'Nos tarifs et nos modalités d’accompagnement s’adaptent avec bienveillance à la situation de chacun, aux cadres institutionnels et partenariats.',
    iconName: 'HeartHandshake'
  },
  {
    name: 'Non-marchandisation',
    description: 'La santé mentale est un enjeu humain et social, non un produit. Les ressources financières générées servent exclusivement à garantir la qualité et l’accessibilité des soins.',
    iconName: 'Coins'
  }
];

export const STRESS_TEST_QUESTIONS: Question[] = [
  {
    id: 1,
    text: "Ces derniers temps, à quelle fréquence vous sentez-vous dépassé(e) ou incapable de contrôler les événements majeurs de votre vie ?",
    options: [
      { text: "Presque jamais", score: 0 },
      { text: "Parfois", score: 1 },
      { text: "Assez souvent", score: 2 },
      { text: "Pratiquement tous les jours", score: 3 }
    ]
  },
  {
    id: 2,
    text: "Trouvez-vous difficile de vous détendre, de calmer vos pensées ou de trouver un sommeil réparateur ?",
    options: [
      { text: "Non, je m'endors et me détends facilement", score: 0 },
      { text: "Occasionnellement, si j'ai eu une journée chargée", score: 1 },
      { text: "Oui, la plupart des nuits mes pensées tournent en boucle", score: 2 },
      { text: "C'est un combat permanent, je me sens constamment sous tension", score: 3 }
    ]
  },
  {
    id: 3,
    text: "Ressentez-vous régulièrement de la fatigue physique, des maux de tête, ou des tensions musculaires inexpliquées (dos, nuque) ?",
    options: [
      { text: "Très rarement ou jamais", score: 0 },
      { text: "De temps en temps après de gros efforts", score: 1 },
      { text: "Fréquemment, plusieurs fois par semaine", score: 2 },
      { text: "Oui, ces douleurs physiques font partie de mon quotidien", score: 3 }
    ]
  },
  {
    id: 4,
    text: "Comment caractérisez-vous votre patience ou votre réactivité émotionnelle face aux imprévus ces jours-ci ?",
    options: [
      { text: "Je reste calme et rationnel(le)", score: 0 },
      { text: "Je m'agace un peu mais je me contrôle rapidement", score: 1 },
      { text: "Je m'énerve ou m'attriste très facilement pour des détails", score: 2 },
      { text: "Je me sens à fleur de peau, sur le point d'éclater à tout moment", score: 3 }
    ]
  },
  {
    id: 5,
    text: "Avez-vous tendance à vous isoler socialement, à éviter de parler à vos proches ou à délaisser vos activités préférées ?",
    options: [
      { text: "Non, je reste très connecté(e) et actif(ve)", score: 0 },
      { text: "Un peu, par manque de temps", score: 1 },
      { text: "Oui, j'ai de moins en moins d'énergie pour les interactions", score: 2 },
      { text: "Absolument, je me replie complètement sur moi-même", score: 3 }
    ]
  },
  {
    id: 6,
    text: "Comment évaluez-vous votre concentration ou votre productivité au travail ou à la maison en ce moment ?",
    options: [
      { text: "Excellente, mon esprit est vif et concentré", score: 0 },
      { text: "Correcte, bien que j'aie quelques moments d'égarement", score: 1 },
      { text: "Diminuée, j'ai du mal à finir mes tâches et remets tout à plus tard", score: 2 },
      { text: "Très altérée, je commets des erreurs fréquentes et me sens noyé(e)", score: 3 }
    ]
  }
];

export const FAQS = [
  {
    question: "Combien de temps dure une séance de consultation ?",
    answer: "Une séance de consultation individuelle standard dure généralement entre 45 et 60 minutes. Les thérapies familiales ou collectives peuvent aller jusqu'à 90 minutes selon les besoins et les configurations."
  },
  {
    question: "La confidentialité est-elle vraiment garantie à 100% ?",
    answer: "Absolument. La confidentialité est notre valeur cardinale. Tout ce qui est partagé durant les séances est couvert par le secret professionnel absolu du psychologue, conformément au code d'éthique et de déontologie."
  },
  {
    question: "Faites-vous des consultations en ligne ou à distance ?",
    answer: "Oui, nous proposons des consultations en visioconférence (via Google Meet, Zoom ou WhatsApp) pour les personnes ne résidant pas à Goma ou préférant le confort de leur domicile."
  },
  {
    question: "Quels sont les tarifs d'une séance ?",
    answer: "Nos tarifs sont adaptés pour rester accessibles à la communauté tout en garantissant des soins de haute qualité. Nous proposons également des tarifs préférentiels et des facilités pour les étudiants ou les personnes traversant des difficultés de précarité extrême."
  },
  {
    question: "Comment se déroule la première séance ?",
    answer: "La première séance est une rencontre d'évaluation mutuelle. Aucun diagnostic hâtif n'est posé. C'est l'occasion pour vous d'exprimer vos besoins, de poser vos questions, et de convenir ensemble de l'approche et du rythme d'accompagnement adapté."
  }
];
