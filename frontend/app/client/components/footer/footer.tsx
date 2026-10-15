'use client';

import React, { useEffect, useState } from 'react';
import { contactsAPI } from '@/lib/api';
import { 
  FaInstagram, FaFacebook, FaPhone, FaEnvelope, FaMapMarkerAlt,
  FaArrowRight, FaStar, FaCrown, FaHeart, FaShoppingBag,
  FaTiktok, FaTwitter, FaYoutube, FaPinterest
} from 'react-icons/fa';
import Link from 'next/link';
import Image from 'next/image';

interface Contact {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  instagram?: string;
  facebook?: string;
}

const Footer = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeContact, setActiveContact] = useState<Contact | null>(null);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const res = await contactsAPI.getAll();
        setContacts(res.data || []);
        if (res.data?.length > 0) {
          setActiveContact(res.data[0]);
        }
      } catch (err) {
        console.error('Erreur récupération contacts:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchContacts();
  }, []);

  const navigationLinks = [
    { name: 'Accueil', href: '/client', icon: <FaHeart className="w-4 h-4" /> },
  
    { name: 'Collections', href: '/client/new', icon: <FaCrown className="w-4 h-4" /> },
   
    { name: 'Contact', href: '/client/contact', icon: <FaEnvelope className="w-4 h-4" /> },
  ];




  return (
    <footer className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900"></div>
      
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-yellow-500 to-pink-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-l from-purple-500 to-blue-500 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
        {/* Newsletter section */}
        <div className="bg-gradient-to-r from-yellow-300/50 to-white backdrop-blur-sm border-t border-b border-gray-800/50">
          <div className="max-w-screen-2xl mx-auto px-6 py-8">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="text-center lg:text-left">
                <h3 className="text-2xl font-bold text-white mb-2">Restez au courant des nouveautés</h3>
                <p className="text-gray-300">Recevez en exclusivité nos dernières collections et offres spéciales</p>
              </div>
             
            </div>
          </div>
        </div>

        {/* Main footer content */}
        <div className="max-w-screen-2xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            
                       {/* Brand section */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="relative w-40 h-36">
    
                
                  
                         <Image 
                          src="/logo.jpg" 
                          alt="Queen Style Logo" 
                          fill
                          className="object-contain p-2"
                          sizes="100px"
                        /> 
               
                </div>
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent">
                    Queen Style
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">L&apos;élégance réinventée</p>
                </div>
              </div>
              
              <p className="text-gray-300 leading-relaxed text-sm">
                Découvrez l&apos;élégance intemporelle avec Queen Style. 
                Des pièces uniques qui célèbrent la féminité moderne et 
                l&apos;audace contemporaine.
              </p>
              
           
            </div>
            {/* Navigation */}
            <div>
              <h3 className="text-xl font-bold text-white mb-6 pb-3 border-b border-gray-800">
                Navigation
              </h3>
              <ul className="space-y-4">
                {navigationLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="flex items-center gap-3 text-gray-300 hover:text-yellow-400 transition-all duration-300 group"
                    >
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <FaArrowRight className="w-3 h-3" />
                      </span>
                      {link.icon}
                      <span className="group-hover:translate-x-2 transition-transform">
                        {link.name}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact information */}
            <div>
              <h3 className="text-xl font-bold text-white mb-6 pb-3 border-b border-gray-800">
                Contactez-nous
              </h3>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-4 bg-gray-800 rounded animate-pulse"></div>
                  ))}
                </div>
              ) : contacts.length === 0 ? (
                <p className="text-gray-400">Aucun contact disponible</p>
              ) : (
                <div className="space-y-6">
                  {activeContact && (
                    <div className="relative p-5 rounded-2xl bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm border border-gray-800/50 group hover:border-yellow-500/30 transition-all duration-500">
                      <div className="absolute -top-2 -right-2 w-5 h-5 bg-gradient-to-r from-yellow-500 to-pink-500 rounded-full flex items-center justify-center">
                        <FaCrown className="w-2.5 h-2.5 text-black" />
                      </div>
                      
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-500/20 to-pink-500/20 flex items-center justify-center">
                          <span className="text-xl font-bold text-yellow-400">
                            {activeContact.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-bold text-white">{activeContact.name}</h4>
                          <div className="flex gap-3 mt-2">
                            {activeContact.instagram && (
                              <a 
                                href={activeContact.instagram} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-[#E4405F] transition-colors"
                              >
                                <FaInstagram />
                              </a>
                            )}
                            {activeContact.facebook && (
                              <a 
                                href={activeContact.facebook} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-[#1877F2] transition-colors"
                              >
                                <FaFacebook />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 group/item">
                          <div className="w-8 h-8 rounded-lg bg-gray-800/50 flex items-center justify-center group-hover/item:bg-yellow-500/20 transition-colors">
                            <FaPhone className="w-3.5 h-3.5 text-yellow-400" />
                          </div>
                          <a 
                            href={`tel:${activeContact.phone}`}
                            className="text-gray-300 hover:text-white transition-colors"
                          >
                            {activeContact.phone}
                          </a>
                        </div>
                        
                        <div className="flex items-center gap-3 group/item">
                          <div className="w-8 h-8 rounded-lg bg-gray-800/50 flex items-center justify-center group-hover/item:bg-pink-500/20 transition-colors">
                            <FaEnvelope className="w-3.5 h-3.5 text-pink-400" />
                          </div>
                          <a 
                            href={`mailto:${activeContact.email}`}
                            className="text-gray-300 hover:text-white transition-colors"
                          >
                            {activeContact.email}
                          </a>
                        </div>
                        
                        <div className="flex items-center gap-3 group/item">
                          <div className="w-8 h-8 rounded-lg bg-gray-800/50 flex items-center justify-center group-hover/item:bg-purple-500/20 transition-colors">
                            <FaMapMarkerAlt className="w-3.5 h-3.5 text-purple-400" />
                          </div>
                          <span className="text-gray-300">{activeContact.address}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Store info */}
            <div>
              <h3 className="text-xl font-bold text-white mb-6 pb-3 border-b border-gray-800">
                Informations boutique
              </h3>
              
              
              <div className="mt-8 p-5 rounded-2xl bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm border border-gray-800/50">
                <h4 className="font-bold text-white mb-3">Horaires d&apos;ouverture</h4>
                <div className="space-y-2 text-sm text-gray-300">
                  <div className="flex justify-between">
                    <span>Lun - Ven</span>
                    <span>9h - 19h</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Samedi</span>
                    <span>10h - 18h</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dimanche</span>
                    <span className="text-yellow-400">Fermé</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-16 pt-8 border-t border-gray-800/50">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <p className="text-gray-500 text-sm">
                &copy; {new Date().getFullYear()} Queen Style. Tous droits réservés.
              </p>
              
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-400">
                <Link href="/privacy" className="hover:text-yellow-400 transition-colors">
                  Politique de confidentialité
                </Link>
                <Link href="/terms" className="hover:text-yellow-400 transition-colors">
                  Conditions d&apos;utilisation
                </Link>
                <Link href="/cookies" className="hover:text-yellow-400 transition-colors">
                  Cookies
                </Link>
                <Link href="/legal" className="hover:text-yellow-400 transition-colors">
                  Mentions légales
                </Link>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="text-xs text-gray-500">Design with</div>
                <FaHeart className="w-4 h-4 text-pink-500 animate-pulse" />
                <div className="text-xs text-gray-500">by Queen Style</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;