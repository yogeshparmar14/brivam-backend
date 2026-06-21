import { Request, Response } from 'express';
import User from '../models/User';

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  const { page = 1, limit = 20, search } = req.query;
  const filter: Record<string, unknown> = {};
  if (search) filter.$or = [
    { name: { $regex: search, $options: 'i' } },
    { email: { $regex: search, $options: 'i' } },
  ];
  const skip = (Number(page) - 1) * Number(limit);
  const [users, total] = await Promise.all([
    User.find(filter).sort('-createdAt').skip(skip).limit(Number(limit)),
    User.countDocuments(filter),
  ]);
  res.json({ success: true, users, total });
};

export const toggleUserStatus = async (req: Request, res: Response): Promise<void> => {
  const user = await User.findById(req.params.id);
  if (!user) { res.status(404).json({ success: false, message: 'User not found' }); return; }
  user.isActive = !user.isActive;
  await user.save();
  res.json({ success: true, user });
};
