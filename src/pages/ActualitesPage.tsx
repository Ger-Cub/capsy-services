import React from 'react';
import PageHero from '../components/PageHero';
import { NEWS } from '../data/newsData';

interface Props {
  onOpenBooking?: (id?: string) => void;
}

export default function ActualitesPage({ onOpenBooking }: Props) {
  const items = NEWS.filter((n) => n.published).sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  return (
    <main className="grow">
      <PageHero
        variant="green"
        eyebrow="Actualités"
        title="Nos Actualités"
        description={`Restez informé des dernières nouvelles et publications de CAPSY SERVICES · ${items.length} article${items.length > 1 ? 's' : ''} publié${items.length > 1 ? 's' : ''}`}
        primaryCtaLabel="Nous contacter"
        onPrimaryCta={() => (window.location.href = '/contact')}
      />

      <section className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {items.map((item) => (
            <article key={item.id} className="p-5 bg-white border border-gray-150 rounded-2xl hover:shadow-md transition-all">
              <a href={`/actualites/${item.slug}`} className="block">
                <div className="text-xs text-brand-gray-text font-poppins uppercase tracking-widest mb-2">{item.date}</div>
                <h2 className="text-xl font-poppins font-bold text-brand-dark leading-tight">{item.title}</h2>
                <p className="mt-2 text-sm text-brand-gray-text leading-relaxed font-sans">{item.excerpt}</p>
              </a>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
