E-Commerce Platform

[![Next.js](https://img.shields.io/badge/Next.js-14_App_Router-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB_Atlas-Mongoose-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?style=for-the-badge&logo=vercel)](https://blush-store.vercel.app)

A single-tenant, white-label e-commerce solution engineered specifically for high-volume Cash on Delivery (COD) markets.

This platform provides single-merchant store deployments designed for regions where local delivery networks (e.g., Yalidine, Maystro) and COD workflows dominate online retail. Built using Next.js 14 App Router, TypeScript, and MongoDB, it offers isolated store instances that can be customized and deployed independently per merchant.

---

## Technical Features & System Architecture

* **Stateful Client-Side Cart**: Custom reactive cart built on browser storage, supporting real-time weight/item calculations and local logistics fees (Home vs. Stop-Desk delivery).
* **Single-Tenant Security Architecture**: Includes a self-locking `/register` route that closes automatically upon initial store provision, restricting administrative access strictly to the initial merchant account.
* **Localized Logistics Integration**: Built-in support for 58 Algerian Wilayas and Communes, handling dynamic shipping calculations and automated inventory decrements upon order submission.
* **AI-Assisted Content Pipeline**: Integrated with OpenRouter / Google Gemini to generate localized, SEO-optimized product descriptions directly inside the merchant dashboard.
* **Route Protection & Media Pipeline**: Middleware-protected administrative routes via NextAuth.js (JWT) with optimized media hosting delivered through Cloudinary APIs.

---

## Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | Next.js 14 (App Router) | Server-Side Rendering (SSR) & Server Actions |
| **Language** | TypeScript | Type safety across models, API interfaces, and UI |
| **Styling** | Tailwind CSS | Utility-first component design & custom design tokens |
| **Authentication** | NextAuth.js | JWT session management & secure credential hashing |
| **Database** | MongoDB Atlas / Mongoose | Document-oriented data modeling |
| **AI Integration** | OpenRouter API / Gemini | Automated product copy generation |
| **Media Delivery** | Cloudinary API | Cloud image optimization and distribution |
| **Hosting & CI/CD** | Vercel | Production deployment and edge hosting |

---

## Directory Structure

```plain
src/
├── app/
│   ├── page.tsx                  # Public storefront landing page
│   ├── products/                 # Product catalog and dynamic detail routes
│   ├── checkout/                 # Localized COD order fulfillment flow
│   ├── order-confirmation/[id]/  # Post-purchase receipt page
│   ├── (auth)/                   # Authentication & initial setup logic
│   ├── dashboard/                # Admin administrative portal
│   │   ├── orders/               # Order lifecycle & inventory tracking
│   │   ├── products/             # Inventory CRUD and AI description tools
│   │   └── settings/             # Logistics configuration & branding
│   └── api/                      # RESTful backend API routes
├── components/                   # Reusable UI components (Cart Drawer, Modals)
├── constants/                    # Logistics datasets (58 Wilayas, categories)
├── lib/                          # MongoDB, Gemini, Cloudinary, and Auth utilities
└── middleware.ts                 # NextAuth admin route guard
