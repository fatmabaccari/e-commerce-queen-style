import prisma from "../database/prisma-client.js";

const UserAddressModel = {
  create: (data) => prisma.user_addresses.create({ data }),

  findById: (id) =>
    prisma.user_addresses.findUnique({ where: { id } }),

  findByUserId: (user_id) =>
    prisma.user_addresses.findMany({ where: { user_id } }),

  update: (id, data) =>
    prisma.user_addresses.update({
      where: { id },
      data,
    }),

  delete: (id) =>
    prisma.user_addresses.delete({ where: { id } }),
};

export default UserAddressModel;
