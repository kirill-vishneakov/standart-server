import express from 'express';
import {
  getAppointments,
  createAppointment,
  getMyAppointments,
  updateStatus,
  cancelAppointment,
  rescheduleAppointment,

} from '../controllers/appointmentController.js';
import { authenticateToken, checkRole } from '../middleware/auth.js';


const router = express.Router();

router.get('/', authenticateToken, checkRole('admin'), getAppointments);
router.get('/mine', authenticateToken, getMyAppointments);
router.post('/', authenticateToken, createAppointment);
router.patch('/:id/status', authenticateToken, updateStatus);
router.patch('/:id/cancel', authenticateToken, cancelAppointment);
router.patch('/:id/reschedule', authenticateToken, rescheduleAppointment);


export default router;
