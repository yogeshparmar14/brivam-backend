import mongoose, { Schema } from 'mongoose';
import { IReview } from '../types';
import Product from './Product';

const reviewSchema = new Schema<IReview>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, required: true, trim: true },
    comment: { type: String, required: true, trim: true },
    images: [String],
    isVerifiedPurchase: { type: Boolean, default: false },
  },
  { timestamps: true }
);

reviewSchema.index({ product: 1, user: 1 }, { unique: true });

async function updateProductStats(productId: unknown) {
  const Review = mongoose.model('Review');
  const stats = await Review.aggregate([
    { $match: { product: productId } },
    { $group: { _id: '$product', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  await Product.findByIdAndUpdate(productId, {
    averageRating: stats.length > 0 ? Math.round(stats[0].avgRating * 10) / 10 : 0,
    reviewCount: stats.length > 0 ? stats[0].count : 0,
  });
}

reviewSchema.post('save', async function () {
  await updateProductStats(this.product);
});

reviewSchema.post('deleteOne', { document: true, query: false }, async function () {
  await updateProductStats(this.product);
});

export default mongoose.model<IReview>('Review', reviewSchema);
