import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getEmployees = async (req, res) => {
  try {
    const employees = await prisma.user.findMany({
      where: { role: 'employee' },
      select: {
        id: true,
        full_name: true
      }
    });

    res.json(employees);
  } catch (err) {
    console.error('Ошибка получения сотрудников:', err);
    res.status(500).json({ message: 'Ошибка получения сотрудников' });
  }
};
