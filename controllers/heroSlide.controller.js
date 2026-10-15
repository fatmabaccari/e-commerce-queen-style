// controllers/heroSlide.controller.js
import prisma from '../database/prisma-client.js';
import { getFileUrl } from '../middlewares/upload.middleware.js';

/* ======================================================
   GET /api/v1/hero-slides
====================================================== */
export const getAllHeroSlides = async (req, res) => {


  try {
    const slides = await prisma.heroSlide.findMany({
      orderBy: { order: 'asc' },
    });



    const slidesWithUrl = slides.map(slide => {
      let imageUrl = slide.image;



      // Si l'image est un fichier local (pas une URL complète et pas déjà préfixée)
      if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('/uploads')) {
        imageUrl = getFileUrl(imageUrl);

      }

      return {
        ...slide,
        image: imageUrl || null,
      };
    });




    res.json({
      success: true,
      data: slidesWithUrl,
      count: slides.length,
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de la récupération des slides',
    });
  }
};

/* ======================================================
   PUT /api/v1/hero-slides/:id/text
   Mettre à jour titre, sous-titre et ordre
====================================================== */
export const updateHeroSlideText = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subtitle, order } = req.body;

    const slide = await prisma.heroSlide.update({
      where: { id: String(id) },
      data: { title, subtitle, order: Number(order) || 0 },
    });

    res.json({ success: true, data: slide, message: 'Texte mis à jour avec succès' });
  } catch (error) {

    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
};

/* ======================================================
   PUT /api/v1/hero-slides/:id/image
   Mettre à jour uniquement l'image
====================================================== */
export const updateHeroSlideImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'Fichier requis' });

    const { id } = req.params;

    const slide = await prisma.heroSlide.update({
      where: { id: String(id) },
      data: { image: req.file.filename }, // stocke juste le filename
    });

    res.json({
      success: true,
      data: { ...slide, image: getFileUrl(slide.image) }, // renvoie URL complète pour le front
      message: 'Image mise à jour avec succès',
    });
  } catch (error) {

    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
};
