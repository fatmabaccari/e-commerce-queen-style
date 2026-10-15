import prisma from "../database/prisma-client.js";

const StockMovementModel = {
  // ✅ CREATE
  create: async (data) => {
    const m = await prisma.stock_movements.create({
      data,
      include: {
        product_variants: {
          include: { products: true }
        },
        admins: true,
      },
    });

    return {
      id: m.id,
      variant_id: m.variant_id,
      change_amount: m.change_amount,
      reason: m.reason,
      created_at: m.created_at,
      admin_id: m.admin_id,
      variant: {
        id: m.product_variants.id,
        size: m.product_variants.size,
        color: m.product_variants.color,
        product: {
          name: m.product_variants.products.name
        }
      }
    };
  },

  // ✅ FIND BY ID
  findById: async (id) => {
    const m = await prisma.stock_movements.findUnique({
      where: { id },
      include: {
        product_variants: {
          include: { products: true }
        },
        admins: true,
      },
    });

    if (!m) return null;

    return {
      id: m.id,
      variant_id: m.variant_id,
      change_amount: m.change_amount,
      reason: m.reason,
      created_at: m.created_at,
      admin_id: m.admin_id,
      variant: {
        id: m.product_variants.id,
        size: m.product_variants.size,
        color: m.product_variants.color,
        product: {
          name: m.product_variants.products.name
        }
      }
    };
  },

  // ✅ FIND BY VARIANT ID
  findByVariantId: async (variantId) => {
    const movements = await prisma.stock_movements.findMany({
      where: { variant_id: variantId },
      include: {
        product_variants: {
          include: { products: true }
        },
        admins: true,
      },
      orderBy: { created_at: "desc" },
    });

    return movements.map(m => ({
      id: m.id,
      variant_id: m.variant_id,
      change_amount: m.change_amount,
      reason: m.reason,
      created_at: m.created_at,
      admin_id: m.admin_id,
      variant: {
        id: m.product_variants.id,
        size: m.product_variants.size,
        color: m.product_variants.color,
        product: {
          name: m.product_variants.products.name
        }
      }
    }));
  },

  // ✅ FIND ALL (used by your page)
  findAll: async (filters = {}) => {
    const where = {};
    if (filters.variant_id) where.variant_id = filters.variant_id;
    if (filters.admin_id) where.admin_id = filters.admin_id;

    const movements = await prisma.stock_movements.findMany({
      where,
      include: {
        product_variants: {
          include: { products: true }
        },
        admins: true,
      },
      orderBy: { created_at: "desc" },
    });

    return movements.map(m => ({
      id: m.id,
      variant_id: m.variant_id,
      change_amount: m.change_amount,
      reason: m.reason,
      created_at: m.created_at,
      admin_id: m.admin_id,
      admin: m.admins ? {
        id: m.admins.id,
        email: m.admins.email,
        name: m.admins.name || m.admins.email
      } : null,
      product_variants: {
        id: m.product_variants.id,
        size: m.product_variants.size,
        color: m.product_variants.color,
        stock_quantity: m.product_variants.stock_quantity,
        products: {
          id: m.product_variants.products.id,
          name: m.product_variants.products.name,
          product_reference: m.product_variants.products.product_reference
        }
      }
    }));
  },

  // ✅ DELETE
  delete: (id) =>
    prisma.stock_movements.delete({
      where: { id },
    }),
};

export default StockMovementModel;
