import mongoose, { Schema } from 'mongoose';
import { IOrder } from '../types';

let counter = 0;

const orderItemSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  image: { type: String, required: true },
  variantSku: { type: String, required: true },
  flavor: String,
  weight: String,
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  mrp: { type: Number, required: true },
});

const addressSchema = new Schema({
  label: String,
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  line1: { type: String, required: true },
  line2: String,
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
});

const orderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, unique: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [orderItemSchema],
    shippingAddress: { type: addressSchema, required: true },
    paymentMethod: { type: String, enum: ['razorpay', 'cod'], required: true },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    orderStatus: {
      type: String,
      enum: ['placed', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'placed',
    },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    shippingCharge: { type: Number, default: 0 },
    total: { type: Number, required: true },
    couponCode: String,
    notes: String,
    trackingNumber: String,
    deliveredAt: Date,
  },
  { timestamps: true }
);

orderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const date = new Date();
    const yy = String(date.getFullYear()).slice(-2);
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    counter = (counter + 1) % 10000;
    this.orderNumber = `BRV${yy}${mm}${String(counter).padStart(4, '0')}`;
  }
  next();
});

export default mongoose.model<IOrder>('Order', orderSchema);
