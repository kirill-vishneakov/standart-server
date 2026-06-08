import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getServices = async (req, res) => {
  const services = await prisma.service.findMany();
  res.json(services);
};

export const createService = async (req, res) => {
  const { name, duration_minutes, price } = req.body;
  const service = await prisma.service.create({
    data: { name, duration_minutes: Number(duration_minutes), price: Number(price) },
  });
  res.status(201).json(service);
};

export const deleteService = async (req, res) => {
  const id = Number(req.params.id);
  await prisma.service.delete({ where: { id } });
  res.json({ message: 'Service deleted' });
};
