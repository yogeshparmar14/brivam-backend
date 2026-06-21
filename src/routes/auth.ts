import { Router } from 'express';
import { register, login, logout, getMe, updateProfile, changePassword, addAddress, deleteAddress } from '../controllers/authController';
import { protect } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.put('/me', protect, updateProfile);
router.put('/me/password', protect, changePassword);
router.post('/me/addresses', protect, addAddress);
router.delete('/me/addresses/:addressId', protect, deleteAddress);

export default router;
