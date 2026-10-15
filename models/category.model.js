import prisma from "../database/prisma-client.js";

const CategoryModel = {
  create: (data) => prisma.categories.create({ 
    data,
    include: { categories: true, other_categories: true, products: true },
  }),

  findById: (id) => prisma.categories.findUnique({
    where: { id },
    include: { 
      categories: true,
      other_categories: true,
      products: {
        include: { product_variants: true },
      },
    },
  }),

  findAll: (includeProducts = false) => {
    const include = {
      categories: true,
      other_categories: true,
    };
    if (includeProducts) {
      include.products = {
        include: { product_variants: true },
      };
    }

    return prisma.categories.findMany({
      include,
      orderBy: { name: 'asc' },
    });
  },

  findByParentId: (parentId) => prisma.categories.findMany({
    where: { parent_id: parentId },
    include: { categories: true, other_categories: true },
  }),

  update: (id, data) => prisma.categories.update({
    where: { id },
    data,
    include: { categories: true, other_categories: true },
  }),

  delete: (id) => prisma.categories.delete({ where: { id } }),
};

export default CategoryModel;

