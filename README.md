# 🍔 KhanaGo – Full-Stack Food Delivery Platform

<p align="center">
  <img src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&auto=format&fit=crop&q=80" alt="KhanaGo Banner" width="100%" style="border-radius: 12px;" />
</p>

<p align="center">
  <strong>A modern, production-ready, full-stack food delivery monorepo application.</strong><br />
  Built with React Native (Expo Router), NestJS, Neon PostgreSQL (Drizzle ORM), LangGraph AI, and real-time WebSockets.
</p>

<p align="center">
  <a href="#-recent-updates--whats-new">What's New</a> •
  <a href="#-architecture--structure">Architecture</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-core-features">Features</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-butwal-dataset--seeding">Butwal Dataset</a> •
  <a href="#-demo-credentials">Demo Accounts</a> •
  <a href="#-scripts">Scripts</a>
</p>

---

## 🚀 Recent Updates & What's New

### 🏙️ Realistic Butwal, Nepal Restaurant & Cafe Dataset
- **24 Active Dining Venues**: Curated authentic spots across key Butwal hubs including **Golpark, Traffic Chowk, Milanchowk, Kalikanagar, Devinagar, Amarpath, Puspalal Park, and Horizon Chowk**.
  - Highlights: *The Village Cafe, Roadhouse Cafe (D-Village), Cafe de Flamingo, Nanglo Restaurant, Gaule Chulo Thakali, Hamro Momo Hub, Himalayan Artisan Bakery, Pizza World, Mughal Darbar*, and more.
- **128+ Categorized Menus & 475 Menu Items**: Fully categorized offerings (Momo, Chowmein, Sekuwa, Thakali Thali, Sizzlers, Italian Wood-fired Pizza, Tandoori, Patisserie, Specialty Teas).
- **Accurate NPR Pricing & High-Res Images**: Realistic pricing in Nepali Rupees (Rs.) and verified food photography across all items with client-side fallback handling.
- **Idempotent CLI Seeding & E2E Verification**:
  - `pnpm --filter api db:seed:butwal` — Seed or update restaurants and menus safely.
  - `pnpm --filter api db:verify:butwal` — Automated E2E verification of active restaurants, categories, items, and pricing.

### 🤖 KhanaGo Conversational AI Agent
- **Two-Way Conversational Assistant**: Integrated AI powered by LangChain/LangGraph and OpenRouter.
- **Context-Aware Tooling**: Agent can query restaurants, check live menus, inspect customer cart items, and review past orders to provide personalized meal recommendations and answer general questions.

### 🎨 Enhanced Customer Discovery & Navigation
- **Visual Category Badges**: Category chips now feature dynamic food iconography (`🥟 Momo`, `🍕 Pizza`, `☕ Coffee`, `🍔 Fast Food`, `🍛 Thakali`) and item count indicators.
- **Resilient Image Fallback**: `MenuItemCard` gracefully handles slow or failed external image loads with fallback placeholders.
- **Public Menu Browsing**: Unauthenticated guests can freely discover restaurants, browse categorized menus, and search food items without mandatory initial sign-in.

---

## 🏗️ Architecture & Structure

This project is organized as a high-performance **pnpm monorepo**:

```text
Food-Delivery/
├── apps/
│   ├── api/                   # NestJS Backend API
│   │   ├── src/
│   │   │   ├── agents/        # KhanaGo LangGraph AI Agent & conversational tools
│   │   │   ├── auth/          # JWT, Google OAuth & RBAC guards
│   │   │   ├── cart/          # Cart management & pricing calculation
│   │   │   ├── dasboard/      # Aggregated customer discovery feeds
│   │   │   ├── db/            # Drizzle ORM schemas & Neon PostgreSQL connection
│   │   │   ├── menu/          # Menu items & category controllers
│   │   │   ├── order/         # Order processing & lifecycle
│   │   │   ├── restaurant/    # Restaurant management & discovery
│   │   │   ├── scripts/       # Butwal dataset seed & E2E verification scripts
│   │   │   └── tracking/      # Socket.IO live GPS & order tracking gateway
│   │   └── drizzle/           # Database migration journals
│   │
│   └── mobile/                # Cross-Platform Client (iOS, Android, Web)
│       └── src/
│           ├── app/           # Expo Router file-based screens & navigation
│           │   ├── (auth)/    # Login, registration, forgot password
│           │   ├── (customer)/# Customer home, explore, cart, orders, profile
│           │   └── (owner)/   # Restaurant owner dashboard & order management
│           ├── components/    # Reusable atomic UI & domain components
│           ├── hooks/         # Custom React hooks (auth, cart, location, orders)
│           ├── services/      # Typed API client services
│           └── stores/        # Zustand global state (cart, auth, address)
│
├── packages/
│   └── types/                 # Shared TypeScript domain models & DTOs
│
├── pnpm-workspace.yaml        # Workspace package definitions
└── package.json               # Root scripts & orchestrations
```

---

## ⚡ Tech Stack

| Domain | Technologies |
| :--- | :--- |
| **Mobile Client** | React Native, Expo SDK 52, Expo Router v4, TypeScript, NativeWind / TailwindCSS, TanStack React Query, Axios, Zustand |
| **Backend API** | NestJS, TypeScript, Passport.js, JWT, LangChain/LangGraph, OpenRouter, Socket.IO WebSockets, Swagger |
| **Database & ORM** | Neon PostgreSQL (Serverless), Drizzle ORM, Drizzle Kit Studio |
| **Media & Storage** | Cloudinary |
| **Caching** | Redis with automatic in-memory fallback for local development |
| **Tooling & Monorepo** | pnpm Workspaces, Jest, ESLint, Prettier, tsx |

---

## ✨ Core Features

### 🛒 Customer Experience
- **Location-Based Discovery**: Browse restaurants and cafes across Butwal's major hubs.
- **Categorized Menu Filtering**: Search and filter by cuisine, category, price, and dietary preferences.
- **Real-Time Cart & Checkout**: Live quantity adjustments, delivery fee calculation, and order placement.
- **Live Order Tracking**: Visual order status progression and real-time delivery driver updates.
- **Interactive AI Assistant**: Ask KhanaGo AI for recommendations, order lookups, and food pairings.

### 🍳 Restaurant Owner Hub
- **Menu Management**: Create, edit, toggle availability, and categorize menu items with custom pricing and images.
- **Order Processing**: Real-time incoming order dashboard to accept, prepare, and dispatch orders.
- **Multi-Restaurant Support**: Switch between multiple owned restaurant branches.

### 🛵 Driver & Delivery Flow
- **Order Dispatch**: Real-time pickup notifications and destination routing.
- **GPS Broadcasting**: Continuous location streaming via WebSockets to customer tracking screens.

### 🛡️ Admin Management
- **Platform Analytics**: Global order metrics, revenue breakdowns, and user activity monitoring.
- **Restaurant Approval**: Verification workflow for onboarding new dining establishments.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v20 or later (v22 recommended)
- **pnpm**: `npm install -g pnpm`
- **Git**

---

### 1. Installation

Clone the repository and install all workspace dependencies:

```bash
git clone https://github.com/Khana-GO/Food-Delivery.git
cd Food-Delivery
pnpm install
```

---

### 2. Environment Configuration

Create an environment file at `apps/api/.env`:

```env
PORT=3000
NODE_ENV=development

# Database (Neon PostgreSQL)
DATABASE_URL=your_neon_postgresql_connection_string

# Authentication
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=30m
JWT_REFRESH_EXPIRES_IN=15d
SALT_ROUNDS=10

# AI Agent (Optional / OpenRouter)
OPENROUTER_API_KEY=your_openrouter_api_key

# Redis (Defaults to in-memory if false)
REDIS_ENABLED=false
REDIS_HOST=localhost
REDIS_PORT=6379

# CORS Origins
FRONTEND_URL_WEB=http://localhost:8081
FRONTEND_URL_IP=http://192.168.1.100:8081
```

---

### 3. Database Migration & Studio

Apply schema changes to your database:

```bash
pnpm --filter api db:push
```

To inspect your database visually via **Drizzle Studio**:

```bash
pnpm --filter api db:studio
```
> Opens at `https://local.drizzle.studio`.

---

### 4. Seed the Butwal Restaurant Dataset

Populate the database with the verified Butwal dining dataset (24 restaurants, 128 categories, 475 menu items):

```bash
pnpm --filter api db:seed:butwal
```

To run the automated verification suite against your running API:

```bash
pnpm --filter api db:verify:butwal
```

---

### 5. Running Development Servers

Run the entire platform concurrently:

```bash
# Start backend API (http://localhost:3000/api)
pnpm --filter api start:dev

# Start Expo mobile/web client (http://localhost:8081)
pnpm --filter mobile start
```

Inside the Expo terminal:
- Press `w` to open in your **Web Browser**.
- Press `a` for **Android Emulator** / device.
- Press `i` for **iOS Simulator**.
- Scan the QR code with **Expo Go** on a physical phone.

---

## 🔑 Demo Credentials

Pre-configured accounts for testing each user role:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Customer** | `demo@khanago.com` | `Password123!` |
| **Restaurant Owner** | `owner@khanago.com` | `Password123!` |
| **Driver** | `driver@khanago.com` | `Password123!` |

*(You can also sign up with any new email directly from the app).*

---

## 📋 Useful Monorepo Commands

### Workspace Root
| Command | Description |
| :--- | :--- |
| `pnpm install` | Install all dependencies across monorepo |
| `pnpm --filter api <command>` | Run an npm script inside `apps/api` |
| `pnpm --filter mobile <command>` | Run an npm script inside `apps/mobile` |

### Backend API (`apps/api`)
| Command | Description |
| :--- | :--- |
| `pnpm start:dev` | Start NestJS in watch mode |
| `pnpm build` | Compile TypeScript production bundle |
| `pnpm db:push` | Push schema changes to Neon PostgreSQL |
| `pnpm db:studio` | Launch Drizzle Studio GUI |
| `pnpm db:seed:butwal` | Seed authentic Butwal restaurants & menus |
| `pnpm db:verify:butwal`| Run automated end-to-end dataset verification |
| `pnpm test` | Run Jest unit & integration tests |

### Mobile Client (`apps/mobile`)
| Command | Description |
| :--- | :--- |
| `pnpm start` | Start Expo Metro bundler |
| `pnpm web` | Launch application on Web (`localhost:8081`) |
| `pnpm android` | Run on Android device or emulator |
| `pnpm ios` | Run on iOS simulator |
| `pnpm typecheck` | Run TypeScript validation (`tsc --noEmit`) |

---

## 👥 Authors & Contributors

- **Shushil Bhusal**
- **Ashok Rimal**
- **Rohit Shrestha**
- **Shishir Pandey**

---

<p align="center">
  Made with ❤️ for food lovers in Nepal.
</p>
