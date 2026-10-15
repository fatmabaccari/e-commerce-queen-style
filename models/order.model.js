import prisma from "../database/prisma-client.js";

const OrderModel = {
  create: (data) => prisma.orders.create({ 
    data,
    include: { 
      users: true,
      order_items: {
        include: {
          products: true,
          product_variants: {
            include: { product_variant_images: true },
          },
        },
      },
    },
  }),

  findById: (id) => prisma.orders.findUnique({
    where: { id },
    include: { 
      users: true,
      order_items: {
        include: {
          products: true,
          product_variants: {
            include: { product_variant_images: true },
          },
        },
      },
    },
  }),

  findByOrderNumber: (orderNumber) => prisma.orders.findUnique({
    where: { order_number: orderNumber },
    include: { 
      users: true,
      order_items: {
        include: {
          products: true,
          product_variants: {
            include: { product_variant_images: true },
          },
        },
      },
    },
  }),

  findByUserId: (userId) => prisma.orders.findMany({
    where: { user_id: userId },
    include: { 
      order_items: {
        include: {
          products: true,
          product_variants: {
            include: { product_variant_images: true },
          },
        },
      },
    },
    orderBy: { created_at: 'desc' },
  }),

  findAll: (filters = {}) => {
    const where = {};
    if (filters.status) where.status = filters.status;
    if (filters.user_id !== undefined) {
      where.user_id = filters.user_id === null ? null : filters.user_id;
    }

    const query = {
      where,
      include: { 
        users: true,
        order_items: {
          include: {
            products: true,
            product_variants: {
              include: { product_variant_images: true },
            },
          },
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

    return prisma.orders.findMany(query);
  },

  count: (filters = {}) => {
    const where = {};
    if (filters.status) where.status = filters.status;
    if (filters.user_id !== undefined) {
      where.user_id = filters.user_id === null ? null : filters.user_id;
    }

    return prisma.orders.count({ where });
  },

  update: (id, data) => prisma.orders.update({
    where: { id },
    data,
    include: { 
      users: true,
      order_items: {
        include: {
          products: true,
          product_variants: true,
        },
      },
    },
  }),

  updateStatus: (id, status) => prisma.orders.update({
    where: { id },
    data: { status },
  }),

  delete: (id) => prisma.orders.delete({ where: { id } }),
};

export default OrderModel;

