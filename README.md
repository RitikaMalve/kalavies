# KALAVIES Jewellery — Full-Stack E-commerce & Admin PWA

A modern, responsive, mobile-first **Jewellery E-commerce Platform with an Admin Control Panel and Customer Storefront / PWA** for fine oxidised silver, antique kundan, and contemporary artificial jewellery.

Built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS**, **Prisma ORM**, and **PWA Service Worker**.

---

## 🌟 Key Capabilities & Features

### 1. Customer Storefront
- **Dynamic Homepage**: Hero promotional banners, category highlights, Trending Now, Bestsellers, New Arrivals, Testimonials, and Newsletter subscription.
- **Product Catalog & Search (`/products`)**:
  - Filter by category, subcategories, price range, material, color, and availability.
  - Multi-attribute combinations with active count and one-click reset.
  - Sort by Newest, Most Popular/Bestselling, Price: Low to High, Price: High to Low.
  - Responsive product cards with discount badges, wishlist toggle, and quick add-to-bag.
- **Product Details (`/products/[slug]`)**:
  - Interactive multi-image gallery with zoom and thumbnails.
  - Real-time variant selector (sizes, colors) with live inventory limits.
  - Free delivery checker with 6-digit Indian pincode validator.
  - Care guide, specifications, and 7-day return policy tabs.
  - "Pairs Beautifully With" similar items recommendation carousel.
- **Shopping Bag & Cart Drawer (`/cart`)**:
  - Flyout cart slide-over and dedicated cart page.
  - Free shipping progress bar (e.g. *"Add ₹150 more for FREE shipping"*).
  - Coupon code redemption with immediate savings calculation.
- **Secure Transactional Checkout (`/checkout`)**:
  - Customer shipping address capture (Home, Work, Landmark).
  - Cash on Delivery (COD) and Online Payment options.
  - Transactional inventory deduction preventing overselling.
- **Order Tracking & Tax Invoices (`/orders/[id]`)**:
  - Step-by-step fulfillment tracker (Confirmed → Crafting & Packing → Shipped → Delivered).
  - Printable and downloadable official GST Tax Invoices.
- **Customer Account & Wishlist (`/account`, `/wishlist`)**:
  - Order history with line items and invoices.
  - Saved wishlist with 1-click move to shopping bag.

---

### 2. Admin Control Panel (`/admin`)
- **Executive Dashboard**:
  - Live revenue analytics, total orders, active products, and customer counts.
  - Pending orders alert and recent order stream.
  - Low stock warning board with alert thresholds.
- **Category & Subcategory Hierarchy (`/admin/categories`)**:
  - Unlimited nested categories & subcategories (Oxidised → Earrings, Necklaces, Bangles, Rings, Anklets, etc.).
  - Reordering, activation toggling, and slug management.
- **Product Catalog Management (`/admin/products`)**:
  - Complete CRUD with variants (SKU, size, color, price, stock).
  - MRP, Selling Price, and automated margin calculations.
  - Badges: Featured, Trending, Bestseller, and New Arrival.
- **Real-Time Inventory & Stock Movement (`/admin/inventory`)**:
  - Restock batches, damaged stock write-offs, and manual adjustments.
  - Audit log recording dates, quantities, and admin identity.
- **Discounts, Coupons & Shipping (`/admin/discounts`)**:
  - Percentage and flat cash coupons with minimum order values and max caps.
  - Configurable free shipping threshold (default: ₹499) and flat rate.
- **Trending & Merchandising Rules (`/admin/trending`)**:
  - Hybrid, Automatic, and Manual ranking modes.
  - 1-click product merchandising badge toggles.
- **Homepage CMS & Banners (`/admin/banners`)**:
  - Manage hero slides, seasonal offers, and button CTA links.
  - Enable/disable homepage sections without code edits.
- **Order Fulfillment & Shipment Tracking (`/admin/orders`)**:
  - Status updates (Pending, Confirmed, Processing, Shipped, Delivered, Cancelled).
  - Cancelling orders automatically restores inventory back to stock.
  - Courier tracking number and tracking URL recording.
- **Tax Invoices & Billing (`/admin/invoices`)**:
  - Unique invoice numbers with auto-generated printable tax invoices.
- **Sales Analytics Reports (`/admin/reports`)**:
  - Gross sales, average order value (AOV), and top-selling pieces.
- **Business Identity & Policies (`/admin/settings`)**:
  - Store name, support email, phone, GSTIN, and return policies.

---

### 3. Progressive Web App (PWA)
- **Web App Manifest**: Configured at `/manifest.json` with brand colors (`#C9A84C`), shortcuts, and orientation.
- **Service Worker (`/sw.js`)**: Static caching strategy for offline resiliency.
- **Offline Fallback (`/offline`)**: User-friendly offline view when network is unavailable.
- **Installable**: Adds to Home Screen on iOS, Android, and Desktop Chrome/Edge.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js 18+ (tested with Node 20 & 26)
- npm or pnpm

### 2. Installation
```bash
# Clone and enter the workspace
cd kalavies

# Dependencies are already installed; to reinstall if needed:
npm install
```

### 3. Database Setup & Seeding
```bash
# Push schema to SQLite database (dev.db)
npx prisma db push

# Seed sample jewellery products, categories, coupons, and admin user:
npm run seed
```

### 4. Running the Application
```bash
# Start development server
npm run dev
```

Visit the application in your browser:
- **Storefront**: [http://localhost:3000](http://localhost:3000)
- **Admin Panel**: [http://localhost:3000/admin](http://localhost:3000/admin)
- **Sign In**: [http://localhost:3000/auth/login](http://localhost:3000/auth/login)

---

## 🔑 Default Credentials

| Role | Email | Password |
|---|---|---|
| **Store Administrator** | `admin@kalavies.com` | `Admin@123` |
| **Customer (Sample)** | `ananya@example.com` | Created upon checkout or sign-up |

*(On the login screen, click **"Fill Admin Credentials"** for instant 1-click login!)*

---

## 📂 Project Structure

```
kalavies/
├── prisma/
│   ├── schema.prisma        # Complete database schema (18 models)
│   ├── seed.ts              # Rich seed script (25 products, categories, coupons)
│   └── dev.db               # SQLite database file
├── public/
│   ├── KALAVIES_Jewellery_Logo.svg # Brand logo SVG
│   ├── manifest.json        # PWA Web App Manifest
│   ├── sw.js                # Service Worker for offline caching
│   └── images/              # Product and banner visuals
├── src/
│   ├── app/
│   │   ├── page.tsx         # Storefront Homepage
│   │   ├── layout.tsx       # Root layout + PWA + Providers
│   │   ├── globals.css      # Design tokens, palette & typography
│   │   ├── products/        # Product catalog & details ([slug])
│   │   ├── cart/            # Shopping bag
│   │   ├── checkout/        # Checkout flow & order placement
│   │   ├── orders/[id]/     # Order tracking & invoice view
│   │   ├── wishlist/        # Customer saved items
│   │   ├── account/         # Customer account dashboard
│   │   ├── auth/            # Sign in and register pages
│   │   ├── offline/         # PWA offline fallback
│   │   ├── admin/           # Complete Admin Panel pages:
│   │   │   ├── page.tsx     # Admin Dashboard
│   │   │   ├── products/    # Product CRUD + variant management
│   │   │   ├── categories/  # Hierarchical category tree
│   │   │   ├── inventory/   # Stock quantities & movements
│   │   │   ├── orders/      # Orders, status updater & tracking
│   │   │   ├── discounts/   # Coupons & shipping rules
│   │   │   ├── trending/    # Merchandising & algorithm mode
│   │   │   ├── banners/     # Homepage CMS banner slides
│   │   │   ├── customers/   # Registered customer directory
│   │   │   ├── invoices/    # Tax invoices billing table
│   │   │   ├── reports/     # Performance & sales metrics
│   │   │   └── settings/    # Store profile & return policy
│   │   └── api/             # RESTful API handlers
│   ├── components/
│   │   ├── admin/           # Admin shell, stats, forms, managers
│   │   ├── store/           # Header, footer, product cards, cart drawer
│   │   ├── ui/              # Buttons, inputs, badges, modals
│   │   └── shared/          # PWA service worker registration
│   ├── hooks/
│   │   ├── useCart.tsx      # Cart state provider & API sync
│   │   └── useWishlist.tsx  # Wishlist state provider & API sync
│   └── lib/
│       ├── prisma.ts        # Prisma client singleton
│       ├── auth.ts          # JWT session auth & RBAC
│       └── utils.ts         # Formatting (INR), order ID & invoice generators
```

---

## 💳 Payment & Production Configuration

To deploy to production with PostgreSQL and Razorpay:

1. Update `.env`:
```env
DATABASE_URL="postgresql://user:password@host:5432/kalavies?schema=public"
JWT_SECRET="generate-a-strong-random-secret"
RAZORPAY_KEY_ID="rzp_live_your_key_id"
RAZORPAY_KEY_SECRET="your_razorpay_secret"
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
```

2. In `prisma/schema.prisma`, update datasource provider to `postgresql`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

3. Run migrations:
```bash
npx prisma migrate deploy
```
