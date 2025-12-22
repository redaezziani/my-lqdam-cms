# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Install system dependencies for native modules
RUN apk add --no-cache \
    python3 \
    make \
    g++

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production --legacy-peer-deps

# Copy source code
COPY . .

# Build admin panel
ENV NODE_ENV=production
RUN npm run build

# Production stage
FROM node:22-alpine

WORKDIR /opt/app

# Install runtime dependencies
RUN apk add --no-cache \
    dumb-init \
    wget

# Copy built application from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/config ./config
COPY --from=builder /app/database ./database
COPY --from=builder /app/src ./src

# Create necessary directories with correct permissions
RUN mkdir -p .tmp public/uploads && \
    chown -R node:node /opt/app

# Switch to non-root user
USER node

EXPOSE 1337

ENV NODE_ENV=production

# Start with dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "./node_modules/@strapi/strapi/bin/strapi.js", "start"]