import express from 'express';
import {
  getServices,
  createService,
  deleteService
} from '../controllers/serviceController.js';
import { authenticateToken, checkRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, getServices);
router.post('/', authenticateToken, checkRole('admin'), createService);
router.delete('/:id', authenticateToken, checkRole('admin'), deleteService);

export default router;
