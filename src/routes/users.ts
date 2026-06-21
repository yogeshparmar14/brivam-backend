import { Router } from 'express';
import { getAllUsers, toggleUserStatus } from '../controllers/userController';
import { protect, adminOnly } from '../middleware/auth';

const router = Router();

router.use(protect, adminOnly);
router.get('/', getAllUsers);
router.put('/:id/toggle', toggleUserStatus);

export default router;
