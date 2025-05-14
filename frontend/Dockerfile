# 1. Base builder image
FROM node:22-slim AS builder

# Install pnpm globally
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set working directory
WORKDIR /app

# Copy dependency files
COPY pnpm-lock.yaml* package.json* ./

# Install dependencies
RUN pnpm install

# Copy all source code
COPY . .

COPY .env.production .env.production

# Build the Next.js app
RUN pnpm build

# 2. Production runner
FROM node:22-slim AS runner

# Install pnpm again (lightweight) to run the app
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy built assets
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.mjs ./next.config.mjs

# Optional: if you use tailwind or other config files
COPY --from=builder /app/tailwind.config.ts ./tailwind.config.ts
COPY --from=builder /app/postcss.config.mjs ./postcss.config.mjs
COPY --from=builder /app/styles ./styles
COPY --from=builder /app/hooks ./hooks
COPY --from=builder /app/components ./components

# Expose port
EXPOSE 3000

# Start the Next.js production server
CMD ["pnpm", "start"]
