import { Response } from 'express';
import Cart from '../models/Cart';
import Product from '../models/Product';
import Coupon from '../models/Coupon';
import { AuthRequest } from '../types';

export const getCart = async (req: AuthRequest, res: Response): Promise<void> => {
  const cart = await Cart.findOne({ user: req.user!._id });
  res.json({ success: true, cart: cart || { items: [] } });
};

export const addToCart = async (req: AuthRequest, res: Response): Promise<void> => {
  const { productId, variantSku, quantity = 1 } = req.body;
  const product = await Product.findById(productId);
  if (!product) { res.status(404).json({ success: false, message: 'Product not found' }); return; }

  const variant = product.variants.find(v => v.sku === variantSku);
  if (!variant) { res.status(404).json({ success: false, message: 'Variant not found' }); return; }
  if (variant.stock < quantity) { res.status(400).json({ success: false, message: 'Insufficient stock' }); return; }

  let cart = await Cart.findOne({ user: req.user!._id });
  if (!cart) {
    cart = await Cart.create({ user: req.user!._id, items: [] });
  }

  const existingIndex = cart.items.findIndex(
    item => String(item.product) === productId && item.variantSku === variantSku
  );

  if (existingIndex > -1) {
    cart.items[existingIndex].quantity = Math.min(
      cart.items[existingIndex].quantity + quantity,
      variant.stock
    );
  } else {
    cart.items.push({
      product: product._id,
      variantSku,
      flavor: variant.flavor,
      weight: variant.weight,
      quantity,
      price: variant.price,
      mrp: variant.mrp,
      image: variant.images[0] || product.images[0] || '',
      name: product.name,
    });
  }

  await cart.save();
  res.json({ success: true, cart });
};

export const updateCartItem = async (req: AuthRequest, res: Response): Promise<void> => {
  const { variantSku, quantity } = req.body;
  const cart = await Cart.findOne({ user: req.user!._id });
  if (!cart) { res.status(404).json({ success: false, message: 'Cart not found' }); return; }

  const item = cart.items.find(i => i.variantSku === variantSku);
  if (!item) { res.status(404).json({ success: false, message: 'Item not in cart' }); return; }

  if (quantity <= 0) {
    cart.items = cart.items.filter(i => i.variantSku !== variantSku);
  } else {
    item.quantity = quantity;
  }
  await cart.save();
  res.json({ success: true, cart });
};

export const removeFromCart = async (req: AuthRequest, res: Response): Promise<void> => {
  const cart = await Cart.findOne({ user: req.user!._id });
  if (!cart) { res.status(404).json({ success: false, message: 'Cart not found' }); return; }
  cart.items = cart.items.filter(i => i.variantSku !== req.params.sku);
  await cart.save();
  res.json({ success: true, cart });
};

export const applyCoupon = async (req: AuthRequest, res: Response): Promise<void> => {
  const { code } = req.body;
  const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
  if (!coupon) { res.status(404).json({ success: false, message: 'Invalid coupon code' }); return; }
  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    res.status(400).json({ success: false, message: 'Coupon expired' }); return;
  }
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    res.status(400).json({ success: false, message: 'Coupon usage limit reached' }); return;
  }

  const cart = await Cart.findOneAndUpdate(
    { user: req.user!._id },
    { coupon: coupon._id },
    { new: true }
  );
  res.json({ success: true, cart, coupon });
};

export const clearCart = async (req: AuthRequest, res: Response): Promise<void> => {
  const cart = await Cart.findOneAndUpdate(
    { user: req.user!._id },
    { $set: { items: [] }, $unset: { coupon: '' } },
    { new: true }
  );
  res.json({ success: true, cart: cart || { items: [] } });
};
