# 📋 PMQL-Banh Project Overview

**Project Name:** Jeucwt's Bakery - Quản Lý Bánh (Bakery Management System)  
**Status:** In Development  
**Last Updated:** 2026-06-23

---

## 🎯 Project Purpose
Hệ thống quản lý bánh toàn diện cho một tiệm bánh, bao gồm:
- E-commerce platform cho khách hàng (tìm kiếm, xem bánh)
- Admin dashboard (quản lý sản phẩm, nguyên liệu, hóa đơn)
- Cashier module (bán hàng POS)
- Customer management (quản lý khách hàng)

---

## 🏗️ Project Structure

### **Frontend (Next.js)**
```
app/
├── (app)/
│   ├── globals.css              # Global styles + color scheme
│   ├── layout.tsx               # Root layout with AuthProvider
│   └── (home)/
│       ├── page.tsx             # Main product listing page
│       ├── layout.tsx           # Home layout
│       ├── navbar.tsx           # Navigation component
│       ├── product-card.tsx     # Product display component
│       ├── footer/
│       ├── landingpage/         # Hero section
│       ├── search-filter/       # Search & filter UI
│       ├── product/             # Product detail pages
│       ├── login/               # Authentication
│       ├── signup/              # User registration
│       ├── bills/               # Customer bill history
│       ├── cashier/             # POS interface
│       ├── customer/            # Customer list
│       └── dashboard/
│           ├── page.tsx         # Dashboard main
│           ├── layout.tsx
│           ├── sidebar-dashboard.tsx
│           ├── navbar-dashboard.tsx
│           ├── DoanhThuPage.tsx      # Revenue dashboard
│           ├── QuanLiHoaDonPage.tsx  # Invoice management
│           ├── QuanLiNguyenLieuPage.tsx  # Materials management
│           ├── QuanLiSanPhamPage.tsx # Product management
│           ├── bills/
│           ├── cakes/
│           └── materials/

components/
├── ui/                          # Reusable shadcn UI components (40+ components)
│   ├── button.tsx, input.tsx, card.tsx
│   ├── table.tsx, sidebar.tsx
│   ├── chart.tsx, calendar.tsx
│   └── ... (full shadcn/ui library)

lib/
├── AuthContext.tsx              # Global auth state management
├── useRouteGuard.ts            # Route protection hook
├── utils.ts                     # Utility functions
└── api/
    └── banh.ts                  # API calls for products

hooks/
├── use-mobile.ts                # Responsive hook

public/                          # Static assets
```

### **Backend (Express.js)**
```
backend/
├── src/
│   ├── app.js                   # Express server entry point
│   ├── config/
│   │   └── db.js                # MySQL connection pool
│   ├── controllers/
│   │   ├── auth.controller.js   # Login, signup, JWT
│   │   ├── banh.controller.js   # Product CRUD
│   │   ├── donhang.controller.js# Order management
│   │   ├── kh.controller.js     # Customer management
│   │   └── sanxuat.controller.js# Production/materials
│   ├── routes/
│   │   ├── auth.route.js        # /api/auth endpoints
│   │   ├── banh.route.js        # /api/banh endpoints
│   │   ├── admin.banh.route.js  # /api/admin/banh endpoints
│   │   ├── donhang.route.js     # /api/donhang endpoints
│   │   ├── kh.route.js          # /api/kh endpoints
│   │   └── sanxuat.route.js     # /api/admin/sanxuat endpoints
│   └── middlewares/
│       └── auth.middleware.js   # JWT verification
├── package.json
├── tsconfig.json
└── index.ts

Database: MySQL (port 3307)
```

### **Configuration Files**
```
Root Level:
├── next.config.ts              # Next.js configuration
├── tsconfig.json               # TypeScript compiler options
├── tailwind.config.* (implicit)# Tailwind CSS config
├── postcss.config.mjs          # PostCSS with Tailwind
├── components.json             # shadcn/ui configuration
├── eslint.config.mjs           # ESLint rules
└── package.json                # Frontend dependencies

Backend:
├── backend/package.json        # Backend dependencies
├── backend/tsconfig.json
└── backend/src/config/db.js    # Database connection
```

---

## 🛠️ Tech Stack

### **Frontend**
| Layer | Technology | Version |
|-------|-----------|---------|
| **Framework** | Next.js | 16.2.6 |
| **UI Library** | React | 19.2.4 |
| **Language** | TypeScript | 5.x |
| **Styling** | Tailwind CSS | 4.x |
| **UI Components** | shadcn/ui | Latest |
| **Icons** | Lucide React | 1.17.0 |
| **Charts** | Recharts | 3.8.0 |
| **Forms** | React Hook Form | (via shadcn) |
| **Date Handling** | date-fns | 4.4.0 |
| **Utilities** | clsx, tailwind-merge | Latest |
| **Auth Context** | React Context API | Custom |
| **Animations** | Tailwind animations + tw-animate-css | 1.4.0 |
| **Carousels** | Embla Carousel | 8.6.0 |
| **Toast Notifications** | Sonner | 2.0.7 |

### **Backend**
| Layer | Technology | Version |
|-------|-----------|---------|
| **Runtime** | Node.js | Latest |
| **Framework** | Express.js | 5.2.1 |
| **Database** | MySQL | (via mysql2) |
| **Driver** | mysql2 | 3.22.5 |
| **Authentication** | JWT | 9.0.3 |
| **Password Hashing** | bcryptjs | 3.0.3 |
| **Environment** | dotenv | 17.4.2 |
| **CORS** | cors | 2.8.6 |
| **Dev Tools** | nodemon | 3.1.14 |
| **ORM** | Prisma | 7.8.0 (present, may be unused) |

### **DevTools**
- **Build Tool**: Next.js built-in (Turbopack)
- **Linting**: ESLint
- **Package Manager**: npm/yarn/bun
- **IDE**: VS Code (implied)

---

## 🎨 Design System & Colors

### **Color Palette (OKLCh Model)**
Dự án sử dụng **OKLCh color space** (perceptually uniform colors):

#### **Light Mode (Root)**
```
--background: #FFFFFF (oklch(1 0 0))
--foreground: #1A1A1A (oklch(0.145 0 0))
--primary: #333333 (oklch(0.205 0 0))
--secondary: #F5F5F5 (oklch(0.97 0 0))
--accent: #F5F5F5 (oklch(0.97 0 0))
--destructive: #C53030 (red warning)
--border: #EBEBEB (oklch(0.922 0 0))
--sidebar: #FAFAFA (oklch(0.985 0 0))
```

#### **Dark Mode**
```
--background: #242424 (oklch(0.145 0 0))
--foreground: #F8F8F8 (oklch(0.985 0 0))
--primary: #E8E8E8 (oklch(0.922 0 0))
--primary-foreground: #242424 (oklch(0.205 0 0))
--sidebar: #333333 (oklch(0.205 0 0))
--sidebar-primary: #7C6FD6 (oklch(0.488 0.243 264.376)) ← Blue accent
```

### **Brand Color Scheme (UI Custom Colors)**
Thêm vào styling inline (không dùng Tailwind classes):
```javascript
// Primary brown/warm tones (Bakery theme)
#664930  - Dark brown (navbar background)
#997E67  - Medium brown (logo background)
#FFDBBB  - Warm beige/cream (text color, accent)

// Usage examples:
style={{ backgroundColor: "#664930" }}  // Navbar
style={{ color: "#FFDBBB" }}            // Cream text
style={{ backgroundColor: "#FFFDBBB" }} // Page background
```

### **Chart Colors**
```
--chart-1: #DDD2C7 (light gray)
--chart-2: #8E8E8E (medium gray)
--chart-3: #707070 (dark gray)
--chart-4: #5F5F5F (darker gray)
--chart-5: #454545 (darkest gray)
```

### **Radius System**
```
--radius: 0.625rem (10px base)
--radius-sm: 6px
--radius-md: 6px
--radius-lg: 10px
--radius-xl: 14px
--radius-2xl: 18px
--radius-3xl: 22px
--radius-4xl: 26px
```

---

## 💻 Code Style & Patterns

### **Frontend Conventions**

#### **1. Component Structure**
```typescript
// Use Client Components by default (client-side logic)
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";

export default function ComponentName() {
  const [state, setState] = useState<Type>(initialValue);
  
  return (
    <div className="flex items-center justify-between">
      {/* JSX content */}
    </div>
  );
}
```

#### **2. TypeScript Strictness**
- `strict: true` enabled
- Props typed with interfaces/types
- Return types specified
- Generic types for API responses

#### **3. Styling Approach**
```typescript
// Mix of Tailwind classes + inline style objects
<div 
  style={{ backgroundColor: "#664930" }}
  className="w-full h-[72px] flex items-center justify-between px-6"
>
  
// For complex colors, use inline styles
// For layout/spacing, use Tailwind classes
```

#### **4. State Management**
- **React Context**: `AuthContext` for user/auth state
- **useState**: Local component state
- **Custom Hooks**: `useRouteGuard`, `use-mobile`
- **No Redux**: Simple context API approach

#### **5. API Integration**
```typescript
// Fetch in lib/api/banh.ts
export async function getDanhSachBanh(): Promise<Banh[]> {
  const res = await fetch('http://localhost:3001/api/banh');
  return res.json();
}

// Use in component with useEffect
useEffect(() => {
  getDanhSachBanh()
    .then(data => setProducts(data))
    .catch(err => setError(err.message))
    .finally(() => setLoading(false));
}, []);
```

#### **6. Routing Pattern**
- **App Router**: Next.js 16 app directory structure
- **Grouped Routes**: `(app)`, `(home)` for layout organization
- **Dynamic Routes**: Implied in structure
- **Protected Routes**: Via `useRouteGuard` hook

#### **7. Naming Conventions**
```typescript
// Components: PascalCase
Navbar, ProductCard, Dashboard

// Functions: camelCase
getDanhSachBanh, handleClick

// Constants: UPPER_SNAKE_CASE
DB_HOST, API_URL (in .env files)

// Files: kebab-case or PascalCase for components
navbar.tsx, product-card.tsx
```

### **Backend Conventions**

#### **1. Express Server Structure**
```javascript
// Entry point: app.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// Routes registration
app.use('/api/auth', require('./routes/auth.route'));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`✅ Server running...`));
```

#### **2. Route Structure**
- **Pattern**: `/api/{resource}` or `/api/admin/{resource}`
- **CRUD Routes**: GET (list/detail), POST (create), PUT (update), DELETE
- **Auth Routes**: POST /api/auth/login, POST /api/auth/signup

#### **3. Controller Pattern**
```javascript
// controllers/banh.controller.js
exports.getDanhSachBanh = async (req, res) => {
  try {
    // Business logic
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

#### **4. Middleware Usage**
- `cors`: Allow localhost:3000
- `express.json()`: Parse JSON bodies
- `auth.middleware.js`: Verify JWT tokens (likely)

#### **5. Database Access**
```javascript
// config/db.js
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: 3307,  // Custom MySQL port
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10
});

module.exports = pool.promise();
```

#### **6. Naming Conventions**
```javascript
// Files: kebab-case
auth.route.js, banh.controller.js

// Functions: camelCase
getDanhSachBanh, createBanh

// Variables: camelCase
const user, let productList
```

---

## 📊 Key Features & Modules

### **Implemented Modules**
1. ✅ **Authentication** (Login/Signup with JWT)
2. ✅ **Product Management** (CRUD for bánh)
3. ✅ **Customer Management** (khách hàng CRUD)
4. ✅ **Order Management** (đơn hàng)
5. ✅ **Admin Dashboard** (analytics, inventory)
6. ✅ **Cashier System** (POS interface)
7. ✅ **Product Listing & Search** (with filters)

### **In-Progress/Planned**
- Bill/Invoice history for customers
- Materials/Ingredients management
- Revenue analytics dashboard
- More detailed dashboard pages

---

## 🚀 Development Workflow

### **Frontend Development**
```bash
# Install dependencies
npm install

# Start dev server
npm run dev          # Runs on http://localhost:3000

# Build for production
npm run build

# Run production build
npm start

# Linting
npm run lint
```

### **Backend Development**
```bash
# Install dependencies
cd backend && npm install

# Start dev server with auto-reload
npm run dev          # Runs on http://localhost:3001

# Start production
npm start
```

### **Environment Configuration**
Create `.env` file at root with:
```
DB_HOST=localhost
DB_USER=your_mysql_user
DB_PASSWORD=your_password
DB_NAME=pmql_banh
JWT_SECRET=your_jwt_secret
```

---

## 📈 Development Progress Indicators

### **Frontend Maturity: 70%**
- ✅ Core page structure
- ✅ Navbar & Footer
- ✅ Product listing with API
- ✅ Dashboard layout
- ✅ UI component library setup
- ⏳ Dashboard pages (some empty)
- ⏳ Complete admin features
- ⏳ Error handling refinement

### **Backend Maturity: 60%**
- ✅ Express server setup
- ✅ Database connection
- ✅ Core routes (auth, products, customers, orders)
- ✅ Controller layer structure
- ⏳ Middleware completeness
- ⏳ Validation layer
- ⏳ Error handling standardization
- ⏳ API documentation

### **Database: 50%**
- ✅ MySQL connection configured
- ⏳ Schema definition (needs verification)
- ⏳ Relationships/Foreign keys
- ⏳ Seed data

---

## 🎯 Code Quality Standards

| Aspect | Standard |
|--------|----------|
| **TypeScript** | Strict mode enabled |
| **Imports** | Path aliases (@/) for clean imports |
| **Styling** | Tailwind CSS + OKLCh color system |
| **Component State** | React hooks (useState, useEffect, useContext) |
| **Error Handling** | try-catch in async functions |
| **API Calls** | Centralized in lib/api/ folder |
| **Auth** | JWT + Context API |
| **Code Comments** | Vietnamese + English mixed |

---

## 🔐 Security Considerations

- ✅ Password hashing with bcryptjs
- ✅ JWT token-based auth
- ✅ CORS enabled for localhost:3000
- ⏳ Rate limiting (not implemented)
- ⏳ Input validation/sanitization (basic)
- ⏳ API endpoint protection/authorization

---

## 📝 Notes for Future AI Assistants

### **Important Context**
1. **Language Mix**: Vietnamese variable/function names + English comments
2. **Color System**: Warm brown bakery theme (#664930, #997E67, #FFDBBB)
3. **DB Port**: MySQL running on **port 3307** (non-standard)
4. **API Base**: Backend on `http://localhost:3001`
5. **React Version**: Using React 19 (latest)
6. **Next.js Version**: 16.2.6 (recent version with potential breaking changes)

### **Development Velocity**
- **Recent Additions**: Dashboard structure, admin routes, UI components
- **Active Focus**: Backend route implementation, dashboard pages
- **Common Patterns**: Inline color styles + Tailwind classes, useEffect + API calls
- **Style**: Pragmatic and iterative (mix of patterns, room for refactoring)

### **Quick References**
```typescript
// Common imports
import { useAuth } from "@/lib/AuthContext";
import { getDanhSachBanh } from "@/lib/api/banh";
import { useState, useEffect } from "react";

// API endpoint format
http://localhost:3001/api/{resource}
http://localhost:3001/api/admin/{resource}

// Color scheme
backgroundColor: "#664930"  // Primary brown
color: "#FFDBBB"           // Cream text
backgroundColor: "#997E67"  // Secondary brown
```

---

## 📞 Project Summary for AI Assistants

**This is a full-stack bakery management system** with a modern tech stack combining:
- Next.js 16 + React 19 (frontend)
- Express.js (backend)
- MySQL (database)
- TypeScript (type safety)
- Tailwind CSS + shadcn/ui (design)
- Warm brown/beige color theme

**Development Speed**: Moderate to fast, with active implementation of features and iterations. Mix of structured patterns with room for optimization.

**Code Quality**: Good foundation with TypeScript strictness, but may benefit from standardized error handling and validation across the application.

---

*Generated: 2026-06-23*  
*Last Updated: When project structure changes significantly*
