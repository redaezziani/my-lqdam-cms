# Build stage
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /opt/app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Build admin panel
RUN npm run build

# Production stage
FROM node:22-alpine

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Set working directory
WORKDIR /opt/app

# Set non-root user
RUN addgroup -g 1001 -S strapi && \
    adduser -S strapi -u 1001

# Copy built application from builder
COPY --from=builder --chown=strapi:strapi /opt/app .

# Create necessary directories with correct permissions
RUN mkdir -p /opt/app/.tmp/data && \
    chown -R strapi:strapi /opt/app

# Switch to non-root user
USER strapi

# Expose Strapi port
EXPOSE 1337

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD node -e "require('http').get('http://localhost:1337/_health', (r) => {process.exit(r.statusCode === 204 ? 0 : 1)})"

# Start application with dumb-init
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/src/index.js"]
