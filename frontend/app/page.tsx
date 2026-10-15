'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Loader from '@/components/Loader';

export default function Home() {
  const router = useRouter();
  const [showLoader, setShowLoader] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    // Vérifier si nous sommes sur la page d'accueil (/)
    const isHomePage = window.location.pathname === '/';
    
    // Vérifier si le loader a déjà été vu
    const hasSeenLoader = sessionStorage.getItem('queenStyleLoaderShown');
    
    // Afficher le loader UNIQUEMENT si:
    // 1. Nous sommes sur la page d'accueil (/)
    // 2. Le loader n'a pas encore été vu
    if (isHomePage && !hasSeenLoader) {
      setShowLoader(true);
      sessionStorage.setItem('queenStyleLoaderShown', 'true');
      
      // Après 3 secondes, préparer la redirection
      const timer = setTimeout(() => {
        setShouldRedirect(true);
      }, 3000);
      
      return () => clearTimeout(timer);
    } else {
      // Sinon, rediriger immédiatement
      router.replace('/client');
    }
  }, [router]);

  useEffect(() => {
    if (shouldRedirect) {
      router.replace('/client');
    }
  }, [shouldRedirect, router]);

  if (showLoader) {
    return (
      <Loader 
        text="QUEEN STYLE" 
        duration={6000}
        onComplete={() => {
          setShouldRedirect(true);
        }}
      />
    );
  }

  // Ne rien afficher pendant le traitement
  return null;
}