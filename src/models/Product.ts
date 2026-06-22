import mongoose, { Schema } from 'mongoose';
import { IProduct } from '../types';

const variantSchema = new Schema({
  flavor: String,
  weight: String,
  sku: { type: String, required: true },
  price: { type: Number, required: true },
  mrp: { type: Number, required: true },
  stock: { type: Number, required: true, default: 0 },
  images: [String],
});

const nutritionSchema = new Schema({
  label: { type: String, required: true },
  per100g: String,
  perServing: String,
});

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    shortDescription: { type: String, required: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    brand: { type: String, default: 'OJAM' },
    variants: { type: [variantSchema], required: true },
    images: [String],
    tags: [String],
    nutritionFacts: [nutritionSchema],
    ingredients: String,
    howToUse: String,
    benefits: [String],
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ isFeatured: 1, isActive: 1 });

export default mongoose.model<IProduct>('Product', productSchema);
