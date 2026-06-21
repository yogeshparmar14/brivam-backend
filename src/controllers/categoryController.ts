import { Request, Response } from 'express';
import slugify from 'slugify';
import Category from '../models/Category';

export const getCategories = async (_req: Request, res: Response): Promise<void> => {
  const categories = await Category.find({ isActive: true }).sort('name');
  res.json({ success: true, categories });
};

export const createCategory = async (req: Request, res: Response): Promise<void> => {
  const slug = slugify(req.body.name, { lower: true, strict: true });
  const category = await Category.create({ ...req.body, slug });
  res.status(201).json({ success: true, category });
};

export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  if (req.body.name) req.body.slug = slugify(req.body.name, { lower: true, strict: true });
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!category) { res.status(404).json({ success: false, message: 'Category not found' }); return; }
  res.json({ success: true, category });
};

export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  await Category.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Category deleted' });
};
