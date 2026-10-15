'use client';

interface HeroSlideProps {
  image: string;
  title: string;
  subtitle: string;
}

export default function HeroSlide({ image, title, subtitle }: HeroSlideProps) {
  return (
    <div
      className="relative w-full h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${image})` }}
    >
      {/* Overlay luxe */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/50 to-black/90" />

      {/* Contenu */}
      <div className="relative z-10 flex flex-col justify-center h-full px-4 md:px-24">
        <h1 className="font-raleway font-extrabold text-4xl md:text-7xl mb-6
                       text-transparent bg-clip-text
                       bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500">
          {title}
        </h1>

        <p className="font-inter text-white/90 text-xl md:text-3xl mb-12 max-w-3xl">
          {subtitle}
        </p>

        <div className="flex justify-center md:justify-start">
          <button className="px-10 py-3 rounded-full font-bold text-black
                             bg-yellow-400 hover:bg-yellow-300
                             transition-all duration-300 hover:scale-105">
            EXPLORER LA COLLECTION
          </button>
        </div>
      </div>
    </div>
  );
}
