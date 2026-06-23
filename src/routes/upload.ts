import { Router, Request, Response } from 'express';
import multer from 'multer';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import s3 from '../config/s3';
import { protect, adminOnly } from '../middleware/auth';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Only jpg, png, webp images are allowed'));
  },
});

router.post('/', protect, adminOnly, upload.single('image'), async (req: Request, res: Response): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ success: false, message: 'No file uploaded' });
    return;
  }

  const bucket = process.env.AWS_S3_BUCKET!;
  const ext = path.extname(req.file.originalname).toLowerCase();
  const key = `products/${uuidv4()}${ext}`;

  await s3.send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: req.file.buffer,
    ContentType: req.file.mimetype,
  }));

  const cloudfrontDomain = process.env.CLOUDFRONT_DOMAIN!;
  const url = `https://${cloudfrontDomain}/${key}`;

  res.json({ success: true, url });
});

export default router;
