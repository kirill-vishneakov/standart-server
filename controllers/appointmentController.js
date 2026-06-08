import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getAppointments = async (req, res) => {
  const appointments = await prisma.appointment.findMany({
    include: { client: true, employee: true, service: true }
  });
  res.json(appointments);
};

export const getMyAppointments = async (req, res) => {
  const { id, role } = req.user;

  const filter = role === 'client'
    ? { client_id: id }
    : role === 'employee'
    ? { employee_id: id }
    : {};

  const appointments = await prisma.appointment.findMany({
    where: filter,
    include: { service: true }
  });

  res.json(appointments);
};

export const createAppointment = async (req, res) => {
  const { client_id, service_id, slot_id } = req.body;

  const slot = await prisma.scheduleSlot.findUnique({
    where: { id: slot_id },
  });

  if (!slot || !slot.is_available) {
    return res.status(400).json({ message: 'Слот недоступен или не существует' });
  }

  const appointment = await prisma.appointment.create({
    data: {
      client_id,
      employee_id: slot.employee_id,
      service_id,
      date_time: slot.start_time,
      status: 'scheduled',
    },
  });

  await prisma.scheduleSlot.update({
    where: { id: slot_id },
    data: { is_available: false },
  });

  res.status(201).json(appointment);
};


export const updateStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const appointment = await prisma.appointment.update({
    where: { id: Number(id) },
    data: { status }
  });

  if (status === 'completed') {
    const existingLog = await prisma.workLog.findFirst({
      where: { appointment_id: appointment.id }
    });

    if (!existingLog) {
      await prisma.workLog.create({
        data: {
          employee_id: appointment.employee_id,
          appointment_id: appointment.id,
          report_date: new Date(),
          notes: 'Приём завершён',
        }
      });
    }
  }

  res.json(appointment);
};

export const cancelAppointment = async (req, res) => {
  const { id } = req.params;

  const appointment = await prisma.appointment.findUnique({
    where: { id: Number(id) },
  });

  if (!appointment) {
    return res.status(404).json({ message: 'Appointment not found' });
  }

  if (appointment.status !== 'scheduled') {
    return res.status(400).json({ message: 'Only scheduled appointments can be canceled' });
  }

  // Обновляем статус
  await prisma.appointment.update({
    where: { id: Number(id) },
    data: { status: 'canceled' },
  });

  // Ищем слот с этим временем и сотрудником (если есть)
  await prisma.scheduleSlot.updateMany({
    where: {
      employee_id: appointment.employee_id,
      start_time: appointment.date_time,
    },
    data: { is_available: true },
  });

  res.json({ message: 'Appointment canceled and slot released' });
};

export const rescheduleAppointment = async (req, res) => {
  const { id } = req.params;
  const { new_slot_id } = req.body;

  const appointment = await prisma.appointment.findUnique({
    where: { id: Number(id) },
  });

  if (!appointment || appointment.status !== 'scheduled') {
    return res.status(400).json({ message: 'Appointment not found or cannot be rescheduled' });
  }

  const newSlot = await prisma.scheduleSlot.findUnique({
    where: { id: new_slot_id },
  });

  if (!newSlot || !newSlot.is_available) {
    return res.status(400).json({ message: 'Selected slot is not available' });
  }

  await prisma.scheduleSlot.updateMany({
    where: {
      employee_id: appointment.employee_id,
      start_time: appointment.date_time,
    },
    data: { is_available: true },
  });

  await prisma.scheduleSlot.update({
    where: { id: new_slot_id },
    data: { is_available: false },
  });

  const updatedAppointment = await prisma.appointment.update({
    where: { id: Number(id) },
    data: {
      employee_id: newSlot.employee_id,
      date_time: newSlot.start_time,
      status: 'scheduled',
    },
  });

  res.json({ message: 'Appointment rescheduled', appointment: updatedAppointment });
};
