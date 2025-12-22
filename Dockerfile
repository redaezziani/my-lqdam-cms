# Build stage
FROM node:22-alpine AS builder

WORKDIR /opt/app

# Install system dependencies
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
COPY --from=builder /opt/app/node_modules ./node_modules
COPY --from=builder /opt/app/build ./build
COPY --from=builder /opt/app/public ./public
COPY --from=builder /opt/app/package*.json ./
COPY --from=builder /opt/app/config ./config
COPY --from=builder /opt/app/database ./database
COPY --from=builder /opt/app/src ./src

# Create directories with proper permissions
RUN mkdir -p .tmp public/uploads && \
    chown -R node:node /opt/app

# Use non-root user
USER node

EXPOSE 1337

ENV NODE_ENV=production

# Start Strapi
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "./node_modules/@strapi/strapi/bin/strapi.js", "start"]