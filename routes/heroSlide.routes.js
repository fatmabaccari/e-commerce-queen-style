import express from 'express';
import { getAllHeroSlides, updateHeroSlideText, updateHeroSlideImage } from '../controllers/heroSlide.controller.js';
import { uploadSingle } from '../middlewares/upload.middleware.js';
import asyncHandler from '../middlewares/asyncHandler.js';
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
const heroSlideRoutes = express.Router();

// GET /api/v1/hero-slides
heroSlideRoutes.get('/hero-slides',  uploadSingle('image'),asyncHandler(getAllHeroSlides));

// PUT texte
heroSlideRoutes.put('/hero-slides/:id/text',asyncHandler(updateHeroSlideText));

// PUT image
heroSlideRoutes.put('/hero-slides/:id/image', uploadSingle('image'), asyncHandler(updateHeroSlideImage));

export default heroSlideRoutes;
