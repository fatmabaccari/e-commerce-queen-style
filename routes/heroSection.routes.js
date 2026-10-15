import express from 'express';
import {
  getAllHeroSections,
  getActiveHeroSection,
  createHeroSection,
  updateHeroSectionText,
  toggleActiveHeroSection,
  updateHeroMainImage,
  updateHeroGalleryImage,
} from '../controllers/heroSection.controller.js';

import { uploadSingle } from '../middlewares/upload.middleware.js';

const heroSectionRoutes = express.Router();

/* ======================================================
   ADMIN – HERO SECTIONS
====================================================== */

// Récupérer toutes les sections hero
heroSectionRoutes.get('/hero-sections', getAllHeroSections);

// Créer une nouvelle section hero
heroSectionRoutes.post(
  '/hero-sections',
  uploadSingle('mainImage'),
  createHeroSection
);

// Mettre à jour uniquement le texte
heroSectionRoutes.put(
  '/hero-sections/:id/text',
  updateHeroSectionText
);

// Mettre à jour l’image principale
heroSectionRoutes.put(
  '/hero-sections/:id/main-image',
  uploadSingle('image'),
  updateHeroMainImage
);

// Mettre à jour une image de la galerie
heroSectionRoutes.put(
  '/hero-sections/gallery/:imageId',
  uploadSingle('image'),
  updateHeroGalleryImage
);

// Activer / désactiver une section hero
heroSectionRoutes.patch(
  '/hero-sections/:id/toggle-active',
  toggleActiveHeroSection
);

/* ======================================================
   PUBLIC – HERO SECTION ACTIVE
====================================================== */

// Récupérer la section hero active
heroSectionRoutes.get(
  '/hero-sections/active',
  getActiveHeroSection
);

export default heroSectionRoutes;
