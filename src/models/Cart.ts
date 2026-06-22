import mongoose, { Schema } from 'mongoose';
import { ICart } from '../types';

const cartItemSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  variantSku: { type: String, required: true },
  flavor: String,
  weight: String,
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
  mrp: { type: Number, required: true },
  image: { type: String, default: '' },
  name: { type: String, required: true },
});

const cartSchema = new Schema<ICart>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: [cartItemSchema],
    coupon: { type: Schema.Types.ObjectId, ref: 'Coupon' },
  },
  { timestamps: true }
);

export default mongoose.model<ICart>('Cart', cartSchema);
