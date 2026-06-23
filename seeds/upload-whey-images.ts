/**
 * Upload local product images to S3 and attach them to the Unflavoured Whey product.
 * Usage: npx ts-node seeds/upload-whey-images.ts
 */
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import fs from 'fs';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.AWS_S3_BUCKET!;
const CF_DOMAIN = process.env.CLOUDFRONT_DOMAIN!;
const MONGODB_URI = process.env.MONGODB_URI!;

const LOCAL_IMAGES = [
  'C:/Users/Mryor/Downloads/OJAM (4).png',   // Jar hero
  'C:/Users/Mryor/Downloads/OJAM (3).png',   // Feature / claims
  'C:/Users/Mryor/Downloads/OJAM (1).png',   // No more lost scoops
  'C:/Users/Mryor/Downloads/OJAM (2).png',   // No more lost scoops alt
  'C:/Users/Mryor/Downloads/Unflavoured_ECOM_1kg_NI.webp',  // Nutrition info
  'C:/Users/Mryor/Downloads/1kg_Unflavoured_Compare.webp',  // Compare chart
];

async function uploadFile(localPath: string): Promise<string> {
  const ext = path.extname(localPath).toLowerCase();
  const key = `products/ojam-unflavoured-whey/${uuidv4()}${ext}`;
  const body = fs.readFileSync(localPath);
  const mime: Record<string, string> = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
  };

  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: body,
    ContentType: mime[ext] || 'image/png',
  }));

  return `https://${CF_DOMAIN}/${key}`;
}

async function run() {
  console.log('Uploading images to S3…');
  const urls: string[] = [];

  for (const filePath of LOCAL_IMAGES) {
    if (!fs.existsSync(filePath)) {
      console.warn(`  ⚠️  File not found, skipping: ${filePath}`);
      continue;
    }
    const url = await uploadFile(filePath);
    urls.push(url);
    console.log(`  ✅ ${path.basename(filePath)} → ${url}`);
  }

  if (!urls.length) {
    console.error('No images uploaded. Check file paths.');
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db!;

  const result = await db.collection('products').updateOne(
    { slug: 'ojam-unflavoured-whey-protein-1kg' },
    {
      $set: {
        images: urls,
        'variants.$[].images': urls,
        updatedAt: new Date(),
      },
    }
  );

  if (result.matchedCount === 0) {
    console.error('Product not found in DB. Run add-unflavoured-whey.ts first.');
  } else {
    console.log(`\n✅ Product updated with ${urls.length} images.`);
  }

  await mongoose.disconnect();
}

run().catch(err => { console.error(err); process.exit(1); });
