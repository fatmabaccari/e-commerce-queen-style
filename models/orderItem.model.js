import prisma from "../database/prisma-client.js";

const OrderItemModel = {
  create: (data) => prisma.order_items.create({ 
    data,
    include: { orders: true, products: true, product_variants: true },
  }),

  findById: (id) => prisma.order_items.findUnique({
    where: { id },
    include: { orders: true, products: true, product_variants: true },
  }),

  findByOrderId: (orderId) => prisma.order_items.findMany({
    where: { order_id: orderId },
    include: { products: true, product_variants: true },
  }),

  update: (id, data) => prisma.order_items.update({
    where: { id },
    data,
    include: { orders: true, products: true, product_variants: true },
  }),

  delete: (id) => prisma.order_items.delete({ where: { id } }),

  deleteByOrderId: (orderId) => prisma.order_items.deleteMany({
    where: { order_id: orderId },
  }),
};

export default OrderItemModel;

