import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default class ContactModel {
  static async findAll() {
    return prisma.contact.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  static async findById(id) {
    return prisma.contact.findUnique({
      where: { id },
    });
  }

  static async create(data) {
    return prisma.contact.create({
      data,
    });
  }

  static async update(id, data) {
    return prisma.contact.update({
      where: { id },
      data,
    });
  }

  static async delete(id) {
    return prisma.contact.delete({
      where: { id },
    });
  }
}
