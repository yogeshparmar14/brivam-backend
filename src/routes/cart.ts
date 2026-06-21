import { Router } from 'express';
import { getCart, addToCart, updateCartItem, removeFromCart, applyCoupon, clearCart } from '../controllers/cartController';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);
router.get('/', getCart);
router.post('/add', addToCart);
router.put('/update', updateCartItem);
router.delete('/item/:sku', removeFromCart);
router.post('/coupon', applyCoupon);
router.delete('/clear', clearCart);

export default router;
