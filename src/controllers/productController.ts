import { Request, Response } from 'express';
import slugify from 'slugify';
import Product from '../models/Product';

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  const {
    page = 1, limit = 12, category, search, sort = '-createdAt',
    minPrice, maxPrice, featured, tags,
  } = req.query;

  const filter: Record<string, unknown> = { isActive: true };
  if (category) filter.category = category;
  if (featured) filter.isFeatured = true;
  if (tags) filter.tags = { $in: (tags as string).split(',') };
  if (search) filter.$text = { $search: search as string };
  if (minPrice || maxPrice) {
    filter['variants.price'] = {
      ...(minPrice && { $gte: Number(minPrice) }),
      ...(maxPrice && { $lte: Number(maxPrice) }),
    };
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [products, total] = await Promise.all([
    Product.find(filter).populate('category', 'name slug').sort(sort as string).skip(skip).limit(Number(limit)),
    Product.countDocuments(filter),
  ]);

  res.json({
    success: true,
    products,
    pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
  });
};

export const getProduct = async (req: Request, res: Response): Promise<void> => {
  const product = await Product.findOne({ slug: req.params.slug, isActive: true }).populate('category', 'name slug');
  if (!product) { res.status(404).json({ success: false, message: 'Product not found' }); return; }
  res.json({ success: true, product });
};

export const getFeaturedProducts = async (_req: Request, res: Response): Promise<void> => {
  const products = await Product.find({ isFeatured: true, isActive: true })
    .populate('category', 'name slug')
    .limit(8);
  res.json({ success: true, products });
};

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  const slug = slugify(req.body.name, { lower: true, strict: true });
  const product = await Product.create({ ...req.body, slug });
  res.status(201).json({ success: true, product });
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  if (req.body.name) {
    req.body.slug = slugify(req.body.name, { lower: true, strict: true });
  }
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true, runValidators: true,
  });
  if (!product) { res.status(404).json({ success: false, message: 'Product not found' }); return; }
  res.json({ success: true, product });
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false });
  if (!product) { res.status(404).json({ success: false, message: 'Product not found' }); return; }
  res.json({ success: true, message: 'Product removed' });
};

export const getAdminProducts = async (req: Request, res: Response): Promise<void> => {
  const { page = 1, limit = 20, search } = req.query;
  const filter: Record<string, unknown> = {};
  if (search) filter.$text = { $search: search as string };
  const skip = (Number(page) - 1) * Number(limit);
  const [products, total] = await Promise.all([
    Product.find(filter).populate('category', 'name').sort('-createdAt').skip(skip).limit(Number(limit)),
    Product.countDocuments(filter),
  ]);
  res.json({ success: true, products, total });
};
