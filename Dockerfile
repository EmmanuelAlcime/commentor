# syntax=docker/dockerfile:1

# Multi-stage build for the Commenter Next.js app.
# The final image contains only the standalone server produced by `next build`
# (output: "standalone" in next.config.ts), the static assets and `public/`.

ARG NODE_VERSION=24

# ---------- deps: install dependencies from the lockfile ----------
FROM node:${NODE_VERSION}-alpine AS deps
WORKDIR /app
# sharp (used by next/image) needs glibc compatibility on Alpine
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
RUN npm ci

# ---------- builder: compile the production build ----------
FROM node:${NODE_VERSION}-alpine AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# No database credentials are needed here: the Drizzle client is created on first query
RUN npm run build

# ---------- runner: minimal production image ----------
FROM node:${NODE_VERSION}-alpine AS runner
WORKDIR /app
RUN apk add --no-cache libc6-compat
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

# The standalone output already includes the traced node_modules it needs.
# `public/` and `.next/static` are not copied by Next, so add them by hand.
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public

USER node
EXPOSE 3000
CMD ["node", "server.js"]
