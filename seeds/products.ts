import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import Category from '../src/models/Category';
import Product from '../src/models/Product';
import User from '../src/models/User';

const categories = [
  { name: 'Whey Protein', slug: 'whey-protein', description: 'Fast-absorbing whey protein for muscle recovery and growth.' },
  { name: 'Plant Protein', slug: 'plant-protein', description: 'Vegan-friendly complete protein from plant sources.' },
  { name: 'Mass Gainer', slug: 'mass-gainer', description: 'High-calorie formula designed for serious muscle building.' },
  { name: 'Creatine', slug: 'creatine', description: 'Pure creatine monohydrate for strength and power.' },
  { name: 'Pre-Workout', slug: 'pre-workout', description: 'Energy and focus formula for intense training sessions.' },
  { name: 'Vitamins', slug: 'vitamins', description: 'Essential vitamins and minerals for overall health.' },
];

const products = [
  {
    name: 'BRIVAM Whey Protein Isolate - Chocolate',
    slug: 'brivam-whey-protein-isolate-chocolate',
    shortDescription: '27g protein per serving | <1g fat | Instantized for smooth mixability',
    description: '<p>BRIVAM Whey Protein Isolate is our premium protein formula, delivering 27g of pure whey protein isolate per serving with minimal carbs and fat. Engineered for serious athletes who demand the best.</p><p>Our advanced filtration process removes excess fat, lactose, and carbs, leaving you with a pure, fast-absorbing protein that gets to your muscles when they need it most.</p>',
    categorySlug: 'whey-protein',
    brand: 'BRIVAM',
    variants: [
      { flavor: 'Chocolate Fudge', weight: '1kg', sku: 'BRV-WPI-CHO-1KG', price: 2499, mrp: 3199, stock: 150, images: [] },
      { flavor: 'Vanilla Cream', weight: '1kg', sku: 'BRV-WPI-VAN-1KG', price: 2499, mrp: 3199, stock: 120, images: [] },
      { flavor: 'Strawberry', weight: '1kg', sku: 'BRV-WPI-STR-1KG', price: 2499, mrp: 3199, stock: 80, images: [] },
      { flavor: 'Chocolate Fudge', weight: '2kg', sku: 'BRV-WPI-CHO-2KG', price: 4599, mrp: 5999, stock: 90, images: [] },
    ],
    images: [],
    tags: ['whey', 'isolate', 'protein', 'muscle', 'lean'],
    nutritionFacts: [
      { label: 'Calories', perServing: '130 kcal', per100g: '380 kcal' },
      { label: 'Protein', perServing: '27g', per100g: '79g' },
      { label: 'Carbohydrates', perServing: '2.5g', per100g: '7g' },
      { label: 'Fat', perServing: '0.8g', per100g: '2.2g' },
      { label: 'BCAAs', perServing: '5.5g', per100g: '—' },
      { label: 'Glutamine', perServing: '4.2g', per100g: '—' },
    ],
    howToUse: 'Mix 1 scoop (34g) with 200-250ml cold water or milk. Consume within 30 minutes post-workout for best results.',
    ingredients: 'Whey Protein Isolate, Cocoa Powder, Natural & Artificial Flavors, Sucralose, Sunflower Lecithin, Digestive Enzyme Blend (Amylase, Protease, Lactase)',
    benefits: [
      '27g pure whey protein isolate per serving',
      'Less than 1g fat per serving',
      'Only 2.5g carbohydrates',
      'Contains 5.5g BCAAs for muscle recovery',
      'Added digestive enzymes for better absorption',
      'Instantized for easy mixing',
    ],
    isFeatured: true,
  },
  {
    name: 'BRIVAM Whey Protein Concentrate - Double Chocolate',
    slug: 'brivam-whey-protein-concentrate-chocolate',
    shortDescription: '24g protein per serving | Great taste | Perfect for everyday use',
    description: '<p>BRIVAM Whey Protein Concentrate delivers 24g of quality protein per serving at an accessible price point. Ideal for athletes who want consistent protein intake without compromising on quality or taste.</p>',
    categorySlug: 'whey-protein',
    brand: 'BRIVAM',
    variants: [
      { flavor: 'Double Chocolate', weight: '1kg', sku: 'BRV-WPC-DC-1KG', price: 1799, mrp: 2299, stock: 200, images: [] },
      { flavor: 'Banana Caramel', weight: '1kg', sku: 'BRV-WPC-BAN-1KG', price: 1799, mrp: 2299, stock: 150, images: [] },
      { flavor: 'Double Chocolate', weight: '2kg', sku: 'BRV-WPC-DC-2KG', price: 3299, mrp: 4199, stock: 100, images: [] },
    ],
    images: [],
    tags: ['whey', 'concentrate', 'protein', 'muscle'],
    nutritionFacts: [
      { label: 'Calories', perServing: '160 kcal', per100g: '400 kcal' },
      { label: 'Protein', perServing: '24g', per100g: '60g' },
      { label: 'Carbohydrates', perServing: '8g', per100g: '20g' },
      { label: 'Fat', perServing: '3.5g', per100g: '8.7g' },
    ],
    howToUse: 'Mix 1 scoop (40g) with 250ml water or milk. Consume 2-3 servings daily.',
    benefits: [
      '24g protein per serving',
      'Rich in essential amino acids',
      'Great taste, mixes easily',
      'Value for money',
    ],
    isFeatured: true,
  },
  {
    name: 'BRIVAM Plant Protein - Pea & Rice Blend',
    slug: 'brivam-plant-protein-pea-rice',
    shortDescription: '22g complete plant protein | Vegan | Easy to digest',
    description: '<p>Our Plant Protein blends pea protein isolate and brown rice protein to deliver a complete amino acid profile in a 100% vegan formula. No compromise on quality, taste, or results.</p>',
    categorySlug: 'plant-protein',
    brand: 'BRIVAM',
    variants: [
      { flavor: 'Chocolate', weight: '1kg', sku: 'BRV-PLP-CHO-1KG', price: 2199, mrp: 2799, stock: 100, images: [] },
      { flavor: 'Vanilla', weight: '1kg', sku: 'BRV-PLP-VAN-1KG', price: 2199, mrp: 2799, stock: 80, images: [] },
    ],
    images: [],
    tags: ['plant', 'vegan', 'protein', 'pea', 'rice'],
    nutritionFacts: [
      { label: 'Calories', perServing: '140 kcal', per100g: '' },
      { label: 'Protein', perServing: '22g', per100g: '' },
      { label: 'Carbohydrates', perServing: '5g', per100g: '' },
      { label: 'Fat', perServing: '2g', per100g: '' },
    ],
    howToUse: 'Mix 1 scoop with 250ml water or plant-based milk.',
    benefits: ['100% vegan', '22g complete protein', 'All 9 essential amino acids', 'Easy to digest', 'Soy-free'],
    isFeatured: true,
  },
  {
    name: 'BRIVAM Creatine Monohydrate',
    slug: 'brivam-creatine-monohydrate',
    shortDescription: '5g pure creatine per serving | Micronized | Unflavoured',
    description: '<p>Pure micronized creatine monohydrate. No additives, no fillers, just 5g of the most researched sports nutrition ingredient per serving.</p>',
    categorySlug: 'creatine',
    brand: 'BRIVAM',
    variants: [
      { flavor: 'Unflavoured', weight: '300g', sku: 'BRV-CRE-UNF-300G', price: 699, mrp: 899, stock: 300, images: [] },
      { flavor: 'Unflavoured', weight: '500g', sku: 'BRV-CRE-UNF-500G', price: 999, mrp: 1299, stock: 200, images: [] },
    ],
    images: [],
    tags: ['creatine', 'strength', 'power', 'performance'],
    nutritionFacts: [
      { label: 'Calories', perServing: '0 kcal', per100g: '' },
      { label: 'Creatine Monohydrate', perServing: '5000mg', per100g: '' },
    ],
    howToUse: 'Mix 1 scoop (5g) with water or juice. Take post-workout or with meals.',
    benefits: ['5g pure creatine monohydrate', 'Increases strength and power', 'Supports muscle volume', 'Third-party tested'],
    isFeatured: false,
  },
  {
    name: 'BRIVAM Mass Gainer Pro',
    slug: 'brivam-mass-gainer-pro',
    shortDescription: '1000 calories | 35g protein | For serious bulking',
    description: '<p>BRIVAM Mass Gainer Pro is engineered for hardgainers who struggle to consume enough calories. With 1000 calories and 35g protein per serving, it helps you build serious size.</p>',
    categorySlug: 'mass-gainer',
    brand: 'BRIVAM',
    variants: [
      { flavor: 'Chocolate', weight: '3kg', sku: 'BRV-MG-CHO-3KG', price: 2799, mrp: 3599, stock: 80, images: [] },
      { flavor: 'Vanilla', weight: '3kg', sku: 'BRV-MG-VAN-3KG', price: 2799, mrp: 3599, stock: 60, images: [] },
    ],
    images: [],
    tags: ['mass gainer', 'bulking', 'calories', 'weight gain'],
    nutritionFacts: [
      { label: 'Calories', perServing: '1000 kcal', per100g: '' },
      { label: 'Protein', perServing: '35g', per100g: '' },
      { label: 'Carbohydrates', perServing: '170g', per100g: '' },
      { label: 'Fat', perServing: '8g', per100g: '' },
    ],
    howToUse: 'Mix 3 scoops (300g) with 500ml full-fat milk. Take between meals or post-workout.',
    benefits: ['1000 calories per serving', '35g protein for muscle growth', 'Complex carbs for sustained energy', 'Added vitamins and minerals'],
    isFeatured: true,
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI!);
  console.log('Connected to MongoDB');

  // Clean existing
  await Category.deleteMany({});
  await Product.deleteMany({});

  // Create admin user if not exists
  const adminExists = await User.findOne({ email: 'admin@brivam.in' });
  if (!adminExists) {
    await User.create({
      name: 'BRIVAM Admin',
      email: 'admin@brivam.in',
      password: 'Admin@123',
      role: 'admin',
    });
    console.log('Admin user created: admin@brivam.in / Admin@123');
  }

  // Create categories
  const createdCategories = await Category.insertMany(categories);
  console.log(`Created ${createdCategories.length} categories`);

  const catMap = Object.fromEntries(createdCategories.map(c => [c.slug, c._id]));

  // Create products
  for (const p of products) {
    const { categorySlug, ...rest } = p;
    await Product.create({ ...rest, category: catMap[categorySlug] });
  }
  console.log(`Created ${products.length} products`);

  await mongoose.disconnect();
  console.log('Seed completed!');
}

seed().catch(console.error);
