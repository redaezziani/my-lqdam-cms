# ===============================
# Build stage
# ===============================
FROM node:22-alpine AS builder

WORKDIR /app

# System dependencies for Strapi build
RUN apk add --no-cache python3 make g++

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build Strapi admin panel
RUN npm run build

# ===============================
# Production stage
# ===============================
FROM node:22-alpine

WORKDIR /app

# Runtime dependencies
RUN apk add --no-cache dumb-init

# Copy everything from builder
COPY --from=builder /app ./

# Create directories for uploads and SQLite DB
RUN mkdir -p public/uploads .tmp && \
    chmod -R 777 .tmp public/uploads

# Expose port
EXPOSE 1337

# Set production environment
ENV NODE_ENV=production

# Start Strapi
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]
