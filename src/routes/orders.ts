import { Router } from 'express';
import { createOrder, verifyPayment, getMyOrders, getOrder, getAllOrders, updateOrderStatus, getAdminStats } from '../controllers/orderController';
import { protect, adminOnly } from '../middleware/auth';

const router = Router();

router.use(protect);
router.post('/', createOrder);
router.post('/verify-payment', verifyPayment);
router.get('/my', getMyOrders);
router.get('/my/:id', getOrder);
router.get('/', adminOnly, getAllOrders);
router.get('/stats', adminOnly, getAdminStats);
router.put('/:id/status', adminOnly, updateOrderStatus);

export default router;
