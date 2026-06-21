import { Request, Response } from 'express';
import User from '../models/User';
import { AuthRequest } from '../types';

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 30 * 24 * 60 * 60 * 1000,
};

export const register = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password, phone } = req.body;
  const existing = await User.findOne({ email });
  if (existing) {
    res.status(400).json({ success: false, message: 'Email already registered' });
    return;
  }
  const user = await User.create({ name, email, password, phone });
  const token = user.generateToken();
  res.cookie('token', token, cookieOptions);
  res.status(201).json({
    success: true,
    token,
    user: { _id: user._id, name: user.name, email: user.email, role: user.role },
  });
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    res.status(401).json({ success: false, message: 'Invalid email or password' });
    return;
  }
  if (!user.isActive) {
    res.status(403).json({ success: false, message: 'Account deactivated' });
    return;
  }
  const token = user.generateToken();
  res.cookie('token', token, cookieOptions);
  res.json({
    success: true,
    token,
    user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
  });
};

export const logout = (_req: Request, res: Response): void => {
  res.cookie('token', '', { ...cookieOptions, maxAge: 0 });
  res.json({ success: true, message: 'Logged out' });
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await User.findById(req.user!._id);
  res.json({ success: true, user });
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, phone } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user!._id,
    { name, phone },
    { new: true, runValidators: true }
  );
  res.json({ success: true, user });
};

export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user!._id).select('+password');
  if (!user || !(await user.comparePassword(currentPassword))) {
    res.status(400).json({ success: false, message: 'Current password is incorrect' });
    return;
  }
  user.password = newPassword;
  await user.save();
  res.json({ success: true, message: 'Password updated' });
};

export const addAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await User.findById(req.user!._id);
  if (!user) { res.status(404).json({ success: false, message: 'User not found' }); return; }
  if (req.body.isDefault) {
    user.addresses.forEach(a => { a.isDefault = false; });
  }
  user.addresses.push(req.body);
  await user.save();
  res.json({ success: true, addresses: user.addresses });
};

export const deleteAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await User.findById(req.user!._id);
  if (!user) { res.status(404).json({ success: false, message: 'User not found' }); return; }
  user.addresses = user.addresses.filter(a => String(a._id) !== req.params.addressId);
  await user.save();
  res.json({ success: true, addresses: user.addresses });
};
