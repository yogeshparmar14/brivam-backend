/**
 * Seed: OJAM Unflavoured Whey Protein 1kg
 *
 * Usage:
 *   npx ts-node seeds/add-unflavoured-whey.ts
 *
 * Images are passed in via PRODUCT_IMAGES env var (comma-separated URLs) or
 * left empty to be added later via the admin panel.
 */
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import mongoose from 'mongoose';
import slugify from 'slugify';

const MONGODB_URI = process.env.MONGODB_URI!;

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  const db = mongoose.connection.db!;

  // Find or create Whey Protein category
  let category = await db.collection('categories').findOne({ slug: 'whey-protein' });
  if (!category) {
    const result = await db.collection('categories').insertOne({
      name: 'Whey Protein',
      slug: 'whey-protein',
      description: 'Premium whey protein supplements for muscle building and recovery.',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    category = { _id: result.insertedId, slug: 'whey-protein' };
    console.log('Created "Whey Protein" category');
  } else {
    console.log('Found existing "Whey Protein" category:', category._id);
  }

  // Image URLs — either from env or empty (to be added via admin panel)
  const imageUrls: string[] = process.env.PRODUCT_IMAGES
    ? process.env.PRODUCT_IMAGES.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  const name = 'OJAM Unflavoured Whey Protein – 1kg';
  const slug = slugify(name, { lower: true, strict: true });

  const existing = await db.collection('products').findOne({ slug });
  if (existing) {
    console.log('Product already exists, updating images…');
    await db.collection('products').updateOne(
      { slug },
      { $set: { images: imageUrls, updatedAt: new Date() } }
    );
    console.log('Images updated.');
    await mongoose.disconnect();
    return;
  }

  const product = {
    name,
    slug,
    brand: 'OJAM',
    category: category._id,
    shortDescription: '25g pure whey protein per serving. Zero fillers, zero sugar, 100% clean label. FSSAI certified. Lab tested.',
    description: `
      <p>OJAM Unflavoured Whey Protein is the cleanest, most versatile protein you can find. Made from premium whey concentrate sourced from certified dairy farms, every 33g scoop delivers <strong>25g of high-quality protein</strong> to fuel muscle recovery and growth.</p>
      <p>Unflavoured means no artificial sweeteners, no colours, no flavours — just pure protein. Mix it in your morning smoothie, chai, or dal and you won't even taste it.</p>
      <ul>
        <li>25g protein per 33g serving</li>
        <li>5g BCAAs including 2.7g Leucine</li>
        <li>Zero added sugar</li>
        <li>Zero artificial flavours or colours</li>
        <li>Digestive enzymes for better absorption</li>
        <li>FSSAI certified manufacturing</li>
        <li>Third-party lab tested for purity and protein content</li>
      </ul>
    `.trim(),
    variants: [
      {
        flavor: 'Unflavoured',
        weight: '1kg',
        sku: 'OJAM-WHY-UNF-1KG',
        price: 1999,
        mrp: 2499,
        stock: 100,
        images: imageUrls,
      },
    ],
    images: imageUrls,
    tags: ['whey protein', 'unflavoured', 'clean protein', 'no sugar', 'fssai', 'lab tested'],
    benefits: [
      '25g protein per serving (33g scoop)',
      'Zero added sugar — suitable for diabetics',
      'FSSAI certified & GMP compliant',
      'Third-party lab tested for purity',
      'Digestive enzymes for better absorption',
      'Mix with anything — completely tasteless',
      '5g BCAAs per serving including 2.7g Leucine',
    ],
    howToUse: 'Mix 1 scoop (33g) with 200–250 ml of cold water or milk. Shake well for 30 seconds. Best consumed within 30 minutes post-workout or as directed by your nutritionist. Can also be added to smoothies, oats, or recipes.',
    ingredients: 'Whey Protein Concentrate (Milk), Digestive Enzyme Blend (Protease, Lactase).',
    nutritionFacts: [
      { label: 'Energy (Kcal)', perServing: '124', per100g: '375.76' },
      { label: 'Protein (g)', perServing: '25.0', per100g: '75.76' },
      { label: 'Carbohydrates (g)', perServing: '3.5', per100g: '10.60' },
      { label: 'Total Sugar (g)', perServing: '1.5', per100g: '4.54' },
      { label: 'Added Sugar (g)', perServing: '0.00', per100g: '0.00' },
      { label: 'Total Fat (g)', perServing: '1.8', per100g: '5.45' },
      { label: 'Saturated Fat (g)', perServing: '0.6', per100g: '1.82' },
      { label: 'Trans Fat (g)', perServing: '0.00', per100g: '0.00' },
      { label: 'Cholesterol (mg)', perServing: '40', per100g: '121.21' },
      { label: 'Dietary Fibre (g)', perServing: '0.00', per100g: '0.00' },
      { label: 'Sodium (mg)', perServing: '65', per100g: '196.96' },
      { label: 'BCAA (g)', perServing: '5.5', per100g: '16.66' },
      { label: 'EAA (g)', perServing: '10.0', per100g: '30.30' },
    ],
    isFeatured: true,
    isActive: true,
    averageRating: 0,
    reviewCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await db.collection('products').insertOne(product);
  console.log(`✅  Product created: "${name}" (slug: ${slug})`);
  if (imageUrls.length) {
    console.log(`    Images: ${imageUrls.length} uploaded`);
  } else {
    console.log('    ⚠️  No images set — add them via the admin panel after uploading to S3.');
  }

  await mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });
