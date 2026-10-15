import prisma from "../database/prisma-client.js";

const UserModel = {
  create: (data) => prisma.users.create({ data }),

  findByEmail: (email) =>
    prisma.users.findUnique({ where: { email } }),

  findById: (id) =>
    prisma.users.findUnique({
      where: { id },
      include: { user_addresses: true },
    }),

  findAll: () =>
    prisma.users.findMany({
      include: { user_addresses: true },
    }),

  update: (id, data) =>
    prisma.users.update({
      where: { id },
      data,
    }),

  delete: (id) => prisma.users.delete({ where: { id } }),
};

export default UserModel;
