import prisma from "../database/prisma-client.js";

const HeroSlideModel = {
  create: async (data) => {
    try {
      const slide = await prisma.heroSlide.create({
        data,
      });
      console.log("HeroSlideModel.create:", slide);
      return slide;
    } catch (error) {
      console.error("HeroSlideModel.create error:", error);
      throw error;
    }
  },

  findById: (id) => {
    return prisma.heroSlide.findUnique({
      where: { id: id.toString() }, // s'assure que l'ID est string
    });
  },

  findAll: () => {
    return prisma.heroSlide.findMany({
      orderBy: { order: "asc" },
    });
  },

  update: async (id, data) => {
    try {
      const updatedSlide = await prisma.heroSlide.update({
        where: { id: id.toString() }, // Prisma attend un string
        data,
      });
      console.log("HeroSlideModel.update:", updatedSlide);
      return updatedSlide;
    } catch (error) {
      console.error("HeroSlideModel.update error:", error);
      throw error;
    }
  },

  delete: (id) => {
    return prisma.heroSlide.delete({
      where: { id: id.toString() },
    });
  },
};

export default HeroSlideModel;
