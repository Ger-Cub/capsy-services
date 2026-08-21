import React from 'react';
import PageHero from '../components/PageHero';
import IdentitySection from '../components/IdentitySection';

const APPROACH = [
  {
    title: 'Approche holistique',
    description: 'Nous tenons compte des dimensions émotionnelle, sociale et contextuelle pour proposer un accompagnement global et durable.',
  },
  {
    title: 'Ancrage local',
    description: 'Nos interventions sont conçues pour répondre aux réalités du Congo, à la fois en milieu urbain et en zone rurale ou humanitaire.',
  },
  {
    title: 'Ethique et qualité',
    description: 'La bienveillance, la confidentialité et le respect du bénéficiaire guident chacune de nos actions cliniques.',
  },
];

interface AboutPageProps {
  onOpenBooking: () => void;
}

export default function AboutPage({ onOpenBooking }: AboutPageProps) {
  return (
    <main className="grow">
      <PageHero
        variant="green"
        eyebrow="À propos"
        title="Qui sommes-nous?"
        description="CAPSY SERVICES est un centre d’accompagnement psychologique qui allie expertise clinique, écoute humaine et actions ancrées dans les réalités locales."
        primaryCtaLabel="Prendre rendez-vous"
        onPrimaryCta={onOpenBooking}
      />
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2 items-start">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-confidence/20 border border-brand-confidence/40">
                <span className="text-[10px] uppercase tracking-widest text-brand-dark font-bold">Présentation</span>
              </div>
              <h2 className="text-3xl font-poppins font-black text-brand-dark">Notre mission au service du bien-être</h2>
              <p className="text-sm leading-relaxed text-brand-gray-text font-sans">
                CAPSY SERVICES accompagne les personnes, les familles et les structures vers une meilleure résilience psychologique. Nous travaillons avec des psychologues, des thérapeutes et des professionnels de la santé mentale pour offrir un soutien accessible, discret et adapté.
              </p>
              <p className="text-sm leading-relaxed text-brand-gray-text font-sans">
                Nous croyons que chaque consultation doit être un espace sécurisé où l’écoute, la qualité et l’éthique sont garanties. Notre objectif est de permettre à chacun de retrouver de la sérénité dans sa vie personnelle et professionnelle.
              </p>
            </div>
            <div className="space-y-6">
              <div className="rounded-3xl border border-gray-150 hover:border-brand-confidence bg-brand-gray-light p-8 shadow-sm transition-all">
                <h3 className="text-xl font-poppins font-black text-brand-wellbeing">Notre organisation</h3>
                <p className="mt-4 text-sm text-brand-gray-text leading-relaxed">
                  Une équipe basée à Goma et Kinshasa, animée par des valeurs de respect, d’inclusion et de professionnalisme. Nous intervenons auprès des individus, des institutions et des populations vulnérables.
                </p>
              </div>
              <div className="rounded-3xl border border-gray-150 hover:border-brand-confidence bg-brand-wellbeing/5 p-8 shadow-sm transition-all">
                <h3 className="text-xl font-poppins font-black text-brand-dark">Notre engagement</h3>
                <p className="mt-4 text-sm text-brand-gray-text leading-relaxed">
                  Offrir un accompagnement humain sans concession sur la qualité, avec des tarifs transparents et une éthique qui protège les bénéficiaires à chaque étape.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="py-20 bg-brand-gray-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-confidence/20 border border-brand-confidence/40">
              <span className="text-[10px] uppercase tracking-widest text-brand-dark font-bold">Notre approche</span>
            </div>
            <h2 className="text-3xl font-poppins font-black text-brand-dark mt-3">Une méthode claire et structurée</h2>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {APPROACH.map((item) => (
              <div key={item.title} className="rounded-3xl bg-white border border-gray-150 hover:border-brand-confidence p-8 shadow-sm hover:shadow-lg transition-all">
                <h3 className="text-xl font-poppins font-bold text-brand-wellbeing mb-3">{item.title}</h3>
                <p className="text-sm text-brand-gray-text leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <IdentitySection />
    </main>
  );
}
