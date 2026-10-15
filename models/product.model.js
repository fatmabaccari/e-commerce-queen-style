import prisma from "../database/prisma-client.js";

const ProductModel = {
  create: (data) => prisma.products.create({ 
    data,
    include: { 
      categories: {
        include: {
          discount_categories: {
            include: { discounts: true },
          },
        },
      },
      discount_products: {
        include: { discounts: true },
      },
      product_variants: true,
    },
  }),

  findById: (id) => prisma.products.findUnique({
    where: { id },
    include: { 
      categories: {
        include: {
          discount_categories: {
            include: { discounts: true },
          },
        },
      },
      discount_products: {
        include: { discounts: true },
      },
      product_variants: {
        include: { product_variant_images: true },
      },
    },
  }),

  findAll: (filters = {}) => {
    const where = {};
    if (filters.category_id) where.category_id = filters.category_id;
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { product_reference: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const query = {
      where,
      include: { 
        categories: {
          include: {
            discount_categories: {
              include: { discounts: true },
            },
          },
        },
        discount_products: {
          include: { discounts: true },
        },
        product_variants: {
          include: { product_variant_images: true },
        },
      },
      orderBy: { created_at: 'desc' },
    };

    // Add pagination if provided
    if (filters.skip !== undefined) {
      query.skip = filters.skip;
    }
    if (filters.limit !== undefined) {
      query.take = filters.limit;
    }

    return prisma.products.findMany(query);
  },

  count: (filters = {}) => {
    const where = {};
    if (filters.category_id) where.category_id = filters.category_id;
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { product_reference: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return prisma.products.count({ where });
  },

  update: (id, data) => prisma.products.update({
    where: { id },
    data,
    include: { 
      categories: {
        include: {
          discount_categories: {
            include: { discounts: true },
          },
        },
      },
      discount_products: {
        include: { discounts: true },
      },
      product_variants: true,
    },
  }),

  delete: (id) => prisma.products.delete({ where: { id } }),
};

export default ProductModel;

