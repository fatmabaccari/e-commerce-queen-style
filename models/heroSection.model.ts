// app/models/hero-section.model.ts
import { PrismaClient } from '@prisma/client'; // Import PrismaClient

// Créer une instance de PrismaClient
const prisma = new PrismaClient();

export interface HeroSectionData {
  mainImage: string;
  mainImageAlt: string;
  titleLine1: string;
  titleHighlight: string;
  titleLine2: string;
  subtitle: string;
  ctaText: string;
  collectionYear: string;
  badgeText: string;
  galleryImages: {
    url: string;
    alt: string;
    label?: string;
  }[];
}

export class HeroSectionModel {
  static async getActive() {
    return await prisma.heroSection.findFirst({
      where: { isActive: true },
      include: {
        galleryImages: {
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { order: 'asc' }
    });
  }

  static async getAll() {
    return await prisma.heroSection.findMany({
      include: {
        galleryImages: {
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { order: 'asc' }
    });
  }

  static async getById(id: string) {
    return await prisma.heroSection.findUnique({
      where: { id },
      include: {
        galleryImages: {
          orderBy: { order: 'asc' }
        }
      }
    });
  }

  static async create(data: HeroSectionData) {
    const { galleryImages, ...heroData } = data;
    
    return await prisma.heroSection.create({
      data: {
        ...heroData,
        galleryImages: {
          create: galleryImages
        }
      },
      include: {
        galleryImages: true
      }
    });
  }

  static async update(id: string, data: Partial<HeroSectionData>) {
    const { galleryImages, ...heroData } = data;
    
    // Si des galleryImages sont fournies, on les remplace
    if (galleryImages) {
      // Supprimer les anciennes images
      await prisma.heroGalleryImage.deleteMany({
        where: { heroSectionId: id }
      });
    }
    
    return await prisma.heroSection.update({
      where: { id },
      data: {
        ...heroData,
        ...(galleryImages && {
          galleryImages: {
            create: galleryImages
          }
        })
      },
      include: {
        galleryImages: true
      }
    });
  }

  static async delete(id: string) {
    return await prisma.heroSection.delete({
      where: { id }
    });
  }
}