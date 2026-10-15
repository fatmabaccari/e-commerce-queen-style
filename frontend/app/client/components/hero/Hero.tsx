'use client';

import { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, EffectFade, Autoplay } from 'swiper/modules';
import { heroSlidesAPI } from '@/lib/api';

import HeroSlide from './HeroSlide';
import HeroSkeleton from './HeroSkeleton';

import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';
interface HeroSlideData {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  order?: number;
}


export default function Hero() {
  const [slides, setSlides] = useState<HeroSlideData[]>([]);
  const [loading, setLoading] = useState(true);

 
   useEffect(() => {
  const fetchHeroSlides = async () => {
    try {
      const res = await heroSlidesAPI.getAll();
      const slidesWithUrl = res.data
        ?.sort((a: HeroSlideData, b: HeroSlideData) => (a.order ?? 0) - (b.order ?? 0))
        .map((slide: HeroSlideData) => {
          let imageUrl = slide.image;
          if (imageUrl && !imageUrl.startsWith('http')) {
            imageUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
          }
          return { ...slide, image: imageUrl };
        }) || [];

      setSlides(slidesWithUrl);
    } catch (error) {
      console.error('Hero slides error:', error);
    } finally {
      setLoading(false);
    }
  };

  fetchHeroSlides();
}, []);


 

  if (loading) return <HeroSkeleton />;

  if (!slides.length) {
    return (
      <div className="h-screen bg-black flex items-center justify-center text-white">
        Aucune slide disponible
      </div>
    );
  }

  return (
    <section className="relative w-full h-screen overflow-hidden bg-black">
      <Swiper
        modules={[Pagination, EffectFade, Autoplay]}
        slidesPerView={1}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        speed={1200}
        autoplay={{ delay: 6000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        className="h-full"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <HeroSlide
              image={slide.image}
              title={slide.title}
              subtitle={slide.subtitle}
            />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Pagination style */}
      <style jsx global>{`
        .swiper-pagination-bullet {
          background: rgba(255,255,255,.6);
          width: 10px;
          height: 10px;
          opacity: 1;
        }
        .swiper-pagination-bullet-active {
          background: #FFD700;
          transform: scale(1.2);
        }
      `}</style>
    </section>
  );
}
