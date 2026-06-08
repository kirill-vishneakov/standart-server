import express from 'express';
import { getEmployees } from '../controllers/userController.js';
import { authenticateToken, checkRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/employees', authenticateToken, checkRole('admin'), getEmployees);

export default router;
