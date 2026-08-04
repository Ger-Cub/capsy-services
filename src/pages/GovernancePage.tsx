import React from 'react';
import PageHero from '../components/PageHero';
import LucideIcon from '../components/LucideIcon';
import { motion } from 'motion/react';

interface GovernancePageProps {
  onOpenBooking: () => void;
}

const TECHNICAL_POLES = [
  {
    title: 'Pôle Thérapies Spécialisées',
    icon: 'Brain',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    iconBg: 'bg-emerald-100 text-emerald-700',
    items: [
      'Évaluation psychologique structurée',
      'Thérapies individuelles et de groupe',
      'Prise en charge des traumatismes et violences basées sur le genre (VBG)',
      'Accompagnement des cas complexes et à haut risque',
    ],
  },
  {
    title: 'Pôle Recherche et Innovation',
    icon: 'Microscope',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    iconBg: 'bg-blue-100 text-blue-700',
    items: [
      'Documentation des pratiques et capitalisation d’expériences',
      'Production de données probantes en santé mentale et psychosociale',
      'Amélioration continue des protocoles d’intervention',
      'Développement de modèles adaptés au contexte congolais et urbain fragile',
    ],
  },
  {
    title: 'Pôle Administration et Finances',
    icon: 'Building2',
    color: 'bg-purple-50 text-purple-700 border-purple-200',
    iconBg: 'bg-purple-100 text-purple-700',
    items: [
      'Gestion financière transparente et traçable',
      'Application rigoureuse des procédures internes et d’audit',
      'Conformité légale, fiscale et réglementaire stricte',
      'Gestion administrative des contrats, partenariats et logistique',
    ],
  },
  {
    title: 'Pôle Intervention Communautaire',
    icon: 'Users',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    iconBg: 'bg-amber-100 text-amber-700',
    items: [
      'Actions de prévention et de sensibilisation de masse',
      'Mécanismes communautaires de référencement et d’alerte',
      'Accompagnement psychosocial de proximité',
      'Collaboration étroite avec les structures locales (santé, éducation, leaders)',
    ],
  },
];

const INTERVENTION_STEPS = [
  {
    step: '01',
    title: 'Évaluation psychologique structurée',
    desc: 'Analyse approfondie des besoins, de la détresse et du contexte individuel ou familial.',
    icon: 'ClipboardCheck',
  },
  {
    step: '02',
    title: 'Plan d’accompagnement individualisé',
    desc: 'Co-construction de la feuille de route thérapeutique et psychosociale.',
    icon: 'FileText',
  },
  {
    step: '03',
    title: 'Thérapie spécialisée',
    desc: 'Orientation vers un suivi individuel, de couple, familial ou de groupe.',
    icon: 'HeartHandshake',
  },
  {
    step: '04',
    title: 'Intervention communautaire',
    desc: 'Soutien psychosocial de proximité, prévention et accompagnement communautaire.',
    icon: 'Users',
  },
  {
    step: '05',
    title: 'Référencement technique',
    desc: 'Orientation vers nos partenaires pour les besoins sanitaires, sociaux, juridiques ou économiques.',
    icon: 'Share2',
  },
  {
    step: '06',
    title: 'Suivi post-intervention',
    desc: 'Consolidation des acquis thérapeutiques, évaluation et prévention des rechutes.',
    icon: 'ShieldCheck',
  },
];

export default function GovernancePage({ onOpenBooking }: GovernancePageProps) {
  return (
    <main className="grow font-sans bg-white">
      <PageHero
        variant="green"
        eyebrow="Gouvernance & Leadership"
        title="Gouvernance, Direction et Engagement Institutionnel"
        description="Découvrez notre approche stratégique pour une gouvernance transparente, éthique et rigoureuse au service de la santé mentale et du bien-être en RDC."
        primaryCtaLabel="Prendre rendez-vous"
        onPrimaryCta={onOpenBooking}
      />

      {/* Intro Mission Statement */}
      <section className="py-12 bg-linear-to-b from-brand-wellbeing/5 to-transparent border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-wellbeing/10 text-brand-wellbeing rounded-full text-xs font-bold font-poppins uppercase tracking-wider">
            <LucideIcon name="Shield" className="h-3.5 w-3.5" />
            <span>Notre Engagement Fondamental</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-poppins font-black text-brand-dark max-w-3xl mx-auto leading-relaxed">
            CAPSY sarl est un centre d’assistance psychologique engagé pour une santé mentale accessible, éthique et de qualité, au service des personnes, des familles, des organisations et des communautés.
          </h2>
        </div>
      </section>

      {/* Governance & Executive Leadership */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs uppercase tracking-widest text-brand-green font-bold font-poppins">Architecture de Décision</span>
            <h2 className="text-2xl sm:text-4xl font-poppins font-black text-brand-dark">Instances de Gouvernance et Direction Exécutive</h2>
            <p className="text-sm text-brand-gray-text leading-relaxed">
              Une répartition claire des responsabilités pour garantir l’intégrité institutionnelle, la qualité clinique et le développement durable.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Assemblée des Associés */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-3xl border border-gray-150 bg-gradient-to-b from-brand-gray-light to-white p-8 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="h-12 w-12 rounded-2xl bg-brand-wellbeing/10 text-brand-wellbeing flex items-center justify-center mb-6">
                  <LucideIcon name="Scale" className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-poppins font-bold text-brand-dark mb-2">
                  1. Assemblée des Associés
                </h3>
                <p className="text-xs font-semibold uppercase tracking-wider text-brand-wellbeing mb-4">
                  Instance suprême de décision
                </p>
                <p className="text-xs leading-relaxed text-brand-gray-text mb-5">
                  Elle veille à la cohérence entre la mission de CAPSY sarl, son Plan de Développement Institutionnel (PDI) et ses actions sur le terrain.
                </p>
                <ul className="space-y-2.5 text-xs text-brand-dark font-medium">
                  <li className="flex items-start gap-2">
                    <LucideIcon name="CheckCircle2" className="h-4 w-4 text-brand-wellbeing shrink-0 mt-0.5" />
                    <span>Définit les grandes orientations stratégiques de CAPSY</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <LucideIcon name="CheckCircle2" className="h-4 w-4 text-brand-wellbeing shrink-0 mt-0.5" />
                    <span>Approuve les rapports techniques et financiers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <LucideIcon name="CheckCircle2" className="h-4 w-4 text-brand-wellbeing shrink-0 mt-0.5" />
                    <span>Nomme et évalue la Gérance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <LucideIcon name="CheckCircle2" className="h-4 w-4 text-brand-wellbeing shrink-0 mt-0.5" />
                    <span>Valide les politiques institutionnelles majeures</span>
                  </li>
                </ul>
              </div>
            </motion.div>

            {/* La Gérance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="rounded-3xl border border-gray-150 bg-gradient-to-b from-brand-gray-light to-white p-8 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="h-12 w-12 rounded-2xl bg-brand-wellbeing/10 text-brand-wellbeing flex items-center justify-center mb-6">
                  <LucideIcon name="Briefcase" className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-poppins font-bold text-brand-dark mb-2">
                  2. La Gérance
                </h3>
                <p className="text-xs font-semibold uppercase tracking-wider text-brand-wellbeing mb-4">
                  Leadership Exécutif
                </p>
                <p className="text-xs leading-relaxed text-brand-gray-text mb-5">
                  Assure la coordination opérationnelle et la mise en œuvre rigoureuse des décisions stratégiques de l’Assemblée.
                </p>
                <ul className="space-y-2.5 text-xs text-brand-dark font-medium">
                  <li className="flex items-start gap-2">
                    <LucideIcon name="CheckCircle2" className="h-4 w-4 text-brand-wellbeing shrink-0 mt-0.5" />
                    <span>Coordination des activités cliniques, communautaires et numériques</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <LucideIcon name="CheckCircle2" className="h-4 w-4 text-brand-wellbeing shrink-0 mt-0.5" />
                    <span>Gestion des ressources humaines, financières et logistiques</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <LucideIcon name="CheckCircle2" className="h-4 w-4 text-brand-wellbeing shrink-0 mt-0.5" />
                    <span>Développement stratégique et partenariats institutionnels</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <LucideIcon name="CheckCircle2" className="h-4 w-4 text-brand-wellbeing shrink-0 mt-0.5" />
                    <span>Représentation auprès des autorités, partenaires et bailleurs</span>
                  </li>
                </ul>
              </div>
            </motion.div>

            {/* Direction Clinique */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="rounded-3xl border border-gray-150 bg-gradient-to-b from-brand-gray-light to-white p-8 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="h-12 w-12 rounded-2xl bg-brand-wellbeing/10 text-brand-wellbeing flex items-center justify-center mb-6">
                  <LucideIcon name="Stethoscope" className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-poppins font-bold text-brand-dark mb-2">
                  3. Direction Clinique
                </h3>
                <p className="text-xs font-semibold uppercase tracking-wider text-brand-wellbeing mb-4">
                  Excellence et Rigueur Scientifique
                </p>
                <p className="text-xs leading-relaxed text-brand-gray-text mb-5">
                  Garantit la qualité technique et l’alignement des interventions cliniques sur les normes internationales (OMS 2016, 2021).
                </p>
                <ul className="space-y-2.5 text-xs text-brand-dark font-medium">
                  <li className="flex items-start gap-2">
                    <LucideIcon name="CheckCircle2" className="h-4 w-4 text-brand-wellbeing shrink-0 mt-0.5" />
                    <span>Validation et adaptation des protocoles thérapeutiques</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <LucideIcon name="CheckCircle2" className="h-4 w-4 text-brand-wellbeing shrink-0 mt-0.5" />
                    <span>Supervision clinique des équipes et intervision</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <LucideIcon name="CheckCircle2" className="h-4 w-4 text-brand-wellbeing shrink-0 mt-0.5" />
                    <span>Approches spécialisées (Trauma, TCC, urgences psychosociales)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <LucideIcon name="CheckCircle2" className="h-4 w-4 text-brand-wellbeing shrink-0 mt-0.5" />
                    <span>Organisation de la formation continue du personnel clinique</span>
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Organisation Technique et Clinique - Les 4 Pôles */}
      <section className="py-16 sm:py-20 bg-brand-gray-light border-y border-gray-150">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs uppercase tracking-widest text-brand-green font-bold font-poppins">Structure Opérationnelle</span>
            <h2 className="text-2xl sm:text-4xl font-poppins font-black text-brand-dark">Pôles d'Excellence Technique et Clinique</h2>
            <p className="text-sm text-brand-gray-text leading-relaxed">
              CAPSY sarl développe un modèle intégré combinant expertise clinique, ancrage communautaire et innovation continue.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {TECHNICAL_POLES.map((pole, idx) => (
              <motion.div
                key={pole.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-3xl p-7 border border-gray-200 shadow-xs hover:shadow-md transition-all space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-2xl ${pole.iconBg}`}>
                    <LucideIcon name={pole.icon} className="h-6 w-6" />
                  </div>
                  <h3 className="font-poppins font-bold text-lg text-brand-dark">{pole.title}</h3>
                </div>

                <div className="h-px bg-gray-100 w-full" />

                <ul className="space-y-2.5">
                  {pole.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-brand-dark leading-relaxed">
                      <LucideIcon name="ChevronRight" className="h-4 w-4 text-brand-wellbeing shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Engagement Communautaire et Développement Social */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs uppercase tracking-widest text-brand-green font-bold font-poppins">Impact Social</span>
            <h2 className="text-2xl sm:text-4xl font-poppins font-black text-brand-dark">Engagement Communautaire & Partenariats</h2>
            <p className="text-sm text-brand-gray-text leading-relaxed">
              CAPSY sarl place les communautés au cœur de son action, en cohérence avec son Plan de Développement Institutionnel.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="bg-emerald-50/50 rounded-3xl p-8 border border-emerald-100 space-y-4">
              <div className="h-10 w-10 rounded-xl bg-brand-green text-white flex items-center justify-center">
                <LucideIcon name="Users" className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold font-poppins text-brand-dark">Approche Communautaire</h3>
              <ul className="space-y-2 text-xs text-brand-dark leading-relaxed">
                <li>• Renforcement des capacités locales en santé mentale.</li>
                <li>• Mobilisation des leaders communautaires et réseaux d’entraide.</li>
                <li>• Réduction active de la stigmatisation.</li>
                <li>• Co-construction de réponses adaptées aux réalités socioculturelles.</li>
              </ul>
            </div>

            <div className="bg-blue-50/50 rounded-3xl p-8 border border-blue-100 space-y-4">
              <div className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                <LucideIcon name="Heart" className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold font-poppins text-brand-dark">Développement Social</h3>
              <ul className="space-y-2 text-xs text-brand-dark leading-relaxed">
                <li>• Prévention communautaire et cohésion sociale.</li>
                <li>• Accès facilité aux services sociaux, juridiques et économiques.</li>
                <li>• Accompagnement des groupes vulnérables (femmes, déplacé·e·s, survivant·e·s VBG).</li>
                <li>• Autonomisation individuelle et collective durable.</li>
              </ul>
            </div>

            <div className="bg-purple-50/50 rounded-3xl p-8 border border-purple-100 space-y-4">
              <div className="h-10 w-10 rounded-xl bg-purple-600 text-white flex items-center justify-center">
                <LucideIcon name="Handshake" className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold font-poppins text-brand-dark">Réseaux Partenariaux</h3>
              <ul className="space-y-2 text-xs text-brand-dark leading-relaxed">
                <li>• Collaboration avec les associations de base et ONG locales.</li>
                <li>• Intégration avec les structures sanitaires et scolaires.</li>
                <li>• Articulation avec les autorités locales.</li>
                <li>• Synergie avec les acteurs humanitaires et de développement.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Assurance Qualité, Éthique et Protection */}
      <section className="py-16 sm:py-20 bg-brand-dark text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(0,140,60,0.25),_transparent_50%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs uppercase tracking-widest text-brand-green font-bold font-poppins">Standard & Éthique</span>
            <h2 className="text-2xl sm:text-4xl font-poppins font-black text-white">Qualité, Éthique & Protection des Bénéficiaires</h2>
            <p className="text-sm text-white/70 leading-relaxed">
              Nos engagements s’inscrivent rigoureusement dans les principes internationaux de bonne gouvernance (OCDE 2015) et les directives de l'OMS.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-4 backdrop-blur-xs">
              <div className="flex items-center gap-3">
                <LucideIcon name="Award" className="h-6 w-6 text-brand-green" />
                <h3 className="text-xl font-bold font-poppins text-white">Assurance Qualité</h3>
              </div>
              <ul className="space-y-3 text-xs text-white/80 leading-relaxed">
                <li className="flex items-start gap-2">
                  <LucideIcon name="Check" className="h-4 w-4 text-brand-green shrink-0 mt-0.5" />
                  <span>Protocoles d’intervention standardisés et rigoureusement contextualisés.</span>
                </li>
                <li className="flex items-start gap-2">
                  <LucideIcon name="Check" className="h-4 w-4 text-brand-green shrink-0 mt-0.5" />
                  <span>Supervision clinique régulière et systématique de l'ensemble des praticiens.</span>
                </li>
                <li className="flex items-start gap-2">
                  <LucideIcon name="Check" className="h-4 w-4 text-brand-green shrink-0 mt-0.5" />
                  <span>Évaluation continue des pratiques, des retours patients et des résultats cliniques.</span>
                </li>
                <li className="flex items-start gap-2">
                  <LucideIcon name="Check" className="h-4 w-4 text-brand-green shrink-0 mt-0.5" />
                  <span>Audits internes et externes périodiques sur la conformité des soins.</span>
                </li>
              </ul>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-4 backdrop-blur-xs">
              <div className="flex items-center gap-3">
                <LucideIcon name="Lock" className="h-6 w-6 text-brand-green" />
                <h3 className="text-xl font-bold font-poppins text-white">Protection des Bénéficiaires</h3>
              </div>
              <ul className="space-y-3 text-xs text-white/80 leading-relaxed">
                <li className="flex items-start gap-2">
                  <LucideIcon name="Check" className="h-4 w-4 text-brand-green shrink-0 mt-0.5" />
                  <span>Stricte confidentialité des échanges, dossiers cliniques et données médicales.</span>
                </li>
                <li className="flex items-start gap-2">
                  <LucideIcon name="Check" className="h-4 w-4 text-brand-green shrink-0 mt-0.5" />
                  <span>Mécanisme sécurisé et confidentiel de gestion des plaintes et feedbacks.</span>
                </li>
                <li className="flex items-start gap-2">
                  <LucideIcon name="Check" className="h-4 w-4 text-brand-green shrink-0 mt-0.5" />
                  <span>Politique de tolérance zéro et prévention contre l’exploitation et les abus (PEAS).</span>
                </li>
                <li className="flex items-start gap-2">
                  <LucideIcon name="Check" className="h-4 w-4 text-brand-green shrink-0 mt-0.5" />
                  <span>Approche centrée sur la dignité humaine, le consentement libre et les droits fondamentaux.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Modèle d'Intervention en 6 Étapes */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs uppercase tracking-widest text-brand-green font-bold font-poppins">Méthodologie</span>
            <h2 className="text-2xl sm:text-4xl font-poppins font-black text-brand-dark">Notre Modèle d'Intervention Intégré</h2>
            <p className="text-sm text-brand-gray-text leading-relaxed">
              Un parcours coordonné en 6 étapes clés combinant soins cliniques, accompagnement psychosocial et suivi durable.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {INTERVENTION_STEPS.map((s) => (
              <div
                key={s.step}
                className="bg-brand-gray-light/60 rounded-3xl p-7 border border-gray-200 hover:border-brand-wellbeing/40 transition-all flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black font-poppins text-brand-wellbeing">{s.step}</span>
                    <div className="p-2.5 bg-brand-wellbeing/10 text-brand-wellbeing rounded-xl group-hover:bg-brand-wellbeing group-hover:text-white transition-colors">
                      <LucideIcon name={s.icon} className="h-5 w-5" />
                    </div>
                  </div>
                  <h3 className="font-poppins font-bold text-base text-brand-dark">{s.title}</h3>
                  <p className="text-xs text-brand-gray-text leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-6 text-center">
            <button
              onClick={onOpenBooking}
              className="py-3.5 px-8 bg-brand-wellbeing hover:bg-brand-wellbeing/90 text-white font-bold font-poppins rounded-2xl shadow-lg transition-all hover:scale-[1.02] cursor-pointer inline-flex items-center gap-2"
            >
              <LucideIcon name="Calendar" className="h-5 w-5" />
              <span>Prendre un Rendez-vous avec CAPSY</span>
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

