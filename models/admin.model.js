import prisma from "../database/prisma-client.js";

const AdminModel = {
  create: (data) => prisma.admins.create({ data }),

  findByEmail: (email) =>
    prisma.admins.findUnique({ where: { email } }),

  findById: (id) => prisma.admins.findUnique({ where: { id } }),

  findAll: () => prisma.admins.findMany(),

  update: (id, data) =>
    prisma.admins.update({
      where: { id },
      data,
    }),

  delete: (id) => prisma.admins.delete({ where: { id } }),
};

export default AdminModel;
