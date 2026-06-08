import express from 'express';
import { authenticateToken, checkRole } from '../middleware/auth.js';
import { generateSchedule, getAvailableSlots, getMySchedule } from '../controllers/scheduleController.js';

const router = express.Router();

router.post('/generate', authenticateToken, checkRole('admin'), generateSchedule);
router.get('/available', authenticateToken, getAvailableSlots);
router.get('/my', authenticateToken, checkRole('employee'), getMySchedule);


export default router;
