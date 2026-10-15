'use client';

import { useEffect, useState } from 'react';
import { contactsAPI } from '@/lib/api';
import { Loader2, MapPin, Phone, Mail, Instagram, Facebook, ChevronRight } from 'lucide-react';

type Contact = {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  instagram?: string;
  facebook?: string;
};

export default function ContactPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [activeContact, setActiveContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const res = await contactsAPI.getAll();
        setContacts(res.data || []);
        if (res.data?.length > 0) setActiveContact(res.data[0]);
      } catch (err) {
        console.error('Erreur récupération contacts:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchContacts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-2 border-black border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-sm text-gray-500">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header minimal */}
      

      <main className="pt-24 pb-20 max-w-6xl mx-auto px-6">
        {/* Titre discret */}
        <div className="mb-16">
          <h2 className="text-4xl font-serif font-light mb-4">Nos boutiques</h2>
          <div className="w-24 h-px bg-black"></div>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Liste des contacts - Sidebar */}
          <div className="lg:col-span-1 space-y-2">
            {contacts.map(contact => (
              <button
                key={contact.id}
                onClick={() => setActiveContact(contact)}
                className={`w-full text-left p-4 transition-all duration-300 ${
                  activeContact?.id === contact.id
                    ? 'bg-gray-50 border-l-4 border-black'
                    : 'hover:bg-gray-50 hover:pl-6'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-lg mb-1">{contact.name}</h3>
                    <p className="text-sm text-gray-600 truncate max-w-[200px]">{contact.address}</p>
                  </div>
                  {activeContact?.id === contact.id && (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Détails du contact */}
          {activeContact && (
            <div className="lg:col-span-2">
              <div className="sticky top-32">
                {/* Carte principale */}
                <div className="bg-gray-50 p-10 rounded-lg">
                  <h2 className="text-3xl text-yellow-400 font-serif font-light mb-8">{activeContact.name}</h2>
                  
                  <div className="space-y-6">
                    <div className="flex items-start">
                      <div className="w-8 mr-4 mt-1">
                        <MapPin className="w-5 h-5 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Adresse</p>
                        <p className="text-lg">{activeContact.address}</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="w-8 mr-4 mt-1">
                        <Phone className="w-5 h-5 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Téléphone</p>
                        <a 
                          href={`tel:${activeContact.phone}`}
                          className="text-lg hover:text-gray-600 transition-colors"
                        >
                          {activeContact.phone}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="w-8 mr-4 mt-1">
                        <Mail className="w-5 h-5 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Email</p>
                        <a 
                          href={`mailto:${activeContact.email}`}
                          className="text-lg hover:text-gray-600 transition-colors"
                        >
                          {activeContact.email}
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Réseaux sociaux - Positionnés proprement */}
                  {(activeContact.instagram || activeContact.facebook) && (
                    <div className="mt-10 pt-8 border-t border-gray-200">
                      <p className="text-sm text-gray-500 mb-4">Suivez-nous</p>
                      <div className="flex gap-4">
                        {activeContact.instagram && (
                          <a 
                            href={activeContact.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 hover:bg-white transition-colors rounded-full"
                          >
                            <Instagram className="w-6 h-6" />
                          </a>
                        )}
                        {activeContact.facebook && (
                          <a 
                            href={activeContact.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 hover:bg-white transition-colors rounded-full"
                          >
                            <Facebook className="w-6 h-6" />
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Bouton d'action discret */}
                <div className="mt-8">
                  <a 
                    href={`mailto:${activeContact.email}?subject=Contact Queen Style - ${activeContact.name}`}
                    className="inline-flex items-center text-sm text-yellow-400  hover:text-black transition-colors"
                  >
                    Envoyer un message
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer minimal */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-sm text-gray-500">
            Queen Style © {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}