import { Router } from 'express';
import { getProducts, getProduct, getFeaturedProducts, createProduct, updateProduct, deleteProduct, getAdminProducts } from '../controllers/productController';
import { protect, adminOnly } from '../middleware/auth';

const router = Router();

router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/admin', protect, adminOnly, getAdminProducts);
router.get('/:slug', getProduct);
router.post('/', protect, adminOnly, createProduct);
router.put('/:id', protect, adminOnly, updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);

export default router;
