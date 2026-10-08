# ============================================
# CarCostCanada - Multi-stage Dockerfile
# ============================================

# Stage 1: Dependencies
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages/typescript-config/package.json ./packages/typescript-config/
RUN corepack enable && corepack prepare pnpm@10.4.1 --activate
RUN pnpm install --frozen-lockfile --prod

# Stage 2: Build
FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY apps/web/vite.config.ts ./apps/web/
COPY apps/web/tsconfig.json ./apps/web/
COPY apps/web/index.html ./apps/web/
COPY packages/typescript-config ./packages/typescript-config
COPY apps/web/src ./apps/web/src/

RUN corepack enable && corepack prepare pnpm@10.4.1 --activate
RUN pnpm install --frozen-lockfile

WORKDIR /app/apps/web
RUN pnpm build

# Stage 3: Production
FROM nginx:alpine AS production
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
