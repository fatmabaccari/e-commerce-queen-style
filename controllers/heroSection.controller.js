import prisma from '../database/prisma-client.js';
import { getFileUrl } from '../middlewares/upload.middleware.js';

/* ======================================================
   GET /api/v1/hero-sections/active
   Récupérer la section hero active
====================================================== */
export const getActiveHeroSection = async (req, res) => {
  console.log('📥 [GET] /api/v1/hero-sections/active');

  try {
    const heroSection = await prisma.heroSection.findFirst({
      where: { isActive: true },
      include: {
        galleryImages: {
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!heroSection) {
      console.log('⚠️ Aucune section hero active trouvée');
      return res.status(404).json({
        success: false,
        error: 'Aucune section hero active trouvée',
      });
    }

    console.log('📦 Section hero active trouvée:', heroSection.id);

    // Transformer les URLs des images
    const sectionWithUrls = {
      id: heroSection.id,
      mainImage: {
        url: heroSection.mainImage && !heroSection.mainImage.startsWith('http') && !heroSection.mainImage.startsWith('/uploads') 
          ? getFileUrl(heroSection.mainImage) 
          : heroSection.mainImage,
        alt: heroSection.mainImageAlt
      },
      galleryImages: heroSection.galleryImages.map(img => {
        const imageUrl = img.url && !img.url.startsWith('http') && !img.url.startsWith('/uploads') 
          ? getFileUrl(img.url) 
          : img.url;
        
        return {
          id: img.id,
          url: imageUrl,
          alt: img.alt,
          label: img.label
        };
      }),
      titleLine1: heroSection.titleLine1,
      titleHighlight: heroSection.titleHighlight,
      titleLine2: heroSection.titleLine2,
      subtitle: heroSection.subtitle,
      ctaText: heroSection.ctaText,
      collectionYear: heroSection.collectionYear,
      badgeText: heroSection.badgeText,
      isActive: heroSection.isActive,
      order: heroSection.order
    };

    console.log('✅ Section hero active envoyée au frontend');

    res.json({
      success: true,
      data: sectionWithUrls,
    });
  } catch (error) {
    console.error('❌ Erreur GET /hero-sections/active:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de la récupération de la section hero active',
    });
  }
};

/* ======================================================
   GET /api/v1/hero-sections
   Récupérer toutes les sections hero (pour l'admin)
====================================================== */
export const getAllHeroSections = async (req, res) => {
  console.log('📥 [GET] /api/v1/hero-sections');

  try {
    const heroSections = await prisma.heroSection.findMany({
      include: {
        galleryImages: {
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { order: 'asc' }
    });

    console.log('📦 Sections hero brutes depuis la DB:', heroSections.length);

    const sectionsWithUrls = heroSections.map(section => {
      // Transformer les URLs des images
      const mainImageUrl = section.mainImage && !section.mainImage.startsWith('http') && !section.mainImage.startsWith('/uploads') 
        ? getFileUrl(section.mainImage) 
        : section.mainImage;

      return {
        id: section.id,
        mainImage: {
          url: mainImageUrl,
          alt: section.mainImageAlt
        },
        galleryImages: section.galleryImages.map(img => {
          const imageUrl = img.url && !img.url.startsWith('http') && !img.url.startsWith('/uploads') 
            ? getFileUrl(img.url) 
            : img.url;
          
          return {
            id: img.id,
            url: imageUrl,
            alt: img.alt,
            label: img.label
          };
        }),
        titleLine1: section.titleLine1,
        titleHighlight: section.titleHighlight,
        titleLine2: section.titleLine2,
        subtitle: section.subtitle,
        ctaText: section.ctaText,
        collectionYear: section.collectionYear,
        badgeText: section.badgeText,
        isActive: section.isActive,
        order: section.order,
        createdAt: section.createdAt,
        updatedAt: section.updatedAt
      };
    });

    console.log('✅ Sections hero envoyées au frontend:', sectionsWithUrls.length);

    res.json({
      success: true,
      data: sectionsWithUrls,
      count: sectionsWithUrls.length,
    });
  } catch (error) {
    console.error('❌ Erreur GET /hero-sections:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de la récupération des sections hero',
    });
  }
};

/* ======================================================
   POST /api/v1/hero-sections
   Créer une nouvelle section hero
====================================================== */
export const createHeroSection = async (req, res) => {
  console.log('📥 [POST] /api/v1/hero-sections');
  console.log('📦 Body:', req.body);

  try {
    const {
      mainImage,
      mainImageAlt,
      titleLine1,
      titleHighlight,
      titleLine2,
      subtitle,
      ctaText,
      collectionYear,
      badgeText,
      galleryImages = [],
      isActive,
      order
    } = req.body;

    // Validation
    if (!titleLine1) {
      return res.status(400).json({
        success: false,
        error: 'Le champ titleLine1 est requis',
      });
    }

    // Si on active cette section, désactiver toutes les autres
    if (isActive === true) {
      await prisma.heroSection.updateMany({
        where: { isActive: true },
        data: { isActive: false }
      });
    }

    // Pour mainImage, si c'est un fichier uploadé, prendre le filename
    const mainImageToSave = req.file ? req.file.filename : mainImage;

    const heroSection = await prisma.heroSection.create({
      data: {
        mainImage: mainImageToSave,
        mainImageAlt: mainImageAlt || 'Image principale',
        titleLine1,
        titleHighlight: titleHighlight || '',
        titleLine2: titleLine2 || '',
        subtitle: subtitle || '',
        ctaText: ctaText || 'Découvrir',
        collectionYear: collectionYear || new Date().getFullYear().toString(),
        badgeText: badgeText || 'Nouveau',
        isActive: isActive !== undefined ? isActive : false,
        order: order || 0,
        galleryImages: {
          create: galleryImages.map((img, index) => ({
            url: img.url,
            alt: img.alt || `Image galerie ${index + 1}`,
            label: img.label,
            order: img.order || index
          }))
        }
      },
      include: {
        galleryImages: true
      }
    });

    // Renvoyer avec les URLs complètes
    const heroSectionWithUrls = {
      ...heroSection,
      mainImage: getFileUrl(heroSection.mainImage),
      galleryImages: heroSection.galleryImages.map(img => ({
        ...img,
        url: getFileUrl(img.url)
      }))
    };

    console.log('✅ Section hero créée:', heroSection.id);

    res.status(201).json({
      success: true,
      data: heroSectionWithUrls,
      message: 'Section hero créée avec succès',
    });
  } catch (error) {
    console.error('❌ Erreur POST /hero-sections:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de la création de la section hero',
    });
  }
};



/* ======================================================
   PUT /api/v1/hero-sections/:id/text
   Mettre à jour uniquement le texte
====================================================== */
export const updateHeroSectionText = async (req, res) => {
  const { id } = req.params;
  console.log(`📥 [PUT] /api/v1/hero-sections/${id}/text`);
  console.log('📦 Body:', req.body);

  try {
    const {
      titleLine1,
      titleHighlight,
      titleLine2,
      subtitle,
      ctaText,
      collectionYear,
      badgeText,
      isActive,
      order
    } = req.body;

    // Si on active cette section, désactiver toutes les autres
    if (isActive === true) {
      await prisma.heroSection.updateMany({
        where: { 
          isActive: true,
          id: { not: id }
        },
        data: { isActive: false }
      });
    }

    const heroSection = await prisma.heroSection.update({
      where: { id },
      data: {
        titleLine1,
        titleHighlight,
        titleLine2,
        subtitle,
        ctaText,
        collectionYear,
        badgeText,
        isActive,
        order: order ? Number(order) : undefined
      },
      include: {
        galleryImages: true
      }
    });

    // Renvoyer avec les URLs complètes
    const heroSectionWithUrls = {
      ...heroSection,
      mainImage: getFileUrl(heroSection.mainImage),
      galleryImages: heroSection.galleryImages.map(img => ({
        ...img,
        url: getFileUrl(img.url)
      }))
    };

    console.log(`✅ Texte de la section hero ${id} mis à jour`);

    res.json({
      success: true,
      data: heroSectionWithUrls,
      message: 'Texte de la section hero mis à jour avec succès',
    });
  } catch (error) {
    console.error(`❌ Erreur PUT /hero-sections/${id}/text:`, error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'Section hero non trouvée',
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de la mise à jour du texte',
    });
  }
};

/* ======================================================
   PATCH /api/v1/hero-sections/:id/toggle-active
   Activer/désactiver une section hero
====================================================== */
export const toggleActiveHeroSection = async (req, res) => {
  const { id } = req.params;
  console.log(`📥 [PATCH] /api/v1/hero-sections/${id}/toggle-active`);

  try {
    // Récupérer la section actuelle
    const currentSection = await prisma.heroSection.findUnique({
      where: { id }
    });

    if (!currentSection) {
      return res.status(404).json({
        success: false,
        error: 'Section hero non trouvée',
      });
    }

    // Si on veut activer cette section, désactiver toutes les autres d'abord
    if (!currentSection.isActive) {
      await prisma.heroSection.updateMany({
        where: { isActive: true },
        data: { isActive: false }
      });
    }

    // Basculer l'état actif
    const heroSection = await prisma.heroSection.update({
      where: { id },
      data: { isActive: !currentSection.isActive },
      include: {
        galleryImages: true
      }
    });

    console.log(`✅ Section hero ${id} état actif basculé: ${heroSection.isActive}`);

    res.json({
      success: true,
      data: heroSection,
      message: `Section hero ${heroSection.isActive ? 'activée' : 'désactivée'} avec succès`,
    });
  } catch (error) {
    console.error(`❌ Erreur PATCH /hero-sections/${id}/toggle-active:`, error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur lors du changement d\'état',
    });
  }
};
export const updateHeroMainImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Fichier image requis',
      });
    }

    const { id } = req.params;

    const heroSection = await prisma.heroSection.update({
      where: { id: String(id) },
      data: {
        mainImage: req.file.filename, // on stocke juste le filename
      },
    });

    res.json({
      success: true,
      data: {
        ...heroSection,
        mainImage: getFileUrl(heroSection.mainImage),
      },
      message: 'Image principale mise à jour avec succès',
    });

  } catch (error) {
    console.error('❌ updateHeroMainImage:', error);

    res.status(500).json({
      success: false,
      error: 'Erreur serveur',
    });
  }
};


export const updateHeroGalleryImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Fichier image requis',
      });
    }

    const { imageId } = req.params;

    const galleryImage = await prisma.heroGalleryImage.update({
      where: { id: String(imageId) },
      data: {
        url: req.file.filename,
      },
    });

    res.json({
      success: true,
      data: {
        ...galleryImage,
        url: getFileUrl(galleryImage.url),
      },
      message: 'Image de galerie mise à jour avec succès',
    });

  } catch (error) {
    console.error('❌ updateHeroGalleryImage:', error);

    res.status(500).json({
      success: false,
      error: 'Erreur serveur',
    });
  }
};

