import prisma from "../database/prisma-client.js";

const DiscountModel = {
  create: async (data) => {
    try {
      const { category_ids, product_ids, ...discountData } = data;
      
      // Ensure type is properly formatted for enum (should be 'percentage' or 'fixed')
      if (discountData.type) {
        discountData.type = discountData.type.toLowerCase();
      }
      
      // Build the data object, only including relationships if they have values
      const createData = { ...discountData };
      
      // Create discount_categories relationships if category_ids provided
      if (category_ids && Array.isArray(category_ids) && category_ids.length > 0) {
        createData.discount_categories = {
          create: category_ids.map(category_id => ({
            category_id: parseInt(category_id),
          })),
        };
      }
      
      // Create discount_products relationships if product_ids provided
      if (product_ids && Array.isArray(product_ids) && product_ids.length > 0) {
        createData.discount_products = {
          create: product_ids.map(product_id => ({
            product_id: parseInt(product_id),
          })),
        };
      }
      
      // Create discount with relationships if provided
      const discount = await prisma.discounts.create({ 
        data: createData,
        include: {
          discount_categories: {
            include: { categories: true },
          },
          discount_products: {
            include: { products: true },
          },
        },
      });
      
      return discount;
    } catch (error) {
      console.error('DiscountModel.create error:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        meta: error.meta,
        stack: error.stack,
      });
      throw error;
    }
  },

  findById: (id) => prisma.discounts.findUnique({
    where: { id },
    include: { 
      discount_categories: {
        include: { categories: true },
      },
      discount_products: {
        include: { products: true },
      },
    },
  }),

  findAll: () => prisma.discounts.findMany({
    include: { 
      discount_categories: { include: { categories: true } },
      discount_products: { include: { products: true } },
    },
    orderBy: { created_at: 'desc' },
  }),

  findActive: () => {
    const now = new Date();
    return prisma.discounts.findMany({
      where: {
        start_date: { lte: now },
        end_date: { gte: now },
      },
      include: { 
        discount_categories: { include: { categories: true } },
        discount_products: { include: { products: true } },
      },
    });
  },

  update: async (id, data) => {
    const { category_ids, product_ids, ...updateData } = data;
    
    // If category_ids or product_ids are provided, update relationships
    if (category_ids !== undefined || product_ids !== undefined) {
      // Delete existing relationships
      if (category_ids !== undefined) {
        await prisma.discount_categories.deleteMany({
          where: { discount_id: id },
        });
      }
      if (product_ids !== undefined) {
        await prisma.discount_products.deleteMany({
          where: { discount_id: id },
        });
      }
      
      // Create new relationships
      const createData = {};
      if (category_ids && category_ids.length > 0) {
        createData.discount_categories = {
          create: category_ids.map(category_id => ({
            category_id: parseInt(category_id),
          })),
        };
      }
      if (product_ids && product_ids.length > 0) {
        createData.discount_products = {
          create: product_ids.map(product_id => ({
            product_id: parseInt(product_id),
          })),
        };
      }
      
      // Update discount with new relationships
      return prisma.discounts.update({
        where: { id },
        data: {
          ...updateData,
          ...createData,
        },
        include: {
          discount_categories: {
            include: { categories: true },
          },
          discount_products: {
            include: { products: true },
          },
        },
      });
    }
    
    // Regular update without relationship changes
    return prisma.discounts.update({
      where: { id },
      data: updateData,
      include: {
        discount_categories: {
          include: { categories: true },
        },
        discount_products: {
          include: { products: true },
        },
      },
    });
  },

  delete: (id) => prisma.discounts.delete({ where: { id } }),
};

export default DiscountModel;

