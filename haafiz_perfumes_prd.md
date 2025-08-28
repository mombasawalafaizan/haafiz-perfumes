# Product Requirements Document (PRD)

**Perfume‑e‑Cart** — Indian e‑commerce for Perfumes & Attar

**Created:** August 4, 2025
**Stakeholder:** Haafiz Perfumes
**Author:** Faizan Mombasawala (Developer)

---

## 1. 🎯 Executive Summary

A modern e‑commerce site for a perfume business in India. Built using Next.js 15, shadcn/ui, and Tailwind CSS, the site allows users to browse products, add to cart, and place orders using Cash on Delivery (COD) or online transaction (via Razorpay). No login or authentication is required for customers (only for admin).

Images and product data are managed via Supabase (Postgres + Storage). Orders are created and stored in Supabase. A WhatsApp message is triggered immediately to the business owner upon order placement.
Shipping integration via BigShip is marked as optional and may be added later.

---

## 2. Objectives & Success Criteria

| Objective                                                          | Metric                                              |
| ------------------------------------------------------------------ | --------------------------------------------------- |
| 🛍️ Showcase products in SEO‑friendly fashion with fast load times | <3 s TTFB, Lighthouse SEO ≥ 85                      |
| 💳 Easy checkout with Indian payment flow                          | >50% of checkout initiations converted              |
| 📦 Reliable shipping integration                                   | BigShip shipping rates auto‑calculated 100% accuracy |
| 📱 Admin CRUD panel access via passkey (no login)                  | Orders managed within 30 min of placement           |
| 📣 WhatsApp notification                                           | Business and customer receives order details within \~5 seconds  |

Phase 1 includes public pages + cart + checkout + order notification. Phase 2 adds Admin Panel with secure passkey route and product/order management.

---

## 3. Audience & User Personas

* **Priya**, 23, shopper, mobile browser, views perfumes, adds to cart, pays via Razorpay, wants fast UI and readable URL, will get the WA or email notification on successful purchase (e.g. `/products/chanel-perfume`).
* **Rahul**, 30, business owner, wants to be notified via WhatsApp, manage product catalog, see orders CSV export.
* **Admin Staff**, occasional user, not technically skilled; only needs a passkey to CRUD products and check orders via simple UI.

---

## 4. User Journeys & Stories

### Customer (Unauthenticated)

1. Visitor lands on `/`, sees rotating carousel, best‑sellers, combo offers.
2. Clicks “Shop Perfumes” or carousel → `Collections` → selects `Perfumes`, `Attars`
3. Browses products; sees product card with image, MRP, discounted price, and **Add to Cart** button.
4. Clicks product → `/product/[slug]`, sees image gallery (zoom + carousel), variant selector (Standard/Premium/Luxury), fragrance family, description, price/MRP.
5. Adds variant to cart. State stored via **zustand** (browser only).
6. Proceeds to `/cart`, enters shipping + billing details (Indian addresses only), reviews order.
7. On checkout, Razorpay checkout popup appears (Indian currency INR).
8. On successful payment, stores order in Supabase orders table, triggers BigShip API call to create shipment (if API available), and sends WhatsApp message to owner with order summary.
9. Displays order confirmation page (including order ID) with “Thank you” message.

### Admin

1. Visits `/admin?passkey=XXX`, if passkey valid, loads basic UI: Products list, Orders list.
2. Creates product: fills name, slug, category, fragrance family, description, uploads images, sets pricing for each validity type (Standard, Premium, Luxury).
3. Edits or deletes existing product, including images and variants.
4. Views orders: sees order details (customer info, product SKUs, amount, payment status), exports CSV.
5. Optionally manually triggers shipment creation via BigShip API.

---

## 5. Schema & Data Model (PostgreSQL in Supabase)

### Tables:

#### 1. `products`

* `id UUID PRIMARY KEY`
* `name TEXT`
* `slug TEXT UNIQUE` (e.g. `luxury-gift-set-5-pcs-premium-perfume-spray`)
* `category product_category` (`perfume`, `attar`)
* `fragrance_family TEXT`
* `description TEXT`
* `top_notes TEXT`
* `middle_notes TEXT`
* `base_notes TEXT`
* `additional_notes TEXT`
* `mrp NUMERIC`
* `price NUMERIC`
* `created_at TIMESTAMP`

#### 2. `product_variants`

* `id UUID PRIMARY KEY`
* `product_id UUID REFERENCES products(id)`
* `product_quality` (`Standard`, `Premium`, `Luxury`)
* `price NUMERIC`
* `mrp NUMERIC`
* `stock INTEGER`
* `sku TEXT`
* `UNIQUE(product_id, quality)`

#### 3. `product_images`

* `id UUID PRIMARY KEY`
* `product_id UUID REFERENCES products(id)`
* `bucket_id TEXT` (e.g. `product-images`)
* `path TEXT`
* `public_url TEXT`
* `is_primary BOOLEAN`
* `uploaded_by UUID (auth.users.id)` optional
* `inserted_at TIMESTAMP`

#### 4. `orders`

* `id UUID PRIMARY KEY`
* `order_number TEXT UNIQUE` (e.g. `ORD-20250804-0001`)
* `customer_name TEXT`
* `customer_phone TEXT`
* `customer_email TEXT`
* `shipping_address JSONB` (street, city, pincode, state)
* `order_items JSONB` (list of `{ variant_id, quantity, price, mrp }`)
* `payment_mode TEXT CHECK` (payment_mode IN ('cod', 'razorpay'))
* `payment_status TEXT` (`pending`, `paid`, `failed`)
* `razorpay_order_id TEXT` (from API)
* `razorpay_payment_id TEXT`
* `shipping_status TEXT` (`pending`, `booked`, `shipped`, `delivered`)
* `bigship_awb TEXT` (AWB number from BigShip)
* `total_amount NUMERIC`
* `created_at TIMESTAMP`

> Supabase handles `storage.buckets` and `storage.objects` metadata automatically. Your `product_images` table references these uploads.

---

## 6. Tech Stack & System Architecture

```
┌────────────────────┐                   
│   Browser Client   │ <-- React / Next.js 15 (shadcn + Tailwind) + zustand
│                    │                   ┆
│    Public Pages    │ `/`, `/collections`, `/product/[slug]`, `/cart`
│   Admin UI (client-side, no NextAuth) │ `/admin?passkey=`  
└────────▲───────────┘                   │
         │                               │
    Supabase Auth (optional–only admin)  │
    Supabase PostgreSQL                  │
    Supabase Storage                     │
     – products / variants / images / orders │
         │                               │
 ┌───────┴────────────────────────────────────────┐
 │ Edge API (Next.js API routes or Edge Functions)│
 │ – CRUD product & variant endpoints (admin only)│
 │ – Cart & order construction logic               │
 │ – Razorpay payment signature verification       │
 │ – BigShip API call to create shipment and get AWB (optional) 
 │ – WhatsApp API call (Twilio or Quick.whatsapp.link) to notify seller and customer for order confirmation
 └─────────┬─────────────────────────────────────┘
           │
       Webhooks /
       Scheduled Jobs
```

* **Supabase** handles in-database and storage operations securely.
* **Razorpay** payment integration via [Razorpay Checkout](https://razorpay.com/docs/payments/integrations/)
* **BigShip** shipping integration using their REST API (likely `/api/v2/waybill`) for shipping rate & AWB creation.
* **WhatsApp** alert: either use **Twilio WhatsApp** or **QuickWhatsApp.link** API (HTTP POST) to send message to owner's phone.
* **State**: **zustand** for cart + session; no Redux needed.
* All UI styled via **Tailwind CSS**; interactive components via **shadcn/ui**.

---

## 7. Functional Requirements

### Public (no login/auth)

1. **Landing Page (`/`)**

   * Auto-sliding carousel (shadcn component with framer-motion/Swiper).
   * Sections:

     * Best‑sellers (top 5 products sorted by sales)
     * Combo offers (bundles created in admin)
     * Footer with basic links (About, Contact, Terms)

2. **Collections Page (`/collections`)**

   * Category cards (Perfume / Attar / Combo)
   * Each card is clickable → routes to listing page

3. **Product Listing Pages**

   * `/collections/perfumes`
   * `/collections/attars`
   * `/collections/combos`
   * Responsive grid of **Product Cards**:

     * Primary image
     * Product name
     * Fragrance family (optional)
     * Discounted price + crossed out MRP
     * “Add to Cart” button

4. **Product Detail Page (`/product/[slug]`)**

   * Image carousel with zoom-on-hover / pinch on mobile
   * Variant selector (Standard/Premium/Luxury) via quality enum dropdown (by default select first option)
   * Price, MRP, fragrance family, notes, description
   * Add-to-Cart button, quantity + SKU shown

5. **Cart & Checkout**

   * Cart page showing items, quantities, subtotals
   * Form for shipping (name, phone, email, address, pincode, state)
   * “Proceed to Payment” button
   * Customers will choose between:
        1. Cash on Delivery (COD)
            * No payment step
            * Order is recorded with status pending, payment mode cod
        
        2. Online Transaction (Razorpay)
            * Razorpay Checkout is launched
            * On success, order is recorded as paid, payment mode razorpay
   * Call Supabase API to create order row with related status and mode
   * Launch Razorpay Checkout flow using `razorpay_order_id`(if razorpay mode)
   * On payment success callback:
     * Update `orders` row with payment IDs 
     * Trigger WhatsApp message to business owner
     * Trigger WhatsApp message to user confirming order
   * On payment failure, show error and `payment_status=failed`
   

6. ## 📤 WhatsApp Notification (Required)

    * Triggered after successful order placement (for both business owner and customer's phone number)
    * Message includes:
    
      * Customer name, phone
      * Items and quantities
      * Payment mode and amount
      * Shipping location
    
    **Example Message:**
    
    ```
    🧾 NEW ORDER: #ORD-20250804-0001  
    👤 Name: Priya  
    📞 Phone: 98765-XXXX  
    🛍️ Items:  
    - Floral Attar – Premium x2 @ ₹799  
    💰 Total: ₹1598  
    🪙 Payment: COD  
    📦 Shipping: 400051, Mumbai  
    📅 Placed: 4 Aug 2025, 7:40PM
    ```
   * Send via cloud function (Node.js) or same Edge API.

---

## 8. Admin Panel (Phase 2)

* **Route**: `/admin`

  * On Edge API, verify passkey in query string (stored securely as ENV var).
  * If invalid: redirect to home or show 401 page.

### Admin Features:

#### A. Product Management

* **List products** (paginated); filter by category or search by name/slug.
* **Create product**: form inputs with:

  * Name, slug (auto suggest), category, fragrance family
  * Description markdown
  * Upload multiple images (drag-and-drop); specify primary image
  * Set Standard / Premium / Luxury variants:

    * Price, MRP, stock, SKU
* **Edit product**: update fields, add/remove images, adjust variants
* **Delete product** (soft-delete or permanent with confirmation)

#### B. Order Management

* **List orders** (sorted by `created_at desc`)
* **Search** by `order_number`, phone, pincode
* **View Order Details**: read-only summary of `order_items`, amounts, shipping status, AWB
* **Export** orders to CSV (api edge function returns CSV)
* **Trigger Shipment** manually if not auto-created

---

## 9. Non-Functional Requirements

* Mobile-first, fully responsive (Tailwind breakpoints: sm, md, lg)
* Performance: Lazy-load images, use `next/image`, prefetch product pages
* SEO: Use product `slug` URLs, Open Graph meta tags (description, image)
* Security:

  * No payments via GET strings
  * Validate Razorpay signature server-side and log payment failures for audit.
  * Prevent injection in Supabase queries; use Supabase JS
  * Protect admin panel via passkey + server-side validation
* Hosting: Vercel (Edge Functions), Supabase (India region)
* Accessibility: ARIA roles on carousel; keyboard-grab usage

---

## 10. Roadmap & Milestones

| Phase                      | Features                                                                                              | Investment |
| -------------------------- | ----------------------------------------------------------------------------------------------------- | ---------- |
| 🚀 Phase 1 (Public Launch) | Landing, Collections, Product pages, Cart, Checkout (Razorpay), WhatsApp alerts, Supabase integration | 2 weeks    |
| 🔧 Phase 2 (Admin Panel)   | Product CRUD, Order list, CSV export, BigShip integration, backend flow                               | 1 week     |
| 🧪 Phase 3 (Iteration)     | Add theme support switcher, tests (Jest + Playwright), extra filters & search                         | 1 week     |

---

## 11. Acceptance Criteria

* ✅ Landing page slider auto-rotates & transitions smoothly.
* ✅ Collections page links to correct listing page.
* ✅ Listing page cards show current price and MRP, and “Add to Cart” works.
* ✅ Product page gallery supports zoom & variant selection; correct price displayed.
* ✅ Cart persists across pages; checkout works fully with Razorpay in Indian currency; order appears in Supabase `orders` table.
* ✅ WhatsApp message arrives at business phone within 5 sec.
* ✅ Admin panel only opens when `passkey` matches secure value in ENV var.
* ✅ Admin can add/edit/delete product, manage order list, and export CSV.
* ✅ BigShip AWB is generated and stored; shipping status is visible.
* ✅ Fully responsive; Lighthouse Performance ≥85; SEO ≥85; passes WCAG button/alt tags.

---

## 12. Risks & Assumptions

* **Assume Razorpay Indian currency only** (no cross‑border).
* **BigShip API access**: You must have UPS credentials; ensure testing sandbox.
* WhatsApp messaging relies on Twilio or 3rd-party; verify no message template approval needed.
* Admin passkey in payload could leak; we assume only staff uses it; no OAuth needed.
* Customer shipping addresses constrained to Indian pincodes.

---

## 13. Glossary

* **Slug**: URL-friendly product identifier, stored in `products.slug`.
* **Variant**: A quality tier (Standard, Premium, Luxury) with own price/MRP.
* **BigShip AWB**: Air Waybill tracking number returned by BigShip API. (optional)
* **Passkey**: Simple query-string key (e.g. `passkey=SECRET_KEY`) protecting the `/admin` view.
* **Zustand**: Lightweight React state-management library for cart/session state.

---

## Next Steps

1. **Approval** of PRD → confirm scope, page hierarchy, admin panel flow.
2. Provision **Razorpay API keys** (key\_id, key\_secret).
3. Setup **BigShip sandbox/test credentials**.
4. Setup **WhatsApp messaging channel** (Twilio or Quick).
5. Create **Supabase project** in `ap-south-1` region; enable `auth.users`, `storage` & Postgres.
6. Scaffold **Next.js 15** with `shadcn/ui` and theme toggle disabled for now.
7. Begin **feature development** in phases outlined above.

## 📌 Final Deliverables

| Feature                  | Required   | Phase |
| ------------------------ | ---------- | ----- |
| Landing + Category Pages | ✅          | 1     |
| Product Listings         | ✅          | 1     |
| Product Details          | ✅          | 1     |
| Cart + Checkout          | ✅          | 1     |
| COD + Razorpay Payment   | ✅          | 1     |
| Supabase Integration     | ✅          | 1     |
| WhatsApp Notification    | ✅          | 1     |
| Admin Panel (CRUD)       | ✅          | 2     |
| BigShip Shipping         | ❌ Optional | 2+    |

---

---

## 📦 Optional: BigShip Integration

* **Phase:** Optional, for later if bandwidth allows
* **Flow:**
  On successful order, trigger BigShip API to create shipment
  Save AWB, update shipping status

---
