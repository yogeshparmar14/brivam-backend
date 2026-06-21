import { Response, Request } from 'express';
import crypto from 'crypto';
import Order from '../models/Order';
import Cart from '../models/Cart';
import Coupon from '../models/Coupon';
import Product from '../models/Product';
import razorpay from '../config/razorpay';
import { AuthRequest } from '../types';

const SHIPPING_THRESHOLD = 999;
const SHIPPING_CHARGE = 79;

export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  const { shippingAddress, paymentMethod, notes } = req.body;
  const cart = await Cart.findOne({ user: req.user!._id }).populate('coupon');
  if (!cart || cart.items.length === 0) {
    res.status(400).json({ success: false, message: 'Cart is empty' }); return;
  }

  let subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  let discount = 0;

  if (cart.coupon) {
    const coupon = cart.coupon as unknown as { type: string; value: number; minOrderValue: number; maxDiscount?: number; _id: unknown; code: string };
    if (subtotal >= coupon.minOrderValue) {
      if (coupon.type === 'percentage') {
        discount = (subtotal * coupon.value) / 100;
        if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
      } else {
        discount = coupon.value;
      }
      await Coupon.findByIdAndUpdate(coupon._id, { $inc: { usedCount: 1 } });
    }
  }

  const afterDiscount = subtotal - discount;
  const shippingCharge = afterDiscount >= SHIPPING_THRESHOLD ? 0 : SHIPPING_CHARGE;
  const total = afterDiscount + shippingCharge;

  const order = await Order.create({
    user: req.user!._id,
    items: cart.items.map(i => ({
      product: i.product,
      name: i.name,
      image: i.image,
      variantSku: i.variantSku,
      flavor: i.flavor,
      weight: i.weight,
      quantity: i.quantity,
      price: i.price,
      mrp: i.mrp,
    })),
    shippingAddress,
    paymentMethod,
    subtotal,
    discount,
    shippingCharge,
    total,
    notes,
    couponCode: cart.coupon ? (cart.coupon as unknown as { code: string }).code : undefined,
  });

  for (const item of cart.items) {
    await Product.findOneAndUpdate(
      { _id: item.product, 'variants.sku': item.variantSku },
      { $inc: { 'variants.$.stock': -item.quantity } }
    );
  }

  if (paymentMethod === 'razorpay') {
    const rzpOrder = await razorpay.orders.create({
      amount: Math.round(total * 100),
      currency: 'INR',
      receipt: order.orderNumber,
    });
    order.razorpayOrderId = rzpOrder.id;
    await order.save();
    await Cart.findOneAndUpdate({ user: req.user!._id }, { items: [], coupon: undefined });
    res.status(201).json({ success: true, order, razorpayOrderId: rzpOrder.id });
    return;
  }

  await Cart.findOneAndUpdate({ user: req.user!._id }, { items: [], coupon: undefined });
  res.status(201).json({ success: true, order });
};

export const verifyPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
  const body = razorpayOrderId + '|' + razorpayPaymentId;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest('hex');

  if (expectedSignature !== razorpaySignature) {
    res.status(400).json({ success: false, message: 'Invalid payment signature' }); return;
  }

  const order = await Order.findOneAndUpdate(
    { razorpayOrderId },
    { razorpayPaymentId, paymentStatus: 'paid', orderStatus: 'confirmed' },
    { new: true }
  );
  res.json({ success: true, order });
};

export const getMyOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);
  const [orders, total] = await Promise.all([
    Order.find({ user: req.user!._id }).sort('-createdAt').skip(skip).limit(Number(limit)),
    Order.countDocuments({ user: req.user!._id }),
  ]);
  res.json({ success: true, orders, total });
};

export const getOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user!._id });
  if (!order) { res.status(404).json({ success: false, message: 'Order not found' }); return; }
  res.json({ success: true, order });
};

export const getAllOrders = async (req: Request, res: Response): Promise<void> => {
  const { page = 1, limit = 20, status } = req.query;
  const filter: Record<string, unknown> = {};
  if (status) filter.orderStatus = status;
  const skip = (Number(page) - 1) * Number(limit);
  const [orders, total] = await Promise.all([
    Order.find(filter).populate('user', 'name email').sort('-createdAt').skip(skip).limit(Number(limit)),
    Order.countDocuments(filter),
  ]);
  res.json({ success: true, orders, total });
};

export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  const { orderStatus, trackingNumber } = req.body;
  const update: Record<string, unknown> = { orderStatus };
  if (trackingNumber) update.trackingNumber = trackingNumber;
  if (orderStatus === 'delivered') update.deliveredAt = new Date();
  const order = await Order.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!order) { res.status(404).json({ success: false, message: 'Order not found' }); return; }
  res.json({ success: true, order });
};

export const getAdminStats = async (_req: Request, res: Response): Promise<void> => {
  const [totalOrders, totalRevenue, pendingOrders, totalUsers] = await Promise.all([
    Order.countDocuments(),
    Order.aggregate([{ $match: { paymentStatus: 'paid' } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
    Order.countDocuments({ orderStatus: { $in: ['placed', 'confirmed', 'processing'] } }),
    (await import('../models/User')).default.countDocuments({ role: 'user' }),
  ]);

  const revenueByMonth = await Order.aggregate([
    { $match: { paymentStatus: 'paid' } },
    {
      $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        revenue: { $sum: '$total' },
        orders: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
    { $limit: 12 },
  ]);

  res.json({
    success: true,
    stats: {
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      pendingOrders,
      totalUsers,
      revenueByMonth,
    },
  });
};
