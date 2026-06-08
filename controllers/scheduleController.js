import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();


export const generateSchedule = async (req, res) => {
  const { employee_id, daysOfWeek, startTime, endTime, generateForWeek } = req.body;

  const slots = [];
  const now = new Date();
  const daysToGenerate = generateForWeek ? 7 : 1;

  for (let i = 0; i < daysToGenerate; i++) {
    const current = new Date(now);
    current.setDate(current.getDate() + i);
    const weekday = current.getDay(); // 0 - Sunday, 6 - Saturday

    if (!daysOfWeek.includes(weekday)) continue;

    const baseDate = current.toISOString().split('T')[0];

    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);

    let slotTime = new Date(`${baseDate}T${startTime}:00`);
    const end = new Date(`${baseDate}T${endTime}:00`);

    while (slotTime < end) {
      const endSlotTime = new Date(slotTime.getTime() + 30 * 60 * 1000);

      slots.push({
        employee_id,
        start_time: slotTime,
        end_time: endSlotTime,
        is_available: true,
      });

      slotTime = endSlotTime;
    }
  }

  await prisma.scheduleSlot.createMany({ data: slots });
  res.json({ message: `Создано ${slots.length} слотов.` });
};


export const getAvailableSlots = async (req, res) => {
  const { employee_id, date } = req.query;

  const filters = {
    is_available: true,
    start_time: { gte: new Date() }, // только будущие слоты
  };

  if (employee_id) {
    filters.employee_id = Number(employee_id);
  }

  if (date) {
    const dateOnly = new Date(date);
    const nextDay = new Date(dateOnly);
    nextDay.setDate(nextDay.getDate() + 1);

    filters.start_time = {
      gte: dateOnly,
      lt: nextDay,
    };
  }

  const slots = await prisma.scheduleSlot.findMany({
    where: filters,
    orderBy: { start_time: 'asc' },
    include: { employee: true },
  });

  res.json(slots);
};

export const getMySchedule = async (req, res) => {
  const userId = req.user.id;
  const start = new Date();
  const end = new Date();
  end.setDate(start.getDate() + 7);

  const slots = await prisma.scheduleSlot.findMany({
    where: {
      employee_id: userId,
      start_time: {
        gte: start,
        lt: end,
      },
    },
    orderBy: { start_time: 'asc' },
  });

  res.json(slots);
};
