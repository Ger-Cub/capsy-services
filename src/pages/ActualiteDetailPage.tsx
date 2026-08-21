import React from 'react';
import LucideIcon from '../components/LucideIcon';
import PageHero from '../components/PageHero';
import { NEWS, NewsItem } from '../data/newsData';

interface Props {
  slug: string;
}

function renderMedia(media: NonNullable<NewsItem['media']>) {
  return media.map((m, i) => {
    if (m.type === 'image') {
      return (
        <figure key={i} className="my-4">
          <img src={m.src} alt={m.alt || ''} className="w-full rounded" />
          {m.caption && <figcaption className="text-sm text-gray-600 mt-1">{m.caption}</figcaption>}
        </figure>
      );
    }

    if (m.type === 'embed') {
      return (
        <div key={i} className="my-4 aspect-video">
          <iframe title={m.caption || `embed-${i}`} src={m.src} frameBorder={0} allowFullScreen className="w-full h-full rounded" />
          {m.caption && <div className="text-sm text-gray-600 mt-1">{m.caption}</div>}
        </div>
      );
    }

    if (m.type === 'video') {
      return (
        <div key={i} className="my-4">
          <video controls src={m.src} className="w-full rounded" />
          {m.caption && <div className="text-sm text-gray-600 mt-1">{m.caption}</div>}
        </div>
      );
    }

    return null;
  });
}

export default function ActualiteDetailPage({ slug }: Props) {
  const item = NEWS.find((n) => n.slug === slug);

  if (!item) {
    return (
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold">Actualité introuvable</h1>
        <p className="mt-4">L'article demandé est introuvable. <a href="/actualites" className="underline">Retour aux actualités</a></p>
      </main>
    );
  }

  return (
    <main className="grow">
      <PageHero
        variant="green"
        eyebrow="Actualité"
        title={item.title}
        description={`${item.date}${item.location ? ` · ${item.location}` : ''}`}
        primaryCtaLabel="Retour aux actualités"
        onPrimaryCta={() => (window.location.href = '/actualites')}
      />

      <section className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {item.media && renderMedia(item.media)}

          <div className="prose max-w-none mt-6">
            {item.content.split('\n\n').map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          {item.authors && (
            <div className="mt-6 text-sm text-gray-700">
              <strong>Auteur·e·s:</strong> {item.authors.map(a => a.name).join(', ')}
            </div>
          )}

          <div className="mt-10">
            <a
              href="/actualites"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-wellbeing text-white font-bold font-poppins text-sm rounded-2xl hover:bg-brand-wellbeing/90 transition-all shadow-md"
            >
              <LucideIcon name="ArrowLeft" className="h-4 w-4" />
              Retour aux actualités
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
