import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getEmployeeReport = async (req, res) => {
  const { employeeId } = req.params;
  const { start, end } = req.query;

  try {
    if (!employeeId) {
      return res.status(400).json({ message: 'Employee ID is missing' });
    }

    const employee = await prisma.user.findUnique({
      where: { id: Number(employeeId) },
      select: { id: true, full_name: true },
    });

    if (!employee) {
      return res.status(404).json({ message: 'Сотрудник не найден' });
    }

    const appointments = await prisma.appointment.findMany({
      where: {
        employee_id: Number(employeeId),
        date_time: {
          gte: new Date(start),
          lte: new Date(end),
        },
      },
      include: {
        service: true,
      },
    });

    const serviceStats = {};

    for (const appt of appointments) {
      const s = appt.service;
      if (!serviceStats[s.id]) {
        serviceStats[s.id] = {
          name: s.name,
          count: 0,
          income: 0,
        };
      }

      serviceStats[s.id].count++;
      serviceStats[s.id].income += +s.price;
    }

    const totalIncome = Object.values(serviceStats).reduce((sum, s) => sum + s.income, 0);
    const totalAppointments = appointments.length;

    res.json({
      employee,
      totalIncome,
      totalAppointments,
      services: Object.values(serviceStats),
    });

  } catch (err) {
    console.error('Ошибка получения отчёта:', err);
    res.status(500).json({ message: 'Ошибка получения отчёта' });
  }
};
