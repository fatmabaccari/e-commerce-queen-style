'use client';


import SmartNavigation from "../client/components/SmartNavigation";
import PremiumProductShowcase from "./components/ProductShowcase";

import { FaTruck, FaClock, FaExchangeAlt, FaEnvelope } from "react-icons/fa";


import Hero from './components/hero/Hero';
import LuxuryHeroSection from './components/hero/LuxuryHeroSection';
import Link from 'next/dist/client/link';



export default function LandingPage() {

  ;

  const services = [
    { title: "LIVRAISON À DOMICILE", subtitle: "Livraison offerte dès 150Dt", icon: <FaTruck className="text-yellow-400 w-10 h-10 mx-auto mb-2" /> },
    { title: "LIVRAISON RAPIDE", subtitle: "Livraison en 2 à 4 jours", icon: <FaClock className="text-yellow-400 w-10 h-10 mx-auto mb-2" /> },
    { title: "ÉCHANGE", subtitle: "Échange dans 48H", icon: <FaExchangeAlt className="text-yellow-400 w-10 h-10 mx-auto mb-2" /> },
    { title: "CONTACTEZ LA BOUTIQUE", subtitle: "Nous sommes à votre écoute", icon: <FaEnvelope className="text-yellow-400 w-10 h-10 mx-auto mb-2" /> },
  ];

  return (
    <>
      <SmartNavigation />
      <Hero />
      <LuxuryHeroSection />




      <PremiumProductShowcase />
      
              


      <section className="relative py-20 px-6 bg-gradient-to-r from-yellow-300/50 to-white">
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <div
              key={index}
              className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition-all"
            >
              {service.icon}
              <div className="text-lg font-bold text-gray-900 mb-1">{service.title}</div>
              <div className="text-gray-600 text-sm">{service.subtitle}</div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
