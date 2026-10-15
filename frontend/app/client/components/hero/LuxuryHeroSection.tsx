
'use client';

import { useEffect, useState, useCallback } from 'react';
import { heroSectionAPI } from '@/lib/api';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/* =========================
   TYPES
========================= */
interface HeroImage {
  id: string;
  url: string;
  alt: string;
  label?: string;
}

interface HeroSection {
  id: string;
  titleLine1: string;
  titleHighlight: string;
  titleLine2: string;
  subtitle: string;
  ctaText: string;
  collectionYear: string;
  badgeText: string;
  mainImage?: HeroImage;
  galleryImages: HeroImage[];
}

/* =========================
   COMPONENT
========================= */
export default function LuxuryHeroSection() {
  const [hero, setHero] = useState<HeroSection | null>(null);
  const [loading, setLoading] = useState(true);

  /* =========================
     HELPERS
  ========================= */
  const resolveImageUrl = useCallback((url?: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/uploads')) return `${API_URL}${url}`;
    return `${API_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  }, []);

  /* =========================
     FETCH
  ========================= */
  useEffect(() => {
    const fetchHero = async () => {
      try {
        const res = await heroSectionAPI.getActive();
        if (res.data) {
          setHero(res.data);
        }
      } catch (err) {
        console.error('Erreur Hero Section:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHero();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  if (!hero) return null;

  /* =========================
     RENDER
  ========================= */
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className=" h-[120vh] grid grid-cols-1 lg:grid-cols-12">

        {/* IMAGE PRINCIPALE */}
        <div className="lg:col-span-6 h-[120vh] h-full overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/10 to-transparent z-10"></div>

          <img
            src={resolveImageUrl(hero.mainImage?.url)}
            alt={hero.mainImage?.alt || 'Hero image'}
            className="w-full   h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-[2200ms]"
          />

          {/* Badge collection */}
          <div className="absolute bottom-10 left-6 z-20">
            <div className="bg-white/90 backdrop-blur-md px-6 py-3 rounded-full flex items-center gap-3 shadow-xl">
              <span className="text-sm font-semibold text-gray-900">
                Collection {hero.collectionYear}
              </span>
              <span className="w-1 h-1 bg-yellow-500 rounded-full"></span>
              <span className="text-sm text-gray-600">
                Limited Edition
              </span>
            </div>
          </div>
        </div>

        {/* COLONNE DROITE */}
        <div className="lg:col-span-6  flex flex-col flex-direction-end px-30 py-30 lg:px-12 xl:px-16">

          {/* Décor */}
          <div className="absolute top-[-150px] right-[-180px] w-100 h-96 bg-yellow-400/10 rounded-full blur-3xl"></div>

          {/* TEXTE */}
          <div className="relative z-10">
            <h1 className="text-2xl sm:text-5xl lg:text-7xl xl:text-8xl font-extrabold text-gray-900 leading-[0.95] tracking-tight">
              {hero.titleLine1} <br />
              <span className="relative inline-block">
                {hero.titleHighlight}
                <span className="absolute -bottom-2 left-0 w-28 h-[3px] bg-yellow-400 rounded-full"></span>
              </span>
              <br />
              {hero.titleLine2}
            </h1>

            <p className="mt-8 text-gray-600 text-lg lg:text-xl font-light italic max-w-md">
              {hero.subtitle}
            </p>

            {/* CTA */}
            <div className="mt-12">
              <button className="px-10 py-4 bg-yellow-400 text-gray-900 font-semibold rounded-full 
                hover:bg-yellow-500 transition-all shadow-lg hover:shadow-2xl hover:-translate-y-1">
                {hero.ctaText}
              </button>
            </div>
          </div>

          {/* MINI GALLERY */}
          <div className="grid grid-cols-2 gap-8 lg:gap-6 h-1/2 mt-12 relative z-10">
            {hero.galleryImages?.slice(0, 2).map((img) => (
              <div
                key={img.id}
                className="relative overflow-hidden  group shadow-lg"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10"></div>
                <img
                  src={resolveImageUrl(img.url)}
                  alt={img.alt}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                {img.label && (
                  <span className="absolute bottom-4 left-4 z-20 text-white text-sm opacity-0 group-hover:opacity-100">
                    {img.label}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* BADGE */}
          <div className="absolute bottom-6 right-6 z-20">
            <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg">
              <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
              <span className="text-xs font-medium text-gray-700">
                {hero.badgeText}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
