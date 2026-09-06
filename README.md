# 🍔 KhanaGo – Full-Stack Food Delivery Platform

A production-ready, full-stack Food Delivery monorepo application built with a modern TypeScript stack, featuring a cross-platform mobile client, robust NestJS backend API, PostgreSQL with Drizzle ORM, real-time tracking, and role-based workflows.

---

## 🏗️ Architecture & Monorepo Structure

This project is managed as a high-performance **pnpm monorepo**:

```text
Food-Delivery/
├── apps/
│   ├── api/          # NestJS Backend API (REST, WebSockets, Drizzle ORM, Neon PostgreSQL)
│   └── mobile/       # Expo / React Native App (Expo Router, NativeWind/Tailwind)
│
├── packages/
│   └── types/        # Shared TypeScript interfaces & types across apps
│
├── package.json      # Workspace root configuration & scripts
├── pnpm-workspace.yaml
└── tsconfig.json
```

---

## ⚡ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Mobile Client** | React Native, Expo SDK 52, Expo Router v4, TypeScript, NativeWind / TailwindCSS, TanStack React Query, Axios |
| **Backend API** | NestJS, TypeScript, Passport.js, JWT, LangChain/LangGraph, Socket.IO WebSockets, Swagger |
| **Database & ORM** | Neon PostgreSQL (Serverless), Drizzle ORM, Drizzle Kit Studio |
| **Storage & Media** | Cloudinary |
| **Caching** | Redis / In-Memory Redis fallback |
| **Tooling** | pnpm Workspaces, Jest, ESLint, Prettier |

---

## ✨ Features

- **Multi-Role Experience**: Dedicated portals and workflows for:
  - 🛒 **Customer**: Explore restaurants, search menus, customize orders, real-time delivery tracking.
  - 🍳 **Restaurant Owner**: Manage restaurant profiles, menu categories, menu items, and incoming orders.
  - 🛵 **Driver**: Live location broadcasting, order pickup & delivery routing.
  - 🛡️ **Admin**: Global platform management, verification, and analytics.
- **Real-Time WebSockets**: Live driver GPS tracking and order status updates using Socket.IO.
- **Database & Drizzle Studio**: Strongly-typed schema migrations with interactive visual database management via Drizzle Studio.
- **Secure Authentication**: JWT with rotating refresh tokens, Bcrypt password hashing, email verification, and Google OAuth.
- **Interactive API Documentation**: Auto-generated Swagger documentation at `/docs`.
- **Cross-Platform**: Seamless support for iOS, Android, and Web browsers.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v20 or later (v22 recommended)
- **pnpm**: `npm install -g pnpm`
- **Git**
- Optional: Android Studio (for Android Emulator) or Expo Go on a physical device.

---

### 1. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/Shushilbhusal/Food-Delivery.git
cd Food-Delivery
pnpm install
```

---

### 2. Environment Configuration

Create a `.env` file in `apps/api/.env`:

```env
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=your_neon_postgresql_connection_string

# JWT Secret Keys
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key

# Redis (Optional fallback in place)
REDIS_ENABLED=false
REDIS_HOST=localhost
REDIS_PORT=6379

# Frontend URLs for CORS
FRONTEND_URL_WEB=http://localhost:8081
FRONTEND_URL_IP=http://192.168.1.100:8081
```

---

### 3. Database Setup & Drizzle Studio

Push schema tables to your PostgreSQL database:

```bash
pnpm --filter api db:push
```

To launch the interactive **Drizzle Studio** GUI in your browser:

```bash
pnpm --filter api db:studio
```
> Opens at `https://local.drizzle.studio` (reads credentials directly from `.env`, no login required).

---

### 4. Running the Development Servers

#### Start the Backend API:
```bash
# From workspace root:
pnpm --filter api start:dev
```
- API Server: `http://localhost:3000/api`
- Health Check: `http://localhost:3000/api/health`
- Swagger Documentation: `http://localhost:3000/docs`

#### Start the Mobile App (Expo):
```bash
# From workspace root:
pnpm --filter mobile start
```

In the Expo terminal, press:
- `w` – Launch directly in your **Web Browser** (`http://localhost:8081`)
- `a` – Launch on connected **Android Device** or Emulator
- `i` – Launch on **iOS Simulator** (macOS)
- Or scan the terminal QR code with the **Expo Go** mobile app.

---

## 🔑 Pre-Configured Demo Accounts

For testing, pre-verified test accounts are available:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Customer** | `demo@khanago.com` | `Password123!` |
| **Restaurant Owner** | `owner@khanago.com` | `Password123!` |
| **Driver** | `driver@khanago.com` | `Password123!` |

*(You can also click **"Sign Up"** in the mobile app to register any new account).*

---

## 📋 Available Monorepo Scripts

### Workspace Root
| Command | Description |
| :--- | :--- |
| `pnpm install` | Install all monorepo dependencies |
| `pnpm --filter api <command>` | Run a command inside `apps/api` |
| `pnpm --filter mobile <command>` | Run a command inside `apps/mobile` |

### Backend API (`apps/api`)
| Command | Description |
| :--- | :--- |
| `pnpm start:dev` | Start NestJS in watch mode |
| `pnpm build` | Compile the NestJS production build |
| `pnpm test` | Run Jest unit and integration tests |
| `pnpm db:push` | Push schema changes directly to PostgreSQL |
| `pnpm db:studio` | Launch Drizzle Studio database UI |
| `pnpm db:generate` | Generate migration SQL files |
| `pnpm db:migrate` | Execute pending migrations |

### Mobile Client (`apps/mobile`)
| Command | Description |
| :--- | :--- |
| `pnpm start` | Start the Expo Metro bundler |
| `pnpm android` | Run on Android emulator / device |
| `pnpm ios` | Run on iOS simulator |
| `pnpm web` | Run on local web browser |

---

## 👥 Authors & Contributors

Developed with ❤️ by:
- **Shushil Bhusal**
- **Ashok Rimal**
- **Rohit Shrestha**
- **Shishir Pandey**

---

## 📄 License

This project is open-source and licensed under the [MIT License](LICENSE).
