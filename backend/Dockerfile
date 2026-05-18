# ─── Stage 1: Dependencies ──────────────────────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --only=production

# ─── Stage 2: Production Image ──────────────────────────────────────────────
FROM node:20-alpine AS runner

LABEL maintainer="Secret SOC Dashboard"
LABEL service="backend"

WORKDIR /app

# Install wget for health check
RUN apk add --no-cache wget

# Copy only production deps from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source
COPY . .

# Remove dev files
RUN rm -rf .env server.log

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 5002

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:5002/ || exit 1

CMD ["node", "server.js"]
