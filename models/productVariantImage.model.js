import prisma from "../database/prisma-client.js";

const ProductVariantImageModel = {
  create: (data) => prisma.product_variant_images.create({ 
    data,
    include: { product_variants: true },
  }),

  findById: (id) => prisma.product_variant_images.findUnique({
    where: { id },
    include: { product_variants: true },
  }),

  findByVariantId: (variantId) => prisma.product_variant_images.findMany({
    where: { variant_id: variantId },
    orderBy: { sort_order: 'asc' },
  }),

  update: (id, data) => prisma.product_variant_images.update({
    where: { id },
    data,
    include: { product_variants: true },
  }),

  delete: (id) => prisma.product_variant_images.delete({ where: { id } }),

  deleteByVariantId: (variantId) => prisma.product_variant_images.deleteMany({
    where: { variant_id: variantId },
  }),
};

export default ProductVariantImageModel;

