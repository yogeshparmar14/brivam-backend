import { Router } from 'express';
import { getCoupons, createCoupon, updateCoupon, deleteCoupon, validateCoupon } from '../controllers/couponController';
import { protect, adminOnly } from '../middleware/auth';

const router = Router();

router.post('/validate', protect, validateCoupon);
router.use(protect, adminOnly);
router.get('/', getCoupons);
router.post('/', createCoupon);
router.put('/:id', updateCoupon);
router.delete('/:id', deleteCoupon);

export default router;
