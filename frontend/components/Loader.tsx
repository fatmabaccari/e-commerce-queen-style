// components/Loader.tsx (version avec timing progressif)
'use client';

import { useEffect, useState } from 'react';

interface LoaderProps {
  text?: string;
  duration?: number;
  onComplete?: () => void;
}

export default function Loader({
  text = 'QUEEN STYLE',
  duration = 4000, // Augmenté pour l'animation de 5s
  onComplete,
}: LoaderProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  if (!isVisible) return null;

  const repeatText = (times: number, size: 'lg' | 'md' | 'sm' = 'lg') => {
    const textClasses = {
      lg: "text-[4rem] md:text-[8rem] lg:text-[15rem]",
      md: "text-[3rem] md:text-[6rem] lg:text-[10rem]",
      sm: "text-[2rem] md:text-[4rem] lg:text-[6rem]"
    };
    
    return Array.from({ length: times }, (_, i) => (
      <span key={i} className={`mx-4 md:mx-6 lg:mx-10 ${textClasses[size]}`}>{text}</span>
    ));
  };

  // Configuration des 5 bandes
  const bands = [
    { 
      position: 'top-0', 
      height: 'h-1/5', 
      color: 'text-gold', 
      textSize: 'sm' as const, 
      repeat: 12, 
      animation: 'clip-top',
      delay: '0s',
      bg: true
    },
    { 
      position: 'top-[20%]', 
      height: 'h-1/5', 
      color: 'text-amber-400', 
      textSize: 'md' as const, 
      repeat: 8, 
      animation: 'clip-top',
      delay: '1s',
      bg: true
    },
    { 
      position: 'top-[40%]', 
      height: 'h-1/5', 
      color: 'text-gold', 
      textSize: 'sm' as const, 
      repeat: 12, 
      animation: null,
      delay: null,
      bg: false
    },
    { 
      position: 'top-[60%]', 
      height: 'h-1/5', 
      color: 'text-amber-400', 
      textSize: 'md' as const, 
      repeat: 8, 
      animation: 'clip-bottom',
      delay: '1s',
      bg: true
    },
    { 
      position: 'bottom-0', 
      height: 'h-1/5', 
      color: 'text-gold', 
      textSize: 'sm' as const, 
      repeat: 12, 
      animation: 'clip-bottom',
      delay: '0s',
      bg: true
    },
  ];

  return (
    <div 
      className="fixed inset-0 z-50 bg-black"
      style={{ 
        animation: 'fade-out 5s ease-in-out forwards',
        animationDelay: '5s' // Délai = durée des clips (5s)
      }}
    >
      {bands.map((band, index) => (
        <div
          key={index}
          className={`absolute left-0 w-full ${band.height} overflow-hidden ${
            band.bg ? 'bg-black' : ''
          } ${band.position}`}
          style={{
            animation: band.animation ? `${band.animation} 5s ease-in-out forwards` : undefined,
            animationDelay: band.delay || undefined
          }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200vw]">
            <div 
              className={`flex font-black -tracking-[0.04em] whitespace-nowrap ${band.color} animate-marquee`}
            >
              {repeatText(band.repeat, band.textSize)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}