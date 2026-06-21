import { Response } from 'express';
import Review from '../models/Review';
import Order from '../models/Order';
import { AuthRequest } from '../types';

export const getProductReviews = async (req: AuthRequest, res: Response): Promise<void> => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);
  const [reviews, total] = await Promise.all([
    Review.find({ product: req.params.productId })
      .populate('user', 'name avatar')
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit)),
    Review.countDocuments({ product: req.params.productId }),
  ]);
  res.json({ success: true, reviews, total });
};

export const createReview = async (req: AuthRequest, res: Response): Promise<void> => {
  const { productId } = req.params;
  const existing = await Review.findOne({ product: productId, user: req.user!._id });
  if (existing) { res.status(400).json({ success: false, message: 'Already reviewed' }); return; }

  const hasPurchased = await Order.findOne({
    user: req.user!._id,
    'items.product': productId,
    paymentStatus: 'paid',
  });

  const review = await Review.create({
    ...req.body,
    product: productId,
    user: req.user!._id,
    isVerifiedPurchase: !!hasPurchased,
  });
  await review.populate('user', 'name avatar');
  res.status(201).json({ success: true, review });
};

export const deleteReview = async (req: AuthRequest, res: Response): Promise<void> => {
  const review = await Review.findById(req.params.id);
  if (!review) { res.status(404).json({ success: false, message: 'Review not found' }); return; }
  if (String(review.user) !== String(req.user!._id) && req.user!.role !== 'admin') {
    res.status(403).json({ success: false, message: 'Not authorized' }); return;
  }
  await review.deleteOne();
  res.json({ success: true, message: 'Review deleted' });
};
