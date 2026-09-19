# ============================================================================
# STAGE 1: BUILDER
# ============================================================================
# Install dependencies and build the NestJS app.
# NOTE: base image is node:22-alpine (LTS). The workspace package
# `@food_delivery/types` is shipped as TS source (main: index.ts) and Node
# >=22.18 strips types natively, so no separate types build/dist is required.
# ============================================================================

## Small base image (~40MB) with Node 22 and Alpine Linux
FROM node:22-alpine AS builder

# Install pnpm (version MUST match the `packageManager` field in package.json —
# the lockfile is v9 and cannot be parsed by pnpm 9)
RUN corepack enable && corepack prepare pnpm@10.28.2 --activate

# Set working directory
WORKDIR /app

# ---- Copy workspace manifests first (for better caching) ----
# Docker caches each layer. If only source code changes and not package.json,
# the install step is skipped on subsequent builds.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/types/package.json ./packages/types/

# Install dependencies for the whole workspace
RUN pnpm install --frozen-lockfile

# ---- Copy source code ----
# packages/types is TS source consumed directly (no build step)
COPY apps/api ./apps/api
COPY packages/types ./packages/types

# Build the NestJS API
RUN pnpm --filter api build

# ============================================================================
# STAGE 2: RUNNER
# ============================================================================
# Minimal image with only production dependencies and compiled code
# ============================================================================

FROM node:22-alpine AS runner

# Set NODE_ENV to production (enables NestJS optimizations)
ENV NODE_ENV=production

# Create a non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

WORKDIR /app

# Install pnpm (for pruning)
RUN corepack enable && corepack prepare pnpm@10.28.2 --activate

# Copy workspace manifests
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/types/package.json ./packages/types/

# Install ONLY production dependencies
# (workspace:* deps are symlinked; types package resolves at runtime)
RUN pnpm install --frozen-lockfile --prod

# Copy compiled output from builder stage
COPY --from=builder /app/apps/api/dist ./apps/api/dist
# Copy the workspace types SOURCE (not a dist) — Node strips types at runtime
COPY --from=builder /app/packages/types ./packages/types

# Switch to non-root user
USER nestjs

# Expose the port NestJS listens on
EXPOSE 3000

# Health check — Docker will restart the container if it becomes unhealthy
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start the app
CMD ["node", "apps/api/dist/main.js"]