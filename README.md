# OJAM Backend

Express + TypeScript REST API for OJAM protein supplement eCommerce store.

## Tech Stack

- **Runtime** — Node.js + Express
- **Language** — TypeScript
- **Database** — MongoDB Atlas (Mongoose)
- **Auth** — JWT (HTTP-only cookies)
- **Payments** — Razorpay
- **Images** — Cloudinary
- **Security** — Helmet, CORS, Rate Limiting

## Prerequisites

- Node.js 18+
- MongoDB Atlas account
- Razorpay account (for payments)
- Cloudinary account (for product images)

## Setup

### 1. Clone the repo

```bash
git clone git@github.com:yogeshparmar14/ojam-backend.git
cd ojam-backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env`:

```env
PORT=5000
NODE_ENV=development

# MongoDB Atlas — direct connection string (recommended on Windows)
MONGODB_URI=mongodb://username:password@shard-00-00.xxxxx.mongodb.net:27017,shard-00-01.xxxxx.mongodb.net:27017,shard-00-02.xxxxx.mongodb.net:27017/ojam?authSource=admin&tls=true&retryWrites=true&w=majority

# JWT
JWT_SECRET=your_strong_secret_here
JWT_EXPIRE=30d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

> **MongoDB Atlas note:** If `mongodb+srv://` fails with DNS errors on Windows, use the direct connection string with all 3 shard hosts as shown above.

> **Network Access:** Make sure your IP is whitelisted in Atlas → Security → Network Access. For development, add `0.0.0.0/0`.

### 4. Seed the database

Creates 6 categories, 5 sample products, and an admin user.

```bash
npm run seed
```

Admin credentials after seeding:
- Email: `admin@ojam.in`
- Password: `Admin@123`

### 5. Run the development server

```bash
npm run dev
```

API runs on [http://localhost:5000](http://localhost:5000)

Test it: [http://localhost:5000/api/health](http://localhost:5000/api/health)

## Build for Production

```bash
npm run build
npm start
```

## API Endpoints

### Auth
| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/me` | Update profile |
| PUT | `/api/auth/me/password` | Change password |
| POST | `/api/auth/me/addresses` | Add address |
| DELETE | `/api/auth/me/addresses/:id` | Remove address |

### Products
| Method | Route | Description |
|---|---|---|
| GET | `/api/products` | List products (filter, sort, paginate) |
| GET | `/api/products/featured` | Featured products |
| GET | `/api/products/:slug` | Single product |
| POST | `/api/products` | Create product (admin) |
| PUT | `/api/products/:id` | Update product (admin) |
| DELETE | `/api/products/:id` | Remove product (admin) |

### Orders
| Method | Route | Description |
|---|---|---|
| POST | `/api/orders` | Place order |
| POST | `/api/orders/verify-payment` | Verify Razorpay payment |
| GET | `/api/orders/my` | My orders |
| GET | `/api/orders/my/:id` | Single order |
| GET | `/api/orders` | All orders (admin) |
| GET | `/api/orders/stats` | Revenue stats (admin) |
| PUT | `/api/orders/:id/status` | Update order status (admin) |

### Cart
| Method | Route | Description |
|---|---|---|
| GET | `/api/cart` | Get cart |
| POST | `/api/cart/add` | Add item |
| PUT | `/api/cart/update` | Update quantity |
| DELETE | `/api/cart/item/:sku` | Remove item |
| POST | `/api/cart/coupon` | Apply coupon |
| DELETE | `/api/cart/clear` | Clear cart |

### Other
| Route | Description |
|---|---|
| `/api/categories` | CRUD categories |
| `/api/coupons` | CRUD coupons (admin) |
| `/api/users` | Manage users (admin) |
| `/api/products/:id/reviews` | Product reviews |

## Project Structure

```
src/
├── config/         # DB, Cloudinary, Razorpay setup
├── controllers/    # Route handler logic
├── middleware/     # Auth, error handler, file upload
├── models/         # Mongoose schemas
├── routes/         # Express routers
└── types/          # TypeScript interfaces
seeds/
└── products.ts     # Database seed script
```
