# Food Delivery Multi-Role Platform

A complete cross-platform Food Delivery application built using a modern TypeScript monorepo architecture, supporting four distinct roles (Customer, Restaurant Owner, Delivery Partner, Admin) within a single unified app.

The project consists of:

* **Mobile App** – Built with Expo and React Native (Expo Router, Zustand, React Query, NativeWind, Reanimated).
* **Backend API** – Built with NestJS (PostgreSQL, Drizzle ORM, JWT Authentication).
* **Shared Package** – Common TypeScript types shared between the frontend and backend.

---

# Project Structure

```
food_delivery/
│
├── apps/
│   ├── api/          # NestJS Backend
│   └── mobile/       # Expo React Native App
│
├── packages/
│   └── types/        # Shared TypeScript Types
│
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.json
└── README.md
```

---

# Tech Stack

## Mobile

* React Native
* Expo
* Expo Router
* TypeScript
* React Query
* Axios

## Backend

* NestJS
* TypeScript
* REST API

## Shared

* TypeScript
* Workspace Package

## Package Manager

* pnpm Workspaces

---

# Features

* **Multi-Role Authentication & Navigation** (Customer, Restaurant Owner, Driver, Admin)
* **PostgreSQL + Drizzle ORM** Database Backend
* **JWT & OTP-Based Security** with Role-Based Access Control (RBAC)
* **API Documentation** via Swagger (`/docs`)
* **Modern Monorepo Architecture** (pnpm Workspaces)
* Shared TypeScript Types
* REST API
* Cross-platform Mobile App with Material Design 3 and Reanimated Skeletons
* Type-safe Development
* Modular Folder Structure

---

# Prerequisites

Make sure the following software is installed before running the project.

* Node.js (v22 or later recommended)
* pnpm
* Git

---

# Installation

Clone the repository.

```bash
git clone https://github.com/Shushilbhusal/Food-Delivery.git
```

Move into the project.

```bash
cd food_delivery
```

Install all dependencies.

```bash
pnpm install
```

---

# Running the Backend

Move into the API project.

```bash
cd apps/api
```

Start the development server.

```bash
pnpm start:dev
```

The backend will start in development mode.

---

# Running the Mobile App

Open another terminal.

Move into the mobile application.

```bash
cd apps/mobile
```

Start Expo.

```bash
pnpm start
```

Run the application on:

* Android Emulator
* iOS Simulator
* Physical Device using Expo Go
* Web Browser

---

# Shared Types

Common interfaces are located inside

```
packages/types
```

Both the mobile application and backend import the same types.

Example:

```ts
import { HealthCheckResponse } from "@food_delivery/types";
```

This ensures type safety across the entire application.

---

# Environment Variables

Create a `.env` file inside:

```
apps/api
```

Example:

```
PORT=3000
```

Additional environment variables can be added as the project grows.

---

# Scripts

## Backend

| Command          | Description      |
| ---------------- | ---------------- |
| `pnpm start`     | Start API        |
| `pnpm start:dev` | Development Mode |
| `pnpm build`     | Build Project    |
| `pnpm test`      | Run Tests        |
| `pnpm lint`      | Lint Code        |

---

## Mobile

| Command        | Description  |
| -------------- | ------------ |
| `pnpm start`   | Start Expo   |
| `pnpm android` | Run Android  |
| `pnpm ios`     | Run iOS      |
| `pnpm web`     | Run Web      |
| `pnpm lint`    | Lint Project |

---

# Development Workflow

1. Start the backend server.
2. Start the Expo application.
3. Develop features.
4. Share interfaces through the `packages/types` workspace.
5. Commit changes.
6. Push to GitHub.

---

# Project Goals

* Maintainable codebase
* Shared business models
* Type-safe communication
* Clean architecture
* Easy scalability
* Modern development workflow

---

# Future Improvements

* Live Order Tracking (Google Maps Integration)
* File Uploads (AWS S3 / Cloudinary)
* Payment Integration (Stripe, Khalti, eSewa)
* Push Notifications
* Advanced AI Chat Support
* Docker Support
* CI/CD Pipeline
* Unit & Integration Testing

---

# Contributing

1. Fork the repository.
2. Create a feature branch.

```
git checkout -b feature/new-feature
```

3. Commit your changes.

```
git commit -m "Add new feature"
```

4. Push your branch.

```
git push origin feature/new-feature
```

5. Open a Pull Request.

---

# License

This project is licensed under the MIT License.

---

# Author

Developed by 
**Shushil Bhusal**,
**Ashok Rimal**,
**Rohit Shrestha**,
**Shishir Pandey**
