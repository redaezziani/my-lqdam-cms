# Build stage
FROM node:22-alpine AS builder

WORKDIR /opt/app

# Copy package files
COPY package.json package-lock.json ./

# Install ALL dependencies (including dev for build)
RUN npm ci

# Copy application files
COPY . .

# Build admin panel
RUN npm run build

# Production stage
FROM node:22-alpine

# Install dumb-init
RUN apk add --no-cache dumb-init

WORKDIR /opt/app

# Create strapi user
RUN addgroup -g 1001 -S strapi && \
    adduser -S strapi -u 1001

# Copy package files
COPY package.json package-lock.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy built files from builder
COPY --from=builder --chown=strapi:strapi /opt/app/dist ./dist
COPY --from=builder --chown=strapi:strapi /opt/app/public ./public
COPY --from=builder --chown=strapi:strapi /opt/app/config ./config
COPY --from=builder --chown=strapi:strapi /opt/app/database ./database
COPY --from=builder --chown=strapi:strapi /opt/app/src ./src

# Create necessary directories
RUN mkdir -p /opt/app/.tmp/data && \
    mkdir -p /opt/app/public/uploads && \
    chown -R strapi:strapi /opt/app

USER strapi

EXPOSE 1337

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD node -e "require('http').get('http://localhost:1337/_health', (r) => {process.exit(r.statusCode === 204 ? 0 : 1)})"

ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]