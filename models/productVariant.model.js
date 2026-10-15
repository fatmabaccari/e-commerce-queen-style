import prisma from "../database/prisma-client.js";

const ProductVariantModel = {
  create: (data) => prisma.product_variants.create({ 
    data,
    include: { 
      products: {
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
        },
      },
      product_variant_images: true,
    },
  }),

  findById: (id) => prisma.product_variants.findUnique({
    where: { id },
    include: { 
      products: {
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
        },
      },
      product_variant_images: {
        orderBy: { sort_order: 'asc' },
      },
    },
  }),

  findAll: () => prisma.product_variants.findMany({
    include: { 
      products: {
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
        },
      },
      product_variant_images: {
        orderBy: { sort_order: 'asc' },
      },
    },
    orderBy: { created_at: 'desc' },
  }),

  findByProductId: (productId) => prisma.product_variants.findMany({
    where: { product_id: productId },
    include: { 
      products: {
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
        },
      },
      product_variant_images: {
        orderBy: { sort_order: 'asc' },
      },
    },
  }),

  update: (id, data) => prisma.product_variants.update({
    where: { id },
    data,
    include: { products: true, product_variant_images: true },
  }),

  updateStock: (id, changeAmount) => prisma.product_variants.update({
    where: { id },
    data: {
      stock_quantity: {
        increment: changeAmount,
      },
    },
  }),

  delete: (id) => prisma.product_variants.delete({ where: { id } }),
};

export default ProductVariantModel;

