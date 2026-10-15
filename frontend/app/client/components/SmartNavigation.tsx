'use client';

import { ShoppingCart, User, ChevronDown, ChevronUp, Star, Crown } from 'lucide-react';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { categoriesAPI } from '@/lib/api';
import Link from 'next/link'; 
export default function SmartNavigation() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoriesAPI.getAll();
        setCategories(res.data || []);
      } catch (error) {
        console.error('Erreur lors du fetch des catégories:', error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setShowWelcome(false), 10000);
    return () => clearTimeout(timer);
  }, []);

  /* ---------------- MOBILE DROPDOWN ---------------- */
  function MobileNavDropdown({ label, items }: { label: string; items: { name: string; href: string }[] }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div className="flex flex-col">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex justify-between items-center w-full px-3 py-8 text-white/80 hover:text-yellow-400 transition"
        >
          <span>{label}</span>
          <span className="text-xs">{isOpen ? '▲' : '▼'}</span>
        </button>

        {isOpen && (
          <div className="flex flex-col pl-4">
            {items.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="block px-3 py-2 text-white/80 hover:text-yellow-400 hover:bg-yellow-400/10 rounded transition"
              >
                {item.name}
              </a>
            ))}
          </div>
        )}
      </div>
    );
  }

  /* ---------------- DESKTOP DROPDOWN ---------------- */
  interface NavDropdownItem {
    name: string;
    href: string;
  }
  function NavDropdown({ label, items }: { label: string; items: NavDropdownItem[] }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div className="relative">
        <div className="flex items-center gap-1 px-10 py-5 text-white/80">
          <span className="hover:text-yellow-400 transition cursor-pointer">{label}</span>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-yellow-400 hover:text-yellow-300 transition"
          >
            {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        {isOpen && (
          <div className="absolute left-0 top-full mt-2 bg-black/95 border border-yellow-400/30 rounded-xl shadow-2xl min-w-[180px] z-50">
            {items.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="block px-4 py-2 text-sm text-white/80 hover:text-black hover:bg-yellow-400/10 transition"
              >
                {item.name}
              </a>
            ))}
          </div>
        )}
      </div>
    );
  }

/* ---------------- NAV LINKS ---------------- */
function NavLink({ label, badge, className }: { label: React.ReactNode; badge?: string; className?: string })
{
  return (
    <div className={`relative group ${className ?? ''}`}>
      <div className="px-3 py-4 hover:text-yellow-400 transition cursor-pointer flex items-center gap-2">
        <span className="text-s font-medium inline-flex items-center gap-1">{label}</span>
        {badge && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-red-500 text-white animate-pulsered flex items-center justify-center">
            {badge}
          </span>
        )}
      </div>
      <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-yellow-400 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
    </div>
  );
}



  function MobileNavLink({ label, badge, className }: { label: React.ReactNode; badge?: string; className?: string }){

  return (
    <div className={`flex items-center justify-between px-3 py-2.5  hover:text-yellow-400 hover:bg-yellow-400/10 transition rounded-lg cursor-pointer ${className ?? ''}`}>
      <span className="text-sm font-medium inline-flex items-center gap-1">{label}</span>
      {badge && (
        <span className="text-xs px-2 py-0.5 rounded-full bg-red-500 text-white animate-pulse-red flex items-center justify-center">
          {badge}
        </span>
      )}
    </div>
  );
}

  return (
    <>
     /* {/* TOP BAR */}
      {showWelcome && (
        <div className="fixed top-0 left-0 w-full z-50 bg-black text-yellow-400 text-center py-3 px-4 text-xs sm:text-sm md:text-base font-medium border-b border-yellow-400/30">
          <span>
            Bienvenue chez <b className="text-yellow-300">Queen Style</b> ! Profitez de notre nouvelle collection ✨
          </span>
          <div className="absolute bottom-0 left-0 h-1 w-full bg-yellow-400"></div>
        </div>
      )}

      {/* NAVBAR */}
      <nav
        className={`fixed left-0 w-full z-40 bg-black/95 backdrop-blur-md border-b border-yellow-400/30 transition-all ${showWelcome ? 'top-14' : 'top-1'}`}
      >
        <div className="max-w-7xl mx-auto py-1">
          <div className="flex items-center justify-between py-3">
            {/* LOGO */}
            <div className="relative h-3 md:h-7">
              <div className="absolute -bottom-10 md:-bottom-10">
                <div className="relative w-50 h-50 md:w-20 md:h-20 rounded-full overflow-hidden border-2 border-yellow-400/40 bg-black">
                  <Image src="/logo.jpg" alt="Queen Style Logo" fill className="object-cover" priority />
                </div>
                <div className="absolute -inset-2 border-2 border-yellow-400/30 rounded-full animate-ping"></div>
              </div>
            </div>

            {/* DESKTOP LINKS */}
            <div className="hidden md:flex items-center gap-4 absolute left-1/2 -translate-x-1/2">
            

      <NavLink label={<Link href="/">Accueil</Link>} className="text-white/80" />
     <NavLink 
  label={
    <Link href="/client/new" className="flex items-center gap-2 text-red-500 font-semibold animate-pulsered hover:scale-105 transition-transform ">
     <Crown size={16} className="text-yellow-400" />
      Découvrir notre collection
       <Crown size={16} className="text-yellow-400" />
    </Link>
  } 
  className="text-red-500 font-semibold animate-pulsered hover:scale-105 transition-transform"
/>
             
<NavLink label={<Link href="/client/contact">Contact</Link>} className="text-white/80" />

            
           
            </div>

            {/* ACTIONS DROITE */}
            <div className="flex items-center gap-4">
             {/* <button className="relative text-white/80 hover:text-yellow-400 transition">
                <ShoppingCart size={20} />
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  3
                </span>
              </button>
              <button className="text-white/80 hover:text-yellow-400 transition">
                <User size={20} />
              </button>

              {/* MOBILE MENU */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden text-yellow-400 hover:text-yellow-300"
                aria-label="Menu"
              >
                <div className="w-8 h-8 flex items-center justify-center">{isMenuOpen ? '✕' : '☰'}</div>
              </button>
            </div>
          </div>
        </div>

        {/* MOBILE MENU */}
        {isMenuOpen && (
          <div className="md:hidden bg-black/95 border-t border-yellow-400/20 animate-fade-in">
            <div className="flex flex-col gap-1 py-3 px-4">
             <MobileNavLink label={<Link href="/client">Accueil</Link>} className="text-white/80" />
              <MobileNavLink label={<Link href="/client/new">Découvrir notre collection</Link>} className=" text-red-500 font-semibold animate-pulse-red" />
            
             <MobileNavLink label={<Link href="/contact">Contact</Link>} className="text-white/80" />
         
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
