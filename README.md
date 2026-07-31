
<div align="center">

# Next.js Enterprise E-Commerce Platform
### Single-Tenant White-Label Cash on Delivery (COD) Engine

<p align="center">
  <img src="https://img.shields.io/badge/Next.js_14-000000?style=for-the-badge&logo=next.js&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB_Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white" />
  <img src="https://img.shields.io/badge/Deploy-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" />
</p>

<p align="center">
  <a href="https://blush-store.vercel.app"><img src="https://img.shields.io/badge/Live_Storefront-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Storefront" /></a>
  <img src="https://img.shields.io/badge/Architecture-Single_Tenant-blue?style=for-the-badge" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Status-Production_Ready-brightgreen?style=for-the-badge" />
</p>

<p align="center">
  A high-performance single-merchant e-commerce solution engineered specifically for markets dominated by high-volume <b>Cash on Delivery (COD)</b> and localized delivery networks.
</p>

</div>

---

## <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/react/react-original.svg" width="22" height="22" /> Overview

This platform delivers isolated, white-label store instances optimized for rapid deployment and regional logistics efficiency. Built with Next.js 14 App Router, Server Actions, TypeScript, and MongoDB, it provides a seamless shopping experience for consumers and an automated management workflow for merchants.

### Core Capabilities

<table>
  <thead>
    <tr>
      <th width="30%">Feature</th>
      <th width="70%">Technical Realization</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><b>Stateful Client Cart</b></td>
      <td>Custom reactive cart utilizing browser local storage persistence with dynamic total weight, product quantity, and localized shipping fee calculations.</td>
    </tr>
    <tr>
      <td><b>Single-Tenant Security</b></td>
      <td>Self-locking registration routing that locks automatically upon initial merchant provisioning, enforcing administrative isolation.</td>
    </tr>
    <tr>
      <td><b>Localized Regional Logistics</b></td>
      <td>Built-in database support for 58 Algerian Wilayas and Communes, featuring dynamic Home vs. Stop-Desk rate calculation and real-time inventory decrements.</td>
    </tr>
    <tr>
      <td><b>AI Copywriting Engine</b></td>
      <td>Integrated with OpenRouter API / Google Gemini models to generate localized, conversion-focused product copy inside the merchant dashboard.</td>
    </tr>
    <tr>
      <td><b>Route Protection & Media</b></td>
      <td>Middleware route guards powered by NextAuth.js (JWT) alongside auto-optimized image delivery and transformations via Cloudinary APIs.</td>
    </tr>
  </tbody>
</table>

---

## <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/html5/html5-original.svg" width="22" height="22" /> System Architecture

```text
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                   CLIENT STOREFRONT                                     │
│   [ Visitor ] ──> [ Next.js 14 App Router ] ──> [ Reactive Cart & LocalStorage ]         │
└────────────────────────────────────────────┬────────────────────────────────────────────┘
                                             │
                                             ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                               ORDER FULFILLMENT PIPELINE                                │
│   [ Dynamic Checkout ] ──> [ Logistics Engine: 58 Wilayas / Stop-Desk vs Home ]          │
│                                            │                                            │
│   [ Stock Decrement ] <── [ Atomic Mongo Transaction ] <── [ Order Validation ]         │
└────────────────────────────────────────────┬────────────────────────────────────────────┘
                                             │
                                             ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                               ADMINISTRATIVE DASHBOARD                                  │
│   [ NextAuth JWT Guard ] ──> [ Merchant Portal ] ──> [ AI Copywriter (Gemini API) ]     │
│                                            │                                            │
│   [ Store Settings ] <── [ Cloudinary Storage ] <── [ Inventory CRUD & Logistics Config ] │
└─────────────────────────────────────────────────────────────────────────────────────────┘

```

---

##  Technology Stack

---

##  Directory Structure

```text
src/
├── app/
│   ├── page.tsx                  # Public storefront landing page
│   ├── products/                 # Dynamic product catalog and detail pages
│   ├── checkout/                 # Localized COD fulfillment flow
│   ├── order-confirmation/[id]/  # Post-purchase receipt & summary page
│   ├── (auth)/                   # Secure login and auto-locking setup logic
│   ├── dashboard/                # Merchant administration portal
│   │   ├── orders/               # Order fulfillment and status management
│   │   ├── products/             # Catalog management & AI description tools
│   │   └── settings/             # Dynamic shipping rates and branding setup
│   └── api/                      # Protected RESTful API route endpoints
├── components/                   # Modular UI components (Cart, Drawers, Modals)
├── constants/                    # Logistics matrices (58 Wilayas & Communes data)
├── lib/                          # MongoDB, Gemini, Cloudinary, and Auth drivers
└── middleware.ts                 # Route guard enforcing administrative auth

```

---

##  Live Environment & Configuration

### Production Link

Access the deployed storefront on Vercel:

**[https://blush-store.vercel.app](https://blush-store.vercel.app)**

---

### Environment Variables (.env.local)

```env
# Database & Authentication
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/store
NEXTAUTH_SECRET=your_jwt_secret_key_here
NEXTAUTH_URL=[https://blush-store.vercel.app](https://blush-store.vercel.app)

# Cloudinary Storage
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# AI Services
OPENROUTER_API_KEY=your_openrouter_api_key

```

---

## License

Distributed under the **MIT License**. See `LICENSE` for details.
