'use client';

import { useEffect, useState, useCallback } from 'react';
import { heroSlidesAPI, contactsAPI, heroSectionAPI,  } from '@/lib/api';
import { 
  Plus, 
  Edit, 
  Save, 
  X, 
  Upload, 
  Trash2, 
  Image as ImageIcon,
  Mail,
  Phone,
  MapPin,
  Instagram,
  Facebook,
  Users,
  ChevronUp,
  ChevronDown,
  Calendar,
  MessageSquare,
  MousePointerClick,
  Sparkles,
  Tag,
  Type,
  Home,
  Images,
  PhoneCall,
  DollarSign
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

/* =========================
   CONFIG
========================= */
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/* =========================
   INTERFACES
========================= */
interface HeroSlide {
    id: number;
    title: string;
    subtitle: string;
    image: string;
    order?: number;
}

interface Contact {
    id: number;
    name: string;
    phone: string;
    email: string;
    address: string;
    instagram?: string;
    facebook?: string;
}

interface HeroImage {
    id: string;
    url: string;
    alt: string;
    label?: string;
    type: 'MAIN' | 'GALLERY';
    order: number;
}

interface HeroSection {
    id: string;
    titleLine1: string;
    titleHighlight: string;
    titleLine2: string;
    subtitle: string;
    ctaText: string;
    startingPrice: string;
    collectionYear: string;
    badgeText: string;
    isActive: boolean;
    order: number;
    mainImage?: HeroImage;
    galleryImages: HeroImage[];
}

/* =========================
   COMPONENT
========================= */
export default function AdminContent() {
    /* =========================
       STATES
    ========================= */
    const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
    const [selectedFiles, setSelectedFiles] = useState<Record<number, File | null>>({});
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [editingContact, setEditingContact] = useState<Contact | null>(null);
    const [newSlide, setNewSlide] = useState<Partial<HeroSlide>>({ title: '', subtitle: '' });
 

    const [heroSection, setHeroSection] = useState<HeroSection | null>(null);
    const [isEditingHero, setIsEditingHero] = useState(false);
    const [heroFormData, setHeroFormData] = useState({
        titleLine1: '',
        titleHighlight: '',
        titleLine2: '',
        subtitle: '',
        ctaText: '',
        startingPrice: '',
        collectionYear: '',
        badgeText: '',
    });
    
    const [heroImages, setHeroImages] = useState<{
        main: { file: File | null; preview?: string };
        gallery1: { file: File | null; preview?: string };
        gallery2: { file: File | null; preview?: string };
    }>({ 
        main: { file: null, preview: undefined }, 
        gallery1: { file: null, preview: undefined }, 
        gallery2: { file: null, preview: undefined } 
    });
    
    const [loading, setLoading] = useState({
        hero: false,
        contacts: false,
        slides: false
    });
    const [activeTab, setActiveTab] = useState<'hero' | 'slides' | 'contacts'>('hero');

    /* =========================
       CONSTANTS
    ========================= */
    type HeroFormField = keyof typeof heroFormData;

  const heroFields: {
  field: HeroFormField;
  label: string;
  icon: React.ReactNode;
}[] = [
  { field: 'titleLine1', label: 'Titre ligne 1', icon: <Type size={16} /> },
  { field: 'titleHighlight', label: 'Titre surligné', icon: <Sparkles size={16} /> },
  { field: 'titleLine2', label: 'Titre ligne 2', icon: <Type size={16} /> },
  { field: 'subtitle', label: 'Sous-titre', icon: <MessageSquare size={16} /> },
  { field: 'ctaText', label: 'Texte CTA', icon: <MousePointerClick size={16} /> },
  { field: 'startingPrice', label: 'Prix de départ', icon: <DollarSign size={16} /> },
  { field: 'collectionYear', label: 'Année de collection', icon: <Calendar size={16} /> },
  { field: 'badgeText', label: 'Texte badge', icon: <Tag size={16} /> },
];


    const contactFields = [
        { field: 'name' as const, label: 'Nom', icon: <Users size={16} /> },
        { field: 'phone' as const, label: 'Téléphone', icon: <Phone size={16} /> },
        { field: 'email' as const, label: 'Email', icon: <Mail size={16} /> },
        { field: 'address' as const, label: 'Adresse', icon: <MapPin size={16} /> },
        { field: 'instagram' as const, label: 'Instagram', icon: <Instagram size={16} /> },
        { field: 'facebook' as const, label: 'Facebook', icon: <Facebook size={16} /> },
    ];

    const resolveImageUrl = useCallback((url?: string) => {
        if (!url) return '';
        // Si l'URL est déjà complète
        if (url.startsWith('http')) return url;
        // Si l'URL commence par /uploads, on l'ajoute à l'API_URL
        if (url.startsWith('/uploads')) {
            return `${API_URL}${url}`;
        }
        // Sinon, on ajoute le préfixe standard
        return `${API_URL}${url.startsWith('/') ? '' : '/'}${url}`;
    }, [API_URL]);

    /* =========================
       FETCH FUNCTIONS
    ========================= */
    const fetchHeroSlides = useCallback(async () => {
        setLoading(prev => ({ ...prev, slides: true }));
        try {
            const res = await heroSlidesAPI.getAll();
            const slides = res.data || [];
            const mappedSlides: HeroSlide[] = slides.map((slide: any) => {
                let imageUrl = slide.image || slide.image_url || '';
                // Résoudre l'URL de l'image
                imageUrl = resolveImageUrl(imageUrl);
                return {
                    id: slide.id,
                    title: slide.title || slide.title_text || '',
                    subtitle: slide.subtitle || slide.subtitle_text || '',
                    image: imageUrl,
                    order: slide.order ?? 0,
                };
            });
            setHeroSlides(mappedSlides.sort((a, b) => (a.order || 0) - (b.order || 0)));
            toast.success('Slides chargés avec succès');
        } catch (err) {
            console.error('Erreur Hero Slides:', err);
            toast.error('Erreur lors du chargement des slides');
        } finally {
            setLoading(prev => ({ ...prev, slides: false }));
        }
    }, [resolveImageUrl]);

    const fetchContacts = useCallback(async () => {
        setLoading(prev => ({ ...prev, contacts: true }));
        try {
            const res = await contactsAPI.getAll();
            setContacts(res.data || []);
            toast.success('Contacts chargés avec succès');
        } catch (err) {
            console.error('Erreur contacts:', err);
            toast.error('Erreur lors du chargement des contacts');
        } finally {
            setLoading(prev => ({ ...prev, contacts: false }));
        }
    }, []);

    const fetchHeroSection = useCallback(async () => {
        setLoading(prev => ({ ...prev, hero: true }));
        try {
            const response = await heroSectionAPI.getActive();
            console.log('Hero Section API Response:', response.data); // Debug log
            
            if (response.data) {
                const data = response.data;
                console.log('Hero Section Data:', data); // Debug log
                
                setHeroSection(data);
                setHeroFormData({
                    titleLine1: data.titleLine1 || '',
                    titleHighlight: data.titleHighlight || '',
                    titleLine2: data.titleLine2 || '',
                    subtitle: data.subtitle || '',
                    ctaText: data.ctaText || '',
                    startingPrice: data.startingPrice || '',
                    collectionYear: data.collectionYear || '',
                    badgeText: data.badgeText || '',
                });
                toast.success('Section hero chargée avec succès');
            }
        } catch (error: any) {
            console.error('Error fetching hero section:', error);
            if (error.response?.status !== 404) {
                toast.error('Erreur lors du chargement de la section hero');
            }
        } finally {
            setLoading(prev => ({ ...prev, hero: false }));
        }
    }, []);

    useEffect(() => {
        fetchHeroSlides();
        fetchContacts();
        fetchHeroSection();
    }, [fetchHeroSlides, fetchContacts, fetchHeroSection]);

    /* =========================
       HERO SLIDES HANDLERS
    ========================= */
    const handleSlideTextChange = (slideId: number, field: 'title' | 'subtitle', value: string) => {
        setHeroSlides(prev => prev.map(s => (s.id === slideId ? { ...s, [field]: value } : s)));
    };

    const handleSlideImageChange = (slideId: number, file?: File) => {
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            toast.error('Le fichier doit être une image');
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            toast.error('Image trop volumineuse (max 10MB)');
            return;
        }

        setSelectedFiles(prev => ({ ...prev, [slideId]: file }));
        const reader = new FileReader();
        reader.onload = () => {
            setHeroSlides(prev => prev.map(s => 
                s.id === slideId ? { ...s, image: reader.result as string } : s
            ));
        };
        reader.readAsDataURL(file);
    };

    const handleUpdateSlideText = async (slide: HeroSlide) => {
        try {
            await heroSlidesAPI.updateText(slide.id, { 
                title: slide.title, 
                subtitle: slide.subtitle, 
                order: slide.order ?? 0 
            });
            toast.success('Texte mis à jour avec succès');
        } catch (err) {
            console.error(err);
            toast.error('Erreur lors de la mise à jour du texte');
        }
    };

    const handleUpdateSlideImage = async (slideId: number) => {
     const file = selectedFiles[slideId];
        if (!file) return alert('Aucun fichier sélectionné');

        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await fetch(`${API_URL}/api/v1/hero-slides/${slideId}/image`, { method: 'PUT', body: formData });
            if (!res.ok) throw new Error('Erreur serveur');
            alert('Image mise à jour ');
            fetchHeroSlides();
        } catch (err) {
            console.error(err);
            alert('Erreur image ');
        }

    };

   

    /* =========================
       HERO SECTION HANDLERS - CORRIGÉS
    ========================= */
    const handleHeroImageChange = (type: 'main' | 'gallery1' | 'gallery2', file?: File) => {
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            toast.error('Le fichier doit être une image');
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            toast.error('Image trop volumineuse (max 10MB)');
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            setHeroImages(prev => ({ 
                ...prev, 
                [type]: { 
                    file, 
                    preview: reader.result as string 
                } 
            }));
        };
        reader.readAsDataURL(file);
    };

    const handleHeroFormChange = (field: keyof typeof heroFormData, value: string) => {
        setHeroFormData(prev => ({ ...prev, [field]: value }));
    };

    const saveHeroImage = async (
  type: 'main' | 'gallery1' | 'gallery2'
) => {
  const imageData = heroImages[type];

  if (!imageData?.file || !heroSection) {
    toast.error('Aucune image sélectionnée');
    return;
  }

  try {
    if (type === 'main') {
      await heroSectionAPI.updateMainImage(
        heroSection.id,
        imageData.file
      );
    } else {
      const index = type === 'gallery1' ? 0 : 1;
      const galleryImage = heroSection.galleryImages?.[index];

      if (!galleryImage?.id) {
        toast.error(
          "Aucune image de galerie existante à remplacer"
        );
        return;
      }

      await heroSectionAPI.updateGalleryImage(
        galleryImage.id,
        imageData.file
      );
    }

    toast.success('Image mise à jour avec succès');
    fetchHeroSection();

    setHeroImages(prev => ({
      ...prev,
      [type]: { file: null, preview: undefined },
    }));
  } catch (err: any) {
    console.error(err);
    toast.error(
      err.response?.data?.error ||
        'Erreur lors de la mise à jour de l’image'
    );
  }
};

const saveHeroText = async () => {
  if (!heroSection) {
    toast.error('Aucune section hero trouvée');
    return;
  }

  try {
    await heroSectionAPI.updateText(
      heroSection.id,
      heroFormData
    );

    toast.success('Textes mis à jour avec succès');
    fetchHeroSection();
    setIsEditingHero(false);
  } catch (err: any) {
    console.error(err);
    toast.error(
      err.response?.data?.error ||
        'Erreur lors de la mise à jour des textes'
    );
  }
};


    const handleCreateHeroSection = async () => {
        try {
            console.log('Creating hero section with data:', heroFormData);
            
            const payload = {
                ...heroFormData,
                isActive: true,
                order: 0,
            };
            
            const response = await heroSectionAPI.create(payload);
            console.log('Create hero section response:', response);
            
            if (response.data) {
                toast.success('Section hero créée avec succès');
                fetchHeroSection();
                setIsEditingHero(false);
            } else {
                throw new Error('Aucune donnée retournée');
            }
        } catch (err: any) {
            console.error('Erreur lors de la création de la section hero:', err);
            toast.error(err.response?.data?.message || 'Erreur lors de la création de la section hero');
        }
    };

    /* =========================
       CONTACT HANDLERS
    ========================= */
    const handleSaveContact = async () => {
        if (!editingContact) return;
        
        try {
            const res = await contactsAPI.update(editingContact.id, editingContact);
            setContacts(prev => prev.map(c => (c.id === editingContact.id ? res.data : c)));
            setEditingContact(null);
            toast.success('Contact mis à jour avec succès');
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Erreur lors de la mise à jour du contact');
        }
    };

    /* =========================
       COMPONENTS
    ========================= */
    const LoadingSpinner = () => (
        <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
        </div>
    );

    const TabButton = ({ 
        id, 
        label, 
        icon, 
        count 
    }: { 
        id: 'hero' | 'slides' | 'contacts'; 
        label: string; 
        icon: React.ReactNode; 
        count?: number;
    }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all ${
                activeTab === id
                    ? 'bg-yellow-400 text-black shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
        >
            {icon}
            <span>{label}</span>
            {count !== undefined && (
                <span className="bg-black text-yellow-400 text-xs rounded-full px-2 py-1">
                    {count}
                </span>
            )}
        </button>
    );

    /* =========================
       RENDER
    ========================= */
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
            <Toaster 
                position="top-right"
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: '#363636',
                        color: '#fff',
                    },
                    success: {
                        iconTheme: {
                            primary: '#fbbf24',
                            secondary: '#1f2937',
                        },
                    },
                }}
            />

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                    Administration du Site
                </h1>
                <p className="text-gray-600">
                    Gérez le contenu de votre site web
                </p>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap gap-2 mb-8">
                <TabButton 
                    id="hero" 
                    label="Hero Section" 
                   icon={<Home size={18} />}
                    count={heroSection ? 1 : 0}
                />
                <TabButton 
                    id="slides" 
                    label="Slides" 
                     icon={<Images size={18} />}
                    count={heroSlides.length}
                />
                <TabButton 
                    id="contacts" 
                    label="Contacts" 
                    icon={<PhoneCall size={18} />}
                    count={contacts.length}
                />
            </div>

            {/* HERO SECTION TAB */}
            {activeTab === 'hero' && (
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                   <span className="p-2 bg-yellow-100 rounded-lg">
  <Home size={20} className="text-yellow-600" />
</span>

                                    Section Hero Luxe
                                </h2>
                                <p className="text-gray-600 mt-1">
                                    Configurez la bannière principale de votre site
                                </p>
                            </div>
                            <div className="flex gap-2">
                                {heroSection && (
                                    <button
                                        onClick={() => setIsEditingHero(!isEditingHero)}
                                        className={`px-4 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                                            isEditingHero
                                                ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                                : 'bg-black text-yellow-400 hover:bg-yellow-400 hover:text-black'
                                        }`}
                                    >
                                        {isEditingHero ? (
                                            <>
                                                <X size={18} />
                                                Annuler
                                            </>
                                        ) : (
                                            <>
                                                <Edit size={18} />
                                                Modifier
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {loading.hero ? (
                        <LoadingSpinner />
                    ) : isEditingHero ? (
                        <div className="p-6 space-y-8">
                            {/* Formulaire textes */}
                            <div className="bg-gray-50 rounded-xl p-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <Edit size={20} />
                                    Textes de la section
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {heroFields.map(({ field, label, icon }) => (
                                        <div key={field} className="space-y-2">
                                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                                <span>{icon}</span>
                                                {label}
                                            </label>
                                            <input
                                                type="text"
                                                value={heroFormData[field]}
                                                onChange={(e) => handleHeroFormChange(field, e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                                                placeholder={`Entrez ${label.toLowerCase()}`}
                                            />
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-6 flex justify-end">
                                    <button
                                        onClick={heroSection ? saveHeroText : handleCreateHeroSection}
                                        className="px-6 py-3 bg-black text-yellow-400 rounded-xl font-semibold hover:bg-yellow-400 hover:text-black transition-all flex items-center gap-2"
                                        disabled={loading.hero}
                                    >
                                        {loading.hero ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-400 mr-2"></div>
                                                Chargement...
                                            </>
                                        ) : (
                                            <>
                                                <Save size={18} />
                                                {heroSection ? 'Mettre à jour les textes' : 'Créer la section'}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Images */}
                            <div className="bg-gray-50 rounded-xl p-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <ImageIcon size={20} />
                                    Images
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {[
                                        { type: 'main' as const, label: 'Image Principale', index: 0 },
                                        { type: 'gallery1' as const, label: 'Galerie 1', index: 0 },
                                        { type: 'gallery2' as const, label: 'Galerie 2', index: 1 },
                                    ].map(({ type, label, index }) => {
                                        const imageData = heroImages[type];
                                        const currentImage = type === 'main' 
                                            ? heroSection?.mainImage
                                            : heroSection?.galleryImages?.[index];
                                        
                                        return (
                                            <div key={type} className="border-2 border-dashed border-gray-300 rounded-2xl p-4 hover:border-yellow-400 transition-colors">
                                                <h4 className="font-semibold text-gray-800 mb-3">{label}</h4>
                                                
                                                {/* Preview */}
                                                <div className="h-48 rounded-xl overflow-hidden mb-4 bg-gray-100 flex items-center justify-center">
                                                    {imageData.preview ? (
                                                        <img 
                                                            src={imageData.preview} 
                                                            alt="Preview" 
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : currentImage?.url ? (
                                                        <img 
                                                            src={resolveImageUrl(currentImage.url)} 
                                                            alt={currentImage.alt}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="text-center p-4">
                                                            <ImageIcon size={48} className="text-gray-400 mx-auto mb-2" />
                                                            <p className="text-sm text-gray-500">Aucune image</p>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* File Input */}
                                                <label className="block mb-3">
                                                    <div className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl cursor-pointer hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                                                        <Upload size={18} />
                                                        Choisir une image
                                                    </div>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => handleHeroImageChange(type, e.target.files?.[0])}
                                                        className="hidden"
                                                    />
                                                </label>

                                                {/* Update Button */}
                                                {imageData.file && (
                                                    <button
                                                        onClick={() => saveHeroImage(type)}
                                                        className="w-full px-4 py-2 bg-yellow-400 text-black rounded-xl font-semibold hover:bg-yellow-500 transition-colors flex items-center justify-center gap-2"
                                                        disabled={loading.hero}
                                                    >
                                                        {loading.hero ? (
                                                            <>
                                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                                                                Chargement...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Save size={18} />
                                                                Mettre à jour {label}
                                                            </>
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ) : heroSection ? (
                        <div className="p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Informations */}
                                <div className="lg:col-span-2">
                                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-200">
                                        <h3 className="text-xl font-bold text-gray-900 mb-4">Configuration actuelle</h3>
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="bg-white p-4 rounded-xl border border-gray-200">
                                                    <div className="text-sm text-gray-500 mb-1">Titre principal</div>
                                                    <div className="font-semibold">
                                                        {heroSection.titleLine1} 
                                                        <span className="text-yellow-600 ml-1">{heroSection.titleHighlight}</span> 
                                                        {heroSection.titleLine2 && ` ${heroSection.titleLine2}`}
                                                    </div>
                                                </div>
                                                <div className="bg-white p-4 rounded-xl border border-gray-200">
                                                    <div className="text-sm text-gray-500 mb-1">Sous-titre</div>
                                                    <div className="font-semibold">{heroSection.subtitle}</div>
                                                </div>
                                                <div className="bg-white p-4 rounded-xl border border-gray-200">
                                                    <div className="text-sm text-gray-500 mb-1">Call to Action</div>
                                                    <div className="font-semibold">{heroSection.ctaText}</div>
                                                </div>
                                              
                                            </div>
                                            
                                            <div className="flex flex-wrap gap-2 mt-6">
                                                <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                                                    Année: {heroSection.collectionYear || 'Non définie'}
                                                </div>
                                                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                                    Badge: {heroSection.badgeText || 'Non défini'}
                                                </div>
                                                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                    heroSection.isActive 
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {heroSection.isActive ? '✅ Actif' : '❌ Inactif'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Images Preview */}
                                <div>
                                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-200">
                                        <h3 className="text-xl font-bold text-gray-900 mb-4">Images</h3>
                                        <div className="space-y-6">
                                            {/* Main Image */}
                                            <div>
                                                <h4 className="font-medium text-gray-700 mb-2">Image Principale</h4>
                                                <div className="h-48 rounded-xl overflow-hidden border border-gray-200">
                                                    {heroSection.mainImage?.url ? (
                                                        <img 
                                                            src={resolveImageUrl(heroSection.mainImage.url)} 
                                                            alt={heroSection.mainImage.alt}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                                            <span className="text-gray-400">Aucune image</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Gallery Images */}
                                            <div>
                                                <h4 className="font-medium text-gray-700 mb-2">Galerie</h4>
                                                <div className="grid grid-cols-2 gap-3">
                                                    {heroSection.galleryImages?.map((img, idx) => (
                                                        <div key={img.id} className="relative group">
                                                            <div className="h-32 rounded-lg overflow-hidden border border-gray-200">
                                                                <img 
                                                                    src={resolveImageUrl(img.url)} 
                                                                    alt={img.alt}
                                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                                                />
                                                            </div>
                                                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                                <span className="text-white text-sm font-medium">Image {idx + 1}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {(!heroSection.galleryImages || heroSection.galleryImages.length === 0) && (
                                                        <div className="col-span-2 text-center py-8">
                                                            <p className="text-gray-500">Aucune image de galerie</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="p-12 text-center">
                            <div className="max-w-md mx-auto">
                                <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <ImageIcon size={32} className="text-yellow-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Aucune section hero configurée</h3>
                                <p className="text-gray-600 mb-6">
                                    Configurez la bannière principale de votre site pour commencer.
                                </p>
                                <button
                                    onClick={() => setIsEditingHero(true)}
                                    className="px-6 py-3 bg-black text-yellow-400 rounded-xl font-semibold hover:bg-yellow-400 hover:text-black transition-all flex items-center gap-2 mx-auto"
                                >
                                    <Plus size={18} />
                                    Créer une section Hero
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* SLIDES TAB */}
            {activeTab === 'slides' && (
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                    <span className="p-2 bg-blue-100 rounded-lg">🖼️</span>
                                    Gestion des Slides
                                </h2>
                                <p className="text-gray-600 mt-1">
                                    Gérez les slides de votre carousel
                                </p>
                            </div>
                           
                        </div>
                    </div>

                    {loading.slides ? (
                        <LoadingSpinner />
                    ) : (
                        <div className="p-6">
                          

                            {/* Slides Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {heroSlides.map((slide) => (
                                    <div key={slide.id} className="border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow">
                                        <div className="p-4 bg-gradient-to-r from-gray-50 to-white">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="bg-black text-yellow-400 text-xs font-bold px-2 py-1 rounded">
                                                        #{slide.id}
                                                    </span>
                                                    <span className="text-sm text-gray-500">Ordre: {slide.order || 0}</span>
                                                </div>
                                              
                                            </div>

                                            {/* Image Preview */}
                                            <div className="relative h-48 rounded-xl overflow-hidden mb-4 bg-gray-100 group">
                                                {slide.image ? (
                                                    <>
                                                        <img 
                                                            src={slide.image} 
                                                            alt={slide.title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                                                            <label className="opacity-0 group-hover:opacity-100 cursor-pointer bg-white px-4 py-2 rounded-xl font-medium hover:bg-gray-100 transition-all">
                                                                Changer
                                                                <input
                                                                    type="file"
                                                                    accept="image/*"
                                                                    onChange={(e) => handleSlideImageChange(slide.id, e.target.files?.[0])}
                                                                    className="hidden"
                                                                />
                                                            </label>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <label className="cursor-pointer text-center">
                                                            <ImageIcon size={32} className="text-gray-400 mx-auto mb-2" />
                                                            <span className="text-sm text-gray-500">Ajouter une image</span>
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                onChange={(e) => handleSlideImageChange(slide.id, e.target.files?.[0])}
                                                                className="hidden"
                                                            />
                                                        </label>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Text Inputs */}
                                            <div className="space-y-3">
                                                <input
                                                    value={slide.title}
                                                    onChange={(e) => handleSlideTextChange(slide.id, 'title', e.target.value)}
                                                    placeholder="Titre"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400"
                                                />
                                                <input
                                                    value={slide.subtitle}
                                                    onChange={(e) => handleSlideTextChange(slide.id, 'subtitle', e.target.value)}
                                                    placeholder="Sous-titre"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400"
                                                />
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex gap-2 mt-4">
                                                {selectedFiles[slide.id] && (
                                                    <button
                                                        onClick={() => handleUpdateSlideImage(slide.id)}
                                                        className="flex-1 px-3 py-2 bg-yellow-400 text-black rounded-lg font-semibold hover:bg-yellow-500 transition-colors text-sm"
                                                    >
                                                        Mettre à jour l'image
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleUpdateSlideText(slide)}
                                                    className="flex-1 px-3 py-2 bg-black text-yellow-400 rounded-lg font-semibold hover:bg-yellow-400 hover:text-black transition-colors text-sm"
                                                >
                                                    Mettre à jour le texte
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {heroSlides.length === 0 && (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <ImageIcon size={32} className="text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun slide configuré</h3>
                                    <p className="text-gray-600">
                                        Commencez par ajouter votre premier slide.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* CONTACTS TAB */}
            {activeTab === 'contacts' && (
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                    <span className="p-2 bg-green-100 rounded-lg">📞</span>
                                    Gestion des Contacts
                                </h2>
                                <p className="text-gray-600 mt-1">
                                    Gérez les informations de contact de votre entreprise
                                </p>
                            </div>
                        </div>
                    </div>

                    {loading.contacts ? (
                        <LoadingSpinner />
                    ) : (
                        <div className="p-6">
                            {/* Contacts Table */}
                            <div className="overflow-x-auto rounded-xl border border-gray-200">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            {['Nom', 'Contact', 'Adresse', 'Réseaux sociaux', 'Actions'].map((header) => (
                                                <th
                                                    key={header}
                                                    className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                                                >
                                                    {header}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {contacts.map((contact) => (
                                            <tr key={contact.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-gray-900">{contact.name}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <Phone size={14} className="text-gray-400" />
                                                            <span className="text-gray-700">{contact.phone}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <Mail size={14} className="text-gray-400" />
                                                            <span className="text-gray-700">{contact.email}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-sm text-gray-700">
                                                        <MapPin size={14} className="text-gray-400" />
                                                        {contact.address}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        {contact.instagram && (
                                                            <a 
                                                                href={`https://instagram.com/${contact.instagram}`} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer"
                                                                className="flex items-center gap-1 text-sm text-pink-600 hover:text-pink-700"
                                                            >
                                                                <Instagram size={14} />
                                                                {contact.instagram}
                                                            </a>
                                                        )}
                                                        {contact.facebook && (
                                                            <a 
                                                                href={`https://facebook.com/${contact.facebook}`} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer"
                                                                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                                                            >
                                                                <Facebook size={14} />
                                                                {contact.facebook}
                                                            </a>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button
                                                        onClick={() => setEditingContact(contact)}
                                                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center gap-1"
                                                    >
                                                        <Edit size={14} />
                                                        Modifier
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {contacts.length === 0 && (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <Users size={32} className="text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun contact configuré</h3>
                                    <p className="text-gray-600">
                                        Ajoutez vos informations de contact.
                                    </p>
                                </div>
                            )}

                            {/* Edit Contact Modal */}
                            {editingContact && (
                                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                                    <div className="bg-white rounded-2xl w-full max-w-lg p-6">
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="text-xl font-bold text-gray-900">Modifier le contact</h3>
                                            <button
                                                onClick={() => setEditingContact(null)}
                                                className="p-2 hover:bg-gray-100 rounded-xl"
                                            >
                                                <X size={20} />
                                            </button>
                                        </div>

                                        <div className="space-y-4">
                                            {contactFields.map(({ field, label, icon }) => (
                                                <div key={field}>
                                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                                                        {icon}
                                                        {label}
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={editingContact[field] || ''}
                                                        onChange={(e) => setEditingContact({
                                                            ...editingContact,
                                                            [field]: e.target.value
                                                        })}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-400"
                                                        placeholder={`Entrez ${label.toLowerCase()}`}
                                                    />
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex gap-3 mt-8">
                                            <button
                                                onClick={handleSaveContact}
                                                className="flex-1 px-4 py-3 bg-yellow-400 text-black rounded-xl font-semibold hover:bg-yellow-500 transition-colors flex items-center justify-center gap-2"
                                            >
                                                <Save size={18} />
                                                Enregistrer
                                            </button>
                                            <button
                                                onClick={() => setEditingContact(null)}
                                                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                                            >
                                                Annuler
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Stats Footer */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold text-gray-900">{heroSlides.length}</div>
                            <div className="text-sm text-gray-600">Slides actifs</div>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-xl">
                            <ImageIcon size={24} className="text-blue-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold text-gray-900">{contacts.length}</div>
                            <div className="text-sm text-gray-600">Contacts</div>
                        </div>
                        <div className="p-3 bg-green-100 rounded-xl">
                            <Users size={24} className="text-green-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold text-gray-900">
                                {heroSection ? '1' : '0'}
                            </div>
                            <div className="text-sm text-gray-600">Section Hero</div>
                        </div>
                        <div className="p-3 bg-yellow-100 rounded-xl">
                           <span className="p-2 bg-yellow-100 rounded-lg">
  <Home size={20} className="text-yellow-600" />
</span>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


