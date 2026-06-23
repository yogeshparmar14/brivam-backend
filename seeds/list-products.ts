import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import Product from '../src/models/Product';

async function list() {
  await mongoose.connect(process.env.MONGODB_URI!);
  const products = await Product.find({}, 'name slug');
  if (products.length === 0) {
    console.log('No products in database.');
  } else {
    products.forEach(p => console.log(`${p.slug} | ${p.name}`));
  }
  await mongoose.disconnect();
}

list().catch(console.error);
