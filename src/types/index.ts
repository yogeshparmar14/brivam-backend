import { Request } from 'express';
import { Document, Types } from 'mongoose';

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: 'user' | 'admin';
  avatar?: string;
  addresses: IAddress[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateToken(): string;
}

export interface IAddress {
  _id?: Types.ObjectId;
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export interface ICategory extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
  createdAt: Date;
}

export interface IVariant {
  flavor?: string;
  weight?: string;
  sku: string;
  price: number;
  mrp: number;
  stock: number;
  images: string[];
}

export interface INutritionFact {
  label: string;
  per100g?: string;
  perServing?: string;
}

export interface IProduct extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  category: Types.ObjectId;
  brand: string;
  variants: IVariant[];
  images: string[];
  tags: string[];
  nutritionFacts: INutritionFact[];
  ingredients?: string;
  howToUse?: string;
  benefits: string[];
  isFeatured: boolean;
  isActive: boolean;
  averageRating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICartItem {
  product: Types.ObjectId;
  variantSku: string;
  flavor?: string;
  weight?: string;
  quantity: number;
  price: number;
  mrp: number;
  image: string;
  name: string;
}

export interface ICart extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  items: ICartItem[];
  coupon?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrderItem {
  product: Types.ObjectId;
  name: string;
  image: string;
  variantSku: string;
  flavor?: string;
  weight?: string;
  quantity: number;
  price: number;
  mrp: number;
}

export interface IOrder extends Document {
  _id: Types.ObjectId;
  orderNumber: string;
  user: Types.ObjectId;
  items: IOrderItem[];
  shippingAddress: IAddress;
  paymentMethod: 'razorpay' | 'cod';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  orderStatus: 'placed' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  subtotal: number;
  discount: number;
  shippingCharge: number;
  total: number;
  couponCode?: string;
  notes?: string;
  trackingNumber?: string;
  deliveredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IReview extends Document {
  _id: Types.ObjectId;
  product: Types.ObjectId;
  user: Types.ObjectId;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
  isVerifiedPurchase: boolean;
  createdAt: Date;
}

export interface ICoupon extends Document {
  _id: Types.ObjectId;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderValue: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  expiresAt?: Date;
  isActive: boolean;
  createdAt: Date;
}

export interface AuthRequest extends Request {
  user?: IUser;
}
