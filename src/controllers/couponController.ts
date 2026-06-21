import { Request, Response } from 'express';
import Coupon from '../models/Coupon';

export const getCoupons = async (_req: Request, res: Response): Promise<void> => {
  const coupons = await Coupon.find().sort('-createdAt');
  res.json({ success: true, coupons });
};

export const createCoupon = async (req: Request, res: Response): Promise<void> => {
  const coupon = await Coupon.create(req.body);
  res.status(201).json({ success: true, coupon });
};

export const updateCoupon = async (req: Request, res: Response): Promise<void> => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!coupon) { res.status(404).json({ success: false, message: 'Coupon not found' }); return; }
  res.json({ success: true, coupon });
};

export const deleteCoupon = async (req: Request, res: Response): Promise<void> => {
  await Coupon.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Coupon deleted' });
};

export const validateCoupon = async (req: Request, res: Response): Promise<void> => {
  const { code, subtotal } = req.body;
  const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
  if (!coupon) { res.status(404).json({ success: false, message: 'Invalid coupon' }); return; }
  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    res.status(400).json({ success: false, message: 'Coupon expired' }); return;
  }
  if (subtotal < coupon.minOrderValue) {
    res.status(400).json({ success: false, message: `Minimum order ₹${coupon.minOrderValue} required` }); return;
  }
  let discount = coupon.type === 'percentage' ? (subtotal * coupon.value) / 100 : coupon.value;
  if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
  res.json({ success: true, coupon, discount });
};
