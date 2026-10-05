import React from 'react';
import PageHero from '../components/PageHero';
import LucideIcon from '../components/LucideIcon';

interface ConfidentialitePageProps {
  onOpenBooking: () => void;
}

export default function ConfidentialitePage({ onOpenBooking }: ConfidentialitePageProps) {
  return (
    <main className="grow">
      <PageHero
        variant="green"
        eyebrow="Protection des Données"
        title="Politique de Confidentialité"
        description="Notre engagement institutionnel pour la protection de vos données personnelles et le respect du secret professionnel."
        primaryCtaLabel="Prendre rendez-vous"
        onPrimaryCta={onOpenBooking}
      />

      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 text-brand-dark">
          
          <div className="space-y-4">
            <h2 className="text-xl font-poppins font-bold text-brand-wellbeing flex items-center gap-2">
              <LucideIcon name="ShieldCheck" className="h-5 w-5 text-brand-green" />
              1. Engagement de confidentialité et secret professionnel
            </h2>
            <p className="text-sm text-brand-gray-text leading-relaxed">
              CAPSY traite l'ensemble des échanges et demandes avec la plus haute exigence de confidentialité et dans le respect du secret professionnel applicable aux praticiens de la santé mentale. Les professionnels intervenant au sein de nos structures sont soumis aux règles déontologiques et éthiques de leur profession.
            </p>
            <p className="text-sm text-brand-gray-text leading-relaxed">
              Certaines situations exceptionnelles peuvent nécessiter une action de protection, conformément à la loi, à l'éthique professionnelle et à la sécurité des personnes (notamment en cas de danger grave et imminent pour la vie d'une personne). Ces limites et cadres vous sont rappelés lors de l'entame de tout suivi.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-poppins font-bold text-brand-wellbeing flex items-center gap-2">
              <LucideIcon name="Database" className="h-5 w-5 text-brand-green" />
              2. Séparation des espaces numériques
            </h2>
            <div className="bg-brand-gray-light p-6 rounded-2xl border border-gray-150 text-sm text-brand-gray-text leading-relaxed space-y-2">
              <p>
                Le site internet <strong className="text-brand-dark">www.capsy-rdc.org</strong> est une vitrine publique d'information et un portail de demande de prise de contact.
              </p>
              <p>
                Les dossiers, notes cliniques et informations de suivi thérapeutique sont conservés et traités dans des systèmes internes sécurisés, strictement déconnectés du portail public, et accessibles uniquement aux professionnels habilités directement impliqués dans votre accompagnement.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-poppins font-bold text-brand-wellbeing flex items-center gap-2">
              <LucideIcon name="UserCheck" className="h-5 w-5 text-brand-green" />
              3. Données collectées sur le site
            </h2>
            <div className="space-y-3 text-sm text-brand-gray-text leading-relaxed">
              <p>
                Lorsque vous remplissez un formulaire de contact ou soumettez une demande de rendez-vous sur le site, nous recueillons uniquement les informations nécessaires au traitement administratif de votre demande (nom, numéro de téléphone / WhatsApp, adresse électronique facultative et motif succinct de sollicitation).
              </p>
              <p className="font-medium text-brand-dark">
                Pour votre sécurité, nous vous invitons à ne pas détailler de données intimes ou médicales sensibles dans les formulaires publics du site ou lors des interactions avec le conseiller virtuel.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-poppins font-bold text-brand-wellbeing flex items-center gap-2">
              <LucideIcon name="Mail" className="h-5 w-5 text-brand-green" />
              4. Exercice de vos droits
            </h2>
            <p className="text-sm text-brand-gray-text leading-relaxed">
              Vous disposez du droit d'accéder aux informations vous concernant, d'en demander la rectification ou la suppression pour tout motif légitime. Pour toute question relative à la protection de vos données ou pour exercer vos droits, vous pouvez contacter notre secrétariat à l'adresse suivante : <a href="mailto:contact@capsy-rdc.org" className="text-brand-wellbeing font-semibold underline">contact@capsy-rdc.org</a> ou au <span className="font-semibold text-brand-dark">+243 997 707 312</span>.
            </p>
          </div>

        </div>
      </section>
    </main>
  );
}
