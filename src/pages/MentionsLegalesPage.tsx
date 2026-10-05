import React from 'react';
import PageHero from '../components/PageHero';
import LucideIcon from '../components/LucideIcon';

interface MentionsLegalesPageProps {
  onOpenBooking: () => void;
}

export default function MentionsLegalesPage({ onOpenBooking }: MentionsLegalesPageProps) {
  return (
    <main className="grow">
      <PageHero
        variant="green"
        eyebrow="Informations Légales"
        title="Mentions Légales"
        description="Informations relatives à l'éditeur et aux conditions d'utilisation du site institutionnel CAPSY."
        primaryCtaLabel="Prendre rendez-vous"
        onPrimaryCta={onOpenBooking}
      />

      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 text-brand-dark">
          
          <div className="space-y-4">
            <h2 className="text-xl font-poppins font-bold text-brand-wellbeing flex items-center gap-2">
              <LucideIcon name="ShieldCheck" className="h-5 w-5 text-brand-green" />
              1. Éditeur du site
            </h2>
            <div className="bg-brand-gray-light p-6 rounded-2xl border border-gray-150 space-y-2 text-sm text-brand-gray-text leading-relaxed">
              <p><strong className="text-brand-dark">Raison sociale :</strong> Centre d'Assistance Psychologique, CAPSY SARL</p>
              <p><strong className="text-brand-dark">Statut :</strong> Société à Responsabilité Limitée de droit congolais</p>
              <p><strong className="text-brand-dark">Siège social :</strong> N°18, avenue Des Écoles, Quartier Les Volcans, Goma, Nord-Kivu, RDC</p>
              <p><strong className="text-brand-dark">Bureau de liaison :</strong> N°63, avenue Kabinda, Quartier Boyoma, Kinshasa, RDC</p>
              <p><strong className="text-brand-dark">Téléphone / WhatsApp :</strong> +243 997 707 312</p>
              <p><strong className="text-brand-dark">Courriel :</strong> contact@capsy-rdc.org</p>
              <p><strong className="text-brand-dark">Site web officiel :</strong> www.capsy-rdc.org</p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-poppins font-bold text-brand-wellbeing flex items-center gap-2">
              <LucideIcon name="FileText" className="h-5 w-5 text-brand-green" />
              2. Nature des services proposés
            </h2>
            <div className="space-y-3 text-sm text-brand-gray-text leading-relaxed">
              <p>
                Le site internet de CAPSY est une porte d'entrée publique permettant aux personnes accompagnées, familles et institutions de s'informer sur les services, les activités de formation et de demander un rendez-vous auprès de nos professionnels de santé mentale.
              </p>
              <p>
                La demande transmise en ligne ne constitue pas en soi une consultation clinique, un diagnostic médical ou une prise en charge immédiate d'urgence.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-poppins font-bold text-brand-wellbeing flex items-center gap-2">
              <LucideIcon name="AlertTriangle" className="h-5 w-5 text-brand-green" />
              3. Absence de permanence d'urgence médicale
            </h2>
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm leading-relaxed">
              En cas de détresse extrême, de danger immédiat pour soi-même ou pour autrui, ou d'urgence médicale, il est impératif de s'adresser aux services d'urgence locaux ou à la structure hospitalière la plus proche. CAPSY ne se substitue pas aux services de secours et d'urgence.
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-poppins font-bold text-brand-wellbeing flex items-center gap-2">
              <LucideIcon name="Lock" className="h-5 w-5 text-brand-green" />
              4. Propriété intellectuelle
            </h2>
            <p className="text-sm text-brand-gray-text leading-relaxed">
              L'ensemble des contenus, marques, logos, visuels et architectures figurant sur ce site sont la propriété exclusive de CAPSY SARL ou font l'objet d'une autorisation d'utilisation. Toute reproduction ou représentation, intégrale ou partielle, sans l'accord préalable écrit de CAPSY SARL est strictement interdite.
            </p>
          </div>

        </div>
      </section>
    </main>
  );
}
