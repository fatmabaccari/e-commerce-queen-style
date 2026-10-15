import prisma from "../database/prisma-client.js";

const RoleModel = {
  create: (data) => prisma.roles.create({ data }),

  findById: (id) => prisma.roles.findUnique({ 
    where: { id },
    include: { admins: true },
  }),

  findAll: () => prisma.roles.findMany({
    include: { admins: true },
  }),

  update: (id, data) => prisma.roles.update({
    where: { id },
    data,
  }),

  delete: (id) => prisma.roles.delete({ where: { id } }),
};

export default RoleModel;

