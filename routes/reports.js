import express from 'express';
import { getEmployeeReport } from '../controllers/reportController.js';
import { authenticateToken, checkRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/employee/:employeeId', authenticateToken, checkRole('admin'), getEmployeeReport);

  
export default router;
